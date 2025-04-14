import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useLocation } from 'wouter';

// Define the Business interface to represent business data
export interface Business {
  id: number;
  businessName: string | null;
  businessSlug: string | null;
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
  logoUrl?: string | null;
  coverImageUrl?: string | null;
  // Add any other business fields
  [key: string]: any;
}

// Define Service interface for proper typing
export interface Service {
  id: number;
  name: string;
  description: string | null;
  price: number;
  duration: number;
  color: string | null;
  active: boolean;
  userId: number;
  [key: string]: any;
}

// Define the context type
interface BusinessContextType {
  business: Business | null;
  services: Service[] | null;
  products: any[] | null;
  staff: any[] | null;
  loading: boolean;
  error: Error | null;
  setBusinessSlug: (slug: string) => void;
  businessId: number | null;
}

// Create the context with default values
const BusinessContext = createContext<BusinessContextType>({
  business: null,
  services: null,
  products: null,
  staff: null,
  loading: false,
  error: null,
  setBusinessSlug: () => {},
  businessId: null
});

// Export the hook for using this context
export function useBusinessContext() {
  const context = useContext(BusinessContext);
  if (context === undefined) {
    throw new Error('useBusinessContext must be used within a BusinessContextProvider');
  }
  return context;
}

// Props for the context provider
interface BusinessContextProviderProps {
  children: ReactNode;
  initialSlug?: string;
}

// Get the business slug from a URL
function extractBusinessSlugFromUrl(path: string): string | null {
  const businessPortalRegex = /^\/([a-zA-Z0-9_-]+)(?:\/.*)?$/;
  const match = path.match(businessPortalRegex);
  
  // Define reserved paths that should not be treated as business slugs
  const reservedPaths = [
    'api', 'auth', 'admin', 'checkout', 'preview', 'instructions',
    'products', 'services', 'dashboard', 'appointments', 'customers',
    'staff-management', 'staff-profile', 'staff', 'staff-schedule',
    'new-appointment', 'customer-portal', 'error-testing', 'payment'
  ];
  
  const potentialBusinessSlug = match && 
    !reservedPaths.includes(match[1]) ? match[1] : null;
    
  return potentialBusinessSlug;
}

// The actual provider component
export function BusinessContextProvider({ 
  children,
  initialSlug = 'salonelegante' // Default fallback slug if nothing is provided
}: BusinessContextProviderProps) {
  // Get current URL to attempt extracting a business slug
  const [location] = useLocation();
  
  // Try to extract from URL, fallback to initialSlug
  const urlBusinessSlug = extractBusinessSlugFromUrl(location);
  const [businessSlug, setBusinessSlug] = useState<string>(urlBusinessSlug || initialSlug);
  
  // Use params to also check for businessId in URL
  const searchParams = new URLSearchParams(window.location.search);
  const urlBusinessId = searchParams.get("businessId");
  
  // Fetch the business data
  const { 
    data: businessData,
    isLoading,
    error,
    refetch
  } = useQuery<{
    business: Business;
    services: Service[];
    products?: any[];
    staff?: any[];
  }>({
    queryKey: [`/api/business-data/${businessSlug}`],
    enabled: !!businessSlug,
  });
  
  // If URL change results in a new business slug, update state
  useEffect(() => {
    if (urlBusinessSlug && urlBusinessSlug !== businessSlug) {
      setBusinessSlug(urlBusinessSlug);
    }
  }, [urlBusinessSlug, businessSlug]);
  
  // Use window.BUSINESS_DATA if available (for direct business routes)
  useEffect(() => {
    if (typeof window !== "undefined" && (window as any).BUSINESS_DATA) {
      // We could initialize with this data, but for now we'll let the API fetch handle it
      console.log("Window business data available:", (window as any).BUSINESS_DATA.business?.businessName);
    }
  }, []);
  
  return (
    <BusinessContext.Provider 
      value={{
        business: businessData?.business || null,
        services: businessData?.services || null,
        products: businessData?.products || null,
        staff: businessData?.staff || null,
        loading: isLoading,
        error: error as Error | null,
        setBusinessSlug,
        businessId: businessData?.business?.id || (urlBusinessId ? parseInt(urlBusinessId) : null)
      }}
    >
      {children}
    </BusinessContext.Provider>
  );
};