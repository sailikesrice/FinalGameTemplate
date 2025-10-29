import { GameSettings } from './GameSettings';

export class Minimap {
  constructor(scene) {
    this.scene = scene;
    this.squares = [];
    this.levelText = null;
  }

  create(level) {
    const size = 16;
    const margin = 4;
    const startX = 20;
    const startY = 20;

    this.squares = [];
    const ROOMS_PER_LEVEL = GameSettings.getRoomsPerLevel();
    for (let i = 0; i < ROOMS_PER_LEVEL; i++) {
      const sq = this.scene.add.rectangle(startX + i * (size + margin), startY, size, size, 0x666666)
        .setOrigin(0, 0);
      sq.setScrollFactor(0);
      this.squares.push(sq);
    }
    this.levelText = this.scene.add.text(startX, startY + size + 10, `Level ${level}`, { font: '16px Arial', color: '#fff' }).setScrollFactor(0);
  }

  update(roomsCompleted, level) {
    const ROOMS_PER_LEVEL = GameSettings.getRoomsPerLevel();
    if (!this.squares.length) return;
    for (let i = 0; i < ROOMS_PER_LEVEL; i++) {
      if (i < roomsCompleted) this.squares[i].setFillStyle(0xff0000);
      else this.squares[i].setFillStyle(0x666666);
    }
    if (this.levelText) this.levelText.setText(`Level ${level}`);
  }
}


