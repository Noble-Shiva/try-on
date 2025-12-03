/**
 * Modal Component
 * Displays try-on results in a modal dialog
 */

import type { ModalConfig } from '../../types/ui';

const DEFAULT_CONFIG: ModalConfig = {
  title: 'Virtual Try-On Result',
  enableDownload: true,
  enableShare: false,
  closeOnOverlayClick: true,
  showComparison: false
};

export class Modal {
  private overlay: HTMLDivElement;
  private modal: HTMLDivElement;
  private config: ModalConfig;
  private onClose?: () => void;

  constructor(config: Partial<ModalConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.overlay = this.createOverlay();
    this.modal = this.createModal();
    this.overlay.appendChild(this.modal);
  }

  /**
   * Create overlay element
   */
  private createOverlay(): HTMLDivElement {
    const overlay = document.createElement('div');
    overlay.className = 'tryon-modal-overlay tryon-component';
    overlay.style.display = 'none';

    // Close on overlay click
    if (this.config.closeOnOverlayClick) {
      overlay.addEventListener('click', (e) => {
        if (e.target === overlay) {
          this.close();
        }
      });
    }

    // Close on Escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && overlay.style.display !== 'none') {
        this.close();
      }
    });

    return overlay;
  }

  /**
   * Create modal element
   */
  private createModal(): HTMLDivElement {
    const modal = document.createElement('div');
    modal.className = 'tryon-modal';
    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-modal', 'true');

    if (this.config.title) {
      modal.setAttribute('aria-labelledby', 'tryon-modal-title');
    }

    return modal;
  }

  /**
   * Show modal with result image
   */
  show(resultImageUrl: string): void {
    // Clear previous content
    this.modal.innerHTML = '';

    // Header
    const header = this.createHeader();
    this.modal.appendChild(header);

    // Body with image
    const body = this.createBody(resultImageUrl);
    this.modal.appendChild(body);

    // Footer with actions
    const footer = this.createFooter(resultImageUrl);
    this.modal.appendChild(footer);

    // Append to body and show
    if (!this.overlay.parentElement) {
      document.body.appendChild(this.overlay);
    }

    this.overlay.style.display = 'flex';

    // Prevent body scroll
    document.body.style.overflow = 'hidden';

    // Focus trap
    const firstFocusable = this.modal.querySelector('button') as HTMLElement;
    firstFocusable?.focus();
  }

  /**
   * Create header
   */
  private createHeader(): HTMLDivElement {
    const header = document.createElement('div');
    header.className = 'tryon-modal-header';

    if (this.config.title) {
      const title = document.createElement('h2');
      title.id = 'tryon-modal-title';
      title.className = 'tryon-modal-title';
      title.textContent = this.config.title;
      header.appendChild(title);
    }

    // Close button
    const closeBtn = document.createElement('button');
    closeBtn.className = 'tryon-modal-close';
    closeBtn.setAttribute('aria-label', 'Close modal');
    closeBtn.innerHTML = `
      <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
        <path d="M10 8.586L4.707 3.293a1 1 0 00-1.414 1.414L8.586 10l-5.293 5.293a1 1 0 101.414 1.414L10 11.414l5.293 5.293a1 1 0 001.414-1.414L11.414 10l5.293-5.293a1 1 0 00-1.414-1.414L10 8.586z"/>
      </svg>
    `;
    closeBtn.addEventListener('click', () => this.close());
    header.appendChild(closeBtn);

    return header;
  }

  /**
   * Create body
   */
  private createBody(imageUrl: string): HTMLDivElement {
    const body = document.createElement('div');
    body.className = 'tryon-modal-body';

    const img = document.createElement('img');
    img.src = imageUrl;
    img.alt = 'Virtual try-on result';
    img.className = 'tryon-modal-image';

    img.addEventListener('load', () => {
      // Image loaded successfully
    });

    img.addEventListener('error', () => {
      body.innerHTML = '<p>Failed to load result image</p>';
    });

    body.appendChild(img);

    return body;
  }

  /**
   * Create footer
   */
  private createFooter(imageUrl: string): HTMLDivElement {
    const footer = document.createElement('div');
    footer.className = 'tryon-modal-footer';

    // Download button
    if (this.config.enableDownload) {
      const downloadBtn = document.createElement('button');
      downloadBtn.className = 'tryon-modal-button tryon-modal-button--primary';
      downloadBtn.textContent = 'Download';
      downloadBtn.addEventListener('click', () => this.downloadImage(imageUrl));
      footer.appendChild(downloadBtn);
    }

    // Share button (placeholder - would need actual share implementation)
    if (this.config.enableShare) {
      const shareBtn = document.createElement('button');
      shareBtn.className = 'tryon-modal-button tryon-modal-button--secondary';
      shareBtn.textContent = 'Share';
      shareBtn.addEventListener('click', () => this.shareImage(imageUrl));
      footer.appendChild(shareBtn);
    }

    return footer;
  }

  /**
   * Close modal
   */
  close(): void {
    this.overlay.style.display = 'none';
    document.body.style.overflow = '';

    if (this.onClose) {
      this.onClose();
    }
  }

  /**
   * Download image
   */
  private async downloadImage(url: string): Promise<void> {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);

      const a = document.createElement('a');
      a.href = blobUrl;
      a.download = `tryon-result-${Date.now()}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

      URL.revokeObjectURL(blobUrl);
    } catch (error) {
      console.error('Failed to download image:', error);
      alert('Failed to download image. Please try right-clicking and saving instead.');
    }
  }

  /**
   * Share image (placeholder)
   */
  private async shareImage(url: string): Promise<void> {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'My Virtual Try-On',
          text: 'Check out how this looks on me!',
          url: url
        });
      } catch (error) {
        console.log('Share cancelled or failed:', error);
      }
    } else {
      // Fallback: copy URL to clipboard
      try {
        await navigator.clipboard.writeText(url);
        alert('Link copied to clipboard!');
      } catch (error) {
        alert('Sharing not supported. URL: ' + url);
      }
    }
  }

  /**
   * Set close callback
   */
  setOnClose(callback: () => void): void {
    this.onClose = callback;
  }

  /**
   * Destroy modal
   */
  destroy(): void {
    this.overlay.remove();
  }
}
