import { AnimalStats, getRandomAnimalSound } from './Animal';
import { createMusicButton, createSoundButton, createBloodButton, createQuitButton, createRefreshButton } from './components/UIButtons';
import { audioManager } from './AudioManager';

export default class PregameScene extends Phaser.Scene {
    constructor() {
        super({ key: 'PregameScene' });
        this.selectedAnimals = new Map();
        this.remainingBudget = 0;
        this.initialBudget = 0; // Store initial budget for reset
        this.opponents = [];
    }

    // Add init method to reset state when scene starts
    init() {
        this.selectedAnimals.clear();
        this.remainingBudget = 0;
        if (this.selectionGrid) {
            this.selectionGrid.forEach(item => item.destroy());
            this.selectionGrid = [];
        }
    }

    preload() {
        // We don't need to load animal icons here since they're already loaded in Preload.js
        // The init method will handle resetting state when the scene starts
    }

    create() {
        // Add at the start of create method
        //console.log('Available textures:', this.textures.list);
        
        // Notify UI scene that we've changed scenes
        this.game.events.emit('sceneChanged');
        
        // Clear any existing state
        this.selectedAnimals.clear();
        
        const centerX = this.cameras.main.centerX;
        
        // Select random opponent(s)
        this.setupOpponents();
        
        // Replace the opponent text with new visual display
        const opponentText = this.createOpponentText();
        this.add.text(centerX, 30, 'Enemy Team:', {
            fontFamily: 'ThaleahFat',
            fontSize: '48px',
            fill: '#ffffff'
        }).setOrigin(0.5);

        // Create opponent display for each opponent
        this.opponents.forEach((opponent, index) => {
            const iconSize = 125;  // Increased from 100
            
            // Try different key formats for the opponent animal icon
            const animalName = opponent.animal;
            // 1. Convert spaces to underscores and lowercase
            const iconKey1 = `icon_${animalName.toLowerCase().replace(/ /g, '_')}`;
            // 2. Just lowercase (keeping spaces)
            const iconKey2 = `icon_${animalName.toLowerCase()}`;
            // 3. Original name format
            const iconKey3 = `icon_${animalName}`;
            
            // Move name text higher
            const nameText = this.add.text(centerX, 80 + (index * 180),  // Adjusted spacing
                `${opponent.animal} x${opponent.count}`, {
                fontFamily: 'ThaleahFat',
                fontSize: '32px',
                fill: '#ffffff'
            }).setOrigin(0.5);

            // Try all possible icon keys
            let iconFound = false;
            [iconKey1, iconKey2, iconKey3].forEach(iconKey => {
                if (!iconFound && this.textures.exists(iconKey)) {
                    this.add.image(centerX, 160 + (index * 180), iconKey)  // Adjusted spacing
                        .setOrigin(0.5)
                        .setDisplaySize(iconSize, iconSize);
                    iconFound = true;
                }
            });
            
            // If no icon found, create placeholder
            if (!iconFound) {
                const placeholder = this.add.rectangle(centerX, 160 + (index * 180),
                    iconSize, iconSize, 0x666666)
                    .setOrigin(0.5);
                this.add.text(centerX, 160 + (index * 180), "?", {
                    fontSize: '32px',
                    fill: '#ffffff'
                }).setOrigin(0.5);
                
                // Debug: Log the missing icon
                console.log(`Missing opponent icon for animal: ${animalName}. Tried keys:`, [iconKey1, iconKey2, iconKey3]);
            }
        });

        // Create scrollable list of animals
        this.createAnimalsList();

        // Create budget display with larger text
        this.budgetText = this.add.text(centerX, this.cameras.main.height - 50, 
            `Budget: ${this.remainingBudget}`, {
            fontFamily: 'ThaleahFat',
            fontSize: '36px',
            fill: '#ffffff'
        }).setOrigin(0.5);

        // Create Reset button with invisible background (remove stroke style)
        this.resetButton = this.add.rectangle(centerX, this.cameras.main.height - 100, 120, 50, 0x000000)
            .setInteractive({ useHandCursor: true });
        
        // Larger reset text
        const resetText = this.add.text(centerX, this.cameras.main.height - 100, 
            'Reset', {
            fontFamily: 'ThaleahFat',
            fontSize: '32px',
            fill: '#ffffff'
        }).setOrigin(0.5);

        // Update Reset button hover effects (remove stroke style changes)
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

        // Create GO! button with invisible background (remove stroke style)
        this.goButton = this.add.rectangle(this.cameras.main.width - 100, 
            this.cameras.main.height - 100, 120, 80, 0x000000)
            .setInteractive({ useHandCursor: true });
        
        // Larger GO! text
        const goText = this.add.text(this.cameras.main.width - 100, 
            this.cameras.main.height - 100, 'GO!', {
            fontFamily: 'ThaleahFat',
            fontSize: '64px',
            fill: '#ffffff'
        }).setOrigin(0.5);

        // Update GO button hover effects (remove stroke style changes)
        this.goButton.on('pointerover', () => {
            goText.setStyle({ fill: '#ffff00' });
        });
        
        this.goButton.on('pointerout', () => {
            goText.setStyle({ fill: '#ffffff' });
        });
        this.goButton.on('pointerdown', () => {
            // Play click sound
            audioManager.playButtonClick(this);
            
            this.startBattle();
        });

        // Store text references for updating later
        this.resetText = resetText;
        this.goText = goText;

        // Add mute button
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

    setupOpponents() {
        // Categorize animals by price
        const animals = Object.entries(AnimalStats);
        const smallAnimals = animals.filter(([,stats]) => stats.price <= 200);
        const mediumAnimals = animals.filter(([,stats]) => stats.price > 200 && stats.price <= 1000);
        const largeAnimals = animals.filter(([,stats]) => stats.price > 1000);
        
        // Randomly choose opponent type with weighted distribution
        const roll = Math.random();
        this.opponents = [];
        
        if (roll < 0.33) { // Large opponents (33% chance)
            const count = Math.random() < 0.7 ? 1 : 2; // 70% chance for 1, 30% chance for 2
            const animal = largeAnimals[Math.floor(Math.random() * largeAnimals.length)][0];
            this.opponents.push({ animal, count });
            const totalWorth = AnimalStats[animal].price * count;
            // Round to nearest thousand if over 1000, otherwise round down to nearest hundred
            this.remainingBudget = totalWorth * 0.8;
            if (this.remainingBudget >= 1000) {
                this.remainingBudget = Math.round(this.remainingBudget / 1000) * 1000;
            } else {
                this.remainingBudget = Math.floor(this.remainingBudget / 100) * 100;
            }
            this.opponentType = 'large';
        } 
        else if (roll < 0.66) { // Medium opponents (33% chance)
            const count = Math.floor(Math.random() * 3) + 4; // 4-6 medium animals
            const animal = mediumAnimals[Math.floor(Math.random() * mediumAnimals.length)][0];
            this.opponents.push({ animal, count });
            const totalWorth = AnimalStats[animal].price * count;
            // Round to nearest thousand if over 1000, otherwise round down to nearest hundred
            this.remainingBudget = totalWorth * 0.85;
            if (this.remainingBudget >= 1000) {
                this.remainingBudget = Math.round(this.remainingBudget / 1000) * 1000;
            } else {
                this.remainingBudget = Math.floor(this.remainingBudget / 100) * 100;
            }
            this.opponentType = 'medium';
        }
        else { // Small opponents (34% chance)
            const count = Math.floor(Math.random() * 11) + 10; // 10-20 small animals
            const animal = smallAnimals[Math.floor(Math.random() * smallAnimals.length)][0];
            this.opponents.push({ animal, count });
            const totalWorth = AnimalStats[animal].price * count;
            // Round to nearest thousand if over 1000, otherwise round down to nearest hundred
            this.remainingBudget = totalWorth * 0.9;
            if (this.remainingBudget >= 1000) {
                this.remainingBudget = Math.round(this.remainingBudget / 1000) * 1000;
            } else {
                this.remainingBudget = Math.floor(this.remainingBudget / 100) * 100;
            }
            this.opponentType = 'small';
        }

        // Store initial budget for reset functionality
        this.initialBudget = this.remainingBudget;
    }

    createOpponentText() {
        // Return empty string since we'll create visual elements instead
        return '';
    }

    createAnimalsList() {
        // Clear any existing selection UI
        if (this.selectionGrid) {
            this.selectionGrid.forEach(item => item.destroy());
        }
        this.selectionGrid = [];

        // Get random animals based on budget
        const animals = this.getRandomAnimalSelection();
        
        const gridSize = 3;
        const squareSize = 150;
        const padding = 80;
        // Center the grid by calculating startX based on screen width
        const startX = (this.cameras.main.width - ((squareSize + padding) * gridSize - padding)) / 2;
        const startY = this.cameras.main.centerY - (squareSize + padding) * 1.5 + 100;

        // Move "Choose Your Team:" text higher up
        const selectionTitle = this.add.text(this.cameras.main.centerX, startY - 60, 'Choose Your Team:', {  // Changed from startY - 40
            fontFamily: 'ThaleahFat',
            fontSize: '48px',
            fill: '#ffffff'
        }).setOrigin(0.5);
        this.selectionGrid.push(selectionTitle);

        animals.forEach((animal, index) => {
            const row = Math.floor(index / gridSize);
            const col = index % gridSize;
            const x = startX + col * (squareSize + padding);
            const y = startY + row * (squareSize + padding);

            // Larger animal name text
            const nameText = this.add.text(x + squareSize/2, y - 20,
                `${animal.name}`, {
                fontFamily: 'ThaleahFat',
                fontSize: '24px',
                fill: '#ffffff',
                align: 'center'
            }).setOrigin(0.5);

            // Create square background and make it interactive
            const square = this.add.rectangle(x, y, squareSize, squareSize)
                .setStrokeStyle(2, 0xffffff)
                .setOrigin(0, 0)
                .setInteractive({ useHandCursor: true });

            // Create a mask for the icon
            const mask = this.add.rectangle(x, y, squareSize, squareSize)
                .setOrigin(0, 0);
            mask.setVisible(false); // Hide the mask rectangle

            // Add animal icon with better error handling
            // Convert animal name to the format used in Preload.js
            const formattedName = animal.name.replace(/_/g, ' ');
            
            // Try different key formats to match what's in Preload.js
            // 1. Convert spaces to underscores and lowercase
            const iconKey1 = `icon_${animal.name.toLowerCase().replace(/ /g, '_')}`;
            // 2. Just lowercase (keeping spaces)
            const iconKey2 = `icon_${animal.name.toLowerCase()}`;
            // 3. Original name format with spaces
            const iconKey3 = `icon_${animal.name}`;
            
            let icon;
            let iconFound = false;
            
            // Try all possible icon key formats
            [iconKey1, iconKey2, iconKey3].forEach(key => {
                if (!iconFound && this.textures.exists(key)) {
                    icon = this.add.image(x + squareSize/2, y + squareSize/2, key)
                        .setOrigin(0.5)
                        .setDisplaySize(squareSize - 20, squareSize - 20);
                    iconFound = true;
                }
            });
            
            // If no icon found, create placeholder
            if (!iconFound) {
                // Create a colored rectangle as placeholder
                icon = this.add.rectangle(x + squareSize/2, y + squareSize/2, squareSize - 20, squareSize - 20, 0x666666)
                    .setOrigin(0.5);
                
                // Add a "?" in the center of the placeholder
                const questionMark = this.add.text(x + squareSize/2, y + squareSize/2, "?", {
                    fontSize: '48px',
                    fill: '#ffffff'
                }).setOrigin(0.5);
                this.selectionGrid.push(questionMark);
                
                // Debug: Log the missing icon
                console.log(`Missing icon for animal: ${animal.name}. Tried keys:`, [iconKey1, iconKey2, iconKey3]);
            }

            // Larger price text
            const priceText = this.add.text(x + squareSize/2, y + squareSize + 15,
                `${animal.groupSize}x (${animal.price * animal.groupSize})`, {
                fontFamily: 'ThaleahFat',
                fontSize: '20px',
                fill: '#ffff00',
                align: 'center'
            }).setOrigin(0.5);

            // Larger quantity text
            const quantityText = this.add.text(x + 10, y + 10, '', {
                fontFamily: 'ThaleahFat',
                fontSize: '24px',
                fill: '#00ff00',
                padding: { x: 5, y: 2 }
            }).setOrigin(0, 0);
            
            // Only add background when there's text
            quantityText.setBackgroundColor(null);  // Start with no background

            // Update the selectAnimalGroup handler
            square.on('pointerdown', () => {
                // Play click sound
                audioManager.playButtonClick(this);
                
                this.selectAnimalGroup(animal, animal.price * animal.groupSize, quantityText);
            });
            
            // Update hover effect color for grid squares
            square.on('pointerover', () => {
                square.setStrokeStyle(2, 0xffff00);  // Already yellow, but now consistent with other elements
                nameText.setStyle({ fill: '#ffff00' });  // Also make name text yellow on hover
                priceText.setStyle({ fill: '#ffff00' });  // Also make price text yellow on hover
            });
            
            square.on('pointerout', () => {
                square.setStrokeStyle(2, 0xffffff);
                nameText.setStyle({ fill: '#ffffff' });  // Reset name text color
                priceText.setStyle({ fill: '#ffff00' });  // Reset price text to original yellow
            });

            this.selectionGrid.push(square, icon, mask, nameText, priceText, quantityText);
        });
    }

    getRandomAnimalSelection() {
        const animals = Object.entries(AnimalStats);
        const maxSlots = 9;
        
        // Filter out opponent's animal type
        const availableAnimals = animals.filter(([name]) => 
            !this.opponents.some(opp => opp.animal === name));

        // Get all animals that fit in budget as individual units
        const individualAnimals = availableAnimals
            .filter(([,stats]) => stats.price <= this.remainingBudget)
            .map(([name, stats]) => ({
                name,
                price: stats.price,
                groupSize: 1
            }));

        // Get medium animals in small groups
        const mediumGroups = availableAnimals
            .filter(([,stats]) => stats.price > 200 && stats.price <= 1000)
            .map(([name, stats]) => {
                // Try to make groups of 2-3 if affordable
                const maxGroupSize = Math.floor(this.remainingBudget / stats.price);
                const groupSize = Math.min(3, Math.max(2, maxGroupSize));
                return {
                    name,
                    price: stats.price,
                    groupSize: groupSize
                };
            })
            .filter(animal => (animal.price * animal.groupSize) <= this.remainingBudget);

        // Get cheap animals in larger groups
        const cheapGroups = availableAnimals
            .filter(([,stats]) => stats.price <= 200)
            .map(([name, stats]) => {
                // Try to make groups of 5-20
                const maxGroupSize = Math.floor(this.remainingBudget / stats.price);
                const groupSize = Math.min(20, Math.max(5, maxGroupSize));
                return {
                    name,
                    price: stats.price,
                    groupSize: groupSize
                };
            })
            .filter(animal => (animal.price * animal.groupSize) <= this.remainingBudget);

        // Combine all options and shuffle them
        const allOptions = [
            ...individualAnimals,
            ...mediumGroups,
            ...cheapGroups
        ];

        // Shuffle the array
        for (let i = allOptions.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [allOptions[i], allOptions[j]] = [allOptions[j], allOptions[i]];
        }

        // Select 9 unique animals, prioritizing variety
        const selection = [];
        const usedNames = new Set();

        // First, ensure we have some individual animals if available
        const individuals = allOptions.filter(a => a.groupSize === 1);
        while (selection.length < 3 && individuals.length > 0) {
            const animal = individuals.pop();
            if (!usedNames.has(animal.name)) {
                selection.push(animal);
                usedNames.add(animal.name);
            }
        }

        // Then add groups to fill remaining slots
        const groups = allOptions.filter(a => a.groupSize > 1);
        while (selection.length < 6 && groups.length > 0) {
            const animal = groups.pop();
            if (!usedNames.has(animal.name)) {
                selection.push(animal);
                usedNames.add(animal.name);
            }
        }

        // Fill remaining slots with any available options
        while (selection.length < maxSlots && allOptions.length > 0) {
            const animal = allOptions.pop();
            if (!usedNames.has(animal.name)) {
                selection.push(animal);
                usedNames.add(animal.name);
            }
        }

        // If we still don't have 9 options, add duplicates with different group sizes
        if (selection.length < maxSlots) {
            const extraOptions = [...selection]
                .filter(animal => animal.groupSize > 2)
                .map(animal => ({
                    ...animal,
                    groupSize: Math.max(1, Math.floor(animal.groupSize / 2))
                }));
            
            while (selection.length < maxSlots && extraOptions.length > 0) {
                selection.push(extraOptions.pop());
            }
        }

        return selection;
    }

    selectAnimalGroup(animal, totalPrice, quantityText) {
        if (totalPrice <= this.remainingBudget) {
            // Play animal sound
            const soundKey = getRandomAnimalSound(animal.name);
            if (soundKey) {
                audioManager.playSound(this, soundKey);
            }

            const currentCount = this.selectedAnimals.get(animal.name) || 0;
            const newCount = currentCount + animal.groupSize;
            this.selectedAnimals.set(animal.name, newCount);
            this.remainingBudget -= totalPrice;
            
            quantityText.setText(`x${newCount}`);
            quantityText.setBackgroundColor('#000000'); // Add background only when there's a quantity
            this.budgetText.setText(`Budget: ${this.remainingBudget}`);
            this.updateGoButton();
            this.updateResetButton();
        }
    }

    resetSelections() {
        if (this.selectedAnimals.size === 0) return;

        // Play click sound
        audioManager.playButtonClick(this);

        this.selectedAnimals.clear();
        this.remainingBudget = this.initialBudget;
        this.budgetText.setText(`Budget: ${this.remainingBudget}`);
        
        // Reset all quantity texts and remove their backgrounds
        this.selectionGrid.forEach(item => {
            if (item.type === 'Text' && item.text.startsWith('x')) {
                item.setText('');
                item.setBackgroundColor(null);
            }
        });
            
        this.updateResetButton();
        this.updateGoButton();
    }

    updateResetButton() {
        if (!this.resetButton || !this.resetText) return;
        
        const canReset = this.selectedAnimals.size > 0;
        this.resetText.setAlpha(canReset ? 1 : 0.5);
        
        if (canReset) {
            this.resetButton.setInteractive({ useHandCursor: true });
        } else {
            this.resetButton.disableInteractive();
        }
    }

    updateGoButton() {
        if (!this.goButton || !this.goText) return;
        
        const canProceed = this.selectedAnimals.size > 0;
        this.goText.setAlpha(canProceed ? 1 : 0.5);
        
        if (canProceed) {
            this.goButton.setInteractive({ useHandCursor: true });
        } else {
            this.goButton.disableInteractive();
        }
    }

    startBattle() {
        // Remove the budget check, only require at least one animal selected
        if (this.selectedAnimals.size > 0) {
            // Play click sound
            audioManager.playButtonClick(this);
            
            // Format opponents data to match selectedAnimals format
            const formattedOpponents = this.opponents.map(({ animal, count }) => [animal, count]);
            
            // Pass selected animals and opponents to game scene
            this.scene.start('GameScene', {
                selectedAnimals: Array.from(this.selectedAnimals.entries()),
                opponents: formattedOpponents
            });
            this.scene.start('UIScene');
            
            // Notify UI scene that we've changed scenes
            this.game.events.emit('sceneChanged');
            
            // Clear selections after starting battle
            this.selectedAnimals.clear();
        }
    }
} 