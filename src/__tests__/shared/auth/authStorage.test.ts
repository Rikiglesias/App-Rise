import { authStorage } from '@/shared/auth/authStorage';

jest.mock('expo-secure-store', () => {
  const store = new Map<string, string>();
  return {
    getItemAsync: jest.fn((k: string) => Promise.resolve(store.get(k) ?? null)),
    setItemAsync: jest.fn((k: string, v: string) => {
      store.set(k, v);
      return Promise.resolve();
    }),
    deleteItemAsync: jest.fn((k: string) => {
      store.delete(k);
      return Promise.resolve();
    }),
  };
});

describe('authStorage (SecureStore chunking)', () => {
  it('round-trip valore piccolo', async () => {
    await authStorage.setItem('k', 'small');
    expect(await authStorage.getItem('k')).toBe('small');
  });

  it('round-trip valore grande (>2048 byte → chunked)', async () => {
    const big = 'x'.repeat(5000);
    await authStorage.setItem('big', big);
    expect(await authStorage.getItem('big')).toBe(big);
  });

  it('removeItem pulisce tutti i chunk', async () => {
    await authStorage.setItem('r', 'y'.repeat(5000));
    await authStorage.removeItem('r');
    expect(await authStorage.getItem('r')).toBeNull();
  });

  it('getItem su chiave assente → null', async () => {
    expect(await authStorage.getItem('nope')).toBeNull();
  });

  it('setItem sovrascrive (no chunk orfani da valore precedente più lungo)', async () => {
    await authStorage.setItem('s', 'z'.repeat(5000));
    await authStorage.setItem('s', 'short');
    expect(await authStorage.getItem('s')).toBe('short');
  });
});
