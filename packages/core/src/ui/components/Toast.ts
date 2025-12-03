/**
 * Toast Notification System
 * Display temporary notification messages
 */

import type { ToastConfig } from '../../types/ui';

type ToastPosition = 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center' | 'bottom-center';

export class ToastManager {
  private container: HTMLDivElement;
  private toasts: Map<string, { element: HTMLDivElement; timeout?: number }> = new Map();
  private position: ToastPosition;

  constructor(position: ToastPosition = 'top-right') {
    this.position = position;
    this.container = this.createContainer();
    document.body.appendChild(this.container);
  }

  /**
   * Create toast container
   */
  private createContainer(): HTMLDivElement {
    const container = document.createElement('div');
    container.className = `tryon-toast-container tryon-toast-container--${this.position} tryon-component`;
    return container;
  }

  /**
   * Show toast notification
   */
  show(config: ToastConfig): string {
    const id = this.generateId();
    const toast = this.createToast(id, config);

    this.container.appendChild(toast);
    this.toasts.set(id, { element: toast });

    // Auto-dismiss if duration > 0
    if (config.duration > 0) {
      const timeout = window.setTimeout(() => {
        this.hide(id);
      }, config.duration);

      this.toasts.set(id, { element: toast, timeout });
    }

    return id;
  }

  /**
   * Create toast element
   */
  private createToast(id: string, config: ToastConfig): HTMLDivElement {
    const toast = document.createElement('div');
    toast.className = `tryon-toast tryon-toast--${config.type}`;
    toast.setAttribute('role', 'alert');
    toast.setAttribute('aria-live', config.type === 'error' ? 'assertive' : 'polite');

    // Icon
    const icon = this.createIcon(config.type);
    toast.appendChild(icon);

    // Content
    const content = document.createElement('div');
    content.className = 'tryon-toast-content';

    const message = document.createElement('p');
    message.className = 'tryon-toast-message';
    message.textContent = config.message;

    content.appendChild(message);
    toast.appendChild(content);

    // Close button
    const closeBtn = document.createElement('button');
    closeBtn.className = 'tryon-toast-close';
    closeBtn.setAttribute('aria-label', 'Close notification');
    closeBtn.innerHTML = `
      <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor">
        <path d="M14 1.41L12.59 0L7 5.59L1.41 0L0 1.41L5.59 7L0 12.59L1.41 14L7 8.41L12.59 14L14 12.59L8.41 7L14 1.41Z"/>
      </svg>
    `;
    closeBtn.addEventListener('click', () => this.hide(id));
    toast.appendChild(closeBtn);

    // Progress bar (if duration > 0)
    if (config.duration > 0) {
      const progress = document.createElement('div');
      progress.className = 'tryon-toast-progress';

      const progressBar = document.createElement('div');
      progressBar.className = 'tryon-toast-progress-bar';
      progressBar.style.animationDuration = `${config.duration}ms`;

      progress.appendChild(progressBar);
      toast.appendChild(progress);
    }

    return toast;
  }

  /**
   * Create icon based on type
   */
  private createIcon(type: ToastConfig['type']): HTMLDivElement {
    const icon = document.createElement('div');
    icon.className = 'tryon-toast-icon';

    const icons = {
      success: `
        <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
          <path d="M10 0C4.486 0 0 4.486 0 10s4.486 10 10 10 10-4.486 10-10S15.514 0 10 0zm-1 15l-5-5 1.41-1.41L9 12.17l7.59-7.59L18 6l-9 9z"/>
        </svg>
      `,
      error: `
        <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
          <path d="M10 0C4.486 0 0 4.486 0 10s4.486 10 10 10 10-4.486 10-10S15.514 0 10 0zm1 15H9v-2h2v2zm0-4H9V5h2v6z"/>
        </svg>
      `,
      warning: `
        <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
          <path d="M10 0L0 20h20L10 0zm1 16H9v-2h2v2zm0-4H9V7h2v5z"/>
        </svg>
      `,
      info: `
        <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
          <path d="M10 0C4.486 0 0 4.486 0 10s4.486 10 10 10 10-4.486 10-10S15.514 0 10 0zm1 15H9V9h2v6zm0-8H9V5h2v2z"/>
        </svg>
      `
    };

    icon.innerHTML = icons[type];
    return icon;
  }

  /**
   * Hide toast
   */
  hide(id: string): void {
    const toast = this.toasts.get(id);
    if (!toast) return;

    // Clear timeout if exists
    if (toast.timeout) {
      clearTimeout(toast.timeout);
    }

    // Animate out
    toast.element.classList.add('tryon-toast--removing');

    setTimeout(() => {
      toast.element.remove();
      this.toasts.delete(id);
    }, 200);
  }

  /**
   * Hide all toasts
   */
  hideAll(): void {
    this.toasts.forEach((_, id) => this.hide(id));
  }

  /**
   * Destroy toast manager
   */
  destroy(): void {
    this.hideAll();
    this.container.remove();
  }

  /**
   * Generate unique ID
   */
  private generateId(): string {
    return `toast-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
  }
}

/**
 * Global toast instance
 */
let globalToast: ToastManager | null = null;

/**
 * Helper functions for quick toast notifications
 */
export const toast = {
  success(message: string, duration: number = 3000): string {
    if (!globalToast) {
      globalToast = new ToastManager();
    }
    return globalToast.show({ type: 'success', message, duration, position: 'top-right' });
  },

  error(message: string, duration: number = 5000): string {
    if (!globalToast) {
      globalToast = new ToastManager();
    }
    return globalToast.show({ type: 'error', message, duration, position: 'top-right' });
  },

  warning(message: string, duration: number = 4000): string {
    if (!globalToast) {
      globalToast = new ToastManager();
    }
    return globalToast.show({ type: 'warning', message, duration, position: 'top-right' });
  },

  info(message: string, duration: number = 3000): string {
    if (!globalToast) {
      globalToast = new ToastManager();
    }
    return globalToast.show({ type: 'info', message, duration, position: 'top-right' });
  },

  hide(id: string): void {
    if (globalToast) {
      globalToast.hide(id);
    }
  },

  hideAll(): void {
    if (globalToast) {
      globalToast.hideAll();
    }
  }
};
