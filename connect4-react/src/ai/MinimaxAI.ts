import type { Board, Player, CacheEntry } from '../types/game.types';
import { AIPlayer } from './AIPlayer';

export class MinimaxAI extends AIPlayer {
  private readonly ROWS = 6;
  private readonly COLS = 7;

  getBestMove(board: Board, player: Player, depth: number): number {
    this.clearTranspositionTable();
    const oppositePlayer = player === 1 ? 2 : 1;
    const [col] = this.alphabeta(board, depth, -Infinity, Infinity, true, oppositePlayer, player);
    return col;
  }

  private alphabeta(
    node: Board,
    depth: number,
    alpha: number,
    beta: number,
    maxPlayer: boolean,
    player: Player,
    aiPlayer: Player
  ): [number, number] {
    // Check transposition table
    const boardHash = this.getBoardHash(node);
    const tableKey = `${boardHash}-${depth}-${maxPlayer}`;
    
    if (this.transpositionTable.has(tableKey)) {
      const cached = this.transpositionTable.get(tableKey)!;
      if (cached.depth >= depth) {
        if (cached.type === 'exact') {
          return [cached.bestMove!, cached.value];
        } else if (cached.type === 'lowerbound' && cached.value >= beta) {
          return [cached.bestMove!, cached.value];
        } else if (cached.type === 'upperbound' && cached.value <= alpha) {
          return [cached.bestMove!, cached.value];
        }
      }
    }

    const winner = this.checkWinnerSim(node);
    if (winner !== 0) {
      const value = winner === aiPlayer ? 1000000000 + depth : 
                  winner === player ? -1000000000 - depth : 0;
      this.addToTranspositionTable(tableKey, {
        bestMove: null,
        value: value,
        depth: depth,
        type: 'exact'
      });
      return [3, value]; // Default column 3 when game is over
    }

    if (depth === 0) {
      const value = this.valueFunction(node, aiPlayer);
      this.addToTranspositionTable(tableKey, {
        bestMove: null,
        value: value,
        depth: depth,
        type: 'exact'
      });
      return [3, value]; // Default column 3 for leaf nodes
    }

    if (maxPlayer) {
      let bestValue = -Infinity;
      let bestAction = 3;
      const validActions = this.getValidActions(node);
      const orderedMoves = this.orderMoves(node, validActions, aiPlayer);
      
      for (const action of orderedMoves) {
        const position = this.dropPieceSim(node, action, aiPlayer);
        const [, score] = this.alphabeta(node, depth - 1, alpha, beta, false, player, aiPlayer);
        this.undoMove(node, position);
        
        if (score > bestValue) {
          bestValue = score;
          bestAction = action;
        }
        alpha = Math.max(alpha, bestValue);
        
        if (alpha >= beta) {
          this.addToTranspositionTable(tableKey, {
            bestMove: bestAction,
            value: bestValue,
            depth: depth,
            type: 'lowerbound'
          });
          break; // Prune
        }
      }
      
      // Store the final result
      this.addToTranspositionTable(tableKey, {
        bestMove: bestAction,
        value: bestValue,
        depth: depth,
        type: bestValue <= alpha ? 'upperbound' : 
              bestValue >= beta ? 'lowerbound' : 'exact'
      });
      return [bestAction, bestValue];
    } else {
      let worstValue = Infinity;
      let worstAction = 3;
      const validActions = this.getValidActions(node);
      const orderedMoves = this.orderMoves(node, validActions, player);
      
      for (const action of orderedMoves) {
        const position = this.dropPieceSim(node, action, player);
        const [, score] = this.alphabeta(node, depth - 1, alpha, beta, true, player, aiPlayer);
        this.undoMove(node, position);
        
        if (score < worstValue) {
          worstValue = score;
          worstAction = action;
        }
        beta = Math.min(beta, worstValue);
        
        if (beta <= alpha) break; // Prune
      }
      return [worstAction, worstValue];
    }
  }

  private valueFunction(board: Board, player: Player): number {
    const oppPlayer = player === 1 ? 2 : 1;
    return this.evaluatePlayer(board, player) - 5 * this.evaluatePlayer(board, oppPlayer);
  }

  private evaluatePlayer(board: Board, player: Player): number {
    let score = 0;
    
    // Center column preference
    score += 101 * this.countInArray(board.map(row => row[3]), player);
    
    // Horizontal evaluation
    for (let r = 0; r < this.ROWS; r++) {
      const rowArray = board[r];
      for (let c = 0; c < this.COLS - 3; c++) {
        const window = rowArray.slice(c, c + 4);
        score += this.evaluateRow(window, player, r);
      }
    }
    
    // Vertical evaluation
    for (let c = 0; c < this.COLS; c++) {
      const colArray = board.map(row => row[c]);
      for (let r = 0; r < this.ROWS - 3; r++) {
        const window = colArray.slice(r, r + 4);
        score += this.evaluateColumn(window, player);
      }
    }
    
    // Positive diagonal evaluation
    for (let r = 0; r < this.ROWS - 3; r++) {
      for (let c = 0; c < this.COLS - 3; c++) {
        const window = [board[r][c], board[r + 1][c + 1], board[r + 2][c + 2], board[r + 3][c + 3]];
        score += this.evaluateDiagonal(window, player, r);
      }
    }
    
    // Negative diagonal evaluation
    for (let r = 0; r < this.ROWS - 3; r++) {
      for (let c = 0; c < this.COLS - 3; c++) {
        const window = [board[r + 3][c], board[r + 2][c + 1], board[r + 1][c + 2], board[r][c + 3]];
        score += this.evaluateDiagonal(window, player, r);
      }
    }
    
    return score;
  }

  private evaluateRow(window: number[], player: Player, r: number): number {
    let score = 0;
    const inverseRow = 7 - r;
    score += inverseRow;
    
    // Convert 0-indexed row to 1-indexed for strategy application
    const row1Indexed = r + 1;
    // First player (1) prefers odd-numbered rows in 1-indexed terms
    if (player === 1 && row1Indexed % 2 !== 0) score += 10;
    // Second player (2) prefers even-numbered rows in 1-indexed terms
    if (player === 2 && row1Indexed % 2 === 0) score += 10;
    
    if (this.countInArray(window, player) === 4) score += 10000;
    else if (this.countInArray(window, player) === 3 && this.countInArray(window, 0) === 1) score += 100;
    else if (this.countInArray(window, player) === 2 && this.countInArray(window, 0) === 2) score += 10;
    
    return score;
  }

  private evaluateColumn(window: number[], player: Player): number {
    let score = 0;
    if (this.countInArray(window, player) === 4) score += 10000;
    else if (this.countInArray(window, player) === 3 && this.countInArray(window, 0) === 1) score += 100;
    else if (this.countInArray(window, player) === 2 && this.countInArray(window, 0) === 2) score += 10;
    return 0.5 * score;
  }

  private evaluateDiagonal(window: number[], player: Player, r: number): number {
    let score = 0;
    const inverseRow = 7 - r;
    score += inverseRow;
    
    if (this.countInArray(window, player) === 4) score += 10000;
    else if (this.countInArray(window, player) === 3 && this.countInArray(window, 0) === 1) score += 100;
    else if (this.countInArray(window, player) === 2 && this.countInArray(window, 0) === 2) score += 10;
    
    return score;
  }

  private countInArray(arr: number[], value: number): number {
    return arr.reduce((count, x) => count + (x === value ? 1 : 0), 0);
  }

  private getValidActions(board: Board): number[] {
    const validCols: number[] = [];
    for (let c = 0; c < this.COLS; c++) {
      if (board[0][c] === 0) {
        validCols.push(c);
      }
    }
    return validCols;
  }

  private orderMoves(board: Board, validMoves: number[], piece: Player): number[] {
    // Score each move and sort by most promising first
    const moveScores = validMoves.map(col => {
      const row = this.getNextOpenRow(board, col);
      if (row === null) return { col, score: -Infinity };

      // Prefer center columns
      let score = Math.abs(3 - col) * -10;

      // Try the move
      board[row][col] = piece;
      score += this.valueFunction(board, piece);
      board[row][col] = 0; // Undo

      return { col, score };
    });

    return moveScores.sort((a, b) => b.score - a.score).map(m => m.col);
  }

  private dropPieceSim(board: Board, col: number, mark: Player): [number, number] | null {
    for (let r = this.ROWS - 1; r >= 0; r--) {
      if (board[r][col] === 0) {
        board[r][col] = mark;
        return [r, col]; // Return position for backtracking
      }
    }
    return null;
  }

  private undoMove(board: Board, position: [number, number] | null): void {
    if (position) {
      const [row, col] = position;
      board[row][col] = 0;
    }
  }

  private getNextOpenRow(board: Board, col: number): number | null {
    for (let r = this.ROWS - 1; r >= 0; r--) {
      if (board[r][col] === 0) {
        return r;
      }
    }
    return null;
  }

  private checkWinnerSim(board: Board): number {
    // Horizontal
    for (let r = 0; r < this.ROWS; r++) {
      for (let c = 0; c <= this.COLS - 4; c++) {
        if (board[r][c] !== 0 && 
            board[r][c] === board[r][c + 1] && 
            board[r][c] === board[r][c + 2] && 
            board[r][c] === board[r][c + 3]) {
          return board[r][c];
        }
      }
    }
    
    // Vertical
    for (let c = 0; c < this.COLS; c++) {
      for (let r = 0; r <= this.ROWS - 4; r++) {
        if (board[r][c] !== 0 && 
            board[r][c] === board[r + 1][c] && 
            board[r][c] === board[r + 2][c] && 
            board[r][c] === board[r + 3][c]) {
          return board[r][c];
        }
      }
    }
    
    // Positive diagonal
    for (let r = 0; r <= this.ROWS - 4; r++) {
      for (let c = 0; c <= this.COLS - 4; c++) {
        if (board[r][c] !== 0 && 
            board[r][c] === board[r + 1][c + 1] && 
            board[r][c] === board[r + 2][c + 2] && 
            board[r][c] === board[r + 3][c + 3]) {
          return board[r][c];
        }
      }
    }
    
    // Negative diagonal
    for (let r = 3; r < this.ROWS; r++) {
      for (let c = 0; c <= this.COLS - 4; c++) {
        if (board[r][c] !== 0 && 
            board[r][c] === board[r - 1][c + 1] && 
            board[r][c] === board[r - 2][c + 2] && 
            board[r][c] === board[r - 3][c + 3]) {
          return board[r][c];
        }
      }
    }
    
    // Check for draw
    if (board[0].every(cell => cell !== 0)) return -1;
    
    return 0; // No winner yet
  }
}
