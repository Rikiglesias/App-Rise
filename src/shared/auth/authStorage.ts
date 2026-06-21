import { Platform } from 'react-native';
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

// Su web `expo-secure-store` non esiste (modulo nativo): usa `localStorage`. Vale solo
// per dev/preview web — niente cifratura keychain/keystore, accettabile perché il
// target di produzione è iOS/Android. Su web non c'è il limite 2048B → nessun chunking.
const webStorage = {
  // localStorage è sincrono → ritorno Promise esplicito (no `async` senza `await`)
  // per rispettare il contratto async dell'adapter Supabase.
  getItem: (key: string): Promise<string | null> =>
    Promise.resolve(
      typeof localStorage !== 'undefined' ? localStorage.getItem(key) : null
    ),
  setItem: (key: string, value: string): Promise<void> => {
    if (typeof localStorage !== 'undefined') localStorage.setItem(key, value);
    return Promise.resolve();
  },
  removeItem: (key: string): Promise<void> => {
    if (typeof localStorage !== 'undefined') localStorage.removeItem(key);
    return Promise.resolve();
  },
};

export const authStorage =
  Platform.OS === 'web' ? webStorage : { getItem, setItem, removeItem };
