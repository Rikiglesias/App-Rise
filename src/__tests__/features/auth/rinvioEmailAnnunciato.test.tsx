// C87, revisione del delta 1 (d-2): la conferma del rinvio dice cosa fare e chi usa il lettore di
// schermo deve sentirla: la live region esiste solo su Android, su iOS serve l'annuncio, e su
// Android l'annuncio la farebbe leggere due volte. File NUOVO (R27).
import React from 'react';
import { AccessibilityInfo, Platform } from 'react-native';
import { act, fireEvent, render } from '@testing-library/react-native';

import { AllProviders } from '../../helpers/testProviders';
import { EmailResendControl } from '@/features/auth/components/EmailResendControl';

const TESTO =
  'Link rimandato: usa quelli dell’ultima mail e ripeti le conferme.';

const rimanda = async () => {
  const ui = render(
    <AllProviders>
      <EmailResendControl
        until={0}
        resend={() => Promise.resolve({ error: null })}
        submitLabel="Rimanda il link"
        sentText={TESTO}
      />
    </AllProviders>
  );
  await act(async () => {
    fireEvent.press(ui.getByRole('button', { name: 'Rimanda il link' }));
    await Promise.resolve();
  });
};

let annuncio: jest.SpyInstance;
beforeEach(() => {
  annuncio = jest.spyOn(AccessibilityInfo, 'announceForAccessibility');
});
afterEach(() => {
  annuncio.mockRestore();
  jest.restoreAllMocks();
});

it('rinvio riuscito su iOS: il messaggio si annuncia', async () => {
  jest.replaceProperty(Platform, 'OS', 'ios');
  await rimanda();
  expect(annuncio).toHaveBeenCalledTimes(1);
  expect(annuncio).toHaveBeenCalledWith(TESTO);
});

it('rinvio riuscito su Android: nessun annuncio, lo legge già la live region', async () => {
  jest.replaceProperty(Platform, 'OS', 'android');
  await rimanda();
  expect(annuncio).not.toHaveBeenCalled();
});
