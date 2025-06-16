# Connect 4 React TypeScript

A modern React TypeScript implementation of Connect 4 with AI opponent using Vite.

## Features

- **Modern React + TypeScript**: Built with latest React patterns and strong typing
- **Sophisticated AI**: Minimax algorithm with alpha-beta pruning and transposition table
- **Responsive Design**: Works perfectly on desktop and mobile devices
- **Smooth Animations**: Piece dropping animations and victory celebrations
- **Class-based AI Architecture**: Easy to swap different AI implementations
- **Accessibility**: Keyboard navigation and screen reader support

## Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the development server:
   ```bash
   npm run dev
   ```

3. Open your browser to `http://localhost:5173`

## Project Structure

```
src/
├── ai/                 # AI implementation
│   ├── AIPlayer.ts     # Abstract base class for AI players
│   ├── MinimaxAI.ts    # Minimax with alpha-beta pruning
│   └── index.ts        # AI exports
├── components/         # React components
│   ├── Cell/           # Individual game cell
│   ├── GameBoard/      # Game board grid
│   ├── Controls/       # Game controls (AI depth, reset)
│   ├── StartModal/     # Game start modal
│   └── Confetti/       # Victory celebration
├── hooks/              # Custom React hooks
│   └── useConnect4Game.ts  # Main game logic hook
├── types/              # TypeScript type definitions
│   └── game.types.ts   # Game-related types
├── utils/              # Utility functions
│   └── gameLogic.ts    # Pure game logic functions
├── App.tsx             # Main app component
└── main.tsx            # App entry point
```

## AI Configuration

The AI uses a configurable depth search (1-15 levels). Higher depths provide stronger play but take longer to compute. The AI includes:

- **Minimax Algorithm**: Optimal move calculation
- **Alpha-Beta Pruning**: Performance optimization
- **Transposition Table**: Caching for repeated positions
- **Move Ordering**: Better pruning efficiency
- **Position Evaluation**: Strategic piece placement

## Swapping AI Implementations

To create a new AI player:

1. Extend the `AIPlayer` abstract class
2. Implement the `getBestMove` method
3. Use the AI in the game hook

```typescript
class RandomAI extends AIPlayer {
  getBestMove(board: Board, player: Player, depth: number): number {
    const validCols = board[0]
      .map((_, i) => i)
      .filter(col => board[0][col] === 0);
    return validCols[Math.floor(Math.random() * validCols.length)];
  }
}
```

## Technologies Used

- **Vite**: Fast build tool and dev server
- **React 18**: Latest React with hooks
- **TypeScript**: Strong typing and better developer experience
- **CSS Modules**: Scoped styling
- **ESLint**: Code quality and consistency

## Building for Production

```bash
npm run build
```

The built files will be in the `dist` directory.

## License

MIT License - feel free to use this code for your own projects!
