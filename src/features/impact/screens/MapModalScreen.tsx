import React, { useCallback, useContext, useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { BottomTabBarHeightContext } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { getModalData } from '../data/mapModalData';
import { LOCATIONS_DATA } from '../data/locationsData';
import { convertToMapLocations } from '../utils/mapHelpers';
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
import { minimumTouchTarget } from '@/shared/utils/minimumTouchTarget';

type MapModalScreenRouteProp = RouteProp<ImpactStackParamList, 'MapModal'>;

// L'anno vive in LOCATIONS_DATA; le location della mappa condividono lo stesso id.
const YEAR_BY_ID = new Map<string, number>(
  LOCATIONS_DATA.map(l => [l.id, l.anno])
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
  const { t, locale } = useTranslation();
  // La rotta porta i nomi nella lingua del momento in cui la mappa è stata aperta: si
  // ritraducono per id, così un cambio di lingua al ritorno in primo piano (C46) vale anche qui.
  const routeLocations = route.params?.locations;
  const locations = useMemo(() => {
    if (!routeLocations) return undefined;
    const translated = new Map(
      convertToMapLocations(locale).map(l => [l.id, l])
    );
    return routeLocations.map(l => translated.get(l.id) ?? l);
  }, [routeLocations, locale]);
  // Lo spazio della barra solo dove la barra c'è (C45): fuori dalle schede il
  // contesto manca e vale 0, dove `useBottomTabBarHeight` lancerebbe.
  const tabBarHeight = useContext(BottomTabBarHeightContext) ?? 0;
  const insets = useSafeAreaInsets();
  const safeContentStyle = {
    paddingBottom: Math.max(tabBarHeight, insets.bottom),
    paddingLeft: insets.left,
    paddingRight: insets.right,
  };

  const colors = useThemeColors();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const [locationModalVisible, setLocationModalVisible] = useState(false);
  // Si tiene l'id della località scelta, non i suoi testi: la scheda segue la lingua.
  const [selectedLocationId, setSelectedLocationId] = useState<string | null>(
    null
  );
  const selectedLocationData = useMemo(
    () =>
      selectedLocationId ? getModalData(selectedLocationId, locale) : null,
    [selectedLocationId, locale]
  );
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
    if (getModalData(location.id)) {
      setSelectedLocationId(location.id);
      setLocationModalVisible(true);
    }
  }, []);

  const handleLocationModalClose = useCallback(() => {
    setLocationModalVisible(false);
    setSelectedLocationId(null);
  }, []);

  const handleClosePress = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  if (!locations) {
    return (
      <PerfectContainer style={[styles.container, safeContentStyle]}>
        <PerfectText size={16} lines={1} fontWeight="400">
          {t('impact.loadingMap')}
        </PerfectText>
      </PerfectContainer>
    );
  }

  return (
    <PerfectContainer
      style={[styles.container, safeContentStyle]}
      testID="map-safe-content"
    >
      <InteractiveMap
        locations={filteredLocations}
        onMarkerPress={handleMarkerPress}
        isFullScreen
      />

      {/* Intestazione e filtro in una colonna: il filtro segue l'altezza vera dei testi (C56) */}
      <View
        style={[
          styles.overlay,
          {
            top: insets.top + PerfectSpacing['3xl'],
            left: insets.left + scaleSpacing(20),
            right: insets.right + scaleSpacing(20),
          },
        ]}
      >
        <View style={styles.header}>
          <View style={styles.headerText}>
            <PerfectText
              size={24}
              lines={2}
              containerWidth={0}
              fontWeight="700"
              style={styles.title}
            >
              {t('impact.interactiveMap')}
            </PerfectText>
            <PerfectText
              size={16}
              lines={3}
              containerWidth={0}
              fontWeight="400"
              style={styles.subtitle}
            >
              {t('impact.tapCountries')}
            </PerfectText>
          </View>

          <PlatformTouchable
            style={styles.closeButton}
            onPress={handleClosePress}
            activeOpacity={0.8}
            accessibilityRole="button"
            accessibilityLabel={t('impact.closeMap')}
          >
            <PerfectIcon name="close" size={24} color={colors.neutral[900]} />
          </PlatformTouchable>
        </View>

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
      </View>

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
    // Il tondo segue l'area minima di C43: mai sotto 48 dp, senza hitSlop.
    closeButton: {
      backgroundColor: colors.neutral[0],
      ...minimumTouchTarget(scaleTouch(44)),
      borderRadius: BorderRadius.full,
      justifyContent: 'center',
      alignItems: 'center',
    },
    overlay: {
      position: 'absolute',
      gap: PerfectSpacing.sm,
    },
    header: {
      backgroundColor: `${colors.neutral[0]}99`,
      paddingVertical: PerfectSpacing.sm,
      paddingHorizontal: PerfectSpacing.base,
      borderRadius: BorderRadius.lg,
      flexDirection: 'row',
      alignItems: 'center',
      gap: PerfectSpacing.sm,
    },
    headerText: {
      flex: 1,
      flexShrink: 1,
    },
    filterRow: {
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
