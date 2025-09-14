#!/usr/bin/env node

/**
 * WORKFLOW PRE-MODIFICHE - VERIFICHE RIGOROSE
 * Controlla errori E warnings - ZERO TOLLERANZA
 * Versione ottimizzata con logging strutturato
 */

import { execSync } from 'child_process';
import { logger } from './utils/logger.js';

// Configurazione da variabili ambiente
const SILENT_MODE = process.env.WORKFLOW_SILENT === '1';
const VERBOSE_MODE = process.env.WORKFLOW_VERBOSE === '1';

if (!SILENT_MODE) {
  logger.info('🔍 WORKFLOW PRE-MODIFICHE - ZERO TOLLERANZA ERRORI+WARNINGS');
}

let hasErrors = false;

// FASE 1: Controllo iniziale rigido
logger.startPhase('CONTROLLO RIGIDO INIZIALE');

try {
  if (VERBOSE_MODE) {
    execSync('npm run conta-problemi', { stdio: 'inherit' });
  } else {
    execSync('npm run conta-problemi', { stdio: 'pipe' });
  }
  logger.success('Controllo iniziale superato');
} catch (error) {
  logger.error('Progetto non pronto - Problemi rilevati');
  hasErrors = true;
}

logger.endPhase(!hasErrors);

// FASE 2: Verifiche dettagliate (errori E warnings)
logger.startPhase(
  'VERIFICA DETTAGLIATA',
  'Zero tolleranza per errori e warnings'
);

// TypeScript
logger.verbose('Verificando sintassi TypeScript...');
try {
  const stdio = VERBOSE_MODE ? 'inherit' : 'pipe';
  execSync('npx tsc --noEmit --skipLibCheck', { stdio });
  logger.success('TypeScript: PULITO');
} catch (error) {
  logger.error('TypeScript: ERRORI TROVATI');
  if (VERBOSE_MODE && error.stdout) {
    console.error(error.stdout.toString());
  }
  hasErrors = true;
}

// ESLint
logger.verbose('Verificando ESLint (errori + warnings)...');
try {
  const stdio = VERBOSE_MODE ? 'inherit' : 'pipe';
  execSync('npx eslint "src/**/*.{ts,tsx}" --max-warnings 0', { stdio });
  logger.success('ESLint: PULITO');
} catch (error) {
  logger.error('ESLint: ERRORI/WARNINGS TROVATI');
  if (VERBOSE_MODE && error.stdout) {
    console.error(error.stdout.toString());
  }
  hasErrors = true;
}

// Prettier
logger.verbose('Verificando formatting...');
try {
  const stdio = VERBOSE_MODE ? 'inherit' : 'pipe';
  execSync('npx prettier --check "src/**/*.{ts,tsx}"', { stdio });
  logger.success('Prettier: PULITO');
} catch (error) {
  logger.error('Prettier: PROBLEMI FORMATTING');
  if (VERBOSE_MODE && error.stdout) {
    console.error(error.stdout.toString());
  }
  hasErrors = true;
}

// Test
logger.verbose('Verificando test...');
try {
  const stdio = VERBOSE_MODE ? 'inherit' : 'pipe';
  execSync('npm test', { stdio });
  logger.success('Test: TUTTI PASSANO');
} catch (error) {
  logger.error('Test: FALLIMENTI RILEVATI');
  if (VERBOSE_MODE && error.stdout) {
    console.error(error.stdout.toString());
  }
  hasErrors = true;
}

logger.endPhase(!hasErrors);

// FASE 3: Decisione finale
logger.startPhase('DECISIONE FINALE');

if (hasErrors) {
  logger.error('SVILUPPO BLOCCATO!');
  if (!SILENT_MODE) {
    console.log('🔧 CORREZIONE MANUALE OBBLIGATORIA:');
    console.log('   1. Apri editor con supporto ESLint/TypeScript');
    console.log('   2. Correggi TUTTI gli errori evidenziati');
    console.log('   3. Correggi TUTTI i warnings evidenziati');
    console.log('   4. Formatta codice manualmente');
    console.log('   5. Riesegui npm run pre-modifiche');
    console.log('\n💡 HELPER: npm run helper-manuali per guida dettagliata');
  }
  logger.endPhase(false, 'Correzioni necessarie prima di procedere');
  process.exit(1);
} else {
  logger.success('CODICE PERFETTAMENTE PULITO!');
  if (!SILENT_MODE) {
    console.log('✅ Zero errori TypeScript');
    console.log('✅ Zero errori ESLint');
    console.log('✅ Zero warnings ESLint');
    console.log('✅ Formatting perfetto');
    console.log('✅ Tutti i test passano');
    console.log('\n🚀 PRONTO PER SVILUPPO!');
    console.log('📝 Procedi con le modifiche, poi: npm run post-modifiche');
  }
  logger.endPhase(true, 'Pronto per sviluppo');
  process.exit(0);
}
