import {skillTree} from './skillTree.js'
import {npcs, npcDefeated} from './npc.js';
import {slimeBallSprite, fireGooBallSprite} from './sprites.js';
import {canvas, ctx, slime, showHitboxes} from './game.js';
export const slimeBalls = [];
export const fireBalls = [];
export const scale = 4; // Example scale factor

// Improved collision checking for slime balls
export const checkBallCollision = (ball, entity) => {
    const ballRadius = ball.width / 2;
    const entityCenterX = entity.x + entity.width / 2;
    const entityCenterY = entity.y + entity.height / 2;
    const distX = ball.x - entityCenterX;
    const distY = ball.y - entityCenterY;
    const distance = Math.sqrt(distX * distX + distY * distY);

    return distance < ballRadius + entity.width / 2; // Assuming square entity
};

export const createSlimeBall = () => ({
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
    timestamp: Date.now() // Add the current timestamp
});

export const createFireball = () => ({
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
    isFireball: true, // Add this property to distinguish fireballs
    timestamp: Date.now() // Add the current timestamp

});

export const shootSlimeBall = () => {
    if (slimeBalls.length + fireBalls.length < 5) {
        if (skillTree.skills.fireballShot.unlocked) {
            fireBalls.push(createFireball());
        } else {
            slimeBalls.push(createSlimeBall());

        }
    }
};

export const updateSlimeBalls = () => {
    slimeBalls.forEach((ball, index) => {
        const currentTime = Date.now();
        ball.x += ball.speed * ball.direction;

        if (currentTime - ball.timestamp > 2000) {
            slimeBalls.splice(index, 1); // Remove the ball
            console.log('Slimeball disappeared after 5 seconds');
        }
        // Instead of removing the ball if it goes off-screen, you can just set its direction or perform other logic
        if (ball.x < 0 || ball.x > canvas.width) {
            // Optional: reverse direction or reset position
            // ball.direction *= -1; // Uncomment to make them bounce back
            // ball.x = ball.x < 0 ? 0 : canvas.width; // Uncomment to reset to the edge
        }
    });
};

export const updateFireBalls = () => {
    const currentTime = Date.now();
    fireBalls.forEach((ball, index) => {
        ball.x += ball.speed * ball.direction;

        // Check if 2 seconds have passed since the fireball was created
        if (currentTime - ball.timestamp > 2000) {
            fireBalls.splice(index, 1); // Remove the fireball
            console.log('Fireball disappeared after 2 seconds');
        }

        // Optional logic for off-screen fireballs
        if (ball.x < 0 || ball.x > canvas.width) {
            // You can choose to reverse direction or reset position if desired
            // ball.direction *= -1; // Uncomment to make them bounce back
            // ball.x = ball.x < 0 ? 0 : canvas.width; // Uncomment to reset to the edge
        }
    });
};

export const drawFireBalls = () => {
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

export const drawSlimeBalls = () => {

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

// Function to handle collisions between balls and NPCs
export const handleBallCollisions = (balls, type) => {
    for (let i = balls.length - 1; i >= 0; i--) {
        const ball = balls[i];
        npcs.forEach(npc => {
            if (!npc.defeated && checkBallCollision(ball, npc)) {
                // Check if the NPC is a fireSlime
                if (npc.type === 'fireSlime' && type === 'fireball') {
                    console.log('FireSlime resisted damage!');
                    balls.splice(i, 1);
                } else {
                    // Apply damage to other NPCs, or if it's a slime ball
                    npc.hp -= ball.damage; // Apply damage
                    console.log(`${type.charAt(0).toUpperCase() + type.slice(1)} hit the ${npc.type}!`);
                    balls.splice(i, 1); // Remove the ball on hit
                    
                    // Check if the NPC is defeated
                    if (npc.hp <= 0) {
                        npcDefeated(npc);
                    }
                }
            }
        });
    }
};