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
import DomainSetupInstructions from "@/pages/domain-setup";
import CustomDomain from "@/pages/custom-domain";
import PreviewBusiness from "@/pages/preview-business";
import AdminDashboard from "@/pages/admin-dashboard";
import AuthPage from "@/pages/auth-page";
import StaffManagement from "@/pages/staff-management";
import StaffProfile from "@/pages/staff-profile";
import StaffSchedule from "@/pages/staff-schedule";
import DynamicPortal from "@/pages/dynamic-portal";

// Payment-related pages
import PaymentSuccess from "@/pages/payment/success";
import PaymentFailure from "@/pages/payment/failure";
import PaymentPending from "@/pages/payment/pending";
import MockPayment from "@/pages/payment/mock";

// Customer portal imports for backwards compatibility
import NewAppointment from "@/pages/customer-portal/new-appointment";
import CustomerPortal from "@/pages/customer-portal/index";
import MyAppointments from "@/pages/customer-portal/my-appointments";
import ErrorTestingPage from "@/pages/error-testing";
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
  
  // Debug information to help troubleshoot
  console.log("App.tsx is rendering");
  console.log("Location:", location);
  console.log("currentUser:", currentUser);
  
  // If we're still loading or auth is loading, show a simple loading state
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }
  
  return (
    <Layout currentUser={currentUser}>
      <Switch>
        <Route path="/">
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        </Route>
        <Route path="/auth" component={AuthPage} />
        <Route path="/new-appointment">
          <Redirect to="/customer-portal/new-appointment" />
        </Route>
        
        {/* Dynamic portal handles both business slug routes and customer portal routes */}
        <Route path="/:slug/:subPath*" component={DynamicPortal} />
        <Route path="/:slug" component={DynamicPortal} />
        
        {/* Preserve explicit customer portal routes for backward compatibility */}
        <Route path="/customer-portal" component={CustomerPortal} />
        <Route path="/customer-portal/new-appointment" component={NewAppointment} />
        <Route path="/customer-portal/my-appointments" component={MyAppointments} />
        
        {/* Protected admin routes */}
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
        {/* Payment related routes */}
        <Route path="/payment/success" component={PaymentSuccess} />
        <Route path="/payment/failure" component={PaymentFailure} />
        <Route path="/payment/pending" component={PaymentPending} />
        <Route path="/payment/mock" component={MockPayment} />
        
        <Route path="/error-testing" component={ErrorTestingPage} />
        <Route component={NotFound} />
      </Switch>
    </Layout>
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
