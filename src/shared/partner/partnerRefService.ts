import { supabase } from '@/shared/auth/supabaseClient';
import { logWarn } from '@/shared/utils/logger';

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
 * - Qualunque fallimento residuo → `null` + log: l'app apre comunque l'URL senza
 *   ref (degrada, non rompe l'uscita verso il partner).
 *
 * NB: le RLS di 0008 restringono select/insert alla propria riga (auth.uid()=user_id),
 * quindi la select non filtra su user_id (lo fa la policy) mentre l'insert DEVE
 * valorizzare user_id per superare il with-check.
 */

export type PartnerName = 'donorbox' | 'letsdonation';

const UNIQUE_VIOLATION = '23505';

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
  }

  logWarn('creazione ref fallita', 'partnerRefService', error);
  return null;
};
