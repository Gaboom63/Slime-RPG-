import {badslimeSprite, boomy, fireBoom} from './sprites.js';
import {updateEntity, slime, camera} from './game.js';
import {checkCollision} from './collision.js';
import {fireBalls, checkBallCollision} from './slimeballs.js';
import {gainExperience} from './skillTree.js';
import {levelLength} from './platforms.js';
import {createDroppedItem, droppedItems,} from './items.js'
import {slimeJournal} from './inventory.js';
import {takeDamage} from './random.js';

export const canvas = document.getElementById('game-canvas');
export const ctx = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
ctx.imageSmoothingEnabled = false; // Disable image smoothing

export const grassHeight = 10; // Height of the grass floor
export let maxNpcs = 3;
export const npcMovementInterval = 1000; // Time in milliseconds to change direction
export let npcMovementTimer = 0;
// Entity creation function
export const createEntity = (x, y, color) => ({
    x,
    y,
    width: 64,
    height: 64,
    speed: 1,
    hp: 100,
    maxHp: 100,
    isJumping: false,
    jumpStrength: 15, // Increased jump strength
    gravity: 0.5, // Decreased gravity
    velocityY: 0,
    color,
    velocityX: 0,
    friction: 0.9,
    acceleration: 0.5,
    maxSpeed: 5,
    direction: 'forward',
    frameIndex: 0,
    frameCount: 0,
    jumps: 0,
    maxJumps: 1 // Allows for double jump if you want
});
export let npc = {};
export let npcs = [
    {
        ...createEntity(700, canvas.height - grassHeight - 64, 'brown'),
        itemDrop: ['Slime Jelly', 'Health Potion'],
        defeated: false,
        type: 'slime',
        sprite: badslimeSprite
    },
    {
        ...createEntity(1000, canvas.height - grassHeight - 64, 'green'),
        itemDrop: ['Magic Essence', 'Mana Potion'],
        defeated: false,
        type: 'goblin',
        sprite: boomy
    },
    {
        ...createEntity(1200, canvas.height - grassHeight - 64, 'red'), // Change color if needed
        itemDrop: ['Magic Essence', 'Mana Potion'],
        defeated: false,
        type: 'fireSlime', // Ensure this matches the check in collision
        sprite: fireBoom
    }
];


export const npcTemplates = [ //Links to the spawnNPC function. 
    {
        type: 'slime',
        itemDrop: ['Slime Jelly', 'Health Potion'],
        sprite: badslimeSprite // Assigning specific sprite
    },
    {
        type: 'goblin',
        itemDrop: ['Magic Essence', 'Mana Potion'],
        sprite: boomy // Assigning specific sprite
    },
    {
        type: 'fireSlime',
        itemDrop: ['Magic Essence', 'Mana Potion'],
        sprite: fireBoom // Assigning specific sprite
    },
    // Add more NPC templates as needed
];

export const npcDefeated = (npc) => {
    npc.defeated = true;
    const dropX = npc.x + npc.width / 2;
    const dropY = npc.y;

    // Log NPC defeat in the journal
    slimeJournal.push({
        type: npc.type,
        itemsDropped: [...npc.itemDrop], // Copy items dropped
        timestamp: new Date().toLocaleString() // Add a timestamp
    });

    npc.itemDrop.forEach(itemName => {
        if (Math.random() < 0.5) { // 50% chance to drop each item
            const newItem = createDroppedItem(dropX, dropY, itemName);
            if (newItem) {
                droppedItems.push(newItem);
                console.log(`${itemName} dropped!`);
            }
        }
    });

    gainExperience(50); // Grant XP upon defeating NPC
    setTimeout(() => respawnNPC(npc), 1000); // Respawn after 5 seconds
};

export const npcSprites = {
    'slime': 'images/characters/BadBoom.png',
    'goblin': 'images/characters/Boomy.png',
    'fireBoom': 'images/characters/fireBoom.png',
    // Add more enemy types and their corresponding sprite paths
};

export const updateNPCs = () => {
    npcs.forEach(npc => {
        if (!npc.defeated) {
            updateEntity(npc);
            updateNpcMovement(npc);

            // Check collisions with fireballs
            fireBalls.forEach((ball, index) => {
                if (checkBallCollision(ball, npc)) {
                    // Check if the NPC is a fireSlime
                    if (npc.type === 'fireSlime') {
                        console.log('FireSlime resisted fireball damage!');
                        // Remove the fireball without applying damage
                        fireBalls.splice(index, 1);
                    } else {
                        // Apply damage to other NPCs
                        npc.hp -= ball.damage;
                        console.log(`Fireball hit the ${npc.type}!`);
                        fireBalls.splice(index, 1); // Remove the fireball on hit
                    }

                    // Check if the NPC is defeated
                    if (npc.hp <= 0) {
                        npcDefeated(npc);
                    }
                }
            });

            // Check collision with player
            if (checkCollision(slime, npc)) {
                slime.x = slime.x < npc.x ? npc.x - slime.width : npc.x + npc.width;
                takeDamage(1);
            }
        }
    });
};

export const spawnNPC = () => {
    const randomIndex = Math.floor(Math.random() * npcTemplates.length); // Random index
    const npcTemplate = npcTemplates[randomIndex]; // Select a random template

    const x = Math.random() * (camera.width + 200) + camera.x - 100; // Spawn outside camera

    const newNPC = {
        ...createEntity(x, canvas.height - grassHeight - 64, 'brown'), // Replace 'brown' with desired color or logic
        itemDrop: npcTemplate.itemDrop,
        defeated: false,
        type: npcTemplate.type,
        sprite: npcTemplate.sprite
    };

    npcs.push(newNPC); // Add to NPC array
};

export const spawnNPCs = () => {
    // Limit the number of NPCs to spawn
    while (npcs.length < maxNpcs) {
        const randomTemplate = npcTemplates[Math.floor(Math.random() * npcTemplates.length)]; // Randomly choose an NPC template
        let x;

        // Calculate spawn position based on camera's current x position
        const cameraExtendedWidth = camera.x + canvas.width + 100; // Allow spawning in an extended area
        x = Math.random() * (cameraExtendedWidth - 200) + (camera.x - 100); // Random spawn within the extended camera area

        // Ensure NPCs spawn within the level's bounds
        x = Math.max(0, Math.min(x, levelLength - 64)); // Assuming 64 is the width of the NPC

        const npc = {
            ...createEntity(x, canvas.height - grassHeight - 64, 'brown'), // Set y based on the ground
            itemDrop: randomTemplate.itemDrop,
            defeated: false,
            type: randomTemplate.type,
            sprite: randomTemplate.sprite // Assign sprite based on type
        };

        npcs.push(npc);
    }
};

export const drawNPCs = () => {
    npcs.forEach(npc => {
        if (!npc.defeated) {
            ctx.fillStyle = npc.color; // Use color or sprite as needed
            ctx.fillRect(npc.x, npc.y, npc.width, npc.height); // Draw the NPC
        }
    });
};

export const respawnNPC = (npc) => {
    // Calculate a random x position based on the camera's current x position
    const cameraExtendedWidth = camera.x + canvas.width + 100; // Allow spawning outside the right edge
    const spawnX = Math.random() < 0.5
        ? Math.random() * 100 + (camera.x - 100) // Spawn outside on the left
        : Math.random() * 100 + cameraExtendedWidth; // Spawn outside on the right

    npc.x = Math.max(0, Math.min(spawnX, levelLength - npc.width)); // Ensure within level bounds
    npc.y = canvas.height - grassHeight - npc.height; // Place on the ground
    npc.hp = 100; // Reset NPC HP
    npc.defeated = false; // Reset the defeated state
    console.log(`NPC respawned at x: ${npc.x}, y: ${npc.y}`);
};
// Update the NPC's movement
export const updateNpcMovement = (npc) => {
    npcMovementTimer += 16; // Assuming roughly 60 FPS, so about 16 ms per frame

    if (npcMovementTimer > npcMovementInterval) {
        npcMovementTimer = 0;

        // Randomly change direction
        const direction = Math.random() < 0.5 ? -1 : 1; // Randomly choose left or right
        npc.velocityX = direction * npc.speed; // Set velocity based on direction

        // Randomize the jump occasionally
        if (Math.random() < 0.3) { // 30% chance to jump
            npc.isJumping = true;
            npc.velocityY = npc.jumpStrength;
        }
    }
};

export const logDefeatedNPC = (npc) => {
    const existingEntry = slimeJournal.find(entry => entry.type === npc.type);
    if (!existingEntry) {
        const entry = {
            type: npc.type,
            timestamp: new Date().toLocaleString(),
            itemsDropped: npc.itemDrop
        };
        slimeJournal.push(entry);
    }
};