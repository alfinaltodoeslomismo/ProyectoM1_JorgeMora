const grid = document.getElementById('palette-grid');
const generateBtn = document.getElementById('generate-btn');
const cardCountSelect = document.getElementById('card-count');
const formatToggle = document.getElementById('format-toggle');
const toast = document.getElementById('toast');

let colors = [];
let currentFormat = 'HEX';

// Initialize Palette
function initPalette() {
    const count = parseInt(cardCountSelect.value);
    grid.className = `grid-${count}`;
    
    // Maintain locked colors, fill the rest with new random ones
    const newColors = [];
    const lockedOnes = colors.filter(c => c.locked);
    
    // Locked colors move to the front
    lockedOnes.forEach(c => newColors.push(c));
    
    while(newColors.length < count) {
        newColors.push({
            value: generateRandomColor(),
            locked: false
        });
    }
    
    colors = newColors.slice(0, count);
    renderPalette();
}

function generateRandomColor() {
    return '#' + Math.floor(Math.random()*16777215).toString(16).padStart(6, '0').toUpperCase();
}

function hexToHsl(hex) {
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
    return `HSL(${(h*360).toFixed(0)}, ${(s*100).toFixed(0)}%, ${(l*100).toFixed(0)}%)`;
}

function renderPalette() {
    grid.innerHTML = '';
    colors.forEach((colorObj, index) => {
        const card = document.createElement('div');
        card.className = `color-card ${colorObj.locked ? 'locked' : ''}`;
        card.style.backgroundColor = colorObj.value;
        
        const displayCode = currentFormat === 'HEX' ? colorObj.value : hexToHsl(colorObj.value);
        
        card.innerHTML = `
            <button class="lock-btn">${colorObj.locked ? 'UNLK' : 'LOCK'}</button>
            <div class="card-code">${displayCode}</div>
        `;
        
        // Copy to clipboard on card click (excluding lock button)
        card.onclick = (e) => {
            if(e.target.tagName !== 'BUTTON') {
                navigator.clipboard.writeText(displayCode);
                showToast();
            }
        };

        // Lock Toggle
        card.querySelector('.lock-btn').onclick = (e) => {
            e.stopPropagation();
            colors[index].locked = !colors[index].locked;
            // Move locked items to front immediately or wait for next generate? 
            // The prompt says move them to first positions.
            initPalette(); 
        };

        grid.appendChild(card);
    });
}

function showToast() {
    toast.style.display = 'block';
    setTimeout(() => toast.style.display = 'none', 1500);
}

// Event Listeners
generateBtn.onclick = () => {
    // Regenerate only unlocked colors
    colors = colors.map(c => c.locked ? c : { value: generateRandomColor(), locked: false });
    renderPalette();
};

cardCountSelect.onchange = initPalette;

formatToggle.onclick = () => {
    currentFormat = currentFormat === 'HEX' ? 'HSL' : 'HEX';
    document.querySelectorAll('.toggle-label').forEach(l => l.classList.toggle('active'));
    renderPalette();
};

// Start
initPalette();
