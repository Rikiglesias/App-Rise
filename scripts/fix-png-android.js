const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const files = [
  'assets/icons/social/facebook.png',
  'assets/icons/social/instagram.png',
  'assets/icons/social/linkedin.png'
];

async function fixImages() {
  for (const file of files) {
    const filePath = path.resolve(__dirname, '..', file);
    if (fs.existsSync(filePath)) {
      console.log(`Fixing ${file}...`);
      const tempPath = filePath + '.tmp';
      
      await sharp(filePath)
        .png({ 
          compressionLevel: 9, 
          palette: true,
          force: true 
        })
        .toFile(tempPath);
      
      // Sostituisci il file originale
      fs.unlinkSync(filePath);
      fs.renameSync(tempPath, filePath);
      console.log(`✅ Fixed ${file}`);
    } else {
      console.log(`❌ File not found: ${file}`);
    }
  }
}

fixImages().catch(console.error);
