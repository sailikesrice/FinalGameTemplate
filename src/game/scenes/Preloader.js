// * DO NOT TOUCH * //

import { Scene } from 'phaser';

export class Preloader extends Scene {
  constructor() {
    super('Preloader');
  }

  preload() {
    // Load extra assets here later
    this.load.image("player", "assets/player.png");
    this.load.image("floor", "assets/floor.png");
    this.load.image("wall", "assets/wall.png");
    this.load.image("btn", "https://labs.phaser.io/assets/ui/button.png");
    this.load.image("up-arrow", "assets/up-arrow.png");
    this.load.image("down-arrow", "assets/down-arrow.png");
    this.load.image("left-arrow", "assets/left-arrow.png");
    this.load.image("right-arrow", "assets/right-arrow.png");
  }

  create() {
    this.scene.start('MainMenu');
  }
}
