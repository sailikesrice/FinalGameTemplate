import Phaser from 'phaser';
import { TILE_SIZE, ROOM_SIZE } from './constants';
import { GameSettings } from './GameSettings';

export class EquationPuzzle {
  constructor(scene, rx, ry, offsetX, offsetY) {
    this.scene = scene;
    this.rx = rx;
    this.ry = ry;
    this.offsetX = offsetX;
    this.offsetY = offsetY;
    this.numberTileMoves = 0; // Track moves on number tiles only
  }

  create() {
    const { equation, pieces } = this.#generateEquation();
    const startRow = Math.floor(ROOM_SIZE / 2);
    const maxPieces = ROOM_SIZE - 2;
    const trimmedPieces = pieces.slice(0, maxPieces);
    Phaser.Utils.Array.Shuffle(trimmedPieces);

    const startCol = 1;
    const tiles = [];
    const tileMap = {};

    trimmedPieces.forEach((val, i) => {
      const col = startCol + i;
      const x = this.offsetX + col * TILE_SIZE + TILE_SIZE / 2;
      const y = this.offsetY + startRow * TILE_SIZE + TILE_SIZE / 2;

      // Create text tile (previous implementation)
      const tile = this.scene.add.text(x, y, val, {
        fontFamily: 'Arial',
        fontSize: 20,
        color: '#333333',
        resolution: 2
      }).setOrigin(0.5).setDepth(50);

      // Store data on text object
      tile.setData('col', col);
      tile.setData('row', startRow);
      tile.setData('rx', this.rx);
      tile.setData('ry', this.ry);

      tile.setInteractive();
      this.scene.input.setDraggable(tile);

      // Store original position for snapping back
      tile.setData('originalX', x);
      tile.setData('originalY', y);
      tile.setData('isDragging', false);

      // Handle desktop drag - dragX and dragY are already in world coordinates
      tile.on('drag', (pointer, dragX, dragY) => {
        tile.x = dragX;
        tile.y = dragY;
        tile.setDepth(100);
        tile.setData('isDragging', true);
      });

      // Mobile touch handling - use world coordinates from pointer
      tile.on('pointerdown', (pointer) => {
        if (pointer.isDown) {
          tile.setData('isDragging', true);
          // Use worldX/worldY for proper coordinate handling
          tile.setData('offsetX', tile.x - pointer.worldX);
          tile.setData('offsetY', tile.y - pointer.worldY);
          tile.setDepth(100);
        }
      });

      tile.on('pointermove', (pointer) => {
        if (tile.getData('isDragging') && pointer.isDown) {
          // Use worldX/worldY for smooth movement
          tile.x = pointer.worldX + tile.getData('offsetX');
          tile.y = pointer.worldY + tile.getData('offsetY');
        }
      });

      tile.on('pointerup', () => {
        if (tile.getData('isDragging')) {
          tile.setData('isDragging', false);
          this.handleTileDrop(tile, tileMap, startCol, trimmedPieces.length);
        }
      });

      tile.on('dragend', () => {
        tile.setData('isDragging', false);
        this.handleTileDrop(tile, tileMap, startCol, trimmedPieces.length);
      });

      tiles.push(tile);
      tileMap[col] = tile;
    });

    return { tiles, tileMap, equation };
  }

  // (Hint feature removed)

  handleTileDrop(tile, tileMap, startCol, maxPieces) {
    const y = tile.getData('originalY');
    let snappedCol = Math.round((tile.x - this.offsetX - TILE_SIZE / 2) / TILE_SIZE);
    const minCol = startCol;
    const maxCol = startCol + maxPieces - 1;
    snappedCol = Phaser.Math.Clamp(snappedCol, minCol, maxCol);

    const snappedX = this.offsetX + snappedCol * TILE_SIZE + TILE_SIZE / 2;
    const snappedY = y;

    // Get previous column before any operations
    const prevCol = tile.getData('col');
    
    // Check if this is a number tile (not an operator)
    const tileText = tile.text ? String(tile.text).trim() : '';
    const isNumberTile = !isNaN(parseFloat(tileText)) && isFinite(tileText);
    
    // Track moves on number tiles only
    if (isNumberTile && prevCol !== snappedCol) {
      this.numberTileMoves++;
      
      // After 4 moves on number tiles, reduce accuracy
      if (this.numberTileMoves === 4 && this.scene.difficultyAlgorithm) {
        // Reduce accuracy by increasing totalQuestions (which decreases accuracy percentage)
        if (typeof this.scene.difficultyAlgorithm.recordAnswer === 'function') {
          this.scene.difficultyAlgorithm.recordAnswer(false);
        }
      }
    }

    const otherTile = tileMap[snappedCol];

    if (otherTile && otherTile !== tile) {
      const otherCol = otherTile.getData('col');

      tileMap[otherCol] = tile;
      tileMap[prevCol] = otherTile;
      tile.setData('col', otherCol);
      otherTile.setData('col', prevCol);

      let done = 0;
      const doneCb = () => { done++; if (done === 2) this.scene.events.emit('puzzle-updated', this.rx, this.ry); };

      this.scene.tweens.add({
        targets: otherTile,
        x: this.offsetX + prevCol * TILE_SIZE + TILE_SIZE / 2,
        y: snappedY,
        duration: 140,
        ease: 'Quad.easeOut',
        onComplete: doneCb
      });

      this.scene.tweens.add({
        targets: tile,
        x: snappedX,
        y: snappedY,
        duration: 140,
        ease: 'Quad.easeOut',
        onComplete: doneCb
      });
    } else {
      if (tileMap[prevCol] === tile) delete tileMap[prevCol];

      tileMap[snappedCol] = tile;
      tile.setData('col', snappedCol);

      this.scene.tweens.add({
        targets: tile,
        x: snappedX,
        y: snappedY,
        duration: 120,
        ease: 'Quad.easeOut',
        onComplete: () => {
          this.scene.events.emit('puzzle-updated', this.rx, this.ry);
        }
      });
    }
  }

  static evaluateTokens(tokens) {
    const eqIndex = tokens.indexOf('=');
    if (eqIndex === -1) return false;

    const left = tokens.slice(0, eqIndex);
    const right = tokens.slice(eqIndex + 1);
    if (right.length < 1) return false;

    const rightNum = parseFloat(right.join(' '));
    if (Number.isNaN(rightNum)) return false;

    if (left.length !== 3) return false;
    const a = parseFloat(left[0]);
    const op = left[1];
    const b = parseFloat(left[2]);
    if (Number.isNaN(a) || Number.isNaN(b)) return false;

    if (op === '+' || op === 'plus') return (a + b) === rightNum;
    if (op === '-') return (a - b) === rightNum;
    if (op === '×' || op === 'x' || op === '*') return (a * b) === rightNum;
    if (op === '÷' || op === '/') return (b !== 0) && (a / b === rightNum);

    return false;
  }

  #generateEquation() {
    const allowed = GameSettings.getAllowed();
    // Fallback to all if empty for robustness
    const pool = allowed.length ? allowed : ['+', '-', '×', '÷'];
    const op = Phaser.Utils.Array.GetRandom(pool);
    
    // Get difficulty rating from the scene and cap at 4
    const difficultyRating = Math.min(this.scene.difficultyRating || 1, 4);
    
    let a, b, result, eq;
    switch (op) {
      case '+':
        if (difficultyRating === 4) {
          // Use 3-digit numbers for difficulty 4
          a = Phaser.Math.Between(100, 999);
          b = Phaser.Math.Between(100, 999);
        } else {
          // Higher difficulty = larger numbers
          const maxAdd = 9 + (difficultyRating - 1) * 5;
          a = Phaser.Math.Between(1, maxAdd);
          b = Phaser.Math.Between(1, maxAdd);
        }
        result = a + b;
        eq = `${a} + ${b} = ${result}`;
        break;
      case '-':
        if (difficultyRating === 4) {
          // Use 3-digit numbers for difficulty 4
          a = Phaser.Math.Between(200, 999);
          b = Phaser.Math.Between(100, a);
        } else {
          // Higher difficulty = larger numbers and more complex subtraction
          const maxSub = 15 + (difficultyRating - 1) * 10;
          a = Phaser.Math.Between(5, maxSub);
          b = Phaser.Math.Between(1, a);
        }
        result = a - b;
        eq = `${a} - ${b} = ${result}`;
        break;
      case '×':
        if (difficultyRating === 4) {
          // Use 3-digit numbers for difficulty 4
          a = Phaser.Math.Between(10, 99);
          b = Phaser.Math.Between(10, 99);
        } else {
          // Higher difficulty = larger multiplication tables
          const maxMult = 5 + (difficultyRating - 1) * 3;
          a = Phaser.Math.Between(2, maxMult);
          b = Phaser.Math.Between(2, maxMult);
        }
        result = a * b;
        eq = `${a} × ${b} = ${result}`;
        break;
      default: // '÷'
        if (difficultyRating === 4) {
          // Use 3-digit numbers for difficulty 4
          b = Phaser.Math.Between(10, 99);
          result = Phaser.Math.Between(10, 99);
          a = b * result;
        } else {
          // Higher difficulty = larger division problems
          const maxDiv = 5 + (difficultyRating - 1) * 3;
          b = Phaser.Math.Between(2, maxDiv);
          result = Phaser.Math.Between(2, maxDiv);
          a = b * result;
        }
        eq = `${a} ÷ ${b} = ${result}`;
        break;
    }
    return { equation: eq, pieces: eq.split(' ') };
  }
}


