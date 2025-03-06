import Phaser from "phaser";
import MenuScene from './MenuScene.js';
import UIScene from './UI.js';
import { preload } from "./Preload.js";
import { AnimalStats } from './Animal';
import PregameScene from './PregameScene.js';
import BootScene from './BootScene.js';
import { BattleAnimal } from './BattleAnimal';
import { BattleManager } from './BattleManager';
import { audioManager } from './AudioManager';
import { uiManager } from './UIManager';
import PregameChallengeScene from './PregameChallengeScene.js';
import PregameCasinoScene from './PregameCasinoScene.js';
import PregameFreeScene from './PregameFreeScene.js';
import HelpScene from './HelpScene.js';
import CreditsScene from './CreditsScene.js';

export class GameScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameScene' });
        this.battleManager = null; // Initialize as null
    }

    preload() {
        // Add debug logging for asset loading
        //console.log('GameScene preload started');

        // Load all background options with explicit dimensions
        this.load.image('game-background-2', '/assets/background/bg2.png', {
            frameWidth: 1920,
            frameHeight: 1080
        });
        this.load.image('game-background-3', '/assets/background/bg3.png', {
            frameWidth: 1920,
            frameHeight: 1080
        });
        this.load.image('game-background-4', '/assets/background/bg4.png', {
            frameWidth: 1920,
            frameHeight: 1080
        });
        this.load.image('game-background-5', '/assets/background/bg5.png', {
            frameWidth: 1920,
            frameHeight: 1080
        });
        this.load.image('game-background-6', '/assets/background/bg6.png', {
            frameWidth: 1920,
            frameHeight: 1080
        });
        this.load.image('game-background-7', '/assets/background/bg7.png', {
            frameWidth: 1920,
            frameHeight: 1080
        });

        // Note: jungle_animations spritesheet is already loaded in Preload.js
        // We don't need to load it again here

        // Load animal icons
        const nameMap = {
            'alpacha': 'Alpacha',
            'antelope': 'Antelope',
            'arabian_horse': 'Arabian Horse',
            'bison': 'Bison',
            'boar': 'Boar',
            'black_bear': 'Black Bear',
            'brown_horse': 'Brown Horse',
            'bull': 'Bull',
            'camel': 'Camel',
            'cat_black': 'Cat Black',
            'cat_large': 'Cat Large',
            'cat_orange': 'Cat Orange',
            'cat_white': 'Cat White',
            'chicken': 'Chicken',
            'chimp': 'Chimp',
            'cow': 'Cow',
            'cow_brown': 'Cow Brown',
            'crocodile': 'Crocodile',
            'deer': 'Deer',
            'donkey': 'Donkey',
            'elephant': 'Elephant',
            'elephant_female': 'Elephant Female',
            'elite_wolf': 'Elite Wolf',
            'giraffe': 'Giraffe',
            'golden_retriever': 'Golden Retriever',
            'grizzly': 'Grizzly',
            'hippo': 'Hippo',
            'husky': 'Husky',
            'hyena': 'Hyena',
            'panther': 'Panther',
            'lion': 'Lion',
            'lioness': 'Lioness',
            'llama': 'Llama',
            'mammoth': 'Mammoth',
            'monkey': 'Monkey',
            'oryx': 'Oryx',
            'ostrich': 'Ostrich',
            'penguin': 'Penguin',
            'pig': 'Pig',
            'polar_bear': 'Polar Bear',
            'ram': 'Ram',
            'rhino': 'Rhino',
            'rhino_female': 'Rhino Female',
            'sheep': 'Sheep',
            'shepherd_dog': 'Shepherd Dog',
            'stag': 'Stag',
            'tiger': 'Tiger',
            'tortoise': 'Tortoise',
            'turtle': 'Turtle',
            'water_buffalo': 'Water Buffalo',
            'white_tiger': 'White Tiger',
            'wolf': 'Wolf',
            'work_horse': 'Work Horse',
            'yak': 'Yak',
            'zebra': 'Zebra'
        };

        // Load all animal icons
        Object.entries(nameMap).forEach(([key, displayName]) => {
            const iconKey = `icon_${key}`;
            //console.log(`Loading icon: ${iconKey} from path: assets/icons/${displayName}.png`);
            this.load.image(iconKey, `assets/icons/${displayName}.png`);
        });

        // Add error handler for loading
        this.load.on('loaderror', (fileObj) => {
            //console.error('Load error:', fileObj.src);
        });

        // Add complete handler
        this.load.on('complete', () => {
            //console.log('Available textures in GameScene:', Object.keys(this.textures.list));
        });
    }

    create() {
        //console.log('Game Scene launched');
        
        // Make sure this scene is below UI
        this.scene.moveBelow('UIScene');
        
        // Notify UI scene that we've changed scenes
        this.game.events.emit('sceneChanged');
        
        // Add a short delay before emitting a second signal to ensure UI has time to initialize
        this.time.delayedCall(100, () => {
            this.game.events.emit('sceneChanged');
        });
        
        // Set the camera and world bounds first
        this.cameras.main.setBounds(0, 0, 1920, 1080);
        
        // Show loading screen before starting to load assets
        this.showLoadingScreen().then(() => {
            // Once loading is complete and loading screen is hidden, start the game
            this.startGame();
        });
        
        // Start battle music at low volume only if music is not muted
        if (!audioManager.isMusicMuted) {
            audioManager.playMusic(this, 'battle_music', 0.1);
        } else {
            // Still create the music but with volume 0
            audioManager.playMusic(this, 'battle_music', 0);
        }

        // Reset game speed to normal
        this.time.timeScale = 1;
        this.physics.world.timeScale = 1;
        uiManager.resetGameSpeed();
    }

    async showLoadingScreen() {
        return new Promise(resolve => {
            // Create loading overlay
            const overlay = this.add.rectangle(
                this.cameras.main.centerX,
                this.cameras.main.centerY,
                this.cameras.main.width,
                this.cameras.main.height,
                0x000000
            ).setDepth(1000).setAlpha(0.8);
            
            // Create loading text
            const loadingText = this.add.text(
                this.cameras.main.centerX,
                this.cameras.main.centerY - 50,
                'LOADING BATTLE...',
                {
                    fontFamily: 'ThaleahFat',
                    fontSize: '64px',
                    fill: '#ffffff'
                }
            ).setOrigin(0.5).setDepth(1001);
            
            // Create loading indicator - spinning paw or loading bar
            const loadingSpinner = this.add.sprite(
                this.cameras.main.centerX,
                this.cameras.main.centerY + 50,
                'loading_spinner'
            ).setDepth(1001);
            
            // If loading_spinner texture doesn't exist, create a simple loading bar
            if (!this.textures.exists('loading_spinner')) {
                loadingSpinner.destroy();
                
                // Create a simple loading bar
                const barWidth = 400;
                const barHeight = 30;
                const barBg = this.add.rectangle(
                    this.cameras.main.centerX,
                    this.cameras.main.centerY + 50,
                    barWidth,
                    barHeight,
                    0x333333
                ).setDepth(1001);
                
                const loadingBar = this.add.rectangle(
                    this.cameras.main.centerX - barWidth/2,
                    this.cameras.main.centerY + 50,
                    0,
                    barHeight,
                    0x00ff00
                ).setOrigin(0, 0.5).setDepth(1002);
                
                // Create background and initialize flowers and stones
                this.createBackground();
                
                // Start adding flowers and stones with random counts
                this.addRandomStones(Math.floor(Math.random() * 101)); // 0-100 stones
                this.addRandomFlowers(Math.floor(Math.random() * 101)); // 0-100 flowers
                
                // Animate loading bar
                this.tweens.add({
                    targets: loadingBar,
                    width: barWidth,
                    duration: 2000,
                    ease: 'Linear',
                    onComplete: () => {
                        // Fade out the loading screen
                        this.tweens.add({
                            targets: [overlay, loadingText, barBg, loadingBar],
                            alpha: 0,
                            duration: 500,
                            onComplete: () => {
                                // Clean up loading screen elements
                                overlay.destroy();
                                loadingText.destroy();
                                barBg.destroy();
                                loadingBar.destroy();
                                resolve();
                            }
                        });
                    }
                });
            } else {
                // Animate spinner
                this.tweens.add({
                    targets: loadingSpinner,
                    rotation: Math.PI * 2,
                    duration: 1000,
                    repeat: 1,
                    ease: 'Linear'
                });
                
                // Create background and initialize flowers and stones
                this.createBackground();
                
                // Start adding flowers and stones
                this.addRandomStones(50);
                this.addRandomFlowers(100);
                
                // Wait a bit to ensure everything is loaded
                this.time.delayedCall(2000, () => {
                    // Fade out the loading screen
                    this.tweens.add({
                        targets: [overlay, loadingText, loadingSpinner],
                        alpha: 0,
                        duration: 500,
                        onComplete: () => {
                            // Clean up loading screen elements
                            overlay.destroy();
                            loadingText.destroy();
                            loadingSpinner.destroy();
                            resolve();
                        }
                    });
                });
            }
        });
    }

    // Extract background creation to a separate method
    createBackground() {
        // Randomly select one of the backgrounds
        const bgNumber = Phaser.Math.Between(2, 7);
        const bgKey = `game-background-${bgNumber}`;
        
        console.log(`Selected background: ${bgKey}`);
        
        // Create background immediately
        const background = this.add.sprite(
            this.cameras.main.centerX,
            this.cameras.main.centerY,
            bgKey
        )
        .setDepth(-1);
        
        // Scale background to fit screen
        const scaleX = this.cameras.main.width / background.width;
        const scaleY = this.cameras.main.height / background.height;
        const scale = Math.max(scaleX, scaleY);
        background.setScale(scale);
    }

    // New method to start the game after loading is complete
    startGame() {
        // Get the data passed from PregameScene
        const { selectedAnimals, opponents } = this.scene.settings.data || { selectedAnimals: [], opponents: [] };
        
        // Show VS screen overlay
        this.showVSScreen(selectedAnimals, opponents).then(() => {
            // Fade in music volume after VS screen only if not muted
            if (!audioManager.isMusicMuted && this.sound.get('battle_music')) {
                this.tweens.add({
                    targets: this.sound.get('battle_music'),
                    volume: audioManager.isMusicMuted ? 0 : 1,
                    duration: 1500,
                    ease: 'Linear'
                });
            }
            
            // Start game setup after VS screen
            this.setupGame();
        });
    }

    async showVSScreen(selectedAnimals, opponents) {
        //console.log('showVSScreen called with:', { selectedAnimals, opponents });
        
        // Ensure we have valid data
        if (!Array.isArray(selectedAnimals) || !Array.isArray(opponents)) {
            //console.error('Invalid data format for VS screen:', { selectedAnimals, opponents });
            return Promise.resolve(); // Return resolved promise to continue
        }
        
        const centerX = this.cameras.main.centerX;
        const centerY = this.cameras.main.centerY;

        // Create container for VS screen elements
        const vsContainer = this.add.container(0, 0).setDepth(1000);

        // Create VS text with stroke
        const vText = this.add.text(centerX - 50, this.cameras.main.height + 200, 'V', {
            fontFamily: 'ThaleahFat',
            fontSize: '150px',
            fontStyle: 'bold',
            fill: '#ffffff',
            stroke: '#000000',
            strokeThickness: 8
        }).setOrigin(0.5);

        const sText = this.add.text(centerX + 50, -200, 'S', {
            fontFamily: 'ThaleahFat',
            fontSize: '150px',
            fontStyle: 'bold',
            fill: '#ffffff',
            stroke: '#000000',
            strokeThickness: 8
        }).setOrigin(0.5);

        // Helper function to format animal name for icon key
        const formatIconKey = (name) => {
            const normalized = name.toLowerCase().replace(/ /g, '_');
            return `icon_${normalized}`;
        };

        // Helper function to create team display
        const createTeamDisplay = (animals, side) => {
            // Adjust base position to be more centered and further from VS text
            const baseX = side === 'left' ? centerX - 500 : centerX + 500;
            const startY = side === 'left' ? -200 : this.cameras.main.height + 200;
            const icons = [];
            const texts = [];

            // Ensure animals is an array of arrays with [name, count]
            const validAnimals = animals.filter(item => 
                Array.isArray(item) && item.length >= 2 && 
                typeof item[0] === 'string' && 
                (typeof item[1] === 'number' || !isNaN(parseInt(item[1])))
            );

            if (validAnimals.length === 0) {
                //console.error('No valid animals found for team display:', animals);
                return { icons: [], texts: [] };
            }

            // Calculate layout based on number of animals
            const count = validAnimals.length;
            let scale, positions;

            // Single animal (mainly for opponents)
            if (count === 1) {
                positions = [{ x: 0, y: 0 }];
                scale = 3;
            } 
            // Two animals side by side
            else if (count === 2) {
                positions = [
                    { x: -200, y: -20 },  // Further apart horizontally
                    { x: 200, y: -20 }    // Slightly up from center
                ];
                scale = 1.8;  // Smaller scale for multiple icons
            } 
            // Three animals in triangle formation
            else if (count === 3) {
                positions = [
                    { x: -200, y: -100 }, // Top left
                    { x: 200, y: -100 },  // Top right
                    { x: 0, y: 100 }      // Bottom center
                ];
                scale = 1.6;
            } 
            // Four animals in grid formation
            else if (count === 4) {
                positions = [
                    { x: -200, y: -140 }, // Top left
                    { x: 200, y: -140 },  // Top right
                    { x: -200, y: 100 },  // Bottom left
                    { x: 200, y: 100 }    // Bottom right
                ];
                scale = 1.4;
            }
            // More than 4 animals - use grid layout
            else {
                positions = [];
                const cols = Math.min(3, count);
                const rows = Math.ceil(count / cols);
                const spacing = 150;
                
                for (let i = 0; i < count; i++) {
                    const row = Math.floor(i / cols);
                    const col = i % cols;
                    const x = (col - (cols-1)/2) * spacing;
                    const y = (row - (rows-1)/2) * spacing;
                    positions.push({ x, y });
                }
                scale = 1.2;
            }

            // Create icons and texts for each animal
            validAnimals.forEach(([name, count], index) => {
                if (index >= positions.length) return;
                
                const pos = positions[index];
                const iconKey = formatIconKey(name);
                
                // Check if texture exists
                if (!this.textures.exists(iconKey)) {
                    //console.warn(`Texture not found: ${iconKey}`);
                    return;
                }
                
                // Create icon with proper sizing
                const icon = this.add.image(
                    baseX + pos.x,
                    startY + pos.y,
                    iconKey
                );
                
                // Calculate proper scale without background reference
                const maxSize = 160 * scale; // Adjust size as needed without background
                const scaleX = maxSize / icon.width;
                const scaleY = maxSize / icon.height;
                const properScale = Math.min(scaleX, scaleY);
                
                icon.setScale(properScale);

                // Dynamic text sizing based on icon scale and count
                const isOpponent = side === 'left';
                const baseSize = isOpponent ? 40 : 35; // Larger text for single opponent
                const textScale = isOpponent && count === 1 ? 1 : scale / 3;
                const fontSize = Math.max(20, Math.floor(baseSize * textScale));

                const text = this.add.text(
                    baseX + pos.x,
                    startY + pos.y + (maxSize * 0.6),
                    `${count}x ${name}`,
                    {
                        fontFamily: 'ThaleahFat',
                        fontSize: `${fontSize}px`,
                        fill: '#ffffff',
                        stroke: '#000000',
                        strokeThickness: 4  // Smaller stroke for smaller text
                    }
                ).setOrigin(0.5);

                icons.push(icon);
                texts.push(text);
            });

            return { icons, texts };
        };

        // Create team displays
        const leftTeam = createTeamDisplay(opponents, 'left');
        const rightTeam = createTeamDisplay(selectedAnimals, 'right');

        // Add all elements to container (remove backgrounds)
        vsContainer.add([
            vText, 
            sText, 
            ...leftTeam.icons, 
            ...leftTeam.texts, 
            ...rightTeam.icons, 
            ...rightTeam.texts
        ]);

        // Animation setup
        const duration = 600;
        const holdDuration = 1500;

        const createTween = (targets, props) => {
            return new Promise(resolve => {
                this.tweens.add({
                    targets,
                    ...props,
                    onComplete: resolve
                });
            });
        };

        try {
            // Slide in animations (remove backgrounds from animations)
            await Promise.all([
                createTween([...leftTeam.icons, ...leftTeam.texts], {
                    y: `+=${this.cameras.main.centerY + 50}`,
                    duration,
                    ease: 'Power2'
                }),
                createTween(vText, {
                    y: centerY,
                    duration,
                    ease: 'Power2',
                    delay: 100
                }),
                createTween(sText, {
                    y: centerY,
                    duration,
                    ease: 'Power2',
                    delay: 200
                }),
                createTween([...rightTeam.icons, ...rightTeam.texts], {
                    y: `-=${this.cameras.main.height - centerY + 50}`,
                    duration,
                    ease: 'Power2',
                    delay: 300
                })
            ]);

            // Play bell sound with increased volume
            audioManager.playOneShot(this, 'battle_start', { volume: 2 });

            // Hold for duration
            await new Promise(resolve => this.time.delayedCall(holdDuration, resolve));

            // Slide out animations (remove backgrounds from animations)
            await Promise.all([
                createTween([...leftTeam.icons, ...leftTeam.texts], {
                    y: `+=${this.cameras.main.height}`,
                    duration,
                    ease: 'Power2'
                }),
                createTween(vText, {
                    y: -200,
                    duration,
                    ease: 'Power2',
                    delay: 100
                }),
                createTween(sText, {
                    y: this.cameras.main.height + 200,
                    duration,
                    ease: 'Power2',
                    delay: 200
                }),
                createTween([...rightTeam.icons, ...rightTeam.texts], {
                    y: -200,
                    duration,
                    ease: 'Power2',
                    delay: 300
                })
            ]);

            // Cleanup
            vsContainer.destroy();

        } catch (error) {
            //console.error('Animation error:', error);
            vsContainer.destroy();
        }
    }

    setupGame() {
        // Configure physics world
        this.physics.world.setBounds(0, 0, this.cameras.main.width, this.cameras.main.height);
        this.physics.world.setBoundsCollision(true);
        
        // Reduce gravity and enable physics debug if needed
        this.physics.world.gravity.y = 0;
        
        // Clean up any existing battle state - but NOT the background or flowers
        this.cleanupBattleOnly();

        // Initialize new battle manager
        this.battleManager = new BattleManager(this);

        // Get the data passed from PregameScene
        const { selectedAnimals, opponents } = this.scene.settings.data || { selectedAnimals: [], opponents: [] };
        
        // Place opponents on west side facing east
        this.placeAnimals(opponents, 'opponent');
        
        // Place player's animals on east side facing west
        this.placeAnimals(selectedAnimals, 'player');
    }

    placeAnimals(animals, team) {
        if (!Array.isArray(animals)) {
            //console.error('Invalid animals data:', animals);
            return;
        }

        const totalCount = animals.reduce((sum, [_, count]) => sum + count, 0);
        const radius = Math.min(120, 30 + (totalCount * 10));
        const centerX = team === 'opponent' ? 250 : this.cameras.main.width - 250;
        const centerY = this.cameras.main.height / 2;

        let placedCount = 0;
        let soundDelay = 0;
        const delayIncrement = 100; // 100ms between spawn sounds

        animals.forEach(([name, count]) => {
            for(let i = 0; i < count; i++) {
                const angle = (Math.PI * 2 * placedCount / totalCount) + 
                    (Math.random() * 0.3 - 0.15);
                const distance = radius * (0.3 + Math.random() * 0.7);
                
                const x = centerX + Math.cos(angle) * distance;
                const y = centerY + Math.sin(angle) * distance;
                
                const animal = new BattleAnimal(this, x, y, name, team);
                this.battleManager.addAnimal(animal, team);
                
                // Add delayed sound for spawn
                this.time.delayedCall(soundDelay, () => {
                    animal.playAnimalSound();
                });
                
                soundDelay += delayIncrement;
                
                placedCount++;
            }
        });
    }

    update() {
        // Only call battleManager.update() if it exists and is active
        if (this.battleManager && this.scene.isActive('GameScene')) {
            this.battleManager.update();
        }
    }

    // Helper methods for BattleAnimal class
    getEnemyAnimals(team) {
        return this.battleManager.getEnemyAnimals(team);
    }

    checkTeamFear(team) {
        this.battleManager.checkTeamFear(team);
    }

    checkBattleEnd() {
        // Get counts of remaining animals
        const playerAnimals = this.battleManager.getTeamAnimals('player');
        const opponentAnimals = this.battleManager.getTeamAnimals('opponent');

        if (playerAnimals.length === 0 || opponentAnimals.length === 0) {
            // Determine winner
            const winningTeam = playerAnimals.length > 0 ? 'player' : 'opponent';
            const winningAnimals = winningTeam === 'player' ? playerAnimals : opponentAnimals;
            
            // Get the first surviving animal's name for the victory screen
            const winningAnimal = winningAnimals[0].animalName;

            // Get the game mode from scene data
            const { mode } = this.scene.settings.data || {};

            // Show victory screen before transitioning
            this.showVictoryScreen(winningTeam, winningAnimal).then(() => {
                // Determine which scene to return to based on mode
                let targetScene;
                
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
                
                // Transition to the appropriate pregame scene
                this.scene.start(targetScene);
                
                // Notify UI scene that we've changed scenes
                this.game.events.emit('sceneChanged');
            });
        }
    }

    showVictoryScreen(winningTeam, winningAnimal) {
        return new Promise(resolve => {
            const centerX = this.cameras.main.centerX;
            const centerY = this.cameras.main.centerY;
            
            // Get the game mode from scene data
            const { mode, playerGuess, playerChoice } = this.scene.settings.data || {};
            
            // Add debug logging
            console.log('Victory Screen Data:', {
                mode,
                winningTeam,
                playerChoice,
                sceneData: this.scene.settings.data
            });
            
            // Format the animal name for the icon key
            const iconKey = `icon_${winningAnimal.toLowerCase().replace(/ /g, '_')}`;

            // Remove background for icon

            // Create icon coming from left with high depth
            const icon = this.add.image(-200, centerY, iconKey)
                .setDepth(1000);  // Set icon depth lower than text
                
            // Calculate proper scale without background reference
            const maxSize = 240; // Size without background
            const scaleX = maxSize / icon.width;
            const scaleY = maxSize / icon.height;
            const properScale = Math.min(scaleX, scaleY);
            
            icon.setScale(properScale);

            // Create "WINNER!" text with new font
            const winnerText = this.add.text(this.cameras.main.width + 200, centerY + 100, 'WINNER!', {
                fontFamily: 'ThaleahFat',
                fontSize: '64px',
                fontStyle: 'bold',
                fill: '#ffffff',
                stroke: '#000000',
                strokeThickness: 6
            })
            .setOrigin(0.5)
            .setDepth(1002);  // Set text depth higher than icon

            // Determine if player won based on game mode
            let isPlayerWin = false;
            let resultText;
            
            if (mode === 'challenge') {
                // In challenge mode, player wins if they guessed correctly
                // The player's guess is correct if:
                // - The challenger (opponent) won - meaning the player's animals couldn't defeat it
                const challengerWon = winningTeam === 'opponent';
                isPlayerWin = challengerWon;
                
                resultText = this.add.text(
                    centerX, 
                    centerY + 220,
                    isPlayerWin ? 'CORRECT GUESS!' : 'WRONG GUESS!', 
                    {
                        fontFamily: 'ThaleahFat',
                        fontSize: '128px',
                        fontStyle: 'bold',
                        fill: isPlayerWin ? '#00ff00' : '#ff0000',
                        stroke: isPlayerWin ? '#ffffff' : '#000000',
                        strokeThickness: 8
                    }
                );
            }
            else if (mode === 'casino') {
                // In casino mode, player wins if their chosen team won
                // The selected team is placed as the player's team, so:
                // - If player chose team1, they win if player team wins
                // - If player chose team2, they win if player team wins
                isPlayerWin = 
                    (playerChoice === 'team1' && winningTeam === 'player') ||
                    (playerChoice === 'team2' && winningTeam === 'player');
                
                resultText = this.add.text(
                    centerX, 
                    centerY + 220,
                    isPlayerWin ? 'YOU WIN!' : 'YOU LOSE!', 
                    {
                        fontFamily: 'ThaleahFat',
                        fontSize: '128px',
                        fontStyle: 'bold',
                        fill: isPlayerWin ? '#00ff00' : '#ff0000',
                        stroke: isPlayerWin ? '#ffffff' : '#000000',
                        strokeThickness: 8
                    }
                );
            }
            else if (mode === 'free') {
                // In free mode, just show which team won
                const teamName = winningTeam === 'player' ? 'TEAM 1' : 'TEAM 2';
                resultText = this.add.text(
                    centerX, 
                    centerY + 220,
                    `${teamName} WINS!`, 
                    {
                        fontFamily: 'ThaleahFat',
                        fontSize: '128px',
                        fontStyle: 'bold',
                        fill: '#ffffff',
                        stroke: '#000000',
                        strokeThickness: 8
                    }
                );
            }
            else {
                // Standard mode - player wins if their animals won
                isPlayerWin = winningTeam === 'player';
                
                resultText = this.add.text(
                    centerX, 
                    centerY + 220,
                    isPlayerWin ? 'YOU WIN!' : 'YOU LOSE!', 
                    {
                        fontFamily: 'ThaleahFat',
                        fontSize: '128px',
                        fontStyle: 'bold',
                        fill: isPlayerWin ? '#00ff00' : '#ff0000',
                        stroke: isPlayerWin ? '#ffffff' : '#000000',
                        strokeThickness: 8
                    }
                );
            }
            
            resultText.setOrigin(0.5)
                .setDepth(1002)  // Set text depth higher than icon
                .setAlpha(0); // Start invisible for fade-in effect

            // Play victory sound
            audioManager.playOneShot(this, 'battle_start', { volume: 2 });

            // Slide in animations (remove iconBg from animations)
            this.tweens.add({
                targets: icon,
                x: centerX,
                duration: 1000,
                ease: 'Power2'
            });

            this.tweens.add({
                targets: winnerText,
                x: centerX,
                duration: 1000,
                ease: 'Power2',
                onComplete: () => {
                    // Fade in the result text after the icon and winner text are in place
                    this.tweens.add({
                        targets: resultText,
                        alpha: 1,
                        duration: 500,
                        ease: 'Power2'
                    });
                    
                    // Wait 3 seconds then cleanup and resolve
                    this.time.delayedCall(3000, () => {
                        // Remove iconBg from cleanup
                        icon.destroy();
                        winnerText.destroy();
                        resultText.destroy();
                        resolve();
                    });
                }
            });
        });
    }

    // New method to clean up only battle-related elements
    cleanupBattleOnly() {
        // Clean up battle manager if it exists
        if (this.battleManager) {
            this.battleManager.clearAllAnimals();
            this.battleManager = null;
        }

        // Clear battle-related game objects EXCEPT background and flowers
        // Background has depth -1, flowers have depth 2, so we'll clear depth > 10
        this.children.list
            .filter(child => child.depth > 10)
            .forEach(child => child.destroy());
        
        // Clear physics
        this.physics.world.bodies.clear();
        
        // Reset game speed
        this.time.timeScale = 1;
        this.physics.world.timeScale = 1;
        uiManager.resetGameSpeed();
    }

    // Keep the original cleanup for scene transitions
    cleanup() {
        // Clean up battle manager if it exists
        if (this.battleManager) {
            this.battleManager.clearAllAnimals();
            this.battleManager = null;
        }

        // Clear all game objects EXCEPT background
        this.children.list
            .filter(child => child.depth >= 0)  // Keep background
            .forEach(child => child.destroy());
        
        // Clear physics
        this.physics.world.bodies.clear();
        
        // Reset game speed
        this.time.timeScale = 1;
        this.physics.world.timeScale = 1;
        uiManager.resetGameSpeed();
        
        // Make sure all timers are cleared
        this.time.removeAllEvents();
        
        // Remove any lingering tweens
        this.tweens.killAll();
        
        // Make sure scene is properly reset on shutdown
        this.events.once('shutdown', () => {
            // Extra cleanup on shutdown to prevent lingering references
            if (this.battleManager) {
                this.battleManager.clearAllAnimals();
                this.battleManager = null;
            }
            this.time.removeAllEvents();
            this.tweens.killAll();
        });
    }

    addRandomFlowers(count) {
        // Get all available flower animations
        const flowerAnimations = Array.from({ length: 46 }, (_, i) => 
            `flower_animation${i === 0 ? '' : i + 1}`
        );
        
        // Verify animations exist
        const availableAnimations = flowerAnimations.filter(key => this.anims.exists(key));
        
        if (availableAnimations.length === 0) {
            //console.error('Cannot add flowers: no flower animations exist');
            return;
        }
        
        //console.log('Adding random flowers, count:', count);
        
        // Use the entire screen for flower placement
        const screenArea = {
            x: 0, 
            y: 0, 
            width: this.cameras.main.width, 
            height: this.cameras.main.height
        };
        
        for (let i = 0; i < count; i++) {
            // Generate random position within the entire screen
            const x = screenArea.x + Math.random() * screenArea.width;
            const y = screenArea.y + Math.random() * screenArea.height;
            
            // Choose which animation to use randomly
            const useAnimation = Phaser.Utils.Array.GetRandom(availableAnimations);
            
            // Get the animation configuration to determine frame range
            const animConfig = this.anims.get(useAnimation);
            if (!animConfig || !animConfig.frames.length) {
                //console.error('Invalid animation config for:', useAnimation);
                continue;
            }
            
            // Get the first frame number as a number, not an object
            const startFrame = parseInt(animConfig.frames[0].frame);
            const frameCount = animConfig.frames.length;
            
            // Set random initial frame within the animation's range
            const randomFrame = startFrame + Math.floor(Math.random() * frameCount);
            
            const flower = this.add.sprite(x, y, 'jungle_animations', randomFrame)
                .setScale(Math.random() * 0.5 + 0.8)  // Random scale
                .setDepth(2);  // Above background (-1) but below battle elements
            
            // Add slight random rotation
            flower.setRotation(Math.random() * 0.2 - 0.1);
            
            // Calculate a random delay before starting animation (0-2000ms)
            const randomDelay = Math.random() * 2000;
            
            // Calculate a slightly randomized animation speed (0.8-1.2 of normal speed)
            const speedVariation = 0.8 + Math.random() * 0.4; // 0.8 to 1.2
            
            // Delay the start of animation with random speed
            this.time.delayedCall(randomDelay, () => {
                flower.play({
                    key: useAnimation,
                    frameRate: 2.5 * speedVariation,
                    repeat: -1
                });
            });
        }
    }

    addRandomStones(count) {
        //console.log('Adding random stones, count:', count);
        
        // Use the entire screen for stone placement
        const screenArea = {
            x: 0, 
            y: 0, 
            width: this.cameras.main.width, 
            height: this.cameras.main.height
        };
        
        for (let i = 0; i < count; i++) {
            // Generate random position within the entire screen
            const x = screenArea.x + Math.random() * screenArea.width;
            const y = screenArea.y + Math.random() * screenArea.height;
            
            // Choose which stone to use randomly
            const stoneNum = Math.floor(Math.random() * 17) + 1;
            const stoneKey = `stone${stoneNum}`;
            
            // Check if texture exists
            if (!this.textures.exists(stoneKey)) {
                //console.error('Stone texture not found:', stoneKey);
                continue;
            }
            
            const stone = this.add.image(x, y, stoneKey)
                .setScale(Math.random() * 0.3 + 0.7)  // Random scale between 0.7 and 1.0
                .setDepth(1);  // Depth 1 puts stones above background (-1) but below flowers (2)
            
            // Add slight random rotation
            stone.setRotation(Math.random() * 0.3 - 0.15);
        }
    }

    // In the scene's init method, add proper initialization
    init() {
        // Make sure battle manager is null at start
        this.battleManager = null;
    }
}

const config = {
    type: Phaser.AUTO,
    width: window.innerWidth,
    height: window.innerHeight,
    scale: {
        mode: Phaser.Scale.FIT,
        parent: 'game',
        autoCenter: Phaser.Scale.CENTER_BOTH,
        width: window.innerWidth,
        height: window.innerHeight,
        min: {
            width: 800,
            height: 600
        },
        max: {
            width: 1920,
            height: 1080
        }
    },
    physics: {
        default: 'arcade',
        arcade: {
            debug: true,
            gravity: { x: 0, y: 0 }
        }
    },
    scene: [
        BootScene, 
        MenuScene, 
        PregameScene, 
        PregameChallengeScene,
        PregameCasinoScene,
        PregameFreeScene,
        GameScene, 
        UIScene,
        HelpScene,
        CreditsScene
    ],
    backgroundColor: '#000000',
    dom: {
        createContainer: true
    },
    render: {
        antialias: true,
        pixelArt: false,
        roundPixels: true
    }
};

// Add resize handler
window.addEventListener('resize', () => {
    if (window.gameInstance) {
        window.gameInstance.scale.resize(window.innerWidth, window.innerHeight);
    }
});

// Check if game instance exists before creating a new one
if (!window.gameInstance) {
    window.gameInstance = new Phaser.Game(config);
}

export default GameScene;
