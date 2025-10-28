/* eslint-disable max-lines-per-function */
import React from 'react';
import { render } from '@testing-library/react-native';

import { ModernCTA } from '../../../components/ModernCTARefactored';
import { ThemeProvider } from '../../../shared/hooks/useTheme';

describe('ModernCTA (standard variant)', () => {
  it('renders primary variant with content', () => {
    const { toJSON, getByText } = render(
      <ThemeProvider>
        <ModernCTA
          title="Dona ora"
          subtitle="Ogni contributo conta"
          description="Aiutaci a distribuire pasti"
          variant="primary"
          size="standard"
          onPress={() => {}}
        />
      </ThemeProvider>
    );

    expect(getByText('Dona ora')).toBeTruthy();
    expect(getByText('Ogni contributo conta')).toBeTruthy();
    expect(toJSON()).toMatchSnapshot();
  });

  it('respects disabled state and accessibility label', () => {
    const { getByLabelText } = render(
      <ThemeProvider>
        <ModernCTA
          title="Iscriviti"
          description="Partecipa alla campagna"
          variant="primary"
          size="standard"
          disabled
          accessibilityLabel="Call to action iscriviti"
          onPress={() => {}}
        />
      </ThemeProvider>
    );

    expect(getByLabelText('Call to action iscriviti')).toBeTruthy();
  });
});
