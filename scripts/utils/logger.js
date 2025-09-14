#!/usr/bin/env node

/**
 * LOGGER STRUTTURATO PER SCRIPT WORKFLOW
 * Sistema di logging configurabile con livelli di verbosità
 */

// Livelli di logging
const LOG_LEVELS = {
  SILENT: 0,
  ERROR: 1,
  WARN: 2,
  INFO: 3,
  VERBOSE: 4,
  DEBUG: 5,
};

// Configurazione da variabili ambiente
const LOG_LEVEL = process.env.LOG_LEVEL || 'INFO';
const CURRENT_LEVEL = LOG_LEVELS[LOG_LEVEL.toUpperCase()] || LOG_LEVELS.INFO;
const ENABLE_COLORS = process.env.NO_COLOR !== '1';

// Colori ANSI
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
  gray: '\x1b[90m',
};

/**
 * Applica colore al testo se abilitato
 */
function colorize(text, color) {
  if (!ENABLE_COLORS) return text;
  return `${colors[color] || ''}${text}${colors.reset}`;
}

/**
 * Formatta timestamp
 */
function getTimestamp() {
  return new Date().toISOString().replace('T', ' ').slice(0, 19);
}

/**
 * Logger principale
 */
class WorkflowLogger {
  constructor() {
    this.startTime = Date.now();
    this.phase = null;
    this.errors = [];
    this.warnings = [];
  }

  // Metodi di logging per livello
  error(message, details = null) {
    if (CURRENT_LEVEL >= LOG_LEVELS.ERROR) {
      const formatted = this._format('ERROR', message, 'red');
      console.error(formatted);
      if (details && CURRENT_LEVEL >= LOG_LEVELS.DEBUG) {
        console.error(colorize(JSON.stringify(details, null, 2), 'gray'));
      }
      this.errors.push({ message, details, timestamp: getTimestamp() });
    }
  }

  warn(message, details = null) {
    if (CURRENT_LEVEL >= LOG_LEVELS.WARN) {
      const formatted = this._format('WARN', message, 'yellow');
      console.warn(formatted);
      if (details && CURRENT_LEVEL >= LOG_LEVELS.DEBUG) {
        console.warn(colorize(JSON.stringify(details, null, 2), 'gray'));
      }
      this.warnings.push({ message, details, timestamp: getTimestamp() });
    }
  }

  info(message, details = null) {
    if (CURRENT_LEVEL >= LOG_LEVELS.INFO) {
      const formatted = this._format('INFO', message, 'blue');
      console.log(formatted);
      if (details && CURRENT_LEVEL >= LOG_LEVELS.DEBUG) {
        console.log(colorize(JSON.stringify(details, null, 2), 'gray'));
      }
    }
  }

  success(message, details = null) {
    if (CURRENT_LEVEL >= LOG_LEVELS.INFO) {
      const formatted = this._format('SUCCESS', message, 'green');
      console.log(formatted);
      if (details && CURRENT_LEVEL >= LOG_LEVELS.DEBUG) {
        console.log(colorize(JSON.stringify(details, null, 2), 'gray'));
      }
    }
  }

  verbose(message, details = null) {
    if (CURRENT_LEVEL >= LOG_LEVELS.VERBOSE) {
      const formatted = this._format('VERBOSE', message, 'cyan');
      console.log(formatted);
      if (details) {
        console.log(colorize(JSON.stringify(details, null, 2), 'gray'));
      }
    }
  }

  debug(message, details = null) {
    if (CURRENT_LEVEL >= LOG_LEVELS.DEBUG) {
      const formatted = this._format('DEBUG', message, 'magenta');
      console.log(formatted);
      if (details) {
        console.log(colorize(JSON.stringify(details, null, 2), 'gray'));
      }
    }
  }

  // Metodi per fasi del workflow
  startPhase(phaseName, description = '') {
    this.phase = phaseName;
    if (CURRENT_LEVEL >= LOG_LEVELS.INFO) {
      const separator = '='.repeat(50);
      console.log(colorize(`\n${separator}`, 'gray'));
      console.log(colorize(`🎯 FASE: ${phaseName}`, 'cyan'));
      if (description) {
        console.log(colorize(description, 'gray'));
      }
      console.log(colorize(separator, 'gray'));
    }
  }

  endPhase(success = true, summary = '') {
    if (CURRENT_LEVEL >= LOG_LEVELS.INFO) {
      const status = success
        ? colorize('✅ COMPLETATA', 'green')
        : colorize('❌ FALLITA', 'red');
      console.log(`\n${status}: ${this.phase}`);
      if (summary) {
        console.log(colorize(summary, 'gray'));
      }
    }
    this.phase = null;
  }

  // Metodi per risultati finali
  summary() {
    if (CURRENT_LEVEL >= LOG_LEVELS.INFO) {
      const duration = ((Date.now() - this.startTime) / 1000).toFixed(2);
      const separator = '='.repeat(60);

      console.log(`\n${colorize(separator, 'gray')}`);
      console.log(colorize('📊 RIEPILOGO WORKFLOW', 'cyan'));
      console.log(colorize(separator, 'gray'));
      console.log(`⏱️  Durata: ${duration}s`);
      console.log(`❌ Errori: ${this.errors.length}`);
      console.log(`⚠️  Warning: ${this.warnings.length}`);

      if (this.errors.length === 0 && this.warnings.length === 0) {
        console.log(colorize('✅ STATO: PERFETTO', 'green'));
      } else {
        console.log(colorize('🚫 STATO: PROBLEMI RILEVATI', 'red'));
      }
      console.log(colorize(separator, 'gray'));
    }
  }

  // Metodo privato per formattazione
  _format(level, message, color) {
    const timestamp =
      CURRENT_LEVEL >= LOG_LEVELS.DEBUG ? `[${getTimestamp()}] ` : '';
    const levelTag = CURRENT_LEVEL >= LOG_LEVELS.VERBOSE ? `[${level}] ` : '';
    const phaseTag =
      this.phase && CURRENT_LEVEL >= LOG_LEVELS.VERBOSE
        ? `[${this.phase}] `
        : '';

    return colorize(`${timestamp}${levelTag}${phaseTag}${message}`, color);
  }

  // Metodi di utilità
  getErrorCount() {
    return this.errors.length;
  }

  getWarningCount() {
    return this.warnings.length;
  }

  hasErrors() {
    return this.errors.length > 0;
  }

  hasWarnings() {
    return this.warnings.length > 0;
  }

  getErrors() {
    return this.errors;
  }

  getWarnings() {
    return this.warnings;
  }
}

// Istanza singleton
const logger = new WorkflowLogger();

// Export per CommonJS e ES modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { logger, LOG_LEVELS };
}

export { logger, LOG_LEVELS };
export default logger;
