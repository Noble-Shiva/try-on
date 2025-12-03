/**
 * TryOnButton Component
 * Renders a "Try On" button near detected apparel images
 */

import type { ButtonConfig, ButtonPosition, ButtonTheme, ButtonSize } from '../../types/ui';

const DEFAULT_CONFIG: ButtonConfig = {
  position: 'bottom',
  theme: 'auto',
  text: 'Try On',
  size: 'medium',
  icon: '👕'
};

export class TryOnButton {
  private button: HTMLButtonElement;
  private container: HTMLDivElement;
  private config: ButtonConfig;
  private onClick: () => void;
  private wrapper?: HTMLDivElement;

  constructor(config: Partial<ButtonConfig> = {}, onClick: () => void) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.onClick = onClick;
    this.container = this.createContainer();
    this.button = this.createButton();
    this.container.appendChild(this.button);
  }

  /**
   * Create button container
   */
  private createContainer(): HTMLDivElement {
    const container = document.createElement('div');
    container.className = 'tryon-button-container tryon-component';

    if (this.config.position === 'overlay') {
      container.classList.add('tryon-button-container--overlay');
    }

    if (this.config.customClass) {
      container.classList.add(this.config.customClass);
    }

    return container;
  }

  /**
   * Create button element
   */
  private createButton(): HTMLButtonElement {
    const button = document.createElement('button');
    button.className = 'tryon-button';
    button.type = 'button';

    // Add size class
    button.classList.add(`tryon-button--${this.config.size}`);

    // Add theme class
    if (this.config.theme !== 'auto') {
      button.classList.add(`tryon-button--${this.config.theme}`);
    }

    // Add icon if provided
    if (this.config.icon) {
      const iconSpan = document.createElement('span');
      iconSpan.className = 'tryon-button-icon';
      iconSpan.innerHTML = this.config.icon;
      button.appendChild(iconSpan);
    }

    // Add text
    const textSpan = document.createElement('span');
    textSpan.textContent = this.config.text;
    button.appendChild(textSpan);

    // Apply custom styles
    if (this.config.customStyles) {
      Object.assign(button.style, this.config.customStyles);
    }

    // Add click handler
    button.addEventListener('click', this.onClick);

    // Accessibility
    button.setAttribute('aria-label', 'Try on this item virtually');

    return button;
  }

  /**
   * Inject button near target image
   */
  injectNear(targetImage: HTMLImageElement): void {
    if (this.config.position === 'bottom') {
      // Insert after image
      targetImage.after(this.container);
    } else if (this.config.position === 'top') {
      // Insert before image
      targetImage.before(this.container);
    } else if (this.config.position === 'overlay') {
      // Create wrapper and overlay button
      this.createOverlay(targetImage);
    }
  }

  /**
   * Create overlay position (button on top of image)
   */
  private createOverlay(targetImage: HTMLImageElement): void {
    // Check if already wrapped
    if (targetImage.parentElement?.classList.contains('tryon-image-wrapper')) {
      const existingWrapper = targetImage.parentElement;
      existingWrapper.appendChild(this.container);
      return;
    }

    // Create wrapper
    this.wrapper = document.createElement('div');
    this.wrapper.className = 'tryon-image-wrapper';
    this.wrapper.style.position = 'relative';
    this.wrapper.style.display = 'inline-block';
    this.wrapper.style.width = '100%';

    // Insert wrapper
    targetImage.parentElement?.insertBefore(this.wrapper, targetImage);

    // Move image into wrapper
    this.wrapper.appendChild(targetImage);

    // Add button to wrapper
    this.wrapper.appendChild(this.container);
  }

  /**
   * Set loading state
   */
  setLoading(loading: boolean): void {
    if (loading) {
      this.button.disabled = true;
      this.button.classList.add('tryon-button--loading');
      this.button.setAttribute('aria-busy', 'true');
    } else {
      this.button.disabled = false;
      this.button.classList.remove('tryon-button--loading');
      this.button.removeAttribute('aria-busy');
    }
  }

  /**
   * Set disabled state
   */
  setDisabled(disabled: boolean): void {
    this.button.disabled = disabled;
  }

  /**
   * Update button text
   */
  setText(text: string): void {
    const textSpan = this.button.querySelector('span:not(.tryon-button-icon)');
    if (textSpan) {
      textSpan.textContent = text;
    }
  }

  /**
   * Show button
   */
  show(): void {
    this.container.style.display = 'flex';
  }

  /**
   * Hide button
   */
  hide(): void {
    this.container.style.display = 'none';
  }

  /**
   * Remove button from DOM
   */
  destroy(): void {
    this.button.removeEventListener('click', this.onClick);
    this.container.remove();

    // Clean up wrapper if we created one
    if (this.wrapper) {
      const img = this.wrapper.querySelector('img');
      if (img && this.wrapper.parentElement) {
        this.wrapper.parentElement.insertBefore(img, this.wrapper);
      }
      this.wrapper.remove();
    }
  }

  /**
   * Get button element (for advanced customization)
   */
  getElement(): HTMLButtonElement {
    return this.button;
  }

  /**
   * Get container element
   */
  getContainer(): HTMLDivElement {
    return this.container;
  }
}
