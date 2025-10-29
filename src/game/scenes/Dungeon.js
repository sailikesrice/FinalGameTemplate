/*
 * @file Dungeon.js
 * @description Dungeon scene with levels, randomized math puzzles, and a progress minimap.
 * Each level has 6 rooms with a predetermined random map structure.
 * Puzzle tiles can swap positions instead of overlapping.
 * Shows a popup after completing every level.
 * @sailikesrice
 */

import { Scene } from "phaser";
import { TILE_SIZE, ROOM_SIZE } from "../dungeon/constants";
import { GameSettings } from "../dungeon/GameSettings";
import { MapGenerator } from "../dungeon/MapGenerator";
import { Room } from "../dungeon/Room";
import { PlayerController } from "../dungeon/PlayerController";
import { Minimap } from "../dungeon/Minimap";
import { PopupUI } from "../dungeon/PopupUI";
import { MobileControls } from "../dungeon/MobileControls";
import { EquationPuzzle } from "../dungeon/EquationPuzzle";

export class Dungeon extends Scene {
  constructor() {
    super("Dungeon");
    this.rooms = {};
    this.currentRoom = { x: 0, y: 0 };
    this.level = 1;
    this.roomsCompleted = 0;
    this.mapLayout = [];

    // helpers
    this.mapGen = null;
    this.minimap = null;
    this.playerCtrl = null;
    this.popup = null;
    this.mobile = null;
    this.levelStartMs = 0;
  }

  init(data) {
    if (data && typeof data.level === 'number') {
      this.level = data.level;
    }
    if (data && data.sessionCode) this.registry.set('sessionCode', data.sessionCode);
    if (data && data.role) this.registry.set('role', data.role);
  }

  create() {
    // static group used for all walls (so we can clear them easily)
    this.walls = this.physics.add.staticGroup();

    // init helpers
    this.mapGen = new MapGenerator();
    this.minimap = new Minimap(this);
    this.playerCtrl = new PlayerController(this);
    this.popup = new PopupUI(this);
    this.mobile = new MobileControls(this);

    // no timer HUD during level; stats collected separately

    // listen for puzzle tile changes
    this.events.on('puzzle-updated', (rx, ry) => this.checkPuzzle(rx, ry));

    this.startLevel();

    // mobile controls
    this.mobile.create((dx, dy) => this.tryMove(dx, dy));
  }

  update() {
    // block input while popup open or while moving
    if ((this.popup && this.popup.open) || (this.playerCtrl && this.playerCtrl.isMoving)) return;

    let dx = 0, dy = 0;
    if ((this.cursors && this.cursors.left.isDown) || (this.keys && this.keys.A.isDown)) dx = -1;
    else if ((this.cursors && this.cursors.right.isDown) || (this.keys && this.keys.D.isDown)) dx = 1;
    else if ((this.cursors && this.cursors.up.isDown) || (this.keys && this.keys.W.isDown)) dy = -1;
    else if ((this.cursors && this.cursors.down.isDown) || (this.keys && this.keys.S.isDown)) dy = 1;

    if (dx !== 0 || dy !== 0) {
      this.tryMove(dx, dy);
    }
  }

  // no timer ticks; the scene only tracks start and computes elapsed on completion

  // ====== LEVEL MANAGEMENT ======
  startLevel() {
    // Clean up any leftover objects if this is a restart
    // Note: don't remove minimap here (it's reused)
    // but clear scene walls/floors/tiles
    if (!this.minimap || !this.minimap.squares.length) this.minimap.create(this.level);

    // reset trackers
    this.clearLevelObjects(); // clears any previous graphics (if exist)
    this.rooms = {};
    this.roomsCompleted = 0;
    this.mapLayout = this.mapGen.generateLayout();

    // prepare minimap
    this.updateMinimap();

    // generate rooms (first room is start)
    this.generateRoom(0, 0);

    // mark starting room as solved (it has no puzzle)
    this.rooms["0,0"].solved = true;
    this.roomsCompleted++;

    // Player spawn
    this.playerCtrl.spawnAt(0, 0, Math.floor(ROOM_SIZE / 2), Math.floor(ROOM_SIZE / 2));

    // mark level start time
    this.levelStartMs = performance.now ? performance.now() : Date.now();

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
  // Kept for compatibility if needed, now handled by MapGenerator
  generateMapLayout() { return this.mapGen.generateLayout(); }

  // ====== ROOMS ======
  generateRoom(rx, ry) {
    const roomKey = `${rx},${ry}`;
    if (this.rooms[roomKey]) return;

    // Check if this coordinate is part of map layout
    if (!this.mapLayout.find(r => r.x === rx && r.y === ry)) return;
    const room = new Room(this, rx, ry, this.mapLayout, this.walls).build();
    this.rooms[roomKey] = room;
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

    const allowPassages = !!(room && room.solved);
    this.playerCtrl.tryMove(dx, dy, allowPassages, this.currentRoom, this.rooms,
      (erx, ery, newCol, newRow) => this.enterRoom(erx, ery, newCol, newRow),
      () => {}
    );
  }

  // Movement within room now handled by PlayerController
  moveWithinRoom() {}

  // Player movement handled by PlayerController
  movePlayer() {}

  enterRoom(dx, dy, newCol, newRow) {
    // Verify the destination room actually exists in the current map layout
    const targetRx = this.currentRoom.x + dx;
    const targetRy = this.currentRoom.y + dy;
    const exists = this.mapLayout && this.mapLayout.find(r => r.x === targetRx && r.y === targetRy);
    if (!exists) {
      return; // blocked by wall/no passage
    }

    const prevRoomKey = `${this.currentRoom.x},${this.currentRoom.y}`;
    const prevRoom = this.rooms[prevRoomKey];

    // update current room
    this.currentRoom.x = targetRx;
    this.currentRoom.y = targetRy;

    const newRoomKey = `${this.currentRoom.x},${this.currentRoom.y}`;
    this.generateRoom(this.currentRoom.x, this.currentRoom.y);
    const newRoom = this.rooms[newRoomKey];

    const { x, y } = this.playerCtrl.getTileCenter(this.currentRoom.x, this.currentRoom.y, newCol, newRow);
    this.playerCtrl.movePlayer(x, y);

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

  // Puzzle creation now handled by Room -> EquationPuzzle

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
    const valid = EquationPuzzle.evaluateTokens(tokens);

    if (valid) {
      room.solved = true;
      // style solved tiles
      room.puzzleTiles.forEach(t => {
        try { t.setStyle({ backgroundColor: "#0a0" }); } catch (e) {}
      });

      this.roomsCompleted++;
      this.updateMinimap();

      if (this.roomsCompleted >= GameSettings.getRoomsPerLevel()) {
        this.showLevelCompletePopup();
      }
    }
  }

  // Accepts tokens like ["3", "+", "2", "=", "5"]
  // returns true if equation is mathematically correct
  evaluateEquationTokens(tokens) { return EquationPuzzle.evaluateTokens(tokens); }

  // ====== MINIMAP ======
  createMinimap() { this.minimap.create(this.level); }

  updateMinimap() { if (this.minimap) this.minimap.update(this.roomsCompleted, this.level); }

  // ====== POPUP (always on top) ======
  showLevelCompletePopup() {
    // route to stats page with elapsed time
    const end = performance.now ? performance.now() : Date.now();
    const elapsedMs = Math.max(0, Math.floor(end - (this.levelStartMs || end)));
    this.scene.start('LevelStats', { elapsedMs, level: this.level });
  }
  
  // ====== MOBILE CONTROLS ======
  createMobileControls() { this.mobile.create((dx, dy) => this.tryMove(dx, dy)); }
}