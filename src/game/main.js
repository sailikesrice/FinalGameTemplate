// * DO NOT TOUCH * //

import Phaser from 'phaser';
import { Boot } from './scenes/Boot';
import { Preloader } from './scenes/Preloader';
import { MainMenu } from './scenes/MainMenu';
import { Dungeon } from './scenes/Dungeon';
import { LevelComplete } from './scenes/LevelComplete';

const config = {
  type: Phaser.AUTO,
  width: window.innerWidth,
  height: window.innerHeight,
  parent: 'game-container',
  pixelArt: true,
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 0 },
      debug: false,
    }
  },
  scene: [Boot, Preloader, MainMenu, Dungeon, LevelComplete]
};

const StartGame = (parent) => new Phaser.Game({ ...config, parent });

export default StartGame;
