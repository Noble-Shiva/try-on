/**
 * @try-on/plugin - Website Plugin Entry Point
 *
 * Usage:
 *   <script src="https://cdn.tryon.app/v1/try-on.js"></script>
 *   <script>
 *     TryOn.init({
 *       nanaBanana: { apiKey: 'your-key' },
 *       button: { position: 'overlay', theme: 'dark' }
 *     });
 *   </script>
 */

import { TryOnPlugin, type PluginConfig } from './TryOnPlugin';

// Import styles
import '@try-on/core/src/ui/styles/theme.css';
import '@try-on/core/src/ui/styles/button.css';
import '@try-on/core/src/ui/styles/modal.css';
import '@try-on/core/src/ui/styles/uploader.css';
import '@try-on/core/src/ui/styles/spinner.css';
import '@try-on/core/src/ui/styles/toast.css';

// Global instance
let pluginInstance: TryOnPlugin | null = null;

/**
 * Initialize plugin
 */
export async function init(config: PluginConfig): Promise<void> {
  if (pluginInstance) {
    console.warn('Plugin already initialized. Call destroy() first.');
    return;
  }

  pluginInstance = new TryOnPlugin(config);
  await pluginInstance.init();
}

/**
 * Destroy plugin
 */
export function destroy(): void {
  if (pluginInstance) {
    pluginInstance.destroy();
    pluginInstance = null;
  }
}

/**
 * Get plugin stats
 */
export async function getStats() {
  if (!pluginInstance) {
    throw new Error('Plugin not initialized');
  }
  return pluginInstance.getStats();
}

/**
 * Upload photo manually
 */
export async function uploadPhoto(file: File): Promise<void> {
  if (!pluginInstance) {
    throw new Error('Plugin not initialized');
  }
  return pluginInstance.uploadPhoto(file);
}

/**
 * Clear stored photos
 */
export async function clearPhotos(): Promise<void> {
  if (!pluginInstance) {
    throw new Error('Plugin not initialized');
  }
  return pluginInstance.clearPhotos();
}

/**
 * Clear cache
 */
export async function clearCache(): Promise<void> {
  if (!pluginInstance) {
    throw new Error('Plugin not initialized');
  }
  return pluginInstance.clearCache();
}

// Export as global TryOn object for script tag usage
if (typeof window !== 'undefined') {
  (window as any).TryOn = {
    init,
    destroy,
    getStats,
    uploadPhoto,
    clearPhotos,
    clearCache
  };
}

// Also export for module usage
export default {
  init,
  destroy,
  getStats,
  uploadPhoto,
  clearPhotos,
  clearCache
};

export type { PluginConfig };
