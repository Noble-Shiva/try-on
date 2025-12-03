/**
 * @try-on/core - Virtual Try-On Core Library
 *
 * Main entry point for the virtual try-on functionality
 */

// Export API services
export { TryOnService, NanaBananaClient, IDMVTONClient } from './api';

// Export detection
export { ImageDetector, DOMScanner } from './detection';

// Export UI components
export { TryOnButton, Modal } from './ui';

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
} from './types/api';

export type {
  DetectedImage,
  DetectionConfig,
  ScanResult
} from './types/detection';

export type {
  ButtonConfig,
  ButtonPosition,
  ButtonTheme,
  ButtonSize,
  ModalConfig,
  UploaderConfig,
  ToastConfig
} from './types/ui';

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
import type { ProviderConfig } from './types/api';

export function createTryOnService(config: ProviderConfig): TryOnService {
  return new TryOnService(config);
}
