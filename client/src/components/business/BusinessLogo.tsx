import React from 'react';
import { ImageUpload } from '@/components/ui/image-upload';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import type { User } from '@shared/schema';

interface BusinessLogoProps {
  business: Omit<User, 'password'>;
  className?: string;
  showLabel?: boolean;
  size?: 'small' | 'medium' | 'large';
  aspectRatio?: 'square' | 'portrait' | 'landscape';
  readOnly?: boolean;
}

export function BusinessLogo({
  business,
  className = '',
  showLabel = true,
  size = 'medium',
  aspectRatio = 'square',
  readOnly = false
}: BusinessLogoProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const updateLogoMutation = useMutation({
    mutationFn: async (logoUrl: string | null) => {
      const response = await apiRequest('PATCH', `/api/business/logo`, { logoUrl });
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/user'] });
      queryClient.invalidateQueries({ queryKey: ['/api/current-business'] });
      toast({
        title: 'Logo updated',
        description: 'Your business logo has been updated successfully',
      });
    },
    onError: (error) => {
      console.error('Error updating logo:', error);
      toast({
        title: 'Update failed',
        description: 'Failed to update logo. Please try again.',
        variant: 'destructive'
      });
    }
  });
  
  const handleLogoChange = (url: string | null) => {
    updateLogoMutation.mutate(url);
  };
  
  return (
    <div className={`flex flex-col items-center ${className}`}>
      <ImageUpload
        id="business-logo"
        value={business.logoUrl || null}
        onChange={readOnly ? () => {} : handleLogoChange}
        previewSize={size}
        aspectRatio={aspectRatio}
        placeholder="Upload business logo"
        disabled={readOnly || updateLogoMutation.isPending}
      />
      
      {showLabel && (
        <div className="mt-2 text-center">
          <h3 className="text-sm font-medium">Business Logo</h3>
          {!readOnly && (
            <p className="text-xs text-muted-foreground mt-1">
              {business.logoUrl ? 'Click to change or remove' : 'Click to upload'}
            </p>
          )}
        </div>
      )}
    </div>
  );
}