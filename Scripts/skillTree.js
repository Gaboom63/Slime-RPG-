// Skill Tree System
let currentLevel = 1;
let currentXP = 0;
let xpToNextLevel = 100;

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

// Adding event listeners for page navigation
document.getElementById('next-page').addEventListener('click', nextPage);
document.getElementById('prev-page').addEventListener('click', prevPage);

// Initialize skill tree UI
updateSkillTreeUI();

// Export relevant variables for access in other modules
export { currentLevel, currentXP, xpToNextLevel };
