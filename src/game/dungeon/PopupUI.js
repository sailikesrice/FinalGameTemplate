export class PopupUI {
  constructor(scene) {
    this.scene = scene;
    this.container = null;
    this.open = false;
  }

  show(level, onNext) {
    if (this.open) return;
    this.open = true;

    const cam = this.scene.cameras.main;
    const width = cam.width;
    const height = cam.height;

    const overlay = this.scene.add.rectangle(cam.centerX, cam.centerY, width, height, 0x000000, 0.7)
      .setOrigin(0.5).setScrollFactor(0).setDepth(10000).setInteractive();
    overlay.on('pointerdown', () => {
      try { this.container && this.container.destroy(); } catch (e) {}
      try { overlay.destroy(); } catch (e) {}
      this.container = null;
      this.open = false;
    });

    this.container = this.scene.add.container(cam.centerX, cam.centerY).setScrollFactor(0).setDepth(10050);

    const box = this.scene.add.rectangle(0, 0, 320, 180, 0x222222).setStrokeStyle(3, 0xffffff);
    const title = this.scene.add.text(0, -44, `Level ${level} Cleared!`, { font: '22px Arial', color: '#ffffff' }).setOrigin(0.5);
    const subtitle = this.scene.add.text(0, -12, 'Great job!', { font: '16px Arial', color: '#dddddd' }).setOrigin(0.5);

    this.container.add([box, title, subtitle]);

    this.scene.tweens.add({
      targets: [box, title, subtitle],
      scaleX: { from: 0.8, to: 1 },
      scaleY: { from: 0.8, to: 1 },
      ease: 'Back.Out',
      duration: 350
    });
  }
}


