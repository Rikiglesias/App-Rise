import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';

import { WrappedDevelopmentScreen } from './LazyLoading';
import type { ImpactStackParamList } from './types';
import { ImpactTabScreen } from '@/features/impact';
import MapModalScreen from '@/features/impact/screens/MapModalScreen';

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
        component={WrappedDevelopmentScreen}
      />
      <ImpactStack.Screen
        name="Volunteers"
        component={WrappedDevelopmentScreen}
      />
      <ImpactStack.Screen
        name="Partners"
        component={WrappedDevelopmentScreen}
      />
      <ImpactStack.Screen
        name="MapModal"
        component={MapModalScreen}
        options={{ presentation: 'modal' }}
      />
      <ImpactStack.Screen
        name="Meals"
        component={WrappedDevelopmentScreen}
        options={{
          title: 'Meal Packing',
          headerShown: false,
        }}
      />
      <ImpactStack.Screen
        name="Kits"
        component={WrappedDevelopmentScreen}
        options={{
          title: 'Kit Packing',
          headerShown: false,
        }}
      />
    </ImpactStack.Navigator>
  );
};

export default ImpactStackNavigator;
