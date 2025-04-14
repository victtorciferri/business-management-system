import { useEffect, useState } from "react";
import { useLocation, useRoute } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { User, Service } from "@shared/schema";
import CustomerPortal from "@/pages/customer-portal/index";
import NewAppointment from "@/pages/customer-portal/new-appointment";
import CustomerServices from "@/pages/customer-portal/services";
import MyAppointments from "@/pages/customer-portal/my-appointments";
import AboutPage from "@/components/business/about-page";
import BusinessLayout from "@/components/business/layout";
import NotFound from "@/pages/not-found";

interface BusinessPortalData {
  business: Omit<User, "password">;
  services: Service[];
  isPreview?: boolean;
}

// Define props for the customer portal components
interface CustomerPortalProps {
  business?: Omit<User, "password">;
  businessId?: string;
  accessToken?: string;
}

/**
 * DynamicPortal serves as a unified component for both:
 * 1. Business-specific portals (/:slug/*) 
 * 2. Generic customer portal (/customer-portal/*)
 * 
 * It renders the appropriate content based on the URL path and business context.
 */
export default function DynamicPortal() {
  const [location] = useLocation();
  const [, params] = useRoute<{ slug: string, "subPath*"?: string }>("/:slug/:subPath*");
  const [, customerParams] = useRoute<{ "subPath*"?: string }>("/customer-portal/:subPath*");
  
  // Extract business slug and subpath from URL
  const slug = params?.slug;
  const subPath = params?.["subPath*"] || "";
  
  // Extract customer portal subpath
  const customerSubPath = customerParams?.["subPath*"] || "";
  
  // State to store business data
  const [businessData, setBusinessData] = useState<BusinessPortalData | null>(null);
  
  // Determine if we're on a business slug route
  const isBusinessPortal = !!slug;
  const isCustomerPortal = location.startsWith("/customer-portal");
  
  // Define reserved paths that should not be treated as business slugs
  const reservedPaths = [
    'api', 'auth', 'admin', 'checkout', 'preview', 'instructions',
    'products', 'services', 'dashboard', 'appointments', 'customers',
    'staff-management', 'staff-profile', 'staff', 'staff-schedule',
    'new-appointment', 'customer-portal', 'error-testing', 'payment'
  ];
  
  // Verify if the slug is valid (not a reserved path)
  const isValidBusinessSlug = slug && !reservedPaths.includes(slug);
  
  // Fetch business data by slug
  const { data, isLoading, error } = useQuery<BusinessPortalData>({
    queryKey: ["/api/business", slug],
    queryFn: async () => {
      const response = await fetch(`/api/business/${slug}`);
      if (!response.ok) {
        throw new Error("Business not found");
      }
      return response.json();
    },
    enabled: !!isValidBusinessSlug,
  });
  
  // Use a default business for customer portal (for now, using salonelegante)
  const { data: defaultBusinessData } = useQuery<BusinessPortalData>({
    queryKey: ['/api/business-data/salonelegante'],
    enabled: isCustomerPortal,
  });
  
  // Update business data when query results change
  useEffect(() => {
    if (isBusinessPortal && data) {
      setBusinessData(data);
    } else if (isCustomerPortal && defaultBusinessData) {
      setBusinessData(defaultBusinessData);
    }
  }, [data, defaultBusinessData, isBusinessPortal, isCustomerPortal]);
  
  // Set document title based on business name and current page
  useEffect(() => {
    if (businessData?.business?.businessName) {
      const pageTitlePrefix = (subPath || customerSubPath) ? 
        `${(subPath || customerSubPath).charAt(0).toUpperCase() + (subPath || customerSubPath).slice(1)} - ` : "";
      document.title = `${pageTitlePrefix}${businessData.business.businessName} - AppointEase`;
    } else {
      document.title = "Business Portal - AppointEase";
    }
  }, [businessData, subPath, customerSubPath]);
  
  // Handle loading state
  if ((isValidBusinessSlug && isLoading) || (!isValidBusinessSlug && !isCustomerPortal)) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }
  
  // Handle business not found
  if (isValidBusinessSlug && (error || !data)) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <h1 className="text-3xl font-bold mb-4">Business Not Found</h1>
        <p className="text-lg text-muted-foreground mb-6">
          The business you're looking for doesn't seem to exist.
        </p>
        <button 
          className="px-4 py-2 bg-primary text-white rounded"
          onClick={() => window.history.back()}
        >
          Go Back
        </button>
      </div>
    );
  }
  
  // If this is a business portal, wrap content in business layout
  if (isValidBusinessSlug && businessData) {
    const { business } = businessData;
    const businessIdString = business.id.toString();
    
    // For business portals, create portal props
    const portalProps: CustomerPortalProps = {
      business: business,
      businessId: businessIdString,
    };
    
    // Determine which component to render based on subPath
    let content;
    switch (subPath) {
      case "new-appointment":
        content = <NewAppointment {...portalProps} />;
        break;
      case "services":
        content = <CustomerServices />;
        break;
      case "my-appointments":
        content = <MyAppointments />;
        break;
      case "about":
        content = <AboutPage business={business} slug={slug} />;
        break;
      default:
        // For home or unspecified subpaths
        content = <CustomerPortal {...portalProps} />;
    }
    
    return (
      <BusinessLayout business={business} slug={slug}>
        {content}
      </BusinessLayout>
    );
  }
  
  // For customer portal, use the regular customer portal components
  if (isCustomerPortal) {
    // Extract query parameters for customer portal
    const urlParams = new URLSearchParams(window.location.search);
    const accessToken = urlParams.get("token") || undefined;
    const businessId = urlParams.get("businessId") || undefined;
    
    // Create portal props
    const portalProps: CustomerPortalProps = {
      business: businessData?.business,
      businessId,
      accessToken
    };
    
    // Handle standard customer portal paths
    let content;
    switch (customerSubPath) {
      case "new-appointment":
        content = <NewAppointment {...portalProps} />;
        break;
      case "services":
        content = <CustomerServices />;
        break;
      case "my-appointments":
        content = <MyAppointments />;
        break;
      case "about":
        content = <AboutPage 
          business={businessData?.business} 
          slug="customer-portal" 
        />;
        break;
      default:
        content = <CustomerPortal {...portalProps} />;
    }
    
    return (
      <div className="min-h-screen bg-background">
        {content}
      </div>
    );
  }
  
  return <NotFound />;
}