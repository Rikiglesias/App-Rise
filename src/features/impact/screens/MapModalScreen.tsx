import React, { useCallback, useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';

import { getModalData } from '../data/mapModalData';
import type { MapModalData } from '../data/mapModalData';
import { LOCATIONS_DATA } from '../data/locationsData';
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
import {
  scaleTouch,
  scaleSpacing,
  scale,
} from '@/shared/constants/perfectScale';
import { useThemeColors } from '@/shared/hooks/useThemeColors';
import { useTranslation } from '@/shared/hooks/useTranslation';
import type { ThemeColors } from '@/shared/theme/adaptiveColors';

type MapModalScreenRouteProp = RouteProp<ImpactStackParamList, 'MapModal'>;

// L'anno vive in LOCATIONS_DATA; le location della mappa condividono lo stesso id.
const YEAR_BY_ID = new Map<string, number>(
  LOCATIONS_DATA.map(l => [l.id, l.year])
);

interface YearChipProps {
  label: string;
  value: number | null;
  active: boolean;
  onSelect: (year: number | null) => void;
}

/** Chip di filtro anno (handler stabile, no arrow inline nel prop). */
const YearChip: React.FC<YearChipProps> = ({
  label,
  value,
  active,
  onSelect,
}) => {
  const colors = useThemeColors();
  const styles = useMemo(() => createChipStyles(colors), [colors]);
  const handlePress = useCallback(() => onSelect(value), [onSelect, value]);
  return (
    <PlatformTouchable
      onPress={handlePress}
      activeOpacity={0.8}
      accessibilityRole="button"
      accessibilityState={{ selected: active }}
      accessibilityLabel={label}
      style={[styles.chip, active ? styles.chipActive : null]}
    >
      <PerfectText
        size={13}
        lines={1}
        fontWeight="700"
        style={active ? styles.chipTextActive : styles.chipText}
      >
        {label}
      </PerfectText>
    </PlatformTouchable>
  );
};

const MapModalScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute<MapModalScreenRouteProp>();
  const locations = route.params?.locations;
  const { t } = useTranslation();

  const colors = useThemeColors();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const [locationModalVisible, setLocationModalVisible] = useState(false);
  const [selectedLocationData, setSelectedLocationData] =
    useState<MapModalData | null>(null);
  const [selectedYear, setSelectedYear] = useState<number | null>(null);

  // Anni presenti nei dati (mostriamo il filtro solo se >1).
  const years = useMemo(() => {
    const set = new Set<number>();
    (locations ?? []).forEach(l => {
      const y = YEAR_BY_ID.get(l.id);
      if (y !== undefined) set.add(y);
    });
    return Array.from(set).sort((a, b) => b - a);
  }, [locations]);

  const filteredLocations = useMemo(() => {
    if (selectedYear === null) return locations ?? [];
    return (locations ?? []).filter(l => YEAR_BY_ID.get(l.id) === selectedYear);
  }, [locations, selectedYear]);

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
    return (
      <PerfectContainer style={styles.container}>
        <PerfectText size={16} lines={1} fontWeight="400">
          {t('impact.loadingMap')}
        </PerfectText>
      </PerfectContainer>
    );
  }

  return (
    <PerfectContainer style={styles.container}>
      <InteractiveMap
        locations={filteredLocations}
        onMarkerPress={handleMarkerPress}
        isFullScreen
      />

      {/* Header */}
      <PerfectContainer style={styles.header}>
        <PerfectText size={24} lines={1} fontWeight="700" style={styles.title}>
          {t('impact.interactiveMap')}
        </PerfectText>
        <PerfectText
          size={16}
          lines={1}
          fontWeight="400"
          style={styles.subtitle}
        >
          {t('impact.tapPins')}
        </PerfectText>

        <PlatformTouchable
          style={styles.closeButton}
          onPress={handleClosePress}
          activeOpacity={0.8}
          accessibilityRole="button"
          accessibilityLabel={t('impact.closeMap')}
        >
          <PerfectIcon name="close" size={24} color={colors.neutral[0]} />
        </PlatformTouchable>
      </PerfectContainer>

      {/* Filtro per anno (solo se ci sono più anni) */}
      {years.length > 1 ? (
        <View style={styles.filterRow}>
          <YearChip
            label={t('impact.allYears')}
            value={null}
            active={selectedYear === null}
            onSelect={setSelectedYear}
          />
          {years.map(y => (
            <YearChip
              key={y}
              label={`${y}`}
              value={y}
              active={selectedYear === y}
              onSelect={setSelectedYear}
            />
          ))}
        </View>
      ) : null}

      {/* Modal della location selezionata */}
      <MapLocationModal
        visible={locationModalVisible}
        data={selectedLocationData}
        onClose={handleLocationModalClose}
      />
    </PerfectContainer>
  );
};

const createChipStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    chip: {
      backgroundColor: colors.neutral[0],
      borderRadius: BorderRadius.full,
      paddingHorizontal: PerfectSpacing.base,
      paddingVertical: PerfectSpacing.xs,
      borderWidth: scale(1),
      borderColor: colors.neutral[200],
    },
    chipActive: {
      backgroundColor: colors.primary[500],
      borderColor: colors.primary[500],
    },
    chipText: {
      color: colors.neutral[700],
    },
    chipTextActive: {
      color: colors.accent.white,
    },
  });

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
      borderRadius: 22,
      justifyContent: 'center',
      alignItems: 'center',
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
    filterRow: {
      position: 'absolute',
      top: PerfectSpacing['3xl'] + scaleSpacing(56),
      left: scaleSpacing(20),
      right: scaleSpacing(20),
      flexDirection: 'row',
      flexWrap: 'wrap',
      alignItems: 'center',
      gap: PerfectSpacing.sm,
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
