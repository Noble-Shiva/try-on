/**
 * Nano Banana API Client (via fal.ai)
 * Fast virtual try-on using Google's Gemini 2.5 Flash
 */

import type { ITryOnProvider, TryOnRequest, TryOnResponse, TryOnError } from '../types/api';
import { PROVIDERS, ENDPOINTS, COSTS } from '../config/constants';

export class NanoBananaClient implements ITryOnProvider {
  readonly name = PROVIDERS.NANO_BANANA as const;
  private apiKey: string;
  private endpoint: string;

  constructor(apiKey: string, endpoint?: string) {
    if (!apiKey) {
      throw new Error('Nano Banana API key is required');
    }
    this.apiKey = apiKey;
    this.endpoint = endpoint || ENDPOINTS.NANO_BANANA;
  }

  /**
   * Perform virtual try-on using Nano Banana
   */
  async tryOn(request: TryOnRequest): Promise<TryOnResponse> {
    const startTime = Date.now();

    try {
      // Dynamically import fal client (to avoid bundling issues)
      const { fal } = await import('@fal-ai/client');

      // Configure API key
      fal.config({
        credentials: this.apiKey
      });

      // Process images (convert File to URL if needed)
      const personImageUrl = await this.processImage(request.personImage);
      const garmentImageUrl = await this.processImage(request.garmentImage);

      // Prepare prompt
      const prompt = this.buildPrompt(request);

      // Make API call
      const result = await fal.subscribe(this.endpoint, {
        input: {
          prompt,
          image_urls: [personImageUrl, garmentImageUrl],
          image_size: request.options?.nanoBanana?.imageSize || 'square_hd'
        },
        logs: false
      });

      // Extract result
      const resultImage = result.data?.images?.[0]?.url;
      if (!resultImage) {
        throw new Error('No result image in response');
      }

      const processingTime = Date.now() - startTime;

      return {
        resultImage,
        processingTime,
        provider: this.name,
        cached: false,
        cost: COSTS.NANO_BANANA,
        metadata: {
          width: result.data?.images?.[0]?.width,
          height: result.data?.images?.[0]?.height,
          contentType: result.data?.images?.[0]?.content_type
        }
      };
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Check if Nano Banana is available
   */
  async isAvailable(): Promise<boolean> {
    try {
      // Simple check - just verify API key is set
      return !!this.apiKey;
    } catch {
      return false;
    }
  }

  /**
   * Estimate cost for a request
   */
  estimateCost(request: TryOnRequest): number {
    return COSTS.NANO_BANANA;
  }

  /**
   * Build prompt for Nano Banana
   */
  private buildPrompt(request: TryOnRequest): string {
    const garmentDesc = request.garmentDescription || 'clothing item';
    return `photo of the person wearing this ${garmentDesc}`;
  }

  /**
   * Process image (convert File to URL or return URL as-is)
   */
  private async processImage(image: string | File): Promise<string> {
    if (typeof image === 'string') {
      return image;
    }

    // Convert File to base64 data URI
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(image);
    });
  }

  /**
   * Handle API errors
   */
  private handleError(error: unknown): TryOnError {
    const err = error as any;

    return {
      code: 'API_ERROR',
      message: err?.message || 'Failed to process try-on with Nano Banana',
      retryable: true,
      suggestion: 'Please try again in a moment',
      originalError: error
    };
  }
}
