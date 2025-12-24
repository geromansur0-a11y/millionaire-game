/**
 * CONFIG.JS
 * Konfigurasi game Who Wants to Be a Millionaire
 */

class GameConfig {
    constructor() {
        this.config = this.loadConfig();
        this.initializeConfig();
    }

    // Load configuration from localStorage
    loadConfig() {
        const defaultConfig = {
            timerDuration: 30,
            enableSounds: true,
            enableAnimations: true,
            lifelinesEnabled: true,
            difficulty: 'medium',
            language: 'id',
            theme: 'dark',
            fontSize: 'medium',
            vibration: true,
            musicVolume: 70,
            soundVolume: 80,
            autoSave: true,
            showHints: true,
            safeZoneEnabled: true,
            prizeLevels: [500000, 1000000, 2000000, 5000000, 10000000, 25000000, 50000000, 100000000, 250000000, 500000000, 1000000000]
        };

        try {
            const saved = localStorage.getItem('millionaire_config');
            if (saved) {
                return { ...defaultConfig, ...JSON.parse(saved) };
            }
        } catch (error) {
            console.error('Error loading config:', error);
        }

        return defaultConfig;
    }

    // Initialize configuration
    initializeConfig() {
        // Apply config to game
        this.applyConfig();
    }

    // Apply configuration to game
    applyConfig() {
        // Apply font size
        document.documentElement.style.setProperty('--font-size', this.getFontSizeValue());
        
        // Apply theme
        if (this.config.theme === 'light') {
            document.documentElement.style.setProperty('--primary', '#ffffff');
            document.documentElement.style.setProperty('--secondary', '#f5f5f5');
            document.documentElement.style.setProperty('--text-dark', '#000000');
        }
    }

    // Get font size value
    getFontSizeValue() {
        switch(this.config.fontSize) {
            case 'small': return '14px';
            case 'large': return '18px';
            case 'xlarge': return '20px';
            default: return '16px';
        }
    }

    // Save configuration
    save() {
        try {
            localStorage.setItem('millionaire_config', JSON.stringify(this.config));
            this.applyConfig();
            return true;
        } catch (error) {
            console.error('Error saving config:', error);
            return false;
        }
    }

    // Update configuration
    update(newConfig) {
        this.config = { ...this.config, ...newConfig };
        return this.save();
    }

    // Reset to default configuration
    reset() {
        this.config = this.loadConfig();
        localStorage.removeItem('millionaire_config');
        this.applyConfig();
        return true;
    }

    // Get configuration
    get(key) {
        return this.config[key];
    }

    // Set configuration value
    set(key, value) {
        this.config[key] = value;
        return this.save();
    }

    // Export configuration
    export() {
        return JSON.stringify(this.config, null, 2);
    }

    // Import configuration
    import(configString) {
        try {
            const newConfig = JSON.parse(configString);
            this.config = newConfig;
            return this.save();
        } catch (error) {
            console.error('Error importing config:', error);
            return false;
        }
    }

    // Get available themes
    getAvailableThemes() {
        return [
            { id: 'dark', name: 'Gelap', primary: '#0c2461', secondary: '#1e3799' },
            { id: 'light', name: 'Terang', primary: '#ffffff', secondary: '#f5f5f5' },
            { id: 'blue', name: 'Biru', primary: '#1a237e', secondary: '#283593' },
            { id: 'green', name: 'Hijau', primary: '#1b5e20', secondary: '#2e7d32' },
            { id: 'purple', name: 'Ungu', primary: '#4a148c', secondary: '#6a1b9a' }
        ];
    }

    // Get available languages
    getAvailableLanguages() {
        return [
            { id: 'id', name: 'Bahasa Indonesia', flag: '🇮🇩' },
            { id: 'en', name: 'English', flag: '🇺🇸' },
            { id: 'es', name: 'Español', flag: '🇪🇸' },
            { id: 'fr', name: 'Français', flag: '🇫🇷' },
            { id: 'de', name: 'Deutsch', flag: '🇩🇪' }
        ];
    }

    // Get difficulty levels
    getDifficultyLevels() {
        return [
            { id: 'easy', name: 'Mudah', timer: 45, lifelines: 3 },
            { id: 'medium', name: 'Sedang', timer: 30, lifelines: 3 },
            { id: 'hard', name: 'Sulit', timer: 20, lifelines: 2 },
            { id: 'expert', name: 'Expert', timer: 15, lifelines: 1 }
        ];
    }

    // Get current difficulty
    getCurrentDifficulty() {
        return this.getDifficultyLevels().find(d => d.id === this.config.difficulty) || 
               this.getDifficultyLevels()[1];
    }

    // Get game rules based on difficulty
    getGameRules() {
        const difficulty = this.getCurrentDifficulty();
        return {
            timerPerQuestion: difficulty.timer,
            lifelinesCount: difficulty.lifelines,
            safeZones: this.config.safeZoneEnabled ? [5, 10] : [],
            walkAwayEnabled: true,
            phoneFriendDuration: 30,
            audiencePollAccuracy: 80,
            fiftyFiftyEnabled: true
        };
    }
}

// Create global instance
window.gameConfig = new GameConfig();
