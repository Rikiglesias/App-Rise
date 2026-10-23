/**
 * Il segnaposto del campo telefono («Inserisci il numero») è leggibile come quello degli altri
 * campi: almeno 4,5:1 sul fondo del campo (`neutral[0]`). La libreria
 * `rn-international-phone-number` senza colore usa `#AAAAAA` in chiaro: 2,32:1 sul bianco,
 * misurato sull'emulatore Pixel_8 (23/10) nella registrazione.
 */
import React from 'react';
import { fireEvent, render } from '@testing-library/react-native';

import { coloreDi, contrasto } from '@/__tests__/helpers/contrasto';
import { AuthPhoneField } from '@/features/auth/components/AuthPhoneField';
import { getAdaptiveColors } from '@/shared/theme/adaptiveColors';
import { UniversalThemeProvider } from '@/shared/theme/UniversalTheme';

const AA = 4.5;
type Tema = 'light' | 'dark';

const coloreDelSegnaposto = (tema: Tema): string => {
  const ui = render(
    <UniversalThemeProvider initialTheme={tema} followSystem={false}>
      <AuthPhoneField label="Telefono" onChangeText={() => undefined} />
    </UniversalThemeProvider>
  );
  const campo = ui.getByLabelText('Telefono') as {
    props: { placeholderTextColor?: string };
  };
  return String(campo.props.placeholderTextColor);
};

describe('segnaposto del campo telefono', () => {
  it.each<Tema>(['light', 'dark'])('contrasto: segnaposto in %s', tema => {
    const fondo = getAdaptiveColors(tema === 'dark').neutral[0];
    expect(contrasto(coloreDelSegnaposto(tema), fondo)).toBeGreaterThanOrEqual(
      AA
    );
  });

  it('contrasto: prefisso nella lista dei paesi', () => {
    // Le righe del foglio dei paesi hanno il fondo fisso della libreria (#F3F3F3, misurato
    // sull'emulatore): il prefisso grigio predefinito ci stava a 3,9:1.
    const ui = render(
      <UniversalThemeProvider initialTheme="light" followSystem={false}>
        <AuthPhoneField label="Telefono" onChangeText={() => undefined} />
      </UniversalThemeProvider>
    );
    fireEvent.press(ui.getByTestId('countryPickerFlagContainerButton'));
    const prefisso = ui.getAllByText('+39').at(-1);
    expect(prefisso).toBeDefined();
    expect(
      contrasto(coloreDi(prefisso as Parameters<typeof coloreDi>[0]), '#F3F3F3')
    ).toBeGreaterThanOrEqual(AA);
  });
});
