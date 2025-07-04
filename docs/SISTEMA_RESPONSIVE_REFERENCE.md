# SISTEMA RESPONSIVE COMPLETO - REFERENCE GUIDE

## 🎯 OVERVIEW SISTEMA

Il progetto Rise Against Hunger Italia implementa un **Sistema Responsive Bi-Direzionale Universale** che garantisce consistenza assoluta tra iOS e Android.

### Principi Fondamentali
- **Cross-platform consistency**: stesso device = stesso risultato
- **Calcolo basato ESCLUSIVAMENTE su width dispositivo**
- **Dynamic Type iOS disabilitato** per garantire consistenza
- **Zero differenze iOS/Android**

## 📁 FILES CORE DEL SISTEMA

```
src/shared/constants/responsiveSystem.ts  → Sistema responsive principale
src/shared/hooks/useResponsive.ts         → Hook per utilizzo responsive
src/components/ui/FormattedText.tsx       → Text wrapping intelligente
```

## 🔧 BREAKPOINTS UNIVERSALI

```typescript
// Scaling basato SOLO su width - identico iOS e Android
≤375px: scale 0.9   // iPhone SE, piccoli Android
≤414px: scale 1.0   // iPhone standard, Android standard
≤480px: scale 1.15  // iPhone Plus, grandi Android
≤600px: scale 1.25  // Fold, mini tablet
>600px: scale 1.3   // iPad, tablet
```

### Formula Base
```typescript
finalSize = baseSize * scaleBasedOnWidth
```

## 🚀 FUNZIONI PRINCIPALI

### 1. Font Scaling
```typescript
// Utilizzo: fontSize: scaleFont(valore)
scaleFont(60) → iPhone SE: 54px, iPhone 15: 60px, iPad: 78px

// Esempi pratici
fontSize: scaleFont(22)  // Per titoli
fontSize: scaleFont(16)  // Per body text
fontSize: scaleFont(14)  // Per labels
```

### 2. Size e Spacing
```typescript
// 8dp grid system (Google Material Design)
scaleSize(size, type)     // type: 'base' | 'conservative' | 'content'
scaleSpacing(spacing)     // Content-aware spacing

// Esempi
width: scaleSize(200)           // Larghezza responsive
padding: scaleSpacing(16)       // Padding responsive
margin: scaleSpacing(24)        // Margin responsive
```

### 3. Hook Responsive
```typescript
const {
  scaleFont,
  scaleSize, 
  scaleSpacing,
  isCompact,
  isStandard,
  isLarge,
  isXLarge,
  isXXLarge,
  select
} = useResponsive();

// Valori responsive condizionali
const fontSize = select({
  compact: 14,
  standard: 16,
  large: 18,
  xlarge: 20,
  xxlarge: 22,
  default: 16
});
```

## 📱 SISTEMA TEXT WRAPPING

### Modalità Disponibili

| Modalità | Comportamento | Consistenza | Uso |
|----------|---------------|-------------|-----|
| `fixed` | **Righe fisse specificate** | ✅ **Assoluta** | **Layout critici** |
| `auto` | Wrapping intelligente variabile | ❌ Variabile | Testi dinamici |
| `strict` | Righe ottimali calcolate | ⚠️ Semi-consistente | Testi tecnici |
| `flexible` | Adattivo con limiti | ⚠️ Semi-consistente | Testi responsive |
| `none` | Sempre 1 riga | ✅ Consistente | Etichette brevi |

### Utilizzo FormattedText

#### 1. Righe Fisse (RACCOMANDATO per layout critici)
```tsx
<FormattedText 
  wrapMode="fixed" 
  fixedLines={2}
  variant="title-large"
>
  Unisciti a noi nella lotta contro la fame nel mondo
</FormattedText>
```

#### 2. Wrapping Automatico
```tsx
<FormattedText 
  wrapMode="auto"
  variant="body-medium"
>
  Testo che si adatta automaticamente
</FormattedText>
```

#### 3. Nessun Wrapping
```tsx
<FormattedText 
  wrapMode="none"
  variant="label-medium"
>
  Etichetta singola riga
</FormattedText>
```

## 🎨 TYPOGRAPHY TOKENS

```typescript
// Variants disponibili con fontSize responsive
display-large    → scaleFont(57)
display-medium   → scaleFont(45)
display-small    → scaleFont(32)

headline-large   → scaleFont(30)
headline-medium  → scaleFont(28)
headline-small   → scaleFont(24)

title-large      → scaleFont(22)  // Per titoli principali
title-medium     → scaleFont(16)  // Per sottotitoli
title-small      → scaleFont(14)  // Per titoli piccoli

body-large       → scaleFont(16)  // Testo principale
body-medium      → scaleFont(15)  // Testo secondario
body-small       → scaleFont(12)  // Testo piccolo

label-large      → scaleFont(14)  // Labels grandi
label-medium     → scaleFont(12)  // Labels standard
label-small      → scaleFont(11)  // Labels piccole
```

## 🏗️ DESIGN TOKENS (8dp Grid)

```typescript
// Layout tokens
DesignTokens.layout = {
  unit: 8,                    // Base unit
  screenPadding: 16,          // Padding schermo
  sectionSpacing: 24,         // Spacing sezioni
  cardSpacing: 12,            // Spacing card
  dividerSpacing: 8           // Spacing divisori
}

// Component tokens
DesignTokens.components = {
  buttonHeight: {
    compact: 40,              // Bottoni compatti
    standard: 48,             // Bottoni standard
    large: 56                 // Bottoni grandi
  },
  iconSize: {
    small: 20,                // Icone piccole
    medium: 24,               // Icone medie
    large: 32,                // Icone grandi
    xlarge: 40                // Icone extra grandi
  }
}
```

## ⚡ SCALING AUTOMATICO FONT (wrapMode="fixed")

### Come Funziona
Quando usi `wrapMode="fixed"` con `fixedLines`, il sistema:

1. **Calcola automaticamente** il fontSize ottimale
2. **Garantisce** che il testo stia su N righe esatte
3. **Mantiene leggibilità** con limiti 70%-120% del valore base
4. **Funziona identicamente** su iOS e Android

### Algoritmo
```typescript
1. Stima caratteri per riga basata su fontSize e larghezza
2. Calcola caratteri totali necessari per le righe target
3. Riduce iterativamente il font se troppo grande
4. Applica limiti di sicurezza (70%-120% del valore base)
```

### Esempio Pratico
```tsx
// Il sistema calcola automaticamente il fontSize per far stare
// questo testo su esattamente 2 righe su TUTTI i dispositivi
<FormattedText 
  wrapMode="fixed" 
  fixedLines={2}
  variant="title-large"  // Base: scaleFont(22)
>
  Unisciti a noi nella lotta contro la fame nel mondo
</FormattedText>

// Risultato:
// iPhone SE: fontSize calcolato ~19px (ridotto per far stare su 2 righe)
// iPhone 15: fontSize calcolato ~22px (valore base)
// iPad: fontSize calcolato ~26px (aumentato proporzionalmente)
```

## 🎯 BEST PRACTICES

### ✅ QUANDO USARE COSA

#### wrapMode="fixed" + fixedLines
- **Titoli principali** che devono avere layout consistente
- **Card con testi** che devono allinearsi perfettamente
- **Liste uniformi** dove ogni elemento deve avere stessa altezza
- **Layout critici** dove la consistenza è fondamentale

#### wrapMode="auto"
- **Descrizioni lunghe** dove il contenuto varia molto
- **Testi dinamici** da API o database
- **Contenuti editoriali** dove la leggibilità è prioritaria

#### wrapMode="none"
- **Labels e etichette** che devono stare su 1 riga
- **Bottoni** con testo fisso
- **Navigazione** e menu items

### 📏 Numero di Righe Consigliato
```
1 riga  → Titoli, etichette, nomi, bottoni
2 righe → Sottotitoli, descrizioni brevi, card titles
3 righe → Descrizioni medie, abstract, preview text
4+ righe → ⚠️ Sconsigliato (leggibilità compromessa)
```

### 🔧 Responsive Values
```typescript
// Usa select() per valori condizionali
const buttonSize = select({
  compact: 'small',
  standard: 'medium', 
  large: 'large',
  default: 'medium'
});

// Usa renderFor() per rendering condizionale
if (renderFor(['compact', 'standard'])) {
  return <CompactLayout />;
}
```

## 🚨 REGOLE CRITICHE

### ❌ NON FARE MAI
- Non usare fontSize fissi senza scaleFont()
- Non usare padding/margin fissi senza scaleSpacing()
- Non usare allowFontScaling={true} (rompe la consistenza)
- Non mixare wrapMode diversi nello stesso layout critico

### ✅ SEMPRE FARE
- Usa scaleFont() per TUTTI i fontSize
- Usa scaleSpacing() per TUTTI i spacing
- Usa wrapMode="fixed" per layout critici
- Testa sempre su iPhone SE e iPad
- Mantieni fixedLines ≤ 3 per leggibilità

## 🔍 DEBUGGING

### Verifica Consistenza
```typescript
// Controlla breakpoint corrente
const { dimensions } = useResponsive();
console.log('Current breakpoint:', dimensions.breakpoint);
console.log('Device width:', dimensions.width);

// Verifica scaling
console.log('scaleFont(22):', scaleFont(22));
console.log('scaleSpacing(16):', scaleSpacing(16));
```

### Test Cross-Platform
1. **iPhone SE** (375px) - verifica che tutto sia leggibile
2. **iPhone Standard** (414px) - verifica proporzioni base
3. **iPad** (768px+) - verifica che non diventi troppo grande
4. **Android equivalenti** - verifica consistenza

## 📋 CHECKLIST IMPLEMENTAZIONE

### Per Ogni Nuovo Componente
- [ ] Usa scaleFont() per fontSize
- [ ] Usa scaleSpacing() per padding/margin
- [ ] Scegli wrapMode appropriato per FormattedText
- [ ] Testa su almeno 3 breakpoints diversi
- [ ] Verifica consistenza iOS/Android

### Per Layout Critici
- [ ] Usa wrapMode="fixed" con fixedLines
- [ ] Limita fixedLines a max 3
- [ ] Testa scaling automatico font
- [ ] Verifica allineamenti perfetti
- [ ] Controlla su dispositivi estremi

---

**RICORDA**: Il sistema è progettato per garantire **consistenza assoluta** cross-platform. Seguendo queste linee guida, otterrai sempre risultati prevedibili e professionali su tutti i dispositivi.