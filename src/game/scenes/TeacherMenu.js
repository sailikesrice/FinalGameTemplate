import { Scene } from 'phaser';
import { GameSettings } from '../dungeon/GameSettings';
import { SessionManager } from '../session/SessionManager';

export class TeacherMenu extends Scene {
  constructor() { super('TeacherMenu'); }

  create() {
    this.cameras.main.setBackgroundColor(0x111111);
    const centerX = this.scale.width / 2;
    const centerY = this.scale.height / 2;

    this.add.text(centerX, centerY - 140, 'Teacher Setup', { fontFamily: 'Arial Black', fontSize: 40, color: '#ffffff' }).setOrigin(0.5);

    // Ops select (reuse approach from MainMenu)
    const ops = ['+', '-', '×', '÷'];
    const selected = new Set(GameSettings.getAllowed());
    const toggleY = centerY - 50;
    const spacing = 70;
    const startX = centerX - ((ops.length - 1) * spacing) / 2;
    ops.forEach((op, i) => {
      const x = startX + i * spacing;
      const bg = this.add.rectangle(x, toggleY, 50, 50, selected.has(op) ? 0x4444aa : 0x333333).setOrigin(0.5).setInteractive({ useHandCursor: true });
      const label = this.add.text(x, toggleY, op, { fontFamily: 'Arial Black', fontSize: 28, color: '#ffffff' }).setOrigin(0.5).setInteractive({ useHandCursor: true });
      const toggle = () => { if (selected.has(op)) selected.delete(op); else selected.add(op); bg.setFillStyle(selected.has(op) ? 0x4444aa : 0x333333); };
      bg.on('pointerdown', toggle); label.on('pointerdown', toggle);
    });

    // Rooms per level
    let rooms = GameSettings.getRoomsPerLevel();
    this.add.text(centerX, centerY + 10, 'Rooms per level', { fontFamily: 'Arial Black', fontSize: 20, color: '#ffffff' }).setOrigin(0.5);
    const roomsValue = this.add.text(centerX, centerY + 40, `${rooms}`, { fontFamily: 'Arial Black', fontSize: 28, color: '#ffee58' }).setOrigin(0.5);
    const dec = this.add.rectangle(centerX - 80, centerY + 40, 40, 40, 0x333333).setOrigin(0.5).setInteractive({ useHandCursor: true });
    const inc = this.add.rectangle(centerX + 80, centerY + 40, 40, 40, 0x333333).setOrigin(0.5).setInteractive({ useHandCursor: true });
    this.add.text(centerX - 80, centerY + 40, '−', { fontFamily: 'Arial Black', fontSize: 28, color: '#ffffff' }).setOrigin(0.5);
    this.add.text(centerX + 80, centerY + 40, '+', { fontFamily: 'Arial Black', fontSize: 28, color: '#ffffff' }).setOrigin(0.5);
    const applyRooms = () => { rooms = Math.max(3, Math.min(10, rooms)); roomsValue.setText(`${rooms}`); };
    dec.on('pointerdown', () => { rooms--; applyRooms(); });
    inc.on('pointerdown', () => { rooms++; applyRooms(); });

    // Generate session code and start
    const btnBg = this.add.rectangle(centerX, centerY + 120, 300, 60, 0x2e7d32).setInteractive({ useHandCursor: true });
    const btnText = this.add.text(centerX, centerY + 120, 'Generate Code', { fontFamily: 'Arial Black', fontSize: 26, color: '#ffffff' }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    const status = this.add.text(centerX, centerY + 180, '', { fontFamily: 'Arial Black', fontSize: 22, color: '#90caf9' }).setOrigin(0.5);

    const start = () => {
      const chosen = Array.from(selected);
      GameSettings.setAllowed(chosen.length ? chosen : ['+', '-', '×', '÷']);
      GameSettings.setRoomsPerLevel(rooms);
      const code = SessionManager.createSession({ allowedOps: GameSettings.getAllowed(), roomsPerLevel: rooms });
      status.setText(`Session Code: ${code}`);
      // stay on this screen; teacher can share code
    };
    btnBg.on('pointerdown', start); btnText.on('pointerdown', start);
  }
}


