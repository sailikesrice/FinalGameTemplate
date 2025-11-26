/**
 * ButtonBuilder - Utility for creating buttons using 9-slice button assets
 * Automatically sizes buttons based on text length
 */

export class ButtonBuilder {
  /**
   * Create a button with 9-slice assets that automatically sizes to text
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
      textColor = '#2c2c2c',
      padding = { x: 30, y: 15 },
      minWidth = 120,
      minHeight = 50,
      onClick = null,
      depth = 1000,
      scrollFactor = 0
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

    // Slice size (assuming button pieces are 32x32)
    const sliceSize = 32;
    const centerWidth = Math.max(0, buttonWidth - sliceSize * 2);
    const centerHeight = Math.max(0, buttonHeight - sliceSize * 2);

    // Create container for button
    const container = scene.add.container(x, y);
    container.setDepth(depth);
    container.setScrollFactor(scrollFactor);

    const pieces = [];
    const halfW = buttonWidth / 2;
    const halfH = buttonHeight / 2;

    // Top-left corner
    const topLeft = scene.add.image(-halfW, -halfH, 'topleft-button');
    topLeft.setOrigin(0, 0);
    container.add(topLeft);
    pieces.push(topLeft);

    // Top edge (stretch to fill)
    if (centerWidth > 0) {
      const top = scene.add.image(0, -halfH, 'top-button');
      top.setOrigin(0.5, 0);
      top.setDisplaySize(centerWidth, sliceSize);
      container.add(top);
      pieces.push(top);
    }

    // Top-right corner
    const topRight = scene.add.image(halfW, -halfH, 'topright-button');
    topRight.setOrigin(1, 0);
    container.add(topRight);
    pieces.push(topRight);

    // Left edge (stretch to fill)
    if (centerHeight > 0) {
      const left = scene.add.image(-halfW, 0, 'left-button');
      left.setOrigin(0, 0.5);
      left.setDisplaySize(sliceSize, centerHeight);
      container.add(left);
      pieces.push(left);
    }

    // Center (use middle-button as fill)
    if (centerWidth > 0 && centerHeight > 0) {
      const center = scene.add.image(0, 0, 'middle-button');
      center.setOrigin(0.5, 0.5);
      center.setDisplaySize(centerWidth, centerHeight);
      container.add(center);
      pieces.push(center);
    }

    // Right edge (stretch to fill)
    if (centerHeight > 0) {
      const right = scene.add.image(halfW, 0, 'right-button');
      right.setOrigin(1, 0.5);
      right.setDisplaySize(sliceSize, centerHeight);
      container.add(right);
      pieces.push(right);
    }

    // Bottom-left corner
    const bottomLeft = scene.add.image(-halfW, halfH, 'bottomleft-button');
    bottomLeft.setOrigin(0, 1);
    container.add(bottomLeft);
    pieces.push(bottomLeft);

    // Bottom edge (stretch to fill)
    if (centerWidth > 0) {
      const bottom = scene.add.image(0, halfH, 'bottom-button');
      bottom.setOrigin(0.5, 1);
      bottom.setDisplaySize(centerWidth, sliceSize);
      container.add(bottom);
      pieces.push(bottom);
    }

    // Bottom-right corner
    const bottomRight = scene.add.image(halfW, halfH, 'bottomright-button');
    bottomRight.setOrigin(1, 1);
    container.add(bottomRight);
    pieces.push(bottomRight);

    // Add text
    const buttonText = scene.add.text(0, 0, text, {
      fontFamily,
      fontSize,
      color: textColor,
      resolution: 2
    });
    buttonText.setOrigin(0.5);
    container.add(buttonText);

    // Make container interactive
    container.setSize(buttonWidth, buttonHeight);
    container.setInteractive({ useHandCursor: true });

    // Add hover effects
    container.on('pointerover', () => {
      container.setScale(1.05);
    });

    container.on('pointerout', () => {
      container.setScale(1);
    });

    // Add click handler
    if (onClick) {
      container.on('pointerdown', onClick);
      buttonText.setInteractive({ useHandCursor: true });
      buttonText.on('pointerdown', onClick);
    }

    return {
      container,
      text: buttonText,
      pieces,
      width: buttonWidth,
      height: buttonHeight
    };
  }
}

