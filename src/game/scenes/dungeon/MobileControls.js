export class MobileControls {
  constructor(scene) {
    this.scene = scene;
    this.btnUp = null;
    this.btnDown = null;
    this.btnLeft = null;
    this.btnRight = null;
  }

  createMobileControls() {
    const btnSize = 50;
    const margin = 150;
    const bottom = this.scene.scale.height - margin - btnSize;
    const centerX = this.scene.scale.width / 2;

    // Helper to create a button with an arrow label at high depth
    const makeArrowButton = (x, y, texture, callback) => {
      const btn = this.scene.add.image(x, y, texture)
        .setInteractive()
        .setScrollFactor(0)
        .setDisplaySize(btnSize, btnSize)
        .setDepth(1000); // keep above walls/floor

      btn.on("pointerdown", callback);
      return btn;
    };

    // Build D-pad with depth
    this.btnUp = makeArrowButton(centerX, bottom - btnSize, "up-arrow", () => this.scene.playerController.tryMove(0, -1));
    this.btnDown = makeArrowButton(centerX, bottom + btnSize, "down-arrow", () => this.scene.playerController.tryMove(0, 1));
    this.btnLeft = makeArrowButton(centerX - btnSize, bottom, "left-arrow", () => this.scene.playerController.tryMove(-1, 0));
    this.btnRight = makeArrowButton(centerX + btnSize, bottom, "right-arrow", () => this.scene.playerController.tryMove(1, 0));
  }
}
