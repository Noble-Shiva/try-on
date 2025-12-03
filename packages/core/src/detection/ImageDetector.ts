/**
 * ImageDetector - Main detector with heuristic scoring
 */

import { DOMScanner } from './DOMScanner';
import type { DetectedImage, DetectionConfig, ScanResult } from '../types/detection';

export class ImageDetector {
  private scanner: DOMScanner;
  private config: DetectionConfig;
  private observer?: MutationObserver;
  private detectedImages: Map<string, DetectedImage>;
  private scanCount: number = 0;

  constructor(config: Partial<DetectionConfig> = {}) {
    this.config = {
      minWidth: 200,
      minHeight: 200,
      minAspectRatio: 0.5,
      maxAspectRatio: 2.0,
      scanInterval: 2000,
      excludeSelectors: [
        'nav', 'header', 'footer', 'aside',
        '.navigation', '.menu', '.sidebar',
        '.ad', '.advertisement', '.banner'
      ],
      minConfidence: 0.5,
      enableMonitoring: true,
      ...config
    };

    this.scanner = new DOMScanner(this.config);
    this.detectedImages = new Map();
  }

  /**
   * Scan page for apparel images
   */
  scan(): ScanResult {
    const startTime = Date.now();

    // Get all images
    const allImages = this.scanner.getAllImages();
    const totalScanned = allImages.length;

    // Filter by size
    const filtered = this.scanner.filterBySize(allImages);

    // Score and classify
    const detected: DetectedImage[] = [];

    for (const img of filtered) {
      const confidence = this.calculateConfidence(img);

      if (confidence >= this.config.minConfidence) {
        const detectedImage: DetectedImage = {
          element: img,
          src: img.src,
          bounds: img.getBoundingClientRect(),
          confidence,
          category: this.detectCategory(img),
          id: this.generateId(img)
        };

        detected.push(detectedImage);
        this.detectedImages.set(detectedImage.id, detectedImage);
      }
    }

    this.scanCount++;

    return {
      images: detected,
      timestamp: Date.now(),
      totalScanned,
      filtered: filtered.length
    };
  }

  /**
   * Calculate confidence score (0-1) that image is apparel
   */
  private calculateConfidence(img: HTMLImageElement): number {
    let score = 0;
    const maxScore = 10;

    // 1. Check class names and IDs (2 points)
    const classNames = img.className.toLowerCase();
    const id = (img.id || '').toLowerCase();

    if (classNames.includes('product') || id.includes('product')) {
      score += 1;
    }
    if (classNames.includes('item') || classNames.includes('apparel') || classNames.includes('clothing')) {
      score += 1;
    }

    // 2. Check alt text (1 point)
    const alt = (img.alt || '').toLowerCase();
    const apparelKeywords = ['shirt', 'dress', 'jacket', 'pant', 'skirt', 'top', 'blouse', 'coat', 'sweater', 'hoodie'];
    if (apparelKeywords.some(keyword => alt.includes(keyword))) {
      score += 1;
    }

    // 3. Check parent context (3 points)
    const context = this.scanner.getParentContext(img);
    if (context.isProductCard) score += 1;
    if (context.hasPrice) score += 1;
    if (context.hasAddToCart) score += 1;

    // 4. Check data attributes (1 point)
    if (img.hasAttribute('data-product-id') ||
        img.hasAttribute('data-product') ||
        img.hasAttribute('data-item-id')) {
      score += 1;
    }

    // 5. Check aspect ratio - clothing usually portrait (1 point)
    const bounds = img.getBoundingClientRect();
    const aspectRatio = bounds.width / bounds.height;
    if (aspectRatio >= 0.6 && aspectRatio <= 1.2) {
      score += 1;
    }

    // 6. Check if in gallery/carousel (product pages often have these) (1 point)
    if (this.scanner.isInGallery(img)) {
      score += 1;
    }

    // Normalize to 0-1
    return Math.min(score / maxScore, 1.0);
  }

  /**
   * Detect category from image context
   */
  private detectCategory(img: HTMLImageElement): DetectedImage['category'] {
    const text = [
      img.alt || '',
      img.title || '',
      img.className || '',
      img.parentElement?.textContent || ''
    ].join(' ').toLowerCase();

    // Match patterns
    if (/\b(shirt|blouse|top|tee|t-shirt)\b/.test(text)) return 'top';
    if (/\b(dress|gown)\b/.test(text)) return 'dress';
    if (/\b(jacket|coat|blazer)\b/.test(text)) return 'jacket';
    if (/\b(pant|jeans|trousers|skirt|shorts)\b/.test(text)) return 'bottom';
    if (/\b(outerwear|parka|windbreaker)\b/.test(text)) return 'outerwear';

    return undefined;
  }

  /**
   * Generate unique ID for image
   */
  private generateId(img: HTMLImageElement): string {
    // Use src as base, add position if multiple images with same src
    const srcHash = btoa(img.src).substring(0, 16);
    const rect = img.getBoundingClientRect();
    const posHash = `${Math.round(rect.top)}-${Math.round(rect.left)}`;
    return `img-${srcHash}-${posHash}`;
  }

  /**
   * Start continuous monitoring for new images
   */
  startMonitoring(callback?: (result: ScanResult) => void): void {
    if (!this.config.enableMonitoring) return;

    // Initial scan
    const initialResult = this.scan();
    callback?.(initialResult);

    // Set up periodic scanning
    const intervalId = setInterval(() => {
      const result = this.scan();

      // Only notify if new images found
      if (result.images.length > this.detectedImages.size) {
        callback?.(result);
      }
    }, this.config.scanInterval);

    // Set up mutation observer for dynamic content
    this.observer = new MutationObserver((mutations) => {
      // Check if images were added
      const hasNewImages = mutations.some(mutation => {
        return Array.from(mutation.addedNodes).some(node => {
          if (node instanceof HTMLImageElement) return true;
          if (node instanceof HTMLElement) {
            return node.querySelector('img') !== null;
          }
          return false;
        });
      });

      if (hasNewImages) {
        // Debounce - scan after a delay
        setTimeout(() => {
          const result = this.scan();
          callback?.(result);
        }, 500);
      }
    });

    this.observer.observe(document.body, {
      childList: true,
      subtree: true
    });

    // Store interval ID for cleanup
    (this as any)._intervalId = intervalId;
  }

  /**
   * Stop monitoring
   */
  stopMonitoring(): void {
    if (this.observer) {
      this.observer.disconnect();
      this.observer = undefined;
    }

    if ((this as any)._intervalId) {
      clearInterval((this as any)._intervalId);
      (this as any)._intervalId = undefined;
    }
  }

  /**
   * Get detected images
   */
  getDetectedImages(): DetectedImage[] {
    return Array.from(this.detectedImages.values());
  }

  /**
   * Clear detected images
   */
  clear(): void {
    this.detectedImages.clear();
  }

  /**
   * Get detection stats
   */
  getStats() {
    return {
      totalDetected: this.detectedImages.size,
      scanCount: this.scanCount,
      averageConfidence: this.getAverageConfidence()
    };
  }

  private getAverageConfidence(): number {
    const images = Array.from(this.detectedImages.values());
    if (images.length === 0) return 0;

    const sum = images.reduce((acc, img) => acc + img.confidence, 0);
    return sum / images.length;
  }
}
