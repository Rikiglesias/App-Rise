# Auth Donatori — Milestone 2 (Social: Google + Apple) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: superpowers:subagent-driven-development o executing-plans. Steps con checkbox `- [ ]`.

**Goal:** Aggiungere login social Google + Apple all'auth donatori (M1), con step "Completa profilo" post-social (i provider non forniscono telefono/città/provincia/data nascita).

**Architecture:** Native sign-in (`expo-apple-authentication` + `@react-native-google-signin/google-signin`) → id-token → `supabase.auth.signInWithIdToken({ provider, token })`. Riusa AuthContext/AuthScreen/AuthInput/AuthButton di M1. Richiede EAS dev build (no Expo Go per Google nativo).

**Tech Stack:** expo-apple-authentication, @react-native-google-signin/google-signin, @supabase/supabase-js (già presente), React Navigation.

**Spec:** `docs/superpowers/specs/2026-06-15-donor-auth-design.md` · **Dipende da:** M1 (`feat/donor-auth`, commit fino `48f60a5`).

---

## Prerequisiti (LEVE UTENTE — bloccano i task runtime/E2E)
- [ ] **Google Cloud Console**: OAuth client **Web** (per Supabase) + **iOS** + **Android**. Web client ID → Supabase Dashboard → Auth → Providers → Google. iOS/Android client ID → config app.
- [ ] **Apple Developer**: abilitare "Sign in with Apple" capability + Service ID + key; configurare in Supabase → Auth → Providers → Apple.
- [ ] **EAS dev build** dopo l'aggiunta dei plugin nativi (Google/Apple non girano in Expo Go).
- [ ] M1 già validato E2E (auth email funzionante su Supabase).

---

## File Structure
- `app.config.js` — aggiungere plugin `expo-apple-authentication` + config Google sign-in (modify)
- `src/shared/auth/AuthContext.tsx` — aggiungere `signInWithApple()`, `signInWithGoogle()` (modify)
- `src/shared/auth/socialAuth.ts` — wrapper nativi (Apple/Google) che ritornano id-token (create)
- `src/features/auth/screens/CompleteProfileScreen.tsx` — form profilo post-social (create; la route esiste già da M1)
- `src/features/auth/screens/AuthLandingScreen.tsx` — bottoni social (modify)
- `src/features/auth/components/SocialButtons.tsx` — Apple/Google buttons (create)
- `src/navigation/AppNavigator.tsx` — registrare `CompleteProfile` (modify)
- `src/locales/{it,en}.ts` — stringhe `auth.social.*` + `auth.completeProfile.*` (modify)
- Test: `src/__tests__/features/auth/socialAuth.test.tsx`, `CompleteProfileScreen.test.tsx`

---

## Task 1: Dipendenze + config nativa
- [ ] **Step 1:** `npx expo install expo-apple-authentication @react-native-google-signin/google-signin`
- [ ] **Step 2:** `app.config.js`: aggiungere `'expo-apple-authentication'` ai plugin; aggiungere il config plugin Google (`@react-native-google-signin/google-signin` con `iosUrlScheme`).
- [ ] **Step 3:** `npx tsc --noEmit` exit 0; `npm run conta-problemi` = 0.
- [ ] **Step 4:** Commit `chore(auth): deps social (apple/google) + config plugin`.

## Task 2: Wrapper social nativi (TDD ove possibile)
**Files:** Create `src/shared/auth/socialAuth.ts`
- [ ] **Step 1:** Implementare:
```ts
import * as AppleAuthentication from 'expo-apple-authentication';
import { GoogleSignin } from '@react-native-google-signin/google-signin';

export const getAppleIdToken = async (): Promise<string | null> => {
  const cred = await AppleAuthentication.signInAsync({
    requestedScopes: [
      AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
      AppleAuthentication.AppleAuthenticationScope.EMAIL,
    ],
  });
  return cred.identityToken ?? null;
};

export const getGoogleIdToken = async (): Promise<string | null> => {
  await GoogleSignin.hasPlayServices();
  const res = await GoogleSignin.signIn();
  return res.data?.idToken ?? null;
};

export const configureGoogle = (webClientId: string): void => {
  GoogleSignin.configure({ webClientId });
};
```
- [ ] **Step 2:** tsc + lint exit 0. Commit.

## Task 3: Estendere AuthContext
**Files:** Modify `src/shared/auth/AuthContext.tsx`
- [ ] **Step 1:** Aggiungere a `AuthState`: `signInWithApple: () => Promise<{ error: string | null }>`, `signInWithGoogle: () => Promise<{ error: string | null }>`.
- [ ] **Step 2:** Implementare con `signInWithIdToken`:
```ts
const signInWithApple = useCallback(async () => {
  const token = await getAppleIdToken();
  if (!token) return { error: 'apple_cancelled' };
  const { error } = await supabase.auth.signInWithIdToken({ provider: 'apple', token });
  return { error: error?.message ?? null };
}, []);
// analogo signInWithGoogle con provider 'google'
```
- [ ] **Step 3:** Aggiornare il mock globale `jest.setup.js` (aggiungere `signInWithIdToken`). Suite ≥391 verde.
- [ ] **Step 4:** Test AuthContext per i due metodi (mock socialAuth + supabase). Commit.

## Task 4: CompleteProfileScreen (post-social)
**Files:** Create `src/features/auth/screens/CompleteProfileScreen.tsx`
- [ ] **Step 1:** Form con telefono/città/provincia/data nascita/consenso privacy (riusa `AuthInput`/`AuthButton`/`validateSignUpForm` parziale). Su submit → `supabase.from('profiles').upsert({ id: session.user.id, ... })` → `refreshProfile()` → torna alla tab Profilo.
- [ ] **Step 2:** Logica gating: in `ProfileScreen`/post-login, se `status==='authenticated'` ma `profile===null` → naviga a `CompleteProfile`.
- [ ] **Step 3:** Test rendering + validazione. Commit.

## Task 5: Bottoni social in AuthLanding
**Files:** Create `src/features/auth/components/SocialButtons.tsx`; Modify `AuthLandingScreen.tsx`
- [ ] **Step 1:** `AppleAuthentication.AppleAuthenticationButton` (solo iOS, `Platform.OS==='ios'`) + bottone Google custom. Handlers → `useAuth().signInWithApple/Google`.
- [ ] **Step 2:** i18n `auth.social.continueApple`/`continueGoogle`. Test render. Commit.

## Task 6: Registrare CompleteProfile + configure Google al boot
**Files:** Modify `AppNavigator.tsx`, `App.tsx`
- [ ] **Step 1:** `<Stack.Screen name="CompleteProfile" component={CompleteProfileScreen} />`.
- [ ] **Step 2:** Al boot (dove c'è `.env`), `configureGoogle(env.GOOGLE_WEB_CLIENT_ID)` (aggiungere env var). Solo se presente.
- [ ] **Step 3:** tsc + lint + jest verdi. Commit.

---

## Verifica E2E (dev build, LEVA UTENTE)
1. Apple Sign In (iOS) → nuovo utente → CompleteProfile → home; utente esistente → home diretto.
2. Google Sign In → idem.
3. Profilo creato in `profiles` con i dati del CompleteProfile.
4. `npm run conta-problemi` = 0; `jest` verde; snapshot invariati.

## Note / vincoli
- **Apple non fornisce nome/telefono/ecc.** → CompleteProfile obbligatorio al primo accesso social.
- **Apple Sign In obbligatorio su iOS** quando si offre Google (App Store Guideline 4.8) — già previsto.
- API SDK esatte (`signInWithIdToken`, `GoogleSignin.signIn()` shape) **da confermare con docs ufficiali in fase di implementazione** (come fatto in M1).
- M3 (separato): elimina-account/GDPR, modifica profilo, export dati, consenso marketing UI.
