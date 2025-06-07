import 'react-native-gesture-handler';
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { RootStackParamList } from './types';

// Screens
import HomeScreen from '../screens/HomeScreen';
import PlaceholderScreen from '../screens/PlaceholderScreen';

const Stack = createStackNavigator<RootStackParamList>();

const AppNavigator: React.FC = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Home"
        screenOptions={{
          headerStyle: {
            backgroundColor: '#FF6B35',
          },
          headerTintColor: '#FFFFFF',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}
      >
        <Stack.Screen
          name="Home"
          component={HomeScreen}
          options={{
            title: 'Rise Against Hunger Italia',
          }}
        />

        <Stack.Screen name="Progetti" options={{ title: 'Progetti' }}>
          {props => (
            <PlaceholderScreen
              {...props}
              title="Progetti"
              subtitle="Scopri i nostri progetti attivi"
              icon="🏗️"
              color="#FF6B35"
            />
          )}
        </Stack.Screen>

        <Stack.Screen name="CharityShop" options={{ title: 'Charity Shop' }}>
          {props => (
            <PlaceholderScreen
              {...props}
              title="Charity Shop"
              subtitle="Acquista prodotti solidali"
              icon="🛍️"
              color="#4ECDC4"
            />
          )}
        </Stack.Screen>

        <Stack.Screen
          name="CharityGiftCard"
          options={{ title: 'Charity Gift Card' }}
        >
          {props => (
            <PlaceholderScreen
              {...props}
              title="Charity Gift Card"
              subtitle="Regala solidarietà"
              icon="🎁"
              color="#45B7D1"
            />
          )}
        </Stack.Screen>

        <Stack.Screen name="Calendario" options={{ title: 'Calendario' }}>
          {props => (
            <PlaceholderScreen
              {...props}
              title="Calendario"
              subtitle="Eventi e appuntamenti"
              icon="📅"
              color="#96CEB4"
            />
          )}
        </Stack.Screen>

        <Stack.Screen name="Seguici" options={{ title: 'Seguici' }}>
          {props => (
            <PlaceholderScreen
              {...props}
              title="Seguici"
              subtitle="Social media e aggiornamenti"
              icon="📱"
              color="#FCEA2B"
            />
          )}
        </Stack.Screen>

        <Stack.Screen name="Tracciabilita" options={{ title: 'Tracciabilità' }}>
          {props => (
            <PlaceholderScreen
              {...props}
              title="Tracciabilità"
              subtitle="Segui l'impatto delle donazioni"
              icon="📊"
              color="#FF8B94"
            />
          )}
        </Stack.Screen>

        <Stack.Screen name="ChiSiamo" options={{ title: 'Chi Siamo' }}>
          {props => (
            <PlaceholderScreen
              {...props}
              title="Chi Siamo"
              subtitle="La nostra mission e storia"
              icon="👥"
              color="#B565A7"
            />
          )}
        </Stack.Screen>
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
