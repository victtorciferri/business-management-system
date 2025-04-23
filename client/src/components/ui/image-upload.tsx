import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Upload, X, Image as ImageIcon } from 'lucide-react';
import { Spinner } from '@/components/ui/spinner';

interface ImageUploadProps {
  id: string;
  value?: string | null;
  onChange: (url: string | null) => void;
  maxSizeInMB?: number;
  className?: string;
  aspectRatio?: 'square' | 'portrait' | 'landscape';
  previewSize?: 'small' | 'medium' | 'large';
  placeholder?: string;
  disabled?: boolean;
}

export function ImageUpload({
  id,
  value,
  onChange,
  maxSizeInMB = 5,
  className = '',
  aspectRatio = 'square',
  previewSize = 'medium',
  placeholder = 'Upload an image',
  disabled = false
}: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Convert size to pixels based on previewSize
  const getPreviewSizeInPx = () => {
    switch (previewSize) {
      case 'small': return 100;
      case 'large': return 300;
      case 'medium':
      default: return 200;
    }
  };

  // Get aspect ratio class based on the aspectRatio prop
  const getAspectRatioClass = () => {
    switch (aspectRatio) {
      case 'portrait': return 'aspect-[3/4]';
      case 'landscape': return 'aspect-[4/3]';
      case 'square':
      default: return 'aspect-square';
    }
  };

  const previewSizePx = getPreviewSizeInPx();
  const aspectRatioClass = getAspectRatioClass();

  const handleClick = () => {
    if (!disabled && fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file size
    const fileSizeInMB = file.size / (1024 * 1024);
    if (fileSizeInMB > maxSizeInMB) {
      setError(`File size exceeds the maximum limit of ${maxSizeInMB}MB.`);
      return;
    }

    setIsUploading(true);
    setError(null);

    try {
      // Create FormData object to upload file
      const formData = new FormData();
      formData.append('file', file);

      // Upload to server
      const response = await fetch('/api/upload-image', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to upload image');
      }

      const data = await response.json();
      onChange(data.imageUrl);
    } catch (err) {
      console.error('Error uploading image:', err);
      setError('Failed to upload image. Please try again.');
    } finally {
      setIsUploading(false);
      // Reset the file input so the same file can be selected again if needed
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange(null);
    setError(null);
  };

  return (
    <div className={`${className}`}>
      <input
        id={id}
        type="file"
        ref={fileInputRef}
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
        disabled={disabled || isUploading}
      />

      {!value ? (
        <div 
          onClick={handleClick}
          className={`border-2 border-dashed border-gray-300 dark:border-gray-700 ${aspectRatioClass} rounded-lg cursor-pointer
            flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors
            ${disabled ? 'opacity-60 cursor-not-allowed' : ''}`}
          style={{ width: previewSizePx, height: previewSizePx }}
        >
          {isUploading ? (
            <Spinner className="h-8 w-8 text-primary" />
          ) : (
            <>
              <Upload className="h-8 w-8 text-gray-400 dark:text-gray-600 mb-2" />
              <span className="text-sm text-gray-500 dark:text-gray-400">{placeholder}</span>
              <span className="text-xs text-gray-400 dark:text-gray-500 mt-1">Max {maxSizeInMB}MB</span>
            </>
          )}
        </div>
      ) : (
        <div 
          className="relative group"
          style={{ width: previewSizePx, height: previewSizePx }}
        >
          <div className={`${aspectRatioClass} bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden`}>
            <img
              src={value}
              alt="Uploaded image"
              className="w-full h-full object-cover"
            />
          </div>
          
          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all duration-200 flex items-center justify-center">
            <Button
              type="button"
              size="icon"
              variant="destructive"
              className="opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={handleRemove}
              disabled={disabled}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {error && (
        <p className="text-destructive text-sm mt-1">{error}</p>
      )}
    </div>
  );
}