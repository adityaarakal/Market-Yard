import React, { useRef, useState } from 'react';
import { colors } from '../../theme';
import { compressImage, blobToDataURL, getPlaceholderImage } from '../../utils/image';

export interface ImagePickerProps {
  value?: string; // Current image URL or data URL
  onChange: (dataUrl: string) => void;
  placeholder?: string;
  accept?: string;
  maxSize?: number; // in MB
  compressionOptions?: {
    maxWidth?: number;
    maxHeight?: number;
    quality?: number;
  };
  className?: string;
  disabled?: boolean;
  type?: 'product' | 'shop' | 'user';
}

export default function ImagePicker({
  value,
  onChange,
  placeholder = 'Click to upload image',
  accept = 'image/*',
  maxSize = 5, // 5MB default
  compressionOptions = {
    maxWidth: 1200,
    maxHeight: 1200,
    quality: 0.8,
  },
  className = '',
  disabled = false,
  type = 'product',
}: ImagePickerProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(value || null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);
    setUploading(true);

    try {
      // Check file size
      const fileSizeMB = file.size / (1024 * 1024);
      if (fileSizeMB > maxSize) {
        setError(`Image size must be less than ${maxSize}MB`);
        setUploading(false);
        return;
      }

      // Check file type
      if (!file.type.startsWith('image/')) {
        setError('Please select a valid image file');
        setUploading(false);
        return;
      }

      // Compress image
      const compressedBlob = await compressImage(file, compressionOptions);
      const dataUrl = await blobToDataURL(compressedBlob);

      setPreview(dataUrl);
      onChange(dataUrl);
    } catch (err) {
      console.error('Error processing image:', err);
      setError(err instanceof Error ? err.message : 'Failed to process image');
    } finally {
      setUploading(false);
      // Reset input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleClick = () => {
    if (!disabled && fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    setPreview(null);
    onChange('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const displayImage = preview || value || getPlaceholderImage(type);

  return (
    <div className={className}>
      <div
        onClick={handleClick}
        style={{
          position: 'relative',
          width: '100%',
          aspectRatio: '4/3',
          borderRadius: 'var(--radius-md)',
          overflow: 'hidden',
          backgroundColor: colors.surface,
          border: `2px dashed ${disabled ? colors.border : colors.primary}`,
          cursor: disabled ? 'not-allowed' : 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'all 0.2s',
          opacity: disabled ? 0.6 : 1,
        }}
        onMouseEnter={e => {
          if (!disabled) {
            e.currentTarget.style.borderColor = colors.primaryDark;
            e.currentTarget.style.backgroundColor = `${colors.primary}08`;
          }
        }}
        onMouseLeave={e => {
          if (!disabled) {
            e.currentTarget.style.borderColor = colors.primary;
            e.currentTarget.style.backgroundColor = colors.surface;
          }
        }}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          onChange={handleFileSelect}
          style={{ display: 'none' }}
          disabled={disabled}
        />

        {uploading ? (
          <div style={{ textAlign: 'center' }}>
            <div className="loading-spinner" style={{ marginBottom: '0.5rem' }} />
            <div style={{ fontSize: '0.875rem', color: colors.textSecondary }}>Processing...</div>
          </div>
        ) : preview || value ? (
          <>
            <img
              src={displayImage}
              alt="Preview"
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
              }}
              onError={e => {
                const target = e.target as HTMLImageElement;
                target.src = getPlaceholderImage(type);
              }}
            />
            {!disabled && (
              <button
                type="button"
                onClick={handleRemove}
                style={{
                  position: 'absolute',
                  top: '0.5rem',
                  right: '0.5rem',
                  background: colors.error,
                  color: 'white',
                  border: 'none',
                  borderRadius: '50%',
                  width: '2rem',
                  height: '2rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  fontSize: '1rem',
                  boxShadow: 'var(--shadow-soft)',
                }}
                title="Remove image"
              >
                ×
              </button>
            )}
            <div
              style={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                background: 'linear-gradient(to top, rgba(0,0,0,0.7), transparent)',
                padding: '0.75rem',
                color: 'white',
                fontSize: '0.875rem',
                textAlign: 'center',
              }}
            >
              {disabled ? 'Image' : 'Click to change'}
            </div>
          </>
        ) : (
          <div style={{ textAlign: 'center', padding: '2rem' }}>
            <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>
              {type === 'product' ? '🛒' : type === 'shop' ? '🏪' : '👤'}
            </div>
            <div style={{ fontWeight: 600, marginBottom: '0.25rem', color: colors.text }}>{placeholder}</div>
            <div style={{ fontSize: '0.875rem', color: colors.textSecondary }}>Max size: {maxSize}MB</div>
          </div>
        )}
      </div>
      {error && (
        <div className="form-error" style={{ marginTop: '0.5rem' }}>
          {error}
        </div>
      )}
    </div>
  );
}

