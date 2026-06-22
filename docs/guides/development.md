# Guida allo sviluppo — Rise Against Hunger Italia

Guida pratica per lavorare sul codebase: setup, pattern reali (scaling,
theming, componenti), struttura feature-based e comandi.

## Indice

1. [Setup ambiente](#setup-ambiente)
2. [Comandi quotidiani](#comandi-quotidiani)
3. [Import e alias](#import-e-alias)
4. [Scaling con perfectScale](#scaling-con-perfectscale)
5. [Componenti Perfect](#componenti-perfect)
6. [Theming](#theming)
7. [System Immunity](#system-immunity)
8. [Aggiungere una feature](#aggiungere-una-feature)
9. [Testing](#testing)
10. [Troubleshooting](#troubleshooting)

---

## Setup ambiente

```bash
# Installazione dipendenze
npm install

# Avvio dev server (Expo)
npm start

# Piattaforme
npm run ios       # expo start --ios
npm run android   # expo start --android
npm run web       # expo start --web (ispezione Chrome)
```

Stack: Expo SDK `~54` (managed), React Native `0.81.5`, React `19.1.0`,
TypeScript `~5.9`.

---

## Comandi quotidiani

```bash
# Qualita
npm run typecheck        # tsc --noEmit
npm run lint             # eslint, --max-warnings 0
npm run test             # jest
npm run test:coverage    # jest --coverage
npm run conta-problemi   # conteggio problemi del progetto

# Workflow
npm run pre-modifiche    # check prima di iniziare
npm run post-modifiche   # check dopo le modifiche

# Snapshot / visual
npm run snapshot:generate
npm run snapshot:validate
npm run visual:test
```

---

## Import e alias

Gli alias sono definiti in `babel.config.js`:

| Alias         | Path               |
| ------------- | ------------------ |
| `@`           | `./src`            |
| `@components` | `./src/components` |
| `@shared`     | `./src/shared`     |
| `@features`   | `./src/features`   |
| `@assets`     | `./assets`         |

```typescript
import { scale, scaleText } from '@/shared/constants/perfectScale';
import { PerfectText, PerfectContainer } from '@/components/ui';
import { usePerfectTheme } from '@/shared/hooks/usePerfectTheme';
```

---

## Scaling con perfectScale

La SSOT dello scaling e `src/shared/constants/perfectScale.ts`. Lo scaling e
**basato sulla diagonale** dello schermo rispetto al riferimento iPhone 15
(`393 x 852`), con un cap progressivo su tablet.

### Primitive

```typescript
import {
  scale,
  scaleText,
  scaleSpacing,
  scaleTouch,
  LOGICAL_REFERENCE,
} from '@/shared/constants/perfectScale';

const fontSize = scaleText(16); // font: scale puro (wrapping identico)
const padding = scaleSpacing(16); // padding: cap 1.5x su tablet
const btnHeight = scaleTouch(44); // touch: minimo 44px su device piccoli
const cardW = scale(LOGICAL_REFERENCE.width * 0.9); // larghezza generica
```

| Funzione        | Quando usarla                                          |
| --------------- | ------------------------------------------------------ |
| `scale`         | Dimensioni generiche (width/height/radius)             |
| `scaleText`     | Font size e line-height                                |
| `scaleSpacing`  | Padding/margin/gap                                     |
| `scaleTouch`    | Altezza/larghezza di elementi interattivi (button)     |

Regola d'oro: NON leggere `Dimensions.get('window')` direttamente nei
componenti. Usa le funzioni `scale*`; se servono le dimensioni grezze, usa
`getWindowDimensions()`.

### Template componente

```typescript
import { StyleSheet, View } from 'react-native';
import { scaleSpacing, scaleTouch } from '@/shared/constants/perfectScale';
import { PerfectText } from '@/components/ui';

const Card = ({ title }: { title: string }) => (
  <View style={styles.card}>
    <PerfectText size={20} lines={1} fontWeight="bold">
      {title}
    </PerfectText>
  </View>
);

const styles = StyleSheet.create({
  card: {
    padding: scaleSpacing(16),
    minHeight: scaleTouch(64),
  },
});

export default Card;
```

---

## Componenti Perfect

Esportati da `src/components/ui/index.ts`. Consumano `perfectScale`
internamente, quindi gestiscono lo scaling al posto tuo.

### PerfectText

Props chiave: `size` (font base su iPhone 15), `lines` (numero esatto di
righe), `variant` (`content` | `compact`), `containerWidth`, `fontWeight`.
Applica automaticamente l'immunita ai setting di sistema.

```tsx
<PerfectText size={32} lines={2} fontWeight="bold">
  Titolo sempre proporzionato
</PerfectText>
```

Per un wrap identico su tutti i device, passa `containerWidth` (riferito a
iPhone 15): viene scalato linearmente mantenendo lo stesso punto di a capo.

```tsx
<PerfectText size={22} lines={2} containerWidth={140}>
  Dona e{'\n'}Aiuta
</PerfectText>
```

### PerfectContainer

Preset disponibili: `page`, `card`, `section`, `modal`, `header`, `footer`.
Helper: `PageContainer`, `PerfectSection`, `ModalContainer`, `HeaderContainer`,
`FooterContainer`, e `PerfectCardContainer` (export di `CardContainer`).

```tsx
import { PageContainer, PerfectSection } from '@/components/ui';

<PageContainer>
  <PerfectSection>
    <PerfectText size={16} lines={3}>Contenuto</PerfectText>
  </PerfectSection>
</PageContainer>;
```

### PerfectImage

Helper: `PerfectHeroImage`, `PerfectCardImage`, `PerfectThumbnailImage`,
`PerfectAvatarImage`, `PerfectBannerImage`.

### Altri

`PerfectSpacer` (+ `SpacerXS..SpacerXXL`, `SpacerHorizontal`), `PerfectModal`
(+ `SmallModal`, `MediumModal`, `LargeModal`, `FullscreenModal`),
`PerfectIcon`.

---

## Theming

Il provider effettivo dell'app e `ThemeProvider` (da
`src/shared/hooks/useTheme`), che delega a `UniversalThemeProvider`. `App.tsx`
combina inoltre `PaperProvider` (`react-native-paper`, MD3) coi token brand.

Hook a disposizione:

```typescript
import { useTheme } from '@/shared/hooks/useTheme';
import { usePerfectTheme } from '@/shared/hooks/usePerfectTheme';
import { useThemeColors } from '@/shared/hooks/useThemeColors';

const { isDark, toggleTheme, colors } = useTheme(); // token brand
const { universal, brand } = usePerfectTheme(); // palette dinamica + brand
const themeColors = useThemeColors(); // token dark-aware
```

> Nota: `app.config.js` ha `userInterfaceStyle: 'light'`. Il toggle dark esiste
> a livello provider ma l'app parte in light.

---

## System Immunity

`src/shared/utils/SystemImmunity.ts` neutralizza il font-scaling di sistema per
mantenere il layout prevedibile. Nei componenti generici usa `PerfectText`
(che applica gia l'immunita). Per `Text` nativi puoi importare l'helper:

```typescript
import { getImmuneTextProps } from '@/shared/utils/SystemImmunity';

<Text {...getImmuneTextProps()}>Testo immune al font-scaling di sistema</Text>;
```

---

## Aggiungere una feature

La struttura e per dominio sotto `src/features/`. Feature esistenti: `home`,
`actions`, `impact`, `projects`, `about`, `social`, `auth`.

1. Crea `src/features/<nome>/` con le sue schermate/componenti.
2. Riusa i componenti `Perfect*` da `@/components/ui` e lo scaling da
   `@/shared/constants/perfectScale`.
3. Per i colori/tema usa gli hook in `@/shared/hooks`.
4. Registra le rotte in `src/navigation/AppNavigator.tsx`.
5. I componenti generici (senza logica di dominio) vanno in
   `src/components/ui` o `src/components/layout`, NON nelle feature.

Soglie file-size (vedi `docs/standards/file-size.md`): componenti UI `≤300`
righe (verde), hook/helper `≤200`.

---

## Testing

```bash
npm run test                 # tutta la suite
npm run test -- PerfectText  # un singolo file/pattern
npm run test:coverage        # con coverage
npm run snapshot:validate    # snapshot
npm run visual:test          # visual regression
```

Setup: Jest + `jest-expo` + `@testing-library/react-native`. La coverage non
deve regredire sui moduli toccati.

---

## Troubleshooting

### Layout diverso tra dispositivi

Non leggere `Dimensions.get('window')` nei componenti per derivare font/spacing.
Usa le primitive `scale`, `scaleText`, `scaleSpacing`, `scaleTouch` di
`perfectScale`.

```typescript
// Evita
const { width } = Dimensions.get('window');
const fontSize = width > 768 ? 24 : 16;

// Preferisci
const fontSize = scaleText(20);
```

### Testo che va a capo in modo diverso

Usa `PerfectText` con `containerWidth` per fissare il punto di a capo su tutti
i device.

### Dark mode

Usa gli hook (`useTheme`, `usePerfectTheme`, `useThemeColors`) invece di stato
locale e colori hardcoded. Ricorda che a runtime l'app parte in light
(`userInterfaceStyle: 'light'`).

### Import non risolto

Verifica l'alias in `babel.config.js` (`@` → `./src`). Dopo modifiche alla
config potrebbe servire riavviare il bundler con cache pulita
(`expo start -c`).
