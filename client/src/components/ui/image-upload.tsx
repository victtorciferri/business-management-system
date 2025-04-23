import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { 
  Dialog,
  DialogContent,
  DialogTitle,
  DialogHeader,
  DialogFooter,
  DialogDescription
} from '@/components/ui/dialog';
import { Spinner } from '@/components/ui/spinner';
import { Upload, X, Image as ImageIcon } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

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
  placeholder = 'Upload image',
  disabled = false,
  previewSize = 'medium',
  aspectRatio = 'square'
}: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const sizeClasses = {
    small: 'h-10 w-10',
    medium: 'h-24 w-24',
    large: 'h-48 w-48'
  };

  const aspectRatioClasses = {
    square: 'aspect-square',
    portrait: 'aspect-[3/4]',
    landscape: 'aspect-[4/3]'
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file type and size
    if (!file.type.startsWith('image/')) {
      toast({
        title: 'Invalid file type',
        description: 'Please upload an image file (jpg, png, gif)',
        variant: 'destructive'
      });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: 'File too large',
        description: 'Image must be less than 5MB',
        variant: 'destructive'
      });
      return;
    }

    try {
      setIsUploading(true);
      
      // Create FormData to send the file
      const formData = new FormData();
      formData.append('file', file);

      // Upload the file to the server
      const response = await fetch('/api/upload-image', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to upload image');
      }

      const data = await response.json();
      onChange(data.imageUrl);
      
      toast({
        title: 'Upload successful',
        description: 'Your image has been uploaded',
      });
    } catch (error) {
      console.error('Error uploading image:', error);
      toast({
        title: 'Upload failed',
        description: 'Failed to upload image. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setIsUploading(false);
      // Reset the file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemoveImage = () => {
    setIsDialogOpen(false);
    onChange(null);
    toast({
      title: 'Image removed',
      description: 'The image has been removed',
    });
  };

  return (
    <div className="flex flex-col items-center">
      <input 
        id={id}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
        ref={fileInputRef}
        disabled={disabled || isUploading}
      />

      {/* Image preview or upload button */}
      {value ? (
        <div 
          className={`${sizeClasses[previewSize]} ${aspectRatioClasses[aspectRatio]} relative cursor-pointer overflow-hidden rounded-md border border-border hover:opacity-90 transition-opacity`}
          onClick={() => !disabled && setIsDialogOpen(true)}
        >
          <img 
            src={value} 
            alt="Uploaded image" 
            className="object-cover w-full h-full"
          />
          {isUploading && (
            <div className="absolute inset-0 flex items-center justify-center bg-background/70">
              <Spinner size="md" color="primary" />
            </div>
          )}
        </div>
      ) : (
        <label 
          htmlFor={id}
          className={`${sizeClasses[previewSize]} ${aspectRatioClasses[aspectRatio]} flex flex-col items-center justify-center rounded-md border border-dashed border-muted-foreground/50 bg-background hover:bg-muted/50 transition-colors cursor-pointer ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          {isUploading ? (
            <Spinner size="md" color="primary" />
          ) : (
            <>
              <ImageIcon className="h-8 w-8 text-muted-foreground mb-2" />
              <span className="text-xs text-muted-foreground text-center px-2">
                {placeholder}
              </span>
            </>
          )}
        </label>
      )}

      {/* Confirmation dialog for removing images */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Image Options</DialogTitle>
            <DialogDescription>
              You can change or remove this image
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex justify-center my-4">
            <img 
              src={value || ''} 
              alt="Preview" 
              className="max-h-48 rounded-md shadow-md"
            />
          </div>
          
          <DialogFooter className="gap-2 sm:gap-0">
            <label 
              htmlFor={id}
              className="w-full sm:w-auto"
            >
              <Button 
                variant="outline" 
                disabled={disabled || isUploading}
                className="w-full flex items-center gap-2"
                onClick={() => setIsDialogOpen(false)}
                type="button"
              >
                <Upload className="h-4 w-4" />
                Change
              </Button>
            </label>
            
            <Button 
              variant="destructive" 
              onClick={handleRemoveImage}
              disabled={disabled || isUploading}
              className="w-full sm:w-auto flex items-center gap-2"
              type="button"
            >
              <X className="h-4 w-4" />
              Remove
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}