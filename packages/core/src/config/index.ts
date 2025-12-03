/**
 * Configuration Module Exports
 */

export * from './constants';

/**
 * Default configuration
 */
export const DEFAULT_CONFIG = {
  enableFallback: true,
  cacheEnabled: true,
  quality: 'fast' as const,
} as const;
