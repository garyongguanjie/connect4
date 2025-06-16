import { useState, useCallback, useRef } from 'react';
import type { GameState, Player, Board } from '../types/game.types';
import { MinimaxAI } from '../ai';
import {
  createEmptyBoard,
  getNextOpenRow,
  dropPiece,
  checkWin,
  checkDraw,
  isValidColumn,
  getOppositePlayer,
  FIRST_PLAYER,
  SECOND_PLAYER
} from '../utils/gameLogic';

export interface UseConnect4GameReturn {
  gameState: GameState;
  aiDepth: number;
  setAiDepth: (depth: number) => void;
  handlePlayerMove: (col: number) => Promise<void>;
  resetGame: () => void;
  startGame: (isAIFirst: boolean) => void;
  isAnimating: boolean;
}

export function useConnect4Game(): UseConnect4GameReturn {
  const [gameState, setGameState] = useState<GameState>({
    board: createEmptyBoard(),
    currentPlayer: FIRST_PLAYER,
    gameStatus: 'waiting',
    winner: null,
    winningPieces: null,
    isAIPlayer: false,
    gameActive: false
  });

  const [aiDepth, setAiDepth] = useState(10);
  const [isAnimating, setIsAnimating] = useState(false);
  const aiPlayerRef = useRef(new MinimaxAI());

  const endGame = useCallback((winner: Player | null, winningPieces: [number, number][] | null = null) => {
    setGameState(prev => ({
      ...prev,
      gameStatus: winner ? 'won' : 'draw',
      winner,
      winningPieces,
      gameActive: false
    }));
  }, []);

  const makeMove = useCallback(async (board: Board, col: number, player: Player): Promise<Board> => {
    return new Promise((resolve) => {
      const row = getNextOpenRow(board, col);
      if (row === null) {
        resolve(board);
        return;
      }

      // Simulate animation delay
      setIsAnimating(true);
      setTimeout(() => {
        const newBoard = dropPiece(board, row, col, player);
        setIsAnimating(false);
        resolve(newBoard);
      }, 300); // Animation duration
    });
  }, []);

  const checkGameEnd = useCallback((board: Board, player: Player) => {
    const winningPieces = checkWin(board, player);
    if (winningPieces) {
      endGame(player, winningPieces);
      return true;
    }
    
    if (checkDraw(board)) {
      endGame(null);
      return true;
    }
    
    return false;
  }, [endGame]);

  const handlePlayerMove = useCallback(async (col: number) => {
    if (!gameState.gameActive || gameState.isAIPlayer || isAnimating) return;
    if (!isValidColumn(gameState.board, col)) return;

    setGameState(prev => ({ ...prev, gameActive: false }));

    // Make player move
    const newBoard = await makeMove(gameState.board, col, gameState.currentPlayer);
    
    setGameState(prev => ({ ...prev, board: newBoard }));

    // Check if player won
    if (checkGameEnd(newBoard, gameState.currentPlayer)) {
      return;
    }

    // Switch to AI turn
    const nextPlayer = getOppositePlayer(gameState.currentPlayer);
    setGameState(prev => ({
      ...prev,
      currentPlayer: nextPlayer,
      isAIPlayer: true,
      gameActive: true
    }));

    // AI move after delay
    setTimeout(async () => {
      try {
        const aiCol = aiPlayerRef.current.getBestMove(newBoard, nextPlayer, aiDepth);
        const aiBoardAfterMove = await makeMove(newBoard, aiCol, nextPlayer);
        
        setGameState(prev => ({ ...prev, board: aiBoardAfterMove }));

        // Check if AI won
        if (checkGameEnd(aiBoardAfterMove, nextPlayer)) {
          return;
        }

        // Switch back to player
        const playerTurn = getOppositePlayer(nextPlayer);
        setGameState(prev => ({
          ...prev,
          currentPlayer: playerTurn,
          isAIPlayer: false,
          gameActive: true
        }));
      } catch (error) {
        console.error('AI move failed:', error);
        // Fallback: switch back to player
        setGameState(prev => ({
          ...prev,
          isAIPlayer: false,
          gameActive: true
        }));
      }
    }, 500);
  }, [gameState, isAnimating, makeMove, checkGameEnd, aiDepth]);

  const startGame = useCallback((isAIFirst: boolean) => {
    const newBoard = createEmptyBoard();
    aiPlayerRef.current.reset();
    
    setGameState({
      board: newBoard,
      currentPlayer: FIRST_PLAYER,
      gameStatus: 'playing',
      winner: null,
      winningPieces: null,
      isAIPlayer: isAIFirst,
      gameActive: !isAIFirst // If AI goes first, disable player input initially
    });

    if (isAIFirst) {
      // AI makes first move
      setTimeout(async () => {
        try {
          const aiCol = aiPlayerRef.current.getBestMove(newBoard, FIRST_PLAYER, aiDepth);
          const aiBoardAfterMove = await makeMove(newBoard, aiCol, FIRST_PLAYER);
          
          setGameState(prev => ({
            ...prev,
            board: aiBoardAfterMove,
            currentPlayer: SECOND_PLAYER,
            isAIPlayer: false,
            gameActive: true
          }));
        } catch (error) {
          console.error('AI first move failed:', error);
          // Fallback: let player go first
          setGameState(prev => ({
            ...prev,
            isAIPlayer: false,
            gameActive: true
          }));
        }
      }, 500);
    }
  }, [makeMove, aiDepth]);

  const resetGame = useCallback(() => {
    setGameState({
      board: createEmptyBoard(),
      currentPlayer: FIRST_PLAYER,
      gameStatus: 'waiting',
      winner: null,
      winningPieces: null,
      isAIPlayer: false,
      gameActive: false
    });
    aiPlayerRef.current.reset();
  }, []);

  return {
    gameState,
    aiDepth,
    setAiDepth,
    handlePlayerMove,
    resetGame,
    startGame,
    isAnimating
  };
}
