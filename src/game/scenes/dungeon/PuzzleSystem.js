import { TILE_SIZE, ROOM_SIZE } from './Constants.js';

export class PuzzleSystem {
  constructor(scene) {
    this.scene = scene;
    this.selectedTile = null;
    this.operationSettings = this.loadOperationSettings();
  }

  loadOperationSettings() {
    try {
      const saved = localStorage.getItem('mathDungeonSettings');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.log('Could not load operation settings:', e);
    }
    
    // Return defaults if nothing saved
    return {
      addition: true,
      subtraction: true,
      multiplication: true,
      division: true
    };
  }

  // Method to refresh settings (useful if settings change during gameplay)
  refreshOperationSettings() {
    this.operationSettings = this.loadOperationSettings();
  }

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

      const tile = this.scene.add.text(x, y, val, {
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
      
      // Store reference to room and tile map for mobile interaction
      tile.setData('roomKey', `${rx},${ry}`);
      tile.setData('tileMap', tileMap);
      tile.setData('offsetX', offsetX);
      tile.setData('startCol', startCol);
      tile.setData('maxCol', startCol + trimmedPieces.length - 1);
      tile.setData('snapY', y);

      // Desktop drag events (keep for desktop compatibility)
      this.scene.input.setDraggable(tile);

      tile.on('drag', (pointer, dragX, dragY) => {
        tile.x = dragX;
        tile.y = dragY;
        tile.setDepth(100); // above other tiles while dragging
      });

      tile.on('dragend', () => {
        this.handleTileMove(tile, rx, ry);
      });

      // Mobile touch events - tap to select, tap another to swap
      tile.on('pointerdown', (pointer) => {
        // Handle both desktop and mobile - we'll differentiate in the handler
        this.handleMobileTileSelection(tile, pointer);
      });

      tiles.push(tile);
      tileMap[col] = tile;
    });

    return { tiles, tileMap, equation };
  }

  generateEquation() {
    // Get available operations based on settings
    const availableOps = [];
    if (this.operationSettings.addition) availableOps.push(0);
    if (this.operationSettings.subtraction) availableOps.push(1);
    if (this.operationSettings.multiplication) availableOps.push(2);
    if (this.operationSettings.division) availableOps.push(3);

    // If no operations are selected, default to addition
    if (availableOps.length === 0) {
      availableOps.push(0);
    }

    const op = Phaser.Math.RND.pick(availableOps);
    let a, b, result, eq;

    switch (op) {
      case 0: // Addition
        a = Phaser.Math.Between(1, 9);
        b = Phaser.Math.Between(1, 9);
        result = a + b;
        eq = `${a} + ${b} = ${result}`;
        break;
      case 1: // Subtraction
        a = Phaser.Math.Between(5, 15);
        b = Phaser.Math.Between(1, a);
        result = a - b;
        eq = `${a} - ${b} = ${result}`;
        break;
      case 2: // Multiplication
        a = Phaser.Math.Between(2, 5);
        b = Phaser.Math.Between(2, 5);
        result = a * b;
        eq = `${a} × ${b} = ${result}`;
        break;
      case 3: // Division
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
    const room = this.scene.rooms[roomKey];
    if (!room) return;
    if (room.solved) return;

    // Use col-based ordering (robust to tween/position timing)
    const sorted = room.puzzleTiles.slice().sort((a, b) => a.getData('col') - b.getData('col'));
    const tokens = sorted.map(t => String(t.text).trim());

    // parse & evaluate
    const valid = this.evaluateEquationTokens(tokens);

    if (valid) {
      room.solved = true;
      // style solved tiles
      room.puzzleTiles.forEach(t => {
        try { t.setStyle({ backgroundColor: "#0a0" }); } catch (e) {}
      });

      this.scene.levelManager.roomsCompleted++;
      this.scene.minimapUI.updateMinimap();
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

  // ====== MOBILE PUZZLE TILE INTERACTION ======
  handleMobileTileSelection(tile, pointer) {
    const roomKey = tile.getData('roomKey');
    const room = this.scene.rooms[roomKey];
    if (!room || room.solved) return;

    // Detect if this is a touch device
    const isTouchDevice = this.scene.sys.game.device.input.touch || 
                         (pointer.event && (pointer.event.type === 'touchstart' || pointer.event.type === 'touchend')) ||
                         (typeof window !== 'undefined' && 'ontouchstart' in window);

    // For touch devices, use tap-to-select/swap logic
    // For desktop, let drag events handle the interaction
    if (isTouchDevice) {
      // Small delay to prevent conflicts with drag events on desktop
      setTimeout(() => {
        if (this.selectedTile === null) {
          // First tile selected
          this.selectedTile = tile;
          this.highlightTile(tile, true);
        } else if (this.selectedTile === tile) {
          // Same tile selected again - deselect
          this.highlightTile(tile, false);
          this.selectedTile = null;
        } else {
          // Different tile selected - attempt swap
          const success = this.attemptTileSwap(this.selectedTile, tile, roomKey);
          
          // Clear selection
          this.highlightTile(this.selectedTile, false);
          this.selectedTile = null;
          
          if (success) {
            // Check puzzle after successful swap
            const rx = tile.getData('rx');
            const ry = tile.getData('ry');
            this.checkPuzzle(rx, ry);
          }
        }
      }, 50); // Small delay to differentiate from drag
    }
  }

  highlightTile(tile, selected) {
    if (selected) {
      tile.setStyle({ backgroundColor: "#0066ff" }); // Blue highlight for selected
      tile.setScale(1.1);
    } else {
      tile.setStyle({ backgroundColor: "#333" }); // Reset to original color
      tile.setScale(1.0);
    }
  }

  attemptTileSwap(tile1, tile2, roomKey) {
    const room = this.scene.rooms[roomKey];
    if (!room || !room.tileMap) return false;

    const tileMap = room.tileMap;
    const col1 = tile1.getData('col');
    const col2 = tile2.getData('col');

    // Update tile map to swap positions
    tileMap[col1] = tile2;
    tileMap[col2] = tile1;
    
    // Update tile data
    tile1.setData('col', col2);
    tile2.setData('col', col1);

    // Get positions for animation
    const offsetX = tile1.getData('offsetX');
    const snapY = tile1.getData('snapY');
    
    const x1 = offsetX + col1 * TILE_SIZE + TILE_SIZE / 2;
    const x2 = offsetX + col2 * TILE_SIZE + TILE_SIZE / 2;

    // Animate the swap
    let done = 0;
    const doneCb = () => { done++; };

    this.scene.tweens.add({
      targets: tile1,
      x: x2,
      y: snapY,
      duration: 200,
      ease: "Quad.easeOut",
      onComplete: doneCb
    });

    this.scene.tweens.add({
      targets: tile2,
      x: x1,
      y: snapY,
      duration: 200,
      ease: "Quad.easeOut",
      onComplete: doneCb
    });

    return true;
  }

  handleTileMove(tile, rx, ry) {
    // Extract data from tile
    const offsetX = tile.getData('offsetX');
    const startCol = tile.getData('startCol');
    const maxCol = tile.getData('maxCol');
    const snapY = tile.getData('snapY');
    const roomKey = tile.getData('roomKey');
    const room = this.scene.rooms[roomKey];
    
    if (!room || !room.tileMap) return;

    const tileMap = room.tileMap;

    // snap column (clamp to puzzle columns)
    let snappedCol = Math.round((tile.x - offsetX - TILE_SIZE / 2) / TILE_SIZE);
    snappedCol = Phaser.Math.Clamp(snappedCol, startCol, maxCol);

    const snappedX = offsetX + snappedCol * TILE_SIZE + TILE_SIZE / 2;

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

      this.scene.tweens.add({
        targets: otherTile,
        x: offsetX + prevCol * TILE_SIZE + TILE_SIZE / 2,
        y: snapY,
        duration: 140,
        ease: "Quad.easeOut",
        onComplete: doneCb
      });

      this.scene.tweens.add({
        targets: tile,
        x: snappedX,
        y: snapY,
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

      this.scene.tweens.add({
        targets: tile,
        x: snappedX,
        y: snapY,
        duration: 120,
        ease: "Quad.easeOut",
        onComplete: () => {
          this.checkPuzzle(rx, ry);
        }
      });
    }

    // Reset tile depth and style
    tile.setDepth(50);
    tile.setStyle({ backgroundColor: "#333" });
  }
}
