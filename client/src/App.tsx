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
import PlatformAdmin from "@/pages/platform-admin";
import AuthPage from "@/pages/auth-page";
import StaffManagement from "@/pages/staff-management";
import StaffProfile from "@/pages/staff-profile";
import StaffSchedule from "@/pages/staff-schedule";

// Settings and theme pages
import ThemeEditor from "@/pages/theme-editor";
import AdminThemeEditor from "@/pages/admin-theme-editor";
import DashboardSettings from "@/pages/dashboard/settings";
import TemplateSettings from "@/pages/dashboard/settings/theme/templates";
import ThemeSelectorDemo from "@/pages/theme-selector-demo";
import ColorModeDemo from "@/pages/color-mode-demo";

// Payment-related pages
import PaymentSuccess from "@/pages/payment/success";
import PaymentFailure from "@/pages/payment/failure";
import PaymentPending from "@/pages/payment/pending";
import MockPayment from "@/pages/payment/mock";

import NewAppointment from "@/pages/customer-portal/new-appointment";
import CustomerPortal from "@/pages/customer-portal/index";
import MyAppointments from "@/pages/customer-portal/my-appointments";
import CustomerServices from "@/pages/customer-portal/services";
import ErrorTestingPage from "@/pages/error-testing";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useState, useEffect } from "react";
import { User } from "@shared/schema";
import { AuthProvider, useAuth } from "@/hooks/use-auth";
import { BusinessContextProvider } from "@/contexts/BusinessContext";

// Modern theme providers are used exclusively now

// New 2025 theme providers
import { ThemeProvider } from "@/providers/ThemeProvider";
import GlobalThemeProvider from "@/providers/GlobalThemeProvider";
import DarkModeInitializer from "@/components/shared/dark-mode-initializer";

// New theme-related pages for 2025 edition
import { ThemeMarketplacePage } from "@/pages/ThemeMarketplacePage";
import DebugAuthPage from "@/pages/debug-auth";
import DebugLoginPage from "@/pages/debug-login";

function AppContent() {
  const { user: currentUser, isLoading: authLoading } = useAuth();
  
  // Check if we're on a custom domain or subdomain
  const [businessData, setBusinessData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Get current location
  const [location] = useLocation();
  
  // Define debug auth paths vs. regular auth paths
  const isDebugAuthPath = ['/auth-debug', '/debug-login', '/debug/login'].includes(location);
  const isRegularAuthPath = location === '/auth';
  const isAnyAuthPath = isDebugAuthPath || isRegularAuthPath;
  
  // Use the same useEffect for ALL paths to maintain consistent hook order
  useEffect(() => {
    // Debug information to help troubleshoot
    console.log("App.tsx is rendering");
    console.log("Location:", location);
    console.log("Is auth path:", isAnyAuthPath);
    
    if (isAnyAuthPath) {
      console.log('Auth page route detected, bypassing business logic checks');
      setIsLoading(false);
      return; // Exit early for auth paths
    }
    
    // Rest of the initialization logic will run for non-auth paths
  }, [isAnyAuthPath, location, isDebugAuthPath, isRegularAuthPath]);
  
  // Special case for auth pages - render them directly
  if (isAnyAuthPath) {
    return (
      <div className="min-h-screen">
        {isRegularAuthPath && <AuthPage />}
        {isDebugAuthPath && <DebugLoginPage />}
      </div>
    );
  }

  // Check if the URL looks like a business portal URL (e.g., /salonelegante)
  const businessPortalRegex = /^\/([a-zA-Z0-9_-]+)(?:\/.*)?$/;
  const match = location.match(businessPortalRegex);
  
  // Define reserved paths that should not be treated as business slugs
  const reservedPaths = [
    'api', 'auth', 'admin', 'checkout', 'preview', 'instructions',
    'products', 'services', 'dashboard', 'appointments', 'customers',
    'staff-management', 'staff-profile', 'staff', 'staff-schedule',
    'new-appointment', 'customer-portal', 'error-testing', 'payment',
    'theme-editor', 'theme-showcase', 'theme-marketplace', 'platform-admin',
    'debug'
  ];
  
  const potentialBusinessSlug = match && 
    !reservedPaths.includes(match[1]) ? match[1] : null;
  
  // Handle customer portal routes - retain as separate routes
  useEffect(() => {
    // Don't automatically redirect customer portal routes
    // This allows us to have a dedicated customer portal distinct from business portals
    console.log("Customer portal route detected:", location);
  }, [location]);
  
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
                          !location.startsWith('/admin') &&
                          !location.startsWith('/customer-portal') &&
                          !location.startsWith('/color-mode-demo');
  
  // Additional debug information to help troubleshoot
  // Debug logs for business portal
  if (!isAnyAuthPath) {
    console.log("isBusinessPortal:", isBusinessPortal);
    console.log("businessData:", businessData);
    console.log("window.BUSINESS_DATA:", typeof window !== "undefined" ? (window as any).BUSINESS_DATA : "Not available");
    console.log("currentUser:", currentUser);
  }
  
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
        <BusinessContextProvider>
          {/* Use the new theme provider with business context for business portals */}
          <ThemeProvider>
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
          </ThemeProvider>
        </BusinessContextProvider>
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
          <Route path="/auth-debug" component={DebugLoginPage} />
          <Route path="/new-appointment">
            <Redirect to="/customer-portal/new-appointment" />
          </Route>
          {/* Customer Portal Routes - Wrapped with BusinessContextProvider and Theme Providers */}
          <Route path="/customer-portal">
            <BusinessContextProvider>
              <ThemeProvider>
                  <CustomerPortal />
              </ThemeProvider>
            </BusinessContextProvider>
          </Route>
          <Route path="/customer-portal/new-appointment">
            <BusinessContextProvider>
              <ThemeProvider>
                  <NewAppointment />
              </ThemeProvider>
            </BusinessContextProvider>
          </Route>
          <Route path="/customer-portal/my-appointments">
            <BusinessContextProvider>
              <ThemeProvider>
                  <MyAppointments />
              </ThemeProvider>
            </BusinessContextProvider>
          </Route>
          <Route path="/customer-portal/services">
            <BusinessContextProvider>
              <ThemeProvider>
                  <CustomerServices />
              </ThemeProvider>
            </BusinessContextProvider>
          </Route>
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
              <GlobalThemeProvider>
                <ThemeProvider>
                  <DarkModeInitializer />
                  <AdminDashboard />
                </ThemeProvider>
              </GlobalThemeProvider>
            </ProtectedRoute>
          </Route>
          <Route path="/platform-admin/create">
            <ProtectedRoute requiredRole="admin">
              <GlobalThemeProvider>
                <ThemeProvider>
                  <PlatformAdmin isCreateMode={true} />
                </ThemeProvider>
              </GlobalThemeProvider>
            </ProtectedRoute>
          </Route>
          <Route path="/platform-admin/edit/:id">
            {params => (
              <ProtectedRoute requiredRole="admin">
                <GlobalThemeProvider>
                  <ThemeProvider>
                    <PlatformAdmin editBusinessId={Number(params.id)} />
                  </ThemeProvider>
                </GlobalThemeProvider>
              </ProtectedRoute>
            )}
          </Route>
          <Route path="/platform-admin/:slug">
            {params => (
              <ProtectedRoute requiredRole="admin">
                <GlobalThemeProvider>
                  <ThemeProvider>
                    <PlatformAdmin businessSlug={params.slug} />
                  </ThemeProvider>
                </GlobalThemeProvider>
              </ProtectedRoute>
            )}
          </Route>
          <Route path="/platform-admin">
            <ProtectedRoute requiredRole="admin">
              <GlobalThemeProvider>
                <ThemeProvider>
                  <PlatformAdmin />
                </ThemeProvider>
              </GlobalThemeProvider>
            </ProtectedRoute>
          </Route>
          <Route path="/admin-theme-editor/:businessId">
            {params => (
              <ProtectedRoute requiredRole="admin">
                <GlobalThemeProvider>
                  <ThemeProvider>
                    <DarkModeInitializer />
                    <AdminThemeEditor businessId={parseInt(params.businessId, 10)} />
                  </ThemeProvider>
                </GlobalThemeProvider>
              </ProtectedRoute>
            )}
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
          <Route path="/staff-management">
            <ProtectedRoute>
              <StaffManagement />
            </ProtectedRoute>
          </Route>
          <Route path="/staff/:id/profile">
            {params => (
              <ProtectedRoute>
                <StaffProfile staffId={params.id} />
              </ProtectedRoute>
            )}
          </Route>
          <Route path="/staff/schedule">
            <ProtectedRoute>
              <StaffSchedule />
            </ProtectedRoute>
          </Route>
          
          {/* Theme and Settings routes */}
          <Route path="/theme-selector-demo">
            <ProtectedRoute>
              <BusinessContextProvider>
                <ThemeProvider>
                    <ThemeSelectorDemo />
                </ThemeProvider>
              </BusinessContextProvider>
            </ProtectedRoute>
          </Route>
          <Route path="/color-mode-demo">
            <ProtectedRoute>
              <BusinessContextProvider>
                <ThemeProvider>
                    <ColorModeDemo />
                </ThemeProvider>
              </BusinessContextProvider>
            </ProtectedRoute>
          </Route>
          
          {/* Debug Routes - For development only */}
          <Route path="/debug/auth">
            <GlobalThemeProvider>
              <DebugAuthPage />
            </GlobalThemeProvider>
          </Route>
          <Route path="/debug/login">
            <GlobalThemeProvider>
              <DebugLoginPage />
            </GlobalThemeProvider>
          </Route>
          <Route path="/theme-showcase">
            <ProtectedRoute>
              <BusinessContextProvider>
                <ThemeProvider>
                    {/* Placeholder for ThemeShowcase */}
                    <div>Theme Showcase Coming Soon</div>
                </ThemeProvider>
              </BusinessContextProvider>
            </ProtectedRoute>
          </Route>
          <Route path="/theme-marketplace">
            <ProtectedRoute>
              <GlobalThemeProvider>
                <BusinessContextProvider>
                  <ThemeProvider>
                    <DarkModeInitializer />
                    <ThemeMarketplacePage />
                  </ThemeProvider>
                </BusinessContextProvider>
              </GlobalThemeProvider>
            </ProtectedRoute>
          </Route>
          <Route path="/theme-editor">
            <ProtectedRoute>
              <BusinessContextProvider>
                <GlobalThemeProvider>
                  <ThemeProvider>
                    <DarkModeInitializer />
                    <ThemeEditor />
                  </ThemeProvider>
                </GlobalThemeProvider>
              </BusinessContextProvider>
            </ProtectedRoute>
          </Route>
          <Route path="/dashboard/settings">
            <ProtectedRoute>
              <BusinessContextProvider>
                <ThemeProvider>
                    <DashboardSettings />
                </ThemeProvider>
              </BusinessContextProvider>
            </ProtectedRoute>
          </Route>
          <Route path="/dashboard/settings/theme/templates">
            <ProtectedRoute>
              <BusinessContextProvider>
                <ThemeProvider>
                    <TemplateSettings />
                </ThemeProvider>
              </BusinessContextProvider>
            </ProtectedRoute>
          </Route>
          
          {/* Payment related routes */}
          <Route path="/payment/success" component={PaymentSuccess} />
          <Route path="/payment/failure" component={PaymentFailure} />
          <Route path="/payment/pending" component={PaymentPending} />
          <Route path="/payment/mock" component={MockPayment} />
          
          <Route path="/error-testing" component={ErrorTestingPage} />
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
        {/* Global Theme Provider from 2025 Edition - App-wide theming */}
        <GlobalThemeProvider>
          <BusinessContextProvider>
            {/* 
              Important: Don't wrap AppContent in a ThemeProvider here.
              AppContent manages its own theme providers based on routes.
              Having a ThemeProvider here creates an unfortunate circular dependency.
            */}
            <AppContent />
            <DarkModeInitializer />
          </BusinessContextProvider>
        </GlobalThemeProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
