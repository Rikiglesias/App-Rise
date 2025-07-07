# 🚀 **RISE AGAINST HUNGER ITALIA - DEVELOPMENT GUIDE**

*Guida completa per sviluppatori - Sistema Responsive Centralizzato + FormattedText*

---

## 📋 **INDICE**

1. [🎯 **OVERVIEW SISTEMA**](#overview-sistema)
2. [⚡ **QUICK START**](#quick-start)
3. [🏗️ **LAYER CENTRALIZZATO**](#layer-centralizzato)
4. [📱 **FORMATTEDTEXT SISTEMA**](#formattedtext-sistema)
5. [🌙 **DARK MODE**](#dark-mode)
6. [📏 **BREAKPOINTS & RESPONSIVE**](#breakpoints-responsive)
7. [🎨 **DESIGN SYSTEM**](#design-system)
8. [🧪 **TESTING**](#testing)
9. [🔧 **TROUBLESHOOTING**](#troubleshooting)

---

## 🎯 **OVERVIEW SISTEMA**

### **✅ STATO ATTUALE**
```
SISTEMA ENTERPRISE: ✅ IMPLEMENTATO
- FormattedText: Scaling bi-direzionale + Fixed Lines
- Layer Centralizzato: Hook + Componenti + Dark Mode  
- Tablet XL: 1280+ px supportato
- Dark Mode: Toggle centrale unificato
- Migrazioni: 3 componenti reali completati
```

### **🏗️ ARCHITETTURA**
```
src/
├── components/ui/           # Sistema UI centralizzato
│   ├── FormattedText.tsx   # Testo responsive universale
│   ├── ResponsiveBox.tsx   # Container responsive
│   └── ResponsiveStack.tsx # Layout stack responsive
├── shared/
│   ├── hooks/              # Hook centralizzati
│   │   ├── useResponsiveLayout.ts
│   │   └── useResponsiveDarkMode.ts
│   └── constants/
│       └── responsiveTheme.ts  # Tema unificato
```

---

## ⚡ **QUICK START**

### **🚀 SETUP AMBIENTE**
```bash
# Installazione
npm install

# Controllo qualità ZERO TOLLERANZA
npm run pre-modifiche     # DEVE passare
npm run conta-problemi    # DEVE = 0

# Sviluppo
npm start
```

### **📝 TEMPLATE COMPONENTE**
```typescript
import { useResponsiveLayout } from '@/shared/hooks/useResponsiveLayout';
import { ResponsiveBox, ResponsiveStack, FormattedText } from '@/components/ui';

const MyComponent = () => {
  const { responsive, isTablet } = useResponsiveLayout();
  
  return (
    <ResponsiveBox preset="container" autoBackgroundColor="primary">
      <ResponsiveStack spacing={responsive({ compact: 16, xlarge: 24 })}>
        <FormattedText fontSize={40} fontWeight="bold">
          Titolo Responsivo
        </FormattedText>
        <FormattedText fontSize={16}>
          Testo normale che si adatta automaticamente
        </FormattedText>
      </ResponsiveStack>
    </ResponsiveBox>
  );
};
```

---

## 🏗️ **LAYER CENTRALIZZATO**

### **✅ BENEFICI**
- **ZERO frammentazione**: Eliminati 25+ `screenWidth >= 768` duplicati
- **Una riga nel tema**: Tablet XL supportato ovunque
- **Preset unificati**: 100% → 47.5% → 31% → 20% automatico
- **Dark mode**: Toggle centrale per tutti i componenti

### **🎯 HOOK PRINCIPALE**
```typescript
// Hook centralizzato
const { responsive, isTablet, isTabletXL } = useResponsiveLayout();

// Responsive values
const spacing = responsive({ 
  compact: 16,    // < 768px
  standard: 20,   // 768-1024px
  large: 24,      // 1024-1280px
  xlarge: 28      // >= 1280px
});
```

### **📦 COMPONENTI CORE**

#### **ResponsiveBox**
```typescript
<ResponsiveBox 
  preset="card"                    // 100% → 47.5% → 31% → 20%
  autoBackgroundColor="primary"    // Auto dark mode
  padding={responsive({ compact: 16, xlarge: 24 })}
>
  Content
</ResponsiveBox>
```

#### **ResponsiveStack**
```typescript
<ResponsiveStack 
  direction="horizontal"           // Auto wrap su mobile
  spacing={responsive({ compact: 12, xlarge: 20 })}
  style={{ flexWrap: 'wrap' }}
>
  {items.map(item => <Item key={item.id} />)}
</ResponsiveStack>
```

### **🎨 PRESET DISPONIBILI**
```typescript
const ResponsivePresets = {
  card: {
    compact: '100%',    // Mobile: full width
    standard: '47.5%',  // Tablet: 2 colonne
    large: '31%',       // Desktop: 3 colonne
    xlarge: '20%'       // XL: 4 colonne
  },
  modal: {
    compact: '95%',
    standard: '90%',
    large: '70%',
    xlarge: '50%'
  },
  container: {
    compact: '95%',
    standard: '90%',
    large: '85%',
    xlarge: '70%'
  }
};
```

---

## 📱 **FORMATTEDTEXT SISTEMA**

### **✅ CARATTERISTICHE**
- **Scaling bi-direzionale**: Automatico per tutte le dimensioni
- **Fixed Lines**: Controllo layout intelligente
- **Cross-platform**: Stesso risultato iOS/Android
- **Zero doppio scaling**: Integrato nel sistema

### **🎯 UTILIZZO BASE**
```typescript
// Testo normale
<FormattedText fontSize={24}>
  Testo che si adatta automaticamente
</FormattedText>

// Testo con linee fisse
<FormattedText 
  fontSize={24} 
  fixed={true} 
  fixedLines={2}
>
  Testo che si ridimensiona per stare in 2 righe
</FormattedText>
```

### **🔧 CONFIGURAZIONE AVANZATA**
```typescript
<FormattedText
  fontSize={40}
  fontWeight="bold"
  lineBreakStrategyIOS="push-out"
  breakStrategyAndroid="highQuality"
  hyphenationFrequencyAndroid="full"
  fixed={true}
  fixedLines={2}
  enableFallbackFontChain={true}
>
  Testo professionale cross-platform
</FormattedText>
```

### **📏 SCALA DIMENSIONI**
```typescript
const TextSizes = {
  hero: 75,     // "Rise Against Hunger Italia"
  title: 40,    // "Fai la Differenza"
  subtitle: 35, // "Entra in Azione"
  body: 20,     // Testo importante
  normal: 16,   // Testo normale
  caption: 14,  // Didascalie
  small: 12     // Testo piccolo
};
```

---

## 🌙 **DARK MODE**

### **✅ SISTEMA UNIFICATO**
```typescript
import { useResponsiveDarkMode } from '@/shared/hooks';

const MyComponent = () => {
  const { toggleDarkMode, isDark, textColor } = useResponsiveDarkMode();
  
  return (
    <ResponsiveBox autoBackgroundColor="primary">
      <FormattedText style={{ color: textColor.primary }}>
        Testo che cambia automaticamente
      </FormattedText>
      
      <TouchableOpacity onPress={toggleDarkMode}>
        <FormattedText>🌗 Toggle Dark Mode</FormattedText>
      </TouchableOpacity>
    </ResponsiveBox>
  );
};
```

### **🎨 COLORI AUTOMATICI**
```typescript
const AutoColors = {
  primary: {
    light: '#FFFFFF',
    dark: '#0C0C0E'
  },
  card: {
    light: '#FFFFFF',
    dark: '#2C2C2E'
  },
  text: {
    primary: {
      light: '#1E1E1E',
      dark: '#F5F5F5'
    },
    secondary: {
      light: '#666666',
      dark: '#CCCCCC'
    }
  }
};
```

---

## 📏 **BREAKPOINTS & RESPONSIVE**

### **📱 BREAKPOINTS STANDARD**
```typescript
export const ResponsiveBreakpoints = {
  compact: 0,      // Mobile: 0-767px
  standard: 768,   // Tablet: 768-1023px
  large: 1024,     // Desktop: 1024-1279px
  xlarge: 1280,    // XL: 1280px+
  tabletXL: 1280   // Tablet XL: 1280px+
};
```

### **🎯 UTILIZZO RESPONSIVE**
```typescript
// Valori responsive
const spacing = responsive({
  compact: 16,
  standard: 20,
  large: 24,
  xlarge: 28
});

// Condizioni
if (isTablet) {
  // Logica tablet
}

if (isTabletXL) {
  // Logica tablet XL (1280px+)
}
```

---

## 🎨 **DESIGN SYSTEM**

### **🎨 COLORI PRINCIPALI**
```typescript
export const DesignColors = {
  primary: '#059669',      // Verde principale
  secondary: '#DC2626',    // Rosso azione
  accent: '#F59E0B',       // Giallo accento
  
  // Grayscale
  gray: {
    50: '#F9FAFB',
    100: '#F3F4F6',
    200: '#E5E7EB',
    300: '#D1D5DB',
    400: '#9CA3AF',
    500: '#6B7280',
    600: '#4B5563',
    700: '#374151',
    800: '#1F2937',
    900: '#111827'
  }
};
```

### **📐 SPACING SCALE**
```typescript
export const SpacingScale = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32
};
```

---

## 🧪 **TESTING**

### **🎯 SETUP TESTING**
```bash
# Esegui tutti i test
npm test

# Test con coverage
npm run test:coverage

# Test specifici
npm test -- --testNamePattern="ResponsiveBox"
```

### **📝 TEMPLATE TEST**
```typescript
import { render } from '@testing-library/react-native';
import { ResponsiveDarkModeProvider } from '@/shared/providers';

describe('MyComponent', () => {
  it('should render with responsive layout', () => {
    const { getByText } = render(
      <ResponsiveDarkModeProvider>
        <MyComponent />
      </ResponsiveDarkModeProvider>
    );
    
    expect(getByText('Titolo')).toBeTruthy();
  });
  
  it('should support dark mode toggle', () => {
    const { getByText } = render(
      <ResponsiveDarkModeProvider>
        <MyComponent />
      </ResponsiveDarkModeProvider>
    );
    
    expect(getByText('🌗 Toggle Dark Mode')).toBeTruthy();
  });
});
```

---

## 🔧 **TROUBLESHOOTING**

### **🚨 ERRORI COMUNI**

#### **TypeScript Errors**
```bash
# Controllo errori
npm run pre-modifiche

# Fix comune: imports
import { ResponsiveBox } from '@/components/ui';
// invece di
import ResponsiveBox from '@/components/ui/ResponsiveBox';
```

#### **ESLint Warnings**
```bash
# Fix automatico
npx eslint --fix src/

# Controllo manuale
npm run conta-problemi
```

#### **Doppio Scaling**
```typescript
// ❌ VIETATO
<FormattedText fontSize={scaleFont(24)}>

// ✅ CORRETTO
<FormattedText fontSize={24}>
```

### **🔍 DEBUG RESPONSIVE**
```typescript
const { responsive, currentBreakpoint } = useResponsiveLayout();

console.log('Current breakpoint:', currentBreakpoint);
console.log('Spacing value:', responsive({ compact: 16, xlarge: 24 }));
```

---

## 🚫 **ANTI-PATTERNS VIETATI**

### **❌ FRAMMENTAZIONE**
```typescript
// ❌ VIETATO - Frammentazione
const { width: screenWidth } = Dimensions.get('window');
const isTablet = screenWidth >= 768;

// ✅ CORRETTO - Centralizzato
const { isTablet } = useResponsiveLayout();
```

### **❌ PERCENTUALI HARD-CODED**
```typescript
// ❌ VIETATO - Inconsistente
<View style={{ width: '48%' }}>

// ✅ CORRETTO - Preset
<ResponsiveBox preset="card">
```

### **❌ DARK MODE MANUALE**
```typescript
// ❌ VIETATO - Frammentato
const backgroundColor = isDark ? '#1C1C1E' : '#FFFFFF';

// ✅ CORRETTO - Automatico
<ResponsiveBox autoBackgroundColor="primary">
```

---

## 🎯 **WORKFLOW SVILUPPO**

### **📋 CHECKLIST PRE-COMMIT**
- ✅ `npm run pre-modifiche` passa
- ✅ `npm run conta-problemi` = 0
- ✅ Test coverage > 35%
- ✅ Zero TypeScript errors
- ✅ Zero ESLint warnings

### **🚀 DEPLOYMENT**
```bash
# Controllo completo
npm run post-modifiche

# Build
npm run build

# Deploy
npm run deploy
```

---

## 📚 **RISORSE AGGIUNTIVE**

### **🔗 DOCUMENTAZIONE**
- [README.md](../README.md) - Overview progetto
- [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) - Guida deploy
- [ARCHITECTURE.md](./ARCHITECTURE.md) - Architettura completa

### **💡 ESEMPI**
- [examples/](../src/examples/) - Esempi pratici
- [__tests__/](../src/__tests__/) - Test di esempio

---

**🎯 RICORDA**: Layer Centralizzato + FormattedText = **ECCELLENZA ENTERPRISE** ✅

**💡 BENEFICIO**: Una riga nel tema → Funziona ovunque! 🚀 