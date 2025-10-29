# ⚡ QUICK STANDARDS REFERENCE

> **1-Page cheat sheet per coding standards. Stampa e tieni alla scrivania!**

---

## ✅ PRE-COMMIT CHECKLIST (30 secondi)

```bash
[ ] npm run conta-problemi = 0
[ ] Tutti import usati
[ ] Tutti hook usati  
[ ] Tutti props usati
[ ] View → PerfectContainer
[ ] Text → PerfectText
[ ] Spacing = props diretti
[ ] Zero any types
[ ] Nesting < 4 livelli
[ ] File < 200 linee
```

**SE TUTTI ✅ → COMMIT**  
**SE ANCHE UNO ❌ → FIX**

---

## 📦 IMPORT TEMPLATE

```typescript
// 1. React & React Native
import React from 'react';
import { StyleSheet } from 'react-native';

// 2. External libraries
import { LinearGradient } from 'expo-linear-gradient';

// 3. Alias paths (@/)
import { PerfectText, PerfectContainer } from '@/components/ui';
import { Colors, Spacing } from '@/shared/constants';

// 4. Relative (stesso feature)
import { contactStyles } from '../styles/contactStyles';
import type { ContactProps } from '../types';
```

---

## 🎨 PERFECT SYSTEM TEMPLATE

```typescript
import { PerfectContainer, PerfectText } from '@/components/ui';
import { scaleDimensionLinear } from '@/shared/constants/responsiveSystem';
import { Colors, Spacing } from '@/shared/constants';

export const Component: React.FC<Props> = ({ data, onPress }) => {
  return (
    <PerfectContainer 
      padding={Spacing[4]}       // ✅ Props diretti (SCALA)
      margin={Spacing[3]}
      borderRadius={12}
      style={styles.container}   // ✅ Layout properties
    >
      <PerfectText size={16} lines={2}>
        {data.title}
      </PerfectText>
      <Icon size={scaleDimensionLinear(20)} />
    </PerfectContainer>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.neutral[0],
    // padding/margin/borderRadius → PROPS DIRETTI!
  }
});
```

---

## 🚨 RED FLAGS

**Se vedi questi, FERMA e fixa**:

```typescript
❌ import { x } from '...';  // x mai usato
❌ const { scale } = useResponsive();  // Usa scaleDimensionLinear()
❌ animations: _animations  // Props non usato
❌ <View style={{ padding: 20 }}>  // Usa PerfectContainer
❌ import from '../../../'  // Usa @/
❌ backgroundColor: '#DC2626'  // Usa Colors.primary[600]
❌ any types  // ZERO TOLLERANZA
```

---

## 📐 RULES OF THUMB

```typescript
// ✅ DO
@/ paths per shared/components
PerfectContainer + props diretti
scaleDimensionLinear() function
useCallback per props functions
Colors/Spacing da tokens

// ❌ DON'T  
../../../ long paths
View con inline styles
useResponsive() hook
Inline functions in props
Magic numbers/colors
```

---

## 📊 METRICS TARGET

```yaml
TypeScript errors: 0
ESLint warnings: 0
Test coverage: >80%
Perfect System: >90%
File avg length: <150 lines
Function complexity: <10
```

---

## 🔗 FULL DOCS

**Dettagli completi**:
1. [CONTRIBUTING.md](../CONTRIBUTING.md) - Workflow
2. [CODING_STANDARDS.md](./CODING_STANDARDS.md) - Regole complete
3. [CODE_CLEANUP_CHECKLIST.md](./CODE_CLEANUP_CHECKLIST.md) - Checklist dettagliata

---

## 💎 MANTRA

> **Ogni linea di codice deve essere giustificabile, sensata, e migliorare il progetto.**

**ZERO TOLLERANZA per**:
- Codice inutilizzato
- Duplicazioni
- Inconsistenze
- Complessità inutile

---

**📌 Stampa questa pagina e tienila vicino mentre codi!**
