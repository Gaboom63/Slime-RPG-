import {canvas, ctx, slime, grassHeight} from './game.js';
import {spawnNPC} from './npc.js';
import {npcs} from './npc.js';
import { currentLevel } from './skillTree.js';
export let platforms = []; // Change this to let instead of const at the top of your file
export let currentPageLevel = 1; 
export let levelProgress = 0; // The player's progress in the current level
export let levelLength = 5000; // Adjust this value based on how long you want your levels to be

export const platformsForLevels = [
    // Level 1
    [
        { x: 100, y: 800, width: 200, height: 10 },
        { x: 400, y: 600, width: 150, height: 10 },
        { x: 600, y: 400, width: 100, height: 10 },
        { x: 200, y: 300, width: 250, height: 10 },
        { x: 2050, y: 200, width: 180, height: 10 },
    ],
    // Level 2
    [
        { x: 150, y: 750, width: 180, height: 10 },
        { x: 450, y: 550, width: 130, height: 10 },
        { x: 700, y: 350, width: 120, height: 10 },
        { x: 250, y: 250, width: 220, height: 10 },
        { x: 2100, y: 150, width: 200, height: 10 },
    ],
    // Level 3
    [
        { x: 200, y: 700, width: 160, height: 10 },
        { x: 500, y: 500, width: 140, height: 10 },
        { x: 800, y: 300, width: 110, height: 10 },
        { x: 300, y: 200, width: 200, height: 10 },
        { x: 2150, y: 100, width: 220, height: 10 },
    ],
    // Add more levels as needed
];

export const getPlatformsForLevel = (level) => {
    // Ensure we don't go out of bounds
    const index = Math.min(level - 1, platformsForLevels.length - 1);
    console.log(platformsForLevels[index]);
    return platformsForLevels[index];

};

export const generateNewLevel = () => {
    currentPageLevel++; // Increment the level
    levelLength += 1000; // Increase the level length
    
    // Generate new platforms
     platforms = [
        { x: 0, y: canvas.height - grassHeight, width: levelLength, height: grassHeight }
    ];
    
    // Get predefined platforms for the current level
    const levelPlatforms = getPlatformsForLevel(currentPageLevel);
    platforms = platforms.concat(levelPlatforms);
    
    // Reset NPCs
    // npcs = [];
    
    // Spawn new NPCs
    for (let i = 0; i < 5; i++) {
        spawnNPC();
    }
    
    // Reset dropped items
    // droppedItems = [];
    
    // Display a message
     // Display a message
     const message = document.createElement('div');
     message.textContent = `Level ${currentPageLevel} Generated!`;
     message.style.position = 'absolute';
     message.style.top = '50%';
     message.style.left = '50%';
     message.style.transform = 'translate(-50%, -50%)';
     message.style.fontSize = '24px';
     message.style.color = 'white';
     message.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
     message.style.padding = '10px';
     message.style.borderRadius = '5px';
     document.body.appendChild(message);
     setTimeout(() => {
        document.body.removeChild(message);
    }, 3000);
};

export const checkPlatformCollision = (entity, platform) => {
    const entityBottom = entity.y + entity.height;
    const entityRight = entity.x + entity.width;
    
    // Check if the entity is within the horizontal bounds of the platform
    const withinHorizontalBounds = entity.x < platform.x + platform.width && entityRight > platform.x;

    // Check if the entity is at the right height to collide with the platform
    const collidingFromTop = entityBottom > platform.y && entity.y < platform.y + platform.height;
    
    return withinHorizontalBounds && collidingFromTop;
};

export const drawPlatforms = () => {
    ctx.fillStyle = 'brown'; // Change to desired color for visibility
    platforms.forEach((platform, index) => {
        // Skip the first platform (index 0) which is typically the ground
        if (index !== 0) {
            ctx.fillRect(platform.x, platform.y, platform.width, platform.height);
        }
    });
};

export const updateLevel = () => {
    levelProgress = slime.x; // Assume the player's x position is the level progress

    if (levelProgress >= levelLength) {
        currentLevel++;
        levelProgress = 0;
        slime.x = 0; // Reset player position

        // Increase difficulty
        npcs.forEach(npc => {
            npc.speed *= 1.2; // Increase NPC speed by 20%
            npc.hp *= 1.5; // Increase NPC health by 50%
        });

        // Increase level length for the next level
        levelLength *= 1.5;

        // Display level up message
        const levelUpMessage = document.createElement('div');
        levelUpMessage.textContent = `Level Up! You are now on Level ${currentLevel}`;
        levelUpMessage.style.position = 'absolute';
        levelUpMessage.style.top = '50%';
        levelUpMessage.style.left = '50%';
        levelUpMessage.style.transform = 'translate(-50%, -50%)';
        levelUpMessage.style.fontSize = '24px';
        levelUpMessage.style.color = 'white';
        levelUpMessage.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
        levelUpMessage.style.padding = '20px';
        levelUpMessage.style.borderRadius = '10px';
        document.body.appendChild(levelUpMessage);

        setTimeout(() => {
            document.body.removeChild(levelUpMessage);
        }, 3000);
    }
};

console.log(platforms);
