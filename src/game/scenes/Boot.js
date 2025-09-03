import { Scene } from "phaser";

export class Boot extends Scene {
  constructor() {
    super("Boot");
  }

  preload() {
    // load player sprite
    this.load.image("player", "/assets/player.png"); // make sure file exists in public/assets/
  }

  create() {
    this.scene.start('Preloader'); // go directly to dungeon
  }
}
