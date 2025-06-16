import { memo } from 'react';
import type { Cell as CellType, Player } from '../../types/game.types';
import styles from './Cell.module.css';

interface CellProps {
  value: CellType;
  row: number;
  col: number;
  isWinning: boolean;
  onClick: (col: number) => void;
}

export const Cell = memo(({ value, row, col, isWinning, onClick }: CellProps) => {
  const handleClick = () => {
    onClick(col);
  };

  const getCellClasses = () => {
    const classes = [styles.cell];
    
    if (value === 1) {
      classes.push(styles.player1);
    } else if (value === 2) {
      classes.push(styles.player2);
    }
    
    if (isWinning) {
      classes.push(styles.winning);
    }
    
    return classes.join(' ');
  };

  return (
    <div
      className={getCellClasses()}
      data-row={row}
      data-col={col}
      onClick={handleClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleClick();
        }
      }}
    />
  );
});

Cell.displayName = 'Cell';
