import {canvas, ctx, slime} from './game.js';
import { itemSprites } from "./sprites.js";
import {checkCollision} from './collision.js';
import {addItemToInventory, removeItemFromInventory} from './inventory.js';
import {updateHpBar} from './random.js';
export let droppedItems = []; // Array to hold dropped items
let gotanitem = false;
export const itemsPerPage = 3; // Number of items per page
let stopTheControl = false;
export const createDroppedItem = (x, y, itemName, scale = 3) => {
    const itemSprite = itemSprites[itemName];
    if (!itemSprite) {
        console.error(`No sprite found for item: ${itemName}`);
        return null;
    }

    // Modify the height as needed (e.g., increase the scale)
    const heightScale = 2; // Adjust this value to change the height
    return {
        x: x + Math.random() * 40 - 20,
        y: y - 14, // Still spawn above ground
        width: itemSprite.frameWidth * scale,
        height: itemSprite.frameHeight * scale, // Scale the height
        itemName: itemName,
        isVisible: true,
        velocityY: 2,
        gravity: 0.5,
        isOnGround: true,
        frameIndex: 0,
        frameCount: 0,
        maxFrames: 3,
        frameDelay: 10
    };
};

export const updateDroppedItems = () => {
    droppedItems.forEach(item => {
        // Apply gravity only if the item is not on the ground
        if (!item.isOnGround) {
            item.velocityY += item.gravity;
            item.y += item.velocityY;

            // Check if the item has reached the ground
            if (item.y >= canvas.height - grassHeight - item.height) {
                item.y = canvas.height - grassHeight - item.height; // Place it on the ground
                item.velocityY = 0; // Reset vertical velocity
                item.isOnGround = true; // Mark item as on the ground
            }
        }

        // Update frame for animation
        if (++item.frameCount > item.frameDelay) {
            item.frameIndex = (item.frameIndex + 1) % item.maxFrames;
            item.frameCount = 0;
        }
    });
};

export const drawDroppedItems = () => {
    droppedItems.forEach(item => {
        const sprite = itemSprites[item.itemName];
        if (sprite && sprite.image) {
            ctx.drawImage(
                sprite.image,
                item.frameIndex * sprite.frameWidth, 0,
                sprite.frameWidth, sprite.frameHeight,
                item.x, item.y,
                item.width, item.height
            );
        }
    });
};

export const checkItemPickup = () => {
    droppedItems.forEach((item, index) => {
        if (checkCollision(slime, item)) {
            if (Array.isArray(item.itemName)) {
                item.itemName.forEach(name => addItemToInventory(name)); // Add each item individually
            } else {
                if (gotanitem === false) {
                    stopTheControl = true;
                    const firstItem = document.getElementById('first-item');
                    const firstItemP = document.getElementById('first-item-p');
                    const firstItemP2 = document.getElementById('first-item-p2');
                    firstItem.style.display = 'block';
                    firstItemP.textContent = `You Got Your First Item!`
                    firstItemP2.textContent = `A ${item.itemName}. Press i To Open Your Inventory!`;
                    addItemToInventory(item.itemName); // Add single item
                    setTimeout(() => firstItem.style.display = 'none', 2000);
                    setTimeout(() => stopTheControl = false, 2000);
                    gotanitem = true;

                } else {
                    addItemToInventory(item.itemName); // Add single item
                }
            }
            droppedItems.splice(index, 1); // Remove item from the game
            console.log(`${item.itemName} picked up!`);
        }
    });
};

export const itemEffects = {
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

export function useItem(item) {
    if (itemEffects[item]) {
        itemEffects[item](); // Call the effect function
        removeItemFromInventory(item); // Remove item after use
    } else {
        console.error(`No effect defined for item: ${item}`);
    }
}

export const preloadImages = (itemNames) => {
    itemNames.forEach(itemName => {
        const img = new Image();
        img.src = itemSprites[itemName].src; // Load each item image
        itemSprites[itemName].image = img; // Store the loaded image
    });
};