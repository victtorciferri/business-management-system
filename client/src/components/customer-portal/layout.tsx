import { User } from "@shared/schema";
import BaseLayout from "@/components/shared/base-layout";
import { NavigationItem } from "@/components/shared/base-header";
import { 
  HomeIcon, 
  ShoppingBagIcon, 
  CalendarIcon, 
  ClipboardListIcon, 
  InfoIcon 
} from "lucide-react";
import { useLocation } from "wouter";
import { useBusinessContext } from "@/contexts/BusinessContext";

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
  const { business: contextBusiness } = useBusinessContext();
  
  // Use business from context if available, otherwise fallback to props
  const business = contextBusiness || propsBusiness;
  
  // Build query parameters for navigation
  const queryParams: Record<string, string | null> = {};
  if (accessToken) queryParams.token = accessToken;
  if (businessId) queryParams.businessId = businessId;
  
  // Define customer portal navigation items
  const navigationItems: NavigationItem[] = [
    { 
      label: "Home", 
      icon: <HomeIcon className="h-4 w-4 mr-2" />,
      path: "/customer-portal",
      isActive: location === "/customer-portal" 
    },
    { 
      label: "New Appointment", 
      icon: <CalendarIcon className="h-4 w-4 mr-2" />,
      path: "/customer-portal/new-appointment",
      isActive: location === "/customer-portal/new-appointment"
    },
    { 
      label: "My Appointments", 
      icon: <ClipboardListIcon className="h-4 w-4 mr-2" />,
      path: "/customer-portal/my-appointments",
      isActive: location === "/customer-portal/my-appointments"
    },
    { 
      label: "Services", 
      icon: <ShoppingBagIcon className="h-4 w-4 mr-2" />,
      path: "/customer-portal/services",
      isActive: location === "/customer-portal/services"
    },
    { 
      label: "About", 
      icon: <InfoIcon className="h-4 w-4 mr-2" />,
      path: "/customer-portal/about",
      isActive: location === "/customer-portal/about"
    }
  ];
  
  return (
    <BaseLayout
      business={business}
      navigationItems={navigationItems}
      portalType="customer"
      logoText={business?.businessName || "Business Portal"}
      footerText={`Powered by AppointEase`}
      queryParams={queryParams}
    >
      {children}
    </BaseLayout>
  );
}