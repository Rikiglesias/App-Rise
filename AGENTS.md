# App Rise — istruzioni per gli agenti (Claude Code e Codex)

App mobile di Rise Against Hunger Italia (pacchetto `riseagainsthungeritalia`).
Fonte unica: `CLAUDE.md` importa questo file e non aggiunge regole.

## Stack

- Expo SDK 54, React Native 0.81, React 19, TypeScript 5.9 strict, React Navigation 7.
- Supabase (`supabase/`: migration, functions, test), Sentry, traduzioni in `locales/` (it, en).
- Build e store con EAS (`eas.json`); aggiornamenti OTA con `eas update`.

## Comandi

- Prima di modificare `npm run pre-modifiche`, dopo `npm run post-modifiche`.
- Gate unico, lo stesso del pre-commit: `npm run conta-problemi` deve dare 0
  (typecheck, ESLint a zero warning, markdownlint anche su questo file, Prettier, Jest).
- Singoli: `npm run typecheck`, `npm run lint`, `npm test`, `npm run test:acceptance` (Vitest).

## Regole del dominio

- Interfaccia: vale il Perfect System di `.cursorrules` (leggilo prima di toccare `src/`).
  Usa `PerfectText`, `PerfectImage`, `PerfectContainer`, `useUniversalTheme`; mai `Dimensions.get` né breakpoint a mano.
- Verifica visiva di accettazione sul nativo (development build o simulatore).
  La web preview è solo una bozza: alcuni moduli nativi (per esempio `expo-secure-store`) mancano e le misure cambiano.
- Database e utenti sono veri: migration remote, SQL che scrive, `npm run update:production` e `submit:*`
  si fanno solo col sì di Riccardo.
- Commit in italiano nella forma `tipo(ambito): frase`, come in `git log`.
  Il branch `master` è regolato da `.github/ruleset.yml`.
- Approfondimenti: `CONTRIBUTING.md`, `docs/guides/development.md`, `docs/guides/quality-standards.md`.
