/*
    * @file Dungeon.js
    * @description This file defines the Dungeon scene for the Math Dungeon game.
    * It handles the room layout, player movement, and basic game mechanics.
    * @sailikesrice
*/ 

import { Scene } from "phaser";

// constants
const TILE_SIZE = 32;
const ROOM_SIZE = 7; // 6x6 including walls
const PLAY_AREA = 5; // 5x5 inside

export class Dungeon extends Scene {
  constructor() {
    super("Dungeon");
  }

  preload() {
    // placeholder sprites
    this.load.image("wall", "https://labs.phaser.io/assets/sprites/block.png");
    this.load.image("floor", "https://labs.phaser.io/assets/sprites/white-block.png");
    this.load.image("player", "https://labs.phaser.io/assets/sprites/phaser-dude.png");
  }

  create() {
    this.roomOriginX = (this.scale.width - ROOM_SIZE * TILE_SIZE) / 2;
    this.roomOriginY = (this.scale.height - ROOM_SIZE * TILE_SIZE) / 2;

    this.walls = this.physics.add.staticGroup();
    this.drawRoom();

    // start in the center of the play area
    const startCol = Math.floor(ROOM_SIZE / 2);
    const startRow = Math.floor(ROOM_SIZE / 2);

    const { x, y } = this.getTileCenter(startCol, startRow);

    this.player = this.physics.add.sprite(x, y, "player");
    this.player.setDisplaySize(TILE_SIZE * 0.7, TILE_SIZE * 0.7); // fit neatly inside tile

    // collider with walls
    this.physics.add.collider(this.player, this.walls);

    this.cursors = this.input.keyboard.createCursorKeys();
    this.keys = this.input.keyboard.addKeys("W,A,S,D");

    this.isMoving = false;
    this.moveDelay = 150; // milliseconds for movement animation

    // Dynamic Camera Movement
    this.input.keyboard.on("keydown", (event) => {
      if (event.key === "Enter") {
        this.scene.start("Preloader"); // transition to preloader on Enter key
      }
    });
    this.add.text(300, 300, "Math Dungeon!", { font: "24px Arial", fill: "#fff" });
    this.add.text(300, 330, "Use arrow keys or WASD to move", { font: "16px Arial", fill: "#fff" });
    this.add.text(300, 360, "Press Enter to start", { font: "16px Arial", fill: "#fff" });
    this.add.text(300, 390, "Avoid walls and explore the dungeon!", { font: "16px Arial", fill: "#fff" });
    this.add.text(300, 420, "Press Enter to transition to Start", { font: "16px Arial", fill: "#fff" });
    this.cameras.main.setBounds(0, 0, this.scale.width, this.scale.height);
    this.cameras.main.startFollow(this.player, true, 0.1, 0.1);
    this.cameras.main.setZoom(1.25); // zoom out a bit to see
    this.cameras.main.setScroll(this.roomOriginX, this.roomOriginY);
    this.cameras.main.setBackgroundColor(0x000000); // black background
    this.cameras.main.setRoundPixels(true); // pixel perfect rendering
    this.cameras.main.setName("DungeonCamera");
  }

  update() {
    if (this.isMoving) return;

    let dx = 0,
      dy = 0;
    if (this.cursors.left.isDown || this.keys.A.isDown) dx = -1;
    else if (this.cursors.right.isDown || this.keys.D.isDown) dx = 1;
    else if (this.cursors.up.isDown || this.keys.W.isDown) dy = -1;
    else if (this.cursors.down.isDown || this.keys.S.isDown) dy = 1;

    if (dx !== 0 || dy !== 0) {
      this.tryMove(dx, dy);
    }
  }

  drawRoom() {
    for (let row = 0; row < ROOM_SIZE; row++) {
      for (let col = 0; col < ROOM_SIZE; col++) {
        const { x, y } = this.getTileCenter(col, row);

        const isWall =
          row === 0 || col === 0 || row === ROOM_SIZE - 1 || col === ROOM_SIZE - 1;

        if (isWall) {
          const wall = this.walls.create(x, y, "wall");
          wall.setDisplaySize(TILE_SIZE, TILE_SIZE);
          wall.refreshBody();
        } else {
          const floor = this.add.image(x, y, "floor");
          floor.setDisplaySize(TILE_SIZE, TILE_SIZE);
          floor.setTint(0x222222);
        }
      }
    }
  }

  getTileCenter(col, row) {
    const x = this.roomOriginX + col * TILE_SIZE + TILE_SIZE / 2;
    const y = this.roomOriginY + row * TILE_SIZE + TILE_SIZE / 2;
    return { x, y };
  }

  tryMove(dx, dy) {
    const col = Math.round((this.player.x - this.roomOriginX - TILE_SIZE / 2) / TILE_SIZE);
    const row = Math.round((this.player.y - this.roomOriginY - TILE_SIZE / 2) / TILE_SIZE);

    const targetCol = col + dx;
    const targetRow = row + dy;

    // stop if trying to move into a wall
    if (
      targetCol <= 0 ||
      targetRow <= 0 ||
      targetCol >= ROOM_SIZE - 1 ||
      targetRow >= ROOM_SIZE - 1
    ) {
      return;
    }

    const { x, y } = this.getTileCenter(targetCol, targetRow);

    this.isMoving = true;
    this.tweens.add({
      targets: this.player,
      x,
      y,
      duration: this.moveDelay,
      onComplete: () => {
        this.isMoving = false;
      },
    });
  }
}
