/**
 * Detection Types
 */

export interface DetectedImage {
  /** The image element */
  element: HTMLImageElement;

  /** Image source URL */
  src: string;

  /** Bounding rectangle */
  bounds: DOMRect;

  /** Confidence score (0-1) that this is an apparel image */
  confidence: number;

  /** Detected category if known */
  category?: 'top' | 'dress' | 'jacket' | 'bottom' | 'outerwear';

  /** Unique identifier for this detection */
  id: string;
}

export interface DetectionConfig {
  /** Minimum image width in pixels */
  minWidth: number;

  /** Minimum image height in pixels */
  minHeight: number;

  /** Minimum aspect ratio (width/height) */
  minAspectRatio: number;

  /** Maximum aspect ratio (width/height) */
  maxAspectRatio: number;

  /** Interval for rescanning the page (ms) */
  scanInterval: number;

  /** CSS selectors to exclude from detection */
  excludeSelectors: string[];

  /** Minimum confidence score to consider (0-1) */
  minConfidence: number;

  /** Enable continuous monitoring */
  enableMonitoring: boolean;
}

export interface ScanResult {
  /** All detected images */
  images: DetectedImage[];

  /** Scan timestamp */
  timestamp: number;

  /** Total images scanned */
  totalScanned: number;

  /** Images that passed filters */
  filtered: number;
}
