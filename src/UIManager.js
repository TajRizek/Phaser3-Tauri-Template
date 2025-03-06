class UIManager {
    constructor() {
        // UI state
        this.isMusicMuted = false;
        this.isSoundMuted = false;
        this.isBloodEnabled = true;
        this.gameSpeed = 1;
    }

    toggleMusic() {
        this.isMusicMuted = !this.isMusicMuted;
        return this.isMusicMuted;
    }

    toggleSound() {
        this.isSoundMuted = !this.isSoundMuted;
        return this.isSoundMuted;
    }

    toggleBlood() {
        this.isBloodEnabled = !this.isBloodEnabled;
        return this.isBloodEnabled;
    }

    toggleGameSpeed() {
        this.gameSpeed = this.gameSpeed === 1 ? 5 : 1;
        return this.gameSpeed;
    }

    resetGameSpeed() {
        this.gameSpeed = 1;
        return this.gameSpeed;
    }
}

// Create singleton instance
export const uiManager = new UIManager(); 