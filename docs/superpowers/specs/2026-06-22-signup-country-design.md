# Design — Paese nel signup + città country-aware

**Data:** 2026-06-22
**Stato:** approvato (design), pronto per il piano
**Branch:** `feat/signup-country-selection` (da `master`)

## Context

L'area donatori (M1–M5) raccoglie la location del donatore come **città + provincia italiane**: il campo Città ha un autocomplete offline sui 7904 comuni ISTAT (`comuni-min.json`) e la selezione di un comune auto-compila la sigla provincia. Il modello è interamente Italia-centrico (`profiles.city not null`, `profiles.province not null`, telefono pre-compilato `+39`).

Serve permettere a un donatore di **scegliere il paese di provenienza** (non solo Italia) e far sì che il campo **Città si adatti al paese** selezionato.

## Decisione chiave

**Città per paesi non-IT = testo libero** (decisione utente, 2026-06-22). L'Italia mantiene l'autocomplete comuni + provincia; gli altri paesi hanno un campo Città a testo libero, senza provincia. Niente API geo, niente dataset città estere, niente costi/dipendenze nuove, nessun dato inviato a terzi (GDPR invariato). Coerente con la filosofia offline-first del dataset comuni.

**Riuso di `rn-country-select` (già dipendenza diretta, `^0.5.2`).** Il progetto include già questa libreria (usata da `AuthPhoneField` via `rn-international-phone-number`). Espone: il componente `CountrySelect` (picker bottomSheet con ricerca, filtro alfabetico, popular-countries, theme light/dark, label a11y) e i lookup `getAllCountries()`, `getCountryByCca2(cca2)`, `getCountriesByName(name, lang)`. Il tipo `ICountry` porta `cca2`, `flag` (emoji), `idd` (prefisso) e `translations` con i **nomi localizzati IT/EN**. Quindi: **niente dataset/JSON/gen-script custom**, niente nomi paese nei locales — si riusa la lib. (zero-A: esiste già → riuso vs reinvento.)

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

## Lista paesi — `rn-country-select` (nessun file dati custom)

I dati paese arrivano dalla libreria già presente. Mapping utile:
- valore persistito = `cca2` (es. `"IT"`).
- nome localizzato (display del valore selezionato) = `getCountryByCca2(code)?.translations[langKey]?.common ?? .name.common`, con `langKey` = `'ita'` per locale `it`, `'eng'` per `en`.
- bandiera = `ICountry.flag` (emoji).
- picker = componente `CountrySelect` con prop `language` (`'it'`/`'en'`), `popularCountries={['IT']}`, ricerca attiva.

Nessun `countries.ts`/`countries.json`/`gen:countries`, nessun nome paese nei locales.

## Componenti

### `AuthCountryField.tsx` (nuovo) — wrapper su `CountrySelect`
Riga-campo touchable coerente con gli altri input (label sopra, box bordo/radius/theme come `AuthCityField`): mostra `🇮🇹 Italia` (bandiera + nome localizzato del valore corrente) e una freccia. Al tap apre `CountrySelect` (bottomSheet, stessa UX del selettore paese del campo telefono → coerenza). Alla selezione emette il `cca2` via `onSelect(code)`. Prop: `label`, `value` (cca2), `onSelect(code)`, `error?`. La lingua del picker deriva dal locale corrente (`useTranslation`). Default mostrato = Italia (lo stato `country` parte da `'IT'`).

### `AuthCityField.tsx` (modifica → country-aware)
Nuovo prop `country: string`.
- `country === 'IT'` → comportamento attuale: autocomplete comuni + `onSelectComune(city, provinceSigla)`.
- altrimenti → `TextInput` libero: niente dropdown, niente provincia; usa solo `onChangeCity`. Placeholder dedicato.

### `AuthPhoneField.tsx` — invariato
Resta com'è: ha già il **proprio** selettore paese/prefisso indipendente (default IT). NON lo sincronizziamo col paese di residenza: sarebbe accoppiamento + sovrascrittura a sorpresa della scelta dell'utente, ed è fuori dallo scope chiesto. `validatePhoneIT` (regex `^\+\d{8,15}$`) è già E.164 generico → vale per ogni paese, nessuna modifica.

## Hook form

### `useSignUpForm.ts` e `useProfileForm.ts`
- Nuovo stato `country` (default `'IT'`).
- `onChange.country(code)`:
  - aggiorna `country`;
  - se il nuovo paese ≠ IT → azzera `province` (non applicabile) e l'eventuale errore provincia;
  - pulisce l'errore `country`.
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
- I nomi dei paesi arrivano da `rn-country-select` (localizzati), non dai locales.

## Error handling / edge case
- Paese non selezionato → errore `required` sul campo Paese, submit bloccato.
- Cambio paese IT → estero con città/provincia già compilate → città resta (testo), provincia azzerata.
- Cambio paese estero → IT → la città diventa autocomplete; se la stringa non matcha un comune resta testo libero ma la provincia è richiesta (l'utente deve selezionare un comune o compilare la provincia). Validazione lo forza.
- Telefono già modificato a mano dall'utente → il cambio paese NON lo sovrascrive (si pre-compila solo se vuoto o pari al vecchio prefisso).

## Testing (L1: coverage delta ≥ 0)
- `validation.test.ts`: country required; province required solo IT; non-IT valido senza provincia.
- `useSignUpForm.test.tsx`: stato country, reset provincia al cambio paese (IT→estero), payload con country.
- `authCityField.test.tsx`: IT mostra dropdown; non-IT è testo libero senza dropdown.
- `completeProfile.test.tsx`, `profileEdit.test.tsx`: campo paese presente, provincia condizionale.
- Nuovo: `authCountryField.test.tsx` (mostra valore localizzato, apre il picker, emette cca2 alla selezione). `CountrySelect` mockato nel setup test (è una modale nativa).

## Architettura / isolamento
- `AuthCountryField` = wrapper presentazionale su `CountrySelect`, interfaccia chiara (value=cca2, onSelect(code)).
- Logica di reset provincia concentrata negli hook form (vista pura).
- Nessuna dipendenza NUOVA (riuso `rn-country-select` già presente); nessun servizio di rete.

## Ordine di implementazione (per il piano)
1. Migration DB (file) — applicazione su prod a parte, con OK.
2. Tipi + validazione + test validazione.
3. `AuthCountryField` (wrapper `CountrySelect`) + test.
4. `AuthCityField` country-aware + test.
5. Hook `useSignUpForm`/`useProfileForm` + test.
6. Schermi (SignUp, CompleteProfile, ProfileEdit, Profile) + i18n.
7. Verifica L1–L9 + verifica visiva (web preview).
