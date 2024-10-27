import {slime, ctx, canvas} from './game.js';
import {openInventory, closeInventory} from './inventory.js'
import {openSkillTree, closeSkillTree} from './skillTree.js';
import {shootSlimeBall} from './slimeballs.js'
export let stopTheControl = false;
export const handleInput = () => {
    let leftPressed = false, rightPressed = false;

    window.addEventListener('keydown', (e) => {
        if (!stopTheControl) {
            switch (e.key) {
                case 'ArrowLeft':
                case 'a':
                    leftPressed = true;
                    slime.direction = 'left';
                    break;
                case 'ArrowRight':
                case 'd':
                    rightPressed = true;
                    slime.direction = 'right';
                    break;
                case ' ':
                case 'ArrowUp':
                case 'w':
                    if (slime.jumps < slime.maxJumps) {
                        slime.velocityY = -slime.jumpStrength;
                        slime.isJumping = true;
                        slime.jumps++;
                        slime.direction = 'forward';
                    }
                    break;
                case 'c':
                    testXP();
                    break
                case 'Escape':
                    closeSkillTree(); // Close skill tree
                    closeInventory(); // Assuming you have a function to close inventory
                    break

                case 't':
                    openSkillTree();
                    break;

                case 'i':
                    openInventory();
                    break;
                case 'e':
                    shootSlimeBall(); // This will shoot either a gooball or fireball based on unlocked skills
                    break;
                case 'j':
                    // displaySlimeJournal();
                    break;
                case 'Enter':
                    document.getElementById('start-menu').style.display = 'none';
                    document.getElementById('game-container').style.display = 'block';            
                    break;
            }
        }
    });

    window.addEventListener('keyup', (e) => {
        switch (e.key) {
            case 'ArrowLeft':
            case 'a':
                leftPressed = false;
                break;
            case 'ArrowRight':
            case 'd':
                rightPressed = false;
                break;
        }
    });

    return () => {
        if (rightPressed) {
            slime.velocityX = Math.min(slime.velocityX + slime.acceleration, slime.maxSpeed);
        } else if (leftPressed) {
            slime.velocityX = Math.max(slime.velocityX - slime.acceleration, -slime.maxSpeed);
        } else {
            // Apply friction to slow down when no keys are pressed
            slime.velocityX *= slime.friction;
        }
    };
};