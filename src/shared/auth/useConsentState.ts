import { useCallback, useEffect, useState } from 'react';

import { supabase } from './supabaseClient';
import { isReConsentRequired, CURRENT_POLICY_VERSION } from './consent';
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
    return isReConsentRequired(history, CURRENT_POLICY_VERSION, isMaterial)
      ? 'needed'
      : 'ok';
  }, [status, userId, getConsentHistory]);

  const refreshConsent = useCallback(async (): Promise<ConsentState> => {
    const next = await evaluate();
    if (next !== 'unknown') setConsentState(next);
    return next;
  }, [evaluate]);

  useEffect(() => {
    // Un ospite non ha dato NESSUN consenso: dirgli `ok` sarebbe falso.
    setConsentState('unknown');
    if (status !== 'authenticated' || !userId) return;
    void evaluate().then(next => {
      if (next !== 'unknown') setConsentState(next);
    });
  }, [status, userId, evaluate]);

  const markConsentGiven = useCallback(() => setConsentState('ok'), []);

  return {
    consentState,
    needsReConsent: consentState === 'needed',
    refreshConsent,
    markConsentGiven,
  };
};
