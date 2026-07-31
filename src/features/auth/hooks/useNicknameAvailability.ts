import { useEffect, useRef, useState } from 'react';

import { isNicknameAvailable } from '@/shared/auth/nickname';
import { validateNickname } from '@/shared/auth/validation';
import { useTranslation } from '@/shared/hooks/useTranslation';

/**
 * Stato del controllo «questo nickname è libero?» mentre la persona scrive.
 *
 * `unknown` NON è un errore da mostrare come tale: significa che non siamo riusciti a
 * chiedere (rete assente). La persona deve poter andare avanti comunque — l'integrità
 * la garantiscono l'indice unico e le clemenze del trigger (0017), non questo controllo.
 */
export type NicknameCheck = 'idle' | 'checking' | 'free' | 'taken' | 'unknown';

/**
 * Attesa prima di interrogare il server. 450 ms è il compromesso fra due difetti
 * opposti: troppo corto e parte una richiesta per ogni lettera digitata (rumore di rete
 * su mobile, e risposte che si sorpassano a vicenda); troppo lungo e la persona ha già
 * lasciato il campo prima di sapere che il nome è preso.
 */
const ATTESA_MS = 450;

/**
 * Dice se il nickname che si sta scrivendo è libero, senza disturbare il server a ogni
 * tasto. Usato in registrazione e in modifica profilo — gli stessi due punti in cui,
 * senza questo, il nickname sparirebbe in silenzio.
 *
 * TRE COSE CHE NON FA, tutte deliberate:
 *
 * ① non chiede NULLA finché la persona non tocca il campo. In «modifica profilo» il
 *    campo si apre già pieno del proprio nickname: senza questa guardia partirebbe una
 *    richiesta all'apertura della schermata, per una domanda che nessuno ha fatto.
 *
 * ② non chiede se la forma è sbagliata (troppo corto, troppo lungo): a quel punto
 *    l'errore da mostrare è quello di forma, che il form conosce già. Chiedere «è
 *    libero?» su un valore che comunque non entrerebbe sarebbe una domanda inutile e
 *    una seconda riga rossa sotto lo stesso campo.
 *
 * ③ non accetta risposte SORPASSATE. Le richieste partono in ordine ma possono tornare
 *    in disordine: senza il contatore, la risposta lenta su «mari» arriverebbe dopo
 *    quella su «mario» e sovrascriverebbe il verdetto giusto con uno vecchio. Lo stesso
 *    contatore protegge dallo smontaggio della schermata, dove un `setState` tardivo
 *    scriverebbe nel vuoto.
 */
export const useNicknameAvailability = (
  value: string,
  /**
   * «La persona ha toccato il campo?», per i form che RIEMPIONO il campo da soli.
   *
   * ⚠️ IL CASO PREVISTO QUI SOTTO È DIVENTATO REALE (2026-07-31, completamento profilo
   * post-social). Dove il campo viene idratato dal profilo, il valore passa da `''` al
   * nickname della persona DOPO il primo render: per il confronto col valore iniziale
   * quella è una digitazione, quindi parte una domanda al server su un nickname che è
   * GIÀ SUO. La risposta — «occupato» — è vera e inutile, e blocca il salvataggio di
   * chi non ha toccato niente. Riprodotto da un test prima di essere corretto.
   * Chi idrata il campo passa quindi un flag ESPLICITO; chi non lo passa mantiene il
   * criterio di prima (registrazione e modifica profilo, dove il campo non si riempie
   * mai da solo).
   */
  toccato?: boolean
): NicknameCheck => {
  const [stato, setStato] = useState<NicknameCheck>('idle');

  // Valore col quale il campo si è aperto: finché non ci si discosta, niente domande (①).
  const iniziale = useRef(value);
  // Numero di sequenza dell'ultima richiesta partita: solo la sua risposta vale (③).
  const ultima = useRef(0);

  useEffect(() => {
    const v = value.trim();

    // Chi passa il flag decide con QUELLO; per gli altri il criterio resta «è ancora il
    // valore con cui il campo si è aperto?». Sono due modi di rispondere alla stessa
    // domanda — «questo valore l'ha scritto la persona?» — e il secondo sbaglia solo
    // dove il form scrive nel campo per conto suo.
    const nonToccato =
      toccato === undefined ? v === iniziale.current.trim() : !toccato;
    if (nonToccato || v === '' || validateNickname(value)) {
      // Si invalida anche l'eventuale richiesta in volo: il suo verdetto non riguarda
      // più ciò che c'è scritto adesso.
      ultima.current += 1;
      setStato('idle');
      return;
    }

    setStato('checking');
    const mio = ++ultima.current;

    const timer = setTimeout(() => {
      void isNicknameAvailable(v).then(esito => {
        if (mio !== ultima.current) return; // sorpassata: la sua risposta non conta più
        setStato(esito === null ? 'unknown' : esito ? 'free' : 'taken');
      });
    }, ATTESA_MS);

    return () => {
      // Si invalida ANCHE la richiesta già partita, non solo il timer che deve ancora
      // scattare: se la schermata si smonta mentre la risposta è in volo, `clearTimeout`
      // non la ferma e il `.then` chiamerebbe `setStato` su un componente che non c'è
      // più. Il contatore è ciò che rende quel ritorno innocuo — senza questa riga la
      // protezione era scritta nel commento ③ ma non nel codice.
      ultima.current += 1;
      clearTimeout(timer);
    };
  }, [value, toccato]);

  return stato;
};

/** Cosa mostrare sotto il campo, già tradotto: le due schermate ne fanno una riga sola. */
export interface NicknameHint {
  hint?: string;
  hintTone: 'neutral' | 'positive' | 'warning';
}

/**
 * Traduce lo stato del controllo in ciò che la persona legge sotto il campo.
 *
 * Prende lo STATO e non il valore di proposito: chi possiede il campo (il form di
 * registrazione) ha già chiamato `useNicknameAvailability` per decidere se lasciar
 * passare il salvataggio, e farglielo chiamare una seconda volta qui aprirebbe un
 * SECONDO ciclo di attesa e richieste sullo stesso testo, con due verdetti che possono
 * anche non coincidere.
 *
 * ⚠️ «GIÀ PRESO» NON SI MOSTRA IN ROSSO, MA IL SALVATAGGIO SÌ SI FERMA — due cose
 * distinte, ed è bene non confonderle leggendo solo metà della storia.
 *   · QUI (il riscontro a schermo) il tono è di AVVISO, non di errore: sotto lo stesso
 *     campo convivono «Controllo…», «Libero» e «non verificabile», e dipingerli col
 *     rosso dell'errore farebbe leggere «Libero» come un problema.
 *   · ALTROVE (`useSignUpForm` e il salvataggio di `ProfileEditScreen`) lo stato
 *     `taken` **ferma davvero** l'invio, e ci sono buone ragioni: proseguire porterebbe
 *     a perdere il nickname in silenzio (in registrazione lo scarta il trigger) o a
 *     leggere il messaggio della corsa persa quando la corsa non c'è stata.
 * Non è in contraddizione con la 0017 («il nickname non deve MAI impedire una
 * registrazione»): quella regola protegge il DATABASE dal far cadere l'insert, e la
 * persona resta libera di procedere in ogni momento — il campo è facoltativo, basta
 * svuotarlo. Ciò che si impedisce è solo di andare avanti CREDENDO di aver preso un nome
 * che verrebbe buttato via.
 *
 * `unknown` invece non ferma niente e non è un errore: dice che non siamo riusciti a
 * chiedere, e che si può proseguire. Tacere sarebbe peggio — si crederebbe «libero».
 *
 * Anche `unknown` è un avviso e non un errore: dice che non siamo riusciti a chiedere,
 * e che si può proseguire. Tacere sarebbe peggio — la persona crederebbe «libero».
 */
export const useNicknameHint = (stato: NicknameCheck): NicknameHint => {
  const { t } = useTranslation();

  switch (stato) {
    case 'checking':
      return { hint: t('auth.signup.nicknameChecking'), hintTone: 'neutral' };
    case 'free':
      return { hint: t('auth.signup.nicknameFree'), hintTone: 'positive' };
    case 'taken':
      return { hint: t('auth.errors.nickname_taken'), hintTone: 'warning' };
    case 'unknown':
      return { hint: t('auth.signup.nicknameUnknown'), hintTone: 'warning' };
    default:
      return { hintTone: 'neutral' };
  }
};
