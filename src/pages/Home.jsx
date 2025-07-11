import { Link } from 'react-router-dom';
// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion';
import { FaKey, FaLock, FaPlay } from 'react-icons/fa';
import useGameContext from '../hooks/useGameContext';

const Home = () => {
  const { startGame } = useGameContext();

  return (
    <div className="game-container">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="flex flex-col items-center justify-center min-h-[80vh]"
      >
        <h1 className="game-title">
          <span className="text-white">FIND THE</span> KEY
        </h1>
        
        <motion.div
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
          transition={{ 
            duration: 2,
            repeat: Infinity,
            repeatType: "reverse"
          }}
          className="my-8"
        >
          <FaKey className="text-game-highlight text-8xl" />
        </motion.div>
        
        <p className="text-white text-center max-w-2xl mb-8 text-lg">
          You wake up in a dark room. The only way to escape is to find the hidden key.
          Use your flashlight to navigate through the darkness and uncover clues that will
          lead you to freedom. But be careful, your battery won't last forever...
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 mt-4">
          <Link to="/game">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={startGame}
              className="flex items-center gap-2 px-8 py-3 text-lg"
            >
              <FaPlay />
              Start Game
            </motion.button>
          </Link>
          
          <Link to="/instructions">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center gap-2 px-8 py-3 text-lg bg-transparent"
            >
              <FaLock />
              How to Play
            </motion.button>
          </Link>
        </div>
      </motion.div>
    </div>
  );
};

export default Home;