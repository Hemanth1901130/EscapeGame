import { useState, useEffect } from 'react';
// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion';

const HiddenItem = ({
  id,
  position,
  size = 40,
  image,
  isKey = false,
  isRealKey = false,
  hint = '',
  glowColor,
  scale = 1,
  onCollect
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isCollected, setIsCollected] = useState(false);
  const [showHint, setShowHint] = useState(false);

  // Check if mouse is near the item to reveal it
  useEffect(() => {
    const checkMouseProximity = (e) => {
      const mouseX = e.clientX;
      const mouseY = e.clientY;
      
      const itemCenterX = position.x + size / 2;
      const itemCenterY = position.y + size / 2;
      
      const distance = Math.sqrt(
        Math.pow(mouseX - itemCenterX, 2) + 
        Math.pow(mouseY - itemCenterY, 2)
      );
      
      // Item becomes visible when mouse is within 150px
      setIsVisible(distance < 150);
    };

    window.addEventListener('mousemove', checkMouseProximity);
    
    return () => {
      window.removeEventListener('mousemove', checkMouseProximity);
    };
  }, [position, size]);

  const handleClick = () => {
    if (isVisible && !isCollected) {
      setIsCollected(true);
      if (onCollect) {
        onCollect(id, isKey, isRealKey);
      }
    }
  };

  // Function to toggle hint visibility (used in hover events)
  // eslint-disable-next-line no-unused-vars
  const toggleHint = () => {
    setShowHint(!showHint);
  };

  if (isCollected) return null;

  return (
    <div 
      className="absolute"
      style={{ 
        left: `${position.x}px`, 
        top: `${position.y}px`,
        width: `${size}px`,
        height: `${size}px`,
        zIndex: 10
      }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{
          opacity: isVisible ? 1 : 0,
          scale: isVisible ? scale : 0.8,
          rotate: isVisible ? [0, 5, -5, 0] : 0
        }}
        transition={{
          duration: 0.5,
          rotate: {
            repeat: Infinity,
            duration: isRealKey ? 1.5 : 2 // Real key rotates faster
          }
        }}
        className="key-item relative"
        style={{
          boxShadow: glowColor ? `0 0 15px ${glowColor}` : 'none',
          borderRadius: '50%'
        }}
        onClick={handleClick}
        onMouseEnter={() => setShowHint(true)}
        onMouseLeave={() => setShowHint(false)}
      >
        {image ? (
          <img
            src={image}
            alt={isKey ? "Key" : "Hidden item"}
            className={`w-full h-full object-contain ${isKey ? (isRealKey ? 'animate-pulse' : 'animate-pulse-slow') : ''}`}
            style={{
              filter: isRealKey ? 'drop-shadow(0 0 5px gold)' : 'none'
            }}
          />
        ) : (
          <div
            className={`w-full h-full rounded-full ${isKey ? (isRealKey ? 'bg-game-highlight' : 'bg-gray-400') : 'bg-game-accent'} ${isKey ? 'animate-pulse-slow' : ''}`}
          />
        )}
        
        {showHint && hint && (
          <div
            className={`absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-1 bg-game-darker text-white text-sm rounded whitespace-nowrap ${isRealKey ? 'border border-yellow-500' : ''}`}
            style={{
              backgroundColor: isRealKey ? 'rgba(30, 30, 30, 0.95)' : 'rgba(20, 20, 20, 0.8)'
            }}
          >
            {hint}
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default HiddenItem;