import React, { createContext, useContext, useState, useEffect } from 'react';

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
});

export const useBusinessContext = () => useContext(BusinessContext);

export const BusinessProvider: React.FC<{
  children: React.ReactNode,
  initialBusiness: Business | null,
  initialServices: Service[],
}> = ({ children, initialBusiness, initialServices }) => {
  const [business, setBusiness] = useState<Business | null>(initialBusiness);
  const [services, setServices] = useState<Service[]>(initialServices);
  const [config, setConfig] = useState<BusinessConfig>(defaultConfig);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  // Extract business slug from location or URL parameters
  
  useEffect(() => {
    if(initialBusiness) {
        setBusiness(initialBusiness);
        // Construct business configuration from business data
        // Extract theme settings if available or use defaults
        const themeSettings = initialBusiness.themeSettings 
        ? { ...defaultConfig.themeSettings, ...initialBusiness.themeSettings }
        : defaultConfig.themeSettings;
      
        // Create business config from business data and defaults
        setConfig({
            ...defaultConfig,
            id: initialBusiness.id,
            name: initialBusiness.businessName,
            slug: initialBusiness.businessSlug,
            email: initialBusiness.email,
            phone: initialBusiness.phone,
            address: initialBusiness.address || null,
            city: initialBusiness.city || null,
            state: initialBusiness.state || null,
            postalCode: initialBusiness.postalCode || null,
            country: initialBusiness.country || null,
            latitude: initialBusiness.latitude || null,
            longitude: initialBusiness.longitude || null,
            description: initialBusiness.description || null,
            logoUrl: initialBusiness.logoUrl || null,
            coverImageUrl: initialBusiness.coverImageUrl || null,
            themeSettings,
            showMap: initialBusiness.showMap !== undefined ? initialBusiness.showMap : defaultConfig.showMap,
            showTestimonials: initialBusiness.showTestimonials !== undefined ? initialBusiness.showTestimonials : defaultConfig.showTestimonials,
            showServices: initialBusiness.showServices !== undefined ? initialBusiness.showServices : defaultConfig.showServices,
            showPhone: initialBusiness.showPhone !== undefined ? initialBusiness.showPhone : defaultConfig.showPhone,
            showAddress: initialBusiness.showAddress !== undefined ? initialBusiness.showAddress : defaultConfig.showAddress,
            showEmail: initialBusiness.showEmail !== undefined ? initialBusiness.showEmail : defaultConfig.showEmail,
            industryType: initialBusiness.industryType || defaultConfig.industryType,
            locale: initialBusiness.locale || defaultConfig.locale,
            timeZone: initialBusiness.businessTimeZone || defaultConfig.timeZone,
            currencyCode: initialBusiness.currencyCode || defaultConfig.currencyCode,
            currencySymbol: initialBusiness.currencySymbol || defaultConfig.currencySymbol,
            use24HourFormat: initialBusiness.use24HourFormat !== undefined ? initialBusiness.use24HourFormat : defaultConfig.use24HourFormat,
            appointmentBuffer: initialBusiness.appointmentBuffer || defaultConfig.appointmentBuffer,
            allowSameTimeSlotForDifferentServices: initialBusiness.allowSameTimeSlotForDifferentServices !== undefined 
            ? initialBusiness.allowSameTimeSlotForDifferentServices 
            : defaultConfig.allowSameTimeSlotForDifferentServices,
            cancellationWindowHours: initialBusiness.cancellationWindowHours || defaultConfig.cancellationWindowHours,
            customTexts: initialBusiness.customTexts || defaultConfig.customTexts,
        });
    }
  },[initialBusiness])


  return (
    <BusinessContext.Provider
      value={{
        business,
        services,
        config,
       }}
    >
      {children}
    </BusinessContext.Provider>
  );
};

// For backwards compatibility with existing code
export const BusinessContextProvider = BusinessProvider;