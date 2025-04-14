import React, { createContext, useContext, useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { apiRequest } from '@/lib/queryClient';
import { extractBusinessSlug } from '@/utils/tenant-router';
import { User, Service } from '@shared/schema';

// Define business type without sensitive information
export type Business = Omit<User, 'password'>;

export interface BusinessContextData {
  // The current business context
  business: Business | null;
  // Services offered by the business
  services: Service[];
  // Business configuration
  config: BusinessConfig;
  // Loading state
  isLoading: boolean;
  // Error state
  error: Error | null;
  // Refresh business data
  refreshBusinessData: () => Promise<void>;
}

export interface BusinessConfig {
  // Theme colors
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  // Business display options
  showMap: boolean;
  showTestimonials: boolean;
  showServices: boolean;
  // Contact information display
  showPhone: boolean;
  showAddress: boolean;
  showEmail: boolean;
  // Industry type (for template selection)
  industryType: 'salon' | 'fitness' | 'medical' | 'general';
  // Business hours format
  use24HourFormat: boolean;
  // Custom text overrides
  customTexts: Record<string, string>;
}

// Default configuration
const defaultConfig: BusinessConfig = {
  primaryColor: '#4f46e5',
  secondaryColor: '#06b6d4',
  accentColor: '#f59e0b',
  showMap: true,
  showTestimonials: true,
  showServices: true,
  showPhone: true,
  showAddress: true,
  showEmail: true,
  industryType: 'general',
  use24HourFormat: false,
  customTexts: {},
};

// Create the context
const BusinessContext = createContext<BusinessContextData>({
  business: null,
  services: [],
  config: defaultConfig,
  isLoading: false,
  error: null,
  refreshBusinessData: async () => {},
});

export const useBusinessContext = () => useContext(BusinessContext);

export const BusinessProvider: React.FC<{
  children: React.ReactNode,
  initialBusiness?: Business | null,
  initialServices?: Service[],
}> = ({ children, initialBusiness = null, initialServices = [] }) => {
  const [location] = useLocation();
  const [business, setBusiness] = useState<Business | null>(initialBusiness);
  const [services, setServices] = useState<Service[]>(initialServices);
  const [config, setConfig] = useState<BusinessConfig>(defaultConfig);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  // Extract business slug from location
  const extractedSlug = extractBusinessSlug(location);

  // Fetch business data based on slug
  const fetchBusinessData = async (slug: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Fetch business data from API
      const response = await apiRequest<{
        business: Business;
        services: Service[];
      }>(`/api/business/${slug}`);
      
      if (!response || !response.business) {
        throw new Error('Failed to load business data');
      }
      
      // Update business and services
      setBusiness(response.business);
      setServices(response.services || []);
      
      // Load business configuration (merge with defaults)
      // In a real implementation, we would fetch this from an API
      setConfig({
        ...defaultConfig,
        primaryColor: response.business.primaryColor || defaultConfig.primaryColor,
        // Other config properties would be populated here
      });
      
      // Set business data in window for external scripts
      if (typeof window !== 'undefined') {
        (window as any).BUSINESS_DATA = response.business;
      }
    } catch (err) {
      console.error('Error fetching business data:', err);
      setError(err instanceof Error ? err : new Error('Failed to load business data'));
    } finally {
      setIsLoading(false);
    }
  };

  // Refresh business data
  const refreshBusinessData = async () => {
    if (business?.businessSlug) {
      await fetchBusinessData(business.businessSlug);
    } else if (extractedSlug) {
      await fetchBusinessData(extractedSlug);
    }
  };

  // Effect to load business data when slug changes
  useEffect(() => {
    if (extractedSlug) {
      fetchBusinessData(extractedSlug);
    } else {
      // Check if current user is logged in and has a business
      // This would be implemented in a real application
    }
  }, [extractedSlug]);

  return (
    <BusinessContext.Provider
      value={{
        business,
        services,
        config,
        isLoading,
        error,
        refreshBusinessData,
      }}
    >
      {children}
    </BusinessContext.Provider>
  );
};

// For backwards compatibility with existing code
export const BusinessContextProvider = BusinessProvider;