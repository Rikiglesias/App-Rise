import { LinearGradient } from 'expo-linear-gradient';
import React, { useCallback, useMemo } from 'react';
import { View, Linking } from 'react-native';
import { BottomSheetScrollView } from '@gorhom/bottom-sheet';

import { PerfectIcon, PlatformTouchable, PerfectText } from '../ui';
import { logError } from '../../shared/utils/logger';
import { createStyles } from './MapLocationSheetStyles';
import { formatStat } from '@/shared/utils/numberFormat';
import { useThemeColors } from '@/shared/hooks/useThemeColors';
import type { MapModalData } from '@/features/impact/data/mapModalData';
import type { OriginTrace } from '@/shared/types/location';

interface StatCell {
  value: number;
  label: string;
}

const gradientStart = { x: 0, y: 0 };
const gradientEnd = { x: 1, y: 1 };

// Icona + didascalia del trasporto verso la destinazione (catena RAH Italia).
const TRANSPORT_INFO: Record<
  OriginTrace['transport'],
  { icon: string; label: string }
> = {
  sea: { icon: 'ferry', label: 'Via container marittimo' },
  truck: { icon: 'truck-delivery', label: 'Via camion (Moldavia/Slovacchia)' },
  local: { icon: 'hand-heart', label: 'Distribuzione locale alle famiglie' },
};

interface MapLocationSheetContentProps {
  data: MapModalData;
  onClose: () => void;
}

/**
 * Contenuto del bottom-sheet di dettaglio destinazione: header gradient brand (fisso)
 * + scroll (stat, provenienza, TRACCIABILITÀ origine→hub→arrivo, programma, partner,
 * risultati, CTA). Estratto da MapLocationSheet per restare sotto soglia (SRP).
 */
const MapLocationSheetContent: React.FC<MapLocationSheetContentProps> = ({
  data,
  onClose,
}) => {
  const colors = useThemeColors();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const trackingUrl = data.trackingUrl;
  const handleCTAPress = useCallback(() => {
    if (!trackingUrl) return;
    Linking.openURL(trackingUrl).catch(error => {
      logError(
        'Impossibile aprire il link di tracciamento',
        error instanceof Error ? error.message : String(error)
      );
    });
  }, [trackingUrl]);

  // Solo le metriche con label sempre corretta: `beneficiaries` ha semantica
  // divergente tra destinazioni (persone/volontari/paesi) → resta negli achievement.
  const statCells: StatCell[] = [
    data.stats.meals !== undefined
      ? { value: data.stats.meals, label: 'Pasti' }
      : null,
    data.stats.kits !== undefined
      ? { value: data.stats.kits, label: 'Kit' }
      : null,
    data.stats.schools !== undefined
      ? { value: data.stats.schools, label: 'Scuole' }
      : null,
  ].filter((c): c is StatCell => c !== null);

  const transport = TRANSPORT_INFO[data.trace.transport];

  return (
    <>
      <LinearGradient
        colors={[colors.primary[500], colors.primary[600]]}
        start={gradientStart}
        end={gradientEnd}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <View style={styles.headerLeft}>
            <PerfectText size={32} lines={1} style={styles.flag}>
              {data.flag}
            </PerfectText>
            <View style={styles.headerTextContainer}>
              <PerfectText
                size={20}
                lines={1}
                fontWeight="800"
                style={styles.title}
              >
                {data.title}
              </PerfectText>
              <PerfectText size={14} lines={1} style={styles.subtitle}>
                {data.subtitle}
              </PerfectText>
            </View>
          </View>

          <PlatformTouchable
            style={styles.closeButton}
            onPress={onClose}
            activeOpacity={0.8}
            accessibilityRole="button"
            accessibilityLabel="Chiudi"
          >
            <PerfectIcon name="close" size={24} color={colors.accent.white} />
          </PlatformTouchable>
        </View>

        <View style={styles.yearBadge}>
          <PerfectText
            size={12}
            lines={1}
            fontWeight="700"
            style={styles.yearText}
          >
            {`${data.year}`}
          </PerfectText>
        </View>
      </LinearGradient>

      <BottomSheetScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {statCells.length > 0 ? (
          <View style={styles.statGrid}>
            {statCells.map(s => (
              <View key={s.label} style={styles.statCell}>
                <PerfectText
                  size={22}
                  lines={1}
                  fontWeight="900"
                  style={styles.statValue}
                >
                  {formatStat(s.value)}
                </PerfectText>
                <PerfectText
                  size={13}
                  lines={1}
                  fontWeight="600"
                  style={styles.statLabel}
                >
                  {s.label}
                </PerfectText>
              </View>
            ))}
          </View>
        ) : null}

        {data.statsNote ? (
          <PerfectText size={12} lines={4} style={styles.statsNote}>
            {data.statsNote}
          </PerfectText>
        ) : null}

        <PerfectText size={16} lines={8} style={styles.description}>
          {data.description}
        </PerfectText>

        {/* Tracciabilità: eventi di origine → hub Bologna → destinazione */}
        <View style={styles.traceSection}>
          <View style={styles.traceHeader}>
            <PerfectIcon
              name="map-marker-path"
              size={18}
              color={colors.primary[500]}
              style={styles.traceHeaderIcon}
            />
            <PerfectText
              size={12}
              lines={1}
              fontWeight="700"
              style={styles.infoLabel}
            >
              TRACCIABILITÀ
            </PerfectText>
          </View>

          <View style={styles.traceStep}>
            <View style={styles.traceStepIcon}>
              <PerfectIcon
                name="map-marker-multiple"
                size={20}
                color={colors.neutral[600]}
              />
            </View>
            <PerfectText size={14} lines={2} style={styles.traceStepText}>
              {data.trace.origins.join(', ')}
            </PerfectText>
          </View>

          <View style={styles.traceConnector} />

          <View style={styles.traceStep}>
            <View style={styles.traceStepIcon}>
              <PerfectIcon
                name="warehouse"
                size={20}
                color={colors.primary[500]}
              />
            </View>
            <PerfectText
              size={14}
              lines={1}
              fontWeight="600"
              style={styles.traceStepText}
            >
              {`Hub ${data.trace.hub}`}
            </PerfectText>
          </View>

          <View style={styles.traceConnector} />

          <View style={styles.traceStep}>
            <View style={styles.traceStepIcon}>
              <PerfectIcon
                name={transport.icon}
                size={20}
                color={colors.primary[500]}
              />
            </View>
            <View style={styles.infoTextWrap}>
              <PerfectText
                size={14}
                lines={1}
                fontWeight="700"
                style={styles.traceStepText}
              >
                {data.title}
              </PerfectText>
              <PerfectText size={12} lines={2} style={styles.traceStepCaption}>
                {transport.label}
              </PerfectText>
            </View>
          </View>
        </View>

        <View style={styles.infoRow}>
          <PerfectIcon
            name="hand-heart"
            size={20}
            color={colors.primary[500]}
            style={styles.infoIcon}
          />
          <View style={styles.infoTextWrap}>
            <PerfectText
              size={12}
              lines={1}
              fontWeight="700"
              style={styles.infoLabel}
            >
              PROGRAMMA
            </PerfectText>
            <PerfectText
              size={15}
              lines={2}
              fontWeight="600"
              style={styles.infoValue}
            >
              {data.program}
            </PerfectText>
          </View>
        </View>

        {data.partner ? (
          <View style={styles.infoRow}>
            <PerfectIcon
              name="account-group"
              size={20}
              color={colors.primary[500]}
              style={styles.infoIcon}
            />
            <View style={styles.infoTextWrap}>
              <PerfectText
                size={12}
                lines={1}
                fontWeight="700"
                style={styles.infoLabel}
              >
                PARTNER
              </PerfectText>
              <PerfectText
                size={15}
                lines={2}
                fontWeight="600"
                style={styles.infoValue}
              >
                {data.partner}
              </PerfectText>
            </View>
          </View>
        ) : null}

        {data.achievements.length > 0 ? (
          <View style={styles.achievements}>
            <PerfectText
              size={12}
              lines={1}
              fontWeight="700"
              style={styles.infoLabel}
            >
              RISULTATI
            </PerfectText>
            {data.achievements.map(a => (
              <View key={a} style={styles.achievementRow}>
                <PerfectIcon
                  name="check-circle"
                  size={18}
                  color={colors.semantic.success.main}
                  style={styles.achievementIcon}
                />
                <PerfectText size={14} lines={3} style={styles.achievementText}>
                  {a}
                </PerfectText>
              </View>
            ))}
          </View>
        ) : null}

        {trackingUrl ? (
          <PlatformTouchable
            style={styles.ctaButton}
            activeOpacity={0.8}
            onPress={handleCTAPress}
            accessibilityRole="link"
            accessibilityLabel={`Apri il tracciamento di ${data.title}`}
          >
            <PerfectIcon
              name="open-in-new"
              size={20}
              color={colors.accent.white}
              style={styles.ctaIcon}
            />
            <PerfectText
              size={16}
              lines={1}
              fontWeight="700"
              style={styles.ctaText}
            >
              Segui il tracciamento
            </PerfectText>
          </PlatformTouchable>
        ) : null}
      </BottomSheetScrollView>
    </>
  );
};

export default MapLocationSheetContent;
