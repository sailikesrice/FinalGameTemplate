import { Scene } from 'phaser';

export class LevelComplete extends Scene {
  constructor() {
    super('LevelComplete');
  }

  init(data) {
    // Receive level data from the previous scene
    this.level = data.level || 1;
  }

  create() {
    // Get camera dimensions
    const { width, height } = this.cameras.main;
    
    // Create a dark background
    this.add.rectangle(width / 2, height / 2, width, height, 0x000000);
    
    // Level completion title
    const title = this.add.text(width / 2, height / 2 - 100, `Level ${this.level} Cleared!`, {
      fontSize: '48px',
      fontFamily: 'Arial',
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 4
    }).setOrigin(0.5);
    
    // Congratulatory message
    const message = this.add.text(width / 2, height / 2 - 50, 'Great job! You solved all the puzzles!', {
      fontSize: '24px',
      fontFamily: 'Arial',
      color: '#cccccc'
    }).setOrigin(0.5);
    
    // Next level button
    const nextButton = this.add.rectangle(width / 2, height / 2 + 50, 250, 60, 0x008000)
      .setStrokeStyle(3, 0xffffff)
      .setInteractive({ useHandCursor: true });
    
    const nextText = this.add.text(width / 2, height / 2 + 50, 'Next Level ▶', {
      fontSize: '24px',
      fontFamily: 'Arial',
      color: '#ffffff',
      fontStyle: 'bold'
    }).setOrigin(0.5);
    
    // Main menu button
    const menuButton = this.add.rectangle(width / 2, height / 2 + 130, 200, 50, 0x666666)
      .setStrokeStyle(2, 0xffffff)
      .setInteractive({ useHandCursor: true });
    
    const menuText = this.add.text(width / 2, height / 2 + 130, 'Main Menu', {
      fontSize: '20px',
      fontFamily: 'Arial',
      color: '#ffffff'
    }).setOrigin(0.5);
    
    // Button hover effects
    nextButton.on('pointerover', () => {
      nextButton.setFillStyle(0x00aa00);
      nextButton.setScale(1.05);
    });
    
    nextButton.on('pointerout', () => {
      nextButton.setFillStyle(0x008000);
      nextButton.setScale(1);
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
    const goToNextLevel = () => {
      console.log('Next level button clicked, current level:', this.level);
      // Fade out effect
      this.cameras.main.fadeOut(500, 0, 0, 0);
      this.cameras.main.once('camerafadeoutcomplete', () => {
        console.log('Launching fresh dungeon scene with level:', this.level + 1);
        // Stop current scenes and launch fresh dungeon
        this.scene.stop('Dungeon');
        this.scene.stop('LevelComplete');
        this.scene.launch('Dungeon', { 
          nextLevel: true,
          level: this.level + 1 
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
    
    nextButton.on('pointerdown', goToNextLevel);
    nextText.on('pointerdown', goToNextLevel);
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
  }
}
