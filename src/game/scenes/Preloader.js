import { Scene } from 'phaser';

export class Preloader extends Scene {
  constructor() {
    super('Preloader');
  }

  preload() {
    // Load extra assets here later
  }

  create() {
    this.scene.start('Dungeon');
  }
}
