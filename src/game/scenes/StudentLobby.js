import { Scene } from 'phaser';
import { SessionManager } from '../session/SessionManager';
import { GameSettings } from '../dungeon/GameSettings';

export class StudentLobby extends Scene {
  constructor() { super('StudentLobby'); }

  create() {
    this.cameras.main.setBackgroundColor(0x111111);
    const centerX = this.scale.width / 2;
    const centerY = this.scale.height / 2;

    this.add.text(centerX, centerY - 120, 'Student Lobby', { fontFamily: 'Arial Black', fontSize: 40, color: '#ffffff' }).setOrigin(0.5);
    this.add.text(centerX, centerY - 60, 'Enter Session Code', { fontFamily: 'Arial Black', fontSize: 22, color: '#ffffff' }).setOrigin(0.5);

    const inputBg = this.add.rectangle(centerX, centerY - 20, 220, 46, 0x333333).setOrigin(0.5).setInteractive();
    inputBg.setStrokeStyle(2, 0x555555, 1);
    const inputText = this.add.text(centerX, centerY - 20, '', { fontFamily: 'Arial Black', fontSize: 24, color: '#ffee58' }).setOrigin(0.5);
    let isActive = false;
    const setActive = (val) => {
      isActive = !!val;
      inputBg.setStrokeStyle(2, isActive ? 0x88c0ff : 0x555555, 1);
    };
    inputBg.on('pointerdown', (p) => { p.event.stopPropagation(); setActive(true); });
    this.input.on('pointerdown', () => setActive(false));

    // simple numeric input via key events
    this.input.keyboard.on('keydown', (ev) => {
      if (!isActive) return;
      if (ev.key === 'Backspace') {
        inputText.setText(inputText.text.slice(0, -1));
      } else if (ev.key === 'Enter') {
        join();
      } else if (/\d/.test(ev.key) && inputText.text.length < 6) {
        inputText.setText(inputText.text + ev.key);
      }
    });

    const joinBg = this.add.rectangle(centerX, centerY + 50, 220, 56, 0x1565c0).setInteractive({ useHandCursor: true });
    const joinText = this.add.text(centerX, centerY + 50, 'Join', { fontFamily: 'Arial Black', fontSize: 26, color: '#ffffff' }).setOrigin(0.5).setInteractive({ useHandCursor: true });
    const status = this.add.text(centerX, centerY + 110, '', { fontFamily: 'Arial Black', fontSize: 18, color: '#ef9a9a' }).setOrigin(0.5);

    const join = () => {
      const code = inputText.text.trim();
      const session = SessionManager.getSession(code);
      if (!session) {
        status.setText('Invalid code');
        return;
      }
      // apply teacher config
      const cfg = session.config || {};
      if (cfg.allowedOps) GameSettings.setAllowed(cfg.allowedOps);
      if (cfg.roomsPerLevel) GameSettings.setRoomsPerLevel(cfg.roomsPerLevel);
      this.scene.start('Dungeon', { level: 1, sessionCode: code, role: 'student' });
    };
    // Rankings display
    const rankLabel = this.add.text(centerX, centerY + 170, 'Rankings (fastest first)', { fontFamily: 'Arial Black', fontSize: 18, color: '#ffffff' }).setOrigin(0.5);
    const drawRankings = () => {
      const code = inputText.text.trim();
      const s = SessionManager.getSession(code);
      if (!s) { return; }
      // remove previous lines
      if (this.rankLines) this.rankLines.forEach(l => { try { l.destroy(); } catch(e) {} });
      this.rankLines = [];
      const top = (s.results || []).slice(0, 5);
      top.forEach((r, idx) => {
        const secs = Math.floor((r.elapsedMs||0)/1000);
        const m = Math.floor(secs/60), s2 = secs%60;
        const line = this.add.text(centerX, centerY + 200 + idx*22, `${idx+1}. ${r.role||'student'} - ${m}:${String(s2).padStart(2,'0')}`, { fontFamily: 'Arial', fontSize: 16, color: '#90caf9' }).setOrigin(0.5);
        this.rankLines.push(line);
      });
    };
    // update rankings when typing/joining
    this.input.keyboard.on('keydown', drawRankings);
    joinBg.on('pointerdown', drawRankings);
    joinBg.on('pointerdown', join); joinText.on('pointerdown', join);
  }
}


