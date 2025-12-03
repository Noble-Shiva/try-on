/**
 * CacheManager - Manages try-on result caching
 */

import type { CachedResult, IStorage } from '../types/storage';
import { LocalStorageWrapper } from './LocalStorageWrapper';

export class CacheManager {
  private storage: IStorage;
  private readonly CACHE_KEY_PREFIX = 'cache';
  private readonly DEFAULT_TTL_DAYS = 30;

  constructor() {
    this.storage = new LocalStorageWrapper('tryon-cache');
  }

  /**
   * Generate cache key from inputs
   */
  generateKey(personImage: string | File, garmentImage: string | File): string {
    // Create simple hash from inputs
    const personStr = typeof personImage === 'string' ? personImage : personImage.name;
    const garmentStr = typeof garmentImage === 'string' ? garmentImage : garmentImage.name;

    return this.simpleHash(personStr + garmentStr);
  }

  /**
   * Get cached result
   */
  async get(cacheKey: string): Promise<CachedResult | null> {
    const cached = await this.storage.get<CachedResult>(
      `${this.CACHE_KEY_PREFIX}:${cacheKey}`
    );

    if (!cached) {
      return null;
    }

    // Check if expired
    if (Date.now() > cached.expiresAt) {
      await this.delete(cacheKey);
      return null;
    }

    return cached;
  }

  /**
   * Set cached result
   */
  async set(
    cacheKey: string,
    resultUrl: string,
    provider: string,
    ttlDays: number = this.DEFAULT_TTL_DAYS
  ): Promise<void> {
    const now = Date.now();
    const ttlMs = ttlDays * 24 * 60 * 60 * 1000;

    const cached: CachedResult = {
      key: cacheKey,
      resultUrl,
      provider,
      cachedAt: now,
      expiresAt: now + ttlMs
    };

    await this.storage.set(`${this.CACHE_KEY_PREFIX}:${cacheKey}`, cached);
  }

  /**
   * Delete cached result
   */
  async delete(cacheKey: string): Promise<void> {
    await this.storage.delete(`${this.CACHE_KEY_PREFIX}:${cacheKey}`);
  }

  /**
   * Clear all cache
   */
  async clear(): Promise<void> {
    await this.storage.clear();
  }

  /**
   * Cleanup expired entries
   */
  async cleanup(): Promise<number> {
    const keys = await this.storage.getAllKeys();
    const cacheKeys = keys.filter(k => k.startsWith(this.CACHE_KEY_PREFIX));

    let deletedCount = 0;
    const now = Date.now();

    for (const key of cacheKeys) {
      const cached = await this.storage.get<CachedResult>(key);

      if (cached && now > cached.expiresAt) {
        await this.storage.delete(key);
        deletedCount++;
      }
    }

    return deletedCount;
  }

  /**
   * Get cache stats
   */
  async getStats(): Promise<{
    entryCount: number;
    totalSize: number;
    oldestEntry?: Date;
    newestEntry?: Date;
  }> {
    const keys = await this.storage.getAllKeys();
    const cacheKeys = keys.filter(k => k.startsWith(this.CACHE_KEY_PREFIX));

    const entries = await Promise.all(
      cacheKeys.map(key => this.storage.get<CachedResult>(key))
    );

    const validEntries = entries.filter((e): e is CachedResult => e !== null);

    if (validEntries.length === 0) {
      return {
        entryCount: 0,
        totalSize: 0
      };
    }

    const timestamps = validEntries.map(e => e.cachedAt).sort();
    const totalSize = await this.storage.getSize();

    return {
      entryCount: validEntries.length,
      totalSize,
      oldestEntry: new Date(timestamps[0]),
      newestEntry: new Date(timestamps[timestamps.length - 1])
    };
  }

  /**
   * Simple hash function
   */
  private simpleHash(str: string): string {
    let hash = 0;

    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // Convert to 32-bit integer
    }

    return Math.abs(hash).toString(36);
  }
}
