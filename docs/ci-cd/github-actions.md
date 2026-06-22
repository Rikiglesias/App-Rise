# 🤖 CI/CD con GitHub Actions (EAS)

La pipeline è costruita su **Expo EAS** dentro GitHub Actions. Le build, la firma e i submit
agli store sono delegati a EAS; i runner GitHub eseguono i quality gate e orchestrano i
comandi `eas`. Non si usano Fastlane, Gemfile né cartelle native `ios/`/`android/` committate.

## 📂 Workflow reali

| File | Trigger | Cosa fa |
| --- | --- | --- |
| `.github/workflows/optimized-ci-cd.yml` | push/PR su `master`, `workflow_dispatch` | Quality gate + build/submit EAS + OTA automatici |
| `.github/workflows/ota-deploy.yml` | solo `workflow_dispatch` (manuale) | Deploy OTA on-demand con retry |

> Esistono anche workflow ausiliari (`cache-management.yml`, `deadcode-check.yml`,
> `edge-functions-test.yml`, `legacy-guard.yml`), non di rilascio.

## 🔁 `optimized-ci-cd.yml` — pipeline principale

### Job

1. **`detect-changes`** — legge il messaggio di commit (passato via env, mai interpolato in
   bash per evitare script injection) e i file modificati, e decide cosa eseguire
   (`should-test`, `should-build`, `build-ios`, `build-android`, `test-scope`).
2. **`quality-checks`** — matrice `typescript` / `eslint` / `prettier` / `tests`
   (`tsc --noEmit`, `eslint --max-warnings 0`, `prettier --check`, `jest --coverage`).
3. **`visual-regression`** — visual diff su matrice di device (iPhone SE/15 Pro, Pixel 8 Pro,
   Galaxy Tab S9).
4. **`build-ios` / `build-android`** — `eas build --profile production-store --wait`; su
   `master` seguono `eas submit --latest` (Android con `continue-on-error`).
5. **`ota-update`** — pubblica `eas update --branch production` se il commit contiene un tag OTA.
6. **`bundle-analysis`** — analisi bundle + `npm audit` / `audit-ci`.
7. **`deployment-summary`** — riepilogo nel job summary e commento su PR.
8. **`unit-tests` (`test`)** e **`build-summary` (`build`)** — check dedicati esposti come
   status su PR.

### Trigger via tag nel commit

Il comportamento è guidato da tag nel **messaggio di commit**:

| Tag | Effetto |
| --- | --- |
| `[build]` | Build iOS **e** Android (`production-store`) |
| `[build ios]` / `[build-ios]` | Solo iOS |
| `[build android]` / `[build-android]` | Solo Android |
| `build:` (prefisso conventional) | Build entrambe le piattaforme |
| `[ota]` / `[hotfix]` / `hotfix:` | Pubblica un OTA su branch `production` |

`[ota]` e `[build*]` sono mutuamente esclusivi: il job OTA parte solo se **non** sono presenti
tag di build, così un commit di build non scatena anche un OTA.

```bash
git commit -m "feat: schermata impatto [build]"   # → build + submit iOS/Android
git commit -m "fix: copy donazioni [ota]"           # → OTA su production
```

`workflow_dispatch` espone anche input manuali: `force_build`, `build_platform`
(`both`/`ios`/`android`), `force_ota`.

## 🚀 `ota-deploy.yml` — OTA manuale

Workflow **solo manuale** (`workflow_dispatch`) per pubblicare un update OTA on-demand:

- Input: `message` (messaggio custom) e `branch` (`production` / `preview` / `development`).
- Job `quality-checks`: `tsc --noEmit` bloccante; ESLint, test e `conta-problemi` non
  bloccano il deploy (`continue-on-error`).
- Job `deploy-ota`: `eas update --branch <branch> --message <…>` con **retry fino a 3
  tentativi**.
- Job `notify-result`: stato finale del deploy.

## 🔐 Secrets richiesti

| Secret | Uso |
| --- | --- |
| `EXPO_TOKEN` | Autenticazione EAS CLI nei runner (`expo/expo-github-action`) |
| `APPLE_ID`, `ASC_APP_ID`, `APPLE_TEAM_ID` | Submit iOS (valori store anche in `eas.json`) |

Il service account Google per il submit Android è referenziato da `eas.json`
(`./google-service-account.json`) e gestito lato credenziali EAS.

## ⚙️ Configurazione runner

- Node: `20.x` (`NODE_VERSION`) — `20.17.0` nel workflow OTA, coerente con
  `eas.json` → `build.production.node`.
- Install: `npm ci --prefer-offline --no-audit` (CI principale),
  `npm ci --legacy-peer-deps` (OTA).
- EAS CLI: `expo/expo-github-action@v8` con `eas-version: latest`.
- `concurrency` con `cancel-in-progress: false` per non interrompere build/OTA in corso.

## 🧪 Riprodurre i check in locale

```bash
npm run typecheck     # tsc --noEmit
npm run lint          # eslint --max-warnings 0
npm run test          # jest
npm run conta-problemi
```

## 🔗 Monitoraggio

Build e update sono visibili su EAS:
[expo.dev/accounts/rikiglesias/projects/rise-against-hunger-italia](https://expo.dev/accounts/rikiglesias/projects/rise-against-hunger-italia).

Per i flussi di deploy e i comandi EAS lato sviluppatore vedi
[docs/guides/deployment.md](../guides/deployment.md).
