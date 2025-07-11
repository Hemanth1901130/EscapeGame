import { Link } from 'react-router-dom';
import { FaArrowLeft, FaLightbulb, FaBatteryHalf, FaKey, FaSearch } from 'react-icons/fa';

const Instructions = () => {
  return (
    <div className="game-container py-8">
      <div className="max-w-3xl mx-auto">
        <Link to="/" className="flex items-center gap-2 text-white hover:text-game-accent mb-8">
          <FaArrowLeft />
          <span>Back to Home</span>
        </Link>
        
        <h1 className="text-3xl md:text-4xl font-game text-game-accent mb-8">How to Play</h1>
        
        <div className="game-panel mb-8">
          <h2 className="text-xl font-game text-game-highlight mb-4">Game Objective</h2>
          <p className="text-white mb-4">
            Your goal is to find the hidden key in each level to escape the darkness. 
            Use your flashlight to navigate through the dark environment and discover hidden objects and clues.
          </p>
        </div>
        
        <div className="game-panel mb-8">
          <h2 className="text-xl font-game text-game-highlight mb-4">Controls</h2>
          <ul className="text-white space-y-4">
            <li className="flex items-start gap-3">
              <FaSearch className="text-game-accent mt-1 flex-shrink-0" />
              <div>
                <strong className="text-game-accent">Mouse Movement:</strong> Move your cursor around the screen to control your flashlight and illuminate the darkness.
              </div>
            </li>
            <li className="flex items-start gap-3">
              <FaLightbulb className="text-game-accent mt-1 flex-shrink-0" />
              <div>
                <strong className="text-game-accent">Flashlight Controls:</strong> Use the buttons at the bottom right to turn your flashlight on/off and recharge it when needed.
              </div>
            </li>
            <li className="flex items-start gap-3">
              <FaBatteryHalf className="text-game-accent mt-1 flex-shrink-0" />
              <div>
                <strong className="text-game-accent">Battery Management:</strong> Your flashlight battery drains over time. Keep an eye on the battery indicator and recharge when necessary.
              </div>
            </li>
            <li className="flex items-start gap-3">
              <FaKey className="text-game-accent mt-1 flex-shrink-0" />
              <div>
                <strong className="text-game-accent">Finding Items:</strong> Click on items when they become visible in your flashlight beam to collect them. The key is required to complete each level.
              </div>
            </li>
          </ul>
        </div>
        
        <div className="game-panel mb-8">
          <h2 className="text-xl font-game text-game-highlight mb-4">Tips</h2>
          <ul className="text-white space-y-2">
            <li>• Move your flashlight slowly to carefully examine each area</li>
            <li>• Look for subtle glimmers or reflections that might indicate hidden objects</li>
            <li>• Collect all items to uncover the full story</li>
            <li>• Use hints sparingly - you only get three per level</li>
            <li>• Manage your battery life carefully</li>
          </ul>
        </div>
        
        <div className="text-center mt-12">
          <Link to="/game">
            <button className="px-8 py-3 text-lg">
              Start Game
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Instructions;