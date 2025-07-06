# SISTEMA RESPONSIVE UNIVERSALE - BEST PRACTICES ALIGNED
**Rise Against Hunger Italia - Reference Completa v2.0**

---

## 🎯 SISTEMA SEMPLIFICATO - COME GRANDI AZIENDE TECH

### Filosofia Core (Netflix, Airbnb, Uber)
- **fontSize base** → Valore RAW che specifichi (es. 35)
- **scaleFont()** → Applicato AUTOMATICAMENTE una volta sola
- **\n manuale** → Controllo preciso a capo quando necessario
- **fixedLines** → OPZIONALE, solo per controllo preciso layout
- **Flusso naturale** → DEFAULT per 90% del testo

### Cross-Platform Consistency
- **IDENTICO** comportamento su iOS e Android per stessa larghezza
- **PREVEDIBILE**: stessa width = stesso fontSize garantito
- **AUTOMATICO**: un parametro funziona su tutti i dispositivi
- **Dynamic Type iOS disabilitato** per garantire consistenza

## 📁 FILES CORE DEL SISTEMA

```
src/shared/constants/responsiveSystem.ts  → Sistema responsive principale
src/shared/hooks/useResponsive.ts         → Hook per utilizzo responsive
src/components/ui/FormattedText.tsx       → Componente testo intelligente
```

## 🔧 BREAKPOINTS STANDARD INDUSTRIA

Sistema basato su **larghezza dispositivo** (Base: 375px - iPhone 6/7/8):

```typescript
// Breakpoint con fattori di scala
≤375px → scale 0.9   // iPhone SE, piccoli Android
≤414px → scale 1.0   // iPhone standard, Android standard  
≤480px → scale 1.15  // iPhone Plus, grandi Android
≤600px → scale 1.25  // Fold, mini tablet
>600px → scale 1.3   // iPad, tablet
```

### Formula Scaling
```typescript
// Applicato automaticamente
finalSize = baseSize * scaleBasedOnWidth

// Esempio
fontSize: 35 → iPhone SE: 31.5px, iPhone 15: 35px, iPad: 45.5px
```

## 🚀 COMPONENTE FormattedText - BEST PRACTICES

### Utilizzo Standard (95% dei casi)

```tsx
// CASO 1: Flusso naturale (RACCOMANDATO)
<FormattedText variant="body-large">
  Testo che fluisce naturalmente senza vincoli rigidi
</FormattedText>

// CASO 2: Controllo preciso righe + a capo manuale
<FormattedText fontSize={35} fixedLines={2}>
  Rise Against{'\n'}Hunger Italia
</FormattedText>

// CASO 3: Solo variant (usa fontSize predefinito)
<FormattedText variant="headline-large">
  Titolo Importante
</FormattedText>
```

### Props Principali

```typescript
interface FormattedTextProps {
  // Typography
  variant?: TypographyVariant;        // Usa design system tokens
  fontSize?: number;                  // Override manuale (base RAW)
  fontWeight?: FontWeight;            // light → black
  color?: string;                     // Colore testo
  
  // Layout Control
  fixedLines?: number;                // OPZIONALE - righe esatte (1-8)
  
  // System
  allowSystemFontScaling?: boolean;   // default: false
  enforceReadabilityConstraints?: boolean; // default: true
}
```

### Sistema a 2 Livelli

**LIVELLO 1: Scaling Responsive (SEMPRE ATTIVO)**
- `fontSize={40}` → Scala automaticamente per device
- iPhone SE: 36px, iPhone 15: 40px, iPad: 52px

**LIVELLO 2: Fixed Lines (SOLO SE SPECIFICATO)**
- `fixedLines={2}` → Garantisce esattamente 2 righe
- Se il testo scalato non ci sta → riduce ulteriormente
- Mai ingrandisce, solo riduce se necessario

### Variants Typography (Material Design + Apple HIG)

```typescript
// Display (grandi titoli)
'display-large'    → 57px base → scalato automaticamente
'display-medium'   → 45px base → scalato automaticamente
'display-small'    → 32px base → scalato automaticamente

// Headline (titoli sezioni)
'headline-large'   → 30px base → scalato automaticamente
'headline-medium'  → 28px base → scalato automaticamente
'headline-small'   → 24px base → scalato automaticamente

// Title (titoli componenti)
'title-large'      → 22px base → scalato automaticamente
'title-medium'     → 16px base → scalato automaticamente
'title-small'      → 14px base → scalato automaticamente

// Body (testo principale)
'body-large'       → 16px base → scalato automaticamente
'body-medium'      → 15px base → scalato automaticamente
'body-small'       → 12px base → scalato automaticamente

// Label (etichette UI)
'label-large'      → 14px base → scalato automaticamente
'label-medium'     → 12px base → scalato automaticamente
'label-small'      → 11px base → scalato automaticamente
```

## 🎯 BEST PRACTICES - QUANDO USARE COSA

### ✅ USA `variant` QUANDO:
- Vuoi seguire il design system
- Il testo deve fluire naturalmente
- Non serve controllo preciso righe
- Vuoi consistenza con altri testi simili

```tsx
<FormattedText variant="body-large">
  Descrizione completa del progetto che può andare su più righe
</FormattedText>
```

### ✅ USA `fontSize` QUANDO:
- Serve una dimensione specifica non standard
- Vuoi controllo diretto sul valore base
- Stai creando un componente custom

```tsx
<FormattedText fontSize={42}>
  Dimensione custom per caso speciale
</FormattedText>
```

### ✅ USA `fixedLines` QUANDO:
- Layout deve essere matematicamente preciso
- Card devono avere altezza consistente
- Titoli devono stare su N righe esatte
- Controllo preciso del layout

```tsx
<FormattedText fontSize={35} fixedLines={2}>
  Rise Against{'\n'}Hunger Italia
</FormattedText>
```

### ✅ USA `\n` QUANDO:
- Vuoi forzare a capo in punto specifico
- Il design richiede layout preciso
- Controllo manuale delle interruzioni

```tsx
<FormattedText>
  Prima parte{'\n'}Seconda parte{'\n'}Terza parte
</FormattedText>
```

## 🚀 ESEMPI PRATICI COMPLETI

### Esempio 1: Hero Title
```tsx
// Titolo principale con controllo preciso
<FormattedText 
  fontSize={60}      // Base grande per impatto
  fixedLines={2}     // Sempre 2 righe
  fontWeight="bold"
>
  Rise Against{'\n'}Hunger Italia
</FormattedText>
```

### Esempio 2: Card Description
```tsx
// Descrizione con layout consistente
<FormattedText 
  variant="body-medium"
  fixedLines={3}     // Max 3 righe per card uniformi
  color="#666"
>
  {project.description}
</FormattedText>
```

### Esempio 3: CTA Button
```tsx
// Call-to-action sempre su 1 riga
<FormattedText 
  variant="title-medium" 
  fixedLines={1}
  fontWeight="semibold"
  color="#DC2626"
>
  Dona Ora
</FormattedText>
```

### Esempio 4: Flowing Content
```tsx
// Contenuto che fluisce naturalmente
<FormattedText variant="body-large">
  {article.content}
</FormattedText>
```

## 🧠 INTELLIGENZA DEL SISTEMA

### Calcolo Automatico Font Size
Quando usi `fixedLines`, il sistema:
1. Parte dal fontSize scalato per device
2. Stima se il testo sta nelle righe richieste
3. Se non ci sta, riduce proporzionalmente
4. Mantiene leggibilità minima (0.7x del base)

### Esempio Calcolo
```
Testo: "Rise Against Hunger Italia"
fontSize base: 40
Device: iPhone SE (375px)

1. Scaling responsive: 40 × 0.9 = 36px
2. Verifica: sta in 1 riga? NO
3. Riduce: 36px → 32px
4. Risultato: 1 riga a 32px ✅
```

## 🎨 RISULTATO FINALE

Con questo sistema ottieni:
- **App identica** su tutti i dispositivi
- **Testo sempre leggibile** (mai tagliato)
- **Layout matematicamente preciso**
- **Performance ottimale**
- **Codice pulito e manutenibile**

## 📋 CHECKLIST RAPIDA

```tsx
// ✅ CORRETTO - Sistema semplificato
<FormattedText fontSize={35} fixedLines={2}>
  Rise Against{'\n'}Hunger Italia
</FormattedText>

// ❌ SBAGLIATO - Doppio scaling
<FormattedText fontSize={scaleFont(35)}>
  Rise Against Hunger Italia
</FormattedText>

// ✅ CORRETTO - Variant per consistenza
<FormattedText variant="headline-large">
  Titolo Sezione
</FormattedText>

// ✅ CORRETTO - Flusso naturale
<FormattedText variant="body-medium">
  Contenuto lungo che può fluire su più righe naturalmente
</FormattedText>
```

## 🚀 HOOK useResponsive

### Utilizzo Base
```typescript
const {
  // Funzioni scaling
  scaleSize, scaleFont, scaleSpacing,
  
  // Stato device
  breakpoint, deviceWidth,
  
  // Helper
  isCompact, isStandard, isLarge
} = useResponsive();

// Uso
fontSize: scaleFont(20)
padding: scaleSpacing(16)
width: scaleSize(200)
```

### Valori Responsive
```typescript
const fontSize = useResponsiveValue({
  compact: 14,
  standard: 16,
  large: 18
});
```

---

**SISTEMA COMPLETO E ALLINEATO ALLE BEST PRACTICES** 🎯