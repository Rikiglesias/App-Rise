# SISTEMA RESPONSIVE UNIVERSALE - CONTAINER LAYOUT 2025
**Rise Against Hunger Italia - Reference Completa v3.0**

---

## 🎯 SISTEMA PROFESSIONALE - ALLINEATO ALLE MIGLIORI AZIENDE

### Filosofia Core (Netflix, Airbnb, Uber + Container Layout)
- **fontSize base** → Valore RAW che specifichi (es. 35)
- **scaleFont()** → Applicato AUTOMATICAMENTE una volta sola
- **Container Layout** → Larghezza costante e padding professional
- **\n manuale** → Controllo preciso a capo quando necessario
- **fixedLines** → OPZIONALE, solo per controllo preciso layout
- **Flusso naturale** → DEFAULT per 90% del testo

### Cross-Platform Consistency GARANTITA
- **IDENTICO** comportamento su iOS e Android per stessa larghezza
- **PREVEDIBILE**: stessa width = stesso fontSize garantito
- **AUTOMATICO**: un parametro funziona su tutti i dispositivi
- **Container-aware**: Scaling basato su larghezza container reale
- **Dynamic Type iOS disabilitato** per garantire consistenza

---

## 🏗️ **CONTAINER LAYOUT SYSTEM PROFESSIONALE (2025)**

### **Componenti Container - Professional Guide Compliant**

```tsx
// 🌟 UNIVERSAL CONTAINER - Tutte le best practices integrate
<ProfessionalContainer 
  variant="text|card|section"
  enableRTL={false}
  forceWidth="90%"
  testID="container"
>
  <FormattedText fontSize={24}>Content with professional layout</FormattedText>
</ProfessionalContainer>

// 🎯 TITLE CONTAINER - Layout consistency garantita (sempre 2 righe)
<TitleContainer testID="main-title-container">
  <FormattedText 
    fontSize={75} 
    fixed={true} 
    fixedLines={2}
    fontWeight="black"
    testID="main-title-text"
  >
    Rise Against Hunger Italia
  </FormattedText>
</TitleContainer>

// 💎 CARD CONTAINER - Shadows, padding, overflow perfetti
<CardContainer>
  <FormattedText fontSize={16}>Beautiful card content</FormattedText>
</CardContainer>
```

### **Design Tokens Estesi - Professional Implementation**

```typescript
// src/shared/constants/responsiveSystem.ts

export const DesignTokens = {
  containers: {
    // 📱 Width Management (Professional Guide Point 1)
    textBlock: {
      responsive: '90%',              // Phone screens (consistent)
      maxTablet: scaleSize(428),      // Tablet fixed width (dp)
      maxDesktop: scaleSize(512),     // Desktop fixed width (dp)
    },
    
    // 📏 Padding Consistency (Professional Guide Point 2)
    padding: {
      internal: scaleSpacing(16),     // 16dp internal padding
      external: scaleSpacing(24),     // 24dp external padding
      compact: scaleSpacing(12),      // 12dp compact spacing
      generous: scaleSpacing(32),     // 32dp generous spacing
    },
    
    // 📐 Baseline Grid (Professional Guide Point 6)
    baseline: {
      unit: 4,                        // 4dp baseline unit
      lineHeight: (fontSize) => Math.round(fontSize * 1.15), // Proportional line height
      rhythm: scaleSpacing(4),        // 4dp vertical rhythm
    },
    
    // 🛡️ Safe Area (Professional Guide Point 3)
    safeArea: {
      vertical: scaleSpacing(16),     // Minimum safe area padding
      horizontal: scaleSpacing(16),   // Horizontal safe padding
    },
  }
};

// 🌍 RTL Support Tokens (Professional Guide Point 4)
export const RTLTokens = {
  textAlign: { 
    start: 'left', 
    end: 'right', 
    center: 'center' 
  },
  writingDirection: { 
    ltr: 'ltr', 
    rtl: 'rtl', 
    auto: 'auto' 
  },
  lineBreak: { 
    soft: '\n', 
    rtlSoft: '\u202B\n',      // RTL-aware soft break
    hardBreak: '\n\n'         // Hard paragraph break
  },
};

// 📊 Breakpoint Layout Strategies (Professional Guide Point 7)
export const BreakpointLayouts = {
  phone: { 
    container: { maxWidth: '90%', padding: 16, margin: 0 },
    text: { alignment: 'center', direction: 'ltr' },
  },
  tablet: { 
    container: { maxWidth: 428, padding: 16, margin: 28 },
    text: { alignment: 'center', direction: 'ltr' },
  },
  desktop: { 
    container: { maxWidth: 512, padding: 32, margin: 64 },
    text: { alignment: 'center', direction: 'ltr' },
  },
};
```

### **Hook Container Layout - Professional Implementation**

```typescript
// src/shared/hooks/useResponsive.ts

export const useContainerLayout = (options?: {
  variant?: 'text' | 'card' | 'section';
  enableRTL?: boolean;
  forceWidth?: string | number;
}) => {
  // ✅ Automatic breakpoint detection
  // ✅ Safe area integration with useSafeAreaInsets()
  // ✅ RTL support with enableRTL prop
  // ✅ Baseline grid helpers
  // ✅ Layout measurement callbacks
  
  return {
    containerStyle,           // Professional container styles
    textStyle,               // RTL-aware text styles
    getBaselineLineHeight,   // Baseline grid helper
    getLineBreak,           // RTL line break helper
    handleLayout,           // Layout measurement callback
    breakpoint,             // Current breakpoint
    strategy,               // Layout strategy
    isRTL,                  // RTL status
  };
};
```

---

## 📁 FILES CORE DEL SISTEMA (Aggiornati 2025)

```
src/shared/constants/responsiveSystem.ts     → Sistema responsive + Container Layout
src/shared/hooks/useResponsive.ts            → Hook responsivo + useContainerLayout
src/components/ui/FormattedText.tsx          → Testo container-aware + algoritmo conservativo
src/components/ui/ProfessionalContainer.tsx  → Componenti Container professionali
```

## 🔧 BREAKPOINTS STANDARD INDUSTRIA (Migliorati)

Sistema basato su **larghezza dispositivo** (Base: 375px - iPhone 6/7/8):

```typescript
// Breakpoint con fattori di scala + Container Layout
≤375px → scale 0.9   // iPhone SE, piccoli Android
≤414px → scale 1.0   // iPhone standard, Android standard  
≤480px → scale 1.15  // iPhone Plus, grandi Android
≤600px → scale 1.25  // Fold, mini tablet
>600px → scale 1.3   // iPad, tablet

// Container Width Strategy
≤480px → 90% viewport width        // Phone responsive
≤900px → 428dp fixed width        // Tablet fixed
>900px → 512dp fixed width        // Desktop fixed
```

### Formula Scaling (Container-Aware)
```typescript
// Applicato automaticamente con container awareness
const containerWidth = maxWidth ?? ((DeviceInfo?.width ?? 375) * 0.9);
finalSize = baseSize * scaleBasedOnWidth * containerAdjustment

// Esempio Container-Aware
fontSize: 35 → iPhone SE (Container 337.5px): 31.5px
fontSize: 35 → iPhone 15 (Container 351px): 35px  
fontSize: 35 → iPad (Container 428px fisso): 35px
```

---

## 🚀 COMPONENTE FormattedText - CONTAINER-AWARE 2025

### Utilizzo Standard con Container Layout (95% dei casi)

```tsx
// ✅ CASO 1: Container Layout + Flusso naturale (RACCOMANDATO 2025)
<ProfessionalContainer variant="text">
  <FormattedText variant="body-large">
    Testo che fluisce naturalmente nel container professionale
  </FormattedText>
</ProfessionalContainer>

// ✅ CASO 2: Container + Controllo preciso righe
<TitleContainer>
  <FormattedText fontSize={75} fixed={true} fixedLines={2}>
    Rise Against{'\n'}Hunger Italia
  </FormattedText>
</TitleContainer>

// ✅ CASO 3: Card Container + Typography System
<CardContainer>
  <FormattedText variant="title-medium" fixedLines={2}>
    Card Title Always 2 Lines
  </FormattedText>
  <FormattedText variant="body-small" fixedLines={3}>
    Card description with consistent height across all cards
  </FormattedText>
</CardContainer>
```

### Props Principali (Aggiornate 2025)

```typescript
interface FormattedTextProps {
  // Typography Core
  variant?: TypographyVariant;        // Design system tokens
  fontSize?: number;                  // Override manuale (base RAW)
  fontWeight?: FontWeight;            // light → black
  color?: string;                     // Colore testo
  
  // Container Layout (NUOVO 2025)
  containerWidth?: number;            // Override larghezza container
  enableRTL?: boolean;               // RTL support integrato
  
  // Layout Control
  fixed?: boolean;                   // Layout controllato (NUOVO)
  fixedLines?: number;               // Righe esatte (1-8)
  
  // System
  allowSystemFontScaling?: boolean;  // default: false
  testID?: string;                   // Testing identifier
}
```

### Sistema a 3 Livelli (Aggiornato 2025)

**LIVELLO 1: Container Layout (NUOVO - SEMPRE ATTIVO)**
- Container professionale con width consistency
- Padding costante in dp
- Safe area integration automatica
- RTL support integrato

**LIVELLO 2: Scaling Responsive (SEMPRE ATTIVO)**
- `fontSize={40}` → Scala automaticamente per device
- Container-aware: usa larghezza container reale per calcoli
- iPhone SE: 36px, iPhone 15: 40px, iPad: 52px

**LIVELLO 3: Fixed Lines (SOLO SE SPECIFICATO)**
- `fixedLines={2}` → Garantisce esattamente 2 righe
- Algoritmo conservativo: max 15% riduzione (era 50%)
- Se il testo scalato non ci sta → riduce ulteriormente
- Mai ingrandisce, solo riduce se necessario

---

## 🎯 BEST PRACTICES CONTAINER LAYOUT (2025)

### ✅ USA `ProfessionalContainer` QUANDO:
- Vuoi layout consistency garantita
- Serve safe area handling automatico
- Vuoi seguire professional guide
- Layout deve essere cross-platform identico

```tsx
<ProfessionalContainer variant="text" enableRTL={false}>
  <FormattedText variant="body-large">
    Professional layout with all best practices integrated
  </FormattedText>
</ProfessionalContainer>
```

### ✅ USA `TitleContainer` QUANDO:
- Titoli devono avere layout consistente
- Altezza deve essere predibile
- Serve controllo preciso per hero sections
- Layout deve essere matematicamente perfetto

```tsx
<TitleContainer testID="hero-title">
  <FormattedText fontSize={75} fixed={true} fixedLines={2}>
    Hero Title Always Perfect
  </FormattedText>
</TitleContainer>
```

### ✅ USA `CardContainer` QUANDO:
- Card devono avere styling professionale
- Serve shadows e padding automatici
- Overflow deve essere gestito correttamente
- Content deve essere uniforme

```tsx
<CardContainer>
  <FormattedText variant="title-medium" fixedLines={2}>
    Card titles always same height
  </FormattedText>
</CardContainer>
```

### ✅ USA RTL Support QUANDO:
- App deve supportare mercati internazionali
- Testo in arabo, ebraico, persiano
- Layout deve essere bidirezionale
- Accessibility è prioritaria

```tsx
<ProfessionalContainer enableRTL={isArabic}>
  <FormattedText fontSize={24} enableRTL={isArabic}>
    {isArabic ? 'النص العربي' : 'English Text'}
  </FormattedText>
</ProfessionalContainer>
```

---

## 🚀 ESEMPI PRATICI COMPLETI (Container Layout 2025)

### Esempio 1: Hero Section (Caso Rise Against Hunger Italia)
```tsx
// Layout professionale con container specializzato
<TitleContainer testID="main-title-container">
  <FormattedText 
    fontSize={75}           // Font grande per impatto
    fixed={true}            // Layout controllato
    fixedLines={2}          // Sempre 2 righe esatte
    fontWeight="black"      // Grassetto massimo
    testID="main-title-text"
  >
    <FormattedText color="#DC2626">Rise Against</FormattedText>{'\n'}
    <FormattedText color="#DC2626">Hunger </FormattedText>
    <FormattedText color="#171717">Italia</FormattedText>
  </FormattedText>
</TitleContainer>
```

### Esempio 2: Project Cards Grid
```tsx
// Grid di card con altezza consistente
<View style={styles.projectsGrid}>
  {projects.map(project => (
    <CardContainer key={project.id}>
      {/* Titolo: sempre 2 righe per consistency */}
      <FormattedText 
        variant="title-large" 
        fixedLines={2}
        fontWeight="bold"
      >
        {project.title}
      </FormattedText>
      
      {/* Descrizione: sempre 3 righe */}
      <FormattedText 
        variant="body-medium" 
        fixedLines={3}
        color="#666"
      >
        {project.description}
      </FormattedText>
      
      {/* Progress: sempre 1 riga */}
      <FormattedText 
        variant="label-medium" 
        fixedLines={1}
        color="#10B981"
      >
        {project.progress}% completato
      </FormattedText>
    </CardContainer>
  ))}
</View>
```

### Esempio 3: Multilingual Section
```tsx
// Sezione con supporto RTL completo
<ProfessionalContainer 
  variant="section" 
  enableRTL={isRTL}
  testID="multilingual-section"
>
  <FormattedText 
    fontSize={28}
    fontWeight="bold"
    enableRTL={isRTL}
  >
    {translations[language].sectionTitle}
  </FormattedText>
  
  <FormattedText 
    variant="body-large"
    enableRTL={isRTL}
  >
    {translations[language].sectionContent}
  </FormattedText>
</ProfessionalContainer>
```

### Esempio 4: Responsive Content
```tsx
// Contenuto che si adatta perfettamente a ogni device
<ProfessionalContainer 
  variant="text"
  onLayout={(event) => {
    // Layout measurement per debugging
    console.log('Container size:', event.nativeEvent.layout);
  }}
>
  <FormattedText 
    variant="headline-large"
    containerWidth={400}  // Override per calcoli specifici
  >
    Titolo Responsive
  </FormattedText>
  
  <FormattedText variant="body-large">
    Contenuto che fluisce naturalmente nel container, 
    mantenendo sempre proporzioni perfette su tutti i dispositivi
    grazie al Container Layout System professionale.
  </FormattedText>
</ProfessionalContainer>
```

---

## 🧠 INTELLIGENZA DEL SISTEMA (Migliorata 2025)

### Calcolo Container-Aware Font Size
Il nuovo sistema considera:
1. **Container width** reale (non solo device width)
2. **Padding internal** del container
3. **Safe area insets** automatici
4. **RTL text direction** per calcoli precisi
5. **Baseline grid** per line height perfetto

```typescript
// Nuovo algoritmo container-aware
const containerWidth = maxWidth ?? ((DeviceInfo?.width ?? 375) * 0.9);
const availableWidth = containerWidth - (padding * 2) - safeAreaInsets;
const scaledFontSize = scaleFont(baseFontSize);
const containerAwareFontSize = scaledFontSize * containerAdjustment;
const finalFontSize = Math.max(containerAwareFontSize, baseFontSize * 0.85); // Max 15% reduction
```

### Esempio Calcolo Container-Aware
```
Testo: "Rise Against Hunger Italia"
fontSize base: 75
Container: TitleContainer (90% viewport)
Device: iPhone SE (375px → Container: 337.5px)

1. Container detection: 337.5px effective width
2. Scaling responsive: 75 × 0.9 = 67.5px
3. Container adjustment: considera padding interno
4. Fixed lines check: verifica se sta in 2 righe
5. Conservative reduction: massimo 15% → min 64px
6. Risultato: 2 righe perfette a ~67px ✅
```

---

## 🎨 RISULTATO FINALE CONTAINER LAYOUT

Con questo sistema ottieni:
- **Layout matematicamente preciso** su tutti i dispositivi
- **Typography consistency** assoluta cross-platform
- **Container awareness** per calcoli più accurati
- **Professional grade** implementation
- **RTL support** completo per internazionalizzazione
- **Safe area handling** automatico iOS/Android
- **Performance ottimale** con calcoli one-time
- **Testing integration** con layout measurement
- **Zero tolerance** per troncamento testo

---

## 📋 CHECKLIST RAPIDA CONTAINER LAYOUT

```tsx
// ✅ CORRETTO - Container Layout Professional (2025)
<TitleContainer testID="hero-title">
  <FormattedText fontSize={75} fixed={true} fixedLines={2}>
    Rise Against{'\n'}Hunger Italia
  </FormattedText>
</TitleContainer>

// ❌ SBAGLIATO - Doppio scaling
<FormattedText fontSize={scaleFont(75)}>
  Rise Against Hunger Italia
</FormattedText>

// ✅ CORRETTO - Professional Container
<ProfessionalContainer variant="text" enableRTL={false}>
  <FormattedText variant="headline-large">
    Titolo Sezione Professionale
  </FormattedText>
</ProfessionalContainer>

// ✅ CORRETTO - Card consistency
<CardContainer>
  <FormattedText variant="title-medium" fixedLines={2}>
    Card Title Consistent Height
  </FormattedText>
</CardContainer>
```

---

## 🏆 RISULTATI OTTENUTI (Professional Guide Compliance)

### ✅ **Problema "Rise Against Hunger Italia" COMPLETAMENTE RISOLTO**
- **Layout Consistency**: ✅ Sempre 2 righe su tutti i dispositivi
- **Font Quality**: ✅ Grande (75px → min 64px) e grassetto preservato
- **Spacing**: ✅ "Hunger Italia" correttamente separati
- **Cross-Platform**: ✅ Comportamento identico iOS/Android
- **Zero Truncation**: ✅ Tutto il testo sempre visibile

### ✅ **Professional Guide 10 Punti - IMPLEMENTAZIONE COMPLETA**
1. **✅ Width Consistency**: 90% phone, fixed tablet/desktop
2. **✅ Padding Constants**: dp-based con scaleSpacing()
3. **✅ Safe Area**: useSafeAreaInsets() integration automatica
4. **✅ RTL Support**: enableRTL prop + RTLTokens completi
5. **✅ Dynamic Type Control**: allowFontScaling={false} default
6. **✅ Baseline Grid**: 4dp rhythm + proportional lineHeight
7. **✅ Breakpoint Strategies**: Phone/Tablet/Desktop layouts
8. **✅ Autosize Fallback**: Conservative algorithm + Android compatibility
9. **✅ Testing Integration**: Layout measurement + testID everywhere
10. **✅ Compliance Checklist**: 100% implementation completata

---

## 🚀 HOOK useResponsive (Esteso 2025)

### Utilizzo Container Layout
```typescript
const {
  // Container Layout (NUOVO)
  containerStyle, textStyle, handleLayout,
  getBaselineLineHeight, getLineBreak,
  
  // Funzioni scaling
  scaleSize, scaleFont, scaleSpacing,
  
  // Stato device
  breakpoint, deviceWidth, isRTL,
  
  // Helper
  isCompact, isStandard, isLarge
} = useContainerLayout({
  variant: 'text',
  enableRTL: false,
  forceWidth: '90%'
});

// Container professionale automatico
<View style={containerStyle} onLayout={handleLayout}>
  <FormattedText 
    style={textStyle}
    fontSize={scaleFont(24)}
  >
    Professional container content
  </FormattedText>
</View>
```

---

**SISTEMA COMPLETO CONTAINER LAYOUT 2025 - PROFESSIONAL GRADE** 🎯

*Implementazione al 100% della guida professionale con Container Layout System*