import * as SecureStore from 'expo-secure-store';

/**
 * Storage adapter per la sessione Supabase basato su expo-secure-store.
 *
 * SecureStore cifra nativamente (iOS keychain / Android keystore) ma limita ogni
 * voce a ~2048 byte; la sessione Supabase è più grande. Questo adapter splitta il
 * valore in chunk e tiene un contatore in `<key>__chunks`, ricomponendolo in lettura.
 * I token JWT sono ASCII (1 byte/char) → CHUNK_SIZE in caratteri ≈ byte.
 */

const CHUNK_SIZE = 2000; // margine sotto il limite 2048B
const metaKey = (key: string): string => `${key}__chunks`;
const chunkKey = (key: string, i: number): string => `${key}__${i}`;

const removeItem = async (key: string): Promise<void> => {
  const meta = await SecureStore.getItemAsync(metaKey(key));
  if (meta !== null) {
    const count = parseInt(meta, 10);
    await Promise.all(
      Array.from({ length: count }, (_, i) =>
        SecureStore.deleteItemAsync(chunkKey(key, i))
      )
    );
    await SecureStore.deleteItemAsync(metaKey(key));
  }
  await SecureStore.deleteItemAsync(key);
};

const setItem = async (key: string, value: string): Promise<void> => {
  // pulisci eventuali chunk/valore precedenti (evita chunk orfani)
  await removeItem(key);

  if (value.length <= CHUNK_SIZE) {
    await SecureStore.setItemAsync(key, value);
    return;
  }

  const count = Math.ceil(value.length / CHUNK_SIZE);
  await Promise.all(
    Array.from({ length: count }, (_, i) =>
      SecureStore.setItemAsync(
        chunkKey(key, i),
        value.slice(i * CHUNK_SIZE, (i + 1) * CHUNK_SIZE)
      )
    )
  );
  await SecureStore.setItemAsync(metaKey(key), String(count));
};

const getItem = async (key: string): Promise<string | null> => {
  const meta = await SecureStore.getItemAsync(metaKey(key));
  if (meta === null) {
    // valore non chunked (piccolo) o assente
    return SecureStore.getItemAsync(key);
  }
  const count = parseInt(meta, 10);
  const parts = await Promise.all(
    Array.from({ length: count }, (_, i) =>
      SecureStore.getItemAsync(chunkKey(key, i))
    )
  );
  if (parts.some(p => p === null)) return null; // chunk mancante → corrotto
  return parts.join('');
};

export const authStorage = { getItem, setItem, removeItem };
