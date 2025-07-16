#!/usr/bin/env node

/**
 * 📦 BUNDLE ANALYSIS SYSTEM - RISE AGAINST HUNGER ITALIA
 * Sistema avanzato per analisi e ottimizzazione bundle React Native/Expo
 * Implementato: 2025-07-01 - Roadmap Performance Enterprise
 */

/* eslint-disable @typescript-eslint/no-var-requires */
const fs = require('fs');
const path = require('path');

// 🎯 CONFIGURAZIONE ANALISI
const BUNDLE_CONFIG = {
  // Soglie di warning (MB)
  thresholds: {
    totalSize: 25, // Bundle totale
    jsBundle: 15, // Solo JavaScript
    assets: 10, // Assets (immagini, fonts)
    dependencies: 20, // node_modules
  },

  // Patterns per analisi
  patterns: {
    exclude: [
      'node_modules',
      '.git',
      '.expo',
      'android',
      'ios',
      'web-build',
      '__tests__',
      '*.test.ts',
      '*.test.tsx',
    ],
    include: ['src/**/*.ts', 'src/**/*.tsx', 'src/**/*.js', 'assets/**/*'],
  },

  // Ottimizzazioni consigliate
  optimizations: {
    dynamicImports: [
      'react-native-maps',
      'react-native-svg',
      'react-native-reanimated',
    ],
    treeshaking: ['lodash', '@expo/vector-icons', 'react-native-paper'],
  },
};

// 📊 CLASSE BUNDLE ANALYZER
class BundleAnalyzer {
  constructor() {
    this.results = {
      totalSize: 0,
      breakdown: {},
      dependencies: {},
      recommendations: [],
      timestamp: new Date().toISOString(),
    };
  }

  // 🔍 Analizza dimensioni directory
  analyzeDirectory(dirPath, name = 'root') {
    if (!fs.existsSync(dirPath)) {
      return { size: 0, files: 0 };
    }

    let totalSize = 0;
    let fileCount = 0;

    const items = fs.readdirSync(dirPath);

    for (const item of items) {
      const itemPath = path.join(dirPath, item);
      const stats = fs.statSync(itemPath);

      if (stats.isDirectory()) {
        if (!BUNDLE_CONFIG.patterns.exclude.includes(item)) {
          const subResult = this.analyzeDirectory(itemPath, item);
          totalSize += subResult.size;
          fileCount += subResult.files;
        }
      } else if (stats.isFile()) {
        totalSize += stats.size;
        fileCount++;
      }
    }

    this.results.breakdown[name] = {
      size: totalSize,
      sizeHuman: this.formatBytes(totalSize),
      files: fileCount,
    };

    return { size: totalSize, files: fileCount };
  }

  // 📦 Analizza dipendenze
  analyzeDependencies() {
    try {
      const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
      const nodeModulesPath = 'node_modules';

      if (!fs.existsSync(nodeModulesPath)) {
        console.warn('⚠️ node_modules not found. Run npm install first.');
        return;
      }

      // Analizza dimensioni principali dipendenze
      const deps = {
        ...packageJson.dependencies,
        ...packageJson.devDependencies,
      };

      const largeDeps = [];

      for (const [dep, version] of Object.entries(deps)) {
        const depPath = path.join(nodeModulesPath, dep);
        if (fs.existsSync(depPath)) {
          const result = this.analyzeDirectory(depPath, dep);
          if (result.size > 1024 * 1024) {
            // > 1MB
            largeDeps.push({
              name: dep,
              version,
              size: result.size,
              sizeHuman: this.formatBytes(result.size),
            });
          }
        }
      }

      // Ordina per dimensione
      largeDeps.sort((a, b) => b.size - a.size);
      this.results.dependencies = largeDeps.slice(0, 10); // Top 10
    } catch (error) {
      console.error('❌ Error analyzing dependencies:', error.message);
    }
  }

  // 💡 Genera raccomandazioni
  generateRecommendations() {
    const recommendations = [];
    const { totalSize } = this.results;
    const totalMB = totalSize / (1024 * 1024);

    // Controlla soglie
    if (totalMB > BUNDLE_CONFIG.thresholds.totalSize) {
      recommendations.push({
        type: 'size',
        priority: 'high',
        message: `Bundle size is ${totalMB.toFixed(1)}MB (threshold: ${BUNDLE_CONFIG.thresholds.totalSize}MB)`,
        actions: [
          'Consider code splitting with dynamic imports',
          'Remove unused dependencies',
          'Optimize asset compression',
        ],
      });
    }

    // Analizza dipendenze grandi
    const largeDeps = this.results.dependencies.filter(
      dep => dep.size > 5 * 1024 * 1024 // > 5MB
    );

    if (largeDeps.length > 0) {
      const actions = largeDeps.map(
        dep =>
          `Consider lazy loading or alternatives for ${dep.name} (${dep.sizeHuman})`
      );
      recommendations.push({
        type: 'dependencies',
        priority: 'medium',
        message: `Found ${largeDeps.length} large dependencies`,
        actions,
      });
    }

    // Suggerimenti specifici per React Native
    recommendations.push({
      type: 'optimization',
      priority: 'low',
      message: 'React Native specific optimizations',
      actions: [
        'Enable Hermes JavaScript engine',
        'Use React.memo for expensive components',
        'Implement image lazy loading',
        'Consider Metro bundle splitting',
      ],
    });

    this.results.recommendations = recommendations;
  }

  // 🎨 Formatta bytes in formato leggibile
  formatBytes(bytes) {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  // 📋 Genera report completo
  generateReport() {
    const totalMB = (this.results.totalSize / (1024 * 1024)).toFixed(2);

    console.log(`
📦 BUNDLE ANALYSIS REPORT - ${this.results.timestamp}
${'='.repeat(60)}

📊 OVERVIEW:
  Total Bundle Size: ${this.formatBytes(this.results.totalSize)} (${totalMB} MB)
  Status: ${totalMB > BUNDLE_CONFIG.thresholds.totalSize ? '⚠️ EXCEEDS THRESHOLD' : '✅ WITHIN LIMITS'}

📁 BREAKDOWN:`);

    // Stampa breakdown
    Object.entries(this.results.breakdown)
      .sort(([, a], [, b]) => b.size - a.size)
      .slice(0, 10)
      .forEach(([name, data]) => {
        const percentage = ((data.size / this.results.totalSize) * 100).toFixed(
          1
        );
        const paddedName = name.padEnd(20);
        const paddedSize = data.sizeHuman.padStart(10);
        console.log(
          `  ${paddedName} ${paddedSize} (${percentage}%) - ${data.files} files`
        );
      });

    console.log(`
📦 LARGE DEPENDENCIES:`);

    this.results.dependencies.slice(0, 5).forEach(dep => {
      console.log(
        `  ${dep.name.padEnd(25)} ${dep.sizeHuman.padStart(10)} (${dep.version})`
      );
    });

    console.log(`
💡 RECOMMENDATIONS:`);

    this.results.recommendations.forEach(rec => {
      let icon = '🔵';
      if (rec.priority === 'high') {
        icon = '🔴';
      } else if (rec.priority === 'medium') {
        icon = '🟡';
      }
      console.log(
        `\n  ${icon} ${rec.type.toUpperCase()} - ${rec.priority.toUpperCase()}`
      );
      console.log(`     ${rec.message}`);
      rec.actions.forEach(action => {
        console.log(`     • ${action}`);
      });
    });

    console.log(`
📄 DETAILED REPORT SAVED TO: bundle-analysis-report.json
🎯 NEXT STEPS: Implement recommendations based on priority
${'='.repeat(60)}
    `);
  }

  // 💾 Salva report dettagliato
  saveDetailedReport() {
    const reportPath = 'bundle-analysis-report.json';
    const report = {
      ...this.results,
      config: BUNDLE_CONFIG,
      analysis: {
        totalSizeMB: (this.results.totalSize / (1024 * 1024)).toFixed(2),
        exceedsThreshold:
          this.results.totalSize >
          BUNDLE_CONFIG.thresholds.totalSize * 1024 * 1024,
        topFiles: Object.entries(this.results.breakdown)
          .sort(([, a], [, b]) => b.size - a.size)
          .slice(0, 20),
      },
    };

    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    console.log(`📄 Detailed report saved to: ${reportPath}`);
  }

  // 🚀 Esegui analisi completa
  run() {
    console.log('📦 Starting Bundle Analysis...\n');

    // Analizza struttura progetto
    const projectResult = this.analyzeDirectory('.', 'project');
    this.results.totalSize = projectResult.size;

    // Analizza sezioni specifiche
    this.analyzeDirectory('src', 'src');
    this.analyzeDirectory('assets', 'assets');
    this.analyzeDirectory('node_modules', 'node_modules');

    // Analizza dipendenze
    this.analyzeDependencies();

    // Genera raccomandazioni
    this.generateRecommendations();

    // Mostra e salva report
    this.generateReport();
    this.saveDetailedReport();
  }
}

// 🎯 ESECUZIONE MAIN
if (require.main === module) {
  const analyzer = new BundleAnalyzer();
  analyzer.run();
}

module.exports = BundleAnalyzer;
