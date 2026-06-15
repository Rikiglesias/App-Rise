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

import { supabase } from './supabaseClient';
import {
  getAppleIdToken,
  getGoogleIdToken,
  configureGoogle,
} from './socialAuth';
import { exportData as runDataExport } from './dataExport';
import { buildConsentInsert } from './consent';
import type {
  Profile,
  ProfileInput,
  ConsentEvent,
  ConsentPurpose,
  ConsentAction,
} from './types';
import { env } from '@/shared/config/environment';

type Status = 'loading' | 'authenticated' | 'unauthenticated';

export interface AuthState {
  status: Status;
  session: Session | null;
  profile: Profile | null;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signUp: (
    email: string,
    password: string,
    profile: ProfileInput
  ) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: string | null }>;
  signInWithApple: () => Promise<{ error: string | null }>;
  signInWithGoogle: () => Promise<{ error: string | null }>;
  refreshProfile: () => Promise<void>;
  /** Cancellazione immediata via Edge Function (GDPR Art.17). `appleAuthCode`: fresh per la revoca Apple. */
  deleteAccountNow: (appleAuthCode?: string) => Promise<{ error: string | null }>;
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
  /** Cronologia consensi dell'utente (per export/trasparenza). */
  getConsentHistory: () => Promise<ConsentEvent[]>;
}

const AuthContext = createContext<AuthState | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [status, setStatus] = useState<Status>('loading');
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);

  const loadProfile = useCallback(async (userId: string) => {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
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
    return { error: error?.message ?? null };
  }, []);

  const signUp = useCallback(
    async (email: string, password: string, p: ProfileInput) => {
      const { data, error } = await supabase.auth.signUp({ email, password });
      if (error) return { error: error.message };
      if (data.user) {
        const { error: pErr } = await supabase.from('profiles').insert({
          id: data.user.id,
          first_name: p.first_name,
          last_name: p.last_name,
          phone: p.phone,
          city: p.city,
          province: p.province,
          birth_date: p.birth_date,
          privacy_consent_at: new Date().toISOString(),
          marketing_consent: p.marketing_consent,
        });
        if (pErr) return { error: pErr.message };
      }
      return { error: null };
    },
    []
  );

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
  }, []);

  const resetPassword = useCallback(async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email);
    return { error: error?.message ?? null };
  }, []);

  const signInWithApple = useCallback(async () => {
    const token = await getAppleIdToken();
    if (!token) return { error: 'apple_cancelled' };
    const { error } = await supabase.auth.signInWithIdToken({
      provider: 'apple',
      token,
    });
    return { error: error?.message ?? null };
  }, []);

  const signInWithGoogle = useCallback(async () => {
    const token = await getGoogleIdToken();
    if (!token) return { error: 'google_cancelled' };
    const { error } = await supabase.auth.signInWithIdToken({
      provider: 'google',
      token,
    });
    return { error: error?.message ?? null };
  }, []);

  const refreshProfile = useCallback(async () => {
    if (session?.user.id) await loadProfile(session.user.id);
  }, [session, loadProfile]);

  const deleteAccountNow = useCallback(async (appleAuthCode?: string) => {
    const body = appleAuthCode ? { appleAuthCode } : {};
    const { error } = await supabase.functions.invoke('delete-account', { body });
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

  const getConsentHistory = useCallback(async (): Promise<ConsentEvent[]> => {
    const userId = session?.user.id;
    if (!userId) return [];
    const { data } = await supabase
      .from('consent_events')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    return (data as ConsentEvent[] | null) ?? [];
  }, [session]);

  const exportData = useCallback(async () => {
    const user = session?.user;
    if (!user) return;
    const consentHistory = await getConsentHistory();
    await runDataExport(
      {
        id: user.id,
        email: user.email ?? null,
        created_at: user.created_at,
        providers: user.identities?.map((i) => i.provider) ?? [],
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

  const value = useMemo(
    () => ({
      status,
      session,
      profile,
      signIn,
      signUp,
      signOut,
      resetPassword,
      signInWithApple,
      signInWithGoogle,
      refreshProfile,
      deleteAccountNow,
      scheduleDeletion,
      cancelScheduledDeletion,
      exportData,
      recordConsent,
      setMarketingConsent,
      getConsentHistory,
    }),
    [
      status,
      session,
      profile,
      signIn,
      signUp,
      signOut,
      resetPassword,
      signInWithApple,
      signInWithGoogle,
      refreshProfile,
      deleteAccountNow,
      scheduleDeletion,
      cancelScheduledDeletion,
      exportData,
      recordConsent,
      setMarketingConsent,
      getConsentHistory,
    ]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthState => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
