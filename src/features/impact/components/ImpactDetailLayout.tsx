import { useNavigation } from '@react-navigation/native';
import React, { useCallback, useMemo } from 'react';
import { StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import {
  PerfectContainer,
  PerfectIcon,
  PerfectText,
  PlatformScrollView,
  PlatformTouchable,
} from '@/components/ui';
import type { ImpactStackNavigationProp } from '@/navigation/types';
import { PerfectSpacing } from '@/shared/constants';
import { BorderRadius } from '@/shared/constants/designTokens';
import { useDeviceType } from '@/shared/hooks/useDeviceType';
import { useThemeColors } from '@/shared/hooks/useThemeColors';
import { useTranslation } from '@/shared/hooks/useTranslation';
import type { ThemeColors } from '@/shared/theme/adaptiveColors';

export interface ImpactDetailStat {
  readonly key: string;
  /** Numero già formattato, letto da IMPACT_DATA */
  readonly value: string;
  readonly label: string;
  readonly subtitle?: string;
}

interface ImpactDetailLayoutProps {
  readonly title: string;
  /** Paragrafi riassunti dall'Annual Report, senza cifre scritte a mano */
  readonly paragraphs: readonly string[];
  readonly stats: readonly ImpactDetailStat[];
  readonly listTitle?: string;
  readonly list?: readonly string[];
}

/**
 * Pagina di dettaglio del tab Impatto: indietro, titolo, testo dell'Annual Report e numeri.
 * Lo stack di Impatto non mostra l'intestazione, quindi il ritorno sta qui ed è un pulsante
 * da 48 dp con la sua etichetta per il lettore di schermo.
 */
export const ImpactDetailLayout: React.FC<ImpactDetailLayoutProps> = ({
  title,
  paragraphs,
  stats,
  listTitle,
  list,
}) => {
  const navigation = useNavigation<ImpactStackNavigationProp>();
  const { t } = useTranslation();
  const { isTablet } = useDeviceType();
  const colors = useThemeColors();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const goBack = useCallback(() => navigation.goBack(), [navigation]);

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <PlatformTouchable
        onPress={goBack}
        style={styles.back}
        accessibilityRole="button"
        accessibilityLabel={t('common.back')}
      >
        <PerfectIcon name="arrow-left" size={24} color={colors.neutral[900]} />
        <PerfectText size={16} lines={1} immunity={true}>
          {t('common.back')}
        </PerfectText>
      </PlatformTouchable>

      <PlatformScrollView
        contentContainerStyle={[
          styles.content,
          isTablet ? styles.tabletContent : null,
        ]}
      >
        <PerfectText
          size={28}
          lines={2}
          fontWeight="800"
          immunity={true}
          accessibilityRole="header"
          style={styles.title}
        >
          {title}
        </PerfectText>

        {paragraphs.map(paragraph => (
          <PerfectText
            key={paragraph}
            size={16}
            lines={10}
            immunity={true}
            style={styles.paragraph}
          >
            {paragraph}
          </PerfectText>
        ))}

        {stats.map(stat => (
          <PerfectContainer
            key={stat.key}
            style={styles.stat}
            testID="impact-detail-stat"
          >
            <PerfectText
              size={24}
              lines={1}
              fontWeight="900"
              immunity={true}
              color={colors.primary[600]}
            >
              {stat.value}
            </PerfectText>
            <PerfectText size={16} lines={2} fontWeight="700" immunity={true}>
              {stat.label}
            </PerfectText>
            {stat.subtitle ? (
              <PerfectText
                size={14}
                lines={2}
                immunity={true}
                color={colors.neutral[700]}
              >
                {stat.subtitle}
              </PerfectText>
            ) : null}
          </PerfectContainer>
        ))}

        {listTitle && list?.length ? (
          <PerfectContainer style={styles.list}>
            <PerfectText
              size={20}
              lines={2}
              fontWeight="700"
              immunity={true}
              accessibilityRole="header"
            >
              {listTitle}
            </PerfectText>
            {list.map(item => (
              <PerfectText
                key={item}
                size={16}
                lines={2}
                immunity={true}
                style={styles.listItem}
              >
                {`• ${item}`}
              </PerfectText>
            ))}
          </PerfectContainer>
        ) : null}
      </PlatformScrollView>
    </SafeAreaView>
  );
};

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.neutral[0],
    },
    back: {
      minWidth: 48,
      minHeight: 48,
      alignSelf: 'flex-start',
      flexDirection: 'row',
      alignItems: 'center',
      gap: PerfectSpacing.xs,
      marginHorizontal: PerfectSpacing.base,
    },
    content: {
      paddingHorizontal: PerfectSpacing.base,
      paddingBottom: PerfectSpacing.xl,
      gap: PerfectSpacing.base,
    },
    tabletContent: {
      maxWidth: 640,
      alignSelf: 'center',
    },
    title: {
      marginTop: PerfectSpacing.sm,
    },
    paragraph: {
      color: colors.neutral[800],
    },
    stat: {
      backgroundColor: colors.neutral[100],
      borderRadius: BorderRadius.lg,
      padding: PerfectSpacing.base,
      gap: PerfectSpacing.xs,
    },
    list: {
      gap: PerfectSpacing.xs,
    },
    listItem: {
      color: colors.neutral[800],
    },
  });
