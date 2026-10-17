import { useCallback, useRef, useState } from 'react';

import { supabase } from './supabaseClient';
import { buildEmailConfirmRedirectTo } from './authRedirect';
import { mapAuthError } from './authErrors';
import { buildDisplayName } from './displayName';
import type { ProfileInput } from './types';

/** Invio e rinvio condividono l'attesa anche cambiando schermata. */
export const useEmailConfirmation = () => {
  const [confirmationRetryAt, setConfirmationRetryAt] = useState<
    Record<string, number>
  >({});
  const confirmationLimits = useRef<Record<string, number>>({});
  const confirmationInFlight = useRef(new Set<string>());
  const setConfirmationLimit = useCallback(
    (email: string, until: number): void => {
      const key = email.trim().toLowerCase();
      confirmationLimits.current = {
        ...confirmationLimits.current,
        [key]: until,
      };
      setConfirmationRetryAt(confirmationLimits.current);
    },
    []
  );
  const signUp = useCallback(
    async (email: string, password: string, p: ProfileInput) => {
      // Profilo + consensi iniziali creati SERVER-SIDE dal trigger handle_new_user
      // (migration 0004) leggendo options.data: con "Confirm email" ON non c'è sessione
      // attiva qui, quindi un insert client-side verrebbe bloccato da RLS (auth.uid() null).
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          // Il codice PKCE rientra nell'app ed è scambiato da useAuthDeepLink.
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
      if (!error) setConfirmationLimit(email, Date.now() + 60000);
      return { error: error?.message ?? null };
    },
    [setConfirmationLimit]
  );

  const resendConfirmation = useCallback(
    async (email: string) => {
      const key = email.trim().toLowerCase();
      if (
        confirmationInFlight.current.has(key) ||
        Date.now() < (confirmationLimits.current[key] ?? 0)
      ) {
        return { error: 'rate limit' };
      }
      confirmationInFlight.current.add(key);
      setConfirmationLimit(key, Date.now() + 60000);
      try {
        const { error } = await supabase.auth.resend({
          type: 'signup',
          email: email.trim(),
          options: { emailRedirectTo: buildEmailConfirmRedirectTo() },
        });
        // Una fetch fallita non ha avuto risposta: il nuovo tentativo resta manuale.
        if (error && mapAuthError(error) === 'network')
          setConfirmationLimit(key, 0);
        return { error };
      } catch (error) {
        if (mapAuthError(error) === 'network') setConfirmationLimit(key, 0);
        throw error;
      } finally {
        confirmationInFlight.current.delete(key);
      }
    },
    [setConfirmationLimit]
  );

  return { signUp, resendConfirmation, confirmationRetryAt };
};
