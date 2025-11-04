import React from 'react';
import { fireEvent, render } from '@testing-library/react-native';

import type { ReactElement } from 'react';

import { ChiSiamoSection } from '@/features/about/components/ChiSiamoSection';
import { AnimatedContact } from '@/features/about/components/AnimatedContact';
import type { ContactData } from '@/features/about/types';
import { UniversalThemeProvider } from '@/shared/theme/UniversalTheme';

jest.mock('expo-haptics', () => ({
  ImpactFeedbackStyle: {
    Light: 'light',
    Medium: 'medium',
    Heavy: 'heavy',
  },
  NotificationFeedbackType: {
    Success: 'success',
    Warning: 'warning',
    Error: 'error',
  },
  impactAsync: jest.fn().mockResolvedValue(undefined),
  notificationAsync: jest.fn().mockResolvedValue(undefined),
  selectionAsync: jest.fn().mockResolvedValue(undefined),
}));

jest.mock('@expo/vector-icons/MaterialCommunityIcons', () => {
  const React = require('react');
  return ({ name, ...props }: { name: string }) =>
    React.createElement('Icon', { ...props, name });
});

describe('ChiSiamoSection', () => {
  it('calls onInfoPress when header button is pressed', () => {
    const onInfoPress = jest.fn();
    const { getByLabelText } = renderWithTheme(
      <ChiSiamoSection onInfoPress={onInfoPress} />
    );

    const headerButton = getByLabelText("Mostra la storia dell'organizzazione");
    fireEvent.press(headerButton);

    expect(onInfoPress).toHaveBeenCalledTimes(1);
  });

  it('calls onInfoPress when info icon is pressed', () => {
    const onInfoPress = jest.fn();
    const { getByLabelText } = renderWithTheme(
      <ChiSiamoSection onInfoPress={onInfoPress} />
    );

    const infoButton = getByLabelText('Apri informazioni su Chi Siamo');
    fireEvent.press(infoButton);

    expect(onInfoPress).toHaveBeenCalledTimes(1);
  });
});

describe('AnimatedContact', () => {
  it('triggers contact action on press', () => {
    const onPress = jest.fn();
    const contact: ContactData = {
      id: 'test-contact',
      title: 'Sede',
      subtitle: 'Via dei Fornaciai, 17',
      icon: 'map-marker',
      onPress,
    };

    const { getByLabelText } = renderWithTheme(
      <AnimatedContact contact={contact} />
    );

    const button = getByLabelText('Apri Sede');
    fireEvent.press(button);

    expect(onPress).toHaveBeenCalledTimes(1);
  });
});
const renderWithTheme = (ui: ReactElement) =>
  render(
    <UniversalThemeProvider initialTheme="light" followSystem={false}>
      {ui}
    </UniversalThemeProvider>
  );
