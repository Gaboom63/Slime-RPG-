import { scaleFactor, } from './game.js';
import {itemSprites} from './sprites.js';
import {npcSprites} from './npc.js';
import {itemsPerPage, useItem} from './items.js';
import {updatePaginationControls} from './random.js';

export const slimeJournal = [];; 
export const inventory = [];
let stopTheControl = false;
export let currentPage = 0; // Start at the first page
export const openInventory = () => {
    const inventoryUI = document.getElementById('inventory-ui');
    if (inventoryUI.style.display === 'none') {
        inventoryUI.style.display = 'block'; // Show inventory
    } else {
        inventoryUI.style.display = 'none'; // Hide inventory
    }
};

// Function to add an item to the inventory
export const addItemToInventory = (item) => {
    const existingItem = inventory.find(i => i.name === item);
    if (existingItem) {
        existingItem.count += 1; // Increment count if item exists
    } else {
        inventory.push({ name: item, count: 1 }); // Add new item
    }
    updateInventoryDisplay();
};

export function removeItemFromInventory(item) {
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
export const updateInventoryDisplay = () => {
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

export function closeInventory() {
    document.getElementById('inventory-ui').style.display = 'none'; // Adjust based on your UI
}

export const displaySlimeJournal = () => {
    const journalUI = document.getElementById('journal-ui');
    journalUI.innerHTML = ''; // Clear previous entries
    // Calculate the start and end index for slicing the journal array
    const startIndex = currentPage * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const entriesToDisplay = slimeJournal.slice(startIndex, endIndex);

    entriesToDisplay.forEach(entry => {
        const entryDiv = document.createElement('div');

        const enemyImage = document.createElement('img');
        enemyImage.src = npcSprites[entry.type] || 'default-image.png';
        enemyImage.alt = entry.type;
        enemyImage.style.width = '32px';
        enemyImage.style.height = '32px';
        enemyImage.style.verticalAlign = 'middle';

        entryDiv.appendChild(enemyImage);
        entryDiv.appendChild(document.createTextNode(` Defeated ${entry.type} on ${entry.timestamp}. Items Dropped: ${entry.itemsDropped.join(', ')}`));
        entryDiv.appendChild(document.createElement('br'));

        journalUI.appendChild(entryDiv);
    });

    // Add pagination controls
    const paginationDiv = document.createElement('div');

    // Previous Button
    if (currentPage > 0) {
        const prevButton = document.createElement('button');
        prevButton.textContent = 'Previous';
        prevButton.onclick = () => {
            currentPage--;
            displaySlimeJournal();
        };
        paginationDiv.appendChild(prevButton);
    }

    // Next Button
    if (endIndex < slimeJournal.length) {
        const nextButton = document.createElement('button');
        nextButton.textContent = 'Next';
        nextButton.onclick = () => {
            currentPage++;
            displaySlimeJournal();
        };
        paginationDiv.appendChild(nextButton);
    }

    journalUI.appendChild(paginationDiv);

    if (journalUI.style.display === 'block') {
        journalUI.style.display = 'none'; // Show inventory
        stopTheControl = false;

    } else {
        journalUI.style.display = 'block'; // Show the journal
        stopTheControl = true;

    }
    window.addEventListener('keydown', (e) => {
        if (e.key === 'j') {
            displaySlimeJournal(); // Toggle journal when 'J' is pressed
        }
    });

};