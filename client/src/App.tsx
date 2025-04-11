import { Switch, Route, useLocation } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import Layout from "@/components/layout/header";
import Dashboard from "@/pages/dashboard";
import Appointments from "@/pages/appointments";
import Customers from "@/pages/customers";
import Services from "@/pages/services";
import Checkout from "@/pages/checkout";
import NotFound from "@/pages/not-found";
import CustomerPortalSimple from "@/pages/customer-portal-simple";
import BusinessPortal from "@/pages/business-portal";
import DomainSetupInstructions from "@/pages/domain-setup";
import { useState, useEffect } from "react";
import { User } from "@shared/schema";

function App() {
  // In a real app, this would come from an auth context
  // For this MVP, we'll use a simple state
  const [currentUser, setCurrentUser] = useState<User | null>({
    id: 1,
    username: "businessowner",
    password: "password",
    email: "owner@example.com",
    businessName: "Salon Elegante",
    businessSlug: "salonelegante",
    customDomain: "salonelegante.cl",
    phone: "+56 9 9876 5432",
    createdAt: new Date()
  });

  // Check if we're on a custom domain or subdomain
  const [businessData, setBusinessData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Get current location
  const [location] = useLocation();
  const isCustomerPortal = location.startsWith('/customer-portal');
  
  // Check if the URL looks like a business portal URL (e.g., /salonelegante)
  const businessPortalRegex = /^\/([a-zA-Z0-9_-]+)(?:\/.*)?$/;
  const match = location.match(businessPortalRegex);
  const potentialBusinessSlug = match && 
    match[1] !== 'customer-portal' && 
    match[1] !== 'api' && 
    match[1] !== 'instructions' ? match[1] : null;
  
  useEffect(() => {
    // First check if we have business data from window
    if (typeof window !== "undefined" && (window as any).BUSINESS_DATA) {
      setBusinessData((window as any).BUSINESS_DATA);
      setIsLoading(false);
      return;
    }
    
    // If we're on a potential business URL, try to fetch business data by slug
    if (potentialBusinessSlug) {
      console.log(`Detected potential business slug: ${potentialBusinessSlug}, fetching data...`);
      
      fetch(`/api/business-data/${potentialBusinessSlug}`)
        .then(response => {
          if (!response.ok) {
            throw new Error(`Failed to fetch business data: ${response.status}`);
          }
          return response.json();
        })
        .then(data => {
          console.log(`Successfully fetched business data for ${potentialBusinessSlug}:`, data);
          setBusinessData(data);
        })
        .catch(error => {
          console.error(`Error fetching business data for ${potentialBusinessSlug}:`, error);
        })
        .finally(() => setIsLoading(false));
    } else {
      // Otherwise make an API call to check the current domain context
      fetch('/api/current-business')
        .then(response => response.json())
        .then(data => {
          if (data.business) {
            setBusinessData({ business: data.business, services: data.services || [] });
          }
        })
        .catch(error => console.error('Error checking business context:', error))
        .finally(() => setIsLoading(false));
    }
  }, [potentialBusinessSlug]);
  
  // Determine if this is a business portal based on the data we have
  const isBusinessPortal = !!businessData?.business || !!potentialBusinessSlug;
  
  // Debug information to help troubleshoot
  console.log("App.tsx is rendering");
  console.log("Location:", location);
  console.log("isBusinessPortal:", isBusinessPortal);
  console.log("isCustomerPortal:", isCustomerPortal);
  console.log("businessData:", businessData);
  console.log("window.BUSINESS_DATA:", typeof window !== "undefined" ? (window as any).BUSINESS_DATA : "Not available");
  
  // If we're still loading, show a simple loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }
  
  return (
    <QueryClientProvider client={queryClient}>
      {isCustomerPortal ? (
        <div className="min-h-screen bg-background">
          <Switch>
            <Route path="/customer-portal" component={CustomerPortalSimple} />
            <Route component={NotFound} />
          </Switch>
        </div>
      ) : isBusinessPortal ? (
        <div className="min-h-screen bg-background">
          <Switch>
            {/* For business subpages like /:slug/services */}
            <Route path="/:slug/:subPath*">
              {(params: { slug: string, 'subPath*'?: string }) => (
                <BusinessPortal 
                  slug={params.slug} 
                  subPath={params['subPath*'] || ''} 
                  initialData={businessData}
                />
              )}
            </Route>
            {/* For main business page /:slug */}
            <Route path="/:slug">
              {(params: { slug: string }) => (
                <BusinessPortal 
                  slug={params.slug}
                  initialData={businessData}
                />
              )}
            </Route>
            <Route component={NotFound} />
          </Switch>
        </div>
      ) : (
        <Layout currentUser={currentUser}>
          <Switch>
            <Route path="/" component={Dashboard} />
            <Route path="/appointments" component={Appointments} />
            <Route path="/customers" component={Customers} />
            <Route path="/services" component={Services} />
            <Route path="/instructions/domain-setup" component={DomainSetupInstructions} />
            <Route path="/checkout/:appointmentId">
              {params => <Checkout appointmentId={Number(params.appointmentId)} />}
            </Route>
            <Route component={NotFound} />
          </Switch>
        </Layout>
      )}
    </QueryClientProvider>
  );
}

export default App;
