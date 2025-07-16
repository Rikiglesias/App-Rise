#!/usr/bin/env node

/**
 * 🔧 Fix Migration Errors - Script di correzione automatica
 * Corregge errori TypeScript e ESLint dopo migrazioni massive
 */

/* eslint-disable @typescript-eslint/no-var-requires */

console.log('🔧 FIXING MIGRATION ERRORS - Correzione automatica errori\n');

const fs = require('fs');
const path = require('path');

// ===================================================================
// REGOLE DI FIX
// ===================================================================

const FIX_RULES = [
  // Fix import con virgole vuote
  {
    name: 'Import - Rimuovi virgole vuote',
    pattern: /import\s*{([^}]*?)}\s*from/g,
    replacement: (match, imports) => {
      // Pulisci imports: rimuovi virgole vuote, spazi extra, etc.
      const cleanImports = imports
        .split(',')
        .map(item => item.trim())
        .filter(item => item && item !== '')
        .join(', ');

      return `import { ${cleanImports} } from`;
    },
  },

  // Fix tag JSX malformati
  {
    name: 'JSX - Fix tag malformati',
    pattern: /<\/(Platform\w+)\$1>/g,
    replacement: '</$1>',
  },

  // Fix apertura tag JSX malformati
  {
    name: 'JSX - Fix apertura tag',
    pattern: /<(Platform\w+)\$1([^>]*)>/g,
    replacement: '<$1$2>',
  },

  // Fix spazi extra negli import
  {
    name: 'Import - Rimuovi spazi extra',
    pattern: /import\s*{\s*([^}]+?)\s*}\s*from/g,
    replacement: (match, imports) => {
      const cleanImports = imports
        .split(',')
        .map(item => item.trim())
        .filter(item => item)
        .join(', ');
      return `import { ${cleanImports} } from`;
    },
  },

  // Fix virgole finali negli import
  {
    name: 'Import - Rimuovi virgole finali',
    pattern: /import\s*{([^}]*?),\s*}\s*from/g,
    replacement: (match, imports) => {
      const cleanImports = imports.trim();
      return `import { ${cleanImports} } from`;
    },
  },
];

// ===================================================================
// UTILITY FUNCTIONS
// ===================================================================

function findAllFiles(directory, extensions = ['.tsx', '.ts']) {
  const files = [];

  function traverse(dir) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);

      if (entry.isDirectory()) {
        traverse(fullPath);
      } else if (extensions.some(ext => entry.name.endsWith(ext))) {
        files.push(fullPath);
      }
    }
  }

  traverse(directory);
  return files;
}

function applyFix(content, rule) {
  let modified = false;
  let result = content;

  if (typeof rule.replacement === 'function') {
    result = result.replace(rule.pattern, (...args) => {
      modified = true;
      return rule.replacement(...args);
    });
  } else {
    const originalResult = result;
    result = result.replace(rule.pattern, rule.replacement);
    modified = result !== originalResult;
  }

  return { content: result, modified };
}

function fixFile(filePath) {
  const originalContent = fs.readFileSync(filePath, 'utf8');
  let content = originalContent;
  let totalFixes = 0;
  const appliedFixes = [];

  // Applica tutte le regole di fix
  for (const rule of FIX_RULES) {
    const { content: newContent, modified } = applyFix(content, rule);
    content = newContent;

    if (modified) {
      totalFixes++;
      appliedFixes.push(rule.name);
    }
  }

  // Salva solo se ci sono state modifiche
  if (content !== originalContent) {
    fs.writeFileSync(filePath, content, 'utf8');
    return {
      fixed: true,
      rules: appliedFixes,
      fixes: totalFixes,
    };
  }

  return { fixed: false, rules: [], fixes: 0 };
}

function runFix() {
  console.log('🔧 INIZIO FIX ERRORI MIGRAZIONE\n');

  const srcDir = path.join(process.cwd(), 'src');
  const files = findAllFiles(srcDir);

  console.log(`📁 Analizzando ${files.length} file\n`);

  let fixedFiles = 0;
  let totalFixes = 0;
  const results = [];

  for (const filePath of files) {
    const relativePath = path.relative(process.cwd(), filePath);
    const result = fixFile(filePath);

    if (result.fixed) {
      fixedFiles++;
      totalFixes += result.fixes;
      results.push({ file: relativePath, ...result });

      console.log(`✅ ${relativePath}`);
      result.rules.forEach(rule => console.log(`   └─ ${rule}`));
      console.log('');
    }
  }

  // Riepilogo finale
  console.log('==========================================');
  console.log('🎯 FIX COMPLETATO!');
  console.log('==========================================');
  console.log(`📊 File corretti: ${fixedFiles}/${files.length}`);
  console.log(`🔧 Fix totali: ${totalFixes}`);
  console.log('');

  if (fixedFiles > 0) {
    console.log('📋 CORREZIONI APPLICATE:');
    console.log('✅ Import con virgole vuote corretti');
    console.log('✅ Tag JSX malformati riparati');
    console.log('✅ Spazi extra rimossi');
    console.log('');

    console.log('🚀 PROSSIMO PASSO:');
    console.log('npm run conta-problemi (verifica correzioni)');
  } else {
    console.log('ℹ️  Nessun file necessitava correzioni');
  }

  return { fixedFiles, totalFixes, results };
}

// ===================================================================
// ESECUZIONE
// ===================================================================

if (require.main === module) {
  try {
    runFix();
  } catch (error) {
    console.error('❌ ERRORE DURANTE IL FIX:');
    console.error(error.message);
    process.exit(1);
  }
}

module.exports = { runFix, fixFile };
