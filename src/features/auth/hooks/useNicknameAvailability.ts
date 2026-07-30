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
export const useNicknameAvailability = (value: string): NicknameCheck => {
  const [stato, setStato] = useState<NicknameCheck>('idle');

  // Valore col quale il campo si è aperto: finché non ci si discosta, niente domande (①).
  const iniziale = useRef(value);
  // Numero di sequenza dell'ultima richiesta partita: solo la sua risposta vale (③).
  const ultima = useRef(0);

  useEffect(() => {
    const v = value.trim();

    if (v === iniziale.current.trim() || v === '' || validateNickname(value)) {
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

    return () => clearTimeout(timer);
  }, [value]);

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
 * ⚠️ «GIÀ PRESO» È UN AVVISO, NON UN ERRORE BLOCCANTE — e non è una sfumatura di stile.
 * La 0017 stabilisce che **il nickname non deve MAI impedire una registrazione**: per
 * questo il trigger, davanti a una collisione, scarta il valore invece di far fallire
 * l'insert. Trattare qui «già preso» come un errore che blocca il pulsante
 * contraddirebbe quella decisione dal lato opposto — la persona non perderebbe più il
 * nickname in silenzio, perderebbe la registrazione.
 * Quindi: tono di avviso, testo che dice cosa fare, e strada libera. Chi prosegue
 * comunque non resta all'oscuro: se ne accorge la fase ④ (il messaggio a cose fatte).
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
