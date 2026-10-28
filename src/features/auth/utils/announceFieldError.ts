import { AccessibilityInfo } from 'react-native';

/**
 * Invio bloccato dalla validazione: parte UN annuncio, il primo errore nell'ordine in cui i
 * campi stanno a schermo, a ogni tentativo, anche se il testo è quello di prima (C93).
 *
 * I sei campi (`AuthInput` e gli altri) non annunciano il proprio errore e non hanno live
 * region, di proposito: con l'annuncio dentro il campo un modulo con tre errori ne leggeva
 * tre di fila, nell'ordine dei render e non del modulo; con la live region (solo Android)
 * VoiceOver taceva; e un errore uguale al precedente taceva ovunque, perché il testo a
 * schermo non cambiava.
 *
 * Restituisce `true` se c'era un messaggio, cioè se l'invio si ferma.
 */
export const announceBlockingMessage = (
  messages: readonly (string | undefined)[]
): boolean => {
  const first = messages.find(Boolean);
  if (first) AccessibilityInfo.announceForAccessibility(first);
  return Boolean(first);
};

// Ordine dei campi com'è a schermo, per modulo: va aggiornato insieme al JSX della schermata.
const FIELD_ORDER = {
  /** `SignUpScreen.tsx`. */
  signUp: [
    'firstName',
    'lastName',
    'birthDate',
    'nickname',
    'email',
    'password',
    'confirmPassword',
    'phone',
    'country',
    'city',
    'province',
    'privacyConsent',
  ],
  /** `CompleteProfileScreen.tsx`. */
  completeProfile: [
    'firstName',
    'lastName',
    'birthDate',
    'nickname',
    'phone',
    'country',
    'city',
    'province',
    'contactEmail',
    'privacyConsent',
  ],
  /** `ProfileEditScreen.tsx`. */
  profileEdit: [
    'firstName',
    'lastName',
    'email',
    'phone',
    'country',
    'city',
    'province',
    'birthDate',
    'contactEmail',
    'nickname',
  ],
} as const;

/**
 * Lo stesso per i moduli che tengono gli errori come chiavi `auth.errors.*`. Il blocco si
 * decide su TUTTI gli errori, non su quelli dell'elenco: un campo dimenticato in
 * `FIELD_ORDER` verrebbe annunciato per ultimo, mai lasciato passare.
 */
export const announceBlockingError = (
  errors: Readonly<Partial<Record<string, string>>>,
  form: keyof typeof FIELD_ORDER,
  t: (key: string) => string
): boolean => {
  const order: readonly string[] = FIELD_ORDER[form];
  const fields = Object.keys(errors);
  const ordered = [...order, ...fields.filter(f => !order.includes(f))];
  announceBlockingMessage(
    ordered.map(f => (errors[f] ? t(`auth.errors.${errors[f]}`) : undefined))
  );
  return fields.length > 0;
};
