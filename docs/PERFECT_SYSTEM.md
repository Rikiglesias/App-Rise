# 🎨 Perfect System - Documentazione Completa

## 📋 Indice

1. [Cos'è il Perfect System](#cosè-il-perfect-system)
2. [Componenti Perfect](#componenti-perfect)
3. [Sistema Scaling](#sistema-scaling)
4. [Design Tokens](#design-tokens)
5. [Best Practices](#best-practices)
6. [Esempi Pratici](#esempi-pratici)

---

## Cos'è il Perfect System

Il **Perfect System** è un sistema di design unificato che garantisce **UI consistente e scalabile** su tutti i dispositivi iOS e Android, da iPhone SE a iPad Pro.

### Obiettivi

✅ **Consistenza visiva** - Stessa percezione su ogni device  
✅ **Zero valori hardcoded** - Tutto scala proporzionalmente  
✅ **Manutenibilità** - Modifica centralizzata dei valori  
✅ **Performance** - Calcoli ottimizzati e memorizzati  

---

## Componenti Perfect

### PerfectText

Testo che scala automaticamente su tutti i device.

```tsx
import { PerfectText } from '@/components/ui';

<PerfectText
  size={20}              // Font size (reference iPhone 15)
  lines={2}              // Max linee
  fontWeight="700"       // Peso font
  color="#000000"        // Colore (preferisci Colors.neutral[900])
>
  Testo esempio
</PerfectText>
```

**Props principali:**
- `size` (required): Font size su iPhone 15 (viene scalato automaticamente)
- `lines` (required): Numero massimo di righe (ellipsis se supera)
- `containerWidth` (optional): Width custom (default 90% schermo)
- `maxSize`/`minSize` (optional): Limiti min/max per scaling
- `fontWeight`: '400' | '500' | '600' | '700' | '900'

**Scaling automatico:**
```
iPhone SE:  size={20} → 16.6px (0.83x)
iPhone 15:  size={20} → 20px   (1.0x)
iPad Mini:  size={20} → 27.2px (1.36x)
```

---

### PerfectContainer

Container che scala spacing e dimensioni.

```tsx
import { PerfectContainer } from '@/components/ui';

<PerfectContainer
  padding={20}           // Scala automaticamente
  margin={16}            // Scala automaticamente
  borderRadius={12}      // Scala automaticamente
  flex={1}
  flexDirection="row"
>
  {children}
</PerfectContainer>
```

**Props scalabili automaticamente:**
- `padding`, `paddingVertical`, `paddingHorizontal`
- `margin`, `marginVertical`, `marginHorizontal`
- `borderRadius`
- `width`, `height` (se numerici)
- `gap`

**Preset disponibili:**
- `page`: Container pagina completa
- `section`: Sezione con spacing standard
- `card`: Card con padding e bordi
- `modal`: Container modal

---

### PerfectImage

Immagini scalate proporzionalmente.

```tsx
import { PerfectImage } from '@/components/ui';

<PerfectImage
  width={393}            // Width su iPhone 15
  height={432}           // Height su iPhone 15
  borderRadius={24}      // Bordi arrotondati
  source={require('./image.png')}
/>
```

**Scala automaticamente** mantenendo aspect ratio.

---

## Sistema Scaling

### scale()

Funzione core per scaling basato su diagonale schermo.

```tsx
import { scale } from '@/shared/constants/perfectScale';

const scaledValue = scale(20);  // 20px su iPhone 15
```

**Come funziona:**
1. Calcola diagonale schermo device (Teorema Pitagora)
2. Calcola diagonale reference (iPhone 15: 938.27px)
3. Ritorna: `value * (diagonalDevice / diagonalReference)`

**Esempi:**
```typescript
// iPhone SE (375x667)
scale(100) → 83px

// iPhone 15 (393x852) - REFERENCE
scale(100) → 100px

// iPad Mini (768x1024)
scale(100) → 136px
```

**Quando usare:**
- ✅ Dimensioni fisse (width, height, borderRadius)
- ✅ Spacing custom non da Spacing tokens
- ✅ Icon size custom
- ❌ NON nei componenti Perfect (scalano già internamente)

---

### LOGICAL_REFERENCE

Costanti di riferimento (iPhone 15).

```typescript
import { LOGICAL_REFERENCE } from '@/shared/constants/perfectScale';

LOGICAL_REFERENCE.width   // 393px
LOGICAL_REFERENCE.height  // 852px
LOGICAL_REFERENCE.scale   // 2
```

**Uso comune:**
```tsx
// Calcolare width percentuale
containerWidth={LOGICAL_REFERENCE.width * 0.7}  // 70% schermo

// Calcolare proporzioni
height={LOGICAL_REFERENCE.width * 1.1}  // 1.1x width
```

---

## Design Tokens

### Colors

```typescript
import { Colors } from '@/shared/constants/designTokens';

Colors.primary[600]   // Rosso principale (#DC2626)
Colors.neutral[0]     // Bianco (#FFFFFF)
Colors.neutral[900]   // Nero (#111827)
```

**Palette completa:**
- `primary`: Rosso brand (50-900)
- `neutral`: Grigi (0-900)
- `success`: Verde (50-900)
- `warning`: Giallo (50-900)
- `error`: Rosso errore (50-900)

---

### Spacing

```typescript
import { Spacing } from '@/shared/constants/designTokens';

Spacing[0]   // 0px
Spacing[1]   // 4px
Spacing[2]   // 8px
Spacing[3]   // 12px
Spacing[4]   // 16px
Spacing[5]   // 20px
Spacing[6]   // 24px
// ...fino a Spacing[12] (48px)
```

**Scalano automaticamente** quando usati nei Perfect components!

---

### BorderRadius

```typescript
import { BorderRadius } from '@/shared/constants/designTokens';

BorderRadius.sm   // 8px
BorderRadius.md   // 12px
BorderRadius.lg   // 16px
BorderRadius.xl   // 20px
BorderRadius.full // 9999px (cerchio)
```

---

### Shadows

```typescript
import { Shadows } from '@/shared/constants/designTokens';

// Usa spread operator negli styles
const styles = StyleSheet.create({
  card: {
    ...Shadows.sm,   // Ombra leggera
    ...Shadows.md,   // Ombra media
    ...Shadows.lg,   // Ombra forte
  },
});
```

**Scalano automaticamente** e sono cross-platform (iOS shadowOffset/Android elevation).

---

## Best Practices

### ✅ DO

```tsx
// 1. Usa componenti Perfect
<PerfectText size={20}>Testo</PerfectText>
<PerfectContainer padding={16}>...</PerfectContainer>

// 2. Usa Design Tokens
backgroundColor: Colors.primary[600]
marginBottom: Spacing[4]
borderRadius: BorderRadius.xl

// 3. Usa scale() per valori custom
width: scale(140)
top: scale(-10)

// 4. Usa spread per shadows
...Shadows.md
```

### ❌ DON'T

```tsx
// 1. NO valori hardcoded
<Text style={{ fontSize: 20 }}>Testo</Text>  // ❌
padding: 16                                    // ❌

// 2. NO colori hex diretti
backgroundColor: '#DC2626'  // ❌

// 3. NO shadow properties manuali
shadowOffset: { width: 0, height: 2 }  // ❌

// 4. NO import scale in file app (usa componenti Perfect)
import { scale } from 'responsiveSystem'  // ❌ (file non esiste più)
```

---

## Esempi Pratici

### Card con testo

```tsx
<PerfectContainer
  padding={Spacing[4]}
  margin={Spacing[2]}
  borderRadius={BorderRadius.xl}
  backgroundColor={Colors.neutral[0]}
  style={Shadows.md}
>
  <PerfectText
    size={24}
    lines={1}
    fontWeight="700"
    color={Colors.primary[600]}
  >
    Titolo
  </PerfectText>
  
  <PerfectText
    size={16}
    lines={3}
    color={Colors.neutral[700]}
  >
    Descrizione del contenuto della card
  </PerfectText>
</PerfectContainer>
```

### Button custom

```tsx
<PerfectContainer
  paddingVertical={Spacing[3]}
  paddingHorizontal={Spacing[6]}
  borderRadius={BorderRadius.full}
  backgroundColor={Colors.primary[600]}
  style={Shadows.lg}
>
  <PerfectText
    size={18}
    lines={1}
    fontWeight="700"
    color={Colors.neutral[0]}
  >
    Dona Ora
  </PerfectText>
</PerfectContainer>
```

### Modal con backdrop

```tsx
const styles = StyleSheet.create({
  modalContainer: {
    borderRadius: BorderRadius.xl,
    padding: scale(3),
    backgroundColor: Colors.neutral[0],
    ...Shadows.lg,
  },
  closeButton: {
    position: 'absolute',
    top: scale(-10),
    right: scale(-10),
    width: scale(36),
    height: scale(36),
    borderRadius: scale(18),
    backgroundColor: Colors.primary[600],
    ...Shadows.md,
  },
});
```

---

## FAQ

### Quando usare `scale()` direttamente?

Solo per valori **custom** che non sono copri da design tokens:
- Position offsets negativi: `scale(-10)`
- Dimensioni icon custom: `scale(28)`
- Width/height specifici: `scale(140)`

### containerWidth in PerfectText serve sempre?

NO! Il default (90% schermo) va bene nella maggior parte dei casi.
Usa `containerWidth` solo se serve una larghezza specifica.

### Come gestire tablet?

Il Perfect System scala automaticamente! Non serve codice specifico.
Su tablet tutto è proporzionalmente più grande.

### Posso mescolare Perfect e componenti nativi?

Sì, ma preferisci sempre Perfect components quando disponibili.
I componenti nativi (`View`, `Text`) NON scalano automaticamente.

---

## Changelog

### v2.0 (Ottobre 2025)
- ✅ Unificato responsiveSystem → perfectScale
- ✅ Eliminato scaling manuale duplicato
- ✅ Aggiunto Shadows tokens
- ✅ Migliorato PerfectText width logic

### v1.0
- ✅ Creazione Perfect System
- ✅ PerfectText, PerfectContainer, PerfectImage
- ✅ Design Tokens (Colors, Spacing, BorderRadius)

---

**Perfect System garantisce UI perfetta su ogni device! 🎨**
