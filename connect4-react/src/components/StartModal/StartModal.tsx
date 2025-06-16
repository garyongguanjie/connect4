import { memo } from 'react';
import styles from './StartModal.module.css';

interface StartModalProps {
  isVisible: boolean;
  onPlayerFirst: () => void;
  onAIFirst: () => void;
}

export const StartModal = memo(({ isVisible, onPlayerFirst, onAIFirst }: StartModalProps) => {
  if (!isVisible) return null;

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modal}>
        <h2 className={styles.title}>Who starts?</h2>
        <div className={styles.modalButtons}>
          <button 
            onClick={onPlayerFirst}
            className={styles.modalButton}
            type="button"
            autoFocus
          >
            Player
          </button>
          <button 
            onClick={onAIFirst}
            className={styles.modalButton}
            type="button"
          >
            AI
          </button>
        </div>
      </div>
    </div>
  );
});

StartModal.displayName = 'StartModal';
