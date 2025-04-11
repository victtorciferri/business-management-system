import { useEffect } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { User, Service } from "@shared/schema";

// Import our new business components
import BusinessLayout from "@/components/business/layout";
import HomePage from "@/components/business/home-page";
import SchedulePage from "@/components/business/schedule-page";
import AboutPage from "@/components/business/about-page";
import StorePage from "@/components/business/store-page";

interface BusinessPortalData {
  business: Omit<User, "password">;
  services: Service[];
  isPreview?: boolean;
}

interface BusinessPortalProps {
  slug: string;
  subPath?: string;
  initialData?: BusinessPortalData | null;
}

export default function BusinessPortal({ slug, subPath, initialData }: BusinessPortalProps) {
  const [location] = useLocation();
  
  // Fetch business data by slug if not provided
  const { data, isLoading, error } = useQuery<BusinessPortalData>({
    queryKey: ["/api/business", slug],
    queryFn: async () => {
      const response = await fetch(`/api/business/${slug}`);
      if (!response.ok) {
        throw new Error("Business not found");
      }
      return response.json();
    },
    enabled: !!slug && !initialData,
    initialData: initialData || undefined,
  });
  
  // Set the document title to the business name when data is loaded
  useEffect(() => {
    if (data?.business?.businessName) {
      const pageTitle = subPath 
        ? `${subPath.charAt(0).toUpperCase() + subPath.slice(1)} - ${data.business.businessName}`
        : data.business.businessName;
      document.title = `${pageTitle} - AppointEase`;
    } else {
      document.title = "Business Portal - AppointEase";
    }
  }, [data, subPath]);
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }
  
  if (error || !data) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <h1 className="text-3xl font-bold mb-4">Business Not Found</h1>
        <p className="text-lg text-muted-foreground mb-6">
          The business you're looking for doesn't seem to exist.
        </p>
        <Button onClick={() => window.history.back()}>Go Back</Button>
      </div>
    );
  }
  
  const { business, services } = data;
  
  // Determine which page to show based on the subPath
  const renderContent = () => {
    // Default to home page if no subPath or if subPath is empty
    if (!subPath) {
      return <HomePage business={business} services={services} slug={slug} />;
    }
    
    // Render the appropriate page based on subPath
    switch (subPath) {
      case "schedule":
        return <SchedulePage business={business} services={services} slug={slug} />;
      case "about":
        return <AboutPage business={business} slug={slug} />;
      case "store":
        return <StorePage business={business} services={services} slug={slug} />;
      default:
        // Handle unknown subpaths
        return <HomePage business={business} services={services} slug={slug} />;
    }
  };
  
  return (
    <BusinessLayout business={business} slug={slug}>
      {renderContent()}
    </BusinessLayout>
  );
}