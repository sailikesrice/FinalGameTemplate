/**
 * CardBuilder - Utility for creating text cards using 9-slice card assets
 * Automatically sizes cards based on text content
 */

export class CardBuilder {
  /**
   * Create a card with 9-slice assets that automatically sizes to text content
   * @param {Phaser.Scene} scene - The Phaser scene
   * @param {number} x - X position
   * @param {number} y - Y position
   * @param {string|Array} content - Text content (string or array of strings for multi-line)
   * @param {Object} options - Card options
   * @returns {Object} Object with card container, text objects, and dimensions
   */
  static createCard(scene, x, y, content, options = {}) {
    const {
      fontSize = 18,
      fontFamily = 'Arial',
      textColor = '#ffffff',
      padding = { x: 20, y: 15 },
      minWidth = 200,
      minHeight = 50,
      maxWidth = null,
      lineSpacing = 5,
      depth = 100,
      scrollFactor = 0,
      align = 'left' // 'left', 'center', 'right'
    } = options;

    // Convert content to array if it's a string
    const lines = Array.isArray(content) ? content : [content];

    // Create temporary text objects to measure dimensions
    const tempTexts = lines.map(line => 
      scene.add.text(0, 0, line, {
        fontFamily,
        fontSize,
        color: textColor,
        resolution: 2,
        wordWrap: maxWidth ? { width: maxWidth - padding.x * 2 } : null
      })
    );
    
    // Calculate total dimensions
    let maxLineWidth = 0;
    let totalHeight = 0;
    
    tempTexts.forEach((text, i) => {
      const width = text.width;
      const height = text.height;
      maxLineWidth = Math.max(maxLineWidth, width);
      if (i > 0) totalHeight += lineSpacing;
      totalHeight += height;
    });
    
    // Clean up temp texts
    tempTexts.forEach(text => text.destroy());

    // Calculate card dimensions
    let cardWidth = Math.max(minWidth, maxLineWidth + padding.x * 2);
    // Enforce maxWidth if provided
    if (maxWidth !== null) {
      cardWidth = Math.min(cardWidth, maxWidth);
    }
    const cardHeight = Math.max(minHeight, totalHeight + padding.y * 2);

    // Slice size (assuming card pieces are 32x32)
    const sliceSize = 32;
    const centerWidth = Math.max(0, cardWidth - sliceSize * 2);
    const centerHeight = Math.max(0, cardHeight - sliceSize * 2);

    // Create container for card
    const container = scene.add.container(x, y);
    container.setDepth(depth);
    container.setScrollFactor(scrollFactor);

    const pieces = [];
    const halfW = cardWidth / 2;
    const halfH = cardHeight / 2;

    // Top-left corner
    const topLeft = scene.add.image(-halfW, -halfH, 'topleft-card');
    topLeft.setOrigin(0, 0);
    container.add(topLeft);
    pieces.push(topLeft);

    // Top edge (stretch to fill)
    if (centerWidth > 0) {
      const top = scene.add.image(0, -halfH, 'top-card');
      top.setOrigin(0.5, 0);
      top.setDisplaySize(centerWidth, sliceSize);
      container.add(top);
      pieces.push(top);
    }

    // Top-right corner
    const topRight = scene.add.image(halfW, -halfH, 'topright-card');
    topRight.setOrigin(1, 0);
    container.add(topRight);
    pieces.push(topRight);

    // Left edge (stretch to fill)
    if (centerHeight > 0) {
      const left = scene.add.image(-halfW, 0, 'left-card');
      left.setOrigin(0, 0.5);
      left.setDisplaySize(sliceSize, centerHeight);
      container.add(left);
      pieces.push(left);
    }

    // Center (use middle-card as fill)
    if (centerWidth > 0 && centerHeight > 0) {
      const center = scene.add.image(0, 0, 'middle-card');
      center.setOrigin(0.5, 0.5);
      center.setDisplaySize(centerWidth, centerHeight);
      container.add(center);
      pieces.push(center);
    }

    // Right edge (stretch to fill)
    if (centerHeight > 0) {
      const right = scene.add.image(halfW, 0, 'right-card');
      right.setOrigin(1, 0.5);
      right.setDisplaySize(sliceSize, centerHeight);
      container.add(right);
      pieces.push(right);
    }

    // Bottom-left corner
    const bottomLeft = scene.add.image(-halfW, halfH, 'bottomleft-card');
    bottomLeft.setOrigin(0, 1);
    container.add(bottomLeft);
    pieces.push(bottomLeft);

    // Bottom edge (stretch to fill)
    if (centerWidth > 0) {
      const bottom = scene.add.image(0, halfH, 'bottom-card');
      bottom.setOrigin(0.5, 1);
      bottom.setDisplaySize(centerWidth, sliceSize);
      container.add(bottom);
      pieces.push(bottom);
    }

    // Bottom-right corner
    const bottomRight = scene.add.image(halfW, halfH, 'bottomright-card');
    bottomRight.setOrigin(1, 1);
    container.add(bottomRight);
    pieces.push(bottomRight);

    // Add text lines
    const textObjects = [];
    let currentY = -halfH + padding.y;
    
    lines.forEach((line, i) => {
      if (i > 0) currentY += lineSpacing;
      
      const textObj = scene.add.text(0, currentY, line, {
        fontFamily,
        fontSize,
        color: textColor,
        resolution: 2,
        wordWrap: maxWidth ? { width: maxWidth - padding.x * 2 } : null
      });
      
      // Set alignment
      if (align === 'center') {
        textObj.setOrigin(0.5, 0);
      } else if (align === 'right') {
        textObj.setOrigin(1, 0);
        textObj.setX(halfW - padding.x);
      } else {
        textObj.setOrigin(0, 0);
        textObj.setX(-halfW + padding.x);
      }
      
      container.add(textObj);
      textObjects.push(textObj);
      
      // Update Y position for next line
      currentY += textObj.height;
    });

    return {
      container,
      textObjects,
      pieces,
      width: cardWidth,
      height: cardHeight
    };
  }

  /**
   * Create a text input box using card assets
   * @param {Phaser.Scene} scene - The Phaser scene
   * @param {number} x - X position
   * @param {number} y - Y position
   * @param {number} width - Width of input box
   * @param {number} height - Height of input box
   * @param {Object} options - Input box options
   * @returns {Object} Object with card container and text object
   */
  static createInputBox(scene, x, y, width, height, options = {}) {
    const {
      fontSize = 24,
      fontFamily = 'Arial',
      textColor = '#ffee58',
      depth = 100,
      scrollFactor = 0
    } = options;

    // Slice size
    const sliceSize = 32;
    const centerWidth = Math.max(0, width - sliceSize * 2);
    const centerHeight = Math.max(0, height - sliceSize * 2);

    // Create container
    const container = scene.add.container(x, y);
    container.setDepth(depth);
    container.setScrollFactor(scrollFactor);

    const pieces = [];
    const halfW = width / 2;
    const halfH = height / 2;

    // Build card using 9-slice pieces (same as createCard)
    const topLeft = scene.add.image(-halfW, -halfH, 'topleft-card');
    topLeft.setOrigin(0, 0);
    container.add(topLeft);
    pieces.push(topLeft);

    if (centerWidth > 0) {
      const top = scene.add.image(0, -halfH, 'top-card');
      top.setOrigin(0.5, 0);
      top.setDisplaySize(centerWidth, sliceSize);
      container.add(top);
      pieces.push(top);
    }

    const topRight = scene.add.image(halfW, -halfH, 'topright-card');
    topRight.setOrigin(1, 0);
    container.add(topRight);
    pieces.push(topRight);

    if (centerHeight > 0) {
      const left = scene.add.image(-halfW, 0, 'left-card');
      left.setOrigin(0, 0.5);
      left.setDisplaySize(sliceSize, centerHeight);
      container.add(left);
      pieces.push(left);
    }

    if (centerWidth > 0 && centerHeight > 0) {
      const center = scene.add.image(0, 0, 'middle-card');
      center.setOrigin(0.5, 0.5);
      center.setDisplaySize(centerWidth, centerHeight);
      container.add(center);
      pieces.push(center);
    }

    if (centerHeight > 0) {
      const right = scene.add.image(halfW, 0, 'right-card');
      right.setOrigin(1, 0.5);
      right.setDisplaySize(sliceSize, centerHeight);
      container.add(right);
      pieces.push(right);
    }

    const bottomLeft = scene.add.image(-halfW, halfH, 'bottomleft-card');
    bottomLeft.setOrigin(0, 1);
    container.add(bottomLeft);
    pieces.push(bottomLeft);

    if (centerWidth > 0) {
      const bottom = scene.add.image(0, halfH, 'bottom-card');
      bottom.setOrigin(0.5, 1);
      bottom.setDisplaySize(centerWidth, sliceSize);
      container.add(bottom);
      pieces.push(bottom);
    }

    const bottomRight = scene.add.image(halfW, halfH, 'bottomright-card');
    bottomRight.setOrigin(1, 1);
    container.add(bottomRight);
    pieces.push(bottomRight);

    // Add text object for input
    const textObj = scene.add.text(0, 0, '', {
      fontFamily,
      fontSize,
      color: textColor,
      resolution: 2
    });
    textObj.setOrigin(0.5);
    container.add(textObj);

    return {
      container,
      text: textObj,
      pieces,
      width,
      height
    };
  }
}

