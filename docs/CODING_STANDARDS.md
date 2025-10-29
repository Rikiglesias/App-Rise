# 📐 CODING STANDARDS - Rise Against Hunger Italia

## 🎯 PRINCIPIO GUIDA

> **Ogni linea di codice deve essere giustificabile, sensata, e migliorare il progetto.**

**ZERO TOLLERANZA per**:
- ❌ Codice inutilizzato
- ❌ Duplicazioni evitabili
- ❌ Inconsistenze
- ❌ Complessità inutile
- ❌ Dipendenze non necessarie

---

## 🏗️ ARCHITETTURA

### **1. Feature-Based Organization**

**REGOLA**: Ogni feature è auto-contenuta e indipendente.

```
src/features/[feature-name]/
├── components/     ✅ Componenti UI specifici
├── screens/        ✅ Schermate
├── hooks/          ✅ Logic riutilizzabile
├── styles/         ✅ Stili (se necessari)
├── types/          ✅ TypeScript types
├── utils/          ✅ Utility functions (se necessarie)
└── index.ts        ✅ Barrel export
```

**VIETATO**:
- ❌ Import tra features (usa shared/)
- ❌ Logica business in screens (usa hooks/)
- ❌ Stili inline ripetuti (usa styles/ o Perfect System)

---

### **2. Shared Code Organization**

```
src/shared/
├── components/     ✅ Componenti riutilizzabili
├── constants/      ✅ Design tokens, config
├── hooks/          ✅ Hook condivisi
├── utils/          ✅ Utility functions
├── services/       ✅ API, storage, etc.
└── types/          ✅ Types condivisi
```

**REGOLA**: Se usato in 2+ features → shared/  
**REGOLA**: Se usato in 1 sola feature → rimane nella feature

---

## 📦 IMPORT RULES

### **Regola 1: Path Aliases Consistenti**

```typescript
// ✅ CORRETTO
import { PerfectText } from '@/components/ui';
import { useHapticFeedback } from '@/shared/hooks/useHapticFeedback';
import { Colors } from '@/shared/constants';

// ✅ CORRETTO (stesso feature)
import { contactStyles } from '../styles/contactStyles';
import type { ContactProps } from '../types';

// ❌ VIETATO
import { PerfectText } from '../../../components/ui/PerfectText';
import { Colors } from '../../../shared/constants/designTokens';
```

**REGOLA ASSOLUTA**:
- `@/` per: `components/`, `shared/`, `navigation/`, `data/`
- `../` SOLO per stesso feature
- MAI `../../..`

---

### **Regola 2: Import Consolidati**

```typescript
// ❌ VIETATO
import { PerfectText } from '@/components/ui/PerfectText';
import { PerfectContainer } from '@/components/ui/PerfectContainer';
import { PerfectButton } from '@/components/ui/PerfectButton';

// ✅ CORRETTO
import { PerfectText, PerfectContainer, PerfectButton } from '@/components/ui';
```

---

### **Regola 3: Ordine Import**

```typescript
// 1. React & React Native
import React from 'react';
import { View } from 'react-native';

// 2. External libraries
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { LinearGradient } from 'expo-linear-gradient';

// 3. Alias paths (@/)
import { PerfectText, PerfectContainer } from '@/components/ui';
import { useHapticFeedback } from '@/shared/hooks/useHapticFeedback';

// 4. Relative imports (stesso feature)
import { contactStyles } from '../styles/contactStyles';
import type { ContactProps } from '../types';
```

---

## 🎨 PERFECT SYSTEM RULES

### **Regola 1: SEMPRE Perfect Components**

```typescript
// ❌ VIETATO
import { View, Text } from 'react-native';
<View style={{ padding: 20 }}>
  <Text>Hello</Text>
</View>

// ✅ OBBLIGATORIO
import { PerfectContainer, PerfectText } from '@/components/ui';
<PerfectContainer padding={20}>
  <PerfectText size={16} lines={1}>Hello</PerfectText>
</PerfectContainer>
```

**ECCEZIONI**:
- ✅ `Animated.View` per animazioni
- ✅ `SafeAreaView` (wrapping esterno)
- ✅ `ScrollView` nativo se necessario (preferire PlatformScrollView)

---

### **Regola 2: Spacing SEMPRE Props Diretti**

```typescript
// ❌ VIETATO
<PerfectContainer style={{ padding: 20, margin: 16 }}>

// ✅ OBBLIGATORIO
<PerfectContainer padding={20} margin={16}>
```

**MOTIVAZIONE**: Props diretti scalano automaticamente, style object NO.

---

### **Regola 3: NO Dimensioni Fisse**

```typescript
// ❌ VIETATO
style={{ width: 300, height: 200, borderRadius: 12 }}

// ✅ OBBLIGATORIO
width={300} height={200} borderRadius={12}
```

---

## 🔧 COMPONENT RULES

### **Regola 1: Props Minimali**

**OGNI prop DEVE essere usato nel component body.**

```typescript
// ❌ VIETATO
export const Component: React.FC<Props> = ({
  animations: _animations,  // Mai usato!
  data,
  onPress,
}) => { ... }

// ✅ CORRETTO
export const Component: React.FC<Props> = ({
  data,
  onPress,
}) => { ... }
```

---

### **Regola 2: Hook Minimali**

**OGNI hook DEVE produrre variabili usate.**

```typescript
// ❌ VIETATO
const { scale, dimensions, spacing } = useResponsive();
// Usa solo 'scale'

// ✅ CORRETTO
const { scale } = useResponsive();
// O MEGLIO: usa scaleDimensionLinear() diretto
```

---

### **Regola 3: Nesting Massimo 4 Livelli**

```typescript
// ❌ VIETATO (6 livelli)
<Container>
  <Container>
    <Container>
      <Container>
        <Container>
          <Container>
            <Text>Deep</Text>

// ✅ MASSIMO 4
<Container>
  <Header />
  <Content>
    <Card>
      <Text>Readable</Text>
```

**SOLUZIONE**: Estrai componenti

---

### **Regola 4: Componenti < 200 Linee**

**File > 200 linee?** → Splitta in sub-components

```typescript
// ❌ VIETATO - ContactSection.tsx (450 linee)

// ✅ CORRETTO
ContactSection.tsx (80 linee)
  ├── ContactHeader.tsx (40 linee)
  ├── ContactGrid.tsx (50 linee)
  └── ContactCard.tsx (60 linee)
```

---

## 📝 TYPESCRIPT RULES

### **Regola 1: NO Any Types**

```typescript
// ❌ VIETATO
const data: any = fetchData();

// ✅ CORRETTO
interface DataResponse {
  id: string;
  name: string;
}
const data: DataResponse = fetchData();
```

**ZERO TOLLERANZA** per `any`

---

### **Regola 2: Readonly Props**

```typescript
// ❌ EVITARE
interface Props {
  data: Data[];
  onPress: () => void;
}

// ✅ PREFERITO
interface Props {
  readonly data: readonly Data[];
  readonly onPress: () => void;
}
```

---

### **Regola 3: Explicit Return Types**

```typescript
// ❌ EVITARE
const getData = () => {
  return fetchData();
}

// ✅ PREFERITO
const getData = (): Promise<Data[]> => {
  return fetchData();
}
```

---

## 🎭 NAMING CONVENTIONS

### **Regola 1: Nomi Descrittivi**

```typescript
// ❌ VIETATO
const d = new Date();
const handleClick = () => {...};
const comp = <Component />;

// ✅ CORRETTO
const currentDate = new Date();
const handleContactPress = () => {...};
const contactCard = <ContactCard />;
```

---

### **Regola 2: Naming Patterns**

```typescript
// Components
PascalCase: ContactSection, PerfectButton

// Functions/variables
camelCase: handlePress, userData

// Constants
UPPER_SNAKE_CASE: API_URL, MAX_RETRIES

// Types/Interfaces
PascalCase: ContactData, UserProfile

// Files
PascalCase per components: ContactSection.tsx
camelCase per utils: formatDate.ts
```

---

## 🎨 STYLING RULES

### **Regola 1: StyleSheet per Layout, Props per Dimensioni**

```typescript
// ✅ CORRETTO
const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    // padding/margin/borderRadius → PROPS DIRETTI
  }
});

<PerfectContainer 
  padding={20}
  borderRadius={12}
  style={styles.container}
>
```

---

### **Regola 2: NO Magic Numbers**

```typescript
// ❌ VIETATO
<PerfectContainer padding={18} margin={23}>

// ✅ CORRETTO
import { Spacing } from '@/shared/constants';
<PerfectContainer 
  padding={Spacing[4]}    // 16px
  margin={Spacing[6]}     // 24px
>
```

---

### **Regola 3: Colori SEMPRE da Design Tokens**

```typescript
// ❌ VIETATO
backgroundColor: '#DC2626'
color: '#FFFFFF'

// ✅ CORRETTO
import { Colors } from '@/shared/constants';
backgroundColor: Colors.primary[600]
color: Colors.neutral[0]
```

---

## ⚡ PERFORMANCE RULES

### **Regola 1: useCallback per Props**

```typescript
// ❌ EVITARE
<Button onPress={() => handlePress(id)} />

// ✅ PREFERITO
const handlePressCallback = useCallback(() => {
  handlePress(id);
}, [id]);

<Button onPress={handlePressCallback} />
```

---

### **Regola 2: useMemo per Calcoli Pesanti**

```typescript
// ❌ EVITARE
const filteredData = data.filter(...).map(...).sort(...);

// ✅ PREFERITO
const filteredData = useMemo(
  () => data.filter(...).map(...).sort(...),
  [data]
);
```

---

### **Regola 3: React.memo per Componenti Pesanti**

```typescript
// ✅ CORRETTO
export const ContactCard = React.memo<ContactCardProps>(({
  contact,
  onPress,
}) => {
  // Component pesante con molte animazioni
});
```

---

## 🧪 TESTING RULES

### **Regola 1: Test per Logic, Non UI**

```typescript
// ✅ Testa hook/utils
describe('useContactData', () => {
  it('should format contact data correctly', () => {
    // Test
  });
});

// ⚠️ UI testing minimal
// Focus su business logic
```

---

## 📚 DOCUMENTATION RULES

### **Regola 1: Commenti Solo Quando Necessari**

```typescript
// ❌ VIETATO (ovvio)
// Increment counter by 1
setCount(count + 1);

// ✅ UTILE (spiega "perché")
// Delay needed for iOS keyboard animation to complete
await new Promise(resolve => setTimeout(resolve, 300));
```

---

### **Regola 2: JSDoc per Funzioni Pubbliche**

```typescript
/**
 * Formats contact data for display
 * @param contact - Raw contact data from API
 * @returns Formatted contact ready for UI
 */
export const formatContact = (contact: RawContact): Contact => {
  // ...
}
```

---

## 🔒 GIT RULES

### **Regola 1: Commit Messaggi Semantici**

```bash
# ✅ CORRETTO
feat(contact): add contact card component
fix(navigation): resolve back button crash
refactor(styles): extract spacing to Perfect System
docs(readme): update installation steps
chore(deps): update expo to 50.0.0

# ❌ VIETATO
"fix stuff"
"update"
"wip"
```

**Pattern**: `type(scope): description`

**Types**:
- `feat`: Nuova feature
- `fix`: Bug fix
- `refactor`: Refactoring codice
- `docs`: Documentazione
- `style`: Formatting, missing semi-colons, etc.
- `test`: Adding tests
- `chore`: Maintenance

---

### **Regola 2: Pre-Commit Checks**

**AUTOMATICO** (Husky):
```bash
✅ ESLint --max-warnings 0
✅ TypeScript check
✅ Prettier check
✅ Tests pass
```

**MANUALE**:
```bash
✅ Code Cleanup Checklist
✅ No console.log() left
✅ No commented code
✅ No TODO without ticket
```

---

## 🚨 CODE REVIEW CHECKLIST

### **Reviewer DEVE verificare**:

```markdown
[ ] Tutti import usati?
[ ] ZERO any types?
[ ] Perfect System usato?
[ ] Props minimali?
[ ] Hook minimali?
[ ] Nesting < 4 livelli?
[ ] File < 200 linee?
[ ] Spacing = props diretti?
[ ] Colori da Design Tokens?
[ ] Commit message semantico?
[ ] Tests passano?
[ ] Zero ESLint warnings?
[ ] Zero TypeScript errors?
```

**SE ANCHE UNO ❌ → REQUEST CHANGES**

---

## 🎯 DECISION MAKING FRAMEWORK

### **Prima di Aggiungere Qualsiasi Codice, Chiediti**:

```
1. ❓ È NECESSARIO?
   → Se NO: non aggiungerlo

2. ❓ MIGLIORA il progetto?
   → Se NO: non aggiungerlo

3. ❓ È DUPLICATO?
   → Se SÌ: riusa esistente

4. ❓ È TESTABILE?
   → Se NO: refactora prima

5. ❓ È MANUTENIBILE?
   → Se NO: semplifica

6. ❓ È PERFORMANTE?
   → Se NO: ottimizza

7. ❓ È CONSISTENTE con codebase?
   → Se NO: adatta o refactora globalmente

8. ❓ È SCALABILE?
   → Se NO: ripensa design

9. ❓ È DOCUMENTATO (se complesso)?
   → Se NO: documenta

10. ❓ Tra 6 mesi capirai PERCHÉ l'hai scritto così?
    → Se NO: semplifica o commenta
```

**REGOLA D'ORO**: Se dubbio → NON farlo (o chiedi review prima)

---

## 🏆 QUALITY METRICS

### **Obiettivi Misurabili**:

```yaml
Code Quality:
  - TypeScript errors: 0
  - ESLint warnings: 0
  - Test coverage: >80%
  - Perfect System adoption: >90%
  - Duplicated code: <3%
  - Function complexity: <10 (cyclomatic)
  - File length: <200 lines (avg)

Performance:
  - Bundle size: <5MB
  - Initial load: <2s
  - JS thread: <16ms/frame
  - Memory: <150MB (idle)

Maintainability:
  - Documentation: 100% public APIs
  - Dependencies: up-to-date
  - Technical debt: tracked & prioritized
```

---

## 📖 EXAMPLES LIBRARY

### **Approved Patterns** ✅

```typescript
// Pattern: Feature Component
export const ContactSection: React.FC<ContactSectionProps> = ({
  contacts,
  onContactPress,
}) => {
  const { triggerHaptic } = useHapticFeedback();

  const handlePress = useCallback(async (id: string) => {
    await triggerHaptic('light');
    onContactPress(id);
  }, [onContactPress, triggerHaptic]);

  return (
    <PerfectContainer padding={20}>
      {contacts.map(contact => (
        <ContactCard 
          key={contact.id}
          contact={contact}
          onPress={() => handlePress(contact.id)}
        />
      ))}
    </PerfectContainer>
  );
};
```

---

### **Anti-Patterns** ❌

```typescript
// ❌ ANTI-PATTERN 1: Inline styles con dimensioni
<View style={{ padding: 20, margin: 16 }}>

// ❌ ANTI-PATTERN 2: Props non usati
const Component = ({ data, unused }) => { use(data); }

// ❌ ANTI-PATTERN 3: Hook per singola funzione
const { scale } = useResponsive();  // Usa scaleDimensionLinear()

// ❌ ANTI-PATTERN 4: Magic numbers
backgroundColor: '#DC2626'  // Usa Colors.primary[600]

// ❌ ANTI-PATTERN 5: Deep nesting
<A><B><C><D><E><F><G>  // Max 4 livelli
```

---

## 🔄 CONTINUOUS IMPROVEMENT

### **Regola: Lascia il Codice Migliore di Come l'Hai Trovato**

**Boy Scout Rule**: Ogni volta che tocchi un file:
1. Applica Code Cleanup Checklist
2. Applica Perfect System se manca
3. Rimuovi codice morto
4. Migliora naming
5. Aggiungi types mancanti

**Non rimandare refactoring!**

---

## 📞 ENFORCEMENT

### **Automatico (CI/CD)**:
- ✅ ESLint (errori + warnings)
- ✅ TypeScript strict mode
- ✅ Prettier formatting
- ✅ Jest tests
- ✅ Bundle size check

### **Manuale (Code Review)**:
- ✅ Architecture decisions
- ✅ Naming conventions
- ✅ Perfect System adoption
- ✅ Code Cleanup Checklist

### **Periodico (Weekly)**:
- ✅ Dependency updates
- ✅ Performance profiling
- ✅ Technical debt review

---

## 🎓 ONBOARDING

### **Nuovo Sviluppatore DEVE**:

1. Leggere questo documento
2. Studiare Code Cleanup Checklist
3. Esaminare 3 componenti "perfect" esistenti
4. Completare 2 PR sotto review
5. Passare coding standards quiz

**SOLO DOPO** → commit rights

---

## ✅ SUMMARY CHECKLIST

**Prima di OGNI commit**:

```
[ ] Zero import inutili
[ ] Zero hook inutili
[ ] Zero props inutili
[ ] Perfect System 100%
[ ] Spacing = props diretti
[ ] Colori da Tokens
[ ] Zero any types
[ ] Nesting < 4
[ ] File < 200 linee
[ ] Zero warnings
[ ] Zero errors
[ ] Tests pass
[ ] Commit message semantico
```

---

**💎 QUALITÀ È NON NEGOZIABILE - ZERO COMPROMESSI**

*Last updated: 29 Ottobre 2025*
