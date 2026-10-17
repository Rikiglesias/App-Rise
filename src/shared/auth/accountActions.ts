import type { AuthError } from '@supabase/supabase-js';

import { supabase } from './supabaseClient';
import {
  buildResetRedirectTo,
  buildEmailChangeRedirectTo,
} from './authRedirect';
import { registraEsitoAccount } from './registraErroreAccount';

const passwordErrorMessage = (error: AuthError | null): string | null => {
  const code = error?.code;
  return code === 'same_password' || code === 'weak_password'
    ? code
    : (error?.message ?? null);
};

export const signIn = async (email: string, password: string) => {
  const { error } = await registraEsitoAccount('Accesso', () =>
    supabase.auth.signInWithPassword({
      email,
      password,
    })
  );
  return { error: error?.message ?? null };
};

export const resetPassword = async (email: string) => {
  // redirectTo: deep link che riporta nell'app (allow-list Supabase). Senza,
  // il link punterebbe al Site URL web e il reset non si completerebbe in-app.
  const { error } = await registraEsitoAccount('PasswordDimenticata', () =>
    supabase.auth.resetPasswordForEmail(email, {
      redirectTo: buildResetRedirectTo(),
    })
  );
  return { error: error?.message ?? null };
};

export const updatePassword = async (newPassword: string) => {
  const { error } = await registraEsitoAccount('ReimpostaPassword', () =>
    supabase.auth.updateUser({ password: newPassword })
  );
  return { error: passwordErrorMessage(error) };
};

export const updateEmail = async (email: string) => {
  const { error } = await registraEsitoAccount('CambioEmail', () =>
    supabase.auth.updateUser(
      { email },
      { emailRedirectTo: buildEmailChangeRedirectTo() }
    )
  );
  return { error: error?.message ?? null };
};

export const deleteAccountNow = async () => {
  const { error } = await registraEsitoAccount('EliminaAccount', () =>
    supabase.functions.invoke('delete-account', {
      body: {},
    })
  );
  if (error) return { error: error.message };

  // Uscita LOCALE, non globale: l'account a questo punto non esiste più, e il
  // signOut globale chiede al server di revocare le sessioni di un utente
  // cancellato — chiamata che fallisce lasciando la sessione sul dispositivo
  // (supabase/auth#1550).
  //
  // Ma `local` NON evita la rete: nella libreria installata (@supabase/auth-js,
  // GoTrueClient.js:3337-3352) anche lo scope locale chiama `admin.signOut`, e se
  // l'errore non è 401/403/404 — per esempio la rete che cade subito dopo la
  // cancellazione riuscita — la funzione ritorna l'errore SALTANDO
  // `_removeSession()`. Il risultato sarebbe la sessione di un account che non
  // esiste più lasciata sul telefono, mentre qui si risponde «tutto a posto».
  // Per questo l'esito si LEGGE e si riporta: `error` resta null perché la
  // cancellazione è davvero riuscita — dire il contrario allarmerebbe per un dato
  // ormai eliminato — ma `sessioneAncoraSulDispositivo` dice al chiamante che il
  // telefono non ha dimenticato la sessione, così può portare fuori la persona
  // invece di lasciarla in un'app che sembra ancora connessa a un account che non
  // esiste più. Ritentare la stessa chiamata non servirebbe: se è caduta la rete
  // cadrebbe di nuovo, e toccare a mano la chiave interna dello storage legherebbe
  // il nostro codice a un dettaglio non documentato della libreria.
  const { error: erroreUscita } = await registraEsitoAccount(
    'EliminaAccount',
    () =>
      supabase.auth.signOut({
        scope: 'local',
      })
  );
  return { error: null, sessioneAncoraSulDispositivo: Boolean(erroreUscita) };
};
