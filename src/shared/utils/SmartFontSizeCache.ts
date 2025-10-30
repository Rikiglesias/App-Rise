/**
 * SMART FONT SIZE CACHE
 *
 * Sistema di cache intelligente per ottimizzare i calcoli del fontSize
 * nelle modalità a righe fisse del PerfectText (Perfect System).
 *
 * Performance Target:
 * - Hit-rate: ≥ 95% in produzione
 * - Speed: da ~50ms a ~0.1ms per calcolo
 * - Memory: <2MB per 1000+ testi cached
 */

interface FontSizeCacheEntry {
  fontSize: number;
  timestamp: number;
  hitCount: number;
}

interface CacheStats {
  totalRequests: number;
  cacheHits: number;
  cacheMisses: number;
  hitRate: number;
  avgCalculationTime: number;
  memoryUsage: number;
}

class SmartFontSizeCache {
  private cache = new Map<string, FontSizeCacheEntry>();
  private stats: CacheStats = {
    totalRequests: 0,
    cacheHits: 0,
    cacheMisses: 0,
    hitRate: 0,
    avgCalculationTime: 0,
    memoryUsage: 0,
  };
  private cleanupInterval: NodeJS.Timeout | null = null;

  private readonly MAX_CACHE_SIZE = 1000;
  private readonly CACHE_TTL = 30 * 60 * 1000; // 30 minuti
  private readonly CLEANUP_INTERVAL = 5 * 60 * 1000; // 5 minuti

  constructor() {
    // Cleanup periodico per evitare memory leak
    // Non avviare l'interval durante i test Jest
    if (typeof setInterval !== 'undefined' && typeof jest === 'undefined') {
      this.cleanupInterval = setInterval(
        () => this.cleanup(),
        this.CLEANUP_INTERVAL
      );
    }
  }

  /**
   * Genera chiave cache univoca per text + parametri
   */
  private getCacheKey(
    text: string,
    scaledFontSize: number,
    targetLines: number,
    containerWidth: number
  ): string {
    // Ottimizzazione: usa length invece di tutto il testo per performance
    const textLength = text.length;
    const hasLineBreaks = text.includes('\n') ? 1 : 0;

    return `${textLength}-${scaledFontSize}-${targetLines}-${Math.round(containerWidth)}-${hasLineBreaks}`;
  }

  /**
   * Recupera fontSize dalla cache o calcola se non presente
   */
  get(
    text: string,
    scaledFontSize: number,
    targetLines: number,
    containerWidth: number,
    calculateFn: () => number
  ): number {
    const startTime = performance.now();
    this.stats.totalRequests++;

    const cacheKey = this.getCacheKey(
      text,
      scaledFontSize,
      targetLines,
      containerWidth
    );
    const cached = this.cache.get(cacheKey);

    if (cached && this.isValidCacheEntry(cached)) {
      // Cache HIT
      cached.hitCount++;
      this.stats.cacheHits++;
      this.updateStats(startTime);

      return cached.fontSize;
    }

    // Cache MISS - calcola fontSize
    this.stats.cacheMisses++;
    const calculatedFontSize = calculateFn();

    // Salva in cache
    this.set(cacheKey, calculatedFontSize);
    this.updateStats(startTime);

    return calculatedFontSize;
  }

  /**
   * Salva fontSize in cache
   */
  private set(cacheKey: string, fontSize: number): void {
    // Gestione limite cache
    if (this.cache.size >= this.MAX_CACHE_SIZE) {
      this.evictLeastUsed();
    }

    this.cache.set(cacheKey, {
      fontSize,
      timestamp: Date.now(),
      hitCount: 1,
    });
  }

  /**
   * Controlla se entry cache è ancora valida
   */
  private isValidCacheEntry(
    entry: FontSizeCacheEntry,
    currentTime?: number
  ): boolean {
    const now = currentTime ?? Date.now();
    return now - entry.timestamp < this.CACHE_TTL;
  }

  /**
   * Rimuove entry meno usate quando cache è piena
   */
  private evictLeastUsed(): void {
    let leastUsedKey = '';
    let leastUsedCount = Infinity;

    for (const [key, entry] of this.cache.entries()) {
      if (entry.hitCount < leastUsedCount) {
        leastUsedCount = entry.hitCount;
        leastUsedKey = key;
      }
    }

    if (leastUsedKey) {
      this.cache.delete(leastUsedKey);
    }
  }

  /**
   * Cleanup periodico di entry scadute
   */
  private cleanup(): void {
    const now = Date.now();

    for (const [key, entry] of this.cache.entries()) {
      if (!this.isValidCacheEntry(entry, now)) {
        this.cache.delete(key);
      }
    }

    // Aggiorna stats memory usage
    this.updateMemoryUsage();
  }

  /**
   * Aggiorna statistiche performance
   */
  private updateStats(startTime: number): void {
    const endTime = performance.now();
    const calculationTime = endTime - startTime;

    // Moving average per avgCalculationTime
    this.stats.avgCalculationTime =
      (this.stats.avgCalculationTime * (this.stats.totalRequests - 1) +
        calculationTime) /
      this.stats.totalRequests;

    // Hit rate
    this.stats.hitRate =
      (this.stats.cacheHits / this.stats.totalRequests) * 100;

    // Memory usage
    this.updateMemoryUsage();
  }

  /**
   * Calcola utilizzo memoria approssimativo
   */
  private updateMemoryUsage(): void {
    // Stima: ~50 bytes per entry (key + value + overhead)
    this.stats.memoryUsage = this.cache.size * 50;
  }

  /**
   * Ottieni statistiche cache per debugging
   */
  getStats(): CacheStats {
    return { ...this.stats };
  }

  /**
   * Reset cache e statistiche
   */
  clear(): void {
    this.cache.clear();
    this.stats = {
      totalRequests: 0,
      cacheHits: 0,
      cacheMisses: 0,
      hitRate: 0,
      avgCalculationTime: 0,
      memoryUsage: 0,
    };
  }

  /**
   * Distrugge la cache e pulisce l'interval per evitare memory leak
   */
  destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
    this.clear();
  }

  /**
   * Ottieni dimensione cache corrente
   */
  size(): number {
    return this.cache.size;
  }
}

// Istanza singleton
export const smartFontSizeCache = new SmartFontSizeCache();

// Export per testing
export { SmartFontSizeCache };
export type { CacheStats, FontSizeCacheEntry };
