import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';

import { ImpactTabScreen } from '../features/impact';
import MapModalScreen from '../screens/MapModalScreen';
import { WrappedSimplePlaceholderScreen } from './LazyLoading';

import type { ImpactStackParamList } from './types';

const ImpactStack = createNativeStackNavigator<ImpactStackParamList>();

const ImpactStackNavigator: React.FC = () => {
  return (
    <ImpactStack.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'none', // Disabilita animazioni per transizioni istantanee
      }}
      initialRouteName="Impact"
    >
      <ImpactStack.Screen name="Impact" component={ImpactTabScreen} />
      <ImpactStack.Screen
        name="Beneficiaries"
        component={WrappedSimplePlaceholderScreen}
      />
      <ImpactStack.Screen
        name="Volunteers"
        component={WrappedSimplePlaceholderScreen}
      />
      <ImpactStack.Screen
        name="Partners"
        component={WrappedSimplePlaceholderScreen}
      />
      <ImpactStack.Screen
        name="MapModal"
        component={MapModalScreen}
        options={{ presentation: 'modal' }}
      />
      <ImpactStack.Screen
        name="Meals"
        component={WrappedSimplePlaceholderScreen}
        options={{
          title: 'Meal Packing',
          headerShown: false,
        }}
      />
      <ImpactStack.Screen
        name="Kits"
        component={WrappedSimplePlaceholderScreen}
        options={{
          title: 'Kit Packing',
          headerShown: false,
        }}
      />
    </ImpactStack.Navigator>
  );
};

export default ImpactStackNavigator;
