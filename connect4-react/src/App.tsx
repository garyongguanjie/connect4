import { useConnect4Game } from './hooks/useConnect4Game';
import { GameBoard } from './components/GameBoard/GameBoard';
import { Controls } from './components/Controls/Controls';
import { StartModal } from './components/StartModal/StartModal';
import { Confetti } from './components/Confetti/Confetti';
import styles from './App.module.css';

function App() {
  const {
    gameState,
    aiDepth,
    setAiDepth,
    handlePlayerMove,
    resetGame,
    startGame,
    isAnimating
  } = useConnect4Game();

  const getStatusMessage = (): string => {
    switch (gameState.gameStatus) {
      case 'waiting':
        return '';
      case 'playing':
        if (gameState.isAIPlayer) {
          return "AI's turn";
        }
        return isAnimating ? 'Making move...' : 'Your turn';
      case 'won':
        if (gameState.winner === 1 && !gameState.isAIPlayer) {
          return 'You win!';
        } else if (gameState.winner === 2 && gameState.isAIPlayer) {
          return 'You win!';
        } else {
          return 'AI wins!';
        }
      case 'draw':
        return "It's a draw!";
      default:
        return '';
    }
  };

  const showConfetti = gameState.gameStatus === 'won' && getStatusMessage().includes('You win');

  return (
    <div className={styles.app}>
      <h1 className={styles.title}>Connect 4</h1>
      
      <Controls
        aiDepth={aiDepth}
        onAiDepthChange={setAiDepth}
        onResetGame={resetGame}
        gameStatus={gameState.gameStatus}
      />
      
      {getStatusMessage() && (
        <div className={styles.message}>
          {getStatusMessage()}
        </div>
      )}
      
      <GameBoard
        board={gameState.board}
        winningPieces={gameState.winningPieces}
        onCellClick={handlePlayerMove}
      />
      
      <StartModal
        isVisible={gameState.gameStatus === 'waiting'}
        onPlayerFirst={() => startGame(false)}
        onAIFirst={() => startGame(true)}
      />
      
      <Confetti isActive={showConfetti} />
    </div>
  );
}

export default App;
