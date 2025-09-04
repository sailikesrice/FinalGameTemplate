/*
 * @file Dungeon.js
 * @description Dungeon scene with randomized floor-tile math puzzles.
 * Each room generates a random equation puzzle that must be solved to unlock passages.
 * @sailikesrice
 */

import { Scene } from "phaser";

const TILE_SIZE = 32;
const ROOM_SIZE = 7;

export class Dungeon extends Scene {
  constructor() {
    super("Dungeon");
    this.rooms = {};
    this.currentRoom = { x: 0, y: 0 };
  }

  preload() {
    this.load.image("wall", "https://labs.phaser.io/assets/sprites/block.png");
    this.load.image("floor", "https://labs.phaser.io/assets/sprites/white-block.png");
    this.load.image("player", "https://labs.phaser.io/assets/sprites/phaser-dude.png");
  }

  create() {
    this.walls = this.physics.add.staticGroup();

    // First room
    this.generateRoom(0, 0);

    // Player in center
    const { x, y } = this.getTileCenter(0, 0, Math.floor(ROOM_SIZE / 2), Math.floor(ROOM_SIZE / 2));
    this.player = this.physics.add.sprite(x, y, "player");
    this.player.setDisplaySize(TILE_SIZE * 0.7, TILE_SIZE * 0.7);
    this.player.setDepth(1);

    this.physics.add.collider(this.player, this.walls);

    this.cursors = this.input.keyboard.createCursorKeys();
    this.keys = this.input.keyboard.addKeys("W,A,S,D");

    this.isMoving = false;
    this.moveDelay = 150;

    this.cameras.main.startFollow(this.player, true, 0.1, 0.1);
    this.cameras.main.setZoom(1.25);
    this.cameras.main.setBackgroundColor(0x000000);
  }

  update() {
    if (this.isMoving) return;

    let dx = 0, dy = 0;
    if (this.cursors.left.isDown || this.keys.A.isDown) dx = -1;
    else if (this.cursors.right.isDown || this.keys.D.isDown) dx = 1;
    else if (this.cursors.up.isDown || this.keys.W.isDown) dy = -1;
    else if (this.cursors.down.isDown || this.keys.S.isDown) dy = 1;

    if (dx !== 0 || dy !== 0) {
      this.tryMove(dx, dy);
    }
  }

  generateRoom(rx, ry) {
    const roomKey = `${rx},${ry}`;
    if (this.rooms[roomKey]) return;

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
          const center = Math.floor(ROOM_SIZE / 2);
          const passage =
            (row === 0 && col === center) ||
            (row === ROOM_SIZE - 1 && col === center) ||
            (col === 0 && row === center) ||
            (col === ROOM_SIZE - 1 && row === center);

          if (!passage) {
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
    if (!(rx === 0 && ry === 0)) {
      const puzzle = this.createRandomEquationPuzzle(rx, ry, offsetX, offsetY);
      puzzleTiles.push(...puzzle);
      solved = false;
    }

    this.rooms[roomKey] = { walls, floors, puzzleTiles, solved };
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

    // If puzzle not solved, block passages
    if (!room.solved) {
      return this.moveWithinRoom(dx, dy);
    }

    // Otherwise allow passages
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
    this.currentRoom.x += dx;
    this.currentRoom.y += dy;
    this.generateRoom(this.currentRoom.x, this.currentRoom.y);

    const { x, y } = this.getTileCenter(this.currentRoom.x, this.currentRoom.y, newCol, newRow);
    this.movePlayer(x, y);
  }

  // === Random Puzzle Generation === //
  createRandomEquationPuzzle(rx, ry, offsetX, offsetY) {
    const { equation, pieces } = this.generateEquation();
    Phaser.Utils.Array.Shuffle(pieces);

    const startRow = Math.floor(ROOM_SIZE / 2);
    const startCol = 1;

    const tiles = [];

    pieces.forEach((val, i) => {
      const col = startCol + i;
      const row = startRow;
      const x = offsetX + col * TILE_SIZE + TILE_SIZE / 2;
      const y = offsetY + row * TILE_SIZE + TILE_SIZE / 2;

      const tile = this.add.text(x, y, val, {
        font: "20px Arial",
        color: "#fff",
        backgroundColor: "#333",
        padding: { left: 6, right: 6, top: 2, bottom: 2 }
      }).setOrigin(0.5);

      tile.setInteractive();
      this.input.setDraggable(tile);
      tiles.push(tile);
    });

    // Drag & drop
    this.input.on("drag", (pointer, gameObject, dragX, dragY) => {
      gameObject.x = dragX;
      gameObject.y = dragY;
    });

    this.input.on("dragend", () => {
      this.checkPuzzle(rx, ry, equation);
    });

    return tiles;
  }

  generateEquation() {
    const op = Phaser.Math.Between(0, 3);
    let a, b, result, eq;

    switch (op) {
      case 0: // addition
        a = Phaser.Math.Between(1, 9);
        b = Phaser.Math.Between(1, 9);
        result = a + b;
        eq = `${a} + ${b} = ${result}`;
        break;
      case 1: // subtraction
        a = Phaser.Math.Between(5, 15);
        b = Phaser.Math.Between(1, a);
        result = a - b;
        eq = `${a} - ${b} = ${result}`;
        break;
      case 2: // multiplication
        a = Phaser.Math.Between(2, 5);
        b = Phaser.Math.Between(2, 5);
        result = a * b;
        eq = `${a} × ${b} = ${result}`;
        break;
      case 3: // division
        b = Phaser.Math.Between(2, 5);
        result = Phaser.Math.Between(2, 5);
        a = b * result; // ensures integer division
        eq = `${a} ÷ ${b} = ${result}`;
        break;
    }

    const pieces = eq.split(" ");
    return { equation: eq, pieces };
  }

  checkPuzzle(rx, ry, correctEquation) {
    const roomKey = `${rx},${ry}`;
    const room = this.rooms[roomKey];
    if (!room) return;

    const sorted = room.puzzleTiles.slice().sort((a, b) => a.x - b.x);
    const equation = sorted.map(tile => tile.text).join(" ");

    if (equation === correctEquation) {
      room.solved = true;
      room.puzzleTiles.forEach(t => t.setBackgroundColor("#0a0")); // green solved
    }
  }
}
