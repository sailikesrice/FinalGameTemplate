import { Scene } from 'phaser';
import { SessionManager } from '../session/SessionManager';
import { GameSettings } from '../dungeon/GameSettings';

export class LevelStats extends Scene {
  constructor() {
    super('LevelStats');
  }

  init(data) {
    this.elapsedMs = data?.elapsedMs ?? 0;
    this.level = data?.level ?? 1;
    this.performanceResult = data?.performanceResult;
    this.difficultyAlgorithm = data?.difficultyAlgorithm;
    this.isTutorial = data?.tutorial || false;
  }

  create() {
    this.cameras.main.setBackgroundColor(0x101010);

    const centerX = this.scale.width / 2;
    const centerY = this.scale.height / 2;

    const elapsedSec = Math.max(0, Math.floor(this.elapsedMs / 1000));
    const m = Math.floor(elapsedSec / 60);
    const s = elapsedSec % 60;
    const mm = String(m);
    const ss = String(s).padStart(2, '0');

    this.add.text(centerX, centerY - 60, `Level ${this.level} Complete`, {
      fontFamily: 'Arial Black', fontSize: 36, color: '#ffffff',
      align: 'center'
    }).setOrigin(0.5);

    this.add.text(centerX, centerY - 20, `Time: ${mm}:${ss}`, {
      fontFamily: 'Arial Black', fontSize: 28, color: '#ffee58',
      align: 'center'
    }).setOrigin(0.5);

    // Display performance metrics if available
    if (this.performanceResult) {
      const stats = this.performanceResult;
      const statsY = centerY + 20;
      
      this.add.text(centerX, statsY, `Accuracy: ${stats.accuracy}% (${stats.correctAnswers}/${stats.totalQuestions})`, {
        fontFamily: 'Arial', fontSize: 20, color: '#90caf9',
        align: 'center'
      }).setOrigin(0.5);

      this.add.text(centerX, statsY + 30, `Performance Score: ${stats.performanceScore}/4`, {
        fontFamily: 'Arial Black', fontSize: 22, color: '#4caf50',
        align: 'center'
      }).setOrigin(0.5);

      this.add.text(centerX, statsY + 60, `Difficulty Rating: ${stats.difficultyRating}`, {
        fontFamily: 'Arial Black', fontSize: 24, color: '#ff9800',
        align: 'center'
      }).setOrigin(0.5);
    }

    // Position button based on whether performance metrics are shown
    const buttonY = this.performanceResult ? centerY + 150 : centerY + 80;

    // Always show Next Level
    const buttonText = 'Next Level';

    const btnBg = this.add.rectangle(centerX, buttonY, 260, 60, 0x2e7d32)
      .setInteractive({ useHandCursor: true });
    const btnText = this.add.text(centerX, buttonY, buttonText, {
      fontFamily: 'Arial Black', fontSize: 28, color: '#ffffff',
      align: 'center'
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    btnBg.on('pointerover', () => btnBg.setFillStyle(0x388e3c));
    btnBg.on('pointerout', () => btnBg.setFillStyle(0x2e7d32));

    const back = () => {
      // Start the next level as a fresh game load, but carry difficultyRating forward
      const nextLevel = this.level + 1;
      const difficultyRating = this.performanceResult ? this.performanceResult.difficultyRating : 1;
      this.scene.start('Dungeon', {
        level: nextLevel,
        tutorial: GameSettings.getTutorial(),
        role: 'student',
        difficultyRating
      });
    };
    btnBg.on('pointerdown', back);
    btnText.on('pointerdown', back);
  }
}


