import { Scene } from "phaser";

export class Boot extends Scene {
  constructor() {
    super("Boot");
  }

  preload() {
    // load player sprite
    this.load.image("player", "/assets/player.png");
  }

  create() {
    this.scene.start('Preloader');
  }
}
