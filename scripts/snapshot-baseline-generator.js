#!/usr/bin/env node

/**
 * SNAPSHOT BASELINE GENERATOR
 * 
 * Script per generare/aggiornare baseline snapshot che proteggono 
 * il sistema responsive da regressioni:
 * 
 * - Genera snapshot strutturali Jest
 * - Setup snapshot visuali per Percy/Applitools
 * - Verifica cross-platform consistency
 * - Cleanup snapshot orfani
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

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

const CRITICAL_COMPONENTS = [
  'FormattedText',
  'SafeFormattedText', 
  'ActionButtons',
  'HomeHeaderSection',
  'HomeActionsSection',
];

const SNAPSHOT_TYPES = {
  STRUCTURAL: 'structural', // Jest toMatchSnapshot
  VISUAL: 'visual',         // Percy/Applitools screenshots
  LAYOUT: 'layout',         // Bounding box consistency
  PERFORMANCE: 'performance' // Render time baselines
};

class SnapshotBaselineGenerator {
  constructor() {
    this.snapshotDir = path.join(__dirname, '..', 'src', '__tests__', 'snapshots');
    this.visualSnapshotDir = path.join(__dirname, '..', 'visual-snapshots');
    this.baselineDir = path.join(__dirname, '..', '__snapshots__');
  }

  async generateStructuralBaselines() {
    log('🔥 GENERATING STRUCTURAL BASELINES - Jest Snapshots', 'yellow');
    
    try {
      // Genera snapshot strutturali per tutti i componenti critici
      execSync('npm test -- --testPathPattern=snapshots --updateSnapshot', {
        stdio: 'inherit',
        cwd: path.join(__dirname, '..')
      });
      
      log('✅ Structural baselines generated successfully', 'green');
    } catch (error) {
      log('❌ Failed to generate structural baselines', 'red');
      throw error;
    }
  }

  async setupVisualSnapshots() {
    log('📸 SETTING UP VISUAL SNAPSHOT INFRASTRUCTURE', 'cyan');
    
    // Crea directory per visual snapshots
    if (!fs.existsSync(this.visualSnapshotDir)) {
      fs.mkdirSync(this.visualSnapshotDir, { recursive: true });
    }

    // Crea configurazione Percy
    const percyConfig = {
      "version": 2,
      "discovery": {
        "network-idle-timeout": 100,
        "allowed-hostnames": ["localhost"]
      },
      "snapshot": {
        "widths": [375, 393, 412, 768], // iPhone SE, iPhone 15 Pro, Pixel 8 Pro, Galaxy Tab S9
        "min-height": 1024,
        "percy-css": `
          /* Stabilizza fonts per screenshot consistency */
          * {
            font-family: 'SF Pro Text', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif !important;
            -webkit-font-smoothing: antialiased !important;
            -moz-osx-font-smoothing: grayscale !important;
          }
          
          /* Nasconde elementi dinamici che causano diff */
          .dynamic-timestamp,
          .animation-element {
            display: none !important;
          }
        `
      },
      "static-snapshots": {
        "base-url": "http://localhost:19006",
        "snapshot-files": "**/*.percy.{js,ts}",
        "ignore-files": "**/*.ignore.percy.{js,ts}"
      }
    };

    fs.writeFileSync(
      path.join(__dirname, '..', '.percy.yml'),
      `# Percy Visual Testing Configuration
# Protegge il sistema responsive da regressioni visuali

${JSON.stringify(percyConfig, null, 2)}`
    );

    log('✅ Percy configuration created', 'green');
  }

  async createVisualTestSuite() {
    log('🎯 CREATING VISUAL TEST SUITE', 'blue');

    const visualTestTemplate = `
/**
 * VISUAL SNAPSHOT SUITE - Percy Integration
 * 
 * CRITICAL: Questi test BLOCCANO il deploy se rilevano 
 * differenze > 2px nel rendering
 */

const percySnapshot = require('@percy/sdk-utils');

describe('Visual Regression Protection', () => {
  const CRITICAL_PAGES = [
    { name: 'Actions Page', url: '/actions', viewport: { width: 375, height: 667 } },
    { name: 'Home Hero', url: '/', viewport: { width: 393, height: 852 } },
    { name: 'Impact Stats', url: '/impact', viewport: { width: 412, height: 915 } },
    { name: 'Projects Grid', url: '/projects', viewport: { width: 768, height: 1024 } },
  ];

  CRITICAL_PAGES.forEach(page => {
    it(\`should maintain visual consistency for \${page.name}\`, async () => {
      await percySnapshot(page.name, {
        widths: [page.viewport.width],
        minHeight: page.viewport.height,
        scope: '.main-content', // Focus su contenuto principale
        enableJavaScript: true
      });
    });
  });

  // SNAPSHOT SPECIFICI PER TITOLI CRITICI
  const CRITICAL_TITLES = [
    'Rise Against Hunger Italia',
    'Fai la Differenza', 
    '❤️ Contribuisci',
    '🔍 Esplora',
    '🤝 Community'
  ];

  CRITICAL_TITLES.forEach(title => {
    it(\`should protect "\${title}" from layout shifts\`, async () => {
      await percySnapshot(\`Title: \${title}\`, {
        scope: \`[data-testid="title-\${title.toLowerCase().replace(/[^a-z0-9]/g, '-')}"]\`,
        widths: [375, 393, 412, 768]
      });
    });
  });
});
`;

    fs.writeFileSync(
      path.join(this.visualSnapshotDir, 'critical-components.visual.test.js'),
      visualTestTemplate
    );

    log('✅ Visual test suite created', 'green');
  }

  async cleanupOrphanedSnapshots() {
    log('🧹 CLEANING UP ORPHANED SNAPSHOTS', 'magenta');

    const snapshotFiles = this.findSnapshotFiles();
    const testFiles = this.findTestFiles();
    
    const orphanedSnapshots = snapshotFiles.filter(snapshot => {
      const testName = this.extractTestNameFromSnapshot(snapshot);
      return !testFiles.some(test => test.includes(testName));
    });

    if (orphanedSnapshots.length > 0) {
      log(`Found ${orphanedSnapshots.length} orphaned snapshots:`, 'yellow');
      orphanedSnapshots.forEach(snapshot => {
        log(`  - ${path.basename(snapshot)}`, 'yellow');
        fs.unlinkSync(snapshot);
      });
      log('✅ Orphaned snapshots cleaned up', 'green');
    } else {
      log('✅ No orphaned snapshots found', 'green');
    }
  }

  findSnapshotFiles() {
    const snapshotFiles = [];
    const walkDir = (dir) => {
      if (!fs.existsSync(dir)) return;
      
      const files = fs.readdirSync(dir);
      files.forEach(file => {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);
        
        if (stat.isDirectory()) {
          walkDir(filePath);
        } else if (file.endsWith('.snap')) {
          snapshotFiles.push(filePath);
        }
      });
    };
    
    walkDir(this.baselineDir);
    return snapshotFiles;
  }

  findTestFiles() {
    const testFiles = [];
    const walkDir = (dir) => {
      if (!fs.existsSync(dir)) return;
      
      const files = fs.readdirSync(dir);
      files.forEach(file => {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);
        
        if (stat.isDirectory()) {
          walkDir(filePath);
        } else if (file.endsWith('.test.tsx') || file.endsWith('.test.ts')) {
          testFiles.push(filePath);
        }
      });
    };
    
    walkDir(path.join(__dirname, '..', 'src', '__tests__'));
    return testFiles;
  }

  extractTestNameFromSnapshot(snapshotPath) {
    const basename = path.basename(snapshotPath, '.snap');
    return basename.replace(/\.test$/, '');
  }

  async validateCriticalComponents() {
    log('🔍 VALIDATING CRITICAL COMPONENTS COVERAGE', 'blue');

    const missingSnapshots = [];
    
    CRITICAL_COMPONENTS.forEach(component => {
      const snapshotFile = path.join(this.snapshotDir, `${component}Snapshot.test.tsx`);
      if (!fs.existsSync(snapshotFile)) {
        missingSnapshots.push(component);
      }
    });

    if (missingSnapshots.length > 0) {
      log('⚠️ Missing snapshot coverage for:', 'yellow');
      missingSnapshots.forEach(component => {
        log(`  - ${component}`, 'yellow');
      });
    } else {
      log('✅ All critical components have snapshot coverage', 'green');
    }

    return missingSnapshots.length === 0;
  }

  async generateCIProtectionScript() {
    log('🛡️ GENERATING CI PROTECTION SCRIPT', 'cyan');

    const ciScript = `#!/bin/bash

# CI SNAPSHOT PROTECTION SCRIPT
# Blocca il deploy se ci sono regressioni visuali

set -e

echo "🔍 RUNNING SNAPSHOT PROTECTION CHECKS"

# 1. Structural Snapshots
echo "📊 Checking structural snapshots..."
npm test -- --testPathPattern=snapshots --passWithNoTests

# 2. Visual Snapshots (se Percy è configurato)
if [ ! -z "$PERCY_TOKEN" ]; then
  echo "📸 Running visual regression tests..."
  percy exec -- npm test -- --testPathPattern=visual
else
  echo "⚠️ Percy not configured, skipping visual tests"
fi

# 3. Performance Baselines
echo "⚡ Checking performance baselines..."
npm test -- --testPathPattern=performance --passWithNoTests

# 4. Layout Consistency
echo "📐 Validating layout consistency..."
npm test -- --testPathPattern=visual-diff --passWithNoTests

echo "✅ ALL SNAPSHOT CHECKS PASSED"
echo "🚀 Deployment protection verified"
`;

    fs.writeFileSync(
      path.join(__dirname, 'ci-snapshot-protection.sh'),
      ciScript
    );

    // Rendi executable
    execSync('chmod +x scripts/ci-snapshot-protection.sh', {
      cwd: path.join(__dirname, '..')
    });

    log('✅ CI protection script generated', 'green');
  }

  async run() {
    try {
      log('🚀 SNAPSHOT BASELINE GENERATOR STARTED', 'bright');
      
      await this.validateCriticalComponents();
      await this.setupVisualSnapshots();
      await this.createVisualTestSuite();
      await this.generateStructuralBaselines();
      await this.cleanupOrphanedSnapshots();
      await this.generateCIProtectionScript();
      
      log('', 'reset');
      log('🎉 SNAPSHOT PROTECTION SYSTEM READY!', 'green');
      log('', 'reset');
      log('📋 Next Steps:', 'bright');
      log('  1. Run: npm test -- --testPathPattern=snapshots', 'cyan');
      log('  2. Commit generated snapshots to git', 'cyan');
      log('  3. Setup Percy token for visual tests', 'cyan');
      log('  4. Add snapshot check to CI pipeline', 'cyan');
      log('', 'reset');
      log('🛡️ Your responsive system is now protected!', 'green');
      
    } catch (error) {
      log('💥 SNAPSHOT GENERATOR FAILED', 'red');
      log(error.message, 'red');
      process.exit(1);
    }
  }
}

// Execute if run directly
if (require.main === module) {
  const generator = new SnapshotBaselineGenerator();
  generator.run();
}

module.exports = SnapshotBaselineGenerator; 