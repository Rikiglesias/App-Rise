# 🧪 PIANO MIGLIORAMENTO TEST COVERAGE

## 🚨 **SITUAZIONE CRITICA ATTUALE**

```text
📊 COVERAGE REPORT:
- Statement Coverage: 4.95% (CRITICO)
- Branch Coverage: 1.81% (CRITICO)
- Function Coverage: 4.65% (CRITICO)
- Test Suites: 7/100+ (INSUFFICIENTE)
```

## 🎯 **OBIETTIVI TARGET**

### **FASE 1 - Emergenza (2 settimane)**

- Statement Coverage: 35%+
- Branch Coverage: 25%+
- Function Coverage: 40%+
- Test Suites: 25+

### **FASE 2 - Consolidamento (1 mese)**

- Statement Coverage: 70%+
- Branch Coverage: 60%+
- Function Coverage: 75%+
- Test Suites: 50+

### **FASE 3 - Eccellenza (2 mesi)**

- Statement Coverage: 85%+
- Branch Coverage: 80%+
- Function Coverage: 90%+
- Test Suites: 80+

## 📋 **PRIORITÀ IMMEDIATE**

### **🔥 CRITICO - Componenti Core (Settimana 1)**

```typescript
// TEST DA CREARE SUBITO:
src / __tests__ / shared / utils / result.test.ts; // Result Pattern - Sistema critico
src / __tests__ / shared / hooks / useAsyncOperation.test.ts; // Async operations
src / __tests__ / shared / hooks / useLinkHandler.test.ts; // Link handling
src / __tests__ / stores / impactStore.test.ts; // Impact store
src / __tests__ / stores / appStore.test.ts; // App store
src / __tests__ / navigation / BottomTabNavigator.test.tsx; // Navigation core
src / __tests__ / components / ui / EnhancedTouchable.test.tsx; // UI fundamental
```

### **⚡ ALTO - Screens Principali (Settimana 2)**

```typescript
src / __tests__ / screens / HomeTabScreen.test.tsx; // Home screen
src / __tests__ / screens / ImpactTabScreen.test.tsx; // Impact screen
src / __tests__ / screens / SeguiciScreen.test.tsx; // Social screen
src / __tests__ / screens / ChiSiamo / index.test.tsx; // Chi Siamo screen
src / __tests__ / components / domain / ModernHomeImpact.test.tsx;
src / __tests__ / components / domain / ActionCardEnhanced.test.tsx;
```

### **📊 MEDIO - Componenti UI (Settimana 3-4)**

```typescript
src / __tests__ / components / ui / AnimatedNumber.test.tsx;
src / __tests__ / components / ui / GlassmorphismCard.test.tsx;
src / __tests__ / components / ui / LoadingSkeleton.test.tsx;
src / __tests__ / components / ui / ProgressRing.test.tsx;
src / __tests__ / components / layout / InteractiveMap.test.tsx;
src / __tests__ / components / layout / MapLocationModal.test.tsx;
```

## 🛠️ **TEMPLATE TEST STANDARDIZZATI**

### **Template Hook Test**

```typescript
// src/__tests__/shared/hooks/useExample.test.ts
import { renderHook, act } from '@testing-library/react-native';
import { useExample } from '../../shared/hooks/useExample';

describe('useExample', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should initialize with default values', () => {
    const { result } = renderHook(() => useExample());

    expect(result.current.data).toBe(null);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBe(null);
  });

  it('should handle success case', async () => {
    const { result } = renderHook(() => useExample());

    await act(async () => {
      await result.current.execute();
    });

    expect(result.current.data).toBeDefined();
    expect(result.current.error).toBe(null);
  });

  it('should handle error case', async () => {
    // Mock error scenario
    const { result } = renderHook(() => useExample());

    await act(async () => {
      // Trigger error
    });

    expect(result.current.error).toBeDefined();
  });
});
```

### **Template Component Test**

```typescript
// src/__tests__/components/ui/ExampleComponent.test.tsx
import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { ExampleComponent } from '../../components/ui/ExampleComponent';

describe('ExampleComponent', () => {
  const defaultProps = {
    title: 'Test Title',
    onPress: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders correctly with default props', () => {
    const { getByText } = render(<ExampleComponent {...defaultProps} />);

    expect(getByText('Test Title')).toBeDefined();
  });

  it('calls onPress when pressed', () => {
    const { getByTestId } = render(<ExampleComponent {...defaultProps} />);

    fireEvent.press(getByTestId('example-component'));

    expect(defaultProps.onPress).toHaveBeenCalledTimes(1);
  });

  it('handles disabled state', () => {
    const { getByTestId } = render(
      <ExampleComponent {...defaultProps} disabled={true} />
    );

    fireEvent.press(getByTestId('example-component'));

    expect(defaultProps.onPress).not.toHaveBeenCalled();
  });
});
```

### **Template Store Test**

```typescript
// src/__tests__/stores/exampleStore.test.ts
import { exampleStore } from '../../stores/exampleStore';

describe('exampleStore', () => {
  beforeEach(() => {
    exampleStore.getState().reset();
  });

  it('should initialize with default state', () => {
    const state = exampleStore.getState();

    expect(state.data).toEqual([]);
    expect(state.isLoading).toBe(false);
    expect(state.error).toBe(null);
  });

  it('should handle loading state', () => {
    exampleStore.getState().setLoading(true);

    expect(exampleStore.getState().isLoading).toBe(true);
  });

  it('should handle data updates', () => {
    const testData = [{ id: 1, name: 'Test' }];

    exampleStore.getState().setData(testData);

    expect(exampleStore.getState().data).toEqual(testData);
  });
});
```

## 📊 **SETUP TESTING AVANZATO**

### **Jest Configuration Enhancement**

```javascript
// jest.config.js enhancement
module.exports = {
  preset: 'jest-expo',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/*.test.{ts,tsx}',
    '!src/**/*.spec.{ts,tsx}',
    '!src/types/**/*',
  ],
  coverageThreshold: {
    global: {
      statements: 35,
      branches: 25,
      functions: 40,
      lines: 35,
    },
    './src/shared/utils/': {
      statements: 80,
      branches: 70,
      functions: 80,
      lines: 80,
    },
    './src/shared/hooks/': {
      statements: 70,
      branches: 60,
      functions: 75,
      lines: 70,
    },
  },
};
```

### **Mock Setup Enhancement**

```javascript
// jest.setup.js enhancement
import 'react-native-gesture-handler/jestSetup';

// Mock più completi
jest.mock('expo-haptics', () => ({
  impactAsync: jest.fn().mockResolvedValue(undefined),
  notificationAsync: jest.fn().mockResolvedValue(undefined),
  selectionAsync: jest.fn().mockResolvedValue(undefined),
  ImpactFeedbackStyle: {
    Light: 'LIGHT',
    Medium: 'MEDIUM',
    Heavy: 'HEAVY',
  },
}));

jest.mock('expo-linear-gradient', () => ({
  LinearGradient: 'LinearGradient',
}));

jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({
    navigate: jest.fn(),
    goBack: jest.fn(),
  }),
  useFocusEffect: jest.fn(),
}));

// Global test utilities
global.testUtils = {
  createMockNavigation: () => ({
    navigate: jest.fn(),
    goBack: jest.fn(),
    reset: jest.fn(),
  }),
};
```

## 🎯 **SCRIPT AUTOMATIZZATI**

### **Coverage Scripts nel package.json**

```json
{
  "scripts": {
    "test:coverage:watch": "jest --coverage --watchAll",
    "test:coverage:threshold": "jest --coverage --passWithNoTests",
    "test:coverage:ci": "jest --coverage --ci --forceExit --detectOpenHandles",
    "test:unit": "jest --testPathPattern=__tests__",
    "test:hooks": "jest --testPathPattern=hooks",
    "test:components": "jest --testPathPattern=components",
    "test:stores": "jest --testPathPattern=stores"
  }
}
```

## 📈 **MONITORAGGIO PROGRESSI**

### **Checklist Settimanale**

```bash
# Settimana 1 Target
npm run test:coverage
# Target: Statements > 15%

# Settimana 2 Target
npm run test:coverage
# Target: Statements > 25%

# Settimana 3 Target
npm run test:coverage
# Target: Statements > 35%
```

### **Report Automatici**

```bash
# Genera report dettagliato
npm run test:coverage -- --coverage-reporters=text-lcov | npx lcov-viewer

# CI/CD Integration
npm run test:coverage:ci
```

## 🚀 **IMPLEMENTAZIONE IMMEDIATA**

### **OGGI - Setup Base**

1. Creare template test files
2. Configurare coverage thresholds
3. Setup mocks avanzati

### **QUESTA SETTIMANA - Test Critici**

1. result.ts test completo
2. useAsyncOperation test
3. Store principali test
4. Navigation test

### **PROSSIME 2 SETTIMANE - Coverage 35%**

1. Screen principali
2. Componenti UI core
3. Hook personalizzati
4. Sistema gestione errori

---

## 🎯 OBIETTIVO: Da 4.95% a 35% in 2 settimane, poi 85% in 2 mesi
