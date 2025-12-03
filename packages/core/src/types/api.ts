/**
 * API Types for Virtual Try-On Service
 */

export type TryOnProvider = 'nano-banana' | 'idm-vton';
export type QualityMode = 'fast' | 'high';

/**
 * Request to perform a virtual try-on
 */
export interface TryOnRequest {
  /** User's photo (URL or base64 data URI) */
  personImage: string | File;

  /** Garment image (URL or base64 data URI) */
  garmentImage: string | File;

  /** Optional description of the garment */
  garmentDescription?: string;

  /** Quality mode: 'fast' uses Nano Banana, 'high' uses IDM-VTON */
  quality: QualityMode;

  /** Enable result caching (default: true) */
  cacheEnabled?: boolean;

  /** Additional provider-specific options */
  options?: TryOnOptions;
}

/**
 * Provider-specific options
 */
export interface TryOnOptions {
  /** IDM-VTON specific options */
  idmVton?: {
    denoiseSteps?: number;  // 10-50, default: 30
    seed?: number;
    isChecked?: boolean;    // Use cloth mask (recommended: true)
    isCheckedCrop?: boolean;
  };

  /** Nano Banana specific options */
  nanaBanana?: {
    imageSize?: 'square_hd' | 'square' | 'portrait_4_3' | 'portrait_16_9' | 'landscape_4_3' | 'landscape_16_9';
  };
}

/**
 * Response from virtual try-on
 */
export interface TryOnResponse {
  /** URL to the result image */
  resultImage: string;

  /** Processing time in milliseconds */
  processingTime: number;

  /** Provider used for this try-on */
  provider: TryOnProvider;

  /** Whether result came from cache */
  cached: boolean;

  /** Cost of this request (in USD) */
  cost?: number;

  /** Confidence score (0-1, if available) */
  confidence?: number;

  /** Additional metadata */
  metadata?: {
    width?: number;
    height?: number;
    contentType?: string;
  };
}

/**
 * Error from try-on service
 */
export interface TryOnError {
  /** Error code */
  code: string;

  /** Human-readable error message */
  message: string;

  /** Whether the request can be retried */
  retryable: boolean;

  /** Suggestion for user action */
  suggestion?: string;

  /** Original error (for debugging) */
  originalError?: unknown;
}

/**
 * Base interface for API providers
 */
export interface ITryOnProvider {
  /** Name of the provider */
  readonly name: TryOnProvider;

  /** Perform virtual try-on */
  tryOn(request: TryOnRequest): Promise<TryOnResponse>;

  /** Check if provider is available */
  isAvailable(): Promise<boolean>;

  /** Get estimated cost for a request */
  estimateCost(request: TryOnRequest): number;
}

/**
 * Configuration for API providers
 */
export interface ProviderConfig {
  /** Nano Banana configuration */
  nanaBanana?: {
    apiKey: string;
    endpoint?: string;
  };

  /** IDM-VTON configuration */
  idmVton?: {
    apiToken: string;
    modelVersion?: string;
  };

  /** Default provider to use */
  defaultProvider?: TryOnProvider;

  /** Enable automatic fallback */
  enableFallback?: boolean;
}
