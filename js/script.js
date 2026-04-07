const palette = document.getElementById('palette');
const generateBtn = document.getElementById('generateBtn');
const cardCountSelect = document.getElementById('cardCount');
const formatSwitch = document.getElementById('formatSwitch');

let currentFormat = 'HEX'; // Switch between HEX and HSL

// Generate random Hex
const getRandomHex = () => `#${Math.floor(Math.random()*16777215).toString(16).padStart(6, '0')}`;

// Convert Hex to HSL
function hexToHSL(hex) {
    let r = parseInt(hex.slice(1,3), 16) / 255, g = parseInt(hex.slice(3,5), 16) / 255, b = parseInt(hex.slice(5,7), 16) / 255;
    let max = Math.max(r, g, b), min = Math.min(r, g, b), h, s, l = (max + min) / 2;
    if(max === min) h = s = 0;
    else {
        let d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch(max) { case r: h = (g - b) / d + (g < b ? 6 : 0); break; case g: h = (b - r) / d + 2; break; case b: h = (r - g) / d + 4; break; }
        h /= 6;
    }
    return `hsl(${Math.round(h*360)}, ${Math.round(s*100)}%, ${Math.round(l*100)}%)`;
}

function createCards() {
    const count = parseInt(cardCountSelect.value);
    palette.className = `palette-grid grid-${count}`;
    palette.innerHTML = '';
    for (let i = 0; i < count; i++) {
        const hex = getRandomHex();
        const card = document.createElement('div');
        card.className = 'card';
        card.style.backgroundColor = hex;
        card.dataset.hex = hex;
        card.dataset.locked = "false";
        card.innerHTML = `
            <div class="card-info">
                <span class="color-code">${currentFormat === 'HEX' ? hex : hexToHSL(hex)}</span>
                <button class="lock-btn">🔓</button>
            </div>`;
        palette.appendChild(card);
    }
}

// Update only non-locked colors
generateBtn.addEventListener('click', () => {
    document.querySelectorAll('.card').forEach(card => {
        if (card.dataset.locked === "false") {
            const newHex = getRandomHex();
            card.style.backgroundColor = newHex;
            card.dataset.hex = newHex;
            card.querySelector('.color-code').innerText = currentFormat === 'HEX' ? newHex : hexToHSL(newHex);
        }
    });
});

// Toggle HEX/HSL format
formatSwitch.addEventListener('click', () => {
    currentFormat = currentFormat === 'HEX' ? 'HSL' : 'HEX';
    formatSwitch.innerText = currentFormat;
    document.querySelectorAll('.card').forEach(card => {
        card.querySelector('.color-code').innerText = currentFormat === 'HEX' ? card.dataset.hex : hexToHSL(card.dataset.hex);
    });
});

// Delegation for Lock and Copy
palette.addEventListener('click', (e) => {
    const card = e.target.closest('.card');
    if (e.target.classList.contains('lock-btn')) {
        const isLocked = card.dataset.locked === "true";
        card.dataset.locked = !isLocked;
        e.target.innerText = isLocked ? "🔓" : "🔒";
        card.classList.toggle('locked');
    } else if (e.target.classList.contains('color-code')) {
        navigator.clipboard.writeText(e.target.innerText);
        alert(`Copied: ${e.target.innerText}`);
    }
});

cardCountSelect.addEventListener('change', createCards);
createCards();
