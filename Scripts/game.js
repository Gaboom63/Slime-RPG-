    import { testXP, updateXPBar, skillTree, gainExperience, unlockSkill, updateSkillTreeUI, currentXP, xpToNextLevel, currentLevel, levelUp } from './skillTree.js';

    let currentPage = 0; // Start at the first page
    const itemsPerPage = 3; // Number of items per page

    // Get canvas context
    const canvas = document.getElementById('game-canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    ctx.imageSmoothingEnabled = false; // Disable image smoothing

    // Load the sprite sheet
    const slimeSprite = new Image();
    slimeSprite.src = 'images/characters/Boom.png';

    const badslimeSprite = new Image();
    badslimeSprite.src = 'images/characters/BadBoom.png';

    // Load the slimeball sprite sheet
    const slimeBallSprite = new Image();
    slimeBallSprite.src = 'images/Utilites/GooBall.png'; // Make sure this path is correct

    const fireGooBallSprite = new Image();
    fireGooBallSprite.src = 'images/Utilites/fireGooBall.png'; // Changed 'sec' to 'src'

    const itemSpriteSheet = new Image();
    itemSpriteSheet.src = 'images/Items/slimeJelly.png'; // Path to your item sprite sheet

    const potionitemSpriteSheet = new Image();
    potionitemSpriteSheet.src = 'images/Items/basicPotion.png'; // Path to your item sprite sheet

    const scaleFactor = 1.5; // Change this to scale up or down

    const itemSprites = {
        'Slime Jelly': {
            src: 'images/Items/slimeJelly.png',
            frameWidth: 32,
            frameHeight: 32,
            frameIndex: 0,
        },
        'Health Potion': {
            src: 'images/Items/basicPotion.png',
            frameWidth: 32,
            frameHeight: 32,
            frameIndex: 0,
        }
    };

    const slimeBalls = [];
    const fireBalls = [];
    const inventory = [];
    const droppedItems = []; // Array to hold dropped items


    let showHitboxes = false;
    let reallydead = false;    
    const grassHeight = 10; // Height of the grass floor

    // Entity creation function
    const createEntity = (x, y, color) => ({
        x, y, width: 64, height: 64, speed: 1, hp: 100, maxHp: 100,
        isJumping: false, jumpStrength: 20, gravity: 1, velocityY: 0, color,
        velocityX: 0, friction: 0.9, acceleration: 0.5, maxSpeed: 5,
        direction: 'forward', frameIndex: 0, frameCount: 0,
        jumps: 0, maxJumps: 1 // Add these properties
    });

    const createDroppedItem = (x, y, itemName) => ({
        x,
        y,
        width: 32,
        height: 32,
        itemName,
        speed: 0,
        hp: 1, // Example property; usually items don't have HP, but you can customize it
        maxHp: 1, // Similarly, for any other logic you may want
        gravity: 1,
        velocityY: -20,
        frameIndex: 0,
        frameCount: 0,
        maxFrames: 3,
        isVisible: true // Ensure it's visible

    });

    // Create player (slime) and NPC
    const slime = createEntity(100, canvas.height - grassHeight - 64, 'blue');

    const npc = {
        ...createEntity(700, canvas.height - grassHeight - 64, 'brown'),
        itemDrop: ['Slime Jelly', 'Health Potion'], // Array of possible items
        defeated: false,
        itemDrop1: 'Slime Jelly', // Example item
        itemDrop2: 'Health Potion' // Example item

    };
    const npcDefeated = () => {
        npc.defeated = true; // Mark the NPC as defeated
        // Get random positions for the dropped items
        const dropX = npc.x + npc.width / 2; // Center the drop position
        const dropY = npc.y;

        // Loop through the items the NPC can drop
        npc.itemDrop.forEach(itemName => {
            const newItem = createDroppedItem(dropX, dropY, itemName);
            droppedItems.push(newItem); // Add the new item to the droppedItems array
        });

        console.log("NPC defeated! Items dropped: ", npc.itemDrop);
    };

    // Cloud system
    const clouds = [];
    const createCloud = () => ({
        x: canvas.width, y: Math.random() * canvas.height / 2,
        width: Math.random() * 100 + 50, height: Math.random() * 50 + 25,
        speed: Math.random() * 0.5 + 0.1
    });

    const updateDroppedItems = () => {
        droppedItems.forEach(item => {
            // Apply gravity only if the item is not on the ground
            if (!item.isOnGround) {
                item.velocityY += item.gravity;
                item.y += item.velocityY;

                // Check if the item has reached the ground
                if (item.y >= canvas.height - grassHeight - item.height) {
                    item.y = canvas.height - grassHeight - item.height - 52; // THIS IS HOW YOU REAJUST THE ITEMS!!!
                    item.velocityY = 0; // Reset velocity on ground contact
                    item.isOnGround = true; // Mark item as on the ground
                }
            }

            // Update frame for animation
            if (++item.frameCount > 5) {
                item.frameIndex = (item.frameIndex + 1) % item.maxFrames;
                item.frameCount = 0;
            }
        });
    };


    const preloadImages = (itemNames) => {
        itemNames.forEach(itemName => {
            const img = new Image();
            img.src = itemSprites[itemName].src; // Load each item image
            itemSprites[itemName].image = img; // Store the loaded image
        });
    };

    // Call this function during your game initialization
    preloadImages(Object.keys(itemSprites));


    const updateClouds = () => {
        if (Math.random() < 0.005) clouds.push(createCloud());
        clouds.forEach((cloud, index) => {
            cloud.x -= cloud.speed;
            if (cloud.x + cloud.width < 0) clouds.splice(index, 1);
        });
    };

    const drawClouds = () => {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
        clouds.forEach(cloud => {
            ctx.beginPath();
            ctx.ellipse(cloud.x, cloud.y, cloud.width / 2, cloud.height / 2, 0, 0, Math.PI * 2);
            ctx.fill();
        });
    };

    // Frame control variables
    const frameWidth = 32, frameHeight = 32, maxFrames = 4;
    const slimeHitbox = { xOffset: 30, yOffset: 20, width: 60, height: 44 };

    const drawEntity = (entity) => {
        if (++entity.frameCount > 40) {
            entity.frameIndex = (entity.frameIndex + 1) % maxFrames;
            entity.frameCount = 0;
        }

        const sprite = entity === slime ? slimeSprite : badslimeSprite; // Choose the sprite based on the entity
        const spriteRow = entity.direction === 'left' ? 2 : entity.direction === 'right' ? 1 : entity.direction === 'forward' ? 0 : entity.direction === 'back' ? 3 : 0; 
        const scale = 4;

        ctx.drawImage(
            sprite,
            entity.frameIndex * frameWidth, spriteRow * frameHeight,
            frameWidth, frameHeight,
            entity.x, entity.y,
            frameWidth * scale, frameHeight * scale,
        );

        if (showHitboxes) {
            ctx.strokeStyle = 'red';
            ctx.strokeRect(entity.x + slimeHitbox.xOffset, entity.y + slimeHitbox.yOffset, slimeHitbox.width, slimeHitbox.height);
        }
    };


    // Update entity positions
  const updateEntity = (entity) => {
      entity.x += entity.velocityX;
      entity.velocityX *= entity.friction;

      // Apply gravity
      entity.velocityY += entity.gravity;
      entity.y += entity.velocityY;

      // Check for platform collisions
      let onGround = false;
      platforms.forEach(platform => {
          if (checkPlatformCollision(entity, platform)) {
              onGround = true;
              entity.y = platform.y - entity.height;
              entity.velocityY = 0;
          }
      });

      // Ground collision
      if (entity.y >= canvas.height - grassHeight - entity.height) {
          onGround = true;
          entity.y = canvas.height - grassHeight - entity.height;
          entity.velocityY = 0;
      }

      // Reset jumping state if on ground
      if (onGround) {
          entity.isJumping = false;
          entity.jumps = 0;
      }

      entity.x = Math.max(0, Math.min(entity.x, canvas.width - entity.width));

      // If the entity is the NPC, update its movement
      if (entity === npc) {
          updateNpcMovement(entity);
      }
  };

    // Add this function to spawn a new NPC
    const spawnNPC = () => {
        npc.x = Math.random() * (canvas.width - 64); // Random x position within the canvas
        npc.y = canvas.height - grassHeight - 64; // Keep it at grass height
        npc.hp = 100; // Reset HP
        npc.defeated = false; // Ensure it's not defeated on spawn
    };

    const openInventory = () => {
        const inventoryUI = document.getElementById('inventory-ui');
        if (inventoryUI.style.display === 'none') {
            inventoryUI.style.display = 'block'; // Show inventory
        } else {
            inventoryUI.style.display = 'none'; // Hide inventory
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

    // NPC movement logic
    const npcMovementInterval = 1000; // Time in milliseconds to change direction
    let npcMovementTimer = 0;

    // Update the NPC's movement
    const updateNpcMovement = (npc) => {
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

    const handleInput = () => {
        let leftPressed = false, rightPressed = false;

        window.addEventListener('keydown', (e) => {
            if (!reallydead) {
                switch(e.key) {
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
                }
            }
        });

        window.addEventListener('keyup', (e) => {
            switch(e.key) {
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

    // Update and check HP
    const updateHpBar = () => {
        const hpFill = document.getElementById('hp-fill');
        hpFill.style.width = `${(slime.hp / slime.maxHp) * 100}%`;
    };

    const takeDamage = damage => {
        slime.hp = Math.max(0, slime.hp - damage);
        updateHpBar();
    };

    const checkDeath = () => {
        if (slime.hp <= 0) {
            const death = document.getElementById('death');
            death.style.display = 'block';
            death.innerHTML = 'You Died!';
            death.style.backgroundColor = 'darkred';
            reallydead = true; 
        }
    };

    // Collision checks
    const checkCollision = (obj1, obj2) =>
        obj1.x < obj2.x + obj2.width && obj1.x + obj1.width > obj2.x &&
        obj1.y < obj2.y + obj2.height && obj1.y + obj1.height > obj2.y;

    // Improved collision checking for slime balls
    const checkBallCollision = (ball, entity) => {
        const ballRadius = ball.width / 2;
        const entityCenterX = entity.x + entity.width / 2;
        const entityCenterY = entity.y + entity.height / 2;
        const distX = ball.x - entityCenterX;
        const distY = ball.y - entityCenterY;
        const distance = Math.sqrt(distX * distX + distY * distY);
        return distance < ballRadius + entity.width / 2; // Assuming square entity
    };

    // Slime balls
    const createSlimeBall = () => ({
        x: slime.x + slime.width / 2,
        y: slime.y + slime.height / 2,
        width: 32, // Width of each frame in the sprite sheet
        height: 32, // Height of each frame in the sprite sheet
        speed: 7,
        direction: slime.velocityX >= 0 ? 1 : -1,
        damage: 1000,
        frameIndex: 0,
        frameCount: 0,
        maxFrames: 4, // Assuming 4 frames in the sprite sheet
    });


    const createFireball = () => ({
        x: slime.x + slime.width / 2,
        y: slime.y + slime.height / 2,
        width: 32,
        height: 32,
        speed: 10, // Slightly faster than slime balls
        direction: slime.velocityX >= 0 ? 1 : -1,
        damage: 30, // More damage than slime balls
        frameIndex: 0,
        frameCount: 0,
        maxFrames: 4,
        isFireball: true // Add this property to distinguish fireballs
    });

    const shootSlimeBall = () => {
        if (slimeBalls.length + fireBalls.length < 5) {
            if (skillTree.skills.fireballShot.unlocked) {
                fireBalls.push(createFireball());
            } else {
                slimeBalls.push(createSlimeBall());
            }
        }
    };

    const updateSlimeBalls = () => {
        slimeBalls.forEach((ball, index) => {
            ball.x += ball.speed * ball.direction;

            // Remove the ball if it goes off-screen
            if (ball.x < 0 || ball.x > canvas.width) {
                slimeBalls.splice(index, 1);
            }
        });
    
    };
    const updateFireBalls = () => {
        fireBalls.forEach((ball, index) => {
            ball.x += ball.speed * ball.direction;

            // Remove the ball if it goes off-screen
            if (ball.x < 0 || ball.x > canvas.width) {
                fireBalls.splice(index, 1);
            }
        });
    }

    const scale = 4; // Example scale factor

    const drawFireBalls = () => {
        fireBalls.forEach(ball => {
            if (++ball.frameCount > 5) {
                ball.frameIndex = (ball.frameIndex + 1) % ball.maxFrames;
                ball.frameCount = 0;
            }

            const scaledWidth = ball.width * scale;
            const scaledHeight = ball.height * scale;

            ctx.drawImage(
                fireGooBallSprite,
                ball.frameIndex * ball.width, 0,
                ball.width, ball.height,
                ball.x - scaledWidth / 2, ball.y - scaledHeight / 2,
                scaledWidth, scaledHeight
            );

            if (showHitboxes) {
                ctx.beginPath();
                ctx.arc(ball.x, ball.y, scaledWidth / 2, 0, Math.PI * 2);
                ctx.strokeStyle = 'orange';
                ctx.stroke();
            }
        });
    };

    const drawSlimeBalls = () => {
        
        slimeBalls.forEach(ball => {
            // Update frame
            if (++ball.frameCount > 5) { // Adjust this number to control animation speed
                ball.frameIndex = (ball.frameIndex + 1) % ball.maxFrames;
                ball.frameCount = 0;
            }

            // Calculate scaled dimensions
            const scaledWidth = ball.width * scale;
            const scaledHeight = ball.height * scale;

            
            // Draw the sprite with scaling
            ctx.drawImage(
                slimeBallSprite,
                ball.frameIndex * ball.width, 0, // Source x, y
                ball.width, ball.height, // Source width, height
                ball.x - scaledWidth / 2, ball.y - scaledHeight / 2, // Destination x, y
                scaledWidth, scaledHeight // Destination width, height
            );

            // Draw collision circle (if showHitboxes is true)
            if (showHitboxes) {
                ctx.beginPath();
                ctx.arc(ball.x, ball.y, scaledWidth / 2, 0, Math.PI * 2);
                ctx.strokeStyle = 'red';
                ctx.stroke();
            }
        });
    };


    const scaleItems = 3; // Scale factor for dropped items

    // Function to draw the dropped items
    const drawDroppedItems = (ctx) => {
        droppedItems.forEach(item => {
            if (item.isVisible) {
                const itemImg = itemSprites[item.itemName]; // Get the item's sprite info
                if (itemImg && itemImg.image) { // Use preloaded image
                    ctx.drawImage(
                        itemImg.image, // Use the preloaded image
                        itemImg.frameIndex * itemImg.frameWidth, 0, // Source x, y (frameIndex multiplied by frameWidth)
                        itemImg.frameWidth, itemImg.frameHeight, // Source width, height
                        item.x, item.y, // Destination x, y
                        item.width * scaleItems, item.height * scaleItems // Destination width, height (scaled)
                    );
                } else {
                    console.error(`Item image for ${item.itemName} not found.`);
                }
            }
        });
    };

    const checkItemPickup = () => {
        droppedItems.forEach((item, index) => {
            if (checkCollision(slime, item)) {
                if (Array.isArray(item.itemName)) {
                    item.itemName.forEach(name => addItemToInventory(name)); // Add each item individually
                } else {
                    addItemToInventory(item.itemName); // Add single item
                }
                droppedItems.splice(index, 1); // Remove item from the game
                console.log(`${item.itemName} picked up!`);
            }
        });
    };

    // Game logic
    let lastTimestamp = 0;
    const updateMovement = handleInput();


    const gameLoop = (timestamp) => {
        const deltaTime = timestamp - lastTimestamp; // Calculate delta time
        lastTimestamp = timestamp;

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        updateClouds(); 
        drawClouds();
        drawPlatforms(); // Add this line to draw platforms

        updateMovement();
        [slime, npc].forEach(entity => { drawEntity(entity); updateEntity(entity); });
        
        updateSlimeBalls();
        updateFireBalls();
        
        updateDroppedItems(); // Update dropped items
        // Check for item pickups
        drawDroppedItems(ctx);
        checkItemPickup(); // Check for picking up items here

        // Check collisions between slimeballs and NPC
        for (let i = slimeBalls.length - 1; i >= 0; i--) {
            const ball = slimeBalls[i];
            if (checkBallCollision(ball, npc)) {
                npc.hp -= ball.damage; 
                slimeBalls.splice(i, 1); 
                console.log(`${ball.isFireball ? 'Fireball' : 'Slimeball'} hit the NPC!`);
            }
        }

        for (let i = fireBalls.length - 1; i >= 0; i--) {
            const ball = fireBalls[i];
            if (checkBallCollision(ball, npc)) {
                npc.hp -= ball.damage; 
                fireBalls.splice(i, 1); 
                console.log(`${ball.isFireball ? 'Fireball' : 'Slimeball'} hit the NPC!`);
            }
        }
        
        // Drawing logic for fireballs or slimeballs
        if (skillTree.skills.fireballShot.unlocked) {
            drawFireBalls();
        } else {
            drawSlimeBalls();
        }

        handleCollision();
        checkDeath();
        // Start the animation loop
        requestAnimationFrame(gameLoop);
    };


// Start the game loop once the sprite sheet is loaded
slimeSprite.onload = gameLoop;

function openSkillTree() {
    updateSkillTreeUI();
    document.getElementById('skill-tree-ui').style.display = 'block';
}

function closeSkillTree() {
    document.getElementById('skill-tree-ui').style.display = 'none';
}

// Add event listener for closing skill tree (e.g., when 'Escape' is pressed)
window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        closeSkillTree(); // Close skill tree
        closeInventory(); // Assuming you have a function to close inventory
        // Close any other menus as needed
        closeOtherMenus(); // Placeholder for any additional menu close functions    
        }
    if (e.key === 't') { 
        openSkillTree();
    }
    if (e.key === 'i') { 
        openInventory();
    }
    if (e.key === 'z') {
        shootSlimeBall(); // This will shoot either a gooball or fireball based on unlocked skills
    }
});

// Modify the handleCollision function to fix XP gain
const handleCollision = () => {
    if (checkCollision(slime, npc)) {
        slime.x = slime.x < npc.x ? npc.x - slime.width : npc.x + npc.width;
        takeDamage(1);
    }
    
    if (npc.hp <= 0 && !npc.defeated) {
        // Create two dropped items
        const item1 = createDroppedItem(npc.x, npc.y, npc.itemDrop1);
        
        // Determine if the potion should drop
        if (Math.random() < 0.1) { // 10% chance
            const item2 = createDroppedItem(npc.x + 20, npc.y, 'Health Potion'); // Example potion
            droppedItems.push(item2);
            console.log('Health Potion dropped!');
        }
        
        droppedItems.push(item1); // Add the first item regardless
        
        console.log(`${npc.itemDrop1} dropped!`);
        gainExperience(50); // Grant XP upon defeating NPC
        respawnNPC();
        npc.defeated = true;
    }
    
};

const respawnNPC = () => {
    npc.x = -100; // Move NPC off-screen to the left
    npc.hp = 100; // Reset NPC HP
    setTimeout(() => {
        spawnNPC(); // Call the spawn function to place it at a new random position
        npc.defeated = false; // Reset the defeated state
    }/*Where to put */); // Adjust the delay for respawning if needed
};

// Modify the restart function to reset skill-related properties
function restart() {
    reallydead = false; 
    slime.hp = slime.maxHp; 
    death.style.display = 'none';
    applyAllUnlockedSkills();
}

// Add this new function to apply all unlocked skills
function applyAllUnlockedSkills() {
    for (const skillName in skillTree.skills) {
        if (skillTree.skills[skillName].unlocked) {
            applySkillEffect(skillName);
        }
    }
}


// Remove the unlockSkill function definition

// Update the applySkillEffect function and make it global
// Inside game.js
export function formatSkillName(skillName) {
    return skillName
        .split(/(?=[A-Z])/) // Split at uppercase letters
        .join(' ')          // Join with a space
        .replace(/\b\w/g, char => char.toUpperCase()); // Capitalize the first letter of each word
}

window.applySkillEffect = function(skillName) {
    switch(skillName) {
        case 'doubleJump':
            slime.maxJumps = 2;
            break;
        case 'fireballShot':
            slime.fireballDamage = 15;
            break;
        case 'healthBoost':
            slime.maxHp *= 1.5;
            slime.hp = slime.maxHp; // Restore health to max
            break;
        case 'speedBoost':
            slime.acceleration *= 1.5;
            slime.maxSpeed *= 1.5;
            break;
        case 'shieldBlock':
            activateShield();
            break;
        case 'speedDash':
            activateSpeedDash();
            break;
        case 'healthRegeneration':
            startHealthRegeneration();
            break;
        case 'areaAttack':
            performAreaAttack();
            break;
        case 'wallClimb':
            activateWallClimb();
            break;
        default:
            console.log(`Skill "${skillName}" not recognized.`);
    }
};


function activateShield() {
    slime.isShielded = true;
    setTimeout(() => slime.isShielded = false, 3000);
}

function activateSpeedDash() {
    slime.maxSpeed *= 2;
    setTimeout(() => slime.maxSpeed /= 2, 500);
}

function startHealthRegeneration() {
    const regenInterval = setInterval(() => {
        if (slime.hp < slime.maxHp) {
            slime.hp = Math.min(slime.maxHp, slime.hp + 2);
            updateHpBar();
        } else {
            clearInterval(regenInterval);
        }
    }, 2000);
}

function performAreaAttack() {
    // Logic for damaging nearby enemies (like NPC)
    if (checkCollision(slime, npc)) {
        npc.hp -= 30; // Example damage
        console.log('Area attack hit the NPC!');
    }
}

function activateWallClimb() {
    // Implement wall climb logic
    slime.canClimb = true;
    setTimeout(() => slime.canClimb = false, 5000);
}


// Function to add an item to the inventory
const addItemToInventory = (item) => {
    const existingItem = inventory.find(i => i.name === item);
    if (existingItem) {
        existingItem.count += 1; // Increment count if item exists
    } else {
        inventory.push({ name: item, count: 1 }); // Add new item
    }
    updateInventoryDisplay();
};


const updatePaginationControls = () => {
    const pagination = document.getElementById('pagination-controls');
    pagination.innerHTML = ''; // Clear current pagination

    const totalPages = Math.ceil(inventory.length / itemsPerPage);

    if (currentPage > 0) {
        const prevButton = document.createElement('button');
        prevButton.innerText = 'Previous';
        prevButton.onclick = () => changePage(currentPage - 1);
        pagination.appendChild(prevButton);
    }

    if (currentPage < totalPages - 1) {
        const nextButton = document.createElement('button');
        nextButton.innerText = 'Next';
        nextButton.onclick = () => changePage(currentPage + 1);
        pagination.appendChild(nextButton);
    }
};

const changePage = (newPage) => {
    currentPage = newPage;
    updateInventoryDisplay(); // Refresh the inventory display
};



// Example function to collect items
const collectItem = () => {
    const newItem = 'Slime Jelly'; // Replace this with actual item logic
    addItemToInventory(newItem);
};

window.addEventListener('keydown', (e) => {
    if (e.key === 'c') {
      testXP();
    }
});

const itemEffects = {
    'Slime Jelly': () => {
        slime.hp = Math.min(slime.maxHp, slime.hp + 10); // Heal the slime
        console.log('Used Slime Jelly! HP restored.');
        updateHpBar(); // Update the HP bar after using the item

    },
    'Health Potion': () => {
        slime.hp = Math.min(slime.maxHp, slime.hp + 50); // Heal more
        console.log('Used Health Potion! HP restored significantly.');
        updateHpBar(); // Update the HP bar after using the item
    },
}

function useItem(item) {
    if (itemEffects[item]) {
        itemEffects[item](); // Call the effect function
        removeItemFromInventory(item); // Remove item after use
    } else {
        console.error(`No effect defined for item: ${item}`);
    }
}

// (Optional) Function to remove an item from the inventory
function removeItemFromInventory(item) {
    const index = inventory.findIndex(i => i.name === item);
    if (index > -1) {
        if (inventory[index].count > 1) {
            inventory[index].count -= 1; // Decrement count
        } else {
            inventory.splice(index, 1); // Remove item if count is 0
        }
        updateInventoryDisplay(); // Update display
    }
}


// Function to update the inventory display
const updateInventoryDisplay = () => {
    const inventoryList = document.getElementById('inventory-list');
    inventoryList.innerHTML = ''; // Clear current list

    const startIndex = currentPage * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const itemsToDisplay = inventory.slice(startIndex, endIndex);

    for (const item of itemsToDisplay) {
        const listItem = document.createElement('li');
        listItem.textContent = `${item.name} (x${item.count})`; // Show count

        // Create an image canvas for the item
        const itemImg = itemSprites[item.name];
        if (itemImg) {
            const itemCanvas = document.createElement('canvas');
            itemCanvas.width = itemImg.frameWidth * scaleFactor;
            itemCanvas.height = itemImg.frameHeight * scaleFactor;

            const ctx = itemCanvas.getContext('2d');
            ctx.imageSmoothingEnabled = false; // Disable image smoothing

            const spriteImage = new Image();
            spriteImage.src = itemImg.src;

            spriteImage.onload = () => {
                ctx.drawImage(
                    spriteImage,
                    itemImg.frameIndex * itemImg.frameWidth, 0,
                    itemImg.frameWidth, itemImg.frameHeight,
                    10, -5,
                    itemImg.frameWidth * scaleFactor, itemImg.frameHeight * scaleFactor
                );
            };

            listItem.appendChild(itemCanvas);
        } else {
            console.error(`Item ${item.name} not found in itemSprites.`);
        }

        listItem.onclick = () => useItem(item.name);
        inventoryList.appendChild(listItem);
    }

    updatePaginationControls(); // Update pagination controls
};

function closeInventory() {
    document.getElementById('inventory-ui').style.display = 'none'; // Adjust based on your UI
}

const platforms = [
    { x: 200, y: 400, width: 200, height: 20 },
    { x: 500, y: 300, width: 150, height: 20 },
    { x: 750, y: 200, width: 180, height: 20 }
];

const drawPlatforms = () => {
    ctx.fillStyle = 'brown';
    platforms.forEach(platform => {
        ctx.fillRect(platform.x, platform.y, platform.width, platform.height);
    });
};

const checkPlatformCollision = (entity, platform) => {
    return entity.x < platform.x + platform.width &&
           entity.x + entity.width > platform.x &&
           entity.y + entity.height <= platform.y &&
           entity.y + entity.height + entity.velocityY > platform.y;
};
