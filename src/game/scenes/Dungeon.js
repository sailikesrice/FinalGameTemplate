/*
 * @file Dungeon.js
 * @description Dungeon scene with levels, randomized math puzzles, and a progress minimap.
 * Each level has 6 rooms with a predetermined random map structure.
 * Puzzle tiles can swap positions instead of overlapping.
 * Shows a popup after completing every level.
 * @sailikesrice
 */

import { Scene } from "phaser";

const TILE_SIZE = 32;
const ROOM_SIZE = 7;
const ROOMS_PER_LEVEL = 6;

export class Dungeon extends Scene {
  constructor() {
    super("Dungeon");
    this.rooms = {};
    this.currentRoom = { x: 0, y: 0 };
    this.level = 1;
    this.roomsCompleted = 0;
    this.minimapSquares = [];
    this.mapLayout = [];

    this.popupContainer = null;
    this.popupOpen = false;
  }

  create() {
    // static group used for all walls (so we can clear them easily)
    this.walls = this.physics.add.staticGroup();

    this.startLevel();

    this.createMobileControls();
  }

  update() {
    // block input while popup open or while moving
    if (this.popupOpen || this.isMoving) return;

    let dx = 0, dy = 0;
    if ((this.cursors && this.cursors.left.isDown) || (this.keys && this.keys.A.isDown)) dx = -1;
    else if ((this.cursors && this.cursors.right.isDown) || (this.keys && this.keys.D.isDown)) dx = 1;
    else if ((this.cursors && this.cursors.up.isDown) || (this.keys && this.keys.W.isDown)) dy = -1;
    else if ((this.cursors && this.cursors.down.isDown) || (this.keys && this.keys.S.isDown)) dy = 1;

    if (dx !== 0 || dy !== 0) {
      this.tryMove(dx, dy);
    }
  }

  // ====== LEVEL MANAGEMENT ======
  startLevel() {
    // Clean up any leftover objects if this is a restart
    // Note: don't remove minimap here (it's reused)
    // but clear scene walls/floors/tiles
    if (!this.minimapSquares.length) {
      this.createMinimap();
    }

    // reset trackers
    this.clearLevelObjects(); // clears any previous graphics (if exist)
    this.rooms = {};
    this.roomsCompleted = 0;
    this.mapLayout = this.generateMapLayout();

    // prepare minimap
    this.updateMinimap();

    // generate rooms (first room is start)
    this.generateRoom(0, 0);

    // mark starting room as solved (it has no puzzle)
    this.rooms["0,0"].solved = true;
    this.roomsCompleted++;

    // Player spawn
    const { x, y } = this.getTileCenter(0, 0, Math.floor(ROOM_SIZE / 2), Math.floor(ROOM_SIZE / 2));
    if (!this.player) {
      this.player = this.physics.add.sprite(x, y, "player");
      this.player.setDisplaySize(TILE_SIZE * 0.7, TILE_SIZE * 0.7);

      // Ensure player always appears above puzzle tiles and other scene objects
      this.player.setDepth(9999);

      this.physics.add.collider(this.player, this.walls);

      this.cursors = this.input.keyboard.createCursorKeys();
      this.keys = this.input.keyboard.addKeys("W,A,S,D");

      this.isMoving = false;
      this.moveDelay = 150;

      this.cameras.main.startFollow(this.player, true, 0.1, 0.1);
      this.cameras.main.setZoom(1.25);
      this.cameras.main.setBackgroundColor(0x000000);
    } else {
      this.player.setPosition(x, y);
      // keep depth consistent whenever we reposition player
      this.player.setDepth(9999);
    }

    // Fade in when a level starts (smooth transition)
    try {
      this.cameras.main.fadeIn(300, 0, 0, 0);
    } catch (e) {
      // ignore if camera not available for some reason
    }
  }

  nextLevel() {
    // close popup if open (safe cleanup)
    if (this.popupContainer) {
      try {
        this.popupContainer.destroy();
      } catch (e) {}
      this.popupContainer = null;
    }
    this.popupOpen = false;

    // Fade out, then clear and start next level
    try {
      this.cameras.main.fadeOut(350, 0, 0, 0);
      this.cameras.main.once("camerafadeoutcomplete", () => {
        // wipe current level objects
        this.clearLevelObjects();

        // increment level and start fresh
        this.level++;
        this.startLevel();

        // Fade back in so player sees the new level
        this.cameras.main.fadeIn(350, 0, 0, 0);

        // Re-enable input/physics just in case
        this.input.enabled = true;
        this.physics.world.resume();
      });
    } catch (e) {
      // fallback if fade fails
      this.clearLevelObjects();
      this.level++;
      this.startLevel();

      this.input.enabled = true;
      this.physics.world.resume();
    }
  }

  // Destroys old floors, puzzle tiles and static walls so next level is clean
  clearLevelObjects() {
    // Destroy floors and puzzle tiles from previous rooms
    if (this.rooms) {
      Object.values(this.rooms).forEach(r => {
        if (!r) return;
        if (r.floors && r.floors.getChildren) {
          try {
            r.floors.getChildren().forEach(c => { if (c && c.destroy) c.destroy(); });
          } catch (e) { /* ignore */ }
        }
        if (r.puzzleTiles && Array.isArray(r.puzzleTiles)) {
          r.puzzleTiles.forEach(t => { try { if (t && t.destroy) t.destroy(); } catch(e) {} });
        }
      });
    }

    // clear static walls
    if (this.walls) {
      try { this.walls.clear(true, true); } catch (e) {}
    }
  }

  // ====== MAP GENERATION ======
  generateMapLayout() {
    const layout = new Set();
    let current = { x: 0, y: 0 };
    layout.add("0,0");

    while (layout.size < ROOMS_PER_LEVEL) {
      const dir = Phaser.Math.RND.pick([
        { x: 1, y: 0 },
        { x: -1, y: 0 },
        { x: 0, y: 1 },
        { x: 0, y: -1 }
      ]);
      const next = { x: current.x + dir.x, y: current.y + dir.y };
      const key = `${next.x},${next.y}`;
      layout.add(key);
      current = next;
    }

    return Array.from(layout).map(str => {
      const [x, y] = str.split(",").map(Number);
      return { x, y };
    });
  }

  // ====== ROOMS ======
  generateRoom(rx, ry) {
    const roomKey = `${rx},${ry}`;
    if (this.rooms[roomKey]) return;

    // Check if this coordinate is part of map layout
    if (!this.mapLayout.find(r => r.x === rx && r.y === ry)) return;

    const offsetX = rx * ROOM_SIZE * TILE_SIZE;
    const offsetY = ry * ROOM_SIZE * TILE_SIZE;

    const walls = this.add.group();
    const floors = this.add.group();
    const puzzleTiles = [];

    for (let row = 0; row < ROOM_SIZE; row++) {
      for (let col = 0; col < ROOM_SIZE; col++) {
        const x = offsetX + col * TILE_SIZE + TILE_SIZE / 2;
        const y = offsetY + row * TILE_SIZE + TILE_SIZE / 2;

        const isWall = row === 0 || col === 0 || row === ROOM_SIZE - 1 || col === ROOM_SIZE - 1;

        if (isWall) {
          const neighbors = [
            { x: rx, y: ry - 1, row: 0, col: Math.floor(ROOM_SIZE / 2) },
            { x: rx, y: ry + 1, row: ROOM_SIZE - 1, col: Math.floor(ROOM_SIZE / 2) },
            { x: rx - 1, y: ry, row: Math.floor(ROOM_SIZE / 2), col: 0 },
            { x: rx + 1, y: ry, row: Math.floor(ROOM_SIZE / 2), col: ROOM_SIZE - 1 }
          ];

          const passage = neighbors.some(
            n => n.row === row && n.col === col &&
              this.mapLayout.find(r => r.x === n.x && r.y === n.y)
          );

          if (!passage) {
            // Use the main static group so we can clear all walls later
            const wall = this.walls.create(x, y, "wall");
            wall.setDisplaySize(TILE_SIZE, TILE_SIZE);
            wall.refreshBody();
            wall.setDepth(2);
            walls.add(wall);
          } else {
            const floor = this.add.image(x, y, "floor");
            floor.setDisplaySize(TILE_SIZE, TILE_SIZE);
            floor.setTint(0x666666);
            floors.add(floor);
          }
        } else {
          const floor = this.add.image(x, y, "floor");
          floor.setDisplaySize(TILE_SIZE, TILE_SIZE);
          floor.setTint(0x222222);
          floors.add(floor);
        }
      }
    }

    // Add a random puzzle if not the starting room
    let solved = true;
    let equation = null;
    let tileMap = null;
    if (!(rx === 0 && ry === 0)) {
      const puzzle = this.createRandomEquationPuzzle(rx, ry, offsetX, offsetY);
      puzzleTiles.push(...puzzle.tiles);
      equation = puzzle.equation;
      tileMap = puzzle.tileMap;
      solved = false;
    }

    this.rooms[roomKey] = { walls, floors, puzzleTiles, solved, equation, tileMap };
  }

  getTileCenter(rx, ry, col, row) {
    const x = rx * ROOM_SIZE * TILE_SIZE + col * TILE_SIZE + TILE_SIZE / 2;
    const y = ry * ROOM_SIZE * TILE_SIZE + row * TILE_SIZE + TILE_SIZE / 2;
    return { x, y };
  }

  tryMove(dx, dy) {
    const rx = this.currentRoom.x;
    const ry = this.currentRoom.y;
    const roomKey = `${rx},${ry}`;
    const room = this.rooms[roomKey];

    if (!room || !room.solved) {
      return this.moveWithinRoom(dx, dy);
    }
    this.moveWithinRoom(dx, dy, true);
  }

  moveWithinRoom(dx, dy, allowPassages = false) {
    const rx = this.currentRoom.x;
    const ry = this.currentRoom.y;

    const localCol = Math.round(
      (this.player.x - rx * ROOM_SIZE * TILE_SIZE - TILE_SIZE / 2) / TILE_SIZE
    );
    const localRow = Math.round(
      (this.player.y - ry * ROOM_SIZE * TILE_SIZE - TILE_SIZE / 2) / TILE_SIZE
    );

    const targetCol = localCol + dx;
    const targetRow = localRow + dy;
    const center = Math.floor(ROOM_SIZE / 2);

    if (allowPassages) {
      if (targetRow === 0 && targetCol === center) {
        return this.enterRoom(0, -1, center, ROOM_SIZE - 2);
      }
      if (targetRow === ROOM_SIZE - 1 && targetCol === center) {
        return this.enterRoom(0, 1, center, 1);
      }
      if (targetCol === 0 && targetRow === center) {
        return this.enterRoom(-1, 0, ROOM_SIZE - 2, center);
      }
      if (targetCol === ROOM_SIZE - 1 && targetRow === center) {
        return this.enterRoom(1, 0, 1, center);
      }
    }

    if (
      targetCol <= 0 ||
      targetRow <= 0 ||
      targetCol >= ROOM_SIZE - 1 ||
      targetRow >= ROOM_SIZE - 1
    ) return;

    const { x, y } = this.getTileCenter(rx, ry, targetCol, targetRow);
    this.movePlayer(x, y);
  }

  movePlayer(x, y) {
    this.isMoving = true;
    this.tweens.add({
      targets: this.player,
      x,
      y,
      duration: this.moveDelay,
      onComplete: () => {
        this.isMoving = false;
      }
    });
  }

  enterRoom(dx, dy, newCol, newRow) {
    const prevRoomKey = `${this.currentRoom.x},${this.currentRoom.y}`;
    const prevRoom = this.rooms[prevRoomKey];

    // update current room
    this.currentRoom.x += dx;
    this.currentRoom.y += dy;

    const newRoomKey = `${this.currentRoom.x},${this.currentRoom.y}`;
    this.generateRoom(this.currentRoom.x, this.currentRoom.y);
    const newRoom = this.rooms[newRoomKey];

    const { x, y } = this.getTileCenter(this.currentRoom.x, this.currentRoom.y, newCol, newRow);
    this.movePlayer(x, y);

    this.updateMinimap();

    // === ROOM TRANSITION EFFECT ===
    if (prevRoom) {
      // fade out floors + puzzle tiles
      [...prevRoom.floors.getChildren(), ...prevRoom.puzzleTiles].forEach(obj => {
        if (obj && obj.setAlpha) {
          this.tweens.add({
            targets: obj,
            alpha: 0.01,   // keep it ghosted instead of destroying
            duration: 500
          });
        }
      });

      // fade out walls separately
      prevRoom.walls.getChildren().forEach(wall => {
        if (wall && wall.setAlpha) {
          this.tweens.add({
            targets: wall,
            alpha: 0.01,
            duration: 500
          });
        }
      });
    }

    // fade in the new room (restore if ghosted)
    if (newRoom) {
      [...newRoom.floors.getChildren(), ...newRoom.puzzleTiles, ...newRoom.walls.getChildren()]
        .forEach(obj => {
          if (obj && obj.setAlpha) {
            this.tweens.add({
              targets: obj,
              alpha: 1,
              duration: 500
            });
          }
        });
    }
  }

  // ====== PUZZLES ======
  // returns { tiles: [...], tileMap: { col: tile }, equation: "a + b = c" }
  createRandomEquationPuzzle(rx, ry, offsetX, offsetY) {
    const { equation, pieces } = this.generateEquation();
    // We want the tiles in one row, so keep startRow fixed.
    const startRow = Math.floor(ROOM_SIZE / 2);
    const maxPieces = ROOM_SIZE - 2; // available columns inside walls
    // If pieces too long, we trim spacing (rare) — but normally pieces.length <= 5
    const trimmedPieces = pieces.slice(0, maxPieces);
    Phaser.Utils.Array.Shuffle(trimmedPieces);

    // put startCol so puzzle is centered-ish or at least fits
    const startCol = 1; // keep it simple and predictable

    const tiles = [];
    const tileMap = {}; // col -> tile

    trimmedPieces.forEach((val, i) => {
      const col = startCol + i;
      const x = offsetX + col * TILE_SIZE + TILE_SIZE / 2;
      const y = offsetY + startRow * TILE_SIZE + TILE_SIZE / 2;

      const tile = this.add.text(x, y, val, {
        font: "20px Arial",
        color: "#fff",
        backgroundColor: "#333",
        padding: { left: 6, right: 6, top: 2, bottom: 2 }
      }).setOrigin(0.5).setDepth(50);

      // mark grid coords on tile (used for robust ordering)
      tile.setData('col', col);
      tile.setData('row', startRow);
      tile.setData('rx', rx);
      tile.setData('ry', ry);

      tile.setInteractive();
      this.input.setDraggable(tile);

      // drag events attached per-tile (so handlers aren't global/duplicated)
      tile.on('drag', (pointer, dragX, dragY) => {
        tile.x = dragX;
        tile.y = dragY;
        tile.setDepth(100); // above other tiles while dragging
      });

      tile.on('dragend', () => {
        // snap column (clamp to puzzle columns)
        let snappedCol = Math.round((tile.x - offsetX - TILE_SIZE / 2) / TILE_SIZE);
        const minCol = startCol;
        const maxCol = startCol + trimmedPieces.length - 1;
        snappedCol = Phaser.Math.Clamp(snappedCol, minCol, maxCol);

        const snappedX = offsetX + snappedCol * TILE_SIZE + TILE_SIZE / 2;
        const snappedY = y; // force row

        // find other tile occupying that column
        const otherTile = tileMap[snappedCol];

        if (otherTile && otherTile !== tile) {
          // swap columns in tileMap
          const prevCol = tile.getData('col');
          const otherCol = otherTile.getData('col');

          // update mapping immediately (so if user swaps quickly it's consistent)
          tileMap[otherCol] = tile;
          tileMap[prevCol] = otherTile;
          tile.setData('col', otherCol);
          otherTile.setData('col', prevCol);

          // animate both then check puzzle after both animations complete
          let done = 0;
          const doneCb = () => { done++; if (done === 2) this.checkPuzzle(rx, ry); };

          this.tweens.add({
            targets: otherTile,
            x: offsetX + prevCol * TILE_SIZE + TILE_SIZE / 2,
            y: snappedY,
            duration: 140,
            ease: "Quad.easeOut",
            onComplete: doneCb
          });

          this.tweens.add({
            targets: tile,
            x: snappedX,
            y: snappedY,
            duration: 140,
            ease: "Quad.easeOut",
            onComplete: doneCb
          });
        } else {
          // move tile into empty spot
          const prevCol = tile.getData('col');
          if (tileMap[prevCol] === tile) delete tileMap[prevCol];

          tileMap[snappedCol] = tile;
          tile.setData('col', snappedCol);

          this.tweens.add({
            targets: tile,
            x: snappedX,
            y: snappedY,
            duration: 120,
            ease: "Quad.easeOut",
            onComplete: () => {
              this.checkPuzzle(rx, ry);
            }
          });
        }
      });

      tiles.push(tile);
      tileMap[col] = tile;
    });

    return { tiles, tileMap, equation };
  }

  generateEquation() {
    const op = Phaser.Math.Between(0, 3);
    let a, b, result, eq;

    switch (op) {
      case 0:
        a = Phaser.Math.Between(1, 9);
        b = Phaser.Math.Between(1, 9);
        result = a + b;
        eq = `${a} + ${b} = ${result}`;
        break;
      case 1:
        a = Phaser.Math.Between(5, 15);
        b = Phaser.Math.Between(1, a);
        result = a - b;
        eq = `${a} - ${b} = ${result}`;
        break;
      case 2:
        a = Phaser.Math.Between(2, 5);
        b = Phaser.Math.Between(2, 5);
        result = a * b;
        eq = `${a} × ${b} = ${result}`;
        break;
      case 3:
        b = Phaser.Math.Between(2, 5);
        result = Phaser.Math.Between(2, 5);
        a = b * result;
        eq = `${a} ÷ ${b} = ${result}`;
        break;
    }

    const pieces = eq.split(" ");
    return { equation: eq, pieces };
  }

  // Evaluate candidate arrangement and mark room solved if correct
  checkPuzzle(rx, ry) {
    const roomKey = `${rx},${ry}`;
    const room = this.rooms[roomKey];
    if (!room) return;
    if (room.solved) return;

    // Use col-based ordering (robust to tween/position timing)
    const sorted = room.puzzleTiles.slice().sort((a, b) => a.getData('col') - b.getData('col'));
    const tokens = sorted.map(t => String(t.text).trim());
    // join with single spaces -- not used for equality now, we evaluate numerically
    // const equationStr = tokens.join(" ");

    // parse & evaluate
    const valid = this.evaluateEquationTokens(tokens);

    if (valid) {
      room.solved = true;
      // style solved tiles
      room.puzzleTiles.forEach(t => {
        try { t.setStyle({ backgroundColor: "#0a0" }); } catch (e) {}
      });

      this.roomsCompleted++;
      this.updateMinimap();

      if (this.roomsCompleted >= ROOMS_PER_LEVEL) {
        this.showLevelCompletePopup();
      }
    }
  }

  // Accepts tokens like ["3", "+", "2", "=", "5"]
  // returns true if equation is mathematically correct
  evaluateEquationTokens(tokens) {
    // find '=' index
    const eqIndex = tokens.indexOf("=");
    if (eqIndex === -1) return false;

    const left = tokens.slice(0, eqIndex);
    const right = tokens.slice(eqIndex + 1);

    if (right.length < 1) return false;

    // parse right side number (support multi-token but usually single)
    const rightNum = parseFloat(right.join(" "));
    if (Number.isNaN(rightNum)) return false;

    // left expected to be [a, op, b]
    if (left.length !== 3) return false;
    const a = parseFloat(left[0]);
    const op = left[1];
    const b = parseFloat(left[2]);
    if (Number.isNaN(a) || Number.isNaN(b)) return false;

    // handle operators: +, -, × (or x), ÷ (or /)
    if (op === "+" || op === "plus") {
      return (a + b) === rightNum;
    }
    if (op === "-") {
      return (a - b) === rightNum;
    }
    if (op === "×" || op === "x" || op === "*") {
      return (a * b) === rightNum;
    }
    if (op === "÷" || op === "/") {
      // allow exact division only
      return (b !== 0) && (a / b === rightNum);
    }

    return false;
  }

  // ====== MINIMAP ======
  createMinimap() {
    const size = 16;
    const margin = 4;
    const startX = 20;
    const startY = 20;

    this.minimapSquares = [];
    for (let i = 0; i < ROOMS_PER_LEVEL; i++) {
      const sq = this.add.rectangle(
        startX + i * (size + margin),
        startY,
        size,
        size,
        0x666666
      ).setOrigin(0, 0);
      sq.setScrollFactor(0);
      this.minimapSquares.push(sq);
    }

    this.levelText = this.add.text(startX, startY + size + 10, `Level ${this.level}`, {
      font: "16px Arial",
      color: "#fff"
    }).setScrollFactor(0);
  }

  updateMinimap() {
    if (!this.minimapSquares.length) return;
    for (let i = 0; i < ROOMS_PER_LEVEL; i++) {
      if (i < this.roomsCompleted) {
        this.minimapSquares[i].setFillStyle(0xff0000); // red = completed
      } else {
        this.minimapSquares[i].setFillStyle(0x666666); // gray = pending
      }
    }
    if (this.levelText) this.levelText.setText(`Level ${this.level}`);
  }

  // ====== POPUP (always on top) ======
  showLevelCompletePopup() {
    if (this.popupOpen) return;
    this.popupOpen = true;

    const cam = this.cameras.main;
    const width = cam.width;
    const height = cam.height;

    // 1) Overlay (full-screen, separate object under popup UI)
    //    Make it interactive so clicks outside the popup can close it.
    const overlay = this.add.rectangle(cam.centerX, cam.centerY, width, height, 0x000000, 0.7)
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(10000)
      .setInteractive();
    // Clicking overlay closes popup
    overlay.on("pointerdown", () => {
      try { this.popupContainer && this.popupContainer.destroy(); } catch (e) {}
      try { overlay.destroy(); } catch (e) {}
      this.popupContainer = null;
      this.popupOpen = false;
    });

    // 2) Container for popup UI (fixed to camera) above overlay
    this.popupContainer = this.add.container(cam.centerX, cam.centerY)
      .setScrollFactor(0)
      .setDepth(10050);

    // Popup box + UI (drawn above the overlay)
    const box = this.add.rectangle(0, 0, 320, 180, 0x222222).setStrokeStyle(3, 0xffffff);

    const title = this.add.text(0, -44, `Level ${this.level} Cleared!`, {
      font: "22px Arial",
      color: "#ffffff"
    }).setOrigin(0.5);

    const subtitle = this.add.text(0, -12, `Great job!`, {
      font: "16px Arial",
      color: "#dddddd"
    }).setOrigin(0.5);

    // Create a larger clickable button background to ensure reliable clicks
    const nextBtnBg = this.add.rectangle(0, 46, 200, 46, 0x008000)
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });

    const nextBtn = this.add.text(0, 46, "Next Level ▶", {
      font: "20px Arial",
      color: "#ffffff"
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    // Add UI elements to the container (overlay is separate beneath)
    // Add background before text so text renders above
    this.popupContainer.add([box, title, subtitle, nextBtnBg, nextBtn]);

    // Hover visuals
    nextBtnBg.on("pointerover", () => nextBtnBg.setFillStyle(0x00aa00));
    nextBtnBg.on("pointerout", () => nextBtnBg.setFillStyle(0x008000));

    // Next level button behavior: close popup + overlay then start next level
    const handleNext = () => {
      // tear down popup UI and overlay
      try { this.popupContainer.destroy(); } catch (e) {}
      this.popupContainer = null;
      this.popupOpen = false;

      // Destroy overlay if still present
      try { overlay.destroy(); } catch (e) {}
      // Reload the page to generate a fresh random level
      try { window.location.reload(); } catch (e) { location.reload(); }
    };

    nextBtnBg.on("pointerdown", handleNext);
    nextBtn.on("pointerdown", handleNext);

    // entrance tween
    this.tweens.add({
      targets: [box, title, subtitle, nextBtn],
      scaleX: { from: 0.8, to: 1 },
      scaleY: { from: 0.8, to: 1 },
      ease: "Back.Out",
      duration: 350
    });
  }
  
  // ====== MOBILE CONTROLS ======
  createMobileControls() {
    const btnSize = 50;
    const margin = 150;
    const bottom = this.scale.height - margin - btnSize;
    const centerX = this.scale.width / 2;

    // Helper to create a button with an arrow label at high depth
    const makeArrowButton = (x, y, texture, callback) => {
      const btn = this.add.image(x, y, texture)
        .setInteractive()
        .setScrollFactor(0)
        .setDisplaySize(btnSize, btnSize)
        .setDepth(1000); // keep above walls/floor

      btn.on("pointerdown", callback);
      return btn;
    };

    // Build D-pad with depth
    this.btnUp = makeArrowButton(centerX, bottom - btnSize, "up-arrow", () => this.tryMove(0, -1));
    this.btnDown = makeArrowButton(centerX, bottom + btnSize, "down-arrow", () => this.tryMove(0, 1));
    this.btnLeft = makeArrowButton(centerX - btnSize, bottom, "left-arrow", () => this.tryMove(-1, 0));
    this.btnRight = makeArrowButton(centerX + btnSize, bottom, "right-arrow", () => this.tryMove(1, 0));
  }
}