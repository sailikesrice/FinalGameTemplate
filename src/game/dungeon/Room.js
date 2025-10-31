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

    for (let row = 0; row < ROOM_SIZE; row++) {
      for (let col = 0; col < ROOM_SIZE; col++) {
        const x = offsetX + col * TILE_SIZE + TILE_SIZE / 2;
        const y = offsetY + row * TILE_SIZE + TILE_SIZE / 2;
        const isWall = row === 0 || col === 0 || row === ROOM_SIZE - 1 || col === ROOM_SIZE - 1;

        if (isWall) {
          const neighbors = [
            { x: this.rx, y: this.ry - 1, row: 0, col: Math.floor(ROOM_SIZE / 2) },
            { x: this.rx, y: this.ry + 1, row: ROOM_SIZE - 1, col: Math.floor(ROOM_SIZE / 2) },
            { x: this.rx - 1, y: this.ry, row: Math.floor(ROOM_SIZE / 2), col: 0 },
            { x: this.rx + 1, y: this.ry, row: Math.floor(ROOM_SIZE / 2), col: ROOM_SIZE - 1 }
          ];
          const passage = neighbors.some(n => n.row === row && n.col === col && this.mapLayout.find(r => r.x === n.x && r.y === n.y));

          if (!passage) {
            const wall = this.wallsGroup.create(x, y, 'wall');
            wall.setDisplaySize(TILE_SIZE, TILE_SIZE);
            wall.refreshBody();
            wall.setDepth(2);
            this.walls.add(wall);
          } else {
            const floor = this.scene.add.image(x, y, 'floor');
            floor.setDisplaySize(TILE_SIZE, TILE_SIZE);
            floor.setTint(0x666666);
            this.floors.add(floor);
          }
        } else {
          const floor = this.scene.add.image(x, y, 'floor');
          floor.setDisplaySize(TILE_SIZE, TILE_SIZE);
          floor.setTint(0x222222);
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


