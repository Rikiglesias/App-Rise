import React from 'react';
import { render } from '@testing-library/react-native';
import PhoneInput from 'rn-international-phone-number';

import { AllProviders } from '../../helpers/testProviders';
import { AuthPhoneField } from '@/features/auth/components/AuthPhoneField';
import i18n from '@/locales';

afterEach(() => {
  i18n.locale = 'it';
});

it.each(['it', 'en'] as const)("prefisso nella lingua dell'app: %s", locale => {
  i18n.locale = locale;
  const screen = render(
    <AllProviders>
      <AuthPhoneField
        label={i18n.t('auth.signup.phone')}
        onChangeText={jest.fn()}
      />
    </AllProviders>
  );
  // Componente e libreria reali: la prop decide la lingua del selettore nativo.
  expect(screen.UNSAFE_getByType(PhoneInput).props.language).toBe(
    locale === 'it' ? 'ita' : 'eng'
  );
  expect(screen.getByTestId('countryPickerPhoneInput').props.placeholder).toBe(
    i18n.t('auth.phoneField.placeholder')
  );
  expect(
    screen.getByLabelText(i18n.t('auth.phoneField.choosePrefix'))
  ).toBeTruthy();
});
