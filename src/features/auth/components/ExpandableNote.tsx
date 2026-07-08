import React, { useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { PerfectText, PlatformTouchable, PerfectIcon } from '@/components/ui';
import { PerfectSpacing } from '@/shared/constants';
import { scale } from '@/shared/constants/perfectScale';
import { useThemeColors } from '@/shared/hooks/useThemeColors';
import type { ThemeColors } from '@/shared/theme/adaptiveColors';

interface ExpandableNoteProps {
  /** Domanda-intestazione sempre visibile, tappabile per aprire/chiudere. */
  question: string;
  children: React.ReactNode;
  defaultExpanded?: boolean;
  /** Hint per screen-reader (es. "Tocca per i dettagli"), come SettingsRow. */
  accessibilityHint?: string;
}

/**
 * Nota a fisarmonica (disclosure): una domanda tappabile che rivela un
 * approfondimento facoltativo. Collassata di default per non appesantire il
 * form — chi vuole capire "perché" tocca ed espande. Nessuna animazione di
 * altezza (render condizionale): sotto New Architecture LayoutAnimation è
 * inaffidabile e non vale il rischio per un dettaglio secondario. La chevron
 * (giù/su) è l'unico affordance: il testo NON è rosso per non confonderlo con
 * un'etichetta-sezione (convenzione AuthSection).
 */
export const ExpandableNote: React.FC<ExpandableNoteProps> = ({
  question,
  children,
  defaultExpanded = false,
  accessibilityHint,
}) => {
  const colors = useThemeColors();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [expanded, setExpanded] = useState(defaultExpanded);

  return (
    <View style={styles.container}>
      <PlatformTouchable
        onPress={() => setExpanded(v => !v)}
        accessibilityRole="button"
        accessibilityLabel={question}
        accessibilityHint={accessibilityHint}
        accessibilityState={{ expanded }}
        activeOpacity={0.6}
      >
        <View style={styles.header}>
          <PerfectText size={14} lines={1} style={styles.question}>
            {question}
          </PerfectText>
          <PerfectIcon
            name={expanded ? 'chevron-up' : 'chevron-down'}
            size={20}
            color={colors.neutral[500]}
          />
        </View>
      </PlatformTouchable>
      {expanded ? <View style={styles.body}>{children}</View> : null}
    </View>
  );
};

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    container: {
      marginBottom: PerfectSpacing.sm,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      // Target tappabile >= 44pt (WCAG 2.5.5 / HIG): la domanda è size 14 su una
      // riga, il padding da solo non basta.
      minHeight: scale(44),
      paddingVertical: PerfectSpacing.xs,
    },
    question: {
      flex: 1,
      color: colors.neutral[700],
      fontWeight: '600',
      marginRight: PerfectSpacing.sm,
    },
    body: {
      marginTop: PerfectSpacing.xs,
    },
  });
