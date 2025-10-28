import { EventBus } from '../EventBus';
import { Scene } from 'phaser';

export class GameOver extends Scene {
  constructor() {
    super('GameOver');
  }

  init(data) {
    // Receive data about why the game ended
    this.reason = data.reason || 'unknown';
    this.level = data.level || 1;
    this.timeout = this.reason === 'timeout';
  }

  create() {
    // Get camera dimensions
    const { width, height } = this.cameras.main;
    
    // Create a dark red background
    this.add.rectangle(width / 2, height / 2, width, height, 0x8B0000);
    
    // Game Over title
    const title = this.add.text(width / 2, height / 2 - 100, 'Game Over', {
      fontSize: '64px',
      fontFamily: 'Arial Black',
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 8
    }).setOrigin(0.5);
    
    // Reason message
    let reasonText = '';
    if (this.reason === 'timeout') {
      reasonText = 'Time\'s up! You ran out of time.';
    } else if (this.reason === 'failed') {
      reasonText = 'You were defeated!';
    } else {
      reasonText = 'Better luck next time!';
    }
    
    const message = this.add.text(width / 2, height / 2 - 30, reasonText, {
      fontSize: '24px',
      fontFamily: 'Arial',
      color: '#cccccc'
    }).setOrigin(0.5);
    
    // Level info
    const levelInfo = this.add.text(width / 2, height / 2 + 10, `Level ${this.level}`, {
      fontSize: '20px',
      fontFamily: 'Arial',
      color: '#aaaaaa'
    }).setOrigin(0.5);
    
    // Restart Level button
    const restartButton = this.add.rectangle(width / 2, height / 2 + 80, 200, 50, 0x008000)
      .setStrokeStyle(3, 0xffffff)
      .setInteractive({ useHandCursor: true });
    
    const restartText = this.add.text(width / 2, height / 2 + 80, 'Restart Level', {
      fontSize: '20px',
      fontFamily: 'Arial',
      color: '#ffffff',
      fontStyle: 'bold'
    }).setOrigin(0.5);
    
    // Main Menu button
    const menuButton = this.add.rectangle(width / 2, height / 2 + 150, 180, 45, 0x666666)
      .setStrokeStyle(2, 0xffffff)
      .setInteractive({ useHandCursor: true });
    
    const menuText = this.add.text(width / 2, height / 2 + 150, 'Main Menu', {
      fontSize: '18px',
      fontFamily: 'Arial',
      color: '#ffffff'
    }).setOrigin(0.5);
    
    // Button hover effects
    restartButton.on('pointerover', () => {
      restartButton.setFillStyle(0x00aa00);
      restartButton.setScale(1.05);
    });
    
    restartButton.on('pointerout', () => {
      restartButton.setFillStyle(0x008000);
      restartButton.setScale(1);
    });
    
    menuButton.on('pointerover', () => {
      menuButton.setFillStyle(0x888888);
      menuButton.setScale(1.05);
    });
    
    menuButton.on('pointerout', () => {
      menuButton.setFillStyle(0x666666);
      menuButton.setScale(1);
    });
    
    // Button functionality
    const restartLevel = () => {
      // Fade out effect
      this.cameras.main.fadeOut(500, 0, 0, 0);
      this.cameras.main.once('camerafadeoutcomplete', () => {
        // Restart the level (level 1 if timeout, otherwise same level)
        this.scene.start('Dungeon', { 
          restartLevel: true,
          level: this.timeout ? 1 : this.level 
        });
      });
    };
    
    const goToMainMenu = () => {
      // Fade out effect
      this.cameras.main.fadeOut(500, 0, 0, 0);
      this.cameras.main.once('camerafadeoutcomplete', () => {
        this.scene.start('MainMenu');
      });
    };
    
    restartButton.on('pointerdown', restartLevel);
    restartText.on('pointerdown', restartLevel);
    menuButton.on('pointerdown', goToMainMenu);
    menuText.on('pointerdown', goToMainMenu);
    
    // Fade in effect when scene loads
    this.cameras.main.fadeIn(500, 0, 0, 0);
    
    // Add some subtle animation to the title
    this.tweens.add({
      targets: title,
      y: title.y - 10,
      duration: 2000,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });

    EventBus.emit('current-scene-ready', this);
  }

  changeScene() {
    this.scene.start('MainMenu');
  }
}
