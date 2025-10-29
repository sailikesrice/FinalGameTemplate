// * DO NOT TOUCH * //

import Phaser from 'phaser';
import { Boot } from './scenes/Boot';
import { Preloader } from './scenes/Preloader';
import { Dungeon } from './scenes/Dungeon';
import { MainMenu } from './scenes/MainMenu';
import { RoleMenu } from './scenes/RoleMenu';
import { TeacherMenu } from './scenes/TeacherMenu';
import { StudentLobby } from './scenes/StudentLobby';
import { LevelStats } from './scenes/LevelStats';
import { TutorialScene } from './scenes/TutorialScene';

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
  scene: [Boot, Preloader, MainMenu, RoleMenu, TeacherMenu, StudentLobby, TutorialScene, Dungeon, LevelStats]
};

const StartGame = (parent) => new Phaser.Game({ ...config, parent });

export default StartGame;
