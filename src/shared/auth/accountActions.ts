import type { AuthError } from '@supabase/supabase-js';

import { rimuoviSessioneSalvata, supabase } from './supabaseClient';
import {
  buildResetRedirectTo,
  buildEmailChangeRedirectTo,
} from './authRedirect';
import {
  registraErroreAccount,
  registraEsitoAccount,
} from './registraErroreAccount';

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

const messaggioDi = (error: unknown): string =>
  typeof error === 'object' &&
  error !== null &&
  'message' in error &&
  typeof error.message === 'string'
    ? error.message
    : String(error);

type EsitoVerifica = 'eliminato' | 'presente' | 'incerto';

/**
 * Una chiamata a `delete-account` fallita non dice che la cancellazione è fallita: la
 * risposta può perdersi DOPO che il server ha cancellato (timeout, rete che cade, 5xx
 * del proxy), e un secondo tentativo risponde 401 perché l'utente non c'è più. Lo si
 * chiede al server: `user_not_found` = account eliminato; utente restituito = ancora
 * presente; qualunque altro esito (rete, sessione mancante, rinnovo del token fallito)
 * = non si sa, e lo si dice invece di tirare a indovinare.
 */
const verificaAccount = async (): Promise<EsitoVerifica> => {
  try {
    const { data, error } = await supabase.auth.getUser();
    if (error?.code === 'user_not_found') return 'eliminato';
    if (!error && data.user) return 'presente';
    return 'incerto';
  } catch {
    return 'incerto';
  }
};

/**
 * `esitoIncerto` accompagna un `error`, non lo sostituisce: chi non lo legge vede
 * comunque un errore e non crede a una riuscita, e la schermata può dire sia
 * «non sappiamo» sia perché la chiamata è fallita (rete assente → Riprova).
 */
export const deleteAccountNow = async (): Promise<{
  error: string | null;
  sessioneAncoraSulDispositivo?: boolean;
  esitoIncerto?: boolean;
}> => {
  let errore: string | null = null;
  try {
    const { error } = await registraEsitoAccount('EliminaAccount', () =>
      supabase.functions.invoke('delete-account', {
        body: {},
      })
    );
    if (error) errore = error.message;
  } catch (error) {
    // Anche un rigetto è una chiamata di cui non si conosce l'esito: si riconcilia
    // come un errore. registraEsitoAccount l'ha già registrato.
    errore = messaggioDi(error);
  }
  if (errore !== null) {
    const verifica = await verificaAccount();
    if (verifica === 'presente') return { error: errore };
    if (verifica === 'incerto') return { error: errore, esitoIncerto: true };
  }

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
  // ormai eliminato — ma `sessioneAncoraSulDispositivo` dice al chiamante che la
  // libreria non ha chiuso la sessione e che nessun SIGNED_OUT arriverà: tocca a lui
  // portare l'app a ospite (AuthContext). Ritentare la stessa chiamata non servirebbe:
  // se è caduta la rete cadrebbe di nuovo. La sessione si toglie invece dallo storage
  // con la chiave che il client dichiara (`SESSION_STORAGE_KEY`), uguale al default.
  let uscitaFallita: boolean;
  try {
    const { error: erroreUscita } = await registraEsitoAccount(
      'EliminaAccount',
      () =>
        supabase.auth.signOut({
          scope: 'local',
        })
    );
    uscitaFallita = Boolean(erroreUscita);
  } catch {
    // Anche un rigetto riguarda solo l'uscita: la cancellazione è già riuscita.
    // registraEsitoAccount ha già registrato l'errore senza dettagli sensibili.
    uscitaFallita = true;
  }
  if (uscitaFallita) {
    try {
      await rimuoviSessioneSalvata();
    } catch (error) {
      // Storage illeggibile: la sessione resta sul telefono. AuthContext tiene
      // comunque l'app ospite per questo avvio; al riavvio quella sessione non porta
      // dati, perché il profilo non è salvato in locale e il server non lo ha più.
      // Si registra (senza dettagli sensibili) perché resti traccia nel rapporto.
      registraErroreAccount(error, 'EliminaAccount');
    }
  }
  return { error: null, sessioneAncoraSulDispositivo: uscitaFallita };
};
