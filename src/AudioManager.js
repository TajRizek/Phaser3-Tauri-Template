class AudioManager {
    constructor() {
        this.isMusicMuted = false;
        this.isSoundMuted = false;
        this.currentMusic = null;
        this.currentMusicKey = null;
        this.musicVolume = 0.5;
        this.soundVolume = 0.5;
    }

    playMusic(scene, key, volume = this.musicVolume) {
        if (this.currentMusicKey === key && this.currentMusic && this.currentMusic.isPlaying) {
            return;
        }

        if (this.currentMusic) {
            this.currentMusic.stop();
            this.currentMusic = null;
        }

        this.currentMusic = scene.sound.add(key, {
            loop: true,
            volume: this.isMusicMuted ? 0 : volume
        });
        
        this.currentMusicKey = key;
        this.currentMusic.play();
        
        if (this.isMusicMuted) {
            this.currentMusic.setVolume(0);
        }
    }

    playSound(scene, key, config = {}) {
        if (this.isSoundMuted) return null;
        
        if (!config.volume) {
            config.volume = this.soundVolume;
        }
        
        return scene.sound.play(key, config);
    }

    toggleMusic() {
        this.isMusicMuted = !this.isMusicMuted;
        if (this.currentMusic) {
            this.currentMusic.setVolume(this.isMusicMuted ? 0 : this.musicVolume);
        }
        return this.isMusicMuted;
    }

    toggleSound() {
        this.isSoundMuted = !this.isSoundMuted;
        return this.isSoundMuted;
    }

    setMusicVolume(volume) {
        this.musicVolume = volume;
        if (this.currentMusic && !this.isMusicMuted) {
            this.currentMusic.setVolume(volume);
        }
    }

    setSoundVolume(volume) {
        this.soundVolume = volume;
    }

    playOneShot(scene, key, config = {}) {
        if (this.isSoundMuted) return null;
        
        if (!config.volume) {
            config.volume = this.soundVolume;
        }
        
        return scene.sound.play(key, config);
    }

    playButtonClick(scene) {
        if (this.isSoundMuted) return null;
        
        return scene.sound.play('click', {
            volume: this.soundVolume
        });
    }
}

export const audioManager = new AudioManager(); 