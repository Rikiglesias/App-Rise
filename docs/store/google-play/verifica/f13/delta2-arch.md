# Righe del revisore delta2-arch

| gravità | file:riga | destinazione |
|---|---|---|
| ALTA | `src/shared/auth/useLegataAllUtente.ts:56`, `src/features/auth/hooks/useProfileEditSubmit.ts:233`, `src/__tests__/features/auth/profiloSalvataggioLegato.test.tsx:87` | C97, corretto in 74b7c42 |
| MEDIA | `src/shared/auth/accountActions.ts:175`, `src/shared/auth/AuthContext.tsx:315` | C98, corretto in 6fc41d4 |
| MEDIA | `src/shared/auth/AuthContext.tsx:257`, `src/shared/auth/AuthContext.tsx:242`, `src/shared/hooks/useTranslation.ts:63` | fuori contratto: decisione di Riccardo: account eliminato che rientra da `getSession` al cambio lingua |
| MEDIA | `src/shared/partner/usePartnerExit.ts:161`, `src/shared/partner/usePartnerExit.ts:205`, `src/__tests__/shared/partner/avvisoSoloCodice.test.tsx:40` | C92, corretto in ef8d27f + e7a0248 |
| MEDIA | `src/features/impact/components/StatCard.tsx:60`, `src/components/ui/PerfectText.tsx:173`, `src/components/ui/PerfectText.tsx:210` | C47 + fuori contratto: decisione di Riccardo: `fit` dei numeri riduce il testo ingrandito |
