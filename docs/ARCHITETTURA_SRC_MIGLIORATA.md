# 🏗️ Nuova Architettura SRC - Feature-Based

## 📋 Panoramica

La nuova architettura è organizzata per **feature/dominio** invece che per tipo di file, rendendo il codice più manutenibile, scalabile e intuitivo da navigare.

## 🎯 Benefici Principali

1. **Coesione Alta**: Tutti i file relativi a una feature sono raggruppati insieme
2. **Navigazione Intuitiva**: Facile trovare tutto ciò che riguarda una specifica funzionalità
3. **Scalabilità**: Aggiungere nuove feature è semplice e non inquina altre parti
4. **Testabilità**: Test vicini al codice che testano
5. **Manutenibilità**: Modifiche isolate per feature

## 📁 Struttura Dettagliata

```
src/
├── features/                    # 🎯 Funzionalità principali dell'app
│   ├── home/                   # 🏠 Schermata Home
│   │   ├── components/
│   │   │   ├── HeaderSection/
│   │   │   │   ├── index.tsx
│   │   │   │   ├── HeaderLogo.tsx
│   │   │   │   └── HeaderTitle.tsx
│   │   │   ├── HeroImage/
│   │   │   │   ├── index.tsx
│   │   │   │   └── HeroImage.styles.ts
│   │   │   ├── EntraInAzione/
│   │   │   │   ├── index.tsx
│   │   │   │   ├── ActionTitle.tsx
│   │   │   │   ├── ActionDescription.tsx
│   │   │   │   └── ActionCTAButtons.tsx
│   │   │   └── index.ts
│   │   ├── hooks/
│   │   │   ├── useHomeAnimations.ts
│   │   │   ├── useHomeStyles.ts
│   │   │   └── index.ts
│   │   ├── screens/
│   │   │   └── HomeScreen.tsx
│   │   ├── types/
│   │   │   └── index.ts
│   │   └── index.ts
│   │
│   ├── impact/                 # 📊 Schermata Impatto
│   │   ├── components/
│   │   │   ├── ImpactHeader/
│   │   │   ├── NumbersSection/
│   │   │   │   ├── index.tsx
│   │   │   │   ├── TotalMeals.tsx
│   │   │   │   └── TotalKits.tsx
│   │   │   ├── ResultsSection/
│   │   │   │   ├── index.tsx
│   │   │   │   └── AnnualResults.tsx
│   │   │   ├── CommunitySection/
│   │   │   │   ├── index.tsx
│   │   │   │   ├── VolunteersCard.tsx
│   │   │   │   └── PartnersCard.tsx
│   │   │   ├── MapSection/
│   │   │   │   ├── index.tsx
│   │   │   │   ├── InteractiveMap.tsx
│   │   │   │   └── MapModal.tsx
│   │   │   └── index.ts
│   │   ├── hooks/
│   │   ├── screens/
│   │   │   ├── ImpactScreen.tsx
│   │   │   └── development/
│   │   │       └── PlaceholderScreen.tsx
│   │   └── types/
│   │
│   ├── actions/                # 🎬 Schermata Azioni
│   │   ├── components/
│   │   │   ├── ActionsHeader/
│   │   │   │   ├── index.tsx
│   │   │   │   └── FaiLaDifferenza.tsx
│   │   │   ├── ContributeSection/
│   │   │   │   ├── index.tsx
│   │   │   │   ├── ContributeButton.tsx
│   │   │   │   └── DonationModal.tsx
│   │   │   ├── ShopSection/
│   │   │   │   ├── index.tsx
│   │   │   │   ├── CharityShopButton.tsx
│   │   │   │   ├── GiftCardsButton.tsx
│   │   │   │   └── DonateButton.tsx
│   │   │   ├── ExploreSection/
│   │   │   │   ├── index.tsx
│   │   │   │   └── ExploreButtons.tsx
│   │   │   ├── CommunitySection/
│   │   │   │   ├── index.tsx
│   │   │   │   └── CommunityButtons.tsx
│   │   │   └── index.ts
│   │   ├── hooks/
│   │   ├── screens/
│   │   │   └── ActionsScreen.tsx
│   │   └── types/
│   │
│   ├── about/                  # ℹ️ Chi Siamo
│   │   ├── components/
│   │   │   ├── ChiSiamoHeader/
│   │   │   ├── ChiSiamoContent/
│   │   │   │   ├── index.tsx
│   │   │   │   └── StoriaModal.tsx
│   │   │   ├── ContactSection/
│   │   │   │   ├── index.tsx
│   │   │   │   ├── ContactCard.tsx
│   │   │   │   └── ContactInfo.tsx
│   │   │   └── index.ts
│   │   ├── hooks/
│   │   ├── screens/
│   │   │   └── ChiSiamoScreen.tsx
│   │   └── types/
│   │
│   └── social/                 # 📱 Seguici
│       ├── components/
│       │   ├── SocialHeader/
│       │   ├── SocialCards/
│       │   │   ├── index.tsx
│       │   │   ├── WebsiteCard.tsx
│       │   │   ├── InstagramCard.tsx
│       │   │   ├── FacebookCard.tsx
│       │   │   └── LinkedInCard.tsx
│       │   └── index.ts
│       ├── hooks/
│       ├── screens/
│       │   └── SeguiciScreen.tsx
│       └── types/
│
├── shared/                     # 🔄 Codice condiviso tra features
│   ├── components/
│   │   ├── ui/                # Componenti UI base
│   │   │   ├── buttons/
│   │   │   ├── cards/
│   │   │   ├── animations/
│   │   │   └── index.ts
│   │   ├── layout/            # Componenti layout
│   │   │   ├── SectionContainer.tsx
│   │   │   ├── HeaderDivider.tsx
│   │   │   └── index.ts
│   │   └── index.ts
│   ├── hooks/
│   ├── utils/
│   ├── constants/
│   └── config/
│
├── navigation/                 # 🧭 Navigazione app
├── stores/                     # 📦 State management
└── __tests__/                  # 🧪 Test globali
```

## 🔄 Piano di Migrazione

### Fase 1: Preparazione
1. Creare la nuova struttura delle cartelle
2. Identificare dipendenze tra componenti
3. Mappare vecchi path → nuovi path

### Fase 2: Migrazione per Feature
1. **Home** (priorità alta)
   - Spostare HomeScreen e componenti correlati
   - Aggiornare imports
   - Testare funzionalità

2. **Impact** (priorità alta)
   - Migrare ImpactScreen e sottosezioni
   - Consolidare componenti duplicati
   - Verificare navigazione

3. **Actions** (priorità media)
   - Riorganizzare ContributeScreen
   - Raggruppare modal e componenti azioni
   - Testare interazioni

4. **About & Social** (priorità bassa)
   - Spostare ChiSiamo e Seguici
   - Semplificare struttura componenti

### Fase 3: Ottimizzazione
1. Rimuovere duplicazioni
2. Standardizzare naming conventions
3. Aggiornare documentazione

## 📝 Convenzioni di Naming

### Files e Cartelle
- **Features**: `camelCase` (es. `home/`, `impact/`)
- **Components**: `PascalCase` (es. `HeaderSection/`)
- **Hooks**: `camelCase` con prefisso `use` (es. `useHomeAnimations.ts`)
- **Types**: `PascalCase` con suffisso `Types` (es. `HomeTypes.ts`)

### Exports
```typescript
// Feature index.ts
export * from './components';
export * from './hooks';
export * from './types';
export { default as HomeScreen } from './screens/HomeScreen';
```

## 🎨 Esempi di Codice

### Feature Component
```typescript
// features/home/components/EntraInAzione/index.tsx
import React from 'react';
import { View } from 'react-native';
import { ActionTitle } from './ActionTitle';
import { ActionDescription } from './ActionDescription';
import { ActionCTAButtons } from './ActionCTAButtons';
import { useEntraInAzioneStyles } from '../../hooks';

export const EntraInAzione: React.FC = () => {
  const styles = useEntraInAzioneStyles();
  
  return (
    <View style={styles.container}>
      <ActionTitle />
      <ActionDescription />
      <ActionCTAButtons />
    </View>
  );
};
```

### Feature Hook
```typescript
// features/home/hooks/useHomeAnimations.ts
import { useRef, useEffect } from 'react';
import { Animated } from 'react-native';

export const useHomeAnimations = () => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  
  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);
  
  return { fadeAnim };
};
```

## 🚀 Vantaggi a Lungo Termine

1. **Sviluppo più veloce**: Tutto il necessario per una feature in un posto
2. **Onboarding semplificato**: Nuovi sviluppatori capiscono subito la struttura
3. **Refactoring sicuro**: Modifiche isolate per feature
4. **Build ottimizzate**: Possibilità di code splitting per feature
5. **Testing mirato**: Test vicini al codice, più facili da mantenere

## ⚡ Performance

La nuova architettura permette:
- Lazy loading per feature
- Bundle splitting automatico
- Import più efficienti
- Meno re-render non necessari

## 🔐 Best Practices

1. **Single Responsibility**: Ogni componente ha una sola responsabilità
2. **DRY**: Codice condiviso va in `shared/`
3. **Encapsulation**: Feature indipendenti tra loro
4. **Testability**: Ogni feature testabile in isolamento
5. **Documentation**: README.md per ogni feature complessa 