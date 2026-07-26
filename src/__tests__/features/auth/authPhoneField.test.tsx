import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';

import { AllProviders } from '../../helpers/testProviders';
import { AuthPhoneField } from '@/features/auth/components/AuthPhoneField';

/**
 * Il campo telefono ha DUE modi d'uso vivi, e la differenza non è cosmetica:
 * - `SignUpScreen` non passa `value` (persona nuova, nessun numero da mostrare);
 * - `CompleteProfileScreen` lo passa (profilo che esiste già).
 * Il rischio che questi test presidiano è che il secondo modo, aggiunto per non far
 * ridigitare il numero, rompa il primo azzerando ciò che la persona sta scrivendo.
 *
 * La libreria `rn-international-phone-number` NON è mockata (sta nei
 * `transformIgnorePatterns` di jest.config.js): prefisso e parte nazionale sono
 * calcolati da lei davvero, quindi questi test misurano il comportamento reale.
 */
describe('AuthPhoneField', () => {
  type Props = React.ComponentProps<typeof AuthPhoneField>;

  const renderField = (props: Props) =>
    render(
      <AllProviders>
        <AuthPhoneField {...props} />
      </AllProviders>
    );

  const digitsShown = (getByLabelText: (t: string) => unknown): string =>
    (
      getByLabelText('Telefono') as { props: { value: string } }
    ).props.value.replace(/\D/g, '');

  it('mostra un numero già noto invece di farlo ridigitare', () => {
    const { getByLabelText } = renderField({
      label: 'Telefono',
      value: '+393331234567',
      onChangeText: jest.fn(),
    });
    // La parte nazionale è visibile nel campo (il prefisso vive nel selettore).
    expect(digitsShown(getByLabelText)).toBe('3331234567');
  });

  it('idratando NON riemette: il form non viene riscritto da sé stesso', () => {
    const onChangeText = jest.fn();
    renderField({ label: 'Telefono', value: '+393331234567', onChangeText });
    // Emettere qui significherebbe rimandare al form ciò che il form ci ha appena
    // dato: rumore nel migliore dei casi, valore alterato nel peggiore.
    expect(onChangeText).not.toHaveBeenCalled();
  });

  it('deduce il paese dal numero, non dalla residenza dichiarata', () => {
    // Numero francese su residenza italiana: vince il numero, che il suo prefisso se
    // lo porta dietro. Se vincesse la residenza, il +33 diventerebbe +39 e il numero
    // salvato cambierebbe persona.
    const onChangeText = jest.fn();
    const { getByLabelText } = renderField({
      label: 'Telefono',
      value: '+33123456789',
      country: 'IT',
      onChangeText,
    });
    expect(digitsShown(getByLabelText)).toBe('123456789');
    expect(onChangeText).not.toHaveBeenCalled();
  });

  it('SENZA `value` il campo resta non controllato e non si azzera da solo', () => {
    // È il caso `SignUpScreen`. Il difetto che questo test previene: trattare
    // «nessun valore esterno» come «valore esterno vuoto» farebbe ri-idratare a
    // stringa vuota subito dopo la digitazione, cancellando ciò che si è scritto.
    const onChangeText = jest.fn();
    const { getByLabelText } = renderField({ label: 'Telefono', onChangeText });
    fireEvent.changeText(getByLabelText('Telefono'), '3331234567');
    expect(onChangeText).toHaveBeenLastCalledWith('+393331234567');
    expect(digitsShown(getByLabelText)).toBe('3331234567');
  });

  it('digitare emette in E.164 anche quando il campo è controllato', () => {
    const onChangeText = jest.fn();
    const { getByLabelText } = renderField({
      label: 'Telefono',
      value: '',
      onChangeText,
    });
    fireEvent.changeText(getByLabelText('Telefono'), '3331234567');
    expect(onChangeText).toHaveBeenLastCalledWith('+393331234567');
  });

  it('il cambio di residenza allinea il prefisso e ri-emette', () => {
    const onChangeText = jest.fn();
    const { getByLabelText, rerender } = renderField({
      label: 'Telefono',
      country: 'IT',
      onChangeText,
    });
    fireEvent.changeText(getByLabelText('Telefono'), '123456789');
    onChangeText.mockClear();
    rerender(
      <AllProviders>
        <AuthPhoneField
          label="Telefono"
          country="FR"
          onChangeText={onChangeText}
        />
      </AllProviders>
    );
    expect(onChangeText).toHaveBeenLastCalledWith('+33123456789');
  });
});
