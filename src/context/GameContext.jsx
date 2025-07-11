import { useState, useEffect } from 'react';
import keyImage from '../assets/images/key.svg';
import clueImage from '../assets/images/clue.svg';
import GameContext from './GameContextDefinition';

const GameProvider = ({ children }) => {
  const [items, setItems] = useState([]);
  const [collectedItems, setCollectedItems] = useState([]);
  const [hasKey, setHasKey] = useState(false);
  const [hasRealKey, setHasRealKey] = useState(false);
  const [realKeyId, setRealKeyId] = useState('');
  const [gameCompleted, setGameCompleted] = useState(false);
  const [currentLevel, setCurrentLevel] = useState(1);
  const [hintsUsed, setHintsUsed] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);
  const [timeElapsed, setTimeElapsed] = useState(0);

  useEffect(() => {
    let timer;
    if (gameStarted && !gameCompleted) {
      timer = setInterval(() => {
        setTimeElapsed(prev => prev + 1);
      }, 1000);
    }

    return () => {
      if (timer) clearInterval(timer);
    };
  }, [gameStarted, gameCompleted]);

  useEffect(() => {
    setHasKey(false);
    setHasRealKey(false);
    
    const randomPosition = () => ({
      x: Math.random() * (window.innerWidth - 100) + 50,
      y: Math.random() * (window.innerHeight - 200) + 100
    });
    
    const generateLevelItems = () => {
      const levelItems = [];
      
      let numDummyKeys = 0;
      if (currentLevel >= 5) {
        numDummyKeys = Math.min(currentLevel - 4, 5); // Max 5 dummy keys
        
        if (window.gameSettings && window.gameSettings.difficulty) {
          if (window.gameSettings.difficulty === 'hard') {
            numDummyKeys += 2; // More dummy keys on hard
          } else if (window.gameSettings.difficulty === 'easy') {
            numDummyKeys = Math.max(1, numDummyKeys - 1); // Fewer dummy keys on easy
          }
        }
      }
      
      const realKeyId = `real-key-level-${currentLevel}`;
      setRealKeyId(realKeyId);
      
      levelItems.push({
        id: realKeyId,
        position: randomPosition(),
        isKey: true,
        isRealKey: true,
        hint: currentLevel >= 5 ? '✨ This key feels different... ✨' : 'The key to escape!',
        image: keyImage,
        glowColor: 'rgba(255, 215, 0, 0.6)', // Golden glow for real key
        scale: 1.1, // Slightly larger
      });
      
      for (let i = 0; i < numDummyKeys; i++) {
        levelItems.push({
          id: `dummy-key-${i}-level-${currentLevel}`,
          position: randomPosition(),
          isKey: true,
          isRealKey: false,
          hint: '? A key... but will it work? ?',
          image: keyImage,
          glowColor: 'rgba(150, 150, 150, 0.4)', // Dull glow for dummy keys
          scale: 0.9, // Slightly smaller
        });
      }
      
      const numClues = Math.min(currentLevel + 1, 5); // More clues as levels progress, max 5
      
      for (let i = 0; i < numClues; i++) {
        levelItems.push({
          id: `clue${i}-level-${currentLevel}`,
          position: randomPosition(),
          isKey: false,
          isRealKey: false,
          hint: `Clue ${i+1} for level ${currentLevel}`,
          image: clueImage,
        });
      }
      
      return levelItems;
    };
    
    setItems(generateLevelItems());
  }, [currentLevel]);

  const collectItem = (itemId, isKey, isRealKey = false) => {
    setCollectedItems(prev => [...prev, itemId]);
    
    if (isKey) {
      setHasKey(true);
      
      if (isRealKey || itemId === realKeyId) {
        setHasRealKey(true);
      }
    }
    
    setItems(prev => prev.filter(item => item.id !== itemId));
  };

  const getHint = () => {
    if (hintsUsed < 3) {
      setHintsUsed(prev => prev + 1);
      return true;
    }
    return false;
  };

  const startGame = () => {
    setGameStarted(true);
    setTimeElapsed(0);
    setCollectedItems([]);
    setHasKey(false);
    setHasRealKey(false);
    setRealKeyId('');
    setGameCompleted(false);
    setCurrentLevel(1);
    setHintsUsed(0);
  };

  const completeGame = () => {
    setGameCompleted(true);
  };

  const advanceLevel = () => {
    setGameCompleted(false);
    setHasKey(false);
    setHasRealKey(false);
    setRealKeyId('');
    setCollectedItems([]);
    
    setCurrentLevel(prev => prev + 1);
  };

  return (
    <GameContext.Provider
      value={{
        items,
        collectedItems,
        hasKey,
        hasRealKey,
        realKeyId,
        gameCompleted,
        currentLevel,
        hintsUsed,
        gameStarted,
        timeElapsed,
        collectItem,
        getHint,
        startGame,
        completeGame,
        advanceLevel,
      }}
    >
      {children}
    </GameContext.Provider>
  );
};

export { GameProvider };