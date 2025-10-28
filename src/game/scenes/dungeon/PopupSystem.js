export class PopupSystem {
  constructor(scene) {
    this.scene = scene;
    this.popupOpen = false;
  }

  showLevelCompletePopup() {
    if (this.popupOpen) return;
    this.popupOpen = true;

    // Stop the timer since level is completed
    if (this.scene.timerSystem) {
      this.scene.timerSystem.stopTimer();
    }

    // Transition to LevelComplete scene instead of showing popup
    this.scene.scene.start('LevelComplete', { 
      level: this.scene.levelManager.level 
    });
  }
}
