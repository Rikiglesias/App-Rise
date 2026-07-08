import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  useCallback,
} from 'react';
import type { Session } from '@supabase/supabase-js';
import * as Sentry from '@sentry/react-native';

import { supabase } from './supabaseClient';
import { configureGoogle } from './socialAuth';
import type { Profile } from './types';
import {
  useAuthActions,
  type AuthActions,
  type AuthStatus,
} from './useAuthActions';
import { env } from '@/shared/config/environment';

/** Stato fondante (status/session/profile) + tutte le action (AuthActions). */
export interface AuthState extends AuthActions {
  status: AuthStatus;
  session: Session | null;
  profile: Profile | null;
}

const AuthContext = createContext<AuthState | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [status, setStatus] = useState<AuthStatus>('loading');
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);

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
        // Contesto utente per Sentry: attribuisce i crash post-login all'utente
        // (solo id, MAI PII) e lo pulisce al logout. Senza, i crash su schermate
        // riservate arrivano anonimi e non riproducibili.
        Sentry.setUser(nextSession ? { id: nextSession.user.id } : null);
        if (nextSession) void loadProfile(nextSession.user.id);
        else setProfile(null);
      }
    );
    return () => sub.subscription.unsubscribe();
  }, [loadProfile]);

  const actions = useAuthActions({ status, session, profile, loadProfile });

  const value = useMemo<AuthState>(
    () => ({ status, session, profile, ...actions }),
    [status, session, profile, actions]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthState => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
