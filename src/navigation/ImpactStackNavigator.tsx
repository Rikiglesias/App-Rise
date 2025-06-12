import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';

import BeneficiariesScreen from '../screens/Impact/BeneficiariesScreen';
import PartnersScreen from '../screens/Impact/PartnersScreen';
import VolunteersScreen from '../screens/Impact/VolunteersScreen';
import ImpactTabScreen from '../screens/ImpactTabScreen';
import MapModalScreen from '../screens/MapModalScreen';

import type { ImpactStackParamList } from './types';

const ImpactStack = createNativeStackNavigator<ImpactStackParamList>();

const ImpactStackNavigator: React.FC = () => {
  return (
    <ImpactStack.Navigator
      screenOptions={{
        headerShown: false,
      }}
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
    </ImpactStack.Navigator>
  );
};

export default ImpactStackNavigator;
