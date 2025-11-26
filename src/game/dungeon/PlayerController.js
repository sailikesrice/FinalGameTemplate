import { TILE_SIZE, ROOM_SIZE } from './constants';

export class PlayerController {
  constructor(scene) {
    this.scene = scene;
    this.isMoving = false;
    this.moveDelay = 150;
    this.facingDirection = 'right'; // Track which direction player is facing (left or right)
    this.lastHorizontalMove = 'right'; // Track last horizontal movement for up/down facing
    this.isSpawning = false; // Track if player is currently spawning
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
    this.scene.player = this.scene.physics.add.sprite(x, y, 'player-spawn1');
    this.scene.player.setDisplaySize(TILE_SIZE * 0.7, TILE_SIZE * 0.7);
    this.scene.player.setDepth(9999);
    this.scene.physics.add.collider(this.scene.player, this.scene.walls);
    
    // Create animations
    this.createAnimations();
    
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
    
    // Play spawn animation and block movement for 1 second
    this.playSpawnAnimation();
    
    console.log('[PlayerController] player created at', { x, y, cameraX: this.scene.cameras.main.x, cameraY: this.scene.cameras.main.y });
  }

  createAnimations() {
    // Spawn animation
    if (!this.scene.anims.exists('spawn')) {
      this.scene.anims.create({
        key: 'spawn',
        frames: [
          { key: 'player-spawn1' },
          { key: 'player-spawn2' },
          { key: 'player-spawn3' },
          { key: 'player-spawn4' },
          { key: 'player-spawn5' },
          { key: 'player-spawn6' }
        ],
        frameRate: 6, // 6 frames over 1 second = 6 fps
        repeat: 0 // Play once, don't repeat
      });
    }

    // Idle animations
    if (!this.scene.anims.exists('idle-left')) {
      this.scene.anims.create({
        key: 'idle-left',
        frames: [
          { key: 'playeridle-left1' },
          { key: 'playeridle-left2' },
          { key: 'playeridle-left3' }
        ],
        frameRate: 6,
        repeat: -1
      });
    }

    if (!this.scene.anims.exists('idle-right')) {
      this.scene.anims.create({
        key: 'idle-right',
        frames: [
          { key: 'playeridle-right1' },
          { key: 'playeridle-right2' },
          { key: 'playeridle-right3' }
        ],
        frameRate: 6,
        repeat: -1
      });
    }

    // Move animations (left)
    if (!this.scene.anims.exists('move-left')) {
      this.scene.anims.create({
        key: 'move-left',
        frames: [
          { key: 'playermove-left1' },
          { key: 'playermove-left2' },
          { key: 'playermove-left3' },
          { key: 'playermove-left4' }
        ],
        frameRate: 10,
        repeat: -1
      });
    }

    // Move animations (right)
    if (!this.scene.anims.exists('move-right')) {
      this.scene.anims.create({
        key: 'move-right',
        frames: [
          { key: 'playermove-right1' },
          { key: 'playermove-right2' },
          { key: 'playermove-right3' },
          { key: 'playermove-right4' }
        ],
        frameRate: 10,
        repeat: -1
      });
    }

    // Up/Down animations (using move1 based on facing direction)
    if (!this.scene.anims.exists('move-up-left')) {
      this.scene.anims.create({
        key: 'move-up-left',
        frames: [{ key: 'playermove-left1' }],
        frameRate: 10,
        repeat: -1
      });
    }

    if (!this.scene.anims.exists('move-up-right')) {
      this.scene.anims.create({
        key: 'move-up-right',
        frames: [{ key: 'playermove-right1' }],
        frameRate: 10,
        repeat: -1
      });
    }

    if (!this.scene.anims.exists('move-down-left')) {
      this.scene.anims.create({
        key: 'move-down-left',
        frames: [{ key: 'playermove-left1' }],
        frameRate: 10,
        repeat: -1
      });
    }

    if (!this.scene.anims.exists('move-down-right')) {
      this.scene.anims.create({
        key: 'move-down-right',
        frames: [{ key: 'playermove-right1' }],
        frameRate: 10,
        repeat: -1
      });
    }
  }

  playSpawnAnimation() {
    // Block movement during spawn
    this.isSpawning = true;
    
    // Play spawn animation
    this.scene.player.play('spawn');
    
    // After 1 second (1000ms), allow movement and switch to idle
    this.scene.time.delayedCall(1000, () => {
      this.isSpawning = false;
      // Transition to idle animation
      if (this.facingDirection === 'left') {
        this.scene.player.play('idle-left', true);
      } else {
        this.scene.player.play('idle-right', true);
      }
    });
  }

  tryMove(dx, dy, allowPassages, currentRoom, rooms, onEnterRoom, onMoveComplete) {
    // Block movement if player is spawning
    if (this.isSpawning) {
      return;
    }
    
    const rx = currentRoom.x;
    const ry = currentRoom.y;

    const localCol = Math.round((this.scene.player.x - rx * ROOM_SIZE * TILE_SIZE - TILE_SIZE / 2) / TILE_SIZE);
    const localRow = Math.round((this.scene.player.y - ry * ROOM_SIZE * TILE_SIZE - TILE_SIZE / 2) / TILE_SIZE);

    const targetCol = localCol + dx;
    const targetRow = localRow + dy;
    const center = Math.floor(ROOM_SIZE / 2);

    // Update facing direction and play appropriate animation
    if (dx < 0) {
      // Moving left
      this.facingDirection = 'left';
      this.lastHorizontalMove = 'left';
      this.scene.player.play('move-left', true);
    } else if (dx > 0) {
      // Moving right
      this.facingDirection = 'right';
      this.lastHorizontalMove = 'right';
      this.scene.player.play('move-right', true);
    } else if (dy < 0) {
      // Moving up - use move1 based on facing direction
      if (this.lastHorizontalMove === 'left') {
        this.scene.player.play('move-up-left', true);
      } else {
        this.scene.player.play('move-up-right', true);
      }
    } else if (dy > 0) {
      // Moving down - use move1 based on facing direction
      if (this.lastHorizontalMove === 'left') {
        this.scene.player.play('move-down-left', true);
      } else {
        this.scene.player.play('move-down-right', true);
      }
    }

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
        // Play idle animation when movement stops
        if (this.facingDirection === 'left') {
          this.scene.player.play('idle-left', true);
        } else {
          this.scene.player.play('idle-right', true);
        }
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


