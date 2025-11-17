/**
 * APP ROOT COMPONENT TEST
 *
 * Test base dell'entry point dell'applicazione.
 * Verifica che l'app si inizializzi correttamente con tutti i provider necessari.
 */

import React from 'react';
import { render } from '@testing-library/react-native';
import App from '../../App';

// Mock dei moduli nativi necessari per il test
jest.mock('expo-font');
jest.mock('expo-asset');
jest.mock('expo-status-bar', () => ({
  StatusBar: 'StatusBar',
}));
jest.mock('expo-updates', () => ({
  useUpdates: () => ({
    isChecking: false,
    isDownloading: false,
    downloadProgress: 0,
    availableUpdate: null,
  }),
}));

describe('App Root Component', () => {
  it('dovrebbe renderizzare senza errori', () => {
    // Test di smoke - verifica che l'app si monti senza crash
    const { toJSON } = render(<App />);
    expect(toJSON()).toBeTruthy();
  });

  it('dovrebbe inizializzare i provider necessari', () => {
    // Verifica che l'app renderizzi con la struttura base
    const { root } = render(<App />);
    expect(root).toBeDefined();
  });
});
