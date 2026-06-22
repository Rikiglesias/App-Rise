import {
  NavigationContainer,
  useNavigationContainerRef,
} from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import React from 'react';

import 'react-native-gesture-handler';

// Navigators

// Direct imports (no lazy loading for immediate loading)

// Lazy Screens (keep lazy for less critical screens)
import {
  WrappedImpatto2024Screen,
  WrappedProjectsScreen,
  WrappedDevelopmentScreen,
} from './LazyLoading';

import BottomTabNavigator from './BottomTabNavigator';
import type { RootStackParamList } from './types';
import SeguiciScreen from '@/features/social/screens/SeguiciScreen';
import { Colors } from '@/shared/constants/designTokens';
import { scale } from '@/shared/constants/perfectScale';
import ChiSiamoScreen from '@/features/about/screens/ChiSiamoScreen';
import { SignUpScreen } from '@/features/auth/screens/SignUpScreen';
import { ForgotPasswordScreen } from '@/features/auth/screens/ForgotPasswordScreen';
import { ResetPasswordScreen } from '@/features/auth/screens/ResetPasswordScreen';
import { CompleteProfileScreen } from '@/features/auth/screens/CompleteProfileScreen';
import { ProfileEditScreen } from '@/features/auth/screens/ProfileEditScreen';
import { DeleteAccountScreen } from '@/features/auth/screens/DeleteAccountScreen';
import { ProfileScreen } from '@/features/auth/screens/ProfileScreen';
import { useAuthDeepLink } from '@/shared/auth/useAuthDeepLink';

const Stack = createStackNavigator<RootStackParamList>();

const AppNavigator: React.FC = () => {
  // Deep link auth (recovery password + conferma email signup): stabilisce la sessione.
  const navigationRef = useNavigationContainerRef<RootStackParamList>();
  useAuthDeepLink(navigationRef);

  return (
    <NavigationContainer ref={navigationRef}>
      <Stack.Navigator
        initialRouteName="Home"
        screenOptions={{
          headerStyle: {
            backgroundColor: Colors.primary[600],
            elevation: 8,
            shadowColor: Colors.primary[600],
            shadowOffset: { width: 0, height: scale(4) },
            shadowOpacity: 0.3,
            shadowRadius: scale(8),
            borderBottomWidth: 0,
          },
          headerTintColor: Colors.accent.white,
          headerTitleStyle: {
            fontWeight: '700',
            letterSpacing: scale(0.5),
          },
        }}
      >
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
          name="Progetti"
          component={WrappedProjectsScreen}
          options={{
            title: 'I Nostri Progetti',
            headerShown: false,
          }}
        />

        <Stack.Screen
          name="Impatto2024"
          options={{ title: 'Impatto 2024' }}
          component={WrappedImpatto2024Screen}
        />

        <Stack.Screen
          name="CharityShop"
          component={WrappedDevelopmentScreen}
          options={{
            title: 'Charity Shop',
          }}
          initialParams={{
            title: 'Charity Shop',
            subtitle: 'Acquisti che aiutano, stesso prezzo',
          }}
        />

        <Stack.Screen
          name="CharityGiftCard"
          component={WrappedDevelopmentScreen}
          options={{ title: 'Gift Cards' }}
          initialParams={{
            title: 'Gift Cards',
            subtitle: 'Per te o regalo, donazione automatica',
          }}
        />

        <Stack.Screen
          name="Calendario"
          component={WrappedDevelopmentScreen}
          options={{ title: 'Eventi & Calendario' }}
          initialParams={{
            title: 'Calendario',
            subtitle: 'Eventi e appuntamenti',
          }}
        />

        <Stack.Screen
          name="Seguici"
          component={SeguiciScreen}
          options={{ headerShown: false }}
        />

        <Stack.Screen
          name="Tracciabilita"
          component={WrappedDevelopmentScreen}
          options={{ title: 'Impatto Trasparente' }}
          initialParams={{
            title: 'Tracciabilità',
            subtitle: "Segui l'impatto delle donazioni",
          }}
        />

        <Stack.Screen
          name="ChiSiamo"
          component={ChiSiamoScreen}
          options={{ headerShown: false }}
        />

        {/* Area donatori (auth). Profilo è una Stack.Screen aperta dall'avatar
            nell'header Home: se unauthenticated mostra il login (LoginScreen),
            altrimenti il profilo. SignUp/ForgotPassword/ResetPassword push. */}
        <Stack.Screen
          name="Profilo"
          component={ProfileScreen}
          options={{ headerShown: false }}
        />
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
    </NavigationContainer>
  );
};

export default AppNavigator;
