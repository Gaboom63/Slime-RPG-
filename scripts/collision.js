import {npcs, npcDefeated} from './npc.js';
import {slime} from './game.js';
import {slimeBalls, fireBalls, checkBallCollision} from './slimeballs.js'
import {takeDamage} from './random.js'
export const checkCollision = (obj1, obj2) =>
    obj1.x < obj2.x + obj2.width && obj1.x + obj1.width > obj2.x &&
    obj1.y < obj2.y + obj2.height && obj1.y + obj1.height > obj2.y;

// Modify the handleCollision function to fix XP gain
export const handleCollision = () => {
    npcs.forEach(npc => {
        if (!npc || npc.defeated) return; // Skip if npc is undefined or already defeated

        // Check for collision between slime and NPC
        if (checkCollision(slime, npc)) {
            slime.x = slime.x < npc.x ? npc.x - slime.width : npc.x + npc.width;
            takeDamage(1);
        }

        // Check for collision between slimeballs/fireballs and NPC
        [...slimeBalls, ...fireBalls].forEach((ball, index) => {
            if (checkBallCollision(ball, npc)) {
                npc.hp -= ball.damage;
                if (ball.isFireball) {
                    fireBalls.splice(fireBalls.indexOf(ball), 1);
                } else {
                    slimeBalls.splice(slimeBalls.indexOf(ball), 1);
                }
                console.log(`${ball.isFireball ? 'Fireball' : 'Slimeball'} hit the NPC! NPC HP: ${npc.hp}`);
            }
        });

        // Check if NPC is defeated
        if (npc.hp <= 0 && !npc.defeated) {
            npc.defeated = true;
            console.log('NPC defeated!');

            // Drop items
            const item1 = createDroppedItem(npc.x, npc.y, npc.itemDrop[0]);
            if (item1) {
                droppedItems.push(item1);
                console.log(`${npc.itemDrop[0]} dropped!`);
            }

            // Chance to drop health potion
            if (Math.random() < 0.1) { // 10% chance
                const healthPotion = createDroppedItem(npc.x + 20, npc.y, 'Health Potion');
                if (healthPotion) {
                    droppedItems.push(healthPotion);
                    console.log('Health Potion dropped!');
                }
            }

            gainExperience(50); // Grant XP upon defeating NPC
            setTimeout(() => respawnNPC(npc), 5000); // Respawn after 5 seconds
        }
    });
};

