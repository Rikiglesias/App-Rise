import React from 'react';

import { AuthButton } from './AuthButton';
import { useTranslation } from '@/shared/hooks/useTranslation';

/** Azione esplicita dopo un errore di rete, senza perdere il modulo corrente. */
export const AuthRetry: React.FC<{
  visible: boolean;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
}> = ({ visible, onPress, loading = false, disabled = false }) => {
  const { t } = useTranslation();
  return visible ? (
    <AuthButton
      label={t('common.retry')}
      onPress={onPress}
      variant="link"
      disabled={loading || disabled}
    />
  ) : null;
};
