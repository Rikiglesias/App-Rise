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

  it('un numero SALVATO non cambia prefisso se cambia la residenza', () => {
    // Il caso che corrompe: numero italiano reale, la persona corregge il Paese in
    // FR. Riallineare il prefisso lo trasformerebbe in '+333331234567' — 12 cifre,
    // quindi passa anche `validatePhoneIT` e finisce in tabella senza un errore.
    // Un numero che arriva dal profilo non si tocca.
    const onChangeText = jest.fn();
    const { rerender } = renderField({
      label: 'Telefono',
      value: '+393331234567',
      country: 'IT',
      onChangeText,
    });
    onChangeText.mockClear();
    rerender(
      <AllProviders>
        <AuthPhoneField
          label="Telefono"
          value="+393331234567"
          country="FR"
          onChangeText={onChangeText}
        />
      </AllProviders>
    );
    expect(onChangeText).not.toHaveBeenCalled();
  });

  it('normalizza un numero salvato con gli spazi', () => {
    // In colonna può esserci '+39 333 1234567'. Senza normalizzare, il campo
    // mostrerebbe il numero giusto e il form terrebbe una stringa che
    // `validatePhoneIT` rifiuta: errore su un campo che sembra a posto.
    const onChangeText = jest.fn();
    const { getByLabelText } = renderField({
      label: 'Telefono',
      value: '+39 333 1234567',
      onChangeText,
    });
    expect(digitsShown(getByLabelText)).toBe('3331234567');
    expect(onChangeText).toHaveBeenCalledWith('+393331234567');
  });

  it('normalizza un numero salvato SENZA prefisso', () => {
    // Caso certo dopo l'import delle anagrafiche: '3331234567' nudo. Si assume il
    // paese corrente (residenza), perché dal numero non è deducibile.
    const onChangeText = jest.fn();
    const { getByLabelText } = renderField({
      label: 'Telefono',
      value: '3331234567',
      country: 'IT',
      onChangeText,
    });
    expect(digitsShown(getByLabelText)).toBe('3331234567');
    expect(onChangeText).toHaveBeenCalledWith('+393331234567');
  });

  // I quattro casi qui sotto erano TUTTI rotti e nessun test li vedeva: sono stati
  // trovati da un critico avversariale e confermati con una sonda dal vivo. Sono i
  // rami che il campo attraversa davvero nelle schermate reali.

  it('un valore che è solo il prefisso vale come campo VUOTO', () => {
    // '+39' è il valore INIZIALE del form (useProfileForm), quindi è il caso più
    // comune. La libreria non lo riconosce (servono 3 cifre) e lo restituiva
    // verbatim: da '+39' usciva '+3939', che il form registrava come "numero
    // digitato" — l'idratazione del numero vero non partiva più e la validazione
    // falliva su un campo mai toccato.
    const onChangeText = jest.fn();
    const { getByLabelText } = renderField({
      label: 'Telefono',
      value: '+39',
      onChangeText,
    });
    expect(digitsShown(getByLabelText)).toBe('');
    expect(onChangeText).not.toHaveBeenCalledWith('+3939');
  });

  it('al montaggio NON notifica un paese che nessuno ha scelto', () => {
    // Con `defaultCountry` la libreria notificava «Italia» appena montata: su un
    // profilo francese quel giro cambiava il campo Paese, faceva comparire la
    // Provincia obbligatoria e al salvataggio scriveva country 'IT'.
    const onCountryChange = jest.fn();
    renderField({
      label: 'Telefono',
      country: 'FR',
      onChangeText: jest.fn(),
      onCountryChange,
    });
    expect(onCountryChange).not.toHaveBeenCalled();
  });

  it('un numero estero incollato tiene il SUO prefisso, non quello di residenza', () => {
    // Incollando un numero internazionale la libreria notifica prima il paese e poi
    // le cifre, nello stesso giro: leggendo il paese dalla closure usciva '+39' con
    // cifre francesi — 11 cifre, quindi passava anche la validazione e si salvava il
    // numero di un'altra persona.
    const onChangeText = jest.fn();
    const { getByLabelText } = renderField({
      label: 'Telefono',
      country: 'IT',
      onChangeText,
    });
    fireEvent.changeText(getByLabelText('Telefono'), '+33123456789');
    expect(onChangeText).toHaveBeenLastCalledWith('+33123456789');
  });

  it('normalizza il prefisso scritto come 00 (formato degli archivi)', () => {
    // '0039 333 1234567' è il formato tipico delle anagrafiche da importare.
    const onChangeText = jest.fn();
    renderField({
      label: 'Telefono',
      value: '0039 333 1234567',
      onChangeText,
    });
    expect(onChangeText).toHaveBeenCalledWith('+393331234567');
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
