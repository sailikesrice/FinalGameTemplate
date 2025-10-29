import { Scene } from 'phaser';

export class RoleMenu extends Scene {
  constructor() {
    super('RoleMenu');
  }

  create() {
    this.cameras.main.setBackgroundColor(0x111111);
    const centerX = this.scale.width / 2;
    const centerY = this.scale.height / 2;

    this.add.text(centerX, centerY - 100, 'Math Dungeon', {
      fontFamily: 'Arial Black', fontSize: 48, color: '#ffffff',
      stroke: '#000000', strokeThickness: 8, align: 'center'
    }).setOrigin(0.5);

    const teacherBg = this.add.rectangle(centerX, centerY - 10, 260, 60, 0x2e7d32).setInteractive({ useHandCursor: true });
    const teacherText = this.add.text(centerX, centerY - 10, 'Play as Teacher', { fontFamily: 'Arial Black', fontSize: 28, color: '#ffffff' }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    const studentBg = this.add.rectangle(centerX, centerY + 70, 260, 60, 0x1565c0).setInteractive({ useHandCursor: true });
    const studentText = this.add.text(centerX, centerY + 70, 'Play as Student', { fontFamily: 'Arial Black', fontSize: 28, color: '#ffffff' }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    const goTeacher = () => this.scene.start('TeacherMenu');
    const goStudent = () => this.scene.start('StudentLobby');
    teacherBg.on('pointerdown', goTeacher); teacherText.on('pointerdown', goTeacher);
    studentBg.on('pointerdown', goStudent); studentText.on('pointerdown', goStudent);
  }
}


