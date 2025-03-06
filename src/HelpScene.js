import { audioManager } from './AudioManager';

export default class HelpScene extends Phaser.Scene {
    constructor() {
        super({ key: 'HelpScene' });
    }

    create() {
        // Set black background
        this.cameras.main.setBackgroundColor('#000000');
        
        const centerX = this.cameras.main.centerX;
        const centerY = this.cameras.main.centerY;
        
        // Add help text
        const helpText = this.add.text(centerX, centerY, 
            'Welcome to Zoo Battles!\n\n' +
            'In Zoo Battles, you can create epic animal matchups to see which creatures reign supreme! ' +
            'Choose your animals, strategize, and let the battles unfold.\n\n' +
            'Game Modes:\n' +
            'Standard Mode\n' +
            'In this mode, you\'ll face off against an opposing animal team. Your task is to select your own team ' +
            'from a set budget and prepare for the battle!\n\n' +
            'Challenge Mode\n' +
            'In Challenge Mode, you start with a single animal. Your goal is to guess how many of the opposing ' +
            'animals it can defeat!\n\n' +
            'Casino Mode\n' +
            'In this mode, you\'ll be given two animals to choose from. Pick which one you think will emerge ' +
            'victorious in a head-to-head battle!\n\n' +
            'Free Mode\n' +
            'Want total freedom? In Free Mode, you can select any animals you want and create your own custom battles!\n\n' +
            'Game Options:\n' +
            'Music Icon: Toggle the music on or off.\n' +
            'Speaker Icon: Toggle sound effects on or off.\n' +
            'Exclamation Mark Icon: Toggle blood effects on or off.\n' +
            'Fast Forward Icon: Speed up the battle to fast-forward through the action.\n\n' +
            'Battle Mechanics:\n' +
            'Once the battle starts, the teams of animals will automatically engage in combat. Each animal has unique stats, ' +
            'including: Hitpoints, Damage, Speed, Size, Fear Factor.\n\n' +
            'Animals may flee if their opponent has a significantly higher fear factor. And remember, larger animals can deal ' +
            'splash damage—so don\'t be surprised if an elephant takes out a group of chickens with a single charge!\n\n' +
            'Get ready to assemble your team and enjoy the battle!', {
            fontFamily: 'ThaleahFat',
            fontSize: '24px',
            fill: '#ffffff',
            align: 'center',
            wordWrap: { width: this.cameras.main.width - 100 }
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