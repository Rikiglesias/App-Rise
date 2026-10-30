import { useCallback, useEffect, useRef } from 'react';
import { useNavigation } from '@react-navigation/native';

import { useAuth } from './AuthContext';
import type { RootStackNavigationProp } from '@/navigation/types';

/**
 * Lega una schermata che agisce sull'account (Modifica profilo, Elimina account)
 * all'utente con cui si è aperta. Un link di un altro account aperto mentre è a
 * schermo cambia la sessione SENZA logout, quindi `useRequireAuth` non scatta: il
 * modulo resterebbe coi dati del precedente e un «Salva», o una conferma lasciata
 * aperta, agirebbe sull'account nuovo.
 *
 * Al cambio si esce alla radice dell'albero ATTIVO — `Account` nell'app, il passaggio
 * obbligatorio nel cancello del profilo — chiedendo al navigatore quali rotte
 * esistono, come `goAvanti` in `ResetPasswordScreen`. Restituisce la domanda da fare
 * PRIMA di scrivere o cancellare: una callback partita prima del cambio ha ancora in
 * mano il render vecchio, e solo il ref sa chi è collegato adesso. Smontata la schermata
 * nemmeno il ref si aggiorna più (entrare in un altro account può chiudere il cancello
 * con una conferma aperta o un salvataggio in rete): lì lo si chiede ad AuthContext, che
 * resta montato, così chi esce mentre salva non perde il resto del salvataggio.
 */
export const useLegataAllUtente = (): (() => boolean) => {
  const { session, utenteCollegato } = useAuth();
  const navigation = useNavigation<RootStackNavigationProp>();
  const userId = session?.user.id ?? null;
  // Il primo utente NON nullo: se la schermata montasse prima che la sessione sia
  // letta, fissare `null` renderebbe Salva ed Elimina inerti per sempre.
  const proprietario = useRef(userId);
  const attuale = useRef(userId);
  const uscita = useRef(false);
  const smontata = useRef(false);

  useEffect(() => {
    smontata.current = false;
    return () => {
      smontata.current = true;
    };
  }, []);

  useEffect(() => {
    attuale.current = userId;
    proprietario.current ??= userId;
    if (userId === null || userId === proprietario.current || uscita.current)
      return;
    uscita.current = true;
    const rotte = navigation.getState()?.routeNames ?? [];
    if (rotte.includes('Account')) navigation.popTo('Account');
    else if (rotte.includes('ReConsent')) navigation.popTo('ReConsent');
    else if (rotte.includes('CompleteProfile'))
      navigation.popTo('CompleteProfile');
    else if (navigation.canGoBack()) navigation.goBack();
  }, [userId, navigation]);

  return useCallback(() => {
    const collegato = smontata.current ? utenteCollegato() : attuale.current;
    return proprietario.current !== null && collegato === proprietario.current;
  }, [utenteCollegato]);
};
