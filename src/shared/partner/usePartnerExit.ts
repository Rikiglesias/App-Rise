import { useCallback, useRef, useState } from 'react';

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
  /**
   * Un'uscita è in preparazione. `useLinkHandler.isLoading` si alza solo
   * all'ULTIMO passo (l'apertura), mentre prima ci sono i viaggi di rete per ref,
   * profilo e consenso: senza questo, il pulsante resta apparentemente inerte
   * per tutta la pre-flight.
   *
   * ⚠️ Serve a MOSTRARE l'attesa, non a impedire il doppio tocco: quello è
   * chiuso dentro l'hook da una guardia su ref (uno `useState` si aggiorna al
   * render dopo, troppo tardi per due tocchi nello stesso tick). Oggi nessun
   * componente lo legge, quindi il riscontro visivo al tocco ancora manca —
   * collegarlo significa passare la proprietà fino ai singoli pulsanti, ed è da
   * fare quando l'app si guarda dal vivo, non a occhi chiusi da qui.
   */
  isExiting: boolean;
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
  const { session, profile, refreshProfile, consentState, refreshConsent } =
    useAuth();
  const { openLink, isLoading } = useLinkHandler();
  const [disclosureVisible, setDisclosureVisible] = useState(false);
  const [isExiting, setIsExiting] = useState(false);
  const [pending, setPending] = useState<PendingExit | null>(null);

  // Un'uscita alla volta. Serve un ref e NON `isExiting`: lo stato si aggiorna al
  // render successivo, quindi due tocchi ravvicinati nello stesso tick lo
  // leggerebbero entrambi `false` e partirebbero tutti e due. Prima di questa
  // guardia il pulsante restava ri-toccabile per l'intera pre-flight (tre viaggi
  // di rete: ref, profilo, consenso) e il secondo tocco apriva il browser una
  // seconda volta. La guardia sta qui, nell'hook che conosce lo stato, e non
  // nella UI: così vale per ogni chiamante senza doverla ricordare a ognuno.
  const uscitaInCorso = useRef(false);

  const userId = session?.user?.id ?? null;

  const openDonation = useCallback(async () => {
    if (uscitaInCorso.current) return;
    uscitaInCorso.current = true;
    setIsExiting(true);
    try {
      const ref = await getOrCreatePartnerRef('donorbox');
      // `profile` è null in DUE casi diversi: non esiste, oppure non è ancora
      // arrivato dalla rete (il caricamento parte al boot). Degradare subito
      // toglierebbe il prefill a un utente in regola che tocca «Dona» appena apre
      // l'app, quindi prima ricarichiamo e usiamo il valore FRESCO — non quello
      // della closure, che è del render precedente.
      // Profilo e consenso sono indipendenti: in serie costavano due viaggi di rete
      // proprio nel caso bersaglio (app appena aperta), sopra a quelli già spesi per
      // il ref. In parallelo il ritardo prima di aprire il link resta uno.
      const [current, consent] = await Promise.all([
        profile ??
          (session?.user?.id ? refreshProfile() : Promise.resolve(null)),
        // 'unknown' può essere solo «non ancora tornato», non «negato»: si
        // ri-verifica invece di degradare in silenzio chi è in regola.
        consentState === 'unknown' && session?.user?.id
          ? refreshConsent()
          : Promise.resolve(consentState),
      ]);
      // Due condizioni, non una. Senza PROFILO manca la prova del consenso (nasce
      // insieme al profilo: trigger 0004 per il signup email, «Completa profilo»
      // dopo l'accesso social) e chi entra con Apple/Google ha comunque un'email in
      // sessione, che finirebbe a un terzo senza base documentata.
      // Sul consenso serve un `ok` ESPLICITO, non «non risulta da riaccettare»:
      // all'avvio lo stato è `unknown` finché due query non tornano, ed è proprio la
      // finestra in cui si tocca «Dona». Leggere `unknown` come «a posto» rimetterebbe
      // il bug che questa guardia esiste per chiudere, spostato di una variabile.
      // In tutti i casi il prefill degrada a vuoto; l'uscita non si blocca mai.
      const prefill =
        current && consent === 'ok'
          ? {
              firstName: current.first_name,
              lastName: current.last_name,
              email: resolvePrefillEmail({
                contactEmail: current.contact_email ?? null,
                authEmail: session?.user?.email ?? null,
              }),
            }
          : {};
      const url = buildDonorboxDonationUrl(ref, prefill);
      await openLink(
        url,
        'donation',
        'Impossibile aprire il link di donazione. Riprova più tardi.'
      );
    } finally {
      uscitaInCorso.current = false;
      setIsExiting(false);
    }
  }, [
    openLink,
    profile,
    session,
    refreshProfile,
    consentState,
    refreshConsent,
  ]);

  const exitLetsDonation = useCallback(
    async (url: string, loadingKey: string, errorMessage?: string) => {
      // Stessa guardia dell'uscita donazione: è l'altro pulsante che apre un
      // partner dopo un viaggio di rete, quindi ha lo stesso doppio tocco.
      if (uscitaInCorso.current) return;
      uscitaInCorso.current = true;
      setIsExiting(true);
      try {
        const ref = await getOrCreatePartnerRef('letsdonation');
        await openLink(appendRiseRef(url, ref), loadingKey, errorMessage);
      } finally {
        uscitaInCorso.current = false;
        setIsExiting(false);
      }
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
    isExiting,
    disclosureVisible,
    openDonation,
    openLetsDonationExit,
    confirmDisclosure,
    cancelDisclosure,
  };
};
