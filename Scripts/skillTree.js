import {slime, stopTheControl} from './game.js';
// Skill Tree System
let currentLevel =  1;
let currentXP = 0;
let xpToNextLevel = 100;
let canFluderJump = false;

export const skillTree = {
    level: currentLevel,
    experience: currentXP,
    skillPoints: 20,
    skills: {
        doubleJump: {
            unlocked: false,
            cost: 1,
            displayName: "Double Jump", // Add display name
            description: "Allows the slime to jump twice"
        },
        fluderJump: {
            unlocked: false,
            cost: 1,
            displayName: "Fludder Jump", // Add display name
            description: "Fly... For like a second"
        },
        fireballShot: {
            unlocked: false,
            cost: 2,
            displayName: "Fireball Shot", // Add display name
            description: "Shoot fireballs instead of slime balls"
        },
        healthBoost: {
            unlocked: false,
            cost: 1,
            displayName: "Health Boost", // Add display name
            description: "Increases max health by 50%"
        },
        speedBoost: {
            unlocked: false,
            cost: 1,
            displayName: "Speed Boost", // Add display name
            description: "Increases movement speed by 20%"
        },
        shieldBlock: {
            unlocked: false,
            cost: 2,
            displayName: "Shield Block", // Add display name
            description: "Temporarily reduces damage taken by 50%"
        },
        speedDash: {
            unlocked: false,
            cost: 1,
            displayName: "Speed Dash", // Add display name
            description: "Dashes forward quickly"
        },
        healthRegeneration: {
            unlocked: false,
            cost: 3,
            displayName: "Health Regeneration", // Add display name
            description: "Regain 2 HP every 2 seconds for 10 seconds"
        },
        areaAttack: {
            unlocked: false,
            cost: 3,
            displayName: "Area Attack", // Add display name
            description: "Deals damage to all nearby enemies"
        },
        wallClimb: {
            unlocked: false,
            cost: 4,
            displayName: "Wall Climb", // Add display name
            description: "Climb vertical surfaces for a short duration"
        }
    }
};


const skillsArray = Object.entries(skillTree.skills);
const skillsPerPage = 4;
let currentPage = 0;
const totalPages = Math.ceil(skillsArray.length / skillsPerPage);

export function testXP() {
    currentXP += 20; 
    skillTree.experience = currentXP; 

}
export function gainExperience(amount) {
    currentXP += amount;
    skillTree.experience = currentXP; 
    while (currentXP >= xpToNextLevel) {
        levelUp();
    }
    updateXPBar();
    updateSkillTreeUI(); 
}

export function levelUp() {
    currentLevel++;
    skillTree.level = currentLevel; 
    skillTree.skillPoints++; 
    currentXP = 0; 
    xpToNextLevel = Math.floor(xpToNextLevel * 1.5); 
    console.log(`Leveled up to ${currentLevel}! Next level at ${xpToNextLevel} XP.`);
}

export function updateXPBar() {
    const xpBar = document.getElementById('xp2-bar');
    if (xpBar) {
        const xpPercentage = Math.min((currentXP / xpToNextLevel) * 100, 100);
        xpBar.style.width = `${xpPercentage}%`;
    }
}

export function updateSkillTreeUI() {
    document.getElementById('skill-tree-level').textContent = `Level: ${skillTree.level}`;
    document.getElementById('skill-tree-exp').textContent = `XP Till Next Level: ${skillTree.experience}/${xpToNextLevel}`;
    document.getElementById('skill-tree-points').textContent = `Skill Points: ${skillTree.skillPoints}`;

    const skillList = document.getElementById('skill-list');
    skillList.innerHTML = '';

    const start = currentPage * skillsPerPage;
    const end = start + skillsPerPage;
    const skillsToShow = skillsArray.slice(start, end);

    skillsToShow.forEach(([skillName, skill]) => {
        const button = document.createElement('button');
        button.className = 'skill-button';
        // Use displayName instead of skillName
        button.textContent = `${skill.displayName} (Cost: ${skill.cost})`;
        button.disabled = skill.unlocked || skillTree.skillPoints < skill.cost; 
        button.onclick = () => unlockSkill(skillName);

        const description = document.createElement('p');
        description.textContent = skill.description;

        const skillDiv = document.createElement('div');
        skillDiv.appendChild(button);
        skillDiv.appendChild(description);
        skillList.appendChild(skillDiv);
    });

    updatePaginationButtons();
}


export function unlockSkill(skillName) {
    const skill = skillTree.skills[skillName];
    if (skill && !skill.unlocked && skillTree.skillPoints >= skill.cost) {
        skill.unlocked = true;
        skillTree.skillPoints -= skill.cost;
        console.log(`Unlocked skill: ${skillName}`);
        applySkillEffect(skillName);
        updateSkillTreeUI();
    } else {
        console.error(`Failed to unlock skill: ${skillName}. Either already unlocked or not enough points.`);
    }
}

function applySkillEffect(skillName) {
    if (typeof window.applySkillEffect === 'function') {
        window.applySkillEffect(skillName);
    } else {
        console.error('applySkillEffect function not found in game.js');
    }
}

// Pagination Functions
const updatePaginationButtons = () => {
    const prevButton = document.getElementById('prev-page');
    const nextButton = document.getElementById('next-page');

    prevButton.style.display = currentPage > 0 ? 'block' : 'none';
    nextButton.style.display = currentPage < totalPages - 1 ? 'block' : 'none';
};

const nextPage = () => {
    if (currentPage < totalPages - 1) {
        currentPage++;
        updateSkillTreeUI();
    }
};

const prevPage = () => {
    if (currentPage > 0) {
        currentPage--;
        updateSkillTreeUI();
    }
};
export function openSkillTree() {
    updateSkillTreeUI();
    document.getElementById('skill-tree-ui').style.display = 'block';
}

export function closeSkillTree() {
    document.getElementById('skill-tree-ui').style.display = 'none';
}
// Adding event listeners for page navigation
document.getElementById('next-page').addEventListener('click', nextPage);
document.getElementById('prev-page').addEventListener('click', prevPage);

// Initialize skill tree UI
updateSkillTreeUI();

export function formatSkillName(skillName) {
    return skillName
        .split(/(?=[A-Z])/) // Split at uppercase letters
        .join(' ')          // Join with a space
        .replace(/\b\w/g, char => char.toUpperCase()); // Capitalize the first letter of each word
}

window.applySkillEffect = function (skillName) {
    switch (skillName) {
        case 'doubleJump':
            slime.maxJumps = 2;
            break;
        case 'fireballShot':
            slime.fireballDamage = 15;
            break;
        case 'fluderJump':
            canFluderJump = true;
            fludderJump();
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


export function activateShield() {
    slime.isShielded = true;
    setTimeout(() => slime.isShielded = false, 3000);
}

export function activateSpeedDash() {
    slime.maxSpeed *= 2;
    setTimeout(() => slime.maxSpeed /= 2, 500);
}

export function startHealthRegeneration() {
    const regenInterval = setInterval(() => {
        if (slime.hp < slime.maxHp) {
            slime.hp = Math.min(slime.maxHp, slime.hp + 2);
            updateHpBar();
        } else {
            clearInterval(regenInterval);
        }
    }, 2000);
}

export function performAreaAttack() {
    // Logic for damaging nearby enemies (like NPC)
    if (checkCollision(slime, npc)) {
        npc.hp -= 30; // Example damage
        console.log('Area attack hit the NPC!');
    }
}

export function activateWallClimb() {
    // Implement wall climb logic
    slime.canClimb = true;
    setTimeout(() => slime.canClimb = false, 5000);
}

export function fludderJump() {
    // Adjust this part in your handleInput or main game loop
    if (canFluderJump && !stopTheControl) {
      window.addEventListener('keydown', (e) => {
          if (e.key === 'f' && slime.jumps < slime.maxJumps) {
              slime.velocityY = -slime.jumpStrength; // Apply an upward force for the fluder jump
              
              // Temporarily increase the jump strength
              const originalGravity = slime.gravity; // Store the original gravity
              slime.gravity = originalGravity * 0.3; // Make gravity half as strong for a brief moment
  
              setTimeout(() => {
                  slime.gravity = originalGravity; // Revert to the original gravity
              }, 400); // Shorter duration for the boost
              
              slime.jumps++; // Increment jumps to track the fluder jump
          }
      });
      } else {
  
      }
  
  
  
  }
  
// Export relevant variables for access in other modules
export { currentLevel, currentXP, xpToNextLevel };

