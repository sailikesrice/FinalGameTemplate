import { Scene } from 'phaser';
import { GameSettings } from '../dungeon/GameSettings';
import { SessionManager } from '../session/SessionManager';
import { ButtonBuilder } from '../utils/ButtonBuilder';

export class TeacherMenu extends Scene {
  constructor() { super('TeacherMenu'); }

  create() {
    this.cameras.main.setBackgroundColor(0x111111);
    const centerX = this.scale.width / 2;
    const centerY = this.scale.height / 2;

    this.add.text(centerX, centerY - 140, 'Teacher Setup', { fontFamily: 'Arial', fontSize: 40, color: '#ffffff', resolution: 2 }).setOrigin(0.5);

    // Ops select (reuse approach from MainMenu)
    const ops = ['+', '-', '×', '÷'];
    const selected = new Set(GameSettings.getAllowed());
    const toggleY = centerY - 50;
    const spacing = 70;
    const startX = centerX - ((ops.length - 1) * spacing) / 2;
    ops.forEach((op, i) => {
      const x = startX + i * spacing;
      
      // Use number-box image instead of rectangle
      const bg = this.add.image(x, toggleY, 'number-box')
        .setDisplaySize(50, 50)
        .setOrigin(0.5)
        .setInteractive({ useHandCursor: true });
      
      // Tint based on selection state
      if (selected.has(op)) {
        bg.setTint(0x4444aa);
      } else {
        bg.clearTint();
      }
      
      const label = this.add.text(x, toggleY, op, { fontFamily: 'Arial', fontSize: 28, color: '#ffffff', resolution: 2 }).setOrigin(0.5).setInteractive({ useHandCursor: true });
      const toggle = () => { 
        if (selected.has(op)) selected.delete(op); 
        else selected.add(op); 
        // Update tint based on selection
        if (selected.has(op)) {
          bg.setTint(0x4444aa);
        } else {
          bg.clearTint();
        }
      };
      bg.on('pointerdown', toggle); 
      label.on('pointerdown', toggle);
    });

    // Rooms per level
    let rooms = GameSettings.getRoomsPerLevel();
    this.add.text(centerX, centerY + 10, 'Rooms per level', { fontFamily: 'Arial', fontSize: 20, color: '#ffffff', resolution: 2 }).setOrigin(0.5);
    const roomsValue = this.add.text(centerX, centerY + 40, `${rooms}`, { fontFamily: 'Arial', fontSize: 28, color: '#ffee58', resolution: 2 }).setOrigin(0.5);
    const dec = this.add.rectangle(centerX - 80, centerY + 40, 40, 40, 0x333333).setOrigin(0.5).setInteractive({ useHandCursor: true });
    const inc = this.add.rectangle(centerX + 80, centerY + 40, 40, 40, 0x333333).setOrigin(0.5).setInteractive({ useHandCursor: true });
    this.add.text(centerX - 80, centerY + 40, '−', { fontFamily: 'Arial', fontSize: 28, color: '#ffffff', resolution: 2 }).setOrigin(0.5);
    this.add.text(centerX + 80, centerY + 40, '+', { fontFamily: 'Arial', fontSize: 28, color: '#ffffff', resolution: 2 }).setOrigin(0.5);
    const applyRooms = () => { rooms = Math.max(3, Math.min(10, rooms)); roomsValue.setText(`${rooms}`); };
    dec.on('pointerdown', () => { rooms--; applyRooms(); });
    inc.on('pointerdown', () => { rooms++; applyRooms(); });

    const status = this.add.text(centerX, centerY + 250, '', { fontFamily: 'Arial', fontSize: 22, color: '#90caf9', resolution: 2 }).setOrigin(0.5);

    const start = async () => {
      const chosen = Array.from(selected);
      GameSettings.setAllowed(chosen.length ? chosen : ['+', '-', '×', '÷']);
      GameSettings.setRoomsPerLevel(rooms);
      const code = await SessionManager.createSession({ allowedOps: GameSettings.getAllowed(), roomsPerLevel: rooms });
      status.setText(`Session Code: ${code}`);
      this.registry.set('teacherSessionCode', code);
      // stay on this screen; teacher can share code
    };

    // Generate Code button
    ButtonBuilder.createButton(this, centerX, centerY + 100, 'Generate Code', {
      fontSize: 26,
      onClick: start
    });

    // View Dashboard button
    ButtonBuilder.createButton(this, centerX, centerY + 180, 'View Dashboard', {
      fontSize: 26,
      onClick: () => this.scene.start('TeacherDashboard')
    });

    // Back button
    ButtonBuilder.createButton(this, 80, 30, '← Back', {
      fontSize: 18,
      minWidth: 100,
      minHeight: 40,
      onClick: () => this.scene.start('RoleMenu')
    });
  }
}


