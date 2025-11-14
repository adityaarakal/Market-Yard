import { STORAGE_KEYS } from '../utils/constants';
import StorageService from './StorageService';

interface CachedImage {
  url: string;
  dataUrl: string;
  timestamp: string;
  size: number; // in bytes
}

const MAX_CACHE_SIZE = 10 * 1024 * 1024; // 10MB
const MAX_CACHE_AGE = 7 * 24 * 60 * 60 * 1000; // 7 days

/**
 * Image Cache Service for caching images in localStorage
 */
class ImageCacheService {
  private getCacheKey(): string {
    return `${STORAGE_KEYS.SETTINGS}_image_cache`;
  }

  /**
   * Get cached image
   */
  getCachedImage(url: string): string | null {
    const cache = this.getCache();
    const cached = cache[url];

    if (!cached) return null;

    // Check if cache is expired
    const age = Date.now() - new Date(cached.timestamp).getTime();
    if (age > MAX_CACHE_AGE) {
      this.removeCachedImage(url);
      return null;
    }

    return cached.dataUrl;
  }

  /**
   * Cache an image
   */
  async cacheImage(url: string): Promise<string | null> {
    try {
      // Check if already cached
      const existing = this.getCachedImage(url);
      if (existing) return existing;

      // Fetch and convert to data URL
      const response = await fetch(url);
      if (!response.ok) return null;

      const blob = await response.blob();
      const dataUrl = await this.blobToDataURL(blob);

      // Check cache size and clean if needed
      this.cleanCacheIfNeeded(blob.size);

      // Save to cache
      const cache = this.getCache();
      cache[url] = {
        url,
        dataUrl,
        timestamp: new Date().toISOString(),
        size: blob.size,
      };

      this.saveCache(cache);
      return dataUrl;
    } catch (error) {
      console.error('Error caching image:', error);
      return null;
    }
  }

  /**
   * Remove cached image
   */
  removeCachedImage(url: string): void {
    const cache = this.getCache();
    delete cache[url];
    this.saveCache(cache);
  }

  /**
   * Clear all cached images
   */
  clearCache(): void {
    StorageService.removeItem(this.getCacheKey());
  }

  /**
   * Get cache size
   */
  getCacheSize(): number {
    const cache = this.getCache();
    return Object.values(cache).reduce((total, item) => total + item.size, 0);
  }

  /**
   * Get cache
   */
  private getCache(): Record<string, CachedImage> {
    return StorageService.getItem<Record<string, CachedImage>>(this.getCacheKey()) || {};
  }

  /**
   * Save cache
   */
  private saveCache(cache: Record<string, CachedImage>): void {
    StorageService.setItem(this.getCacheKey(), cache);
  }

  /**
   * Clean cache if size exceeds limit
   */
  private cleanCacheIfNeeded(newImageSize: number): void {
    const cache = this.getCache();
    let totalSize = Object.values(cache).reduce((total, item) => total + item.size, 0);

    if (totalSize + newImageSize <= MAX_CACHE_SIZE) {
      return;
    }

    // Sort by timestamp (oldest first) and remove until we have space
    const sorted = Object.entries(cache).sort(
      (a, b) => new Date(a[1].timestamp).getTime() - new Date(b[1].timestamp).getTime()
    );

    for (const [url, item] of sorted) {
      if (totalSize + newImageSize <= MAX_CACHE_SIZE) break;
      totalSize -= item.size;
      delete cache[url];
    }

    this.saveCache(cache);
  }

  /**
   * Convert blob to data URL
   */
  private blobToDataURL(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => reject(new Error('Failed to convert blob to data URL'));
      reader.readAsDataURL(blob);
    });
  }
}

const imageCacheService = new ImageCacheService();
export default imageCacheService;

