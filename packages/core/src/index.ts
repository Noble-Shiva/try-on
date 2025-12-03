/**
 * @try-on/core - Virtual Try-On Core Library
 *
 * Main entry point for the virtual try-on functionality
 */

// Export API services
export { TryOnService, NanoBananaClient, IDMVTONClient } from './api';

// Export types
export type {
  TryOnRequest,
  TryOnResponse,
  TryOnError,
  TryOnProvider,
  QualityMode,
  TryOnOptions,
  ITryOnProvider,
  ProviderConfig
} from './types';

// Export constants
export {
  PROVIDERS,
  QUALITY_MODES,
  ENDPOINTS,
  COSTS,
  PROCESSING_TIMES,
  IMAGE_CONSTRAINTS,
  ERROR_CODES
} from './config';

/**
 * Factory function to create TryOn service instance
 */
import { TryOnService } from './api';
import type { ProviderConfig } from './types';

export function createTryOnService(config: ProviderConfig): TryOnService {
  return new TryOnService(config);
}
