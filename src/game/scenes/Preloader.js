// * DO NOT TOUCH * //

import { Scene } from 'phaser';
import { SessionManager } from '../session/SessionManager';

export class Preloader extends Scene {
  constructor() {
    super('Preloader');
  }

  preload() {
    // Load player animation assets
    // Idle animations
    this.load.image("playeridle-left1", "assets/player-assets/idle/playeridle-left1.webp");
    this.load.image("playeridle-left2", "assets/player-assets/idle/playeridle-left2.webp");
    this.load.image("playeridle-left3", "assets/player-assets/idle/playeridle-left3.webp");
    this.load.image("playeridle-right1", "assets/player-assets/idle/playeridle-right1.webp");
    this.load.image("playeridle-right2", "assets/player-assets/idle/playeridle-right2.webp");
    this.load.image("playeridle-right3", "assets/player-assets/idle/playeridle-right3.webp");
    
    // Move animations
    this.load.image("playermove-left1", "assets/player-assets/move/playermove-left1.webp");
    this.load.image("playermove-left2", "assets/player-assets/move/playermove-left2.webp");
    this.load.image("playermove-left3", "assets/player-assets/move/playermove-left3.webp");
    this.load.image("playermove-left4", "assets/player-assets/move/playermove-left4.webp");
    this.load.image("playermove-right1", "assets/player-assets/move/playermove-right1.webp");
    this.load.image("playermove-right2", "assets/player-assets/move/playermove-right2.webp");
    this.load.image("playermove-right3", "assets/player-assets/move/playermove-right3.webp");
    this.load.image("playermove-right4", "assets/player-assets/move/playermove-right4.webp");
    
    // Spawn animations
    this.load.image("player-spawn1", "assets/player-assets/spawn/player-spawn1.webp");
    this.load.image("player-spawn2", "assets/player-assets/spawn/player-spawn2.webp");
    this.load.image("player-spawn3", "assets/player-assets/spawn/player-spawn3.webp");
    this.load.image("player-spawn4", "assets/player-assets/spawn/player-spawn4.webp");
    this.load.image("player-spawn5", "assets/player-assets/spawn/player-spawn5.webp");
    this.load.image("player-spawn6", "assets/player-assets/spawn/player-spawn6.webp");
    
    // Legacy player asset (keeping for fallback)
    this.load.image("player", "assets/player.png");
    
    // Load map assets (new assets from map-assets folder)
    this.load.image("floor", "assets/map-assets/floor.webp");
    
    // Wall assets
    this.load.image("top-wall", "assets/map-assets/top-wall.webp");
    this.load.image("bottom-wall", "assets/map-assets/bottom-wall.webp");
    this.load.image("left-wall", "assets/map-assets/left-wall.webp");
    this.load.image("right-wall", "assets/map-assets/right-wall.webp");
    
    // Corner wall assets
    this.load.image("topleft-wall", "assets/map-assets/topleft-wall.webp");
    this.load.image("topright-wall", "assets/map-assets/topright-wall.webp");
    this.load.image("bottomleft-wall", "assets/map-assets/bottomleft-wall.webp");
    this.load.image("bottomright-wall", "assets/map-assets/bottomright-wall.webp");
    
    // Door assets
    this.load.image("top-door", "assets/map-assets/top-door.webp");
    this.load.image("bottom-door", "assets/map-assets/bottom-door.webp");
    this.load.image("left-door", "assets/map-assets/left-door.webp");
    this.load.image("right-door", "assets/map-assets/right-door.webp");
    
    // Legacy assets (keeping for backward compatibility if needed)
    this.load.image("wall", "assets/wall.png");
    
    // Button assets (9-slice buttons)
    this.load.image("topleft-button", "assets/button-assets/topleft-button.webp");
    this.load.image("top-button", "assets/button-assets/top-button.webp");
    this.load.image("topright-button", "assets/button-assets/topright-button.webp");
    this.load.image("left-button", "assets/button-assets/left-button.webp");
    this.load.image("middle-button", "assets/button-assets/middle-button.webp");
    this.load.image("right-button", "assets/button-assets/right-button.webp");
    this.load.image("bottomleft-button", "assets/button-assets/bottomleft-button.webp");
    this.load.image("bottom-button", "assets/button-assets/bottom-button.webp");
    this.load.image("bottomright-button", "assets/button-assets/bottomright-button.webp");
    
    // Card assets (9-slice cards)
    this.load.image("topleft-card", "assets/card-assets/topleft-card.webp");
    this.load.image("top-card", "assets/card-assets/top-card.webp");
    this.load.image("topright-card", "assets/card-assets/topright-card.webp");
    this.load.image("left-card", "assets/card-assets/left-card.webp");
    this.load.image("middle-card", "assets/card-assets/middle-card.webp");
    this.load.image("right-card", "assets/card-assets/right-card.webp");
    this.load.image("bottomleft-card", "assets/card-assets/bottomleft-card.webp");
    this.load.image("bottom-card", "assets/card-assets/bottom-card.webp");
    this.load.image("bottomright-card", "assets/card-assets/bottomright-card.webp");
    
    // Number box asset for operation boxes and puzzle tiles
    this.load.image("number-box", "assets/number-box.webp");
    
    // Load arrow assets for mobile controls - use webp files from arrow-assets folder
    this.load.image("up-arrow", "assets/arrow-assets/up-arrow.webp");
    this.load.image("down-arrow", "assets/arrow-assets/down-arrow.webp");
    this.load.image("left-arrow", "assets/arrow-assets/left-arrow.webp");
    this.load.image("right-arrow", "assets/arrow-assets/right-arrow.webp");
    
    // Also load pressed versions for better feedback
    this.load.image("up-arrow-pressed", "assets/arrow-assets/up-arrow-pressed.webp");
    this.load.image("down-arrow-pressed", "assets/arrow-assets/down-arrow-pressed.webp");
    this.load.image("left-arrow-pressed", "assets/arrow-assets/left-arrow-pressed.webp");
    this.load.image("right-arrow-pressed", "assets/arrow-assets/right-arrow-pressed.webp");

    // Generate a simple timer icon texture (clock) to use in HUD
    const g = this.add.graphics();
    g.fillStyle(0x222222, 1);
    g.fillCircle(24, 24, 24);
    g.lineStyle(3, 0xffffff, 1);
    g.strokeCircle(24, 24, 24);
    // clock hands
    g.lineBetween(24, 24, 24, 10); // minute hand
    g.lineBetween(24, 24, 38, 24); // hour hand
    g.generateTexture('timer-icon', 48, 48);
    g.destroy();
    try {
      console.log('[Preloader] timer-icon generated:', this.textures.exists('timer-icon'));
    } catch (e) {}
  }

  createArrowFallbacks() {
    // Create fallback arrow graphics if assets don't load
    const arrowSize = 64;
    const createArrow = (direction) => {
      const g = this.add.graphics();
      g.fillStyle(0xffffff, 0.9);
      g.fillRect(0, 0, arrowSize, arrowSize);
      g.lineStyle(3, 0x333333, 1);
      g.strokeRect(0, 0, arrowSize, arrowSize);
      
      // Draw arrow shape based on direction
      g.fillStyle(0x333333, 1);
      const centerX = arrowSize / 2;
      const centerY = arrowSize / 2;
      const arrowW = 20;
      const arrowH = 15;
      
      if (direction === 'up') {
        g.beginPath();
        g.moveTo(centerX, centerY - arrowH);
        g.lineTo(centerX - arrowW/2, centerY);
        g.lineTo(centerX + arrowW/2, centerY);
        g.closePath();
        g.fillPath();
      } else if (direction === 'down') {
        g.beginPath();
        g.moveTo(centerX, centerY + arrowH);
        g.lineTo(centerX - arrowW/2, centerY);
        g.lineTo(centerX + arrowW/2, centerY);
        g.closePath();
        g.fillPath();
      } else if (direction === 'left') {
        g.beginPath();
        g.moveTo(centerX - arrowH, centerY);
        g.lineTo(centerX, centerY - arrowW/2);
        g.lineTo(centerX, centerY + arrowW/2);
        g.closePath();
        g.fillPath();
      } else if (direction === 'right') {
        g.beginPath();
        g.moveTo(centerX + arrowH, centerY);
        g.lineTo(centerX, centerY - arrowW/2);
        g.lineTo(centerX, centerY + arrowW/2);
        g.closePath();
        g.fillPath();
      }
      
      g.generateTexture(`${direction}-arrow`, arrowSize, arrowSize);
      g.destroy();
    };
    
    if (!this.textures.exists('up-arrow')) createArrow('up');
    if (!this.textures.exists('down-arrow')) createArrow('down');
    if (!this.textures.exists('left-arrow')) createArrow('left');
    if (!this.textures.exists('right-arrow')) createArrow('right');
  }

  async create() {
    // Check if arrow assets loaded, create fallbacks if needed
    if (!this.textures.exists('up-arrow')) {
      this.createArrowFallbacks();
    }
    
    try { console.log('[Preloader] initializing database...'); } catch (e) {}
    // Initialize database in background
    SessionManager.init().catch(err => {
      console.warn('Database initialization error:', err);
    });
    try { console.log('[Preloader] starting MainMenu'); } catch (e) {}
    this.scene.start('MainMenu');
  }
}
