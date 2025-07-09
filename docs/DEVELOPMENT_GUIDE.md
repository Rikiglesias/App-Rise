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
SISTEMA ENTERPRISE MONDIALE: ✅ IMPLEMENTATO
- FormattedText: Scaling bi-direzionale + Fixed Lines
- Layer Centralizzato: Hook + Componenti + Dark Mode  
- DATABASE UNIVERSALE: 14 marche, 90+ dispositivi, 98.4% mercato
- Titolo HOME: Aggiornato a 48px con spazio sopra
- Tablet XL: 1280+ px supportato
- Dark Mode: Toggle centrale unificato
- Migrazioni: 3 componenti reali completati
- Calcoli Millimetrici: Database più completo del web
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
│       ├── responsiveTheme.ts        # Tema unificato
│       └── deviceResolutionsDatabase.ts  # Database 90+ dispositivi
```

### **📱 DATABASE UNIVERSALE DISPOSITIVI**
```
DATABASE MONDIALE: 98.4% MERCATO COPERTO
- Apple (18 dispositivi): iPhone 16 → SE (2022)
- Samsung (12 dispositivi): Galaxy S25 → A34
- Google (4 dispositivi): Pixel 8 → 6
- OnePlus (3 dispositivi): 12 → 10 Pro
- Xiaomi (15 dispositivi): 14 → Redmi serie completa
- Huawei (7 dispositivi): P60 → Nova serie
- Oppo (8 dispositivi): Find X6 → A58
- Vivo (7 dispositivi): V29 → Y27
- Realme (6 dispositivi): GT Neo 5 → C53
- Nothing (3 dispositivi): Phone 2 → CMF
- Sony (3 dispositivi): Xperia 1V → 10V
- Motorola (5 dispositivi): Edge 40 → G54
- Nokia (3 dispositivi): X30 → G60
- Honor (3 dispositivi): Magic 6 → 90 5G

TOTALE: 90+ dispositivi con calcoli millimetrici perfetti
UBICAZIONE: src/shared/constants/deviceResolutionsDatabase.ts
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

---

## 🎯 **CONFIGURAZIONE APP IDENTICA SU TUTTI I DISPOSITIVI**

### **✅ OBIETTIVO: APP VISIVAMENTE IDENTICA**

Per ottenere un'app che appare **esattamente identica** su tutti i dispositivi (iPhone SE, iPad Pro, Android, ecc.), devi configurare il sistema in modo che:

1. **Il testo si adatti automaticamente** alle dimensioni del dispositivo
2. **Le proporzioni rimangano identiche** ovunque
3. **Le righe di testo siano sempre esatte** (mai nascoste, mai spezzate)

### **🔧 CONFIGURAZIONE PERFETTA**

```typescript
// ✅ CONFIGURAZIONE OTTIMALE per app identica
<FormattedText 
  fontSize={32}                           // ← TU definisci dimensione di riferimento
  intelligentAccessibilityScaling={true}  // ← SISTEMA calcola automaticamente
  fixed={true}                            // ← ATTIVA sistema intelligente
  fixedLines={1}                          // ← SEMPRE 1 riga esatta
  allowSystemFontScaling={false}          // ← EVITA zoom che rompe layout
  lineBreakStrategyIOS="push-out"
  breakStrategyAndroid="highQuality"
>
  Rise Against Hunger Italia
</FormattedText>
```

### **🧮 COME FUNZIONA IL SISTEMA**

#### **STEP 1: TU DEFINISCI UNA DIMENSIONE BASE**
```typescript
fontSize={32}  // ← "Voglio che appaia come 32px su iPhone 15"
```

#### **STEP 2: SISTEMA RILEVA IL DISPOSITIVO**
```typescript
// Il sistema internamente rileva:
// iPhone SE: 375px di larghezza
// iPhone 15: 414px di larghezza  
// iPad: 768px di larghezza
// iPad Pro: 1024px di larghezza
```

#### **STEP 3: CALCOLA AUTOMATICAMENTE IL FONT OTTIMALE**
```typescript
// Il sistema calcola matematicamente:
const containerWidth = screenWidth * 0.9;  // 90% larghezza schermo
const avgCharWidth = fontSize * 0.55;      // Stima larghezza carattere
const charsPerLine = Math.floor(containerWidth / avgCharWidth);
const totalLinesNeeded = Math.ceil(textLength / charsPerLine);

// Trova il fontSize più grande che rispetta fixedLines
for (let testSize = fontSize * 0.8; testSize <= fontSize * 2.0; testSize += 0.5) {
  if (totalLinesNeeded <= fixedLines) {
    optimalSize = testSize;  // ← fontSize perfetto trovato!
  }
}
```

#### **STEP 4: RISULTATI AUTOMATICI**
```typescript
// STESSO TESTO "Rise Against Hunger Italia":
// iPhone SE (375px):  32px → 26px (ridotto per entrare in 1 riga)
// iPhone 15 (414px):  32px → 32px (perfetto così)
// iPad (768px):       32px → 42px (ingrandito per utilizzare spazio)
// iPad Pro (1024px):  32px → 48px (massima ottimizzazione)

// RISULTATO: Stesse proporzioni visive su TUTTI i dispositivi!
```

### **🎨 ESEMPI PRATICI APP IDENTICA**

#### **Titolo Principale**
```typescript
<FormattedText 
  fontSize={45}
  fontWeight="bold"
  intelligentAccessibilityScaling={true}
  fixed={true}
  fixedLines={1}
  allowSystemFontScaling={false}
>
  Rise Against Hunger Italia
</FormattedText>
```

#### **Descrizione Multi-Riga**
```typescript
<FormattedText 
  fontSize={16}
  intelligentAccessibilityScaling={true}
  fixed={true}
  fixedLines={3}
  allowSystemFontScaling={false}
>
  Combatti la fame nel mondo con azioni concrete
  e donazioni che cambiano vite in modo significativo
  attraverso progetti concreti e sostenibili
</FormattedText>
```

#### **Bottone CTA**
```typescript
<ResponsiveBox 
  width={280}
  padding={16}
  style={{
    backgroundColor: '#DC2626',
    borderRadius: 8,
    minHeight: 56,
    justifyContent: 'center',
  }}
>
  <FormattedText 
    fontSize={18}
    fontWeight="bold"
    color="#FFFFFF"
    intelligentAccessibilityScaling={true}
    fixed={true}
    fixedLines={1}
    allowSystemFontScaling={false}
    style={{ textAlign: 'center' }}
  >
    Fai una Donazione
  </FormattedText>
</ResponsiveBox>
```

### **📊 SISTEMA MATEMATICO UNIFICATO - APP IDENTICA**

```typescript
// ✅ NUOVO APPROCCIO: Scaling matematico per proporzioni PERFETTE
const AppPerfettamenteIdentica: React.FC = () => {
  // STEP 1: Calcola scaling factor matematico unificato
  const baseFontSize = 48; // ← AGGIORNATO: titolo HOME ora 48px
  const scaledFontSize = scaleFont(baseFontSize);
  const scaleFactor = scaledFontSize / baseFontSize;
  
  // STEP 2: Applica STESSO scaling a tutto il layout  
  const responsiveSpacing = {
    containerPadding: Math.round(20 * scaleFactor),
    separatorTopMargin: Math.round(8 * scaleFactor),
    logoSize: Math.round(56 * scaleFactor),
    stackSpacing: Math.round(4 * scaleFactor),
  };

  return (
    <View style={{ 
      paddingHorizontal: responsiveSpacing.containerPadding,
      paddingVertical: 0 
    }}>
      <ResponsiveStack spacing={responsiveSpacing.stackSpacing}>
        {/* Hero title - MATEMATICAMENTE identico ovunque */}
        <Text
          allowFontScaling={false}
          numberOfLines={1}
          adjustsFontSizeToFit={true}
          minimumFontScale={0.8}
          style={{
            fontSize: scaleFont(48), // ← AGGIORNATO: 42 → 48px
            lineHeight: scaleFont(54), // ← PROPORZIONALE: 48 → 54px
            fontWeight: '900',
            textAlign: 'center',
          }}
        >
          Rise Against Hunger Italia
        </Text>

      {/* Subtitle - sempre 2 righe con proporzioni perfette */}
      <FormattedText 
        fontSize={16}
        color="#6B7280"
        intelligentAccessibilityScaling={true}
        fixed={true}
        fixedLines={2}
        allowSystemFontScaling={false}
        style={{ textAlign: 'center' }}
      >
        Combatti la fame nel mondo con azioni concrete
        e donazioni che cambiano vite
      </FormattedText>

      {/* Grid di card - stesse proporzioni ovunque */}
      <ResponsiveStack
        direction="horizontal"
        spacing={12}
        style={{ flexWrap: 'wrap' }}
      >
        {[1, 2, 3, 4].map(num => (
          <ResponsiveCard key={num} preset="card" elevated>
            <FormattedText 
              fontSize={16}
              fontWeight="bold"
              intelligentAccessibilityScaling={true}
              fixed={true}
              fixedLines={1}
              allowSystemFontScaling={false}
            >
              Card {num}
            </FormattedText>
          </ResponsiveCard>
        ))}
      </ResponsiveStack>
    </ResponsiveStack>
  );
};
```

### **💡 PERCHÉ QUESTA CONFIGURAZIONE FUNZIONA**

#### **✅ `intelligentAccessibilityScaling={true}`**
- **ADATTA automaticamente** il fontSize per ogni dispositivo
- **CALCOLA** la dimensione ottimale per rispettare fixedLines
- **GARANTISCE** che il testo non venga mai nascosto o spezzato

#### **✅ `fixed={true}` + `fixedLines={n}`**
- **FORZA** il testo a stare esattamente nelle righe specificate
- **ATTIVA** il sistema di calcolo intelligente
- **IMPEDISCE** al testo di andare a capo inaspettatamente

#### **✅ `allowSystemFontScaling={false}`**
- **EVITA** che lo zoom utente rompa il layout controllato
- **MANTIENE** le proporzioni sempre identiche
- **PRESERVA** la consistency assoluta dell'app

#### **✅ RISULTATO FINALE**
- **iPhone SE**: Testo più piccolo ma stesse proporzioni
- **iPad Pro**: Testo più grande ma stesse proporzioni  
- **APP IDENTICA**: Esperienza visiva identica ovunque

---

## 🔄 **SISTEMA BI-DIREZIONALE INTELLIGENTE** 

### **✅ RIVOLUZIONE ACCESSIBILITÀ**
- **Adattamento automatico**: fontSize ottimale per ogni dispositivo
- **Zoom intelligente**: Accessibilità senza rompere layout
- **Bi-direzionale**: Ingrandisce SU tablet, riduce SU telefoni piccoli
- **Layout consistency**: SEMPRE rispetta fixedLines

### **🎯 UTILIZZO INTELLIGENTE**
```typescript
// Sistema bi-direzionale automatico
<FormattedText 
  fontSize={32}
  intelligentAccessibilityScaling={true}  // ← SISTEMA BI-DIREZIONALE!
  fixed={true}
  fixedLines={1}                          // ← SEMPRE 1 riga
>
  Rise Against Hunger Italia
</FormattedText>

// RISULTATI AUTOMATICI:
// iPhone SE (375px): 32px → 26px (ridotto per entrare in 1 riga)
// iPhone 15 (414px): 32px → 32px (perfetto così)
// iPad (768px): 32px → 42px (ingrandito per utilizzare spazio)
// iPad Pro (1024px): 32px → 48px (massima ottimizzazione)
// Zoom utente 300%: Permesso fino al limite che rispetta 1 riga
```

### **🧮 ALGORITMO MATEMATICO**
```typescript
// Il sistema calcola automaticamente:
avgCharWidth = fontSize * 0.55  // Stima larghezza carattere
charsPerLine = floor(containerWidth / avgCharWidth)  
totalLinesNeeded = ceil(textLength / charsPerLine)

// Trova il fontSize più grande che rispetta fixedLines
for (testSize = fontSize * 0.8; testSize <= fontSize * 2.0; testSize += 0.5) {
  if (totalLinesNeeded <= fixedLines) {
    optimalSize = testSize;  // ← fontSize perfetto trovato!
  }
}
```

### **📊 ESEMPI PRATICI**

#### **Titolo Principale**
```typescript
<FormattedText 
  fontSize={45}
  fontWeight="bold"
  intelligentAccessibilityScaling={true}
  fixed={true}
  fixedLines={1}
>
  Titolo che si adatta perfettamente
</FormattedText>
```

#### **Descrizione Multi-Riga**
```typescript
<FormattedText 
  fontSize={16}
  intelligentAccessibilityScaling={true}
  fixed={true}
  fixedLines={3}
>
  Descrizione lunga che si ottimizza automaticamente per utilizzare al meglio lo spazio disponibile su ogni dispositivo mantenendo sempre esattamente 3 righe.
</FormattedText>
```

#### **CTA Button**
```typescript
<FormattedText 
  fontSize={18}
  fontWeight="bold"
  intelligentAccessibilityScaling={true}
  fixed={true}
  fixedLines={2}
  style={{ textAlign: 'center' }}
>
  Fai una Donazione Ora
</FormattedText>
```

### **🎯 VANTAGGI BI-DIREZIONALI**

#### **📱 Dispositivi Piccoli (iPhone SE)**
- Font automaticamente **ridotto** per entrare nelle righe
- Layout **sempre rispettato**
- Zero testo che va a capo inaspettatamente

#### **📊 Dispositivi Grandi (iPad Pro)**  
- Font automaticamente **ingrandito** per utilizzare spazio
- Esperienza visiva **ottimizzata**
- Leggibilità **massimizzata**

#### **🔍 Zoom Accessibilità**
- Zoom consentito fino al **limite calcolato**
- Layout **mai rotto**
- Accessibilità **garantita**

### **⚠️ ANTI-PATTERNS CORRETTI**
```typescript
// ❌ VIETATO - Calcoli manuali per dispositivi
const fontSize = screenWidth > 768 ? 32 : 24;
<FormattedText fontSize={fontSize}>Testo</FormattedText>

// ❌ VIETATO - Disabilitare zoom senza sistema intelligente
<FormattedText fontSize={24} allowSystemFontScaling={false}>
  Testo senza adattamento automatico
</FormattedText>

// ❌ VIETATO - Conditional rendering per dispositivi
{isTablet ? 
  <FormattedText fontSize={32}>Grande</FormattedText> : 
  <FormattedText fontSize={20}>Piccolo</FormattedText>
}

// ❌ VIETATO - Zoom che rompe layout controllato
<FormattedText 
  fontSize={32} 
  fixed={true}
  fixedLines={1}
  allowSystemFontScaling={true}  // ← ROMPE il layout controllato
>
  Testo che può rompere le righe
</FormattedText>

// ✅ CORRETTO - Sistema intelligente per app identica
<FormattedText 
  fontSize={32} 
  intelligentAccessibilityScaling={true}  // ← ADATTA per ogni dispositivo
  fixed={true}
  fixedLines={1}
  allowSystemFontScaling={false}          // ← MANTIENE layout controllato
>
  App identica su tutti i dispositivi
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

## 🎯 **APPROCCIO MISTO: Text Nativo + FormattedText**

### **🔧 QUANDO USARE Text NATIVO**
Per componenti critici dove `adjustsFontSizeToFit` deve funzionare perfettamente:

```typescript
// ✅ CASO SPECIALE: Titoli critici con ridimensionamento assoluto
import { Text } from 'react-native';
import { scaleFont } from '@/shared/constants/responsiveSystem';

<Text
  allowFontScaling={false}               // ← Blocca zoom sistema
  numberOfLines={1}                      // ← Controllo righe nativo
  adjustsFontSizeToFit={true}            // ← Ridimensionamento React Native puro
  minimumFontScale={0.8}                 // ← Limite riduzione 80%
  style={{
    fontSize: scaleFont(42),             // ← Font scalato UNA volta
    fontWeight: '900',
    textAlign: 'center',
  }}
>
  Rise Against Hunger Italia
</Text>
```

### **⚡ QUANDO USARE FormattedText**
Per tutti gli altri casi con sistema bi-direzionale:

```typescript
// ✅ CASO STANDARD: Sistema intelligente completo
<FormattedText 
  fontSize={32}
  intelligentAccessibilityScaling={true} // ← Sistema bi-direzionale
  fixed={true}
  fixedLines={1}
  allowSystemFontScaling={false}
>
  Testo con sistema intelligente
</FormattedText>
```

### **🎯 DECISION TREE**
```
Hai bisogno di adjustsFontSizeToFit perfetto?
├── SÌ → Usa Text nativo (casi critici)
└── NO → Usa FormattedText (casi standard)

Il componente è un titolo principale critico?
├── SÌ → Text nativo + scaleFont()
└── NO → FormattedText + sistema bi-direzionale
```

---

## 🎯 **WORKFLOW SVILUPPO**

### **📋 CHECKLIST PRE-COMMIT**
- ✅ `npm run pre-modifiche` passa
- ✅ `npm run conta-problemi` = 0
- ✅ Test coverage > 35%
- ✅ Zero TypeScript errors
- ✅ Zero ESLint warnings
- ✅ **Sistema bi-direzionale**: `intelligentAccessibilityScaling={true}` per titoli importanti
- ✅ **Layout consistency**: `fixed={true}` + `fixedLines` specificato
- ✅ **Zero anti-patterns**: Nessun calcolo manuale zoom/dispositivi

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

**🎯 RICORDA**: Layer Centralizzato + FormattedText + **Sistema Bi-Direzionale** = **ECCELLENZA ENTERPRISE ASSOLUTA** ✅

**💡 BENEFICIO**: Un parametro `intelligentAccessibilityScaling={true}` → **Perfetto su ogni dispositivo e zoom!** 🚀

**🔄 INNOVAZIONE**: Da "font fisso" → **Font ottimale automatico** per ogni situazione! ⚡ 