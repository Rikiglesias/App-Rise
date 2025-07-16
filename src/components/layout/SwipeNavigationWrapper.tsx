import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { useNavigation } from '@react-navigation/native';
import React, { useCallback, useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import {
  Gesture,
  GestureDetector,
  GestureHandlerRootView,
} from 'react-native-gesture-handler';

import { BottomTabParamList } from '../../navigation/types';
import { useHapticFeedback } from '../../shared/hooks/useHapticFeedback';

// =================================================================
// 🎯 TYPES & CONSTANTS
// =================================================================

type TabName = keyof BottomTabParamList;

interface SwipeNavigationWrapperProps {
  children: React.ReactNode;
  currentTab: TabName;
}

const SWIPE_THRESHOLD = 80;

// Ordine logico dei tab per la navigazione swipe
const TAB_ORDER: TabName[] = ['ImpactTab', 'HomeTab', 'InfoTab'];

// =================================================================
// 🚀 MAIN COMPONENT - SEMPLIFICATO SENZA ANIMAZIONI
// =================================================================

export const SwipeNavigationWrapper: React.FC<SwipeNavigationWrapperProps> = ({
  children,
  currentTab,
}) => {
  const navigation =
    useNavigation<BottomTabNavigationProp<BottomTabParamList>>();
  const { triggerHaptic } = useHapticFeedback();

  // Calcolo dell'indice corrente del tab
  const currentTabIndex = useMemo(() => {
    return TAB_ORDER.indexOf(currentTab);
  }, [currentTab]);

  // Logica di navigazione semplificata senza animazioni
  const navigateToTab = useCallback(
    (direction: 'left' | 'right') => {
      const currentIndex = TAB_ORDER.indexOf(currentTab);
      let targetIndex: number;

      if (direction === 'left') {
        targetIndex = currentIndex - 1;
      } else {
        targetIndex = currentIndex + 1;
      }

      if (targetIndex < 0 || targetIndex >= TAB_ORDER.length) {
        triggerHaptic('light');
        return;
      }

      const targetTab = TAB_ORDER[targetIndex];
      if (targetTab) {
        triggerHaptic('light');
        navigation.navigate(targetTab);
      }
    },
    [currentTab, navigation, triggerHaptic]
  );

  // Gesture semplificato - solo rilevamento swipe base
  const panGesture = useMemo(
    () =>
      Gesture.Pan().onEnd(event => {
        const { translationX } = event;

        if (Math.abs(translationX) > SWIPE_THRESHOLD) {
          if (translationX > 0 && currentTabIndex > 0) {
            navigateToTab('left');
          } else if (
            translationX < 0 &&
            currentTabIndex < TAB_ORDER.length - 1
          ) {
            navigateToTab('right');
          }
        }
      }),
    [currentTabIndex, navigateToTab]
  );

  return (
    <GestureHandlerRootView style={styles.container}>
      <GestureDetector gesture={panGesture}>
        <View style={styles.gestureArea}>
          <View style={styles.contentWrapper}>{children}</View>
        </View>
      </GestureDetector>
    </GestureHandlerRootView>
  );
};

// =================================================================
// 🎨 STYLES SEMPLICI
// =================================================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gestureArea: {
    flex: 1,
  },
  contentWrapper: {
    flex: 1,
  },
});

export default SwipeNavigationWrapper;
