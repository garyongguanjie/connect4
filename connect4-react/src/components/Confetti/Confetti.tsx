import { useEffect, useState } from 'react';
import styles from './Confetti.module.css';

interface ConfettiPiece {
  id: number;
  left: number;
  color: string;
  animationDelay: number;
}

interface ConfettiProps {
  isActive: boolean;
  duration?: number;
}

export const Confetti = ({ isActive, duration = 2000 }: ConfettiProps) => {
  const [pieces, setPieces] = useState<ConfettiPiece[]>([]);

  useEffect(() => {
    if (!isActive) {
      setPieces([]);
      return;
    }

    // Generate confetti pieces
    const newPieces: ConfettiPiece[] = [];
    for (let i = 0; i < 100; i++) {
      newPieces.push({
        id: i,
        left: Math.random() * 100,
        color: `hsl(${Math.random() * 360}, 100%, 50%)`,
        animationDelay: Math.random() * 1000
      });
    }
    setPieces(newPieces);

    // Clean up after duration
    const timer = setTimeout(() => {
      setPieces([]);
    }, duration);

    return () => clearTimeout(timer);
  }, [isActive, duration]);

  if (!isActive || pieces.length === 0) return null;

  return (
    <div className={styles.confettiContainer}>
      {pieces.map((piece) => (
        <div
          key={piece.id}
          className={styles.confetti}
          style={{
            left: `${piece.left}%`,
            backgroundColor: piece.color,
            animationDelay: `${piece.animationDelay}ms`
          }}
        />
      ))}
    </div>
  );
};
