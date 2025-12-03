/**
 * IDM-VTON API Client (via Replicate)
 * High-quality virtual try-on using state-of-the-art diffusion model
 */

import type { ITryOnProvider, TryOnRequest, TryOnResponse, TryOnError } from '../types/api';
import { PROVIDERS, ENDPOINTS, COSTS } from '../config/constants';

export class IDMVTONClient implements ITryOnProvider {
  readonly name = PROVIDERS.IDM_VTON as const;
  private apiToken: string;
  private modelVersion: string;

  constructor(apiToken: string, modelVersion?: string) {
    if (!apiToken) {
      throw new Error('Replicate API token is required');
    }
    this.apiToken = apiToken;
    this.modelVersion = modelVersion || ENDPOINTS.IDM_VTON;
  }

  /**
   * Perform virtual try-on using IDM-VTON
   */
  async tryOn(request: TryOnRequest): Promise<TryOnResponse> {
    const startTime = Date.now();

    try {
      // Dynamically import Replicate client
      const Replicate = (await import('replicate')).default;

      const replicate = new Replicate({
        auth: this.apiToken
      });

      // Process images
      const personImageUrl = await this.processImage(request.personImage);
      const garmentImageUrl = await this.processImage(request.garmentImage);

      // Prepare input
      const input = {
        human_img: personImageUrl,
        garm_img: garmentImageUrl,
        garment_des: request.garmentDescription || '',
        is_checked: request.options?.idmVton?.isChecked ?? true,
        is_checked_crop: request.options?.idmVton?.isCheckedCrop ?? false,
        denoise_steps: request.options?.idmVton?.denoiseSteps ?? 30,
        seed: request.options?.idmVton?.seed ?? 42
      };

      // Run prediction
      const output = await replicate.run(this.modelVersion, { input });

      // Extract result (output is typically a string URL)
      const resultImage = typeof output === 'string' ? output : (output as any)?.[0];

      if (!resultImage) {
        throw new Error('No result image in response');
      }

      const processingTime = Date.now() - startTime;

      return {
        resultImage,
        processingTime,
        provider: this.name,
        cached: false,
        cost: COSTS.IDM_VTON
      };
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Check if IDM-VTON is available
   */
  async isAvailable(): Promise<boolean> {
    try {
      return !!this.apiToken;
    } catch {
      return false;
    }
  }

  /**
   * Estimate cost for a request
   */
  estimateCost(request: TryOnRequest): number {
    return COSTS.IDM_VTON;
  }

  /**
   * Process image (convert File to URL or return URL as-is)
   */
  private async processImage(image: string | File): Promise<string> {
    if (typeof image === 'string') {
      return image;
    }

    // For IDM-VTON, we need to convert File to base64 data URI
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
      message: err?.message || 'Failed to process try-on with IDM-VTON',
      retryable: true,
      suggestion: 'Please try again in a moment',
      originalError: error
    };
  }
}
