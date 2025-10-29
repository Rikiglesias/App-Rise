# 🧹 CHECKLIST PULIZIA CODICE - ZERO TOLLERANZA

## 📋 Da consultare PRIMA di ogni commit

**Usa questa checklist per ogni file che modifichi!**

---

## ✅ PARTE 1: IMPORT & DIPENDENZE

### **1.1 Import Inutili**
- [ ] Verifica che TUTTI gli import siano usati
- [ ] Rimuovi import mai referenziati nel codice
- [ ] Cerca `import.*from` e verifica uso

**Esempio**:
```typescript
// ❌ MALE
import { useResponsive } from '@/hooks';  // Mai usato!
import responsiveSystem from '@/constants';  // Mai usato!

// ✅ BENE
import { useHapticFeedback } from '@/hooks';  // Usato alla riga 15
```

---

### **1.2 Consolidamento Import**
- [ ] Import dallo stesso modulo devono essere raggruppati
- [ ] Usa destructuring per multipli import

**Esempio**:
```typescript
// ❌ MALE
import { PerfectText } from '@/components/ui/PerfectText';
import { PerfectContainer } from '@/components/ui/PerfectContainer';

// ✅ BENE
import { PerfectText, PerfectContainer } from '@/components/ui';
```

---

### **1.3 Path Alias Consistenti**
- [ ] Usa `@/` per shared/components/hooks
- [ ] Usa path relativi (`../`) solo per stesso feature
- [ ] NO path lunghi (`../../../`)

**Esempio**:
```typescript
// ❌ MALE
import { PerfectText } from '../../../components/ui/PerfectText';

// ✅ BENE
import { PerfectText } from '@/components/ui';
import { contactStyles } from '../styles/contactStyles';  // Stesso feature = relativo OK
```

---

### **1.4 Re-export Inutili**
- [ ] Import DIRETTO dal file sorgente quando possibile
- [ ] NO catene di re-export (`index.ts → file.ts`)

**Esempio**:
```typescript
// ❌ MALE
import { styles } from '../styles';  // styles/index.ts → styles/contactStyles.ts

// ✅ BENE
import { contactStyles } from '../styles/contactStyles';  // Diretto
```

---

## ✅ PARTE 2: HOOK & STATE

### **2.1 Hook Inutili**
- [ ] Ogni hook DEVE essere usato
- [ ] Rimuovi hook che producono variabili mai usate
- [ ] Cerca `const { ... } = use...()` e verifica uso di TUTTE le variabili

**Esempio**:
```typescript
// ❌ MALE
const { scale } = useResponsive();  // scale mai usato!

// ✅ BENE
const { triggerHaptic } = useHapticFeedback();  // Usato alla riga 20
```

---

### **2.2 Hook Ridondanti**
- [ ] NON usare hook se esiste funzione equivalente diretta
- [ ] Preferisci funzioni pure a hook (performance)

**Esempio**:
```typescript
// ❌ MALE
const { scale } = useResponsive();
size={scale(20)}  // Hook + re-render

// ✅ BENE
import { scaleDimensionLinear } from '@/constants';
size={scaleDimensionLinear(20)}  // Funzione pura, zero overhead
```

---

## ✅ PARTE 3: PROPS & TYPES

### **3.1 Props Non Usati**
- [ ] Ogni prop del componente DEVE essere usato
- [ ] Rimuovi props che iniziano con `_` (se davvero non servono)
- [ ] Aggiorna TypeScript types se rimuovi props

**Esempio**:
```typescript
// ❌ MALE
export const Component: React.FC<Props> = ({
  animations: _animations,  // Mai usato!
  onPress,
}) => { ... }

// ✅ BENE
export const Component: React.FC<Props> = ({
  onPress,
}) => { ... }
```

---

### **3.2 Prop Drilling Inutile**
- [ ] Verifica se prop viene passato ma mai usato
- [ ] Rimuovi dal type interface

**Esempio**:
```typescript
// ❌ MALE - types/index.ts
export interface ComponentProps {
  animations: Animations;  // Mai usato nel component!
  onPress: () => void;
}

// ✅ BENE
export interface ComponentProps {
  onPress: () => void;
}
```

---

## ✅ PARTE 4: COMPONENTI & JSX

### **4.1 Nesting Inutile**
- [ ] Rimuovi container vuoti senza stili/logica
- [ ] Massimo 4-5 livelli di nesting

**Esempio**:
```typescript
// ❌ MALE
<Container>
  <Container>  {/* Vuoto, nessuno style/prop! */}
    <Text>Content</Text>
  </Container>
</Container>

// ✅ BENE
<Container>
  <Text>Content</Text>
</Container>
```

---

### **4.2 Props Ridondanti**
- [ ] Rimuovi props che duplicano funzionalità automatiche
- [ ] PerfectText scala automaticamente → NO containerWidth

**Esempio**:
```typescript
// ❌ MALE
<PerfectText 
  size={30}
  containerWidth={(width ?? 393) * 0.7}  // Ridondante!
>
  Testo
</PerfectText>

// ✅ BENE
<PerfectText size={30}>
  Testo
</PerfectText>
```

---

### **4.3 Componenti Duplicati**
- [ ] Se stesso pattern ripetuto 3+ volte → estrattore componente
- [ ] Riutilizza componenti esistenti

---

## ✅ PARTE 5: STILI & DESIGN SYSTEM

### **5.1 Spacing Fissi**
- [ ] TUTTI padding/margin devono scalare
- [ ] Usa props diretti (`paddingVertical={12}`) NON style object
- [ ] Rimuovi spacing da StyleSheet se ora sono props

**Esempio**:
```typescript
// ❌ MALE
<PerfectContainer style={{ padding: 20 }}>  // Fisso!

// ✅ BENE
<PerfectContainer padding={20}>  // Scala automaticamente!
```

---

### **5.2 Dimensioni Fisse**
- [ ] width/height devono scalare (se dimensioni specifiche)
- [ ] borderRadius deve scalare
- [ ] Usa props diretti di PerfectContainer

**Esempio**:
```typescript
// ❌ MALE
style={{ borderRadius: 16, paddingVertical: 12 }}

// ✅ BENE
borderRadius={16} paddingVertical={12}  // Props diretti
```

---

### **5.3 Stili Duplicati**
- [ ] Se spacing ora è prop, rimuovilo da StyleSheet
- [ ] Commenta che "ora gestito da props diretti"

**Esempio**:
```typescript
// ❌ MALE - styles/file.ts
container: {
  padding: 20,  // Ma nel component usi padding={20} prop!
  backgroundColor: '#fff',
}

// ✅ BENE
container: {
  // padding ora gestito da props diretti (SCALA!)
  backgroundColor: '#fff',
}
```

---

## ✅ PARTE 6: PERFORMANCE

### **6.1 Re-render Inutili**
- [ ] useCallback per funzioni passate come props
- [ ] useMemo per calcoli pesanti
- [ ] React.memo per componenti pesanti

---

### **6.2 Funzioni vs Hook**
- [ ] Preferisci funzioni pure a hook quando possibile
- [ ] Hook = stato/effetti, Funzioni = calcoli

**Esempio**:
```typescript
// ❌ MALE
const { scale } = useResponsive();  // Hook per semplice calcolo

// ✅ BENE
import { scaleDimensionLinear } from '@/constants';  // Funzione pura
```

---

## ✅ PARTE 7: COMMENTI & NAMING

### **7.1 Commenti Obsoleti**
- [ ] Rimuovi commenti che descrivono codice rimosso
- [ ] Aggiorna commenti se hai cambiato logica

---

### **7.2 Nomi Descrittivi**
- [ ] Variabili/funzioni con nomi chiari
- [ ] NO abbreviazioni non standard
- [ ] Componenti = PascalCase, funzioni = camelCase

---

## ✅ PARTE 8: PERFECT SYSTEM

### **8.1 Componenti View Nativi**
- [ ] Sostituisci `<View>` con `<PerfectContainer>`
- [ ] Sostituisci `<Text>` con `<PerfectText>`
- [ ] Eccezione: `Animated.View` rimane (per animazioni)

---

### **8.2 Scaling Sistema**
- [ ] Icon size: usa `scaleDimensionLinear()` o `PerfectIcon`
- [ ] NO `useResponsive()` solo per scale
- [ ] Usa props diretti per spacing

---

## ✅ PARTE 9: TYPESCRIPT

### **9.1 Types Corretti**
- [ ] Ogni props ha type corretto
- [ ] Rimuovi types non usati
- [ ] Usa `readonly` per props che non mutano

---

### **9.2 Any Types**
- [ ] ZERO `any` types
- [ ] Usa types specifici sempre

---

## ✅ PARTE 10: TESTING VISIVO

### **10.1 Pre-Commit Check**
- [ ] File compila senza errori TypeScript
- [ ] Zero ESLint errors
- [ ] App si avvia correttamente
- [ ] Schermata visivamente identica a prima

---

## 🎯 WORKFLOW COMPLETO

### **Step 1: PRE-ANALISI**
```bash
# 1. Apri file
# 2. Leggi file completo
# 3. Usa questa checklist come guida
```

### **Step 2: PULIZIA**
```bash
# Per ogni sezione della checklist:
# - Verifica ❌ problemi
# - Applica ✅ fix
# - Testa
```

### **Step 3: POST-PULIZIA**
```bash
# 1. Rimuovi import inutilizzati
# 2. Riordina import (external → local)
# 3. Format code
# 4. Compila
# 5. Test visivo
```

---

## 📊 METRICHE DI QUALITÀ

### **File Pulito al 100%**
```
✅ Zero import inutili
✅ Zero hook ridondanti
✅ Zero props non usati
✅ Zero nesting inutile
✅ Zero spacing fissi (tutti props)
✅ Perfect System al 100%
✅ Zero errori TypeScript
✅ Zero warnings ESLint
✅ Codice < 150 linee (se possibile)
```

---

## 🚨 RED FLAGS (FERMA TUTTO!)

Se trovi questi, **STOP** e risolvi subito:

```typescript
❌ import ... // Mai usato
❌ const { x } = hook(); // x mai usato
❌ animations: _animations // Props underscore non usato
❌ <View> invece di <PerfectContainer>
❌ style={{ padding: 20 }} invece di padding={20}
❌ useResponsive() solo per scale()
❌ ../../../ path (usa @/)
❌ containerWidth su PerfectText (ridondante)
❌ <Container><Container> nesting vuoto
❌ any types
```

---

## ✅ CHECKLIST RAPIDA (1 minuto)

Prima di commit:

```
[ ] Tutti import usati?
[ ] Tutti hook usati?
[ ] Tutti props usati?
[ ] Nesting minimal?
[ ] Spacing = props diretti?
[ ] View → PerfectContainer?
[ ] Text → PerfectText?
[ ] Zero TypeScript errors?
[ ] Zero ESLint warnings?
[ ] App compila?
```

**SE TUTTI ✅ → COMMIT**  
**SE ANCHE UNO ❌ → FIX PRIMA**

---

## 🎓 ESEMPI PRIMA/DOPO

### **Esempio 1: Import**
```typescript
// ❌ PRIMA
import { useResponsive } from '@/hooks';
import responsiveSystem from '@/constants/responsive';
import { PerfectText } from '@/components/ui/PerfectText';
import { PerfectContainer } from '@/components/ui/PerfectContainer';

// ✅ DOPO
import { PerfectText, PerfectContainer } from '@/components/ui';
import { scaleDimensionLinear } from '@/shared/constants/responsiveSystem';
```

### **Esempio 2: Props**
```typescript
// ❌ PRIMA
const Component: FC<Props> = ({
  animations: _animations,  // Mai usato
  data,
  onPress,
}) => { ... }

// ✅ DOPO
const Component: FC<Props> = ({
  data,
  onPress,
}) => { ... }
```

### **Esempio 3: Perfect System**
```typescript
// ❌ PRIMA
const { scale } = useResponsive();
<View style={{ padding: 20 }}>
  <Text style={{ fontSize: 16 }}>Hello</Text>
  <Icon size={scale(20)} />
</View>

// ✅ DOPO
<PerfectContainer padding={20}>
  <PerfectText size={16}>Hello</PerfectText>
  <Icon size={scaleDimensionLinear(20)} />
</PerfectContainer>
```

---

## 📝 TEMPLATE ANALISI FILE

Usa questo template ogni volta:

```markdown
# ANALISI: [NomeFile.tsx]

## ❌ PROBLEMI TROVATI
1. Import inutili: [lista]
2. Hook ridondanti: [lista]
3. Props non usati: [lista]
4. Nesting inutile: [sì/no]
5. Spacing fissi: [lista]
6. View nativi: [count]

## ✅ FIX APPLICATI
1. Rimosso: [cosa]
2. Sostituito: [cosa con cosa]
3. Estratto: [spacing come props]
4. Consolidato: [import]

## 📊 RISULTATO
- Linee codice: [prima] → [dopo]
- Import: [prima] → [dopo]
- Hook: [prima] → [dopo]
- Perfect System: [%]
```

---

## 🎯 OBIETTIVO FINALE

**Ogni file DEVE essere**:
- ✅ Minimal (solo codice necessario)
- ✅ Logico (tutto ha senso)
- ✅ Performante (zero overhead)
- ✅ Scalabile (Perfect System al 100%)
- ✅ Manutenibile (chiaro e pulito)

---

**💪 ZERO TOLLERANZA - QUALITÀ AL 100%!**
