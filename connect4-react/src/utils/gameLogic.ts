import type { Board, Player } from '../types/game.types';

export const ROWS = 6;
export const COLS = 7;
export const FIRST_PLAYER: Player = 1;
export const SECOND_PLAYER: Player = 2;

/**
 * Create an empty game board
 */
export function createEmptyBoard(): Board {
  return Array.from({ length: ROWS }, () => Array(COLS).fill(0));
}

/**
 * Get the next available row in a column (gravity simulation)
 */
export function getNextOpenRow(board: Board, col: number): number | null {
  for (let r = ROWS - 1; r >= 0; r--) {
    if (board[r][col] === 0) {
      return r;
    }
  }
  return null;
}

/**
 * Drop a piece into the board
 */
export function dropPiece(board: Board, row: number, col: number, piece: Player): Board {
  const newBoard = board.map(row => [...row]);
  newBoard[row][col] = piece;
  return newBoard;
}

/**
 * Check if a player has won the game
 */
export function checkWin(board: Board, piece: Player): [number, number][] | null {
  // Horizontal check
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c <= COLS - 4; c++) {
      if (board[r][c] === piece && 
          board[r][c + 1] === piece && 
          board[r][c + 2] === piece && 
          board[r][c + 3] === piece) {
        return [[r, c], [r, c + 1], [r, c + 2], [r, c + 3]];
      }
    }
  }

  // Vertical check
  for (let c = 0; c < COLS; c++) {
    for (let r = 0; r <= ROWS - 4; r++) {
      if (board[r][c] === piece && 
          board[r + 1][c] === piece && 
          board[r + 2][c] === piece && 
          board[r + 3][c] === piece) {
        return [[r, c], [r + 1, c], [r + 2, c], [r + 3, c]];
      }
    }
  }

  // Positive diagonal check
  for (let r = 0; r <= ROWS - 4; r++) {
    for (let c = 0; c <= COLS - 4; c++) {
      if (board[r][c] === piece && 
          board[r + 1][c + 1] === piece && 
          board[r + 2][c + 2] === piece && 
          board[r + 3][c + 3] === piece) {
        return [[r, c], [r + 1, c + 1], [r + 2, c + 2], [r + 3, c + 3]];
      }
    }
  }

  // Negative diagonal check
  for (let r = 3; r < ROWS; r++) {
    for (let c = 0; c <= COLS - 4; c++) {
      if (board[r][c] === piece && 
          board[r - 1][c + 1] === piece && 
          board[r - 2][c + 2] === piece && 
          board[r - 3][c + 3] === piece) {
        return [[r, c], [r - 1, c + 1], [r - 2, c + 2], [r - 3, c + 3]];
      }
    }
  }

  return null;
}

/**
 * Check if the game is a draw (board is full)
 */
export function checkDraw(board: Board): boolean {
  return board[0].every(cell => cell !== 0);
}

/**
 * Check if a column is valid for dropping a piece
 */
export function isValidColumn(board: Board, col: number): boolean {
  return col >= 0 && col < COLS && board[0][col] === 0;
}

/**
 * Get the opposite player
 */
export function getOppositePlayer(player: Player): Player {
  return player === FIRST_PLAYER ? SECOND_PLAYER : FIRST_PLAYER;
}

/**
 * Calculate the duration for piece drop animation based on distance
 */
export function getDropDuration(startRow: number, targetRow: number): number {
  return 250 + 60 * Math.abs(targetRow - startRow);
}

/**
 * Deep clone a board (useful for AI simulations)
 */
export function cloneBoard(board: Board): Board {
  return board.map(row => [...row]);
}
