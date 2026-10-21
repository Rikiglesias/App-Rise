/**
 * C46 (contratto android-play), prima parte: con «Riduci animazioni» acceso sul telefono le
 * animazioni scritte dall'app durano 0 (nessun ciclo, nessuna molla), le finestre si aprono
 * senza dissolvenza e gli stack JavaScript cambiano pagina senza scorrimento. Le animazioni
 * di sistema le spegne Android da solo; queste no, perché girano in `Animated`.
 * Senza la preferenza resta il disegno di prima: le due metà insieme provano che il codice
 * legge davvero la preferenza, invece di aver tolto le animazioni a tutti.
 */
import React from 'react';
import { AccessibilityInfo, Animated, Modal, Text } from 'react-native';
import { act, render } from '@testing-library/react-native';

import { AllProviders } from '../helpers/testProviders';
import { PerfectModal } from '@/components/ui/PerfectModal';
import StoriaModal from '@/features/about/components/StoriaModal';
import DonationInfoModal from '@/features/actions/components/shared/DonationInfoModal';
import PartnerDisclosureModal from '@/features/actions/components/shared/PartnerDisclosureModal';
import { ModernSmartTitle } from '@/features/home/components/ModernSmartTitle';
import { MainStackNavigator } from '@/navigation/MainStackNavigator';
import { ProfileGateNavigator } from '@/navigation/ProfileGateNavigator';
import { OTAUpdateScreen } from '@/shared/OTAUpdateScreen';
import { useReduceMotion } from '@/shared/hooks/useReduceMotion';

// Gli stack non si montano davvero: si leggono le opzioni che ricevono.
const mockOpzioniStack: { animation?: string }[] = [];
jest.mock('@react-navigation/stack', () => ({
  ...jest.requireActual('@react-navigation/stack'),
  createStackNavigator: () => ({
    Navigator: ({
      screenOptions,
    }: {
      screenOptions: { animation?: string };
    }) => {
      mockOpzioniStack.push(screenOptions);
      return null;
    },
    Screen: () => null,
  }),
}));

const noop = (): void => undefined;
const isReduceMotionEnabled =
  AccessibilityInfo.isReduceMotionEnabled as jest.Mock;

/**
 * La preferenza si legge in modo asincrono: una sonda la tiene letta e aspetta il valore
 * prima di montare ciò che si misura, come accade nell'app dopo il primo istante.
 */
const conPreferenza = async (riduci: boolean) => {
  isReduceMotionEnabled.mockResolvedValue(riduci);
  const Sonda = () => <Text>{`riduci:${useReduceMotion()}`}</Text>;
  const sonda = render(<Sonda />);
  await sonda.findByText(`riduci:${riduci}`);
};

const montaTutto = () => {
  const titolo = new Animated.Value(1);
  const fermo = titolo.interpolate({ inputRange: [0, 1], outputRange: [0, 0] });
  const ui = render(
    <AllProviders>
      <ModernSmartTitle
        titleAnim={titolo}
        titleOpacity={fermo}
        titleTransform={fermo}
      />
      <OTAUpdateScreen isChecking={false} isDownloading progress={50} />
      <OTAUpdateScreen
        isChecking={false}
        isDownloading={false}
        progress={100}
      />
      <PerfectModal visible onRequestClose={noop}>
        <Text>corpo</Text>
      </PerfectModal>
      <StoriaModal visible onClose={noop} />
      <DonationInfoModal visible onClose={noop} />
      <PartnerDisclosureModal
        visible
        onConfirm={noop}
        onCancel={noop}
        variant="donorbox"
        onConfirmWithoutData={noop}
      />
      <MainStackNavigator />
      <ProfileGateNavigator />
    </AllProviders>
  );
  return ui;
};

describe('C46 riduci animazioni', () => {
  let timing: jest.SpyInstance;
  let spring: jest.SpyInstance;
  let loop: jest.SpyInstance;

  // Spie create una volta per il file: ricreate a ogni test, dal secondo test
  // `Animated.timing` restituiva `undefined` (osservato il 21/10).
  beforeAll(() => {
    timing = jest.spyOn(Animated, 'timing');
    spring = jest.spyOn(Animated, 'spring');
    loop = jest.spyOn(Animated, 'loop');
  });

  beforeEach(() => {
    mockOpzioniStack.length = 0;
    timing.mockClear();
    spring.mockClear();
    loop.mockClear();
  });

  afterEach(() => {
    isReduceMotionEnabled.mockResolvedValue(false);
  });

  afterAll(() => {
    timing.mockRestore();
    spring.mockRestore();
    loop.mockRestore();
  });

  const durate = () =>
    timing.mock.calls.map(
      ([, config]) => (config as { duration?: number }).duration
    );
  const finestre = (ui: ReturnType<typeof render>) =>
    ui.UNSAFE_getAllByType(Modal).map(m => m.props.animationType);

  it('riduci animazioni: animazioni a durata 0', async () => {
    await conPreferenza(true);
    timing.mockClear();
    const ui = montaTutto();

    // Positivo: le animazioni partono davvero (titolo, ingresso, barra, completamento).
    expect(durate().length).toBeGreaterThanOrEqual(4);
    expect(durate()).toEqual(durate().map(() => 0));
    expect(spring).not.toHaveBeenCalled();
    expect(loop).not.toHaveBeenCalled();

    expect(finestre(ui)).toHaveLength(4);
    expect(finestre(ui)).toEqual(['none', 'none', 'none', 'none']);

    expect(mockOpzioniStack).toHaveLength(2);
    expect(mockOpzioniStack.map(o => o.animation)).toEqual(['none', 'none']);
  });

  it('riduci animazioni: senza la preferenza resta il disegno', async () => {
    await conPreferenza(false);
    timing.mockClear();
    const ui = montaTutto();

    expect(durate()).toContain(800); // ingresso del titolo della Home
    expect(spring).toHaveBeenCalled();
    expect(loop).toHaveBeenCalled();
    expect(finestre(ui)).toEqual(['fade', 'fade', 'fade', 'fade']);
    expect(mockOpzioniStack.map(o => o.animation)).toEqual([
      undefined,
      undefined,
    ]);
  });

  it('riduci animazioni: la preferenza accesa ad app aperta vale subito', async () => {
    await conPreferenza(false);
    const ui = montaTutto();
    expect(finestre(ui)).toEqual(['fade', 'fade', 'fade', 'fade']);

    const avvisi = (AccessibilityInfo.addEventListener as jest.Mock).mock.calls
      .filter(([evento]) => evento === 'reduceMotionChanged')
      .map(([, gestore]) => gestore as (attivo: boolean) => void);
    expect(avvisi.length).toBeGreaterThan(0);
    timing.mockClear();
    act(() => avvisi.forEach(avviso => avviso(true)));

    expect(finestre(ui)).toEqual(['none', 'none', 'none', 'none']);
    // Le animazioni ripartite col nuovo valore hanno durata 0.
    expect(durate().length).toBeGreaterThan(0);
    expect(durate()).toEqual(durate().map(() => 0));
  });
});
