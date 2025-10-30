# 🧹 CHECKLIST PULIZIA CODICE - ZERO TOLLERANZA

## 📋 Da consultare PRIMA di ogni commit

**Usa questa checklist per ogni file che modifichi!**

---

## 🔥 REGOLA #0: SOLO PERFECT SYSTEM (CRITICA!)

### **⚠️ IMPORTANTE: responsiveSystem.ts È PRIVATO**
```
responsiveSystem.ts contiene SOLO la funzione scale()
VIETATO importarla nei file app!
USO ESCLUSIVO: Perfect components internamente
```

### **0.1 ZERO import responsiveSystem**
- [ ] Il file NON deve importare `responsiveSystem`
- [ ] Cerca: `from.*responsiveSystem`
- [ ] Se trovato → ERRORE! ELIMINA e usa Perfect components

**Esempio VIETATO**:
```typescript
// ❌ VIETATO - responsiveSystem è PRIVATO
import { scale } from '@/shared/constants/responsiveSystem';
import { scaleDimensionLinear, scaleFont } from '@/responsiveSystem'; // NON ESISTONO PIÙ!

const scaled = scale(24);  // ❌ MAI fare questo!
const icon = scaleDimensionLinear(24);  // ❌ FUNZIONE ELIMINATA!
```

**Esempio CORRETTO**:
```typescript
// ✅ OBBLIGATORIO - Solo Perfect components
import { PlatformIcon, PerfectText, PerfectContainer } from '@/components/ui';

<PlatformIcon name="heart" size={24} />  // ✅ Scala automaticamente internamente
<PerfectText size={16}>Hello</PerfectText>  // ✅ Scala automaticamente
<PerfectContainer padding={16} />  // ✅ Scala automaticamente
```

---

### **0.2 ZERO funzioni scaling manuali**
```
⚠️ TUTTE LE FUNZIONI SCALING SONO STATE ELIMINATE O RESE PRIVATE!

ELIMINATE:
❌ scaleDimensionLinear() - NON ESISTE PIÙ
❌ scaleFont() - NON ESISTE PIÙ  
❌ scaleSpacing() - NON ESISTE PIÙ
❌ getMillimetricScale() - NON ESISTE PIÙ

PRIVATA (solo per Perfect components):
⚠️ scale() - ESISTE ma è PRIVATA
```

**Checklist**:
- [ ] Nessun import da `responsiveSystem`
- [ ] Nessuna chiamata a funzioni scale*/get*
- [ ] Nessun `TypographyTokens` importato da responsiveSystem
- [ ] Nessun `SpacingTokens` importato da responsiveSystem

---

### **0.3 USA Perfect Components (UNICA STRADA)**
- [ ] `<PerfectText>` invece di `<Text>` (SEMPRE!)
- [ ] `<PerfectContainer>` invece di `<View>` (SEMPRE!)
- [ ] `<PerfectImage>` invece di `<Image>` (SEMPRE!)
- [ ] `<PlatformIcon>` invece di `MaterialCommunityIcons`

**UNICA CONVERSIONE VALIDA**:
```typescript
// ❌ SBAGLIATO (vecchio modo)
import { View, Text, Image } from 'react-native';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { scale } from '@/shared/constants/responsiveSystem';  // ❌ PRIVATO!

<View style={{ padding: scale(16) }}>  // ❌ scale() è privato!
  <Text style={{ fontSize: scale(16) }}>Hello</Text>  // ❌ scale() è privato!
  <MaterialCommunityIcons size={scale(24)} />  // ❌ scale() è privato!
</View>

// ✅ CORRETTO (UNICO MODO)
import { PerfectContainer, PerfectText, PlatformIcon } from '@/components/ui';

<PerfectContainer padding={16}>
  <PerfectText size={16}>Hello</PerfectText>
  <PlatformIcon name="heart" size={24} />
</PerfectContainer>

// NOTA: Perfect components usano scale() INTERNAMENTE - tu NON devi fare nulla!
```

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

### **5.4 Duplicazioni fontSize/fontWeight negli Styles** ⚠️ NUOVO!
- [ ] Cerca `fontSize:` negli StyleSheet dopo conversione Perfect System
- [ ] Cerca `fontWeight:` negli StyleSheet quando già usi prop `fontWeight=`
- [ ] Cerca `lineHeight:` negli StyleSheet (calcolato automaticamente)
- [ ] ELIMINA se già gestito da props di PerfectText
- [ ] MANTIENI solo per componenti che NON hanno props (es: AnimatedNumber)

**Problema:**
Dopo conversione a Perfect System, molti styles contengono proprietà duplicate:
- `fontSize` negli styles vs `size` prop
- `fontWeight` negli styles vs `fontWeight` prop  
- `lineHeight` negli styles (auto-calcolato)

**Pattern di Ricerca**:
```typescript
// Trova duplicazioni
fontSize:.*,
fontWeight:.*Typography\.weights
fontWeight:.*['"]
lineHeight:.*,
```

**Esempio 1 - fontSize Duplicato**:
```typescript
// ❌ MALE
<PerfectText size={16} style={styles.label}>  
  Label
</PerfectText>

const styles = StyleSheet.create({
  label: {
    fontSize: 16,  // ❌ DUPLICATO - già in size prop!
    color: Colors.neutral[700],
  },
});

// ✅ BENE
<PerfectText size={16} style={styles.label}>
  Label
</PerfectText>

const styles = StyleSheet.create({
  label: {
    // fontSize rimosso - già gestito da prop
    color: Colors.neutral[700],
  },
});
```

**Esempio 2 - fontWeight Duplicato**:
```typescript
// ❌ MALE
<PerfectText 
  size={24}
  fontWeight="600"  // Prop corretta
  style={styles.title}  // Style duplica weight!
>
  Title
</PerfectText>

const styles = StyleSheet.create({
  title: {
    fontWeight: Typography.weights.bold,  // ❌ DUPLICATO!
    color: Colors.neutral[900],
  },
});

// ✅ BENE  
<PerfectText 
  size={24}
  fontWeight="600"
  style={styles.title}
>
  Title
</PerfectText>

const styles = StyleSheet.create({
  title: {
    // fontWeight rimosso - già gestito da prop
    color: Colors.neutral[900],
  },
});
```

**Esempio 3 - fontWeight Inline**:
```typescript
// ❌ MALE
<PerfectText
  size={32}
  fontWeight="400"
  style={[styles.statNumber, { fontWeight: '600' }]}  // ❌ Override inline!
>
  3.14M
</PerfectText>

// ✅ BENE
<PerfectText
  size={32}
  fontWeight="600"  // ✅ Prop corretta direttamente
  style={styles.statNumber}
>
  3.14M
</PerfectText>
```

**ECCEZIONE - AnimatedNumber:**
```typescript
// ✅ CORRETTO - AnimatedNumber NON ha prop fontWeight
<AnimatedNumber
  value={current}
  style={styles.currentValue}  // ← Style necessario!
/>

const styles = StyleSheet.create({
  currentValue: {
    fontWeight: Typography.weights.bold,  // ✅ OK - no prop alternativa
    fontFamily: Typography.families.mono,  // ✅ OK - no prop alternativa
  },
});
```

**Checklist Verifica**:
1. Per ogni `<PerfectText>` verifica abbia:
   - `size={numero}` - dimensione font
   - `lines={numero}` - max righe
   - `fontWeight="valore"` - se diverso da default

2. Per ogni StyleSheet cerca:
   - `fontSize:` → Rimuovi se c'è `size` prop
   - `fontWeight:` → Rimuovi se c'è `fontWeight` prop
   - `lineHeight:` → Rimuovi (calcolato automaticamente)

3. Per inline styles cerca pattern:
   - `style={[styles.x, { fontWeight: '600' }]}` → Sposta su prop
   - `style={[styles.x, { fontSize: 16 }]}` → Rimuovi, usa `size` prop

4. Verifica import Typography:
   - Se rimuovi tutti fontWeight/fontSize da styles
   - Check se import Typography ancora usato
   - Rimuovi import se non più necessario

---

### **5.5 Commenti Obsoleti Sistema Vecchio** ⚠️ NUOVO!
- [ ] Cerca commenti `// XS spacing`, `// SM spacing`, `// MD spacing`, `// LG spacing`
- [ ] ELIMINA TUTTI - sono residui del vecchio sistema semantico
- [ ] Perfect System usa SOLO numeri diretti senza label

**Esempio**:
```typescript
// ❌ MALE
return {
  vertical: Spacing[2], // XS spacing  ← SBAGLIATO!
  horizontal: Spacing[4], // SM spacing  ← SBAGLIATO!
};

// ✅ BENE
return {
  vertical: Spacing[2],  // Solo numero
  horizontal: Spacing[4],  // Solo numero
};
```

---

### **5.6 Condizioni Hardcoded Inutili** ⚠️ NUOVO!
- [ ] Cerca condizioni tipo `393 < 375 ? A : B` (sempre false!)
- [ ] Cerca condizioni con magic numbers che sono sempre true/false
- [ ] SEMPLIFICA: se sempre stesso risultato, usa valore diretto

**Esempio**:
```typescript
// ❌ MALE
padding: 393 < 375 ? Spacing[4] : Spacing[6], // iPhone 15: 393 > 375, sempre Spacing[6]!
const size = isLarge ? 24 : 24;  // Sempre 24!

// ✅ BENE
padding: Spacing[6],  // Diretto, niente condizione inutile
const size = 24;  // Semplice
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

## ✅ PARTE 11: AUDIT RIGA PER RIGA (RIGOROSO)

### **11.1 View Nativi → PerfectContainer**
- [ ] Cerca TUTTI i `<View` nel file
- [ ] Sostituisci con `<PerfectContainer>`
- [ ] Rimuovi import `View` da react-native se non più usato
- [ ] Verifica che ogni PerfectContainer abbia senso

**Esempio**:
```typescript
// ❌ MALE
import { View } from 'react-native';
<View style={styles.container}>
  <View style={{ alignItems: 'center' }}>
    <Text>Hello</Text>
  </View>
</View>

// ✅ BENE
import { PerfectContainer } from '@/components/ui';
<PerfectContainer style={styles.container}>
  <PerfectContainer style={styles.centered}>
    <PerfectText>Hello</PerfectText>
  </PerfectContainer>
</PerfectContainer>
```

---

### **11.2 Magic Colors Hardcoded**
- [ ] Cerca `color="#` o `backgroundColor="#` nel file
- [ ] Sostituisci con `Colors.primary[600]` o `Colors.neutral[X]`
- [ ] Verifica che Colors sia importato

**Esempio**:
```typescript
// ❌ MALE
color="#DC2626"
backgroundColor="#FFFFFF"

// ✅ BENE
import { Colors } from '@/shared/constants';
color={Colors.primary[600]}
backgroundColor={Colors.neutral[0]}
```

---

### **11.3 Inline Styles**
- [ ] Cerca `style={{ ` nel file
- [ ] Sposta TUTTI gli stili inline nel StyleSheet
- [ ] Crea stili nominati e riutilizzabili

**Esempio**:
```typescript
// ❌ MALE
<View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
<View style={{ alignItems: 'center' }}>

// ✅ BENE
const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  centered: {
    alignItems: 'center',
  },
});

<PerfectContainer style={styles.row}>
<PerfectContainer style={styles.centered}>
```

---

### **11.4 Props Default Inutili**
- [ ] Cerca `opacity: 1` → rimuovi (valore default)
- [ ] Cerca `marginHorizontal: 0` → rimuovi (valore default)
- [ ] Cerca `paddingVertical: 0` → rimuovi (valore default)
- [ ] Cerca `flexDirection: 'column'` → rimuovi (default)

**Esempio**:
```typescript
// ❌ MALE
const styles = StyleSheet.create({
  container: {
    opacity: 1,                // Default inutile
    marginHorizontal: 0,       // Default inutile
    paddingVertical: 0,        // Default inutile
    flexDirection: 'column',   // Default inutile
  },
});

// ✅ BENE
const styles = StyleSheet.create({
  container: {
    // Solo props necessarie
  },
});
```

---

### **11.5 Stili Non Usati nel StyleSheet**
- [ ] Per ogni stile definito, cerca `styles.nomeStile` nel JSX
- [ ] Se NON trovato → rimuovi stile
- [ ] Verifica dopo ogni modifica che tutto compili

**Esempio**:
```typescript
// ❌ MALE
const styles = StyleSheet.create({
  container: { ... },      // ✅ Usato
  separator: { ... },      // ✅ Usato
  oldLogo: { ... },        // ❌ MAI USATO - rimuovi!
  deprecatedStyle: { ... }, // ❌ MAI USATO - rimuovi!
});

// ✅ BENE
const styles = StyleSheet.create({
  container: { ... },
  separator: { ... },
  // Solo stili effettivamente usati
});
```

---

### **11.6 Nesting Inutile di Componenti**
- [ ] Cerca componenti identici annidati
- [ ] Cerca `<Container><Container>` senza motivo
- [ ] Rimuovi livelli inutili

**Esempio**:
```typescript
// ❌ MALE
<PerfectContainer style={styles.wrapper}>
  <PerfectContainer style={styles.wrapper}>  // ❌ DUPLICATO!
    <PerfectText>Hello</PerfectText>
  </PerfectContainer>
</PerfectContainer>

// ✅ BENE
<PerfectContainer style={styles.wrapper}>
  <PerfectText>Hello</PerfectText>
</PerfectContainer>
```

---

### **11.7 CSS Properties Inutili**
- [ ] Cerca `position: 'relative'` senza `position: 'absolute'` dentro
- [ ] Cerca `zIndex` senza overlapping
- [ ] Rimuovi proprietà CSS che non fanno nulla

**Esempio**:
```typescript
// ❌ MALE
titleContainer: {
  alignItems: 'center',
  position: 'relative',  // ❌ Niente absolute dentro? Inutile!
},

// ✅ BENE
titleContainer: {
  alignItems: 'center',
  // Solo props necessarie
},
```

---

### **11.8 IIFE Eccessivamente Complessi**
- [ ] Cerca `{(() => {` nel JSX
- [ ] Se possibile, semplifica o estrai in variabile
- [ ] Rimuovi type casting (`as number`) inutili

**Esempio**:
```typescript
// ❌ MALE
{(() => {
  const size = styles.logo.width as number;  // Type casting
  const scale = getMillimetricScale();
  const ref = Math.round(size / scale);
  return <Image width={ref} />;
})()}

// ✅ BENE
<Image
  width={Math.round(responsiveSpacing.logoSize / getMillimetricScale())}
/>
```

---

### **11.9 Commenti Ridondanti**
- [ ] Rimuovi commenti che ripetono il codice
- [ ] Mantieni solo commenti che aggiungono contesto
- [ ] Rimuovi `// TODO` completati

**Esempio**:
```typescript
// ❌ MALE
{/* TITOLO SISTEMA RESPONSIVE COMPLETO - SINGOLO FormattedText per Garantire 2 Righe Fisse */}
{/* TITOLO COMPLETO - LAYOUT ASSOLUTO PER CONTROLLO TOTALE INTERLINEA */}
{/* ✅ PERFECT SYSTEM - Titolo principale su due righe separate */}

// ✅ BENE
{/* Prima riga: "Rise Against" */}
{/* Seconda riga: "Hunger Italia" con colori diversi */}
```

---

### **11.10 Controllo Size & Immunity**
- [ ] Cerca `immunity={true}` → cambia a `false` (Perfect System)
- [ ] Aggiungi `maxSize` e `minSize` per responsive
- [ ] Aggiungi `containerWidth` se necessario
- [ ] Riduci size hardcoded troppo grandi

**Esempio**:
```typescript
// ❌ MALE
<PerfectText
  size={48}           // Troppo grande e fisso
  immunity={true}     // Bypassa Perfect System
>
  Titolo
</PerfectText>

// ✅ BENE
<PerfectText
  size={36}
  maxSize={42}
  minSize={30}
  immunity={false}    // Perfect System attivo
  containerWidth={(responsiveSystem?.LOGICAL_REFERENCE?.width ?? 393) * 0.95}
>
  Titolo
</PerfectText>
```

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
🔥 REGOLA #0 (OBBLIGATORIA):
✅ Zero import responsiveSystem
✅ Zero scaleDimensionLinear/scaleFont nel codice
✅ Zero TypographyTokens/SpacingTokens importati
✅ SOLO Perfect components (100%)

ALTRI CONTROLLI:
✅ Zero import inutili
✅ Zero hook ridondanti
✅ Zero props non usati
✅ Zero View nativi (tutti PerfectContainer)
✅ Zero Text nativi (tutti PerfectText)
✅ Zero Image nativi (tutti PerfectImage)
✅ Zero magic colors (tutti Design Tokens)
✅ Zero inline styles (tutti StyleSheet)
✅ Zero stili inutilizzati
✅ Zero props default inutili (opacity: 1, margin: 0, etc)
✅ Zero nesting duplicato
✅ Zero position: relative inutili
✅ Zero IIFE complessi
✅ Zero commenti ridondanti
✅ Zero immunity={true} (Perfect System attivo)
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
// 🔥 REGOLA #0 - VIOLAZIONI CRITICHE
❌ import { scaleDimensionLinear } from '@/shared/constants/responsiveSystem'
❌ import { scaleFont } from '@/shared/constants/responsiveSystem'
❌ import { TypographyTokens } from '@/shared/constants/responsiveSystem'
❌ import { SpacingTokens } from '@/shared/constants/responsiveSystem'
❌ scaleDimensionLinear(24) // Usa PlatformIcon size={24}
❌ scaleFont(16) // Usa PerfectText size={16}
❌ <MaterialCommunityIcons size={scaleDimensionLinear(24)} />
❌ <View> invece di <PerfectContainer>
❌ <Text> invece di <PerfectText>
❌ <Image> invece di <PerfectImage>

// Altri problemi
❌ import ... // Mai usato
❌ const { x } = hook(); // x mai usato
❌ animations: _animations // Props underscore non usato
❌ style={{ padding: 20 }} invece di padding={20}
❌ color="#DC2626" invece di Colors.primary[600]
❌ fontSize: 16 negli styles con size={16} prop (duplicazione!)
❌ fontWeight: Typography.weights.bold con fontWeight="700" prop (duplicazione!)
❌ style={[styles.x, { fontWeight: '600' }]} invece fontWeight="600" prop
❌ opacity: 1 // Props default inutili
❌ marginHorizontal: 0 // Props default inutili
❌ paddingVertical: 0 // Props default inutili
❌ styles.oldStyle // Stile definito ma mai usato
❌ <Container><Container> stesso style // Nesting duplicato
❌ position: 'relative' senza absolute dentro
❌ {(() => { const x = y as number; ... })()} // IIFE complesso
❌ immunity={true} // Bypassa Perfect System
❌ useResponsive() solo per scale()
❌ ../../../ path (usa @/)
❌ any types
❌ // XS spacing, // SM spacing  ← Commenti obsoleti!
❌ 393 < 375 ? A : B  ← Condizione sempre false!
```

---

## ✅ CHECKLIST RAPIDA (2 minuti)

Prima di commit - **CONTROLLO RIGOROSO**:

```
🔥 REGOLA #0 (CRITICA):
[ ] ZERO import responsiveSystem? (grep "from.*responsiveSystem")
[ ] ZERO scaleDimensionLinear/scaleFont nel codice?
[ ] ZERO TypographyTokens/SpacingTokens importati?
[ ] SOLO Perfect components (PerfectText/Container/Image/Icon)?

ALTRI CONTROLLI:
[ ] Tutti import usati?
[ ] Tutti hook usati?
[ ] Tutti props usati?
[ ] Nesting minimal?
[ ] Spacing = props diretti?
[ ] View → PerfectContainer? (TUTTI)
[ ] Text → PerfectText?
[ ] fontSize negli styles rimosso? (cerca "fontSize:")
[ ] fontWeight negli styles rimosso? (cerca "fontWeight:")
[ ] fontWeight inline rimosso? (cerca "{ fontWeight:")
[ ] import Typography ancora usato? (rimuovi se no)
[ ] Magic colors → Design Tokens? (cerca color="#)
[ ] Inline styles → StyleSheet? (cerca style={{)
[ ] Stili inutilizzati rimossi?
[ ] Props default rimossi? (opacity: 1, margin: 0, etc)
[ ] Nesting duplicato rimosso?
[ ] position: relative necessario?
[ ] IIFE semplificati?
[ ] Commenti ridondanti rimossi?
[ ] Commenti obsoleti XS/SM/MD rimossi? (cerca "// XS spacing")
[ ] Condizioni hardcoded inutili rimosse? (cerca "393 < 375")
[ ] immunity={false} su PerfectText?
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
0. 🔥 VIOLAZIONI REGOLA #0 (CRITICO):
   - Import responsiveSystem: [count]
   - scaleDimensionLinear/scaleFont usati: [count]
   - TypographyTokens/SpacingTokens: [count]
   - MaterialCommunityIcons invece PlatformIcon: [count]
1. Import inutili: [lista]
2. Hook ridondanti: [lista]
3. Props non usati: [lista]
4. View nativi: [count]
5. Magic colors: [count]
6. Inline styles: [count]
7. Stili inutilizzati: [lista]
8. Props default inutili: [lista]
9. Nesting duplicato: [sì/no]
10. IIFE complessi: [count]
11. Commenti ridondanti: [count]
12. immunity={true}: [count]

## ✅ FIX APPLICATI
1. Import: rimossi X, consolidati Y
2. View → PerfectContainer: X sostituzioni
3. Magic colors → Design Tokens: X fix
4. Inline styles → StyleSheet: X fix
5. Stili rimossi: X inutilizzati
6. Props default rimossi: X
7. Nesting semplificato: X livelli
8. IIFE semplificati: X
9. immunity={false}: X fix
10. Size responsive: aggiunti min/max su X

## 📊 RISULTATO
- Linee codice: [prima] → [dopo] (Δ -X)
- Import: [prima] → [dopo]
- Stili: [prima] → [dopo]
- View nativi: [X] → 0
- Magic colors: [X] → 0
- Inline styles: [X] → 0
- Perfect System: [%]
- TypeScript errors: 0 ✅
- ESLint warnings: 0 ✅
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
