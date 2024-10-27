// Load the sprite sheet
export const slimeSprite = new Image();
slimeSprite.src = 'images/characters/Boom.png';

export const badslimeSprite = new Image();
badslimeSprite.src = 'images/characters/BadBoom.png';

// Load the slimeball sprite sheet
export const slimeBallSprite = new Image();
slimeBallSprite.src = 'images/Utilites/GooBall.png'; // Make sure this path is correct

export const fireGooBallSprite = new Image();
fireGooBallSprite.src = 'images/Utilites/fireGooBall.png'; // Changed 'sec' to 'src'

export const itemSpriteSheet = new Image();
itemSpriteSheet.src = 'images/Items/slimeJelly.png'; // Path to your item sprite sheet

export const potionitemSpriteSheet = new Image();
potionitemSpriteSheet.src = 'images/Items/basicPotion.png'; // Path to your item sprite sheet

export const boomy = new Image();
boomy.src = 'images/characters/Boomy.png';

export const fireBoom = new Image();
fireBoom.src = 'images/characters/fireBoom.png'; // Path to your item sprite sheet

export const itemSprites = {
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