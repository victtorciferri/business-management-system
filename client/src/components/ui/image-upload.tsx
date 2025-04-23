import React, { useRef, useState } from 'react';
import { Camera, X, Upload } from 'lucide-react';
import { Button } from './button';
import { useToast } from '@/hooks/use-toast';
import { Spinner } from './spinner';

interface ImageUploadProps {
  id: string;
  value: string | null;
  onChange: (url: string | null) => void;
  placeholder?: string;
  disabled?: boolean;
  previewSize?: 'small' | 'medium' | 'large';
  aspectRatio?: 'square' | 'portrait' | 'landscape';
}

export function ImageUpload({
  id,
  value,
  onChange,
  placeholder = 'Upload an image',
  disabled = false,
  previewSize = 'medium',
  aspectRatio = 'square',
}: ImageUploadProps) {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);

  // Size classes for different previewSizes
  const sizeClasses = {
    small: 'h-10 w-10',
    medium: 'h-16 w-16',
    large: 'h-32 w-32',
  };

  // Size classes for aspect ratios
  const aspectRatioClasses = {
    square: 'aspect-square',
    portrait: 'aspect-[3/4]', 
    landscape: 'aspect-[4/3]',
  };

  // Handle file change event
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Only allow images
    if (!file.type.startsWith('image/')) {
      toast({
        title: 'Invalid file type',
        description: 'Please upload an image file',
        variant: 'destructive',
      });
      return;
    }

    // Maximum file size: 5MB
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      toast({
        title: 'File too large',
        description: 'Image must be less than 5MB',
        variant: 'destructive',
      });
      return;
    }

    try {
      setIsUploading(true);
      
      // Create form data for file upload
      const formData = new FormData();
      formData.append('image', file);
      
      // Upload the file with credentials to ensure cookies are sent
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
        credentials: 'include', // Include credentials (cookies) with the request
      });
      
      if (!response.ok) {
        throw new Error('Failed to upload image');
      }
      
      const data = await response.json();
      onChange(data.url);
      
      toast({
        title: 'Image uploaded',
        description: 'Your image has been uploaded successfully',
      });
    } catch (error) {
      console.error('Error uploading image:', error);
      toast({
        title: 'Upload failed',
        description: 'Failed to upload image. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsUploading(false);
      // Reset the file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  // Handle removing the image
  const handleRemove = () => {
    onChange(null);
    toast({
      title: 'Image removed',
      description: 'Your image has been removed',
    });
  };

  // Trigger file input click
  const handleButtonClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <div className="flex flex-col items-center gap-3">
      {/* File input (hidden) */}
      <input
        id={id}
        type="file"
        ref={fileInputRef}
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
        disabled={disabled || isUploading}
      />
      
      {/* Image preview or placeholder */}
      {value ? (
        <div className="relative group">
          <img
            src={value}
            alt="Uploaded"
            className={`${sizeClasses[previewSize]} ${aspectRatioClasses[aspectRatio]} rounded-md object-cover border border-border`}
          />
          
          {/* Remove button as overlay */}
          <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-md">
            <Button 
              variant="destructive" 
              size="icon" 
              className="h-7 w-7" 
              onClick={handleRemove} 
              disabled={disabled || isUploading}
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        </div>
      ) : (
        <div 
          className={`${sizeClasses[previewSize]} ${aspectRatioClasses[aspectRatio]} bg-muted flex items-center justify-center rounded-md border border-dashed border-border cursor-pointer`}
          onClick={handleButtonClick}
        >
          {isUploading ? (
            <Spinner className="h-6 w-6 text-muted-foreground" />
          ) : (
            <Camera className="h-6 w-6 text-muted-foreground" />
          )}
        </div>
      )}
      
      {/* Upload button */}
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="text-xs"
        onClick={handleButtonClick}
        disabled={disabled || isUploading}
      >
        {isUploading ? (
          <>
            <Spinner className="mr-2 h-3 w-3" />
            Uploading...
          </>
        ) : value ? (
          <>
            <Upload className="mr-2 h-3 w-3" />
            Change {placeholder}
          </>
        ) : (
          <>
            <Upload className="mr-2 h-3 w-3" />
            {placeholder}
          </>
        )}
      </Button>
    </div>
  );
}