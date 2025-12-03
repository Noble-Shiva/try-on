/**
 * TryOnPlugin - Main plugin orchestrator
 * Ties together detection, UI, storage, and API services
 */

import {
  ImageDetector,
  TryOnButton,
  Modal,
  PhotoStorage,
  CacheManager,
  createTryOnService,
  type DetectedImage,
  type TryOnService,
  type ProviderConfig,
  type ButtonConfig,
  type ModalConfig
} from '@try-on/core';

export interface PluginConfig extends ProviderConfig {
  /** Button configuration */
  button?: Partial<ButtonConfig>;

  /** Modal configuration */
  modal?: Partial<ModalConfig>;

  /** Detection configuration */
  detection?: {
    minConfidence?: number;
    enableMonitoring?: boolean;
    scanInterval?: number;
  };

  /** Storage configuration */
  storage?: {
    useIndexedDB?: boolean;
    enableCache?: boolean;
  };

  /** Debug mode */
  debug?: boolean;

  /** Callbacks */
  onSuccess?: (result: any) => void;
  onError?: (error: Error) => void;
  onButtonClick?: (image: DetectedImage) => void;
}

export class TryOnPlugin {
  private config: PluginConfig;
  private detector?: ImageDetector;
  private tryOnService?: TryOnService;
  private photoStorage?: PhotoStorage;
  private cacheManager?: CacheManager;
  private modal?: Modal;
  private buttons: Map<string, TryOnButton> = new Map();
  private initialized: boolean = false;

  constructor(config: PluginConfig) {
    this.config = config;
  }

  /**
   * Initialize plugin
   */
  async init(): Promise<void> {
    if (this.initialized) {
      console.warn('Plugin already initialized');
      return;
    }

    this.log('Initializing plugin...', this.config);

    try {
      // Initialize try-on service
      this.tryOnService = createTryOnService({
        nanaBanana: this.config.nanaBanana,
        idmVton: this.config.idmVton,
        defaultProvider: this.config.defaultProvider,
        enableFallback: this.config.enableFallback
      });

      // Initialize storage
      this.photoStorage = new PhotoStorage(
        this.config.storage?.useIndexedDB !== false
      );

      // Initialize cache
      if (this.config.storage?.enableCache !== false) {
        this.cacheManager = new CacheManager();
      }

      // Initialize modal
      this.modal = new Modal(this.config.modal);

      // Initialize detector
      this.detector = new ImageDetector({
        minConfidence: this.config.detection?.minConfidence || 0.6,
        enableMonitoring: this.config.detection?.enableMonitoring !== false,
        scanInterval: this.config.detection?.scanInterval || 2000
      });

      // Start monitoring for images
      this.detector.startMonitoring((result) => {
        this.log(`Detected ${result.images.length} apparel images`);
        this.handleDetectedImages(result.images);
      });

      this.initialized = true;
      this.log('Plugin initialized successfully');
    } catch (error) {
      this.log('Failed to initialize plugin:', error);
      throw error;
    }
  }

  /**
   * Handle detected images
   */
  private handleDetectedImages(images: DetectedImage[]): void {
    images.forEach(img => {
      // Skip if button already added
      if (this.buttons.has(img.id)) {
        return;
      }

      // Create try-on button
      const button = new TryOnButton(
        this.config.button || {},
        () => this.handleButtonClick(img)
      );

      // Inject button
      button.injectNear(img.element);

      // Store button reference
      this.buttons.set(img.id, button);

      this.log(`Added button for image: ${img.id} (${img.category || 'unknown'})`);
    });
  }

  /**
   * Handle button click
   */
  private async handleButtonClick(image: DetectedImage): Promise<void> {
    this.log('Try-on button clicked for:', image);

    // Call user callback if provided
    if (this.config.onButtonClick) {
      this.config.onButtonClick(image);
    }

    const button = this.buttons.get(image.id);
    if (!button) return;

    try {
      // Set button loading
      button.setLoading(true);

      // Get user photo
      const userPhoto = await this.getUserPhoto();
      if (!userPhoto) {
        button.setLoading(false);
        return;
      }

      // Check cache first
      let resultUrl: string | null = null;

      if (this.cacheManager) {
        const cacheKey = this.cacheManager.generateKey(userPhoto.dataUrl, image.src);
        const cached = await this.cacheManager.get(cacheKey);

        if (cached) {
          this.log('Using cached result');
          resultUrl = cached.resultUrl;
        }
      }

      // If not cached, make API call
      if (!resultUrl && this.tryOnService) {
        this.log('Making try-on API call...');

        const result = await this.tryOnService.tryOn({
          personImage: userPhoto.dataUrl,
          garmentImage: image.src,
          quality: 'fast',
          garmentDescription: image.category
        });

        resultUrl = result.resultImage;

        // Cache result
        if (this.cacheManager && resultUrl) {
          const cacheKey = this.cacheManager.generateKey(userPhoto.dataUrl, image.src);
          await this.cacheManager.set(cacheKey, resultUrl, result.provider);
        }

        // Call success callback
        if (this.config.onSuccess) {
          this.config.onSuccess(result);
        }
      }

      // Show result in modal
      if (resultUrl && this.modal) {
        this.modal.show(resultUrl);
      }

      button.setLoading(false);
    } catch (error) {
      this.log('Try-on failed:', error);
      button.setLoading(false);

      // Call error callback
      if (this.config.onError) {
        this.config.onError(error as Error);
      }

      // Show error message
      alert('Failed to process try-on. Please try again.');
    }
  }

  /**
   * Get user photo (prompt upload if needed)
   */
  private async getUserPhoto(): Promise<{ dataUrl: string } | null> {
    if (!this.photoStorage) return null;

    // Check if user has a default photo
    const defaultPhoto = await this.photoStorage.getDefaultPhoto();

    if (defaultPhoto) {
      return { dataUrl: defaultPhoto.dataUrl };
    }

    // Prompt for photo upload
    return new Promise((resolve) => {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/*';

      input.onchange = async (e) => {
        const file = (e.target as HTMLInputElement).files?.[0];
        if (!file || !this.photoStorage) {
          resolve(null);
          return;
        }

        try {
          const photo = await this.photoStorage.savePhoto(file);
          resolve({ dataUrl: photo.dataUrl });
        } catch (error) {
          this.log('Failed to save photo:', error);
          alert('Failed to process photo. Please try again.');
          resolve(null);
        }
      };

      input.click();
    });
  }

  /**
   * Destroy plugin
   */
  destroy(): void {
    this.log('Destroying plugin...');

    // Stop detector
    if (this.detector) {
      this.detector.stopMonitoring();
    }

    // Remove all buttons
    this.buttons.forEach(button => button.destroy());
    this.buttons.clear();

    // Destroy modal
    if (this.modal) {
      this.modal.destroy();
    }

    this.initialized = false;
    this.log('Plugin destroyed');
  }

  /**
   * Get plugin stats
   */
  async getStats() {
    const detectorStats = this.detector?.getStats();
    const storageInfo = await this.photoStorage?.getStorageInfo();
    const cacheStats = await this.cacheManager?.getStats();

    return {
      initialized: this.initialized,
      detection: detectorStats,
      storage: storageInfo,
      cache: cacheStats,
      buttonCount: this.buttons.size
    };
  }

  /**
   * Manual photo upload
   */
  async uploadPhoto(file: File): Promise<void> {
    if (!this.photoStorage) {
      throw new Error('Storage not initialized');
    }

    await this.photoStorage.savePhoto(file);
  }

  /**
   * Clear user photos
   */
  async clearPhotos(): Promise<void> {
    if (!this.photoStorage) return;
    await this.photoStorage.deleteAllPhotos();
  }

  /**
   * Clear cache
   */
  async clearCache(): Promise<void> {
    if (!this.cacheManager) return;
    await this.cacheManager.clear();
  }

  /**
   * Debug logging
   */
  private log(...args: any[]): void {
    if (this.config.debug) {
      console.log('[TryOn Plugin]', ...args);
    }
  }
}
