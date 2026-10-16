import React from 'react';
import { render } from '@testing-library/react-native';
import { ActivityIndicator } from 'react-native';
import { OTAUpdateScreen } from '@/shared/OTAUpdateScreen';
import { ThemeProvider } from '@/shared/hooks/useTheme';
import i18n from '@/locales';

describe('Progresso OTA', () => {
  it.each([undefined, 0, -1, Number.NaN, Number.POSITIVE_INFINITY, 0.1])(
    'mostra un indicatore indeterminato con progresso %s',
    progress => {
      const screen = render(
        <ThemeProvider>
          <OTAUpdateScreen
            isChecking={false}
            isDownloading
            {...(progress === undefined ? {} : { progress })}
          />
        </ThemeProvider>
      );
      expect(screen.queryByText('0%')).toBeNull();
      expect(
        screen.UNSAFE_getByType(ActivityIndicator).props.animating
      ).not.toBe(false);
      expect(screen.getByRole('progressbar').props.accessibilityValue).toEqual({
        text: i18n.t('updates.downloading'),
      });
    }
  );

  it.each(['it', 'en'])('usa le traduzioni condivise in %s', locale => {
    const previousLocale = i18n.locale;
    i18n.locale = locale;
    try {
      const screen = render(
        <ThemeProvider>
          <OTAUpdateScreen isChecking={false} isDownloading progress={42} />
        </ThemeProvider>
      );
      expect(screen.getByText(i18n.t('updates.message'))).toBeTruthy();
      expect(screen.getByText('42%')).toBeTruthy();
      expect(screen.getByRole('progressbar').props.accessibilityLabel).toBe(
        i18n.t('updates.progressLabel')
      );
      expect(screen.queryByText(/missing .*translation/i)).toBeNull();
    } finally {
      i18n.locale = previousLocale;
    }
  });
});
