import { useState, useEffect } from 'react';
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from 'framer-motion';
import { FaKey } from 'react-icons/fa';

const LoadingScreen = ({ onLoadingComplete }) => {
  const [progress, setProgress] = useState(0);
  const [loadingText, setLoadingText] = useState('Initializing game...');
  const [isVisible, setIsVisible] = useState(true);
  
  const loadingTexts = [
    'Initializing game...',
    'Generating darkness...',
    'Hiding keys...',
    'Calibrating flashlight...',
    'Preparing escape routes...',
    'Almost there...'
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          
          // Delay hiding the loading screen to show 100% for a moment
          setTimeout(() => {
            setIsVisible(false);
            
            // Notify parent component that loading is complete
            setTimeout(() => {
              if (onLoadingComplete) onLoadingComplete();
            }, 500);
          }, 500);
          
          return 100;
        }
        
        // Update loading text based on progress
        const textIndex = Math.floor((prev / 100) * loadingTexts.length);
        setLoadingText(loadingTexts[Math.min(textIndex, loadingTexts.length - 1)]);
        
        // Randomize progress increments for more realistic loading
        return prev + Math.random() * 3 + 1;
      });
    }, 100);

    return () => clearInterval(interval);
  }, [onLoadingComplete]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-game-dark flex flex-col items-center justify-center"
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="text-center"
          >
            <motion.div
              animate={{ 
                rotate: [0, 360],
                scale: [1, 1.1, 1]
              }}
              transition={{ 
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="mb-8 inline-block"
            >
              <FaKey className="text-game-highlight text-6xl" />
            </motion.div>
            
            <h1 className="text-4xl font-game text-game-accent mb-8">FIND THE KEY</h1>
            
            <div className="w-64 h-2 bg-game-darker rounded-full overflow-hidden mb-4">
              <motion.div 
                className="h-full bg-game-accent"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ ease: "easeOut" }}
              />
            </div>
            
            <p className="text-white text-sm">{loadingText}</p>
            <p className="text-white/50 text-xs mt-2">{Math.round(progress)}%</p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default LoadingScreen;