import { ROOMS_PER_LEVEL } from './Constants.js';

export class MinimapUI {
  constructor(scene) {
    this.scene = scene;
    this.minimapSquares = [];
  }

  createMinimap(layer = null) {
    const size = 16;
    const margin = 4;
    const startX = 20;
    const startY = 20;

    this.minimapSquares = [];

    for (let i = 0; i < ROOMS_PER_LEVEL; i++) {
      const sq = this.scene.add.rectangle(
        startX + i * (size + margin),
        startY,
        size,
        size,
        0x666666
      )
        .setOrigin(0, 0)
        .setScrollFactor(0);

      if (layer) layer.add(sq);
      this.minimapSquares.push(sq);
    }

    this.levelText = this.scene.add.text(
      startX,
      startY + size + 10,
      `Level ${this.scene.levelManager.level}`,
      { font: "16px Arial", color: "#fff" }
    ).setScrollFactor(0);

    if (layer) layer.add(this.levelText);
  }


  updateMinimap() {
    if (!this.minimapSquares.length) return;
    for (let i = 0; i < ROOMS_PER_LEVEL; i++) {
      if (i < this.scene.levelManager.roomsCompleted) {
        this.minimapSquares[i].setFillStyle(0xff0000); // red = completed
      } else {
        this.minimapSquares[i].setFillStyle(0x666666); // gray = pending
      }
    }
    if (this.levelText) this.levelText.setText(`Level ${this.scene.levelManager.level}`);
  }
}
