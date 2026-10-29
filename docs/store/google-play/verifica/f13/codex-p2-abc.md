# Righe del revisore A-B-C

| gravità | file:riga | destinazione |
|---|---|---|
| IMPORTANTE | `src/shared/auth/authLinkExchange.ts:21`, `node_modules/@supabase/auth-js/src/GoTrueClient.ts:1982` | residuo: link falso durante il recupero |
| IMPORTANTE | `src/shared/auth/AuthContext.tsx:443`, `src/features/auth/screens/ProfileScreen.tsx:339` | C79 |
| IMPORTANTE | `supabase/migrations/0003_consent_log.sql:22`, `supabase/migrations/0006_security_hardening.sql:21` | C79 |
| IMPORTANTE | `supabase/migrations/0019_eta_minima_e_bonifica_metadata.sql:484`, `supabase/migrations/0016_claim_su_email_confermata.sql:415` | C79 |
| IMPORTANTE | `supabase/functions/purge-deletions/index.ts:128`, `src/shared/auth/AuthContext.tsx:358` | residuo: purge spento |
| IMPORTANTE | `supabase/functions/purge-deletions/index.ts:55`, `supabase/functions/purge-deletions/index.ts:156` | residuo: purge spento |
| MINORE | `src/shared/auth/useAuthDeepLink.ts:97`, `src/locales/it.ts:223` | residuo: respinto, scelta voluta |
| MINORE | `supabase/functions/delete-account/index.ts:95` | C60 |
