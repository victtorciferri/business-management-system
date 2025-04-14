import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useQuery } from '@tanstack/react-query';

interface Business {
  id: number;
  businessName: string;
  businessSlug: string;
  email: string;
  phone: string;
  address?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
  latitude?: string;
  longitude?: string;
  [key: string]: any;
}

interface BusinessContextType {
  business: Business | null;
  services: any[] | null;
  loading: boolean;
  error: Error | null;
  setBusinessSlug: (slug: string) => void;
}

const BusinessContext = createContext<BusinessContextType>({
  business: null,
  services: null,
  loading: false,
  error: null,
  setBusinessSlug: () => {}
});

export const useBusinessContext = () => useContext(BusinessContext);

interface BusinessContextProviderProps {
  children: ReactNode;
  initialSlug?: string;
}

export const BusinessContextProvider: React.FC<BusinessContextProviderProps> = ({ 
  children,
  initialSlug = 'salonelegante' // Default fallback slug 
}) => {
  const [businessSlug, setBusinessSlug] = useState<string>(initialSlug);
  
  const { 
    data: businessData,
    isLoading,
    error 
  } = useQuery<{
    business: Business;
    services: any[];
  }>({
    queryKey: [`/api/business-data/${businessSlug}`],
    enabled: !!businessSlug,
  });
  
  useEffect(() => {
    // Check if we have business data from window (for direct business routes)
    if (typeof window !== "undefined" && (window as any).BUSINESS_DATA) {
      // Initialize with window data if available
      console.log("Using window.BUSINESS_DATA for business context");
    }
  }, []);
  
  return (
    <BusinessContext.Provider 
      value={{
        business: businessData?.business || null,
        services: businessData?.services || null,
        loading: isLoading,
        error: error as Error | null,
        setBusinessSlug
      }}
    >
      {children}
    </BusinessContext.Provider>
  );
};