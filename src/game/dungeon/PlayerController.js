import { TILE_SIZE, ROOM_SIZE } from './constants';

export class PlayerController {
  constructor(scene) {
    this.scene = scene;
    this.isMoving = false;
    this.moveDelay = 150;
  }

  spawnAt(rx, ry, col, row) {
    const { x, y } = this.getTileCenter(rx, ry, col, row);
    console.log('[PlayerController] spawnAt', { rx, ry, col, row, x, y, playerExists: !!this.scene.player });
    
    // Always destroy old player if it exists to ensure fresh start
    if (this.scene.player) {
      try {
        this.scene.player.destroy();
      } catch (e) {}
      this.scene.player = null;
    }
    
    // Create fresh player
    this.scene.player = this.scene.physics.add.sprite(x, y, 'player');
    this.scene.player.setDisplaySize(TILE_SIZE * 0.7, TILE_SIZE * 0.7);
    this.scene.player.setDepth(9999);
    this.scene.physics.add.collider(this.scene.player, this.scene.walls);
    
    // Setup input (recreate to ensure fresh state)
    this.scene.cursors = this.scene.input.keyboard.createCursorKeys();
    this.scene.keys = this.scene.input.keyboard.addKeys('W,A,S,D');
    
    // Setup camera to follow player
    this.scene.cameras.main.stopFollow();
    this.scene.cameras.main.startFollow(this.scene.player, true, 0.1, 0.1);
    this.scene.cameras.main.setZoom(1.25);
    this.scene.cameras.main.setBackgroundColor(0x000000);
    
    // Immediately center camera on player
    this.scene.cameras.main.centerOn(x, y);
    console.log('[PlayerController] player created at', { x, y, cameraX: this.scene.cameras.main.x, cameraY: this.scene.cameras.main.y });
  }

  tryMove(dx, dy, allowPassages, currentRoom, rooms, onEnterRoom, onMoveComplete) {
    const rx = currentRoom.x;
    const ry = currentRoom.y;

    const localCol = Math.round((this.scene.player.x - rx * ROOM_SIZE * TILE_SIZE - TILE_SIZE / 2) / TILE_SIZE);
    const localRow = Math.round((this.scene.player.y - ry * ROOM_SIZE * TILE_SIZE - TILE_SIZE / 2) / TILE_SIZE);

    const targetCol = localCol + dx;
    const targetRow = localRow + dy;
    const center = Math.floor(ROOM_SIZE / 2);

    if (allowPassages) {
      const hasNeighbor = (dx, dy) => {
        const tx = rx + dx;
        const ty = ry + dy;
        const layout = this.scene.mapLayout || [];
        return !!layout.find(r => r.x === tx && r.y === ty);
      };
      if (targetRow === 0 && targetCol === center) {
        if (hasNeighbor(0, -1)) return onEnterRoom(0, -1, center, ROOM_SIZE - 2);
        return; // blocked by wall
      }
      if (targetRow === ROOM_SIZE - 1 && targetCol === center) {
        if (hasNeighbor(0, 1)) return onEnterRoom(0, 1, center, 1);
        return;
      }
      if (targetCol === 0 && targetRow === center) {
        if (hasNeighbor(-1, 0)) return onEnterRoom(-1, 0, ROOM_SIZE - 2, center);
        return;
      }
      if (targetCol === ROOM_SIZE - 1 && targetRow === center) {
        if (hasNeighbor(1, 0)) return onEnterRoom(1, 0, 1, center);
        return;
      }
    }

    if (targetCol <= 0 || targetRow <= 0 || targetCol >= ROOM_SIZE - 1 || targetRow >= ROOM_SIZE - 1) return;

    const { x, y } = this.getTileCenter(rx, ry, targetCol, targetRow);
    this.movePlayer(x, y, onMoveComplete);
  }

  movePlayer(x, y, onComplete) {
    this.isMoving = true;
    this.scene.tweens.add({
      targets: this.scene.player,
      x,
      y,
      duration: this.moveDelay,
      onComplete: () => {
        this.isMoving = false;
        if (onComplete) onComplete();
      }
    });
  }

  getTileCenter(rx, ry, col, row) {
    const x = rx * ROOM_SIZE * TILE_SIZE + col * TILE_SIZE + TILE_SIZE / 2;
    const y = ry * ROOM_SIZE * TILE_SIZE + row * TILE_SIZE + TILE_SIZE / 2;
    return { x, y };
  }
}


