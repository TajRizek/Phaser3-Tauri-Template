import { createMusicButton, createSoundButton, createBloodButton } from './components/UIButtons';
import { audioManager } from './AudioManager';
import { invoke } from '@tauri-apps/api/core';

export default class MenuScene extends Phaser.Scene {
    constructor() {
        super({ key: 'MenuScene' });
    }

    preload() {
        // Create loading bar
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
        
        // Add background first - Fix: Load the correct background image
        this.load.image('background', '/assets/background/bg2.png');
        
        // Add banner first - Move banner position even higher up
        const bannerY = height / 2 - 200; // Moved up from -150 to -200
        // Move loading elements down to where buttons will be
        const loadingBarY = height / 2 + 300;
        
        // Add the banner image
        const banner = this.add.image(width / 2, bannerY, 'banner');
        //banner.setScale(0.8);
        
        // Loading bar background
        const loadingBarBg = this.add.rectangle(width / 2, loadingBarY, 400, 30, 0x333333);
        
        // Loading bar fill
        const loadingBar = this.add.rectangle(width / 2 - 200, loadingBarY, 0, 30, 0x00ff00);
        loadingBar.setOrigin(0, 0.5);

        // Loading text - moved down
        const loadingText = this.add.text(width / 2, loadingBarY - 50, 'Loading...', {
            fontFamily: 'ThaleahFat',
            fontSize: '36px',
            fill: '#ffffff'
        }).setOrigin(0.5);

        // Loading progress text - moved down
        const progressText = this.add.text(width / 2, loadingBarY + 50, '0%', {
            fontFamily: 'ThaleahFat',
            fontSize: '36px',
            fill: '#ffffff'
        }).setOrigin(0.5);
        
        // Add file name text
        const fileText = this.add.text(width / 2, loadingBarY + 100, '', {
            fontFamily: 'ThaleahFat',
            fontSize: '24px',
            fill: '#ffffff'
        }).setOrigin(0.5);

        // Update loading bar as assets are loaded
        this.load.on('progress', (value) => {
            loadingBar.width = 400 * value;
            progressText.setText(`${Math.round(value * 100)}%`);
        });
        
        // Add file load event to display current file being loaded
        this.load.on('fileprogress', (file) => {
            fileText.setText(`${file.key}`);
        });

        // When loading completes
        this.load.on('complete', () => {
            loadingBar.destroy();
            loadingBarBg.destroy();
            loadingText.destroy();
            progressText.destroy();
            fileText.destroy(); // Also destroy the file text
            this.createMenuButtons();
        });

        // Start loading all game assets
        const { preload } = require('./Preload.js');
        preload(this);
    }

    createMenuButtons() {
        const centerX = this.cameras.main.centerX;
        const centerY = this.cameras.main.centerY + 250; // Moved down from +200 to +250
        
        const textStyle = {
            fontFamily: 'ThaleahFat',
            fontSize: '36px',
            fill: '#ffffff'
        };

        // Create all menu buttons - Removed "Options" button
        const menuItems = [
            { text: 'Standard Mode', scene: 'PregameScene' },
            { text: 'Challenge Mode', scene: 'PregameChallengeScene' },
            { text: 'Casino Mode', scene: 'PregameCasinoScene' },
            { text: 'Free Mode', scene: 'PregameFreeScene' },
            { text: 'Help', scene: 'HelpScene' },
            { text: 'Credits', scene: 'CreditsScene' },
            { text: 'Exit', action: 'exit' }
        ];

        // Calculate spacing between buttons
        const buttonSpacing = 50;
        const startY = centerY - ((menuItems.length - 1) * buttonSpacing) / 2;

        // Create all buttons
        menuItems.forEach((item, index) => {
            const button = this.add.text(centerX, startY + index * buttonSpacing, item.text, textStyle)
                .setOrigin(0.5)
                .setInteractive();

            // Add hover effect
            button.on('pointerover', () => button.setStyle({ fill: '#ff0' }));
            button.on('pointerout', () => button.setStyle({ fill: '#fff' }));

            // Add click handler
            button.on('pointerdown', async () => {
                // Play click sound
                audioManager.playButtonClick(this);
                
                // Handle exit action
                if (item.action === 'exit') {
                    try {
                        // Shutdown the game
                        this.game.destroy(true);
                        // Additional cleanup
                        window.gameInstance = null;
                        // Call our Rust exit command
                        await invoke('close_application');
                    } catch (e) {
                        console.error('Failed to exit:', e);
                    }
                }
                // Navigate to scene if one is specified
                else if (item.scene) {
                    this.scene.start(item.scene);
                    // Notify UI scene that we've changed scenes
                    this.game.events.emit('sceneChanged');
                }
            });
        });
    }

    create() {
        // The create function is now empty because buttons are created 
        // after loading completes

        // Notify UI scene that we've changed scenes
        this.game.events.emit('sceneChanged');

        // Add UI buttons
        this.musicButton = createMusicButton(this);
        this.soundButton = createSoundButton(this);
        this.bloodButton = createBloodButton(this);

        // Start menu music if not already playing
        audioManager.playMusic(this, 'menu_music');
    }
} 