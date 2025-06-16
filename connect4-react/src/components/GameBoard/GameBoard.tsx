import { memo } from 'react';
import type { Board } from '../../types/game.types';
import { Cell } from '../Cell/Cell';
import { ROWS, COLS } from '../../utils/gameLogic';
import styles from './GameBoard.module.css';

interface GameBoardProps {
  board: Board;
  winningPieces: [number, number][] | null;
  onCellClick: (col: number) => void;
}

export const GameBoard = memo(({ board, winningPieces, onCellClick }: GameBoardProps) => {
  const isWinningPiece = (row: number, col: number): boolean => {
    if (!winningPieces) return false;
    return winningPieces.some(([r, c]) => r === row && c === col);
  };

  return (
    <div className={styles.gameBoard}>
      {Array.from({ length: ROWS }, (_, row) =>
        Array.from({ length: COLS }, (_, col) => (
          <Cell
            key={`${row}-${col}`}
            value={board[row][col]}
            row={row}
            col={col}
            isWinning={isWinningPiece(row, col)}
            onClick={onCellClick}
          />
        ))
      )}
    </div>
  );
});

GameBoard.displayName = 'GameBoard';
