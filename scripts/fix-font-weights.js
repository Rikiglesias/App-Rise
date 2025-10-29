#!/usr/bin/env node

/**
 * FONT WEIGHT FIX SCRIPT
 *
 * Corregge i pesi dei font per coerenza cross-platform:
 * 1. Riduce fontWeight CSS da 800/900 a 600/700
 * 2. Aggiunge fontWeight props ai PerfectText
 * 3. Rimuove fontWeight CSS quando possibile
 */

const fs = require('fs');
const path = require('path');

// Configurazione
const CONFIG = {
  srcDir: './src',
  excludeDirs: ['__tests__', 'node_modules', '.git', 'migration-backup'],
  dryRun: false, // Cambia a true per vedere solo i cambiamenti
  backupDir: './font-fix-backup',
};

// Mappatura pesi ottimizzati
const WEIGHT_MAPPING = {
  900: '600', // Nero → SemiBold
  800: '600', // ExtraBold → SemiBold
  700: '600', // Bold → SemiBold
  600: '600', // SemiBold → SemiBold (ok)
  500: '500', // Medium → Medium (ok)
  400: '400', // Regular → Regular (ok)
  bold: '600', // Bold → SemiBold
  normal: '400', // Normal → Regular
};

// Pattern di correzione
const FIXES = [
  // 1. Riduce fontWeight CSS troppo pesanti
  {
    name: 'CSS fontWeight 900 → 600',
    pattern: /fontWeight:\s*['"]900['"]/g,
    replacement: "fontWeight: '600'",
  },
  {
    name: 'CSS fontWeight 800 → 600',
    pattern: /fontWeight:\s*['"]800['"]/g,
    replacement: "fontWeight: '600'",
  },
  {
    name: 'CSS fontWeight 700 → 600',
    pattern: /fontWeight:\s*['"]700['"]/g,
    replacement: "fontWeight: '600'",
  },
  {
    name: 'CSS fontWeight bold → 600',
    pattern: /fontWeight:\s*['"]bold['"]/g,
    replacement: "fontWeight: '600'",
  },

  // 2. Aggiunge fontWeight props ai PerfectText senza fontWeight
  {
    name: 'PerfectText senza fontWeight → aggiungi fontWeight="400"',
    pattern:
      /<PerfectText([^>]*?)(?<!fontWeight=[^>]*?)(\s+size=\{?\d+\}?\s+lines=\{?\d+\}?)([^>]*?)>/g,
    replacement: '<PerfectText$1$2 fontWeight="400"$3>',
  },
];

// Funzioni utility
function createBackup() {
  if (!CONFIG.dryRun && !fs.existsSync(CONFIG.backupDir)) {
    fs.mkdirSync(CONFIG.backupDir, { recursive: true });
    console.log(`📦 Backup creato in: ${CONFIG.backupDir}`);
  }
}

function shouldProcessFile(filePath) {
  const fileName = path.basename(filePath);
  const dirName = path.dirname(filePath);

  // Escludi directory specifiche
  if (CONFIG.excludeDirs.some(dir => dirName.includes(dir))) return false;

  // Processa solo file TypeScript/JavaScript
  return /\.(tsx?|jsx?)$/.test(fileName);
}

function analyzeFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const issues = [];

  // Cerca fontWeight CSS pesanti
  if (content.match(/fontWeight:\s*['"]([89]00|bold)['"]/)) {
    issues.push('Has heavy CSS fontWeight (800/900/bold)');
  }

  // Cerca PerfectText senza fontWeight
  const perfectTextMatches = content.match(/<PerfectText[^>]*>/g) || [];
  const withoutFontWeight = perfectTextMatches.filter(
    match => !match.includes('fontWeight=')
  );

  if (withoutFontWeight.length > 0) {
    issues.push(`${withoutFontWeight.length} PerfectText without fontWeight`);
  }

  return issues;
}

function fixFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;
  const appliedFixes = [];

  // Backup del file originale
  if (!CONFIG.dryRun) {
    const backupPath = path.join(
      CONFIG.backupDir,
      path.relative('.', filePath)
    );
    const backupDir = path.dirname(backupPath);
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
    }
    fs.copyFileSync(filePath, backupPath);
  }

  // Applica correzioni
  FIXES.forEach(fix => {
    const originalContent = content;
    content = content.replace(fix.pattern, fix.replacement);

    if (content !== originalContent) {
      modified = true;
      appliedFixes.push(fix.name);
    }
  });

  // Scrivi file modificato
  if (modified && !CONFIG.dryRun) {
    fs.writeFileSync(filePath, content);
  }

  return { modified, appliedFixes, issues: analyzeFile(filePath) };
}

function scanDirectory(dir) {
  const results = {
    totalFiles: 0,
    processedFiles: 0,
    modifiedFiles: 0,
    issues: [],
    fixes: {},
  };

  function scan(currentDir) {
    const items = fs.readdirSync(currentDir);

    items.forEach(item => {
      const fullPath = path.join(currentDir, item);
      const stat = fs.statSync(fullPath);

      if (stat.isDirectory()) {
        scan(fullPath);
      } else if (shouldProcessFile(fullPath)) {
        results.totalFiles++;

        const issues = analyzeFile(fullPath);
        if (issues.length > 0) {
          results.issues.push({
            file: fullPath,
            issues: issues,
          });

          const result = fixFile(fullPath);
          if (result.modified) {
            results.modifiedFiles++;

            // Conta i fix applicati
            result.appliedFixes.forEach(fixName => {
              results.fixes[fixName] = (results.fixes[fixName] || 0) + 1;
            });
          }
          results.processedFiles++;
        }
      }
    });
  }

  scan(dir);
  return results;
}

// Esecuzione principale
function main() {
  console.log('🎨 FONT WEIGHT FIX SCRIPT');
  console.log('========================');

  if (CONFIG.dryRun) {
    console.log('🔍 DRY RUN MODE - Nessun file verrà modificato');
  }

  createBackup();

  const results = scanDirectory(CONFIG.srcDir);

  console.log('\n📊 RISULTATI CORREZIONE:');
  console.log(`📁 File totali scansionati: ${results.totalFiles}`);
  console.log(`🔧 File da processare: ${results.processedFiles}`);
  console.log(`✅ File modificati: ${results.modifiedFiles}`);

  if (Object.keys(results.fixes).length > 0) {
    console.log('\n🔧 CORREZIONI APPLICATE:');
    Object.entries(results.fixes).forEach(([fixName, count]) => {
      console.log(`   • ${fixName}: ${count} volte`);
    });
  }

  if (results.issues.length > 0) {
    console.log('\n⚠️  PROBLEMI IDENTIFICATI:');
    results.issues.slice(0, 10).forEach(({ file, issues }) => {
      console.log(`\n📄 ${file}:`);
      issues.forEach(issue => console.log(`   • ${issue}`));
    });

    if (results.issues.length > 10) {
      console.log(`\n... e altri ${results.issues.length - 10} file`);
    }
  }

  if (!CONFIG.dryRun && results.modifiedFiles > 0) {
    console.log('\n🎉 Correzione font completata!');
    console.log("💡 Testa l'app su iOS e Android per verificare la coerenza.");
    console.log(
      '💡 I font dovrebbero ora essere più uniformi tra le piattaforme.'
    );
  }

  if (CONFIG.dryRun) {
    console.log(
      '\n💡 Per applicare le correzioni, cambia dryRun: false nel CONFIG'
    );
  }
}

// Esegui solo se chiamato direttamente
if (require.main === module) {
  main();
}

module.exports = { main, CONFIG, FIXES };
