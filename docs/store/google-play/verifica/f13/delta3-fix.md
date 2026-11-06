# Righe del revisore delta3-fix

| gravità | file:riga | destinazione |
|---|---|---|
| IMPORTANTE | `src/shared/auth/accountActions.ts:174`, `src/shared/auth/accountActions.ts:213` | fuori contratto: decisione di Riccardo: B entra fra la lettura della sessione e l'uscita dopo la cancellazione di A |
| IMPORTANTE | `src/shared/auth/accountActions.ts:101`, `src/shared/auth/AuthContext.tsx:312` | residuo dichiarato (correzione con test nuovo, fuori dai titoli del contratto congelato): corretto in 3d3a9c1 |
| MINORE | `docs/store/google-play/play-console-risposte.md:171`, `src/shared/partner/usePartnerExit.ts:289` | residuo dichiarato (testo di un documento, nessun titolo del contratto lo prova): corretto in 10a0d2e |
| MINORE | `src/__tests__/shared/partner/uscitaPartnerAccountNonVerificato.test.tsx:110`, `src/__tests__/shared/auth/eliminazioneDuranteCambioAccount.test.ts:110` | residuo dichiarato (correzione con test nuovo, fuori dai titoli del contratto congelato): corretto in 10a0d2e |
| MINORE | `src/__tests__/features/actions/components/PartnerDisclosureModal.test.tsx:64`, `src/features/actions/components/ActionButtons/ActionButtons.tsx:62` | residuo dichiarato (correzione con test nuovo, fuori dai titoli del contratto congelato): corretto in 10a0d2e |
| MINORE | `src/__tests__/shared/partner/uscitaPartnerAccountNonVerificato.test.tsx:75`, `src/locales/index.ts:32` | residuo dichiarato (correzione con test nuovo, fuori dai titoli del contratto congelato): corretto in 10a0d2e |
