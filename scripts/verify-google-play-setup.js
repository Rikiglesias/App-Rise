#!/usr/bin/env node

/**
 * Script per verificare setup Google Play Console
 * Controlla tutti i prerequisiti prima del primo deploy
 */

const fs = require('fs');
const path = require('path');

// Colori per output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
  bold: '\x1b[1m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function success(message) {
  log(`✅ ${message}`, 'green');
}

function error(message) {
  log(`❌ ${message}`, 'red');
}

function warning(message) {
  log(`⚠️  ${message}`, 'yellow');
}

function info(message) {
  log(`ℹ️  ${message}`, 'cyan');
}

function header(message) {
  log(`\n${'='.repeat(60)}`, 'bold');
  log(`  ${message}`, 'bold');
  log(`${'='.repeat(60)}\n`, 'bold');
}

// Verifica esistenza file
function checkFileExists(filePath, description) {
  const fullPath = path.resolve(process.cwd(), filePath);
  if (fs.existsSync(fullPath)) {
    success(`${description} trovato: ${filePath}`);
    return true;
  } else {
    error(`${description} NON trovato: ${filePath}`);
    return false;
  }
}

// Verifica configurazione EAS
function checkEASConfig() {
  header('VERIFICA EAS CONFIGURATION');

  let allGood = true;

  // Leggi eas.json
  const easJsonPath = path.resolve(process.cwd(), 'eas.json');
  if (!checkFileExists('eas.json', 'EAS configuration')) {
    return false;
  }

  try {
    const easConfig = JSON.parse(fs.readFileSync(easJsonPath, 'utf8'));

    // Verifica build profile production-store
    if (
      easConfig.build &&
      easConfig.build['production-store'] &&
      easConfig.build['production-store'].android
    ) {
      const androidConfig = easConfig.build['production-store'].android;
      if (androidConfig.buildType === 'app-bundle') {
        success('Build profile "production-store" configurato con AAB');
      } else {
        warning(
          `Build type è "${androidConfig.buildType}", raccomandato "app-bundle"`,
        );
      }
    } else {
      error('Build profile "production-store" non trovato in eas.json');
      allGood = false;
    }

    // Verifica submit configuration
    if (
      easConfig.submit &&
      easConfig.submit['production-store'] &&
      easConfig.submit['production-store'].android
    ) {
      const submitConfig = easConfig.submit['production-store'].android;
      if (submitConfig.serviceAccountKeyPath) {
        success(
          `Service account path configurato: ${submitConfig.serviceAccountKeyPath}`,
        );
      } else {
        error('serviceAccountKeyPath non configurato in submit.production-store');
        allGood = false;
      }

      if (submitConfig.track) {
        info(`Track configurato: ${submitConfig.track}`);
      } else {
        warning('Track non specificato (default: internal)');
      }
    } else {
      error('Submit configuration "production-store" non trovata');
      allGood = false;
    }

    return allGood;
  } catch (err) {
    error(`Errore lettura eas.json: ${err.message}`);
    return false;
  }
}

// Verifica app.config.js
function checkAppConfig() {
  header('VERIFICA APP CONFIGURATION');

  const appConfigPath = path.resolve(process.cwd(), 'app.config.js');
  if (!checkFileExists('app.config.js', 'App configuration')) {
    return false;
  }

  let allGood = true;

  try {
    // Import app.config.js (supporta sia CommonJS che ES6 modules)
    const appConfigModule = require(appConfigPath);
    const appConfig = appConfigModule.default || appConfigModule;
    const androidConfig = appConfig.expo?.android;

    if (!androidConfig) {
      error('Configurazione Android non trovata in app.config.js');
      return false;
    }

    // Verifica package name
    const packageName = androidConfig.package || process.env.ANDROID_PACKAGE;
    if (packageName) {
      success(`Package name: ${packageName}`);
      if (packageName !== 'org.riseagainsthunger.italia') {
        warning(
          `Package name non corrisponde a "org.riseagainsthunger.italia"`,
        );
      }
    } else {
      error('Package name non configurato');
      allGood = false;
    }

    // Verifica versionCode
    const versionCode = androidConfig.versionCode || process.env.ANDROID_VERSION_CODE;
    if (versionCode) {
      success(`Version code: ${versionCode}`);
    } else {
      warning('Version code non configurato (verrà usato default)');
    }

    // Verifica SDK versions
    if (androidConfig.compileSdkVersion) {
      success(`Compile SDK version: ${androidConfig.compileSdkVersion}`);
    }
    if (androidConfig.targetSdkVersion) {
      success(`Target SDK version: ${androidConfig.targetSdkVersion}`);
    }
    if (androidConfig.minSdkVersion) {
      success(`Min SDK version: ${androidConfig.minSdkVersion}`);
    }

    // Verifica permissions
    if (androidConfig.permissions && androidConfig.permissions.length > 0) {
      success(`Permessi configurati: ${androidConfig.permissions.join(', ')}`);
    } else {
      warning('Nessun permesso specificato');
    }

    return allGood;
  } catch (err) {
    error(`Errore lettura app.config.js: ${err.message}`);
    return false;
  }
}

// Verifica service account
function checkServiceAccount() {
  header('VERIFICA SERVICE ACCOUNT');

  const serviceAccountPath = path.resolve(
    process.cwd(),
    'google-service-account.json',
  );

  if (!checkFileExists('google-service-account.json', 'Service account JSON')) {
    error('Service account file non trovato!');
    info('');
    info('Per crearlo:');
    info('1. Vai su Google Cloud Console');
    info('2. Crea service account per Google Play');
    info('3. Scarica JSON key');
    info('4. Salvalo come "./google-service-account.json"');
    info('');
    info('Guida completa: docs/guides/google-play-setup.md');
    return false;
  }

  try {
    const serviceAccount = JSON.parse(
      fs.readFileSync(serviceAccountPath, 'utf8'),
    );

    // Verifica struttura JSON
    const requiredFields = [
      'type',
      'project_id',
      'private_key_id',
      'private_key',
      'client_email',
      'client_id',
    ];

    let allFieldsPresent = true;
    requiredFields.forEach((field) => {
      if (serviceAccount[field]) {
        success(`Campo "${field}" presente`);
      } else {
        error(`Campo "${field}" mancante`);
        allFieldsPresent = false;
      }
    });

    if (allFieldsPresent) {
      success('Service account JSON valido');
      info(`Project ID: ${serviceAccount.project_id}`);
      info(`Client email: ${serviceAccount.client_email}`);
    } else {
      error('Service account JSON non valido');
      return false;
    }

    return true;
  } catch (err) {
    error(`Errore lettura service account JSON: ${err.message}`);
    return false;
  }
}

// Verifica .gitignore
function checkGitignore() {
  header('VERIFICA SICUREZZA');

  const gitignorePath = path.resolve(process.cwd(), '.gitignore');
  if (!checkFileExists('.gitignore', '.gitignore')) {
    warning('.gitignore non trovato');
    return false;
  }

  try {
    const gitignoreContent = fs.readFileSync(gitignorePath, 'utf8');

    // Verifica che service account sia in .gitignore
    if (gitignoreContent.includes('google-service-account.json')) {
      success('google-service-account.json è in .gitignore');
    } else {
      error('google-service-account.json NON è in .gitignore');
      warning('⚠️  RISCHIO SICUREZZA: Aggiungi al .gitignore!');
      return false;
    }

    // Verifica altre credenziali
    const criticalFiles = [
      '*.keystore',
      '*.key',
      '.env',
      'google-services.json',
    ];
    criticalFiles.forEach((pattern) => {
      if (gitignoreContent.includes(pattern)) {
        success(`${pattern} è in .gitignore`);
      } else {
        warning(`${pattern} non trovato in .gitignore (potrebbe essere OK)`);
      }
    });

    return true;
  } catch (err) {
    error(`Errore lettura .gitignore: ${err.message}`);
    return false;
  }
}

// Verifica assets
function checkAssets() {
  header('VERIFICA ASSETS');

  const assetsToCheck = [
    {
      path: 'assets/icons/app/app-icon.png',
      description: 'App icon',
      size: { min: 512, max: 1024 },
    },
    {
      path: 'assets/icons/app/splash-screen.png',
      description: 'Splash screen',
    },
  ];

  let allGood = true;

  assetsToCheck.forEach((asset) => {
    if (checkFileExists(asset.path, asset.description)) {
      if (asset.size) {
        // Potremmo verificare dimensioni con sharp o jimp, ma per ora OK
        info(`  Verifica manualmente che sia ${asset.size.min}x${asset.size.min} o superiore`);
      }
    } else {
      allGood = false;
    }
  });

  return allGood;
}

// Summary finale
function printSummary(checks) {
  header('RIEPILOGO VERIFICA');

  const totalChecks = Object.keys(checks).length;
  const passedChecks = Object.values(checks).filter((v) => v === true).length;

  console.log('');
  Object.entries(checks).forEach(([name, passed]) => {
    if (passed) {
      success(`${name}: PASS`);
    } else {
      error(`${name}: FAIL`);
    }
  });

  console.log('');
  log(
    `Risultato: ${passedChecks}/${totalChecks} verifiche superate`,
    passedChecks === totalChecks ? 'green' : 'yellow',
  );

  if (passedChecks === totalChecks) {
    console.log('');
    success('🎉 SETUP COMPLETO! Sei pronto per il deploy!');
    console.log('');
    info('Prossimi passi:');
    info('1. eas build --platform android --profile production-store');
    info('2. eas submit --platform android --latest');
    info('');
    info('Oppure usa lo script automatico:');
    info('npm run deploy:android');
  } else {
    console.log('');
    error('⚠️  SETUP INCOMPLETO! Correggi gli errori sopra.');
    console.log('');
    info('Guida completa: docs/guides/google-play-setup.md');
  }

  console.log('');
}

// Main
function main() {
  log('\n🚀 VERIFICA SETUP GOOGLE PLAY CONSOLE\n', 'bold');
  log('Rise Against Hunger Italia - Android App\n', 'cyan');

  const checks = {
    'EAS Configuration': checkEASConfig(),
    'App Configuration': checkAppConfig(),
    'Service Account': checkServiceAccount(),
    Sicurezza: checkGitignore(),
    Assets: checkAssets(),
  };

  printSummary(checks);

  // Exit code
  const allPassed = Object.values(checks).every((v) => v === true);
  process.exit(allPassed ? 0 : 1);
}

// Run
main();
