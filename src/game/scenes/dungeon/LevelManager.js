import { TILE_SIZE, ROOM_SIZE, ROOMS_PER_LEVEL } from './Constants.js';

export class LevelManager {
  constructor(scene) {
    this.scene = scene;
    this.level = 1;
    this.roomsCompleted = 0;
    this.mapLayout = [];
  }

  startLevel() {
    // Stop any existing timer
    if (this.scene.timerSystem) {
      this.scene.timerSystem.stopTimer();
    }

    // reset trackers
    this.scene.clearLevelObjects();
    this.scene.rooms = {};
    this._roomsCompleted = 0; // ensure internal counter reset
    this.mapLayout = this.scene.mapGenerator.generateMapLayout();

    // Clear any selected puzzle tile
    this.scene.selectedTile = null;

    // Generate the starting room
    this.scene.mapGenerator.generateRoom(0, 0);

    // mark starting room as solved (it has no puzzle)
    if (this.scene.rooms && this.scene.rooms["0,0"]) {
      this.scene.rooms["0,0"].solved = true;
    }

    this._roomsCompleted = 1;

    // Player spawn AFTER room is created
    this.scene.playerController.spawnPlayer();

    // Update UI elements (don't recreate them)
    this.scene.minimapUI.updateMinimap();
    
    if (this.scene.timerSystem) {
      // Only update the display if it doesn't exist, otherwise just start
      if (!this.scene.timerSystem.timerText || !this.scene.timerSystem.timerText.active) {
        this.scene.timerSystem.createTimerDisplay(this.scene.sharedLayer);
      }
      this.scene.timerSystem.startTimer();
    }

    // Fade in AFTER everything is set up (this makes the fade purely visual)
    try {
      const cam = this.scene.cameras && this.scene.cameras.main;
      if (cam) {
        cam.fadeIn(300, 0, 0, 0);
      }
    } catch (e) {
      // Fade is optional, ignore errors
    }
  }

  nextLevel() {
    // Stop the timer
    if (this.scene.timerSystem) {
      this.scene.timerSystem.stopTimer();
    }
    
    // close popup if open (safe cleanup)
    if (this.scene.popupContainer) {
      try {
        this.scene.popupContainer.destroy();
      } catch (e) {}
      this.scene.popupContainer = null;
    }
    this.scene.popupOpen = false;

    // Fade out, then clear and start next level
    try {
      this.scene.cameras.main.fadeOut(350, 0, 0, 0);
      this.scene.cameras.main.once("camerafadeoutcomplete", () => {
        // wipe current level objects
        this.scene.clearLevelObjects();

        // increment level and start fresh
        this.level++;
        this.startLevel();

        // Fade back in so player sees the new level
        this.scene.cameras.main.fadeIn(350, 0, 0, 0);

        // Re-enable input/physics just in case
        this.scene.input.enabled = true;
        this.scene.physics.world.resume();
      });
    } catch (e) {
      // fallback if fade fails
      this.scene.clearLevelObjects();
      this.level++;
      this.startLevel();

      this.scene.input.enabled = true;
      this.scene.physics.world.resume();
    }
  }

  clearLevelObjects() {
    // Destroy floors and puzzle tiles from previous rooms
    if (this.scene.rooms) {
      Object.values(this.scene.rooms).forEach(r => {
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
    if (this.scene.walls) {
      try { this.scene.walls.clear(true, true); } catch (e) {}
    }
  }

  get roomsCompleted() {
    return this._roomsCompleted;
  }

  set roomsCompleted(value) {
    this._roomsCompleted = value;
    if (this._roomsCompleted >= ROOMS_PER_LEVEL) {
      this.scene.popupSystem.showLevelCompletePopup();
    }
  }

  get level() {
    return this._level;
  }

  set level(value) {
    this._level = value;
    this.scene.minimapUI.updateMinimap();
  }
}
