/**
 * Export dati donatore (GDPR Art.20 — portabilità).
 * Costruisce un JSON strutturato e lo condivide via share-sheet nativo
 * (`Share` di react-native: nessuna dipendenza nativa nuova).
 */
import { Share } from 'react-native';

import { supabase } from './supabaseClient';
import type { Profile, ConsentEvent } from './types';
import type { PartnerName } from '@/shared/partner/partnerRefService';
import i18n from '@/locales';

export interface ExportAccount {
  id: string;
  email: string | null;
  created_at?: string;
  providers: string[];
}

export interface ExportPayload {
  exported_at: string;
  account: ExportAccount;
  profile: Profile | null;
  consent_history: ConsentEvent[];
  partner_refs: ExportPartnerRef[];
}

interface ExportPartnerRef {
  partner: PartnerName;
  ref: string;
  created_at: string;
}

/** Logica pura: assembla il payload esportabile (testabile in isolamento). */
export const buildExportPayload = (
  account: ExportAccount,
  profile: Profile | null,
  consentHistory: ConsentEvent[] = [],
  partnerRefs: ExportPartnerRef[] = []
): ExportPayload => ({
  exported_at: new Date().toISOString(),
  account,
  profile,
  consent_history: consentHistory,
  partner_refs: partnerRefs,
});

/** Apre il share-sheet nativo con il JSON dei dati dell'utente. */
export const exportData = async (
  account: ExportAccount,
  profile: Profile | null,
  consentHistory: ConsentEvent[] = []
): Promise<void> => {
  // Client della sessione: la RLS limita la lettura ai propri ref, anche storici.
  const { data, error } = await supabase
    .from('partner_refs')
    .select('partner, ref, created_at')
    .eq('user_id', account.id);
  if (error) throw error;
  const payload = buildExportPayload(
    account,
    profile,
    consentHistory,
    data ?? []
  );
  await Share.share({
    title: i18n.t('auth.privacy.exportTitle'),
    message: JSON.stringify(payload, null, 2),
  });
};
