import { Scene } from 'phaser';
import { SessionManager } from '../session/SessionManager';
import { ButtonBuilder } from '../utils/ButtonBuilder';
import { CardBuilder } from '../utils/CardBuilder';

export class StudentWaitRoom extends Scene {
  constructor() {
    super('StudentWaitRoom');
    this.subscription = null;
    this.sessionData = null;
  }

  init(data) {
    this.sessionCode = data?.sessionCode;
    this.studentName = data?.studentName;
  }

  create() {
    if (!this.sessionCode || !this.studentName) {
      this.scene.start('StudentLobby');
      return;
    }

    this.cameras.main.setBackgroundColor(0x111111);
    const centerX = this.scale.width / 2;

    this.add.text(centerX, 60, 'Waiting Room', {
      fontFamily: 'Arial',
      fontSize: 36,
      color: '#ffffff',
      resolution: 2
    }).setOrigin(0.5);

    this.add.text(centerX, 110, `Session Code: ${this.sessionCode}`, {
      fontFamily: 'Arial',
      fontSize: 24,
      color: '#ffee58',
      resolution: 2
    }).setOrigin(0.5);

    this.statusText = this.add.text(centerX, 150, 'Waiting for teacher to start...', {
      fontFamily: 'Arial',
      fontSize: 20,
      color: '#90caf9',
      resolution: 2
    }).setOrigin(0.5);

    // Students card - lowered position
    const studentsCard = CardBuilder.createCard(this, centerX, 300, ['Students in this session'], {
      fontSize: 22,
      padding: { x: 30, y: 20 },
      minWidth: 400,
      minHeight: 200,
      align: 'center'
    });
    this.studentListContainer = studentsCard.container;
    this.studentTexts = [];

    this.subscribeToSession();

    // Back button
    ButtonBuilder.createButton(this, 80, 30, '← Back', {
      fontSize: 18,
      minWidth: 100,
      minHeight: 40,
      onClick: () => {
        this.shutdown();
        this.scene.start('StudentLobby');
      }
    });

    this.events.once('shutdown', () => this.shutdown());
    this.events.once('destroy', () => this.shutdown());
  }

  subscribeToSession() {
    if (this.subscription) {
      this.subscription();
    }
    this.subscription = SessionManager.subscribeToSession(this.sessionCode, (session) => {
      if (!session) return;
      this.sessionData = session;
      this.renderStudents(session);
      this.handleStatus(session);
    });
  }

  renderStudents(session) {
    this.studentTexts.forEach((text) => {
      try { text.destroy(); } catch (e) { /* noop */ }
    });
    this.studentTexts = [];

    const students = (session.students || []).slice().sort((a, b) => (a.joinedAt || 0) - (b.joinedAt || 0));
    if (students.length === 0) {
      const text = this.add.text(0, 20, 'Waiting for students...', {
        fontFamily: 'Arial',
        fontSize: 18,
        color: '#bbbbbb',
        resolution: 2
      }).setOrigin(0.5);
      this.studentListContainer.add(text);
      this.studentTexts.push(text);
      return;
    }

    let y = 20;
    students.forEach((student, index) => {
      const label = this.add.text(0, y, `${index + 1}. ${student.name}`, {
        fontFamily: 'Arial',
        fontSize: 20,
        color: student.name === this.studentName ? '#ffee58' : '#ffffff',
        resolution: 2
      }).setOrigin(0.5);
      this.studentListContainer.add(label);
      this.studentTexts.push(label);
      y += 28;
    });
  }

  handleStatus(session) {
    switch (session.status) {
      case 'waiting':
      default:
        this.statusText.setText('Waiting for teacher to start...');
        break;
      case 'in_progress':
        this.statusText.setText('Game starting!');
        this.startGame(session);
        break;
      case 'completed':
        this.statusText.setText('Session completed');
        break;
    }
  }

  startGame(session) {
    if (this.transitioning) return;
    this.transitioning = true;
    this.time.delayedCall(500, () => {
      this.shutdown();
      this.scene.start('Dungeon', {
        level: session.currentLevel || 1,
        sessionCode: this.sessionCode,
        role: 'student',
        studentName: this.studentName,
        previousScene: 'StudentWaitRoom'
      });
    });
  }

  shutdown() {
    if (this.subscription) {
      this.subscription();
      this.subscription = null;
    }
  }

  destroy() {
    this.shutdown();
    super.destroy();
  }
}

