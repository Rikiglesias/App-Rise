/**
 * LAZY COMPONENT FACTORY - Creazione type-safe di componenti lazy
 * Utilities per creare componenti lazy con preloading e ottimizzazioni
 *
 * ESLint Disable Justification:
 * - no-await-in-loop: Legittimo per retry logic sequenziale (linea 124)
 * - no-explicit-any: Necessario per cache globale di componenti con props eterogenee.
 *   Una cache che gestisce componenti diversi non può essere type-safe senza any,
 *   perché i tipi delle props cambiano per ogni componente.
 */
/* eslint-disable no-await-in-loop */
/* eslint-disable @typescript-eslint/no-explicit-any */

import React from 'react';
import type { ComponentType } from 'react';
import { logger } from '@/shared/utils/logger';

// Cache per i componenti già caricati
// any è necessario: cache gestisce componenti con props diverse
const componentCache = new Map<
  string,
  Promise<{ default: ComponentType<any> }>
>();

// Preload queue per componenti da precaricare
const preloadQueue = new Set<string>();

interface LazyComponentOptions {
  /** Nome univoco per il componente (per caching) */
  name: string;
  /** Se precaricare il componente in background */
  preload?: boolean;
  /** Timeout per il caricamento (ms) */
  timeout?: number;
  /** Retry automatici in caso di errore */
  retryAttempts?: number;
}

/**
 * Crea un componente lazy con caching e preloading
 *
 * BENEFICI:
 * - Caching automatico
 * - Preloading intelligente
 * - Error handling robusto
 * - Performance ottimizzate
 *
 * NOTA: `any` è necessario per la cache globale che gestisce componenti
 * con props eterogenee. Impossibile usare generics o unknown per questo caso.
 */
export const createLazyComponent = (
  importFn: () => Promise<{ default: ComponentType<any> }>,
  options: LazyComponentOptions
): React.LazyExoticComponent<ComponentType<any>> => {
  const { name, preload = false, timeout = 3000, retryAttempts = 1 } = options;

  // Wrapper per gestire caching e retry
  const cachedImportFn = async (): Promise<{
    default: ComponentType<any>;
  }> => {
    // Controlla cache
    const cached = componentCache.get(name);
    if (cached) {
      return await cached;
    }

    // Crea promise con retry logic
    const importPromise = await createRetryableImport(
      importFn,
      retryAttempts,
      timeout
    );

    // Salva in cache prima di ritornare
    const cachedPromise = Promise.resolve(importPromise);
    componentCache.set(name, cachedPromise);

    return importPromise;
  };

  // Crea componente lazy
  const LazyComponent = React.lazy(cachedImportFn);

  // Preload se richiesto (salta in ambiente di test/CI)
  const isTestEnv =
    process.env.NODE_ENV === 'test' ||
    (typeof process !== 'undefined' && !!process.env.JEST_WORKER_ID);

  if (preload && !preloadQueue.has(name) && !isTestEnv) {
    preloadQueue.add(name);
    // Preload in background dopo un breve delay
    setTimeout(() => {
      void cachedImportFn().catch(error => {
        logger.warn('LazyComponent', `Preload failed for ${name}`, { error });
      });
    }, 100);
  }

  return LazyComponent;
};

/**
 * Crea import function con retry logic e timeout
 */
const createRetryableImport = async (
  importFn: () => Promise<{ default: ComponentType<any> }>,
  maxRetries: number,
  timeout: number
): Promise<{ default: ComponentType<any> }> => {
  let lastError: Error = new Error('Import failed');

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      // Crea promise con timeout
      const importPromise = Promise.race([
        importFn(),
        new Promise<never>((_, reject) => {
          setTimeout(
            () => reject(new Error(`Import timeout after ${timeout}ms`)),
            timeout
          );
        }),
      ]);

      return await importPromise;
    } catch (error) {
      lastError = error as Error;

      // Se non è l'ultimo tentativo, aspetta prima di riprovare
      if (attempt < maxRetries) {
        await new Promise(resolve => setTimeout(resolve, 1000 * (attempt + 1)));
      }
    }
  }

  throw lastError;
};
