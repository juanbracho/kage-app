const fs = require('fs');

// Simple SVG to create PNG icons using data URI approach
const iconSizes = [72, 96, 128, 144, 152, 192, 384, 512];

function createSVGIcon(size) {
    return `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
        <rect width="${size}" height="${size}" fill="#FF7101" rx="${size * 0.125}"/>
        <circle cx="${size/2}" cy="${size/2}" r="${size * 0.35}" fill="white"/>
        <text x="${size/2}" y="${size/2 + size * 0.08}" text-anchor="middle" font-family="Arial, sans-serif" font-size="${size * 0.2}" font-weight="bold" fill="#FF7101">K</text>
    </svg>`;
}

// Create SVG files that browsers can use as fallback
iconSizes.forEach(size => {
    const svgContent = createSVGIcon(size);
    const filename = `icon-${size}x${size}.svg`;
    fs.writeFileSync(filename, svgContent);
    console.log(`✅ Generated ${filename}`);
});

console.log('SVG icon generation complete!');