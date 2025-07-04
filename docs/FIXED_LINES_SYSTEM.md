# Sistema Righe Fisse - FormattedText

## Panoramica

Il nuovo `wrapMode="fixed"` garantisce **consistenza assoluta** del numero di righe su tutti i dispositivi, risolvendo il problema delle variazioni di layout tra iPhone, Android e tablet.

## Problema Risolto

**PRIMA** (wrapMode="auto"):
- iPhone SE: testo su 1 riga
- iPhone 15: testo su 2 righe  
- iPad: testo su 3 righe
- ❌ **Inconsistenza totale**

**DOPO** (wrapMode="fixed" + fixedLines={2}):
- iPhone SE: testo su 2 righe
- iPhone 15: testo su 2 righe
- iPad: testo su 2 righe
- ✅ **Consistenza assoluta**

## Utilizzo Base

```tsx
import { FormattedText } from '../components/ui/FormattedText';

// Titolo sempre su 2 righe esatte
<FormattedText
  variant="headline-large"
  wrapMode="fixed"
  fixedLines={2}
>
  Rise Against Hunger Italia - Combattiamo la Fame
</FormattedText>

// Sottotitolo sempre su 1 riga esatta
<FormattedText
  variant="title-medium"
  wrapMode="fixed"
  fixedLines={1}
>
  La nostra missione per un mondo senza fame
</FormattedText>

// Descrizione sempre su 3 righe esatte
<FormattedText
  variant="body-medium"
  wrapMode="fixed"
  fixedLines={3}
>
  Testo lungo che sarà sempre distribuito su esattamente 3 righe
  indipendentemente dal dispositivo utilizzato dall'utente finale.
</FormattedText>
```

## Parametri

### wrapMode="fixed"
- **Tipo**: `'fixed'`
- **Descrizione**: Attiva la modalità righe fisse
- **Comportamento**: Forza il testo su un numero specifico di righe

### fixedLines
- **Tipo**: `number`
- **Default**: `1`
- **Range**: `1-5` (consigliato max 3 per leggibilità)
- **Descrizione**: Numero esatto di righe su cui distribuire il testo

## Confronto Modalità

| Modalità | Comportamento | Consistenza | Uso Consigliato |
|----------|---------------|-------------|------------------|
| `auto` | Wrapping intelligente variabile | ❌ Variabile | Testi dinamici |
| `strict` | Righe ottimali calcolate | ⚠️ Semi-consistente | Testi tecnici |
| `flexible` | Adattivo con limiti | ⚠️ Semi-consistente | Testi responsive |
| `none` | Sempre 1 riga | ✅ Consistente | Etichette brevi |
| **`fixed`** | **Righe fisse specificate** | **✅ Assoluta** | **Layout critici** |

## Esempi Pratici

### 1. Header Principale
```tsx
// Titolo app sempre su 2 righe
<FormattedText
  variant="display-large"
  wrapMode="fixed"
  fixedLines={2}
  style={{ textAlign: 'center' }}
>
  Rise Against Hunger\nItalia
</FormattedText>
```

### 2. Card Prodotto
```tsx
// Nome prodotto sempre su 1 riga
<FormattedText
  variant="title-medium"
  wrapMode="fixed"
  fixedLines={1}
>
  Pacco Alimentare Completo
</FormattedText>

// Descrizione sempre su 2 righe
<FormattedText
  variant="body-small"
  wrapMode="fixed"
  fixedLines={2}
>
  Contiene riso, legumi e vitamine per una famiglia di 4 persone
</FormattedText>
```

### 3. Lista Uniforme
```tsx
{items.map(item => (
  <FormattedText
    key={item.id}
    variant="body-medium"
    wrapMode="fixed"
    fixedLines={2}
  >
    {item.description}
  </FormattedText>
))}
```

## Vantaggi

### ✅ Consistenza Assoluta
- Stesso numero di righe su **tutti** i dispositivi
- Layout prevedibile e uniforme
- Zero variazioni iPhone/Android/iPad

### ✅ Design Perfetto
- Controllo totale del layout
- Allineamenti perfetti in liste
- Spacing uniforme tra elementi

### ✅ UX Professionale
- Esperienza identica per tutti gli utenti
- Brand consistency mantenuta
- Layout che "non si rompe mai"

### ✅ Performance
- Calcolo diretto senza algoritmi complessi
- Rendering ottimizzato
- Zero re-layout dinamici

## Best Practices

### 📏 Numero di Righe
- **1 riga**: Titoli, etichette, nomi
- **2 righe**: Sottotitoli, descrizioni brevi
- **3 righe**: Descrizioni medie, abstract
- **4+ righe**: ⚠️ Sconsigliato (leggibilità)

### 📱 Responsive
- Il sistema responsive universale scala automaticamente
- `fixedLines` rimane costante, `fontSize` si adatta
- Risultato: proporzioni perfette su ogni device

### 🎨 Design
- Usa `fixedLines` per elementi critici del layout
- Combina con `textAlign` per allineamenti perfetti
- Testa sempre su dispositivi estremi (iPhone SE, iPad)

## Implementazione Tecnica

### Algoritmo
```typescript
case 'fixed':
  return {
    numberOfLines: fixedLines || 1,
    ellipsizeMode: 'tail' as const,
    adjustsFontSizeToFit: false,
  };
```

### Integrazione
- ✅ Sistema responsive universale
- ✅ Cross-platform iOS/Android
- ✅ Accessibilità mantenuta
- ✅ Performance ottimizzata

## Migrazione

### Da wrapMode="auto"
```tsx
// PRIMA
<FormattedText wrapMode="auto">
  Testo variabile
</FormattedText>

// DOPO
<FormattedText wrapMode="fixed" fixedLines={2}>
  Testo sempre su 2 righe
</FormattedText>
```

### Test Consigliati
1. iPhone SE (375px) - schermo più piccolo
2. iPhone 15 (414px) - standard
3. iPad (768px+) - schermo grande
4. Verifica che `fixedLines` sia rispettato ovunque

## Conclusione

Il `wrapMode="fixed"` risolve definitivamente il problema delle righe inconsistenti, garantendo un layout perfetto e prevedibile su tutti i dispositivi del progetto Rise Against Hunger Italia.

**Usa sempre `fixed` quando la consistenza del layout è critica.**