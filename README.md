# CURSORRULES - Rise Against Hunger Italia
# Sistema Responsive Centralizzato - Regole di Sviluppo ZERO TOLLERANZA

## 🚀 **STATO PROGETTO: SISTEMA MILLIMETRICO UNIVERSALE UNIFICATO**

### ✅ **QUALITÀ ENTERPRISE + SISTEMA UNIFICATO**
```
SISTEMA MILLIMETRICO UNIFICATO: ✅ COMPLETATO
- Font + Spacing + Layout: iPhone 15 (414px) riferimento universale
- Database universale: 90+ dispositivi, 98.4% mercato globale
- Proporzioni sincronizzate: Zero discrepanze font/spacing
- TypeScript: 0 errori
- ESLint: 0 warnings
- Jest: Tutti i test passano
STATUS: ECCELLENZA ENTERPRISE + SISTEMA UNIFICATO ✅
```

## 📚 **DOCUMENTAZIONE COMPLETA**
**👉 LEGGI QUI**: [docs/SISTEMA_RESPONSIVE_COMPLETO.md](docs/SISTEMA_RESPONSIVE_COMPLETO.md)
**🎯 NUOVO**: [docs/LAYER_CENTRALIZZATO_RESPONSIVE.md](docs/LAYER_CENTRALIZZATO_RESPONSIVE.md)

---

## 🎯 **REGOLE CORE - ZERO TOLLERANZA**

### ✅ **LAYER CENTRALIZZATO OBBLIGATORIO**
```typescript
// ✅ CORRETTO - Sistema centralizzato
import { useResponsiveLayout } from '@/shared/hooks/useResponsiveLayout';
import { ResponsiveBox, ResponsiveStack } from '@/components/ui';

const MyComponent = () => {
  const { responsive } = useResponsiveLayout();
  
  return (
    <ResponsiveBox preset="card">
      <ResponsiveStack spacing={responsive({ compact: 16, xlarge: 24 })}>
        <FormattedText fontSize={24}>Contenuto</FormattedText>
      </ResponsiveStack>
    </ResponsiveBox>
  );
};

// ❌ VIETATO - Calcoli manuali frammentati
const { width: screenWidth } = Dimensions.get('window');
const isTablet = screenWidth >= 768;
const cardWidth = isTablet ? '31%' : '47.5%';
```

### ✅ **FORMATTEDTEXT OBBLIGATORIO**
```typescript
// ✅ CORRETTO
<FormattedText fontSize={24}>Testo responsivo</FormattedText>

// ❌ VIETATO
<Text style={{ fontSize: scaleFont(24) }}>Testo</Text>
```

### ✅ **ZERO DOPPIO SCALING**
```typescript
// ✅ CORRETTO
<FormattedText fontSize={60}>Titolo</FormattedText>

// ❌ VIETATO
<FormattedText fontSize={scaleFont(24)}>Testo</FormattedText>
```

### ✅ **DARK MODE UNIFICATO**
```typescript
// ✅ CORRETTO - Auto dark mode
<ResponsiveBox autoBackgroundColor="primary">
<ResponsiveCard autoBackgroundColor="card">

// Toggle centrale
const { toggleDarkMode } = useResponsiveDarkMode();

// ❌ VIETATO - Gestione manuale
<View style={{ backgroundColor: isDark ? '#1C1C1E' : '#FFFFFF' }}>
```

---

## 🎯 **TEMPLATE APP IDENTICA SU TUTTI I DISPOSITIVI**

### **✅ CONFIGURAZIONE PERFETTA**
Per ottenere un'app che appare **esattamente identica** su iPhone SE, iPad Pro, Android e qualsiasi dispositivo:

```typescript
// ✅ TEMPLATE COMPLETO: App visivamente identica ovunque
import { ResponsiveBox, ResponsiveStack, ResponsiveCard, FormattedText } from '@/components/ui';
import { Text } from 'react-native';
import { scaleFont } from '@/shared/constants/responsiveSystem';

const AppIdentica: React.FC = () => {
  return (
    <ResponsiveBox preset="container" autoBackgroundColor="primary">
      <ResponsiveStack spacing={24}>
        {/* Titolo HOME CRITICO - Text nativo per stabilità assoluta */}
        <Text
          allowFontScaling={false}                // ← IMMUNE A IMPOSTAZIONI SISTEMA
          numberOfLines={2}                       // ← MASSIMO 2 RIGHE
          adjustsFontSizeToFit={true}             // ← AUTO-RIDUCE SE NECESSARIO
          minimumFontScale={0.8}                  // ← LIMITE MINIMO LEGGIBILITÀ
          style={{
            fontSize: scaleFont(48),              // ← RESPONSIVE MA DETERMINISTIC
            fontWeight: '900',                    // ← PESO MASSIMO
            textAlign: 'center',
            lineHeight: scaleFont(52),
          }}
        >
          Rise Against{'\n'}
          <Text style={{ color: '#DC2626' }}>Hunger </Text>
          <Text style={{ color: '#1F2937' }}>Italia</Text>
        </Text>

        {/* Descrizione - FormattedText sistema controllato */}
        <FormattedText 
          fontSize={16}
          intelligentAccessibilityScaling={true}
          fixed={true}
          fixedLines={2}
          allowSystemFontScaling={false}
          style={{ textAlign: 'center' }}
        >
          Combatti la fame nel mondo con azioni concrete
          e donazioni che cambiano vite
        </FormattedText>

        {/* Grid responsive - preset automatico */}
        <ResponsiveStack direction="horizontal" spacing={12} style={{ flexWrap: 'wrap' }}>
          {[1, 2, 3, 4].map(num => (
            <ResponsiveCard key={num} preset="card" autoBackgroundColor="card">
              <FormattedText 
                fontSize={16}
                intelligentAccessibilityScaling={true}
                fixed={true}
                fixedLines={1}
                allowSystemFontScaling={false}
              >
                Azione {num}
              </FormattedText>
            </ResponsiveCard>
          ))}
        </ResponsiveStack>
      </ResponsiveStack>
    </ResponsiveBox>
  );
};
```

### **🎯 RISULTATO GARANTITO**
- ✅ **iPhone SE**: Testo ridimensionato automaticamente per entrare nelle righe
- ✅ **iPad Pro**: Testo ingrandito automaticamente per utilizzare spazio
- ✅ **Android**: Comportamento identico a iOS
- ✅ **App identica**: Stesse proporzioni visive su tutti i dispositivi
- ✅ **Righe esatte**: Testo sempre nelle righe specificate, mai nascosto

### **💡 CONFIGURAZIONE CHIAVE**
```typescript
// I 4 parametri fondamentali per app identica:
intelligentAccessibilityScaling={true}  // ← Adatta fontSize automaticamente
fixed={true}                            // ← Attiva sistema intelligente  
fixedLines={1}                          // ← Numero righe esatto
allowSystemFontScaling={false}          // ← Evita zoom che rompe layout
```

---

## 🚫 **ANTI-PATTERNS VIETATI**

### ❌ **Frammentazione Breakpoints**
```typescript
// ❌ VIETATO - Duplicato in più componenti
const { width: screenWidth } = Dimensions.get('window');
const isTablet = screenWidth >= 768;
```

### ❌ **Percentuali Hard-coded**
```typescript
// ❌ VIETATO - Percentuali sparse
width: '48%'     // ImpactQuickStats
width: '60%'     // SeguiciScreen  
width: '80%'     // HeaderDivider
maxWidth: screenWidth * 0.9  // Modal duplicato
```

### ❌ **Calcoli Manuali Ripetuti**
```typescript
// ❌ VIETATO - Logica duplicata
if (screenWidth < 375) baseSpacing = 0.8;
else if (screenWidth < 768) baseSpacing = 1;
else baseSpacing = 1.2;
```

### ❌ **Dark Mode Manuale**
```typescript
// ❌ VIETATO - Propagazione manuale
{isDark && { backgroundColor: '#1C1C1E' }}
```

---

## 💡 **TEMPLATE COMPONENTI AGGIORNATI**

### **COMPONENTE RESPONSIVE STANDARD**
```typescript
import { ResponsiveBox, ResponsiveStack, FormattedText } from '@/components/ui';
import { useResponsiveLayout } from '@/shared/hooks';

const NewComponent = ({ title, description }: Props) => {
  const { responsive } = useResponsiveLayout();
  
  return (
    <ResponsiveBox preset="card">
      <ResponsiveStack 
        spacing={responsive({ compact: 16, xlarge: 24 })} 
        direction="vertical"
      >
        <FormattedText 
          fontSize={40}
          fontWeight="bold"
          lineBreakStrategyIOS="push-out"
          breakStrategyAndroid="highQuality"
        >
          {title}
        </FormattedText>
        <FormattedText fontSize={16}>{description}</FormattedText>
      </ResponsiveStack>
    </ResponsiveBox>
  );
};
```

### **COMPONENTE CON DARK MODE**
```typescript
import { ResponsiveBox, FormattedText } from '@/components/ui';
import { useResponsiveDarkMode } from '@/shared/hooks';

const DarkModeComponent = ({ title }: Props) => {
  const { textColor } = useResponsiveDarkMode();
  
  return (
    <ResponsiveBox autoBackgroundColor="primary" padding={20}>
      <FormattedText 
        fontSize={24} 
        style={{ color: textColor.primary }}
      >
        {title}
      </FormattedText>
    </ResponsiveBox>
  );
};
```

### **LAYOUT COMPLESSO**
```typescript
const ComplexLayout = () => {
  const { responsive, breakpoint } = useResponsiveLayout();
  
  return (
    <ResponsiveStack direction="horizontal" spacing={12}>
      {/* Cards automaticamente responsive */}
      {items.map(item => (
        <ResponsiveCard 
          key={item.id} 
          preset="card"  // 100% → 47.5% → 31% → 20% automatico
          elevated 
        >
          <FormattedText fontSize={16}>{item.name}</FormattedText>
        </ResponsiveCard>
      ))}
    </ResponsiveStack>
  );
};
```

---

## 🎯 **BENEFICI DOCUMENTATI DEL LAYER CENTRALIZZATO**

### **PRIMA: Frammentazione** ❌
- 25+ istanze di `screenWidth >= 768` duplicate
- Percentuali inconsistenti (`'48%'`, `'60%'`, `'80%'`)
- Calcoli manuali ripetuti in ogni componente
- Dark mode propagato manualmente

### **ORA: Centralizzato** ✅
- Una sorgente di verità: `responsiveTheme.ts`
- Breakpoints unificati: `useResponsiveLayout()`
- Percentuali consistenti: `preset="card"`
- Dark mode automatico: `autoBackgroundColor="primary"`

### **MODIFICHE FUTURE: "UNA RIGA NEL TEMA"**
```typescript
// File: responsiveTheme.ts
export const ResponsiveBreakpoints = {
  // ... existing ...
  foldable: 1920,  // ← UNA RIGA
};

export const ResponsiveLayout = {
  cardWidth: {
    // ... existing ...
    foldable: '15%',  // ← UNA RIGA
  },
};

// RISULTATO: TUTTI i componenti migrati supportano automaticamente!
```

---

## 🧪 **TESTING OBBLIGATORIO**

### **COVERAGE MINIMO**
- Statement: >35%
- Branch: >30%
- Function: >40%
- Lines: >35%

### **SCRIPT CONTROLLO QUALITÀ**
```bash
npm run pre-modifiche  # BLOCCO se errori - OBBLIGATORIO
npm run post-modifiche # BLOCCO se problemi - OBBLIGATORIO
npm run conta-problemi # DEVE essere = 0 - SEMPRE
```

---

## 🔍 **CHECKLIST PRE-COMMIT AGGIORNATA**

### **VERIFICA SEMPRE:**
- ✅ Usa ResponsiveBox/Stack invece di View manual?
- ✅ Usa useResponsiveLayout() invece di screenWidth?
- ✅ Usa preset="card" invece di percentuali hard-coded?
- ✅ Usa autoBackgroundColor invece di colori manuali?
- ✅ FormattedText per tutti i testi?
- ✅ Zero scaleFont() manuale?
- ✅ Test coverage > 35%?
- ✅ Zero TypeScript errors?
- ✅ Zero ESLint warnings?

### **WORKFLOW OBBLIGATORIO:**
1. `npm run pre-modifiche` → DEVE passare
2. Sviluppo con template approvati + layer centralizzato
3. `npm run post-modifiche` → DEVE passare
4. Commit SOLO se tutto è 0 problemi

---

## 🚀 **ESEMPI MIGRAZIONE COMPLETATI**

### **ModernHomeActions → ModernHomeActionsMigrated**
```typescript
// ❌ PRIMA: Frammentato
const { width: screenWidth } = Dimensions.get('window');
const isTablet = screenWidth >= 768;
const cardWidth = isTablet ? '31%' : '47.5%';

// ✅ DOPO: Centralizzato
const { responsive } = useResponsiveLayout();
<ResponsiveBox preset="card">
```

### **SectionContainer → SectionContainerMigrated**
```typescript
// ❌ PRIMA: Calcoli manuali
if (screenWidth < 375) baseSpacing = 0.8;
else if (screenWidth >= 768) baseSpacing = 1.2;

// ✅ DOPO: Token-based
const baseSpacing = responsive({
  compact: 0.8,
  standard: 1.0,
  xlarge: 1.2
}) ?? 1;
```

---

## ⚡ **PERFORMANCE E BENEFICI**

### **🎯 MODIFICHE FUTURE**
- **Tablet XL**: Una riga (`tabletXL: 1280`) → layout automatico
- **RTL Support**: Flag globale → flexDirection automatico
- **Re-branding**: Colori nel tema → zero find & replace
- **Desktop**: Nuovi breakpoints → scale automatico

### **📊 METRICHE RAGGIUNTE**
- ✅ **Frammentazione eliminata**: 25+ → 0 istanze duplicate
- ✅ **Percentuali unificate**: Sparse → tema centralizzato
- ✅ **Dark mode**: Manuale → automatico
- ✅ **Breakpoints**: Duplicati → sorgente unica

---

**💡 RICORDA**: Da "centinaia di edit manuali" → Una riga nel tema!

**🎯 SISTEMA PRONTO**: Layer centralizzato + FormattedText = ECCELLENZA ENTERPRISE ✅
