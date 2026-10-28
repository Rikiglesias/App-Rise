import { useCallback, useRef, useState } from 'react';

import { resendEmailChange } from '@/shared/auth/accountActions';
import {
  chiaveErroreAccount,
  registraErroreAccount,
} from '@/shared/auth/registraErroreAccount';

const ATTESA_MS = 60000;

/**
 * Rinvio del link di un cambio email in attesa (C87), con la stessa attesa del rinvio
 * della conferma (`useEmailConfirmation.ts`): un invio alla volta, 60 s fra un invio e
 * l'altro, attesa tolta se la richiesta non ha avuto risposta (rete). L'attesa vive con
 * la schermata: riaperta, il limite lo tiene il server (429 `over_email_send_rate_limit`,
 * stessi 60 s di default), e l'errore arriva comunque a schermo, col conto alla rovescia
 * locale (il limite globale del server risponde senza i secondi).
 *
 * `email` è l'indirizzo ATTUALE dell'account, non quello in attesa: il server cerca
 * l'utente per l'email attuale e manda il link a quella nuova (`supabase/auth`
 * `internal/api/resend.go`); con l'indirizzo in attesa risponde 200 senza mandare nulla.
 */
export const useEmailChangeResend = (email: string) => {
  const [until, setUntil] = useState(0);
  const untilRef = useRef(0);
  const inFlight = useRef(false);
  const imposta = useCallback((istante: number): void => {
    untilRef.current = istante;
    setUntil(istante);
  }, []);

  const resend = useCallback(async (): Promise<{ error: unknown }> => {
    if (inFlight.current || Date.now() < untilRef.current) {
      registraErroreAccount('rate limit', 'RinvioCambioEmail');
      return { error: 'rate limit' };
    }
    inFlight.current = true;
    imposta(Date.now() + ATTESA_MS);
    try {
      const { error } = await resendEmailChange(email);
      // Una fetch fallita non ha avuto risposta: il nuovo tentativo resta manuale.
      if (error && chiaveErroreAccount(error) === 'network') imposta(0);
      return { error };
    } catch (error) {
      if (chiaveErroreAccount(error) === 'network') imposta(0);
      throw error;
    } finally {
      inFlight.current = false;
    }
  }, [email, imposta]);

  // Dopo un `updateEmail` riuscito il server ha appena mandato le mail e conta da lì:
  // un rinvio immediato tornerebbe 429.
  const avviaAttesa = useCallback(
    (): void => imposta(Date.now() + ATTESA_MS),
    [imposta]
  );

  return { resend, until, avviaAttesa };
};
