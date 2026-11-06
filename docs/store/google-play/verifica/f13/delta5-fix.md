# Righe del revisore delta5-fix

| gravità | file:riga | destinazione |
|---|---|---|
| MINORE | `src/shared/auth/accountActions.ts:178`, `src/features/auth/hooks/useAuthError.ts:35` | residuo: diagnostica persa quando il token di A non si legge (SecureStore rigetta o sessione già di B) |
| MINORE | `docs/store/google-play/play-console-risposte.md:174`, `src/shared/partner/usePartnerExit.ts:293`, `src/shared/partner/usePartnerExit.ts:317` | residuo: testo di `play-console-risposte.md:174` dice «visto», il codice vuole «confermato e salvato» |
| MINORE | `src/__tests__/shared/auth/eliminazioneDuranteCambioAccount.test.ts:105`, `src/__tests__/shared/auth/eliminazioneStatoDiB.test.tsx:61`, `src/__tests__/shared/auth/sessioneToltaDalloStorage.test.ts:37` | residuo dichiarato, nessuna correzione: i 3 test aggiornati in 0960a38 coprono comportamenti di prima |
