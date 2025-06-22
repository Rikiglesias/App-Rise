# 🚨 PIANO CLEANUP CONSOLE STATEMENTS

## 📊 **SITUAZIONE ATTUALE - PROBLEMI IDENTIFICATI**

### **Console Statements Trovati:**

```text
src/systems/MicroInteractionEngine.ts: console.warn
src/shared/utils/result.ts: console.log, console.error
src/shared/hooks/usePerformanceMonitor.ts: console.warn
src/shared/hooks/useLinkHandler.ts: console.warn, console.error
src/shared/hooks/useAsyncOperation.ts: console.log, console.error
src/screens/SeguiciScreen.tsx: 4x console.warn
src/screens/ChiSiamo/index.tsx: 3x console.warn
src/components/layout/MapLocationModal.tsx: console.log
```

**PROBLEMA:** Console statements hardcoded che andranno in produzione!

## 🎯 **STRATEGIA DI CLEANUP**

### **1. Sistema di Logging Professionale**

**File da creare: `src/shared/utils/logger.ts`**

```typescript
interface LogLevel {
  ERROR: 0;
  WARN: 1;
  INFO: 2;
  DEBUG: 3;
}

class Logger {
  private static instance: Logger;
  private logLevel: number;
  private isProduction: boolean;

  private constructor() {
    this.isProduction = !__DEV__;
    this.logLevel = this.isProduction ? 0 : 3; // ERROR only in prod, DEBUG in dev
  }

  static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }

  private shouldLog(level: number): boolean {
    return level <= this.logLevel;
  }

  private formatMessage(
    level: string,
    tag: string,
    message: string,
    extra?: any
  ): string {
    const timestamp = new Date().toISOString();
    const prefix = `[${timestamp}][${level}][${tag}]`;
    return extra ? `${prefix} ${message}` : `${prefix} ${message}`;
  }

  error(tag: string, message: string, error?: Error): void {
    if (this.shouldLog(0)) {
      console.error(this.formatMessage('ERROR', tag, message), error || '');
    }
  }

  warn(tag: string, message: string, extra?: any): void {
    if (this.shouldLog(1)) {
      console.warn(this.formatMessage('WARN', tag, message), extra || '');
    }
  }

  info(tag: string, message: string, extra?: any): void {
    if (this.shouldLog(2)) {
      console.info(this.formatMessage('INFO', tag, message), extra || '');
    }
  }

  debug(tag: string, message: string, extra?: any): void {
    if (this.shouldLog(3)) {
      console.log(this.formatMessage('DEBUG', tag, message), extra || '');
    }
  }

  // Method per performance monitoring
  performance(tag: string, operation: string, startTime: number): void {
    if (this.shouldLog(2)) {
      const duration = Date.now() - startTime;
      this.info(tag, `${operation} completed in ${duration}ms`);
    }
  }
}

// Singleton export
export const logger = Logger.getInstance();

// Convenience exports per backward compatibility
export const logError = (tag: string, message: string, error?: Error) =>
  logger.error(tag, message, error);

export const logWarn = (tag: string, message: string, extra?: any) =>
  logger.warn(tag, message, extra);

export const logInfo = (tag: string, message: string, extra?: any) =>
  logger.info(tag, message, extra);

export const logDebug = (tag: string, message: string, extra?: any) =>
  logger.debug(tag, message, extra);
```

### **2. Correzioni Immediate Per File**

#### **File: `src/shared/utils/result.ts`**

**PRIMA:**

```typescript
console.log(`${prefix} Success:`, result.data);
console.error(`${prefix} Error:`, result.error);
```

**DOPO:**

```typescript
import { logDebug, logError } from './logger';

// Sostituire:
logDebug('ResultPattern', `${prefix} Success`, result.data);
logError('ResultPattern', `${prefix} Error`, result.error);
```

#### **File: `src/shared/hooks/useAsyncOperation.ts`**

**PRIMA:**

```typescript
console.log(`[AsyncOperation] Success in ${Date.now() - startTime}ms`, {...});
console.error(`[AsyncOperation] Failed in ${Date.now() - startTime}ms`, {...});
```

**DOPO:**

```typescript
import { logDebug, logError } from '../utils/logger';

// Sostituire:
logDebug('AsyncOperation', `Success in ${Date.now() - startTime}ms`, {
  data: result.data,
  args,
  retryAttempts,
});
logError('AsyncOperation', `Failed in ${Date.now() - startTime}ms`, {
  error: result.error,
  args,
  retryAttempts,
});
```

#### **File: `src/shared/hooks/useLinkHandler.ts`**

**PRIMA:**

```typescript
console.warn('[LinkHandler] Haptic feedback failed:', hapticResult.error);
console.error(`[LinkHandler] Failed to open URL: ${url}`, {...});
```

**DOPO:**

```typescript
import { logWarn, logError } from '../utils/logger';

// Sostituire:
logWarn('LinkHandler', 'Haptic feedback failed', hapticResult.error);
logError('LinkHandler', `Failed to open URL: ${url}`, {
  error: linkResult.error,
  loadingKey,
  retryAttempts,
});
```

#### **File: `src/screens/SeguiciScreen.tsx`**

**PRIMA:**

```typescript
console.warn('[SeguiciScreen] Failed to open website:', result.error);
console.warn('[SeguiciScreen] Failed to open Instagram:', result.error);
console.warn('[SeguiciScreen] Failed to open Facebook:', result.error);
console.warn('[SeguiciScreen] Failed to open LinkedIn:', result.error);
```

**DOPO:**

```typescript
import { logWarn } from '../shared/utils/logger';

// Sostituire tutti con:
logWarn('SeguiciScreen', 'Failed to open website', result.error);
logWarn('SeguiciScreen', 'Failed to open Instagram', result.error);
logWarn('SeguiciScreen', 'Failed to open Facebook', result.error);
logWarn('SeguiciScreen', 'Failed to open LinkedIn', result.error);
```

#### **File: `src/screens/ChiSiamo/index.tsx`**

**PRIMA:**

```typescript
console.warn('[ChiSiamoScreen] Failed to open maps:', result.error);
console.warn('[ChiSiamoScreen] Failed to open dialer:', result.error);
console.warn('[ChiSiamoScreen] Failed to open email:', result.error);
```

**DOPO:**

```typescript
import { logWarn } from '../../shared/utils/logger';

// Sostituire:
logWarn('ChiSiamoScreen', 'Failed to open maps', result.error);
logWarn('ChiSiamoScreen', 'Failed to open dialer', result.error);
logWarn('ChiSiamoScreen', 'Failed to open email', result.error);
```

#### **File: `src/components/layout/MapLocationModal.tsx`**

**PRIMA:**

```typescript
console.log('CTA pressed for:', data?.title);
```

**DOPO:**

```typescript
import { logDebug } from '../../shared/utils/logger';

// Sostituire:
logDebug('MapLocationModal', 'CTA pressed', { title: data?.title });
```

### **3. ESLint Rules Per Prevenire Console Statements**

**Aggiornamento `.eslintrc.js`:**

```javascript
rules: {
  // Console statements - Bloccante in produzione
  'no-console': process.env.NODE_ENV === 'production' ? 'error' : 'warn',

  // Debug statements
  'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'warn',

  // Alert statements
  'no-alert': process.env.NODE_ENV === 'production' ? 'error' : 'warn',

  // Floating promises
  '@typescript-eslint/no-floating-promises': 'error',
}
```

### **4. Script di Cleanup Automatico**

**File: `scripts/cleanup-console.js`**

```javascript
const fs = require('fs');
const path = require('path');
const glob = require('glob');

const replaceConsoleStatements = () => {
  const files = glob.sync('src/**/*.{ts,tsx}');

  files.forEach(file => {
    const content = fs.readFileSync(file, 'utf8');

    // Replace console.log
    let newContent = content.replace(
      /console\.log\(/g,
      "logDebug('Component', "
    );

    // Replace console.warn
    newContent = newContent.replace(
      /console\.warn\(/g,
      "logWarn('Component', "
    );

    // Replace console.error
    newContent = newContent.replace(
      /console\.error\(/g,
      "logError('Component', "
    );

    // Add import if logger methods used
    if (
      newContent !== content &&
      !newContent.includes("from '../shared/utils/logger'")
    ) {
      const importLine =
        "import { logDebug, logWarn, logError } from '../shared/utils/logger';\n";
      newContent = importLine + newContent;
    }

    if (newContent !== content) {
      fs.writeFileSync(file, newContent);
      console.log(`✅ Updated: ${file}`);
    }
  });
};

replaceConsoleStatements();
```

### **5. Jest Mock Per Logger**

**Aggiornamento `jest.setup.js`:**

```javascript
// Mock logger per i test
jest.mock('./src/shared/utils/logger', () => ({
  logger: {
    error: jest.fn(),
    warn: jest.fn(),
    info: jest.fn(),
    debug: jest.fn(),
    performance: jest.fn(),
  },
  logError: jest.fn(),
  logWarn: jest.fn(),
  logInfo: jest.fn(),
  logDebug: jest.fn(),
}));
```

## 🚀 **IMPLEMENTAZIONE STEP-BY-STEP**

### **STEP 1 - Setup Logger (15 minuti)**

1. ✅ Creare `src/shared/utils/logger.ts`
2. ✅ Aggiornare ESLint rules
3. ✅ Testare logger in dev/prod

### **STEP 2 - Cleanup Manuale (30 minuti)**

1. ✅ Aggiornare `result.ts`
2. ✅ Aggiornare `useAsyncOperation.ts`
3. ✅ Aggiornare `useLinkHandler.ts`
4. ✅ Aggiornare tutti gli screen

### **STEP 3 - Automazione (15 minuti)**

1. ✅ Eseguire script cleanup
2. ✅ Verificare build production
3. ✅ Testare funzionalità logging

### **STEP 4 - Prevenzione (10 minuti)**

1. ✅ Aggiornare jest.setup.js
2. ✅ Testare workflow completo
3. ✅ Documentare best practices

## 🎯 **RISULTATO FINALE**

```typescript
// PRIMA (❌ In produzione anche):
console.log('User clicked button');
console.warn('Connection failed');
console.error('Critical error:', error);

// DOPO (✅ Solo in development):
logDebug('ButtonComponent', 'User clicked button');
logWarn('NetworkService', 'Connection failed', { attempt: 3 });
logError('CriticalService', 'Critical error', error);
```

**✅ Zero console statements in produzione**
**✅ Logging professionale configurabile**  
**✅ Performance monitoring integrato**
**✅ Prevenzione automatica con ESLint**

---

## 🎯 TEMPO TOTALE: 1 ora per cleanup completo
