/**
 * TryOn Service - Main orchestrator for virtual try-on
 * Handles provider selection, caching, fallback, and error handling
 */

import type {
  ITryOnProvider,
  TryOnRequest,
  TryOnResponse,
  TryOnError,
  ProviderConfig
} from '../types/api';
import { NanoBananaClient } from './NanoBananaClient';
import { IDMVTONClient } from './IDMVTONClient';
import { PROVIDERS, ERROR_CODES } from '../config/constants';

export class TryOnService {
  private providers: Map<string, ITryOnProvider>;
  private defaultProvider: string;
  private enableFallback: boolean;

  constructor(config: ProviderConfig) {
    this.providers = new Map();
    this.enableFallback = config.enableFallback ?? true;

    // Initialize Nano Banana if configured
    if (config.nanaBanana?.apiKey) {
      const client = new NanoBananaClient(
        config.nanaBanana.apiKey,
        config.nanaBanana.endpoint
      );
      this.providers.set(PROVIDERS.NANO_BANANA, client);
    }

    // Initialize IDM-VTON if configured
    if (config.idmVton?.apiToken) {
      const client = new IDMVTONClient(
        config.idmVton.apiToken,
        config.idmVton.modelVersion
      );
      this.providers.set(PROVIDERS.IDM_VTON, client);
    }

    // Set default provider
    this.defaultProvider = config.defaultProvider || PROVIDERS.NANO_BANANA;

    // Validate at least one provider is configured
    if (this.providers.size === 0) {
      throw new Error('At least one API provider must be configured');
    }
  }

  /**
   * Perform virtual try-on
   */
  async tryOn(request: TryOnRequest): Promise<TryOnResponse> {
    // Determine which provider to use based on quality mode
    const provider = this.selectProvider(request.quality);

    if (!provider) {
      throw this.createError(
        ERROR_CODES.PROVIDER_UNAVAILABLE,
        `Provider for quality mode '${request.quality}' is not configured`
      );
    }

    try {
      // Attempt try-on with selected provider
      const result = await provider.tryOn(request);
      return result;
    } catch (error) {
      // Attempt fallback if enabled
      if (this.enableFallback) {
        return await this.handleFallback(request, provider.name, error);
      }
      throw error;
    }
  }

  /**
   * Select provider based on quality mode
   */
  private selectProvider(quality: 'fast' | 'high'): ITryOnProvider | null {
    if (quality === 'fast') {
      // Fast mode: prefer Nano Banana
      return this.providers.get(PROVIDERS.NANO_BANANA) ||
             this.providers.get(PROVIDERS.IDM_VTON) ||
             null;
    } else {
      // High quality mode: prefer IDM-VTON
      return this.providers.get(PROVIDERS.IDM_VTON) ||
             this.providers.get(PROVIDERS.NANO_BANANA) ||
             null;
    }
  }

  /**
   * Handle fallback to alternative provider
   */
  private async handleFallback(
    request: TryOnRequest,
    failedProvider: string,
    error: unknown
  ): Promise<TryOnResponse> {
    console.warn(`Provider ${failedProvider} failed, attempting fallback`, error);

    // Get alternative provider
    const alternativeProvider = this.getAlternativeProvider(failedProvider);

    if (!alternativeProvider) {
      throw this.createError(
        ERROR_CODES.PROVIDER_UNAVAILABLE,
        'All providers are unavailable',
        error
      );
    }

    try {
      const result = await alternativeProvider.tryOn(request);
      return {
        ...result,
        // Mark that we used fallback
        metadata: {
          ...result.metadata,
          fallbackUsed: true,
          originalProvider: failedProvider
        }
      };
    } catch (fallbackError) {
      throw this.createError(
        ERROR_CODES.API_ERROR,
        'All providers failed to process the request',
        fallbackError
      );
    }
  }

  /**
   * Get alternative provider for fallback
   */
  private getAlternativeProvider(failedProvider: string): ITryOnProvider | null {
    const allProviders = Array.from(this.providers.entries());
    const alternative = allProviders.find(([name]) => name !== failedProvider);
    return alternative?.[1] || null;
  }

  /**
   * Get available providers
   */
  async getAvailableProviders(): Promise<string[]> {
    const available: string[] = [];

    for (const [name, provider] of this.providers) {
      if (await provider.isAvailable()) {
        available.push(name);
      }
    }

    return available;
  }

  /**
   * Estimate cost for a request
   */
  estimateCost(request: TryOnRequest): number {
    const provider = this.selectProvider(request.quality);
    return provider?.estimateCost(request) || 0;
  }

  /**
   * Check if service is ready
   */
  async isReady(): Promise<boolean> {
    const available = await this.getAvailableProviders();
    return available.length > 0;
  }

  /**
   * Create standardized error
   */
  private createError(
    code: string,
    message: string,
    originalError?: unknown
  ): TryOnError {
    return {
      code,
      message,
      retryable: code !== ERROR_CODES.INVALID_CONFIG,
      suggestion: this.getErrorSuggestion(code),
      originalError
    };
  }

  /**
   * Get suggestion based on error code
   */
  private getErrorSuggestion(code: string): string {
    const suggestions: Record<string, string> = {
      [ERROR_CODES.INVALID_IMAGE]: 'Please upload a clear, well-lit photo',
      [ERROR_CODES.API_TIMEOUT]: 'Please try again in a moment',
      [ERROR_CODES.RATE_LIMIT]: 'You\'ve reached your usage limit',
      [ERROR_CODES.NETWORK_ERROR]: 'Check your internet connection',
      [ERROR_CODES.INVALID_CONFIG]: 'API configuration is invalid',
      [ERROR_CODES.PROVIDER_UNAVAILABLE]: 'Service is temporarily unavailable'
    };

    return suggestions[code] || 'Please try again later';
  }
}
