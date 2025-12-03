/**
 * Application constants
 */

/** API Provider identifiers */
export const PROVIDERS = {
  NANO_BANANA: 'nano-banana',
  IDM_VTON: 'idm-vton',
} as const;

/** Quality modes */
export const QUALITY_MODES = {
  FAST: 'fast',
  HIGH: 'high',
} as const;

/** API endpoints */
export const ENDPOINTS = {
  NANO_BANANA: 'fal-ai/nano-banana/edit',
  IDM_VTON: 'cuuupid/idm-vton:c871bb9b046607b680449ecbae55fd8c6d945e0a1948644bf2361b3d021d3ff4',
} as const;

/** Cost per request (in USD) */
export const COSTS = {
  NANO_BANANA: 0.01,
  IDM_VTON: 0.025,
} as const;

/** Processing time estimates (in milliseconds) */
export const PROCESSING_TIMES = {
  NANO_BANANA: 4000,  // ~4 seconds
  IDM_VTON: 19000,    // ~19 seconds
} as const;

/** Image constraints */
export const IMAGE_CONSTRAINTS = {
  MAX_SIZE_MB: 10,
  MIN_DIMENSION: 200,
  RECOMMENDED_DIMENSION: 1024,
  SUPPORTED_FORMATS: ['image/jpeg', 'image/png', 'image/webp'],
} as const;

/** Cache settings */
export const CACHE_SETTINGS = {
  TTL_DAYS: 30,
  MAX_ENTRIES: 100,
} as const;

/** Error codes */
export const ERROR_CODES = {
  INVALID_IMAGE: 'INVALID_IMAGE',
  API_TIMEOUT: 'API_TIMEOUT',
  API_ERROR: 'API_ERROR',
  RATE_LIMIT: 'RATE_LIMIT_EXCEEDED',
  NETWORK_ERROR: 'NETWORK_ERROR',
  INVALID_CONFIG: 'INVALID_CONFIG',
  PROVIDER_UNAVAILABLE: 'PROVIDER_UNAVAILABLE',
  POOR_QUALITY: 'POOR_QUALITY_RESULT',
} as const;

/** Retry settings */
export const RETRY_SETTINGS = {
  MAX_RETRIES: 2,
  INITIAL_DELAY: 1000,  // 1 second
  MAX_DELAY: 10000,     // 10 seconds
  BACKOFF_MULTIPLIER: 2,
} as const;
