# Testo su più righe: dove si vede la correzione di C58

Fino a C58 `PerfectText` con `lines` maggiore di 1 e senza `containerWidth` si dava da solo una larghezza fissa
(70% di 393 dp, in scala) centrata, anche dentro un contenitore più stretto. Da C58 la stessa larghezza è un
massimo (`width: '100%'`, `maxWidth`, `flexShrink: 1`, `alignSelf: 'center'`): nei contenitori larghi non cambia
nulla, in quelli stretti il testo non esce più dai bordi.

Elenco generato dalla sonda `scripts/verifica-android-play/conta-multiriga.py` il 25/10 sul commit `39e420c` e
riallineato il 28/10 su `f932f0b` (C87: il rinvio di `ConfirmationResend` è passato in `EmailResendControl`, banner
nuovo `EmailChangePending`): `python scripts/verifica-android-play/conta-multiriga.py .` stampa
«totale 50 in 30 file; positivo noto D6 visto: True». Il verificatore di C58 confronta questa tabella con
l'uscita della sonda: se un file manca o il numero dei punti cambia, il criterio fallisce.

La prova visiva si fa solo sulle schermate della matrice C47. Ogni altra riga è un residuo dichiarato: il codice
è lo stesso, ma nessuno lo ha fotografato.

Totale: 50 punti (22 sulle schermate di C47, 28 residuo non fotografato).

| Punti | File | Dove si vede |
| --- | --- | --- |
| 4 | `src/components/layout/MapLocationModal.tsx` | C47 mappa interattiva, scheda del paese toccato |
| 1 | `src/features/actions/components/shared/ContributeHeader.tsx` | C47 Azioni |
| 4 | `src/features/actions/components/shared/DonationInfoModal.tsx` | C47 Azioni, finestra «Info donazioni» aperta |
| 3 | `src/features/actions/components/shared/PartnerDisclosureModal.tsx` | C47 Azioni, finestra «Stai per uscire dall'app» aperta (il pulsante «Continua senza i miei dati» solo nella variante Donorbox) |
| 1 | `src/features/auth/components/AuthScreen.tsx` | C47 Accesso e Registrazione (titolo) |
| 2 | `src/features/home/components/EntraInAzione/ActionCTAButtons.tsx` | C47 Home |
| 2 | `src/features/home/components/EntraInAzione/ActionDescription.tsx` | C47 Home |
| 1 | `src/features/impact/components/ImpactHeader.tsx` | C47 Impatto |
| 1 | `src/features/impact/components/TotalMealsSection.tsx` | C47 Impatto, scorrendo fino alla sezione |
| 1 | `src/features/impact/components/AnnualResultsSection.tsx` | C47 Impatto, scorrendo fino alla sezione |
| 1 | `src/features/impact/components/MapSection.tsx` | C47 Impatto, scorrendo fino alla sezione |
| 1 | `src/features/impact/components/CommunitySection.tsx` | C47 Impatto, scorrendo fino alla sezione |
| 1 | `src/features/about/components/ChiSiamoSection.tsx` | residuo non fotografato: di Chi siamo C47 prova solo il tocco su «Chiama» e «Scrivi» |
| 1 | `src/features/social/components/HeaderSection.tsx` | residuo non fotografato: Seguici non è nella matrice |
| 2 | `src/features/auth/components/AuthInput.tsx` | residuo non fotografato: testo d'errore e d'aiuto, compare solo con un errore o un suggerimento |
| 1 | `src/features/auth/components/AuthCityField.tsx` | residuo non fotografato: testo d'errore |
| 1 | `src/features/auth/components/AuthConsentCheckbox.tsx` | residuo non fotografato: testo d'errore |
| 1 | `src/features/auth/components/AuthCountryField.tsx` | residuo non fotografato: testo d'errore |
| 1 | `src/features/auth/components/AuthDateField.tsx` | residuo non fotografato: testo d'errore |
| 1 | `src/features/auth/components/AuthPhoneField.tsx` | residuo non fotografato: testo d'errore |
| 1 | `src/features/auth/screens/SignUpScreen.tsx` | residuo non fotografato: messaggio dopo l'invio della registrazione |
| 2 | `src/features/auth/components/EmailResendControl.tsx` | residuo non fotografato: reinvio della conferma dopo la registrazione e rinvio del cambio email in Modifica profilo (C87) |
| 1 | `src/features/auth/components/EmailChangePending.tsx` | residuo non fotografato: Modifica profilo con un cambio email in attesa (C87) |
| 1 | `src/features/auth/screens/ForgotPasswordScreen.tsx` | residuo non fotografato: messaggio dopo l'invio |
| 1 | `src/features/auth/screens/ResetPasswordScreen.tsx` | residuo non fotografato: messaggio a password cambiata |
| 5 | `src/features/auth/screens/ProfileScreen.tsx` | residuo non fotografato: vista da utente collegato (da ospite il Profilo mostra l'Accesso) |
| 2 | `src/features/auth/screens/ProfileEditScreen.tsx` | residuo non fotografato: utente collegato |
| 3 | `src/features/auth/screens/CompleteProfileScreen.tsx` | residuo non fotografato: utente collegato |
| 2 | `src/features/auth/screens/DeleteAccountScreen.tsx` | residuo non fotografato: utente collegato |
| 1 | `src/features/auth/screens/ReConsentScreen.tsx` | residuo non fotografato: utente collegato |

Le schermate da utente collegato si possono fotografare quando c'è l'account demo per i revisori di Google.
