/**
 * F14-ponte (android-play), lotto D. Foto della vc25: la scheda del paese e la Storia finivano sotto la
 * barra di stato e sotto i tre pulsanti (finestre `statusBarTranslucent` che non contavano le barre);
 * in Home l'immagine usciva dal suo riquadro e «⚡ Take Action» copriva gli obiettivi 10 e 17
 * (altezza fissata all'avvio, immagine che segue la finestra di adesso); all'accesso «Welcome» a testo
 * grande diventava «Welco / me» (colonna del 70 % sul titolo). Prova nativa del 7/11: in fondo alla Home,
 * a scala 2 sul Pixel 8, «Discover» diventava «Discove / r» (stessa classe, fuori dalla mappa degli 11).
 */
import React from 'react';
import {
  Animated,
  Dimensions,
  Image,
  PixelRatio,
  StyleSheet,
  Text,
  type TextStyle,
  type ViewStyle,
} from 'react-native';
import { act, cleanup, render } from '@testing-library/react-native';

import { impostaFinestra, ripristinaFinestra } from '../helpers/cambioFinestra';
import { PerfectModal } from '@/components/ui/PerfectModal';
import { StoriaModal } from '@/features/about/components/StoriaModal';
import ChiSiamoScreen from '@/features/about/screens/ChiSiamoScreen';
import { AuthScreen } from '@/features/auth/components/AuthScreen';
import { ActionCTAButtons } from '@/features/home/components/EntraInAzione/ActionCTAButtons';
import { HeaderImageSection } from '@/features/home/components/HomeHeader/HeaderImageSection';
import { useHomeHeaderStyles } from '@/features/home/hooks/useHomeHeaderStyles';
import i18n, { changeLanguage, getCurrentLocale } from '@/locales';
import { UniversalThemeProvider as Tema } from '@/shared/theme/UniversalTheme';

jest.mock('@react-navigation/native', () => ({
  ...jest.requireActual<object>('@react-navigation/native'),
  useNavigation: () => ({
    goBack: jest.fn(),
    canGoBack: () => true,
    navigate: jest.fn(),
  }),
}));

type Nodo = ReturnType<typeof render>['UNSAFE_root'];

const BARRE = { top: 32, bottom: 48, left: 0, right: 0 };
const noop = (): void => undefined;

const conBarreDiSistema = (): void => {
  jest
    .spyOn(
      jest.requireMock<typeof import('react-native-safe-area-context')>(
        'react-native-safe-area-context'
      ),
      'useSafeAreaInsets'
    )
    .mockReturnValue(BARRE);
};

/** Monta e lascia finire gli aggiornamenti asincroni del montaggio (animazioni ridotte, icone). */
const monta = async (
  elemento: React.ReactElement
): Promise<ReturnType<typeof render>> => {
  const ui = render(elemento);
  await act(() => Promise.resolve());
  return ui;
};

const stile = (nodo: Nodo): ViewStyle & TextStyle =>
  StyleSheet.flatten(nodo.props.style) ?? {};

/** La prima vista nativa sopra il nodo: lì sta l'eventuale colonna del testo. */
const vistaSopra = (nodo: Nodo): Nodo | null => {
  let su = nodo.parent;
  while (su && typeof su.type !== 'string') su = su.parent;
  return su;
};

/** La scheda sta nello spazio fra le barre: sfondo che le scavalca e altezza che ci entra. */
const attesaFraLeBarre = (sfondo: Nodo, scheda: Nodo): void => {
  const { height } = Dimensions.get('window');
  const s = stile(sfondo);
  expect({
    sopra: Number(s.paddingTop ?? 0) >= BARRE.top,
    sotto: Number(s.paddingBottom ?? 0) >= BARRE.bottom,
    altezzaNumerica: typeof stile(scheda).maxHeight,
  }).toEqual({ sopra: true, sotto: true, altezzaNumerica: 'number' });
  expect(stile(scheda).maxHeight).toBeLessThanOrEqual(
    height - BARRE.top - BARRE.bottom
  );
};

const ImmagineHome: React.FC = () => {
  const styles = useHomeHeaderStyles();
  const fermo = new Animated.Value(0);
  return (
    <HeaderImageSection
      imageAnim={new Animated.Value(1)}
      imageParallax={fermo}
      imageScale={new Animated.Value(1)}
      gradientOpacity={fermo}
      imageRotation={fermo.interpolate({
        inputRange: [0, 1],
        outputRange: ['0deg', '0deg'],
      })}
      styles={styles}
    />
  );
};

describe('F14-ponte lotto D', () => {
  const lingua = getCurrentLocale();
  beforeEach(() => changeLanguage('it'));
  afterEach(() => {
    cleanup();
    changeLanguage(lingua);
    ripristinaFinestra();
    jest.restoreAllMocks();
  });

  it('6a: la scheda del paese (PerfectModal) sta fra le barre di sistema', async () => {
    conBarreDiSistema();
    const ui = await monta(
      <Tema>
        <PerfectModal visible onRequestClose={noop} size="large">
          <Text>paese</Text>
        </PerfectModal>
      </Tema>
    );
    attesaFraLeBarre(
      ui.getByTestId('perfect-modal-wrapper'),
      ui.getByTestId('perfect-modal-card')
    );
  });

  it('6b: la Storia sta fra le barre anche in orizzontale, mai più alta di prima', async () => {
    conBarreDiSistema();
    impostaFinestra({ width: 800, height: 360 });
    const ui = await monta(
      <Tema>
        <StoriaModal visible onClose={noop} />
      </Tema>
    );
    const contenitore = ui.getByTestId('storia-modal-container');
    attesaFraLeBarre(ui.getByTestId('storia-modal-overlay'), contenitore);
    expect(stile(contenitore).maxHeight).toBeLessThanOrEqual(
      Math.floor(360 * 0.85)
    );
  });

  it('9: il riquadro della Home è alto quanto la sua immagine dopo un cambio di finestra', async () => {
    impostaFinestra({ width: 411, height: 923 });
    const ui = await monta(
      <Tema>
        <ImmagineHome />
      </Tema>
    );
    const riquadro = ui.toJSON() as unknown as { props: { style: unknown } };
    const altezzaRiquadro = StyleSheet.flatten(
      riquadro.props.style as ViewStyle
    ).height;
    const cornice = vistaSopra(ui.UNSAFE_getByType(Image));
    const altezzaImmagine = Number(cornice && stile(cornice).height);
    expect(altezzaImmagine).toBeGreaterThan(0);
    // Senza altezza propria il riquadro prende quella dell'immagine; con una fissa deve coincidere.
    expect(
      altezzaRiquadro === undefined ||
        Math.abs(Number(altezzaRiquadro) - altezzaImmagine) < 1
    ).toBe(true);
  });

  it.each(['it', 'en'] as const)(
    '3: il titolo di una parola (%s) non va in colonna e si restringe invece di spezzarsi',
    async lingua => {
      changeLanguage(lingua);
      const titolo = i18n.t('auth.login.welcome');
      expect(titolo).not.toMatch(/\s/);
      const ui = await monta(
        <Tema>
          <AuthScreen title={titolo} titleSize={42}>
            <Text>modulo</Text>
          </AuthScreen>
        </Tema>
      );
      const testo = ui.getByText(titolo);
      const sopra = vistaSopra(testo);
      expect({
        siRestringe: testo.props.adjustsFontSizeToFit === true,
        righe: testo.props.numberOfLines,
        colonna: sopra ? stile(sopra).maxWidth : undefined,
      }).toEqual({ siRestringe: true, righe: 1, colonna: undefined });
    }
  );

  it('3: un titolo di più parole va a capo fra le parole, senza colonna del 70 %', async () => {
    const ui = await monta(
      <Tema>
        <AuthScreen title="Crea il tuo account">
          <Text>modulo</Text>
        </AuthScreen>
      </Tema>
    );
    const testo = ui.getByText('Crea il tuo account');
    const sopra = vistaSopra(testo);
    expect({
      siRestringe: testo.props.adjustsFontSizeToFit === true,
      colonna: sopra ? stile(sopra).maxWidth : undefined,
    }).toEqual({ siRestringe: false, colonna: undefined });
  });

  it.each(['it', 'en'] as const)(
    'Home (%s): a testo grande i pulsanti in fondo restano nelle righe della traduzione e si restringono',
    async lingua => {
      changeLanguage(lingua);
      jest.spyOn(PixelRatio, 'getFontScale').mockReturnValue(2);
      const ui = await monta(
        <Tema>
          <ActionCTAButtons />
        </Tema>
      );
      const pulsanti = ['cta-impact-label', 'cta-donate-label'].map(id => {
        const testo = ui.getByTestId(id);
        const righeTraduzione = String(testo.props.children).split('\n').length;
        return {
          id,
          siRestringe: testo.props.adjustsFontSizeToFit === true,
          righeInPiu: (testo.props.numberOfLines ?? Infinity) - righeTraduzione,
        };
      });
      // Una parola spezzata aggiunge una riga: con le righe fissate il testo si restringe invece di spezzarla.
      expect(pulsanti).toEqual([
        { id: 'cta-impact-label', siRestringe: true, righeInPiu: 0 },
        { id: 'cta-donate-label', siRestringe: true, righeInPiu: 0 },
      ]);
    }
  );

  it('Chi siamo: a testo grande l’email sta su una riga e si restringe, l’indirizzo va a capo fra le parole', async () => {
    jest.spyOn(PixelRatio, 'getFontScale').mockReturnValue(2);
    const ui = await monta(
      <Tema>
        <ChiSiamoScreen
          navigation={{ goBack: jest.fn(), navigate: jest.fn() } as never}
        />
      </Tema>
    );
    const email = ui.getByText(/@/);
    const indirizzo = ui.getByText(/Bologna/);
    expect({
      email: [
        email.props.adjustsFontSizeToFit === true,
        email.props.numberOfLines,
      ],
      indirizzo: indirizzo.props.adjustsFontSizeToFit === true,
    }).toEqual({ email: [true, 1], indirizzo: false });
  });
});
