import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from 'framer-motion';
import { FaLightbulb, FaQuestionCircle, FaArrowLeft, FaMapMarkerAlt, FaKeyboard } from 'react-icons/fa';
import useGameContext from '../hooks/useGameContext';
import Flashlight from '../components/Flashlight';
import HiddenItem from '../components/HiddenItem';
import Inventory from '../components/Inventory';
import doorImage from '../assets/images/door.svg';
import soundManager from '../utils/SoundManager';
import useKeyboardShortcuts from '../hooks/useKeyboardShortcuts';
import keyImage from '../assets/images/key.svg';

const Game = ({ settings = {} }) => {
  const navigate = useNavigate();
  const gameAreaRef = useRef(null);
  
  // Make settings globally available for GameContext
  useEffect(() => {
    window.gameSettings = settings;
    
    return () => {
      // Clean up when component unmounts
      delete window.gameSettings;
    };
  }, [settings]);
  const {
    items,
    collectItem,
    hasKey,
    hasRealKey,
    realKeyId,
    gameCompleted,
    completeGame,
    currentLevel,
    advanceLevel,
    hintsUsed,
    getHint
  } = useGameContext();
  
  const [showHint, setShowHint] = useState(false);
  const [hintText, setHintText] = useState('');
  const [showExit, setShowExit] = useState(false);
  const [exitPosition, setExitPosition] = useState({ x: 0, y: 0 });
  const [isPaused, setIsPaused] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const [mapRevealedAreas, setMapRevealedAreas] = useState([]);
  const [lastMousePosition, setLastMousePosition] = useState({ x: 0, y: 0 });
  const [showControls, setShowControls] = useState(false);
  const flashlightRef = useRef(null);
  
  // Track mouse position for map
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!isPaused && gameAreaRef.current) {
        const rect = gameAreaRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        setLastMousePosition({ x, y });
        
        // Add to revealed areas on the map
        if (showMap) {
          const gridSize = 20;
          const gridX = Math.floor(x / gridSize);
          const gridY = Math.floor(y / gridSize);
          const areaKey = `${gridX}-${gridY}`;
          
          setMapRevealedAreas(prev => {
            if (!prev.includes(areaKey)) {
              return [...prev, areaKey];
            }
            return prev;
          });
        }
      }
    };
    
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [isPaused, showMap]);
  
  // Set up exit door position
  useEffect(() => {
    const doorX = window.innerWidth - 150;
    const doorY = window.innerHeight / 2 - 100;
    
    setExitPosition({
      x: doorX,
      y: doorY
    });
    
    // Add door area to map if it's revealed
    if (hasKey && showMap) {
      const gridSize = 20;
      const gridX = Math.floor(doorX / gridSize);
      const gridY = Math.floor(doorY / gridSize);
      
      for (let x = gridX - 2; x <= gridX + 2; x++) {
        for (let y = gridY - 2; y <= gridY + 2; y++) {
          const areaKey = `${x}-${y}`;
          setMapRevealedAreas(prev => {
            if (!prev.includes(areaKey)) {
              return [...prev, areaKey];
            }
            return prev;
          });
        }
      }
    }
  }, [hasKey, showMap]);
  
  // Show exit when key is found
  useEffect(() => {
    if (hasKey) {
      setShowExit(true);
      soundManager.playSound('key_found');
    }
  }, [hasKey]);
  
  // Pause game effects
  useEffect(() => {
    if (isPaused) {
      soundManager.pauseMusic();
    } else {
      soundManager.resumeMusic();
    }
  }, [isPaused]);
  
  const handleUseHint = () => {
    // Call the getHint function from context and check if hint is available
    if (getHint && getHint()) {
      soundManager.playSound('hint_used');
      
      // Provide a hint based on the current game state
      if (!hasKey) {
        // Find the real key if it exists
        const realKeyItem = items.find(item => item.isKey && (item.isRealKey || item.id === realKeyId));
        
        if (realKeyItem) {
          const direction = getDirectionHint(realKeyItem.position);
          
          // For levels 5+, specify it's the "real" key
          if (currentLevel >= 5) {
            setHintText(`The real key is ${direction} from here.`);
          } else {
            setHintText(`The key is ${direction} from here.`);
          }
          
          // Briefly reveal key area on map
          if (showMap) {
            const gridSize = 20;
            const gridX = Math.floor(realKeyItem.position.x / gridSize);
            const gridY = Math.floor(realKeyItem.position.y / gridSize);
            
            for (let x = gridX - 1; x <= gridX + 1; x++) {
              for (let y = gridY - 1; y <= gridY + 1; y++) {
                const areaKey = `${x}-${y}`;
                setMapRevealedAreas(prev => {
                  if (!prev.includes(areaKey)) {
                    return [...prev, areaKey];
                  }
                  return prev;
                });
              }
            }
          }
        } else {
          setHintText("Keep searching for the key!");
        }
      } else if (hasKey && !hasRealKey && currentLevel >= 5) {
        setHintText("This key doesn't seem to work. Find the real key!");
      } else if (!gameCompleted) {
        setHintText("You have the key! Find the exit door.");
      }
      
      setShowHint(true);
      setTimeout(() => {
        setShowHint(false);
      }, 5000);
    }
  };
  
  const getDirectionHint = (position) => {
    const centerX = window.innerWidth / 2;
    const centerY = window.innerHeight / 2;
    
    let horizontalDirection = position.x > centerX ? "to the right" : "to the left";
    let verticalDirection = position.y > centerY ? "below" : "above";
    
    return `${verticalDirection} and ${horizontalDirection}`;
  };
  
  const handleExitClick = () => {
    // For levels 5+, require the real key
    if (currentLevel >= 5) {
      if (hasRealKey) {
        soundManager.playSound('door_open');
        completeGame();
        
        // Show completion message and then navigate to next level or home
        setTimeout(() => {
          if (currentLevel < 10) {
            advanceLevel();
          } else {
            navigate('/');
          }
        }, 3000);
      } else if (hasKey) {
        // Player has a dummy key
        soundManager.playSound('door_locked');
        setHintText("This key doesn't work. Find the real key!");
        setShowHint(true);
        setTimeout(() => {
          setShowHint(false);
        }, 3000);
      } else {
        soundManager.playSound('door_locked');
      }
    } else {
      // For levels 1-4, any key works
      if (hasKey) {
        soundManager.playSound('door_open');
        completeGame();
        
        // Show completion message and then navigate to next level or home
        setTimeout(() => {
          if (currentLevel < 10) {
            advanceLevel();
          } else {
            navigate('/');
          }
        }, 3000);
      } else {
        soundManager.playSound('door_locked');
      }
    }
  };
  
  const togglePause = () => {
    setIsPaused(!isPaused);
    soundManager.playSound('ui_click');
  };
  
  const toggleMap = () => {
    setShowMap(!showMap);
    soundManager.playSound('ui_click');
  };
  
  // Toggle controls visibility
  const handleToggleControls = () => {
    setShowControls(!showControls);
    soundManager.playSound('ui_click');
  };
  
  // Handle flashlight toggle and recharge via ref
  const toggleFlashlight = () => {
    if (flashlightRef.current && flashlightRef.current.toggleFlashlight) {
      flashlightRef.current.toggleFlashlight();
    }
  };
  
  const rechargeFlashlight = () => {
    if (flashlightRef.current && flashlightRef.current.rechargeFlashlight) {
      flashlightRef.current.rechargeFlashlight();
    }
  };
  
  // Set up keyboard shortcuts
  useKeyboardShortcuts({
    onEscape: togglePause,
    onSpace: toggleFlashlight,
    onF: toggleFlashlight,
    onM: toggleMap,
    onH: handleUseHint,
    onR: rechargeFlashlight,
    onC: handleToggleControls,
    disabled: isPaused || gameCompleted
  });
  
  return (
    <div ref={gameAreaRef} className="relative min-h-screen overflow-hidden bg-game-dark">
      {/* Dark overlay */}
      <div className="absolute inset-0 bg-black opacity-90 z-0"></div>
      
      {/* Game items - only render when not paused */}
      {!isPaused && items.map(item => (
        <HiddenItem
          key={item.id}
          id={item.id}
          position={item.position}
          isKey={item.isKey}
          isRealKey={item.isRealKey}
          hint={item.hint}
          image={item.image}
          glowColor={item.glowColor}
          scale={item.scale}
          onCollect={(id, isKey, isRealKey) => {
            collectItem(id, isKey, isRealKey);
            soundManager.playSound(isKey ? (isRealKey ? 'key_found' : 'item_collect') : 'item_collect');
          }}
        />
      ))}
      
      {/* Exit door - only visible when key is found */}
      {showExit && !isPaused && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1 }}
          className="absolute z-10 cursor-pointer"
          style={{
            left: `${exitPosition.x}px`,
            top: `${exitPosition.y}px`,
            width: '100px',
            height: '100px'
          }}
          onClick={handleExitClick}
        >
          <img
            src={doorImage}
            alt="Exit Door"
            className={`w-full h-full ${hasKey ? 'glowing-door' : ''}`}
          />
          <div className="mt-2 text-white text-center">
            {currentLevel >= 5 ?
              (hasRealKey ? "Exit" : (hasKey ? "Need Real Key" : "Locked")) :
              (hasKey ? "Exit" : "Locked")}
          </div>
        </motion.div>
      )}
      
      {/* Level indicator */}
      <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 bg-game-darker/80 backdrop-blur-sm px-4 py-2 rounded-lg border border-game-accent/30">
        <h2 className="text-xl font-game text-game-accent">Level {currentLevel} of 10</h2>
      </div>
      
      {/* Game controls */}
      <div className="fixed top-20 right-4 z-50 flex flex-col gap-3">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleUseHint}
          disabled={hintsUsed >= 3}
          className={`flex items-center gap-2 bg-game-darker/80 backdrop-blur-sm px-3 py-2 rounded-lg border border-game-accent/30 ${
            hintsUsed >= 3 ? 'opacity-50 cursor-not-allowed' : 'hover:border-game-accent'
          }`}
        >
          <FaLightbulb className="text-game-highlight" />
          Hint ({3 - hintsUsed} left)
        </motion.button>
        
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={toggleMap}
          className="flex items-center gap-2 bg-game-darker/80 backdrop-blur-sm px-3 py-2 rounded-lg border border-game-accent/30 hover:border-game-accent"
        >
          <FaMapMarkerAlt className={showMap ? "text-game-highlight" : "text-white"} />
          {showMap ? "Hide Map" : "Show Map"}
        </motion.button>
        
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleToggleControls}
          className="flex items-center gap-2 bg-game-darker/80 backdrop-blur-sm px-3 py-2 rounded-lg border border-game-accent/30 hover:border-game-accent"
        >
          <FaKeyboard className={showControls ? "text-game-highlight" : "text-white"} />
          Controls
        </motion.button>
        
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={togglePause}
          className="flex items-center gap-2 bg-game-darker/80 backdrop-blur-sm px-3 py-2 rounded-lg border border-game-accent/30 hover:border-game-accent"
        >
          {isPaused ? (
            <>
              <FaArrowLeft />
              Resume
            </>
          ) : (
            <>
              <>
                <FaQuestionCircle />
                Pause
              </>
            </>
          )}
        </motion.button>
      </div>
      
      {/* Hint display */}
      <AnimatePresence>
        {showHint && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ type: 'spring', damping: 20 }}
            className="fixed top-32 left-1/2 transform -translate-x-1/2 z-50 game-panel"
          >
            <p className="text-white">{hintText}</p>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Mini map */}
      <AnimatePresence>
        {showMap && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="fixed top-20 left-4 z-50 game-panel p-2"
          >
            <h3 className="text-sm font-game text-game-accent mb-2">Map</h3>
            <div className="relative w-48 h-48 bg-game-dark border border-game-accent/30 overflow-hidden">
              {/* Revealed areas */}
              {mapRevealedAreas.map(area => {
                const [x, y] = area.split('-').map(Number);
                return (
                  <div
                    key={area}
                    className="absolute bg-white/10"
                    style={{
                      left: `${(x * 20 / window.innerWidth) * 100}%`,
                      top: `${(y * 20 / window.innerHeight) * 100}%`,
                      width: `${(20 / window.innerWidth) * 100}%`,
                      height: `${(20 / window.innerHeight) * 100}%`
                    }}
                  />
                );
              })}
              
              {/* Player position */}
              <div
                className="absolute w-2 h-2 bg-game-accent rounded-full"
                style={{
                  left: `${(lastMousePosition.x / window.innerWidth) * 100}%`,
                  top: `${(lastMousePosition.y / window.innerHeight) * 100}%`,
                  transform: 'translate(-50%, -50%)'
                }}
              />
              
              {/* Real Key position (if revealed) */}
              {items.find(item => item.isKey && (item.isRealKey || item.id === realKeyId)) && mapRevealedAreas.some(area => {
                const [gridX, gridY] = area.split('-').map(Number);
                const keyItem = items.find(item => item.isKey && (item.isRealKey || item.id === realKeyId));
                const keyGridX = Math.floor(keyItem.position.x / 20);
                const keyGridY = Math.floor(keyItem.position.y / 20);
                return gridX === keyGridX && gridY === keyGridY;
              }) && (
                <div
                  className="absolute w-3 h-3 bg-game-highlight rounded-full animate-pulse"
                  style={{
                    left: `${(items.find(item => item.isKey && (item.isRealKey || item.id === realKeyId)).position.x / window.innerWidth) * 100}%`,
                    top: `${(items.find(item => item.isKey && (item.isRealKey || item.id === realKeyId)).position.y / window.innerHeight) * 100}%`,
                    transform: 'translate(-50%, -50%)'
                  }}
                />
              )}
              
              {/* Exit position (if key found) */}
              {hasKey && (
                <div
                  className="absolute w-3 h-3 bg-game-accent rounded-full"
                  style={{
                    left: `${(exitPosition.x / window.innerWidth) * 100}%`,
                    top: `${(exitPosition.y / window.innerHeight) * 100}%`,
                    transform: 'translate(-50%, -50%)'
                  }}
                />
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Pause screen */}
      <AnimatePresence>
        {isPaused && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 flex items-center justify-center z-40 bg-black/80 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="game-panel text-center p-8 max-w-md"
            >
              <h2 className="text-3xl font-game text-game-accent mb-6">Game Paused</h2>
              
              <p className="text-white mb-8">
                Find the key hidden in the darkness and escape through the door. Use your flashlight wisely as the battery drains over time.
              </p>
              
              <div className="space-y-4">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={togglePause}
                  className="w-full py-3 px-6 bg-game-accent text-game-dark font-game rounded-md"
                >
                  Resume Game
                </motion.button>
                
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => navigate('/')}
                  className="w-full py-3 px-6 bg-transparent border border-game-accent text-game-accent font-game rounded-md"
                >
                  Return to Menu
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Controls help screen */}
      <AnimatePresence>
        {showControls && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 flex items-center justify-center z-40 bg-black/80 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="game-panel text-center p-8 max-w-md"
            >
              <h2 className="text-3xl font-game text-game-accent mb-6">Controls</h2>
              
              <div className="text-left space-y-4">
                <div className="flex justify-between">
                  <span className="text-game-highlight">F or Space</span>
                  <span className="text-white">Toggle Flashlight</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-game-highlight">M</span>
                  <span className="text-white">Toggle Map</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-game-highlight">H</span>
                  <span className="text-white">Use Hint</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-game-highlight">R</span>
                  <span className="text-white">Recharge Flashlight</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-game-highlight">C</span>
                  <span className="text-white">Show/Hide Controls</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-game-highlight">Esc</span>
                  <span className="text-white">Pause Game</span>
                </div>
              </div>
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleToggleControls}
                className="mt-8 w-full py-3 px-6 bg-game-accent text-game-dark font-game rounded-md"
              >
                Close
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Game completion message */}
      <AnimatePresence>
        {gameCompleted && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 flex items-center justify-center z-50 bg-black/90 backdrop-blur-md"
          >
            <motion.div
              initial={{ scale: 0.8, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              transition={{ type: 'spring', damping: 15 }}
              className="game-panel text-center p-8 max-w-md"
            >
              <motion.div
                animate={{
                  rotate: [0, 10, -10, 0],
                  scale: [1, 1.1, 1]
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  repeatType: 'loop'
                }}
                className="text-game-highlight text-5xl mx-auto mb-6"
              >
                <img src={keyImage} alt="Key" className="w-16 h-16 mx-auto" />
              </motion.div>
              
              <h2 className="text-3xl font-game text-game-accent mb-4">
                {currentLevel < 10 ? "Level Complete!" : "Congratulations!"}
              </h2>
              
              <p className="text-white text-xl mb-8">
                {currentLevel < 10
                  ? `You've found the key and escaped! Prepare for level ${currentLevel + 1}...`
                  : "You've escaped the darkness and completed the game!"}
              </p>
              
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: '100%' }}
                transition={{ duration: 3 }}
                className="h-1 bg-game-accent mb-8"
                onAnimationComplete={() => {
                  // Redirect to main page after animation completes for final level
                  if (currentLevel >= 10) {
                    setTimeout(() => {
                      navigate('/');
                    }, 1500);
                  }
                }}
              />
              
              {currentLevel >= 10 && (
                <p className="text-white/70 text-sm italic">
                  Returning to main menu in a moment...
                </p>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Inventory */}
      <Inventory />
      
      {/* Flashlight - pass settings and current level */}
      {!isPaused && <Flashlight settings={settings} level={currentLevel} />}
    </div>
  );
};

export default Game;