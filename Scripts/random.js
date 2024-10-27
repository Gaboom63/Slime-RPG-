import {slime, ctx, canvas} from './game.js';
//Clouds 
const clouds = [];
const createCloud = () => ({
    x: canvas.width, y: Math.random() * canvas.height / 2,
    width: Math.random() * 100 + 50, height: Math.random() * 50 + 25,
    speed: Math.random() * 0.5 + 0.1
});

export const updateClouds = () => {
    if (Math.random() < 0.005) clouds.push(createCloud());
    clouds.forEach((cloud, index) => {
        cloud.x -= cloud.speed;
        if (cloud.x + cloud.width < 0) clouds.splice(index, 1);
    });
};

export const drawClouds = () => {
    ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
    clouds.forEach(cloud => {
        ctx.beginPath();
        ctx.ellipse(cloud.x, cloud.y, cloud.width / 2, cloud.height / 2, 0, 0, Math.PI * 2);
        ctx.fill();
    });
};

//Pages 



export const updatePaginationControls = () => {
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

// Update and check HP
export const updateHpBar = () => {
    const hpFill = document.getElementById('hp-fill');
    hpFill.style.width = `${(slime.hp / slime.maxHp) * 100}%`;
};

export const takeDamage = damage => {
    slime.hp = Math.max(0, slime.hp - damage);
    updateHpBar();
};

export const checkDeath = () => {
    if (slime.hp <= 0) {
        const death = document.getElementById('death');
        death.style.display = 'block';
        death.innerHTML = 'You Died!';
        death.style.backgroundColor = 'darkred';
        stopTheControl = true;
    }
};