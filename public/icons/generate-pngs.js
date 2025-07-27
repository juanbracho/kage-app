const fs = require('fs');
const { createCanvas } = require('canvas');

// Icon sizes needed for PWA
const iconSizes = [72, 96, 128, 144, 152, 192, 384, 512];

// Brand colors
const brandColor = '#FF7101';
const backgroundColor = '#FFFFFF';

function createIconPNG(size) {
    const canvas = createCanvas(size, size);
    const ctx = canvas.getContext('2d');
    
    // Fill background with brand color
    ctx.fillStyle = brandColor;
    ctx.fillRect(0, 0, size, size);
    
    // Draw white circle
    const radius = size * 0.4;
    const centerX = size / 2;
    const centerY = size / 2;
    
    ctx.fillStyle = backgroundColor;
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
    ctx.fill();
    
    // Draw "K" letter
    ctx.fillStyle = brandColor;
    ctx.font = `bold ${size * 0.25}px Arial, sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('K', centerX, centerY);
    
    return canvas.toBuffer('image/png');
}

// Generate all icon sizes
iconSizes.forEach(size => {
    try {
        const buffer = createIconPNG(size);
        const filename = `icon-${size}x${size}.png`;
        fs.writeFileSync(filename, buffer);
        console.log(`✅ Generated ${filename}`);
    } catch (error) {
        console.log(`❌ Failed to generate ${size}x${size}: ${error.message}`);
    }
});

console.log('Icon generation complete!');