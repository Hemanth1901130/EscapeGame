import { useState, useEffect } from 'react';
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from 'framer-motion';
import { FaChevronUp, FaChevronDown, FaKey, FaScroll, FaCamera } from 'react-icons/fa';
import useGameContext from '../hooks/useGameContext';
import soundManager from '../utils/SoundManager';

const Inventory = () => {
  const { collectedItems } = useGameContext();
  const [isOpen, setIsOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [itemDetails, setItemDetails] = useState({});

  // Define item details
  useEffect(() => {
    setItemDetails({
      'key': {
        name: 'Mysterious Key',
        description: 'An ornate key with strange markings. It must unlock something important.',
        icon: <FaKey className="text-game-highlight text-xl" />,
        image: '/src/assets/images/key.svg'
      },
      'clue1': {
        name: 'Cryptic Note',
        description: 'A torn piece of paper with a cryptic message: "The path to freedom lies in darkness."',
        icon: <FaScroll className="text-white text-xl" />,
        image: '/src/assets/images/clue.svg'
      },
      'clue2': {
        name: 'Faded Photograph',
        description: 'A faded photograph showing what appears to be a door with strange symbols around it.',
        icon: <FaCamera className="text-white text-xl" />,
        image: '/src/assets/images/clue.svg'
      }
    });
  }, []);

  const toggleInventory = () => {
    setIsOpen(!isOpen);
    soundManager.playSound('ui_click');
    
    // Close item details when closing inventory
    if (isOpen) {
      setSelectedItem(null);
    }
  };

  const handleItemClick = (itemId) => {
    soundManager.playSound('ui_click');
    setSelectedItem(selectedItem === itemId ? null : itemId);
  };

  const handleItemHover = () => {
    soundManager.playSound('ui_hover');
  };

  return (
    <div className="fixed bottom-4 left-4 z-40">
      {/* Inventory toggle button */}
      <button
        onClick={toggleInventory}
        className="bg-game-darker border border-game-accent/30 hover:border-game-accent transition-colors p-3 rounded-full flex items-center justify-center"
        onMouseEnter={handleItemHover}
      >
        {isOpen ? (
          <FaChevronDown className="text-game-accent" />
        ) : (
          <FaChevronUp className="text-game-accent" />
        )}
      </button>
      
      {/* Inventory panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.3 }}
            className="absolute bottom-16 left-0 bg-game-darker/90 backdrop-blur-sm border border-game-accent/30 rounded-lg p-4 w-72"
          >
            <h3 className="text-lg font-game text-game-accent mb-4">Inventory</h3>
            
            {collectedItems.length === 0 ? (
              <p className="text-white/70 text-sm italic">Your inventory is empty.</p>
            ) : (
              <div className="grid grid-cols-4 gap-2">
                {collectedItems.map(itemId => (
                  <motion.div
                    key={itemId}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    className={`relative cursor-pointer p-2 rounded-md ${
                      selectedItem === itemId 
                        ? 'bg-game-accent/20 border border-game-accent' 
                        : 'bg-game-dark/50 border border-game-accent/30 hover:border-game-accent/70'
                    }`}
                    onClick={() => handleItemClick(itemId)}
                    onMouseEnter={handleItemHover}
                  >
                    <div className="flex items-center justify-center h-10">
                      {itemDetails[itemId]?.icon || (
                        <div className="w-6 h-6 bg-game-accent/50 rounded-full" />
                      )}
                    </div>
                    
                    {itemId === 'key' && (
                      <motion.div
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className="absolute -top-1 -right-1 w-3 h-3 bg-game-highlight rounded-full"
                      />
                    )}
                  </motion.div>
                ))}
              </div>
            )}
            
            {/* Item details */}
            <AnimatePresence>
              {selectedItem && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                  className="mt-4 pt-4 border-t border-game-accent/30"
                >
                  <div className="flex gap-4">
                    <div className="w-16 h-16 bg-game-dark/50 rounded-md flex items-center justify-center p-2">
                      <img 
                        src={itemDetails[selectedItem]?.image} 
                        alt={itemDetails[selectedItem]?.name} 
                        className="w-full h-full object-contain"
                      />
                    </div>
                    
                    <div className="flex-1">
                      <h4 className="text-game-highlight font-game">
                        {itemDetails[selectedItem]?.name || 'Unknown Item'}
                      </h4>
                      <p className="text-white/80 text-sm mt-1">
                        {itemDetails[selectedItem]?.description || 'No description available.'}
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Inventory;