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
    small: 'h-20 w-20',
    medium: 'h-32 w-32',
    large: 'h-48 w-48',
  };

  // Aspect ratio classes
  const aspectRatioClasses = {
    square: 'aspect-square',
    portrait: 'aspect-[3/4]',
    landscape: 'aspect-[4/3]',
  };

  // Handle file selection
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    
    if (!file) {
      console.log('No file selected');
      return;
    }
    
    // File type validation
    if (!file.type.startsWith('image/')) {
      toast({
        title: 'Invalid file type',
        description: 'Please select an image file (JPEG, PNG, etc.).',
        variant: 'destructive',
      });
      return;
    }
    
    // File size validation (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: 'File too large',
        description: 'Image size should be less than 5MB.',
        variant: 'destructive',
      });
      return;
    }

    try {
      setIsUploading(true);
      console.log('Starting image upload process');
      
      // Create form data for file upload
      const formData = new FormData();
      formData.append('image', file);
      
      // Log authentication state
      console.log('Auth check before upload - document.cookie:', document.cookie ? 'Cookie exists' : 'No cookie');
      
      // Upload the file with credentials to ensure cookies are sent
      console.log('Sending upload request to /api/upload');
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
        credentials: 'include', // Include credentials (cookies) with the request
      });
      
      console.log('Upload response status:', response.status);
      
      if (!response.ok) {
        let errorText;
        try {
          // First try to get the response as text
          const responseText = await response.text();
          
          // Check if the response starts with HTML doctype (indicating a redirect to HTML)
          if (responseText.trim().startsWith('<!DOCTYPE') || responseText.trim().startsWith('<html')) {
            errorText = `Received HTML instead of JSON. Possible redirect or server error. Status: ${response.status}`;
          } else {
            // Try to parse as JSON if it doesn't look like HTML
            try {
              const errorJson = JSON.parse(responseText);
              errorText = errorJson.error || JSON.stringify(errorJson);
            } catch {
              // If it can't be parsed as JSON, use the raw text
              errorText = responseText || `Server error: ${response.status} ${response.statusText}`;
            }
          }
        } catch (parseError) {
          console.error('Error parsing response:', parseError);
          errorText = `Server error: ${response.status} ${response.statusText}`;
        }
        throw new Error(errorText);
      }
      
      // For successful responses, first get the text and then parse it
      // This avoids JSON parsing errors
      let data;
      try {
        const responseText = await response.text();
        data = JSON.parse(responseText);
        console.log('Upload response data:', data);
        
        if (!data || !data.url) {
          throw new Error('Invalid response from server: No URL returned');
        }
        
        // Success - call the onChange handler with the new URL
        console.log('Upload successful, URL:', data.url);
        onChange(data.url);
        
        toast({
          title: 'Image uploaded',
          description: 'Your image has been uploaded successfully',
        });
      } catch (parseError) {
        console.error('Error parsing successful response:', parseError);
        throw new Error('Invalid JSON in server response');
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      let errorMessage = 'Failed to upload image. Please try again.';
      
      // Enhanced error handling with more detailed diagnostics
      if (error instanceof Error) {
        errorMessage = error.message || errorMessage;
        
        // If it's a network or CORS error, add more specific guidance
        if (error.message.includes('NetworkError') || error.message.includes('Failed to fetch')) {
          errorMessage = 'Network error during upload. Please check your connection and try again.';
        } else if (error.message.includes('401') || error.message.includes('Unauthorized')) {
          errorMessage = 'Authentication error. Please log in again and retry.';
        }
      }
      
      toast({
        title: 'Upload failed',
        description: errorMessage,
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