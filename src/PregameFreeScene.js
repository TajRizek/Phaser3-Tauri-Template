import { AnimalStats, getRandomAnimalSound } from './Animal';
import { createMusicButton, createSoundButton, createBloodButton, createQuitButton } from './components/UIButtons';
import { audioManager } from './AudioManager';

export default class PregameFreeScene extends Phaser.Scene {
    constructor() {
        super({ key: 'PregameFreeScene' });
        this.team1Animals = new Map();
        this.team2Animals = new Map();
    }

    init() {
        this.team1Animals.clear();
        this.team2Animals.clear();
    }

    preload() {
        //console.log('Starting preload of PregameFreeScene');
        
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
        
        // Initialize containers first
        this.team1CountsContainer = this.add.container(0, 0);
        this.team2CountsContainer = this.add.container(0, 0);
        
        // Create title
        this.add.text(centerX, 50, 'Free Mode', {
            fontFamily: 'ThaleahFat',
            fontSize: '48px',
            fill: '#ffffff'
        }).setOrigin(0.5);

        // Create team headers
        this.add.text(centerX / 2, 100, 'Team 1', {
            fontFamily: 'ThaleahFat',
            fontSize: '36px',
            fill: '#ffffff'
        }).setOrigin(0.5);
        
        this.add.text(centerX * 1.5, 100, 'Team 2', {
            fontFamily: 'ThaleahFat',
            fontSize: '36px',
            fill: '#ffffff'
        }).setOrigin(0.5);

        // Create animal selection grids
        this.createAnimalGrids();

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
            
            // Only start if both teams have at least one animal
            if (this.team1Animals.size > 0 && this.team2Animals.size > 0) {
                this.startBattle();
            }
        });

        // Create Reset button
        this.resetButton = this.add.rectangle(centerX, this.cameras.main.height - 100, 120, 50, 0x000000)
            .setInteractive({ useHandCursor: true });
        
        const resetText = this.add.text(centerX, this.cameras.main.height - 100, 
            'Reset', {
            fontFamily: 'ThaleahFat',
            fontSize: '32px',
            fill: '#ffffff'
        }).setOrigin(0.5);

        // Update Reset button hover effects
        this.resetButton.on('pointerover', () => {
            resetText.setStyle({ fill: '#ffff00' });
        });
        
        this.resetButton.on('pointerout', () => {
            resetText.setStyle({ fill: '#ffffff' });
        });
        
        this.resetButton.on('pointerdown', () => {
            // Play click sound
            audioManager.playButtonClick(this);
            
            this.resetSelections();
        });

        // Add UI buttons
        this.musicButton = createMusicButton(this);
        this.soundButton = createSoundButton(this);
        this.bloodButton = createBloodButton(this);
        this.quitButton = createQuitButton(this, 'MenuScene');

        // Continue menu music
        if (!this.scene.get('MenuScene').scene.isActive()) {
            audioManager.playMusic(this, 'menu_music');
        }
    }

    createAnimalGrids() {
        const animals = Object.keys(AnimalStats).sort();
        const centerX = this.cameras.main.centerX;
        const startY = 140;
        const iconSize = 90;
        const padding = 5;
        const columns = 8;
        
        // Create scrollable containers for each team
        this.team1Container = this.add.container(0, 0);
        this.team2Container = this.add.container(0, 0);
        
        // Create masks for scrolling
        const maskHeight = this.cameras.main.height - startY - 150;
        const team1Mask = this.add.graphics()
            .fillRect(0, startY, centerX, maskHeight);
        const team2Mask = this.add.graphics()
            .fillRect(centerX, startY, centerX, maskHeight);
            
        this.team1Container.setMask(new Phaser.Display.Masks.GeometryMask(this, team1Mask));
        this.team2Container.setMask(new Phaser.Display.Masks.GeometryMask(this, team2Mask));
        
        // Create animal icons for both teams
        animals.forEach((animal, index) => {
            const row = Math.floor(index / columns);
            const col = index % columns;
            
            // Team 1 icon
            const x1 = (col * (iconSize + padding)) + iconSize/2 + padding + (centerX - (columns * (iconSize + padding)))/2;
            const y1 = startY + (row * (iconSize + padding)) + iconSize/2 + padding;
            
            this.createAnimalIcon(this.team1Container, animal, x1, y1, iconSize, 'team1');
            
            // Team 2 icon
            const x2 = centerX + (col * (iconSize + padding)) + iconSize/2 + padding + (centerX - (columns * (iconSize + padding)))/2;
            const y2 = startY + (row * (iconSize + padding)) + iconSize/2 + padding;
            
            this.createAnimalIcon(this.team2Container, animal, x2, y2, iconSize, 'team2');
        });
        
        // Enable scrolling for both containers
        this.input.on('pointermove', (pointer) => {
            if (pointer.isDown) {
                if (pointer.x < centerX) {
                    // Scroll team 1
                    this.team1Container.y += pointer.velocity.y / 10;
                    
                    // Clamp scrolling
                    const maxScroll = Math.max(0, this.team1Container.height - maskHeight);
                    this.team1Container.y = Phaser.Math.Clamp(this.team1Container.y, -maxScroll, 0);
                } else {
                    // Scroll team 2
                    this.team2Container.y += pointer.velocity.y / 10;
                    
                    // Clamp scrolling
                    const maxScroll = Math.max(0, this.team2Container.height - maskHeight);
                    this.team2Container.y = Phaser.Math.Clamp(this.team2Container.y, -maxScroll, 0);
                }
            }
        });
    }
    
    createAnimalIcon(container, animal, x, y, size, team) {
        const iconKey = `icon_${animal.toLowerCase().replace(/ /g, '_')}`;
        
        // Create background
        const bg = this.add.rectangle(x, y, size, size, 0x333333, 0.5)
            .setOrigin(0.5)
            .setInteractive({ useHandCursor: true });
            
        // Create icon - check if texture exists
        let icon;
        if (this.textures.exists(iconKey)) {
            icon = this.add.image(x, y, iconKey)
                .setDisplaySize(size - 20, size - 20);
        } else {
            // Create placeholder if texture doesn't exist
            icon = this.add.rectangle(x, y, size - 20, size - 20, 0x666666);
            //console.warn(`Texture not found: ${iconKey}`);
        }
            
        // Add to container
        container.add([bg, icon]);
        
        // Create count text (initially hidden)
        const countText = this.add.text(x, y - size/2 - 10, '', {
            fontFamily: 'ThaleahFat',
            fontSize: '32px',
            fill: '#ffffff',
            backgroundColor: '#000000',
            padding: { x: 4, y: 2 }
        }).setOrigin(0.5);
        
        // IMPORTANT: Don't add count text to the scrollable containers
        // Instead, add them to the count containers which are not masked
        if (team === 'team1') {
            this.team1CountsContainer.add(countText);
        } else {
            this.team2CountsContainer.add(countText);
        }
        
        // Store reference to count text
        bg.countText = countText;
        
        // Add click handler
        bg.on('pointerdown', () => {
            this.incrementAnimalCount(animal, team, countText, x, y - size/2 - 10);
            audioManager.playButtonClick(this);
        });
        
        // Add hover effect
        bg.on('pointerover', () => {
            bg.setStrokeStyle(2, 0xffff00);
        });
        
        bg.on('pointerout', () => {
            bg.setStrokeStyle(0);
        });
    }
    
    incrementAnimalCount(animal, team, countText, x, y) {
        // Get current count
        const animalMap = team === 'team1' ? this.team1Animals : this.team2Animals;
        const currentCount = animalMap.get(animal) || 0;
        
        // Determine increment based on animal size
        const animalStats = AnimalStats[animal];
        const isSmall = animalStats.price <= 500;
        const increment = isSmall ? 10 : 1;
        
        // Update count
        const newCount = currentCount + increment;
        animalMap.set(animal, newCount);
        
        // Update count text position to account for container scrolling
        const container = team === 'team1' ? this.team1Container : this.team2Container;
        countText.setPosition(x, y + container.y);
        
        // Update count text - ensure it's visible
        countText.setText(`x${newCount}`);
        countText.setVisible(true);
        
        //console.log(`Added ${increment} ${animal} to ${team}, new count: ${newCount}`);
        
        // Play animal sound
        const soundKey = getRandomAnimalSound(animal);
        if (soundKey) {
            audioManager.playSound(this, soundKey);
        }
        
        // Update GO button state
        this.updateGoButton();
    }
    
    resetSelections() {
        // Clear all selections
        this.team1Animals.clear();
        this.team2Animals.clear();
        
        // Clear all count texts
        this.team1CountsContainer.each(text => text.setText(''));
        this.team2CountsContainer.each(text => text.setText(''));
        
        // Update GO button state
        this.updateGoButton();
    }
    
    updateGoButton() {
        const canProceed = this.team1Animals.size > 0 && this.team2Animals.size > 0;
        
        if (canProceed) {
            this.goButton.setInteractive({ useHandCursor: true });
            this.goButton.alpha = 1;
        } else {
            this.goButton.disableInteractive();
            this.goButton.alpha = 0.5;
        }
    }
    
    startBattle() {
        // Format data for game scene - ensure proper format
        const selectedAnimals = [];
        const opponents = [];
        
        // Convert Map entries to arrays in the correct format
        this.team1Animals.forEach((count, animal) => {
            selectedAnimals.push([animal, count]);
        });
        
        this.team2Animals.forEach((count, animal) => {
            opponents.push([animal, count]);
        });
        
        //console.log('Starting battle with:', { selectedAnimals, opponents });
        
        // Only proceed if both teams have animals
        if (selectedAnimals.length === 0 || opponents.length === 0) {
            //console.error('Cannot start battle: one or both teams have no animals');
            return;
        }
        
        // Start game scene with free mode flag
        this.scene.start('GameScene', {
            selectedAnimals,
            opponents,
            mode: 'free'
        });
        
        // Make sure UI scene is active
        if (!this.scene.isActive('UIScene')) {
            this.scene.launch('UIScene');
        }
        
        // Notify UI scene that we've changed scenes
        this.game.events.emit('sceneChanged');
    }
} 