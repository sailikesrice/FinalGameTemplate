import { Scene } from 'phaser';
import { SessionManager } from '../session/SessionManager';
import { GameSettings } from '../dungeon/GameSettings';
import { calculatePoints } from '../session/PointSystem';
import { ButtonBuilder } from '../utils/ButtonBuilder';
import { CardBuilder } from '../utils/CardBuilder';

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
    this.sessionCode = data?.sessionCode;
    this.studentName = data?.studentName;
    this.role = data?.role || 'student';
    this.previousScene = data?.previousScene || 'MainMenu';
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
      fontFamily: 'Arial', fontSize: 36, color: '#ffffff',
      resolution: 2,
      align: 'center'
    }).setOrigin(0.5);

    this.add.text(centerX, centerY - 20, `Time: ${mm}:${ss}`, {
      fontFamily: 'Arial', fontSize: 28, color: '#ffee58',
      resolution: 2,
      align: 'center'
    }).setOrigin(0.5);

    // Display performance metrics if available
    if (this.performanceResult) {
      try {
        const stats = this.performanceResult;
        const statsY = centerY + 20;
        
        // Create stats card
        const statsCard = CardBuilder.createCard(this, centerX, statsY + 40, [
          `Accuracy: ${stats.accuracy}% (${stats.correctAnswers}/${stats.totalQuestions})`,
          `Performance Score: ${stats.performanceScore}/4`,
          `Difficulty Rating: ${stats.difficultyRating}`
        ], {
          fontSize: 20,
          padding: { x: 30, y: 20 },
          minWidth: 400,
          align: 'center',
          lineSpacing: 10
        });
        
        // Color the text objects
        if (statsCard && statsCard.textObjects && statsCard.textObjects.length >= 3) {
          try {
            statsCard.textObjects[0].setColor('#90caf9');
            statsCard.textObjects[1].setColor('#4caf50');
            statsCard.textObjects[2].setColor('#ff9800');
          } catch (e) {
            console.warn('[LevelStats] Error coloring text objects:', e);
          }
        }
      } catch (e) {
        console.error('[LevelStats] Error creating stats card:', e);
      }
    }

    // Save result if this is a student session
    this.pointsEarned = 0;
    if (this.role === 'student' && this.sessionCode && this.studentName) {
      const points = calculatePoints({
        elapsedMs: this.elapsedMs,
        performanceResult: this.performanceResult || {}
      });
      this.pointsEarned = points;
      SessionManager.addResult(this.sessionCode, {
        studentName: this.studentName,
        elapsedMs: this.elapsedMs,
        level: this.level,
        performanceResult: this.performanceResult,
        role: 'student',
        points
      }).catch(err => console.error('Error saving result:', err));
      SessionManager.addPoints(this.sessionCode, this.studentName, points).catch(err =>
        console.error('Error updating points:', err)
      );
    }

    const proceed = () => {
      if (this.sessionCode && this.studentName) {
        this.scene.start('StudentLeaderboard', {
          sessionCode: this.sessionCode,
          studentName: this.studentName,
          level: this.level,
          pointsEarned: this.pointsEarned
        });
      } else {
        const nextLevel = this.level + 1;
        const difficultyRating = this.performanceResult ? this.performanceResult.difficultyRating : 1;
        this.scene.start('Dungeon', {
          level: nextLevel,
          tutorial: GameSettings.getTutorial(),
          role: this.role || 'student',
          difficultyRating,
          previousScene: 'MainMenu'
        });
      }
    };

    // Position button based on whether performance metrics are shown
    const buttonY = this.performanceResult ? centerY + 150 : centerY + 80;

    // View Leaderboard Button
    ButtonBuilder.createButton(this, centerX, buttonY, 'View Leaderboard', {
      fontSize: 28,
      onClick: proceed
    });

    // Back button
    ButtonBuilder.createButton(this, 80, 30, '← Back', {
      fontSize: 18,
      minWidth: 100,
      minHeight: 40,
      onClick: () => {
        this.scene.start(this.previousScene);
      }
    });
  }
}


