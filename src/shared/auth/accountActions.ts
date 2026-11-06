import type { AuthError } from '@supabase/supabase-js';

import { rimuoviSessioneSalvata, supabase } from './supabaseClient';
import {
  buildResetRedirectTo,
  buildEmailChangeRedirectTo,
} from './authRedirect';
import {
  chiaveErroreAccount,
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

/**
 * Rimanda il link di un cambio email in attesa (C87). `email` è l'indirizzo ATTUALE
 * dell'account: il server cerca l'utente con quello e manda il link a quello nuovo
 * (`supabase/auth` `internal/api/resend.go`); con l'indirizzo in attesa risponderebbe
 * 200 senza mandare nulla. L'errore torna intero: il codice
 * `over_email_send_rate_limit` dice «troppo presto», il messaggio no.
 */
export const resendEmailChange = async (email: string) => {
  const { error } = await registraEsitoAccount('RinvioCambioEmail', () =>
    supabase.auth.resend({
      type: 'email_change',
      email,
      options: { emailRedirectTo: buildEmailChangeRedirectTo() },
    })
  );
  return { error };
};

const messaggioDi = (error: unknown): string =>
  typeof error === 'object' &&
  error !== null &&
  'message' in error &&
  typeof error.message === 'string'
    ? error.message
    : String(error);

type EsitoVerifica = 'eliminato' | 'presente' | 'impossibile';

/**
 * Una chiamata a `delete-account` fallita non dice che la cancellazione è fallita: la
 * risposta può perdersi DOPO che il server ha cancellato (timeout, rete che cade, 5xx
 * del proxy), e un secondo tentativo risponde 401 perché l'utente non c'è più. Lo si
 * chiede al server: `user_not_found` = account eliminato; utente restituito = ancora
 * presente; qualunque altro esito (rete, sessione mancante, rinnovo del token fallito)
 * = verifica impossibile. Si chiede col token di chi è da eliminare, catturato prima
 * della chiamata: il server risponde sull'utente del token (`sub`), non su chi è
 * collegato ADESSO. Senza quel token, se nell'attesa entrasse un altro account già
 * eliminato altrove, il suo `user_not_found` dichiarerebbe eliminato quello sbagliato
 * (giro 2 del delta, f2-1; revisione delle correzioni, rilievo 2). Senza quel token la
 * cancellazione non parte nemmeno (`deleteAccountNow`), quindi qui manca solo quando
 * non si sa chi elimina (`utenteAtteso` null).
 */
const verificaAccount = async (
  utenteAtteso: string | null,
  tokenAtteso: string | null
): Promise<EsitoVerifica> => {
  try {
    const { data, error } = tokenAtteso
      ? await supabase.auth.getUser(tokenAtteso)
      : await supabase.auth.getUser();
    if (error?.code === 'user_not_found') return 'eliminato';
    if (!error && data.user)
      return utenteAtteso === null || data.user.id === utenteAtteso
        ? 'presente'
        : 'impossibile';
    return 'impossibile';
  } catch {
    return 'impossibile';
  }
};

/**
 * Il token d'accesso di chi è da eliminare, letto PRIMA della chiamata: dopo, nella
 * sessione potrebbe esserci un altro account. Null se la sessione è di un altro o non
 * si legge: allora la cancellazione non parte.
 */
const tokenDi = async (utenteAtteso: string | null): Promise<string | null> => {
  if (utenteAtteso === null) return null;
  try {
    const { data } = await supabase.auth.getSession();
    const sessione = data.session;
    return sessione && sessione.user.id === utenteAtteso
      ? sessione.access_token
      : null;
  } catch {
    return null;
  }
};

/**
 * Vero solo se sul client c'è la sessione di un ALTRO account rispetto a quello da
 * eliminare. Nessuna sessione, o lettura fallita, non conta come «altro»: la sessione
 * rimasta sarebbe quella dell'account eliminato, da chiudere come prima.
 */
const eEntratoUnAltro = async (
  utenteAtteso: string | null
): Promise<boolean> => {
  if (utenteAtteso === null) return false;
  try {
    const { data } = await supabase.auth.getSession();
    const ora = data.session?.user.id ?? null;
    return ora !== null && ora !== utenteAtteso;
  } catch {
    return false;
  }
};

/**
 * Con la verifica impossibile non si dice «eliminato» né «non riuscito»: nessuno dei
 * due è sicuro. Senza rete resta l'errore originale («Nessuna connessione» + Riprova);
 * altrimenti `delete_interrupted`, il testo neutro che chiede di riprovare: il nuovo
 * tentativo riconcilia (401 → `user_not_found` → riuscita) oppure elimina. Si guarda la
 * stringa e non l'oggetto perché è la stringa che arriva alla schermata.
 */
export const deleteAccountNow = async (
  /** Chi era collegato quando la cancellazione è partita: esito e pulizia sono suoi. */
  utenteAtteso: string | null
): Promise<{
  error: string | null;
  sessioneAncoraSulDispositivo?: boolean;
}> => {
  let errore: string | null = null;
  const tokenAtteso = await tokenDi(utenteAtteso);
  // Il server cancella l'utente del JWT che riceve (`delete-account`), e senza un
  // Authorization esplicito la libreria mette quello della sessione di ADESSO, che dopo
  // l'attesa qui sopra può essere di un altro account entrato da un link. Quindi la
  // chiamata porta il token di chi ha chiesto la cancellazione, e senza quel token
  // (sessione già di un altro, o illeggibile) non si cancella nessuno: testo neutro,
  // si riprova (revisione delle correzioni, giro 4, rilievo 1).
  if (utenteAtteso !== null && tokenAtteso === null)
    return { error: 'delete_interrupted' };
  try {
    const { error } = await registraEsitoAccount('EliminaAccount', () =>
      supabase.functions.invoke('delete-account', {
        body: {},
        ...(tokenAtteso
          ? { headers: { Authorization: `Bearer ${tokenAtteso}` } }
          : {}),
      })
    );
    if (error) errore = error.message;
  } catch (error) {
    // Anche un rigetto è una chiamata di cui non si conosce l'esito: si riconcilia
    // come un errore. registraEsitoAccount l'ha già registrato.
    errore = messaggioDi(error);
  }
  if (errore !== null) {
    const verifica = await verificaAccount(utenteAtteso, tokenAtteso);
    if (verifica === 'presente') return { error: errore };
    if (verifica === 'impossibile')
      return {
        error:
          chiaveErroreAccount(errore) === 'network'
            ? errore
            : 'delete_interrupted',
      };
  }

  // L'account è eliminato. Uscita e pulizia dello storage valgono solo se la sessione
  // sul telefono è ancora sua: se nell'attesa è entrato un altro account (link di B),
  // chiuderebbero B (giro 2 del delta, f2-1). Lo stato dell'app è di B: niente da
  // riallineare.
  if (await eEntratoUnAltro(utenteAtteso))
    return { error: null, sessioneAncoraSulDispositivo: false };

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
    // L'uscita è passata dalla rete: nell'attesa può essere entrato un altro account,
    // e lo storage ora conterrebbe la sua sessione.
    if (await eEntratoUnAltro(utenteAtteso))
      return { error: null, sessioneAncoraSulDispositivo: false };
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
