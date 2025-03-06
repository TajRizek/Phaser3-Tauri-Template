export class Animal {
    constructor(config) {
        this.name = config.name;
        this.hitpoints = config.hitpoints;
        this.attackDamage = config.attackDamage;
        this.speed = config.speed;
        this.fearFactor = config.fearFactor;
        this.price = config.price;
        this.spriteWidth = config.spriteWidth;
        this.spriteHeight = config.spriteHeight;
    }
}

// Animal stats database
export const AnimalStats = {
    'Alpacha': { hitpoints: 100, attackDamage: 5, speed: 30, fearFactor: 20, price: 200, spriteWidth: 960, spriteHeight: 512, size: 3 },
    'Antelope': { hitpoints: 80, attackDamage: 10, speed: 70, fearFactor: 30, price: 300, spriteWidth: 1110, spriteHeight: 592, size: 3 },
    'Arabian Horse': { hitpoints: 120, attackDamage: 20, speed: 90, fearFactor: 40, price: 1000, spriteWidth: 1440, spriteHeight: 768, size: 5 },
    'Bison': { hitpoints: 300, attackDamage: 40, speed: 50, fearFactor: 60, price: 2000, spriteWidth: 1440, spriteHeight: 768, size: 6 },
    'Boar': { hitpoints: 150, attackDamage: 30, speed: 50, fearFactor: 50, price: 800, spriteWidth: 1260, spriteHeight: 672, size: 3 },
    'Black Bear': { hitpoints: 400, attackDamage: 70, speed: 40, fearFactor: 80, price: 3000, spriteWidth: 960, spriteHeight: 512, size: 6 },
    'Brown Horse': { hitpoints: 120, attackDamage: 20, speed: 80, fearFactor: 30, price: 900, spriteWidth: 1440, spriteHeight: 768, size: 5 },
    'Bull': { hitpoints: 350, attackDamage: 60, speed: 45, fearFactor: 70, price: 2500, spriteWidth: 1260, spriteHeight: 672, size: 5 },
    'Camel': { hitpoints: 200, attackDamage: 25, speed: 35, fearFactor: 40, price: 1200, spriteWidth: 960, spriteHeight: 512, size: 5 },
    'Cat Black': { hitpoints: 30, attackDamage: 5, speed: 75, fearFactor: 15, price: 50, spriteWidth: 960, spriteHeight: 512, size: 2 },
    'Cat Large': { hitpoints: 60, attackDamage: 10, speed: 70, fearFactor: 20, price: 300, spriteWidth: 960, spriteHeight: 512, size: 3 },
    'Cat Orange': { hitpoints: 30, attackDamage: 5, speed: 75, fearFactor: 15, price: 50, spriteWidth: 960, spriteHeight: 512, size: 2 },
    'Cat White': { hitpoints: 30, attackDamage: 5, speed: 75, fearFactor: 15, price: 50, spriteWidth: 960, spriteHeight: 512, size: 2 },
    'Chicken': { hitpoints: 5, attackDamage: 1, speed: 20, fearFactor: 5, price: 10, spriteWidth: 960, spriteHeight: 512, size: 1 },
    'Chimp': { hitpoints: 120, attackDamage: 25, speed: 60, fearFactor: 50, price: 1500, spriteWidth: 1260, spriteHeight: 672, size: 3 },
    'Cow': { hitpoints: 200, attackDamage: 10, speed: 30, fearFactor: 20, price: 1000, spriteWidth: 1110, spriteHeight: 592, size: 5 },
    'Cow Brown': { hitpoints: 200, attackDamage: 10, speed: 30, fearFactor: 20, price: 1000, spriteWidth: 1110, spriteHeight: 592, size: 5 },
    'Crocodile': { hitpoints: 500, attackDamage: 90, speed: 25, fearFactor: 85, price: 4000, spriteWidth: 960, spriteHeight: 512, size: 5 },
    'Deer': { hitpoints: 100, attackDamage: 10, speed: 75, fearFactor: 30, price: 500, spriteWidth: 960, spriteHeight: 512, size: 4 },
    'Donkey': { hitpoints: 150, attackDamage: 15, speed: 40, fearFactor: 30, price: 700, spriteWidth: 960, spriteHeight: 512, size: 4 },
    'Elephant': { hitpoints: 1000, attackDamage: 100, speed: 30, fearFactor: 95, price: 10000, spriteWidth: 1920, spriteHeight: 1024, size: 7 },
    'Elephant Female': { hitpoints: 950, attackDamage: 95, speed: 30, fearFactor: 90, price: 9500, spriteWidth: 1770, spriteHeight: 944, size: 7 },
    'ELITE Wolf': { hitpoints: 200, attackDamage: 50, speed: 70, fearFactor: 75, price: 3000, spriteWidth: 1440, spriteHeight: 768, size: 5 },
    'Giraffe': { hitpoints: 500, attackDamage: 30, speed: 50, fearFactor: 50, price: 2500, spriteWidth: 1860, spriteHeight: 992, size: 7 },
    'Golden Retriever': { hitpoints: 60, attackDamage: 5, speed: 60, fearFactor: 20, price: 300, spriteWidth: 960, spriteHeight: 512, size: 3 },
    'Grizzly': { hitpoints: 600, attackDamage: 100, speed: 45, fearFactor: 90, price: 5000, spriteWidth: 1440, spriteHeight: 768, size: 7 },
    'Hippo': { hitpoints: 900, attackDamage: 95, speed: 20, fearFactor: 85, price: 8000, spriteWidth: 1440, spriteHeight: 768, size: 7 },
    'Husky': { hitpoints: 100, attackDamage: 20, speed: 65, fearFactor: 30, price: 100, spriteWidth: 960, spriteHeight: 512, size: 3 },
    'Hyena': { hitpoints: 150, attackDamage: 45, speed: 65, fearFactor: 60, price: 1500, spriteWidth: 960, spriteHeight: 512, size: 4 },
    'Panther': { hitpoints: 350, attackDamage: 75, speed: 80, fearFactor: 85, price: 4000, spriteWidth: 1440, spriteHeight: 768, size: 5 },
    'Lion': { hitpoints: 500, attackDamage: 80, speed: 60, fearFactor: 90, price: 5000, spriteWidth: 1440, spriteHeight: 768, size: 5 },
    'Lioness': { hitpoints: 450, attackDamage: 75, speed: 65, fearFactor: 85, price: 4500, spriteWidth: 1260, spriteHeight: 672, size: 5 },
    'Llama': { hitpoints: 60, attackDamage: 5, speed: 35, fearFactor: 20, price: 150, spriteWidth: 960, spriteHeight: 512, size: 4 },
    'Mammoth': { hitpoints: 1200, attackDamage: 110, speed: 25, fearFactor: 98, price: 12000, spriteWidth: 1920, spriteHeight: 1024, size: 7 },
    'Monkey': { hitpoints: 60, attackDamage: 15, speed: 70, fearFactor: 30, price: 400, spriteWidth: 960, spriteHeight: 512, size: 2 },
    'Oryx': { hitpoints: 180, attackDamage: 15, speed: 50, fearFactor: 25, price: 700, spriteWidth: 1110, spriteHeight: 592, size: 3 },
    'Ostrich': { hitpoints: 150, attackDamage: 15, speed: 90, fearFactor: 30, price: 1000, spriteWidth: 960, spriteHeight: 512, size: 4 },
    'Penguin': { hitpoints: 50, attackDamage: 5, speed: 40, fearFactor: 15, price: 100, spriteWidth: 960, spriteHeight: 512, size: 3 },
    'Pig': { hitpoints: 200, attackDamage: 5, speed: 30, fearFactor: 20, price: 100, spriteWidth: 960, spriteHeight: 512, size: 3 },
    'Polar Bear': { hitpoints: 700, attackDamage: 95, speed: 35, fearFactor: 95, price: 6000, spriteWidth: 1440, spriteHeight: 768, size: 6 },
    'Ram': { hitpoints: 200, attackDamage: 25, speed: 50, fearFactor: 45, price: 1200, spriteWidth: 960, spriteHeight: 512, size: 4 },
    'Rhino': { hitpoints: 900, attackDamage: 100, speed: 30, fearFactor: 95, price: 7500, spriteWidth: 1440, spriteHeight: 768, size: 6 },
    'Rhino Female': { hitpoints: 800, attackDamage: 90, speed: 30, fearFactor: 90, price: 7000, spriteWidth: 1290, spriteHeight: 688, size: 6 },
    'Sheep': { hitpoints: 70, attackDamage: 5, speed: 30, fearFactor: 15, price: 200, spriteWidth: 960, spriteHeight: 512, size: 3 },
    'Shepherd Dog': { hitpoints: 120, attackDamage: 20, speed: 70, fearFactor: 40, price: 800, spriteWidth: 960, spriteHeight: 512, size: 3 },
    'Stag': { hitpoints: 200, attackDamage: 30, speed: 70, fearFactor: 50, price: 1500, spriteWidth: 1440, spriteHeight: 768, size: 4 },
    'Tiger': { hitpoints: 550, attackDamage: 85, speed: 80, fearFactor: 90, price: 5500, spriteWidth: 1440, spriteHeight: 768, size: 6 },
    'Tortoise': { hitpoints: 200, attackDamage: 10, speed: 5, fearFactor: 10, price: 500, spriteWidth: 1260, spriteHeight: 672, size: 4 },
    'Turtle': { hitpoints: 50, attackDamage: 5, speed: 10, fearFactor: 5, price: 100, spriteWidth: 960, spriteHeight: 512, size: 2 },
    'Water Buffalo': { hitpoints: 400, attackDamage: 50, speed: 40, fearFactor: 65, price: 3000, spriteWidth: 1260, spriteHeight: 672, size: 6 },
    'White Tiger': { hitpoints: 600, attackDamage: 90, speed: 70, fearFactor: 95, price: 6000, spriteWidth: 1440, spriteHeight: 768, size: 5 },
    'Wolf': { hitpoints: 160, attackDamage: 40, speed: 65, fearFactor: 65, price: 2000, spriteWidth: 960, spriteHeight: 512, size: 3 },
    'Work Horse': { hitpoints: 140, attackDamage: 20, speed: 60, fearFactor: 35, price: 1000, spriteWidth: 1440, spriteHeight: 768, size: 5 },
    'Yak': { hitpoints: 250, attackDamage: 35, speed: 40, fearFactor: 50, price: 1200, spriteWidth: 1440, spriteHeight: 768, size: 5 },
    'Zebra': { hitpoints: 150, attackDamage: 15, speed: 75, fearFactor: 30, price: 1000, spriteWidth: 1260, spriteHeight: 672, size: 4 }
};

// Add sound mapping configuration
export const AnimalSoundMap = {
    // Bears
    'Black Bear': ['bear_1', 'bear_2', 'bear_3'],
    'Grizzly': ['bear_1', 'bear_2', 'bear_3'],
    'Polar Bear': ['bear_1', 'bear_2', 'bear_3'],
    
    // Generic beasts
    'Alpacha': ['beast_1', 'beast_2', 'beast_3', 'beast_4'],
    'Antelope': ['beast_1', 'beast_2', 'beast_3', 'beast_4'],
    'Bison': ['beast_1', 'beast_2', 'beast_3', 'beast_4'],
    'Water Buffalo': ['beast_1', 'beast_2', 'beast_3', 'beast_4'],
    'Yak': ['beast_1', 'beast_2', 'beast_3', 'beast_4'],
    'Oryx': ['beast_1', 'beast_2', 'beast_3', 'beast_4'],
    'Stag': ['beast_1', 'beast_2', 'beast_3', 'beast_4'],
    
    // Boar
    'Boar': ['boar_1', 'boar_2', 'boar_3'],
    
    // Cats
    'Cat Black': ['cat_1', 'cat_2', 'cat_3', 'cat_4', 'cat_5'],
    'Cat Large': ['large_cat_1'],
    'Cat Orange': ['cat_1', 'cat_2', 'cat_3', 'cat_4', 'cat_5'],
    'Cat White': ['cat_1', 'cat_2', 'cat_3', 'cat_4', 'cat_5'],
    
    // Chicken
    'Chicken': ['chicken_1', 'chicken_2', 'chicken_3'],
    
    // Cows
    'Cow': ['cow_1', 'cow_2', 'cow_3'],
    'Cow Brown': ['cow_1', 'cow_2', 'cow_3'],
    
    // Deer
    'Deer': ['deer_1', 'deer_2'],
    
    // Dogs
    'Golden Retriever': ['dog_1', 'dog_2', 'dog_3', 'dog_4', 'dog_5', 'dog_6'],
    'Husky': ['dog_1', 'dog_2', 'dog_3', 'dog_4', 'dog_5', 'dog_6'],
    'Shepherd Dog': ['dog_1', 'dog_2', 'dog_3', 'dog_4', 'dog_5', 'dog_6'],
    
    // Donkeys
    'Donkey': ['donkey_1', 'donkey_2', 'donkey_3', 'donkey_4'],
    
    // Elephants
    'Elephant': ['elephant_1', 'elephant_2', 'elephant_3'],
    'Elephant Female': ['elephant_1', 'elephant_2', 'elephant_3'],
    'Mammoth': ['elephant_1', 'elephant_2', 'elephant_3'],
    
    // Goats/Rams
    'Ram': ['goat_1', 'goat_2', 'goat_3', 'goat_4', 'goat_5'],
    'Sheep': ['sheep_1', 'sheep_2'],
    
    // Horses
    'Arabian Horse': ['horse_1', 'horse_2', 'horse_3', 'horse_4', 'horse_5'],
    'Brown Horse': ['horse_1', 'horse_2', 'horse_3', 'horse_4', 'horse_5'],
    'Work Horse': ['horse_1', 'horse_2', 'horse_3', 'horse_4', 'horse_5'],
    
    // Lions
    'Lion': ['lion_1', 'lion_2', 'lion_3'],
    'Lioness': ['lion_1', 'lion_2', 'lion_3'],
    
    // Reptiles
    'Crocodile': ['lizzard_1', 'lizzard_2', 'lizzard_3'],
    'Tortoise': ['lizzard_1', 'lizzard_2', 'lizzard_3'],
    'Turtle': ['lizzard_1', 'lizzard_2', 'lizzard_3'],
    
    // Monkeys
    'Monkey': ['monkey_1', 'monkey_2', 'monkey_3', 'monkey_4', 'monkey_5'],
    'Chimp': ['monkey_1', 'monkey_2', 'monkey_3', 'monkey_4', 'monkey_5'],
    
    // Panthers
    'Panther': ['panther_1', 'panther_2'],
    
    // Penguins
    'Penguin': ['penguin_1', 'penguin_2', 'penguin_3', 'penguin_4'],
    
    // Pigs
    'Pig': ['pig_5', 'pig_6'],
    
    // Rhinos
    'Rhino': ['rhino_1', 'rhino_2'],
    'Rhino Female': ['rhino_1', 'rhino_2'],
    
    // Tigers
    'Tiger': ['tiger_1', 'tiger_2', 'tiger_3', 'tiger_4', 'tiger_5', 'tiger_6'],
    'White Tiger': ['tiger_1', 'tiger_2', 'tiger_3', 'tiger_4', 'tiger_5', 'tiger_6'],
    
    // Wolves
    'Wolf': ['wolf_1', 'wolf_2'],
    'ELITE Wolf': ['wolf_1', 'wolf_2']
};

// Add sound helper function
export function getRandomAnimalSound(animalName) {
    const sounds = AnimalSoundMap[animalName];
    if (!sounds || sounds.length === 0) return null;
    return sounds[Math.floor(Math.random() * sounds.length)];
}

// Impact sound mapping based on animal size
export const ImpactSoundMap = {
    // Size 1-2: Small animals
    small: ['small1', 'small2'],
    // Size 3-4: Medium animals
    medium: ['medium1', 'medium2'],
    // Size 5+: Large animals
    large: ['large1', 'large2']
};

// Helper function to get impact sound based on animal size
export function getImpactSoundType(size) {
    if (size <= 2) return 'small';
    if (size <= 4) return 'medium';
    return 'large';
}

// Helper function to get random impact sound of specific type
export function getRandomImpactSound(type) {
    const sounds = ImpactSoundMap[type];
    return sounds[Math.floor(Math.random() * sounds.length)];
} 