import { createStackNavigator } from '@react-navigation/stack';
import React from 'react';

import BottomTabNavigator from './BottomTabNavigator';
import { stackScreenOptions } from './stackScreenOptions';
import type { RootStackParamList } from './types';
import SeguiciScreen from '@/features/social/screens/SeguiciScreen';
import ChiSiamoScreen from '@/features/about/screens/ChiSiamoScreen';
import { SignUpScreen } from '@/features/auth/screens/SignUpScreen';
import { ForgotPasswordScreen } from '@/features/auth/screens/ForgotPasswordScreen';
import { ResetPasswordScreen } from '@/features/auth/screens/ResetPasswordScreen';
import { CompleteProfileScreen } from '@/features/auth/screens/CompleteProfileScreen';
import { ProfileEditScreen } from '@/features/auth/screens/ProfileEditScreen';
import { DeleteAccountScreen } from '@/features/auth/screens/DeleteAccountScreen';

const Stack = createStackNavigator<RootStackParamList>();

/**
 * L'app come la vede chi può usarla: navigazione intera, ospiti inclusi.
 * È uno dei DUE alberi possibili — l'altro è `ProfileGateNavigator`, montato al suo
 * posto quando un utente autenticato ha il profilo da completare. Sono alternativi e
 * non annidati: è questo che rende il cancello invalicabile col tasto indietro, perché
 * le rotte di qui, mentre il cancello è chiuso, non esistono affatto nell'albero.
 */
export const MainStackNavigator: React.FC = () => (
  <Stack.Navigator initialRouteName="Home" screenOptions={stackScreenOptions}>
    {/* Main App with Bottom Tabs */}
    <Stack.Screen
      name="Home"
      component={BottomTabNavigator}
      options={{
        headerShown: false,
      }}
    />

    {/* Stack Screens for detailed views */}
    <Stack.Screen
      name="Seguici"
      component={SeguiciScreen}
      options={{ headerShown: false }}
    />

    <Stack.Screen
      name="ChiSiamo"
      component={ChiSiamoScreen}
      options={{ headerShown: false }}
    />

    {/* I moduli si aprono sopra la scheda Profilo: indietro torna alla scheda. */}
    <Stack.Screen
      name="SignUp"
      component={SignUpScreen}
      options={{ headerShown: false }}
    />
    <Stack.Screen
      name="ForgotPassword"
      component={ForgotPasswordScreen}
      options={{ headerShown: false }}
    />
    <Stack.Screen
      name="ResetPassword"
      component={ResetPasswordScreen}
      options={{ headerShown: false }}
    />
    <Stack.Screen
      name="CompleteProfile"
      component={CompleteProfileScreen}
      options={{ headerShown: false }}
    />
    <Stack.Screen
      name="ProfileEdit"
      component={ProfileEditScreen}
      options={{ headerShown: false }}
    />
    <Stack.Screen
      name="DeleteAccount"
      component={DeleteAccountScreen}
      options={{ headerShown: false }}
    />
  </Stack.Navigator>
);

export default MainStackNavigator;
