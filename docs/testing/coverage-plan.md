# 📊 PIANO COVERAGE TEST - 40% → 55%

> ⚠️ **Snapshot storico (nov 2025) — superato.** I moduli/hook target citati (useResponsive, useFoldableLayout, stores Zustand, ecc.) non esistono più dopo il deep-clean di `src/`. Conservato come riferimento storico.

**Obiettivo**: Aumentare coverage da 40% a 55% in 3 settimane
**Data Inizio**: 29 Ottobre 2025
**Target Completamento**: 19 Novembre 2025

---

## 🎯 PRIORITÀ FILES (Coverage 0%)

### **SETTIMANA 1: CORE BUSINESS LOGIC (Target: 45%)**

#### 🔴 CRITICO - Stores (3 file) - **8 ore**

Questi sono già testati MA manca coverage di edge cases:

```typescript
// File: stores/*.ts
✅ appStore.ts - Coverage: 100% (già completo)
✅ impactStore.ts - Coverage: 100% (già completo)
✅ projectsStore.ts - Coverage: 100% (già completo)
✅ selectors.ts - Coverage: 88% (migliorabile)

// Action: Integrare test per selectors edge cases
```

**Task**:
- [ ] Test `selectors.ts` linee 51-57, 106-108, 135 (memoization edge cases)
- [ ] Verificare concurrency in stores (race conditions)
- [ ] Test reset/clear state

---

#### 🟠 ALTO - Navigation (5 file) - **12 ore**

```typescript
// File: navigation/*.tsx - Coverage: 0%
❌ AppNavigator.tsx (4 righe)
❌ BottomTabNavigator.tsx (246 righe) 🚨 PRIORITÀ MAX
❌ ImpactStackNavigator.tsx (4 righe)
❌ LazyLoading/LazyComponents.tsx (177 righe) 
❌ LazyLoading/LazyScreen.tsx (114 righe)
```

**Task**:
- [ ] **BottomTabNavigator.tsx** - Test routing, tab switching, deep links
- [ ] **LazyComponents.tsx** - Test lazy loading, error boundaries, fallback
- [ ] **LazyScreen.tsx** - Test loading states, navigation params
- [ ] **AppNavigator.tsx** - Test initial route, auth flow
- [ ] **ImpactStackNavigator.tsx** - Test stack navigation

**Test Template**:
```typescript
// navigation/__tests__/BottomTabNavigator.test.tsx
describe('BottomTabNavigator', () => {
  it('should render all tabs', () => {});
  it('should navigate between tabs', () => {});
  it('should display badge on notifications', () => {});
  it('should handle deep links', () => {});
  it('should respect navigation guards', () => {});
});
```

---

### **SETTIMANA 2: BUSINESS LOGIC HOOKS (Target: 50%)**

#### 🟡 MEDIO - Hooks Non Testati (8 file) - **16 ore**

```typescript
// File: shared/hooks/*.ts - Coverage: 18.85%
❌ useFoldableLayout.ts (302 righe) 🚨 PRIORITÀ MAX
❌ useLinkHandler.ts (233 righe)
❌ useNavigation.ts (36 righe)
❌ useOTAUpdateScreen.ts (93 righe)
❌ useOTAUpdates.ts (123 righe)
❌ usePerformanceMonitor.ts (150 righe)
❌ usePerformanceTracking.ts (149 righe)
❌ useResponsive.ts (308 righe) 🚨 PRIORITÀ MAX
```

**Priorità Test**:

1. **useResponsive.ts** (8h)
   - Sistema responsive core
   - Test breakpoints
   - Test orientamento
   - Test foldable devices

2. **useFoldableLayout.ts** (4h)
   - Test layout foldable
   - Test fold/unfold transitions

3. **useLinkHandler.ts** (2h)
   - Test URL validation
   - Test external vs internal links
   - Test security (XSS prevention)

4. **Resto OTA/Performance** (2h)
   - Test base per coverage minimo

---

### **SETTIMANA 3: SCREENS & COMPONENTS (Target: 55%)**

#### 🟢 BASSO - Screens UI (4 file) - **8 ore**

```typescript
// File: screens/*.tsx & features/*/screens/*.tsx
❌ MapModalScreen.tsx (79 righe)
❌ features/about/screens/ChiSiamoScreen.tsx (54 righe)
❌ features/home/screens/HomeScreen.tsx (252 righe) 🚨 PRIORITÀ
❌ features/projects/screens/ProjectsScreen.tsx (101 righe)
❌ features/social/screens/SeguiciScreen.tsx (34 righe)
```

**Task**:
- [ ] **HomeScreen.tsx** - Test rendering, scroll animations, CTA clicks
- [ ] **ProjectsScreen.tsx** - Test tab switching, data loading
- [ ] **MapModalScreen.tsx** - Test map interactions, markers
- [ ] Resto screens - Test base snapshot

---

#### 🟢 BASSO - Components Domain (6 file) - **8 ore**

```typescript
// File: components/domain/* - Coverage varia
❌ ActionButtons.tsx (31 righe) - 0%
❌ HomeHeader/index.tsx (130 righe) - 0%
❌ HomeHeader/ResponsiveHomeHeader.tsx (97 righe) - 0%
❌ Impact/ImpactCard.tsx (141 righe) - 0%
❌ Navigation/BottomTabs.tsx (256 righe) - 0% 🚨 CRITICO
```

**Task**:
- [ ] **BottomTabs.tsx** - Test rendering, state, animations
- [ ] **ImpactCard.tsx** - Test data display, interactions
- [ ] **HomeHeader** - Test responsive behavior, animations
- [ ] **ActionButtons.tsx** - Test CTA behaviors

---

## 📈 METRICHE PROGRESSIVE

```typescript
const CoverageTarget = {
  baseline: {
    statements: 40.18,
    branches: 25.85,
    lines: 40.51,
    functions: 37.5
  },
  
  week1: {
    statements: 45,
    branches: 30,
    lines: 45,
    functions: 42
  },
  
  week2: {
    statements: 50,
    branches: 35,
    lines: 50,
    functions: 47
  },
  
  week3Target: {
    statements: 55,
    branches: 40,
    lines: 55,
    functions: 50
  }
};
```

---

## 🛠️ COMANDI UTILI

```bash
# Run test con coverage
npm run test:coverage

# Run test specifici
npm test -- src/__tests__/navigation/BottomTabNavigator.test.tsx

# Watch mode per sviluppo
npm run test:watch

# Coverage HTML report
npm run test:coverage
# Apri: coverage/lcov-report/index.html

# Verifica coverage di file specifico
npm test -- --coverage --collectCoverageFrom=src/navigation/BottomTabNavigator.tsx
```

---

## ✅ CHECKLIST COMPLETAMENTO

### Settimana 1
- [ ] Test selectors.ts edge cases
- [ ] Test BottomTabNavigator.tsx completo
- [ ] Test LazyComponents.tsx + LazyScreen.tsx
- [ ] Test AppNavigator.tsx base
- [ ] **Verifica**: Coverage ≥ 45%

### Settimana 2
- [ ] Test useResponsive.ts completo
- [ ] Test useFoldableLayout.ts completo
- [ ] Test useLinkHandler.ts security
- [ ] Test base OTA hooks
- [ ] **Verifica**: Coverage ≥ 50%

### Settimana 3
- [ ] Test HomeScreen.tsx rendering
- [ ] Test ProjectsScreen.tsx interactions
- [ ] Test BottomTabs.tsx component
- [ ] Test ImpactCard.tsx display
- [ ] **Verifica**: Coverage ≥ 55%

---

## 🎯 METRICHE SUCCESSO

```typescript
const Success = {
  totalFiles: 26,
  estimatedHours: 52,
  coverageIncrease: '+15%',
  
  quality: {
    typeScriptErrors: 0,
    eslintWarnings: 0,
    allTestsPassing: true
  },
  
  benefits: [
    'Refactoring sicuri',
    'Bug prevention',
    'Documentazione vivente',
    'CI/CD confidence'
  ]
};
```

---

## 📝 NOTE

- **Priorità**: Business logic > Navigation > UI Components
- **Approccio**: Test comportamenti, non implementazione
- **Coverage**: Focus su linee eseguite, non 100% artificiale
- **Qualità**: Zero errori ESLint/TypeScript obbligatori

---

*Piano generato: 29 Ottobre 2025*
*Target completamento: 19 Novembre 2025*
*Responsabile: Development Team*
