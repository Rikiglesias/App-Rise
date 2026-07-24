import { supabase } from '@/shared/auth/supabaseClient';
import { logError, logInfo, logWarn } from '@/shared/utils/logger';

/**
 * Servizio get-or-create del `rise_ref` per la correlazione app→partner
 * (goal partner-identita, F1.7c). Legge/scrive `public.partner_refs` (migration 0008).
 *
 * Contratto:
 * - Utente NON loggato (ospite) → ritorna `null`: la donazione parte senza
 *   correlazione, comportamento non regressivo (l'URL builder omette il ref).
 * - Utente loggato → ritorna il ref ATTIVO esistente per (utente, partner), o ne
 *   crea uno nuovo (il valore lo genera il default server-side di partner_refs).
 * - Concorrenza: due chiamate simultanee possono provare a inserire insieme;
 *   l'indice parziale unico `(user_id, partner) where active` fa fallire la seconda
 *   con unique_violation (23505) → si ri-legge il ref appena creato dall'altra.
 * - Utente autenticato ma SENZA profilo → l'insert viola la FK
 *   `partner_refs.user_id → profiles(id)` (23503): scenario ATTESO (profilo non
 *   ancora completato), no-op accettato → `null` + log informativo (non un allarme).
 * - Race 23505 ma il re-select non vede il ref (altra tx rollbackata / replica-lag)
 *   → `null` + log informativo: transiente, non un fallimento generico.
 * - Qualunque altro errore è DAVVERO inatteso (RLS 42501, DB irraggiungibile,
 *   vincolo nuovo) → `null` + log ERROR: l'app apre comunque l'URL senza ref
 *   (degrada), ma l'anomalia deve raggiungere i log di produzione (warn/info
 *   sono scartati in prod, vedi `logger.ts`).
 *
 * NB: le RLS di 0008 restringono select/insert alla propria riga (auth.uid()=user_id),
 * quindi la select non filtra su user_id (lo fa la policy) mentre l'insert DEVE
 * valorizzare user_id per superare il with-check.
 */

export type PartnerName = 'donorbox' | 'letsdonation';

const UNIQUE_VIOLATION = '23505';
const FK_VIOLATION = '23503';

const selectActiveRef = async (
  partner: PartnerName
): Promise<string | null> => {
  const { data, error } = await supabase
    .from('partner_refs')
    .select('ref')
    .eq('partner', partner)
    .eq('active', true)
    .maybeSingle();
  if (error) {
    logWarn('select ref fallita', 'partnerRefService', error);
    return null;
  }
  return data?.ref ?? null;
};

export const getOrCreatePartnerRef = async (
  partner: PartnerName
): Promise<string | null> => {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  const userId = session?.user?.id;
  if (!userId) return null; // ospite: nessuna correlazione

  // 1. Ref attivo già esistente?
  const existing = await selectActiveRef(partner);
  if (existing) return existing;

  // 2. Crea un nuovo ref (il default server-side genera il valore).
  const { data, error } = await supabase
    .from('partner_refs')
    .insert({ user_id: userId, partner })
    .select('ref')
    .single();
  if (data?.ref) return data.ref;

  // 3. Un'altra chiamata ha inserito nel frattempo → ri-leggi il suo ref.
  if (error?.code === UNIQUE_VIOLATION) {
    const raced = await selectActiveRef(partner);
    if (raced) return raced;
    // 23505 ma il re-select non vede il ref: l'altra tx è stata rollbackata oppure
    // c'è replica-lag → transiente, no-op accettato (non un fallimento generico).
    logInfo('race 23505 senza ref visibile al re-select', 'partnerRefService');
    return null;
  }

  // 4. Utente autenticato ma senza profilo → FK partner_refs.user_id → profiles(id)
  //    violata (23503). Scenario atteso (profilo non completato): no-op accettato,
  //    il ref resta inattivo finché non c'è un profilo. Non è un allarme.
  if (error?.code === FK_VIOLATION) {
    logInfo('ref non creato: utente senza profilo', 'partnerRefService');
    return null;
  }

  // 5. Errore DAVVERO inatteso (RLS 42501, DB irraggiungibile, vincolo nuovo):
  //    logError così l'anomalia raggiunge i log di produzione (warn/info scartati
  //    in prod, logger.ts). L'app degrada comunque: apre senza ref.
  logError('creazione ref fallita (inatteso)', 'partnerRefService', error);
  return null;
};
