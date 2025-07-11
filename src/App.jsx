import { useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import { GameProvider } from './context/GameContext';
import Layout from './components/Layout';
import Home from './pages/Home';
import Game from './pages/Game';
import Instructions from './pages/Instructions';
import NotFound from './pages/NotFound';
import LoadingScreen from './components/LoadingScreen';
import SettingsPanel from './components/SettingsPanel';
import soundManager from './utils/SoundManager';
import './App.css';

function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [settings, setSettings] = useState({
    soundEnabled: true,
    musicEnabled: true,
    difficulty: 'medium',
    brightness: 50,
    flashlightIntensity: 70,
    hintFrequency: 'normal'
  });

  // Initialize sound manager
  useEffect(() => {
    // Preload sounds when app starts
    soundManager.preloadSounds();
    
    // Apply settings to sound manager
    soundManager.updateSettings(settings);
  }, []);

  // Apply settings when they change
  useEffect(() => {
    soundManager.updateSettings(settings);
    
    // Apply brightness to the root element
    document.documentElement.style.filter = `brightness(${settings.brightness / 100 * 0.7 + 0.3})`;
    
    // Apply other settings as needed
  }, [settings]);

  const handleLoadingComplete = () => {
    setIsLoading(false);
    soundManager.playMusic();
  };

  const handleSettingsChange = (newSettings) => {
    setSettings(newSettings);
  };

  return (
    <>
      {isLoading ? (
        <LoadingScreen onLoadingComplete={handleLoadingComplete} />
      ) : (
        <GameProvider>
          <SettingsPanel onSettingsChange={handleSettingsChange} />
          <Routes>
            <Route path="/" element={<Layout />}>
              <Route index element={<Home />} />
              <Route path="game" element={<Game settings={settings} />} />
              <Route path="instructions" element={<Instructions />} />
              <Route path="*" element={<NotFound />} />
            </Route>
          </Routes>
        </GameProvider>
      )}
    </>
  );
}

export default App;
