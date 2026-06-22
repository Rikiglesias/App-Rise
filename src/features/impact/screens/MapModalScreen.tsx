import React, { useCallback, useMemo, useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import type { BottomSheetModal } from '@gorhom/bottom-sheet';

import { getModalData } from '../data/mapModalData';
import type { MapModalData } from '../data/mapModalData';
import { ContinentChip, YearChip } from '../components/MapFilterChips';
import {
  PerfectIcon,
  PerfectText,
  PerfectContainer,
  PlatformTouchable,
  PlatformScrollView,
} from '@/components/ui';

import InteractiveMap from '@/components/layout/InteractiveMap';
import type { Continent, Location } from '@/shared/types/location';
import MapLocationSheet from '@/components/layout/MapLocationSheet';
import type { ImpactStackParamList } from '@/navigation/types';
import { BorderRadius, PerfectSpacing } from '@/shared/constants';
import { scaleTouch, scaleSpacing } from '@/shared/constants/perfectScale';
import { useThemeColors } from '@/shared/hooks/useThemeColors';
import { useTranslation } from '@/shared/hooks/useTranslation';
import type { ThemeColors } from '@/shared/theme/adaptiveColors';

type MapModalScreenRouteProp = RouteProp<ImpactStackParamList, 'MapModal'>;

// Ordine di presentazione dei continenti (i pasti = Africa per primo, è la missione).
const CONTINENT_ORDER: Continent[] = ['Africa', 'Europa', 'Asia', 'America'];

const MapModalScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute<MapModalScreenRouteProp>();
  const locations = route.params?.locations;
  const { t } = useTranslation();

  const colors = useThemeColors();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const sheetRef = useRef<BottomSheetModal>(null);
  const [selectedLocationData, setSelectedLocationData] =
    useState<MapModalData | null>(null);
  const [activeContinent, setActiveContinent] = useState<Continent | null>(
    null
  );
  const [selectedYear, setSelectedYear] = useState<number | null>(null);

  // Continenti disponibili nei dati, nell'ordine di presentazione.
  const continents = useMemo(() => {
    const present = new Set<Continent>();
    (locations ?? []).forEach(l => {
      if (l.continent) present.add(l.continent);
    });
    return CONTINENT_ORDER.filter(c => present.has(c));
  }, [locations]);

  // Default = continente con più destinazioni (tie-break: ordine di presentazione).
  const defaultContinent = useMemo<Continent | undefined>(() => {
    const counts = new Map<Continent, number>();
    (locations ?? []).forEach(l => {
      if (l.continent)
        counts.set(l.continent, (counts.get(l.continent) ?? 0) + 1);
    });
    let best: Continent | undefined;
    let bestN = -1;
    for (const c of continents) {
      const n = counts.get(c) ?? 0;
      if (n > bestN) {
        best = c;
        bestN = n;
      }
    }
    return best;
  }, [locations, continents]);

  const continent = activeContinent ?? defaultContinent ?? null;

  const continentLocations = useMemo(
    () => (locations ?? []).filter(l => l.continent === continent),
    [locations, continent]
  );

  // Anni presenti nel continente attivo (filtro mostrato solo se >1).
  const years = useMemo(() => {
    const set = new Set<number>();
    continentLocations.forEach(l => {
      if (l.year !== undefined) set.add(l.year);
    });
    return Array.from(set).sort((a, b) => b - a);
  }, [continentLocations]);

  const filteredLocations = useMemo(() => {
    if (selectedYear === null) return continentLocations;
    return continentLocations.filter(l => l.year === selectedYear);
  }, [continentLocations, selectedYear]);

  // Cambio continente → reset del filtro anno (gli anni dipendono dal continente).
  const handleSelectContinent = useCallback((next: Continent) => {
    setActiveContinent(next);
    setSelectedYear(null);
  }, []);

  const handleMarkerPress = useCallback((location: Location) => {
    const modalData = getModalData(location.id);
    if (modalData) {
      setSelectedLocationData(modalData);
      sheetRef.current?.present();
    }
  }, []);

  // X in header → chiude il sheet; l'onDismiss di @gorhom azzera poi la selezione.
  const handleSheetClose = useCallback(() => {
    sheetRef.current?.dismiss();
  }, []);

  const handleSheetDismiss = useCallback(() => {
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
        <PerfectText size={24} lines={1} fontWeight="800" style={styles.title}>
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

      {/* Navigazione per continente */}
      {continents.length > 1 ? (
        <View style={styles.continentRow}>
          <PlatformScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.continentRowContent}
            accessibilityLabel="Continenti"
          >
            {continents.map(c => (
              <ContinentChip
                key={c}
                continent={c}
                active={c === continent}
                onSelect={handleSelectContinent}
              />
            ))}
          </PlatformScrollView>
        </View>
      ) : null}

      {/* Filtro per anno (solo se il continente ha più anni) */}
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

      {/* Bottom-sheet dettaglio della destinazione selezionata */}
      <MapLocationSheet
        ref={sheetRef}
        data={selectedLocationData}
        onClose={handleSheetClose}
        onDismiss={handleSheetDismiss}
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
    continentRow: {
      position: 'absolute',
      top: PerfectSpacing['3xl'] + scaleSpacing(60),
      left: 0,
      right: 0,
    },
    continentRowContent: {
      paddingHorizontal: scaleSpacing(20),
      gap: PerfectSpacing.sm,
    },
    filterRow: {
      position: 'absolute',
      top: PerfectSpacing['3xl'] + scaleSpacing(112),
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
