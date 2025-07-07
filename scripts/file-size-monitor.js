#!/usr/bin/env node

/**
 * FILE SIZE MONITOR
 * 
 * Monitora file che violano le linee guida Google/Airbnb/ESLint:
 * - Trova violazioni per tipo di file
 * - Traccia progressi refactoring
 * - Suggerisce strategie di split
 * - Report per code review
 */

const fs = require('fs');
const path = require('path');
const glob = require('glob');

const COLORS = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
};

const log = (message, color = 'reset') => {
  console.log(`${COLORS[color]}${message}${COLORS.reset}`);
};

/**
 * THRESHOLDS PROFESSIONALI - STANDARD INDUSTRIALI
 * 
 * Basato su linee guida consolidate di:
 * - Google Style Guides
 * - Airbnb JavaScript/React Standards  
 * - ESLint recommended practices
 * - Industry best practices per React Native
 */
const FILE_LIMITS = {
  'UI_COMPONENT': { verde: 300, giallo: 500, rosso: 500, pattern: 'src/components/**/*.tsx' },
  'SCREEN_CONTAINER': { verde: 400, giallo: 800, rosso: 800, pattern: 'src/{screens,features}/**/*Screen*.tsx' },
  'CUSTOM_HOOK': { verde: 200, giallo: 400, rosso: 400, pattern: '{src/hooks/**/*.ts,**/use*.ts}' },
  'HELPER_LIBRARY': { verde: 200, giallo: 400, rosso: 400, pattern: 'src/{utils,services}/**/*.ts' },
  'CONSTANTS_TOKENS': { verde: 400, giallo: 800, rosso: 800, pattern: 'src/**/constants/**/*.ts' },
  'STYLE_FILES': { verde: 200, giallo: 400, rosso: 400, pattern: '**/*{Style,Styles,Styled}.ts' },
  'TEST_FILES': { verde: 600, giallo: 1000, rosso: 1000, pattern: '**/*.{test,spec}.{ts,tsx}' },
  'CONFIG_FILES': { verde: 150, giallo: 300, rosso: 300, pattern: '**/*.config.{js,ts}' },
};

/**
 * COUNT LINES IN FILE
 */
function countLines(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    return content.split('\n').filter(line => 
      line.trim() !== '' && !line.trim().startsWith('//')
    ).length;
  } catch (error) {
    return 0;
  }
}

/**
 * GET STATUS COLOR BASED ON PROFESSIONAL THRESHOLDS
 */
function getStatus(lines, limits) {
  if (lines <= limits.verde) return { status: 'VERDE', color: 'green' };
  if (lines <= limits.giallo) return { status: 'GIALLO', color: 'yellow' };
  return { status: 'ROSSO', color: 'red' };
}

/**
 * ANALYZE FILES BY TYPE
 */
function analyzeFilesByType() {
  log('\n🔍 FILE SIZE ANALYSIS - Professional Industry Standards', 'cyan');
  log('=' .repeat(80), 'cyan');
  log('\n📋 PROFESSIONAL THRESHOLDS:', 'blue');
  log('📁 UI Components:     ≤300 (verde) | 300-500 (giallo) | >500 (rosso)', 'white');
  log('🪝 Hook/Helper funcs: ≤200 (verde) | 200-400 (giallo) | >400 (rosso)', 'white');
  log('🏗️ Domain modules:     ≤400 (verde) | 400-800 (giallo) | >800 (rosso)', 'white');
  log('🧪 Test files:        ≤600 (verde) | 600-1000 (giallo) | >1000 (rosso)', 'white');
  log('⚙️ Config/Build:       ≤150 (verde) | 150-300 (giallo) | >300 (rosso)', 'white');

  const violations = { green: 0, yellow: 0, red: 0, total: 0 };
  const redFiles = [];

  Object.entries(FILE_LIMITS).forEach(([type, config]) => {
    log(`\n📂 ${type.replace('_', ' ')} (≤${config.verde} verde, ≤${config.giallo} giallo, >${config.rosso} rosso)`, 'blue');
    
    const files = glob.sync(config.pattern, { ignore: 'node_modules/**' });
    const typeStats = { green: 0, yellow: 0, red: 0 };
    
    files.forEach(file => {
      const lines = countLines(file);
      const { status, color } = getStatus(lines, config);
      
      if (status === 'ROSSO') {
        log(`  🔴 ${file}: ${lines} righe (+${lines - config.rosso})`, color);
        redFiles.push({ file, lines, type, excess: lines - config.rosso });
        typeStats.red++;
        violations.red++;
      } else if (status === 'GIALLO') {
        log(`  🟡 ${file}: ${lines} righe (+${lines - config.verde})`, color);
        typeStats.yellow++;
        violations.yellow++;
      } else {
        typeStats.green++;
        violations.green++;
      }
      violations.total++;
    });
    
    log(`  ✅ ${typeStats.green} verdi | ⚠️ ${typeStats.yellow} gialli | 🔴 ${typeStats.red} rossi`);
  });

  return { violations, redFiles };
}

/**
 * CRITICAL FILES ANALYSIS - BASED ON NEW PROFESSIONAL THRESHOLDS
 */
function analyzeCriticalFiles() {
  log('\n🚨 CRITICAL FILES - REFACTORING ASSESSMENT', 'red');
  log('=' .repeat(80), 'red');

  const criticalFiles = [
    { name: 'ImpactTabScreen.tsx', current: 1082, redThreshold: 800, type: 'Screen/Domain', priority: 'CRITICO' },
    { name: 'ActionButtons.tsx', current: 916, redThreshold: 500, type: 'UI Component', priority: 'CRITICO' },
    { name: 'HomeHeaderSubComponents.tsx', current: 755, redThreshold: 500, type: 'UI Component', priority: 'CRITICO' },
    { name: 'FormattedText.tsx', current: 568, redThreshold: 500, type: 'UI Component', priority: 'MEDIO' },
  ];

  criticalFiles.forEach(file => {
    const excess = file.current - file.redThreshold;
    const isViolation = excess > 0;
    const status = isViolation ? 'VIOLA SOGLIA' : 'ENTRO LIMITI';
    const color = isViolation ? 'red' : 'green';
    
    if (isViolation) {
      const reduction = (excess / file.current * 100).toFixed(1);
      log(`🔴 ${file.name}: ${file.current} righe (${excess} oltre soglia ${file.redThreshold}) [-${reduction}%] [${file.priority}]`, color);
    } else {
      log(`✅ ${file.name}: ${file.current} righe (entro soglia ${file.redThreshold} per ${file.type})`, color);
    }
  });

  return criticalFiles.filter(file => file.current > file.redThreshold);
}

/**
 * SUGGEST REFACTORING STRATEGIES
 */
function suggestRefactoringStrategies(redFiles) {
  log('\n💡 REFACTORING STRATEGIES', 'magenta');
  log('=' .repeat(80), 'magenta');

  const strategies = {
    'UI_COMPONENT': [
      '🔧 Estrai sub-components (Header, Content, Footer)',
      '🔧 Separa logic hooks da presentation',
      '🔧 Usa compound component pattern',
      '🔧 Sposta styled-components in file separato'
    ],
    'SCREEN_CONTAINER': [
      '🔧 Estrai sezioni in componenti separati',
      '🔧 Sposta business logic in custom hooks',
      '🔧 Usa context per state condiviso',
      '🔧 Implementa lazy loading per sezioni'
    ],
    'HELPER_LIBRARY': [
      '🔧 Usa barrel exports (index.ts)',
      '🔧 Spezza per domain/feature',
      '🔧 Separa utils da business logic'
    ]
  };

  redFiles.forEach(({ file, type, lines, excess }) => {
    log(`\n📁 ${file} (${lines} righe, -${excess} necessarie)`, 'yellow');
    if (strategies[type]) {
      strategies[type].forEach(strategy => log(`   ${strategy}`));
    }
  });
}

/**
 * GENERATE REPORT
 */
function generateReport(violations, criticalFiles) {
  log('\n📊 SUMMARY REPORT', 'cyan');
  log('=' .repeat(80), 'cyan');

  const total = violations.total;
  const greenPercent = (violations.green / total * 100).toFixed(1);
  const yellowPercent = (violations.yellow / total * 100).toFixed(1);
  const redPercent = (violations.red / total * 100).toFixed(1);

  log(`Total Files Analyzed: ${total}`, 'bright');
  log(`✅ Green (Good): ${violations.green} (${greenPercent}%)`, 'green');
  log(`⚠️ Yellow (Review): ${violations.yellow} (${yellowPercent}%)`, 'yellow');
  log(`🔴 Red (Refactor): ${violations.red} (${redPercent}%)`, 'red');

  log('\n🎯 NEXT ACTIONS:', 'cyan');
  log('1. ImpactTabScreen.tsx: Split in 3-4 screen components', 'white');
  log('2. ActionButtons.tsx: Extract button components', 'white');
  log('3. HomeHeaderSubComponents.tsx: Break into atomic components', 'white');
  log('4. FormattedText.tsx: Extract platform-specific logic', 'white');

  // Save report to file
  const report = {
    timestamp: new Date().toISOString(),
    violations,
    criticalFiles,
    recommendations: {
      immediate: criticalFiles.filter(f => f.priority === 'CRITICO').length,
      shortTerm: criticalFiles.filter(f => f.priority === 'ALTO').length,
      mediumTerm: criticalFiles.filter(f => f.priority === 'MEDIO').length,
    }
  };

  fs.writeFileSync('file-size-report.json', JSON.stringify(report, null, 2));
  log('\n💾 Report saved to: file-size-report.json', 'green');
}

/**
 * MAIN EXECUTION
 */
function main() {
  const { violations, redFiles } = analyzeFilesByType();
  const criticalFiles = analyzeCriticalFiles();
  suggestRefactoringStrategies(redFiles);
  generateReport(violations, criticalFiles);

  // Exit with error if critical violations
  if (violations.red > 0) {
    log(`\n❌ Found ${violations.red} files that need refactoring!`, 'red');
    process.exit(1);
  } else {
    log('\n✅ All files comply with size guidelines!', 'green');
    process.exit(0);
  }
}

if (require.main === module) {
  main();
}

module.exports = { analyzeFilesByType, suggestRefactoringStrategies }; 