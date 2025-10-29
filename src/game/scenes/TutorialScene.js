import { Scene } from 'phaser';
import { GameSettings } from '../dungeon/GameSettings';

export class TutorialScene extends Scene {
  constructor() {
    super('TutorialScene');
  }

  create() {
    this.cameras.main.setBackgroundColor(0x111111);
    const centerX = this.scale.width / 2;
    const centerY = this.scale.height / 2;

    // Title
    this.add.text(centerX, 50, 'Tutorial', {
      fontFamily: 'Arial Black', fontSize: 48, color: '#ffffff',
      stroke: '#000000', strokeThickness: 8, align: 'center'
    }).setOrigin(0.5);

    // Operation Selection Section
    this.add.text(centerX, 120, 'Choose Math Operations', {
      fontFamily: 'Arial Black', fontSize: 24, color: '#ffffff'
    }).setOrigin(0.5);

    // Operations with division as default
    const ops = ['+', '-', '×', '÷'];
    const selected = new Set(['÷']); // Division as default
    const toggleY = 170;
    const spacing = 80;
    const startX = centerX - ((ops.length - 1) * spacing) / 2;
    
    ops.forEach((op, i) => {
      const x = startX + i * spacing;
      const isSelected = selected.has(op);
      const bg = this.add.rectangle(x, toggleY, 60, 60, isSelected ? 0x4caf50 : 0x333333)
        .setOrigin(0.5)
        .setInteractive({ useHandCursor: true });
      
      const label = this.add.text(x, toggleY, op, {
        fontFamily: 'Arial Black', fontSize: 32, color: '#ffffff'
      }).setOrigin(0.5).setInteractive({ useHandCursor: true });

      const toggle = () => {
        if (selected.has(op)) {
          selected.delete(op);
        } else {
          selected.add(op);
        }
        bg.setFillStyle(selected.has(op) ? 0x4caf50 : 0x333333);
      };
      
      bg.on('pointerdown', toggle);
      label.on('pointerdown', toggle);
    });

    // Game Instructions
    const instructionsY = 250;
    this.add.text(centerX, instructionsY, 'Game Instructions', {
      fontFamily: 'Arial Black', fontSize: 24, color: '#ffffff'
    }).setOrigin(0.5);

    const instructions = [
      '• Use WASD or Arrow Keys to move your character',
      '• Navigate through the dungeon to find math puzzles',
      '• Drag puzzle tiles to solve equations (works on mobile!)',
      '• Solve equations to unlock doors and progress',
      '• Complete all rooms before time runs out',
      '• Each correct answer gives you points',
      '• Wrong answers cost time and reduce your score'
    ];

    instructions.forEach((instruction, i) => {
      this.add.text(centerX, instructionsY + 40 + (i * 25), instruction, {
        fontFamily: 'Arial', fontSize: 18, color: '#cccccc'
      }).setOrigin(0.5);
    });

    // Controls Section
    const controlsY = instructionsY + 200;
    this.add.text(centerX, controlsY, 'Controls', {
      fontFamily: 'Arial Black', fontSize: 24, color: '#ffffff'
    }).setOrigin(0.5);

    const controls = [
      'W / ↑ - Move Up',
      'S / ↓ - Move Down', 
      'A / ← - Move Left',
      'D / → - Move Right',
      'Space - Interact with puzzles',
      'ESC - Pause game',
      'Mobile: Use on-screen arrow buttons'
    ];

    controls.forEach((control, i) => {
      this.add.text(centerX, controlsY + 40 + (i * 25), control, {
        fontFamily: 'Arial', fontSize: 18, color: '#cccccc'
      }).setOrigin(0.5);
    });

    // Start Tutorial Button
    const startBtnBg = this.add.rectangle(centerX, centerY + 200, 280, 60, 0x2e7d32)
      .setInteractive({ useHandCursor: true });
    
    const startBtnText = this.add.text(centerX, centerY + 200, 'Start Tutorial', {
      fontFamily: 'Arial Black', fontSize: 28, color: '#ffffff'
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    startBtnBg.on('pointerover', () => startBtnBg.setFillStyle(0x388e3c));
    startBtnBg.on('pointerout', () => startBtnBg.setFillStyle(0x2e7d32));

    const startTutorial = () => {
      // Set the selected operations
      const chosenOps = Array.from(selected);
      GameSettings.setAllowed(chosenOps.length ? chosenOps : ['÷']);
      
      // Set tutorial mode
      GameSettings.setTutorial(true);
      
      // Start the dungeon in tutorial mode
      this.scene.start('Dungeon', { 
        level: 1, 
        tutorial: true,
        role: 'student'
      });
    };

    startBtnBg.on('pointerdown', startTutorial);
    startBtnText.on('pointerdown', startTutorial);

    // Back to Menu Button
    const backBtnBg = this.add.rectangle(centerX, centerY + 280, 200, 50, 0x666666)
      .setInteractive({ useHandCursor: true });
    
    const backBtnText = this.add.text(centerX, centerY + 280, 'Back to Menu', {
      fontFamily: 'Arial Black', fontSize: 22, color: '#ffffff'
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    backBtnBg.on('pointerover', () => backBtnBg.setFillStyle(0x777777));
    backBtnBg.on('pointerout', () => backBtnBg.setFillStyle(0x666666));

    const goBack = () => {
      this.scene.start('MainMenu');
    };

    backBtnBg.on('pointerdown', goBack);
    backBtnText.on('pointerdown', goBack);
  }
}
