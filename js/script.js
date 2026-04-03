const container = document.getElementById('palette-container');
const generateBtn = document.getElementById('generate-btn');
const formatSwitch = document.getElementById('format-switch');
const colorCount = 8; // Change to 6, 8, or 9 as needed

let colors = [];

// Helper: Generate Random Hex
const randomHex = () => '#' + Math.floor(Math.random()*16777215).toString(16).padStart(6, '0');

// Helper: Hex to HSL
const hexToHsl = (hex) => {
    let r = parseInt(hex.slice(1,3), 16) / 255, g = parseInt(hex.slice(3,5), 16) / 255, b = parseInt(hex.slice(5,7), 16) / 255;
    let max = Math.max(r, g, b), min = Math.min(r, g, b), h, s, l = (max + min) / 2;
    if(max == min) h = s = 0;
    else {
        let d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch(max){
            case r: h = (g - b) / d + (g < b ? 6 : 0); break;
            case g: h = (b - r) / d + 2; break;
            case b: h = (r - g) / d + 4; break;
        }
        h /= 6;
    }
    return `hsl(${Math.round(h*360)}, ${Math.round(s*100)}%, ${Math.round(l*100)}%)`;
};

// Initialize Palette
function initPalette() {
    for (let i = 0; i < colorCount; i++) {
        colors.push({ hex: randomHex(), locked: false });
    }
    renderPalette();
}

// Render Palette to DOM
function renderPalette() {
    container.innerHTML = '';
    const isHsl = formatSwitch.checked;

    colors.forEach((colorObj, index) => {
        const displayCode = isHsl ? hexToHsl(colorObj.hex) : colorObj.hex.toUpperCase();
        
        const card = document.createElement('div');
        card.className = 'color-card';
        card.innerHTML = `
            <div class="color-box" style="background-color: ${colorObj.hex}" onclick="copyToClipboard('${displayCode}')"></div>
            <span class="color-code" onclick="copyToClipboard('${displayCode}')">${displayCode}</span>
            <div class="card-actions">
                <button class="lock-btn" onclick="toggleLock(${index})">${colorObj.locked ? '💗' : '⏭️'}</button>
            </div>
        `;
        container.appendChild(card);
    });
}

// Generate New Palette (Skips locked colors)
generateBtn.addEventListener('click', () => {
    colors = colors.map(c => c.locked ? c : { hex: randomHex(), locked: false });
    renderPalette();
});

// Switch format without changing colors
formatSwitch.addEventListener('change', renderPalette);

// Toggle Lock
window.toggleLock = (index) => {
    colors[index].locked = !colors[index].locked;
    renderPalette();
};

// Copy to Clipboard
window.copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(() => {
        alert(`Copied: ${text}`);
    });
};

initPalette();
