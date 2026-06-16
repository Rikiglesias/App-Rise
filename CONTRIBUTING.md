# 🤝 CONTRIBUTING - Rise Against Hunger Italia

## 🎯 FILOSOFIA

> **Ogni contributo deve migliorare il progetto. Zero compromessi sulla qualità.**

---

## 📚 DOCUMENTAZIONE OBBLIGATORIA

**Prima di contribuire, DEVI leggere**:

1. **[CODING_STANDARDS.md](./docs/guides/development.md)** ⭐ FONDAMENTALE
   - Regole architettura
   - Convenzioni naming
   - Perfect System rules
   - TypeScript standards
   - Performance guidelines

2. **[CODE_CLEANUP_CHECKLIST.md](./docs/guides/quality-standards.md)** ⭐ DA USARE SEMPRE
   - Checklist pre-commit
   - Template analisi file
   - Esempi prima/dopo

3. **[Perfect System docs](./docs/perfect-system/)**
   - Sistema UI responsive
   - Componenti Perfect

---

## 🚀 WORKFLOW

### **1. Setup Iniziale**

```bash
# Clone repo
git clone <repo-url>
cd app-rise

# Install dependencies
npm install

# Setup git hooks (automatic)
# Husky configurato per pre-commit checks

# Verifica ambiente
npm run conta-problemi
# Output deve essere: 0 problemi, 0 warnings, 0 errori
```

---

### **2. Creazione Feature/Fix**

```bash
# Crea branch da main
git checkout main
git pull origin main
git checkout -b feat/nome-feature

# Oppure per bug fix
git checkout -b fix/nome-bug
```

**Naming branches**:
- `feat/` - Nuova feature
- `fix/` - Bug fix
- `refactor/` - Refactoring
- `docs/` - Solo documentazione
- `chore/` - Maintenance

---

### **3. Sviluppo**

#### **Durante lo sviluppo**:

```bash
# Verifica errori frequentemente
npm run typecheck
npm run lint

# Oppure tutto insieme
npm run pre-modifiche
```

#### **Per OGNI file che modifichi**:

1. ✅ Apri [CODE_CLEANUP_CHECKLIST.md](./docs/guides/quality-standards.md)
2. ✅ Segui checklist punto per punto
3. ✅ Applica [CODING_STANDARDS.md](./docs/guides/development.md)
4. ✅ Verifica visivamente l'app

#### **Rules of Thumb**:

```typescript
// ✅ SEMPRE
import { Component } from '@/components/ui';  // Path alias
<PerfectContainer padding={20}>  // Perfect System
const handlePress = useCallback(() => {}, []);  // Performance

// ❌ MAI
import { Component } from '../../../components/ui';  // Path lungo
<View style={{ padding: 20 }}>  // View nativo
const handlePress = () => {};  // Inline function
```

---

### **4. Pre-Commit Checklist**

**AUTOMATICO** (Husky verifica):
- ✅ ESLint passa (zero warnings)
- ✅ TypeScript compila
- ✅ Prettier formatta
- ✅ Tests passano

**MANUALE** (TUA responsabilità):
- ✅ [Code Cleanup Checklist](./docs/guides/quality-standards.md) completa
- ✅ Zero `console.log()` left
- ✅ Zero codice commentato
- ✅ Zero `TODO` senza ticket
- ✅ Commit message semantico
- ✅ App testata visivamente

---

### **5. Commit**

```bash
# Verifica finale
npm run conta-problemi
# DEVE essere: 0 problemi

# Stage changes
git add .

# Commit con messaggio semantico
git commit -m "feat(contact): add contact card with haptic feedback"

# Se pre-commit hook fallisce:
# 1. Leggi errori
# 2. Fixa
# 3. Riprova
```

**Commit Message Format**:
```
type(scope): description

[optional body]

[optional footer]
```

**Types**:
- `feat`: Nuova feature
- `fix`: Bug fix
- `refactor`: Refactoring
- `docs`: Documentazione
- `style`: Formatting
- `test`: Tests
- `chore`: Maintenance

**Examples**:
```bash
feat(navigation): add back button to contact screen
fix(perfect-system): resolve spacing on iPad
refactor(imports): standardize all path aliases to @/
docs(readme): update installation instructions
```

---

### **6. Push & Pull Request**

```bash
# Push branch
git push origin feat/nome-feature

# Crea Pull Request su GitHub
# Template PR si auto-popola
```

#### **PR Requirements**:

**Titolo**: Stesso format del commit message
```
feat(contact): add contact card component
```

**Description**:
```markdown
## What
Breve descrizione della modifica

## Why
Perché è necessaria

## How
Come l'hai implementata

## Testing
- [ ] Testato su iPhone 15 simulator
- [ ] Testato su iPad simulator
- [ ] Testato su Android emulator
- [ ] Zero warnings ESLint
- [ ] Zero errors TypeScript
- [ ] Tests passano

## Screenshots
(se UI changes)

## Checklist
- [ ] Code Cleanup Checklist completata
- [ ] Coding Standards seguiti
- [ ] Perfect System usato
- [ ] Documentazione aggiornata (se necessaria)
```

---

### **7. Code Review**

#### **Come Reviewer**:

**DEVI verificare** (usa [CODING_STANDARDS.md](./docs/guides/development.md)):

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
[ ] Commit messages semantici?
[ ] Tests passano?
[ ] Zero warnings?
```

**Approval Criteria**:
- ✅ TUTTI i check passano → APPROVE
- ❌ ANCHE UNO fallisce → REQUEST CHANGES

**Commenti**:
- ✅ Costruttivi
- ✅ Riferimenti a docs ([CODING_STANDARDS.md](./docs/guides/development.md))
- ✅ Esempi concreti

---

### **8. Merge**

**Dopo approval**:
```bash
# Squash and merge (preferito)
# Mantiene history pulita

# Messaggio merge = titolo PR
```

---

## 📋 QUICK REFERENCE CARDS

### **Card 1: Import Rules**

```typescript
// ✅ CORRETTO
import React from 'react';
import { View } from 'react-native';

import { PerfectText, PerfectContainer } from '@/components/ui';
import { Colors } from '@/shared/constants';

import { contactStyles } from '../styles/contactStyles';
import type { ContactProps } from '../types';

// ❌ VIETATO
import { PerfectText } from '../../../components/ui/PerfectText';
import { contactStyles } from '../styles';  // Preferisci import diretto
```

---

### **Card 2: Perfect System**

```typescript
// ✅ CORRETTO
import { PerfectContainer, PerfectText } from '@/components/ui';
import { scaleDimensionLinear } from '@/shared/constants/responsiveSystem';

<PerfectContainer padding={20} margin={16} borderRadius={12}>
  <PerfectText size={16} lines={2}>Text</PerfectText>
  <Icon size={scaleDimensionLinear(20)} />
</PerfectContainer>

// ❌ VIETATO
import { View, Text } from 'react-native';
const { scale } = useResponsive();

<View style={{ padding: 20, margin: 16 }}>
  <Text>Text</Text>
  <Icon size={scale(20)} />
</View>
```

---

### **Card 3: Component Structure**

```typescript
// ✅ CORRETTO
import React, { useCallback } from 'react';

import { PerfectContainer, PerfectText } from '@/components/ui';

import type { ComponentProps } from '../types';

export const Component: React.FC<ComponentProps> = ({
  data,
  onPress,
}) => {
  const handlePress = useCallback(() => {
    onPress(data.id);
  }, [data.id, onPress]);

  return (
    <PerfectContainer padding={20}>
      <PerfectText size={16}>{data.name}</PerfectText>
    </PerfectContainer>
  );
};

// ❌ VIETATO
export const Component = ({ data, onPress, unused }) => {
  return (
    <View style={{ padding: 20 }}>
      <Text>{data.name}</Text>
    </View>
  );
};
```

---

## 🚨 COMMON MISTAKES

### **Mistake 1: Import non consolidati**
```typescript
// ❌ MALE
import { PerfectText } from '@/components/ui/PerfectText';
import { PerfectContainer } from '@/components/ui/PerfectContainer';

// ✅ BENE
import { PerfectText, PerfectContainer } from '@/components/ui';
```

### **Mistake 2: Hook ridondanti**
```typescript
// ❌ MALE
const { scale } = useResponsive();
size={scale(20)}

// ✅ BENE
import { scaleDimensionLinear } from '@/shared/constants/responsiveSystem';
size={scaleDimensionLinear(20)}
```

### **Mistake 3: Spacing in style object**
```typescript
// ❌ MALE
<PerfectContainer style={{ padding: 20, margin: 16 }}>

// ✅ BENE
<PerfectContainer padding={20} margin={16}>
```

### **Mistake 4: Props non usati**
```typescript
// ❌ MALE
const Component = ({ data, animations: _animations, onPress }) => {
  // _animations mai usato!
}

// ✅ BENE
const Component = ({ data, onPress }) => {
  // Solo props usati
}
```

---

## 🎓 LEARNING RESOURCES

### **Esempi di Codice Perfetto**:
1. `src/features/about/components/ChiSiamoSection.tsx` - Perfect cleanup
2. `src/features/about/components/ContactSection.tsx` - Perfect System al 100%
3. `src/components/ui/PerfectContainer.tsx` - Component architecture

### **Anti-patterns da Evitare**:
1. ❌ Deep nesting (> 4 livelli)
2. ❌ Magic numbers (usa Design Tokens)
3. ❌ Inline styles con dimensioni
4. ❌ useResponsive() per singola funzione
5. ❌ Path relativi lunghi (`../../../`)

---

## 📞 HELP & SUPPORT

### **Stuck?**
1. Leggi [CODING_STANDARDS.md](./docs/guides/development.md)
2. Usa [CODE_CLEANUP_CHECKLIST.md](./docs/guides/quality-standards.md)
3. Esamina esempi esistenti
4. Chiedi in PR draft

### **Found a Bug in Standards?**
1. Apri issue con label `docs`
2. Proponi fix
3. Discuti con team

---

## ✅ FINAL CHECKLIST

**Prima di aprire PR**:

```
[ ] Ho letto CODING_STANDARDS.md
[ ] Ho seguito CODE_CLEANUP_CHECKLIST.md
[ ] npm run conta-problemi = 0 problemi
[ ] Perfect System usato 100%
[ ] Zero warnings ESLint
[ ] Zero errors TypeScript
[ ] Tests passano
[ ] App testata visualmente
[ ] Commit messages semantici
[ ] PR description completa
```

---

**💎 QUALITY IS NOT NEGOTIABLE - GRAZIE PER CONTRIBUIRE CON ECCELLENZA!**

*Rise Against Hunger Italia - Combattiamo la fame con codice di qualità*
