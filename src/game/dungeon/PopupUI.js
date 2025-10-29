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
    const nextBtnBg = this.scene.add.rectangle(0, 46, 200, 46, 0x008000).setOrigin(0.5).setInteractive({ useHandCursor: true });
    const nextBtn = this.scene.add.text(0, 46, 'Next Level ▶', { font: '20px Arial', color: '#ffffff' }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    this.container.add([box, title, subtitle, nextBtnBg, nextBtn]);

    nextBtnBg.on('pointerover', () => nextBtnBg.setFillStyle(0x00aa00));
    nextBtnBg.on('pointerout', () => nextBtnBg.setFillStyle(0x008000));

    const handleNext = () => {
      try { this.container.destroy(); } catch (e) {}
      this.container = null;
      this.open = false;
      try { overlay.destroy(); } catch (e) {}
      if (onNext) onNext();
    };

    nextBtnBg.on('pointerdown', handleNext);
    nextBtn.on('pointerdown', handleNext);

    this.scene.tweens.add({
      targets: [box, title, subtitle, nextBtn],
      scaleX: { from: 0.8, to: 1 },
      scaleY: { from: 0.8, to: 1 },
      ease: 'Back.Out',
      duration: 350
    });
  }
}


