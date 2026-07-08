import React from 'react';
import { AccessibilityInfo } from 'react-native';
import { render } from '@testing-library/react-native';

import { AllProviders } from '../../helpers/testProviders';
import { FormError } from '@/features/auth/components/FormError';
import { FormSuccess } from '@/features/auth/components/FormSuccess';

// Regression net: FormError/FormSuccess devono annunciare il messaggio via
// AccessibilityInfo.announceForAccessibility (cross-platform), perché
// accessibilityLiveRegion è Android-only e su iOS VoiceOver resterebbe muto
// (review full-branch 2026-07-09).
describe('FormError / FormSuccess — annuncio a11y cross-platform', () => {
  beforeEach(() => jest.clearAllMocks());

  it('FormError annuncia il messaggio agli screen reader', () => {
    const spy = jest.spyOn(AccessibilityInfo, 'announceForAccessibility');
    render(
      <AllProviders>
        <FormError message="Email o password non corretti" />
      </AllProviders>
    );
    expect(spy).toHaveBeenCalledWith('Email o password non corretti');
  });

  it('FormSuccess annuncia il messaggio agli screen reader', () => {
    const spy = jest.spyOn(AccessibilityInfo, 'announceForAccessibility');
    render(
      <AllProviders>
        <FormSuccess message="Profilo aggiornato." />
      </AllProviders>
    );
    expect(spy).toHaveBeenCalledWith('Profilo aggiornato.');
  });

  it('FormError senza messaggio NON annuncia nulla', () => {
    const spy = jest.spyOn(AccessibilityInfo, 'announceForAccessibility');
    render(
      <AllProviders>
        <FormError message={undefined} />
      </AllProviders>
    );
    expect(spy).not.toHaveBeenCalled();
  });
});
