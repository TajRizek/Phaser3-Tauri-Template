import { AnimalStats, getRandomAnimalSound, getImpactSoundType, getRandomImpactSound } from './Animal';
import { uiManager } from './UIManager';
import { audioManager } from './AudioManager';

const GLOBAL_SPEED_MULTIPLIER = 4;
const BASE_ATTACK_RANGE = 80;
const MAX_ATTACK_RANGE = 200;  // Increased from 160 to 200 to allow more range when blocked
const PUSH_DISTANCE = 4;  // Reduced from 8 to 4
const BASE_ATTACK_DELAY = 100;
const DEBUG = true;  // Toggle debug logging
const MOVEMENT_COMMITMENT_TIME = 500; // Time to stick with a movement decision
const DIRECTION_CHANGE_THRESHOLD = 0.8; // Radians (about 45 degrees) - only change direction if angle change is significant
const APPROACH_ANGLE_TOLERANCE = Math.PI / 3; // 60 degrees - more forgiving angle check

const INITIAL_DIRECTIONS = {
    'opponent': 0,     // East facing for opponents
    'player': 4  // West facing for players
};

// Direction constants for sprite frames
const DIRECTIONS = {
    EAST: 0,      // frames 0-14
    SOUTHEAST: 1, // frames 15-29
    SOUTH: 2,     // frames 30-44
    SOUTHWEST: 3, // frames 45-59
    WEST: 4,      // frames 60-74
    NORTHWEST: 5, // frames 75-89
    NORTH: 6,     // frames 90-104
    NORTHEAST: 7  // frames 105-119
};

export class BattleAnimal extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y, animalName, team) {
        const key = animalName.replace(/ /g, '_').toLowerCase();
        super(scene, x, y, `${key}_idle`);
        
        this.animalName = animalName;
        this.animalKey = key;
        this.team = team;
        this.stats = { ...AnimalStats[animalName] };
        
        // Adjust scale to 4 (from 5)
        this.setScale(4);
        
        // Enable physics with reduced collision impact
        scene.physics.add.existing(this);
        this.body.setCollideWorldBounds(true);
        this.body.setBounce(0);  // Remove bounce completely
        this.body.setDrag(500);  // Increase drag to reduce sliding
        this.body.setMass(0.1);  // Keep mass low
        
        // Further reduce hitbox size
        const baseBodySize = 1;
        const sizeFactor = Math.max(0.3, Math.min(1.0, this.stats.size / 5)); // More aggressive size reduction
        const scaledBodySize = baseBodySize * sizeFactor;
        this.body.setCircle(scaledBodySize);
        
        // Adjust hitbox offset
        const offsetX = this.width / 2 - scaledBodySize;
        const offsetY = this.height / 2 - scaledBodySize;
        this.body.setOffset(offsetX, offsetY);

        // Modify overlap handling to reduce pushing effect
        scene.physics.add.overlap(this, scene.battleManager.physicsGroup, (self, other) => {
            if (self.team !== other.team) {
                // Only apply pushing if neither animal is attacking
                if (!self.isAttacking && !other.isAttacking) {
                    const sizeFactor = Math.max(0.2, Math.min(0.6, (self.stats.size + other.stats.size) / 12));
                    const minDistance = PUSH_DISTANCE * sizeFactor;
                    const currentDistance = Phaser.Math.Distance.Between(self.x, self.y, other.x, other.y);
                    
                    if (currentDistance < minDistance * 0.5) {
                        const angle = Phaser.Math.Angle.Between(other.x, other.y, self.x, self.y);
                        const pushDistance = (minDistance - currentDistance) / 64; // Reduced from 32 to 64
                        
                        // Apply reduced push force
                        self.x += Math.cos(angle) * pushDistance * 0.5;
                        self.y += Math.sin(angle) * pushDistance * 0.5;
                        other.x -= Math.cos(angle) * pushDistance * 0.5;
                        other.y -= Math.sin(angle) * pushDistance * 0.5;
                    }
                }
            } else {
                // For allies, use even gentler pushing
                const pushFactor = 0.3;
                const minDistance = PUSH_DISTANCE * 0.5;
                const currentDistance = Phaser.Math.Distance.Between(self.x, self.y, other.x, other.y);
                
                if (currentDistance < minDistance) {
                    const angle = Phaser.Math.Angle.Between(other.x, other.y, self.x, self.y);
                    const pushDistance = (minDistance - currentDistance) / 128;
                    
                    self.x += Math.cos(angle) * pushDistance * pushFactor;
                    self.y += Math.sin(angle) * pushDistance * pushFactor;
                    other.x -= Math.cos(angle) * pushDistance * pushFactor;
                    other.y -= Math.sin(angle) * pushDistance * pushFactor;
                }
            }
        });

        // Initialize properties
        this.currentHitpoints = this.stats.hitpoints;
        this.currentTarget = null;
        this.isAfraid = false;
        this.fearImmunityTime = 0;
        this.isDead = false;
        this.fearTimer = null;
        this.hasPerformedTaunt = false;
        this.attackAnims = [];
        this.lastTakeDamageTime = 0;

        scene.add.existing(this);
        
        // Create animations after initialization
        this.createAnimations();
        
        // Start idle animation with correct direction
        const initialAngle = team === 'player' ? Math.PI : 0; // West for player, East for opponent
        this.playDirectionalAnimation('idle', initialAngle);
        
        //if (DEBUG) console.log(`Created ${animalName} for ${team} team at (${x}, ${y})`);
        
        // Add to physics group in battle manager
        scene.battleManager.addToPhysicsGroup(this);
        
        // Set initial velocity to 0
        this.body.setVelocity(0, 0);

        // Add randomized animation properties
        this.animationOffset = Math.random() * 1000;  // Random offset for animation start
        this.animationSpeed = 0.9 + Math.random() * 0.2;  // Random speed multiplier between 0.9 and 1.1

        // Add properties for spacing behavior
        this.preferredDistance = 40; // Minimum distance from other allies
        this.personalSpace = new Phaser.Math.Vector2();
        
        // Add randomized animation offset
        this.animationTimeOffset = Math.random() * 1000;
        this.animationSpeedVariation = 0.9 + Math.random() * 0.2; // 0.9 to 1.1

        // Create blood effect animations if they don't exist
        this.createBloodAnimations();

        // Modify sound tracking with more restrictive delays
        this.lastSoundTime = 0;
        this.soundDelay = 100;

        // Modify impact sound tracking for more sparse sounds
        this.lastImpactTime = 0;
        this.impactDelay = 1000; // Increased to 1 second between impact sounds
        this.impactType = getImpactSoundType(this.stats.size);
        
        // Add global footstep management
        this.lastFootstepTime = 0;
        this.footstepDelay = 2000; // 2 seconds between footstep sound sets
        this.maxSimultaneousFootsteps = 3; // Maximum number of footstep sounds playing at once
        this.currentFootstepCount = 0;

        // Add new state tracking
        this.failedAttackAttempts = 0;
        this.lastPositionChangeTime = 0;
        this.isWaitingForOpening = false;
        this.waitStartTime = 0;
        this.positionAttempts = 0;
        
        // Minimum time between position changes to prevent flickering
        this.POSITION_CHANGE_DELAY = 300; // Reduce from 500ms to 300ms
        this.MAX_ATTACK_ATTEMPTS = 5;     // Increase from 3 to 5
        this.MAX_POSITION_ATTEMPTS = 8;   // Increase from 5 to 8

        // Add movement commitment tracking
        this.currentMoveAngle = null;
        this.lastMovementChoice = 0;
        this.committedToMovement = false;
    }

    createAnimations() {
        const animations = ['idle', 'attack1', 'attack2', 'attack3', 'run', 'takeDamage', 'die', 'taunt'];
        
        animations.forEach(anim => {
            const spriteKey = `${this.animalKey}_${anim.toLowerCase()}`;
            
            // Check if spritesheet exists
            if (this.scene.textures.exists(spriteKey)) {
                // Special case for chicken die animation
                if (this.animalName === 'Chicken' && anim === 'die') {
                    const animKey = `${spriteKey}_${INITIAL_DIRECTIONS[this.team]}`;
                    if (!this.scene.anims.exists(animKey)) {
                        this.scene.anims.create({
                            key: animKey,
                            // Use custom frames sequence: 0-6, then jump to 15
                            frames: this.scene.anims.generateFrameNumbers(spriteKey, {
                                frames: [0, 1, 2, 3, 4, 15]
                            }),
                            frameRate: 10,
                            repeat: 0
                        });
                    }
                    // Create animations for other directions too
                    for (let dir = 0; dir < 8; dir++) {
                        if (dir !== INITIAL_DIRECTIONS[this.team]) {
                            const dirAnimKey = `${spriteKey}_${dir}`;
                            if (!this.scene.anims.exists(dirAnimKey)) {
                                this.scene.anims.create({
                                    key: dirAnimKey,
                                    frames: this.scene.anims.generateFrameNumbers(spriteKey, {
                                        frames: [
                                            dir * 15 + 0, dir * 15 + 1, dir * 15 + 2, 
                                            dir * 15 + 3, dir * 15 + 4, dir * 15 + 5, 
                                            dir * 15 + 6, dir * 15 + 15
                                        ]
                                    }),
                                    frameRate: 10,
                                    repeat: 0
                                });
                            }
                        }
                    }
                } else {
                    // Create animations for all 8 directions (original code)
                    for (let dir = 0; dir < 8; dir++) {
                        const animKey = `${spriteKey}_${dir}`;
                        if (!this.scene.anims.exists(animKey)) {
                            this.scene.anims.create({
                                key: animKey,
                                frames: this.scene.anims.generateFrameNumbers(spriteKey, {
                                    start: dir * 15,
                                    end: (dir * 15) + 14
                                }),
                                frameRate: 10,
                                repeat: anim === 'idle' ? -1 : 0
                            });
                        }
                    }
                }

                // Add to available attack animations
                if (anim.startsWith('attack')) {
                    this.attackAnims.push(anim);
                }
            }
        });

        // Ensure at least one attack animation exists
        if (this.attackAnims.length === 0) {
            this.attackAnims.push('attack1');
        }
    }

    createBloodAnimations() {
        // Create blood animations if they don't exist yet
        for (let i = 1; i <= 4; i++) {
            const key = `blood${i}`;
            if (!this.scene.anims.exists(key)) {
                this.scene.anims.create({
                    key: key,
                    frames: this.scene.anims.generateFrameNumbers(key, { start: 0, end: 7 }),
                    frameRate: 15,
                    repeat: 0
                });
            }
        }
    }

    showBloodEffect() {
        // Check if blood effects are enabled
        if (!uiManager.isBloodEnabled) return;
        
        // Randomly choose one of the four blood animations
        const bloodIndex = Phaser.Math.Between(1, 4);
        const bloodKey = `blood${bloodIndex}`;

        // Create a sprite for the blood effect
        const blood = this.scene.add.sprite(this.x, this.y, bloodKey)
            .setDepth(this.depth + 1)  // Place blood effect above the animal
            .setScale(3);  // Scale up the blood effect for better visibility

        // Play the blood animation
        blood.play(bloodKey);

        // Remove the blood sprite when animation completes
        blood.on('animationcomplete', () => {
            blood.destroy();
        });
    }

    update() {
        if (this.isDead) {
            this.body.setVelocity(0, 0);
            return;
        }

        // Add depth sorting based on Y position
        this.setDepth(this.y);

        const speed = this.body.velocity.length();
        
        // Only fix idle animation if we're truly stopped
        if (speed < 5 && !this.isAttacking && !this.isAfraid && !this.anims.isPlaying) {
            const idleAngle = this.team === 'player' ? Math.PI : 0;
            this.playDirectionalAnimation('idle', idleAngle);
        }

        if (this.isAfraid) {
            this.committedToMovement = false; // Reset commitment when becoming afraid
            this.performRandomMovement();
            return;
        }

        // Reset commitment if target changes
        if (!this.currentTarget || this.currentTarget.isDead) {
            this.committedToMovement = false;
        }

        // Make waiting state shorter and more likely to end
        if (this.isWaitingForOpening) {
            if (this.scene.time.now - this.waitStartTime > 500) { // Reduced from 1000 to 500ms
                // After waiting, reset states and try again
                this.isWaitingForOpening = false;
                this.failedAttackAttempts = 0;
                this.positionAttempts = 0;
                this.findNewTarget(); // Actively try to find new target after waiting
            } else {
                // While waiting, still check if situation has changed
                const enemies = this.scene.getEnemyAnimals(this.team);
                if (enemies.length > 0) {
                    const accessibleEnemy = enemies.find(enemy => {
                        const distance = Phaser.Math.Distance.Between(this.x, this.y, enemy.x, enemy.y);
                        return distance <= MAX_ATTACK_RANGE;
                    });
                    
                    if (accessibleEnemy) {
                        // If we find an accessible enemy, break waiting state
                        this.isWaitingForOpening = false;
                        this.currentTarget = accessibleEnemy;
                        return;
                    }
                }
                
                // ... rest of waiting animation code ...
            }
        }

        // Only check for new target periodically or if current target is dead
        if (!this.currentTarget || this.currentTarget.isDead || 
            (this.failedAttackAttempts >= this.MAX_ATTACK_ATTEMPTS && 
             this.scene.time.now - this.lastPositionChangeTime > this.POSITION_CHANGE_DELAY)) {
            this.findNewTarget();
            this.failedAttackAttempts = 0;
            this.positionAttempts = 0;
        }

        if (this.currentTarget) {
            const distance = Phaser.Math.Distance.Between(
                this.x, this.y,
                this.currentTarget.x, this.currentTarget.y
            );

            // Try to attack if in range
            if (distance <= BASE_ATTACK_RANGE) {
                const attackSuccess = this.attack();
                if (!attackSuccess) {
                    this.failedAttackAttempts++;
                    if (this.failedAttackAttempts >= this.MAX_ATTACK_ATTEMPTS) {
                        // If we've failed too many times, force finding a new target
                        this.currentTarget = null;
                    }
                }
            } else {
                this.moveTowardsTarget();
            }
        }
    }

    findNewTarget() {
        const enemies = this.scene.getEnemyAnimals(this.team);
        if (enemies.length === 0) return;

        // Simply target the closest enemy - no waiting
        this.currentTarget = this.findClosestEnemy(enemies);
        this.isWaitingForOpening = false;
        this.positionAttempts = 0;
    }

    // Add new helper method to check for clear approach angles
    findClearApproachAngle(target, allies) {
        // Check 8 different approach angles
        for (let angle = 0; angle < Math.PI * 2; angle += Math.PI / 4) {
            let isAngleClear = true;
            const approachDistance = BASE_ATTACK_RANGE * 1.5;
            
            // Calculate potential approach position
            const approachX = target.x + Math.cos(angle) * approachDistance;
            const approachY = target.y + Math.sin(angle) * approachDistance;
            
            // Check if any allies are blocking this approach angle
            for (const ally of allies) {
                if (ally === this || ally.isDead) continue;
                
                const distanceToApproachPoint = Phaser.Math.Distance.Between(
                    ally.x, ally.y,
                    approachX, approachY
                );
                
                if (distanceToApproachPoint < BASE_ATTACK_RANGE * 0.7) {
                    isAngleClear = false;
                    break;
                }
            }
            
            if (isAngleClear) return true;
        }
        
        return false;
    }

    isAllyBlockingPath(ally, target) {
        const angleToTarget = Phaser.Math.Angle.Between(
            this.x, this.y,
            target.x, target.y
        );
        const angleToAlly = Phaser.Math.Angle.Between(
            this.x, this.y,
            ally.x, ally.y
        );
        
        const angleDiff = Math.abs(Phaser.Math.Angle.Wrap(angleToAlly - angleToTarget));
        const distance = Phaser.Math.Distance.Between(this.x, this.y, ally.x, ally.y);
        
        return angleDiff < 0.5 && distance < BASE_ATTACK_RANGE;
    }

    findClosestEnemy(enemies) {
        let closest = null;
        let closestDistance = Infinity;
        
        enemies.forEach(enemy => {
            const distance = Phaser.Math.Distance.Between(this.x, this.y, enemy.x, enemy.y);
            if (distance < closestDistance) {
                closestDistance = distance;
                closest = enemy;
            }
        });
        
        return closest;
    }

    moveTowardsTarget() {
        if (!this.currentTarget) return;

        const currentTime = this.scene.time.now;
        const targetDistance = Phaser.Math.Distance.Between(
            this.x, this.y,
            this.currentTarget.x, this.currentTarget.y
        );

        // Calculate base movement angle towards target
        const newMoveAngle = Phaser.Math.Angle.Between(
            this.x, this.y,
            this.currentTarget.x, this.currentTarget.y
        );

        // Check if we're stuck
        const isStuck = this.body.velocity.length() < 5;
        const timeSinceLastMove = currentTime - this.lastMovementChoice;

        // Force recalculation of path if stuck for too long
        if (isStuck && timeSinceLastMove > 300) {
            this.committedToMovement = false;
            this.positionAttempts++;
        } else if (!isStuck) {
            // Reset position attempts if we're moving
            this.positionAttempts = 0;
        }

        // Recalculate path if:
        // 1. Not committed to a movement, OR
        // 2. Significant time has passed, OR
        // 3. Target has moved significantly, OR
        // 4. We're stuck
        if (!this.committedToMovement || 
            timeSinceLastMove > MOVEMENT_COMMITMENT_TIME ||
            Math.abs(Phaser.Math.Angle.Wrap(newMoveAngle - (this.currentMoveAngle || 0))) > DIRECTION_CHANGE_THRESHOLD ||
            isStuck) {

            // Calculate spacing and surrounding behavior
            this.personalSpace.reset();
            const nearbyAllies = this.scene.battleManager.getTeamAnimals(this.team);
            
            // Reduce personal space if we're stuck
            const personalSpaceRadius = this.preferredDistance * (isStuck ? 0.5 : 1.5);
            
            // Calculate repulsion from nearby allies
            nearbyAllies.forEach(ally => {
                if (ally === this || ally.isDead) return;
                
                const distance = Phaser.Math.Distance.Between(this.x, this.y, ally.x, ally.y);
                if (distance < personalSpaceRadius) {
                    const angle = Phaser.Math.Angle.Between(ally.x, ally.y, this.x, this.y);
                    const strength = (personalSpaceRadius - distance) / personalSpaceRadius;
                    // Reduce repulsion strength if stuck
                    const repulsionMultiplier = isStuck ? 0.5 : 1.5;
                    this.personalSpace.x += Math.cos(angle) * strength * repulsionMultiplier;
                    this.personalSpace.y += Math.sin(angle) * strength * repulsionMultiplier;
                }
            });

            // Blend target direction with spacing direction
            if (this.personalSpace.length() > 0) {
                // Reduce spacing weight if stuck
                const maxSpacingWeight = isStuck ? 0.4 : 0.8;
                const spacingWeight = Math.min(maxSpacingWeight, 
                    (this.personalSpace.length() / 2) * 
                    (targetDistance < BASE_ATTACK_RANGE * 2 ? 1.5 : 1)
                );
                const targetWeight = 1 - spacingWeight;
                
                this.currentMoveAngle = Math.atan2(
                    Math.sin(newMoveAngle) * targetWeight + this.personalSpace.y * spacingWeight,
                    Math.cos(newMoveAngle) * targetWeight + this.personalSpace.x * spacingWeight
                );
            } else {
                this.currentMoveAngle = newMoveAngle;
            }

            this.lastMovementChoice = currentTime;
            this.committedToMovement = true;
        }

        // Apply movement
        if (targetDistance > BASE_ATTACK_RANGE) {
            // Increase speed if stuck
            const speedMultiplier = isStuck ? 1.5 : 1;
            const velocity = this.getVelocityFromAngle(this.currentMoveAngle, this.stats.speed * speedMultiplier);
            this.body.setVelocity(velocity.x, velocity.y);

            // Update animation only if actually moving
            if (this.body.velocity.length() > 10) {
                const animKey = `${this.animalKey}_run_${this.getDirectionFromAngle(this.currentMoveAngle)}`;
                if (!this.anims.isPlaying || this.anims.currentAnim?.key !== animKey) {
                    this.play({
                        key: animKey,
                        frameRate: 10 * this.animationSpeedVariation,
                        timeScale: 1,
                        startFrame: Math.floor(Math.random() * 3)
                    });
                }
            }
        } else {
            this.body.setVelocity(0, 0);
            this.committedToMovement = false;
            if (!this.isAttacking) {
                this.attack();
            }
        }
    }

    attack() {
        if (this.isAttacking) return false;

        const distance = Phaser.Math.Distance.Between(
            this.x, this.y,
            this.currentTarget.x, this.currentTarget.y
        );

        // More forgiving blocked check
        const allies = this.scene.battleManager.getTeamAnimals(this.team);
        const blockedByAllies = allies.some(ally => {
            if (ally === this || ally.isDead) return false;
            
            const angleToTarget = Phaser.Math.Angle.Between(
                this.x, this.y,
                this.currentTarget.x, this.currentTarget.y
            );
            const angleToAlly = Phaser.Math.Angle.Between(
                this.x, this.y,
                ally.x, ally.y
            );
            
            const angleDiff = Math.abs(Phaser.Math.Angle.Wrap(angleToAlly - angleToTarget));
            const isInPath = angleDiff < APPROACH_ANGLE_TOLERANCE / 2;
            
            const allyDistance = Phaser.Math.Distance.Between(this.x, this.y, ally.x, ally.y);
            return isInPath && allyDistance < distance * 0.8;
        });

        // More aggressive range extension when blocked
        const effectiveRange = blockedByAllies ? 
            BASE_ATTACK_RANGE * (1 + (this.stats.size / 3)) :
            BASE_ATTACK_RANGE;

        const finalRange = Math.min(effectiveRange, MAX_ATTACK_RANGE);

        // More forgiving range check
        if (distance > finalRange * 1.5) return false;

        // Always allow attack if close enough, regardless of blocking
        if (distance <= BASE_ATTACK_RANGE * 0.8 || !blockedByAllies) {
            this.isAttacking = true;
            this.failedAttackAttempts = 0;
            this.committedToMovement = false;

            // Play attack animation
            const angle = Phaser.Math.Angle.Between(
                this.x, this.y,
                this.currentTarget.x, this.currentTarget.y
            );
            
            const attackAnim = this.attackAnims[Math.floor(Math.random() * this.attackAnims.length)];
            this.play({
                key: `${this.animalKey}_${attackAnim}_${this.getDirectionFromAngle(angle)}`,
                frameRate: 10 * this.animationSpeedVariation,
                timeScale: 1,
                startFrame: Math.floor(Math.random() * 2)
            });

            // Handle attack completion
            const onComplete = () => {
                if (this.currentTarget && !this.currentTarget.isDead) {
                    this.playImpactSound();
                    this.currentTarget.takeDamage(this.stats.attackDamage, this);
                    
                    if (this.stats.size >= 4) {
                        this.applySplashDamage(this.currentTarget);
                    }
                }
                this.isAttacking = false;
                this.off('animationcomplete', onComplete);
            };

            this.on('animationcomplete', onComplete);
            return true;
        }

        return false;
    }

    applySplashDamage(primaryTarget) {
        // Calculate splash damage (50% of normal attack damage)
        const splashDamage = Math.floor(this.stats.attackDamage * 0.5);
        
        // Calculate max targets based on attacker size
        // Size 4: 2 splash targets
        // Size 5: 3 splash targets
        // Size 6: 4 splash targets
        // Size 7: 5 splash targets
        const maxSplashTargets = Math.max(2, this.stats.size - 2);
        
        // Get all nearby enemies within splash range
        const splashRange = BASE_ATTACK_RANGE * 1.2; // Slightly larger than normal attack range
        const nearbyEnemies = this.scene.getEnemyAnimals(this.team).filter(enemy => {
            if (enemy === primaryTarget || enemy.isDead) return false;
            
            const distance = Phaser.Math.Distance.Between(
                primaryTarget.x, primaryTarget.y,
                enemy.x, enemy.y
            );
            
            return distance <= splashRange;
        });

        // Sort by distance to primary target
        nearbyEnemies.sort((a, b) => {
            const distA = Phaser.Math.Distance.Between(primaryTarget.x, primaryTarget.y, a.x, a.y);
            const distB = Phaser.Math.Distance.Between(primaryTarget.x, primaryTarget.y, b.x, b.y);
            return distA - distB;
        });

        // Apply splash damage to closest enemies up to maxSplashTargets
        nearbyEnemies.slice(0, maxSplashTargets).forEach(enemy => {
            // Scale splash damage based on size difference
            const sizeDiff = Math.max(0, this.stats.size - enemy.stats.size);
            const scaledDamage = Math.floor(splashDamage * (1 + sizeDiff * 0.2));
            
            enemy.takeDamage(scaledDamage, this);
        });
    }

    takeDamage(amount, attacker) {
        this.currentHitpoints -= amount;
        
        // Only play take damage animation if enough time has passed (3 seconds)
        const currentTime = this.scene.time.now;
        if (currentTime - this.lastTakeDamageTime >= 3000) {
            // Calculate angle from attacker to target
            const angle = Phaser.Math.Angle.Between(
                attacker.x, attacker.y,
                this.x, this.y
            );
            
            // Add PI to reverse the direction so the animal faces the attacker
            const facingAngle = angle + Math.PI;
            
            this.playDirectionalAnimation('takeDamage', facingAngle);
            this.lastTakeDamageTime = currentTime;

            // Add a small delay before showing blood effect to match the attack animation
            this.scene.time.delayedCall(150, () => {
                this.showBloodEffect();
            });
        } else {
            // If we can't play the take damage animation, still show blood with less delay
            this.scene.time.delayedCall(50, () => {
                this.showBloodEffect();
            });
        }

        this.playAnimalSound(); // Add sound when taking damage

        if (this.currentHitpoints <= 0) {
            this.die();
            return;
        }

        // Don't check for fear if already afraid or in immunity period
        if (!this.isAfraid && this.scene.time.now >= this.fearImmunityTime) {
            const fearDiff = attacker.stats.fearFactor - this.stats.fearFactor;
            const fearChance = Math.max(0.1, Math.min(0.9, (fearDiff / 100) + 0.3));
            
            if (Math.random() < fearChance) {
                this.becomeAfraid();
            }
        }
    }

    becomeAfraid() {
        // If already afraid, don't restart the fear state
        if (this.isAfraid) return;
        
        this.isAfraid = true;
        this.currentTarget = null;
        
        // Random fear duration between 1-5 seconds
        const fearDuration = Phaser.Math.Between(1000, 5000);
        
        // Clear any existing fear timer
        if (this.fearTimer) {
            this.fearTimer.remove();
        }
        
        // First timer for being afraid and running
        this.fearTimer = this.scene.time.delayedCall(fearDuration, () => {
            this.isAfraid = false;
            
            // Only start immunity period after fear state ends
            this.fearImmunityTime = this.scene.time.now + 3000;
        });
    }

    die() {
        this.isDead = true;
        this.currentTarget = null;
        this.body.setVelocity(0, 0);
        
        // Fix direction for death animation
        const lastAngle = Math.atan2(this.body.velocity.y, this.body.velocity.x);
        this.playDirectionalAnimation('die', lastAngle + (this.team === 'opponent' ? 0 : Math.PI));
        
        // Trigger fear check in nearby allies
        this.scene.checkTeamFear(this.team);
        
        // Check for battle end
        this.scene.checkBattleEnd();

        this.playAnimalSound(); // Add sound when dying
    }

    performTaunt() {
        if (this.scene.anims.exists(`${this.animalKey}_taunt`)) {
            this.hasPerformedTaunt = true;
            const angle = this.getAngleToTarget(this.currentTarget);
            // Fix direction by adding PI for taunt animation
            this.playDirectionalAnimation('taunt', angle + Math.PI);
        }
    }

    // Helper methods for animations and movement
    playDirectionalAnimation(animName, angle) {
        const direction = this.getDirectionFromAngle(angle);
        const key = `${this.animalKey}_${animName.toLowerCase()}_${direction}`;
        
        if (this.scene.anims.exists(key)) {
            if (!this.anims.isPlaying || this.anims.currentAnim.key !== key) {
                // Apply random offset and speed to animation
                const config = {
                    key: key,
                    frameRate: 10 * this.animationSpeed,  // Randomize animation speed slightly
                    startFrame: Math.floor(Math.random() * 3)  // Start at slightly different frame
                };
                
                this.play(config);
            }
        }
    }

    getDirectionFromAngle(angle) {
        // Normalize angle to 0-2PI range
        let normalized = angle;
        while (normalized < 0) normalized += Math.PI * 2;
        while (normalized >= Math.PI * 2) normalized -= Math.PI * 2;

        // Convert to 8 directions (0-7)
        return Math.floor(((normalized + Math.PI / 8) / (Math.PI * 2)) * 8) % 8;
    }

    getVelocityFromAngle(angle, speed) {
        let adjustedSpeed = speed;
        if (this.currentTarget) {
            const distance = Phaser.Math.Distance.Between(
                this.x, this.y,
                this.currentTarget.x, this.currentTarget.y
            );
            
            // Gradual slowdown when approaching target
            if (distance < BASE_ATTACK_RANGE * 2) {
                adjustedSpeed *= Math.max(0.1, (distance - BASE_ATTACK_RANGE) / BASE_ATTACK_RANGE);
            }
        }

        return {
            x: Math.cos(angle) * adjustedSpeed * GLOBAL_SPEED_MULTIPLIER,
            y: Math.sin(angle) * adjustedSpeed * GLOBAL_SPEED_MULTIPLIER
        };
    }

    getAngleToTarget(target) {
        return Phaser.Math.Angle.Between(this.x, this.y, target.x, target.y);
    }

    performRandomMovement() {
        if (!this.randomMoveAngle) {
            this.randomMoveAngle = Math.random() * Math.PI * 2;
            this.nextDirectionChange = this.scene.time.now + Phaser.Math.Between(500, 1500);
        }

        if (this.scene.time.now > this.nextDirectionChange) {
            this.randomMoveAngle = Math.random() * Math.PI * 2;
            this.nextDirectionChange = this.scene.time.now + Phaser.Math.Between(500, 1500);
        }

        const velocity = this.getVelocityFromAngle(this.randomMoveAngle, this.stats.speed * 0.7);
        this.body.setVelocity(velocity.x, velocity.y);
        
        // Only play footsteps if moving fast enough and randomly
        if (this.body.velocity.length() > 50 && Math.random() < 0.1) {
            this.playFootstepSounds();
        }
        
        // Use raw angle - getDirectionFromAngle will handle team-based direction
        this.playDirectionalAnimation('run', this.randomMoveAngle);
    }

    playAnimalSound() {
        const currentTime = this.scene.time.now;
        if (currentTime - this.lastSoundTime < this.soundDelay) return;

        const soundKey = getRandomAnimalSound(this.animalName);
        if (!soundKey) return;

        // Add random delay between 0-100ms for sound staggering
        const delay = Math.random() * 100;
        this.scene.time.delayedCall(delay, () => {
            audioManager.playSound(this.scene, soundKey);
        });
        
        this.lastSoundTime = currentTime;
    }

    // Modify footstep sound method for more controlled playback
    playFootstepSounds() {
        const currentTime = this.scene.time.now;
        
        // Check if enough time has passed and we're not already playing too many footsteps
        if (currentTime - this.lastFootstepTime < this.footstepDelay || 
            this.currentFootstepCount >= this.maxSimultaneousFootsteps) {
            return;
        }

        const soundKey = getRandomImpactSound(this.impactType);
        
        // Play just two quick footstep sounds instead of three
        for (let i = 0; i < 2; i++) {
            this.scene.time.delayedCall(i * 150, () => {
                if (Math.random() < 0.3) { // Only 30% chance to play each footstep
                    audioManager.playSound(this.scene, soundKey, { volume: 0.1 });
                }
            });
        }
        
        this.lastFootstepTime = currentTime;
        
        // Reset footstep count after delay
        this.currentFootstepCount++;
        this.scene.time.delayedCall(this.footstepDelay, () => {
            this.currentFootstepCount = Math.max(0, this.currentFootstepCount - 1);
        });
    }

    // Modify impact sound method for more controlled playback
    playImpactSound() {
        const currentTime = this.scene.time.now;
        if (currentTime - this.lastImpactTime < this.impactDelay) return;

        // Only 50% chance to play impact sound
        if (Math.random() < 0.5) {
            const soundKey = getRandomImpactSound(this.impactType);
            audioManager.playSound(this.scene, soundKey, { volume: 0.1 });
        }
        
        this.lastImpactTime = currentTime;
    }
} 