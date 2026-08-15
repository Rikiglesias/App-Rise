import { renderHook, act } from '@testing-library/react-native';

import { usePartnerExit } from '@/shared/partner/usePartnerExit';
import { useAuth } from '@/shared/auth/AuthContext';
import { useLinkHandler } from '@/shared/hooks/useLinkHandler';
import { getOrCreatePartnerRef } from '@/shared/partner/partnerRefService';
import {
  hasSeenPartnerDisclosure,
  markPartnerDisclosureSeen,
} from '@/shared/partner/disclosureFlag';

// Auth, link handler, service e flag mockati; partnerUrls/partnerEmail restano REALI
// (puri, già testati) così le asserzioni sull'URL costruito sono significative.
jest.mock('@/shared/auth/AuthContext', () => ({ useAuth: jest.fn() }));
jest.mock('@/shared/hooks/useLinkHandler', () => ({
  useLinkHandler: jest.fn(),
}));
jest.mock('@/shared/partner/partnerRefService', () => ({
  getOrCreatePartnerRef: jest.fn(),
}));
jest.mock('@/shared/partner/disclosureFlag', () => ({
  hasSeenPartnerDisclosure: jest.fn(),
  markPartnerDisclosureSeen: jest.fn(),
}));

const mockUseAuth = useAuth as jest.Mock;
const mockUseLinkHandler = useLinkHandler as jest.Mock;
const mockGetOrCreate = getOrCreatePartnerRef as jest.Mock;
const mockHasSeen = hasSeenPartnerDisclosure as jest.Mock;
const mockMarkSeen = markPartnerDisclosureSeen as jest.Mock;
const mockOpenLink = jest.fn();

const SHOP_URL = 'https://x.letsdonation.com/charity/ecommerce';

const setAuth = (over: {
  userId?: string | null;
  email?: string | null;
  firstName?: string;
  lastName?: string;
  contactEmail?: string | null;
  /** Sessione attiva ma profilo assente: accesso social non completato. */
  noProfile?: boolean;
  /** Stato del consenso: 'unknown' all'avvio, 'needed' se va riaccettato. */
  consentState?: 'unknown' | 'ok' | 'needed';
  /** Esito della ri-verifica quando lo stato di partenza è 'unknown'. */
  consentAfterRefresh?: 'unknown' | 'ok' | 'needed';
  /** Profilo non ancora arrivato dalla rete, ma esistente: lo restituisce refreshProfile. */
  profileArrivesLate?: boolean;
}) => {
  const built =
    over.userId && !over.noProfile
      ? {
          first_name: over.firstName ?? 'Mario',
          last_name: over.lastName ?? 'Rossi',
          contact_email: over.contactEmail ?? null,
        }
      : null;
  mockUseAuth.mockReturnValue({
    session: over.userId
      ? { user: { id: over.userId, email: over.email ?? null } }
      : null,
    // Con profileArrivesLate il render corrente NON ha ancora il profilo: arriva
    // solo da refreshProfile, come al primo avvio dell'app.
    profile: over.profileArrivesLate ? null : built,
    refreshProfile: jest
      .fn()
      .mockResolvedValue(over.profileArrivesLate ? built : null),
    consentState: over.consentState ?? 'ok',
    // 'unknown' significa «non ancora tornato»: la ri-verifica risolve nell'esito
    // reale, che nei test è quello dichiarato dal caso (default: mai concesso).
    refreshConsent: jest
      .fn()
      .mockResolvedValue(over.consentAfterRefresh ?? 'unknown'),
    needsReConsent: (over.consentState ?? 'ok') === 'needed',
  });
};

// Setup comune ai blocchi qui sotto: sta al livello del file perché i casi sono
// divisi in due `describe` (il primo aveva superato il tetto di righe per funzione).
beforeEach(() => {
  jest.clearAllMocks();
  mockUseLinkHandler.mockReturnValue({
    openLink: mockOpenLink,
    isLoading: null,
  });
  mockMarkSeen.mockResolvedValue(undefined);
});

/**
 * Quando il prefill porta dati personali, «Dona» non apre più subito: mostra
 * l'avviso che dice quali dati finirebbero nell'indirizzo. Questo helper fa il
 * gesto della persona sull'avviso — `conDati: false` = «continua senza i miei dati».
 */
const confermaAvvisoDonorbox = async (
  result: { current: ReturnType<typeof usePartnerExit> },
  conDati = true
) => {
  await act(async () => {
    await result.current.confirmDonorboxDisclosure(conDati);
  });
};

describe('usePartnerExit', () => {
  it('openDonation → Donorbox con ref in utm_content e prefill anagrafico', async () => {
    setAuth({ userId: 'u1', email: 'mario@gmail.com' });
    mockGetOrCreate.mockResolvedValue('DREF');

    const { result } = renderHook(() => usePartnerExit());
    await act(async () => {
      await result.current.openDonation();
    });
    // Il prefill ha dati personali → prima l'avviso, poi l'uscita.
    expect(result.current.donorboxDisclosureVisible).toBe(true);
    expect(mockOpenLink).not.toHaveBeenCalled();
    await confermaAvvisoDonorbox(result);

    expect(mockGetOrCreate).toHaveBeenCalledWith('donorbox');
    const [url, key] = mockOpenLink.mock.calls[0];
    expect(url).toContain('donorbox.org/dona-ora-rah');
    expect(url).toContain('utm_content=DREF');
    expect(url).toContain('first_name=Mario');
    expect(url).toContain('last_name=Rossi');
    expect(url).toContain('email=mario%40gmail.com');
    expect(key).toBe('donation');
  });

  it("openDonation: sessione SENZA profilo → nessun dato personale nell'URL", async () => {
    // Accesso social non completato: l'utente esiste in auth (e ha un'email in
    // sessione) ma non ha profilo, quindi non c'è prova dell'informativa
    // accettata. Nulla di suo deve raggiungere il partner.
    setAuth({ userId: 'u1', email: 'mario@gmail.com', noProfile: true });
    mockGetOrCreate.mockResolvedValue('DREF');

    const { result } = renderHook(() => usePartnerExit());
    await act(async () => {
      await result.current.openDonation();
    });

    const [url] = mockOpenLink.mock.calls[0];
    expect(url).not.toContain('email=');
    expect(url).not.toContain('first_name=');
    expect(url).not.toContain('last_name=');
    // L'uscita non si blocca e la correlazione resta: solo i dati personali spariscono.
    expect(url).toContain('utm_content=DREF');
  });

  it('openDonation: senza profilo il ref è null → URL nudo, nessun parametro', async () => {
    // Il caso REALE dell'accesso social non completato: partner_refs ha una FK
    // su profiles, quindi senza profilo il ref non nasce proprio (23503 → null).
    setAuth({ userId: 'u1', email: 'mario@gmail.com', noProfile: true });
    mockGetOrCreate.mockResolvedValue(null);

    const { result } = renderHook(() => usePartnerExit());
    await act(async () => {
      await result.current.openDonation();
    });

    const [url] = mockOpenLink.mock.calls[0];
    expect(url).toBe('https://donorbox.org/dona-ora-rah');
  });

  it('openDonation: informativa da riaccettare → nessun dato personale', async () => {
    // Il profilo c'è, ma l'informativa è cambiata in modo sostanziale e non è
    // stata riaccettata: il consenso esiste, non copre la versione corrente.
    setAuth({ userId: 'u1', email: 'mario@gmail.com', consentState: 'needed' });
    mockGetOrCreate.mockResolvedValue('DREF');

    const { result } = renderHook(() => usePartnerExit());
    await act(async () => {
      await result.current.openDonation();
    });

    const [url] = mockOpenLink.mock.calls[0];
    expect(url).not.toContain('email=');
    expect(url).not.toContain('first_name=');
    expect(url).toContain('utm_content=DREF');
  });

  it('openDonation: consenso non ancora verificato → nessun dato personale', async () => {
    // All'avvio consentState è 'unknown' finché due query non tornano, ed è
    // proprio la finestra in cui si tocca «Dona». «Non ancora saputo» non è
    // «a posto»: finché non c'è un ok esplicito non esce nulla di personale.
    setAuth({
      userId: 'u1',
      email: 'mario@gmail.com',
      consentState: 'unknown',
    });
    mockGetOrCreate.mockResolvedValue('DREF');

    const { result } = renderHook(() => usePartnerExit());
    await act(async () => {
      await result.current.openDonation();
    });

    const [url] = mockOpenLink.mock.calls[0];
    expect(url).not.toContain('email=');
    expect(url).not.toContain('first_name=');
    expect(url).toContain('utm_content=DREF');
  });

  it('openDonation: consenso ignoto ma ri-verifica OK → prefill presente', async () => {
    // Il ramo speculare a quello sopra: 'unknown' non significa «negato». Se la
    // ri-verifica dice ok, chi è in regola NON deve perdere la precompilazione.
    setAuth({
      userId: 'u1',
      email: 'mario@gmail.com',
      consentState: 'unknown',
      consentAfterRefresh: 'ok',
    });
    mockGetOrCreate.mockResolvedValue('DREF');

    const { result } = renderHook(() => usePartnerExit());
    await act(async () => {
      await result.current.openDonation();
    });
    // Prefill con dati personali → l'avviso precede l'uscita.
    await confermaAvvisoDonorbox(result);

    const [url] = mockOpenLink.mock.calls[0];
    expect(url).toContain('first_name=Mario');
    expect(url).toContain('email=mario%40gmail.com');
  });

  it('openDonation: profilo non ancora caricato → lo ricarica, NON degrada', async () => {
    // Regressione da evitare: chi tocca «Dona» appena aperta l'app ha profile
    // ancora null perché la rete non ha risposto, ma è un utente in regola.
    setAuth({
      userId: 'u1',
      email: 'mario@gmail.com',
      profileArrivesLate: true,
    });
    mockGetOrCreate.mockResolvedValue('DREF');

    const { result } = renderHook(() => usePartnerExit());
    await act(async () => {
      await result.current.openDonation();
    });
    // Prefill con dati personali → l'avviso precede l'uscita.
    await confermaAvvisoDonorbox(result);

    const [url] = mockOpenLink.mock.calls[0];
    expect(url).toContain('first_name=Mario');
    expect(url).toContain('email=mario%40gmail.com');
  });

  it('openDonation: email Apple relay NON precompilata', async () => {
    setAuth({ userId: 'u1', email: 'abc@privaterelay.appleid.com' });
    mockGetOrCreate.mockResolvedValue('DREF');

    const { result } = renderHook(() => usePartnerExit());
    await act(async () => {
      await result.current.openDonation();
    });
    // Prefill con dati personali → l'avviso precede l'uscita.
    await confermaAvvisoDonorbox(result);

    const [url] = mockOpenLink.mock.calls[0];
    expect(url).not.toContain('email=');
    expect(url).toContain('utm_content=DREF');
  });

  it('openDonation ospite (no ref) → URL senza utm_content, apre comunque', async () => {
    setAuth({ userId: null });
    mockGetOrCreate.mockResolvedValue(null);

    const { result } = renderHook(() => usePartnerExit());
    await act(async () => {
      await result.current.openDonation();
    });

    const [url] = mockOpenLink.mock.calls[0];
    expect(url).not.toContain('utm_content');
    expect(url).not.toContain('email=');
  });

  it('Let s Donation MAI vista → mostra la schermata onesta, non esce ancora', async () => {
    setAuth({ userId: 'u1', email: 'a@b.it' });
    mockHasSeen.mockResolvedValue(false);

    const { result } = renderHook(() => usePartnerExit());
    await act(async () => {
      await result.current.openLetsDonationExit(SHOP_URL, 'shop');
    });

    expect(result.current.disclosureVisible).toBe(true);
    expect(mockOpenLink).not.toHaveBeenCalled();
    expect(mockGetOrCreate).not.toHaveBeenCalled();
  });

  it('Let s Donation GIÀ vista → esce dritto col rise_ref', async () => {
    setAuth({ userId: 'u1', email: 'a@b.it' });
    mockHasSeen.mockResolvedValue(true);
    mockGetOrCreate.mockResolvedValue('LREF');

    const { result } = renderHook(() => usePartnerExit());
    await act(async () => {
      await result.current.openLetsDonationExit(SHOP_URL, 'shop');
    });

    expect(result.current.disclosureVisible).toBe(false);
    expect(mockGetOrCreate).toHaveBeenCalledWith('letsdonation');
    const [url, key] = mockOpenLink.mock.calls[0];
    expect(url).toBe(`${SHOP_URL}?rise_ref=LREF`);
    expect(key).toBe('shop');
  });

  it('confirmDisclosure → memorizza e prosegue l uscita in sospeso', async () => {
    setAuth({ userId: 'u1', email: 'a@b.it' });
    mockHasSeen.mockResolvedValue(false);
    mockGetOrCreate.mockResolvedValue('LREF');

    const { result } = renderHook(() => usePartnerExit());
    await act(async () => {
      await result.current.openLetsDonationExit(SHOP_URL, 'shop');
    });
    await act(async () => {
      await result.current.confirmDisclosure();
    });

    expect(mockMarkSeen).toHaveBeenCalledWith('u1');
    expect(result.current.disclosureVisible).toBe(false);
    const [url] = mockOpenLink.mock.calls[0];
    expect(url).toBe(`${SHOP_URL}?rise_ref=LREF`);
  });

  it('cancelDisclosure → nasconde e NON esce', async () => {
    setAuth({ userId: 'u1', email: 'a@b.it' });
    mockHasSeen.mockResolvedValue(false);

    const { result } = renderHook(() => usePartnerExit());
    await act(async () => {
      await result.current.openLetsDonationExit(SHOP_URL, 'shop');
    });
    act(() => {
      result.current.cancelDisclosure();
    });

    expect(result.current.disclosureVisible).toBe(false);
    expect(mockOpenLink).not.toHaveBeenCalled();
  });
});

// Il pulsante resta toccabile per tutta la pre-flight (ref, profilo, consenso:
// tre viaggi di rete), quindi due tocchi ravvicinati sono uno scenario reale e
// aprivano il browser due volte. I due tocchi partono SENZA attendere il primo —
// è il caso che conta: aspettarlo proverebbe una cosa diversa.
describe('usePartnerExit — doppio tocco', () => {
  it('due tocchi ravvicinati su «Dona» → una sola uscita', async () => {
    setAuth({ userId: 'u1', email: 'mario@gmail.com' });
    mockGetOrCreate.mockResolvedValue('DREF');

    const { result } = renderHook(() => usePartnerExit());
    await act(async () => {
      await Promise.all([
        result.current.openDonation(),
        result.current.openDonation(),
      ]);
    });

    // Con il prefill l'uscita si ferma sull'avviso: il segno che il secondo tocco
    // è stato ignorato è che la pre-flight è stata fatta UNA volta sola.
    expect(mockGetOrCreate).toHaveBeenCalledTimes(1);
    expect(mockOpenLink).not.toHaveBeenCalled();
    await confermaAvvisoDonorbox(result);
    expect(mockOpenLink).toHaveBeenCalledTimes(1);
  });

  it('due tocchi ravvicinati su un’uscita Let’s Donation → una sola uscita', async () => {
    setAuth({ userId: 'u1', email: 'a@b.it' });
    mockHasSeen.mockResolvedValue(true);
    mockGetOrCreate.mockResolvedValue('LREF');

    const { result } = renderHook(() => usePartnerExit());
    await act(async () => {
      await Promise.all([
        result.current.openLetsDonationExit(SHOP_URL, 'shop'),
        result.current.openLetsDonationExit(SHOP_URL, 'shop'),
      ]);
    });

    expect(mockOpenLink).toHaveBeenCalledTimes(1);
  });
});

// L'avviso stava sul canale che manda MENO (Let's Donation: solo un codice
// anonimo) e mancava su quello che manda nome, cognome ed email dentro
// l'indirizzo — dove un indirizzo resta in cronologia e nei log di chi lo riceve.
describe('usePartnerExit — avviso prima di Donorbox', () => {
  it('con dati personali: avverte e NON esce finché non si sceglie', async () => {
    setAuth({ userId: 'u1', email: 'mario@gmail.com' });
    mockGetOrCreate.mockResolvedValue('DREF');
    mockHasSeen.mockResolvedValue(false);

    const { result } = renderHook(() => usePartnerExit());
    await act(async () => {
      await result.current.openDonation();
    });

    expect(result.current.donorboxDisclosureVisible).toBe(true);
    expect(mockOpenLink).not.toHaveBeenCalled();
  });

  it('«continua senza i miei dati»: esce col ref ma senza anagrafica', async () => {
    setAuth({ userId: 'u1', email: 'mario@gmail.com' });
    mockGetOrCreate.mockResolvedValue('DREF');
    mockHasSeen.mockResolvedValue(false);

    const { result } = renderHook(() => usePartnerExit());
    await act(async () => {
      await result.current.openDonation();
    });
    await confermaAvvisoDonorbox(result, false);

    const [url] = mockOpenLink.mock.calls[0];
    expect(url).not.toContain('first_name=');
    expect(url).not.toContain('last_name=');
    expect(url).not.toContain('email=');
    // La donazione resta correlata: si rinuncia ai dati, non alla donazione.
    expect(url).toContain('utm_content=DREF');
  });

  it('senza dati personali NON avverte: non c’è nulla da dichiarare', async () => {
    // Consenso da riaccettare ⇒ prefill vuoto ⇒ nell'indirizzo non finisce nulla
    // di personale, quindi l'uscita resta immediata com'era prima.
    setAuth({ userId: 'u1', email: 'mario@gmail.com', consentState: 'needed' });
    mockGetOrCreate.mockResolvedValue('DREF');
    mockHasSeen.mockResolvedValue(false);

    const { result } = renderHook(() => usePartnerExit());
    await act(async () => {
      await result.current.openDonation();
    });

    expect(result.current.donorboxDisclosureVisible).toBe(false);
    expect(mockOpenLink).toHaveBeenCalledTimes(1);
  });

  it('annullare NON lo marca come letto: chi non sceglie deve rivederlo', async () => {
    setAuth({ userId: 'u1', email: 'mario@gmail.com' });
    mockGetOrCreate.mockResolvedValue('DREF');
    mockHasSeen.mockResolvedValue(false);

    const { result } = renderHook(() => usePartnerExit());
    await act(async () => {
      await result.current.openDonation();
    });
    act(() => {
      result.current.cancelDonorboxDisclosure();
    });

    expect(result.current.donorboxDisclosureVisible).toBe(false);
    expect(mockOpenLink).not.toHaveBeenCalled();
    expect(mockMarkSeen).not.toHaveBeenCalled();
  });

  it('già visto: va dritto, senza rimostrarlo', async () => {
    setAuth({ userId: 'u1', email: 'mario@gmail.com' });
    mockGetOrCreate.mockResolvedValue('DREF');
    mockHasSeen.mockResolvedValue(true);

    const { result } = renderHook(() => usePartnerExit());
    await act(async () => {
      await result.current.openDonation();
    });

    expect(result.current.donorboxDisclosureVisible).toBe(false);
    const [url] = mockOpenLink.mock.calls[0];
    expect(url).toContain('first_name=Mario');
  });

  it('il flag è per CANALE: quello di Let’s Donation non vale per Donorbox', async () => {
    setAuth({ userId: 'u1', email: 'mario@gmail.com' });
    mockGetOrCreate.mockResolvedValue('DREF');
    mockHasSeen.mockResolvedValue(false);

    const { result } = renderHook(() => usePartnerExit());
    await act(async () => {
      await result.current.openDonation();
    });
    await confermaAvvisoDonorbox(result);

    // Marcato sul canale donorbox, non su quello storico: chi ha già visto
    // l'avviso di Let's Donation deve comunque vedere questo, che dice altro.
    expect(mockMarkSeen).toHaveBeenCalledWith('u1', 'donorbox');
  });
});
