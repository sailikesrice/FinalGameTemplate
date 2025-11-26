import { TILE_SIZE, ROOM_SIZE } from './constants';
import { EquationPuzzle } from './EquationPuzzle';

export class Room {
  constructor(scene, rx, ry, mapLayout, wallsGroup) {
    this.scene = scene;
    this.rx = rx;
    this.ry = ry;
    this.mapLayout = mapLayout;
    this.wallsGroup = wallsGroup;

    this.walls = this.scene.add.group();
    this.floors = this.scene.add.group();
    this.puzzleTiles = [];
    this.equation = null;
    this.equationPuzzle = null;
    this.tileMap = null;
    this.solved = (rx === 0 && ry === 0);
  }

  build() {
    console.log('[Room] build:', { rx: this.rx, ry: this.ry });
    const offsetX = this.rx * ROOM_SIZE * TILE_SIZE;
    const offsetY = this.ry * ROOM_SIZE * TILE_SIZE;

    // Check for neighboring rooms to determine passages
    const neighbors = [
      { x: this.rx, y: this.ry - 1, row: 0, col: Math.floor(ROOM_SIZE / 2), direction: 'top' },
      { x: this.rx, y: this.ry + 1, row: ROOM_SIZE - 1, col: Math.floor(ROOM_SIZE / 2), direction: 'bottom' },
      { x: this.rx - 1, y: this.ry, row: Math.floor(ROOM_SIZE / 2), col: 0, direction: 'left' },
      { x: this.rx + 1, y: this.ry, row: Math.floor(ROOM_SIZE / 2), col: ROOM_SIZE - 1, direction: 'right' }
    ];
    
    const passages = {};
    neighbors.forEach(n => {
      if (this.mapLayout.find(r => r.x === n.x && r.y === n.y)) {
        passages[n.direction] = { row: n.row, col: n.col };
      }
    });

    for (let row = 0; row < ROOM_SIZE; row++) {
      for (let col = 0; col < ROOM_SIZE; col++) {
        const x = offsetX + col * TILE_SIZE + TILE_SIZE / 2;
        const y = offsetY + row * TILE_SIZE + TILE_SIZE / 2;
        const isWall = row === 0 || col === 0 || row === ROOM_SIZE - 1 || col === ROOM_SIZE - 1;

        if (isWall) {
          // Determine if this is a corner, edge, or passage
          const isCorner = (row === 0 && col === 0) || 
                          (row === 0 && col === ROOM_SIZE - 1) ||
                          (row === ROOM_SIZE - 1 && col === 0) ||
                          (row === ROOM_SIZE - 1 && col === ROOM_SIZE - 1);
          
          const isTopEdge = row === 0 && col !== 0 && col !== ROOM_SIZE - 1;
          const isBottomEdge = row === ROOM_SIZE - 1 && col !== 0 && col !== ROOM_SIZE - 1;
          const isLeftEdge = col === 0 && row !== 0 && row !== ROOM_SIZE - 1;
          const isRightEdge = col === ROOM_SIZE - 1 && row !== 0 && row !== ROOM_SIZE - 1;
          
          // Check if this position is a passage (door)
          const isTopPassage = passages.top && passages.top.row === row && passages.top.col === col;
          const isBottomPassage = passages.bottom && passages.bottom.row === row && passages.bottom.col === col;
          const isLeftPassage = passages.left && passages.left.row === row && passages.left.col === col;
          const isRightPassage = passages.right && passages.right.row === row && passages.right.col === col;

          let assetKey = 'wall'; // fallback
          
          if (isCorner) {
            // Corner walls
            if (row === 0 && col === 0) assetKey = 'topleft-wall';
            else if (row === 0 && col === ROOM_SIZE - 1) assetKey = 'topright-wall';
            else if (row === ROOM_SIZE - 1 && col === 0) assetKey = 'bottomleft-wall';
            else if (row === ROOM_SIZE - 1 && col === ROOM_SIZE - 1) assetKey = 'bottomright-wall';
          } else if (isTopPassage) {
            assetKey = 'top-door';
          } else if (isBottomPassage) {
            assetKey = 'bottom-door';
          } else if (isLeftPassage) {
            assetKey = 'left-door';
          } else if (isRightPassage) {
            assetKey = 'right-door';
          } else if (isTopEdge) {
            assetKey = 'top-wall';
          } else if (isBottomEdge) {
            assetKey = 'bottom-wall';
          } else if (isLeftEdge) {
            assetKey = 'left-wall';
          } else if (isRightEdge) {
            assetKey = 'right-wall';
          }

          // If it's a passage (door), add as floor (non-collidable) but with door texture
          if (isTopPassage || isBottomPassage || isLeftPassage || isRightPassage) {
            const door = this.scene.add.image(x, y, assetKey);
            door.setDisplaySize(TILE_SIZE, TILE_SIZE);
            door.setDepth(1);
            this.floors.add(door);
          } else {
            // It's a wall (collidable)
            const wall = this.wallsGroup.create(x, y, assetKey);
            wall.setDisplaySize(TILE_SIZE, TILE_SIZE);
            wall.refreshBody();
            wall.setDepth(2);
            this.walls.add(wall);
          }
        } else {
          // Interior floor
          const floor = this.scene.add.image(x, y, 'floor');
          floor.setDisplaySize(TILE_SIZE, TILE_SIZE);
          floor.setDepth(0);
          this.floors.add(floor);
        }
      }
    }

    if (!(this.rx === 0 && this.ry === 0)) {
      this.equationPuzzle = new EquationPuzzle(this.scene, this.rx, this.ry, offsetX, offsetY);
      const puzzle = this.equationPuzzle.create();
      this.puzzleTiles.push(...puzzle.tiles);
      this.equation = puzzle.equation;
      this.tileMap = puzzle.tileMap;
      this.solved = false;
    }

    return this;
  }
}


