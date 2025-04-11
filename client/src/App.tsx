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
import { useState } from "react";
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
    phone: "+56 9 9876 5432",
    createdAt: new Date()
  });
  
  const [location] = useLocation();
  const isCustomerPortal = location.startsWith('/customer-portal');
  const isBusinessPortal = /^\/[^/]+$/.test(location) && location !== '/';
  
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
            <Route path="/:slug" component={BusinessPortal} />
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
