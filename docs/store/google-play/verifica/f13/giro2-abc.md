# Righe del revisore giro2-abc

| gravità | file:riga | destinazione |
|---|---|---|
| BLOCCA | `src/shared/auth/AuthContext.tsx:244`, `src/shared/partner/usePartnerExit.ts:128` | C85, corretto in d239d10 |
| IMPORTANTE | `src/shared/auth/accountActions.ts:82`, `src/features/auth/screens/DeleteAccountScreen.tsx:72` | C98, corretto |
| IMPORTANTE | `src/shared/utils/fetchWithTimeout.ts:49`, `src/shared/auth/accountActions.ts:55`, `supabase/functions/delete-account/index.ts:95` | C89, corretto |
| IMPORTANTE | `supabase/migrations/0022_consensi_server_e_oblio.sql:71`, `supabase/migrations/0006_security_hardening.sql:16`, `supabase/migrations/0003_consent_log.sql:16` | C86, corretto in f5f2256 |
| MINORE | `supabase/functions/purge-deletions/index.ts:128`, `src/shared/auth/AuthContext.tsx:358` | residuo R24: purge spento |
| MINORE | `supabase/functions/purge-deletions/index.ts:56`, `supabase/functions/purge-deletions/index.ts:158` | residuo R24: purge spento |
