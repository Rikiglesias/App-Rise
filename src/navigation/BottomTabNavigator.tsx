import React from 'react';
import {
  BottomTabBarProps,
  type BottomTabHeaderProps,
  createBottomTabNavigator,
} from '@react-navigation/bottom-tabs';
import {
  getFocusedRouteNameFromRoute,
  type RouteProp,
} from '@react-navigation/native';

import type { BottomTabParamList } from './types';
import ImpactStackNavigator from './ImpactStackNavigator';
import { TabBar } from './TabBar';
import { TabHeader } from './TabHeader';
import { useTranslation } from '@/shared/hooks/useTranslation';
import { useThemeColors } from '@/shared/hooks/useThemeColors';

// Direct imports (no lazy loading to avoid spinner)
import { ContributeTabScreen } from '@/features/actions';
import HomeScreen from '@/features/home/screens/HomeScreen';

const Tab = createBottomTabNavigator<BottomTabParamList>();

const renderTabBar = (props: BottomTabBarProps) => <TabBar {...props} />;

const renderTabHeader = (props: BottomTabHeaderProps) => (
  <TabHeader {...props} />
);

// L'intestazione con l'account sta sulla radice di Impatto, non sulle sue pagine interne
// (dettagli e mappa hanno il loro «Indietro» e applicano da sé l'inset superiore).
const isImpactRoot = (route: RouteProp<BottomTabParamList, 'ImpactTab'>) =>
  (getFocusedRouteNameFromRoute(route) ?? 'Impact') === 'Impact';

const BottomTabNavigator: React.FC = () => {
  const { t } = useTranslation();
  const colors = useThemeColors();

  return (
    <Tab.Navigator
      initialRouteName="HomeTab"
      // Indietro: da Impatto/Azioni torna alla Home, dalla Home esce (principi di navigazione
      // Android). Il default di React Navigation 7 è 'firstRoute' = Impatto, il tab a sinistra.
      backBehavior="initialRoute"
      screenOptions={{
        // Intestazione opaca col colore di fondo della radice su cui sta (headerStyle).
        header: renderTabHeader,
        lazy: true, // Lazy loading: migliora cold start; preloading mirato se serve
      }}
      tabBar={renderTabBar}
    >
      <Tab.Screen
        name="ImpactTab"
        component={ImpactStackNavigator}
        options={({ route }) => ({
          tabBarAccessibilityLabel: t('navigation.impact'),
          headerShown: isImpactRoot(route),
          headerStyle: { backgroundColor: colors.neutral[50] },
        })}
      />
      <Tab.Screen
        name="HomeTab"
        component={HomeScreen}
        options={{
          tabBarAccessibilityLabel: t('navigation.home'),
          headerStyle: { backgroundColor: colors.neutral[0] },
        }}
      />
      <Tab.Screen
        name="InfoTab"
        component={ContributeTabScreen}
        options={{
          tabBarAccessibilityLabel: t('navigation.actions'),
          headerStyle: { backgroundColor: colors.neutral[50] },
        }}
      />
    </Tab.Navigator>
  );
};

export default BottomTabNavigator;
