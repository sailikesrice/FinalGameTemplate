import { Scene } from 'phaser';

export class MainMenu extends Scene {
  constructor() {
    super('MainMenu');
    
    // Default operation settings
    this.operationSettings = {
      addition: true,
      subtraction: true,
      multiplication: true,
      division: true
    };
    
    // Load settings from localStorage
    this.loadSettings();
  }

  create() {
    // Get camera dimensions
    const { width, height } = this.cameras.main;
    
    // Create a dark background
    this.add.rectangle(width / 2, height / 2, width, height, 0x000000);
    
    // Game title
    const title = this.add.text(width / 2, height / 2 - 100, 'Math Dungeon', {
      fontSize: '48px',
      fontFamily: 'Arial',
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 4
    }).setOrigin(0.5);
    
    // Subtitle
    const subtitle = this.add.text(width / 2, height / 2 - 50, 'Solve puzzles to escape!', {
      fontSize: '20px',
      fontFamily: 'Arial',
      color: '#cccccc'
    }).setOrigin(0.5);
    
    // Operation selection section
    this.createOperationSelection(width, height);
    
    // Start button
    const startButton = this.add.rectangle(width / 2, height / 2 + 120, 200, 60, 0x008000)
      .setStrokeStyle(3, 0xffffff)
      .setInteractive({ useHandCursor: true });
    
    const startText = this.add.text(width / 2, height / 2 + 120, 'START GAME', {
      fontSize: '24px',
      fontFamily: 'Arial',
      color: '#ffffff',
      fontStyle: 'bold'
    }).setOrigin(0.5);
    
    // Instructions
    const instructions = this.add.text(width / 2, height / 2 + 200, 
      'Use WASD or Arrow Keys to move\nTap puzzle tiles to rearrange them\nSolve the math equation to proceed!', {
      fontSize: '16px',
      fontFamily: 'Arial',
      color: '#aaaaaa',
      align: 'center'
    }).setOrigin(0.5);
    
    // Button hover effects
    startButton.on('pointerover', () => {
      startButton.setFillStyle(0x00aa00);
      startButton.setScale(1.05);
    });
    
    startButton.on('pointerout', () => {
      startButton.setFillStyle(0x008000);
      startButton.setScale(1);
    });
    
    // Start game functionality
    const startGame = () => {
      // Save settings before starting
      this.saveSettings();
      
      // Fade out effect
      this.cameras.main.fadeOut(500, 0, 0, 0);
      this.cameras.main.once('camerafadeoutcomplete', () => {
        this.scene.start('Dungeon');
      });
    };
    
    startButton.on('pointerdown', startGame);
    startText.on('pointerdown', startGame);
    
    // Fade in effect when menu loads
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

  createOperationSelection(width, height) {
    // Operation selection title
    const operationTitle = this.add.text(width / 2, height / 2 - 10, 'Select Operations:', {
      fontSize: '18px',
      fontFamily: 'Arial',
      color: '#ffffff'
    }).setOrigin(0.5);

    // Operation buttons
    const operations = [
      { key: 'addition', label: '+', color: 0x00aa00 },
      { key: 'subtraction', label: '-', color: 0xaa0000 },
      { key: 'multiplication', label: '×', color: 0x0000aa },
      { key: 'division', label: '÷', color: 0xaa00aa }
    ];

    const buttonSize = 50;
    const spacing = 70;
    const startX = width / 2 - (operations.length * spacing) / 2;

    this.operationButtons = [];

    operations.forEach((op, index) => {
      const x = startX + index * spacing;
      const y = height / 2 + 30;

      // Create button background
      const button = this.add.rectangle(x, y, buttonSize, buttonSize, op.color)
        .setStrokeStyle(3, this.operationSettings[op.key] ? 0xffffff : 0x666666)
        .setInteractive({ useHandCursor: true });

      // Create button text
      const buttonText = this.add.text(x, y, op.label, {
        fontSize: '24px',
        fontFamily: 'Arial',
        color: '#ffffff',
        fontStyle: 'bold'
      }).setOrigin(0.5);

      // Store button reference
      this.operationButtons.push({
        key: op.key,
        button: button,
        text: buttonText,
        color: op.color
      });

      // Button interaction
      const toggleOperation = () => {
        this.operationSettings[op.key] = !this.operationSettings[op.key];
        this.updateButtonAppearance(op.key);
      };

      button.on('pointerdown', toggleOperation);
      buttonText.on('pointerdown', toggleOperation);

      // Hover effects
      button.on('pointerover', () => {
        button.setScale(1.1);
      });

      button.on('pointerout', () => {
        button.setScale(1.0);
      });

      // Initial appearance
      this.updateButtonAppearance(op.key);
    });
  }

  updateButtonAppearance(operationKey) {
    const buttonData = this.operationButtons.find(b => b.key === operationKey);
    if (!buttonData) return;

    const isEnabled = this.operationSettings[operationKey];
    
    buttonData.button.setStrokeStyle(3, isEnabled ? 0xffffff : 0x666666);
    buttonData.button.setAlpha(isEnabled ? 1.0 : 0.5);
    buttonData.text.setAlpha(isEnabled ? 1.0 : 0.5);
  }

  loadSettings() {
    try {
      const saved = localStorage.getItem('mathDungeonSettings');
      if (saved) {
        const parsed = JSON.parse(saved);
        this.operationSettings = { ...this.operationSettings, ...parsed };
      }
    } catch (e) {
      console.log('Could not load settings:', e);
    }
  }

  saveSettings() {
    try {
      localStorage.setItem('mathDungeonSettings', JSON.stringify(this.operationSettings));
    } catch (e) {
      console.log('Could not save settings:', e);
    }
  }

  // Static method to get settings (for use in other scenes)
  static getOperationSettings() {
    try {
      const saved = localStorage.getItem('mathDungeonSettings');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.log('Could not load settings:', e);
    }
    
    // Return defaults
    return {
      addition: true,
      subtraction: true,
      multiplication: true,
      division: true
    };
  }
}
