/ * CHANGE HOWEVER YOU LIKE * /

import { EventBus } from '../EventBus';
import { Scene } from 'phaser';
import { ButtonBuilder } from '../utils/ButtonBuilder';

export class GameOver extends Scene
{
    constructor ()
    {
        super('GameOver');
    }

    create ()
    {
        this.cameras.main.setBackgroundColor(0xff0000);

        this.add.image(512, 384, 'background').setAlpha(0.5);

        this.add.text(512, 384, 'Game Over', {
            fontFamily: 'Arial', fontSize: 64, color: '#ffffff',
            resolution: 2,
            stroke: '#000000', strokeThickness: 8,
            align: 'center'
        }).setOrigin(0.5).setDepth(100);

        // Back button
        ButtonBuilder.createButton(this, 80, 30, '← Back', {
          fontSize: 18,
          minWidth: 100,
          minHeight: 40,
          depth: 101,
          onClick: () => this.scene.start('MainMenu')
        });

        EventBus.emit('current-scene-ready', this);
    }

    changeScene ()
    {
        this.scene.start('MainMenu');
    }
}
