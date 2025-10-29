import { Scene } from 'phaser';
import { SessionManager } from '../session/SessionManager';

export class LevelStats extends Scene {
  constructor() {
    super('LevelStats');
  }

  init(data) {
    this.elapsedMs = data?.elapsedMs ?? 0;
    this.level = data?.level ?? 1;
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

    this.add.text(centerX, centerY, `Time: ${mm}:${ss}`, {
      fontFamily: 'Arial Black', fontSize: 28, color: '#ffee58',
      align: 'center'
    }).setOrigin(0.5);

    const btnBg = this.add.rectangle(centerX, centerY + 80, 260, 60, 0x2e7d32)
      .setInteractive({ useHandCursor: true });
    const btnText = this.add.text(centerX, centerY + 80, 'Back to Lobby', {
      fontFamily: 'Arial Black', fontSize: 28, color: '#ffffff',
      align: 'center'
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    btnBg.on('pointerover', () => btnBg.setFillStyle(0x388e3c));
    btnBg.on('pointerout', () => btnBg.setFillStyle(0x2e7d32));

    const back = () => {
      // store result if part of a session
      const code = this.registry.get('sessionCode');
      const role = this.registry.get('role');
      if (code) {
        SessionManager.addResult(code, { role, level: this.level, elapsedMs: this.elapsedMs });
      }
      // If student, go lobby; if teacher, go teacher menu
      if (role === 'teacher') this.scene.start('TeacherMenu');
      else this.scene.start('StudentLobby');
    };
    btnBg.on('pointerdown', back);
    btnText.on('pointerdown', back);
  }
}


