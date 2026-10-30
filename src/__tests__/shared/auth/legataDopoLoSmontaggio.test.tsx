// C97 (giro valido del delta 1, abc-1, f2-1, f1-1): smontata la schermata i ref del render non si
// aggiornano più, quindi la guardia chiede ad AuthContext chi è collegato ADESSO. File NUOVO (R27).
import { renderHook } from '@testing-library/react-native';

import { useAuth } from '@/shared/auth/AuthContext';
import { useLegataAllUtente } from '@/shared/auth/useLegataAllUtente';

jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({
    popTo: jest.fn(),
    goBack: jest.fn(),
    canGoBack: () => false,
    getState: () => ({ routeNames: ['Account'] }),
  }),
}));
jest.mock('@/shared/auth/AuthContext', () => ({ useAuth: jest.fn() }));

let collegato: string | null;
const apri = () => {
  collegato = 'A';
  jest.mocked(useAuth).mockReturnValue({
    session: { user: { id: 'A' } },
    utenteCollegato: () => collegato,
  } as unknown as ReturnType<typeof useAuth>);
  return renderHook(() => useLegataAllUtente());
};

it('guardia: schermata smontata e già collegato B, non vale più', () => {
  const { result, unmount } = apri();
  const legata = result.current;
  unmount();
  collegato = 'B';
  expect(legata()).toBe(false);
});

it('guardia: schermata smontata e ancora collegato A, vale', () => {
  // Chi torna indietro mentre salva non deve perdere in silenzio il resto del salvataggio.
  const { result, unmount } = apri();
  const legata = result.current;
  unmount();
  expect(legata()).toBe(true);
});

it('guardia: schermata smontata e nessuno collegato, non vale', () => {
  const { result, unmount } = apri();
  const legata = result.current;
  unmount();
  collegato = null;
  expect(legata()).toBe(false);
});

it('guardia: schermata montata e account del render, vale', () => {
  const { result } = apri();
  expect(result.current()).toBe(true);
});
