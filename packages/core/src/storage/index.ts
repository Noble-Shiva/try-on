/**
 * Storage Module Exports
 */

export { PhotoStorage } from './PhotoStorage';
export { CacheManager } from './CacheManager';
export { LocalStorageWrapper } from './LocalStorageWrapper';
export { IndexedDBStorage } from './IndexedDBStorage';

export type {
  StoredPhoto,
  CachedResult,
  IStorage
} from '../types/storage';
