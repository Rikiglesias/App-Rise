/**
 * LAZY COMPONENT FACTORY - Creazione type-safe di componenti lazy
 * Utilities per creare componenti lazy con preloading e ottimizzazioni
 */

/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable require-await */
/* eslint-disable no-await-in-loop */

import React from 'react';
import type { ComponentType } from 'react';
import { logger } from '@/shared/utils/logger';

// Cache per i componenti già caricati
const componentCache = new Map<
  string,
  Promise<{ default: ComponentType<unknown> }>
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
 * - Type safety completa
 * - Caching automatico
 * - Preloading intelligente
 * - Error handling robusto
 * - Performance ottimizzate
 */
export const createLazyComponent = (
  importFn: () => Promise<{ default: ComponentType<any> }>,
  options: LazyComponentOptions
): React.LazyExoticComponent<ComponentType<any>> => {
  const { name, preload = false, timeout = 3000, retryAttempts = 1 } = options;

  // Wrapper per gestire caching e retry
  const cachedImportFn = async (): Promise<{
    default: ComponentType<unknown>;
  }> => {
    // Controlla cache
    const cached = componentCache.get(name);
    if (cached) {
      return cached;
    }

    // Crea promise con retry logic
    const importPromise = createRetryableImport(
      importFn,
      retryAttempts,
      timeout
    );

    // Salva in cache
    componentCache.set(name, importPromise);

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

/**
 * Precarica un componente lazy
 */
export const preloadComponent = (name: string): void => {
  const cached = componentCache.get(name);
  if (cached) {
    void cached.catch(error => {
      logger.warn('LazyComponent', `Preload failed for ${name}`, { error });
    });
  }
};

/**
 * Precarica multipli componenti
 */
export const preloadComponents = (names: string[]): void => {
  names.forEach(preloadComponent);
};

/**
 * Ottiene statistiche sui componenti lazy
 */
export const getLazyComponentStats = () => {
  return {
    cached: componentCache.size,
    preloaded: preloadQueue.size,
    cacheKeys: Array.from(componentCache.keys()),
    preloadQueue: Array.from(preloadQueue),
  };
};

/**
 * Pulisce la cache dei componenti
 */
export const clearComponentCache = (): void => {
  componentCache.clear();
  preloadQueue.clear();
};
