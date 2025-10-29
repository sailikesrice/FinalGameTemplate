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

      const tile = this.scene.add.text(x, y, val, {
        font: '20px Arial',
        color: '#fff',
        backgroundColor: '#333',
        padding: { left: 6, right: 6, top: 2, bottom: 2 }
      }).setOrigin(0.5).setDepth(50);

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

      // Handle both desktop drag and mobile touch
      tile.on('drag', (pointer, dragX, dragY) => {
        tile.x = dragX;
        tile.y = dragY;
        tile.setDepth(100);
        tile.setData('isDragging', true);
      });

      // Mobile touch handling
      tile.on('pointerdown', (pointer) => {
        if (pointer.isDown) {
          tile.setData('isDragging', true);
          tile.setData('startX', pointer.x);
          tile.setData('startY', pointer.y);
          tile.setData('offsetX', tile.x - pointer.x);
          tile.setData('offsetY', tile.y - pointer.y);
          tile.setDepth(100);
        }
      });

      tile.on('pointermove', (pointer) => {
        if (tile.getData('isDragging') && pointer.isDown) {
          tile.x = pointer.x + tile.getData('offsetX');
          tile.y = pointer.y + tile.getData('offsetY');
        }
      });

      tile.on('pointerup', () => {
        if (tile.getData('isDragging')) {
          tile.setData('isDragging', false);
          this.handleTileDrop(tile, tileMap, startCol, trimmedPieces.length);
        }
      });

      tile.on('dragend', () => {
        this.handleTileDrop(tile, tileMap, startCol, trimmedPieces.length);
      });

      tiles.push(tile);
      tileMap[col] = tile;
    });

    return { tiles, tileMap, equation };
  }

  handleTileDrop(tile, tileMap, startCol, maxPieces) {
    const y = tile.getData('originalY');
    let snappedCol = Math.round((tile.x - this.offsetX - TILE_SIZE / 2) / TILE_SIZE);
    const minCol = startCol;
    const maxCol = startCol + maxPieces - 1;
    snappedCol = Phaser.Math.Clamp(snappedCol, minCol, maxCol);

    const snappedX = this.offsetX + snappedCol * TILE_SIZE + TILE_SIZE / 2;
    const snappedY = y;

    const otherTile = tileMap[snappedCol];

    if (otherTile && otherTile !== tile) {
      const prevCol = tile.getData('col');
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
      const prevCol = tile.getData('col');
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
    let a, b, result, eq;
    switch (op) {
      case '+':
        a = Phaser.Math.Between(1, 9);
        b = Phaser.Math.Between(1, 9);
        result = a + b;
        eq = `${a} + ${b} = ${result}`;
        break;
      case '-':
        a = Phaser.Math.Between(5, 15);
        b = Phaser.Math.Between(1, a);
        result = a - b;
        eq = `${a} - ${b} = ${result}`;
        break;
      case '×':
        a = Phaser.Math.Between(2, 5);
        b = Phaser.Math.Between(2, 5);
        result = a * b;
        eq = `${a} × ${b} = ${result}`;
        break;
      default: // '÷'
        b = Phaser.Math.Between(2, 5);
        result = Phaser.Math.Between(2, 5);
        a = b * result;
        eq = `${a} ÷ ${b} = ${result}`;
        break;
    }
    return { equation: eq, pieces: eq.split(' ') };
  }
}


