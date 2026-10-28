import { useCallback, useRef, useState } from 'react';

import {
  getOrCreatePartnerRef,
  utenteDellaSessione,
} from './partnerRefService';
import { resolvePrefillEmail } from './partnerEmail';
import { buildDonorboxDonationUrl, appendRiseRef } from './partnerUrls';
import {
  hasSeenPartnerDisclosure,
  markPartnerDisclosureSeen,
  hasOptedOutOfPrefill,
  setPrefillOptOut,
} from './disclosureFlag';
import { useAuth } from '@/shared/auth/AuthContext';
import type { ConsentState } from '@/shared/auth/useConsentState';
import { useLinkHandler } from '@/shared/hooks/useLinkHandler';
import i18n from '@/locales';

/**
 * Orchestrazione delle uscite verso i partner (goal partner-identita, F1.7).
 * Unico punto in cui il rise_ref viene creato e agganciato all'URL, così i bottoni
 * restano dichiarativi (useActionButtonsData).
 *
 * Due flussi, ognuno col proprio avviso perché non trasmettono le stesse cose:
 * - Donazione → Donorbox (ospite, nessuna doppia registrazione): ref in utm_content
 *   + prefill anagrafico. Quando il prefill porta davvero dati personali (nome,
 *   cognome, email finiscono NELL'INDIRIZZO), un avviso lo dice prima di uscire e
 *   offre di proseguire senza: la precompilazione è una comodità, non un pedaggio.
 *   Senza dati da dichiarare l'uscita resta immediata.
 * - Shop/gift card/eventi/progetti/community → Let's Donation (doppia registrazione):
 *   esce col solo `rise_ref`, un codice collegato all'account che non contiene nome né
 *   email; la sua schermata onesta parla dell'account separato e del codice. UNA VOLTA
 *   per utente.
 *
 * I due flag «già visto» sono SEPARATI: gli avvisi dicono cose diverse, quindi aver
 * letto l'uno non vale per l'altro.
 *
 * Il codice, sui due canali, parte solo con il consenso all'informativa `ok` (C91):
 * `unknown` si ri-verifica prima di aprire, ogni altro esito apre l'indirizzo senza
 * codice e senza crearlo. «Continua senza i miei dati» toglie nome ed email, non il
 * codice.
 *
 * Il ref è best-effort: se manca (ospite, consenso non `ok`, o errore DB) l'URL parte
 * comunque senza correlazione — l'uscita non si blocca mai per colpa del ref.
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
  /**
   * L'avviso pre-donazione è visibile: l'indirizzo Donorbox porterebbe nome,
   * cognome ed email, e la persona deve saperlo prima che parta.
   */
  donorboxDisclosureVisible: boolean;
  /** Scelta sull'avviso pre-donazione: con la precompilazione, o senza. */
  confirmDonorboxDisclosure: (conDati: boolean) => Promise<void>;
  /** Chiude l'avviso pre-donazione senza uscire (e senza marcarlo come letto). */
  cancelDonorboxDisclosure: () => void;
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

  // Avviso pre-uscita verso Donorbox: i due indirizzi (con e senza i dati) sono
  // già pronti quando l'avviso compare, così la scelta apre subito senza rifare
  // i viaggi di rete che li hanno costruiti.
  const [donorboxDisclosureVisible, setDonorboxDisclosureVisible] =
    useState(false);
  // `perUtente` = chi li ha preparati: dentro ci sono i SUOI dati e il SUO
  // riferimento. Se nel frattempo l'account cambia (un link di un'altra persona
  // aperto con l'avviso ancora a schermo), quell'avviso non è più di chi guarda.
  const [pendingDonation, setPendingDonation] = useState<{
    conDati: string;
    senzaDati: string;
    perUtente: string | null;
  } | null>(null);

  const userId = session?.user?.id ?? null;

  // 'unknown' può essere solo «non ancora tornato», non «negato»: si ri-verifica
  // invece di degradare in silenzio chi è in regola. Ospite: niente da verificare.
  const consensoVerificato = useCallback(
    (): Promise<ConsentState> =>
      consentState === 'unknown' && userId
        ? refreshConsent()
        : Promise.resolve(consentState),
    [consentState, userId, refreshConsent]
  );

  const openDonation = useCallback(async () => {
    if (uscitaInCorso.current) return;
    uscitaInCorso.current = true;
    setIsExiting(true);
    try {
      // `profile` è null in DUE casi diversi: non esiste, oppure non è ancora
      // arrivato dalla rete (il caricamento parte al boot). Degradare subito
      // toglierebbe il prefill a un utente in regola che tocca «Dona» appena apre
      // l'app, quindi prima ricarichiamo e usiamo il valore FRESCO — non quello
      // della closure, che è del render precedente.
      // Profilo e consenso sono indipendenti: in serie costavano due viaggi di rete
      // proprio nel caso bersaglio (app appena aperta), sopra a quelli già spesi per
      // il ref. In parallelo il ritardo prima di aprire il link resta uno.
      // Il profilo in mano vale solo se è di chi è collegato ADESSO: qui nome ed
      // email partono verso un terzo accanto al riferimento di questa sessione, e
      // un profilo rimasto da un altro account li mescolerebbe.
      const profiloDiQuestoUtente = profile?.id === userId ? profile : null;
      const [current, consent] = await Promise.all([
        profiloDiQuestoUtente ??
          (session?.user?.id ? refreshProfile() : Promise.resolve(null)),
        consensoVerificato(),
      ]);
      // Il codice si crea e parte solo col consenso `ok` (C91), come il prefill.
      const ref =
        consent === 'ok'
          ? await getOrCreatePartnerRef('donorbox', userId)
          : null;
      // Sessione del client già di un altro account mentre questo render è ancora
      // del precedente: profilo e ref non sarebbero della stessa persona. Non si apre
      // niente; il tocco successivo, col render nuovo, parte con l'account giusto.
      if (ref === null && (await utenteDellaSessione()) !== userId) return;
      // Due condizioni, non una. Senza PROFILO manca la prova del consenso (nasce
      // insieme al profilo: trigger 0004 per il signup email, «Completa profilo»
      // dopo l'accesso social) e chi entra con Apple/Google ha comunque un'email in
      // sessione, che finirebbe a un terzo senza base documentata.
      // Sul consenso serve un `ok` ESPLICITO, non «non risulta da riaccettare»:
      // all'avvio lo stato è `unknown` finché due query non tornano, ed è proprio la
      // finestra in cui si tocca «Dona». Leggere `unknown` come «a posto» rimetterebbe
      // il bug che questa guardia esiste per chiudere, spostato di una variabile.
      // In tutti i casi il prefill degrada a vuoto; l'uscita non si blocca mai.
      // Chi ha già chiesto di non mandare i propri dati non deve richiederlo ogni
      // volta: la sua scelta è una preferenza, e qui viene onorata PRIMA di
      // costruire il prefill. Senza questa lettura la rinuncia valeva una volta
      // sola e alla donazione dopo i dati ripartivano — per giunta in silenzio,
      // perché l'avviso risultava ormai «già visto».
      const haRinunciatoAlPrefill = await hasOptedOutOfPrefill(userId);
      const prefill =
        current && consent === 'ok' && !haRinunciatoAlPrefill
          ? {
              firstName: current.first_name,
              lastName: current.last_name,
              email: resolvePrefillEmail({
                contactEmail: current.contact_email ?? null,
                authEmail: session?.user?.email ?? null,
              }),
            }
          : {};
      // Se nell'indirizzo finiscono dati personali, la persona lo sa PRIMA che
      // parta: nome, cognome ed email viaggiano come parametri, e un indirizzo
      // resta nella cronologia del browser e nei log di chi lo riceve. Finora
      // l'avviso stava sull'ALTRO canale, che non manda dati anagrafici.
      // Niente dati (ospite, consenso non ok, profilo assente) → nessun avviso:
      // non c'è nulla da dichiarare e l'uscita resta immediata com'era.
      const haDatiPersonali = Boolean(
        prefill.firstName || prefill.lastName || prefill.email
      );
      if (
        haDatiPersonali &&
        !(await hasSeenPartnerDisclosure(userId, 'donorbox'))
      ) {
        // Entrambi gli indirizzi si preparano ORA, mentre il prefill è in mano:
        // la scelta della persona non deve far ripartire i viaggi di rete.
        setPendingDonation({
          conDati: buildDonorboxDonationUrl(ref, prefill),
          senzaDati: buildDonorboxDonationUrl(ref, {}),
          perUtente: userId,
        });
        setDonorboxDisclosureVisible(true);
        return;
      }
      const url = buildDonorboxDonationUrl(ref, prefill);
      await openLink(url, 'donation', i18n.t('links.errors.donation'));
    } finally {
      uscitaInCorso.current = false;
      setIsExiting(false);
    }
  }, [
    // `userId` serve al flag «avviso già visto», che è scopato per persona: senza
    // di lui la closure resterebbe legata all'utente di prima e, dopo un cambio
    // account sullo stesso telefono, leggerebbe il flag di qualcun altro.
    userId,
    openLink,
    profile,
    session,
    refreshProfile,
    consensoVerificato,
  ]);

  /**
   * La persona ha scelto: `conDati` true prosegue con la precompilazione, false
   * apre lo stesso indirizzo senza nome, cognome ed email.
   *
   * L'avviso si marca come visto solo se la scelta è stata salvata. Una rinuncia
   * non salvata vale comunque per questa uscita, e l'avviso ricompare al prossimo
   * giro. Annullare non lo marca visto.
   */
  const confirmDonorboxDisclosure = useCallback(
    async (conDati: boolean) => {
      // Stessa guardia delle altre due uscite: anche questo è un pulsante che
      // apre il browser, e senza di essa due tocchi nello stesso tick leggono la
      // stessa closure con `pendingDonation` ancora pieno e aprono due volte.
      if (uscitaInCorso.current) return;
      uscitaInCorso.current = true;
      const scelto = pendingDonation;
      setDonorboxDisclosureVisible(false);
      setPendingDonation(null);
      try {
        if (!scelto || scelto.perUtente !== userId) return;
        // La scelta si RICORDA: «senza i miei dati» è una preferenza, non un
        // gesto valido per una volta sola. Scegliendo di mandarli si azzera una
        // eventuale rinuncia precedente, così la porta resta aperta nei due sensi.
        const sceltaSalvata = await setPrefillOptOut(userId, !conDati).then(
          () => true,
          () => false
        );
        if (sceltaSalvata) await markPartnerDisclosureSeen(userId, 'donorbox');
        await openLink(
          conDati ? scelto.conDati : scelto.senzaDati,
          'donation',
          i18n.t('links.errors.donation')
        );
      } finally {
        uscitaInCorso.current = false;
      }
    },
    [pendingDonation, userId, openLink]
  );

  const cancelDonorboxDisclosure = useCallback((): void => {
    setDonorboxDisclosureVisible(false);
    setPendingDonation(null);
  }, []);

  const exitLetsDonation = useCallback(
    async (url: string, loadingKey: string, errorMessage?: string) => {
      // Stessa guardia dell'uscita donazione: è l'altro pulsante che apre un
      // partner dopo un viaggio di rete, quindi ha lo stesso doppio tocco.
      if (uscitaInCorso.current) return;
      uscitaInCorso.current = true;
      setIsExiting(true);
      try {
        // Stessa regola dell'uscita donazione (C91): codice solo col consenso `ok`.
        const ref =
          (await consensoVerificato()) === 'ok'
            ? await getOrCreatePartnerRef('letsdonation', userId)
            : null;
        // Stessa guardia dell'uscita donazione: sessione già di un altro account.
        if (ref === null && (await utenteDellaSessione()) !== userId) return;
        await openLink(appendRiseRef(url, ref), loadingKey, errorMessage);
      } finally {
        uscitaInCorso.current = false;
        setIsExiting(false);
      }
    },
    [openLink, userId, consensoVerificato]
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
    donorboxDisclosureVisible:
      donorboxDisclosureVisible && pendingDonation?.perUtente === userId,
    openDonation,
    openLetsDonationExit,
    confirmDisclosure,
    cancelDisclosure,
    confirmDonorboxDisclosure,
    cancelDonorboxDisclosure,
  };
};
