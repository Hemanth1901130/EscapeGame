import { useEffect } from 'react';
import soundManager from '../utils/SoundManager';

/**
 * Custom hook to handle keyboard shortcuts in the game
 * 
 * @param {Object} options - Configuration options
 * @param {Function} options.onEscape - Function to call when Escape key is pressed
 * @param {Function} options.onSpace - Function to call when Space key is pressed
 * @param {Function} options.onF - Function to call when F key is pressed (flashlight)
 * @param {Function} options.onM - Function to call when M key is pressed (map)
 * @param {Function} options.onH - Function to call when H key is pressed (hint)
 * @param {Function} options.onR - Function to call when R key is pressed (recharge)
 * @param {Function} options.onArrowKeys - Function to call when arrow keys are pressed
 * @param {boolean} options.disabled - Whether shortcuts are disabled
 */
const useKeyboardShortcuts = ({
  onEscape,
  onSpace,
  onF,
  onM,
  onH,
  onR,
  onArrowKeys,
  disabled = false
}) => {
  useEffect(() => {
    if (disabled) return;

    const handleKeyDown = (event) => {
      // Prevent default behavior for game controls
      if (['Escape', ' ', 'f', 'm', 'h', 'r', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(event.key)) {
        event.preventDefault();
      }

      switch (event.key) {
        case 'Escape':
          if (onEscape) {
            soundManager.playSound('ui_click');
            onEscape();
          }
          break;
        case ' ':
          if (onSpace) {
            soundManager.playSound('ui_click');
            onSpace();
          }
          break;
        case 'f':
        case 'F':
          if (onF) {
            soundManager.playSound('ui_click');
            onF();
          }
          break;
        case 'm':
        case 'M':
          if (onM) {
            soundManager.playSound('ui_click');
            onM();
          }
          break;
        case 'h':
        case 'H':
          if (onH) {
            onH();
          }
          break;
        case 'r':
        case 'R':
          if (onR) {
            onR();
          }
          break;
        case 'ArrowUp':
        case 'ArrowDown':
        case 'ArrowLeft':
        case 'ArrowRight':
          if (onArrowKeys) {
            onArrowKeys(event.key);
          }
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onEscape, onSpace, onF, onM, onH, onR, onArrowKeys, disabled]);
};

export default useKeyboardShortcuts;