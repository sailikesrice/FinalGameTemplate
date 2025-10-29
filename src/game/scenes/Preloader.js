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
    // Removed remote asset to avoid CORS issues
    this.load.image("up-arrow", "assets/up-arrow.png");
    this.load.image("down-arrow", "assets/down-arrow.png");
    this.load.image("left-arrow", "assets/left-arrow.png");
    this.load.image("right-arrow", "assets/right-arrow.png");

    // Generate a simple timer icon texture (clock) to use in HUD
    const g = this.add.graphics();
    g.fillStyle(0x222222, 1);
    g.fillCircle(24, 24, 24);
    g.lineStyle(3, 0xffffff, 1);
    g.strokeCircle(24, 24, 24);
    // clock hands
    g.lineBetween(24, 24, 24, 10); // minute hand
    g.lineBetween(24, 24, 38, 24); // hour hand
    g.generateTexture('timer-icon', 48, 48);
    g.destroy();
    try {
      console.log('[Preloader] timer-icon generated:', this.textures.exists('timer-icon'));
    } catch (e) {}
  }

  create() {
    try { console.log('[Preloader] starting MainMenu'); } catch (e) {}
    this.scene.start('MainMenu');
  }
}
