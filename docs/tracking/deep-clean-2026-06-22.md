# Deep-clean codebase 360° — App Rise — 2026-06-22

> Audit read-only via Workflow fan-out (8 agenti, aree A-H). Branch base: `master @03ee92d`. Fix su `chore/deep-clean`.
> Metodo: zero-Q regression-safe a chunk ≤15 file, ogni chunk verificato (tsc/eslint/test/madge). Binding: `~/todos/deep-clean.md`.

## Baseline misurata (ground truth)
- `tsc --noEmit` = **0 errori**
- `eslint --max-warnings 0` = **0**
- `madge --circular --ts-config tsconfig.json` = **0 circular** (280 file, alias `@/` risolti dal tsconfig)
- `ts-prune -u` = 352 candidati (la maggioranza falsi positivi da barrel)
- Test dominio auth: 16 suite / 108 verdi

## Stato per area
| Area | Esito | Findings |
|---|---|---|
| A — Struttura & architettura | Sana (0 circular, no god node, barrel espliciti) | 6 |
| B — Dead code & duplicazione | 2 barrel orfani + dup auth recente | 11 |
| C — Type safety | Solida (no `!`, nav tipizzata); i18n/manifest da stringere | 5 |
| D — Test | Basi solide; gap su signup/social/deeplink + skip recuperabili | 10 |
| E — i18n | Parità 297=297; 67 orfane + hardcoded (1 bug L10n reale) | 8 |
| F — Sicurezza & compliance | **Matura**: no secret/PII, GDPR robusto, RLS WITH CHECK | 5 (tutti note) |
| G — Performance | Curata; problemi **sistemici** nel design system | 7 |
| H — Config & tooling | 2 dep phantom + scope lint/config morti | 10 |

**Totale: 62 — 0 critical, 6 high, 23 medium, 33 low.**

## HIGH (6, tutti bounded)
1. **Barrel orfani** `src/features/index.ts`, `src/shared/index.ts` — 0 consumer (ri-verificato), violano "no barrel". → eliminare. [B]
2. **Tipi home conflittuali** `EntraInAzioneProps`/`HomeScreenProps` definiti 2× con shape diverse: `home/types/index.ts:23` vs `home/types/HomeScreenTypes.ts:9,20`. → consolidare. [B]
3. **Phantom dep `rn-country-select`** importato in `AuthPhoneField.tsx:7`, non in package.json (solo transitiva). → aggiungere dipendenza. [H]
4. **Phantom dep `expo-constants`** in 6+ file core (environment/BottomTabNavigator/perfectScale/displayZoom/SystemImmunity/ActionCTAButtons). → `expo install expo-constants`. [H]
5. **`getAdaptiveColors` dark-mode** crea nuovo oggetto `colors` ogni render → invalida `useMemo(createStyles,[colors])` in 35 file. `adaptiveColors.ts:48-49`. → costante `DARK_COLORS` a livello modulo (2 righe). [G]
6. **`useSignUpForm` submit** coperto 55%/33% (righe 141-155, path di acquisizione donatore). → test dedicato. [D]

## MEDIUM (23) — selezione bounded prioritaria
- **Legacy Pattern Guard aggirato**: `OTAUpdateScreen.tsx:11-18` (Text+Image) e `ErrorBoundary.tsx` (Text) usano import multilinea raw non rilevati dalla regex single-line del guard (`legacy-guard.yml:33,44`). → migrare OTAUpdateScreen a Perfect*, allowlist esplicita per ErrorBoundary, indurire regex. [A]
- **Bug L10n reale**: `MapModalScreen.tsx:122,139,147` hardcoda 3 stringhe IT che esistono già come chiavi orfane (`impact.loadingMap/interactiveMap/tapPins`) → schermata non si traduce in EN. Idem `ProjectContent.tsx:61` ('Impatto' vs `projects.impact`). → cablare `t()`. [E]
- **Dup auth (recente, 03ee92d)**: sezioni JSX `CompleteProfileScreen`↔`SignUpScreen` (~58 righe); hook `useProfileForm`↔`useSignUpForm` (clearError/onChange/selectComune/togglePrivacy ~62 righe); `validation.ts` blocco campi comuni (59-68↔86-95). → estrarre `<ProfileFieldsSection>`, `useFieldErrors`/`useComuneSelection`, `validateCommonProfileFields`. [B]
- **manifest cast duplicato 7× su 4 file** (`SystemImmunity`/`BottomTabNavigator`/`perfectScale`/`ActionCTAButtons`) con default divergenti. → helper tipato unico SSOT. [C]
- **i18n `t()` senza key-checking** + `TranslationKeys` dead (`useTranslation.ts:17,34`, `types.ts:9`). → tipo dot-path. [C]
- **`SupportedLocale` 19 lingue vs 2 registrate** (`types.ts:12-31`). → derivare dal runtime. [C]
- **`environment.ts` API deprecata `Constants.manifest`** (138,144,244,247): staging-detection morta + 2 eslint-disable. → migrare a `expoConfig.extra`. [C]
- **`useTranslation` fallback try/catch morto** (35-42): i18n-js non lancia, mostra `[missing ...]`. → `missingBehavior`/handler. [E]
- **Test skip recuperabili**: `SystemImmunity.test.ts:8` (2 test validi), `SocialIcon.test.tsx:7` (30+ test). → un-skip/mock. [D]
- **`password_mismatch` branch mai testato** (`validation.ts:58-59`). → +1 caso test. [D]
- **`useAuthDeepLink` 0% / `socialAuth` 53%** coverage. → test dedicati. [D]
- **lint scope divergente**: `scripts/**/*.js` e `*.config.js` MAI lintati (override `.eslintrc.js` morti). → unificare scope. [H]
- **`forceConsistentCasingInFileNames` mancante** → rischio build Linux/CI. [H]
- **`PerfectText/Container/Image` non in `React.memo`** + `getImmuneTextProps` legge config ogni render. [G]

## LOW (33) — igiene
- 3 asset `.png.backup` orfani (`assets/icons/social/`). [B]
- 2 devDep eslint non cablate (`eslint-plugin-jsx-a11y`, `eslint-plugin-jest`). [B/H]
- ~15 export davvero morti (`result.ts`/`logger.ts` helper, `export default` ridondanti in `PlatformIcon`/`useTheme`). [B]
- 67 chiavi i18n orfane (residui refactor). [E]
- `scale()` ricalcola `referenceDiagonal` costante ogni chiamata. [G]
- `useProjectsData` array literal fresco ogni render. [G]
- `searchComuni` senza debounce (7904 voci/keystroke). [G]
- npm script duplicati + `tsconfig.ts-prune.json` orfano + `quality:full` muta dopo i check. [H]
- `target es2020` override; import-resolver TS non configurato; regole eslint critiche a `warn`. [H]
- graphify stale (`graphify update .`). [A]
- file >300 righe candidati split (OTAUpdate 574, DevelopmentScreen 470, BottomTabNavigator 414, ProjectDetailModal 367). [A]
- doppio barrel `components/index.ts`↔`components/ui/index.ts`. [A]
- vari hardcoded string minori + accessibilityLabel. [E]

## NON bounded → `~/todos/improvements-proposed.md` (refactor ampi/rischiosi, task dedicati)
- AuthContext SRP: estrarre `authService`/repository (486 righe, 13 supabase.* inline). [A]
- Convenzione naming IT/EN cross-feature (rename tocca import/test/nav). [C]
- Snapshot full-tree → assert comportamentali (HomeScreen 842/EntraInAzione/MapSection). [D]
- WorldMapSvg lazy-load nel tab Impact. [G]
- Guard CI anti-orfane/anti-hardcoded i18n (nuovo tooling). [E]
- ErrorBoundary i18n (class component, scelta architetturale t()). [E]

## Piano fix a chunk (regression-safe, ogni chunk: tsc+eslint+test+madge verdi → commit)
- **Chunk 1 — dead code/asset** [B,low+high]: elimina 2 barrel orfani + 3 `.backup`.
- **Chunk 2 — phantom deps** [H,high]: `+rn-country-select`, `expo install expo-constants`.
- **Chunk 3 — type/dedup safe** [B/C]: tipi home conflittuali; export `default` ridondanti; ~15 dead export.
- **Chunk 4 — perf design-system** [G,high+]: `getAdaptiveColors` DARK_COLORS; `scale()` REFERENCE_DIAGONAL; `getImmuneTextProps` config-cache.
- **Chunk 5 — i18n** [E]: cablare `t()` su MapModalScreen/ProjectContent (bug L10n); rimuovere 67 orfane in coppia; fallback `missing`.
- **Chunk 6 — test** [D,high]: un-skip SystemImmunity; +password_mismatch; +useSignUpForm submit; +useAuthDeepLink/socialAuth; SocialIcon.
- **Chunk 7 — config/tooling** [H]: forceConsistentCasing; scope lint; npm-script dedup; tsconfig.ts-prune orfano; devDep eslint.
- **Chunk 8 — Legacy guard** [A]: OTAUpdateScreen→Perfect*; ErrorBoundary allowlist; hardening regex.
- Dedup auth (sezioni/hook/validation) → chunk dedicato dopo i precedenti (tocca codice recente, verifica visiva).

## End-state
- [x] Audit 360° A-H → questo report.
- [x] Fix bounded critical+high regression-safe → **batch 1** (PR #42 `6bbdd8c`): 6 HIGH + 0 critical.
- [~] Fix bounded medium/low → **batch 2** (branch `chore/deep-clean-2`, ogni chunk conta-problemi=0):
  - [x] Bug L10n i18n `aa43c2c` · [x] config (forceConsistentCasing + ts-prune orfano) `d1f43c5` · [x] i18n-types (SupportedLocale runtime + TranslationKeys/types.ts dead) `eff3034` · [x] 3 asset `.backup` orfani.
  - [ ] Residui delicati (manifest SSOT + environment.ts, dot-path t(), legacy-guard, dup auth, test un-skip, dead-export adversariale) → turno dedicato.
- [x] Residui non-bounded/policy → `~/todos/improvements-proposed.md` (sezione 2026-06-22, aggiornata).
- [ ] PR batch 2 su master (rebase+admin, CI verde).
