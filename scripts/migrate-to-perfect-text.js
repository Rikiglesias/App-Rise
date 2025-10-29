#!/usr/bin/env node

/**
 * MIGRATION SCRIPT: Text Components → Perfect System
 *
 * Converte automaticamente tutti i componenti Text legacy
 * al Perfect System per coerenza cross-platform
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Configurazione migrazione
const CONFIG = {
  srcDir: './src',
  excludeDirs: ['__tests__', 'node_modules', '.git'],
  excludeFiles: ['PerfectText.tsx', 'index.ts'],
  dryRun: false, // Cambia a true per vedere solo i cambiamenti
  backupDir: './migration-backup',
};

// Pattern di migrazione
const MIGRATION_PATTERNS = [
  // Text nativo React Native → PerfectText
  {
    from: /import\s*{\s*([^}]*?)Text([^}]*?)}\s*from\s*['"]react-native['"]/g,
    to: (match, before, after) => {
      const cleanBefore = before.replace(/,\s*$/, '').trim();
      const cleanAfter = after.replace(/^\s*,/, '').trim();
      const imports = [cleanBefore, cleanAfter].filter(Boolean).join(', ');
      return `import { ${imports} } from 'react-native'`;
    },
    addImport: "import { PerfectText } from '../components/ui';",
  },

  // Text di react-native-paper → PerfectText (per componenti specifici)
  {
    from: /import\s*{\s*Text\s*}\s*from\s*['"]react-native-paper['"]/g,
    to: '',
    addImport: "import { PerfectText } from '../components/ui';",
  },

  // Sostituzioni JSX
  {
    from: /<Text(\s+[^>]*)?>/g,
    to: '<PerfectText$1 lines={1}>',
  },
  {
    from: /<\/Text>/g,
    to: '</PerfectText>',
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

  // Escludi file specifici
  if (CONFIG.excludeFiles.includes(fileName)) return false;

  // Escludi directory specifiche
  if (CONFIG.excludeDirs.some(dir => dirName.includes(dir))) return false;

  // Processa solo file TypeScript/JavaScript
  return /\.(tsx?|jsx?)$/.test(fileName);
}

function analyzeFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const issues = [];

  // Cerca Text nativo
  if (content.includes("from 'react-native'") && content.includes('<Text')) {
    issues.push('Uses native Text component');
  }

  // Cerca Text di Paper
  if (
    content.includes("from 'react-native-paper'") &&
    content.includes('<Text')
  ) {
    issues.push('Uses react-native-paper Text');
  }

  // Cerca Text senza PerfectText import
  if (content.includes('<Text') && !content.includes('PerfectText')) {
    issues.push('Uses Text without PerfectText import');
  }

  return issues;
}

function migrateFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;
  let needsPerfectTextImport = false;

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

  // Applica pattern di migrazione
  MIGRATION_PATTERNS.forEach(pattern => {
    if (pattern.from.test(content)) {
      if (typeof pattern.to === 'function') {
        content = content.replace(pattern.from, pattern.to);
      } else {
        content = content.replace(pattern.from, pattern.to);
      }
      modified = true;

      if (pattern.addImport) {
        needsPerfectTextImport = true;
      }
    }
  });

  // Aggiungi import PerfectText se necessario
  if (needsPerfectTextImport && !content.includes('PerfectText')) {
    const importMatch = content.match(/import.*from.*['"]react-native['"]/);
    if (importMatch) {
      const importIndex =
        content.indexOf(importMatch[0]) + importMatch[0].length;
      content =
        content.slice(0, importIndex) +
        '\n' +
        "import { PerfectText } from '../components/ui';" +
        content.slice(importIndex);
      modified = true;
    }
  }

  // Scrivi file modificato
  if (modified && !CONFIG.dryRun) {
    fs.writeFileSync(filePath, content);
  }

  return { modified, issues: analyzeFile(filePath) };
}

function scanDirectory(dir) {
  const results = {
    totalFiles: 0,
    processedFiles: 0,
    modifiedFiles: 0,
    issues: [],
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

          if (!CONFIG.dryRun) {
            const result = migrateFile(fullPath);
            if (result.modified) {
              results.modifiedFiles++;
            }
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
  console.log('🚀 MIGRATION SCRIPT: Text → Perfect System');
  console.log('=====================================');

  if (CONFIG.dryRun) {
    console.log('🔍 DRY RUN MODE - Nessun file verrà modificato');
  }

  createBackup();

  const results = scanDirectory(CONFIG.srcDir);

  console.log('\n📊 RISULTATI MIGRAZIONE:');
  console.log(`📁 File totali scansionati: ${results.totalFiles}`);
  console.log(`🔧 File da processare: ${results.processedFiles}`);
  console.log(`✅ File modificati: ${results.modifiedFiles}`);

  if (results.issues.length > 0) {
    console.log('\n⚠️  PROBLEMI IDENTIFICATI:');
    results.issues.forEach(({ file, issues }) => {
      console.log(`\n📄 ${file}:`);
      issues.forEach(issue => console.log(`   • ${issue}`));
    });
  }

  if (!CONFIG.dryRun && results.modifiedFiles > 0) {
    console.log('\n🎉 Migrazione completata!');
    console.log(
      '💡 Esegui i test per verificare che tutto funzioni correttamente.'
    );
    console.log(
      '💡 Controlla i file modificati e aggiusta manualmente se necessario.'
    );
  }

  if (CONFIG.dryRun) {
    console.log(
      '\n💡 Per eseguire la migrazione reale, cambia dryRun: false nel CONFIG'
    );
  }
}

// Esegui solo se chiamato direttamente
if (require.main === module) {
  main();
}

module.exports = { main, CONFIG, MIGRATION_PATTERNS };
