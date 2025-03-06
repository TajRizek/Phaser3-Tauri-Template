import { audioManager } from './AudioManager';

export default class CreditsScene extends Phaser.Scene {
    constructor() {
        super({ key: 'CreditsScene' });
    }

    create() {
        // Set black background
        this.cameras.main.setBackgroundColor('#000000');
        
        const centerX = this.cameras.main.centerX;
        const centerY = this.cameras.main.centerY;
        
        // Add credits text
        const creditsText = this.add.text(centerX, centerY, 'CREDITS\n\n' + 
            'Animal Assets: Small Scale Interactive\n' +
            'Animal Sounds: Aligned Games\n' +
            'Background Graphics: ELV Games\n' +
            'Blood Animations: unTied Games\n' +
            'Font: Tiny Worlds\n' +
            'Music: Tallbeard Studios\n' +
            'Icons: Leo Red\n\n' +
            'All creators are from Itch.io\n\n' +
            'Thanks for playing!', {
            fontFamily: 'ThaleahFat',
            fontSize: '36px',
            fill: '#ffffff',
            align: 'center'
        }).setOrigin(0.5);
        
        // Add back button at the bottom
        const backButton = this.add.text(centerX, this.cameras.main.height - 100, 'BACK', {
            fontFamily: 'ThaleahFat',
            fontSize: '48px',
            fill: '#ffffff'
        }).setOrigin(0.5)
          .setInteractive();
        
        // Add hover effect
        backButton.on('pointerover', () => backButton.setStyle({ fill: '#ff0' }));
        backButton.on('pointerout', () => backButton.setStyle({ fill: '#fff' }));
        
        // Add click handler
        backButton.on('pointerdown', () => {
            // Play click sound
            audioManager.playButtonClick(this);
            
            // Return to menu scene
            this.scene.start('MenuScene');
            
            // Notify UI scene that we've changed scenes
            this.game.events.emit('sceneChanged');
        });
    }
} 