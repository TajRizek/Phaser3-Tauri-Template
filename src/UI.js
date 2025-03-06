import { createMusicButton, createSoundButton, createBloodButton, createQuitButton, createTimeButton, createRefreshButton } from './components/UIButtons';

export default class UIScene extends Phaser.Scene {
    constructor() {
        super({ key: 'UIScene' });
        this.activeGameScene = null;
    }

    create() {
        console.log('UI Scene launched');
        
        // Set scene to be transparent
        this.cameras.main.setBackgroundColor('rgba(0,0,0,0)');
        this.cameras.main.transparent = true;
        
        // Debug log scene depth
        console.log('UI Scene depth:', this.scene.getIndex('UIScene'));
        
        // Add UI buttons that are always present
        this.musicButton = createMusicButton(this);
        this.soundButton = createSoundButton(this);
        this.bloodButton = createBloodButton(this);
        
        // Determine which scene we're overlaying by checking scene manager
        this.updateActiveScene();
        
        // Listen for scene changes to update UI
        this.events.on('wake', this.onSceneWake, this);
        
        // Listen for scene start events from other scenes
        this.game.events.on('sceneChanged', this.updateActiveScene, this);
    }
    
    updateActiveScene() {
        // Clean up existing scene-specific buttons first
        this.cleanupButtons();
        
        // Make sure the scene is properly initialized with a camera before creating buttons
        if (!this.cameras || !this.cameras.main) {
            console.error('Camera not available in UI scene during updateActiveScene');
            // Try again after a short delay to allow camera initialization
            this.time.delayedCall(100, this.updateActiveScene, [], this);
            return;
        }
        
        // Determine active scene
        this.activeGameScene = null;
        
        if (this.scene.isActive('GameScene')) {
            this.activeGameScene = 'GameScene';
            
            // Get the game mode from GameScene to determine the correct return scene
            const gameScene = this.scene.get('GameScene');
            let targetScene = 'PregameScene'; // Default
            
            if (gameScene && gameScene.scene.settings.data) {
                const { mode } = gameScene.scene.settings.data;
                
                // Determine target scene based on mode
                switch (mode) {
                    case 'challenge':
                        targetScene = 'PregameChallengeScene';
                        break;
                    case 'casino':
                        targetScene = 'PregameCasinoScene';
                        break;
                    case 'free':
                        targetScene = 'PregameFreeScene';
                        break;
                    default:
                        targetScene = 'PregameScene'; // Standard mode
                }
            }
            
            // Add time button only in game scene
            this.timeButton = createTimeButton(this);
            this.quitButton = createQuitButton(this, targetScene);
        } else if (this.scene.isActive('PregameScene')) {
            this.activeGameScene = 'PregameScene';
            this.quitButton = createQuitButton(this, 'MenuScene');
            this.refreshButton = createRefreshButton(this);
        } else if (this.scene.isActive('PregameChallengeScene')) {
            this.activeGameScene = 'PregameChallengeScene';
            this.quitButton = createQuitButton(this, 'MenuScene');
            this.refreshButton = createRefreshButton(this);
        } else if (this.scene.isActive('PregameCasinoScene')) {
            this.activeGameScene = 'PregameCasinoScene';
            this.quitButton = createQuitButton(this, 'MenuScene');
            this.refreshButton = createRefreshButton(this);
        } else if (this.scene.isActive('PregameFreeScene')) {
            this.activeGameScene = 'PregameFreeScene';
            this.quitButton = createQuitButton(this, 'MenuScene');
            this.refreshButton = createRefreshButton(this);
        } else if (this.scene.isActive('MenuScene')) {
            this.activeGameScene = 'MenuScene';
            // Menu scene doesn't need quit button
        }
        
        console.log('Active game scene detected:', this.activeGameScene);
    }
    
    onSceneWake() {
        console.log('UI Scene woken up');
        this.updateActiveScene();
    }
    
    cleanupButtons() {
        // Clean up scene-specific buttons
        if (this.timeButton) {
            this.timeButton.destroy();
            this.timeButton = null;
        }
        
        if (this.quitButton) {
            this.quitButton.destroy();
            this.quitButton = null;
        }
        
        if (this.refreshButton) {
            this.refreshButton.destroy();
            this.refreshButton = null;
        }
    }

    shutdown() {
        console.log('UI Scene shutdown');
        
        // Clean up all buttons
        this.cleanupButtons();
        
        if (this.musicButton) this.musicButton.destroy();
        if (this.soundButton) this.soundButton.destroy();
        if (this.bloodButton) this.bloodButton.destroy();
        
        // Remove event listeners
        this.events.off('wake', this.onSceneWake);
        this.game.events.off('sceneChanged', this.updateActiveScene);
    }
}
