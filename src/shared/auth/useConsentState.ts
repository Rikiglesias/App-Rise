import { useCallback, useEffect, useRef, useState } from 'react';

import { supabase } from './supabaseClient';
import {
  isReConsentRequired,
  hasGrantedCurrentPolicy,
  CURRENT_POLICY_VERSION,
} from './consent';
import type { ConsentEvent } from './types';

/**
 * Stato del consenso all'informativa corrente, a TRE valori.
 *
 * `unknown` non è un dettaglio: è la differenza fra «ho verificato, è a posto» e
 * «non lo so ancora». Vale all'avvio, finché due query non tornano, e dopo un
 * errore di rete. Chi deve decidere se trasmettere dati personali a un terzo deve
 * richiedere un `ok` esplicito — leggere `unknown` come «nessun problema» è il bug
 * che questo tipo esiste per rendere impossibile.
 */
export type ConsentState = 'unknown' | 'ok' | 'needed';

type Status = 'loading' | 'authenticated' | 'unauthenticated';

interface UseConsentStateArgs {
  status: Status;
  userId: string | null;
  getConsentHistory: () => Promise<ConsentEvent[] | null>;
}

export interface UseConsentStateReturn {
  consentState: ConsentState;
  /** True solo su `needed`: un errore di rete non deve bloccare la UI. */
  needsReConsent: boolean;
  /** Ri-verifica e RESTITUISCE l'esito: sblocca un `unknown` da errore transient. */
  refreshConsent: () => Promise<ConsentState>;
  /** Segna il consenso come dato (dopo un'accettazione andata a buon fine). */
  markConsentGiven: () => void;
}

/**
 * Legge `is_material` della versione corrente. Fail-safe `true` se assente o in
 * errore: in dubbio si richiede il consenso. RLS `policy_versions_read` consente
 * la lettura agli utenti autenticati (migration 0003).
 */
const getCurrentPolicyIsMaterial = async (): Promise<boolean> => {
  const { data, error } = await supabase
    .from('policy_versions')
    .select('is_material')
    .eq('version', CURRENT_POLICY_VERSION)
    .single();
  if (error || !data) return true;
  return (data as { is_material: boolean }).is_material;
};

export const useConsentState = ({
  status,
  userId,
  getConsentHistory,
}: UseConsentStateArgs): UseConsentStateReturn => {
  const [consentState, setConsentState] = useState<ConsentState>('unknown');
  const activeAccount = useRef<{
    status: Status;
    userId: string | null;
  } | null>(null);

  const evaluate = useCallback(async (): Promise<ConsentState> => {
    if (status !== 'authenticated' || !userId) return 'unknown';
    const [history, isMaterial] = await Promise.all([
      getConsentHistory(),
      getCurrentPolicyIsMaterial(),
    ]);
    // History illeggibile (rete/RLS): resta `unknown`. NON scivola a «a posto»,
    // altrimenti la guardia sui dati verso terzi sarebbe fail-open — in
    // contraddizione con il fail-safe di getCurrentPolicyIsMaterial.
    if (history === null) return 'unknown';
    // Due domande diverse, non una. «Devo bloccare la UI?» dipende da
    // is_material: per una versione non-materiale non si forza nessuno a
    // ri-accettare. «Posso trasmettere dati a un terzo?» no: lì serve la
    // presenza POSITIVA del consenso alla versione corrente, altrimenti chi non
    // ha mai accettato passerebbe come consenziente e l'informativa
    // prometterebbe qualcosa che il codice non mantiene.
    if (isReConsentRequired(history, CURRENT_POLICY_VERSION, isMaterial))
      return 'needed';
    return hasGrantedCurrentPolicy(history, CURRENT_POLICY_VERSION)
      ? 'ok'
      : 'unknown';
  }, [status, userId, getConsentHistory]);

  const refreshConsent = useCallback(async (): Promise<ConsentState> => {
    const account = activeAccount.current;
    if (!account || account.status !== status || account.userId !== userId)
      return 'unknown';
    const next = await evaluate();
    // Invalida anche A -> B -> A e non consegna un vecchio `ok` al chiamante.
    if (activeAccount.current !== account) return 'unknown';
    if (next !== 'unknown') setConsentState(next);
    return next;
  }, [evaluate, status, userId]);

  // `evaluate` cambia identità a ogni refresh del token (l'oggetto sessione è
  // nuovo), ma NON è un cambio di utente: tenerlo nelle dipendenze riazzerava a
  // `unknown` uno stato già determinato, spegnendo il blocco di riconsenso e
  // togliendo il prefill a chi è in regola. Il ref lo rende leggibile senza
  // legare l'effetto alla sua identità.
  const evaluateRef = useRef(evaluate);
  evaluateRef.current = evaluate;

  useEffect(() => {
    const account = { status, userId };
    activeAccount.current = account;
    // Un ospite non ha dato NESSUN consenso: dirgli `ok` sarebbe falso.
    setConsentState('unknown');
    // Gemello della guardia su loadProfile: la risposta può atterrare quando
    // l'utente è già un altro (o nessuno). Scriverla comunque dichiarerebbe
    // «consenso ok» per chi non l'ha mai dato, e il prefill partirebbe con i
    // suoi dati. Il cleanup invalida sia la lettura automatica sia i refresh.
    if (status === 'authenticated' && userId) {
      void evaluateRef.current().then(next => {
        if (activeAccount.current === account && next !== 'unknown')
          setConsentState(next);
      });
    }
    return () => {
      activeAccount.current = null;
    };
  }, [status, userId]);

  // Una lettura partita PRIMA dell'accettazione porta la storia di prima: se tornasse
  // dopo riaprirebbe il cancello a chi ha appena accettato (C90). Il gettone nuovo,
  // stesso account, la rende superata come un cambio di utente (letture e refresh).
  const markConsentGiven = useCallback(() => {
    if (activeAccount.current)
      activeAccount.current = { ...activeAccount.current };
    setConsentState('ok');
  }, []);

  return {
    consentState,
    needsReConsent: consentState === 'needed',
    refreshConsent,
    markConsentGiven,
  };
};
