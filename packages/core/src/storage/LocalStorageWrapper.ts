/**
 * LocalStorage Wrapper
 * Simple key-value storage using browser localStorage
 */

import type { IStorage } from '../types/storage';

export class LocalStorageWrapper implements IStorage {
  private prefix: string;

  constructor(prefix: string = 'tryon') {
    this.prefix = prefix;
  }

  /**
   * Get prefixed key
   */
  private getKey(key: string): string {
    return `${this.prefix}:${key}`;
  }

  /**
   * Get value by key
   */
  async get<T>(key: string): Promise<T | null> {
    try {
      const fullKey = this.getKey(key);
      const value = localStorage.getItem(fullKey);

      if (value === null) {
        return null;
      }

      return JSON.parse(value) as T;
    } catch (error) {
      console.error('LocalStorage get error:', error);
      return null;
    }
  }

  /**
   * Set value by key
   */
  async set<T>(key: string, value: T): Promise<void> {
    try {
      const fullKey = this.getKey(key);
      const serialized = JSON.stringify(value);
      localStorage.setItem(fullKey, serialized);
    } catch (error) {
      // Check if quota exceeded
      if (error instanceof DOMException && error.name === 'QuotaExceededError') {
        throw new Error('Storage quota exceeded. Please clear some photos.');
      }
      throw error;
    }
  }

  /**
   * Delete value by key
   */
  async delete(key: string): Promise<void> {
    const fullKey = this.getKey(key);
    localStorage.removeItem(fullKey);
  }

  /**
   * Get all keys with prefix
   */
  async getAllKeys(): Promise<string[]> {
    const keys: string[] = [];
    const prefixWithColon = `${this.prefix}:`;

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(prefixWithColon)) {
        // Remove prefix from key
        keys.push(key.substring(prefixWithColon.length));
      }
    }

    return keys;
  }

  /**
   * Clear all data with prefix
   */
  async clear(): Promise<void> {
    const keys = await this.getAllKeys();
    for (const key of keys) {
      await this.delete(key);
    }
  }

  /**
   * Get approximate storage size (in bytes)
   */
  async getSize(): Promise<number> {
    let size = 0;
    const keys = await this.getAllKeys();

    for (const key of keys) {
      const fullKey = this.getKey(key);
      const value = localStorage.getItem(fullKey);
      if (value) {
        // Approximate size: key length + value length (in UTF-16)
        size += fullKey.length * 2 + value.length * 2;
      }
    }

    return size;
  }
}
