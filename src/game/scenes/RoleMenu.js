import { Scene } from 'phaser';
import { ButtonBuilder } from '../utils/ButtonBuilder';

export class RoleMenu extends Scene {
  constructor() {
    super('RoleMenu');
  }

  create() {
    this.cameras.main.setBackgroundColor(0x111111);
    const centerX = this.scale.width / 2;
    const centerY = this.scale.height / 2;

    this.add.text(centerX, centerY - 100, 'Math Dungeon', {
      fontFamily: 'Arial', fontSize: 48, color: '#ffffff',
      resolution: 2,
      stroke: '#000000', strokeThickness: 8, align: 'center'
    }).setOrigin(0.5);

    // Play as Teacher Button
    ButtonBuilder.createButton(this, centerX, centerY - 10, 'Play as Teacher', {
      fontSize: 28,
      onClick: () => this.scene.start('TeacherMenu')
    });

    // Play as Student Button
    ButtonBuilder.createButton(this, centerX, centerY + 70, 'Play as Student', {
      fontSize: 28,
      onClick: () => this.scene.start('StudentLobby')
    });

    // Back button
    ButtonBuilder.createButton(this, 80, 30, '← Back', {
      fontSize: 18,
      minWidth: 100,
      minHeight: 40,
      onClick: () => {
        this.scene.start('MainMenu');
      }
    });
  }
}


