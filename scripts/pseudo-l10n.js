#!/usr/bin/env node

/**
 * PSEUDO-LOCALIZATION SCRIPT
 *
 * Script per testare il layout con testi estremamente lunghi,
 * caratteri CJK e emoji per verificare la robustezza del sistema responsive.
 *
 * Comportamento:
 * - Raddoppia lunghezza testi esistenti
 * - Aggiunge caratteri CJK + emoji
 * - Verifica layout su righe multiple
 * - Blocca build se overflow
 */

const fs = require('fs');
const path = require('path');

// Configurazione
const CONFIG = {
  // Directories da scannerizzare
  scanDirs: ['src/components', 'src/features', 'src/screens', 'src/data'],

  // Estensioni file da processare
  extensions: ['.tsx', '.ts', '.jsx', '.js'],

  // Patterns per identificare testi
  textPatterns: [
    /FormattedText[^>]*>([^<]+)</g,
    /Text[^>]*>([^<]+)</g,
    /"([^"]{10,})"/g, // Stringhe lunghe
    /'([^']{10,})'/g, // Stringhe lunghe
  ],

  // Caratteri pseudo-l10n
  pseudoChars: {
    latin: 'ÁÉÍÓÚáéíóúñÑçÇ',
    cjk: '中文日本語한국어',
    emoji: '🚀🌍❤️⚡🔥💪🎯',
    arabic: 'العربية',
    russian: 'Русский',
  },

  // Fattore di espansione testo
  expansionFactor: 1.8,

  // File di output
  outputFile: 'pseudo-l10n-report.json',

  // Soglia di warning per lunghezza
  warningThreshold: 80,

  // Soglia di errore per lunghezza
  errorThreshold: 120,
};

class PseudoLocalizationTester {
  constructor() {
    this.results = {
      totalFiles: 0,
      processedFiles: 0,
      textsFound: 0,
      warnings: [],
      errors: [],
      suggestions: [],
      stats: {
        averageLength: 0,
        maxLength: 0,
        minLength: Infinity,
        cjkTexts: 0,
        emojiTexts: 0,
        longTexts: 0,
      },
    };
  }

  /**
   * Punto di ingresso principale
   */
  async run() {
    console.log('🌍 Starting Pseudo-Localization Testing...\n');

    try {
      // Scansiona tutti i file
      const files = this.scanFiles();

      // Processa ogni file
      for (const file of files) {
        await this.processFile(file);
      }

      // Genera report
      this.generateReport();

      // Salva risultati
      this.saveResults();

      // Determina exit code
      const exitCode = this.results.errors.length > 0 ? 1 : 0;

      if (exitCode === 0) {
        console.log('\n✅ Pseudo-localization test PASSED');
      } else {
        console.log('\n❌ Pseudo-localization test FAILED');
        console.log(
          `Found ${this.results.errors.length} errors that need fixing`
        );
      }

      process.exit(exitCode);
    } catch (error) {
      console.error('❌ Error during pseudo-localization testing:', error);
      process.exit(1);
    }
  }

  /**
   * Scansiona tutti i file nelle directory specificate
   */
  scanFiles() {
    const files = [];

    for (const dir of CONFIG.scanDirs) {
      if (fs.existsSync(dir)) {
        const dirFiles = this.scanDirectory(dir);
        files.push(...dirFiles);
      }
    }

    this.results.totalFiles = files.length;
    console.log(`📁 Found ${files.length} files to process`);

    return files;
  }

  /**
   * Scansiona ricorsivamente una directory
   */
  scanDirectory(dir) {
    const files = [];
    const items = fs.readdirSync(dir);

    for (const item of items) {
      const fullPath = path.join(dir, item);
      const stat = fs.statSync(fullPath);

      if (stat.isDirectory()) {
        files.push(...this.scanDirectory(fullPath));
      } else if (CONFIG.extensions.some(ext => item.endsWith(ext))) {
        files.push(fullPath);
      }
    }

    return files;
  }

  /**
   * Processa un singolo file
   */
  async processFile(filePath) {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      const texts = this.extractTexts(content);

      if (texts.length === 0) return;

      this.results.processedFiles++;
      this.results.textsFound += texts.length;

      console.log(`📄 Processing ${filePath} (${texts.length} texts)`);

      // Testa ogni testo trovato
      for (const text of texts) {
        await this.testText(text, filePath);
      }
    } catch (error) {
      this.results.errors.push({
        file: filePath,
        type: 'FILE_ERROR',
        message: `Error reading file: ${error.message}`,
        severity: 'error',
      });
    }
  }

  /**
   * Estrae testi da un file
   */
  extractTexts(content) {
    const texts = [];

    for (const pattern of CONFIG.textPatterns) {
      let match;
      while ((match = pattern.exec(content)) !== null) {
        const text = match[1]?.trim();
        if (
          text &&
          text.length > 3 &&
          !text.includes('{') &&
          !text.includes('<')
        ) {
          texts.push({
            original: text,
            line: this.getLineNumber(content, match.index),
            column: this.getColumnNumber(content, match.index),
          });
        }
      }
    }

    return texts;
  }

  /**
   * Testa un singolo testo
   */
  async testText(textObj, filePath) {
    const { original } = textObj;

    // Genera versione pseudo-localizzata
    const pseudoText = this.generatePseudoText(original);

    // Aggiorna statistiche
    this.updateStats(original, pseudoText);

    // Controlla lunghezza
    if (pseudoText.length > CONFIG.errorThreshold) {
      this.results.errors.push({
        file: filePath,
        line: textObj.line,
        column: textObj.column,
        type: 'TEXT_TOO_LONG',
        message: `Text too long after pseudo-localization: ${pseudoText.length} chars (max: ${CONFIG.errorThreshold})`,
        original: original,
        pseudoLocalized: pseudoText,
        severity: 'error',
      });
    } else if (pseudoText.length > CONFIG.warningThreshold) {
      this.results.warnings.push({
        file: filePath,
        line: textObj.line,
        column: textObj.column,
        type: 'TEXT_LONG',
        message: `Text may be too long after pseudo-localization: ${pseudoText.length} chars`,
        original: original,
        pseudoLocalized: pseudoText,
        severity: 'warning',
      });
    }

    // Suggerimenti per miglioramenti
    if (original.length > 30 && !original.includes('\n')) {
      this.results.suggestions.push({
        file: filePath,
        line: textObj.line,
        type: 'CONSIDER_FIXED_LINES',
        message: `Consider using fixedLines={2} for better layout control`,
        original: original,
        severity: 'info',
      });
    }
  }

  /**
   * Genera testo pseudo-localizzato
   */
  generatePseudoText(text) {
    let pseudo = text;

    // Espansione base
    pseudo = pseudo.repeat(CONFIG.expansionFactor);

    // Aggiunta caratteri speciali
    const chars = CONFIG.pseudoChars;
    pseudo = pseudo.replace(/a/g, chars.latin[0]);
    pseudo = pseudo.replace(/e/g, chars.latin[1]);
    pseudo = pseudo.replace(/i/g, chars.latin[2]);
    pseudo = pseudo.replace(/o/g, chars.latin[3]);
    pseudo = pseudo.replace(/u/g, chars.latin[4]);

    // Aggiunta CJK random
    if (Math.random() > 0.7) {
      pseudo += ` ${chars.cjk[Math.floor(Math.random() * chars.cjk.length)]}`;
    }

    // Aggiunta emoji random
    if (Math.random() > 0.8) {
      pseudo += ` ${chars.emoji[Math.floor(Math.random() * chars.emoji.length)]}`;
    }

    // Aggiunta Arabic/Russian random
    if (Math.random() > 0.9) {
      pseudo += ` ${Math.random() > 0.5 ? chars.arabic : chars.russian}`;
    }

    return pseudo;
  }

  /**
   * Aggiorna statistiche
   */
  updateStats(original, pseudo) {
    this.results.stats.maxLength = Math.max(
      this.results.stats.maxLength,
      pseudo.length
    );
    this.results.stats.minLength = Math.min(
      this.results.stats.minLength,
      pseudo.length
    );

    if (pseudo.includes(CONFIG.pseudoChars.cjk)) {
      this.results.stats.cjkTexts++;
    }

    if (pseudo.includes(CONFIG.pseudoChars.emoji)) {
      this.results.stats.emojiTexts++;
    }

    if (pseudo.length > CONFIG.warningThreshold) {
      this.results.stats.longTexts++;
    }
  }

  /**
   * Genera report finale
   */
  generateReport() {
    console.log('\n📊 PSEUDO-LOCALIZATION REPORT');
    console.log('================================');

    console.log(
      `📁 Files processed: ${this.results.processedFiles}/${this.results.totalFiles}`
    );
    console.log(`📝 Texts found: ${this.results.textsFound}`);
    console.log(`⚠️  Warnings: ${this.results.warnings.length}`);
    console.log(`❌ Errors: ${this.results.errors.length}`);
    console.log(`💡 Suggestions: ${this.results.suggestions.length}`);

    console.log('\n📈 STATISTICS');
    console.log(`Max length: ${this.results.stats.maxLength} chars`);
    console.log(`Min length: ${this.results.stats.minLength} chars`);
    console.log(`CJK texts: ${this.results.stats.cjkTexts}`);
    console.log(`Emoji texts: ${this.results.stats.emojiTexts}`);
    console.log(`Long texts: ${this.results.stats.longTexts}`);

    // Mostra errori
    if (this.results.errors.length > 0) {
      console.log('\n❌ ERRORS:');
      this.results.errors.forEach((error, i) => {
        console.log(`${i + 1}. ${error.file}:${error.line}:${error.column}`);
        console.log(`   ${error.message}`);
        console.log(`   Original: "${error.original}"`);
        console.log(
          `   Pseudo: "${error.pseudoLocalized?.substring(0, 80)}..."`
        );
      });
    }

    // Mostra warnings
    if (this.results.warnings.length > 0) {
      console.log('\n⚠️  WARNINGS:');
      this.results.warnings.slice(0, 5).forEach((warning, i) => {
        console.log(
          `${i + 1}. ${warning.file}:${warning.line}:${warning.column}`
        );
        console.log(`   ${warning.message}`);
      });
      if (this.results.warnings.length > 5) {
        console.log(`   ... and ${this.results.warnings.length - 5} more`);
      }
    }
  }

  /**
   * Salva risultati su file
   */
  saveResults() {
    const report = {
      timestamp: new Date().toISOString(),
      config: CONFIG,
      results: this.results,
    };

    fs.writeFileSync(CONFIG.outputFile, JSON.stringify(report, null, 2));
    console.log(`\n💾 Report saved to ${CONFIG.outputFile}`);
  }

  /**
   * Utility: ottiene numero di riga
   */
  getLineNumber(content, index) {
    return content.substring(0, index).split('\n').length;
  }

  /**
   * Utility: ottiene numero di colonna
   */
  getColumnNumber(content, index) {
    const lines = content.substring(0, index).split('\n');
    return lines[lines.length - 1].length + 1;
  }
}

// Esegui se chiamato direttamente
if (require.main === module) {
  const tester = new PseudoLocalizationTester();
  tester.run();
}

module.exports = PseudoLocalizationTester;
