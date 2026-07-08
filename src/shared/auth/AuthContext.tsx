import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
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
  /**
   * True quando `loadProfile` ha determinato in modo DEFINITIVO l'esito (profilo
   * caricato OPPURE nessuna riga/PGRST116). `profile:null` da solo è ambiguo
   * (caricamento in corso vs assenza confermata): la navigazione post-login ne ha
   * bisogno per decidere Home vs CompleteProfile senza redirigere troppo presto.
   * Resta false su errore transient (rete/RLS): non si redirige su dato incerto.
   */
  profileLoaded: boolean;
}

const AuthContext = createContext<AuthState | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [status, setStatus] = useState<AuthStatus>('loading');
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  // Esito del caricamento profilo DEFINITIVO (loaded o no-row): disambigua
  // `profile:null` per la navigazione post-login (vedi AuthState.profileLoaded).
  const [profileLoaded, setProfileLoaded] = useState(false);
  // Utente attualmente attivo: usato come chiave per scartare le fetch di profilo
  // risolte fuori ordine (finding 111), senza causare re-render (ref, non state).
  const activeUserIdRef = useRef<string | null>(null);

  const loadProfile = useCallback(async (userId: string) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    // Out-of-order guard: se l'utente attivo è cambiato mentre la fetch era in volo,
    // scarta il risultato → niente profilo di un utente precedente/sbagliato in UI.
    if (activeUserIdRef.current !== userId) return;
    if (error) {
      // PGRST116 = nessuna riga: profilo non ancora creato (es. post-social) → assente.
      // Altri errori (rete/RLS) → NON azzerare il profilo già caricato (evita flicker/perdita dati UI)
      // e NON marcare profileLoaded: l'esito resta indeterminato → la nav non redirige su dato incerto.
      if (error.code === 'PGRST116') {
        setProfile(null);
        setProfileLoaded(true);
      }
      return;
    }
    setProfile((data as Profile | null) ?? null);
    setProfileLoaded(true);
  }, []);

  useEffect(() => {
    if (env.GOOGLE_WEB_CLIENT_ID)
      configureGoogle(env.GOOGLE_WEB_CLIENT_ID, env.GOOGLE_IOS_CLIENT_ID);
  }, []);

  useEffect(() => {
    void supabase.auth
      .getSession()
      .then(({ data }) => {
        activeUserIdRef.current = data.session?.user.id ?? null;
        setSession(data.session);
        setStatus(data.session ? 'authenticated' : 'unauthenticated');
        if (data.session) {
          setProfileLoaded(false);
          void loadProfile(data.session.user.id);
        }
      })
      // finding 348: senza .catch un reject di getSession (lettura SecureStore/keychain)
      // lascerebbe status bloccato su 'loading' → spinner infinito. Fallback esplicito.
      .catch(() => setStatus('unauthenticated'));

    const { data: sub } = supabase.auth.onAuthStateChange(
      (event, nextSession) => {
        activeUserIdRef.current = nextSession?.user.id ?? null;
        setSession(nextSession);
        setStatus(nextSession ? 'authenticated' : 'unauthenticated');
        // Contesto utente per Sentry: attribuisce i crash post-login all'utente
        // (solo id, MAI PII) e lo pulisce al logout. Senza, i crash su schermate
        // riservate arrivano anonimi e non riproducibili.
        Sentry.setUser(nextSession ? { id: nextSession.user.id } : null);
        if (!nextSession) {
          setProfile(null);
          setProfileLoaded(false);
          return;
        }
        // finding 221/333: NON ricaricare il profilo su INITIAL_SESSION (già coperto dal
        // bootstrap getSession → niente doppia fetch al cold start) né su TOKEN_REFRESHED
        // (refresh orario, il profilo non cambia). Ricarica solo sugli eventi che possono
        // cambiare identità/dati (SIGNED_IN, USER_UPDATED, PASSWORD_RECOVERY…).
        if (event !== 'INITIAL_SESSION' && event !== 'TOKEN_REFRESHED') {
          // Nuova identità/dati: l'esito profilo torna indeterminato finché loadProfile
          // non risolve → la nav post-login attende profileLoaded fresco (no redirect stale).
          setProfileLoaded(false);
          void loadProfile(nextSession.user.id);
        }
      }
    );
    return () => sub.subscription.unsubscribe();
  }, [loadProfile]);

  const actions = useAuthActions({ status, session, profile, loadProfile });

  const value = useMemo<AuthState>(
    () => ({ status, session, profile, profileLoaded, ...actions }),
    [status, session, profile, profileLoaded, actions]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthState => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
