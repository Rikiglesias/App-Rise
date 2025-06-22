#!/usr/bin/env node

/**
 * 🔄 Platform Components Migration Script
 * Migra automaticamente da TouchableOpacity a PlatformTouchable
 */

/* eslint-disable @typescript-eslint/no-var-requires */

console.log('🔄 PLATFORM COMPONENTS MIGRATION\n');

const fs = require('fs');
const path = require('path');

// ===================================================================
// CONFIGURAZIONE MIGRAZIONE
// ===================================================================

const MIGRATION_RULES = [
  // TouchableOpacity → PlatformTouchable
  {
    name: 'TouchableOpacity → PlatformTouchable',
    importPattern:
      /import\s*{([^}]*?)TouchableOpacity([^}]*?)}\s*from\s*['"]react-native['"];?/g,
    importReplacement: (match, before, after) => {
      const beforeClean = before.replace(/,\s*$/, '').trim();
      const afterClean = after.replace(/^\s*,/, '').trim();
      const beforePart = beforeClean ? beforeClean + ', ' : '';
      const afterPart = afterClean ? ', ' + afterClean : '';
      return `import {${beforePart}${afterPart}} from 'react-native';\nimport { PlatformTouchable } from '../components/ui';`;
    },
    componentPattern: /<TouchableOpacity([^>]*?)>/g,
    componentReplacement: (match, props) => {
      // Aggiungi rippleColor se non presente
      if (!props.includes('rippleColor')) {
        const rippleColor = ' rippleColor="rgba(220, 38, 38, 0.2)"';
        return `<PlatformTouchable${props}${rippleColor}>`;
      }
      return `<PlatformTouchable${props}>`;
    },
    closingPattern: /<\/TouchableOpacity>/g,
    closingReplacement: '</PlatformTouchable>',
  },

  // ScrollView → PlatformScrollView (opzionale)
  {
    name: 'ScrollView → PlatformScrollView',
    importPattern:
      /import\s*{([^}]*?)ScrollView([^}]*?)}\s*from\s*['"]react-native['"];?/g,
    importReplacement: (match, before, after) => {
      const beforeClean = before.replace(/,\s*$/, '').trim();
      const afterClean = after.replace(/^\s*,/, '').trim();
      const beforePart = beforeClean ? beforeClean + ', ' : '';
      const afterPart = afterClean ? ', ' + afterClean : '';
      return `import {${beforePart}${afterPart}} from 'react-native';\nimport { PlatformScrollView } from '../components/ui';`;
    },
    componentPattern: /<ScrollView([^>]*?)>/g,
    componentReplacement: '<PlatformScrollView$1>',
    closingPattern: /<\/ScrollView>/g,
    closingReplacement: '</PlatformScrollView>',
    skipFiles: ['PlatformComponents.tsx'], // Non migrare il file che definisce PlatformScrollView
  },
];

// File da escludere dalla migrazione
const EXCLUDED_FILES = [
  'PlatformTouchable.tsx',
  'PlatformBlur.tsx',
  'PlatformComponents.tsx',
  'PlatformAnimations.tsx',
  'EnhancedTouchable.tsx', // Mantiene TouchableOpacity per compatibilità
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
        // Escludi file specifici
        if (!EXCLUDED_FILES.some(excluded => entry.name.includes(excluded))) {
          files.push(fullPath);
        }
      }
    }
  }

  traverse(directory);
  return files;
}

function applyMigrationRule(content, rule) {
  let modified = false;
  let result = content;

  // Salta file specifici se definiti nella regola
  if (rule.skipFiles) {
    const isSkipped = rule.skipFiles.some(
      skipFile => content.includes(skipFile) || result.includes(`/${skipFile}`)
    );
    if (isSkipped) {
      return { content: result, modified: false };
    }
  }

  // Applica pattern import
  if (rule.importPattern && rule.importReplacement) {
    const newResult = result.replace(rule.importPattern, (match, ...args) => {
      modified = true;
      return rule.importReplacement(match, ...args);
    });
    result = newResult;
  }

  // Applica pattern componente
  if (rule.componentPattern && rule.componentReplacement) {
    const newResult = result.replace(
      rule.componentPattern,
      (match, ...args) => {
        modified = true;
        return typeof rule.componentReplacement === 'function'
          ? rule.componentReplacement(match, ...args)
          : rule.componentReplacement;
      }
    );
    result = newResult;
  }

  // Applica pattern chiusura
  if (rule.closingPattern && rule.closingReplacement) {
    if (result.includes(rule.closingPattern.source.replace(/[<>\/\\]/g, ''))) {
      result = result.replace(rule.closingPattern, rule.closingReplacement);
      modified = true;
    }
  }

  return { content: result, modified };
}

function fixImportPaths(content, filePath) {
  // Calcola il percorso relativo corretto per i componenti UI
  const relativePath = path.relative(
    path.dirname(filePath),
    path.join('src', 'components', 'ui')
  );
  const normalizedPath = relativePath.replace(/\\/g, '/');

  // Correggi i path di import per PlatformTouchable
  let result = content.replace(
    /from\s+['"]\.\.\/components\/ui['"];?/g,
    `from '${normalizedPath}';`
  );

  // Se il file è già in components/ui, usa import relativo
  if (filePath.includes('components/ui')) {
    result = result.replace(
      /from\s+['"][^'"]*components\/ui['"];?/g,
      "from './';"
    );
  }

  return result;
}

// ===================================================================
// MAIN MIGRATION LOGIC
// ===================================================================

function migrateFile(filePath) {
  const originalContent = fs.readFileSync(filePath, 'utf8');
  let content = originalContent;
  let totalModifications = 0;
  const appliedRules = [];

  // Applica tutte le regole di migrazione
  for (const rule of MIGRATION_RULES) {
    const { content: newContent, modified } = applyMigrationRule(content, rule);
    content = newContent;

    if (modified) {
      totalModifications++;
      appliedRules.push(rule.name);
    }
  }

  // Correggi i path di import
  content = fixImportPaths(content, filePath);

  // Salva solo se ci sono state modifiche
  if (content !== originalContent) {
    fs.writeFileSync(filePath, content, 'utf8');
    return {
      modified: true,
      rules: appliedRules,
      changes: totalModifications,
    };
  }

  return { modified: false, rules: [], changes: 0 };
}

function runMigration() {
  console.log('🚀 INIZIO MIGRAZIONE AUTOMATICA ANDROID\n');

  const srcDir = path.join(process.cwd(), 'src');
  const files = findAllFiles(srcDir);

  console.log(`📁 Trovati ${files.length} file da analizzare\n`);

  let migratedFiles = 0;
  let totalChanges = 0;
  const results = [];

  for (const filePath of files) {
    const relativePath = path.relative(process.cwd(), filePath);
    const result = migrateFile(filePath);

    if (result.modified) {
      migratedFiles++;
      totalChanges += result.changes;
      results.push({ file: relativePath, ...result });

      console.log(`✅ ${relativePath}`);
      result.rules.forEach(rule => console.log(`   └─ ${rule}`));
      console.log('');
    }
  }

  // Riepilogo finale
  console.log('==========================================');
  console.log('🎯 MIGRAZIONE COMPLETATA!');
  console.log('==========================================');
  console.log(`📊 File migrati: ${migratedFiles}/${files.length}`);
  console.log(`🔧 Modifiche totali: ${totalChanges}`);
  console.log('');

  if (migratedFiles > 0) {
    console.log('📋 RISULTATI:');
    console.log('✅ TouchableOpacity → PlatformTouchable');
    console.log('✅ Import paths corretti');
    console.log('✅ Ripple colors aggiunti per Android');
    console.log('');

    console.log('🚀 PROSSIMI PASSI:');
    console.log('1. npm run conta-problemi (verifica zero errori)');
    console.log('2. npm run android (testa su Android)');
    console.log('3. Commit delle modifiche');
  } else {
    console.log('ℹ️  Nessun file necessitava migrazione');
  }

  return { migratedFiles, totalChanges, results };
}

// ===================================================================
// ESECUZIONE
// ===================================================================

if (require.main === module) {
  try {
    runMigration();
  } catch (error) {
    console.error('❌ ERRORE DURANTE LA MIGRAZIONE:');
    console.error(error.message);
    process.exit(1);
  }
}

module.exports = { runMigration, migrateFile };
