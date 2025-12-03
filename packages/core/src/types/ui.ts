/**
 * UI Component Types
 */

export type ButtonPosition = 'bottom' | 'overlay' | 'top';
export type ButtonTheme = 'light' | 'dark' | 'auto';
export type ButtonSize = 'small' | 'medium' | 'large';

export interface ButtonConfig {
  /** Button position relative to image */
  position: ButtonPosition;

  /** Theme/color scheme */
  theme: ButtonTheme;

  /** Button text */
  text: string;

  /** Button size */
  size: ButtonSize;

  /** Icon HTML (optional) */
  icon?: string;

  /** Custom styles */
  customStyles?: Partial<CSSStyleDeclaration>;

  /** Custom CSS class */
  customClass?: string;
}

export interface ModalConfig {
  /** Modal title */
  title?: string;

  /** Enable download button */
  enableDownload: boolean;

  /** Enable share button */
  enableShare: boolean;

  /** Close on overlay click */
  closeOnOverlayClick: boolean;

  /** Show comparison (before/after) */
  showComparison: boolean;
}

export interface UploaderConfig {
  /** Allow webcam capture */
  enableWebcam: boolean;

  /** Accept file types */
  accept: string[];

  /** Maximum file size (bytes) */
  maxSize: number;

  /** Show preview */
  showPreview: boolean;

  /** Instructions text */
  instructions?: string;
}

export interface ToastConfig {
  /** Toast type */
  type: 'success' | 'error' | 'info' | 'warning';

  /** Message */
  message: string;

  /** Duration in ms (0 = permanent) */
  duration: number;

  /** Position */
  position: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center' | 'bottom-center';
}
