import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';

import { renderWithProviders } from '@/__tests__/helpers/testProviders';
import PartnerDisclosureModal from '@/features/actions/components/shared/PartnerDisclosureModal';

// Attende il microtask dell'haptic async prima del callback.
const flush = () => new Promise(r => setTimeout(r, 0));

describe('PartnerDisclosureModal', () => {
  it('mostra il contenuto e risolve le chiavi i18n (non chiavi nude)', () => {
    renderWithProviders(
      <PartnerDisclosureModal
        visible
        onConfirm={jest.fn()}
        onCancel={jest.fn()}
      />,
      render
    );
    expect(screen.getByTestId('partner-disclosure-content')).toBeTruthy();
    expect(screen.getByTestId('partner-disclosure-confirm')).toBeTruthy();
    expect(screen.getByTestId('partner-disclosure-cancel')).toBeTruthy();
    // Le chiavi devono essere tradotte, non mostrate grezze.
    expect(screen.queryByText('partner.disclosureContinue')).toBeNull();
    expect(screen.queryByText('partner.disclosureTitle')).toBeNull();
  });

  it('Continua → chiama onConfirm', async () => {
    const onConfirm = jest.fn();
    renderWithProviders(
      <PartnerDisclosureModal
        visible
        onConfirm={onConfirm}
        onCancel={jest.fn()}
      />,
      render
    );
    fireEvent.press(screen.getByTestId('partner-disclosure-confirm'));
    await flush();
    expect(onConfirm).toHaveBeenCalledTimes(1);
  });

  it('Annulla → chiama onCancel', async () => {
    const onCancel = jest.fn();
    renderWithProviders(
      <PartnerDisclosureModal
        visible
        onConfirm={jest.fn()}
        onCancel={onCancel}
      />,
      render
    );
    fireEvent.press(screen.getByTestId('partner-disclosure-cancel'));
    await flush();
    expect(onCancel).toHaveBeenCalledTimes(1);
  });
});
