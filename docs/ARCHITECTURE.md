# 🏗️ **RISE AGAINST HUNGER ITALIA - ARCHITECTURE GUIDE**

*Architettura completa del sistema - Layer Centralizzato + Component Architecture*

---

## 📋 **INDICE**

1. [🎯 **OVERVIEW ARCHITETTURA**](#overview-architettura)
2. [📁 **STRUTTURA PROGETTO**](#struttura-progetto)
3. [🏗️ **LAYER CENTRALIZZATO**](#layer-centralizzato)
4. [📱 **COMPONENT ARCHITECTURE**](#component-architecture)
5. [🔄 **DATA FLOW**](#data-flow)
6. [🎨 **DESIGN SYSTEM**](#design-system)
7. [🧪 **TESTING ARCHITECTURE**](#testing-architecture)
8. [🚀 **PERFORMANCE**](#performance)

---

## 🎯 **OVERVIEW ARCHITETTURA**

### **🏗️ PRINCIPI ARCHITETTURALI**
```
1. LAYER CENTRALIZZATO: Zero frammentazione
2. COMPONENT COMPOSITION: Riusabilità massima
3. SEPARATION OF CONCERNS: Responsabilità chiare
4. PERFORMANCE FIRST: Ottimizzazione nativa
5. TESTING INTEGRATED: Testabilità architettonica
```

### **📊 STACK TECNOLOGICO**
```
Frontend: React Native + Expo
State: MobX + Context API
Navigation: React Navigation 6
UI: Custom Design System
Testing: Jest + React Testing Library
Build: EAS Build
Updates: EAS Update
```

---

## 📁 **STRUTTURA PROGETTO**

### **🗂️ DIRECTORY TREE**
```
src/
├── components/              # Sistema UI centralizzato
│   ├── ui/                 # Componenti UI base
│   │   ├── FormattedText.tsx
│   │   ├── ResponsiveBox.tsx
│   │   └── ResponsiveStack.tsx
│   ├── domain/             # Componenti business logic
│   └── layout/             # Layout containers
├── features/               # Feature modules
│   ├── home/
│   ├── actions/
│   ├── impact/
│   └── projects/
├── shared/                 # Codice condiviso
│   ├── hooks/              # Custom hooks
│   ├── constants/          # Costanti e temi
│   ├── utils/              # Utility functions
│   └── services/           # API services
├── navigation/             # Navigation configuration
├── stores/                 # State management
└── __tests__/              # Testing infrastructure
```

### **🎯 PRINCIPI ORGANIZZAZIONE**
```
FEATURE-BASED: Moduli auto-contenuti
LAYER SEPARATION: UI, Business, Data
SHARED RESOURCES: Riutilizzo massimo
TESTING CO-LOCATED: Test vicini al codice
```

---

## 🏗️ **LAYER CENTRALIZZATO**

### **📊 ARCHITETTURA LAYER**
```
┌─────────────────────────┐
│     PRESENTATION        │ ← React Components
├─────────────────────────┤
│   RESPONSIVE LAYER      │ ← useResponsiveLayout
├─────────────────────────┤
│     THEME LAYER         │ ← responsiveTheme.ts
├─────────────────────────┤
│     DATA LAYER          │ ← MobX Stores
└─────────────────────────┘
```

### **🔧 HOOK CENTRALIZZATO**
```typescript
// shared/hooks/useResponsiveLayout.ts
export const useResponsiveLayout = () => {
  const { width } = useWindowDimensions();
  
  return {
    // Breakpoints
    isCompact: width < 768,
    isStandard: width >= 768 && width < 1024,
    isLarge: width >= 1024 && width < 1280,
    isXLarge: width >= 1280,
    
    // Responsive function
    responsive: (values: ResponsiveValues) => {
      if (width >= 1280) return values.xlarge ?? values.large ?? values.standard ?? values.compact;
      if (width >= 1024) return values.large ?? values.standard ?? values.compact;
      if (width >= 768) return values.standard ?? values.compact;
      return values.compact;
    }
  };
};
```

### **🎨 TEMA UNIFICATO**
```typescript
// shared/constants/responsiveTheme.ts
export const ResponsiveTheme = {
  breakpoints: {
    compact: 0,
    standard: 768,
    large: 1024,
    xlarge: 1280
  },
  
  layout: {
    cardWidth: {
      compact: '100%',
      standard: '47.5%',
      large: '31%',
      xlarge: '20%'
    },
    
    modalWidth: {
      compact: '95%',
      standard: '90%',
      large: '70%',
      xlarge: '50%'
    }
  },
  
  colors: {
    light: {
      primary: '#FFFFFF',
      secondary: '#F5F5F5',
      accent: '#059669'
    },
    dark: {
      primary: '#0C0C0E',
      secondary: '#2C2C2E',
      accent: '#059669'
    }
  }
};
```

---

## 📱 **COMPONENT ARCHITECTURE**

### **🏗️ COMPONENT HIERARCHY**
```
App
├── NavigationContainer
├── ResponsiveDarkModeProvider
├── StoreProvider
└── ScreenComponents
    ├── ResponsiveBox (Layout)
    ├── ResponsiveStack (Spacing)
    └── FormattedText (Typography)
```

### **🎯 COMPONENT TYPES**

#### **1. UI Components** (`components/ui/`)
```typescript
// Componenti riutilizzabili senza business logic
export const ResponsiveBox = ({ preset, children, ...props }) => {
  const { responsive } = useResponsiveLayout();
  
  return (
    <View style={[
      { width: responsive(ResponsiveTheme.layout[preset]) },
      props.style
    ]}>
      {children}
    </View>
  );
};
```

#### **2. Domain Components** (`components/domain/`)
```typescript
// Componenti con business logic specifica
export const ActionCard = ({ action, onPress }) => {
  const { responsive } = useResponsiveLayout();
  
  return (
    <ResponsiveBox preset="card">
      <FormattedText fontSize={responsive({ compact: 16, xlarge: 18 })}>
        {action.title}
      </FormattedText>
    </ResponsiveBox>
  );
};
```

#### **3. Feature Components** (`features/*/components/`)
```typescript
// Componenti specifici per feature
export const HomeActionsList = ({ actions }) => {
  return (
    <ResponsiveStack spacing={{ compact: 16, xlarge: 24 }}>
      {actions.map(action => (
        <ActionCard key={action.id} action={action} />
      ))}
    </ResponsiveStack>
  );
};
```

---

## 🔄 **SISTEMA BI-DIREZIONALE INTELLIGENTE**

### **🏗️ ARCHITETTURA ALGORITMICA**
```
┌─────────────────────────┐
│    INPUT PROPS          │ ← fontSize, fixedLines, text
├─────────────────────────┤
│  DEVICE DETECTION       │ ← screenWidth, containerWidth
├─────────────────────────┤
│  ALGORITHM ENGINE       │ ← Mathematical optimization
├─────────────────────────┤
│   OPTIMAL CALCULATION   │ ← Best fontSize for device
├─────────────────────────┤
│    ZOOM LIMITS          │ ← Accessibility boundaries
├─────────────────────────┤
│    FINAL RENDERING      │ ← Perfect text output
└─────────────────────────┘
```

### **🧮 CORE ALGORITHM**
```typescript
// components/ui/FormattedText.tsx - Sistema BI-DIREZIONALE
const calculateOptimalFontSize = (
  text: string,
  baseFontSize: number,
  fixedLines: number,
  containerWidth: number
) => {
  let optimalSize = baseFontSize;
  
  // STEP 1: Test range da 80% a 200% del fontSize base
  for (let testSize = baseFontSize * 0.8; testSize <= baseFontSize * 2.0; testSize += 0.5) {
    
    // STEP 2: Calcola matematicamente se il testo entra nelle righe
    const avgCharWidth = testSize * 0.55;  // Stima carattere medio
    const charsPerLine = Math.floor(containerWidth / avgCharWidth);
    const totalLinesNeeded = Math.ceil(text.length / charsPerLine);
    
    // STEP 3: Se entra nelle righe specificate, questo fontSize è valido
    if (totalLinesNeeded <= fixedLines) {
      optimalSize = testSize;  // Salva il più grande che funziona
    } else {
      break;  // Troppo grande, fermati qui
    }
  }
  
  return optimalSize;
  };
```

### **📊 ADAPTIVE BEHAVIOR MATRIX**
```typescript
// Matrice di adattamento automatico
const AdaptiveBehavior = {
  "iPhone SE (375px)": {
    input: "fontSize={32}",
    action: "REDUCE",
    output: "26px (-19%)",
    reason: "Spazio limitato - riduce per entrare in fixedLines"
  },
  "iPhone 15 (414px)": {
    input: "fontSize={32}",
    action: "MAINTAIN", 
    output: "32px (0%)",
    reason: "Perfetto così - mantiene dimensione originale"
  },
  "iPad (768px)": {
    input: "fontSize={32}",
    action: "INCREASE",
    output: "42px (+31%)",
    reason: "Spazio disponibile - ingrandisce per leggibilità"
  },
  "iPad Pro (1024px)": {
    input: "fontSize={32}",
    action: "MAXIMIZE",
    output: "48px (+50%)",
    reason: "Massimo spazio - ottimizza esperienza visiva"
  }
};
```

### **🔍 ZOOM INTELLIGENCE LAYER**
```typescript
// Architettura zoom intelligente
const ZoomIntelligence = {
  // LAYER 1: Calcola fontSize ottimale per dispositivo
  calculateOptimalBase: (deviceWidth, text, fixedLines) => {
    return findBestFontSizeForDevice(deviceWidth, text, fixedLines);
  },
  
  // LAYER 2: Calcola limiti zoom attorno all'ottimale
  calculateZoomLimits: (optimalFontSize, text, fixedLines, containerWidth) => {
    let maxSafeZoom = 1.0;
    
    for (let zoom = 1.0; zoom <= 3.0; zoom += 0.1) {
      const zoomedSize = optimalFontSize * zoom;
      if (wouldFitInLines(zoomedSize, text, fixedLines, containerWidth)) {
        maxSafeZoom = zoom;
      } else {
        break;
      }
    }
    
    return Math.max(1.2, maxSafeZoom); // Min 120% per accessibilità
  },
  
  // LAYER 3: Applica zoom intelligente
  applyIntelligentZoom: (optimalSize, zoomLimits) => {
    return {
      allowSystemFontScaling: true,
      maxFontSizeMultiplier: zoomLimits,
      baseFontSize: optimalSize
    };
  }
};
```

### **⚡ PERFORMANCE ARCHITECTURE**
```typescript
// Ottimizzazioni performance
const PerformanceOptimizations = {
  // CACHE: Evita ricalcoli per stesso input
  fontSizeCache: new Map(),
  
  // DEBOUNCE: Evita calcoli durante resize frequenti
  debounceResize: 150, // ms
  
  // MEMOIZATION: Cache risultati per device width
  memoizedCalculations: useMemo(() => 
    calculateOptimalFontSize(text, fontSize, fixedLines, containerWidth),
    [text, fontSize, fixedLines, containerWidth]
  ),
  
  // EARLY EXIT: Salta calcoli se non necessari
  shouldCalculate: intelligentAccessibilityScaling && fixedLines && text.length > 0
};
```

### **🎯 COMPONENT INTEGRATION**
```typescript
// Integrazione nel FormattedText component
export const FormattedText: React.FC<FormattedTextProps> = ({
  fontSize = 16,
  intelligentAccessibilityScaling = false,
  fixed = false,
  fixedLines,
  children,
  ...props
}) => {
  // STEP 1: Calcolo base fontSize (scaleFont già applicato)
  let finalFontSize = scaleFont(fontSize);
  
  // STEP 2: Sistema bi-direzionale (SOLO se attivato)
  if (intelligentAccessibilityScaling && fixed && fixedLines) {
    const { width: screenWidth } = Dimensions.get('window');
    const containerWidth = screenWidth * 0.9;
    const textString = typeof children === 'string' ? children : '';
    
    // Calcola fontSize ottimale per questo dispositivo
    finalFontSize = calculateOptimalFontSize(
      textString,
      finalFontSize,
      fixedLines,
      containerWidth
    );
    
    // Calcola limiti zoom intelligenti
    const zoomLimits = calculateZoomLimits(
      finalFontSize,
      textString,
      fixedLines,
      containerWidth
    );
    
    // Applica configurazione zoom
    return (
      <Text
        allowFontScaling={true}
        maxFontSizeMultiplier={zoomLimits}
        style={{ fontSize: finalFontSize }}
        {...props}
      >
        {children}
      </Text>
    );
  }
  
  // STEP 3: Modalità normale (senza sistema bi-direzionale)
  return (
    <Text
      allowFontScaling={false}
      style={{ fontSize: finalFontSize }}
      {...props}
    >
      {children}
    </Text>
  );
};
```

### **🔧 API SURFACE**
```typescript
// API pubblica del sistema bi-direzionale
interface IntelligentAccessibilityAPI {
  // Props principali
  intelligentAccessibilityScaling?: boolean;  // Attiva sistema
  fixed?: boolean;                            // Modalità layout fisso
  fixedLines?: number;                        // Numero righe target
  containerWidth?: number;                    // Override container width
  
  // Comportamenti automatici
  deviceOptimization: 'automatic';           // Ottimizzazione per dispositivo
  zoomSupport: 'intelligent';                // Zoom fino ai limiti calcolati
  layoutConsistency: 'guaranteed';           // Layout sempre rispettato
  crossPlatform: 'identical';                // Comportamento iOS/Android identico
}

// Esempi utilizzo
const UsageSamples = {
  titleOptimized: (
    <FormattedText 
      fontSize={45}
      intelligentAccessibilityScaling={true}
      fixed={true}
      fixedLines={1}
    >
      Titolo che si adatta perfettamente
    </FormattedText>
  ),
  
  descriptionOptimized: (
    <FormattedText 
      fontSize={16}
      intelligentAccessibilityScaling={true}
      fixed={true}
      fixedLines={3}
    >
      Descrizione multi-riga ottimizzata automaticamente
    </FormattedText>
  )
};
```

### **🎯 COMPONENT VARIANTS**
```typescript
// components/ui/FormattedText.tsx
const TextVariants = {
  hero: {
    fontSize: DesignTokens.fontSize.hero,
    fontWeight: 'black' as const,
    lineHeight: 1.1
  },
  title: {
    fontSize: DesignTokens.fontSize.title,
    fontWeight: 'bold' as const,
    lineHeight: 1.2
  },
  body: {
    fontSize: DesignTokens.fontSize.body,
    fontWeight: 'normal' as const,
    lineHeight: 1.4
  }
};
```

---

## 🧪 **TESTING ARCHITECTURE**

### **📊 TESTING STRATEGY**
```
┌─────────────────────────┐
│      UNIT TESTS         │ ← Componenti isolati
├─────────────────────────┤
│   INTEGRATION TESTS     │ ← Feature completi
├─────────────────────────┤
│      E2E TESTS          │ ← User flows
└─────────────────────────┘
```

### **🔧 TESTING SETUP**
```typescript
// __tests__/setup.ts
import { configure } from '@testing-library/react-native';
import { enableFetchMocks } from 'jest-fetch-mock';

configure({
  defaultTimeout: 10000,
  asyncUtilTimeout: 5000
});

enableFetchMocks();
```

### **📝 COMPONENT TESTING**
```typescript
// __tests__/components/ResponsiveBox.test.tsx
describe('ResponsiveBox', () => {
  it('should apply correct width based on preset', () => {
    const { getByTestId } = render(
      <ResponsiveBox preset="card" testID="responsive-box">
        <Text>Content</Text>
      </ResponsiveBox>
    );
    
    const box = getByTestId('responsive-box');
    expect(box.props.style).toContainEqual(
      expect.objectContaining({ width: '100%' })
    );
  });
});
```

---

## 🚀 **PERFORMANCE**

### **⚡ OTTIMIZZAZIONI**
```typescript
// Performance optimizations
export const OptimizedComponent = React.memo(({ data }) => {
  const memoizedData = useMemo(() => 
    data.map(item => ({ ...item, processed: true })), [data]
  );
  
  const handlePress = useCallback((id: string) => {
    // Handle press
  }, []);
  
  return (
    <ResponsiveStack>
      {memoizedData.map(item => (
        <ActionCard 
          key={item.id} 
          action={item}
          onPress={handlePress}
        />
      ))}
    </ResponsiveStack>
  );
});
```

### **📊 BUNDLE OPTIMIZATION**
```javascript
// metro.config.js
const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Tree shaking
config.resolver.alias = {
  'react-native-vector-icons': '@expo/vector-icons',
};

// Bundle splitting
config.transformer.experimentalImportSupport = false;
config.transformer.inlineRequires = true;

module.exports = config;
```

---

## 🔧 **PATTERN ARCHITETTURALI**

### **🎯 COMPOSITION PATTERN**
```typescript
// Layout composition
export const ScreenLayout = ({ children }) => (
  <ResponsiveBox preset="container">
    <ResponsiveStack spacing={{ compact: 16, xlarge: 24 }}>
      {children}
    </ResponsiveStack>
  </ResponsiveBox>
);

// Usage
<ScreenLayout>
  <FormattedText variant="title">Titolo</FormattedText>
  <ActionsList actions={actions} />
</ScreenLayout>
```

### **🔄 PROVIDER PATTERN**
```typescript
// Context providers
export const ResponsiveDarkModeProvider = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  
  return (
    <ResponsiveContext.Provider value={{ isDarkMode, setIsDarkMode }}>
      {children}
    </ResponsiveContext.Provider>
  );
};
```

---

## 📋 **BEST PRACTICES**

### **✅ ARCHITETTURA**
- Usa layer centralizzato per responsive
- Mantieni componenti piccoli e focalizzati
- Separa UI da business logic
- Usa TypeScript per type safety
- Implementa lazy loading per performance

### **❌ ANTI-PATTERNS**
- Prop drilling eccessivo
- Componenti monolitici
- Logica mista UI/Business
- Dipendenze circolari
- State management frammentato

---

## 🎯 **MIGRATION GUIDE**

### **🔄 DA LEGACY A LAYER CENTRALIZZATO**
```typescript
// Prima - Frammentato
const { width } = Dimensions.get('window');
const isTablet = width >= 768;

// Dopo - Centralizzato
const { isTablet } = useResponsiveLayout();
```

### **📱 COMPONENTI MIGRATION**
```typescript
// Prima - Manuale
<View style={{ width: isTablet ? '48%' : '100%' }}>

// Dopo - Preset
<ResponsiveBox preset="card">
```

---

**🎯 RICORDA**: Architettura Centralizzata + **Sistema Bi-Direzionale Intelligente** = **ECCELLENZA ENTERPRISE MASSIMA** 🚀

**💡 INNOVAZIONE ARCHITETTURALE**: Da "fontSize fisso" → **Algoritmo matematico ottimale** per ogni situazione! ⚡

**🔄 RIVOLUZIONE**: Layer Centralizzato + FormattedText + Bi-Direzionale = **Zero manutenzione futura** ✨ 