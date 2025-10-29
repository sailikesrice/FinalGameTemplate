export class MobileControls {
  constructor(scene) {
    this.scene = scene;
    this.buttons = [];
  }

  create(onMove) {
    const btnSize = 50;
    const margin = 150;
    const bottom = this.scene.scale.height - margin - btnSize;
    const centerX = this.scene.scale.width / 2;

    const makeArrowButton = (x, y, texture, callback) => {
      const btn = this.scene.add.image(x, y, texture)
        .setInteractive()
        .setScrollFactor(0)
        .setDisplaySize(btnSize, btnSize)
        .setDepth(1000);
      btn.on('pointerdown', callback);
      this.buttons.push(btn);
      return btn;
    };

    makeArrowButton(centerX, bottom - btnSize, 'up-arrow', () => onMove(0, -1));
    makeArrowButton(centerX, bottom + btnSize, 'down-arrow', () => onMove(0, 1));
    makeArrowButton(centerX - btnSize, bottom, 'left-arrow', () => onMove(-1, 0));
    makeArrowButton(centerX + btnSize, bottom, 'right-arrow', () => onMove(1, 0));
  }
}


