/ * This is just the template, delete if you must * /

import { EventBus } from '../EventBus';
import { Scene } from 'phaser';
import { GameSettings } from '../dungeon/GameSettings';
import { ButtonBuilder } from '../utils/ButtonBuilder';

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
            fontFamily: 'Arial', fontSize: 48, color: '#ffffff',
            resolution: 2,
            stroke: '#000000', strokeThickness: 8,
            align: 'center'
        }).setOrigin(0.5);

        // Start Game Button
        const startButton = ButtonBuilder.createButton(this, centerX, centerY + 20, 'Start Game', {
            fontSize: 28,
            onClick: () => {
                this.scene.start('RoleMenu');
            }
        });

        // Tutorial Button
        const tutorialButton = ButtonBuilder.createButton(this, centerX, centerY + 100, 'Tutorial', {
            fontSize: 28,
            onClick: () => {
                this.scene.start('TutorialScene');
            }
        });

        EventBus.emit('current-scene-ready', this);
    }

    changeScene ()
    {
        this.scene.start('Dungeon', {
            previousScene: 'MainMenu'
        });
    }
}
