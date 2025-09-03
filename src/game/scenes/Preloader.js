import { Scene } from 'phaser';

export class Preloader extends Scene {
  constructor() {
    super('Preloader');
  }

  preload() {
    // Load extra assets here later
    this.load.image("player", "assets/player.png");
  }

  create() {
    this.scene.start('Dungeon');
  }
}