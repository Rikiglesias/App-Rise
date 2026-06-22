# Architettura — Rise Against Hunger Italia

App mobile Expo (managed) + EAS. Documento di riferimento sull'architettura
reale del codebase: scaling proporzionale, theming, struttura feature-based,
autenticazione donatori e deploy.

## Indice

1. [Stack tecnologico](#stack-tecnologico)
2. [Struttura del progetto](#struttura-del-progetto)
3. [Perfect System — scaling proporzionale](#perfect-system--scaling-proporzionale)
4. [Theming](#theming)
5. [Autenticazione donatori](#autenticazione-donatori)
6. [Navigazione](#navigazione)
7. [Build e deploy](#build-e-deploy)
8. [Qualita e testing](#qualita-e-testing)

---

## Stack tecnologico

- **Runtime**: React Native `0.81.5` + React `19.1.0`, Expo SDK `~54` (managed
  workflow).
- **UI**: `react-native-paper` (Material Design 3) + componenti `Perfect*`
  proprietari per uno scaling consistente.
- **Navigazione**: `@react-navigation` (native-stack + bottom-tabs).
- **Backend**: Supabase (`@supabase/supabase-js`) per auth donatori e dati.
- **Crash reporting**: Sentry (`@sentry/react-native`), attivo solo se
  `EXPO_PUBLIC_SENTRY_DSN` e impostato.
- **Storage sicuro**: `expo-secure-store` (token/sessione auth).
- **Aggiornamenti**: EAS Update (OTA) + EAS Build.

---

## Struttura del progetto

Lo `src/` e organizzato per feature, con una cartella `shared/` per il codice
trasversale e `components/` per i componenti UI generici (senza logica di
dominio).

```text
src/
├── components/
│   ├── ui/             # Componenti generici (Perfect*, Platform*, Logo, ...)
│   └── layout/         # Componenti di layout
├── features/           # Moduli per dominio
│   ├── home/
│   ├── actions/
│   ├── impact/
│   ├── projects/
│   ├── about/
│   ├── social/
│   └── auth/           # Schermate auth donatori
├── shared/
│   ├── auth/           # AuthContext, supabaseClient, socialAuth, consensi, ...
│   ├── config/
│   ├── constants/      # perfectScale.ts (SSOT scaling), designTokens, ...
│   ├── data/
│   ├── hooks/          # useTheme, usePerfectTheme, useThemeColors, ...
│   ├── screens/
│   ├── services/       # displayZoom, logger, ...
│   ├── theme/          # UniversalTheme, adaptiveColors
│   ├── types/
│   └── utils/          # SystemImmunity, logger, ...
├── navigation/         # AppNavigator
└── locales/            # i18n
```

### Alias di import

Configurati in `babel.config.js` (con `root: ['./src']`):

| Alias         | Path                |
| ------------- | ------------------- |
| `@`           | `./src`             |
| `@components` | `./src/components`  |
| `@shared`     | `./src/shared`      |
| `@features`   | `./src/features`    |
| `@assets`     | `./assets`          |

Esempio: `import { scale } from '@/shared/constants/perfectScale';`.

---

## Perfect System — scaling proporzionale

La SSOT dello scaling e `src/shared/constants/perfectScale.ts`. Lo scaling NON
e basato sulla sola larghezza ne su un database di dispositivi: usa la
**diagonale** dello schermo (Teorema di Pitagora) rispetto al riferimento
iPhone 15, cosi da bilanciare aspect ratio diversi (phone vs tablet).

### Riferimento e diagonale

```typescript
export const LOGICAL_REFERENCE = { width: 393, height: 852, scale: 2 } as const;
// Diagonale di riferimento iPhone 15: √(393² + 852²) ≈ 938.27px
```

### Primitive esportate

| Funzione                            | Scopo                                                        |
| ----------------------------------- | ----------------------------------------------------------- |
| `scale(value)`                      | Scaling proporzionale alla diagonale (con cap tablet)       |
| `scaleText(value)`                  | Font size — `scale()` puro per wrapping identico            |
| `scaleSpacing(value)`               | Padding/margin — cap a `1.5x` su tablet (`large`)           |
| `scaleTouch(value)`                 | Touch target — minimo `44px` su device piccoli (`small`)    |
| `scaleWithDimensions(value, w, h)`  | Come `scale()`, ma con dimensioni gia note (hook/test)      |
| `getWindowDimensions()`             | Unico punto autorizzato per `Dimensions.get('window')`      |
| `getDeviceType()` / `classifyDeviceType(min)` | Classifica `small` / `normal` / `large`           |

Helper aggiuntivi: `clamp`, `scaleClamp`, `scaleIcon`, `scaleBadge`.

### Cap progressivo su tablet

Per evitare ingrandimenti eccessivi su iPad, oltre la soglia `1.1x` viene
applicato un cap progressivo (easing) fino a `maxScale = 1.3`. I telefoni
(sotto soglia) restano inalterati.

```text
iPhone SE  ≈ 0.83x   iPhone 15  = 1.00x (reference)   iPhone Pro Max ≈ 1.07x
iPad Mini  ≈ 1.15x (cap, era 1.36x)   iPad Pro 12.9" ≈ 1.20x (cap, era 1.82x)
```

### Componenti Perfect

In `src/components/ui/` esistono componenti che consumano `perfectScale`:

- `PerfectText` — font scalato via `scaleText`, righe esatte, immunita ai
  setting utente (`SystemImmunity`).
- `PerfectContainer` (+ `PageContainer`, `PerfectSection`, `ModalContainer`,
  `HeaderContainer`, `FooterContainer`) — padding/spacing scalati.
- `PerfectImage` (+ `HeroImage`, `CardImage`, `ThumbnailImage`, `AvatarImage`,
  `BannerImage`).
- `PerfectSpacer`, `PerfectModal`, `PerfectIcon`.

Tutti esportati da `src/components/ui/index.ts`.

### System Immunity

`src/shared/utils/SystemImmunity.ts` neutralizza il font-scaling di sistema
(es. `allowFontScaling`, `maxFontSizeMultiplier`) cosi che il layout resti
prevedibile a prescindere dalle impostazioni di accessibilita. `PerfectText`
applica questi props tramite `getImmuneTextProps`.

---

## Theming

Il provider effettivo dell'app e `ThemeProvider` (da `src/shared/hooks/useTheme`),
che delega a `UniversalThemeProvider` (`src/shared/theme/UniversalTheme.tsx`).
`App.tsx` monta inoltre `PaperProvider` di `react-native-paper`, fondendo
`MD3LightTheme` / `MD3DarkTheme` con i token brand.

> Nota: in `app.config.js` `userInterfaceStyle` e `'light'`. Il toggle dark
> esiste a livello di provider ma a runtime l'app parte in light.

### Hook disponibili

| Hook                | Ritorna                                                         |
| ------------------- | -------------------------------------------------------------- |
| `useTheme()`        | `{ isDark, toggleTheme, colors }` (token brand)                |
| `usePerfectTheme()` | `{ isDark, universal, brand }` (palette dinamica + token brand)|
| `useThemeColors()`  | Design token dark-aware (stessa forma di `Colors`)             |

In `App.tsx` il `Main` usa `usePerfectTheme()` per costruire il `paperTheme`:

```typescript
const { isDark, universal, brand } = usePerfectTheme();
const baseTheme = isDark ? MD3DarkTheme : MD3LightTheme;
const paperTheme = {
  ...baseTheme,
  colors: {
    ...baseTheme.colors,
    primary: brand.primary[500],
    background: universal.primary,
    surface: universal.card,
  },
};
```

---

## Autenticazione donatori

L'app include un flusso completo di auth donatori su Supabase.

- **Schermate** (`src/features/auth/`): `SignUpScreen`, `LoginScreen`,
  `CompleteProfileScreen`, `ForgotPassword`, `ResetPassword`.
- **Core condiviso** (`src/shared/auth/`): `AuthContext`, `supabaseClient`,
  `socialAuth`, `validation`, `consent`, `dataExport`, `authStorage`,
  `useAuthDeepLink`.
- **Storage**: token e sessione tramite `expo-secure-store` (`authStorage.ts`).
- **GDPR**: consensi tracciati (policy/consent events), export dati
  implementato (`dataExport.ts`), hard-delete account via edge function.
- **Deep link**: schema `rahitalia` per il reset password (gestito da
  `useAuthDeepLink`).

`AuthProvider` avvolge l'albero applicativo in `App.tsx`, sotto `ThemeProvider`.

---

## Navigazione

`src/navigation/AppNavigator.tsx` definisce la navigazione (native-stack +
bottom-tabs di `@react-navigation`). E montato dentro `Main`, sotto
`PaperProvider`.

---

## Build e deploy

Workflow managed Expo + EAS.

- **Build**: `eas build` (`npm run build:ios` / `build:android` / `build:all`).
- **Submit**: `eas submit` (`npm run submit:ios` / `submit:android`).
- **OTA Update**: `eas update` (`npm run update:production`, ecc.).
- **Script deploy**: `npm run deploy:ios` / `deploy:android` (wrapper PowerShell
  in `scripts/`).

CI/CD reale in `.github/workflows/`:

- `optimized-ci-cd.yml` — quality gate + EAS build/submit.
- `ota-deploy.yml` — EAS update manuale.

Logica OTA runtime: `App.tsx` (versione nativa) usa `Updates.useUpdates()` per
mostrare `OTAUpdateScreen` durante download/applicazione dell'update.

Branch: solo `master` (ruleset linear-history, squash/rebase).

---

## Qualita e testing

- **Type check**: `npm run typecheck` (`tsc --noEmit`).
- **Lint**: `npm run lint` (ESLint, `--max-warnings 0`).
- **Test**: `npm run test` (Jest), `npm run test:coverage`.
- **Conteggio problemi**: `npm run conta-problemi`.
- **Workflow**: `npm run pre-modifiche` / `npm run post-modifiche`.
- **Snapshot / visual**: `npm run snapshot:generate|update|validate`,
  `npm run visual:test`.

ESLint custom: `eslint-rules/no-offgrid-spacing.js` (regola presente nel repo).

Soglie file-size canoniche in `docs/standards/file-size.md` (UI `≤300` righe
verde, hook/helper `≤200`).
