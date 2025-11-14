import React, { useState, useEffect } from 'react';
import { colors } from '../../theme';
import { getPlaceholderImage, isValidImageUrl } from '../../utils/image';
import imageCacheService from '../../services/ImageCacheService';

export interface ImageProps {
  src?: string | null;
  alt: string;
  placeholder?: 'product' | 'shop' | 'user';
  className?: string;
  style?: React.CSSProperties;
  useCache?: boolean;
  fallback?: string;
  onError?: () => void;
  onLoad?: () => void;
}

export default function Image({
  src,
  alt,
  placeholder = 'product',
  className = '',
  style = {},
  useCache = true,
  fallback,
  onError,
  onLoad,
}: ImageProps) {
  const [imageSrc, setImageSrc] = useState<string>(fallback || getPlaceholderImage(placeholder));
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!src || !isValidImageUrl(src)) {
      setImageSrc(fallback || getPlaceholderImage(placeholder));
      setLoading(false);
      setError(false);
      return;
    }

    const loadImage = async () => {
      setLoading(true);
      setError(false);

      try {
        if (useCache) {
          // Try to get from cache first
          const cached = imageCacheService.getCachedImage(src);
          if (cached) {
            setImageSrc(cached);
            setLoading(false);
            return;
          }

          // Cache the image
          const dataUrl = await imageCacheService.cacheImage(src);
          if (dataUrl) {
            setImageSrc(dataUrl);
          } else {
            // Fallback to direct URL if caching fails
            setImageSrc(src);
          }
        } else {
          setImageSrc(src);
        }
      } catch (err) {
        console.error('Error loading image:', err);
        setError(true);
        setImageSrc(fallback || getPlaceholderImage(placeholder));
      } finally {
        setLoading(false);
      }
    };

    loadImage();
  }, [src, useCache, fallback, placeholder]);

  const handleError = () => {
    setError(true);
    setImageSrc(fallback || getPlaceholderImage(placeholder));
    if (onError) {
      onError();
    }
  };

  const handleLoad = () => {
    setLoading(false);
    if (onLoad) {
      onLoad();
    }
  };

  return (
    <div
      className={className}
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        backgroundColor: colors.surface,
        ...style,
      }}
    >
      {loading && !error && (
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: colors.surface,
          }}
        >
          <div className="loading-spinner" />
        </div>
      )}
      <img
        src={imageSrc}
        alt={alt}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          opacity: loading ? 0 : 1,
          transition: 'opacity 0.3s',
        }}
        onError={handleError}
        onLoad={handleLoad}
        loading="lazy"
      />
    </div>
  );
}

