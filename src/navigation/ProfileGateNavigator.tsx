import { createStackNavigator } from '@react-navigation/stack';
import React from 'react';

import { stackScreenOptions } from './stackScreenOptions';
import type { RootStackParamList } from './types';
import { CompleteProfileScreen } from '@/features/auth/screens/CompleteProfileScreen';
import { DeleteAccountScreen } from '@/features/auth/screens/DeleteAccountScreen';
import { ResetPasswordScreen } from '@/features/auth/screens/ResetPasswordScreen';

const Stack = createStackNavigator<RootStackParamList>();

/**
 * L'albero che sostituisce l'app quando un utente autenticato ha il profilo da
 * completare (decisione A4 di Riccardo: non un sollecito che si può ignorare, ma un
 * passaggio obbligato al primo accesso — serve soprattutto a chi era già iscritto).
 *
 * Perché SOSTITUIRE l'albero invece di navigare a forza sulla schermata: le rotte che
 * qui non ci sono non esistono nemmeno nella cronologia, quindi il tasto indietro (o
 * un gesto, o un link) non può scavalcare il passaggio. Con un `navigate()` imperativo
 * la schermata si chiude semplicemente tornando indietro.
 *
 * Le tre rotte sono il minimo perché nessuno resti in trappola:
 * - `CompleteProfile` è la via normale: si danno i dati e il cancello si apre.
 * - `DeleteAccount` è la via d'uscita di chi non può o non vuole completare — il caso
 *   concreto è chi, inserendo la data di nascita, scopre di non poter avere un profilo
 *   valido: senza questa rotta gli resterebbe solo disinstallare l'app.
 * - `ResetPassword` perché il link di recupero password arriva da fuori e punta qui
 *   (`useAuthDeepLink`): senza la rotta, chi è dietro il cancello non potrebbe più
 *   cambiare la password — un vicolo creato da noi, non dall'utente.
 *
 * Il logout non è una rotta: è un pulsante dentro la schermata. Uscendo, la sessione
 * cade, il cancello non ha più ragione di esistere e l'app intera torna disponibile.
 */
export const ProfileGateNavigator: React.FC = () => (
  <Stack.Navigator
    initialRouteName="CompleteProfile"
    screenOptions={stackScreenOptions}
  >
    <Stack.Screen
      name="CompleteProfile"
      component={CompleteProfileScreen}
      options={{ headerShown: false }}
    />
    <Stack.Screen
      name="DeleteAccount"
      component={DeleteAccountScreen}
      options={{ headerShown: false }}
    />
    <Stack.Screen
      name="ResetPassword"
      component={ResetPasswordScreen}
      options={{ headerShown: false }}
    />
  </Stack.Navigator>
);

export default ProfileGateNavigator;
