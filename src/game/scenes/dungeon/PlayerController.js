import { TILE_SIZE, ROOM_SIZE } from './Constants.js';

export class PlayerController {
  constructor(scene) {
    this.scene = scene;
    this.currentRoom = { x: 0, y: 0 };
    this.isMoving = false;
    this.moveDelay = 150;
  }

  spawnPlayer() {
    const { x, y } = this.scene.mapGenerator.getTileCenter(0, 0, Math.floor(ROOM_SIZE / 2), Math.floor(ROOM_SIZE / 2));
    
    if (!this.scene.player) {
      this.scene.player = this.scene.physics.add.sprite(x, y, "player");
      this.scene.player.setDisplaySize(TILE_SIZE * 0.7, TILE_SIZE * 0.7);

      // Ensure player always appears above puzzle tiles and other scene objects
      this.scene.player.setDepth(9999);

      this.scene.physics.add.collider(this.scene.player, this.scene.walls);

      this.scene.cursors = this.scene.input.keyboard.createCursorKeys();
      this.scene.keys = this.scene.input.keyboard.addKeys("W,A,S,D");

      this.isMoving = false;
      this.moveDelay = 150;

      this.scene.cameras.main.startFollow(this.scene.player, true, 0.1, 0.1);
      this.scene.cameras.main.setZoom(1.25);
      this.scene.cameras.main.setBackgroundColor(0x000000);
    } else {
      this.scene.player.setPosition(x, y);
      // keep depth consistent whenever we reposition player
      this.scene.player.setDepth(9999);
    }
  }

  update() {
    // block input while popup open or while moving
    if (this.scene.popupOpen || this.isMoving) return;

    let dx = 0, dy = 0;
    if ((this.scene.cursors && this.scene.cursors.left.isDown) || (this.scene.keys && this.scene.keys.A.isDown)) dx = -1;
    else if ((this.scene.cursors && this.scene.cursors.right.isDown) || (this.scene.keys && this.scene.keys.D.isDown)) dx = 1;
    else if ((this.scene.cursors && this.scene.cursors.up.isDown) || (this.scene.keys && this.scene.keys.W.isDown)) dy = -1;
    else if ((this.scene.cursors && this.scene.cursors.down.isDown) || (this.scene.keys && this.scene.keys.S.isDown)) dy = 1;

    if (dx !== 0 || dy !== 0) {
      this.tryMove(dx, dy);
    }
  }

  tryMove(dx, dy) {
    const rx = this.currentRoom.x;
    const ry = this.currentRoom.y;
    const roomKey = `${rx},${ry}`;
    const room = this.scene.rooms[roomKey];

    if (!room || !room.solved) {
      return this.moveWithinRoom(dx, dy);
    }
    this.moveWithinRoom(dx, dy, true);
  }

  moveWithinRoom(dx, dy, allowPassages = false) {
    const rx = this.currentRoom.x;
    const ry = this.currentRoom.y;

    const localCol = Math.round(
      (this.scene.player.x - rx * ROOM_SIZE * TILE_SIZE - TILE_SIZE / 2) / TILE_SIZE
    );
    const localRow = Math.round(
      (this.scene.player.y - ry * ROOM_SIZE * TILE_SIZE - TILE_SIZE / 2) / TILE_SIZE
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

    const { x, y } = this.scene.mapGenerator.getTileCenter(rx, ry, targetCol, targetRow);
    this.movePlayer(x, y);
  }

  movePlayer(x, y) {
    this.isMoving = true;
    this.scene.tweens.add({
      targets: this.scene.player,
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
    const prevRoom = this.scene.rooms[prevRoomKey];

    // Clear any selected puzzle tile when changing rooms
    if (this.scene.selectedTile) {
      this.scene.puzzleSystem.highlightTile(this.scene.selectedTile, false);
      this.scene.selectedTile = null;
    }

    // update current room
    this.currentRoom.x += dx;
    this.currentRoom.y += dy;

    const newRoomKey = `${this.currentRoom.x},${this.currentRoom.y}`;
    this.scene.mapGenerator.generateRoom(this.currentRoom.x, this.currentRoom.y);
    const newRoom = this.scene.rooms[newRoomKey];

    const { x, y } = this.scene.mapGenerator.getTileCenter(this.currentRoom.x, this.currentRoom.y, newCol, newRow);
    this.movePlayer(x, y);

    this.scene.minimapUI.updateMinimap();

    // === ROOM TRANSITION EFFECT ===
    if (prevRoom) {
      // fade out floors + puzzle tiles
      if (prevRoom.floors && prevRoom.floors.getChildren) {
        [...prevRoom.floors.getChildren(), ...prevRoom.puzzleTiles].forEach(obj => {
          if (obj && obj.setAlpha) {
            this.scene.tweens.add({
              targets: obj,
              alpha: 0.01,   // keep it ghosted instead of destroying
              duration: 500
            });
          }
        });
      }

      // fade out walls separately - check if walls group exists and has children
      if (prevRoom.walls && prevRoom.walls.getChildren) {
        prevRoom.walls.getChildren().forEach(wall => {
          if (wall && wall.setAlpha) {
            this.scene.tweens.add({
              targets: wall,
              alpha: 0.01,
              duration: 500
            });
          }
        });
      }
    }

    // fade in the new room (restore if ghosted)
    if (newRoom) {
      const newRoomObjects = [];
      if (newRoom.floors && newRoom.floors.getChildren) {
        newRoomObjects.push(...newRoom.floors.getChildren());
      }
      if (newRoom.puzzleTiles && Array.isArray(newRoom.puzzleTiles)) {
        newRoomObjects.push(...newRoom.puzzleTiles);
      }
      if (newRoom.walls && newRoom.walls.getChildren) {
        newRoomObjects.push(...newRoom.walls.getChildren());
      }
      
      newRoomObjects.forEach(obj => {
        if (obj && obj.setAlpha) {
          this.scene.tweens.add({
            targets: obj,
            alpha: 1,
            duration: 500
          });
        }
      });
    }
  }
}
