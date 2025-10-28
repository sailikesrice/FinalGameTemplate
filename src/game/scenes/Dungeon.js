/*
 * @file Dungeon.js
 * @description Refactored Dungeon scene using modular architecture.
 * Each system is now in its own module for better organization and maintainability.
 * @sailikesrice
 */

import { Scene } from "phaser";
import { TILE_SIZE, ROOM_SIZE, ROOMS_PER_LEVEL } from "./dungeon/Constants.js";
import { MapGenerator } from "./dungeon/MapGenerator.js";
import { PuzzleSystem } from "./dungeon/PuzzleSystem.js";
import { PlayerController } from "./dungeon/PlayerController.js";
import { MinimapUI } from "./dungeon/MinimapUI.js";
import { PopupSystem } from "./dungeon/PopupSystem.js";
import { MobileControls } from "./dungeon/MobileControls.js";
import { LevelManager } from "./dungeon/LevelManager.js";
import { TimerSystem } from "./dungeon/TimerSystem.js";

export class Dungeon extends Scene {
  constructor() {
    super("Dungeon");
    this.rooms = {};
    this.selectedTile = null;
    
    // Initialize all systems in proper order
    this.mapGenerator = new MapGenerator(this);
    this.puzzleSystem = new PuzzleSystem(this);
    this.playerController = new PlayerController(this);
    this.minimapUI = new MinimapUI(this);
    this.popupSystem = new PopupSystem(this);
    this.mobileControls = new MobileControls(this);
    this.levelManager = new LevelManager(this);
    this.timerSystem = new TimerSystem(this);
  }

  init(data) {
    // Handle data passed from other scenes
    if (data && data.nextLevel && data.level) {
      this.levelManager.level = data.level;
    }
    if (data && data.restartLevel && data.level) {
      this.levelManager.level = data.level;
    }
  }

  create() {
    // 1️⃣ Prepare static wall group
    this.walls = this.physics.add.staticGroup();

    // 2️⃣ Configure the camera bounds
    const cam = this.cameras.main;
    cam.setBounds(0, 0, ROOM_SIZE * TILE_SIZE * 7, ROOM_SIZE * TILE_SIZE * 7);

    // 3️⃣ Create persistent UI layer with very high depth
    this.sharedLayer = this.add.layer().setDepth(1000);
    
    // 4️⃣ Create minimap and timer UI elements (once, they persist across levels)
    this.minimapUI.createMinimap(this.sharedLayer);
    this.timerSystem.createTimerDisplay(this.sharedLayer);

    // 5️⃣ Start level logic (this generates room, spawns player, updates UI)
    this.levelManager.startLevel();
    
    // 6️⃣ Create mobile controls
    this.mobileControls.createMobileControls();
  }

  // Delegate to appropriate systems
  get currentRoom() {
    return this.playerController.currentRoom;
  }

  get level() {
    return this.levelManager.level;
  }

  get roomsCompleted() {
    return this.levelManager.roomsCompleted;
  }

  get popupOpen() {
    return this.popupSystem.popupOpen;
  }

  set popupOpen(value) {
    this.popupSystem.popupOpen = value;
  }

  get popupContainer() {
    return this.popupSystem.popupContainer;
  }

  set popupContainer(value) {
    this.popupSystem.popupContainer = value;
  }

  // Expose necessary methods for systems to access
  clearLevelObjects() {
    // Prevent UI from being destroyed
    if (this.scene.uiLayer) return;
    this.levelManager.clearLevelObjects();
  }

  getTileCenter(rx, ry, col, row) {
    return this.mapGenerator.getTileCenter(rx, ry, col, row);
  }

  generateRoom(rx, ry) {
    return this.mapGenerator.generateRoom(rx, ry);
  }

  updateMinimap() {
    this.minimapUI.updateMinimap();
  }

  showLevelCompletePopup() {
    this.popupSystem.showLevelCompletePopup();
  }
}