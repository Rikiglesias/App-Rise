import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';

import { DevelopmentScreen } from '../shared/screens';
import { ImpactTabScreen } from '../features/impact';

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
      <ImpactStack.Screen name="Beneficiaries" component={DevelopmentScreen} />
      <ImpactStack.Screen name="Volunteers" component={DevelopmentScreen} />
      <ImpactStack.Screen name="Partners" component={DevelopmentScreen} />
      <ImpactStack.Screen
        name="MapModal"
        component={DevelopmentScreen}
        options={{ presentation: 'modal' }}
      />
      <ImpactStack.Screen
        name="Meals"
        component={DevelopmentScreen}
        options={{
          title: 'Meal Packing',
          headerShown: false,
        }}
      />
      <ImpactStack.Screen
        name="Kits"
        component={DevelopmentScreen}
        options={{
          title: 'Kit Packing',
          headerShown: false,
        }}
      />
    </ImpactStack.Navigator>
  );
};

export default ImpactStackNavigator;
