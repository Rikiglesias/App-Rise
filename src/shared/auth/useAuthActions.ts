import { useCallback, useEffect, useMemo, useState } from 'react';
import { Platform } from 'react-native';
import type { Session } from '@supabase/supabase-js';

import { supabase } from './supabaseClient';
import { getAppleIdToken, getGoogleIdToken } from './socialAuth';
import {
  buildResetRedirectTo,
  buildEmailConfirmRedirectTo,
  parseAuthRedirect,
} from './authRedirect';
import { exportData as runDataExport } from './dataExport';
import { buildConsentInsert, isReConsentRequired } from './consent';
import type {
  Profile,
  ProfileInput,
  ProfileEditable,
  ConsentEvent,
  ConsentPurpose,
  ConsentAction,
} from './types';
import { PROFILE_EDITABLE_KEYS } from './types';
import { authTelemetry } from './authTelemetry';
import { logWarn } from '@/shared/utils/logger';

export type AuthStatus = 'loading' | 'authenticated' | 'unauthenticated';

/** Azioni auth + stato re-consent. Tutto ciò che AuthState espone oltre a status/session/profile. */
export interface AuthActions {
  signIn: (
    email: string,
    password: string
  ) => Promise<{ error: string | null }>;
  signUp: (
    email: string,
    password: string,
    profile: ProfileInput
  ) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: string | null }>;
  /** Imposta la nuova password (post deep link di recovery, sessione già attiva). */
  updatePassword: (newPassword: string) => Promise<{ error: string | null }>;
  /** Stabilisce la sessione dal deep link di recovery (token nel fragment). */
  completeRecoveryFromUrl: (url: string) => Promise<{ ok: boolean }>;
  /** Stabilisce la sessione dal deep link di conferma email signup (token nel fragment). */
  completeEmailConfirmFromUrl: (url: string) => Promise<{ ok: boolean }>;
  signInWithApple: () => Promise<{ error: string | null }>;
  signInWithGoogle: () => Promise<{ error: string | null }>;
  refreshProfile: () => Promise<void>;
  /** Aggiorna i campi profilo correggibili (GDPR Art.16). Whitelist: solo i campi passati, mai id/consensi. */
  updateProfile: (
    fields: Partial<ProfileEditable>
  ) => Promise<{ error: string | null }>;
  /** Cambia l'email dell'account (secure email change Supabase: conferma su vecchia+nuova casella). */
  updateEmail: (email: string) => Promise<{ error: string | null }>;
  /** Cancellazione immediata via Edge Function (GDPR Art.17). `appleAuthCode`: fresh per la revoca Apple. */
  deleteAccountNow: (
    appleAuthCode?: string
  ) => Promise<{ error: string | null }>;
  /** Programma la cancellazione a +30gg (grace period recuperabile). */
  scheduleDeletion: () => Promise<{ error: string | null }>;
  /** Annulla una cancellazione programmata. */
  cancelScheduledDeletion: () => Promise<{ error: string | null }>;
  /** Esporta i dati dell'utente via share-sheet (GDPR Art.20). */
  exportData: () => Promise<void>;
  /** Registra un evento di consenso nel ledger append-only (M4, Art.7). */
  recordConsent: (
    purpose: ConsentPurpose,
    action: ConsentAction
  ) => Promise<{ error: string | null }>;
  /** Concede/revoca il consenso marketing (evento + cache profiles.marketing_consent). */
  setMarketingConsent: (enabled: boolean) => Promise<{ error: string | null }>;
  /** Cronologia consensi dell'utente (per export/trasparenza). `null` = errore di fetch. */
  getConsentHistory: () => Promise<ConsentEvent[] | null>;
  /** True se l'utente deve ri-accettare l'informativa corrente (cambio materiale). */
  needsReConsent: boolean;
  /** Registra l'accettazione della versione corrente dell'informativa. */
  acceptCurrentPolicy: () => Promise<{ error: string | null }>;
}

interface UseAuthActionsArgs {
  status: AuthStatus;
  session: Session | null;
  profile: Profile | null;
  loadProfile: (userId: string) => Promise<void>;
}

/**
 * Estrae le action auth (CRUD/GDPR/consensi) e la logica di re-consent dallo
 * `AuthProvider`, che restava un God-component oltre il limite eslint. Lo stato
 * fondante (status/session/profile) resta nel provider e viene iniettato qui:
 * l'hook non lo possiede, lo consuma. Nessun cambio di comportamento rispetto al
 * monolite precedente (estrazione pura).
 */
export const useAuthActions = ({
  status,
  session,
  profile,
  loadProfile,
}: UseAuthActionsArgs): AuthActions => {
  const [needsReConsent, setNeedsReConsent] = useState(false);

  const signIn = useCallback(async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    authTelemetry('signin', error?.message);
    return { error: error?.message ?? null };
  }, []);

  const signUp = useCallback(
    async (email: string, password: string, p: ProfileInput) => {
      // Profilo + consensi iniziali creati SERVER-SIDE dal trigger handle_new_user
      // (migration 0004) leggendo options.data: con "Confirm email" ON non c'è sessione
      // attiva qui, quindi un insert client-side verrebbe bloccato da RLS (auth.uid() null).
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          // Deep link che riporta nell'app dopo la conferma email (flusso implicit,
          // token nel fragment → gestiti da useAuthDeepLink). Senza, il link punterebbe
          // al Site URL web e la conferma non rientrerebbe in-app. Allow-list `rahitalia://**`.
          emailRedirectTo: buildEmailConfirmRedirectTo(),
          data: {
            first_name: p.first_name,
            last_name: p.last_name,
            phone: p.phone,
            city: p.city,
            province: p.province,
            country: p.country,
            birth_date: p.birth_date,
            marketing_consent: p.marketing_consent,
          },
        },
      });
      authTelemetry('signup', error?.message);
      return { error: error?.message ?? null };
    },
    []
  );

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
  }, []);

  const resetPassword = useCallback(async (email: string) => {
    // redirectTo: deep link che riporta nell'app (allow-list Supabase). Senza,
    // il link punterebbe al Site URL web e il reset non si completerebbe in-app.
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: buildResetRedirectTo(),
    });
    authTelemetry('reset_password', error?.message);
    return { error: error?.message ?? null };
  }, []);

  const updatePassword = useCallback(async (newPassword: string) => {
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    authTelemetry('update_password', error?.message);
    return { error: error?.message ?? null };
  }, []);

  // Stabilisce la sessione dai token nel fragment di un redirect auth, ma solo se il
  // `type` combacia con quello atteso (recovery vs signup): evita che un deep link di un
  // flusso venga consumato dall'altro. Condiviso da recovery e conferma email (DRY).
  const setSessionFromUrl = useCallback(
    async (url: string, expectedType: 'recovery' | 'signup') => {
      const { type, access_token, refresh_token } = parseAuthRedirect(url);
      if (type !== expectedType || !access_token || !refresh_token) {
        return { ok: false };
      }
      const { error } = await supabase.auth.setSession({
        access_token,
        refresh_token,
      });
      if (error) {
        // Token scaduto/già usato o errore di rete: senza questo log il fallimento del
        // deep link non ha dato per la diagnosi (il ramo !ok è gestito in useAuthDeepLink).
        logWarn('setSession from deep link failed', 'auth.deeplink', {
          type: expectedType,
          error: error.message,
        });
      }
      return { ok: !error };
    },
    []
  );

  const completeRecoveryFromUrl = useCallback(
    (url: string) => setSessionFromUrl(url, 'recovery'),
    [setSessionFromUrl]
  );

  const completeEmailConfirmFromUrl = useCallback(
    (url: string) => setSessionFromUrl(url, 'signup'),
    [setSessionFromUrl]
  );

  const signInWithApple = useCallback(async () => {
    try {
      const token = await getAppleIdToken();
      if (!token) return { error: 'apple_cancelled' };
      const { error } = await supabase.auth.signInWithIdToken({
        provider: 'apple',
        token,
      });
      authTelemetry('signin_apple', error?.message);
      return { error: error?.message ?? null };
    } catch (e) {
      // getAppleIdToken rilancia gli errori Apple NON-annullamento: qui li
      // trasformiamo in un esito gestibile (niente unhandled rejection nel caller).
      authTelemetry('signin_apple', (e as Error)?.message ?? 'apple_error');
      return { error: 'apple_error' };
    }
  }, []);

  const signInWithGoogle = useCallback(async () => {
    try {
      const token = await getGoogleIdToken();
      if (!token) return { error: 'google_cancelled' };
      const { error } = await supabase.auth.signInWithIdToken({
        provider: 'google',
        token,
      });
      authTelemetry('signin_google', error?.message);
      return { error: error?.message ?? null };
    } catch (e) {
      authTelemetry('signin_google', (e as Error)?.message ?? 'google_error');
      return { error: 'google_error' };
    }
  }, []);

  const refreshProfile = useCallback(async () => {
    if (session?.user.id) await loadProfile(session.user.id);
  }, [session, loadProfile]);

  const updateProfile = useCallback(
    async (fields: Partial<ProfileEditable>) => {
      const userId = session?.user.id;
      if (!userId) return { error: 'not_authenticated' };
      // Whitelist: solo i campi editabili effettivamente passati (no upsert/no null su campi assenti).
      // Helper generico su K: correla chiave↔valore per un singolo K (il for-loop
      // con chiave-unione non compila da quando province è string|null).
      const patch: Partial<ProfileEditable> = {};
      const copyField = <K extends keyof ProfileEditable>(key: K): void => {
        const v = fields[key];
        if (v !== undefined) patch[key] = v;
      };
      PROFILE_EDITABLE_KEYS.forEach(copyField);
      if (Object.keys(patch).length === 0) return { error: null };
      const { error } = await supabase
        .from('profiles')
        .update(patch)
        .eq('id', userId);
      if (error) return { error: error.message };
      await loadProfile(userId);
      return { error: null };
    },
    [session, loadProfile]
  );

  const updateEmail = useCallback(async (email: string) => {
    const { error } = await supabase.auth.updateUser({ email });
    authTelemetry('update_email', error?.message);
    return { error: error?.message ?? null };
  }, []);

  const deleteAccountNow = useCallback(async (appleAuthCode?: string) => {
    const body = appleAuthCode ? { appleAuthCode } : {};
    const { error } = await supabase.functions.invoke('delete-account', {
      body,
    });
    authTelemetry('delete_account', error?.message);
    if (error) return { error: error.message };
    await supabase.auth.signOut();
    return { error: null };
  }, []);

  const scheduleDeletion = useCallback(async () => {
    const userId = session?.user.id;
    if (!userId) return { error: 'not_authenticated' };
    const { error } = await supabase
      .from('profiles')
      .update({ deletion_requested_at: new Date().toISOString() })
      .eq('id', userId);
    if (error) return { error: error.message };
    await loadProfile(userId);
    return { error: null };
  }, [session, loadProfile]);

  const cancelScheduledDeletion = useCallback(async () => {
    const userId = session?.user.id;
    if (!userId) return { error: 'not_authenticated' };
    const { error } = await supabase
      .from('profiles')
      .update({ deletion_requested_at: null })
      .eq('id', userId);
    if (error) return { error: error.message };
    await loadProfile(userId);
    return { error: null };
  }, [session, loadProfile]);

  const getConsentHistory = useCallback(async (): Promise<
    ConsentEvent[] | null
  > => {
    const userId = session?.user.id;
    if (!userId) return [];
    const { data, error } = await supabase
      .from('consent_events')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    // null = errore di fetch (rete/RLS): distinto da "nessun evento" ([]), per non
    // attivare un falso re-consent né esportare una cronologia vuota su errore transient.
    if (error) return null;
    return (data as ConsentEvent[] | null) ?? [];
  }, [session]);

  const exportData = useCallback(async () => {
    const user = session?.user;
    if (!user) return;
    const consentHistory = await getConsentHistory();
    // Su errore di fetch (null) interrompiamo: meglio segnalare l'errore (lo cattura
    // handleExport) che esportare un GDPR Art.20 con cronologia consensi incompleta.
    if (consentHistory === null) throw new Error('consent_history_unavailable');
    await runDataExport(
      {
        id: user.id,
        email: user.email ?? null,
        created_at: user.created_at,
        providers: user.identities?.map(i => i.provider) ?? [],
      },
      profile,
      consentHistory
    );
  }, [session, profile, getConsentHistory]);

  const recordConsent = useCallback(
    async (purpose: ConsentPurpose, action: ConsentAction) => {
      const userId = session?.user.id;
      if (!userId) return { error: 'not_authenticated' };
      const channel = `${Platform.OS}:profile`;
      const { error } = await supabase
        .from('consent_events')
        .insert(buildConsentInsert(userId, purpose, action, channel));
      return { error: error?.message ?? null };
    },
    [session]
  );

  const setMarketingConsent = useCallback(
    async (enabled: boolean) => {
      const userId = session?.user.id;
      if (!userId) return { error: 'not_authenticated' };
      const channel = `${Platform.OS}:profile_toggle`;
      const { error: evErr } = await supabase
        .from('consent_events')
        .insert(
          buildConsentInsert(
            userId,
            'marketing',
            enabled ? 'granted' : 'withdrawn',
            channel
          )
        );
      if (evErr) return { error: evErr.message };
      const { error: cacheErr } = await supabase
        .from('profiles')
        .update({ marketing_consent: enabled })
        .eq('id', userId);
      if (cacheErr) return { error: cacheErr.message };
      await loadProfile(userId);
      return { error: null };
    },
    [session, loadProfile]
  );

  const acceptCurrentPolicy = useCallback(async () => {
    const res = await recordConsent('privacy_notice', 'granted');
    if (!res.error) setNeedsReConsent(false);
    return res;
  }, [recordConsent]);

  // S7 + finding 211: legge a RUNTIME la versione corrente (ultima pubblicata) e il suo
  // is_material, invece di una costante compilata che va in drift col DB. Così se
  // l'associazione pubblica una nuova versione materiale, il gate se ne accorge subito.
  // RLS policy_versions_read consente la lettura agli autenticati (migration 0003).
  const getCurrentPolicy = useCallback(async (): Promise<{
    version: string;
    isMaterial: boolean;
  } | null> => {
    const { data, error } = await supabase
      .from('policy_versions')
      .select('version, is_material')
      .order('published_at', { ascending: false })
      .limit(1)
      .maybeSingle();
    if (error || !data) return null;
    const row = data as { version: string; is_material: boolean };
    return { version: row.version, isMaterial: row.is_material };
  }, []);

  // Verifica re-consenso quando l'utente è autenticato (SOLO per cambi materiali policy).
  useEffect(() => {
    if (status !== 'authenticated' || !session?.user.id) {
      setNeedsReConsent(false);
      return;
    }
    void Promise.all([getConsentHistory(), getCurrentPolicy()]).then(
      ([history, policy]) => {
        // Su errore di fetch (history o policy null) NON gattiamo: evita un falso re-consent
        // da errore transient (coerente con loadProfile che non azzera su errore). Il gate
        // viene ri-valutato al prossimo ciclo auth.
        if (history !== null && policy !== null)
          setNeedsReConsent(
            isReConsentRequired(history, policy.version, policy.isMaterial)
          );
      }
    );
  }, [status, session, getConsentHistory, getCurrentPolicy]);

  return useMemo(
    () => ({
      signIn,
      signUp,
      signOut,
      resetPassword,
      updatePassword,
      completeRecoveryFromUrl,
      completeEmailConfirmFromUrl,
      signInWithApple,
      signInWithGoogle,
      refreshProfile,
      updateProfile,
      updateEmail,
      deleteAccountNow,
      scheduleDeletion,
      cancelScheduledDeletion,
      exportData,
      recordConsent,
      setMarketingConsent,
      getConsentHistory,
      needsReConsent,
      acceptCurrentPolicy,
    }),
    [
      signIn,
      signUp,
      signOut,
      resetPassword,
      updatePassword,
      completeRecoveryFromUrl,
      completeEmailConfirmFromUrl,
      signInWithApple,
      signInWithGoogle,
      refreshProfile,
      updateProfile,
      updateEmail,
      deleteAccountNow,
      scheduleDeletion,
      cancelScheduledDeletion,
      exportData,
      recordConsent,
      setMarketingConsent,
      getConsentHistory,
      needsReConsent,
      acceptCurrentPolicy,
    ]
  );
};
