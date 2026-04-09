const grid = document.getElementById('palette-grid');
const generateBtn = document.getElementById('generate-btn');
const countSelector = document.getElementById('card-count');
const formatBtn = document.getElementById('format-toggle');

let isHsl = false;

// Helpers
const rgbToHex = (rgb) => {
    if (!rgb || rgb.startsWith('#')) return rgb || "#000000";
    const vals = rgb.match(/\d+/g);
    return "#" + vals.map(x => parseInt(x).toString(16).padStart(2, '0')).join('').toUpperCase();
};

const hexToHsl = (hex) => {
    let r = parseInt(hex.slice(1, 3), 16) / 255;
    let g = parseInt(hex.slice(3, 5), 16) / 255;
    let b = parseInt(hex.slice(5, 7), 16) / 255;
    let max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h, s, l = (max + min) / 2;
    if (max == min) h = s = 0;
    else {
        let d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch (max) {
            case r: h = (g - b) / d + (g < b ? 6 : 0); break;
            case g: h = (b - r) / d + 2; break;
            case b: h = (r - g) / d + 4; break;
        }
        h /= 6;
    }
    return `H:${Math.round(h * 360)} S:${Math.round(s * 100)} L:${Math.round(l * 100)}`;
};

// Create a new card object
function createCard(existingHex = null) {
    const card = document.createElement('div');
    card.className = 'color-card';
    card.dataset.locked = "false";
    
    const hex = existingHex || '#' + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0').toUpperCase();
    card.style.backgroundColor = hex;
    
    card.innerHTML = `
        <div class="card-btns">
            <button class="btn-mini lock-trigger">BLOCK</button>
            <button class="btn-mini move-trigger">TOP</button>
        </div>
        <div class="color-info">${isHsl ? hexToHsl(hex) : hex}</div>
    `;

    // Event Delegation
    card.addEventListener('click', (e) => {
        if (e.target.classList.contains('lock-trigger')) {
            const isCurrentlyLocked = card.dataset.locked === "true";
            card.dataset.locked = !isCurrentlyLocked;
            card.classList.toggle('locked');
            e.target.innerText = isCurrentlyLocked ? "BLOCK" : "UNLOCKED";
            e.stopPropagation();
        } else if (e.target.classList.contains('move-trigger')) {
            grid.prepend(card);
            e.stopPropagation();
        } else {
            const colorText = card.querySelector('.color-info').innerText;
            navigator.clipboard.writeText(colorText);
            const originalText = generateBtn.innerText;
            generateBtn.innerText = "COPIED!";
            setTimeout(() => generateBtn.innerText = originalText, 800);
        }
    });

    return card;
}

// Logic to handle generation and grid resizing
function handlePaletteLogic(isResizing = false) {
    const targetCount = parseInt(countSelector.value);
    const currentCards = Array.from(grid.querySelectorAll('.color-card'));
    
    if (isResizing) {
        // 1. Separate locked from unlocked
        const locked = currentCards.filter(c => c.dataset.locked === "true");
        const unlocked = currentCards.filter(c => c.dataset.locked === "false");
        
        grid.innerHTML = '';
        grid.className = `grid-${targetCount}`;

        // 2. Re-insert locked cards first (they keep their colors/state)
        locked.slice(0, targetCount).forEach(c => grid.appendChild(c));

        // 3. Fill the rest with either old unlocked cards or brand new ones
        let remaining = targetCount - grid.children.length;
        if (remaining > 0) {
            unlocked.slice(0, remaining).forEach(c => grid.appendChild(c));
        }

        remaining = targetCount - grid.children.length;
        for (let i = 0; i < remaining; i++) {
            grid.appendChild(createCard());
        }
    }

    // 4. Update colors ONLY for cards where locked is strictly "false"
    const cardsToUpdate = grid.querySelectorAll('.color-card');
    cardsToUpdate.forEach(card => {
        if (card.dataset.locked === "false") {
            const newHex = '#' + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0').toUpperCase();
            card.style.backgroundColor = newHex;
            card.querySelector('.color-info').innerText = isHsl ? hexToHsl(newHex) : newHex;
        }
    });
}

// Format Toggle Logic
formatBtn.addEventListener('click', () => {
    isHsl = !isHsl;
    formatBtn.innerText = isHsl ? "HSL" : "HEX";
    grid.querySelectorAll('.color-card').forEach(card => {
        const currentHex = rgbToHex(card.style.backgroundColor);
        card.querySelector('.color-info').innerText = isHsl ? hexToHsl(currentHex) : currentHex;
    });
});

// Controls
generateBtn.addEventListener('click', () => handlePaletteLogic(false));
countSelector.addEventListener('change', () => handlePaletteLogic(true));
window.addEventListener('keydown', (e) => { 
    if (e.code === 'Space') {
        e.preventDefault(); // Stop page from scrolling
        handlePaletteLogic(false);
    }
});

// Initial Load
handlePaletteLogic(true);
