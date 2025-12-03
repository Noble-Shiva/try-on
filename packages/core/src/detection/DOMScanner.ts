/**
 * DOMScanner - Scans page for images and filters by size/attributes
 */

import type { DetectionConfig } from '../types/detection';

export class DOMScanner {
  private config: DetectionConfig;

  constructor(config: DetectionConfig) {
    this.config = config;
  }

  /**
   * Get all images on the page
   */
  getAllImages(): HTMLImageElement[] {
    const images = Array.from(document.querySelectorAll('img'));
    return images.filter(img => !this.shouldExclude(img));
  }

  /**
   * Filter images by size and aspect ratio
   */
  filterBySize(images: HTMLImageElement[]): HTMLImageElement[] {
    return images.filter(img => {
      // Wait for image to load if not loaded
      if (!img.complete || img.naturalWidth === 0) {
        return false;
      }

      const bounds = img.getBoundingClientRect();

      // Check if image is visible
      if (bounds.width === 0 || bounds.height === 0) {
        return false;
      }

      // Check minimum size
      if (bounds.width < this.config.minWidth || bounds.height < this.config.minHeight) {
        return false;
      }

      // Check aspect ratio
      const aspectRatio = bounds.width / bounds.height;
      if (aspectRatio < this.config.minAspectRatio || aspectRatio > this.config.maxAspectRatio) {
        return false;
      }

      // Check if image is in viewport or near it (for lazy loading)
      const rect = bounds;
      const windowHeight = window.innerHeight || document.documentElement.clientHeight;
      const windowWidth = window.innerWidth || document.documentElement.clientWidth;

      const vertInView = (rect.top <= windowHeight) && ((rect.top + rect.height) >= 0);
      const horInView = (rect.left <= windowWidth) && ((rect.left + rect.width) >= 0);

      return vertInView && horInView;
    });
  }

  /**
   * Check if image should be excluded based on selectors
   */
  private shouldExclude(img: HTMLImageElement): boolean {
    // Check exclude selectors
    for (const selector of this.config.excludeSelectors) {
      if (img.matches(selector) || img.closest(selector)) {
        return true;
      }
    }

    // Exclude very small images (likely icons/logos)
    if (img.naturalWidth < 50 || img.naturalHeight < 50) {
      return true;
    }

    // Exclude common non-product image classes/attributes
    const excludePatterns = [
      'logo', 'icon', 'avatar', 'thumbnail', 'banner',
      'ad', 'advertisement', 'social', 'badge'
    ];

    const classStr = img.className.toLowerCase();
    const idStr = (img.id || '').toLowerCase();
    const altStr = (img.alt || '').toLowerCase();

    for (const pattern of excludePatterns) {
      if (classStr.includes(pattern) || idStr.includes(pattern) || altStr.includes(pattern)) {
        return true;
      }
    }

    return false;
  }

  /**
   * Get parent element info (useful for context)
   */
  getParentContext(img: HTMLImageElement): {
    hasPrice: boolean;
    hasAddToCart: boolean;
    isProductCard: boolean;
  } {
    const parent = img.closest('[data-product], .product, .product-card, .product-item, article');

    if (!parent) {
      return {
        hasPrice: false,
        hasAddToCart: false,
        isProductCard: false
      };
    }

    const parentText = parent.textContent || '';

    return {
      hasPrice: /\$[\d,]+\.?\d*/.test(parentText) || /£[\d,]+\.?\d*/.test(parentText) || /€[\d,]+\.?\d*/.test(parentText),
      hasAddToCart: /add to (cart|bag|basket)/i.test(parentText) || /buy now/i.test(parentText),
      isProductCard: true
    };
  }

  /**
   * Check if images are in a gallery/carousel
   */
  isInGallery(img: HTMLImageElement): boolean {
    const gallerySelectors = [
      '.gallery', '.carousel', '.slider', '.swiper',
      '[data-gallery]', '[data-carousel]', '[data-slider]'
    ];

    for (const selector of gallerySelectors) {
      if (img.closest(selector)) {
        return true;
      }
    }

    return false;
  }

  /**
   * Get primary image from a gallery
   */
  getPrimaryImageFromGallery(img: HTMLImageElement): HTMLImageElement | null {
    const gallery = img.closest('.gallery, .carousel, .slider, .swiper');
    if (!gallery) return null;

    // Look for active/selected image
    const activeImg = gallery.querySelector('img.active, img.selected, img[data-active="true"]') as HTMLImageElement;
    if (activeImg) return activeImg;

    // Otherwise return first large image
    const images = Array.from(gallery.querySelectorAll('img')) as HTMLImageElement[];
    const largeImages = images.filter(i => i.naturalWidth >= 400 && i.naturalHeight >= 400);

    return largeImages[0] || images[0] || null;
  }
}
