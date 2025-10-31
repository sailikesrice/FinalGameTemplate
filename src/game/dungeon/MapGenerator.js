import Phaser from 'phaser';
import { GameSettings } from './GameSettings';

export class MapGenerator {
  generateLayout() {
    console.log('[MapGenerator] generateLayout start');
    const ROOMS_PER_LEVEL = GameSettings.getRoomsPerLevel();
    const layout = new Set();
    let current = { x: 0, y: 0 };
    layout.add('0,0');

    while (layout.size < ROOMS_PER_LEVEL) {
      const dir = Phaser.Math.RND.pick([
        { x: 1, y: 0 },
        { x: -1, y: 0 },
        { x: 0, y: 1 },
        { x: 0, y: -1 }
      ]);
      const next = { x: current.x + dir.x, y: current.y + dir.y };
      layout.add(`${next.x},${next.y}`);
      current = next;
    }

    const result = Array.from(layout).map(str => {
      const [x, y] = str.split(',').map(Number);
      return { x, y };
    });
    console.log('[MapGenerator] generateLayout result', { rooms: result.length, sample: result.slice(0, 6) });
    return result;
  }
}


