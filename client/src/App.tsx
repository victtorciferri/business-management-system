import { Switch, Route, useLocation, Redirect } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import Layout from "@/components/layout/header";
import Dashboard from "@/pages/dashboard";
import Appointments from "@/pages/appointments";
import Customers from "@/pages/customers";
import Services from "@/pages/services";
import Products from "@/pages/products";
import Checkout from "@/pages/checkout";
import NotFound from "@/pages/not-found";
import BusinessPortal from "@/pages/business-portal";
import DomainSetupInstructions from "@/pages/domain-setup";
import CustomDomain from "@/pages/custom-domain";
import PreviewBusiness from "@/pages/preview-business";
import AdminDashboard from "@/pages/admin-dashboard";
import AuthPage from "@/pages/auth-page";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useState, useEffect } from "react";
import { User } from "@shared/schema";
import { AuthProvider, useAuth } from "@/hooks/use-auth";

function AppContent() {
  const { user: currentUser, isLoading: authLoading } = useAuth();
  
  // Check if we're on a custom domain or subdomain
  const [businessData, setBusinessData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Get current location
  const [location, setLocation] = useLocation();
  
  // Check if the URL looks like a business portal URL (e.g., /salonelegante)
  const businessPortalRegex = /^\/([a-zA-Z0-9_-]+)(?:\/.*)?$/;
  const match = location.match(businessPortalRegex);
  
  // Define reserved paths that should not be treated as business slugs
  const reservedPaths = [
    'api', 'auth', 'admin', 'checkout', 'preview', 'instructions',
    'products', 'services', 'dashboard', 'appointments', 'customers'
  ];
  
  const potentialBusinessSlug = match && 
    !reservedPaths.includes(match[1]) ? match[1] : null;
  
  // Redirect /customer-portal to the default business page
  useEffect(() => {
    if (location.startsWith('/customer-portal')) {
      setLocation('/salonelegante');
    }
  }, [location, setLocation]);
  
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
  const isBusinessPortal = (!!businessData?.business || !!potentialBusinessSlug) && 
                          !location.startsWith('/auth') && 
                          !location.startsWith('/admin');
  
  // Debug information to help troubleshoot
  console.log("App.tsx is rendering");
  console.log("Location:", location);
  console.log("isBusinessPortal:", isBusinessPortal);
  console.log("businessData:", businessData);
  console.log("window.BUSINESS_DATA:", typeof window !== "undefined" ? (window as any).BUSINESS_DATA : "Not available");
  console.log("currentUser:", currentUser);
  
  // If we're still loading or auth is loading, show a simple loading state
  if (isLoading || authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }
  
  return (
    isBusinessPortal ? (
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
          <Route path="/">
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          </Route>
          <Route path="/auth" component={AuthPage} />
          <Route path="/appointments">
            <ProtectedRoute>
              <Appointments />
            </ProtectedRoute>
          </Route>
          <Route path="/customers">
            <ProtectedRoute>
              <Customers />
            </ProtectedRoute>
          </Route>
          <Route path="/services">
            <ProtectedRoute>
              <Services />
            </ProtectedRoute>
          </Route>
          <Route path="/products">
            <ProtectedRoute>
              <Products />
            </ProtectedRoute>
          </Route>
          <Route path="/custom-domain">
            <ProtectedRoute>
              <CustomDomain />
            </ProtectedRoute>
          </Route>
          <Route path="/instructions/domain-setup">
            <ProtectedRoute>
              <DomainSetupInstructions />
            </ProtectedRoute>
          </Route>
          <Route path="/admin">
            <ProtectedRoute requiredRole="admin">
              <AdminDashboard />
            </ProtectedRoute>
          </Route>
          <Route path="/checkout/:appointmentId">
            {params => (
              <ProtectedRoute>
                <Checkout appointmentId={Number(params.appointmentId)} />
              </ProtectedRoute>
            )}
          </Route>
          <Route path="/preview/:businessId">
            <ProtectedRoute>
              <PreviewBusiness />
            </ProtectedRoute>
          </Route>
          <Route component={NotFound} />
        </Switch>
      </Layout>
    )
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
