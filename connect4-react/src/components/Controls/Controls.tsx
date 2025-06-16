import { memo } from 'react';
import type { GameStatus } from '../../types/game.types';
import styles from './Controls.module.css';

interface ControlsProps {
  aiDepth: number;
  onAiDepthChange: (depth: number) => void;
  onResetGame: () => void;
  gameStatus: GameStatus;
}

export const Controls = memo(({ aiDepth, onAiDepthChange, onResetGame, gameStatus }: ControlsProps) => {
  const handleDepthChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    if (!isNaN(value) && value >= 1 && value <= 15) {
      onAiDepthChange(value);
    }
  };

  const showResetButton = gameStatus !== 'waiting';

  return (
    <div className={styles.controls}>
      <label htmlFor="ai-depth" className={styles.label}>
        AI Depth:
      </label>
      <input
        id="ai-depth"
        type="number"
        min="1"
        max="15"
        value={aiDepth}
        onChange={handleDepthChange}
        className={styles.depthInput}
        disabled={gameStatus === 'playing'}
      />
      {showResetButton && (
        <button 
          onClick={onResetGame}
          className={styles.resetButton}
          type="button"
        >
          Reset Game
        </button>
      )}
    </div>
  );
});

Controls.displayName = 'Controls';
