/**
 * TiledRoom - Example implementation of a room using Tiled maps
 * 
 * This is an alternative to the procedural Room.js that uses Tiled-designed maps.
 * You can use this as a reference or replace Room.js with this approach.
 */

import { TILE_SIZE, ROOM_SIZE } from './constants';
import { TiledMapLoader } from './TiledMapLoader';

export class TiledRoom {
  constructor(scene, rx, ry, mapKey, tilesetKey) {
    this.scene = scene;
    this.rx = rx;
    this.ry = ry;
    this.mapKey = mapKey; // e.g., 'room-map' or 'room-template'
    this.tilesetKey = tilesetKey; // e.g., 'tileset'
    
    this.map = null;
    this.layers = {};
    this.wallsLayer = null;
    this.floorLayer = null;
    this.solved = (rx === 0 && ry === 0);
  }

  build() {
    console.log('[TiledRoom] build:', { rx: this.rx, ry: this.ry });
    
    // Calculate offset for this room's position
    const offsetX = this.rx * ROOM_SIZE * TILE_SIZE;
    const offsetY = this.ry * ROOM_SIZE * TILE_SIZE;
    
    // Load the Tiled map
    const mapData = TiledMapLoader.loadMap(
      this.scene,
      this.mapKey,
      this.tilesetKey,
      offsetX,
      offsetY
    );
    
    this.map = mapData.map;
    this.layers = mapData.layers;
    
    // Find wall and floor layers (adjust names to match your Tiled map)
    this.wallsLayer = this.layers['Walls'] || this.layers['Wall'] || Object.values(this.layers)[0];
    this.floorLayer = this.layers['Floor'] || this.layers['Floors'] || Object.values(this.layers)[1];
    
    // Set up collision for walls
    if (this.wallsLayer) {
      TiledMapLoader.setupWallCollision(this.wallsLayer, {
        collisionProperty: 'collides' // Adjust based on your Tiled properties
      });
      
      // Add walls to the scene's walls group for physics
      // Note: You may need to manually add colliders in the Dungeon scene
    }
    
    // Get spawn points if they exist in the map
    const spawnPoints = TiledMapLoader.getSpawnPoints(this.map, 'SpawnPoints');
    if (spawnPoints.length > 0) {
      this.spawnPoint = spawnPoints[0]; // Use first spawn point
    }
    
    // Get puzzle positions if they exist
    const puzzleObjects = TiledMapLoader.getObjects(this.map, 'PuzzleTiles');
    this.puzzlePositions = puzzleObjects;
    
    return this;
  }
  
  /**
   * Get the spawn position for this room
   * @returns {Object} {x, y} coordinates
   */
  getSpawnPosition() {
    if (this.spawnPoint) {
      return {
        x: this.spawnPoint.x + (this.rx * ROOM_SIZE * TILE_SIZE),
        y: this.spawnPoint.y + (this.ry * ROOM_SIZE * TILE_SIZE)
      };
    }
    
    // Default to center if no spawn point
    const centerX = this.rx * ROOM_SIZE * TILE_SIZE + (ROOM_SIZE * TILE_SIZE) / 2;
    const centerY = this.ry * ROOM_SIZE * TILE_SIZE + (ROOM_SIZE * TILE_SIZE) / 2;
    return { x: centerX, y: centerY };
  }
  
  /**
   * Check if a position is a wall
   * @param {number} worldX - World X coordinate
   * @param {number} worldY - World Y coordinate
   * @returns {boolean} True if position is a wall
   */
  isWall(worldX, worldY) {
    if (!this.wallsLayer) return false;
    
    // Convert world coordinates to tile coordinates
    const tileX = this.wallsLayer.worldToTileX(worldX);
    const tileY = this.wallsLayer.worldToTileY(worldY);
    
    const tile = this.wallsLayer.getTileAt(tileX, tileY);
    return tile !== null;
  }
  
  /**
   * Clean up the room
   */
  destroy() {
    if (this.map) {
      // Destroy layers
      Object.values(this.layers).forEach(layer => {
        if (layer && layer.destroy) {
          layer.destroy();
        }
      });
      
      // Destroy the map
      if (this.map.destroy) {
        this.map.destroy();
      }
    }
  }
}

