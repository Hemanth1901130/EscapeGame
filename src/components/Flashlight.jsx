import { useState, useEffect, useRef } from 'react';
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from 'framer-motion';
import { FaLightbulb, FaBatteryFull, FaBatteryThreeQuarters, FaBatteryHalf, FaBatteryQuarter, FaBatteryEmpty } from 'react-icons/fa';
import soundManager from '../utils/SoundManager';

const Flashlight = ({ settings = {}, level = 1 }) => {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isActive, setIsActive] = useState(true);
  const [batteryLevel, setBatteryLevel] = useState(100);
  const [isRecharging, setIsRecharging] = useState(false);
  const [showWarning, setShowWarning] = useState(false);
  const [isFlickering, setIsFlickering] = useState(false);
  const flashlightRef = useRef(null);
  
  const intensity = settings.flashlightIntensity || 70;
  const levelSizeFactor = Math.max(0.5, 1 - (level - 1) * 0.05);
  const size = (140 + (intensity / 100) * 70) * levelSizeFactor;
  
  const baseDrainRate = settings.difficulty === 'hard' ? 0.25 :
                       settings.difficulty === 'easy' ? 0.08 : 0.15;
  const drainRate = baseDrainRate * (1 + (level - 1) * 0.1);
  
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (isActive && batteryLevel > 0) {
        setPosition({ x: e.clientX, y: e.clientY });
      }
    };

    const handleTouchMove = (e) => {
      if (isActive && batteryLevel > 0 && e.touches[0]) {
        setPosition({ x: e.touches[0].clientX, y: e.touches[0].clientY });
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('touchmove', handleTouchMove);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('touchmove', handleTouchMove);
    };
  }, [isActive, batteryLevel]);

  useEffect(() => {
    let batteryDrain;
    
    if (isActive && batteryLevel > 0 && !isRecharging) {
      batteryDrain = setInterval(() => {
        setBatteryLevel(prev => {
          const newLevel = Math.max(0, prev - drainRate);
          
          if (newLevel <= 20 && newLevel > 0 && !showWarning) {
            setShowWarning(true);
            setIsFlickering(true);
            soundManager.playSound('flashlight_toggle', { volume: 0.3 });
            
            setTimeout(() => {
              setShowWarning(false);
            }, 3000);
          }
          
          if (newLevel > 20 && isFlickering) {
            setIsFlickering(false);
          }
          
          return newLevel;
        });
      }, 1000);
    }

    return () => {
      if (batteryDrain) clearInterval(batteryDrain);
    };
  }, [isActive, batteryLevel, isRecharging, showWarning, isFlickering, drainRate]);

  useEffect(() => {
    let flickerInterval;
    
    if (isFlickering && isActive && batteryLevel <= 20 && batteryLevel > 0) {
      flickerInterval = setInterval(() => {
        if (flashlightRef.current) {
          const randomOpacity = 0.3 + Math.random() * 0.7;
          flashlightRef.current.style.opacity = randomOpacity * (batteryLevel / 100);
        }
      }, 100);
    }
    
    return () => {
      if (flickerInterval) clearInterval(flickerInterval);
      
      if (flashlightRef.current && !isFlickering) {
        flashlightRef.current.style.opacity = batteryLevel / 100;
      }
    };
  }, [isFlickering, isActive, batteryLevel]);

  const toggleFlashlight = () => {
    setIsActive(!isActive);
    soundManager.playSound('flashlight_toggle');
  };

  const rechargeFlashlight = () => {
    if (batteryLevel < 100 && !isRecharging) {
      setIsRecharging(true);
      soundManager.playSound('flashlight_recharge');
      
      // Simulate recharging over time
      const rechargeInterval = setInterval(() => {
        setBatteryLevel(prev => {
          const newLevel = Math.min(100, prev + 2);
          
          // Turn off flickering when battery is recharged enough
          if (newLevel > 20 && isFlickering) {
            setIsFlickering(false);
          }
          
          // Complete recharging
          if (newLevel >= 100) {
            clearInterval(rechargeInterval);
            setIsRecharging(false);
          }
          
          return newLevel;
        });
      }, 50);
    }
  };

  // Get battery icon based on level
  const getBatteryIcon = () => {
    if (batteryLevel > 80) return <FaBatteryFull />;
    if (batteryLevel > 60) return <FaBatteryThreeQuarters />;
    if (batteryLevel > 40) return <FaBatteryHalf />;
    if (batteryLevel > 10) return <FaBatteryQuarter />;
    return <FaBatteryEmpty />;
  };

  return (
    <>
      {/* Flashlight beam */}
      {isActive && batteryLevel > 0 && (
        <div
          ref={flashlightRef}
          className="flashlight"
          style={{
            left: `${position.x - size/2}px`,
            top: `${position.y - size/2}px`,
            width: `${size}px`,
            height: `${size}px`,
            opacity: batteryLevel / 100,
            transition: isFlickering ? 'none' : 'opacity 0.3s ease'
          }}
        />
      )}
      
      {/* Flashlight controls */}
      <div className="fixed bottom-4 right-4 z-50 flex items-center gap-3 bg-game-darker/80 backdrop-blur-sm p-2 rounded-lg border border-game-accent/30">
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={rechargeFlashlight}
          disabled={batteryLevel === 100 || isRecharging}
          className={`relative px-3 py-2 text-sm rounded ${
            batteryLevel === 100 || isRecharging
              ? 'opacity-50 cursor-not-allowed'
              : 'hover:bg-game-accent/20'
          }`}
        >
          {isRecharging ? (
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              className="absolute inset-0 flex items-center justify-center"
            >
              <div className="w-5 h-5 border-2 border-game-accent border-t-transparent rounded-full" />
            </motion.div>
          ) : (
            "Recharge"
          )}
        </motion.button>
        
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={toggleFlashlight}
          className="px-3 py-2 text-sm rounded hover:bg-game-accent/20 flex items-center gap-2"
        >
          <FaLightbulb className={isActive ? 'text-game-highlight' : 'text-white/50'} />
          {isActive ? 'Off' : 'On'}
        </motion.button>
        
        <div className="flex items-center gap-2">
          <div className="text-lg text-game-accent">
            {getBatteryIcon()}
          </div>
          <div className="w-20 h-4 bg-game-darker border border-game-accent rounded-full overflow-hidden">
            <motion.div
              className={`h-full ${
                batteryLevel <= 20
                  ? 'bg-red-500'
                  : batteryLevel <= 50
                    ? 'bg-yellow-500'
                    : 'bg-game-accent'
              }`}
              initial={{ width: 0 }}
              animate={{ width: `${batteryLevel}%` }}
              transition={{ type: 'spring', damping: 10 }}
            />
          </div>
        </div>
      </div>
      
      {/* Low battery warning */}
      <AnimatePresence>
        {showWarning && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-20 right-4 z-50 bg-red-900/80 text-white px-4 py-2 rounded-lg border border-red-500"
          >
            <div className="flex items-center gap-2">
              <FaBatteryEmpty className="text-red-500 animate-pulse" />
              <span>Low battery! Recharge soon.</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Flashlight;