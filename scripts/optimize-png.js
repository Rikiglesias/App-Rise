/**
 * PNG Optimizer per Build Android
 * 
 * Rimuove profili colore e metadati da PNG che causano errori AAPT:
 * "Android resource compilation failed"
 * 
 * Usa sharp per processare i file PNG in modo sicuro.
 */

const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

// Cartelle da processare
const ASSET_DIRS = [
  path.join(__dirname, '..', 'assets'),
];

async function optimizePNG(filePath) {
  try {
    const buffer = await sharp(filePath)
      .png({
        compressionLevel: 9,
        // Rimuove profili colore e metadati
        palette: true,
      })
      .toBuffer();

    fs.writeFileSync(filePath, buffer);
    console.log(`✅ Ottimizzato: ${path.relative(process.cwd(), filePath)}`);
  } catch (error) {
    console.error(`❌ Errore su ${filePath}:`, error.message);
  }
}

async function processDirectory(dir) {
  if (!fs.existsSync(dir)) {
    console.log(`⚠️  Directory non trovata: ${dir}`);
    return;
  }

  const files = fs.readdirSync(dir, { withFileTypes: true });

  for (const file of files) {
    const fullPath = path.join(dir, file.name);

    if (file.isDirectory()) {
      await processDirectory(fullPath);
    } else if (file.name.toLowerCase().endsWith('.png')) {
      await optimizePNG(fullPath);
    }
  }
}

async function main() {
  console.log('🔧 Ottimizzazione PNG per build Android...\n');

  for (const dir of ASSET_DIRS) {
    console.log(`📂 Processando: ${dir}`);
    await processDirectory(dir);
  }

  console.log('\n✅ Ottimizzazione completata!');
}

main().catch(error => {
  console.error('❌ Errore:', error);
  process.exit(1);
});
