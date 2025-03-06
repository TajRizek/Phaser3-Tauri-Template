import { AnimalStats } from './Animal';
import { AnimalSoundMap } from './Animal';

export function preload(scene) {
    // console.log("Preloading...");
    
    // Load background with absolute path and without event handlers
    scene.load.image('background', '/assets/background/bg2.png');
    scene.load.image('banner', '/assets/banner/banner1.png');
    
    // Load grass tile for tiled background
    scene.load.image('grass_tile', 'assets/background/tiles/tile_grass_main.png');

    // Load jungle animations spritesheet
    scene.load.spritesheet('jungle_animations', 'assets/background/RA_Jungle_Animations.png', {
        frameWidth: 48,  // The sprite sheet is 960px wide with 10 frames per row
        frameHeight: 56  // Assuming square frames; sheet is 1056px high with 11 rows
    });

    // Add an event handler to verify the spritesheet loaded properly
    scene.load.on('filecomplete-spritesheet-jungle_animations', () => {
        //console.log('Jungle animations spritesheet loaded successfully');
    });

    // Load button click sound
    scene.load.audio('click', '/assets/sounds/click1.wav');

    // Load blood effect spritesheets
    for (let i = 1; i <= 4; i++) {
        scene.load.spritesheet(`blood${i}`, `/assets/effects/blood${i}.png`, {
            frameWidth: 32,
            frameHeight: 32,
            spacing: 0,
            margin: 0
        });
    }

    // Load all animal icons
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
        'elite_wolf': 'ELITE Wolf',
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
        scene.load.image(iconKey, `assets/icons/v2/${displayName}.webp`);
    });

    // List of all animals
    const animals = [
        'Alpacha', 'Antelope', 'Arabian Horse', 'Bison', 'Boar', 'Black Bear', 
        'Brown Horse', 'Bull', 'Camel', 'Cat Black', 'Cat Large', 'Cat Orange', 
        'Cat White', 'Chicken', 'Chimp', 'Cow', 'Cow Brown', 'Crocodile', 'Deer', 
        'Donkey', 'Elephant', 'Elephant Female', 'ELITE Wolf', 'Giraffe', 
        'Golden Retriever', 'Grizzly', 'Hippo', 'Husky', 'Hyena', 
        'Panther', 'Lion', 'Lioness', 'Llama', 'Mammoth', 'Monkey', 'Oryx', 
        'Ostrich', 'Penguin', 'Pig', 'Polar Bear', 'Ram', 'Rhino', 'Rhino Female', 
        'Sheep', 'Shepherd Dog', 'Stag', 'Tiger', 'Tortoise', 'Turtle', 
        'Water Buffalo', 'White Tiger', 'Wolf', 'Work Horse', 'Yak', 'Zebra'
    ];

    // Define which animations each animal has
    const animalAnimations = {
        // Animals missing Attack3
        'Antelope': ['Attack1', 'Attack2', 'Die', 'Idle', 'Idle2', 'Run', 'TakeDamage', 'Taunt', 'Walk'],
        'Deer': ['Attack1', 'Attack2', 'Die', 'Idle', 'Idle2', 'Run', 'TakeDamage', 'Taunt', 'Walk'],
        'Oryx': ['Attack1', 'Attack2', 'Die', 'Idle', 'Idle2', 'Run', 'TakeDamage', 'Taunt', 'Walk'],
        'Stag': ['Attack1', 'Attack2', 'Die', 'Idle', 'Idle2', 'Run', 'TakeDamage', 'Taunt', 'Walk'],

        // Animals missing Idle2 and other animations
        'Chimp': ['Attack1', 'Attack2', 'Attack3', 'Die', 'Idle', 'Run', 'TakeDamage', 'Taunt', 'Walk'],
        'Crocodile': ['Attack1', 'Attack2', 'Attack3', 'Die', 'Idle', 'Run', 'TakeDamage', 'Taunt', 'Walk'],
        'Golden Retriever': ['Attack1', 'Attack2', 'Attack3', 'Die', 'Idle', 'Run', 'TakeDamage', 'Walk'],
        'Husky': ['Attack1', 'Attack2', 'Attack3', 'Die', 'Idle', 'Run', 'TakeDamage', 'Walk'],
        'Hyena': ['Attack1', 'Attack2', 'Die', 'Idle', 'Run', 'TakeDamage', 'Taunt'],
        'Monkey': ['Attack1', 'Attack2', 'Attack3', 'Die', 'Idle', 'Run', 'TakeDamage', 'Taunt', 'Walk'],
        'Shepherd Dog': ['Attack1', 'Attack2', 'Attack3', 'Die', 'Idle', 'Run', 'TakeDamage', 'Walk'],

        // Animals missing Taunt
        'Cat Large': ['Attack1', 'Attack2', 'Attack3', 'Die', 'Idle', 'Idle2', 'Run', 'TakeDamage', 'Walk'],
        'Chicken': ['Attack1', 'Attack2', 'Attack3', 'Die', 'Idle', 'Idle2', 'Run', 'TakeDamage', 'Walk'],
        'Donkey': ['Attack1', 'Attack2', 'Attack3', 'Die', 'Idle', 'Idle2', 'Run', 'TakeDamage', 'Walk'],
        'ELITE Wolf': ['Attack1', 'Attack2', 'Attack3', 'Die', 'Idle', 'Idle2', 'Run', 'TakeDamage'],
        'Panther': ['Attack1', 'Attack2', 'Attack3', 'Die', 'Idle', 'Idle2', 'Run', 'TakeDamage', 'Walk'],
        'Lion': ['Attack1', 'Attack2', 'Attack3', 'Die', 'Idle', 'Idle2', 'Run', 'TakeDamage', 'Walk'],
        'Lioness': ['Attack1', 'Attack2', 'Attack3', 'Die', 'Idle', 'Idle2', 'Run', 'TakeDamage', 'Walk'],
        'Tiger': ['Attack1', 'Attack2', 'Attack3', 'Die', 'Idle', 'Idle2', 'Run', 'TakeDamage', 'Walk'],
        'Tortoise': ['Attack1', 'Attack2', 'Attack3', 'Die', 'Idle', 'Idle2', 'Run', 'TakeDamage', 'Walk'],
        'Turtle': ['Attack1', 'Attack2', 'Attack3', 'Die', 'Idle', 'Idle2', 'Run', 'TakeDamage', 'Walk'],
        'White Tiger': ['Attack1', 'Attack2', 'Attack3', 'Die', 'Idle', 'Idle2', 'Run', 'TakeDamage', 'Walk'],
        'Wolf': ['Attack1', 'Attack2', 'Attack3', 'Die', 'Idle', 'Idle2', 'Run', 'TakeDamage'],
        'Zebra': ['Attack1', 'Attack2', 'Attack3', 'Die', 'Idle', 'Idle2', 'Run', 'TakeDamage', 'Walk']
    };

    // Default animations if not specifically defined
    const defaultAnimations = [
        'Attack1', 'Attack2', 'Attack3', 'Die', 'Idle', 'Idle2',
        'Run', 'TakeDamage', 'Taunt', 'Walk'
    ];

    // Load all spritesheets
    animals.forEach(animal => {
        const animalKey = animal.replace(/ /g, '_').toLowerCase();
        const animations = animalAnimations[animal] || defaultAnimations;
        const stats = AnimalStats[animal];
        
        if (!stats) {
            //console.error(`Missing stats for animal: ${animal}`);
            return;
        }
        
        // Calculate frame dimensions based on sprite sheet size
        // Each sprite sheet has 8 rows and 15 columns
        const frameConfig = {
            frameWidth: stats.spriteWidth / 15,  // 15 frames per row
            frameHeight: stats.spriteHeight / 8,  // 8 rows total
            spacing: 0,
            margin: 0
        };
        
        animations.forEach(animation => {
            const key = `${animalKey}_${animation.toLowerCase()}`;
            const path = `/assets/animals/${animal}/${animation}.png`;
            scene.load.spritesheet(key, path, frameConfig);
        });
    });

    // Load all animal sounds
    const soundFiles = [
        'bear_1', 'bear_2', 'bear_3',
        'beast_1', 'beast_2', 'beast_3', 'beast_4',
        'boar_1', 'boar_2', 'boar_3',
        'cat_1', 'cat_2', 'cat_3', 'cat_4', 'cat_5',
        'chicken_1', 'chicken_2', 'chicken_3',
        'cow_1', 'cow_2', 'cow_3',
        'deer_1', 'deer_2',
        'dog_1', 'dog_2', 'dog_3', 'dog_4', 'dog_5', 'dog_6',
        'donkey_1', 'donkey_2', 'donkey_3', 'donkey_4',
        'elephant_1', 'elephant_2', 'elephant_3',
        'goat_1', 'goat_2', 'goat_3', 'goat_4', 'goat_5',
        'horse_1', 'horse_2', 'horse_3', 'horse_4', 'horse_5',
        'large_cat_1',
        'lion_1', 'lion_2', 'lion_3',
        'lizzard_1', 'lizzard_2', 'lizzard_3',
        'monkey_1', 'monkey_2', 'monkey_3', 'monkey_4', 'monkey_5',
        'panther_1', 'panther_2',
        'penguin_1', 'penguin_2', 'penguin_3', 'penguin_4',
        'pig_5', 'pig_6',
        'rhino_1', 'rhino_2',
        'sheep_1', 'sheep_2',
        'tiger_1', 'tiger_2', 'tiger_3', 'tiger_4', 'tiger_5', 'tiger_6',
        'wolf_1', 'wolf_2'
    ];

    soundFiles.forEach(sound => {
        scene.load.audio(sound, `/assets/sounds/animals/${sound}.wav`);
    });

    // Load battle start bell sound
    scene.load.audio('battle_start', '/assets/sounds/bell1.mp3');

    // Load impact sounds
    const impactSounds = [
        'small1', 'small2',
        'medium1', 'medium2',
        'large1', 'large2'
    ];

    impactSounds.forEach(sound => {
        scene.load.audio(sound, `/assets/sounds/impact/${sound}.wav`);
    });

    // Load music
    scene.load.audio('menu_music', '/assets/sounds/music/menu.ogg');
    scene.load.audio('battle_music', '/assets/sounds/music/battle.ogg');
    
    // Load mute button
    //scene.load.image('mute_button', '/assets/ui/mute.png');

    // Load UI icons
    scene.load.image('btn_icon_music', '/assets/ui/btn_icon_music.png');
    scene.load.image('btn_icon_volume', '/assets/ui/btn_icon_volume.png');
    scene.load.image('btn_icon_water', '/assets/ui/btn_icon_water.png');
    scene.load.image('btn_icon_quit', '/assets/ui/btn_icon_quit.png');
    scene.load.image('btn_icon_time', '/assets/ui/btn_icon_time.png');
    scene.load.image('btn_icon_refresh', '/assets/ui/btn_icon_refresh.png');

    // Load stone sprites
    for (let i = 1; i <= 17; i++) {
        scene.load.image(`stone${i}`, `assets/background/stones/stone${i}.png`);
    }
}
