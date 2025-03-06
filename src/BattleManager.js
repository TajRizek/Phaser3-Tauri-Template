export class BattleManager {
    constructor(scene) {
        this.scene = scene;
        this.playerAnimals = new Set();
        this.opponentAnimals = new Set();
        this.isGameOver = false;

        // Modify physics group for all animals
        this.physicsGroup = scene.physics.add.group({
            collideWorldBounds: true,
            bounceX: 0,        // Remove bounce
            bounceY: 0,
            dragX: 500,        // Increase drag
            dragY: 500
        });

        // Remove the collider and only use overlap
        // scene.physics.add.collider(this.physicsGroup, this.physicsGroup, null, null, this);
    }

    addAnimal(animal, team) {
        if (team === 'player') {
            this.playerAnimals.add(animal);
        } else {
            this.opponentAnimals.add(animal);
        }
    }

    removeAnimal(animal, team) {
        if (team === 'player') {
            this.playerAnimals.delete(animal);
        } else {
            this.opponentAnimals.delete(animal);
        }
    }

    getEnemyAnimals(team) {
        return Array.from(team === 'player' ? this.opponentAnimals : this.playerAnimals)
            .filter(animal => !animal.isDead);
    }

    checkTeamFear(team) {
        const allies = team === 'player' ? this.playerAnimals : this.opponentAnimals;
        
        allies.forEach(animal => {
            if (!animal.isDead && !animal.isAfraid && Math.random() < 0.3) {
                animal.becomeAfraid();
            }
        });
    }

    checkBattleEnd() {
        const alivePlayers = Array.from(this.playerAnimals).filter(a => !a.isDead).length;
        const aliveOpponents = Array.from(this.opponentAnimals).filter(a => !a.isDead).length;

        if (alivePlayers === 0 || aliveOpponents === 0) {
            this.isGameOver = true;
            this.scene.time.delayedCall(2000, () => {
                this.scene.scene.start('PregameScene');
            });
        }
    }

    update() {
        if (this.isGameOver) return;

        this.playerAnimals.forEach(animal => animal.update());
        this.opponentAnimals.forEach(animal => animal.update());
    }

    addToPhysicsGroup(animal) {
        this.physicsGroup.add(animal);
    }

    clearAllAnimals() {
        // Destroy all animal sprites and clear arrays
        [...this.playerAnimals, ...this.opponentAnimals].forEach(animal => {
            if (animal && animal.sprite) {
                animal.sprite.destroy();
            }
        });
        
        this.playerAnimals.clear();
        this.opponentAnimals.clear();
    }

    getTeamAnimals(team) {
        return Array.from(team === 'player' ? this.playerAnimals : this.opponentAnimals)
            .filter(animal => !animal.isDead);
    }
} 