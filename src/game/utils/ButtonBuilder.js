/**
 * ButtonBuilder - Utility for creating buttons programmatically
 * Uses green color scheme and creates rounded rectangle buttons
 */

export class ButtonBuilder {
  /**
   * Create a button with a green rounded rectangle background
   * @param {Phaser.Scene} scene - The Phaser scene
   * @param {number} x - X position
   * @param {number} y - Y position
   * @param {string} text - Button text
   * @param {Object} options - Button options
   * @returns {Object} Object with button container, text, and click handler
   */
  static createButton(scene, x, y, text, options = {}) {
    const {
      fontSize = 28,
      fontFamily = 'Arial',
      textColor = '#ffffff',
      padding = { x: 30, y: 15 },
      minWidth = 120,
      minHeight = 50,
      onClick = null,
      depth = 1000,
      scrollFactor = 0,
      backgroundColor = 0x2d8659, // Dark green
      hoverColor = 0x3fb880, // Light green
      borderRadius = 12,
      borderWidth = 3,
      borderColor = 0x1f5d3f // Darker green for border
    } = options;

    // Create text to measure width
    const tempText = scene.add.text(0, 0, text, {
      fontFamily,
      fontSize,
      color: textColor,
      resolution: 2
    });
    const textWidth = tempText.width;
    const textHeight = tempText.height;
    tempText.destroy();

    // Calculate button dimensions
    const buttonWidth = Math.max(minWidth, textWidth + padding.x * 2);
    const buttonHeight = Math.max(minHeight, textHeight + padding.y * 2);

    // Create container for button
    const container = scene.add.container(x, y);
    container.setDepth(depth);
    container.setScrollFactor(scrollFactor);

    // Create graphics for button background
    const graphics = scene.add.graphics();
    
    // Draw button background with rounded corners
    const drawButton = (color, isHover = false) => {
      graphics.clear();
      
      // Draw border/shadow (slightly larger, darker)
      graphics.fillStyle(borderColor, 1);
      graphics.fillRoundedRect(
        -buttonWidth / 2 - borderWidth/2,
        -buttonHeight / 2 - borderWidth/2,
        buttonWidth + borderWidth,
        buttonHeight + borderWidth,
        borderRadius + borderWidth
      );
      
      // Draw main button
      graphics.fillStyle(color, 1);
      graphics.fillRoundedRect(
        -buttonWidth / 2,
        -buttonHeight / 2,
        buttonWidth,
        buttonHeight,
        borderRadius
      );
      
      // Add a subtle highlight on top
      if (!isHover) {
        graphics.fillStyle(0xffffff, 0.15);
        graphics.fillRoundedRect(
          -buttonWidth / 2,
          -buttonHeight / 2,
          buttonWidth,
          buttonHeight / 3,
          { tl: borderRadius, tr: borderRadius, bl: 0, br: 0 }
        );
      }
    };
    
    drawButton(backgroundColor);
    container.add(graphics);

    // Add text
    const buttonText = scene.add.text(0, 0, text, {
      fontFamily,
      fontSize,
      color: textColor,
      resolution: 2,
      fontStyle: 'bold'
    });
    buttonText.setOrigin(0.5);
    container.add(buttonText);

    // Make container interactive
    container.setSize(buttonWidth, buttonHeight);
    container.setInteractive({ useHandCursor: true });

    // Add hover effects
    container.on('pointerover', () => {
      drawButton(hoverColor, true);
      container.setScale(1.05);
    });

    container.on('pointerout', () => {
      drawButton(backgroundColor);
      container.setScale(1);
    });

    // Add pressed effect
    container.on('pointerdown', () => {
      container.setScale(0.98);
      if (onClick) {
        onClick();
      }
    });

    container.on('pointerup', () => {
      if (container.scale === 0.98) {
        container.setScale(1.05);
      }
    });

    return {
      container,
      text: buttonText,
      graphics,
      width: buttonWidth,
      height: buttonHeight
    };
  }
}
