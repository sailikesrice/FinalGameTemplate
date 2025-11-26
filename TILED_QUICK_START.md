# Tiled Quick Start Guide

A simple step-by-step guide to get you started with Tiled in 5 minutes.

## Step 1: Install Tiled (2 minutes)

1. Go to https://www.mapeditor.org/
2. Download and install Tiled
3. Open Tiled

## Step 2: Create Your First Room Map (3 minutes)

### Create a New Map:
1. `File` → `New` → `New Map`
2. Settings:
   - **Orientation**: Orthogonal
   - **Tile size**: 32 x 32
   - **Map size**: 7 x 7 tiles (matches your ROOM_SIZE)
3. Click OK

### Add Your Tileset:
1. `Map` → `New Tileset...`
2. Choose **"Collection of Images"**
3. Click **"Add Tiles"**
4. Navigate to your `public/assets/` folder
5. Select `wall.png` and `floor.png`
6. Set **Tile size**: 32 x 32
7. Click OK

### Design Your Room:
1. Select the **wall** tile from the tileset panel
2. Paint walls around the edges of the 7x7 grid
3. Select the **floor** tile
4. Paint floors in the center
5. Leave gaps for doorways (one tile on each side)

### Export:
1. `File` → `Export As...`
2. Choose **"JSON map files (*.json)"**
3. Save to: `public/assets/maps/room-template.json`
4. Click Save

## Step 3: Load in Your Game (2 minutes)

### Update Preloader.js:

Add this to the `preload()` method:

```javascript
// Load Tiled map
this.load.tilemapTiledJSON('room-template', 'assets/maps/room-template.json');
```

### Test Loading in Dungeon.js:

Add this temporarily to test (in the `create()` method):

```javascript
// Test Tiled map loading
import { TiledMapLoader } from '../dungeon/TiledMapLoader';

const mapData = TiledMapLoader.loadMap(this, 'room-template', 'wall', 0, 0);
console.log('Tiled map loaded:', mapData);
```

## Step 4: Verify It Works

1. Run your game
2. Check browser console - you should see "Tiled map loaded"
3. If you see errors, check:
   - File path is correct
   - JSON file exists
   - Tileset images are in the right place

## That's It!

You've successfully:
- ✅ Created a Tiled map
- ✅ Exported it as JSON
- ✅ Loaded it in Phaser

## Next Steps

Now you can:
1. Create more room templates (puzzle rooms, boss rooms, etc.)
2. Use the `TiledRoom` class to replace procedural rooms
3. Design entire levels in Tiled
4. Add object layers for spawn points and puzzle positions

See `TILED_INTEGRATION_GUIDE.md` for detailed documentation and `TILED_EXAMPLE_USAGE.md` for code examples.

## Common Issues

**"Map not found" error:**
- Check the file path in Preloader matches the actual file location
- Make sure the JSON file is in `public/assets/maps/`

**"Tileset image not found" error:**
- The JSON file references images - make sure those images exist
- Check the image paths in the JSON file (open it in a text editor)

**Tiles don't appear:**
- Make sure you're using the correct tileset key in `loadMap()`
- For "Collection of Images", use the image key (e.g., 'wall' or 'floor')

## Need Help?

- Check `TILED_INTEGRATION_GUIDE.md` for detailed instructions
- Check `TILED_EXAMPLE_USAGE.md` for code examples
- Tiled Documentation: https://doc.mapeditor.org/
- Phaser Tilemap Docs: https://photonstorm.github.io/phaser3-docs/

