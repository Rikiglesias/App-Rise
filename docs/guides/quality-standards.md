# Quality Standards — Rise Against Hunger Italia

Standard di qualità del codice e workflow QA reali del progetto (Expo SDK 54
managed, React Native 0.81, TypeScript). Questo documento descrive ciò che è
effettivamente configurato e applicato nel repo, non obiettivi aspirazionali.

## Indice

1. [Principi](#principi)
2. [Workflow QA](#workflow-qa)
3. [TypeScript](#typescript)
4. [ESLint](#eslint)
5. [Prettier](#prettier)
6. [Test](#test)
7. [Soglie file-size](#soglie-file-size)
8. [Protezione branch master](#protezione-branch-master)
9. [CI/CD](#cicd)

---

## Principi

- Zero tolleranza su errori bloccanti: `npm run conta-problemi` deve tornare `0`
  prima di committare. Aggrega TypeScript, ESLint (con `--max-warnings 0`),
  Prettier, Jest e markdownlint con exit code bloccante.
- Niente correzioni automatiche silenziose: lo script `fix-manuale` è
  volutamente disabilitato; le correzioni si fanno a mano in modo controllato.
- Le soglie di dimensione file sono enforce in ESLint e variano per contesto
  (vedi [Soglie file-size](#soglie-file-size)).

---

## Workflow QA

Comandi reali definiti in `package.json`.

### Pre-modifica

```bash
npm run pre-modifiche
```

Esegue il workflow di controllo prima di iniziare a lavorare
(`scripts/workflow-pre-modifiche.js`). Blocca se i controlli falliscono.

### Post-modifica (prima del commit/push)

```bash
npm run post-modifiche
```

Convalida i controlli dopo le modifiche (`scripts/workflow-post-modifiche.js`).

### Controllo rigoroso (debug rapido)

```bash
npm run conta-problemi
```

Riepilogo unico di errori/warning TypeScript, ESLint, Prettier, Jest e
markdownlint, con exit code bloccante. È lo stesso comando invocato dall'hook
Husky `pre-commit` (tramite `check:strict`) insieme a `lint-staged`.

### Comandi granulari

```bash
npm run typecheck     # tsc --noEmit
npm run lint          # eslint src/ App.tsx index.ts (--max-warnings 0)
npm run test          # jest
npm run test:coverage # jest --coverage
npm run format        # prettier --write src/
```

---

## TypeScript

Il typecheck è `tsc --noEmit` (`npm run typecheck`). La configurazione vive in
`tsconfig.json`; ESLint usa il typed linting con `project: ['./tsconfig.json']`
per i file `.ts`/`.tsx`.

Regole TypeScript critiche (da `.eslintrc.js`):

- `@typescript-eslint/no-explicit-any`: `error`
- `@typescript-eslint/no-non-null-assertion`: `error` (usa optional chaining)
- `@typescript-eslint/no-var-requires`: `error` (usa ES6 import)
- `@typescript-eslint/no-floating-promises`: `error`
- `@typescript-eslint/require-await`: `error` (sui file TS tipizzati)

---

## ESLint

Config: `.eslintrc.js` (formato legacy `extends`/`overrides`). Estende `expo`,
`react`, `react-hooks`, `@typescript-eslint` e `import`. Eseguito con
`--max-warnings 0` da `npm run lint` e dall'hook pre-commit.

### Enforcement del sistema layout

- `no-restricted-imports`: vieta i componenti legacy
  (`FormattedText`, `ResponsiveBox`, `ResponsiveStack`, `ResponsiveCard`,
  `ResponsiveImage`, `useResponsiveLayout`, ...) e l'import diretto di `Text` /
  `Image` da `react-native`, indirizzando verso `PerfectText` / `PerfectImage` /
  `PerfectContainer`. Eccezioni dichiarate negli `overrides` (file dei Perfect*
  e alcuni componenti header).
- `no-restricted-properties`: vieta `Dimensions.get` per il layout (usa il
  sistema di scaling), con override che lo riabilita nei test (per il mocking).

### Regole generali

- `no-explicit-any`: `error`; `no-non-null-assertion`: `error`;
  `no-floating-promises`: `error`
- `prefer-const`: `error`; `no-var`: `error`; `no-debugger`: `error`
- `no-console`: `warn` (permesso in sviluppo)
- `unused-imports/no-unused-imports`: `error`
- `max-lines-per-function`: `error` con `max: 350` (200 nei test)
- `max-lines`: configurato per contesto negli `overrides` (vedi sotto)

### Regola custom (non attiva)

`eslint-rules/no-offgrid-spacing.js` impone spacing multipli di 8dp ma **non è
collegata** alla config: la cartella `eslint-rules/` è in `ignorePatterns` e la
regola può essere abilitata in futuro se serve un enforcement rigido della
griglia.

---

## Prettier

Formatter standard (`prettier`). Verifica con `--check` (in CI e
`conta-problemi`), fix con `npm run format` o `npm run prettier:fix-all`. La
configurazione vive nel file Prettier del repo; `lint-staged` esegue
`prettier --write` sui file staged.

---

## Test

- Runner: Jest con `jest-expo` e `@testing-library/react-native`.
- Comandi: `npm test`, `npm run test:watch`, `npm run test:coverage`.
- Test visivi/snapshot: `npm run visual:test`, `npm run snapshot:validate`,
  `npm run protection:full`.

Non esiste una soglia di coverage globale enforce nel repo: la coverage viene
raccolta (`test:coverage`) e caricata come artefatto in CI, ma il gate
bloccante è il passaggio dei test, non una percentuale fissa.

---

## Soglie file-size

Enforce via ESLint (`max-lines`, `skipBlankLines`/`skipComments`) con override
per contesto. Riferimento canonico: `docs/standards/file-size.md`.

| Contesto | Verde | Rosso (ESLint `max-lines`) |
| --- | --- | --- |
| Componenti UI (`src/components/**`) | ≤ 300 | > 500 → error |
| Screen / dominio (`*Screen*`, `src/screens/**`) | ≤ 400 | > 800 → error |
| Hook / helper (`use*.ts`, `src/shared/utils/**`) | ≤ 200 | > 400 → error |
| Constants / design token | ≤ 400 | > 800 → error |
| File di config / build | ≤ 150 | > 300 → error |
| File di test | ≤ 600 | > 1000 → error |

Comandi di analisi: `npm run filesize:analyze`, `npm run filesize:report`,
`npm run refactor:check`.

---

## Protezione branch master

`master` è l'unico branch a lunga vita (ruleset `linear-history`: merge via
squash o rebase, niente merge-commit). Regole definite in `.github/ruleset.yml`:

- Pull Request obbligatoria; force-push e delete vietati.
- Status check richiesti dai job del workflow CI prima del merge.

---

## CI/CD

Workflow reali in `.github/workflows/`:

- `optimized-ci-cd.yml`: quality gate (job matrix `typescript`, `eslint`,
  `prettier`, `tests`), visual-regression su matrice device, build/submit EAS su
  trigger `[build]`, OTA su `[ota]`/`[hotfix]`, bundle analysis + `npm audit`.
- `ota-deploy.yml`: OTA manuale (`eas update`).
- Altri: `cache-management.yml`, `deadcode-check.yml`, `legacy-guard.yml`,
  `edge-functions-test.yml`.

Build e deploy passano sempre per EAS (`build:ios` = `eas build`,
`update:production` = `eas update`, `deploy:ios` = `scripts/deploy-ios.ps1`).
Non sono usati Fastlane né directory `ios/`/`android/` di build native committate
nel flusso EAS managed.
