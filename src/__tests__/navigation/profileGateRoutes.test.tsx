import React from 'react';
import { render } from '@testing-library/react-native';
import {
  NavigationContainer,
  createNavigationContainerRef,
} from '@react-navigation/native';

import ProfileGateNavigator from '@/navigation/ProfileGateNavigator';

/**
 * Cosa esiste DAVVERO mentre il cancello è chiuso.
 *
 * Il cancello non è un controllo dentro le schermate: è l'assenza delle rotte. Ciò che
 * qui non compare non è raggiungibile né col tasto indietro, né con un gesto, né con un
 * link — e questo test è il solo posto in cui quell'assenza viene misurata invece che
 * data per buona. Il navigatore è quello VERO: nessun segnaposto, altrimenti il test
 * proverebbe il mock e non il prodotto.
 */
jest.mock('@/features/auth/screens/CompleteProfileScreen', () => ({
  CompleteProfileScreen: () => null,
}));
jest.mock('@/features/auth/screens/DeleteAccountScreen', () => ({
  DeleteAccountScreen: () => null,
}));
jest.mock('@/features/auth/screens/ResetPasswordScreen', () => ({
  ResetPasswordScreen: () => null,
}));

const renderGate = () => {
  const ref = createNavigationContainerRef();
  render(
    <NavigationContainer ref={ref}>
      <ProfileGateNavigator />
    </NavigationContainer>
  );
  return ref;
};

describe('rotte disponibili mentre il cancello è chiuso', () => {
  it('l’app NON è raggiungibile: le sue rotte non esistono nell’albero', () => {
    const routeNames = renderGate().getRootState()?.routeNames ?? [];
    expect(routeNames).not.toContain('Home');
    expect(routeNames).not.toContain('Profilo');
    expect(routeNames).not.toContain('ProfileEdit');
    expect(routeNames).not.toContain('SignUp');
  });

  it('restano le tre vie che impediscono di finire in trappola', () => {
    const routeNames = renderGate().getRootState()?.routeNames ?? [];
    // Completare (la via normale), andarsene (chi non può avere un profilo valido, per
    // esempio per la data di nascita) e recuperare la password: quel link arriva da
    // fuori e punta a `ResetPassword` — senza la rotta, chi è dietro il cancello non
    // potrebbe più rientrare nel proprio account.
    expect(routeNames).toEqual(
      expect.arrayContaining([
        'CompleteProfile',
        'DeleteAccount',
        'ResetPassword',
      ])
    );
  });

  it('si apre sul completamento, non su un’altra schermata', () => {
    const state = renderGate().getRootState();
    expect(state?.routes[state.index ?? 0]?.name).toBe('CompleteProfile');
  });
});
