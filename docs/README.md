# 🍎 RISE AGAINST HUNGER ITALIA - MOBILE APP

**Una potente app React Native per combattere la fame in Italia con design responsive professionale.**

---

## 🚀 **STATO PROGETTO (2025)**

### ✅ **QUALITÀ PERFETTA**
- **TypeScript**: 0 errori ✅
- **ESLint**: 0 warnings ✅  
- **Jest**: Tutti i test passano ✅
- **Architettura**: Container Layout System Professionale ✅
- **Responsive**: Consistenza cross-platform garantita ✅

### 🎯 **PROBLEMA RISOLTO: "Rise Against Hunger Italia"**
- ✅ **Layout Consistency**: Sempre 2 righe su tutti i dispositivi
- ✅ **Font Quality**: Grande e grassetto preservato (75px → min 64px)
- ✅ **Spacing**: "Hunger Italia" correttamente separati
- ✅ **Cross-Platform**: Comportamento identico iOS/Android
- ✅ **Zero Truncation**: Tutto il testo sempre visibile

---

## 🏗️ **ARCHITETTURA SISTEMA RESPONSIVE 2025**

### **Container Layout System Professionale**

Il sistema implementa le **10 best practices** della guida professionale:

1. **✅ Larghezza costante** (90% phone, fisso tablet)
2. **✅ Padding costante** in dp scalati
3. **✅ Safe area handling** automatico iOS/Android
4. **✅ RTL support** completo per internazionalizzazione
5. **✅ Dynamic Type control** con allowFontScaling={false}
6. **✅ Baseline grid** (4dp rhythm)
7. **✅ Breakpoint strategies** responsivi automatici
8. **✅ Autosize fallback** con algoritmo conservativo
9. **✅ Testing automatico** layout measurement
10. **✅ Checklist compliance** implementazione 100%

### **Componenti Core**

```tsx
// Container universale con tutte le best practices
<ProfessionalContainer variant="text|card|section" enableRTL={false}>
  <FormattedText fontSize={24}>Content</FormattedText>
</ProfessionalContainer>

// Container specializzato per titoli (layout consistency garantita)
<TitleContainer testID="main-title">
  <FormattedText fontSize={75} fixed={true} fixedLines={2}>
    Rise Against Hunger Italia
  </FormattedText>
</TitleContainer>

// FormattedText container-aware + algoritmo conservativo
<FormattedText
  fontSize={75}           // Font base (sempre RAW)
  fixed={true}            // Layout controllato  
  fixedLines={2}          // Sempre 2 righe
  fontWeight="black"      // Grassetto preservato
  enableRTL={false}       // RTL support
  containerWidth={350}    // Override larghezza container
>
  Rise Against Hunger Italia
</FormattedText>
```

---

## 🛠️ **SETUP SVILUPPO**

### **Prerequisiti**
```bash
Node.js ≥ 18
npm ≥ 9
Expo CLI
React Native ≥ 0.71
```

### **Installazione**
```bash
git clone [repository]
cd "App Rise"
npm install
npm start
```

### **Workflow Qualità**
```bash
# Prima di iniziare modifiche
npm run pre-modifiche     # Verifica qualità

# Sviluppo normale  
npm start                 # Avvia app
npm test                  # Test suite

# Prima del commit
npm run post-modifiche    # Verifica finale
npm run conta-problemi    # Deve essere = 0

# Commit sicuro (solo se ZERO problemi)
git add .
git commit -m "feat: Descrizione"
```

---

## 📱 **BUILD & DEPLOY**

### **EAS Build**
```bash
# Build testing
eas build --profile preview --platform all

# Build production
eas build --profile production --platform all

# Submit agli store
eas submit --platform all --profile production
```

### **Build Trigger Automatici**
```bash
# Commit normale (0 build)
git commit -m "feat: nuova funzione"

# Trigger build automatiche
git commit -m "release: v1.0.0 [build]"        # Android + iOS
git commit -m "fix: hotfix [build android]"    # Solo Android  
git commit -m "update: iOS [build ios]"        # Solo iOS
```

### **OTA Updates**
```bash
# Hotfix rapido
eas update --branch production --message "Fix: Descrizione"
```

---

## 🎯 **FEATURES PRINCIPALI**

### **📱 Home Screen**
- Hero banner con animazioni fluide
- Titolo principale responsive "Rise Against Hunger Italia"
- Call-to-action prominenti
- Statistiche impatto in tempo reale

### **📊 Impact Screen**  
- Visualizzazione progressi progetti
- Mappa interattiva operazioni
- Numeri impatto community
- Timeline risultati raggiunti

### **🎬 Actions Screen**
- Opzioni donazione integrate
- Charity shop con gift cards
- Registrazione eventi
- Community engagement

### **ℹ️ About Screen**
- Storia organizzazione con modal interattiva
- Sezione contatti
- Trasparenza e tracciabilità
- Testimonianze impact

### **📱 Social Screen**
- Collegamenti social networks
- Condivisione progetti
- Inviti community
- Newsletter subscription

---

## 🏛️ **ARCHITETTURA CODEBASE**

### **Struttura Principale**
```
src/
├── components/           # Componenti UI universali
│   ├── ui/              # Sistema UI + Container Layout
│   ├── domain/          # Componenti business logic
│   └── layout/          # Layout containers
├── features/            # Feature-based architecture
│   ├── home/            # Feature Home completa
│   ├── impact/          # Feature Impact
│   ├── actions/         # Feature Actions
│   ├── about/           # Feature About
│   └── social/          # Feature Social
├── shared/              # Codice condiviso
│   ├── constants/       # Design Tokens + Responsive System
│   ├── hooks/           # Hook riutilizzabili
│   └── utils/           # Utilities core
└── navigation/          # Navigazione app
```

### **Design System**
```
shared/constants/
├── responsiveSystem.ts  # Sistema responsive core
├── designTokens.ts      # Design tokens base  
├── materialDesignTokens.ts # Material Design
└── platformDesignTokens.ts # Platform-specific
```

---

## 🎨 **DESIGN SYSTEM**

### **Typography Scale**
```tsx
// Display (hero titles)
display-large    → 57px base → scalato automaticamente
display-medium   → 45px base → scalato automaticamente  
display-small    → 32px base → scalato automaticamente

// Headlines (section titles)
headline-large   → 30px base → scalato automaticamente
headline-medium  → 28px base → scalato automaticamente
headline-small   → 24px base → scalato automaticamente

// Body text
body-large       → 16px base → scalato automaticamente
body-medium      → 15px base → scalato automaticamente
body-small       → 12px base → scalato automaticamente
```

### **Breakpoints Responsivi**
```typescript
≤375px → scale 0.9   // iPhone SE, piccoli Android
≤414px → scale 1.0   // iPhone standard, Android standard
≤480px → scale 1.15  // iPhone Plus, grandi Android  
≤600px → scale 1.25  // Fold, mini tablet
>600px → scale 1.3   // iPad, tablet
```

---

## 🧪 **TESTING**

### **Test Suite**
```bash
npm test                 # Tutti i test
npm test -- --watch     # Watch mode
npm run test:coverage    # Coverage report
```

### **Quality Gates**
- **Unit Tests**: Componenti core + business logic
- **Integration Tests**: Navigation + data flow  
- **Visual Tests**: Layout consistency cross-platform
- **Performance Tests**: Memory + render optimization

---

## 🔗 **COLLEGAMENTI UFFICIALI**

### **App Features**
- **Progetti**: https://riseagainsthunger.org.welfare4charity.com/org/projects
- **Charity Shop**: https://riseagainsthunger.org.welfare4charity.com/charity/ecommerce
- **Gift Cards**: https://riseagainsthunger.org.welfare4charity.com/charity/giftcards
- **Eventi**: https://riseagainsthunger.org.welfare4charity.com/organization/events

### **Organizzazione**
- **Website**: https://italy.riseagainsthunger.org
- **Tracciabilità**: https://italy.riseagainsthunger.org/chi-siamo/tracciabilita/
- **Facebook**: Rise Against Hunger Italia
- **Instagram**: @riseagainsthungeritalia

---

## 📊 **CONFIGURAZIONE**

### **Bundle ID**
```javascript
// app.config.js
bundleIdentifier: "it.creareunapp.editor.ios63da226b4447c"
package: "it.creareunapp.editor.ios63da226b4447c"
```

### **EAS Account**
- **Account**: rikiglesias
- **Org**: Rise Against Hunger Italia
- **Platform**: iOS + Android

---

## 🏆 **RISULTATI OTTENUTI**

### **Typography Consistency** ✅
- **Layout matematicamente preciso** su ogni dispositivo
- **Font quality preservata** con algoritmo conservativo
- **Cross-platform identical behavior** iOS/Android
- **Zero text truncation** policy implementata

### **Development Experience** ✅  
- **Zero tolerance quality system** con workflow automatici
- **Feature-based architecture** per scalabilità
- **Component library** con Container Layout System
- **Comprehensive testing** suite implementata

### **Performance** ✅
- **Optimized rendering** con memoization strategica
- **Memory efficient** responsive calculations
- **Battery friendly** animations con native driver
- **Fast startup** con lazy loading implementations

---

## 📚 **DOCUMENTAZIONE**

### **Guide Tecniche**
- `CONTAINER_LAYOUT_IMPLEMENTATION.md` - Sistema Container Layout completo
- `SISTEMA_RESPONSIVE_REFERENCE.md` - Responsive system reference
- `QUICK_REFERENCE.md` - Comandi rapidi e best practices

### **Deployment & Operations**
- `PUBLISHING_DEPLOYMENT_GUIDE.md` - Guida deploy completa
- `OTA_UPDATES_GUIDE.md` - Over-the-air updates
- `GITHUB_ACTIONS_REFERENCE.md` - CI/CD automatico

### **Sicurezza & Privacy**
- `SECURITY_AGAINST_HACKERS.md` - Security best practices
- `PRIVACY_POLICY_SIMPLIFIED.md` - Privacy policy
- `LEGAL_COMPLIANCE_SIMPLIFIED.md` - Legal compliance

---

## 🤝 **CONTRIBUTING**

### **Code Quality Standards**
- **Zero TypeScript errors** policy
- **Zero ESLint warnings** policy  
- **All tests passing** requirement
- **Container Layout System** compliance
- **Cross-platform consistency** verification

### **Development Workflow**
1. `npm run pre-modifiche` - Quality check
2. Feature development con testing
3. `npm run post-modifiche` - Final verification  
4. `npm run conta-problemi` = 0 required
5. Commit only if quality perfect

---

## 📞 **SUPPORTO**

### **Technical Issues**
- Verifica: `npm run conta-problemi`
- Debug: VS Code Problems tab
- Test: `npm test`
- Build: `eas build --profile preview`

### **Documentation**
- Quick Reference: `docs/QUICK_REFERENCE.md`
- Container Layout: `docs/CONTAINER_LAYOUT_IMPLEMENTATION.md`
- Troubleshooting: GitHub Issues

---

**🍎 Rise Against Hunger Italia - Combattiamo la fame con tecnologia d'eccellenza**

*Powered by React Native + Expo + Container Layout System Professionale*
