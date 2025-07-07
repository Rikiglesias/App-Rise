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

## 🔄 **DATA FLOW**

### **📊 STATO APPLICAZIONE**
```
┌─────────────────────────┐
│      UI COMPONENTS      │
├─────────────────────────┤
│       STORES            │ ← MobX Reactive State
├─────────────────────────┤
│      SERVICES           │ ← API Calls
├─────────────────────────┤
│    EXTERNAL APIs        │
└─────────────────────────┘
```

### **🔧 STORE ARCHITECTURE**
```typescript
// stores/appStore.ts
export class AppStore {
  @observable isDarkMode = false;
  @observable isLoading = false;
  
  @action toggleDarkMode = () => {
    this.isDarkMode = !this.isDarkMode;
  };
  
  @action setLoading = (loading: boolean) => {
    this.isLoading = loading;
  };
}
```

### **🎯 HOOK INTEGRATION**
```typescript
// shared/hooks/useAppStore.ts
export const useAppStore = () => {
  const { appStore } = useStore();
  
  return {
    isDarkMode: appStore.isDarkMode,
    isLoading: appStore.isLoading,
    toggleDarkMode: appStore.toggleDarkMode,
    setLoading: appStore.setLoading
  };
};
```

---

## 🎨 **DESIGN SYSTEM**

### **📏 DESIGN TOKENS**
```typescript
// shared/constants/designTokens.ts
export const DesignTokens = {
  // Typography Scale
  fontSize: {
    hero: 75,
    title: 40,
    subtitle: 35,
    body: 20,
    normal: 16,
    caption: 14,
    small: 12
  },
  
  // Spacing Scale
  spacing: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    xxl: 24,
    xxxl: 32
  },
  
  // Color Palette
  colors: {
    primary: '#059669',
    secondary: '#DC2626',
    accent: '#F59E0B',
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
  },
  
  // Border Radius
  borderRadius: {
    none: 0,
    sm: 4,
    md: 8,
    lg: 12,
    xl: 16,
    full: 9999
  }
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

**🎯 RICORDA**: Architettura centralizzata = Manutenibilità + Performance! 🚀 