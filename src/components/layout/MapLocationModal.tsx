import { LinearGradient } from 'expo-linear-gradient';
import React, { useCallback, useMemo } from 'react';
import { View } from 'react-native';
import {
  PerfectIcon,
  PlatformTouchable,
  PerfectText,
  PerfectContainer,
  PerfectModal,
  PlatformScrollView,
} from '../ui';

import { createStyles } from './MapLocationModalStyles';
import { formatStat } from '@/shared/utils/numberFormat';
import { useLinkHandler } from '@/shared/hooks/useLinkHandler';
import { useThemeColors } from '@/shared/hooks/useThemeColors';
import type { MapModalData } from '@/features/impact/data/mapModalData';

interface MapLocationModalProps {
  visible: boolean;
  data: MapModalData | null;
  onClose: () => void;
}

interface StatCell {
  value: number;
  label: string;
}

const gradientStart = { x: 0, y: 0 };
const gradientEnd = { x: 1, y: 1 };

const MapLocationModal: React.FC<MapLocationModalProps> = ({
  visible,
  data,
  onClose,
}) => {
  const colors = useThemeColors();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const trackingUrl = data?.trackingUrl;
  const { openLink } = useLinkHandler();

  // openLink applica allowlist domini, retry e Alert d'errore (prima il link
  // usciva diretto, saltando l'allowlist di produzione).
  const handleCTAPress = useCallback(() => {
    if (!trackingUrl) return;
    void openLink(
      trackingUrl,
      'map-tracking',
      'Impossibile aprire il link di tracciamento. Riprova più tardi.'
    );
  }, [trackingUrl, openLink]);

  if (!data) return null;

  // Solo le metriche con label sempre corretta: `beneficiaries` ha semantica
  // divergente tra location (persone/volontari/paesi) → resta negli achievement,
  // dove è già contestualizzato. Fix semantica = follow-up sul modello dati.
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

  return (
    <PerfectModal visible={visible} onRequestClose={onClose} size="large">
      <PerfectContainer style={styles.modalContainer}>
        <LinearGradient
          colors={[colors.primary[500], colors.primary[600]]}
          start={gradientStart}
          end={gradientEnd}
          style={styles.header}
        >
          <PerfectContainer style={styles.headerContent}>
            <PerfectContainer style={styles.headerLeft}>
              <PerfectText size={32} lines={1} style={styles.flag}>
                {data.flag}
              </PerfectText>
              <PerfectContainer style={styles.headerTextContainer}>
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
              </PerfectContainer>
            </PerfectContainer>

            <PlatformTouchable
              style={styles.closeButton}
              onPress={onClose}
              activeOpacity={0.8}
              accessibilityRole="button"
              accessibilityLabel="Chiudi"
            >
              <PerfectIcon name="close" size={24} color={colors.accent.white} />
            </PlatformTouchable>
          </PerfectContainer>

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

        <PlatformScrollView
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

          <PerfectText size={16} lines={8} style={styles.description}>
            {data.description}
          </PerfectText>

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
                  <PerfectText
                    size={14}
                    lines={3}
                    style={styles.achievementText}
                  >
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
        </PlatformScrollView>
      </PerfectContainer>
    </PerfectModal>
  );
};

export default MapLocationModal;
