# Righe del revisore delta2-f2

| gravità | file:riga | destinazione |
|---|---|---|
| IMPORTANTE | `src/shared/auth/AuthContext.tsx:315`, `src/shared/auth/accountActions.ts:177` | C98, corretto in 6fc41d4 |
| IMPORTANTE | `src/shared/partner/partnerRefService.ts:53`, `src/shared/partner/usePartnerExit.ts:307` | C85, corretto in 25b1aca |
| IMPORTANTE | `src/shared/partner/usePartnerExit.ts:205` | C92, corretto in ef8d27f + e7a0248 |
| IMPORTANTE | `src/features/auth/hooks/useEmailChangeResend.ts:24`, `src/shared/auth/accountActions.ts:66`, `node_modules/@supabase/auth-js/src/GoTrueClient.ts:2678` | fuori contratto: decisione di Riccardo: rinvio email con 429, la libreria butta il verificatore PKCE |
