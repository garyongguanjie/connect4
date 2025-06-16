export type Player = 1 | 2;
export type Cell = 0 | Player;
export type Board = Cell[][];
export type GameStatus = 'waiting' | 'playing' | 'won' | 'draw';

export interface GameState {
  board: Board;
  currentPlayer: Player;
  gameStatus: GameStatus;
  winner: Player | null;
  winningPieces: [number, number][] | null;
  isAIPlayer: boolean;
  gameActive: boolean;
}

export interface CacheEntry {
  bestMove: number | null;
  value: number;
  depth: number;
  type: 'exact' | 'lowerbound' | 'upperbound';
}

export interface AIConfig {
  maxDepth: number;
  maxTableSize: number;
}

export interface DropAnimationConfig {
  fromRow?: number | null;
  targetRow: number;
  col: number;
  piece: Player;
  duration: number;
}
