# Design — Paese nel signup + città country-aware

**Data:** 2026-06-22
**Stato:** approvato (design), pronto per il piano
**Branch:** `feat/signup-country-selection` (da `master`)

## Context

L'area donatori (M1–M5) raccoglie la location del donatore come **città + provincia italiane**: il campo Città ha un autocomplete offline sui 7904 comuni ISTAT (`comuni-min.json`) e la selezione di un comune auto-compila la sigla provincia. Il modello è interamente Italia-centrico (`profiles.city not null`, `profiles.province not null`, telefono pre-compilato `+39`).

Serve permettere a un donatore di **scegliere il paese di provenienza** (non solo Italia) e far sì che il campo **Città si adatti al paese** selezionato.

## Decisione chiave

**Città per paesi non-IT = testo libero** (decisione utente, 2026-06-22). L'Italia mantiene l'autocomplete comuni + provincia; gli altri paesi hanno un campo Città a testo libero, senza provincia. Niente API geo, niente dataset città estere, niente costi/dipendenze nuove, nessun dato inviato a terzi (GDPR invariato). Coerente con la filosofia offline-first del dataset comuni.

## Scope

In scope:
- Campo **Paese** (selezione da lista ISO 3166 completa) nella sezione Contatti dei form: SignUp, CompleteProfile (post-social), ProfileEdit.
- Campo **Città** country-aware: IT = comuni + provincia; altro = testo libero.
- Persistenza del paese su `profiles` (colonna `country`); `province` diventa opzionale.
- Pre-compilazione del **prefisso telefonico** in base al paese (tocco di coerenza).
- Visualizzazione del paese in ProfileScreen.

Fuori scope (YAGNI):
- Autocomplete città estere / API geo / dataset città mondiale.
- Modifiche al login, ai social provider, al flusso consensi.
- Province/stati esteri (es. stati USA): la "provincia" resta concetto solo italiano.

## Modello dati

### DB (Supabase — progetto LIVE `yrsilvbuq…`)
Migration nuova `supabase/migrations/0007_profiles_country.sql`:
- `alter table public.profiles add column country text not null default 'IT';`
  Il default backfilla gli utenti esistenti come Italia (erano tutti IT per costruzione).
- `alter table public.profiles alter column province drop not null;`
  Province nullable: i donatori non-IT non hanno provincia.

> Applicazione su DB di **produzione** → eseguita SOLO con OK esplicito dell'utente, come step a parte (non insieme al codice). `province` resta `text` (vuota/NULL per non-IT), non si tocca la colonna `city`.

### Tipi (`src/shared/auth/types.ts`)
- `Profile`: aggiungere `country: string` (ISO alpha-2). `province` resta `string` ma semanticamente opzionale (vuota per non-IT).
- `ProfileInput`: aggiungere `country: string`.
- `ProfileEditable` + `PROFILE_EDITABLE_KEYS`: includere `country`.

## Dataset paesi (`src/shared/data/countries.ts` + `countries.json`)

SSOT offline della lista paesi, generata come i comuni (script `gen:countries`). Forma per voce:
- `code` — ISO 3166-1 alpha-2 (es. `"IT"`, valore persistito).
- `nameIt` / `nameEn` — nome localizzato (la lista nomi NON va nei file locales: 250×2 voci li renderebbe ingestibili; il dataset è la SSOT).
- `dial` — prefisso telefonico E.164 (es. `"+39"`).
- `flag` — emoji bandiera (derivata dal code, o inclusa).

Helper esposti:
- `getCountries(locale)` → lista ordinata alfabeticamente per nome localizzato. Il valore di default selezionato nel form è IT (non un riordino della lista).
- `searchCountries(query, locale)` → filtro per nome (prefisso poi sottostringa, come `searchComuni`).
- `getCountry(code)` → lookup singolo (per dial/flag/nome).

## Componenti

### `AuthCountryField.tsx` (nuovo)
Dropdown cercabile con lo **stesso pattern inline** di `AuthCityField` (dropdown che spinge il contenuto, niente overlay assoluto → niente clipping nello ScrollView su Android). Mostra bandiera + nome localizzato; alla selezione emette il `code` ISO. Default visualizzato = Italia.

### `AuthCityField.tsx` (modifica → country-aware)
Nuovo prop `country: string`.
- `country === 'IT'` → comportamento attuale: autocomplete comuni + `onSelectComune(city, provinceSigla)`.
- altrimenti → `TextInput` libero: niente dropdown, niente provincia; usa solo `onChangeCity`. Placeholder dedicato.

### `AuthPhoneField.tsx` (verifica)
Nessun cambio strutturale: la pre-compilazione del prefisso al cambio paese avviene nello stato dell'hook (vedi sotto). `validatePhoneIT` (regex `^\+\d{8,15}$`) è già E.164 generico → vale per ogni paese, nessuna modifica di logica (eventuale rinominare in `validatePhone` è cosmetico, deciso in fase piano per minimizzare churn nei test).

## Hook form

### `useSignUpForm.ts` e `useProfileForm.ts`
- Nuovo stato `country` (default `'IT'`).
- `onChange.country(code)`:
  - aggiorna `country`;
  - se il nuovo paese ≠ IT → azzera `province` (non applicabile);
  - se il telefono è vuoto o è ancora il prefisso del paese precedente → pre-compila col `dial` del nuovo paese;
  - pulisce gli errori di `city`/`province`/`country`.
- `selectComune` invariato (usato solo quando IT).
- `submit`: includere `country` nel payload `signUp`/profilo.

## Validazione (`src/shared/auth/validation.ts`)
- `SignUpInput` / `ProfileInput`: aggiungere `country: string`.
- `validateSignUpForm` / `validateProfileForm`:
  - `country` required;
  - `city` required (sempre);
  - `province` required **solo se** `country === 'IT'` (per i non-IT non è richiesta).
- `validatePhoneIT` invariato (E.164 generico).

## Schermi

- `SignUpScreen.tsx`, `CompleteProfileScreen.tsx`, `ProfileEditScreen.tsx`:
  - aggiungere il campo **Paese** in cima alla sezione Contatti;
  - passare `country` ad `AuthCityField`;
  - renderizzare il campo **Provincia solo se `country === 'IT'`**;
  - ordine campi: **Paese → Città → Provincia (solo IT) → Telefono**.
- `ProfileScreen.tsx`: mostrare il paese (nome localizzato via `getCountry(code)`) accanto a città/provincia.

## i18n (`src/locales/it.ts`, `en.ts`)
- `auth.signup.country` (label "Paese" / "Country").
- placeholder ricerca paese e placeholder città estera (es. "La tua città").
- Riuso di `auth.errors.required` per il campo paese.
- I nomi dei paesi vivono nel dataset, non nei locales.

## Error handling / edge case
- Paese non selezionato → errore `required` sul campo Paese, submit bloccato.
- Cambio paese IT → estero con città/provincia già compilate → città resta (testo), provincia azzerata.
- Cambio paese estero → IT → la città diventa autocomplete; se la stringa non matcha un comune resta testo libero ma la provincia è richiesta (l'utente deve selezionare un comune o compilare la provincia). Validazione lo forza.
- Telefono già modificato a mano dall'utente → il cambio paese NON lo sovrascrive (si pre-compila solo se vuoto o pari al vecchio prefisso).

## Testing (L1: coverage delta ≥ 0)
- `validation.test.ts`: country required; province required solo IT; non-IT valido senza provincia.
- `useSignUpForm.test.tsx`: stato country, reset provincia e pre-compilazione prefisso al cambio paese, payload con country.
- `authCityField.test.tsx`: IT mostra dropdown; non-IT è testo libero senza dropdown.
- `completeProfile.test.tsx`, `profileEdit.test.tsx`: campo paese presente, provincia condizionale.
- Nuovi: `countries.test.ts` (search/lookup/forma dati), `authCountryField.test.tsx` (selezione, ricerca, default IT).

## Architettura / isolamento
- Dataset `countries` = unità pura testabile in isolamento (come `comuni`).
- `AuthCountryField` = componente presentazionale con interfaccia chiara (value=code, onSelect).
- Logica di reset/pre-compilazione concentrata negli hook form (vista pura).
- Nessuna dipendenza nuova; nessun servizio di rete.

## Ordine di implementazione (per il piano)
1. Dataset `countries` + test.
2. Migration DB (file) — applicazione su prod a parte, con OK.
3. Tipi + validazione + test validazione.
4. `AuthCountryField` + test.
5. `AuthCityField` country-aware + test.
6. Hook `useSignUpForm`/`useProfileForm` + test.
7. Schermi (SignUp, CompleteProfile, ProfileEdit, Profile) + i18n.
8. Verifica L1–L9 + verifica visiva (web preview).
