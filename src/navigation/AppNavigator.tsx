import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import React from 'react';

import 'react-native-gesture-handler';

// Navigators

// Lazy Screens
import {
  WrappedChiSiamoScreen,
  WrappedImpatto2024Screen,
  WrappedProjectsScreen,
  WrappedSeguiciScreen,
  WrappedSimplePlaceholderScreen,
} from './LazyLoading';

import BottomTabNavigator from './BottomTabNavigator';
import type { RootStackParamList } from './types';

const Stack = createStackNavigator<RootStackParamList>();

const AppNavigator: React.FC = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Home"
        screenOptions={{
          headerStyle: {
            backgroundColor: '#DC2626',
            elevation: 8,
            shadowColor: '#DC2626',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.3,
            shadowRadius: 8,
            borderBottomWidth: 0,
          },
          headerTintColor: '#FFFFFF',
          headerTitleStyle: {
            fontWeight: '700',
            letterSpacing: 0.5,
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
          component={WrappedSimplePlaceholderScreen}
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
          component={WrappedSimplePlaceholderScreen}
          options={{ title: 'Gift Cards' }}
          initialParams={{
            title: 'Gift Cards',
            subtitle: 'Per te o regalo, donazione automatica',
          }}
        />

        <Stack.Screen
          name="Calendario"
          component={WrappedSimplePlaceholderScreen}
          options={{ title: 'Eventi & Calendario' }}
          initialParams={{
            title: 'Calendario',
            subtitle: 'Eventi e appuntamenti',
          }}
        />

        <Stack.Screen
          name="Seguici"
          component={WrappedSeguiciScreen}
          options={{ headerShown: false }}
        />

        <Stack.Screen
          name="Tracciabilita"
          component={WrappedSimplePlaceholderScreen}
          options={{ title: 'Impatto Trasparente' }}
          initialParams={{
            title: 'Tracciabilità',
            subtitle: "Segui l'impatto delle donazioni",
          }}
        />

        <Stack.Screen
          name="ChiSiamo"
          component={WrappedChiSiamoScreen}
          options={{ headerShown: false }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
