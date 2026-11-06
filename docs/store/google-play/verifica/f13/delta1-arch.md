# Righe del revisore delta1-arch

| gravità | file:riga | destinazione |
|---|---|---|
| ALTA | `src/shared/auth/useConsentState.ts:131`, `src/shared/auth/AuthContext.tsx:515`, `src/__tests__/shared/auth/consensiLetturaSuperata.test.tsx:31` | C90, corretto |
| ALTA | `src/shared/auth/useLegataAllUtente.ts:30`, `src/features/auth/hooks/useProfileEditSubmit.ts:233`, `src/__tests__/features/auth/schermateLegateAllUtente.test.tsx:136` | C97, corretto |
| MEDIA | `src/shared/partner/usePartnerExit.ts:257`, `src/shared/partner/usePartnerExit.ts:185` | C85, corretto |
| MEDIA | `src/shared/auth/accountActions.ts:95`, `src/shared/auth/accountActions.ts:165`, `src/shared/auth/AuthContext.tsx:309` | residuo: cancellazione di A riuscita mentre entra B, poi corretto in 6fc41d4 (U5 del delta 2) |
| BASSA | `supabase/tests/0022_consensi_server_e_oblio.test.sql:83`, `supabase/migrations/0022_consensi_server_e_oblio.sql:74` | C79, corretto |
