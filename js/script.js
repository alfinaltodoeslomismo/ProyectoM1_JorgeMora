const container = document.getElementById('palette-container');
const countSelect = document.getElementById('card-count');
const formatBtn = document.getElementById('toggle-format');
const genBtn = document.getElementById('gen-btn');
const toast = document.getElementById('copy-toast');

let colors = [];

// Helper: Generate Random HSL
function getRandomColor() {
    const h = Math.floor(Math.random() * 360);
    const s = Math.floor(Math.random() * 70) + 30; // Vibrancy boost
    const l = Math.floor(Math.random() * 60) + 20; // Avoid pure black/white
    return { h, s, l, hex: hslToHex(h, s, l), locked: false };
}

// Convert HSL to HEX for display
function hslToHex(h, s, l) {
    l /= 100;
    const a = s * Math.min(l, 1 - l) / 100;
    const f = n => {
        const k = (n + h / 30) % 12;
        const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
        return Math.round(255 * color).toString(16).padStart(2, '0');
    };
    return `#${f(0)}${f(8)}${f(4)}`.toUpperCase();
}

function updatePalette() {
    const count = parseInt(countSelect.value);
    
    // Maintain existing locks if we change count
    for (let i = 0; i < count; i++) {
        if (!colors[i] || !colors[i].locked) {
            colors[i] = getRandomColor();
        }
    }
    
    // Adjust Grid Layout
    const cols = count === 9 ? 3 : (count === 8 ? 4 : 3);
    container.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;
    
    render();
}

function render() {
    container.innerHTML = '';
    const count = parseInt(countSelect.value);
    
    const cols = count === 9 ? 3 : (count === 8 ? 4 : 3);
    container.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;

    colors.forEach((data, index) => {
        const card = document.createElement('div');
        card.className = `color-card ${data.locked ? 'is-locked' : ''}`;
        
        // Define the HSL string for easier access
        const hslString = `hsl(${data.h}, ${data.s}%, ${data.l}%)`;

        card.innerHTML = `
            <div class="color-swatch" style="background: ${data.hex}" onclick="copyColor('${data.hex}', '${hslString}')"></div>
            <div class="card-bottom">
                <span class="color-code hex-val">${data.hex}</span>
                <span class="color-code hsl-val">${hslString}</span>
                <button class="lock-btn ${data.locked ? 'active' : ''}" onclick="toggleLock(${index})">
                    ${data.locked ? 'LOCKED 🔒' : 'LOCK 🔓'}
                </button>
            </div>
        `;
        container.appendChild(card);
    });
}

function toggleLock(index) {
    colors[index].locked = !colors[index].locked;
    render();
}

function copyColor(hex, hsl) {
    // Check which mode is currently active on the body
    const isHexMode = document.body.classList.contains('hex-mode');
    const textToCopy = isHexMode ? hex : hsl;

    navigator.clipboard.writeText(textToCopy).then(() => {
        // Update toast text to show what was copied
        toast.innerText = `Copied: ${textToCopy} ✨`;
        toast.classList.add('show');
        
        setTimeout(() => {
            toast.classList.remove('show');
        }, 2000);
    });
}

// Global Events
formatBtn.addEventListener('click', () => {
    document.body.classList.toggle('hex-mode');
    document.body.classList.toggle('hsl-mode');
});

genBtn.addEventListener('click', updatePalette);
countSelect.addEventListener('change', updatePalette);

window.addEventListener('keydown', (e) => {
    if (e.code === 'Space') {
        e.preventDefault(); // Stop scrolling
        updatePalette();
    }
});

// Start
updatePalette();
