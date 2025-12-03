/**
 * Storage Types
 */

export interface StoredPhoto {
  /** Unique identifier */
  id: string;

  /** Photo data URL (base64) */
  dataUrl: string;

  /** Thumbnail data URL (smaller version) */
  thumbnail: string;

  /** Upload timestamp */
  uploadedAt: number;

  /** Last used timestamp */
  lastUsed: number;

  /** Metadata */
  metadata?: {
    width: number;
    height: number;
    size: number;
    type: string;
  };

  /** Optional user label */
  label?: string;
}

export interface CachedResult {
  /** Cache key (hash of inputs) */
  key: string;

  /** Result image URL */
  resultUrl: string;

  /** Provider used */
  provider: string;

  /** Cached at timestamp */
  cachedAt: number;

  /** Expires at timestamp */
  expiresAt: number;

  /** Request metadata */
  metadata?: {
    personImageHash: string;
    garmentImageHash: string;
    quality: string;
  };
}

export interface IStorage {
  /** Get value by key */
  get<T>(key: string): Promise<T | null>;

  /** Set value by key */
  set<T>(key: string, value: T): Promise<void>;

  /** Delete value by key */
  delete(key: string): Promise<void>;

  /** Get all keys */
  getAllKeys(): Promise<string[]>;

  /** Clear all data */
  clear(): Promise<void>;

  /** Get storage size estimate */
  getSize(): Promise<number>;
}
