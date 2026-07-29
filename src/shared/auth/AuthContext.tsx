import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  useCallback,
} from 'react';
import { Platform } from 'react-native';
import type { Session } from '@supabase/supabase-js';

import { supabase } from './supabaseClient';
import {
  buildResetRedirectTo,
  buildEmailConfirmRedirectTo,
  parseAuthRedirect,
} from './authRedirect';
import { exportData as runDataExport } from './dataExport';
import { buildConsentInsert } from './consent';
import { buildDisplayName, syncDisplayNameClaim } from './displayName';
import type {
  Profile,
  ProfileInput,
  ProfileEditable,
  ConsentEvent,
  ConsentPurpose,
  ConsentAction,
} from './types';
import { PROFILE_EDITABLE_KEYS } from './types';
import { useConsentState } from './useConsentState';
import type { ConsentState } from './useConsentState';

type Status = 'loading' | 'authenticated' | 'unauthenticated';

export interface AuthState {
  status: Status;
  session: Session | null;
  profile: Profile | null;
  /**
   * La lettura del profilo per l'utente corrente è ARRIVATA (con o senza riga).
   * Serve a distinguere «non c'è» da «non lo so ancora»: `profile === null` dice
   * entrambe le cose, e `status === 'authenticated'` si alza PRIMA che la fetch
   * finisca — quindi non è un sostituto (era usato come tale in ProfileScreen, e
   * rendeva irraggiungibile lo stato `unknown` di `getProfileCompletion`).
   * Chi decide qualcosa di irreversibile sul profilo (registrare un consenso,
   * riscrivere `privacy_consent_at`) deve leggere QUESTO, non il solo `profile`.
   */
  profileLoaded: boolean;
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
  /** Ricarica il profilo e lo RESTITUISCE (serve a chi deve decidere subito, senza aspettare il re-render). */
  refreshProfile: () => Promise<Profile | null>;
  /** Aggiorna i campi profilo correggibili (GDPR Art.16). Whitelist: solo i campi passati, mai id/consensi. */
  updateProfile: (
    fields: Partial<ProfileEditable>
  ) => Promise<{ error: string | null }>;
  /** Cambia l'email dell'account (secure email change Supabase: conferma su vecchia+nuova casella). */
  updateEmail: (email: string) => Promise<{ error: string | null }>;
  /** Cancellazione immediata via Edge Function (GDPR Art.17). */
  deleteAccountNow: () => Promise<{ error: string | null }>;
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
  /**
   * Stato del consenso all'informativa corrente, a tre valori.
   * `unknown` = non ancora verificato (avvio) o verifica fallita: NON è «a posto».
   * Chi deve decidere se trasmettere dati personali a un terzo deve richiedere `ok`;
   * la UI di blocco continua a usare `needsReConsent`, che è vero solo su `needed`.
   */
  consentState: ConsentState;
  /** Ri-verifica il consenso e RESTITUISCE l'esito: sblocca uno stato `unknown` da errore transient. */
  refreshConsent: () => Promise<ConsentState>;
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
  // «La risposta è arrivata», non «c'è un profilo». Si alza quando la lettura per
  // l'utente corrente torna (riga trovata OPPURE assenza confermata da PGRST116) e
  // si riazzera solo al CAMBIO di utente: un TOKEN_REFRESHED sullo stesso account
  // non deve far tornare la UI a «non lo so» (trappola già pagata sul consenso).
  const [profileLoaded, setProfileLoaded] = useState(false);
  // Tre valori, non due. `unknown` è lo stato all'avvio e dopo un errore di rete:
  // serve a chi deve DECIDERE se trasmettere dati a un terzo, perché «non ancora
  // saputo» non è «tutto a posto». La UI continua a leggere il booleano derivato.
  // Chi è l'utente ADESSO: serve alle fetch in volo per capire se la loro risposta
  // è ancora pertinente. Un ref, non uno stato: deve essere leggibile senza che il
  // valore resti congelato nella closure di una callback partita prima.
  const sessionUserIdRef = useRef<string | null>(null);

  // Ritorna il profilo caricato oltre a metterlo nello stato: chi deve DECIDERE
  // subito dopo il caricamento (es. il prefill dei partner) non può leggere `profile`
  // dalla propria closure, che è ancora quella del render precedente.
  const loadProfile = useCallback(
    async (userId: string): Promise<Profile | null> => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      if (error) {
        // PGRST116 = nessuna riga: profilo non ancora creato (es. post-social) → assente.
        // Altri errori (rete/RLS) → NON azzerare il profilo già caricato (evita flicker/perdita dati UI).
        // `profileLoaded` segue la stessa distinzione: l'assenza CONFERMATA è una
        // risposta, un errore di rete no — lì lo stato resta «non lo so».
        if (error.code === 'PGRST116') {
          if (sessionUserIdRef.current !== userId) return null;
          setProfile(null);
          setProfileLoaded(true);
        }
        return null;
      }
      const next = (data as Profile | null) ?? null;
      // La risposta può arrivare DOPO un logout o un cambio account: scriverla
      // senza controllare resusciterebbe il profilo dell'utente precedente, che
      // finirebbe nel prefill verso il partner. Si applica solo se la sessione
      // corrente è ancora la stessa che l'ha richiesta.
      // La guardia vale su ENTRAMBE le uscite: lo stato E il valore restituito.
      // Proteggere solo `setProfile` lasciava scoperto proprio il percorso che
      // conta — il prefill dei partner legge il valore di ritorno, non lo stato.
      if (sessionUserIdRef.current !== userId) return null;
      setProfile(next);
      setProfileLoaded(true);
      return next;
    },
    []
  );

  useEffect(() => {
    void supabase.auth.getSession().then(({ data }) => {
      sessionUserIdRef.current = data.session?.user.id ?? null;
      setSession(data.session);
      setStatus(data.session ? 'authenticated' : 'unauthenticated');
      if (data.session) void loadProfile(data.session.user.id);
    });

    const { data: sub } = supabase.auth.onAuthStateChange(
      (_event, nextSession) => {
        const nextUserId = nextSession?.user.id ?? null;
        // Solo il CAMBIO di utente rende ignoto ciò che sapevamo: su un semplice
        // rinnovo del token (stesso account) riazzerare farebbe tornare la UI a
        // «non lo so» a ogni refresh, con i solleciti che spariscono e ricompaiono.
        if (nextUserId !== sessionUserIdRef.current) setProfileLoaded(false);
        sessionUserIdRef.current = nextUserId;
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
            // Claim OIDC `name` per il login federato dei partner (P1): il server auth
            // legge SOLO questa chiave e, se manca, ci mette l'email dell'account.
            // Il trigger ignora le chiavi che non gli servono (0007: legge per nome).
            name: buildDisplayName(p.first_name, p.last_name),
            // Claim OIDC `preferred_username` (F-NICKNAME, migration 0017). La chiave
            // si chiama così e non `nickname` perché è quella che il server auth legge
            // (verificato su GenerateIDToken e OAuthUserInfo). Facoltativo: se manca si
            // omette del tutto invece di scrivere '' — il trigger e il server trattano
            // l'assenza come «nessun nickname», mentre una stringa vuota è rumore.
            ...(p.nickname?.trim()
              ? { preferred_username: p.nickname.trim() }
              : {}),
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
    return { error: error?.message ?? null };
  }, []);

  const updatePassword = useCallback(async (newPassword: string) => {
    const { error } = await supabase.auth.updateUser({ password: newPassword });
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

  const refreshProfile = useCallback(async (): Promise<Profile | null> => {
    if (!session?.user.id) return null;
    return await loadProfile(session.user.id);
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
      const updated = await loadProfile(userId);
      // Il nome è cambiato → riallinea la sua proiezione su user_metadata.name (P1),
      // altrimenti il claim OIDC continuerebbe a dire il nome vecchio. Si usa il
      // profilo APPENA riletto, non la closure: `patch` può contenere solo una delle
      // due parti e l'altra va presa dal valore fresco.
      if (patch.first_name !== undefined || patch.last_name !== undefined) {
        await syncDisplayNameClaim(updated?.first_name, updated?.last_name);
      }
      return { error: null };
    },
    [session, loadProfile]
  );

  const updateEmail = useCallback(async (email: string) => {
    const { error } = await supabase.auth.updateUser({ email });
    return { error: error?.message ?? null };
  }, []);

  const deleteAccountNow = useCallback(async () => {
    const { error } = await supabase.functions.invoke('delete-account', {
      body: {},
    });
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

  const { consentState, needsReConsent, refreshConsent, markConsentGiven } =
    useConsentState({
      status,
      userId: session?.user.id ?? null,
      getConsentHistory,
    });

  const acceptCurrentPolicy = useCallback(async () => {
    const res = await recordConsent('privacy_notice', 'granted');
    if (!res.error) markConsentGiven();
    return res;
  }, [recordConsent, markConsentGiven]);

  const value = useMemo(
    () => ({
      status,
      session,
      profile,
      profileLoaded,
      signIn,
      signUp,
      signOut,
      resetPassword,
      updatePassword,
      completeRecoveryFromUrl,
      completeEmailConfirmFromUrl,
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
      consentState,
      refreshConsent,
      acceptCurrentPolicy,
    }),
    [
      status,
      session,
      profile,
      profileLoaded,
      signIn,
      signUp,
      signOut,
      resetPassword,
      updatePassword,
      completeRecoveryFromUrl,
      completeEmailConfirmFromUrl,
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
      consentState,
      refreshConsent,
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
