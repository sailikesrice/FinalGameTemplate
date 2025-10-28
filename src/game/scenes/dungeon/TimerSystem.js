export class TimerSystem {
  constructor(scene) {
    this.scene = scene;
    this.timeLeft = 60; // 1 minute in seconds
    this.timerEvent = null;
    this.timerText = null;
    this.isRunning = false;
  }

  startTimer() {
    if (this.isRunning) return;
    
    this.isRunning = true;
    this.timeLeft = 60;
    
    // Ensure timer display exists and is visible
    if (!this.timerText || !this.timerText.active) {
      this.createTimerDisplay();
    }
    
    // Make sure the timer text is visible and fully opaque
    if (this.timerText) {
      this.timerText.setVisible(true);
      this.timerText.setAlpha(1);
      this.timerText.setDepth(1000);
    }
    
    this.updateTimerDisplay();
    
    // Start the countdown
    if (this.scene.time) {
      this.timerEvent = this.scene.time.addEvent({
        delay: 1000,
        callback: this.tick,
        callbackScope: this,
        loop: true
      });
    }
  }

  stopTimer() {
    if (!this.isRunning) return;
    
    this.isRunning = false;
    if (this.timerEvent) {
      this.timerEvent.destroy();
      this.timerEvent = null;
    }
    
    // Don't destroy the timer text, just hide it
    if (this.timerText) {
      this.timerText.setVisible(false);
    }
  }

  resetTimer() {
    this.stopTimer();
    this.timeLeft = 60;
    this.startTimer();
  }

  tick() {
    this.timeLeft--;
    this.updateTimerDisplay();
    
    if (this.timeLeft <= 0) {
      this.timeUp();
    }
  }

  timeUp() {
    this.stopTimer();
    console.log('Time up! Game over.');
    // Transition to game over scene
    this.scene.scene.start('GameOver', { 
      reason: 'timeout',
      level: this.scene.levelManager.level 
    });
  }

  createTimerDisplay(layer = null) {
    // Remove old timer text if it exists
    if (this.timerText) this.timerText.destroy();

    const cam = this.scene.cameras.main;

    // 🩵 Anchor directly to the top-right of the camera view
    this.timerText = this.scene.add.text(
      cam.width - 30,  // no scrollX
      20,              // no scrollY
      this.formatTime(this.timeLeft),
      {
        fontSize: "32px",
        fontFamily: "Arial",
        fill: "#ffffff",
        stroke: "#000000",
        strokeThickness: 4,
      }
    )
      .setOrigin(1, 0)
      .setScrollFactor(0)
      .setDepth(100)
      .setVisible(true);

    // Add to layer if provided
    if (layer) layer.add(this.timerText);

    // Debug check (optional)
    this.scene.time.delayedCall(2000, () => {
      console.log("👁 TIMER STILL EXISTS:", this.timerText?.visible, this.timerText?.active);
    });
  }

  updateTimerDisplay() {
    if (this.timerText) {
      this.timerText.setText(this.formatTime(this.timeLeft));
      
      // Change color when time is running low
      if (this.timeLeft <= 10) {
        this.timerText.setColor('#ff0000'); // Red
      } else if (this.timeLeft <= 30) {
        this.timerText.setColor('#ffff00'); // Yellow
      } else {
        this.timerText.setColor('#ffffff'); // White
      }
    }
  }

  formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  }

  getTimeLeft() {
    return this.timeLeft;
  }

  isTimerRunning() {
    return this.isRunning;
  }
}
