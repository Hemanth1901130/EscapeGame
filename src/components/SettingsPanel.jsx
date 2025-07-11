import { useState, useEffect } from 'react';
// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion';
import { FaCog, FaVolumeUp, FaVolumeMute, FaAdjust, FaTimes, FaLightbulb } from 'react-icons/fa';

const SettingsPanel = ({ onSettingsChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [settings, setSettings] = useState({
    soundEnabled: true,
    musicEnabled: true,
    difficulty: 'medium',
    brightness: 50,
    flashlightIntensity: 70,
    hintFrequency: 'normal'
  });

  // Apply settings when they change
  useEffect(() => {
    if (onSettingsChange) {
      onSettingsChange(settings);
    }
    
    // Save settings to localStorage
    localStorage.setItem('gameSettings', JSON.stringify(settings));
  }, [settings, onSettingsChange]);

  // Load settings from localStorage on mount
  useEffect(() => {
    const savedSettings = localStorage.getItem('gameSettings');
    if (savedSettings) {
      try {
        setSettings(JSON.parse(savedSettings));
      } catch (e) {
        console.error('Failed to parse saved settings:', e);
      }
    }
  }, []);

  const toggleSetting = (key) => {
    setSettings(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const updateSetting = (key, value) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  return (
    <>
      {/* Settings toggle button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed top-20 right-20 z-40 bg-game-darker p-3 rounded-full border border-game-accent/30 hover:border-game-accent transition-colors"
        aria-label="Open Settings"
      >
        <FaCog className="text-game-accent text-xl animate-spin-slow" />
      </button>

      {/* Settings panel */}
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, x: 300 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 300 }}
          transition={{ type: 'spring', damping: 25 }}
          className="fixed top-0 right-0 h-full w-80 bg-game-darker/95 backdrop-blur-md z-50 border-l border-game-accent/30 p-6 overflow-y-auto"
        >
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-game text-game-accent">Settings</h2>
            <button
              onClick={() => setIsOpen(false)}
              className="text-white hover:text-game-accent transition-colors p-2 bg-game-dark/50 rounded-full"
              aria-label="Close Settings"
            >
              <FaTimes className="text-xl" />
            </button>
          </div>

          <div className="space-y-6">
            {/* Sound Settings */}
            <div className="game-panel">
              <h3 className="text-lg font-game text-game-highlight mb-4">Audio</h3>
              
              <div className="flex justify-between items-center mb-4">
                <span className="text-white">Sound Effects</span>
                <button 
                  onClick={() => toggleSetting('soundEnabled')}
                  className={`p-2 rounded ${settings.soundEnabled ? 'text-game-highlight' : 'text-white/50'}`}
                >
                  {settings.soundEnabled ? <FaVolumeUp /> : <FaVolumeMute />}
                </button>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-white">Background Music</span>
                <button 
                  onClick={() => toggleSetting('musicEnabled')}
                  className={`p-2 rounded ${settings.musicEnabled ? 'text-game-highlight' : 'text-white/50'}`}
                >
                  {settings.musicEnabled ? <FaVolumeUp /> : <FaVolumeMute />}
                </button>
              </div>
            </div>

            {/* Difficulty Settings */}
            <div className="game-panel">
              <h3 className="text-lg font-game text-game-highlight mb-4">Difficulty</h3>
              
              <div className="grid grid-cols-3 gap-2 mb-4">
                {['easy', 'medium', 'hard'].map(level => (
                  <button
                    key={level}
                    onClick={() => updateSetting('difficulty', level)}
                    className={`py-2 px-3 rounded border ${
                      settings.difficulty === level 
                        ? 'bg-game-accent text-game-dark border-game-accent' 
                        : 'bg-transparent text-white border-game-accent/30 hover:border-game-accent'
                    } transition-colors capitalize`}
                  >
                    {level}
                  </button>
                ))}
              </div>
              
              <div className="text-white/70 text-sm">
                {settings.difficulty === 'easy' && 'More hints, brighter flashlight, easier to find items.'}
                {settings.difficulty === 'medium' && 'Balanced gameplay with moderate challenge.'}
                {settings.difficulty === 'hard' && 'Limited hints, dimmer flashlight, well-hidden items.'}
              </div>
            </div>

            {/* Visual Settings */}
            <div className="game-panel">
              <h3 className="text-lg font-game text-game-highlight mb-4">Visual</h3>
              
              <div className="mb-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-white flex items-center gap-2">
                    <FaAdjust /> Brightness
                  </span>
                  <span className="text-white/70">{settings.brightness}%</span>
                </div>
                <input 
                  type="range" 
                  min="10" 
                  max="100" 
                  value={settings.brightness} 
                  onChange={(e) => updateSetting('brightness', parseInt(e.target.value))}
                  className="w-full accent-game-accent bg-game-dark h-2 rounded-full appearance-none"
                />
              </div>
              
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-white flex items-center gap-2">
                    <FaLightbulb /> Flashlight Intensity
                  </span>
                  <span className="text-white/70">{settings.flashlightIntensity}%</span>
                </div>
                <input 
                  type="range" 
                  min="30" 
                  max="100" 
                  value={settings.flashlightIntensity} 
                  onChange={(e) => updateSetting('flashlightIntensity', parseInt(e.target.value))}
                  className="w-full accent-game-accent bg-game-dark h-2 rounded-full appearance-none"
                />
              </div>
            </div>

            {/* Reset Button */}
            <button
              onClick={() => setSettings({
                soundEnabled: true,
                musicEnabled: true,
                difficulty: 'medium',
                brightness: 50,
                flashlightIntensity: 70,
                hintFrequency: 'normal'
              })}
              className="w-full py-2 px-4 bg-transparent border border-game-accent text-game-accent hover:bg-game-accent hover:text-game-dark transition-colors rounded"
            >
              Reset to Defaults
            </button>
            
            {/* Close Button at the bottom for better accessibility */}
            <button
              onClick={() => setIsOpen(false)}
              className="w-full mt-4 py-3 px-4 bg-game-accent text-game-dark font-bold hover:bg-game-highlight transition-colors rounded flex items-center justify-center gap-2"
            >
              <FaTimes /> Close Settings
            </button>
          </div>
        </motion.div>
      )}
    </>
  );
};

export default SettingsPanel;