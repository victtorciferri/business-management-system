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

export interface ThemeSettings {
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  textColor: string;
  backgroundColor: string;
  fontFamily: string;
  borderRadius: string;
  buttonStyle: "rounded" | "square" | "pill";
  cardStyle: "elevated" | "flat" | "bordered";
  appearance?: "light" | "dark" | "system";
}

export interface BusinessConfig {
  // Business information
  id: number;
  name: string | null;
  slug: string | null;
  email: string;
  phone: string | null;
  address?: string | null;
  city?: string | null;
  state?: string | null;
  postalCode?: string | null;
  country?: string | null;
  latitude?: string | null;
  longitude?: string | null;
  description?: string | null;
  
  // Media and branding
  logoUrl?: string | null;
  coverImageUrl?: string | null;
  
  // Theme settings
  themeSettings: ThemeSettings;
  
  // Business display options
  showMap: boolean;
  showTestimonials: boolean;
  showServices: boolean;
  showPhone: boolean;
  showAddress: boolean;
  showEmail: boolean;
  
  // Industry type (for template selection)
  industryType: 'salon' | 'fitness' | 'medical' | 'general';
  
  // Localization
  locale: string;
  timeZone: string;
  currencyCode: string;
  currencySymbol: string;
  
  // Business hours format
  use24HourFormat: boolean;
  
  // Additional settings
  appointmentBuffer: number;
  allowSameTimeSlotForDifferentServices: boolean;
  cancellationWindowHours: number;
  
  // Custom text overrides
  customTexts: Record<string, string>;
}

// Default configuration
const defaultConfig: BusinessConfig = {
  id: 0,
  name: null,
  slug: null,
  email: "",
  phone: null,
  address: null,
  city: null,
  state: null,
  postalCode: null,
  country: null,
  latitude: null,
  longitude: null,
  description: null,
  logoUrl: null,
  coverImageUrl: null,
  
  themeSettings: {
    primaryColor: '#4f46e5',
    secondaryColor: '#06b6d4',
    accentColor: '#f59e0b',
    textColor: '#1f2937',
    backgroundColor: '#ffffff',
    fontFamily: 'sans-serif',
    borderRadius: 'rounded-md',
    buttonStyle: 'rounded',
    cardStyle: 'elevated',
    appearance: 'system',
  },
  
  showMap: true,
  showTestimonials: true,
  showServices: true,
  showPhone: true,
  showAddress: true,
  showEmail: true,
  
  industryType: 'general',
  
  locale: 'en',
  timeZone: 'America/Santiago',
  currencyCode: 'USD',
  currencySymbol: '$',
  
  use24HourFormat: false,
  appointmentBuffer: 15,
  allowSameTimeSlotForDifferentServices: false,
  cancellationWindowHours: 24,
  
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
      const response = await fetch(`/api/business/${slug}`);
      
      if (!response.ok) {
        throw new Error(`Failed to load business data: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      if (!data || !data.business) {
        throw new Error('Failed to load business data: No business returned');
      }
      
      const business = data.business as Business;
      const services = data.services as Service[] || [];
      
      // Update business and services
      setBusiness(business);
      setServices(services);
      
      // Construct business configuration from business data
      // Extract theme settings if available or use defaults
      const themeSettings = business.themeSettings 
        ? { ...defaultConfig.themeSettings, ...business.themeSettings }
        : defaultConfig.themeSettings;
      
      // Create business config from business data and defaults
      setConfig({
        ...defaultConfig,
        id: business.id,
        name: business.businessName,
        slug: business.businessSlug,
        email: business.email,
        phone: business.phone,
        address: business.address || null,
        city: business.city || null,
        state: business.state || null,
        postalCode: business.postalCode || null,
        country: business.country || null,
        latitude: business.latitude || null,
        longitude: business.longitude || null,
        description: business.description || null,
        logoUrl: business.logoUrl || null,
        coverImageUrl: business.coverImageUrl || null,
        
        // Use theme settings from business or defaults
        themeSettings,
        
        // Business preferences or defaults
        showMap: business.showMap !== undefined ? business.showMap : defaultConfig.showMap,
        showTestimonials: business.showTestimonials !== undefined ? business.showTestimonials : defaultConfig.showTestimonials,
        showServices: business.showServices !== undefined ? business.showServices : defaultConfig.showServices,
        showPhone: business.showPhone !== undefined ? business.showPhone : defaultConfig.showPhone,
        showAddress: business.showAddress !== undefined ? business.showAddress : defaultConfig.showAddress,
        showEmail: business.showEmail !== undefined ? business.showEmail : defaultConfig.showEmail,
        
        // Industry type for template selection
        industryType: business.industryType || defaultConfig.industryType,
        
        // Localization settings
        locale: business.locale || defaultConfig.locale,
        timeZone: business.businessTimeZone || defaultConfig.timeZone,
        currencyCode: business.currencyCode || defaultConfig.currencyCode,
        currencySymbol: business.currencySymbol || defaultConfig.currencySymbol,
        
        // Business operational settings
        use24HourFormat: business.use24HourFormat !== undefined ? business.use24HourFormat : defaultConfig.use24HourFormat,
        appointmentBuffer: business.appointmentBuffer || defaultConfig.appointmentBuffer,
        allowSameTimeSlotForDifferentServices: business.allowSameTimeSlotForDifferentServices !== undefined 
          ? business.allowSameTimeSlotForDifferentServices 
          : defaultConfig.allowSameTimeSlotForDifferentServices,
        cancellationWindowHours: business.cancellationWindowHours || defaultConfig.cancellationWindowHours,
        
        // Custom text overrides
        customTexts: business.customTexts || defaultConfig.customTexts,
      });
      
      // Set business data in window for external scripts
      if (typeof window !== 'undefined') {
        (window as any).BUSINESS_DATA = business;
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