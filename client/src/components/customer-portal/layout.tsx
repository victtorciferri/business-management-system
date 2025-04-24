import { User } from "@shared/schema";
import BaseLayout from "@/components/shared/base-layout";
import { NavigationItem } from "@/components/shared/base-header";
import { 
  HomeIcon, 
  ShoppingBagIcon, 
  CalendarIcon, 
  ClipboardListIcon, 
  InfoIcon,
  LayoutDashboard
} from "lucide-react";
import { useLocation } from "wouter";
import { useBusinessContext } from "@/contexts/BusinessContext";
import { useTheme } from "@/contexts/ThemeContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { useEffect } from "react";

interface CustomerPortalLayoutProps {
  children: React.ReactNode;
  business?: Omit<User, "password">; // Kept for backward compatibility
  businessId?: string | null;
  accessToken?: string | null;
}

export default function CustomerPortalLayout({ 
  children, 
  business: propsBusiness, // Renamed to avoid confusion
  businessId,
  accessToken 
}: CustomerPortalLayoutProps) {
  const [location] = useLocation();
  const { business: contextBusiness, config } = useBusinessContext();
  const { theme } = useTheme();
  const { t } = useLanguage();
  
  // Use business from context if available, otherwise fallback to props
  const business = contextBusiness || propsBusiness;
  
  // Build query parameters for navigation
  const queryParams: Record<string, string | null> = {};
  if (accessToken) queryParams.token = accessToken;
  if (businessId) queryParams.businessId = businessId;
  
  // Define customer portal navigation items - using the translation system
  const navigationItems: NavigationItem[] = [
    { 
      label: t('common.home'), 
      icon: <HomeIcon className="h-4 w-4 mr-2" />,
      path: "/customer-portal",
      isActive: location === "/customer-portal" 
    },
    { 
      label: t('common.services'), 
      icon: <ShoppingBagIcon className="h-4 w-4 mr-2" />,
      path: "/customer-portal/services",
      isActive: location === "/customer-portal/services"
    },
    { 
      label: t('common.store'), 
      icon: <LayoutDashboard className="h-4 w-4 mr-2" />,
      path: "/customer-portal/store",
      isActive: location === "/customer-portal/store"
    },
    { 
      label: t('common.book'), 
      icon: <CalendarIcon className="h-4 w-4 mr-2" />,
      path: "/customer-portal/new-appointment",
      isActive: location === "/customer-portal/new-appointment"
    },
    { 
      label: t('common.appointments'), 
      icon: <ClipboardListIcon className="h-4 w-4 mr-2" />,
      path: "/customer-portal/my-appointments",
      isActive: location === "/customer-portal/my-appointments"
    },
    { 
      label: t('common.about'), 
      icon: <InfoIcon className="h-4 w-4 mr-2" />,
      path: "/customer-portal/about",
      isActive: location === "/customer-portal/about"
    }
  ];
  
  // Log the current theme for debugging
  useEffect(() => {
    console.log('CustomerPortalLayout: Current theme from ThemeContext:', theme);
    console.log('CustomerPortalLayout: Business context:', business);
    console.log('CustomerPortalLayout: Business ID from URL:', businessId);
  }, [theme, business, businessId]);
  
  // When the component mounts or businessId changes, force a refresh of the business data
  // This ensures we always have the latest logo and other business information
  useEffect(() => {
    if (businessId) {
      // Directly fetch the latest business data from our direct endpoint
      // This will bypass any middleware that might interfere with the response
      fetch(`/direct-business-data/${businessId}?_t=${Date.now()}`)
        .then(response => {
          if (!response.ok) {
            throw new Error(`Error fetching business data: ${response.statusText}`);
          }
          return response.json();
        })
        .then(data => {
          console.log('CustomerPortalLayout: Successfully fetched fresh business data from direct endpoint:', data);
          // No need to do anything here as our BusinessContext will use the direct endpoint 
          // when it detects we're in the customer portal
        })
        .catch(error => {
          console.error('CustomerPortalLayout: Error fetching business data from direct endpoint:', error);
        });
    }
  }, [businessId]);
  
  return (
    <BaseLayout
      business={business}
      navigationItems={navigationItems}
      portalType="customer"
      logoText={config.name || business?.businessName || "Business Portal"}
      queryParams={queryParams}
      // Use theme from ThemeContext rather than config.themeSettings
      // This ensures we're using the most up-to-date theme from the database
    >
      {children}
    </BaseLayout>
  );
}