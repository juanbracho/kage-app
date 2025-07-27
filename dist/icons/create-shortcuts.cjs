const fs = require('fs');

// Create shortcut icons for PWA shortcuts
const shortcuts = [
    { name: 'shortcut-goal', icon: '🎯', color: '#4CAF50' },
    { name: 'shortcut-task', icon: '✅', color: '#2196F3' },
    { name: 'shortcut-habit', icon: '🔥', color: '#FF7101' },
    { name: 'shortcut-journal', icon: '📝', color: '#9C27B0' }
];

function createShortcutSVG(icon, color) {
    return `<svg width="96" height="96" viewBox="0 0 96 96" xmlns="http://www.w3.org/2000/svg">
        <rect width="96" height="96" fill="${color}" rx="12"/>
        <text x="48" y="65" text-anchor="middle" font-family="Arial, sans-serif" font-size="48" fill="white">${icon}</text>
    </svg>`;
}

shortcuts.forEach(shortcut => {
    const svgContent = createShortcutSVG(shortcut.icon, shortcut.color);
    const filename = `${shortcut.name}.svg`;
    fs.writeFileSync(filename, svgContent);
    console.log(`✅ Generated ${filename}`);
});

console.log('Shortcut icon generation complete!');