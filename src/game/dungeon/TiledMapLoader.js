/**
 * TiledMapLoader - Helper class for loading and using Tiled maps in Phaser
 * 
 * This class provides utilities for loading Tiled maps and integrating them
 * with the existing dungeon system.
 */

export class TiledMapLoader {
  /**
   * Load a Tiled map and create layers
   * @param {Phaser.Scene} scene - The Phaser scene
   * @param {string} mapKey - The key used when loading the map in Preloader
   * @param {string} tilesetKey - The key used when loading the tileset image
   * @param {number} offsetX - X offset for positioning the map
   * @param {number} offsetY - Y offset for positioning the map
   * @returns {Object} Object containing map, layers, and tileset
   */
  static loadMap(scene, mapKey, tilesetKey, offsetX = 0, offsetY = 0) {
    // Create the tilemap
    const map = scene.make.tilemap({ key: mapKey });
    
    // Add the tileset
    const tileset = map.addTilesetImage(tilesetKey, tilesetKey);
    
    // Get or create layers
    const layers = {};
    
    // Try to find common layer names
    const layerNames = ['Walls', 'Floor', 'Floors', 'Background', 'Objects'];
    
    layerNames.forEach(name => {
      const layer = map.getLayer(name);
      if (layer) {
        layers[name] = map.createLayer(name, tileset, offsetX, offsetY);
      }
    });
    
    // If no layers found, try to get the first layer
    if (Object.keys(layers).length === 0) {
      const firstLayer = map.layers[0];
      if (firstLayer) {
        layers[firstLayer.name] = map.createLayer(firstLayer.name, tileset, offsetX, offsetY);
      }
    }
    
    return {
      map,
      tileset,
      layers
    };
  }
  
  /**
   * Set up collision for a wall layer
   * @param {Phaser.Tilemaps.TilemapLayer} wallLayer - The wall layer
   * @param {Object} options - Collision options
   */
  static setupWallCollision(wallLayer, options = {}) {
    if (!wallLayer) return;
    
    // Option 1: Collision by property
    if (options.collisionProperty) {
      wallLayer.setCollisionByProperty({ [options.collisionProperty]: true });
    }
    // Option 2: Collision by exclusion (all tiles except those with a property)
    else if (options.excludeProperty) {
      wallLayer.setCollisionByExclusion([{ [options.excludeProperty]: true }], true);
    }
    // Option 3: Collision for all tiles in layer
    else {
      wallLayer.setCollisionByExclusion([], true);
    }
    
    // Refresh physics bodies
    wallLayer.refreshBody();
  }
  
  /**
   * Get spawn points from an object layer
   * @param {Phaser.Tilemaps.Tilemap} map - The tilemap
   * @param {string} objectLayerName - Name of the object layer
   * @returns {Array} Array of spawn point objects with x, y coordinates
   */
  static getSpawnPoints(map, objectLayerName = 'SpawnPoints') {
    const objectLayer = map.getObjectLayer(objectLayerName);
    if (!objectLayer) return [];
    
    return objectLayer.objects.map(obj => ({
      x: obj.x,
      y: obj.y,
      name: obj.name || 'spawn',
      properties: obj.properties || {}
    }));
  }
  
  /**
   * Get objects from an object layer
   * @param {Phaser.Tilemaps.Tilemap} map - The tilemap
   * @param {string} objectLayerName - Name of the object layer
   * @returns {Array} Array of objects
   */
  static getObjects(map, objectLayerName) {
    const objectLayer = map.getObjectLayer(objectLayerName);
    if (!objectLayer) return [];
    
    return objectLayer.objects;
  }
  
  /**
   * Get tile properties at a specific position
   * @param {Phaser.Tilemaps.TilemapLayer} layer - The layer to check
   * @param {number} x - Tile X coordinate
   * @param {number} y - Tile Y coordinate
   * @returns {Object} Tile properties or null
   */
  static getTileProperties(layer, x, y) {
    if (!layer) return null;
    
    const tile = layer.getTileAt(x, y);
    if (!tile) return null;
    
    return tile.properties || {};
  }
  
  /**
   * Check if a tile has a specific property
   * @param {Phaser.Tilemaps.TilemapLayer} layer - The layer to check
   * @param {number} x - Tile X coordinate
   * @param {number} y - Tile Y coordinate
   * @param {string} property - Property name to check
   * @returns {boolean} True if tile has the property
   */
  static hasTileProperty(layer, x, y, property) {
    const props = this.getTileProperties(layer, x, y);
    return props && props[property] === true;
  }
}

