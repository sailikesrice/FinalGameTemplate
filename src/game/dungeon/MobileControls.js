export class MobileControls {
  constructor(scene) {
    this.scene = scene;
    this.buttons = [];
    this.isMobile = this.detectMobile();
  }

  detectMobile() {
    // Check if device is mobile/tablet
    const isMobileDevice = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    const isSmallScreen = window.innerWidth <= 768;
    
    // Consider it mobile if it's a mobile device OR (has touch AND small screen)
    return isMobileDevice || (isTouchDevice && isSmallScreen);
  }

  create(onMove) {
    // Only create controls on mobile devices
    if (!this.isMobile) {
      return;
    }

    // Clean up any existing buttons
    this.destroy();

    // Responsive button sizing based on screen size
    const screenWidth = this.scene.scale.width;
    const screenHeight = this.scene.scale.height;
    // Smaller button sizes
    const btnSize = screenWidth < 400 ? 45 : 50;
    const spacing = screenWidth < 400 ? 60 : 65;
    // Position buttons higher up on screen, leaving space at bottom for safe area
    const safeAreaBottom = 20; // Space for device safe area (notches, etc)
    const margin = screenWidth < 400 ? 100 : 120; // Increased margin to place buttons higher
    const bottom = screenHeight - margin - safeAreaBottom;
    const centerX = screenWidth / 2;

    const makeArrowButton = (x, y, texture, pressedTexture, callback) => {
      // Check if texture exists, if not create a fallback
      if (!this.scene.textures.exists(texture)) {
        console.warn(`Texture ${texture} not found, creating fallback`);
        // Create a simple colored rectangle as fallback
        const graphics = this.scene.add.graphics();
        graphics.fillStyle(0xffffff, 0.8);
        graphics.fillRect(0, 0, btnSize, btnSize);
        graphics.lineStyle(2, 0x000000, 1);
        graphics.strokeRect(0, 0, btnSize, btnSize);
        graphics.generateTexture(texture, btnSize, btnSize);
        graphics.destroy();
      }
      
      const btn = this.scene.add.image(x, y, texture)
        .setInteractive({ useHandCursor: false, pixelPerfect: false })
        .setScrollFactor(0)
        .setDisplaySize(btnSize, btnSize)
        .setDepth(10000) // High depth to ensure visibility
        .setAlpha(0.9)
        .setVisible(true)
        .setOrigin(0.5);
      
      // Store pressed texture for visual feedback
      btn.pressedTexture = pressedTexture;
      btn.normalTexture = texture;
      
      // Add touch feedback for better mobile UX
      btn.on('pointerdown', () => {
        btn.setAlpha(1);
        // Keep constant size - no scaling on press
        btn.setScale(1);
        // Switch to pressed texture if available
        if (pressedTexture && this.scene.textures.exists(pressedTexture)) {
          btn.setTexture(pressedTexture);
        }
        callback();
      });
      
      btn.on('pointerup', () => {
        btn.setAlpha(0.9);
        btn.setScale(1);
        // Switch back to normal texture
        if (btn.normalTexture) {
          btn.setTexture(btn.normalTexture);
        }
      });
      
      btn.on('pointerout', () => {
        btn.setAlpha(0.9);
        btn.setScale(1);
        // Switch back to normal texture
        if (btn.normalTexture) {
          btn.setTexture(btn.normalTexture);
        }
      });
      
      // Ensure button stays visible even when camera moves
      btn.setScrollFactor(0);

      this.buttons.push(btn);
      return btn;
    };

    // Create D-pad style layout
    // Up
    makeArrowButton(centerX, bottom - spacing, 'up-arrow', 'up-arrow-pressed', () => {
      if (this.scene.playerCtrl && !this.scene.playerCtrl.isSpawning && !this.scene.playerCtrl.isMoving) {
        onMove(0, -1);
      }
    });
    
    // Down
    makeArrowButton(centerX, bottom + spacing, 'down-arrow', 'down-arrow-pressed', () => {
      if (this.scene.playerCtrl && !this.scene.playerCtrl.isSpawning && !this.scene.playerCtrl.isMoving) {
        onMove(0, 1);
      }
    });
    
    // Left
    makeArrowButton(centerX - spacing, bottom, 'left-arrow', 'left-arrow-pressed', () => {
      if (this.scene.playerCtrl && !this.scene.playerCtrl.isSpawning && !this.scene.playerCtrl.isMoving) {
        onMove(-1, 0);
      }
    });
    
    // Right
    makeArrowButton(centerX + spacing, bottom, 'right-arrow', 'right-arrow-pressed', () => {
      if (this.scene.playerCtrl && !this.scene.playerCtrl.isSpawning && !this.scene.playerCtrl.isMoving) {
        onMove(1, 0);
      }
    });
  }

  destroy() {
    // Clean up all buttons
    this.buttons.forEach(btn => {
      if (btn && btn.destroy) {
        btn.destroy();
      }
    });
    this.buttons = [];
  }

  setVisible(visible) {
    this.buttons.forEach(btn => {
      if (btn) {
        btn.setVisible(visible);
      }
    });
  }
}
