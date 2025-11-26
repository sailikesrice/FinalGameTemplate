/*
 * Developed @sailikesrice
 */

import { Scene } from "phaser";
import { TILE_SIZE, ROOM_SIZE } from "../dungeon/constants";
import { GameSettings } from "../dungeon/GameSettings";
import { MapGenerator } from "../dungeon/MapGenerator";
import { Room } from "../dungeon/Room";
import { PlayerController } from "../dungeon/PlayerController";
import { PopupUI } from "../dungeon/PopupUI";
import { MobileControls } from "../dungeon/MobileControls";
import { EquationPuzzle } from "../dungeon/EquationPuzzle";
import { DifficultyAlgorithm } from "../dungeon/DifficultyAlgorithm";
import { ButtonBuilder } from "../utils/ButtonBuilder";

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
    if (data && data.studentName) this.registry.set('studentName', data.studentName);
    if (data && data.difficultyAlgorithm) {
      this.difficultyAlgorithm = data.difficultyAlgorithm;
    } else {
      // Create a new difficulty algorithm if not provided
      this.difficultyAlgorithm = new DifficultyAlgorithm();
      this.difficultyAlgorithm.startLevel(this.level);
    }
    
    // Store difficulty rating for adaptive difficulty
    this.difficultyRating = data?.difficultyRating || 1;
    
    // Store previous scene for back button navigation
    this.previousScene = data?.previousScene || 'MainMenu';
  }

  create() {
    // static group used for all walls (so we can clear them easily)
    this.walls = this.physics.add.staticGroup();

    // Ensure player is null on scene start (fresh scene)
    this.player = null;
    this.cursors = null;
    this.keys = null;

    // init helpers
    this.mapGen = new MapGenerator();
    this.playerCtrl = new PlayerController(this);
    this.popup = new PopupUI(this);
    this.mobile = new MobileControls(this);

    // no timer HUD during level; stats collected separately

    // listen for puzzle tile changes
    this.events.on('puzzle-updated', (rx, ry) => this.checkPuzzle(rx, ry));
    
    this.startLevel();

    // mobile controls (only on mobile devices) - ensure they're always visible
    this.mobile.create((dx, dy) => this.tryMove(dx, dy));
    
    // Ensure mobile controls stay visible during gameplay
    // Use delayed call to ensure buttons are fully initialized
    if (this.mobile.isMobile) {
      this.time.delayedCall(100, () => {
        if (this.mobile.buttons && this.mobile.buttons.length > 0) {
          this.mobile.buttons.forEach(btn => {
            if (btn && btn.active !== false) {
              btn.setDepth(10000); // High depth to stay above game elements
              btn.setScrollFactor(0); // Don't scroll with camera
              btn.setVisible(true); // Explicitly visible
              btn.setAlpha(0.85); // Ensure proper alpha
            }
          });
        }
      });
    }

    // Add difficulty indicator for tutorial mode
    if (GameSettings.getTutorial()) {
      this.createDifficultyIndicator();
    }

    // Add back button
    this.createBackButton();
  }

  update() {
    // block input while popup open, while moving, or while spawning
    if ((this.popup && this.popup.open) || 
        (this.playerCtrl && this.playerCtrl.isMoving) || 
        (this.playerCtrl && this.playerCtrl.isSpawning)) return;

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
    // Clear scene walls/floors/tiles

    // reset trackers
    this.clearLevelObjects(); // clears any previous graphics (if exist)
    this.rooms = {};
    this.roomsCompleted = 0;
    // Ensure we start from the spawn room every level
    this.currentRoom = { x: 0, y: 0 };
    this.mapLayout = this.mapGen.generateLayout();
    try {
      console.log('[Dungeon] startLevel:', JSON.stringify({
        level: this.level,
        difficultyRating: this.difficultyRating,
        layoutLen: this.mapLayout ? this.mapLayout.length : 0,
        layout: this.mapLayout
      }));
    } catch (e) { console.log('[Dungeon] startLevel log failed'); }

    // minimap removed

    // generate rooms (first room is start)
    this.generateRoom(0, 0);
    console.log('[Dungeon] generated room 0,0');

    // mark starting room as solved (it has no puzzle)
    this.rooms["0,0"].solved = true;
    this.roomsCompleted++;

    // Player spawn
    this.playerCtrl.spawnAt(0, 0, Math.floor(ROOM_SIZE / 2), Math.floor(ROOM_SIZE / 2));
    const centerCol = Math.floor(ROOM_SIZE / 2);
    const center = this.playerCtrl.getTileCenter(0, 0, centerCol, centerCol);
    try {
      console.log('[Dungeon] spawnAt:', JSON.stringify({
        currentRoom: this.currentRoom,
        playerPos: this.player ? { x: this.player.x, y: this.player.y } : null,
        expectedCenter: center
      }));
    } catch (e) { console.log('[Dungeon] spawnAt log failed'); }

    // mark level start time
    this.levelStartMs = performance.now ? performance.now() : Date.now();

    // Fade in when a level starts (smooth transition)
    try {
      this.cameras.main.fadeIn(300, 0, 0, 0);
    } catch (e) {
      // ignore if camera not available for some reason
    }
  }

  nextLevel(difficultyRating) {
    // Prepare for next level using previous player's difficulty rating
    this.clearLevelObjects();
    this.level++;

    // Update difficulty context
    this.difficultyRating = typeof difficultyRating === 'number' ? difficultyRating : (this.difficultyRating || 1);
    if (this.difficultyAlgorithm && this.difficultyAlgorithm.startLevel) {
      try { this.difficultyAlgorithm.startLevel(this.level); } catch (e) {}
    }

    // Start the new level
    this.startLevel();
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

    // Safety check: ensure room was generated
    if (!newRoom) {
      console.error('[Dungeon] Failed to generate room:', newRoomKey);
      return;
    }

    const { x, y } = this.playerCtrl.getTileCenter(this.currentRoom.x, this.currentRoom.y, newCol, newRow);
    this.playerCtrl.movePlayer(x, y);

    // minimap removed

    // === ROOM TRANSITION EFFECT ===
    if (prevRoom) {
      // fade out floors + puzzle tiles
      try {
        const floors = prevRoom.floors ? prevRoom.floors.getChildren() : [];
        const puzzleTiles = Array.isArray(prevRoom.puzzleTiles) ? prevRoom.puzzleTiles : [];
        [...floors, ...puzzleTiles].forEach(obj => {
          if (obj && typeof obj.setAlpha === 'function' && obj.active !== false) {
            try {
              this.tweens.add({
                targets: obj,
                alpha: 0.01,   // keep it ghosted instead of destroying
                duration: 500
              });
            } catch (e) {
              console.warn('[Dungeon] Error fading out object:', e);
            }
          }
        });

        // fade out walls separately
        if (prevRoom.walls && prevRoom.walls.getChildren) {
          prevRoom.walls.getChildren().forEach(wall => {
            if (wall && typeof wall.setAlpha === 'function' && wall.active !== false) {
              try {
                this.tweens.add({
                  targets: wall,
                  alpha: 0.01,
                  duration: 500
                });
              } catch (e) {
                console.warn('[Dungeon] Error fading out wall:', e);
              }
            }
          });
        }
      } catch (e) {
        console.error('[Dungeon] Error in room transition fade out:', e);
      }
    }

    // fade in the new room (restore if ghosted)
    if (newRoom) {
      try {
        const floors = newRoom.floors ? newRoom.floors.getChildren() : [];
        const puzzleTiles = Array.isArray(newRoom.puzzleTiles) ? newRoom.puzzleTiles : [];
        const walls = newRoom.walls ? newRoom.walls.getChildren() : [];
        [...floors, ...puzzleTiles, ...walls].forEach(obj => {
          if (obj && typeof obj.setAlpha === 'function' && obj.active !== false) {
            try {
              this.tweens.add({
                targets: obj,
                alpha: 1,
                duration: 500
              });
            } catch (e) {
              console.warn('[Dungeon] Error fading in object:', e);
            }
          }
        });
      } catch (e) {
        console.error('[Dungeon] Error in room transition fade in:', e);
      }
    }
  }

  // Puzzle creation now handled by Room -> EquationPuzzle

  // Evaluate candidate arrangement and mark room solved if correct
  checkPuzzle(rx, ry) {
    const roomKey = `${rx},${ry}`;
    const room = this.rooms[roomKey];
    if (!room) return;
    if (room.solved) return;
    if (!Array.isArray(room.puzzleTiles) || room.puzzleTiles.length === 0) return;

    try {
      // Use col-based ordering (robust to tween/position timing)
      const sorted = room.puzzleTiles
        .filter(t => t && t.active !== false && typeof t.getData === 'function')
        .slice()
        .sort((a, b) => {
          try {
            return a.getData('col') - b.getData('col');
          } catch (e) {
            return 0;
          }
        });
      
      // Tiles are text objects, get text directly
      const tokens = sorted.map(t => {
        try {
          if (!t || typeof t.text !== 'string') return '';
          return String(t.text).trim();
        } catch (e) {
          console.warn('[Dungeon] Error extracting token from tile:', e);
          return '';
        }
      }).filter(t => t.length > 0);

      // parse & evaluate
      const valid = EquationPuzzle.evaluateTokens(tokens);

      if (valid) {
        room.solved = true;
        // style solved tiles - color text green
        room.puzzleTiles.forEach(t => {
          try {
            if (t && typeof t.setColor === 'function') {
              t.setColor('#00aa00');
            }
          } catch (e) {
            console.warn('[Dungeon] Error styling puzzle tile:', e);
          }
        });

        // Record correct answer in difficulty algorithm
        if (this.difficultyAlgorithm && typeof this.difficultyAlgorithm.recordAnswer === 'function') {
          this.difficultyAlgorithm.recordAnswer(true);
        }

        this.roomsCompleted++;

        if (this.roomsCompleted >= GameSettings.getRoomsPerLevel()) {
          this.showLevelCompletePopup();
        }
      }
    } catch (e) {
      console.error('[Dungeon] Error in checkPuzzle:', e);
    }
  }

  // Accepts tokens like ["3", "+", "2", "=", "5"]
  // returns true if equation is mathematically correct
  evaluateEquationTokens(tokens) { return EquationPuzzle.evaluateTokens(tokens); }

  // minimap removed

  // ====== POPUP (always on top) ======
  showLevelCompletePopup() {
    // route to stats page with elapsed time
    const end = performance.now ? performance.now() : Date.now();
    const elapsedMs = Math.max(0, Math.floor(end - (this.levelStartMs || end)));
    
    // Calculate performance metrics
    const performanceResult = this.difficultyAlgorithm.calculatePerformance();
    
    // Get session info from registry
    const sessionCode = this.registry.get('sessionCode');
    const studentName = this.registry.get('studentName');
    
    this.scene.start('LevelStats', { 
      elapsedMs, 
      level: this.level,
      performanceResult,
      difficultyAlgorithm: this.difficultyAlgorithm,
      tutorial: GameSettings.getTutorial(),
      sessionCode,
      studentName,
      role: this.registry.get('role'),
      previousScene: this.previousScene || 'MainMenu'
    });
  }
  
  // (Hint button removed)

  // ====== DIFFICULTY INDICATOR ======
  createDifficultyIndicator() {
    const difficultyText = this.add.text(20, 20, `Difficulty: ${this.difficultyRating}`, {
      fontFamily: 'Arial', fontSize: 18, color: '#ff9800',
      resolution: 2,
      backgroundColor: '#000000',
      padding: { left: 8, right: 8, top: 4, bottom: 4 }
    }).setDepth(1000);
  }

  // ====== MOBILE CONTROLS ======
  createMobileControls() { this.mobile.create((dx, dy) => this.tryMove(dx, dy)); }

  // ====== BACK BUTTON ======
  createBackButton() {
    ButtonBuilder.createButton(this, 80, 30, '← Back', {
      fontSize: 18,
      minWidth: 100,
      minHeight: 40,
      depth: 1000,
      scrollFactor: 0,
      onClick: () => {
        this.scene.start(this.previousScene);
      }
    });
  }
}