// L'avviso Donorbox del solo codice non offre «Continua senza i miei dati»: non ci sono
// dati da togliere. L'esclusione sta in ActionButtons, che NON passa il callback alla
// modale quando parte il solo codice. Il test della modale da sola non lo vede (non le
// passa mai il callback): qui si rende ActionButtons con la modale VERA e il dato
// simulato (revisione delle correzioni, rilievo 5). File NUOVO.
import React from 'react';
import { Animated } from 'react-native';
import { render, screen } from '@testing-library/react-native';

import { renderWithProviders } from '@/__tests__/helpers/testProviders';

const mockDati = { donorboxSoloCodice: true };
jest.mock(
  '@/features/actions/components/ActionButtons/useActionButtonsData',
  () => ({
    useActionButtonsData: () => ({
      showInfoModal: false,
      disclosureVisible: false,
      donorboxDisclosureVisible: true,
      donorboxSoloCodice: mockDati.donorboxSoloCodice,
      handleInfoModalClose: jest.fn(),
      confirmDisclosure: jest.fn(),
      cancelDisclosure: jest.fn(),
      confirmDonorboxDisclosure: jest.fn(),
      cancelDonorboxDisclosure: jest.fn(),
    }),
  })
);
// Fuori scope: i pulsanti e l'altra modale.
jest.mock(
  '@/features/actions/components/ActionButtons/ActionButtonsUI',
  () => ({ ActionButtonsUI: () => null })
);
jest.mock('@/features/actions/components/shared/DonationInfoModal', () => ({
  __esModule: true,
  default: () => null,
}));

// eslint-disable-next-line import/first -- Import dopo mock setup è necessario per test
import ActionButtons from '@/features/actions/components/ActionButtons/ActionButtons';

const animazioni = {
  fadeAnim: new Animated.Value(1),
  slideAnim: new Animated.Value(0),
  scaleAnim: new Animated.Value(1),
  buttonAnimations: Array.from({ length: 8 }, () => new Animated.Value(1)),
} as any;

const rendi = () =>
  renderWithProviders(
    <ActionButtons animations={animazioni} navigation={{} as any} />,
    render
  );

it('parte il solo codice: nell’avviso Donorbox non c’è «Continua senza i miei dati»', () => {
  mockDati.donorboxSoloCodice = true;
  rendi();
  expect(screen.getByTestId('partner-disclosure-confirm')).toBeTruthy();
  expect(screen.queryByTestId('partner-disclosure-without-data')).toBeNull();
});

// Controllo positivo: con nome ed email nell'indirizzo la scelta c'è. Senza questo, il
// test sopra passerebbe anche se la modale non mostrasse mai quel pulsante.
it('partono anche nome ed email: la scelta «Continua senza i miei dati» c’è', () => {
  mockDati.donorboxSoloCodice = false;
  rendi();
  expect(screen.getByTestId('partner-disclosure-without-data')).toBeTruthy();
});
