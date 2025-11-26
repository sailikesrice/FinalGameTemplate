# Tiled Integration Guide for Phaser

This guide will help you integrate Tiled map editor with your Phaser game.

## Step 1: Install Tiled

1. Download Tiled from: https://www.mapeditor.org/
2. Install it on your system
3. Tiled is free and open-source

## Step 2: Create a Tileset

### Option A: Create a Combined Tileset Image (Recommended)

1. **Combine your tiles into a single image:**
   - Create a tileset image (e.g., `tileset.png`) that contains all your tiles
   - For your current setup, you need:
     - Wall tile (32x32)
     - Floor tile (32x32)
   - Arrange them in a grid (e.g., 2 tiles wide, 1 tile tall)

2. **In Tiled:**
   - Open Tiled
   - Go to `Map` → `New Tileset...`
   - Choose "Based on Tileset Image"
   - Browse to your tileset image
   - Set tile size to **32x32** (matching your TILE_SIZE constant)
   - Save the tileset (e.g., `tileset.tsx`)

### Option B: Use Individual Images (Collection of Images)

1. **In Tiled:**
   - Go to `Map` → `New Tileset...`
   - Choose "Collection of Images"
   - Add your individual images (wall.png, floor.png)
   - Set tile size to **32x32**
   - Save the tileset

## Step 3: Create a Tilemap

1. **Create a new map:**
   - `File` → `New` → `New Map`
   - Choose "Orthogonal" orientation
   - Set tile size to **32x32**
   - Set map size (e.g., 7x7 for a single room, or larger for full levels)
   - Save as `room.tmx` or `level.tmx`

2. **Design your room:**
   - Select tiles from your tileset
   - Paint walls around the edges
   - Paint floors in the center
   - Leave passages where doors should be

3. **Add Object Layers (Optional):**
   - Add an object layer for puzzle tile positions
   - Add spawn points
   - Add collision areas

## Step 4: Export the Map

1. **Export as JSON:**
   - `File` → `Export As...`
   - Choose "JSON map files (*.json)"
   - Save to `public/assets/maps/` directory
   - Name it something like `room.json` or `level1.json`

2. **Export tileset (if using image-based tileset):**
   - The tileset image should be in the same directory or referenced correctly
   - Make sure the path in the JSON is relative to your assets folder

## Step 5: Load Tiled Maps in Phaser

### Update Preloader to Load Maps

The Preloader scene needs to load:
1. The tileset image (if using image-based tileset)
2. The JSON map file

### Example Code Structure

```javascript
// In Preloader.js
preload() {
  // Load tileset image
  this.load.image('tileset', 'assets/tileset.png');
  
  // Load Tiled map JSON
  this.load.tilemapTiledJSON('room-map', 'assets/maps/room.json');
  
  // Or load multiple maps
  this.load.tilemapTiledJSON('level1', 'assets/maps/level1.json');
  this.load.tilemapTiledJSON('level2', 'assets/maps/level2.json');
}
```

## Step 6: Use Tiled Maps in Your Game

### Basic Usage in Dungeon Scene

```javascript
// In Dungeon.js create() method
create() {
  // Load the tilemap
  const map = this.make.tilemap({ key: 'room-map' });
  
  // Load the tileset
  const tileset = map.addTilesetImage('tileset', 'tileset');
  
  // Create layers
  const floorLayer = map.createLayer('Floor', tileset, 0, 0);
  const wallLayer = map.createLayer('Walls', tileset, 0, 0);
  
  // Set collision for walls
  wallLayer.setCollisionByProperty({ collides: true });
  
  // Add physics colliders
  this.physics.add.collider(this.player, wallLayer);
}
```

## Step 7: Integration with Your Current System

Your current system uses:
- `Room.js` - builds rooms programmatically
- `MapGenerator.js` - generates room layouts
- Individual images for walls/floors

### Hybrid Approach (Recommended)

You can use Tiled for:
1. **Pre-designed room templates** - Create different room layouts in Tiled
2. **Level layouts** - Design entire levels instead of procedurally generating
3. **Special rooms** - Boss rooms, treasure rooms, etc.

### Option 1: Replace Procedural Generation

Replace `MapGenerator` with Tiled map loading.

### Option 2: Use Tiled for Room Templates

Keep procedural generation but use Tiled-designed room templates.

## Step 8: Advanced Features

### Object Layers for Spawn Points

```javascript
// In Tiled, add an object layer with points named "spawn"
const spawnPoints = map.getObjectLayer('SpawnPoints');
spawnPoints.objects.forEach(point => {
  // Use point.x, point.y for spawn locations
});
```

### Custom Properties

In Tiled, you can add custom properties to tiles:
- `collides: true` - for collision
- `roomType: "puzzle"` - for room types
- `difficulty: 1` - for difficulty levels

Access them in Phaser:
```javascript
const tile = wallLayer.getTileAt(x, y);
if (tile && tile.properties.collides) {
  // Handle collision
}
```

## Step 9: File Structure

Recommended structure:
```
public/
  assets/
    maps/
      room.json
      level1.json
      level2.json
    tileset.png
    wall.png
    floor.png
    player.png
    ...
```

## Step 10: Tips and Best Practices

1. **Keep tile size consistent** - Always use 32x32 to match your constants
2. **Name layers clearly** - Use names like "Floor", "Walls", "Objects"
3. **Use object layers** - For spawn points, puzzle positions, etc.
4. **Export as JSON** - Phaser works best with JSON format
5. **Relative paths** - Make sure image paths in JSON are relative to your assets folder
6. **Test incrementally** - Start with a simple room, then expand

## Troubleshooting

### Map not loading?
- Check file paths are correct
- Ensure JSON file is in the right location
- Check browser console for errors

### Tiles not displaying?
- Verify tileset image path in JSON
- Check tileset name matches in code
- Ensure tile size matches (32x32)

### Collision not working?
- Make sure collision layer is set up correctly
- Check `setCollisionByProperty` or `setCollisionByExclusion`
- Verify physics world is enabled

## Next Steps

1. Install Tiled
2. Create your first tileset
3. Design a simple room
4. Export as JSON
5. Load it in your Preloader
6. Integrate with your Dungeon scene

For more help, check:
- Tiled Documentation: https://doc.mapeditor.org/
- Phaser Tilemap Docs: https://photonstorm.github.io/phaser3-docs/Phaser.Tilemaps.Tilemap.html

