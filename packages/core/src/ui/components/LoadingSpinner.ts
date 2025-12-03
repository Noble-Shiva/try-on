/**
 * LoadingSpinner Component
 * Reusable loading indicator with multiple variants
 */

export type SpinnerSize = 'small' | 'medium' | 'large';

export interface SpinnerConfig {
  size?: SpinnerSize;
  message?: string;
  hint?: string;
}

export class LoadingSpinner {
  private spinner: HTMLDivElement;
  private overlay?: HTMLDivElement;

  constructor(config: SpinnerConfig = {}) {
    this.spinner = this.createSpinner(config.size || 'medium');

    if (config.message) {
      this.overlay = this.createOverlay(config.message, config.hint);
      this.overlay.appendChild(this.spinner);
    }
  }

  /**
   * Create spinner element
   */
  private createSpinner(size: SpinnerSize): HTMLDivElement {
    const spinner = document.createElement('div');
    spinner.className = `tryon-spinner tryon-spinner--${size} tryon-component`;

    const circle = document.createElement('div');
    circle.className = 'tryon-spinner-circle';

    spinner.appendChild(circle);

    return spinner;
  }

  /**
   * Create full-screen overlay
   */
  private createOverlay(message: string, hint?: string): HTMLDivElement {
    const overlay = document.createElement('div');
    overlay.className = 'tryon-spinner-overlay tryon-component';

    const messageEl = document.createElement('div');
    messageEl.className = 'tryon-spinner-message';
    messageEl.textContent = message;

    overlay.appendChild(this.spinner);
    overlay.appendChild(messageEl);

    if (hint) {
      const hintEl = document.createElement('div');
      hintEl.className = 'tryon-spinner-hint';
      hintEl.textContent = hint;
      overlay.appendChild(hintEl);
    }

    return overlay;
  }

  /**
   * Show spinner
   */
  show(container?: HTMLElement): void {
    if (this.overlay) {
      // Full-screen overlay
      if (!this.overlay.parentElement) {
        document.body.appendChild(this.overlay);
      }
      this.overlay.style.display = 'flex';
      document.body.style.overflow = 'hidden';
    } else if (container) {
      // Inline spinner
      container.appendChild(this.spinner);
    }
  }

  /**
   * Hide spinner
   */
  hide(): void {
    if (this.overlay) {
      this.overlay.style.display = 'none';
      document.body.style.overflow = '';
    } else {
      this.spinner.remove();
    }
  }

  /**
   * Update message
   */
  setMessage(message: string, hint?: string): void {
    if (this.overlay) {
      const messageEl = this.overlay.querySelector('.tryon-spinner-message');
      if (messageEl) {
        messageEl.textContent = message;
      }

      if (hint) {
        let hintEl = this.overlay.querySelector('.tryon-spinner-hint');
        if (hintEl) {
          hintEl.textContent = hint;
        } else {
          hintEl = document.createElement('div');
          hintEl.className = 'tryon-spinner-hint';
          hintEl.textContent = hint;
          this.overlay.appendChild(hintEl);
        }
      }
    }
  }

  /**
   * Get spinner element
   */
  getElement(): HTMLDivElement {
    return this.spinner;
  }

  /**
   * Destroy spinner
   */
  destroy(): void {
    if (this.overlay) {
      this.overlay.remove();
    } else {
      this.spinner.remove();
    }
  }
}
