# 📏 FILE SIZE STANDARDS - Rise Against Hunger Italia

## 🎯 **SOGLIE PROFESSIONALI IMPLEMENTATE**

Il progetto segue standard industriali consolidati per la dimensione dei file, basati su:
- **Google Style Guides**
- **Airbnb JavaScript/React Standards**
- **ESLint recommended practices**
- **React Native best practices**

### 📊 **TABELLA SOGLIE PER CONTESTO**

| **Contesto** | **Verde (preferibile)** | **Gialla (attenzione)** | **Rossa (refactor)** |
|--------------|-------------------------|--------------------------|----------------------|
| **Componenti UI React/React Native** | ≤ 300 righe | 300 – 500 righe | > 500 righe |
| **Hook / helper functions** | ≤ 200 righe | 200 – 400 righe | > 400 righe |
| **Classe o modulo di dominio** | ≤ 400 righe | 400 – 800 righe | > 800 righe |
| **File di test** | ≤ 600 righe* | 600 – 1000 righe | > 1000 righe |
| **Script di build / config** | ≤ 150 righe | 150 – 300 righe | > 300 righe |

*\*Snapshot esclusi dalla valutazione*

---

## 🚦 **SIGNIFICATO DELLE SOGLIE**

### ✅ **ZONA VERDE** - Dimensione Ottimale
- **Facilmente comprensibile** da qualsiasi sviluppatore
- **Revisione veloce** in code review
- **Responsabilità singola** ben definita
- **Manutenzione agevole** nel tempo

### ⚠️ **ZONA GIALLA** - Attenzione Richiesta
- **Accettabile** ma da monitorare
- **Valutare split** se si aggiunge altro codice
- **Review più attenta** delle responsabilità
- **Candidato** per refactoring futuro

### 🔴 **ZONA ROSSA** - Refactoring Obbligatorio
- **Viola principi** di Single Responsibility
- **Difficile** da comprendere e mantenere
- **Review complessa** e soggetta a errori
- **Refactoring immediato** fortemente raccomandato

---

## 🛠️ **STRUMENTI DI MONITORAGGIO**

### **ESLint Integration**
Le soglie sono integrate nelle regole ESLint e bloccano automaticamente:
```bash
npm run lint              # Verifica violazioni 
npm run post-modifiche    # Controllo completo pre-commit
```

### **Script di Analisi**
```bash
npm run filesize:analyze  # Analisi completa con colori
npm run filesize:report   # Report dettagliato + JSON
npm run refactor:check    # Verifica compliance
```

### **Output Esempio**
```
📋 PROFESSIONAL THRESHOLDS:
📁 UI Components:     ≤300 (verde) | 300-500 (giallo) | >500 (rosso)
🪝 Hook/Helper funcs: ≤200 (verde) | 200-400 (giallo) | >400 (rosso)
🏗️ Domain modules:     ≤400 (verde) | 400-800 (giallo) | >800 (rosso)

📂 UI COMPONENT (≤300 verde, ≤500 giallo, >500 rosso)
  🔴 ActionButtons.tsx: 916 righe (+416 oltre soglia)
  ✅ Logo.tsx: 45 righe
  ⚠️ FormattedText.tsx: 568 righe (+68 oltre verde)
```

---

## 🎯 **STRATEGIE DI REFACTORING**

### **Componenti UI (>500 righe)**
```typescript
// ❌ PRIMA: Componente monolitico
const BigComponent = () => {
  // 600+ righe di JSX, logica, stili
  return <View>...</View>;
};

// ✅ DOPO: Split logico
const ComponentHeader = () => <View>...</View>;
const ComponentContent = () => <View>...</View>;
const ComponentActions = () => <View>...</View>;

const BigComponent = () => (
  <View>
    <ComponentHeader />
    <ComponentContent />
    <ComponentActions />
  </View>
);
```

### **Hook/Helper (>400 righe)**
```typescript
// ❌ PRIMA: Hook monolitico
const useBigHook = () => {
  // 500+ righe di logica
};

// ✅ DOPO: Split per responsabilità
const useDataFetching = () => { /* ... */ };
const useDataProcessing = () => { /* ... */ };
const useDataValidation = () => { /* ... */ };

const useBigHook = () => {
  const data = useDataFetching();
  const processed = useDataProcessing(data);
  const validated = useDataValidation(processed);
  return { validated };
};
```

### **Screen/Domain (>800 righe)**
```typescript
// ❌ PRIMA: Screen monolitico
const BigScreen = () => {
  // 900+ righe con logica business
};

// ✅ DOPO: Estrazione sezioni
const HeaderSection = () => <View>...</View>;
const ContentSection = () => <View>...</View>;
const FooterSection = () => <View>...</View>;

const BigScreen = () => (
  <ScreenContainer>
    <HeaderSection />
    <ContentSection />
    <FooterSection />
  </ScreenContainer>
);
```

---

## 📈 **MONITORAGGIO CONTINUO**

### **CI/CD Integration**
- **Pre-commit hooks** verificano dimensioni
- **Build bloccato** se soglie rosse violate
- **Report automatici** in PR reviews

### **Metriche di Progetto**
- **Tracking overtime** della distribuzione file
- **Alert automatici** su nuove violazioni
- **Dashboard** con trend temporali

### **Team Guidelines**
- **Review obbligatoria** per file >giallo
- **Planning refactoring** per file >rosso
- **Pair programming** per split complessi

---

## ⚡ **QUICK REFERENCE**

### **Comandi Essenziali**
```bash
# Verifica rapida stato
npm run filesize:analyze

# Report completo
npm run filesize:report

# Controllo pre-commit
npm run post-modifiche

# Fix problemi identificati
npm run helper-manuali
```

### **File Attualmente in Refactoring**
- `ImpactTabScreen.tsx`: 1082 righe → target 800 (282 eccesso)
- `ActionButtons.tsx`: 916 righe → target 500 (416 eccesso)  
- `HomeHeaderSubComponents.tsx`: 755 righe → target 500 (255 eccesso)
- `FormattedText.tsx`: 568 righe → target 500 (68 eccesso)

---

## 🔄 **AGGIORNAMENTI**

**Data**: 2025-01-07  
**Versione**: 1.0  
**Status**: ✅ Implementato e attivo  

**Prossime milestone**:
- [ ] Refactoring file critici (Q1 2025)
- [ ] Integration dashboard metriche (Q2 2025)
- [ ] Automazione split suggestions (Q2 2025)

---

*📚 Per dettagli implementazione: vedere `.eslintrc.js` e `scripts/file-size-monitor.js`* 