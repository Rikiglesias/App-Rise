import { useCallback, useEffect, useRef, useState } from 'react';

const normalizza = (email: string): string => email.trim().toLowerCase();

/**
 * Campo «Email» dell'account in «Modifica profilo» (C87).
 *
 * Il campo segue l'email della sessione finché la persona non lo tocca: quando il
 * cambio viene confermato dalle due caselle la sessione cambia SOTTO la schermata, e
 * un campo fermo al vecchio indirizzo, al «Salva» successivo, chiederebbe di tornare
 * indietro. Stesso schema (e stessa ragione) della mail di contatto.
 *
 * `emailDaCambiare` dice se il «Salva» deve chiedere un cambio: no se l'indirizzo è
 * quello attuale o quello già in attesa, a prescindere da spazi e maiuscole (gli
 * indirizzi non distinguono le maiuscole, e il server cerca gli utenti con `LOWER(email)`).
 * Senza, salvare il telefono rimandava le mail di conferma del cambio in corso.
 */
export const useAccountEmailField = (
  currentEmail: string,
  pendingEmail: string | null
) => {
  const [email, setEmail] = useState(currentEmail);
  const touched = useRef(false);
  useEffect(() => {
    if (touched.current) return;
    setEmail(currentEmail);
  }, [currentEmail]);
  const onChangeEmail = useCallback((value: string): void => {
    touched.current = true;
    setEmail(value);
  }, []);

  /** L'indirizzo da passare a `updateEmail`, o null se non c'è niente da cambiare. */
  const emailDaCambiare = useCallback((): string | null => {
    const next = email.trim();
    const n = normalizza(next);
    if (n === normalizza(currentEmail)) return null;
    if (pendingEmail && n === normalizza(pendingEmail)) return null;
    return next;
  }, [email, currentEmail, pendingEmail]);

  // Dopo un salvataggio riuscito il valore scritto è quello attuale o quello in attesa:
  // da lì il campo torna a seguire la sessione (conferma del cambio, anche da un altro
  // dispositivo), invece di restare a un indirizzo che non è più di nessuno.
  const segnaSalvato = useCallback((): void => {
    touched.current = false;
  }, []);

  return { email, onChangeEmail, emailDaCambiare, segnaSalvato };
};
