import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';

import type { ImpactStackParamList } from './types';
import { ImpactTabScreen } from '@/features/impact';
import BeneficiariesScreen from '@/features/impact/screens/BeneficiariesScreen';
import KitsScreen from '@/features/impact/screens/KitsScreen';
import MapModalScreen from '@/features/impact/screens/MapModalScreen';
import MealsScreen from '@/features/impact/screens/MealsScreen';
import PartnersScreen from '@/features/impact/screens/PartnersScreen';
import VolunteersScreen from '@/features/impact/screens/VolunteersScreen';

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
        component={BeneficiariesScreen}
      />
      <ImpactStack.Screen name="Volunteers" component={VolunteersScreen} />
      <ImpactStack.Screen name="Partners" component={PartnersScreen} />
      <ImpactStack.Screen
        name="MapModal"
        component={MapModalScreen}
        options={{ presentation: 'modal' }}
      />
      <ImpactStack.Screen name="Meals" component={MealsScreen} />
      <ImpactStack.Screen name="Kits" component={KitsScreen} />
    </ImpactStack.Navigator>
  );
};

export default ImpactStackNavigator;
