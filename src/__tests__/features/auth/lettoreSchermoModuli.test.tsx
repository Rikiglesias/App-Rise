import type { ReactElement } from 'react';

import { suTelefono, type Elemento } from '@/__tests__/helpers/touchArea';

const FINESTRA = { width: 320, height: 568 };

// Moduli reali, dallo stesso registro Android usato da suTelefono.
const caricaModulo = (fontScale: number) => {
  const React = require('react') as typeof import('react');
  const RN = require('react-native') as typeof import('react-native');
  const { render, cleanupAsync, fireEvent } =
    require('@testing-library/react-native/pure') as typeof import('@testing-library/react-native/pure');
  jest
    .spyOn(RN.Dimensions, 'get')
    .mockReturnValue({ ...FINESTRA, scale: 2, fontScale });
  jest.spyOn(RN.PixelRatio, 'getFontScale').mockReturnValue(fontScale);
  const { AllProviders } = require('../../helpers/testProviders');
  const { AuthCountryField } =
    require('@/features/auth/components/AuthCountryField') as typeof import('@/features/auth/components/AuthCountryField');
  const { AuthDateField } =
    require('@/features/auth/components/AuthDateField') as typeof import('@/features/auth/components/AuthDateField');
  const { AuthButton } =
    require('@/features/auth/components/AuthButton') as typeof import('@/features/auth/components/AuthButton');
  require('@/locales').default.locale = 'it';
  expect(RN.Platform.OS).toBe('android');
  return {
    React,
    RN,
    AuthCountryField,
    AuthDateField,
    AuthButton,
    monta: (elemento: ReactElement) =>
      render(elemento, { wrapper: AllProviders }),
    cleanupAsync,
    fireEvent,
  };
};

const suModuloAndroid = async (
  prova: (modulo: ReturnType<typeof caricaModulo>) => void,
  fontScale = 1
) => {
  const worker = process.env.JEST_WORKER_ID;
  // Come textScale.test.tsx: esercita la scala reale, senza il blocco Jest di SystemImmunity.
  if (fontScale === 2) delete process.env.JEST_WORKER_ID;
  try {
    await suTelefono(FINESTRA, async () => {
      const modulo = caricaModulo(fontScale);
      try {
        prova(modulo);
      } finally {
        await modulo.cleanupAsync();
      }
    });
  } finally {
    if (worker === undefined) delete process.env.JEST_WORKER_ID;
    else process.env.JEST_WORKER_ID = worker;
    jest.restoreAllMocks();
  }
};

const annuncio = (nodo: Elemento): string =>
  [nodo.props.accessibilityLabel, nodo.props.accessibilityValue?.text]
    .filter(Boolean)
    .join(', ');

const genitoreNativo = (nodo: Elemento): Elemento | null => {
  let genitore = nodo.parent;
  while (genitore && typeof genitore.type !== 'string') {
    genitore = genitore.parent;
  }
  return genitore;
};

it('lettore di schermo: Paese con il valore', async () => {
  await suModuloAndroid(({ React, AuthCountryField, monta }) => {
    const ui = monta(
      <AuthCountryField label="Paese" value="IT" onSelect={jest.fn()} />
    );
    const campo = ui.getByTestId('country-field');
    expect(campo.props.accessibilityRole).toBe('button');
    expect(annuncio(campo)).toContain('Italia');
    expect(campo.props.accessibilityLabel).toContain('Paese');
  });
});

it('lettore di schermo: data con il valore', async () => {
  await suModuloAndroid(({ React, AuthDateField, monta }) => {
    const ui = monta(
      <AuthDateField
        label="Data di nascita"
        value="2000-05-17"
        onChange={jest.fn()}
      />
    );
    const campo = ui.getByRole('button');
    expect(annuncio(campo)).toContain('17/05/2000');
    expect(campo.props.accessibilityLabel).toContain('Data di nascita');
  });
});

it('lettore di schermo: pulsante in caricamento con nome e busy', async () => {
  await suModuloAndroid(({ React, RN, AuthButton, monta, fireEvent }) => {
    for (const variant of ['primary', 'secondary'] as const) {
      const onPress = jest.fn();
      const ui = monta(
        <AuthButton
          label="Accedi"
          onPress={onPress}
          variant={variant}
          loading
        />
      );
      const pulsante = ui.getByRole('button');
      expect(pulsante.props.accessibilityState?.busy).toBe(true);
      expect(pulsante.props.accessibilityLabel).toBe('Accedi');
      expect(pulsante.props.accessibilityState?.disabled).toBe(true);
      expect(ui.UNSAFE_queryAllByType(RN.ActivityIndicator)).toHaveLength(1);
      fireEvent.press(pulsante);
      expect(onPress).not.toHaveBeenCalled();

      ui.rerender(
        <AuthButton label="Accedi" onPress={onPress} variant={variant} />
      );
      expect(ui.getByRole('button').props.accessibilityState?.busy).not.toBe(
        true
      );
      expect(ui.getByRole('button').props.accessibilityState?.disabled).toBe(
        false
      );
      fireEvent.press(ui.getByRole('button'));
      expect(onPress).toHaveBeenCalledTimes(1);

      ui.rerender(
        <AuthButton
          label="Accedi"
          onPress={onPress}
          variant={variant}
          disabled
        />
      );
      expect(ui.getByRole('button').props.accessibilityState?.disabled).toBe(
        true
      );
      expect(ui.getByRole('button').props.accessibilityState?.busy).not.toBe(
        true
      );
      fireEvent.press(ui.getByRole('button'));
      expect(onPress).toHaveBeenCalledTimes(1);
      ui.unmount();
    }
  });
});

it('link in caricamento: attesa visibile e tocco ignorato', async () => {
  await suModuloAndroid(({ React, RN, AuthButton, monta, fireEvent }) => {
    for (const variant of ['link', 'linkMuted', 'linkStrong'] as const) {
      const onPress = jest.fn();
      const ui = monta(
        <AuthButton
          label="Riprova"
          onPress={onPress}
          variant={variant}
          loading
        />
      );
      expect(ui.UNSAFE_queryAllByType(RN.ActivityIndicator)).toHaveLength(1);
      expect(
        ui.UNSAFE_getByType(RN.ActivityIndicator).props.animating
      ).not.toBe(false);
      const pulsante = ui.getByRole('button');
      expect(pulsante.props.accessibilityState?.disabled).toBe(true);
      expect(pulsante.props.accessibilityState?.busy).toBe(true);
      expect(pulsante.props.accessibilityLabel).toBe('Riprova');
      fireEvent.press(pulsante);
      expect(onPress).not.toHaveBeenCalled();

      ui.rerender(
        <AuthButton label="Riprova" onPress={onPress} variant={variant} />
      );
      expect(ui.UNSAFE_queryAllByType(RN.ActivityIndicator)).toHaveLength(0);
      fireEvent.press(ui.getByRole('button'));
      expect(onPress).toHaveBeenCalledTimes(1);
      ui.unmount();
    }
  });
});

it('campo paese: nome lungo non spinge fuori il simbolo', async () => {
  await suModuloAndroid(({ React, RN, AuthCountryField, monta }) => {
    const { getAllCountries } =
      require('rn-country-select') as typeof import('rn-country-select');
    const nome = (paese: ReturnType<typeof getAllCountries>[number]) =>
      paese.translations.ita?.common ?? paese.name.common;
    const paesi = getAllCountries();
    expect(paesi.length).toBeGreaterThan(0);
    const piuLungo = paesi.reduce((a, b) =>
      nome(a).length >= nome(b).length ? a : b
    );
    const ui = monta(
      <AuthCountryField
        label="Paese"
        value={piuLungo.cca2}
        onSelect={jest.fn()}
      />
    );
    const valore = ui.getByText(`${piuLungo.flag}  ${nome(piuLungo)}`);
    const simbolo = ui.getByText('⌄');
    expect(RN.PixelRatio.getFontScale()).toBe(2);
    expect(RN.StyleSheet.flatten(valore.props.style)).toMatchObject({
      flex: 1,
      flexShrink: 1,
    });
    expect(RN.StyleSheet.flatten(simbolo.props.style)).toMatchObject({
      flexShrink: 0,
    });
    const riga = genitoreNativo(valore);
    expect(riga).not.toBeNull();
    expect(genitoreNativo(simbolo)).toBe(riga);
    expect(RN.StyleSheet.flatten(riga?.props.style)).toMatchObject({
      flexDirection: 'row',
    });
    expect(valore.props.allowFontScaling).toBe(true);
  }, 2);
});
