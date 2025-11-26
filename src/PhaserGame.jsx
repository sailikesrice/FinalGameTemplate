/ * DO NOT TOUCH * /

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
      
      // Handle window resize for responsive scaling
      const handleResize = () => {
        if (game.current && game.current.scale) {
          game.current.scale.resize(window.innerWidth, window.innerHeight);
        }
      };
      
      window.addEventListener('resize', handleResize);
      window.addEventListener('orientationchange', handleResize);
      
      // Store cleanup function
      game.current._resizeHandlers = { handleResize };
    }

    return () => {
      if (game.current) {
        // Remove resize listeners
        if (game.current._resizeHandlers) {
          window.removeEventListener('resize', game.current._resizeHandlers.handleResize);
          window.removeEventListener('orientationchange', game.current._resizeHandlers.handleResize);
        }
        game.current.destroy(true);
        game.current = null;
      }
    };
  }, [ref]);

  return <div id="game-container"></div>;
});
