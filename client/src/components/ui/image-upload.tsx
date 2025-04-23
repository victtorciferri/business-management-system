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
      
      // Let's try a more direct approach with fetch API but with built-in retry support
      console.log('Sending upload request to /api/upload with special direct handling');
      
      // Function to extract URL from HTML response (as a fallback)
      const extractUrlFromHtml = (html: string): string | null => {
        console.log('Attempting to extract URL from HTML response');
        // Look for a URL pattern that starts with /uploads/ in the HTML
        const uploadUrlMatch = html.match(/\/uploads\/[a-zA-Z0-9_.-]+/);
        if (uploadUrlMatch) {
          console.log('Found URL in HTML:', uploadUrlMatch[0]);
          return uploadUrlMatch[0];
        }
        return null;
      };
      
      // Wrapper function for fetch with retries
      const fetchWithRetry = async (
        url: string, 
        options: RequestInit, 
        retries = 3, 
        backoff = 300
      ): Promise<Response> => {
        try {
          return await fetch(url, options);
        } catch (err) {
          if (retries <= 1) throw err;
          await new Promise(resolve => setTimeout(resolve, backoff));
          return fetchWithRetry(url, options, retries - 1, backoff * 2);
        }
      };
      
      // First try our normal approach with a direct POST
      try {
        const response = await fetchWithRetry('/api/upload', {
          method: 'POST',
          body: formData,
          credentials: 'include',
        }, 3, 500);
        
        console.log('Upload response status:', response.status);
        console.log('Upload response type:', response.headers.get('Content-Type'));
        
        // If the request failed with an error status
        if (!response.ok) {
          throw new Error(`Upload failed with status ${response.status}`);
        }
        
        // Get the response as text first - the server now returns plain text with just the URL
        const responseText = await response.text();
        console.log('Raw response text (first 100 chars):', responseText.substring(0, 100));
        
        // Trim any whitespace from the response text
        const trimmedText = responseText.trim();
        
        // Our server now returns plain text content with just the URL
        // So we can use the response directly if it starts with /uploads/ or http
        if (trimmedText.startsWith('/uploads/') || trimmedText.startsWith('http')) {
          console.log('Response is a direct URL string:', trimmedText);
          onChange(trimmedText); // Update the image URL directly
          return trimmedText;
        }
        
        // Method 1: Try to parse as JSON if it looks like JSON (as a fallback)
        if (trimmedText.startsWith('{') || trimmedText.startsWith('[')) {
          try {
            const data = JSON.parse(trimmedText);
            console.log('Parsed JSON response:', data);
            if (data && data.url) {
              console.log('Found URL in JSON response:', data.url);
              onChange(data.url);
              return data.url;
            }
          } catch (e) {
            console.warn('Failed to parse JSON, trying other methods');
          }
        }
        
        // Method 2: If it's HTML, try to extract a URL
        if (trimmedText.includes('<!DOCTYPE html>')) {
          const extractedUrl = extractUrlFromHtml(trimmedText);
          if (extractedUrl) {
            console.log('Extracted URL from HTML:', extractedUrl);
            onChange(extractedUrl);
            return extractedUrl;
          }
        }
        
        // If we got here, we couldn't find a URL in the response
        console.error('Could not extract image URL from server response:', trimmedText);
        throw new Error('Could not extract image URL from server response');
      } catch (error) {
        console.error('First upload attempt failed:', error);
        
        // Fall back to a direct API fetch to get the latest upload - this is a recovery mechanism
        try {
          console.log('Attempting fallback to get the most recent upload');
          const latestUploadsResponse = await fetch('/api/uploads/latest', { 
            credentials: 'include' 
          });
          
          if (latestUploadsResponse.ok) {
            const latestUploads = await latestUploadsResponse.json();
            console.log('Latest uploads response:', latestUploads);
            
            if (latestUploads && latestUploads.length > 0) {
              console.log('Found latest upload:', latestUploads[0]);
              onChange(latestUploads[0].url);
              return latestUploads[0].url;
            }
          } else {
            console.error('Fallback failed with status:', latestUploadsResponse.status);
            const fallbackText = await latestUploadsResponse.text();
            console.error('Fallback response:', fallbackText);
          }
        } catch (fallbackError) {
          console.error('Fallback attempt also failed:', fallbackError);
        }
        
        // If we reached here, both attempts failed
        throw error;
      }
      
      // This code shouldn't be reached if all goes well - the successful branch returns directly
      console.log('Upload successful, but execution reached an unexpected point');
      // If we somehow got here without a returned value, don't change anything
      toast({
        title: 'Warning',
        description: 'Upload completed but with unexpected flow. Please check console logs.',
        variant: 'destructive',
      });
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