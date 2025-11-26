import { Scene } from 'phaser';
import { SessionManager } from '../session/SessionManager';
import { ButtonBuilder } from '../utils/ButtonBuilder';
import { CardBuilder } from '../utils/CardBuilder';

export class StudentLeaderboard extends Scene {
  constructor() {
    super('StudentLeaderboard');
    this.subscription = null;
  }

  init(data) {
    this.sessionCode = data?.sessionCode;
    this.studentName = data?.studentName;
    this.level = data?.level || 1;
    this.pointsEarned = data?.pointsEarned || 0;
  }

  create() {
    if (!this.sessionCode || !this.studentName) {
      this.scene.start('StudentLobby');
      return;
    }

    SessionManager.setSessionStatus(this.sessionCode, 'completed').catch(() => {});

    this.cameras.main.setBackgroundColor(0x000000);
    const centerX = this.scale.width / 2;

    this.add.text(centerX, 70, 'Level Complete!', {
      fontFamily: 'Arial',
      fontSize: 36,
      color: '#ffffff',
      resolution: 2
    }).setOrigin(0.5);

    this.add.text(centerX, 120, `You earned ${this.pointsEarned} pts`, {
      fontFamily: 'Arial',
      fontSize: 24,
      color: '#ffee58',
      resolution: 2
    }).setOrigin(0.5);

    // Leaderboard title
    this.add.text(centerX, 170, 'Leaderboard', {
      fontFamily: 'Arial',
      fontSize: 28,
      color: '#ffffff',
      resolution: 2
    }).setOrigin(0.5);

    // Back button (top-left)
    ButtonBuilder.createButton(this, 80, 30, '← Back', {
      fontSize: 18,
      minWidth: 100,
      minHeight: 40,
      onClick: () => this.goToLobby()
    });

    this.leaderboardTexts = [];

    this.waitText = this.add.text(centerX, this.scale.height - 140, 'Waiting for the next game...', {
      fontFamily: 'Arial',
      fontSize: 20,
      color: '#90caf9',
      resolution: 2
    }).setOrigin(0.5);

    // Return to Lobby button
    ButtonBuilder.createButton(this, centerX, this.scale.height - 80, 'Return to Lobby', {
      fontSize: 24,
      onClick: () => this.goToLobby()
    });

    this.subscription = SessionManager.subscribeToSession(this.sessionCode, (session) => {
      if (session) {
        this.renderLeaderboard(session);
      }
    });

    this.events.once('shutdown', () => this.cleanup());
    this.events.once('destroy', () => this.cleanup());
  }

  renderLeaderboard(session) {
    this.leaderboardTexts.forEach((text) => {
      try { text.destroy(); } catch (e) { /* noop */ }
    });
    this.leaderboardTexts = [];

    const pointsMap = session.points || {};
    const entries = Object.entries(pointsMap).sort((a, b) => b[1] - a[1]);

    if (entries.length === 0) {
      const text = this.add.text(this.scale.width / 2, 200, 'No scores yet', {
        fontFamily: 'Arial',
        fontSize: 20,
        color: '#bbbbbb',
        resolution: 2
      }).setOrigin(0.5);
      this.leaderboardTexts.push(text);
      return;
    }

    // Position leaderboard entries starting below the card title
    let y = 200;
    entries.slice(0, 8).forEach(([name, points], idx) => {
      const line = this.add.text(this.scale.width / 2, y, `${idx + 1}. ${name} - ${points} pts`, {
        fontFamily: 'Arial',
        fontSize: 22,
        color: name === this.studentName ? '#ffee58' : '#ffffff',
        resolution: 2
      }).setOrigin(0.5);
      this.leaderboardTexts.push(line);
      y += 30;
    });
  }

  goToLobby() {
    this.cleanup();
    this.scene.start('StudentWaitRoom', {
      sessionCode: this.sessionCode,
      studentName: this.studentName
    });
  }

  cleanup() {
    if (this.subscription) {
      this.subscription();
      this.subscription = null;
    }
  }
}

