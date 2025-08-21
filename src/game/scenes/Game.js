import React, { useEffect, useRef } from "react";
import Phaser from "phaser";

function Game() {
  const gameRef = useRef(null);

  useEffect(() => {
    if (gameRef.current) return;

    const config = {
      type: Phaser.AUTO,
      width: window.innerWidth,
      height: window.innerHeight,
      parent: "phaser-container",
      physics: {
        default: "arcade",
        arcade: { gravity: { y: 0 } },
      },
      scene: {
        preload,
        create,
        update,
      },
      pixelArt: true,
    };

    gameRef.current = new Phaser.Game(config);

    function preload() {
      this.load.image("player", "https://labs.phaser.io/assets/sprites/phaser-dude.png");
    }

    function create() {
      this.add.text(20, 20, "Math Dungeon!", { font: "24px Arial", fill: "#fff" });
      this.player = this.physics.add.sprite(400, 300, "player");
      this.cursors = this.input.keyboard.createCursorKeys();
    }

    function update() {
      if (this.cursors.left.isDown) this.player.x -= 2;
      if (this.cursors.right.isDown) this.player.x += 2;
      if (this.cursors.up.isDown) this.player.y -= 2;
      if (this.cursors.down.isDown) this.player.y += 2;
    }

    return () => {
      gameRef.current.destroy(true);
      gameRef.current = null;
    };
  }, []);

  return <div id="phaser-container" style={{ width: "100vw", height: "100vh" }} />;
}

export default Game;
