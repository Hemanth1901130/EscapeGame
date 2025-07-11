import { Link } from 'react-router-dom';
import { useState } from 'react';
import { FaLightbulb, FaQuestion, FaHome } from 'react-icons/fa';
import useGameContext from '../hooks/useGameContext';

const Navbar = () => {
  const { hintsUsed, timeElapsed } = useGameContext();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-game-darker/80 backdrop-blur-sm border-b border-game-accent/30">
      <div className="game-container flex justify-between items-center py-4">
        <Link to="/" className="flex items-center gap-2">
          <span className="text-game-accent font-game text-xl">ESCAPE</span>
        </Link>

        <div className="hidden md:flex items-center gap-8">
          <Link to="/" className="flex items-center gap-2 text-white hover:text-game-accent transition-colors">
            <FaHome />
            <span>Home</span>
          </Link>
          <div className="flex items-center gap-2 text-white">
            <FaLightbulb className="text-game-highlight animate-flicker" />
            <span>Hints: {hintsUsed}/3</span>
          </div>
          <div className="flex items-center gap-2 text-white">
            <span className="font-mono">{formatTime(timeElapsed)}</span>
          </div>
        </div>

        <div className="md:hidden">
          <button 
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="text-white p-2"
          >
            <span className="block w-6 h-0.5 bg-white mb-1"></span>
            <span className="block w-6 h-0.5 bg-white mb-1"></span>
            <span className="block w-6 h-0.5 bg-white"></span>
          </button>
        </div>
      </div>

      {isMenuOpen && (
        <div className="md:hidden bg-game-darker border-t border-game-accent/30 py-4">
          <div className="game-container flex flex-col gap-4">
            <Link 
              to="/" 
              className="flex items-center gap-2 text-white hover:text-game-accent transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              <FaHome />
              <span>Home</span>
            </Link>
            <div className="flex items-center gap-2 text-white">
              <FaLightbulb className="text-game-highlight animate-flicker" />
              <span>Hints: {hintsUsed}/3</span>
            </div>
            <div className="flex items-center gap-2 text-white">
              <span className="font-mono">{formatTime(timeElapsed)}</span>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;