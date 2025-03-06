import { audioManager } from '../AudioManager';
import { uiManager } from '../UIManager';

// Create a UI button with consistent styling and behavior
function createUIButton(scene, x, y, iconKey, callback, initialState = true) {
    const button = scene.add.image(x, y, iconKey)
        .setScale(1.0)
        .setInteractive({ useHandCursor: true })
        .setDepth(1000); // Ensure it's always on top

    // Set initial state
    button.setTint(initialState ? 0xffffff : 0x666666);

    button.on('pointerdown', () => {
        // Play click sound
        audioManager.playButtonClick(scene);
        
        const newState = callback();
        button.setTint(newState ? 0xffffff : 0x666666);
    });

    button.on('pointerover', () => {
        button.setScale(1.1);
    });

    button.on('pointerout', () => {
        button.setScale(1.0);
    });

    return button;
}

export function createMusicButton(scene) {
    // Add safety check for camera dimensions
    if (!scene.cameras || !scene.cameras.main) {
        console.error('Camera not available when creating music button');
        return null;
    }
    
    return createUIButton(
        scene, 
        scene.cameras.main.width - 60, 
        60, 
        'btn_icon_music',
        () => !audioManager.toggleMusic(),
        !audioManager.isMusicMuted
    );
}

export function createSoundButton(scene) {
    // Add safety check for camera dimensions
    if (!scene.cameras || !scene.cameras.main) {
        console.error('Camera not available when creating sound button');
        return null;
    }
    
    return createUIButton(
        scene, 
        scene.cameras.main.width - 60, 
        130, 
        'btn_icon_volume',
        () => !audioManager.toggleSound(),
        !audioManager.isSoundMuted
    );
}

export function createBloodButton(scene) {
    // Add safety check for camera dimensions
    if (!scene.cameras || !scene.cameras.main) {
        console.error('Camera not available when creating blood button');
        return null;
    }
    
    return createUIButton(
        scene, 
        scene.cameras.main.width - 60, 
        200, 
        'btn_icon_water',
        () => uiManager.toggleBlood(),
        uiManager.isBloodEnabled
    );
}

export function createQuitButton(scene, targetScene) {
    // If targetScene is not specified, determine it based on the active game scene
    if (!targetScene && scene.scene.key === 'UIScene') {
        // Get the game mode from the GameScene
        const gameScene = scene.scene.get('GameScene');
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
        } else {
            // Default to PregameScene if no mode is found
            targetScene = 'PregameScene';
        }
    } else if (!targetScene) {
        // Default target scene if not in UI scene
        targetScene = 'MenuScene';
    }

    const button = createUIButton(
        scene, 
        60, 
        60, 
        'btn_icon_quit',
        () => {
            console.log(`Quitting to ${targetScene}`);
            
            // If we're in the UI scene
            if (scene.scene.key === 'UIScene') {
                // Get the active game scene
                const activeScene = scene.activeGameScene;
                
                if (activeScene) {
                    console.log(`Stopping active scene: ${activeScene}`);
                    // Stop the active scene
                    scene.scene.stop(activeScene);
                }
                
                // Start the target scene
                scene.scene.start(targetScene);
                
                // Notify about scene change
                scene.game.events.emit('sceneChanged');
                
                // Sleep the UI scene (will be woken by target scene)
                scene.scene.sleep();
            } else {
                // If we're in any other scene
                scene.scene.start(targetScene);
                
                // Notify about scene change
                scene.game.events.emit('sceneChanged');
            }
            
            return true;
        },
        true
    );
    
    return button;
}

export function createTimeButton(scene) {
    console.log('Creating time button');
    
    // Add safety check for camera dimensions
    if (!scene.cameras || !scene.cameras.main) {
        console.error('Camera not available when creating time button');
        return null;
    }
    
    // Position at bottom right with some padding
    const x = scene.cameras.main.width - 100;
    const y = scene.cameras.main.height - 100;
    
    const button = createUIButton(
        scene, 
        x, 
        y, 
        'btn_icon_time',
        () => {
            console.log('Time button clicked');
            const newSpeed = uiManager.toggleGameSpeed();
            console.log('New game speed:', newSpeed);
            
            // Apply speed change to the game scene
            const gameScene = scene.scene.get('GameScene');
            if (gameScene) {
                // Set time scale for the entire scene
                gameScene.time.timeScale = newSpeed;
                
                // Set physics time scale (inverse relationship)
                gameScene.physics.world.timeScale = 1/newSpeed;
            }
            
            // Return true when speed is fast (button should be lit up when active)
            return newSpeed > 1;
        },
        false // Initially not active (normal speed)
    );
    
    return button;
}

export function createRefreshButton(scene) {
    // Add safety check for camera dimensions
    if (!scene.cameras || !scene.cameras.main) {
        console.error('Camera not available when creating refresh button');
        return null;
    }
    
    return createUIButton(
        scene, 
        60, 
        scene.cameras.main.height / 2, 
        'btn_icon_refresh',
        () => {
            // Restart the pregame scene to shuffle everything
            scene.scene.restart();
            return true;
        },
        true
    );
} 