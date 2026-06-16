# Auth Donatori — Milestone 1 (Email/Password) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Area donatori funzionante con registrazione, login, reset password, profilo e logout via email/password (Supabase), senza bloccare i contenuti pubblici.

**Architecture:** Supabase (Auth + Postgres + RLS) come backend. Client `supabase-js` con sessione persistita in MMKV cifrata (chiave in SecureStore, per il limite 2048B di SecureStore). Stato globale via `AuthContext`. Schermate in uno stack auth dentro `AppNavigator`, entry point = nuova tab "Profilo". Tutto dark-aware (pattern A `useThemeColors`).

**Tech Stack:** TypeScript, Expo/React Native, `@supabase/supabase-js`, `expo-secure-store` (già installato), React Navigation, Jest.

> **Nota implementativa (2026-06-15):** storage rivisto da MMKV → **SecureStore con chunking**. Motivo: `expo-secure-store` è già installato e configurato come plugin; cifra nativamente (keychain/keystore); MMKV avrebbe aggiunto un modulo nativo + dipendenza dalla new architecture (rischio build). Il chunking aggira il limite 2048B di SecureStore.

**Spec di riferimento:** `docs/superpowers/specs/2026-06-15-donor-auth-design.md`

**Scope M1:** email/password (signup con profilo completo, verifica email, login, reset, logout, view profilo). **Fuori da M1:** social Google/Apple (M2), elimina-account + modifica profilo avanzata + consensi marketing UI (M3).

---

## Prerequisiti (LEVE UTENTE — bloccanti, prima del Task 1)
- [ ] **P1.** Creare progetto **Supabase** → ottenere `Project URL` e `anon public key` (Dashboard → Settings → API).
- [ ] **P2.** In Supabase Auth → Providers → Email: abilitare "Confirm email" (verifica obbligatoria).
- [ ] **P3.** Fornire le chiavi via `.env` (NON committate): `EXPO_PUBLIC_SUPABASE_URL=...`, `EXPO_PUBLIC_SUPABASE_ANON_KEY=...`.

> Senza P1-P3 i task runtime (4+) non sono testabili end-to-end. I task 1-3 (schema, validazione) sono comunque sviluppabili e testabili in isolamento.

---

## File Structure
- `supabase/migrations/0001_profiles.sql` — schema + RLS + trigger (create)
- `src/shared/auth/supabaseClient.ts` — client + storage adapter (create)
- `src/shared/auth/authStorage.ts` — adapter MMKV+SecureStore (create)
- `src/shared/auth/validation.ts` — validazione form pura (create)
- `src/shared/auth/AuthContext.tsx` — provider + `useAuth` (create)
- `src/shared/auth/types.ts` — tipi dominio auth/profile (create)
- `src/features/auth/screens/{AuthLandingScreen,LoginScreen,SignUpScreen,CompleteProfileScreen,ForgotPasswordScreen,ProfileScreen}.tsx` (create)
- `src/navigation/types.ts` — aggiungere route auth + `ProfileTab` (modify)
- `src/navigation/AppNavigator.tsx` — registrare le screen auth (modify)
- `src/navigation/BottomTabNavigator.tsx` — aggiungere `ProfileTab` + `ICON_MAP` (modify)
- `src/locales/it.ts` + `src/locales/en.ts` — stringhe `auth.*` + `navigation.profile` (modify)
- `App.tsx` — montare `<AuthProvider>` (modify)
- `src/shared/config/environment.ts` — aggiungere validazione `SUPABASE_URL`/`ANON_KEY` (modify)
- Test: `src/__tests__/shared/auth/{validation,AuthContext}.test.ts(x)`

---

## Task 1: Schema DB + RLS

**Files:** Create `supabase/migrations/0001_profiles.sql`

- [ ] **Step 1: Scrivere la migration**

```sql
-- profiles: 1:1 con auth.users
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  first_name text not null,
  last_name text not null,
  phone text not null,
  city text not null,
  province text not null,
  birth_date date not null,
  privacy_consent_at timestamptz not null,
  marketing_consent boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint adult check (birth_date <= (now()::date - interval '18 years'))
);

alter table public.profiles enable row level security;

create policy "own_select" on public.profiles for select using (auth.uid() = id);
create policy "own_insert" on public.profiles for insert with check (auth.uid() = id);
create policy "own_update" on public.profiles for update using (auth.uid() = id);
create policy "own_delete" on public.profiles for delete using (auth.uid() = id);
```

- [ ] **Step 2: Applicare la migration** su Supabase (SQL Editor o `supabase db push`).
Run (se Supabase CLI): `supabase db push`
Expected: tabella `profiles` creata, RLS attiva.

- [ ] **Step 3: Verificare RLS** (SQL Editor): con due utenti test, l'utente A `select` su `profiles` NON vede la riga di B.

- [ ] **Step 4: Commit**
```bash
git add supabase/migrations/0001_profiles.sql
git commit -m "feat(auth): schema profiles + RLS"
```

---

## Task 2: Validazione form (TDD — logica pura, testabile senza backend)

**Files:** Create `src/shared/auth/validation.ts` · Test `src/__tests__/shared/auth/validation.test.ts`

- [ ] **Step 1: Scrivere i test che falliscono**

```ts
import {
  validateEmail, validatePassword, validatePhoneIT,
  validateAdult, validateRequired, validateSignUpForm,
} from '@/shared/auth/validation';

describe('auth validation', () => {
  it('email', () => {
    expect(validateEmail('a@b.it')).toBeNull();
    expect(validateEmail('nope')).toBe('email_invalid');
  });
  it('password min 8 + lettera + numero', () => {
    expect(validatePassword('abcd1234')).toBeNull();
    expect(validatePassword('short')).toBe('password_weak');
  });
  it('phone IT E.164', () => {
    expect(validatePhoneIT('+393331234567')).toBeNull();
    expect(validatePhoneIT('3331234567')).toBe('phone_invalid');
  });
  it('adult >= 18', () => {
    expect(validateAdult('2000-01-01')).toBeNull();
    expect(validateAdult('2020-01-01')).toBe('not_adult');
  });
  it('required', () => {
    expect(validateRequired('x')).toBeNull();
    expect(validateRequired('  ')).toBe('required');
  });
  it('form aggrega errori per campo', () => {
    const errors = validateSignUpForm({
      firstName: '', lastName: 'Rossi', email: 'a@b.it', password: 'abcd1234',
      phone: '+393331234567', city: 'Roma', province: 'RM',
      birthDate: '2000-01-01', privacyConsent: true,
    });
    expect(errors.firstName).toBe('required');
    expect(errors.lastName).toBeUndefined();
  });
  it('privacy consent obbligatorio', () => {
    const errors = validateSignUpForm({
      firstName: 'A', lastName: 'B', email: 'a@b.it', password: 'abcd1234',
      phone: '+393331234567', city: 'Roma', province: 'RM',
      birthDate: '2000-01-01', privacyConsent: false,
    });
    expect(errors.privacyConsent).toBe('required');
  });
});
```

- [ ] **Step 2: Eseguire i test** → `npx jest validation.test -v` → Expected: FAIL (modulo assente).

- [ ] **Step 3: Implementare**

```ts
export type FieldError = string | null;

export const validateEmail = (v: string): FieldError =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()) ? null : 'email_invalid';

export const validatePassword = (v: string): FieldError =>
  v.length >= 8 && /[a-zA-Z]/.test(v) && /\d/.test(v) ? null : 'password_weak';

// E.164: + seguito da 8-15 cifre; default IT verrà pre-compilato nella UI (+39)
export const validatePhoneIT = (v: string): FieldError =>
  /^\+\d{8,15}$/.test(v.trim()) ? null : 'phone_invalid';

export const validateAdult = (isoDate: string): FieldError => {
  const d = new Date(isoDate);
  if (Number.isNaN(d.getTime())) return 'date_invalid';
  const cutoff = new Date();
  cutoff.setFullYear(cutoff.getFullYear() - 18);
  return d <= cutoff ? null : 'not_adult';
};

export const validateRequired = (v: string): FieldError =>
  v.trim().length > 0 ? null : 'required';

export interface SignUpInput {
  firstName: string; lastName: string; email: string; password: string;
  phone: string; city: string; province: string; birthDate: string;
  privacyConsent: boolean;
}
export type SignUpErrors = Partial<Record<keyof SignUpInput, string>>;

export const validateSignUpForm = (input: SignUpInput): SignUpErrors => {
  const e: SignUpErrors = {};
  if (validateRequired(input.firstName)) e.firstName = 'required';
  if (validateRequired(input.lastName)) e.lastName = 'required';
  const email = validateEmail(input.email); if (email) e.email = email;
  const pwd = validatePassword(input.password); if (pwd) e.password = pwd;
  const phone = validatePhoneIT(input.phone); if (phone) e.phone = phone;
  if (validateRequired(input.city)) e.city = 'required';
  if (validateRequired(input.province)) e.province = 'required';
  const adult = validateAdult(input.birthDate); if (adult) e.birthDate = adult;
  if (!input.privacyConsent) e.privacyConsent = 'required';
  return e;
};
```

- [ ] **Step 4: Eseguire i test** → `npx jest validation.test -v` → Expected: PASS.
- [ ] **Step 5: Commit**
```bash
git add src/shared/auth/validation.ts src/__tests__/shared/auth/validation.test.ts
git commit -m "feat(auth): validazione form donatore (TDD)"
```

---

## Task 3: Storage adapter sicuro (MMKV cifrato + SecureStore)

**Files:** Create `src/shared/auth/authStorage.ts`

> Motivo: SecureStore limita a 2048B ma la sessione Supabase è più grande. Pattern: chiave random (expo-crypto) salvata in SecureStore, sessione in MMKV cifrata con quella chiave.

- [ ] **Step 1: Implementare l'adapter**

```ts
import * as SecureStore from 'expo-secure-store';
import * as Crypto from 'expo-crypto';
import { MMKV } from 'react-native-mmkv';

const KEY_NAME = 'rise_auth_enc_key';

const getOrCreateEncryptionKey = (): string => {
  let key = SecureStore.getItem(KEY_NAME);
  if (!key) {
    const bytes = Crypto.getRandomBytes(32);
    key = Array.from(bytes).map((b) => b.toString(16).padStart(2, '0')).join('');
    SecureStore.setItem(KEY_NAME, key);
  }
  return key;
};

const storage = new MMKV({ id: 'rise-auth', encryptionKey: getOrCreateEncryptionKey() });

// Interfaccia richiesta da supabase-js (auth.storage)
export const authStorage = {
  getItem: (k: string): string | null => storage.getString(k) ?? null,
  setItem: (k: string, v: string): void => storage.set(k, v),
  removeItem: (k: string): void => storage.delete(k),
};
```

- [ ] **Step 2: Typecheck** → `npx tsc --noEmit` → Expected: exit 0.
- [ ] **Step 3: Commit**
```bash
git add src/shared/auth/authStorage.ts
git commit -m "feat(auth): storage sessione cifrato (MMKV+SecureStore)"
```

---

## Task 4: Client Supabase + tipi + env

**Files:** Create `src/shared/auth/types.ts`, `src/shared/auth/supabaseClient.ts` · Modify `src/shared/config/environment.ts`

- [ ] **Step 1: Tipi dominio** (`types.ts`)

```ts
export interface Profile {
  id: string;
  first_name: string;
  last_name: string;
  phone: string;
  city: string;
  province: string;
  birth_date: string; // ISO date
  privacy_consent_at: string;
  marketing_consent: boolean;
}
export interface ProfileInput {
  first_name: string; last_name: string; phone: string;
  city: string; province: string; birth_date: string;
  privacy_consent: boolean; marketing_consent: boolean;
}
```

- [ ] **Step 2: Aggiungere env validati** (`environment.ts`)

Aggiungere ai campi e alla validazione fail-fast:
```ts
SUPABASE_URL: getEnvVar('EXPO_PUBLIC_SUPABASE_URL') ?? '',
SUPABASE_ANON_KEY: getEnvVar('EXPO_PUBLIC_SUPABASE_ANON_KEY') ?? '',
```
(estendere `AppEnvironment`, i 3 `environmentConfigs`, e `requiredFields` con i due nuovi campi; in test usare valori fittizi via `JEST_WORKER_ID` come già fatto per `API_BASE_URL`).

- [ ] **Step 3: Client** (`supabaseClient.ts`)

```ts
import { createClient } from '@supabase/supabase-js';
import { AppState } from 'react-native';
import { authStorage } from './authStorage';
import { env } from '@/shared/config/environment';

export const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_ANON_KEY, {
  auth: {
    storage: authStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

AppState.addEventListener('change', (state) => {
  if (state === 'active') supabase.auth.startAutoRefresh();
  else supabase.auth.stopAutoRefresh();
});
```

- [ ] **Step 4: Typecheck + lint** → `npx tsc --noEmit && npx eslint src/shared/auth src/shared/config/environment.ts` → Expected: exit 0.
- [ ] **Step 5: Commit**
```bash
git add src/shared/auth/types.ts src/shared/auth/supabaseClient.ts src/shared/config/environment.ts
git commit -m "feat(auth): client Supabase + env validati"
```

---

## Task 5: AuthContext + useAuth (TDD con Supabase mockato)

**Files:** Create `src/shared/auth/AuthContext.tsx` · Test `src/__tests__/shared/auth/AuthContext.test.tsx`

- [ ] **Step 1: Test che falliscono** (mock di `supabaseClient`)

```tsx
import { render, waitFor, act } from '@testing-library/react-native';
import { Text } from 'react-native';
import { AuthProvider, useAuth } from '@/shared/auth/AuthContext';

jest.mock('@/shared/auth/supabaseClient', () => ({
  supabase: {
    auth: {
      getSession: jest.fn().mockResolvedValue({ data: { session: null } }),
      onAuthStateChange: jest.fn().mockReturnValue({ data: { subscription: { unsubscribe: jest.fn() } } }),
      signInWithPassword: jest.fn().mockResolvedValue({ data: { session: {} }, error: null }),
      signOut: jest.fn().mockResolvedValue({ error: null }),
    },
    from: jest.fn().mockReturnValue({
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({ data: null, error: null }),
    }),
  },
}));

const Probe = () => { const { status } = useAuth(); return <Text>{status}</Text>; };

it('parte in loading poi unauthenticated senza sessione', async () => {
  const { getByText } = render(<AuthProvider><Probe /></AuthProvider>);
  await waitFor(() => getByText('unauthenticated'));
});
```

- [ ] **Step 2: Eseguire** → `npx jest AuthContext.test -v` → Expected: FAIL.

- [ ] **Step 3: Implementare** (`AuthContext.tsx`)

```tsx
import React, { createContext, useContext, useEffect, useMemo, useState, useCallback } from 'react';
import type { Session } from '@supabase/supabase-js';
import { supabase } from './supabaseClient';
import type { Profile, ProfileInput } from './types';

type Status = 'loading' | 'authenticated' | 'unauthenticated';

interface AuthState {
  status: Status;
  session: Session | null;
  profile: Profile | null;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signUp: (email: string, password: string, profile: ProfileInput) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: string | null }>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthState | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [status, setStatus] = useState<Status>('loading');
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);

  const loadProfile = useCallback(async (userId: string) => {
    const { data } = await supabase.from('profiles').select('*').eq('id', userId).single();
    setProfile((data as Profile) ?? null);
  }, []);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setStatus(data.session ? 'authenticated' : 'unauthenticated');
      if (data.session) void loadProfile(data.session.user.id);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => {
      setSession(s);
      setStatus(s ? 'authenticated' : 'unauthenticated');
      if (s) void loadProfile(s.user.id); else setProfile(null);
    });
    return () => sub.subscription.unsubscribe();
  }, [loadProfile]);

  const signIn = useCallback(async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error: error?.message ?? null };
  }, []);

  const signUp = useCallback(async (email: string, password: string, p: ProfileInput) => {
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) return { error: error.message };
    if (data.user) {
      const { error: pErr } = await supabase.from('profiles').insert({
        id: data.user.id, first_name: p.first_name, last_name: p.last_name,
        phone: p.phone, city: p.city, province: p.province, birth_date: p.birth_date,
        privacy_consent_at: new Date().toISOString(), marketing_consent: p.marketing_consent,
      });
      if (pErr) return { error: pErr.message };
    }
    return { error: null };
  }, []);

  const signOut = useCallback(async () => { await supabase.auth.signOut(); }, []);

  const resetPassword = useCallback(async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email);
    return { error: error?.message ?? null };
  }, []);

  const refreshProfile = useCallback(async () => {
    if (session?.user.id) await loadProfile(session.user.id);
  }, [session, loadProfile]);

  const value = useMemo(
    () => ({ status, session, profile, signIn, signUp, signOut, resetPassword, refreshProfile }),
    [status, session, profile, signIn, signUp, signOut, resetPassword, refreshProfile]
  );
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthState => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
```

- [ ] **Step 4: Eseguire** → `npx jest AuthContext.test -v` → Expected: PASS.
- [ ] **Step 5: Commit**
```bash
git add src/shared/auth/AuthContext.tsx src/__tests__/shared/auth/AuthContext.test.tsx
git commit -m "feat(auth): AuthContext + useAuth (TDD)"
```

---

## Task 6: Montare AuthProvider + estendere il mock dei test esistenti

**Files:** Modify `App.tsx`, e l'helper test providers (`src/__tests__/helpers/testProviders.tsx` o equivalente `AllProviders`)

- [ ] **Step 1:** In `App.tsx`, avvolgere l'albero con `<AuthProvider>` accanto agli altri provider (dentro `ThemeProvider`, NON nel ramo OTA early-return).
- [ ] **Step 2:** In `AllProviders`/`renderWithProviders`, avvolgere con `<AuthProvider>` (o un mock) così i 371 test esistenti non rompono.
- [ ] **Step 3: Eseguire la suite** → `npx jest --watchAll=false` → Expected: ≥371 passed, 0 fail.
- [ ] **Step 4: Commit**
```bash
git add App.tsx src/__tests__/helpers
git commit -m "feat(auth): monta AuthProvider + allinea test providers"
```

---

## Task 7: Tipi navigazione + i18n + tab Profilo

**Files:** Modify `src/navigation/types.ts`, `src/navigation/BottomTabNavigator.tsx`, `src/locales/it.ts`, `src/locales/en.ts`

- [ ] **Step 1:** In `types.ts`: aggiungere a `BottomTabParamList` la voce `ProfileTab: undefined;` e a `RootStackParamList` le route `Login`, `SignUp`, `CompleteProfile`, `ForgotPassword` (`undefined`).
- [ ] **Step 2:** In `BottomTabNavigator.tsx`: aggiungere `ICON_MAP.ProfileTab = 'account'`; aggiungere `<Tab.Screen name="ProfileTab" component={ProfileScreen} options={{ tabBarAccessibilityLabel: t('navigation.profile') }} />`. (Il `tabColors` switch ha già un default `HomeTab`-like per route non speciali: ProfileTab userà quel ramo, ok.)
- [ ] **Step 3:** In `it.ts`/`en.ts`: aggiungere `navigation.profile` ("Profilo"/"Profile") e il blocco `auth.*` (label campi, errori, CTA — vedi Task 8 per le chiavi usate).
- [ ] **Step 4: Typecheck** → `npx tsc --noEmit` → Expected: exit 0.
- [ ] **Step 5: Commit**
```bash
git add src/navigation/types.ts src/navigation/BottomTabNavigator.tsx src/locales/it.ts src/locales/en.ts
git commit -m "feat(auth): tab Profilo + tipi nav + i18n auth"
```

---

## Task 8: Schermata SignUp (la più complessa — pattern per le altre)

**Files:** Create `src/features/auth/screens/SignUpScreen.tsx`

> Pattern UI del progetto: `useThemeColors()` + `createStyles(colors)` (pattern A), componenti `PerfectText`/`PlatformTouchable` da `@/components/ui`, `TextInput` di RN per i campi (nel progetto non esiste un Input custom). i18n via `useTranslation`. Dark-aware obbligatorio.

- [ ] **Step 1: Implementare** la schermata con: stato locale dei campi (firstName, lastName, email, password, phone con default `+39`, city, province, birthDate, privacyConsent, marketingConsent), `validateSignUpForm` on submit, rendering errori per-campo (da i18n `auth.errors.*`), chiamata `useAuth().signUp(email, password, profileInput)`, gestione `error`/loading, su successo → messaggio "controlla la tua email per verificare l'account". Province: per M1 input testo 2 lettere (select strutturata rimandata a rifinitura). Struttura: `KeyboardAvoidingView` + `ScrollView`.

- [ ] **Step 2: Test rendering** (`src/__tests__/features/auth/SignUpScreen.test.tsx`): render con `renderWithProviders`, verifica presenza campi e che submit con campi vuoti mostri gli errori (mock `useAuth`).
- [ ] **Step 3: Eseguire** → `npx jest SignUpScreen.test -v` → Expected: PASS.
- [ ] **Step 4: Typecheck + lint** → exit 0.
- [ ] **Step 5: Commit**
```bash
git add src/features/auth/screens/SignUpScreen.tsx src/__tests__/features/auth/SignUpScreen.test.tsx
git commit -m "feat(auth): schermata registrazione donatore"
```

---

## Task 9: Schermate Login, ForgotPassword, AuthLanding

**Files:** Create `LoginScreen.tsx`, `ForgotPasswordScreen.tsx`, `AuthLandingScreen.tsx` (stesso pattern del Task 8)

- [ ] **Step 1: LoginScreen** — campi email/password, `validateEmail`, `useAuth().signIn`, errori, link a SignUp e ForgotPassword.
- [ ] **Step 2: ForgotPasswordScreen** — campo email, `useAuth().resetPassword`, conferma "email inviata".
- [ ] **Step 3: AuthLandingScreen** — CTA "Accedi" / "Registrati" (in M1 niente bottoni social; spazio riservato per M2).
- [ ] **Step 4: Test** rendering minimi per ciascuna (`renderWithProviders` + mock `useAuth`).
- [ ] **Step 5: Eseguire** → `npx jest features/auth -v` → Expected: PASS.
- [ ] **Step 6: Commit**
```bash
git add src/features/auth/screens/LoginScreen.tsx src/features/auth/screens/ForgotPasswordScreen.tsx src/features/auth/screens/AuthLandingScreen.tsx src/__tests__/features/auth
git commit -m "feat(auth): schermate login, reset password, landing"
```

---

## Task 10: ProfileScreen (tab Profilo) — gating area donatori

**Files:** Create `src/features/auth/screens/ProfileScreen.tsx`

- [ ] **Step 1: Implementare** — `const { status, profile, signOut } = useAuth();`
  - `status === 'loading'` → spinner.
  - `status === 'unauthenticated'` → mostra `AuthLandingScreen` (CTA Accedi/Registrati che navigano a `Login`/`SignUp`).
  - `status === 'authenticated'` → mostra dati profilo (nome, cognome, email da `session.user.email`, telefono, città+provincia, data nascita) + pulsante **Logout** (`signOut`). (Modifica profilo ed elimina account = M3.)
- [ ] **Step 2: Test** — i 3 stati con mock `useAuth` (`renderWithProviders`).
- [ ] **Step 3: Eseguire** → `npx jest ProfileScreen.test -v` → Expected: PASS.
- [ ] **Step 4: Commit**
```bash
git add src/features/auth/screens/ProfileScreen.tsx src/__tests__/features/auth/ProfileScreen.test.tsx
git commit -m "feat(auth): tab Profilo con gating sessione"
```

---

## Task 11: Registrare le screen auth in AppNavigator

**Files:** Modify `src/navigation/AppNavigator.tsx`

- [ ] **Step 1:** Aggiungere `<Stack.Screen>` per `Login`, `SignUp`, `CompleteProfile` (placeholder M1: rimanda a Profile), `ForgotPassword` con `headerShown` coerente (titolo da i18n). Import delle schermate.
- [ ] **Step 2: Typecheck + lint + suite** → `npx tsc --noEmit && npm run lint && npx jest --watchAll=false` → Expected: tutto verde, ≥371 test.
- [ ] **Step 3: Commit**
```bash
git add src/navigation/AppNavigator.tsx
git commit -m "feat(auth): registra schermate auth nello stack"
```

---

## Verifica end-to-end (M1, su dev build con Supabase configurato)
1. Tab "Profilo" (sloggato) → AuthLanding → Registrati → compila tutti i campi → submit → "verifica email".
2. Click link email → torna in app → Login → tab Profilo mostra i dati.
3. Kill & riapri app → sessione persiste (resta loggato).
4. Logout → tab Profilo torna a AuthLanding.
5. ForgotPassword → ricezione email reset → nuova password → login ok.
6. Contenuti pubblici (Impatto/Progetti) accessibili senza login (non-gating).
7. `npm run conta-problemi` = 0; `npx jest` ≥ 371 passed; snapshot invariati.
8. RLS: query diretta su Supabase conferma che un utente non legge il profilo altrui.

---

## Milestone successive (piani separati)
- **M2 — Social login (Google + Apple)**: `expo-apple-authentication` + `@react-native-google-signin/google-signin` → `signInWithIdToken`. Bottoni in AuthLanding. CompleteProfileScreen reale (raccoglie telefono/città/provincia/data nascita post-social). Prerequisiti utente: OAuth Google (Google Cloud) + Apple Sign In (Apple Developer) + EAS dev build. Apple Sign In obbligatorio su iOS (App Store 4.8).
- **M3 — GDPR & profilo**: modifica profilo, elimina account (cascade), gestione consenso marketing, export dati.
