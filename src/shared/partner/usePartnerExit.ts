import { useCallback, useState } from 'react';

import { getOrCreatePartnerRef } from './partnerRefService';
import { resolvePrefillEmail } from './partnerEmail';
import { buildDonorboxDonationUrl, appendRiseRef } from './partnerUrls';
import {
  hasSeenPartnerDisclosure,
  markPartnerDisclosureSeen,
} from './disclosureFlag';
import { useAuth } from '@/shared/auth/AuthContext';
import { useLinkHandler } from '@/shared/hooks/useLinkHandler';

/**
 * Orchestrazione delle uscite verso i partner (goal partner-identita, F1.7).
 * Unico punto in cui il rise_ref viene creato e agganciato all'URL, così i bottoni
 * restano dichiarativi (useActionButtonsData).
 *
 * Due flussi:
 * - Donazione → Donorbox (ospite, nessuna doppia registrazione): ref in utm_content
 *   + prefill anagrafico. Nessuna schermata onesta.
 * - Shop/gift card/eventi/progetti/community → Let's Donation (doppia registrazione):
 *   schermata onesta UNA VOLTA per utente, poi ref in rise_ref su OGNI uscita.
 *
 * Il ref è best-effort: se manca (ospite, o errore DB) l'URL parte comunque senza
 * correlazione — l'uscita non si blocca mai per colpa del ref.
 */

interface PendingExit {
  url: string;
  loadingKey: string;
  errorMessage: string | undefined;
}

export interface UsePartnerExitReturn {
  isLoading: string | null;
  /** La schermata onesta è visibile (uscita Let's Donation in attesa di conferma). */
  disclosureVisible: boolean;
  /** Uscita donazione → Donorbox (nessuna schermata onesta). */
  openDonation: () => Promise<void>;
  /** Uscita Let's Donation: mostra la schermata onesta la prima volta, poi va dritto. */
  openLetsDonationExit: (
    url: string,
    loadingKey: string,
    errorMessage?: string
  ) => Promise<void>;
  /** L'utente conferma la schermata onesta → la memorizza e prosegue l'uscita. */
  confirmDisclosure: () => Promise<void>;
  /** L'utente annulla la schermata onesta → nessuna uscita. */
  cancelDisclosure: () => void;
}

export const usePartnerExit = (): UsePartnerExitReturn => {
  const { session, profile } = useAuth();
  const { openLink, isLoading } = useLinkHandler();
  const [disclosureVisible, setDisclosureVisible] = useState(false);
  const [pending, setPending] = useState<PendingExit | null>(null);

  const userId = session?.user?.id ?? null;

  const openDonation = useCallback(async () => {
    const ref = await getOrCreatePartnerRef('donorbox');
    const email = resolvePrefillEmail({
      contactEmail: profile?.contact_email ?? null,
      authEmail: session?.user?.email ?? null,
    });
    const url = buildDonorboxDonationUrl(ref, {
      firstName: profile?.first_name ?? null,
      lastName: profile?.last_name ?? null,
      email,
    });
    await openLink(
      url,
      'donation',
      'Impossibile aprire il link di donazione. Riprova più tardi.'
    );
  }, [openLink, profile, session]);

  const exitLetsDonation = useCallback(
    async (url: string, loadingKey: string, errorMessage?: string) => {
      const ref = await getOrCreatePartnerRef('letsdonation');
      await openLink(appendRiseRef(url, ref), loadingKey, errorMessage);
    },
    [openLink]
  );

  const openLetsDonationExit = useCallback(
    async (url: string, loadingKey: string, errorMessage?: string) => {
      const seen = await hasSeenPartnerDisclosure(userId);
      if (seen) {
        await exitLetsDonation(url, loadingKey, errorMessage);
        return;
      }
      setPending({ url, loadingKey, errorMessage });
      setDisclosureVisible(true);
    },
    [userId, exitLetsDonation]
  );

  const confirmDisclosure = useCallback(async () => {
    setDisclosureVisible(false);
    await markPartnerDisclosureSeen(userId);
    const next = pending;
    setPending(null);
    if (next) {
      await exitLetsDonation(next.url, next.loadingKey, next.errorMessage);
    }
  }, [userId, pending, exitLetsDonation]);

  const cancelDisclosure = useCallback(() => {
    setDisclosureVisible(false);
    setPending(null);
  }, []);

  return {
    isLoading,
    disclosureVisible,
    openDonation,
    openLetsDonationExit,
    confirmDisclosure,
    cancelDisclosure,
  };
};
