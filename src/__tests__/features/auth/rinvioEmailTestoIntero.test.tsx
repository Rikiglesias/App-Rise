// C87 (giro valido del delta 1, d-1): dopo «Rimanda il link» il messaggio dice di ripetere le
// conferme. Su un telefono stretto è lungo più di tre righe e non può finire tagliato con i
// puntini: è l'istruzione da seguire. File NUOVO (R27).
import React from 'react';
import { act, fireEvent, render } from '@testing-library/react-native';

import { AllProviders } from '../../helpers/testProviders';
import { EmailResendControl } from '@/features/auth/components/EmailResendControl';

const TESTO =
  'Link inviato di nuovo: ripeti la conferma da entrambe le caselle di posta.';

it('rinvio email: il messaggio dopo il rinvio non ha un limite di righe', async () => {
  const ui = render(
    <AllProviders>
      <EmailResendControl
        until={0}
        resend={jest.fn().mockResolvedValue({ error: null })}
        submitLabel="Rimanda il link"
        sentText={TESTO}
      />
    </AllProviders>
  );
  await act(async () => {
    fireEvent.press(ui.getByText('Rimanda il link'));
    await new Promise(resolve => setImmediate(resolve));
  });
  expect(ui.getByText(TESTO).props.numberOfLines).toBeFalsy();
});
