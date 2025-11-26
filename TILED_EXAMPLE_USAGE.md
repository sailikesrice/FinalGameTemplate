# Tiled Example Usage

This document shows practical examples of using Tiled maps in your game.

## Example 1: Loading a Tiled Map in Preloader

Add this to your `Preloader.js`:

```javascript
preload() {
  // Existing asset loading...
  this.load.image("player", "assets/player.png");
  this.load.image("floor", "assets/floor.png");
  this.load.image("wall", "assets/wall.png");
  
  // Load Tiled map assets
  // Option 1: If you created a combined tileset image
  this.load.image('tileset', 'assets/tileset.png');
  this.load.tilemapTiledJSON('room-template', 'assets/maps/room-template.json');
  
  // Option 2: If using individual images (collection of images in Tiled)
  // The images are already loaded above, just load the map
  this.load.tilemapTiledJSON('room-template', 'assets/maps/room-template.json');
  
  // Load multiple room templates
  this.load.tilemapTiledJSON('room-basic', 'assets/maps/room-basic.json');
  this.load.tilemapTiledJSON('room-puzzle', 'assets/maps/room-puzzle.json');
  this.load.tilemapTiledJSON('room-boss', 'assets/maps/room-boss.json');
}
```

## Example 2: Using Tiled Maps in Dungeon Scene

### Basic Integration

```javascript
// In Dungeon.js create() method
create() {
  // ... existing code ...
  
  // Option 1: Use TiledMapLoader helper
  import { TiledMapLoader } from '../dungeon/TiledMapLoader';
  
  // Load a room template
  const roomData = TiledMapLoader.loadMap(
    this,
    'room-template', // map key from Preloader
    'tileset', // tileset key
    0, // offsetX
    0  // offsetY
  );
  
  // Set up collision
  if (roomData.layers['Walls']) {
    TiledMapLoader.setupWallCollision(roomData.layers['Walls']);
    this.physics.add.collider(this.player, roomData.layers['Walls']);
  }
}
```

### Using TiledRoom Class

```javascript
// In Dungeon.js
import { TiledRoom } from '../dungeon/TiledRoom';

// In generateRoom method
generateRoom(rx, ry) {
  const roomKey = `${rx},${ry}`;
  if (this.rooms[roomKey]) return;
  
  // Choose room template based on room type
  let mapKey = 'room-basic';
  if (rx === 0 && ry === 0) {
    mapKey = 'room-start';
  } else if (this.isBossRoom(rx, ry)) {
    mapKey = 'room-boss';
  }
  
  // Create Tiled room
  const room = new TiledRoom(this, rx, ry, mapKey, 'tileset');
  room.build();
  
  this.rooms[roomKey] = room;
}
```

## Example 3: Creating a Tileset in Tiled

### Step-by-Step:

1. **Open Tiled**
2. **Create New Tileset:**
   - `Map` → `New Tileset...`
   - Choose "Collection of Images"
   - Click "Add Tiles"
   - Select your `wall.png` and `floor.png` files
   - Set tile size to 32x32
   - Save as `tileset.tsx`

3. **Create a Room Map:**
   - `File` → `New` → `New Map`
   - Orientation: Orthogonal
   - Tile size: 32x32
   - Map size: 7x7 (matching your ROOM_SIZE)
   - Add your tileset to the map

4. **Design the Room:**
   - Paint walls around edges
   - Paint floors in center
   - Leave gaps for doorways

5. **Add Object Layers:**
   - Add layer: `SpawnPoints`
   - Add a point object at the center
   - Add layer: `PuzzleTiles`
   - Add point objects where puzzle tiles should appear

6. **Set Tile Properties:**
   - Select wall tiles
   - In Properties panel, add property: `collides` = `true`
   - This will be used for collision detection

7. **Export:**
   - `File` → `Export As...`
   - Choose "JSON map files (*.json)"
   - Save to `public/assets/maps/room-template.json`

## Example 4: Hybrid Approach

Keep your procedural generation but use Tiled for special rooms:

```javascript
// In Room.js or Dungeon.js
generateRoom(rx, ry) {
  const roomKey = `${rx},${ry}`;
  
  // Use Tiled for special rooms
  if (this.isSpecialRoom(rx, ry)) {
    return this.generateTiledRoom(rx, ry);
  }
  
  // Use procedural generation for regular rooms
  return this.generateProceduralRoom(rx, ry);
}

generateTiledRoom(rx, ry) {
  const room = new TiledRoom(this, rx, ry, 'room-special', 'tileset');
  return room.build();
}
```

## Example 5: Full Level from Tiled

Instead of procedurally generating rooms, load entire levels:

```javascript
// In Preloader
preload() {
  this.load.tilemapTiledJSON('level1', 'assets/maps/level1.json');
  this.load.tilemapTiledJSON('level2', 'assets/maps/level2.json');
}

// In Dungeon.js
startLevel() {
  const levelKey = `level${this.level}`;
  
  // Load entire level map
  const mapData = TiledMapLoader.loadMap(this, levelKey, 'tileset', 0, 0);
  
  // Set up all layers
  Object.values(mapData.layers).forEach(layer => {
    if (layer.name.includes('Wall')) {
      TiledMapLoader.setupWallCollision(layer);
      this.physics.add.collider(this.player, layer);
    }
  });
  
  // Get spawn point from map
  const spawnPoints = TiledMapLoader.getSpawnPoints(mapData.map, 'SpawnPoints');
  if (spawnPoints.length > 0) {
    const spawn = spawnPoints[0];
    this.playerCtrl.spawnAtWorld(spawn.x, spawn.y);
  }
}
```

## Example 6: Custom Properties

In Tiled, add custom properties to tiles:

1. Select a tile
2. In Properties panel, add:
   - `roomType`: "puzzle"
   - `difficulty`: 1
   - `collides`: true

Use in code:

```javascript
const props = TiledMapLoader.getTileProperties(layer, tileX, tileY);
if (props.roomType === 'puzzle') {
  // Handle puzzle room
}

if (TiledMapLoader.hasTileProperty(layer, tileX, tileY, 'collides')) {
  // Tile is collidable
}
```

## Troubleshooting

### Map doesn't load
- Check file path in Preloader matches actual file location
- Ensure JSON file is valid (open in text editor to check)
- Check browser console for 404 errors

### Tiles don't appear
- Verify tileset image path in JSON file
- Check tileset name matches in code
- Ensure tile size is 32x32

### Collision doesn't work
- Make sure you call `setupWallCollision()`
- Verify collision property is set in Tiled
- Check that physics collider is added

## Next Steps

1. Install Tiled
2. Create a simple 7x7 room map
3. Export as JSON
4. Load it in Preloader
5. Test loading in Dungeon scene
6. Gradually replace procedural rooms with Tiled designs

