# Paese nel signup + città country-aware — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Permettere al donatore di scegliere il paese di provenienza nel signup/profilo; il campo Città si adatta (Italia = autocomplete comuni + provincia; altri paesi = testo libero senza provincia).

**Architecture:** Riuso della libreria già presente `rn-country-select` (picker `CountrySelect` + lookup `getCountryByCca2`/dati `ICountry` con bandiera, prefisso, nomi localizzati IT/EN). Nessun dataset paesi custom. La location resta in `profiles` (nuova colonna `country`, `province` diventa nullable). Il profilo email è creato server-side dal trigger `handle_new_user`, quindi sia il trigger sia `auth.signUp(options.data)` devono includere `country`.

**Tech Stack:** React Native (Expo, Hermes), TypeScript strict, Supabase (Postgres + RLS + trigger), Jest + @testing-library/react-native.

## Global Constraints

- Lingua UI: italiano e inglese (`src/locales/it.ts`, `en.ts`). I nomi dei paesi NON vanno nei locales: vengono da `rn-country-select` (localizzati via `translations`/prop `language`).
- Valore paese persistito = ISO 3166-1 alpha-2 (`cca2`, es. `"IT"`). Default = `'IT'`.
- `province` è concetto SOLO italiano: obbligatoria se `country === 'IT'`, altrimenti vuota/non richiesta.
- `validatePhoneIT` (regex `^\+\d{8,15}$`) è già E.164 generico: NON modificarla.
- Nessuna dipendenza nuova. Nessuna chiamata di rete aggiunta.
- File < 300 righe; un file = una responsabilità; match dello stile esistente (`PerfectText`, `useThemeColors`, `scale`, `PerfectSpacing`).
- TDD: test rosso → implementazione minima → verde → commit. Commit frequenti.
- DB: la migration 0007 si SCRIVE in questo piano ma si APPLICA al progetto Supabase LIVE separatamente, con OK esplicito dell'utente (è produzione).

---

### Task 1: Migration DB 0007 — colonna country + province nullable + trigger

**Files:**
- Create: `supabase/migrations/0007_profiles_country.sql`

**Interfaces:**
- Produces: colonna `profiles.country text not null default 'IT'`; `profiles.province` nullable; trigger `handle_new_user` che scrive `country` da `raw_user_meta_data`.

- [ ] **Step 1: Scrivere la migration**

```sql
-- Migration 0007 — country nel profilo donatore + province nullable
-- Aggiunge il paese di provenienza (ISO 3166-1 alpha-2, default IT per backfill degli
-- utenti esistenti, tutti italiani per costruzione). La provincia diventa opzionale:
-- è un concetto amministrativo solo italiano, assente per i donatori esteri.

alter table public.profiles
  add column if not exists country text not null default 'IT';

alter table public.profiles
  alter column province drop not null;

-- Il profilo email è creato server-side: il trigger deve propagare anche country.
-- Default 'IT' se il metadato manca (robustezza verso vecchi client).
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_meta jsonb := new.raw_user_meta_data;
  v_version text;
  v_marketing boolean := coalesce((v_meta->>'marketing_consent')::boolean, false);
begin
  if v_meta ? 'birth_date' then
    insert into public.profiles (
      id, first_name, last_name, phone, city, province, country,
      birth_date, privacy_consent_at, marketing_consent
    )
    values (
      new.id,
      v_meta->>'first_name',
      v_meta->>'last_name',
      v_meta->>'phone',
      v_meta->>'city',
      nullif(v_meta->>'province', ''),
      coalesce(nullif(v_meta->>'country', ''), 'IT'),
      (v_meta->>'birth_date')::date,
      now(),
      v_marketing
    );

    select version into v_version
    from public.policy_versions
    order by published_at desc
    limit 1;

    insert into public.consent_events
      (user_id, purpose, action, policy_version, legal_basis, channel)
    values
      (new.id, 'privacy_notice', 'granted', v_version, 'consent', 'signup');

    if v_marketing then
      insert into public.consent_events
        (user_id, purpose, action, policy_version, legal_basis, channel)
      values
        (new.id, 'marketing', 'granted', v_version, 'consent', 'signup');
    end if;
  end if;

  return new;
end;
$$;
```

- [ ] **Step 2: Verificare che il file sia ben formato (sintassi)**

Run: `grep -c "country" supabase/migrations/0007_profiles_country.sql`
Expected: `>= 3` (colonna + insert column + value coalesce).

- [ ] **Step 3: Commit (NON applicare ancora a prod)**

```bash
git add supabase/migrations/0007_profiles_country.sql
git commit -m "feat(db): migration 0007 country + province nullable + trigger"
```

> Applicazione a Supabase LIVE: step a parte, con OK utente, via `mcp__supabase__apply_migration` (name `profiles_country`).

---

### Task 2: Tipi profilo — country

**Files:**
- Modify: `src/shared/auth/types.ts`

**Interfaces:**
- Produces: `Profile.country: string`; `ProfileInput.country: string`; `'country'` in `ProfileEditable` e `PROFILE_EDITABLE_KEYS`. `Profile.province` resta `string` (vuota per non-IT).

- [ ] **Step 1: Aggiungere `country` a `Profile`**

In `src/shared/auth/types.ts`, nell'interfaccia `Profile`, dopo `province: string;` aggiungere:

```typescript
  country: string; // ISO 3166-1 alpha-2 (es. 'IT')
```

- [ ] **Step 2: Aggiungere `country` a `ProfileEditable` e alla whitelist**

Modificare il `Pick` e l'array:

```typescript
export type ProfileEditable = Pick<
  Profile,
  'first_name' | 'last_name' | 'phone' | 'city' | 'province' | 'country' | 'birth_date'
>;

export const PROFILE_EDITABLE_KEYS: readonly (keyof ProfileEditable)[] = [
  'first_name',
  'last_name',
  'phone',
  'city',
  'province',
  'country',
  'birth_date',
];
```

- [ ] **Step 3: Aggiungere `country` a `ProfileInput`**

Nell'interfaccia `ProfileInput`, dopo `province: string;`:

```typescript
  country: string;
```

- [ ] **Step 4: Typecheck (fallirà nei caller finché non aggiornati — atteso, fixati nei task seguenti)**

Run: `npx tsc --noEmit 2>&1 | grep -E "country|province" | head`
Expected: errori SOLO nei file che aggiorneremo (validation, hook, screens). Annotare, proseguire.

- [ ] **Step 5: Commit**

```bash
git add src/shared/auth/types.ts
git commit -m "feat(auth): country nel tipo Profile/ProfileInput/ProfileEditable"
```

---

### Task 3: Validazione — country required, province condizionale

**Files:**
- Modify: `src/shared/auth/validation.ts`
- Test: `src/__tests__/shared/auth/validation.test.ts`

**Interfaces:**
- Consumes: `SignUpInput`, `ProfileInput` (campi esistenti).
- Produces: `SignUpInput.country: string`, `ProfileInput.country: string`; `validateSignUpForm`/`validateProfileForm` con `country` required e `province` required solo se `country === 'IT'`.

- [ ] **Step 1: Scrivere i test (rossi)**

Aggiungere a `src/__tests__/shared/auth/validation.test.ts` (adattare l'oggetto base ai campi già usati nel file; mostrati i casi nuovi):

```typescript
import { validateSignUpForm, validateProfileForm } from '@/shared/auth/validation';

const baseSignUp = {
  firstName: 'Mario',
  lastName: 'Rossi',
  email: 'mario@example.com',
  password: 'Password!1',
  confirmPassword: 'Password!1',
  phone: '+39333123456',
  city: 'Milano',
  province: 'MI',
  country: 'IT',
  birthDate: '1990-01-01',
  privacyConsent: true,
};

describe('validateSignUpForm — country', () => {
  it('paese mancante → errore required', () => {
    const e = validateSignUpForm({ ...baseSignUp, country: '' });
    expect(e.country).toBe('required');
  });

  it('IT senza provincia → errore province', () => {
    const e = validateSignUpForm({ ...baseSignUp, province: '' });
    expect(e.province).toBe('required');
  });

  it('estero senza provincia → valido (province non richiesta)', () => {
    const e = validateSignUpForm({ ...baseSignUp, country: 'FR', province: '' });
    expect(e.province).toBeUndefined();
    expect(e.country).toBeUndefined();
  });
});
```

- [ ] **Step 2: Eseguire i test → falliscono (campo country inesistente / province sempre richiesta)**

Run: `npx jest src/__tests__/shared/auth/validation.test.ts -t country`
Expected: FAIL.

- [ ] **Step 3: Aggiornare `validation.ts`**

In `SignUpInput` e `ProfileInput` aggiungere `country: string;` (dopo `province`). Nelle funzioni, sostituire la riga `if (validateRequired(input.province)) e.province = 'required';` con il blocco condizionale e aggiungere il check country. Per `validateSignUpForm`:

```typescript
  if (validateRequired(input.country)) e.country = 'required';
  if (validateRequired(input.city)) e.city = 'required';
  if (input.country === 'IT' && validateRequired(input.province))
    e.province = 'required';
```

Stesso trattamento in `validateProfileForm` (country required, city required, province solo se IT).

- [ ] **Step 4: Eseguire i test → verdi**

Run: `npx jest src/__tests__/shared/auth/validation.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/shared/auth/validation.ts src/__tests__/shared/auth/validation.test.ts
git commit -m "feat(auth): valida country (required) e province solo per IT"
```

---

### Task 4: `AuthCountryField` — wrapper su CountrySelect

**Files:**
- Create: `src/features/auth/components/AuthCountryField.tsx`
- Test: `src/__tests__/features/auth/authCountryField.test.tsx`

**Interfaces:**
- Consumes: `CountrySelect` (default export), `getCountryByCca2`, `ICountry` da `rn-country-select`; `useTranslation().locale`.
- Produces: `AuthCountryField` con props `{ label: string; value: string; onSelect: (code: string) => void; error?: string }`.

- [ ] **Step 1: Mock di `rn-country-select` per i test**

Creare/estendere il mock in `src/__tests__/features/auth/authCountryField.test.tsx` (il componente vero è una modale nativa):

```tsx
import React from 'react';
import { Text, TouchableOpacity } from 'react-native';
import { render, fireEvent } from '@testing-library/react-native';

jest.mock('rn-country-select', () => {
  const React = require('react');
  const { Text, TouchableOpacity } = require('react-native');
  const FR = {
    cca2: 'FR',
    flag: '🇫🇷',
    name: { common: 'France' },
    translations: { ita: { common: 'Francia' }, eng: { common: 'France' } },
  };
  const CountrySelect = ({ visible, onSelect }: any) =>
    visible ? (
      <TouchableOpacity testID="pick-fr" onPress={() => onSelect(FR)}>
        <Text>Francia</Text>
      </TouchableOpacity>
    ) : null;
  return {
    __esModule: true,
    default: CountrySelect,
    getCountryByCca2: (code: string) =>
      code === 'IT'
        ? {
            cca2: 'IT',
            flag: '🇮🇹',
            name: { common: 'Italy' },
            translations: { ita: { common: 'Italia' }, eng: { common: 'Italy' } },
          }
        : FR,
  };
});

import { AuthCountryField } from '@/features/auth/components/AuthCountryField';

describe('AuthCountryField', () => {
  it('mostra il nome localizzato del valore corrente e apre il picker', () => {
    const onSelect = jest.fn();
    const { getByText, getByTestId, queryByTestId } = render(
      <AuthCountryField label="Paese" value="IT" onSelect={onSelect} />
    );
    expect(getByText('Italia')).toBeTruthy();
    expect(queryByTestId('pick-fr')).toBeNull();
    fireEvent.press(getByText('Italia'));
    fireEvent.press(getByTestId('pick-fr'));
    expect(onSelect).toHaveBeenCalledWith('FR');
  });
});
```

- [ ] **Step 2: Eseguire il test → fallisce (componente inesistente)**

Run: `npx jest src/__tests__/features/auth/authCountryField.test.tsx`
Expected: FAIL ("Cannot find module AuthCountryField").

- [ ] **Step 3: Implementare `AuthCountryField.tsx`**

```tsx
import React, { useMemo, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import CountrySelect, {
  getCountryByCca2,
  type ICountry,
  type ICountryCca2,
} from 'rn-country-select';

import { PerfectText, PlatformTouchable } from '@/components/ui';
import { Colors } from '@/shared/constants/designTokens';
import { PerfectSpacing } from '@/shared/constants';
import { scale } from '@/shared/constants/perfectScale';
import { useThemeColors } from '@/shared/hooks/useThemeColors';
import type { ThemeColors } from '@/shared/theme/adaptiveColors';
import { useTranslation } from '@/shared/hooks/useTranslation';
import type { SupportedLocale } from '@/locales';

interface AuthCountryFieldProps {
  label: string;
  /** Codice ISO 3166-1 alpha-2 corrente (es. 'IT'). */
  value: string;
  onSelect: (code: string) => void;
  error?: string | undefined;
}

const LANG_KEY: Record<SupportedLocale, 'ita' | 'eng'> = { it: 'ita', en: 'eng' };

const localizedName = (c: ICountry | undefined, locale: SupportedLocale): string =>
  c?.translations?.[LANG_KEY[locale]]?.common ?? c?.name?.common ?? '';

/**
 * Campo Paese: riga touchable (bandiera + nome localizzato) che apre il picker
 * `CountrySelect` (stessa UX del selettore paese del campo telefono). Persistito
 * il `cca2`. Italia in cima alla lista (caso comune: donatori italiani).
 */
export const AuthCountryField: React.FC<AuthCountryFieldProps> = ({
  label,
  value,
  onSelect,
  error,
}) => {
  const colors = useThemeColors();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const { locale } = useTranslation();
  const [open, setOpen] = useState(false);

  const current = getCountryByCca2(value as ICountryCca2);

  return (
    <View style={styles.wrap}>
      <PerfectText size={16} lines={1} style={styles.label}>
        {label}
      </PerfectText>
      <PlatformTouchable
        testID="country-field"
        onPress={(): void => setOpen(true)}
        accessibilityRole="button"
        accessibilityLabel={label}
        style={[styles.inputRow, error ? styles.inputRowError : null]}
      >
        <PerfectText size={16} lines={1} style={styles.valueText}>
          {current ? `${current.flag}  ${localizedName(current, locale)}` : ''}
        </PerfectText>
        <PerfectText size={16} lines={1} style={styles.chevron}>
          {'⌄'}
        </PerfectText>
      </PlatformTouchable>
      <CountrySelect
        visible={open}
        onClose={(): void => setOpen(false)}
        language={locale}
        popularCountries={['IT']}
        modalType="bottomSheet"
        theme={colors.isDark ? 'dark' : 'light'}
        onSelect={(c: ICountry): void => {
          onSelect(c.cca2);
          setOpen(false);
        }}
      />
      {error ? (
        <View accessibilityLiveRegion="assertive" accessibilityRole="alert">
          <PerfectText size={13} lines={2} style={styles.error}>
            {error}
          </PerfectText>
        </View>
      ) : null}
    </View>
  );
};

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    wrap: { marginBottom: PerfectSpacing.base },
    label: {
      color: colors.neutral[700],
      fontWeight: '600',
      marginBottom: PerfectSpacing.xs,
    },
    inputRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      backgroundColor: colors.neutral[0],
      borderWidth: scale(1),
      borderColor: colors.neutral[200],
      borderRadius: scale(12),
      paddingHorizontal: PerfectSpacing.base,
      paddingVertical: PerfectSpacing.sm,
    },
    inputRowError: { borderColor: Colors.semantic.error.main },
    valueText: { color: colors.neutral[900] },
    chevron: { color: colors.neutral[500] },
    error: { color: Colors.semantic.error.main, marginTop: PerfectSpacing.xs },
  });
```

> Nota implementazione: verificare a runtime che `colors.isDark` esista in `ThemeColors`; se il flag dark si ricava diversamente nel progetto, usare quella via (es. confronto con palette) — il prop `theme` di CountrySelect accetta `'light' | 'dark'`.

- [ ] **Step 4: Eseguire il test → verde**

Run: `npx jest src/__tests__/features/auth/authCountryField.test.tsx`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/features/auth/components/AuthCountryField.tsx src/__tests__/features/auth/authCountryField.test.tsx
git commit -m "feat(auth): AuthCountryField (picker paese su rn-country-select)"
```

---

### Task 5: `AuthCityField` country-aware

**Files:**
- Modify: `src/features/auth/components/AuthCityField.tsx`
- Test: `src/__tests__/features/auth/authCityField.test.tsx`

**Interfaces:**
- Consumes: prop nuovo `country: string`.
- Produces: per `country === 'IT'` comportamento attuale (autocomplete + `onSelectComune`); altrimenti `TextInput` libero senza dropdown.

- [ ] **Step 1: Aggiungere il test del ramo estero (rosso)**

In `src/__tests__/features/auth/authCityField.test.tsx` aggiungere:

```tsx
it('paese estero: nessun dropdown comuni, solo testo libero', () => {
  const onChangeCity = jest.fn();
  const { queryByTestId, getByLabelText } = render(
    <AuthCityField
      label="Città"
      value="Par"
      country="FR"
      onChangeCity={onChangeCity}
      onSelectComune={jest.fn()}
    />
  );
  // 'Par' matcherebbe comuni IT (es. Parma) → con country estero NON deve.
  expect(queryByTestId('city-option-0')).toBeNull();
  fireEvent.changeText(getByLabelText('Città'), 'Paris');
  expect(onChangeCity).toHaveBeenCalledWith('Paris');
});
```

(Verificare che il test IT esistente passi ancora il prop `country="IT"`; aggiornarlo se necessario per soddisfare il nuovo prop obbligatorio.)

- [ ] **Step 2: Eseguire → fallisce (mostra ancora il dropdown)**

Run: `npx jest src/__tests__/features/auth/authCityField.test.tsx -t estero`
Expected: FAIL.

- [ ] **Step 3: Rendere `AuthCityField` country-aware**

In `AuthCityFieldProps` aggiungere:

```tsx
  /** Paese corrente (cca2). Solo 'IT' attiva l'autocomplete comuni + provincia. */
  country: string;
```

Nella firma del componente aggiungere `country,` ai props destrutturati. Sostituire il calcolo dei suggerimenti per disattivarli fuori dall'Italia:

```tsx
  const isItaly = country === 'IT';
  const suggestions = useMemo<Comune[]>(
    () => (isItaly ? searchComuni(value) : []),
    [isItaly, value]
  );
  const showDropdown = isItaly && open && suggestions.length > 0;
```

(Il resto resta invariato: con `suggestions` vuoto il dropdown non appare e il campo è di fatto testo libero. `handleFocus`/`handleChange` continuano a chiamare `setOpen(true)` ma senza suggerimenti non si vede nulla — opzionale: `if (isItaly) setOpen(true)`.)

- [ ] **Step 4: Eseguire i test → verdi**

Run: `npx jest src/__tests__/features/auth/authCityField.test.tsx`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/features/auth/components/AuthCityField.tsx src/__tests__/features/auth/authCityField.test.tsx
git commit -m "feat(auth): AuthCityField country-aware (comuni solo per IT)"
```

---

### Task 6: `useSignUpForm` — stato country + payload + AuthContext.signUp

**Files:**
- Modify: `src/features/auth/hooks/useSignUpForm.ts`
- Modify: `src/shared/auth/AuthContext.tsx:165-173` (options.data)
- Test: `src/__tests__/features/auth/useSignUpForm.test.tsx`

**Interfaces:**
- Consumes: `validateSignUpForm` (con country), `signUp(email,password,ProfileInput con country)`.
- Produces: `values.country`, `onChange.country(code)`; payload `signUp` con `country`.

- [ ] **Step 1: Test (rosso) — country di default IT, reset provincia al cambio, payload**

Aggiornare/aggiungere in `src/__tests__/features/auth/useSignUpForm.test.tsx`:

```tsx
it('country default IT; cambio paese estero azzera la provincia', () => {
  const { result } = renderHook(() => useSignUpForm(), { wrapper });
  expect(result.current.values.country).toBe('IT');
  act(() => result.current.selectComune('Milano', 'MI'));
  expect(result.current.values.province).toBe('MI');
  act(() => result.current.onChange.country('FR'));
  expect(result.current.values.country).toBe('FR');
  expect(result.current.values.province).toBe('');
});
```

(Riusare il `wrapper`/mock di `useAuth` già presente nel file; se `signUp` è mockato, asserire che venga chiamato con un oggetto contenente `country`.)

- [ ] **Step 2: Eseguire → fallisce**

Run: `npx jest src/__tests__/features/auth/useSignUpForm.test.tsx -t country`
Expected: FAIL.

- [ ] **Step 3: Aggiungere lo stato e l'handler in `useSignUpForm.ts`**

Dopo `const [province, setProvince] = useState('');` aggiungere:

```typescript
  const [country, setCountry] = useState('IT');
```

In `onChange` (l'oggetto `useMemo`) aggiungere la chiave:

```typescript
      country: (code: string): void => {
        setCountry(code);
        if (code !== 'IT') {
          setProvince('');
          clearError('province');
        }
        clearError('country');
      },
```

In `validateSignUpForm({ ... })` aggiungere `country,`. Nel payload `signUp(..., { ... })` aggiungere `country: country.trim(),`. In `values` (oggetto di ritorno) aggiungere `country,`. Aggiornare le dipendenze dei `useCallback` `submit` includendo `country`.

- [ ] **Step 4: Aggiornare `AuthContext.signUp` options.data**

In `src/shared/auth/AuthContext.tsx`, nel blocco `data: { ... }` (righe ~165-173), dopo `province: p.province,` aggiungere:

```typescript
            country: p.country,
```

- [ ] **Step 5: Eseguire i test → verdi**

Run: `npx jest src/__tests__/features/auth/useSignUpForm.test.tsx`
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add src/features/auth/hooks/useSignUpForm.ts src/shared/auth/AuthContext.tsx src/__tests__/features/auth/useSignUpForm.test.tsx
git commit -m "feat(auth): country in useSignUpForm + payload signUp"
```

---

### Task 7: `useProfileForm` — stato country + upsert (post-social)

**Files:**
- Modify: `src/features/auth/hooks/useProfileForm.ts`
- Test: `src/__tests__/features/auth/completeProfile.test.tsx`

**Interfaces:**
- Consumes: `validateProfileForm` (con country).
- Produces: `values.country`, `onChange.country(code)`; upsert profilo con `country`.

- [ ] **Step 1: Test (rosso)**

In `src/__tests__/features/auth/completeProfile.test.tsx` aggiungere un test che verifica la presenza del campo Paese e che l'upsert includa `country` (riusando i mock supabase già nel file). Esempio minimo del comportamento hook (se il file testa la UI, asserire la presenza del campo "Paese"):

```tsx
it('CompleteProfile mostra il campo Paese', () => {
  const { getByText } = wrap(<CompleteProfileScreen />);
  expect(getByText('Paese')).toBeTruthy();
});
```

- [ ] **Step 2: Eseguire → fallisce**

Run: `npx jest src/__tests__/features/auth/completeProfile.test.tsx -t Paese`
Expected: FAIL.

- [ ] **Step 3: Aggiornare `useProfileForm.ts`**

Aggiungere `const [country, setCountry] = useState('IT');`. In `onChange` aggiungere la chiave `country` identica a Task 6 Step 3. In `validateProfileForm({ ... })` aggiungere `country,`. Nell'upsert `supabase.from('profiles').upsert({ ... })` aggiungere:

```typescript
      country: country.trim(),
      province: province.trim() || null,
```

(Province `null` per i non-IT, coerente con la colonna nullable.) Aggiungere `country` a `values` e alle dipendenze di `submit`.

- [ ] **Step 4: Wiring UI di CompleteProfileScreen (in questo task, perché il test lo richiede)**

Vedi Task 8 Step 3 per il blocco JSX condiviso; applicarlo anche a `CompleteProfileScreen.tsx` (stesso pattern: `AuthCountryField` + città country-aware + provincia condizionale).

- [ ] **Step 5: Eseguire i test → verdi**

Run: `npx jest src/__tests__/features/auth/completeProfile.test.tsx`
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add src/features/auth/hooks/useProfileForm.ts src/features/auth/screens/CompleteProfileScreen.tsx src/__tests__/features/auth/completeProfile.test.tsx
git commit -m "feat(auth): country in useProfileForm + CompleteProfile"
```

---

### Task 8: Wiring SignUpScreen + i18n

**Files:**
- Modify: `src/features/auth/screens/SignUpScreen.tsx:123-144` (sezione Contatti)
- Modify: `src/locales/it.ts`, `src/locales/en.ts` (signup + profile)

**Interfaces:**
- Consumes: `values.country`, `onChange.country`, `AuthCountryField`, `AuthCityField` (prop country).

- [ ] **Step 1: Aggiungere le chiavi i18n**

In `src/locales/it.ts` dentro `auth.signup` aggiungere:

```typescript
      country: 'Paese',
      cityForeignPlaceholder: 'La tua città',
```

E in `auth.profile` aggiungere `country: 'Paese',`. Replicare in `src/locales/en.ts`:

```typescript
      country: 'Country',
      cityForeignPlaceholder: 'Your city',
```

e `auth.profile.country: 'Country'`.

- [ ] **Step 2: Import del nuovo componente**

In `SignUpScreen.tsx` aggiungere `import { AuthCountryField } from '../components/AuthCountryField';`.

- [ ] **Step 3: Sostituire la sezione Contatti**

Sostituire il blocco `<AuthSection title={t('auth.signup.sections.contacts')}> ... </AuthSection>` (righe ~123-144) con:

```tsx
      <AuthSection title={t('auth.signup.sections.contacts')}>
        <AuthCountryField
          label={t('auth.signup.country')}
          value={values.country}
          onSelect={onChange.country}
          error={err(errors.country)}
        />
        <AuthPhoneField
          label={t('auth.signup.phone')}
          onChangeText={onChange.phone}
          error={err(errors.phone)}
        />
        <AuthCityField
          label={t('auth.signup.city')}
          value={values.city}
          country={values.country}
          onChangeCity={onChange.city}
          onSelectComune={form.selectComune}
          error={err(errors.city)}
          placeholder={
            values.country === 'IT'
              ? t('auth.signup.cityPlaceholder')
              : t('auth.signup.cityForeignPlaceholder')
          }
        />
        {values.country === 'IT' ? (
          <AuthInput
            label={t('auth.signup.province')}
            value={values.province}
            error={err(errors.province)}
            editable={false}
            placeholder={t('auth.signup.provincePlaceholder')}
          />
        ) : null}
      </AuthSection>
```

> Ordine finale: Paese → Telefono → Città → Provincia (solo IT). (Telefono prima della città mantiene il flusso di focus esistente; il Paese in testa inquadra la sezione.)

- [ ] **Step 4: Verifica tipi + render**

Run: `npx tsc --noEmit` → exit 0.
Run: `npx jest src/__tests__/features/auth/authScreens.test.tsx` → PASS.

- [ ] **Step 5: Commit**

```bash
git add src/features/auth/screens/SignUpScreen.tsx src/locales/it.ts src/locales/en.ts
git commit -m "feat(auth): campo Paese in SignUp + provincia condizionale + i18n"
```

---

### Task 9: ProfileEditScreen — country (stato inline) + province condizionale

**Files:**
- Modify: `src/features/auth/screens/ProfileEditScreen.tsx`
- Test: `src/__tests__/features/auth/profileEdit.test.tsx`

**Interfaces:**
- Consumes: `AuthCountryField`, `AuthCityField`, `profile.country`.
- Nota: questo schermo ha stato/validazione INLINE (non usa useProfileForm) → va modificato direttamente.

- [ ] **Step 1: Test (rosso) — campo Paese presente, provincia nascosta per estero**

In `src/__tests__/features/auth/profileEdit.test.tsx` aggiungere:

```tsx
it('mostra il campo Paese', () => {
  const { getByText } = wrap(<ProfileEditScreen />);
  expect(getByText('Paese')).toBeTruthy();
});
```

- [ ] **Step 2: Eseguire → fallisce**

Run: `npx jest src/__tests__/features/auth/profileEdit.test.tsx -t Paese`
Expected: FAIL.

- [ ] **Step 3: Aggiornare `ProfileEditScreen.tsx`**

Import: aggiungere `import { AuthCountryField } from '../components/AuthCountryField';` e `import { AuthCityField } from '../components/AuthCityField';`.

Stato: aggiungere `const [country, setCountry] = useState(profile?.country ?? 'IT');`.

Tipo `Errors`: aggiungere `'country'` all'union.

Validazione in `onSubmit`: sostituire `if (validateRequired(city)) e.city = 'required'; if (validateRequired(province)) e.province = 'required';` con:

```typescript
    if (validateRequired(country)) e.country = 'required';
    if (validateRequired(city)) e.city = 'required';
    if (country === 'IT' && validateRequired(province)) e.province = 'required';
```

Diff campi cambiati: aggiungere il confronto country:

```typescript
    if (country.trim() !== (profile?.country ?? 'IT'))
      changed.country = country.trim();
    // province: per i non-IT azzera; usa null per la colonna nullable
    const nextProvince = country === 'IT' ? province.trim() : '';
    if (nextProvince !== (profile?.province ?? ''))
      changed.province = nextProvince;
```

(Rimuovere il vecchio confronto `if (province.trim() !== profile?.province) ...` per non duplicarlo.)

JSX: sostituire i campi City/Province con:

```tsx
      <AuthCountryField
        label={t('auth.signup.country')}
        value={country}
        onSelect={(code): void => {
          setCountry(code);
          if (code !== 'IT') setProvince('');
        }}
        error={err(errors.country)}
      />
      <AuthCityField
        label={t('auth.signup.city')}
        value={city}
        country={country}
        onChangeCity={(v): void => {
          setCity(v);
          if (country === 'IT') setProvince('');
        }}
        onSelectComune={(c, sigla): void => {
          setCity(c);
          setProvince(sigla);
        }}
        error={err(errors.city)}
      />
      {country === 'IT' ? (
        <AuthInput
          label={t('auth.signup.province')}
          value={province}
          onChangeText={setProvince}
          error={err(errors.province)}
          autoCapitalize="characters"
        />
      ) : null}
```

(Posizionare il campo Paese prima del telefono o subito sopra la città, coerente con SignUp.)

- [ ] **Step 4: Eseguire i test → verdi**

Run: `npx jest src/__tests__/features/auth/profileEdit.test.tsx`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/features/auth/screens/ProfileEditScreen.tsx src/__tests__/features/auth/profileEdit.test.tsx
git commit -m "feat(auth): country in ProfileEdit + città autocomplete + provincia condizionale"
```

---

### Task 10: ProfileScreen — visualizzazione paese e location robusta

**Files:**
- Modify: `src/features/auth/screens/ProfileScreen.tsx:125-143`

**Interfaces:**
- Consumes: `getCountryByCca2` da `rn-country-select`, `profile.country`.

- [ ] **Step 1: Import e helper nome localizzato**

Aggiungere in cima: `import { getCountryByCca2, type ICountryCca2 } from 'rn-country-select';`. Dopo `const fullName = ...` aggiungere:

```tsx
  const countryName =
    getCountryByCca2(profile?.country as ICountryCca2)?.translations?.[
      locale === 'it' ? 'ita' : 'eng'
    ]?.common ?? profile?.country ?? '';
  const locationValue = profile
    ? profile.province
      ? `${profile.city} (${profile.province})`
      : profile.city
    : '';
```

(`locale` arriva da `useTranslation()` — aggiungerlo alla destrutturazione: `const { t, locale } = useTranslation();`.)

- [ ] **Step 2: Aggiornare le Row location/paese**

Sostituire la `Row` location con il valore robusto e aggiungere la riga Paese:

```tsx
          <Row
            label={t('auth.profile.location')}
            value={locationValue}
            styles={styles}
          />
          <Row
            label={t('auth.profile.country')}
            value={countryName}
            styles={styles}
          />
```

- [ ] **Step 3: Verifica**

Run: `npx tsc --noEmit` → exit 0.
Run: `npx jest src/__tests__/features/auth` → PASS (tutti i test auth).

- [ ] **Step 4: Commit**

```bash
git add src/features/auth/screens/ProfileScreen.tsx
git commit -m "feat(auth): mostra paese e location robusta nel profilo"
```

---

### Task 11: Verifica finale L1–L9 + visiva

- [ ] **Step 1: Quality gate completo**

Run: `npx tsc --noEmit` → exit 0.
Run: `npx eslint src/features/auth src/shared/auth --max-warnings=0` → exit 0.
Run: `npx jest src/__tests__/features/auth src/__tests__/shared/auth` → tutti verdi.
Run: `npx jest --coverage --collectCoverageFrom='src/features/auth/**' ...` → coverage delta ≥ 0.

- [ ] **Step 2: Circular deps**

Run: `npx madge --circular --extensions ts,tsx src` → 0.

- [ ] **Step 3: Verifica visiva (web preview)**

Run: `npm run web`, aprire signup, verificare: selezione paese (IT default), città autocomplete per IT + provincia visibile, città testo libero + provincia nascosta per estero, salvataggio.

- [ ] **Step 4: Migration su prod (con OK utente)**

Applicare `0007_profiles_country.sql` al progetto Supabase LIVE via `mcp__supabase__apply_migration`. Verificare con `list_tables`/`execute_sql` che `country` esista e `province` sia nullable.

- [ ] **Step 5: Aggiornare types Supabase generati (se presenti)**

Se esiste un file di tipi DB generati, rigenerarlo (`mcp__supabase__generate_typescript_types`) e committare.

- [ ] **Step 6: PR**

Aprire PR `feat/signup-country-selection` → `master` con riepilogo + nota migration prod applicata.

---

## Self-Review

**Spec coverage:** paese (Task 2/4/6/7/8/9/10) ✓; città country-aware (Task 5/8/9) ✓; province nullable + condizionale (Task 1/3/8/9) ✓; DB + trigger (Task 1) ✓; persistenza signup server-side (Task 6 options.data + Task 1 trigger) ✓; persistenza social/upsert (Task 7) ✓; display profilo (Task 10) ✓; i18n (Task 8) ✓; test (Task 3/4/5/6/7/9 + Task 11) ✓. Fuori scope (API geo, phone-sync) confermato assente.

**Placeholder scan:** nessun TBD/TODO; codice reale in ogni step.

**Type consistency:** `country: string` (cca2) coerente in types/validation/hook/screens; `onSelect(code: string)` coerente tra AuthCountryField e i caller; `province` → `null` su upsert (Task 7/9) coerente con colonna nullable (Task 1).

**Punto da verificare in esecuzione:** `colors.isDark` su `ThemeColors` (Task 4 Step 3) — se il flag dark si ottiene diversamente, adattare la prop `theme` del picker.
