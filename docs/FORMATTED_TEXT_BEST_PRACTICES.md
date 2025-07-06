# 📝 FORMATTED TEXT - BEST PRACTICES GUIDE
**Sistema Semplificato v2.0 - Allineato alle Grandi Aziende Tech**

## 🎯 FILOSOFIA CORE

Il sistema segue le best practices di **Netflix, Airbnb, Uber** per un'esperienza utente ottimale:

1. **Semplicità**: Un componente, comportamento prevedibile
2. **Flessibilità**: Controllo preciso solo quando necessario
3. **Performance**: Calcoli ottimizzati, zero ridondanze
4. **Consistenza**: Stesso risultato su tutti i dispositivi

## 🔄 SISTEMA A 2 LIVELLI

### LIVELLO 1: Scaling Responsive (SEMPRE ATTIVO)
```tsx
<FormattedText fontSize={40}>
  Testo
</FormattedText>
```

**Risultato automatico:**
- iPhone SE (375px): 40 × 0.9 = **36px**
- iPhone 15 (390px): 40 × 1.0 = **40px**
- iPad (768px): 40 × 1.3 = **52px**

### LIVELLO 2: Fixed Lines (OPZIONALE - 5% dei casi)
```tsx
<FormattedText fontSize={40} fixedLines={2}>
  Rise Against{'\n'}Hunger Italia
</FormattedText>
```

**Comportamento:**
1. Parte dal font già scalato (36px, 40px, 52px)
2. Verifica se sta in 2 righe
3. Se non ci sta → riduce proporzionalmente
4. Garantisce SEMPRE 2 righe esatte

## ✅ QUANDO USARE COSA

### 🌊 FLUSSO NATURALE (Default - 90% dei casi)
```tsx
<FormattedText variant="body-large">
  Contenuto che può fluire liberamente su più righe
  in base alla larghezza del dispositivo
</FormattedText>
```

**Usa quando:**
- Testo di articoli, descrizioni lunghe
- Contenuto dinamico variabile
- Non serve controllo preciso layout

### 📐 CONTROLLO PRECISO (10% dei casi)
```tsx
<FormattedText fontSize={35} fixedLines={1}>
  ⚡ Entra in Azione
</FormattedText>
```

**Usa quando:**
- Titoli che devono stare su N righe esatte
- Card che devono avere altezza uniforme
- Layout matematicamente preciso
- CTA che non devono mai andare a capo

### 🎨 DESIGN SYSTEM (Consistenza)
```tsx
<FormattedText variant="headline-large">
  Titolo Sezione
</FormattedText>
```

**Usa quando:**
- Vuoi seguire il design system
- Serve consistenza con altri testi simili
- Non serve dimensione custom

## 📊 CONFRONTO APPROCCI

| Approccio | Pro | Contro | Quando Usare |
|-----------|-----|--------|--------------|
| **Solo variant** | Consistenza design | Meno controllo | Testi standard |
| **Solo fontSize** | Controllo preciso | Meno consistenza | Casi speciali |
| **fontSize + fixedLines** | Controllo totale | Più complesso | Layout critici |
| **variant + fixedLines** | Best of both | - | Titoli importanti |

## 🎯 ESEMPI PRATICI PER CASO D'USO

### 📱 Hero Section
```tsx
// Titolo principale con impatto visivo
<FormattedText 
  fontSize={60}      // Grande per impatto
  fixedLines={2}     // Sempre 2 righe
  fontWeight="bold"
>
  Rise Against{'\n'}Hunger Italia
</FormattedText>

// Sottotitolo descrittivo
<FormattedText 
  variant="headline-medium"
  color="#666"
>
  Tutto comincia da un pasto
</FormattedText>
```

### 🃏 Project Card
```tsx
// Titolo card
<FormattedText 
  variant="title-large"
  fixedLines={2}     // Altezza consistente
  fontWeight="semibold"
>
  {project.title}
</FormattedText>

// Descrizione card
<FormattedText 
  variant="body-medium"
  fixedLines={3}     // Max 3 righe
  color="#666"
>
  {project.description}
</FormattedText>

// Progress label
<FormattedText 
  variant="label-small"
  color="#10B981"
>
  {project.progress}% completato
</FormattedText>
```

### 🔘 Buttons & CTA
```tsx
// Primary button
<FormattedText 
  variant="title-medium"
  fixedLines={1}     // Mai a capo
  fontWeight="bold"
  color="#FFF"
>
  Dona Ora
</FormattedText>

// Secondary button
<FormattedText 
  fontSize={16}
  fixedLines={1}
  fontWeight="medium"
>
  Scopri di più
</FormattedText>
```

### 📄 Content Areas
```tsx
// Article content
<FormattedText variant="body-large">
  {article.content}
</FormattedText>

// Quote
<FormattedText 
  variant="body-large"
  fontWeight="light"
  style={{ fontStyle: 'italic' }}
>
  "{quote.text}"
</FormattedText>

// Caption
<FormattedText 
  variant="body-small"
  color="#666"
>
  Foto di {photo.author}
</FormattedText>
```

## ⚠️ ERRORI COMUNI DA EVITARE

### ❌ DOPPIO SCALING
```tsx
// SBAGLIATO
<FormattedText fontSize={scaleFont(35)}>
  Testo
</FormattedText>

// CORRETTO
<FormattedText fontSize={35}>
  Testo
</FormattedText>
```

### ❌ FIXED LINES SU TUTTO
```tsx
// SBAGLIATO - Troppo rigido
<FormattedText variant="body-large" fixedLines={5}>
  {longArticle}
</FormattedText>

// CORRETTO - Flusso naturale
<FormattedText variant="body-large">
  {longArticle}
</FormattedText>
```

### ❌ VARIANT E FONTSIZE INSIEME
```tsx
// SBAGLIATO - Conflitto
<FormattedText variant="title-large" fontSize={30}>
  Titolo
</FormattedText>

// CORRETTO - Scegli uno
<FormattedText variant="title-large">
  Titolo
</FormattedText>
// O
<FormattedText fontSize={30}>
  Titolo
</FormattedText>
```

## 📏 TABELLA RIFERIMENTO RAPIDO

### Typography Variants
| Variant | Base Size | Use Case |
|---------|-----------|----------|
| **display-large** | 57px | Hero titles |
| **display-medium** | 45px | Page titles |
| **display-small** | 32px | Section titles |
| **headline-large** | 30px | Major headings |
| **headline-medium** | 28px | Subheadings |
| **headline-small** | 24px | Minor headings |
| **title-large** | 22px | Component titles |
| **title-medium** | 16px | Card titles |
| **title-small** | 14px | List items |
| **body-large** | 16px | Main content |
| **body-medium** | 15px | Secondary content |
| **body-small** | 12px | Captions |
| **label-large** | 14px | Buttons |
| **label-medium** | 12px | Tags |
| **label-small** | 11px | Micro labels |

### Font Weights
| Weight | Value | Use Case |
|--------|-------|----------|
| **light** | 300 | Quotes, decorative |
| **regular** | 400 | Body text |
| **medium** | 500 | Emphasis |
| **semibold** | 600 | Subheadings |
| **bold** | 700 | Headings |
| **extrabold** | 800 | Hero text |
| **black** | 900 | Maximum impact |

## 🚀 TIPS PRO

1. **Start Simple**: Usa solo `variant` finché non serve controllo extra
2. **Test Early**: Verifica su iPhone SE per worst case
3. **Be Consistent**: Stesso tipo di testo = stesso approccio
4. **Think Mobile**: Design per mobile, scala per tablet
5. **Respect A11y**: Mai sotto 11px finale

## 📋 DECISION TREE

```
Devo stilizzare del testo
    ↓
È un testo standard del design system?
    SÌ → Usa variant
    NO ↓
       Serve dimensione specifica?
           SÌ → Usa fontSize
           NO → Usa variant più vicino
                    ↓
                Layout deve essere preciso?
                    SÌ → Aggiungi fixedLines
                    NO → Lascia fluire naturalmente
```

## 🎯 CONCLUSIONE

Il sistema è progettato per essere:
- **Semplice** nel 90% dei casi (solo variant)
- **Potente** quando serve (fontSize + fixedLines)
- **Consistente** su tutti i dispositivi
- **Performante** con calcoli ottimizzati

Segui le best practices e avrai un'app con typography professionale! 🚀 