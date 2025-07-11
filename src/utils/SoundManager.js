/**
 * Sound Manager for the Escape Game
 * Handles loading, playing, and controlling all game audio
 */

class SoundManager {
  constructor() {
    this.sounds = {};
    this.music = null;
    this.isSoundEnabled = true;
    this.isMusicEnabled = true;
    this.volume = 0.7;
    this.musicVolume = 0.5;
    
    // Load settings from localStorage if available
    this.loadSettings();
  }
  
  loadSettings() {
    try {
      const settings = JSON.parse(localStorage.getItem('gameSettings'));
      if (settings) {
        this.isSoundEnabled = settings.soundEnabled;
        this.isMusicEnabled = settings.musicEnabled;
      }
    } catch (e) {
      console.error('Failed to load sound settings:', e);
    }
  }
  
  /**
   * Preload all game sounds
   */
  preloadSounds() {
    console.log('Preloading game sounds...');
    
    // Create placeholder sounds for development
    this.createPlaceholderSounds();
    
    // Sound effects
    this.loadSound('key_found', '/sounds/key_found.mp3');
    this.loadSound('item_collect', '/sounds/item_collect.mp3');
    this.loadSound('door_locked', '/sounds/door_locked.mp3');
    this.loadSound('door_open', '/sounds/door_open.mp3');
    this.loadSound('flashlight_toggle', '/sounds/flashlight_toggle.mp3');
    this.loadSound('flashlight_recharge', '/sounds/flashlight_recharge.mp3');
    this.loadSound('hint_used', '/sounds/hint_used.mp3');
    this.loadSound('level_complete', '/sounds/level_complete.mp3');
    this.loadSound('game_over', '/sounds/game_over.mp3');
    this.loadSound('ui_click', '/sounds/ui_click.mp3');
    this.loadSound('ui_hover', '/sounds/ui_hover.mp3');
    
    // Background music
    this.loadMusic('/sounds/background_music.mp3');
  }
  
  /**
   * Create placeholder sounds for development
   * This allows the game to work even if sound files are missing
   */
  createPlaceholderSounds() {
    // Create a simple audio context
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) return;
      
      const audioCtx = new AudioContext();
      
      // Create placeholder sounds
      const placeholders = {
        'key_found': { frequency: 880, duration: 0.5 },
        'item_collect': { frequency: 440, duration: 0.2 },
        'door_locked': { frequency: 220, duration: 0.3 },
        'door_open': { frequency: 330, duration: 0.8 },
        'flashlight_toggle': { frequency: 660, duration: 0.1 },
        'flashlight_recharge': { frequency: 550, duration: 0.4 },
        'hint_used': { frequency: 770, duration: 0.3 },
        'level_complete': { frequency: 880, duration: 1.0 },
        'game_over': { frequency: 220, duration: 1.0 },
        'ui_click': { frequency: 660, duration: 0.05 },
        'ui_hover': { frequency: 440, duration: 0.05 }
      };
      
      // Create each placeholder sound
      Object.entries(placeholders).forEach(([name, { frequency, duration }]) => {
        const oscillator = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();
        
        oscillator.type = 'sine';
        oscillator.frequency.value = frequency;
        gainNode.gain.value = 0.1;
        
        oscillator.connect(gainNode);
        gainNode.connect(audioCtx.destination);
        
        // Record the audio
        const startTime = audioCtx.currentTime;
        oscillator.start(startTime);
        oscillator.stop(startTime + duration);
        
        // Create a placeholder audio element
        const audio = new Audio();
        this.sounds[name] = audio;
        
        // Override play method to use oscillator
        this.sounds[name].play = () => {
          const osc = audioCtx.createOscillator();
          const gain = audioCtx.createGain();
          
          osc.type = 'sine';
          osc.frequency.value = frequency;
          gain.gain.value = 0.1;
          
          osc.connect(gain);
          gain.connect(audioCtx.destination);
          
          const time = audioCtx.currentTime;
          osc.start(time);
          osc.stop(time + duration);
          
          return Promise.resolve();
        };
      });
      
      // Create placeholder background music
      const musicAudio = new Audio();
      this.music = musicAudio;
      
      // Override play method for music
      this.music.play = () => {
        return Promise.resolve();
      };
      
    } catch (e) {
      console.warn('Could not create placeholder sounds:', e);
    }
  }
  
  /**
   * Load a single sound effect
   */
  loadSound(name, path) {
    // Skip if we already have a placeholder
    if (this.sounds[name] && this.sounds[name].play) {
      return;
    }
    
    try {
      const audio = new Audio();
      audio.src = path;
      audio.preload = 'auto';
      
      this.sounds[name] = audio;
      
      // Handle loading errors
      audio.onerror = () => {
        console.warn(`Failed to load sound: ${name} from ${path} - using placeholder`);
        // Placeholder already created, so no need to do anything
      };
    } catch (e) {
      console.warn(`Error loading sound ${name}:`, e);
    }
  }
  
  /**
   * Load background music
   */
  loadMusic(path) {
    // Skip if we already have a placeholder
    if (this.music && this.music.play) {
      return;
    }
    
    try {
      const audio = new Audio();
      audio.src = path;
      audio.loop = true;
      audio.volume = this.musicVolume;
      
      this.music = audio;
      
      // Handle loading errors
      audio.onerror = () => {
        console.warn(`Failed to load background music from ${path} - using placeholder`);
        // Placeholder already created, so no need to do anything
      };
    } catch (e) {
      console.warn('Error loading background music:', e);
    }
  }
  
  /**
   * Play a sound effect
   */
  playSound(name, options = {}) {
    if (!this.isSoundEnabled) return;
    
    const sound = this.sounds[name];
    if (!sound) {
      console.warn(`Sound "${name}" not found`);
      return;
    }
    
    try {
      // Clone the audio to allow overlapping sounds
      const soundInstance = sound.cloneNode();
      
      // Apply volume
      soundInstance.volume = options.volume !== undefined 
        ? options.volume * this.volume 
        : this.volume;
      
      // Play the sound
      soundInstance.play().catch(e => {
        console.warn(`Failed to play sound "${name}":`, e);
      });
      
      // Apply any other options
      if (options.loop) soundInstance.loop = true;
      
      return soundInstance;
    } catch (e) {
      console.error(`Error playing sound "${name}":`, e);
    }
  }
  
  /**
   * Start playing background music
   */
  playMusic() {
    if (!this.isMusicEnabled || !this.music) return;
    
    try {
      this.music.currentTime = 0;
      this.music.volume = this.musicVolume;
      this.music.play().catch(e => {
        console.warn('Failed to play background music:', e);
      });
    } catch (e) {
      console.error('Error playing background music:', e);
    }
  }
  
  /**
   * Stop background music
   */
  stopMusic() {
    if (!this.music) return;
    
    try {
      this.music.pause();
      this.music.currentTime = 0;
    } catch (e) {
      console.error('Error stopping background music:', e);
    }
  }
  
  /**
   * Pause background music
   */
  pauseMusic() {
    if (!this.music) return;
    
    try {
      this.music.pause();
    } catch (e) {
      console.error('Error pausing background music:', e);
    }
  }
  
  /**
   * Resume background music
   */
  resumeMusic() {
    if (!this.isMusicEnabled || !this.music) return;
    
    try {
      this.music.play().catch(e => {
        console.warn('Failed to resume background music:', e);
      });
    } catch (e) {
      console.error('Error resuming background music:', e);
    }
  }
  
  /**
   * Enable or disable all sound effects
   */
  setSoundEnabled(enabled) {
    this.isSoundEnabled = enabled;
  }
  
  /**
   * Enable or disable background music
   */
  setMusicEnabled(enabled) {
    this.isMusicEnabled = enabled;
    
    if (enabled) {
      this.resumeMusic();
    } else {
      this.pauseMusic();
    }
  }
  
  /**
   * Set the volume for all sound effects
   */
  setSoundVolume(volume) {
    this.volume = Math.max(0, Math.min(1, volume));
  }
  
  /**
   * Set the volume for background music
   */
  setMusicVolume(volume) {
    this.musicVolume = Math.max(0, Math.min(1, volume));
    
    if (this.music) {
      this.music.volume = this.musicVolume;
    }
  }
  
  /**
   * Update sound manager with new settings
   */
  updateSettings(settings) {
    if (!settings) return;
    
    this.setSoundEnabled(settings.soundEnabled);
    this.setMusicEnabled(settings.musicEnabled);
  }
}

// Create a singleton instance
const soundManager = new SoundManager();

export default soundManager;