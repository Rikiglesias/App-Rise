// C48 (contratto android-play): in «Seguici» ogni social apre l'account collegato dal sito ufficiale
// (italy.riseagainsthunger.org, riletto il 22/10) e il nome mostrato è quello dell'indirizzo aperto.
// Gli indirizzi attesi sono scritti qui apposta, non importati da urls.ts: il test controlla i valori veri.
import React from 'react';
import { fireEvent, render, waitFor } from '@testing-library/react-native';
import { Linking } from 'react-native';

import SeguiciScreen from '@/features/social/screens/SeguiciScreen';
import { UniversalThemeProvider } from '@/shared/theme/UniversalTheme';
import { changeLanguage, getCurrentLocale } from '@/locales';

jest.mock('react-native/Libraries/Linking/Linking', () => {
  const linkingMock = { openURL: jest.fn(), canOpenURL: jest.fn() };
  return { __esModule: true, default: linkingMock, ...linkingMock };
});

const navigation = { goBack: jest.fn() } as unknown as React.ComponentProps<
  typeof SeguiciScreen
>['navigation'];

/** Tocca la card del social in «Seguici»: restituisce l'indirizzo aperto e il testo della card. */
const tocca = async (id: string) => {
  const ui = render(
    <UniversalThemeProvider initialTheme="light" followSystem={false}>
      <SeguiciScreen navigation={navigation} />
    </UniversalThemeProvider>
  );
  const card = ui.getByTestId(`social-card-${id}`);
  fireEvent.press(card);
  await waitFor(() => expect(Linking.openURL).toHaveBeenCalledTimes(1));
  return {
    aperto: (Linking.openURL as jest.Mock).mock.calls[0][0] as string,
    etichetta: card.props.accessibilityLabel as string,
    ui,
  };
};

/** «@nome» dall'ultimo pezzo del percorso dell'indirizzo. */
const handleDi = (url: string) =>
  `@${new URL(url).pathname.split('/').filter(Boolean).pop() ?? ''}`;

describe('social coerenti', () => {
  const originalLocale = getCurrentLocale();
  const runtime = globalThis as typeof globalThis & { __DEV__: boolean };
  const originalDev = runtime.__DEV__;

  beforeEach(() => {
    jest.clearAllMocks();
    // Come in produzione: l'indirizzo deve passare anche la lista dei domini ammessi.
    runtime.__DEV__ = false;
    (Linking.openURL as jest.Mock).mockResolvedValue(undefined);
    changeLanguage('it');
  });
  afterEach(() => {
    changeLanguage(originalLocale);
    runtime.__DEV__ = originalDev;
  });

  it('social coerenti: Instagram', async () => {
    const { aperto, etichetta, ui } = await tocca('instagram');
    expect(aperto).toBe('https://www.instagram.com/riseagainsthungeritalia/');
    expect(ui.getByText(handleDi(aperto))).toBeTruthy();
    expect(etichetta).toContain(handleDi(aperto));
  });

  it('social coerenti: Facebook', async () => {
    const { aperto, etichetta, ui } = await tocca('facebook');
    expect(aperto).toBe('https://www.facebook.com/RiseAgainstHungerItalia');
    expect(ui.getByText(handleDi(aperto))).toBeTruthy();
    expect(etichetta).toContain(handleDi(aperto));
  });

  it('social coerenti: YouTube in Seguici', async () => {
    const { aperto, etichetta, ui } = await tocca('youtube');
    expect(aperto).toBe(
      'https://www.youtube.com/@riseagainsthungeritaliaonl3843'
    );
    // Titolo del canale a quell'indirizzo (og:title letto il 22/10).
    expect(ui.getByText('YouTube')).toBeTruthy();
    expect(ui.getByText('Rise Against Hunger Italia ETS')).toBeTruthy();
    expect(etichetta).toContain('Rise Against Hunger Italia ETS');
  });

  it('social coerenti: LinkedIn', async () => {
    const { aperto, ui } = await tocca('linkedin');
    expect(aperto).toBe(
      'https://www.linkedin.com/company/rise-against-hunger-italia/'
    );
    expect(ui.getByText('Rise Against Hunger Italia')).toBeTruthy();
  });
});
