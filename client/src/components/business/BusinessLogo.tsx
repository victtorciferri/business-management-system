import React, { useState, useEffect } from 'react';
import { User } from '@shared/schema';
import { ImageUpload } from '@/components/ui/image-upload';
import { useToast } from '@/hooks/use-toast';
import { useMutation } from '@tanstack/react-query';
import { queryClient } from '@/lib/queryClient';

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
  const [cachedLogoUrl, setCachedLogoUrl] = useState<string | null>(null);
  const [lastFetchTime, setLastFetchTime] = useState<number>(0);
  const [isLogoLoaded, setIsLogoLoaded] = useState<boolean>(false);
  
  // Always initialize with business.logoUrl if available
  useEffect(() => {
    if (business.logoUrl) {
      console.log('BusinessLogo: Setting initial logo URL from business prop:', business.logoUrl);
      setCachedLogoUrl(business.logoUrl);
    }
  }, [business.logoUrl]);
  
  // Fetch the latest business data regardless of which portal we're in
  // This ensures we always have the most up-to-date logoUrl
  useEffect(() => {
    // Only fetch at most once every 5 seconds to prevent excessive requests
    const now = Date.now();
    if (now - lastFetchTime < 5000) {
      return;
    }
    
    if (business.id) {
      console.log('BusinessLogo: Fetching latest business data for ID:', business.id);
      setLastFetchTime(now);
      
      // Try to get the latest business data from our direct endpoint
      fetch(`/direct-business-data/${business.id}?_t=${now}`)
        .then(response => {
          if (!response.ok) {
            throw new Error(`Failed to fetch business data: ${response.statusText}`);
          }
          return response.json();
        })
        .then(data => {
          if (data.business && data.business.logoUrl) {
            console.log('BusinessLogo: Got logo URL from direct endpoint:', data.business.logoUrl);
            // Only update if different to avoid unnecessary re-renders
            if (data.business.logoUrl !== cachedLogoUrl) {
              console.log('BusinessLogo: Updating cached logo URL to:', data.business.logoUrl);
              setCachedLogoUrl(data.business.logoUrl);
            }
          } else {
            console.log('BusinessLogo: No logo URL in response:', data);
          }
        })
        .catch(error => {
          console.error('BusinessLogo: Error fetching latest business data:', error);
        });
    }
  }, [business.id, lastFetchTime]);
  
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
  
  // Derive the initial letter from the business name
  const businessName = business.businessName || business.username;
  const initial = businessName ? businessName.charAt(0).toUpperCase() : '?';
  
  // Configure size classes based on the size prop
  const sizeClasses = {
    small: 'h-10 w-10 md:h-12 md:w-12',
    medium: 'h-16 w-16 md:h-20 md:w-20',
    large: 'h-40 w-40 md:h-48 md:w-48 lg:h-60 lg:w-60 xl:h-64 xl:w-64',
  };
  
  const textSizes = {
    small: 'text-lg md:text-xl',
    medium: 'text-2xl md:text-3xl',
    large: 'text-6xl md:text-7xl lg:text-8xl',
  };
  
  // Determine styling based on business type
  let gradientClass = 'bg-gradient-to-br from-blue-500 to-indigo-700';
  if (business.businessSlug === 'prideandflow') {
    console.log('BusinessLogo: Using special yoga gradient for prideandflow');
    gradientClass = 'bg-gradient-to-br from-green-500 to-teal-700';
  }
  
  // If no logo is set, show initial letter with a gradient background
  // Check both cachedLogoUrl and business.logoUrl to be safe
  const logoUrl = cachedLogoUrl || business.logoUrl;
  
  // Debug what we're working with
  console.log('BusinessLogo debug info:', {
    cachedLogoUrl,
    businessLogoUrl: business.logoUrl,
    finalLogoUrl: logoUrl
  });
  
  // More permissive check for valid logo
  const hasValidLogo = logoUrl && typeof logoUrl === 'string' && logoUrl.length > 0;
  
  if (!hasValidLogo) {
    console.log('BusinessLogo: No valid logo found, displaying initial for business:', businessName);
    
    return (
      <div className="flex flex-col items-center">
        <div 
          className={`${sizeClasses[size]} ${className} rounded-md flex items-center justify-center text-white font-bold ${gradientClass}`}
          data-testid="initial-logo"
        >
          <span className={`${textSizes[size]} leading-none`}>
            {initial}
          </span>
        </div>
        
        {showLabel && (
          <div className="mt-4 w-full">
            <ImageUpload
              id="business-logo"
              value={null}
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

  // If we have a valid logo URL, show the actual image
  return (
    <div className="flex flex-col items-center">
      {showLabel ? (
        <ImageUpload
          id="business-logo"
          value={logoUrl}
          onChange={handleLogoChange}
          placeholder="Change logo"
          previewSize={size}
          aspectRatio={aspectRatio}
          disabled={logoMutation.isPending}
        />
      ) : (
        <img 
          // Add cache-busting parameter to avoid browser caching of the image
          src={`${logoUrl}?_t=${Date.now()}`}
          alt={`${businessName} logo`}
          className={`${sizeClasses[size]} rounded-md object-cover ${className}`}
          onLoad={() => {
            console.log('BusinessLogo: Successfully loaded image from URL:', logoUrl);
            setIsLogoLoaded(true);
          }}
          onError={(e) => {
            console.error('BusinessLogo: Failed to load image:', logoUrl);
            
            // If image fails to load, mark it as not loaded
            setIsLogoLoaded(false);
            
            // Hide the broken image
            e.currentTarget.style.display = 'none';
            
            // If image fails to load, show the fallback initial in the DOM
            const container = e.currentTarget.parentElement;
            if (container) {
              // Check if fallback already exists to avoid duplicates
              if (!container.querySelector('[data-fallback="true"]')) {
                console.log('BusinessLogo: Adding fallback letter avatar');
                const fallback = document.createElement('div');
                fallback.className = `${sizeClasses[size]} ${className} rounded-md flex items-center justify-center text-white font-bold ${gradientClass}`;
                fallback.setAttribute('data-fallback', 'true');
                
                const span = document.createElement('span');
                span.className = `${textSizes[size]} leading-none`;
                span.textContent = initial;
                fallback.appendChild(span);
                container.appendChild(fallback);
              }
            }
            
            // If logo fails to load, try to fetch business data again after a short delay
            // This creates a retry mechanism for loading the logo
            if (cachedLogoUrl) {
              setTimeout(() => {
                console.log('BusinessLogo: Retrying to fetch business data after image load failure');
                setLastFetchTime(0); // Reset last fetch time to force a new fetch
              }, 2000);
            }
          }}
        />
      )}
    </div>
  );
}