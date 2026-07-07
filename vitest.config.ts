import { defineConfig } from 'vitest/config';

// Runner per gli oracoli di accettazione (tests/acceptance/**), esclusi da jest
// perché usano dynamic import() incompatibile col vm CJS di jest (vedi jest.config.js).
// globals: true → describe/it/expect disponibili senza import espliciti (stile jest).
export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['tests/acceptance/**/*.test.ts'],
  },
});
