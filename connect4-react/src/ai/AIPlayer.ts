import type { Board, Player, CacheEntry } from '../types/game.types';

export abstract class AIPlayer {
  protected transpositionTable: Map<string, CacheEntry>;
  protected maxTableSize: number;

  constructor(maxTableSize = 100000) {
    this.transpositionTable = new Map();
    this.maxTableSize = maxTableSize;
  }

  /**
   * Abstract method to get the best move for the AI player
   * @param board Current game board state
   * @param player The AI player (1 or 2)
   * @param depth Search depth for the AI algorithm
   * @returns Column index (0-6) for the best move
   */
  abstract getBestMove(board: Board, player: Player, depth: number): number;

  /**
   * Clear the transposition table for a fresh search
   */
  protected clearTranspositionTable(): void {
    this.transpositionTable.clear();
  }

  /**
   * Generate a hash string from the board state for caching
   */
  protected getBoardHash(board: Board): string {
    return board.map(row => row.join('')).join('');
  }

  /**
   * Add an entry to the transposition table with size management
   */
  protected addToTranspositionTable(key: string, entry: CacheEntry): void {
    if (this.transpositionTable.size >= this.maxTableSize) {
      // Clear oldest entries (simple strategy)
      const keysToDelete = Array.from(this.transpositionTable.keys()).slice(0, this.maxTableSize / 2);
      keysToDelete.forEach(k => this.transpositionTable.delete(k));
    }
    this.transpositionTable.set(key, entry);
  }

  /**
   * Reset the AI state (useful for new games)
   */
  public reset(): void {
    this.clearTranspositionTable();
  }
}
