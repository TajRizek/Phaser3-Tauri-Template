import { AnimalStats, getRandomAnimalSound } from './Animal';
import { createMusicButton, createSoundButton, createBloodButton, createQuitButton, createRefreshButton } from './components/UIButtons';
import { audioManager } from './AudioManager';

export default class PregameChallengeScene extends Phaser.Scene {
    constructor() {
        super({ key: 'PregameChallengeScene' });
        this.selectedAnimal = null;
        this.opponentAnimal = null;
        this.opponentCount = 0;
        this.maxCount = 999;
    }

    init() {
        this.selectedAnimal = null;
        this.opponentAnimal = null;
        this.opponentCount = 0;
    }

    preload() {
        //console.log('Starting preload of PregameChallengeScene');
        
        // Ensure all animal icons are loaded
        const animalNames = Object.keys(AnimalStats);
        animalNames.forEach(animal => {
            const displayName = animal.charAt(0).toUpperCase() + animal.slice(1);
            const iconKey = `icon_${animal.toLowerCase().replace(/ /g, '_')}`;
            
            // Only load if not already loaded
            if (!this.textures.exists(iconKey)) {
                this.load.image(iconKey, `assets/icons/v2/${displayName}.webp`);
            }
        });
    }

    create() {
        // Notify UI scene that we've changed scenes
        this.game.events.emit('sceneChanged');
        
        const centerX = this.cameras.main.centerX;
        const centerY = this.cameras.main.centerY;
        
        // Create title
        this.add.text(centerX, 50, 'Challenge Mode', {
            fontFamily: 'ThaleahFat',
            fontSize: '48px',
            fill: '#ffffff'
        }).setOrigin(0.5);

        // Create challenge question
        this.questionText = this.add.text(centerX, 120, 'How many animals can this one defeat?', {
            fontFamily: 'ThaleahFat',
            fontSize: '64px',
            fill: '#ffffff'
        }).setOrigin(0.5);

        // Setup the challenge
        this.setupChallenge();

        // Create GO! button
        this.goButton = this.add.rectangle(this.cameras.main.width - 100, 
            this.cameras.main.height - 100, 120, 80, 0x000000)
            .setInteractive({ useHandCursor: true });
        
        const goText = this.add.text(this.cameras.main.width - 100, 
            this.cameras.main.height - 100, 'GO!', {
            fontFamily: 'ThaleahFat',
            fontSize: '64px',
            fill: '#ffffff'
        }).setOrigin(0.5);

        // Update GO button hover effects
        this.goButton.on('pointerover', () => {
            goText.setStyle({ fill: '#ffff00' });
        });
        
        this.goButton.on('pointerout', () => {
            goText.setStyle({ fill: '#ffffff' });
        });
        
        this.goButton.on('pointerdown', () => {
            // Play click sound
            audioManager.playButtonClick(this);
            
            // Only start if we have selected an opponent count
            if (this.opponentCount > 0) {
                this.startBattle();
            }
        });

        // Add UI buttons
        this.musicButton = createMusicButton(this);
        this.soundButton = createSoundButton(this);
        this.bloodButton = createBloodButton(this);
        this.quitButton = createQuitButton(this, 'MenuScene');
        this.refreshButton = createRefreshButton(this);

        // Continue menu music
        if (!this.scene.get('MenuScene').scene.isActive()) {
            audioManager.playMusic(this, 'menu_music');
        }
    }

    setupChallenge() {
        // Get all animals
        const animals = Object.entries(AnimalStats);
        
        // Categorize animals by size/strength
        const largeAnimals = animals.filter(([,stats]) => stats.price > 2000);
        const mediumAnimals = animals.filter(([,stats]) => stats.price > 500 && stats.price <= 2000);
        const smallAnimals = animals.filter(([,stats]) => stats.price <= 500);
        
        // Randomly select a large animal as the challenger
        const challengerIndex = Math.floor(Math.random() * largeAnimals.length);
        this.selectedAnimal = largeAnimals[challengerIndex][0];
        
        // Randomly select a small or medium animal as the opponent
        const useSmallAnimal = Math.random() < 0.7; // 70% chance for small animal
        const opponentPool = useSmallAnimal ? smallAnimals : mediumAnimals;
        const opponentIndex = Math.floor(Math.random() * opponentPool.length);
        this.opponentAnimal = opponentPool[opponentIndex][0];
        
        // Reset opponent count
        this.opponentCount = 0;
        
        // Create the visual display
        this.createChallengeDisplay();
    }

    createChallengeDisplay() {
        const centerX = this.cameras.main.centerX;
        const centerY = this.cameras.main.centerY;
        
        // Clear any existing display
        if (this.challengerIcon) this.challengerIcon.destroy();
        if (this.opponentIcon) this.opponentIcon.destroy();
        if (this.vsText) this.vsText.destroy();
        if (this.challengerText) this.challengerText.destroy();
        if (this.opponentText) this.opponentText.destroy();
        if (this.countText) this.countText.destroy();
        if (this.plusButton) this.plusButton.destroy();
        if (this.minusButton) this.minusButton.destroy();
        
        // Create challenger container and background
        const challengerBg = this.add.rectangle(centerX - 300, centerY, 280, 280, 0x333333, 0.5)
            .setOrigin(0.5);
        
        // Create challenger icon
        const challengerIconKey = `icon_${this.selectedAnimal.toLowerCase().replace(/ /g, '_')}`;
        this.challengerIcon = this.add.image(centerX - 300, centerY, challengerIconKey)
            .setOrigin(0.5);
        
        // Fit challenger icon within bounds
        const maxWidth = 220;
        const maxHeight = 220;
        
        // Calculate scale to fit within bounds while maintaining aspect ratio
        const challengerScaleX = maxWidth / this.challengerIcon.width;
        const challengerScaleY = maxHeight / this.challengerIcon.height;
        const challengerScale = Math.min(challengerScaleX, challengerScaleY);
        
        this.challengerIcon.setScale(challengerScale);
        
        this.challengerText = this.add.text(centerX - 300, centerY + 180, 
            `1x ${this.selectedAnimal}`, {
            fontFamily: 'ThaleahFat',
            fontSize: '32px',
            fill: '#ffffff'
        }).setOrigin(0.5);
        
        // Create VS text
        this.vsText = this.add.text(centerX, centerY, 'VS', {
            fontFamily: 'ThaleahFat',
            fontSize: '128px',
            fill: '#ffffff',
            stroke: '#000000',
            strokeThickness: 6
        }).setOrigin(0.5);
        
        // Create opponent container and background
        const opponentBg = this.add.rectangle(centerX + 300, centerY, 280, 280, 0x333333, 0.5)
            .setOrigin(0.5);
        
        // Create opponent icon
        const opponentIconKey = `icon_${this.opponentAnimal.toLowerCase().replace(/ /g, '_')}`;
        this.opponentIcon = this.add.image(centerX + 300, centerY, opponentIconKey)
            .setOrigin(0.5);
        
        // Fit opponent icon within bounds
        const opponentScaleX = maxWidth / this.opponentIcon.width;
        const opponentScaleY = maxHeight / this.opponentIcon.height;
        const opponentScale = Math.min(opponentScaleX, opponentScaleY);
        
        this.opponentIcon.setScale(opponentScale);
        
        // Create count display
        this.countText = this.add.text(centerX + 300, centerY + 130, 
            `${this.opponentCount}x`, {
            fontFamily: 'ThaleahFat',
            fontSize: '48px',
            fill: '#ffffff',
            stroke: '#000000',
            strokeThickness: 2,
        }).setOrigin(0.5);
        
        this.opponentText = this.add.text(centerX + 300, centerY + 180, 
            this.opponentAnimal, {
            fontFamily: 'ThaleahFat',
            fontSize: '48px',
            fill: '#ffffff',
            stroke: '#000000',
            strokeThickness: 2,
        }).setOrigin(0.5);
        
        // Create plus/minus buttons
        const buttonStyle = {
            fontFamily: 'ThaleahFat',
            fontSize: '48px',
            fill: '#ffffff',
            backgroundColor: '#333333',
            padding: { x: 20, y: 10 }
        };
        
        // Determine increment based on animal size
        const animalStats = AnimalStats[this.opponentAnimal];
        this.increment = animalStats.price <= 500 ? 10 : 1;
        
        // Create plus button
        this.plusButton = this.add.text(centerX + 450, centerY, '+', buttonStyle)
            .setOrigin(0.5)
            .setInteractive({ useHandCursor: true });
            
        this.plusButton.on('pointerdown', () => {
            audioManager.playButtonClick(this);
            this.incrementCount(this.increment);
        });
        
        this.plusButton.on('pointerover', () => {
            this.plusButton.setStyle({ fill: '#ffff00' });
        });
        
        this.plusButton.on('pointerout', () => {
            this.plusButton.setStyle({ fill: '#ffffff' });
        });
        
        // Create minus button
        this.minusButton = this.add.text(centerX + 150, centerY, '-', buttonStyle)
            .setOrigin(0.5)
            .setInteractive({ useHandCursor: true });
            
        this.minusButton.on('pointerdown', () => {
            audioManager.playButtonClick(this);
            this.incrementCount(-this.increment);
        });
        
        this.minusButton.on('pointerover', () => {
            this.minusButton.setStyle({ fill: '#ffff00' });
        });
        
        this.minusButton.on('pointerout', () => {
            this.minusButton.setStyle({ fill: '#ffffff' });
        });
    }

    incrementCount(amount) {
        this.opponentCount = Math.max(0, Math.min(this.maxCount, this.opponentCount + amount));
        this.countText.setText(`${this.opponentCount}x`);
        
        // Play animal sound when increasing count
        if (amount > 0) {
            const soundKey = getRandomAnimalSound(this.opponentAnimal);
            if (soundKey) {
                audioManager.playSound(this, soundKey);
            }
        }
    }

    startBattle() {
        if (this.opponentCount <= 0) return;
        
        // Format data for game scene
        const selectedAnimals = [[this.opponentAnimal, this.opponentCount]];
        const opponents = [[this.selectedAnimal, 1]];
        
        // Start game scene with challenge mode flag
        this.scene.start('GameScene', {
            selectedAnimals,
            opponents,
            mode: 'challenge',
            playerGuess: this.opponentCount
        });
        
        // Make sure UI scene is active
        if (!this.scene.isActive('UIScene')) {
            this.scene.launch('UIScene');
        }
        
        // Notify UI scene that we've changed scenes
        this.game.events.emit('sceneChanged');
    }
} 