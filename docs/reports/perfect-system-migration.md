# 🎯 GUIDA MIGRAZIONE AL PERFECT SYSTEM

## 📋 **CHECKLIST MIGRAZIONE COMPLETA**

### **✅ FASE 1: Preparazione**
- [ ] Backup del progetto
- [ ] Verifica resa dei font di sistema su entrambe le piattaforme
- [ ] Test su dispositivo iOS e Android

### **✅ FASE 2: Migrazione Typography**
- [x] Aggiornamento font weights in App.tsx (600 invece di 700)
- [x] Aggiornamento Typography.families.heading
- [ ] Migrazione componenti Text → PerfectText
- [ ] Rimozione Text nativi rimanenti

### **✅ FASE 3: Uniformazione Componenti**
- [ ] Migrazione AnimatedNumber → PerfectText
- [ ] Migrazione ProgressStat → PerfectText  
- [ ] Aggiornamento componenti test
- [ ] Pulizia import inutilizzati

---

## 🔄 **CONVERSIONI SPECIFICHE**

### **1. Text Nativo → PerfectText**

```tsx
// ❌ PRIMA (inconsistente)
<Text style={{ fontSize: 16, fontWeight: 'bold' }}>
  Titolo
</Text>

// ✅ DOPO (perfetto)
<PerfectText size={16} lines={1} fontWeight="600">
  Titolo
</PerfectText>
```

### **2. Text di react-native-paper → PerfectText**

```tsx
// ❌ PRIMA (può fallback a font sistema)
import { Text } from 'react-native-paper';
<Text variant="titleLarge">Titolo</Text>

// ✅ DOPO (font di sistema)
import { PerfectText } from '../components/ui';
<PerfectText size={22} lines={1} fontWeight="600">
  Titolo
</PerfectText>
```

### **3. AnimatedNumber Component**

```tsx
// ❌ PRIMA (usa Text di Paper)
<Text style={style}>{renderedValue}</Text>

// ✅ DOPO (usa PerfectText)
<PerfectText 
  size={16} 
  lines={1} 
  fontWeight="600"
  style={style}
>
  {renderedValue}
</PerfectText>
```

---

## 📱 **REGOLE CROSS-PLATFORM**

### **Font Weights Ottimizzati**
```tsx
// ✅ PESI CONSIGLIATI per coerenza iOS/Android
{
  light: '300',     // Testo molto sottile
  regular: '400',   // Testo normale (body)
  medium: '500',    // Testo accent/label
  semibold: '600',  // Titoli (NUOVO STANDARD)
  bold: '700',      // Solo per enfasi speciale
  extrabold: '800', // Evitare su Android
  black: '900',     // Evitare su Android
}
```

### **Mapping Componenti Perfect**
```tsx
// ✅ COMPONENTI STANDARD
<PerfectTitle size={24} lines={1}>Titolo Principale</PerfectTitle>
<PerfectSubtitle size={18} lines={2}>Sottotitolo</PerfectSubtitle>
<PerfectBody size={16} lines={3}>Testo corpo</PerfectBody>

// ✅ COMPONENTI CUSTOM
<PerfectText size={14} lines={1} fontWeight="500">Label</PerfectText>
<PerfectText size={12} lines={1} fontWeight="400">Caption</PerfectText>
```

---

## 🛠️ **SCRIPT DI MIGRAZIONE**

### **Esecuzione Automatica**
```bash
# 1. Dry run (solo analisi)
node scripts/migrate-to-perfect-text.js

# 2. Migrazione reale
# Modifica CONFIG.dryRun = false nel file
node scripts/migrate-to-perfect-text.js
```

### **Verifica Post-Migrazione**
```bash
# Controlla che non ci siano Text nativi rimasti
npm run conta-problemi

# Test su entrambe le piattaforme
npm run test
npx expo start
```

---

## 🎨 **COMPONENTI SPECIFICI DA AGGIORNARE**

### **1. AnimatedNumber.tsx**
```tsx
// Linea 63 - Sostituire:
return <Text style={style}>{renderedValue}</Text>;

// Con:
return (
  <PerfectText 
    size={16} 
    lines={1} 
    fontWeight="600"
    style={style}
  >
    {renderedValue}
  </PerfectText>
);
```

### **2. ProgressStat.tsx**
```tsx
// Linee 88, 91, 96 - Sostituire Text con PerfectText
<PerfectText size={14} lines={1} style={styles.targetValue}>
  / {formatter(target)}
</PerfectText>

<PerfectText size={16} lines={1} style={styles.label}>
  {label}
</PerfectText>

<PerfectText size={12} lines={1} style={styles.sublabel}>
  {sublabel}
</PerfectText>
```

### **3. File di Test**
```tsx
// Mantenere Text nativo solo nei test
// Ma aggiungere test per PerfectText
<PerfectText size={16} lines={1} testID="perfect-text">
  Test Content
</PerfectText>
```

---

## 🔍 **CONTROLLI QUALITÀ**

### **Checklist Finale**
- [ ] Nessun `<Text` nativo in src/ (esclusi test)
- [ ] Tutti i PerfectText hanno `size` e `lines`
- [ ] Font weights ≤ 600 per titoli
- [ ] Import PerfectText da '../components/ui'
- [ ] Test passano su iOS e Android
- [ ] Nessun warning font in console

### **Comandi Verifica**
```bash
# Cerca Text nativi rimanenti
grep -r "<Text" src/ --exclude-dir=__tests__

# Cerca import Text da react-native
grep -r "Text.*from.*react-native" src/

# Verifica import PerfectText
grep -r "PerfectText" src/ | wc -l
```

---

## 🚀 **BENEFICI FINALI**

### **✅ Coerenza Cross-Platform**
- Font di sistema coerente su iOS e Android
- Pesi ottimizzati per entrambe le piattaforme
- Nessun fallback a font di sistema

### **✅ Manutenibilità**
- Un solo sistema di testo
- Configurazione centralizzata
- Facile aggiornamento globale

### **✅ Performance**
- Testi sempre ottimizzati
- Nessun calcolo runtime
- Rendering consistente

---

## 📞 **SUPPORTO**

Se incontri problemi durante la migrazione:

1. **Controlla i log**: Console per errori font
2. **Testa su device**: Simulator può non mostrare differenze
3. **Verifica import**: Path relativi corretti
4. **Backup**: Ripristina da backup se necessario

**Ricorda**: La migrazione è incrementale, puoi farla componente per componente!
