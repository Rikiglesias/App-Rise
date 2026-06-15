/**
 * Export dati donatore (GDPR Art.20 — portabilità).
 * Costruisce un JSON strutturato e lo condivide via share-sheet nativo
 * (`Share` di react-native: nessuna dipendenza nativa nuova).
 */
import { Share } from 'react-native';

import type { Profile } from './types';

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
}

/** Logica pura: assembla il payload esportabile (testabile in isolamento). */
export const buildExportPayload = (
  account: ExportAccount,
  profile: Profile | null
): ExportPayload => ({
  exported_at: new Date().toISOString(),
  account,
  profile,
});

/** Apre il share-sheet nativo con il JSON dei dati dell'utente. */
export const exportData = async (
  account: ExportAccount,
  profile: Profile | null
): Promise<void> => {
  const payload = buildExportPayload(account, profile);
  await Share.share({
    title: 'I miei dati — Rise Against Hunger',
    message: JSON.stringify(payload, null, 2),
  });
};
