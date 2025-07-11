import { Link } from 'react-router-dom';
import { FaHome, FaQuestionCircle } from 'react-icons/fa';

const NotFound = () => {
  return (
    <div className="game-container">
      <div className="flex flex-col items-center justify-center min-h-[80vh] text-center">
        <h1 className="text-6xl font-game text-game-accent mb-6">404</h1>
        <h2 className="text-3xl text-white mb-8">Page Not Found</h2>
        
        <p className="text-white/80 max-w-md mb-10">
          You've ventured too far into the darkness. This area doesn't exist in our game world.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4">
          <Link to="/">
            <button className="flex items-center gap-2">
              <FaHome />
              Return Home
            </button>
          </Link>
          
          <Link to="/instructions">
            <button className="flex items-center gap-2 bg-transparent">
              <FaQuestionCircle />
              How to Play
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFound;