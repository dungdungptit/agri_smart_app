const fs = require('fs');
const path = require('path');

// This script converts logo.webp to PNG files for app icons
// Run with: node scripts/convertLogo.js

const assetsDir = path.join(__dirname, '..', 'assets');
const sourceFile = path.join(assetsDir, 'logo.webp');

async function convertImages() {
    try {
        // Try to use sharp if available
        const sharp = require('sharp');

        // Create icon.png (1024x1024)
        await sharp(sourceFile)
            .resize(1024, 1024)
            .png()
            .toFile(path.join(assetsDir, 'icon.png'));
        console.log('Created icon.png');

        // Create adaptive-icon.png (1024x1024)
        await sharp(sourceFile)
            .resize(1024, 1024)
            .png()
            .toFile(path.join(assetsDir, 'adaptive-icon.png'));
        console.log('Created adaptive-icon.png');

        // Create splash-icon.png (1024x1024)
        await sharp(sourceFile)
            .resize(1024, 1024)
            .png()
            .toFile(path.join(assetsDir, 'splash-icon.png'));
        console.log('Created splash-icon.png');

        // Create favicon.png (48x48)
        await sharp(sourceFile)
            .resize(48, 48)
            .png()
            .toFile(path.join(assetsDir, 'favicon.png'));
        console.log('Created favicon.png');

        console.log('\nAll icons created successfully!');
    } catch (error) {
        if (error.code === 'MODULE_NOT_FOUND') {
            console.log('Sharp is not installed. Please run: npm install sharp');
            console.log('Then run this script again: node scripts/convertLogo.js');
        } else {
            console.error('Error:', error);
        }
    }
}

convertImages();
