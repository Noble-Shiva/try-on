/**
 * PhotoStorage - Manages user photos
 */

import type { StoredPhoto, IStorage } from '../types/storage';
import { LocalStorageWrapper } from './LocalStorageWrapper';
import { IndexedDBStorage } from './IndexedDBStorage';

export class PhotoStorage {
  private storage: IStorage;
  private readonly PHOTOS_KEY_PREFIX = 'photo';

  constructor(useIndexedDB: boolean = true) {
    // Use IndexedDB for larger storage capacity, fallback to localStorage
    this.storage = useIndexedDB
      ? new IndexedDBStorage('tryon-photos', 'photos')
      : new LocalStorageWrapper('tryon-photos');
  }

  /**
   * Save a photo
   */
  async savePhoto(file: File, label?: string): Promise<StoredPhoto> {
    // Validate file
    if (!file.type.startsWith('image/')) {
      throw new Error('File must be an image');
    }

    const MAX_SIZE = 10 * 1024 * 1024; // 10MB
    if (file.size > MAX_SIZE) {
      throw new Error('Image size must be less than 10MB');
    }

    // Convert to data URL
    const dataUrl = await this.fileToDataURL(file);

    // Generate thumbnail
    const thumbnail = await this.generateThumbnail(file, 150);

    // Get image dimensions
    const dimensions = await this.getImageDimensions(dataUrl);

    const photo: StoredPhoto = {
      id: this.generateId(),
      dataUrl,
      thumbnail,
      uploadedAt: Date.now(),
      lastUsed: Date.now(),
      label,
      metadata: {
        width: dimensions.width,
        height: dimensions.height,
        size: file.size,
        type: file.type
      }
    };

    await this.storage.set(`${this.PHOTOS_KEY_PREFIX}:${photo.id}`, photo);

    return photo;
  }

  /**
   * Get photo by ID
   */
  async getPhoto(id: string): Promise<StoredPhoto | null> {
    const photo = await this.storage.get<StoredPhoto>(`${this.PHOTOS_KEY_PREFIX}:${id}`);

    if (photo) {
      // Update last used
      photo.lastUsed = Date.now();
      await this.storage.set(`${this.PHOTOS_KEY_PREFIX}:${id}`, photo);
    }

    return photo;
  }

  /**
   * Get all photos
   */
  async getAllPhotos(): Promise<StoredPhoto[]> {
    const keys = await this.storage.getAllKeys();
    const photoKeys = keys.filter(k => k.startsWith(this.PHOTOS_KEY_PREFIX));

    const photos = await Promise.all(
      photoKeys.map(key => this.storage.get<StoredPhoto>(key))
    );

    return photos.filter((p): p is StoredPhoto => p !== null);
  }

  /**
   * Get default photo (most recently used)
   */
  async getDefaultPhoto(): Promise<StoredPhoto | null> {
    const photos = await this.getAllPhotos();

    if (photos.length === 0) {
      return null;
    }

    // Sort by last used, descending
    photos.sort((a, b) => b.lastUsed - a.lastUsed);

    return photos[0];
  }

  /**
   * Delete photo by ID
   */
  async deletePhoto(id: string): Promise<void> {
    await this.storage.delete(`${this.PHOTOS_KEY_PREFIX}:${id}`);
  }

  /**
   * Delete all photos
   */
  async deleteAllPhotos(): Promise<void> {
    const photos = await this.getAllPhotos();
    await Promise.all(photos.map(p => this.deletePhoto(p.id)));
  }

  /**
   * Cleanup old photos (older than 30 days and not used recently)
   */
  async cleanup(daysToKeep: number = 30): Promise<number> {
    const photos = await this.getAllPhotos();
    const now = Date.now();
    const threshold = daysToKeep * 24 * 60 * 60 * 1000;

    let deletedCount = 0;

    for (const photo of photos) {
      if (now - photo.lastUsed > threshold) {
        await this.deletePhoto(photo.id);
        deletedCount++;
      }
    }

    return deletedCount;
  }

  /**
   * Get storage usage
   */
  async getStorageInfo(): Promise<{
    photoCount: number;
    totalSize: number;
    oldestPhoto?: Date;
    newestPhoto?: Date;
  }> {
    const photos = await this.getAllPhotos();
    const totalSize = await this.storage.getSize();

    if (photos.length === 0) {
      return { photoCount: 0, totalSize };
    }

    const timestamps = photos.map(p => p.uploadedAt).sort();

    return {
      photoCount: photos.length,
      totalSize,
      oldestPhoto: new Date(timestamps[0]),
      newestPhoto: new Date(timestamps[timestamps.length - 1])
    };
  }

  /**
   * Convert File to data URL
   */
  private fileToDataURL(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  /**
   * Generate thumbnail
   */
  private async generateThumbnail(file: File, maxSize: number): Promise<string> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        reject(new Error('Canvas context not available'));
        return;
      }

      img.onload = () => {
        // Calculate thumbnail dimensions
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxSize) {
            height = (height * maxSize) / width;
            width = maxSize;
          }
        } else {
          if (height > maxSize) {
            width = (width * maxSize) / height;
            height = maxSize;
          }
        }

        canvas.width = width;
        canvas.height = height;

        ctx.drawImage(img, 0, 0, width, height);

        resolve(canvas.toDataURL('image/jpeg', 0.7));
      };

      img.onerror = reject;
      img.src = URL.createObjectURL(file);
    });
  }

  /**
   * Get image dimensions from data URL
   */
  private getImageDimensions(dataUrl: string): Promise<{ width: number; height: number }> {
    return new Promise((resolve, reject) => {
      const img = new Image();

      img.onload = () => {
        resolve({ width: img.width, height: img.height });
      };

      img.onerror = reject;
      img.src = dataUrl;
    });
  }

  /**
   * Generate unique ID
   */
  private generateId(): string {
    return `photo-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
  }
}
