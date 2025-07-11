import { useContext } from 'react';
import GameContext from '../context/GameContextDefinition';

// Hook to use the game context
const useGameContext = () => useContext(GameContext);

export default useGameContext;