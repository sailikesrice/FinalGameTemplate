// * DO NOT TOUCH * //

import Phaser from 'phaser';
import { Boot } from './scenes/Boot';
import { Preloader } from './scenes/Preloader';
import { Dungeon } from './scenes/Dungeon';
import { MainMenu } from './scenes/MainMenu';
import { RoleMenu } from './scenes/RoleMenu';
import { TeacherMenu } from './scenes/TeacherMenu';
import { TeacherDashboard } from './scenes/TeacherDashboard';
import { StudentLobby } from './scenes/StudentLobby';
import { StudentWaitRoom } from './scenes/StudentWaitRoom';
import { StudentLeaderboard } from './scenes/StudentLeaderboard';
import { LevelStats } from './scenes/LevelStats';
import { TutorialScene } from './scenes/TutorialScene';

// Detect mobile for responsive configuration
const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || 
                 ('ontouchstart' in window || navigator.maxTouchPoints > 0) && window.innerWidth <= 768;

const config = {
  type: Phaser.AUTO,
  width: window.innerWidth,
  height: window.innerHeight,
  parent: 'game-container',
  pixelArt: true,
  scale: {
    mode: Phaser.Scale.RESIZE, // Automatically resize to fit container
    autoCenter: Phaser.Scale.CENTER_BOTH,
    width: window.innerWidth,
    height: window.innerHeight,
    min: {
      width: 320,
      height: 240
    },
    max: {
      width: window.innerWidth,
      height: window.innerHeight
    }
  },
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 0 },
      debug: false,
    }
  },
  scene: [
    Boot,
    Preloader,
    MainMenu,
    RoleMenu,
    TeacherMenu,
    TeacherDashboard,
    StudentLobby,
    StudentWaitRoom,
    StudentLeaderboard,
    TutorialScene,
    Dungeon,
    LevelStats
  ]
};

const StartGame = (parent) => new Phaser.Game({ ...config, parent });

export default StartGame;
