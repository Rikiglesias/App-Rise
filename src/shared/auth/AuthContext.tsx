import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  useCallback,
} from 'react';
import { Platform } from 'react-native';
import type { Session } from '@supabase/supabase-js';
import * as Sentry from '@sentry/react-native';

import { supabase } from './supabaseClient';
import {
  getAppleIdToken,
  getGoogleIdToken,
  configureGoogle,
} from './socialAuth';
import {
  buildResetRedirectTo,
  buildEmailConfirmRedirectTo,
  parseAuthRedirect,
} from './authRedirect';
import { exportData as runDataExport } from './dataExport';
import {
  buildConsentInsert,
  isReConsentRequired,
  CURRENT_POLICY_VERSION,
} from './consent';
import type {
  Profile,
  ProfileInput,
  ProfileEditable,
  ConsentEvent,
  ConsentPurpose,
  ConsentAction,
} from './types';
import { PROFILE_EDITABLE_KEYS } from './types';
import { env } from '@/shared/config/environment';
import { logWarn } from '@/shared/utils/logger';

type Status = 'loading' | 'authenticated' | 'unauthenticated';

// Telemetria auth: senza questa, login/registrazioni/cancellazioni FALLITE sono
// invisibili in produzione (l'errore Supabase viene solo mostrato in UI e perso).
// Emette un breadcrumb Sentry sempre + captureMessage sui fallimenti, così il
// contesto arriva anche a un crash successivo. MAI PII: nessuna email/password/token,
// solo l'esito e il messaggio d'errore GoTrue (già generico, es. "Invalid credentials").
const authTelemetry = (event: string, errorMessage?: string | null): void => {
  Sentry.addBreadcrumb({
    category: 'auth',
    message: event,
    level: errorMessage ? 'warning' : 'info',
    ...(errorMessage ? { data: { error: errorMessage } } : {}),
  });
  if (errorMessage) {
    logWarn(`auth ${event} failed`, 'auth', { error: errorMessage });
    Sentry.captureMessage(`auth.${event}_failed`, 'warning');
  }
};

export interface AuthState {
  status: Status;
  session: Session | null;
  profile: Profile | null;
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

const AuthContext = createContext<AuthState | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [status, setStatus] = useState<Status>('loading');
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [needsReConsent, setNeedsReConsent] = useState(false);

  const loadProfile = useCallback(async (userId: string) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    if (error) {
      // PGRST116 = nessuna riga: profilo non ancora creato (es. post-social) → assente.
      // Altri errori (rete/RLS) → NON azzerare il profilo già caricato (evita flicker/perdita dati UI).
      if (error.code === 'PGRST116') setProfile(null);
      return;
    }
    setProfile((data as Profile | null) ?? null);
  }, []);

  useEffect(() => {
    if (env.GOOGLE_WEB_CLIENT_ID) configureGoogle(env.GOOGLE_WEB_CLIENT_ID);
  }, []);

  useEffect(() => {
    void supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setStatus(data.session ? 'authenticated' : 'unauthenticated');
      if (data.session) void loadProfile(data.session.user.id);
    });

    const { data: sub } = supabase.auth.onAuthStateChange(
      (_event, nextSession) => {
        setSession(nextSession);
        setStatus(nextSession ? 'authenticated' : 'unauthenticated');
        if (nextSession) void loadProfile(nextSession.user.id);
        else setProfile(null);
      }
    );
    return () => sub.subscription.unsubscribe();
  }, [loadProfile]);

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
      const patch: Partial<ProfileEditable> = {};
      for (const key of PROFILE_EDITABLE_KEYS) {
        const v = fields[key];
        if (v !== undefined) patch[key] = v;
      }
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

  // S7: legge is_material della versione corrente dell'informativa (fail-safe `true`
  // se assente/errore → in dubbio si richiede il consenso). RLS policy_versions_read
  // consente la lettura agli utenti autenticati (migration 0003).
  const getCurrentPolicyIsMaterial = useCallback(async (): Promise<boolean> => {
    const { data, error } = await supabase
      .from('policy_versions')
      .select('is_material')
      .eq('version', CURRENT_POLICY_VERSION)
      .single();
    if (error || !data) return true;
    return (data as { is_material: boolean }).is_material;
  }, []);

  // Verifica re-consenso quando l'utente è autenticato (SOLO per cambi materiali policy).
  useEffect(() => {
    if (status !== 'authenticated' || !session?.user.id) {
      setNeedsReConsent(false);
      return;
    }
    void Promise.all([getConsentHistory(), getCurrentPolicyIsMaterial()]).then(
      ([history, isMaterial]) => {
        // Su errore di fetch della history (null) NON gattiamo: evita un falso re-consent
        // da errore transient (coerente con loadProfile che non azzera su errore).
        if (history !== null)
          setNeedsReConsent(
            isReConsentRequired(history, CURRENT_POLICY_VERSION, isMaterial)
          );
      }
    );
  }, [status, session, getConsentHistory, getCurrentPolicyIsMaterial]);

  const value = useMemo(
    () => ({
      status,
      session,
      profile,
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
      status,
      session,
      profile,
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

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthState => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
