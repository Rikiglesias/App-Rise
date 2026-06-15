import React, { useCallback, useMemo, useState } from 'react';
import { StyleSheet } from 'react-native';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';

import { getModalData } from '../data/mapModalData';
import type { MapModalData } from '../data/mapModalData';
import {
  PerfectIcon,
  PerfectText,
  PerfectContainer,
  PlatformTouchable,
} from '@/components/ui';

import InteractiveMap from '@/components/layout/InteractiveMap';
import type { Location } from '@/shared/types/location';
import MapLocationModal from '@/components/layout/MapLocationModal';
import type { ImpactStackParamList } from '@/navigation/types';
import { BorderRadius, PerfectSpacing } from '@/shared/constants';
import { scaleTouch, scaleSpacing } from '@/shared/constants/perfectScale';
import { useThemeColors } from '@/shared/hooks/useThemeColors';
import type { ThemeColors } from '@/shared/theme/adaptiveColors';

type MapModalScreenRouteProp = RouteProp<ImpactStackParamList, 'MapModal'>;

const MapModalScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute<MapModalScreenRouteProp>();
  const locations = route.params?.locations;

  const colors = useThemeColors();
  const styles = useMemo(() => createStyles(colors), [colors]);

  // State per il modal della location specifica
  const [locationModalVisible, setLocationModalVisible] = useState(false);
  const [selectedLocationData, setSelectedLocationData] =
    useState<MapModalData | null>(null);

  const handleMarkerPress = useCallback((location: Location) => {
    const modalData = getModalData(location.id);
    if (modalData) {
      setSelectedLocationData(modalData);
      setLocationModalVisible(true);
    }
  }, []);

  const handleLocationModalClose = useCallback(() => {
    setLocationModalVisible(false);
    setSelectedLocationData(null);
  }, []);

  const handleClosePress = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  if (!locations) {
    // Handle case where locations are not passed
    return (
      <PerfectContainer style={styles.container}>
        <PerfectText size={16} lines={1} fontWeight="400">
          Caricamento mappa...
        </PerfectText>
      </PerfectContainer>
    );
  }

  return (
    <PerfectContainer style={styles.container}>
      <InteractiveMap
        locations={locations}
        onMarkerPress={handleMarkerPress}
        isFullScreen
      />
      {/* Header */}
      <PerfectContainer style={styles.header}>
        <PerfectText size={24} lines={1} fontWeight="700" style={styles.title}>
          Mappa Interattiva
        </PerfectText>
        <PerfectText
          size={16}
          lines={1}
          fontWeight="400"
          style={styles.subtitle}
        >
          Tocca i pin per maggiori dettagli
        </PerfectText>

        <PlatformTouchable
          style={styles.closeButton}
          onPress={handleClosePress}
          activeOpacity={0.8}
          accessibilityRole="button"
          accessibilityLabel="Chiudi la mappa"
        >
          <PerfectIcon name="close" size={24} color={colors.neutral[0]} />
        </PlatformTouchable>
      </PerfectContainer>

      {/* Modal per le location specifiche */}
      <MapLocationModal
        visible={locationModalVisible}
        data={selectedLocationData}
        onClose={handleLocationModalClose}
      />
    </PerfectContainer>
  );
};

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.neutral[100],
    },
    closeButton: {
      position: 'absolute',
      top: PerfectSpacing['3xl'],
      right: scaleSpacing(20),
      backgroundColor: `${colors.neutral[0]}99`,
      width: scaleTouch(44),
      height: scaleTouch(44),
      borderRadius: /* scaleFont(22) */ 22,
      justifyContent: 'center',
      alignItems: 'center',
      // backdropFilter: 'blur(10px)', // For glassmorphism effect if supported
    },
    header: {
      position: 'absolute',
      top: PerfectSpacing['3xl'],
      left: scaleSpacing(20),
      right: PerfectSpacing['3xl'],
      backgroundColor: `${colors.neutral[0]}99`,
      paddingVertical: PerfectSpacing.sm,
      paddingHorizontal: PerfectSpacing.base,
      borderRadius: BorderRadius.lg,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    title: {
      color: colors.neutral[900],
      textAlign: 'center',
    },
    subtitle: {
      color: colors.neutral[600],
      textAlign: 'center',
    },
  });

export default MapModalScreen;
