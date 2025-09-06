#!/usr/bin/env node

/**
 * WORKFLOW POST-MODIFICHE - VERIFICHE RIGOROSE
 * Verifica errori E warnings - ZERO TOLLERANZA
 * Versione ottimizzata con logging strutturato
 */

import { execSync } from 'child_process';
import { logger } from './utils/logger.js';

// Configurazione da variabili ambiente
const SILENT_MODE = process.env.WORKFLOW_SILENT === '1';
const VERBOSE_MODE = process.env.WORKFLOW_VERBOSE === '1';

if (!SILENT_MODE) {
  logger.info('🔍 WORKFLOW POST-MODIFICHE - ZERO TOLLERANZA ERRORI+WARNINGS');
}

let hasErrors = false;

// FASE 1: Test obbligatori
logger.startPhase('TEST OBBLIGATORI');

try {
  logger.verbose('Eseguendo test suite...');
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

// FASE 2: Verifica qualità rigorosa (errori E warnings)
logger.startPhase('VERIFICA QUALITÀ RIGOROSA', 'Zero tolleranza per errori e warnings');

// TypeScript
logger.verbose('Verificando TypeScript...');
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

logger.endPhase(!hasErrors);

// FASE 3: Decisione finale
logger.startPhase('DECISIONE FINALE');

if (hasErrors) {
  logger.error('COMMIT BLOCCATO!');
  if (!SILENT_MODE) {
    console.log('❌ Le modifiche hanno introdotto/lasciato problemi');
    console.log('🔧 CORREZIONE MANUALE OBBLIGATORIA:');
    console.log('   1. Apri editor con supporto ESLint/TypeScript');
    console.log('   2. Correggi TUTTI gli errori evidenziati');
    console.log('   3. Correggi TUTTI i warnings evidenziati');
    console.log('   4. Correggi test falliti');
    console.log('   5. Formatta codice manualmente');
    console.log('   6. Riesegui npm run post-modifiche');
    console.log('\n💡 HELPER: npm run helper-manuali per guida dettagliata');
    console.log('🚨 NON FARE COMMIT finché questo script non passa');
  }
  logger.endPhase(false, 'Correzioni necessarie prima del commit');
  process.exit(1);
} else {
  // Verifica finale con conta-problemi
  try {
    const stdio = VERBOSE_MODE ? 'inherit' : 'pipe';
    execSync('npm run conta-problemi', { stdio });

    logger.success('MODIFICHE COMPLETATE PERFETTAMENTE!');
    if (!SILENT_MODE) {
      console.log('✅ Zero errori TypeScript');
      console.log('✅ Zero errori ESLint');
      console.log('✅ Zero warnings ESLint');
      console.log('✅ Formatting perfetto');
      console.log('✅ Tutti i test passano');
      console.log('\n🚀 COMMIT AUTORIZZATO!');
      console.log('📝 Il codice è pronto per essere committato');
    }
    logger.endPhase(true, 'Pronto per commit');
    process.exit(0);
  } catch (error) {
    logger.warn('Ulteriori problemi rilevati da conta-problemi');
    if (!SILENT_MODE) {
      console.log('🔧 Correzione manuale necessaria');
      console.log('🚫 COMMIT ancora BLOCCATO');
    }
    logger.endPhase(false, 'Problemi aggiuntivi rilevati');
    process.exit(1);
  }
}
