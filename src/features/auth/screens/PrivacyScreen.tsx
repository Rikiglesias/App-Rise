import React, { useCallback, useMemo, useRef, useState } from 'react';
import { StyleSheet } from 'react-native';

import { AuthScreen } from '../components/AuthScreen';
import { AuthButton } from '../components/AuthButton';
import { FormError } from '../components/FormError';
import { PerfectText } from '@/components/ui';
import { Colors } from '@/shared/constants/designTokens';
import { PerfectSpacing } from '@/shared/constants';
import { useThemeColors } from '@/shared/hooks/useThemeColors';
import type { ThemeColors } from '@/shared/theme/adaptiveColors';
import { useTranslation } from '@/shared/hooks/useTranslation';
import { useAuth } from '@/shared/auth/AuthContext';
import { useRequireAuth } from '@/shared/auth/useRequireAuth';

/**
 * Sotto-pagina Privacy e dati (dal menu Profilo): esportazione dei dati personali
 * e dei consensi registrati (GDPR Art.20). L'eliminazione account ha una sua voce
 * di menu dedicata (DeleteAccountScreen), qui resta la sola esportazione.
 */
export const PrivacyScreen: React.FC = () => {
  useRequireAuth();
  const colors = useThemeColors();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const { t } = useTranslation();
  const { exportData } = useAuth();

  const exportRef = useRef(false);
  const [exporting, setExporting] = useState(false);
  const [exportError, setExportError] = useState<string | undefined>();

  const handleExport = useCallback((): void => {
    if (exportRef.current) return;
    exportRef.current = true;
    setExportError(undefined);
    setExporting(true);
    void exportData()
      .catch(() => setExportError(t('auth.privacy.exportError')))
      .finally(() => {
        exportRef.current = false;
        setExporting(false);
      });
  }, [exportData, t]);

  return (
    <AuthScreen
      title={t('auth.privacy.title')}
      subtitle={t('auth.privacy.subtitle')}
    >
      <PerfectText size={15} lines={4} containerWidth={0} style={styles.body}>
        {t('auth.privacy.exportBody')}
      </PerfectText>
      <AuthButton
        label={t('auth.privacy.exportCta')}
        onPress={handleExport}
        loading={exporting}
      />
      <FormError message={exportError} size={13} style={styles.error} />
    </AuthScreen>
  );
};

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    body: {
      color: colors.neutral[700],
      marginBottom: PerfectSpacing.lg,
      lineHeight: 22,
    },
    error: {
      color: Colors.semantic.error.main,
      marginTop: PerfectSpacing.xs,
    },
  });
