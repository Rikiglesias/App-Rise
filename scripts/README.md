# Scripts – Operatività e QA

Guida rapida agli script disponibili per sviluppo, QA e delivery.

## Quality Assurance (Zero Tolleranza)
- `npm run pre-modifiche`
  - Esegue: TypeScript (`tsc --noEmit --skipLibCheck`), ESLint (`--max-warnings 0`), Prettier (`--check`), Test (Jest)
  - Blocca con exit code > 0 se rileva errori o warnings
- `npm run post-modifiche`
  - Ripete i controlli chiave e autorizza il commit (report finale)
- `npm run conta-problemi`
  - Conteggio rigoroso di errori/warnings (TS/ESLint/Prettier/Jest) con riepilogo

## Lint/Format/Typecheck
- `npm run typecheck` / `npm run typecheck:watch`
- `npm run lint` / `npm run lint:fix`
- `npm run format` / `npm run prettier:fix-all`

## Test e Snapshot
- `npm test` / `npm run test:watch` / `npm run test:coverage`
- `npm run snapshot:generate` / `npm run snapshot:update` / `npm run snapshot:validate`
- `npm run visual:test` (visual regression scope)

## CI/CD e Deploy
- `npm run doctor` (Expo doctor)
- `npm run build:ios` / `npm run build:android` / `npm run build:all`
- `npm run submit:ios` / `npm run submit:android` / `npm run submit:all`
- `npm run preview` (EAS build profile preview)

## OTA Updates
- `npm run update` / `npm run update:dev|preview|production|hotfix|auto`
- `npm run update:gui` (PowerShell helper)

## Analisi e Ottimizzazioni
- `npm run bundle:analyze` / `npm run bundle:report`
- `npm run filesize:analyze` / `npm run filesize:report`
- `npm run refactor:check`

## Git/Windows helpers
- `npm run setup:git-windows` (autocrlf/safecrlf/filemode)
- `npm run fix:line-endings` (normalizza EOL + staging)

## Note
- Gli script sono pensati per integrarsi con la protezione del branch `master` e con i job richiesti dal workflow CI.
  Usa sempre `npm run pre-modifiche` prima di aprire una PR; `npm run post-modifiche` prima del push.