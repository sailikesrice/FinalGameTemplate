import { forwardRef, useLayoutEffect, useRef } from 'react';
import StartGame from './game/main';

export const PhaserGame = forwardRef(function PhaserGame(_, ref) {
  const game = useRef();

  useLayoutEffect(() => {
    if (!game.current) {
      game.current = StartGame("game-container");

      if (ref) {
        ref.current = { game: game.current };
      }
    }

    return () => {
      if (game.current) {
        game.current.destroy(true);
        game.current = null;
      }
    };
  }, [ref]);

  return <div id="game-container"></div>;
});
