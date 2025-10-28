import { TILE_SIZE, ROOM_SIZE, ROOMS_PER_LEVEL } from './Constants.js';

export class MapGenerator {
  constructor(scene) {
    this.scene = scene;
  }

  generateMapLayout() {
    const layout = new Set();
    let current = { x: 0, y: 0 };
    layout.add("0,0");

    while (layout.size < ROOMS_PER_LEVEL) {
      const dir = Phaser.Math.RND.pick([
        { x: 1, y: 0 },
        { x: -1, y: 0 },
        { x: 0, y: 1 },
        { x: 0, y: -1 }
      ]);
      const next = { x: current.x + dir.x, y: current.y + dir.y };
      const key = `${next.x},${next.y}`;
      layout.add(key);
      current = next;
    }

    return Array.from(layout).map(str => {
      const [x, y] = str.split(",").map(Number);
      return { x, y };
    });
  }

  generateRoom(rx, ry) {
    const roomKey = `${rx},${ry}`;
    if (this.scene.rooms[roomKey]) return;

    // Check if this coordinate is part of map layout
    if (!this.scene.levelManager.mapLayout.find(r => r.x === rx && r.y === ry)) return;

    const offsetX = rx * ROOM_SIZE * TILE_SIZE;
    const offsetY = ry * ROOM_SIZE * TILE_SIZE;

    const walls = this.scene.add.group();
    const floors = this.scene.add.group();
    const puzzleTiles = [];

    for (let row = 0; row < ROOM_SIZE; row++) {
      for (let col = 0; col < ROOM_SIZE; col++) {
        const x = offsetX + col * TILE_SIZE + TILE_SIZE / 2;
        const y = offsetY + row * TILE_SIZE + TILE_SIZE / 2;

        const isWall = row === 0 || col === 0 || row === ROOM_SIZE - 1 || col === ROOM_SIZE - 1;

        if (isWall) {
          const neighbors = [
            { x: rx, y: ry - 1, row: 0, col: Math.floor(ROOM_SIZE / 2) },
            { x: rx, y: ry + 1, row: ROOM_SIZE - 1, col: Math.floor(ROOM_SIZE / 2) },
            { x: rx - 1, y: ry, row: Math.floor(ROOM_SIZE / 2), col: 0 },
            { x: rx + 1, y: ry, row: Math.floor(ROOM_SIZE / 2), col: ROOM_SIZE - 1 }
          ];

          const passage = neighbors.some(
            n => n.row === row && n.col === col &&
              this.scene.levelManager.mapLayout.find(r => r.x === n.x && r.y === n.y)
          );

          if (!passage) {
            // Use the main static group so we can clear all walls later
            const wall = this.scene.walls.create(x, y, "wall");
            wall.setDisplaySize(TILE_SIZE, TILE_SIZE);
            wall.refreshBody();
            wall.setDepth(2);
            walls.add(wall);
          } else {
            const floor = this.scene.add.image(x, y, "floor");
            floor.setDisplaySize(TILE_SIZE, TILE_SIZE);
            floor.setTint(0x666666);
            floors.add(floor);
          }
        } else {
          const floor = this.scene.add.image(x, y, "floor");
          floor.setDisplaySize(TILE_SIZE, TILE_SIZE);
          floor.setTint(0x222222);
          floors.add(floor);
        }
      }
    }

    // Add a random puzzle if not the starting room
    let solved = true;
    let equation = null;
    let tileMap = null;
    if (!(rx === 0 && ry === 0)) {
      // Create puzzle only if puzzleSystem is available
      if (this.scene.puzzleSystem) {
        const puzzle = this.scene.puzzleSystem.createRandomEquationPuzzle(rx, ry, offsetX, offsetY);
        puzzleTiles.push(...puzzle.tiles);
        equation = puzzle.equation;
        tileMap = puzzle.tileMap;
        solved = false;
      }
    }

    this.scene.rooms[roomKey] = { walls, floors, puzzleTiles, solved, equation, tileMap };
  }

  getTileCenter(rx, ry, col, row) {
    const x = rx * ROOM_SIZE * TILE_SIZE + col * TILE_SIZE + TILE_SIZE / 2;
    const y = ry * ROOM_SIZE * TILE_SIZE + row * TILE_SIZE + TILE_SIZE / 2;
    return { x, y };
  }

  getMapCenter(layout) {
    // Find min/max X and Y of rooms to calculate bounds
    const xs = layout.map(r => r.x);
    const ys = layout.map(r => r.y);
    const minX = Math.min(...xs);
    const maxX = Math.max(...xs);
    const minY = Math.min(...ys);
    const maxY = Math.max(...ys);

    const width = (maxX - minX + 1) * ROOM_SIZE * TILE_SIZE;
    const height = (maxY - minY + 1) * ROOM_SIZE * TILE_SIZE;

    return {
      offsetX: -(minX * ROOM_SIZE * TILE_SIZE) + width / 2,
      offsetY: -(minY * ROOM_SIZE * TILE_SIZE) + height / 2,
      width,
      height
    };
  }
}
