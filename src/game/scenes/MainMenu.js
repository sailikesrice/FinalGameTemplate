/ * This is just the template, delete if you must * /

import { EventBus } from '../EventBus';
import { Scene } from 'phaser';
import { GameSettings } from '../dungeon/GameSettings';

export class MainMenu extends Scene
{
    constructor ()
    {
        super('MainMenu');
    }

    create ()
    {
        this.cameras.main.setBackgroundColor(0x111111);

        const centerX = this.scale.width / 2;
        const centerY = this.scale.height / 2;

        this.add.text(centerX, centerY - 100, 'Math Dungeon', {
            fontFamily: 'Arial Black', fontSize: 48, color: '#ffffff',
            stroke: '#000000', strokeThickness: 8,
            align: 'center'
        }).setOrigin(0.5);

        // Start Game Button
        const startBtnBg = this.add.rectangle(centerX, centerY + 20, 240, 60, 0x2e7d32)
            .setInteractive({ useHandCursor: true });
        const startBtnText = this.add.text(centerX, centerY + 20, 'Start Game', {
            fontFamily: 'Arial Black', fontSize: 28, color: '#ffffff',
            align: 'center'
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });

        startBtnBg.on('pointerover', () => startBtnBg.setFillStyle(0x388e3c));
        startBtnBg.on('pointerout', () => startBtnBg.setFillStyle(0x2e7d32));

        const start = () => {
            this.scene.start('RoleMenu');
        };
        startBtnBg.on('pointerdown', start);
        startBtnText.on('pointerdown', start);

        // Tutorial Button
        const tutorialBtnBg = this.add.rectangle(centerX, centerY + 100, 240, 60, 0x1565c0)
            .setInteractive({ useHandCursor: true });
        const tutorialBtnText = this.add.text(centerX, centerY + 100, 'Tutorial', {
            fontFamily: 'Arial Black', fontSize: 28, color: '#ffffff',
            align: 'center'
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });

        tutorialBtnBg.on('pointerover', () => tutorialBtnBg.setFillStyle(0x1976d2));
        tutorialBtnBg.on('pointerout', () => tutorialBtnBg.setFillStyle(0x1565c0));

        const startTutorial = () => {
            this.scene.start('TutorialScene');
        };
        tutorialBtnBg.on('pointerdown', startTutorial);
        tutorialBtnText.on('pointerdown', startTutorial);

        EventBus.emit('current-scene-ready', this);
    }

    changeScene ()
    {
        this.scene.start('Dungeon');
    }
}
