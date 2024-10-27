import { testXP, updateXPBar, skillTree, gainExperience, unlockSkill, updateSkillTreeUI, currentXP, xpToNextLevel, currentLevel, levelUp, openSkillTree, closeSkillTree, formatSkillName, activateShield, activateSpeedDash, startHealthRegeneration, performAreaAttack, activateWallClimb, fludderJump } from './skillTree.js';
import { slimeSprite, badslimeSprite, slimeBallSprite, fireGooBallSprite, itemSpriteSheet, potionitemSpriteSheet, boomy, fireBoom, itemSprites} from './sprites.js'; 
import { getPlatformsForLevel, platforms, drawPlatforms, generateNewLevel, updateLevel, levelLength, currentPageLevel , levelProgress, checkPlatformCollision } from './platforms.js';
import { checkBallCollision, createFireball, createSlimeBall, shootSlimeBall, updateFireBalls, scale, drawFireBalls, drawSlimeBalls, updateSlimeBalls, slimeBalls, fireBalls, handleBallCollisions} from './slimeballs.js';
import {maxNpcs, npc, npcs, npcTemplates, npcDefeated, npcSprites, updateNPCs, spawnNPC, spawnNPCs, drawNPCs, respawnNPC, createEntity, npcMovementInterval, npcMovementTimer, logDefeatedNPC} from './npc.js';
import {inventory, openInventory, addItemToInventory, removeItemFromInventory, updateInventoryDisplay, closeInventory, displaySlimeJournal} from './inventory.js';
import {checkCollision, handleCollision} from './collision.js';
import {preloadImages, updateDroppedItems, drawDroppedItems, checkItemPickup, itemsPerPage} from './items.js';
import {handleInput} from './controls.js';
import {updateClouds, drawClouds, checkDeath} from './random.js';

export const canvas = document.getElementById('game-canvas');
export const ctx = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
ctx.imageSmoothingEnabled = false; // Disable image smoothing

export const scaleFactor = 1.5; // Change this to scale up or down
export const camera = { x: 0, y: 0, width: canvas.width, height: canvas.height };
export let stopTheControl = false;
export let showHitboxes = false;
export const grassHeight = 10; // Height of the grass floor
export let currentPage = 0; // Start at the first page
export const scaleItems = 3; // Scale factor for dropped items
export let lastTimestamp = 0;
export const updateMovement = handleInput();

// Create player (slime) and NPC
export const slime = createEntity(100, canvas.height - grassHeight - 64, 'blue');
preloadImages(Object.keys(itemSprites));

// Frame control variables
const frameWidth = 32, frameHeight = 32, maxFrames = 4;
const slimeHitbox = { xOffset: 30, yOffset: 20, width: 60, height: 44 };

const drawEntity = (entity) => {
    if (++entity.frameCount > 40) {
        entity.frameIndex = (entity.frameIndex + 1) % maxFrames;
        entity.frameCount = 0;
    }

    // Use the specific sprite for NPCs or fallback to the player sprite
    const sprite = entity.sprite || slimeSprite; // Fallback to slimeSprite for the player
    const spriteRow = entity.direction === 'left' ? 2 :
        entity.direction === 'right' ? 1 :
            entity.direction === 'forward' ? 0 : 3; // Default to forward for other directions

    const scale = 4;
    ctx.drawImage(
        sprite,
        entity.frameIndex * frameWidth,
        spriteRow * frameHeight,
        frameWidth,
        frameHeight,
        entity.x,
        entity.y,
        frameWidth * scale,
        frameHeight * scale
    );

    if (showHitboxes) {
        ctx.strokeStyle = 'red';
        ctx.strokeRect(entity.x + slimeHitbox.xOffset, entity.y + slimeHitbox.yOffset, slimeHitbox.width, slimeHitbox.height);
    }
};

export const updateEntity = (entity) => {
    // Apply horizontal movement and friction
    entity.x += entity.velocityX;
    entity.velocityX *= entity.friction;

    // Store the previous Y position
    const previousY = entity.y;

    // Apply gravity
    entity.velocityY += entity.gravity;
    entity.y += entity.velocityY;

    // Check for platform collisions
    let onPlatform = false;
    for (const platform of platforms) {
        if (checkPlatformCollision(entity, platform)) {
            onPlatform = true;
            entity.y = platform.y - entity.height; // Place entity on top of the platform
            entity.velocityY = 0; // Reset vertical velocity
            entity.jumps = 0; // Reset jumps when on a platform
            break; // Exit loop once a collision is found
        }        
    }

    // If not on a platform, ensure gravity continues to apply
    if (!onPlatform) {
        entity.velocityY += entity.gravity; // Apply gravity if in the air
    }

    // Prevent entity from going off-screen to the left
    entity.x = Math.max(0, entity.x);
    
    // Prevent entity from going below the grass
    entity.y = Math.min(entity.y, canvas.height - grassHeight - entity.height);

    // Reset jumps if on the ground
    if (entity.y >= canvas.height - grassHeight - entity.height) {
        entity.jumps = 0; // Reset jump count
        entity.y = canvas.height - grassHeight - entity.height; // Ensure entity stays on the ground
        entity.velocityY = 0; // Reset vertical velocity
    }
};

// Modify the part of the code where you check for NPC HP
if (npc.hp <= 0 && !npc.defeated) {
    npcDefeated();
}

// Existing collision checks between slimeballs/fireballs and NPC
for (let i = slimeBalls.length - 1; i >= 0; i--) {
    const ball = slimeBalls[i];
    if (checkBallCollision(ball, npc)) {
        npc.hp -= ball.damage;
        slimeBalls.splice(i, 1);
        console.log(`${ball.isFireball ? 'Fireball' : 'Slimeball'} hit the NPC!`);

        // Check if the NPC is defeated after the hit
        if (npc.hp <= 0) {
            npcDefeated();
        }
    }
}

for (let i = fireBalls.length - 1; i >= 0; i--) {
    const ball = fireBalls[i];
    if (checkBallCollision(ball, npc)) {
        npc.hp -= ball.damage;
        fireBalls.splice(i, 1);
        console.log(`${ball.isFireball ? 'Fireball' : 'Slimeball'} hit the NPC!`);

        // Check if the NPC is defeated after the hit
        if (npc.hp <= 0) {
            npcDefeated();
        }
    }
}

const gameLoop = (timestamp) => {
    const deltaTime = timestamp - lastTimestamp; // Calculate delta time
    lastTimestamp = timestamp;
    // Clear the canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    // Update camera position to follow the slime
    camera.x = slime.x - canvas.width / 2 + slime.width / 2;
    camera.y = 0; // We're not scrolling vertically in this example

    if (slime.x > levelLength - 100) {
        generateNewLevel();
        slime.x = 50; // Reset player position
    }
    // Clamp camera position to prevent showing empty space
    camera.x = Math.max(0, Math.min(camera.x, levelLength - canvas.width));

    // Save the current context state
    ctx.save();

    // Translate the context to simulate camera movement
    ctx.translate(-camera.x, -camera.y);

    // Update game elements
    updateClouds();
    updateMovement();
    updateLevel(); // Ensure level update is called early
    spawnNPCs(); // Call NPC spawning function each frame
    updateNPCs(); // Ensure existing NPCs are updated
    // Draw entities
    drawClouds();
    drawPlatforms(); // Draw platforms before entities
    drawEntity(slime);
    updateEntity(slime);
    // drawHitboxes();
    // Update and draw NPCs
    npcs.forEach(npc => {
        if (!npc.defeated) {
            updateEntity(npc); // Update NPC before drawing
            drawEntity(npc);
        }
    });

    // Update and draw slime and fire balls
    updateSlimeBalls();
    updateFireBalls();
    updateDroppedItems(); // Update dropped items
    drawDroppedItems();

    // Check item pickups
    checkItemPickup();

    // Handle slimeballs and fireballs hitting NPCs
    handleBallCollisions(slimeBalls, 'slimeball');
    handleBallCollisions(fireBalls, 'fireball');

    // Draw balls based on skill tree
    if (skillTree.skills.fireballShot.unlocked) {
        drawFireBalls();
    } else {
        drawSlimeBalls();
    }

    ctx.restore(); // Restore context to avoid affecting further draws

    // Handle collisions and other game state checks
    handleCollision();
    checkDeath();

    // Request the next animation frame
    requestAnimationFrame(gameLoop);
};


slimeSprite.onload = gameLoop;



