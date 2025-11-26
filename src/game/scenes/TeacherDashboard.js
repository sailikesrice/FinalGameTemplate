import { Scene } from 'phaser';
import { SessionManager } from '../session/SessionManager';
import { ButtonBuilder } from '../utils/ButtonBuilder';
import { CardBuilder } from '../utils/CardBuilder';

export class TeacherDashboard extends Scene {
  constructor() {
    super('TeacherDashboard');
    this.subscription = null;
    this.sessionData = null;
    this.currentCard = null;
  }

  create() {
    this.cameras.main.setBackgroundColor(0x111111);
    const centerX = this.scale.width / 2;

    this.add.text(centerX, 40, 'Teacher Dashboard', {
      fontFamily: 'Arial',
      fontSize: 36,
      color: '#ffffff',
      resolution: 2
    }).setOrigin(0.5);

    // Back button
    ButtonBuilder.createButton(this, 80, 40, '← Back', {
      fontSize: 18,
      minWidth: 100,
      minHeight: 40,
      onClick: () => this.scene.start('TeacherMenu')
    });

    // Refresh button
    ButtonBuilder.createButton(this, this.scale.width - 80, 40, 'Refresh', {
      fontSize: 18,
      minWidth: 100,
      minHeight: 40,
      onClick: () => this.loadSession()
    });

    this.teacherSessionCode = this.registry.get('teacherSessionCode');
    if (!this.teacherSessionCode) {
      CardBuilder.createCard(this, centerX, this.scale.height / 2, [
        'No active session.',
        'Generate a code first.'
      ], {
        fontSize: 22,
        padding: { x: 30, y: 20 },
        align: 'center'
      });
      return;
    }

    this.loadSession();

    this.events.on('shutdown', () => {
      if (this.subscription) {
        this.subscription();
        this.subscription = null;
      }
    });
  }

  async loadSession() {
    if (!this.teacherSessionCode) return;
    if (this.currentCard?.container) {
      this.currentCard.container.destroy(true);
      this.currentCard = null;
    }
    if (this.subscription) {
      this.subscription();
      this.subscription = null;
    }

    const loading = this.add.text(this.scale.width / 2, 150, 'Loading session...', {
      fontFamily: 'Arial',
      fontSize: 18,
      color: '#999999',
      resolution: 2
    }).setOrigin(0.5);

    try {
      const session = await SessionManager.getSession(this.teacherSessionCode);
      loading.destroy();
      if (!session) {
        CardBuilder.createCard(this, this.scale.width / 2, 200, ['Session not found'], {
          fontSize: 20,
          padding: { x: 30, y: 20 },
          align: 'center'
        });
        return;
      }

      this.sessionData = session;
      this.currentCard = this.createSessionView(session);
      this.subscription = SessionManager.subscribeToSession(this.teacherSessionCode, (updated) => {
        if (updated) {
          this.sessionData = updated;
          this.updateSessionView(updated);
        }
      });
    } catch (err) {
      console.error(err);
      loading.setText('Failed to load session');
    }
  }

  createSessionView(session) {
    const cardWidth = this.scale.width - 120;
    const cardX = this.scale.width / 2;
    const cardY = 280;  // Lowered position

    // Create main card container
    const cardContainer = CardBuilder.createCard(this, cardX, cardY, [], {
      minWidth: cardWidth,
      minHeight: 420,
      padding: { x: 20, y: 20 }
    });
    const container = cardContainer.container;

    // Header text
    const header = this.add.text(0, -180, `Session ${this.teacherSessionCode}`, {
      fontFamily: 'Arial',
      fontSize: 26,
      color: '#ffee58',
      resolution: 2
    }).setOrigin(0, 0.5);
    container.add(header);

    // Status label
    this.statusLabel = this.add.text(0, -140, '', {
      fontFamily: 'Arial',
      fontSize: 20,
      color: '#90caf9',
      resolution: 2
    }).setOrigin(0, 0.5);
    container.add(this.statusLabel);

    // Student title
    this.studentTitle = this.add.text(0, -100, 'Students in Lobby', {
      fontFamily: 'Arial',
      fontSize: 22,
      color: '#ffffff',
      resolution: 2
    }).setOrigin(0.5, 0.5);
    container.add(this.studentTitle);

    this.studentTexts = [];

    // Start button
    const startButton = ButtonBuilder.createButton(this, 0, 40, 'Start Game Session', {
      fontSize: 22,
      onClick: () => this.startSession()
    });
    container.add(startButton.container);
    this.startButton = startButton.container;
    this.startButtonText = startButton.text;

    // Leaderboard title
    this.leaderboardTitle = this.add.text(0, 100, 'Latest Results', {
      fontFamily: 'Arial',
      fontSize: 22,
      color: '#ffffff',
      resolution: 2
    }).setOrigin(0.5, 0.5);
    container.add(this.leaderboardTitle);

    this.leaderboardTexts = [];

    const cardData = {
      container,
      statusLabel: this.statusLabel,
      studentTexts: this.studentTexts,
      startButton: this.startButton,
      startButtonText: this.startButtonText,
      leaderboardTexts: this.leaderboardTexts,
      studentTitle: this.studentTitle,
      leaderboardTitle: this.leaderboardTitle
    };

    this.updateSessionView(session);
    return cardData;
  }

  updateSessionView(session) {
    if (!this.currentCard) return;

    const statusColors = {
      waiting: '#90caf9',
      in_progress: '#4caf50',
      completed: '#ffca28'
    };
    const statusLabels = {
      waiting: 'Waiting to start',
      in_progress: 'Game in progress',
      completed: 'Session completed'
    };
    const status = session.status || 'waiting';
    this.currentCard.statusLabel.setColor(statusColors[status] || '#90caf9');
    this.currentCard.statusLabel.setText(`Status: ${statusLabels[status] || 'Waiting'}`);

    this.renderStudentList(session.students || []);
    this.renderLeaderboard(session.results || []);
    this.updateStartButtonState(status, session.students || []);
  }

  renderStudentList(students) {
    this.currentCard.studentTexts.forEach((text) => {
      try { text.destroy(); } catch (e) { /* ignore */ }
    });
    this.currentCard.studentTexts = [];

    const sorted = students.slice().sort((a, b) => (a.joinedAt || 0) - (b.joinedAt || 0));
    if (sorted.length === 0) {
      const text = this.add.text(0, -60, 'No students yet', {
        fontFamily: 'Arial',
        fontSize: 18,
        color: '#bbbbbb',
        resolution: 2
      }).setOrigin(0.5);
      this.currentCard.container.add(text);
      this.currentCard.studentTexts.push(text);
      return;
    }

    let y = -60;
    sorted.forEach((student, index) => {
      const label = this.add.text(0, y, `${index + 1}. ${student.name}`, {
        fontFamily: 'Arial',
        fontSize: 20,
        color: '#ffffff',
        resolution: 2
      }).setOrigin(0.5);
      this.currentCard.container.add(label);
      this.currentCard.studentTexts.push(label);
      y += 24;
    });
  }

  renderLeaderboard(results) {
    this.currentCard.leaderboardTexts.forEach((text) => {
      try { text.destroy(); } catch (e) { /* ignore */ }
    });
    this.currentCard.leaderboardTexts = [];

    const top = results.slice(0, 5);
    if (top.length === 0) {
      const text = this.add.text(0, 140, 'No results yet', {
        fontFamily: 'Arial',
        fontSize: 18,
        color: '#bbbbbb',
        resolution: 2
      }).setOrigin(0.5);
      this.currentCard.container.add(text);
      this.currentCard.leaderboardTexts.push(text);
      return;
    }

    let y = 140;
    top.forEach((result, idx) => {
      const points = result.points != null ? `${result.points} pts` : '';
      const elapsedSec = Math.floor((result.elapsedMs || 0) / 1000);
      const mins = Math.floor(elapsedSec / 60);
      const secs = elapsedSec % 60;
      const timeStr = `${mins}:${String(secs).padStart(2, '0')}`;
      const text = this.add.text(0, y, `${idx + 1}. ${result.studentName || 'Student'} - ${points} ${timeStr}`, {
        fontFamily: 'Arial',
        fontSize: 18,
        color: idx === 0 ? '#ffee58' : '#cccccc',
        resolution: 2
      }).setOrigin(0.5);
      this.currentCard.container.add(text);
      this.currentCard.leaderboardTexts.push(text);
      y += 24;
    });
  }

  updateStartButtonState(status, students) {
    const hasStudents = students.length > 0;
    if (!hasStudents) {
      this.startButton.setAlpha(0.5).disableInteractive();
      this.startButtonText.setText('Waiting for students');
      return;
    }

    if (status === 'in_progress') {
      this.startButton.setAlpha(0.5).disableInteractive();
      this.startButtonText.setText('Game in progress');
    } else {
      this.startButton.setAlpha(1).setInteractive({ useHandCursor: true });
      this.startButtonText.setText(status === 'completed' ? 'Restart Session' : 'Start Game Session');
    }
  }

  async startSession() {
    if (!this.teacherSessionCode || !this.sessionData) return;
    const status = this.sessionData.status || 'waiting';
    
    // Don't allow starting if already in progress
    if (status === 'in_progress') return;
    
    // If completed, reset the session for a new game
    if (status === 'completed') {
      await SessionManager.updateSession(this.teacherSessionCode, (session) => {
        session.status = 'in_progress';
        session.startTime = Date.now();
        session.results = [];
        session.currentLevel = 1;
        // Reset points but keep students
        const resetPoints = {};
        Object.keys(session.points || {}).forEach(name => {
          resetPoints[name] = 0;
        });
        session.points = resetPoints;
        return session;
      });
    } else {
      // Normal start from waiting
      await SessionManager.setSessionStatus(this.teacherSessionCode, 'in_progress', {
        startTime: Date.now()
      });
    }
  }
}

