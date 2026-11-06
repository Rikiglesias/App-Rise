# Righe del revisore delta2-f1

| gravità | file:riga | destinazione |
|---|---|---|
| IMPORTANTE | `src/shared/auth/useLegataAllUtente.ts:56`, `src/features/auth/hooks/useProfileEditSubmit.ts:233`, `src/__tests__/features/auth/profiloSalvataggioLegato.test.tsx:88` | C97, corretto in 74b7c42 |
| IMPORTANTE | `src/shared/auth/useLegataAllUtente.ts:48`, `src/shared/auth/useAuthDeepLink.ts:53` | fuori contratto: decisione di Riccardo: `popTo('Account')` chiude anche il recupero aperto dal link di B |
