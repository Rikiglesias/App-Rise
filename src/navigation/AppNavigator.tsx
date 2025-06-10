import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import React from 'react';
import 'react-native-gesture-handler';
import { RootStackParamList } from './types';

// Screens
import ChiSiamoScreen from '../screens/ChiSiamoScreen';
import HomeScreen from '../screens/HomeScreen';
import Impatto2024Screen from '../screens/Impatto2024Screen';
import ProjectsScreen from '../screens/ProjectsScreen';
import SeguiciScreen from '../screens/SeguiciScreen';
import SimplePlaceholderScreen from '../screens/SimplePlaceholderScreen';

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
            fontSize: 18,
            letterSpacing: 0.5,
          },
        }}
      >
        <Stack.Screen
          name="Home"
          component={HomeScreen}
          options={{
            headerShown: false,
          }}
        />

        <Stack.Screen
          name="Progetti"
          component={ProjectsScreen}
          options={{
            title: 'I Nostri Progetti',
            headerShown: false,
          }}
        />

        <Stack.Screen
          name="Impatto2024"
          options={{ title: 'Impatto 2024' }}
          component={Impatto2024Screen}
        />

        <Stack.Screen
          name="CharityShop"
          component={SimplePlaceholderScreen}
          options={{
            title: 'Charity Shop',
            // Passiamo i parametri tramite initialParams o tramite navigation
          }}
          initialParams={{
            title: 'Charity Shop',
            subtitle: 'Acquista prodotti solidali',
          }}
        />

        <Stack.Screen
          name="CharityGiftCard"
          component={SimplePlaceholderScreen}
          options={{ title: 'Gift Card Solidali' }}
          initialParams={{
            title: 'Gift Card Solidali',
            subtitle: 'Regala solidarietà',
          }}
        />

        <Stack.Screen
          name="Calendario"
          component={SimplePlaceholderScreen}
          options={{ title: 'Eventi & Calendario' }}
          initialParams={{
            title: 'Calendario',
            subtitle: 'Eventi e appuntamenti',
          }}
        />

        <Stack.Screen
          name="Seguici"
          component={SeguiciScreen}
          options={{ title: 'Seguici Ovunque' }}
        />

        <Stack.Screen
          name="Tracciabilita"
          component={SimplePlaceholderScreen}
          options={{ title: 'Impatto Trasparente' }}
          initialParams={{
            title: 'Tracciabilità',
            subtitle: "Segui l'impatto delle donazioni",
          }}
        />

        <Stack.Screen
          name="ChiSiamo"
          component={ChiSiamoScreen}
          options={{ title: 'La Nostra Storia' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
