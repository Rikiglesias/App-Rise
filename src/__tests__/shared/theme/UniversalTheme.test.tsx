// @ts-nocheck
/* eslint-disable max-lines-per-function */
import React from 'react';
import {
  render,
  screen,
  fireEvent,
  waitFor,
} from '@testing-library/react-native';
import { Text, Appearance } from 'react-native';
import {
  UniversalThemeProvider,
  useUniversalTheme,
} from '../../../shared/theme/UniversalTheme';

beforeEach(() => {
  jest.spyOn(Appearance, 'getColorScheme').mockReturnValue('light');
  // @ts-expect-error - RN types vary by version
  jest
    .spyOn(Appearance, 'addChangeListener')
    .mockReturnValue({ remove: jest.fn() });
});

const Probe = () => {
  const { isDark, themeMode, toggleTheme, setTheme, colors } =
    useUniversalTheme();
  return (
    <>
      <Text testID="theme">{`${themeMode}-${isDark ? 'dark' : 'light'}`}</Text>
      <Text testID="textColor">{colors.text}</Text>
      <Text testID="btn" onPress={toggleTheme}>
        toggle
      </Text>
      <Text testID="setDark" onPress={() => setTheme('dark')}>
        setDark
      </Text>
    </>
  );
};

describe('UniversalTheme', () => {
  it('throws if hook used outside provider', () => {
    const OrigError = console.error;
    console.error = jest.fn();
    // @ts-expect-error – we intentionally misuse the hook to assert the throw
    const Broken = () => useUniversalTheme();
    expect(() => render(<Broken />)).toThrow(
      'useUniversalTheme must be used within UniversalThemeProvider'
    );
    console.error = OrigError;
  });

  it('respects initialTheme when followSystem=false', () => {
    render(
      <UniversalThemeProvider initialTheme="light" followSystem={false}>
        <Probe />
      </UniversalThemeProvider>
    );

    expect(screen.getByTestId('theme').children.join('')).toBe('light-light');
  });

  it('uses system theme when initialTheme=system and followSystem=true', () => {
    (Appearance.getColorScheme as jest.Mock).mockReturnValue('dark');
    render(
      <UniversalThemeProvider initialTheme="system" followSystem>
        <Probe />
      </UniversalThemeProvider>
    );

    // mocked Appearance returns 'dark'
    expect(screen.getByTestId('theme').children.join('')).toBe('system-dark');
  });

  it('toggleTheme cycles light -> dark -> system', async () => {
    render(
      <UniversalThemeProvider initialTheme="light" followSystem={false}>
        <Probe />
      </UniversalThemeProvider>
    );

    const btn = screen.getByTestId('btn');
    // light
    expect(screen.getByTestId('theme').children.join('')).toBe('light-light');
    // light -> dark
    fireEvent.press(btn);
    await waitFor(() =>
      expect(screen.getByTestId('theme').children.join('')).toBe('dark-dark')
    );
    // dark -> system
    fireEvent.press(btn);
    await waitFor(() =>
      expect(screen.getByTestId('theme').children.join('')).toBe('system-light')
    );
  });

});
// @ts-nocheck
