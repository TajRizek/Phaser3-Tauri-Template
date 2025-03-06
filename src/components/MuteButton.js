import { audioManager } from '../AudioManager';

export function createMuteButton(scene) {
    const button = scene.add.image(
        scene.cameras.main.width - 60,
        60,
        'btn_icon_music'
    )
    .setScale(0.5)
    .setInteractive({ useHandCursor: true })
    .setDepth(1000); // Ensure it's always on top

    // Set initial state
    button.setTint(audioManager.isMusicMuted ? 0x666666 : 0xffffff);

    button.on('pointerdown', () => {
        audioManager.toggleMusic();
        button.setTint(audioManager.isMusicMuted ? 0x666666 : 0xffffff);
    });

    button.on('pointerover', () => {
        button.setScale(0.55);
    });

    button.on('pointerout', () => {
        button.setScale(0.5);
    });

    return button;
} 