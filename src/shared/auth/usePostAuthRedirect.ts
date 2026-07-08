import { useEffect, useRef } from 'react';
import { useNavigation } from '@react-navigation/native';

import { useAuth } from './AuthContext';
import type { RootStackNavigationProp } from '@/navigation/types';

/**
 * Navigazione post-login. La schermata Profilo ospita il login inline
 * (LoginScreen quando non autenticati): senza questo hook, dopo l'accesso
 * l'utente resterebbe sulla stessa schermata a vedere il proprio profilo come
 * se fosse "l'esito del login".
 *
 * Rileva la TRANSIZIONE non-autenticato → autenticato AVVENUTA SU QUESTA
 * schermata e redirige:
 *  - profilo completo            → Home (torna all'app);
 *  - nessun profilo (social 1ª volta) → CompleteProfile (completamento obbligato).
 *
 * Un profilo che deve ri-accettare l'informativa NON viene rediretto: resta su
 * Profilo dove `ReConsentScreen` fa da gate inline (GDPR Art.7). Per questo si
 * attende `reConsentLoaded`: `needsReConsent:false` non-ancora-calcolato non deve
 * far scattare il redirect a Home scavalcando un re-consenso dovuto.
 *
 * Non scatta all'apertura del profilo da parte di un utente GIÀ autenticato
 * (avatar Home → Profilo): `wasUnauthRef` parte da false, quindi il profilo
 * resta visualizzabile e modificabile senza essere spinto altrove.
 */
export const usePostAuthRedirect = (): void => {
  const { status, profileLoaded, profile, needsReConsent, reConsentLoaded } =
    useAuth();
  const navigation = useNavigation<RootStackNavigationProp>();
  // True solo se questa schermata ha mostrato il login (utente non autenticato) e
  // sta osservando la transizione verso l'autenticazione. Ref: la decisione è
  // one-shot e non deve causare re-render.
  const wasUnauthRef = useRef(false);

  useEffect(() => {
    if (status === 'unauthenticated') {
      wasUnauthRef.current = true;
      return;
    }
    // Redirige SOLO se il login è appena avvenuto QUI (non su un profilo già aperto)
    // e l'esito del caricamento profilo è determinato (no redirect su dato incerto).
    if (status !== 'authenticated' || !wasUnauthRef.current || !profileLoaded) {
      return;
    }

    // Social prima volta: nessuna riga profilo → completamento obbligatorio.
    if (!profile) {
      wasUnauthRef.current = false;
      navigation.navigate('CompleteProfile');
      return;
    }

    // Profilo completo: attendi la RISOLUZIONE del re-consenso per non scavalcare
    // il gate GDPR (che vive inline in ProfileScreen).
    if (!reConsentLoaded) return;
    wasUnauthRef.current = false;
    // Deve ri-accettare l'informativa → resta su Profilo (ReConsentScreen inline).
    if (needsReConsent) return;
    navigation.navigate('Home');
  }, [
    status,
    profileLoaded,
    profile,
    needsReConsent,
    reConsentLoaded,
    navigation,
  ]);
};
