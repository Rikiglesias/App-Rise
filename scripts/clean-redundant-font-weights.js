#!/usr/bin/env node

/**
 * CLEAN REDUNDANT FONT WEIGHTS
 *
 * Rimuove fontWeight CSS ridondanti quando PerfectText ha già fontWeight prop
 */

const fs = require('fs');
const path = require('path');

const CONFIG = {
  srcDir: './src',
  excludeDirs: [
    '__tests__',
    'node_modules',
    '.git',
    'migration-backup',
    'font-fix-backup',
  ],
  dryRun: false,
};

function shouldProcessFile(filePath) {
  const fileName = path.basename(filePath);
  const dirName = path.dirname(filePath);

  if (CONFIG.excludeDirs.some(dir => dirName.includes(dir))) return false;
  return /\.(tsx?|jsx?)$/.test(fileName);
}

function cleanFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;

  // Trova tutti i PerfectText con fontWeight prop
  const perfectTextMatches = content.match(
    /<PerfectText[^>]*fontWeight="[^"]*"[^>]*style=\{styles\.[^}]*\}[^>]*>/g
  );

  if (perfectTextMatches) {
    perfectTextMatches.forEach(match => {
      // Estrai il nome dello style
      const styleMatch = match.match(/style=\{styles\.([^}]*)\}/);
      if (styleMatch) {
        const styleName = styleMatch[1];

        // Cerca la definizione dello style e rimuovi fontWeight
        const styleRegex = new RegExp(
          `(${styleName}:\\s*\\{[^}]*?)fontWeight:\\s*['"][^'"]*['"],?([^}]*?\\})`,
          'g'
        );
        const newContent = content.replace(
          styleRegex,
          (fullMatch, before, after) => {
            // Rimuovi la virgola extra se necessario
            const cleanAfter = after.replace(/^,/, '');
            const cleanBefore = before.replace(/,$/, '');
            return cleanBefore + cleanAfter;
          }
        );

        if (newContent !== content) {
          content = newContent;
          modified = true;
        }
      }
    });
  }

  if (modified && !CONFIG.dryRun) {
    fs.writeFileSync(filePath, content);
  }

  return modified;
}

function scanDirectory(dir) {
  let modifiedFiles = 0;
  let totalFiles = 0;

  function scan(currentDir) {
    const items = fs.readdirSync(currentDir);

    items.forEach(item => {
      const fullPath = path.join(currentDir, item);
      const stat = fs.statSync(fullPath);

      if (stat.isDirectory()) {
        scan(fullPath);
      } else if (shouldProcessFile(fullPath)) {
        totalFiles++;
        if (cleanFile(fullPath)) {
          modifiedFiles++;
          console.log(`✅ Pulito: ${fullPath}`);
        }
      }
    });
  }

  scan(dir);
  return { modifiedFiles, totalFiles };
}

function main() {
  console.log('🧹 CLEAN REDUNDANT FONT WEIGHTS');
  console.log('===============================');

  if (CONFIG.dryRun) {
    console.log('🔍 DRY RUN MODE');
  }

  const results = scanDirectory(CONFIG.srcDir);

  console.log(`\n📊 RISULTATI:`);
  console.log(`📁 File scansionati: ${results.totalFiles}`);
  console.log(`✅ File modificati: ${results.modifiedFiles}`);

  if (!CONFIG.dryRun && results.modifiedFiles > 0) {
    console.log('\n🎉 Pulizia completata!');
  }
}

if (require.main === module) {
  main();
}
