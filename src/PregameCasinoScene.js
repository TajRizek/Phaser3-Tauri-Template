import { AnimalStats, getRandomAnimalSound } from './Animal';
import { createMusicButton, createSoundButton, createBloodButton, createQuitButton, createRefreshButton } from './components/UIButtons';
import { audioManager } from './AudioManager';

export default class PregameCasinoScene extends Phaser.Scene {
    constructor() {
        super({ key: 'PregameCasinoScene' });
        this.team1 = null;
        this.team2 = null;
        this.selectedTeam = null;
    }

    init() {
        this.team1 = null;
        this.team2 = null;
        this.selectedTeam = null;
    }

    preload() {
        //console.log('Starting preload of PregameCasinoScene');
    }

    create() {
        // Notify UI scene that we've changed scenes
        this.game.events.emit('sceneChanged');
        
        const centerX = this.cameras.main.centerX;
        const centerY = this.cameras.main.centerY;
        
        // Create title
        this.add.text(centerX, 50, 'Casino Mode', {
            fontFamily: 'ThaleahFat',
            fontSize: '48px',
            fill: '#ffffff'
        }).setOrigin(0.5);

        // Create question with larger text and lower position
        this.questionText = this.add.text(centerX, 150, 'Who Wins?', {
            fontFamily: 'ThaleahFat',
            fontSize: '64px',
            fill: '#ffffff'
        }).setOrigin(0.5);

        // Setup the casino scenario
        this.setupScenario();

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
            
            // Only start if we have selected a team
            if (this.selectedTeam) {
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

    setupScenario() {
        // Get all animals
        const animals = Object.entries(AnimalStats);
        
        // Categorize animals by size/strength
        const largeAnimals = animals.filter(([,stats]) => stats.price > 2000);
        const mediumAnimals = animals.filter(([,stats]) => stats.price > 500 && stats.price <= 2000);
        const smallAnimals = animals.filter(([,stats]) => stats.price <= 500);
        
        // Generate a random scenario
        const scenarioType = Math.random();
        
        if (scenarioType < 0.33) {
            // Large vs Many Small
            const largeAnimal = largeAnimals[Math.floor(Math.random() * largeAnimals.length)][0];
            const smallAnimal = smallAnimals[Math.floor(Math.random() * smallAnimals.length)][0];
            const largeCount = Math.floor(Math.random() * 3) + 1; // 1-3
            const smallCount = Math.floor(Math.random() * 50) + 20; // 20-70
            
            this.team1 = [largeAnimal, largeCount];
            this.team2 = [smallAnimal, smallCount];
        } 
        else if (scenarioType < 0.66) {
            // Medium vs Medium
            const mediumAnimal1 = mediumAnimals[Math.floor(Math.random() * mediumAnimals.length)][0];
            
            // Make sure we get a different animal for team 2
            let mediumAnimal2;
            do {
                mediumAnimal2 = mediumAnimals[Math.floor(Math.random() * mediumAnimals.length)][0];
            } while (mediumAnimal2 === mediumAnimal1);
            
            const count1 = Math.floor(Math.random() * 5) + 3; // 3-7
            const count2 = Math.floor(Math.random() * 5) + 3; // 3-7
            
            this.team1 = [mediumAnimal1, count1];
            this.team2 = [mediumAnimal2, count2];
        }
        else {
            // Large vs Medium
            const largeAnimal = largeAnimals[Math.floor(Math.random() * largeAnimals.length)][0];
            const mediumAnimal = mediumAnimals[Math.floor(Math.random() * mediumAnimals.length)][0];
            const largeCount = Math.floor(Math.random() * 2) + 1; // 1-2
            const mediumCount = Math.floor(Math.random() * 10) + 5; // 5-15
            
            this.team1 = [largeAnimal, largeCount];
            this.team2 = [mediumAnimal, mediumCount];
        }
        
        // Reset selected team
        this.selectedTeam = null;
        
        // Create the visual display
        this.createScenarioDisplay();
    }

    createScenarioDisplay() {
        const centerX = this.cameras.main.centerX;
        const centerY = this.cameras.main.centerY;
        
        // Clear any existing display
        if (this.team1Container) this.team1Container.destroy();
        if (this.team2Container) this.team2Container.destroy();
        if (this.vsText) this.vsText.destroy();
        if (this.team1SelectionBorder) this.team1SelectionBorder.destroy();
        if (this.team2SelectionBorder) this.team2SelectionBorder.destroy();
        
        // Create containers for teams
        this.team1Container = this.add.container(centerX - 300, centerY);
        this.team2Container = this.add.container(centerX + 300, centerY);
        
        // Create VS text
        this.vsText = this.add.text(centerX, centerY, 'VS', {
            fontFamily: 'ThaleahFat',
            fontSize: '128px',
            fill: '#ffffff',
            stroke: '#000000',
            strokeThickness: 6
        }).setOrigin(0.5);
        
        // Create team 1 display
        this.createTeamDisplay(this.team1Container, this.team1, 'team1');
        
        // Create team 2 display
        this.createTeamDisplay(this.team2Container, this.team2, 'team2');
        
        // Create selection borders that exactly match the card backgrounds
        // Position them precisely at the container positions
        this.team1SelectionBorder = this.add.rectangle(centerX - 300, centerY, 280, 330, 0x000000)
            .setStrokeStyle(6, 0xffff00)
            .setFillStyle(0, 0)
            .setVisible(false);
            
        this.team2SelectionBorder = this.add.rectangle(centerX + 300, centerY, 280, 330, 0x000000)
            .setStrokeStyle(6, 0xffff00)
            .setFillStyle(0, 0)
            .setVisible(false);
    }

    createTeamDisplay(container, teamData, teamId) {
        const [animalName, count] = teamData;
        
        // Create a group to hold all elements
        const cardGroup = this.add.group();
        
        // Create background for selection with proper size to accommodate scaled icon
        const bg = this.add.rectangle(0, 0, 280, 330, 0x333333, 0.5)
            .setOrigin(0.5)
            .setInteractive({ useHandCursor: true });
            
        // Add selection behavior
        bg.on('pointerdown', () => {
            this.selectTeam(teamId);
            audioManager.playButtonClick(this);
        });
        
        // Create animal icon
        const iconKey = `icon_${animalName.toLowerCase().replace(/ /g, '_')}`;
        const icon = this.add.image(0, -20, iconKey)
            .setOrigin(0.5);
        
        // Fit icon within the card background
        const maxWidth = 200;
        const maxHeight = 200;
        
        // Calculate scale to fit within bounds while maintaining aspect ratio
        const scaleX = maxWidth / icon.width;
        const scaleY = maxHeight / icon.height;
        const scale = Math.min(scaleX, scaleY);
        
        icon.setScale(scale);
        
        // Create count text
        const countText = this.add.text(0, 100, `${count}x ${animalName}`, {
            fontFamily: 'ThaleahFat',
            fontSize: '48px',
            fill: '#ffffff',
            align: 'center',
            stroke: '#000000',
            strokeThickness: 2,
            wordWrap: { width: 240 }
        }).setOrigin(0.5);
        
        // Create a selection indicator at the bottom of the card
        const selectionIndicator = this.add.rectangle(0, 165, 280, 10, 0xffff00)
            .setOrigin(0.5, 0)
            .setVisible(false);
        
        // Add all elements to container
        container.add([bg, icon, countText, selectionIndicator]);
        
        // Store the selection indicator for highlighting
        container.selectionIndicator = selectionIndicator;
    }

    selectTeam(teamId) {
        // Clear previous selection
        if (this.selectedTeam) {
            const prevContainer = this.selectedTeam === 'team1' ? this.team1Container : this.team2Container;
            prevContainer.selectionIndicator.setVisible(false);
        }
        
        // Set new selection
        this.selectedTeam = teamId;
        
        // Highlight selected team
        const container = teamId === 'team1' ? this.team1Container : this.team2Container;
        container.selectionIndicator.setVisible(true);
        
        // Play animal sound
        const animalName = teamId === 'team1' ? this.team1[0] : this.team2[0];
        const soundKey = getRandomAnimalSound(animalName);
        if (soundKey) {
            audioManager.playSound(this, soundKey);
        }
    }

    startBattle() {
        if (!this.selectedTeam) return;
        
        // Determine which team is the player's choice and which is the opponent
        const selectedAnimals = this.selectedTeam === 'team1' ? [this.team1] : [this.team2];
        const opponents = this.selectedTeam === 'team1' ? [this.team2] : [this.team1];
        
        // Start game scene with casino mode flag
        this.scene.start('GameScene', {
            selectedAnimals,
            opponents,
            mode: 'casino',
            playerChoice: this.selectedTeam
        });
        
        // Make sure UI scene is active
        if (!this.scene.isActive('UIScene')) {
            this.scene.launch('UIScene');
        }
        
        // Notify UI scene that we've changed scenes
        this.game.events.emit('sceneChanged');
    }
} 