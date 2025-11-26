import { Scene } from 'phaser';
import { GameSettings } from '../dungeon/GameSettings';
import { DifficultyAlgorithm } from '../dungeon/DifficultyAlgorithm';
import { ButtonBuilder } from '../utils/ButtonBuilder';
import { CardBuilder } from '../utils/CardBuilder';

export class TutorialScene extends Scene {
  constructor() {
    super('TutorialScene');
    this.difficultyAlgorithm = new DifficultyAlgorithm();
  }

  create() {
    this.cameras.main.setBackgroundColor(0x111111);
    const centerX = this.scale.width / 2;
    const centerY = this.scale.height / 2;

    // Detect mobile for responsive layout
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || 
                     ('ontouchstart' in window || navigator.maxTouchPoints > 0) && window.innerWidth <= 768;
    
    // Title - responsive font size
    const titleFontSize = isMobile ? 36 : 48;
    this.add.text(centerX, isMobile ? 40 : 50, 'Tutorial', {
      fontFamily: 'Arial', fontSize: titleFontSize, color: '#ffffff',
      resolution: 2,
      stroke: '#000000', strokeThickness: isMobile ? 6 : 8, align: 'center'
    }).setOrigin(0.5);

    // Operation Selection Section - responsive font size
    const subtitleFontSize = isMobile ? 20 : 24;
    this.add.text(centerX, isMobile ? 100 : 120, 'Choose Math Operations', {
      fontFamily: 'Arial', fontSize: subtitleFontSize, color: '#ffffff',
      resolution: 2
    }).setOrigin(0.5);

    // Operations with division as default
    const ops = ['+', '-', '×', '÷'];
    const selected = new Set(['÷']); // Division as default
    const toggleY = isMobile ? 150 : 170;
    const spacing = isMobile ? 60 : 80;
    const btnSize = isMobile ? 50 : 60;
    const startX = centerX - ((ops.length - 1) * spacing) / 2;
    
    ops.forEach((op, i) => {
      const x = startX + i * spacing;
      const isSelected = selected.has(op);
      
      // Use number-box image instead of rectangle
      const bg = this.add.image(x, toggleY, 'number-box')
        .setDisplaySize(btnSize, btnSize)
        .setOrigin(0.5)
        .setInteractive({ useHandCursor: true });
      
      // Tint based on selection state
      if (isSelected) {
        bg.setTint(0x4caf50);
      } else {
        bg.clearTint();
      }
      
      const labelFontSize = isMobile ? 26 : 32;
      const label = this.add.text(x, toggleY, op, {
        fontFamily: 'Arial', fontSize: labelFontSize, color: '#ffffff',
        resolution: 2
      }).setOrigin(0.5).setInteractive({ useHandCursor: true });

      const toggle = () => {
        if (selected.has(op)) {
          selected.delete(op);
        } else {
          selected.add(op);
        }
        // Update tint based on selection
        if (selected.has(op)) {
          bg.setTint(0x4caf50);
        } else {
          bg.clearTint();
        }
      };
      
      bg.on('pointerdown', toggle);
      label.on('pointerdown', toggle);
    });

    // Game Instructions Card
    const instructions = [
      '• Use WASD or Arrow Keys to move your character',
      '• Navigate through the dungeon to find math puzzles',
      '• Drag puzzle tiles to solve equations (works on mobile!)',
      '• Solve equations to unlock doors and progress',
      '• Complete all rooms before time runs out',
      '• Each correct answer gives you points',
      '• Wrong answers cost time and reduce your score'
    ];

    // Responsive card sizing
    const cardSpacing = isMobile ? 30 : 30; // Increased spacing for desktop
    const cardWidth = isMobile ? Math.min(this.scale.width - 40, 400) : Math.min((this.scale.width - cardSpacing - 80) / 2, 450);
    const fontSize = isMobile ? 16 : 18;
    
    // Stack cards vertically on mobile, side-by-side on desktop
    // Position cards lower to avoid overlapping with operation buttons
    let cardsY = isMobile ? 300 : 340;
    
    // Calculate card positions for desktop (side-by-side)
    const instructionsCardX = isMobile ? centerX : centerX - (cardWidth + cardSpacing) / 2;
    
    const instructionsCard = CardBuilder.createCard(this, instructionsCardX, cardsY, [
      'Game Instructions',
      '',
      ...instructions
    ], {
      fontSize: fontSize,
      padding: { x: isMobile ? 20 : 25, y: isMobile ? 12 : 15 },
      minWidth: cardWidth,
      maxWidth: cardWidth,
      align: 'center',
      lineSpacing: isMobile ? 5 : 6
    });

    // Controls Section Card
    const controls = [
      'W / ↑ - Move Up',
      'S / ↓ - Move Down', 
      'A / ← - Move Left',
      'D / → - Move Right',
      'Space - Interact with puzzles',
      'ESC - Pause game',
      'Mobile: Use on-screen arrow buttons'
    ];

    // Position second card below first on mobile, beside on desktop
    const controlsCardY = isMobile ? cardsY + instructionsCard.height / 2 + cardSpacing + 50 : cardsY;
    const controlsCardX = isMobile ? centerX : centerX + (cardWidth + cardSpacing) / 2;

    const controlsCard = CardBuilder.createCard(this, controlsCardX, controlsCardY, [
      'Controls',
      '',
      ...controls
    ], {
      fontSize: fontSize,
      padding: { x: isMobile ? 20 : 25, y: isMobile ? 12 : 15 },
      minWidth: cardWidth,
      maxWidth: cardWidth,
      align: 'center',
      lineSpacing: isMobile ? 5 : 6
    });

    // Start Tutorial Button
    const startTutorial = () => {
      // Set the selected operations
      const chosenOps = Array.from(selected);
      GameSettings.setAllowed(chosenOps.length ? chosenOps : ['÷']);
      
      // Set tutorial mode with 6 rooms
      GameSettings.setTutorial(true);
      GameSettings.setRoomsPerLevel(6);
      
      // Initialize difficulty algorithm for tutorial
      this.difficultyAlgorithm.startLevel(1);
      
      // Start the dungeon in tutorial mode
      this.scene.start('Dungeon', { 
        level: 1, 
        tutorial: true,
        role: 'student',
        difficultyAlgorithm: this.difficultyAlgorithm,
        previousScene: 'TutorialScene'
      });
    };

    // Calculate Y position for buttons based on card height
    const maxCardHeight = isMobile ? 
      (instructionsCard.height + controlsCard.height + cardSpacing) : 
      Math.max(instructionsCard.height, controlsCard.height);
    const buttonsY = (isMobile ? controlsCardY : cardsY) + (isMobile ? controlsCard.height / 2 : maxCardHeight / 2) + (isMobile ? 50 : 60);

    ButtonBuilder.createButton(this, centerX, buttonsY, 'Start Tutorial', {
      fontSize: 28,
      onClick: startTutorial
    });

    // Back to Menu Button
    ButtonBuilder.createButton(this, centerX, buttonsY + 80, 'Back to Menu', {
      fontSize: 22,
      minHeight: 50,
      onClick: () => {
        this.scene.start('MainMenu');
      }
    });
  }
}
