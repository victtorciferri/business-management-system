import React from 'react';
import { User } from '@shared/schema';
import { ImageUpload } from '@/components/ui/image-upload';
import { useToast } from '@/hooks/use-toast';
import { useQuery, useMutation } from '@tanstack/react-query';
import { apiRequest, queryClient } from '@/lib/queryClient';

interface BusinessLogoProps {
  business: Omit<User, 'password'>;
  size?: 'small' | 'medium' | 'large';
  className?: string;
  aspectRatio?: 'square' | 'portrait' | 'landscape';
  showLabel?: boolean;
}

export function BusinessLogo({
  business,
  size = 'medium',
  className = '',
  aspectRatio = 'square',
  showLabel = false
}: BusinessLogoProps) {
  const { toast } = useToast();
  
  // Mutation to update the logo
  const logoMutation = useMutation({
    mutationFn: async (logoUrl: string | null) => {
      // Enhanced debug logging
      console.log('Updating logo with URL:', logoUrl);
      
      // Use our direct endpoint that bypasses authentication middleware
      // Get the userId from the business object
      const userId = business.id;
      console.log('Sending update to direct endpoint with userId:', userId);
      
      // Send a direct POST request instead of using the standard API endpoints
      // This avoids middleware issues that might return HTML instead of JSON
      const res = await fetch('/direct-update-logo', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          logoUrl, 
          userId 
        }),
        credentials: 'include'
      });
      
      // If status code is not ok, throw an error
      if (!res.ok) {
        console.error('Error response status:', res.status);
        
        try {
          // Try to parse error as JSON
          const errorData = await res.json();
          console.error('Error response body:', errorData);
          throw new Error(errorData.message || 'Failed to update logo');
        } catch (parseError) {
          // If parsing fails, throw a generic error with status code
          throw new Error(`Failed to update logo: ${res.status} ${res.statusText}`);
        }
      }
      
      // Parse the JSON response
      const result = await res.json();
      console.log('Logo update response from direct endpoint:', result);
      return result;
    },
    onSuccess: () => {
      // Update the business data in the cache after successful update
      queryClient.invalidateQueries({ queryKey: ['/api/user'] });
      toast({
        title: 'Logo updated',
        description: 'Your business logo has been updated successfully',
      });
    },
    onError: (error) => {
      console.error('Error updating logo:', error);
      let errorMessage = 'Failed to update logo. Please try again.';
      
      // Try to extract a meaningful error message if available
      if (error instanceof Error) {
        errorMessage = error.message || errorMessage;
      }
      
      toast({
        title: 'Update failed',
        description: errorMessage,
        variant: 'destructive'
      });
    }
  });
  
  // Handle logo change
  const handleLogoChange = (url: string | null) => {
    logoMutation.mutate(url);
  };
  
  // If no logo is set, show initial letter with a gradient background
  if (!business.logoUrl) {
    const businessName = business.businessName || business.username;
    const initial = businessName ? businessName.charAt(0).toUpperCase() : '?';
    
    const sizeClasses = {
      small: 'h-8 w-8 text-base',
      medium: 'h-12 w-12 text-lg',
      large: 'h-24 w-24 text-3xl',
    };
    
    // Different styling based on business type
    let gradientClass = 'bg-gradient-to-br from-blue-500 to-indigo-700';
    if (business.businessSlug === 'prideandflow') {
      // Special color for yoga businesses
      gradientClass = 'bg-gradient-to-br from-green-500 to-teal-700';
    }
    
    return (
      <div className="flex flex-col items-center">
        <div className={`${sizeClasses[size]} ${className} rounded-md flex items-center justify-center text-white font-bold ${gradientClass}`}>
          {initial}
        </div>
        
        {showLabel && (
          <div className="mt-4 w-full">
            <ImageUpload
              id="business-logo"
              value={business.logoUrl || null}
              onChange={handleLogoChange}
              placeholder="Upload logo"
              previewSize={size}
              aspectRatio={aspectRatio}
              disabled={logoMutation.isPending}
            />
          </div>
        )}
      </div>
    );
  }
  
  // If logo is set, show the actual image logo
  return (
    <div className="flex flex-col items-center">
      {showLabel ? (
        <ImageUpload
          id="business-logo"
          value={business.logoUrl}
          onChange={handleLogoChange}
          placeholder="Change logo"
          previewSize={size}
          aspectRatio={aspectRatio}
          disabled={logoMutation.isPending}
        />
      ) : (
        <img 
          src={business.logoUrl} 
          alt={`${business.businessName || business.username} logo`}
          className={`rounded-md object-cover ${className}`}
        />
      )}
    </div>
  );
}