#!/usr/bin/env node

/**
 * WORKFLOW POST-MODIFICHE - VERIFICHE RIGOROSE
 * Verifica errori E warnings - ZERO TOLLERANZA
 */

import { execSync } from 'child_process';

console.log('🔍 WORKFLOW POST-MODIFICHE - ZERO TOLLERANZA ERRORI+WARNINGS\n');

let hasErrors = false;

// FASE 1: Test obbligatori
console.log('🧪 FASE 1: TEST OBBLIGATORI');
console.log('===========================');

try {
  console.log('🎯 Eseguendo test suite...');
  execSync('npm test', { stdio: 'inherit' });
  console.log('✅ Test: TUTTI PASSANO');
} catch (error) {
  console.log('❌ Test: FALLIMENTI RILEVATI');
  hasErrors = true;
}

// FASE 2: Verifica qualità rigorosa (errori E warnings)
console.log('\n🔍 FASE 2: VERIFICA QUALITÀ RIGOROSA');
console.log('=====================================');

console.log('📋 Verificando TypeScript...');
try {
  execSync('npx tsc --noEmit --skipLibCheck', { stdio: 'inherit' });
  console.log('✅ TypeScript: PULITO');
} catch (error) {
  console.log('❌ TypeScript: ERRORI TROVATI');
  hasErrors = true;
}

console.log('\n📝 Verificando ESLint (errori + warnings)...');
try {
  // ZERO warnings tollerati
  execSync('npx eslint "src/**/*.{ts,tsx}" --max-warnings 0', {
    stdio: 'inherit',
  });
  console.log('✅ ESLint: PULITO');
} catch (error) {
  console.log('❌ ESLint: ERRORI/WARNINGS TROVATI');
  hasErrors = true;
}

console.log('\n🎨 Verificando formatting...');
try {
  execSync('npx prettier --check "src/**/*.{ts,tsx}"', { stdio: 'inherit' });
  console.log('✅ Prettier: PULITO');
} catch (error) {
  console.log('❌ Prettier: PROBLEMI FORMATTING');
  hasErrors = true;
}

// FASE 3: Decisione finale e commit
console.log('\n✅ FASE 3: DECISIONE FINALE');
console.log('=====================================');

if (hasErrors) {
  console.log('\n🚫 COMMIT BLOCCATO!');
  console.log('===================');
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

  process.exit(1);
} else {
  // Verifica finale con conta-problemi
  try {
    execSync('npm run conta-problemi', { stdio: 'inherit' });

    console.log('\n🎉 MODIFICHE COMPLETATE PERFETTAMENTE!');
    console.log('======================================');
    console.log('✅ Zero errori TypeScript');
    console.log('✅ Zero errori ESLint');
    console.log('✅ Zero warnings ESLint');
    console.log('✅ Formatting perfetto');
    console.log('✅ Tutti i test passano');
    console.log('\n🚀 COMMIT AUTORIZZATO!');
    console.log('📝 Il codice è pronto per essere committato');

    process.exit(0);
  } catch (error) {
    console.log('\n⚠️ Ulteriori problemi rilevati da conta-problemi');
    console.log('🔧 Correzione manuale necessaria');
    console.log('🚫 COMMIT ancora BLOCCATO');
    process.exit(1);
  }
}
