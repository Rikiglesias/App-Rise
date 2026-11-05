// L'avviso del SOLO codice (profilo non arrivato) parla solo del codice. Confermarlo non
// deve valere come lettura dell'avviso completo, né cancellare un «senza i miei dati»
// già salvato: altrimenti alla donazione dopo, col profilo arrivato, nome ed email
// partirebbero senza che la persona abbia mai letto il testo che li nomina.
// Le bandierine sono un mockArchivio vero in memoria, come lo storage del telefono:
// si controlla cosa succede alla donazione successiva, non quali funzioni sono state
// chiamate. File NUOVO (R27).
import { act, renderHook } from '@testing-library/react-native';

import { usePartnerExit } from '@/shared/partner/usePartnerExit';
import { useAuth } from '@/shared/auth/AuthContext';
import { useLinkHandler } from '@/shared/hooks/useLinkHandler';

const mockArchivio = new Map<string, boolean>();

jest.mock('@/shared/auth/AuthContext', () => ({ useAuth: jest.fn() }));
jest.mock('@/shared/hooks/useLinkHandler', () => ({
  useLinkHandler: jest.fn(),
}));
jest.mock('@/shared/partner/disclosureFlag', () => ({
  hasSeenPartnerDisclosure: jest.fn((userId: string, canale: string) =>
    Promise.resolve(mockArchivio.get(`visto:${userId}:${canale}`) === true)
  ),
  markPartnerDisclosureSeen: jest.fn((userId: string, canale: string) => {
    mockArchivio.set(`visto:${userId}:${canale}`, true);
    return Promise.resolve();
  }),
  hasOptedOutOfPrefill: jest.fn((userId: string) =>
    Promise.resolve(mockArchivio.get(`rinuncia:${userId}`) === true)
  ),
  setPrefillOptOut: jest.fn((userId: string, rinuncia: boolean) => {
    mockArchivio.set(`rinuncia:${userId}`, rinuncia);
    return Promise.resolve();
  }),
}));
jest.mock('@/shared/partner/partnerRefService', () => ({
  getOrCreatePartnerRef: jest.fn().mockResolvedValue('REF-A'),
  utenteDellaSessione: jest.fn().mockResolvedValue('A'),
}));

const mockOpenLink = jest.fn();

const profiloDiA = {
  id: 'A',
  first_name: 'Anna',
  last_name: 'Rossi',
  contact_email: 'a@r.it',
};

const autenticata = (profile: typeof profiloDiA | null) => ({
  session: { user: { id: 'A', email: 'a@r.it' } },
  profile,
  refreshProfile: jest.fn().mockResolvedValue(profile),
  consentState: 'ok',
  refreshConsent: jest.fn().mockResolvedValue('ok'),
  needsReConsent: false,
});

beforeEach(() => {
  jest.clearAllMocks();
  mockArchivio.clear();
  (useLinkHandler as jest.Mock).mockReturnValue({
    openLink: mockOpenLink,
    isLoading: null,
  });
});

/** Prima donazione col profilo NON arrivato: avviso del solo codice, la persona conferma. */
const confermaAvvisoSoloCodice = async () => {
  (useAuth as jest.Mock).mockReturnValue(autenticata(null));
  const { result, unmount } = renderHook(() => usePartnerExit());
  await act(async () => {
    await result.current.openDonation();
  });
  expect(result.current.donorboxSoloCodice).toBe(true);
  await act(async () => {
    await result.current.confirmDonorboxDisclosure(true);
  });
  expect(String(mockOpenLink.mock.calls[0]?.[0])).not.toContain('email=');
  unmount();
  mockOpenLink.mockClear();
};

/** Donazione successiva, col profilo arrivato. */
const donaColProfilo = async () => {
  (useAuth as jest.Mock).mockReturnValue(autenticata(profiloDiA));
  const hook = renderHook(() => usePartnerExit());
  await act(async () => {
    await hook.result.current.openDonation();
  });
  return hook;
};

it('dopo l’avviso del solo codice, la prima uscita coi dati mostra l’avviso completo', async () => {
  await confermaAvvisoSoloCodice();
  const { result } = await donaColProfilo();
  // Nome ed email non partono prima che la persona legga il testo che li nomina.
  expect(mockOpenLink).not.toHaveBeenCalled();
  expect(result.current.donorboxDisclosureVisible).toBe(true);
  expect(result.current.donorboxSoloCodice).toBe(false);
});

it('l’avviso del solo codice non cancella un «senza i miei dati» già salvato', async () => {
  mockArchivio.set('rinuncia:A', true);
  await confermaAvvisoSoloCodice();
  // La preferenza salvata è lo stato che la persona ha scelto: deve restare com'era,
  // non essere riscritta da un avviso che non le chiedeva niente sui dati.
  expect(mockArchivio.get('rinuncia:A')).toBe(true);
  const { result } = await donaColProfilo();
  // Alla donazione dopo la rinuncia vale ancora: dall'avviso completo, «Continua senza i
  // miei dati» è la scelta che c'era; se si apre senza avviso, nome ed email non ci sono.
  if (result.current.donorboxDisclosureVisible) {
    await act(async () => {
      await result.current.confirmDonorboxDisclosure(false);
    });
  }
  const indirizzo = String(mockOpenLink.mock.calls[0]?.[0]);
  expect(indirizzo).toContain('utm_content=REF-A');
  expect(indirizzo).not.toContain('Anna');
  expect(indirizzo).not.toContain('email=');
  expect(mockArchivio.get('rinuncia:A')).toBe(true);
});
