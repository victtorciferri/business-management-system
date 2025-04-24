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

  // Extract URL from HTML response (fallback method)
  const extractUrlFromHtml = (html: string): string | null => {
    console.log('Attempting to extract URL from HTML response');
    const uploadUrlMatch = html.match(/\/uploads\/[a-zA-Z0-9_.-]+/);
    if (uploadUrlMatch) {
      console.log('Found URL in HTML:', uploadUrlMatch[0]);
      return uploadUrlMatch[0];
    }
    return null;
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

    setIsUploading(true);
    
    try {
      console.log('Starting XMLHttpRequest upload');
      
      // Create form data
      const formData = new FormData();
      formData.append('image', file);
      
      // Use XMLHttpRequest for more detailed diagnostics
      const uploadUrl = await new Promise<string>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        
        xhr.open('POST', '/api/upload', true);
        xhr.withCredentials = true;
        
        xhr.onload = function() {
          console.log('XHR status:', xhr.status);
          console.log('Content-Type:', xhr.getResponseHeader('Content-Type'));
          console.log('Full Response text:', xhr.responseText);
          console.log('Response length:', xhr.responseText.length);
          
          if (xhr.status >= 200 && xhr.status < 300) {
            const responseText = xhr.responseText.trim();
            console.log('Trimmed response length:', responseText.length);
            
            // Try to parse as JSON first
            try {
              console.log('Attempting to parse response as JSON');
              const data = JSON.parse(responseText);
              console.log('Successfully parsed JSON:', data);
              
              // Check for url property in JSON
              if (data && data.url) {
                console.log('Found URL in JSON response:', data.url);
                resolve(data.url);
                return;
              }
            } catch (e) {
              console.error('JSON parse error:', e);
              console.log('Raw response is not valid JSON, trying alternative extraction methods');
            }
            
            // 2. Direct URL format (fallback)
            if (responseText.startsWith('/uploads/') || responseText.startsWith('http')) {
              console.log('Response is a direct URL:', responseText);
              resolve(responseText);
              return;
            }
            
            // 3. Extract URL from HTML
            if (responseText.includes('<!DOCTYPE html>') || responseText.includes('<html>')) {
              const extractedUrl = extractUrlFromHtml(responseText);
              if (extractedUrl) {
                console.log('Extracted URL from HTML:', extractedUrl);
                resolve(extractedUrl);
                return;
              }
            }
            
            // 4. Last resort - regex search with improved pattern for processed files
            console.log('Trying regex pattern matching');
            // Try to match both standard and processed file patterns
            const uploadUrlMatch = responseText.match(/\/uploads\/(?:processed_)?[a-zA-Z0-9_.-]+/);
            if (uploadUrlMatch) {
              console.log('Found URL with regex:', uploadUrlMatch[0]);
              resolve(uploadUrlMatch[0]);
              return;
            }
            
            console.log('All URL extraction methods failed');
            reject(new Error('Could not extract image URL from server response'));
          } else {
            reject(new Error(`Upload failed with status ${xhr.status}`));
          }
        };
        
        xhr.onerror = function() {
          reject(new Error('Network error during upload'));
        };
        
        xhr.send(formData);
      });
      
      // If we got here, upload was successful
      console.log('Upload successful, URL:', uploadUrl);
      onChange(uploadUrl);
      
      toast({
        title: 'Upload successful',
        description: 'Your image has been uploaded',
      });
      
    } catch (error) {
      console.error('Upload failed:', error);
      
      // Try fallback method - fetch latest uploads
      try {
        console.log('Trying fallback - fetching latest uploads');
        const response = await fetch('/api/uploads/latest', { credentials: 'include' });
        
        if (response.ok) {
          const latestUploads = await response.json();
          console.log('Latest uploads:', latestUploads);
          
          if (latestUploads?.length > 0) {
            const latestUrl = latestUploads[0].url;
            console.log('Using most recent upload URL:', latestUrl);
            onChange(latestUrl);
            
            toast({
              title: 'Upload recovered',
              description: 'Used most recent upload as fallback',
            });
            return;
          }
        }
      } catch (fallbackError) {
        console.error('Fallback also failed:', fallbackError);
      }
      
      // If we got here, both methods failed
      let errorMessage = 'Failed to upload image. Please try again.';
      
      if (error instanceof Error) {
        errorMessage = error.message;
        
        if (error.message.includes('NetworkError') || error.message.includes('Failed to fetch')) {
          errorMessage = 'Network error during upload. Please check your connection.';
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