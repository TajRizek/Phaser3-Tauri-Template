import { loadFonts } from './fonts';

export default class BootScene extends Phaser.Scene {
    constructor() {
        super({ key: 'BootScene' });
    }

    preload() {
        // Add load error handling
        this.load.on('loaderror', (fileObj) => {
            //console.error('Load error:', fileObj.src);
        });

        // Add load success handling
        this.load.on('filecomplete-image-background', () => {
            //console.log('Background loaded successfully');
        });

        // Load background with absolute path
        this.load.image('background', '/assets/background/bg2.png');
        this.load.image('banner', '/assets/banner/banner1.png');
        
        // Create temporary loading text with system font
        const tempLoadingText = this.add.text(
            this.cameras.main.centerX, 
            this.cameras.main.centerY + 100,
            'Loading...', 
            { 
                fontSize: '32px', 
                fill: '#fff' 
            }
        ).setOrigin(0.5);

        // Load the custom font
        loadFonts().then(() => {
            // Replace temporary text with custom font text
            tempLoadingText.destroy();
            
            const loadingText = this.add.text(
                this.cameras.main.centerX, 
                this.cameras.main.centerY + 100,
                'Loading...', 
                { 
                    fontFamily: 'ThaleahFat',
                    fontSize: '32px', 
                    fill: '#fff' 
                }
            ).setOrigin(0.5);
        });

        // Check if the file exists before trying to load it
        const spritesheetPath = 'assets/background/RA_Jungle_Animations.png';
        
        // Log the full URL
        //console.log('Attempting to load spritesheet from:', window.location.origin + '/' + spritesheetPath);
        
        // Create an Image object to test if the image loads
        const testImage = new Image();
        //testImage.onload = () => {
            //console.log('Image pre-test: Jungle animations image exists and has dimensions:', {
            //    width: testImage.width,
            //    height: testImage.height
            //});
        //};
        //testImage.onerror = () => {
            //console.error('Image pre-test: Jungle animations image failed to load at path:', spritesheetPath);
        //};
        //testImage.src = spritesheetPath;
        
        // Load the jungle animations spritesheet with correct dimensions
        this.load.spritesheet('jungle_animations', 'assets/background/RA_Jungle_Animations.png', {
            frameWidth: 48,  // Updated frame width
            frameHeight: 48  // Updated frame height
        });
        
        // Add event for when jungle_animations is loaded
        this.load.on('filecomplete-spritesheet-jungle_animations', () => {
            //console.log('Jungle animations spritesheet loaded successfully');
            
            // Immediately verify the texture once loaded
            const texture = this.textures.get('jungle_animations');
            if (texture) {
                //console.log('Loaded texture details:', {
                //    key: 'jungle_animations',
                //    frameTotal: texture.frameTotal,
                //    firstFrame: texture.get(0),
                //    frames: Array.from({length: 10}, (_, i) => texture.get(i) ? 'exists' : 'missing')
                //});
            }
        });

        // Load stone sprites
        for (let i = 1; i <= 17; i++) {
            this.load.image(`stone${i}`, `assets/background/stones/stone${i}.png`);
        }
    }

    create() {
        // Add this debug check
        if (this.textures.exists('jungle_animations')) {
            const texture = this.textures.get('jungle_animations');
            //console.log('Jungle animations texture loaded:', {
            //    frameTotal: texture.frameTotal,
            //    width: texture.source[0].width,
            //    height: texture.source[0].height
            //});
        } else {
            //console.error('jungle_animations texture failed to load!');
        }
        // Debug: Log available textures
        //console.log('Available textures:', this.textures.list);
        
        // Debug: Check background texture specifically
        const bgTexture = this.textures.get('background');
        //console.log('Background texture:', bgTexture);
        
        if (bgTexture && bgTexture.source[0]) {
            //console.log('Background dimensions:', {
            //    width: bgTexture.source[0].width,
            //    height: bgTexture.source[0].height
            //});
        }

        // Create all game animations in the BootScene where assets are guaranteed to be loaded
        this.createGameAnimations();

        // Start MenuScene
        this.scene.start('MenuScene');
    }

    createGameAnimations() {
        //console.log('Creating flower animations with correct frame size');
        
        if (this.textures.exists('jungle_animations')) {
            // Debug: Log the texture information
            const texture = this.textures.get('jungle_animations');
            //console.log('Jungle animations texture:', {
            //    frameTotal: texture.frameTotal,
            //    width: texture.source[0].width,
            //    height: texture.source[0].height
            //});

            // Define all flower animations with their frame ranges
            const flowerAnimations = [
                { key: 'flower_animation', frames: [0, 1, 2, 3] },
                { key: 'flower_animation2', frames: [5, 6, 7, 8] },
                { key: 'flower_animation3', frames: [10, 11, 12, 13] },
                { key: 'flower_animation4', frames: [15, 16, 17, 18] },
                { key: 'flower_animation5', frames: [20, 21, 22, 23] },
                { key: 'flower_animation6', frames: [25, 26, 27, 28] },
                { key: 'flower_animation7', frames: [30, 31, 32, 33] },
                { key: 'flower_animation8', frames: [35, 36, 37, 38] },
                { key: 'flower_animation9', frames: [40, 41, 42, 43] },
                { key: 'flower_animation10', frames: [45, 46, 47, 48] },
                { key: 'flower_animation11', frames: [50, 51, 52, 53] },
                { key: 'flower_animation12', frames: [55, 56, 57, 58] },
                { key: 'flower_animation13', frames: [80, 81, 82, 83] },
                { key: 'flower_animation14', frames: [85, 86, 87, 88] },
                { key: 'flower_animation15', frames: [90, 91, 92, 93] },
                { key: 'flower_animation16', frames: [95, 96, 97, 98] },
                { key: 'flower_animation17', frames: [100, 101, 102, 103] },
                { key: 'flower_animation18', frames: [105, 106, 107, 108] },
                { key: 'flower_animation19', frames: [110, 111, 112, 113] },
                { key: 'flower_animation20', frames: [115, 116, 117, 118] },
                { key: 'flower_animation21', frames: [120, 121, 122, 123] },
                { key: 'flower_animation22', frames: [125, 126, 127, 128] },
                { key: 'flower_animation23', frames: [130, 131, 132, 133] },
                { key: 'flower_animation24', frames: [135, 136, 137, 138] },
                { key: 'flower_animation25', frames: [140, 141, 142, 143] },
                { key: 'flower_animation26', frames: [145, 146, 147, 148] },
                { key: 'flower_animation27', frames: [150, 151, 152, 153] },
                { key: 'flower_animation28', frames: [155, 156, 157, 158] },
                { key: 'flower_animation29', frames: [160, 161, 162, 163] },
                { key: 'flower_animation30', frames: [165, 166, 167, 168] },
                { key: 'flower_animation31', frames: [170, 171, 172, 173] },
                { key: 'flower_animation32', frames: [175, 176, 177, 178] },
                { key: 'flower_animation33', frames: [190, 191, 192, 193] },
                { key: 'flower_animation34', frames: [195, 196, 197, 198] },
                { key: 'flower_animation35', frames: [220, 221, 222, 223] },
                { key: 'flower_animation36', frames: [225, 226, 227, 228] },
                { key: 'flower_animation37', frames: [230, 231, 232, 233] },
                { key: 'flower_animation38', frames: [235, 236, 237, 238] },
                { key: 'flower_animation39', frames: [240, 241, 242, 243] },
                { key: 'flower_animation40', frames: [245, 246, 247, 248] },
                { key: 'flower_animation41', frames: [250, 251, 252, 253] },
                { key: 'flower_animation42', frames: [255, 256, 257, 258] },
                { key: 'flower_animation43', frames: [260, 261, 262, 263] },
                { key: 'flower_animation44', frames: [265, 266, 267, 268] },
                { key: 'flower_animation45', frames: [270, 271, 272, 273] },
                { key: 'flower_animation46', frames: [275, 276, 277, 278] }
            ];

            // Create all animations with explicit frame numbers
            flowerAnimations.forEach(({ key, frames }) => {
                // Check if frames exist in texture
                const validFrames = frames.filter(frame => texture.has(frame));
                if (validFrames.length === frames.length) {
                    this.anims.create({
                        key: key,
                        frames: this.anims.generateFrameNumbers('jungle_animations', { 
                            frames: frames 
                        }),
                        frameRate: 2.5,
                        repeat: -1
                    });
                    //console.log(`Created animation ${key} with frames:`, frames);
                } else {
                    //console.error(`Cannot create animation ${key}, missing frames:`, 
                    //    frames.filter(f => !texture.has(f)));
                }
            });
            
            // Verify animations were created
            const createdAnimations = Object.keys(this.anims.anims.entries);
            //console.log('Created animations:', createdAnimations);

            // Test one animation
            if (createdAnimations.length > 0) {
                const testAnim = this.anims.get(createdAnimations[0]);
                //console.log('Test animation details:', {
                //    key: testAnim.key,
                //    frameCount: testAnim.frames.length,
                //    frames: testAnim.frames.map(f => f.frame.name)
                //});
            }
        } else {
            //console.error('Cannot create animations: jungle_animations texture not loaded');
        }
    }
} 