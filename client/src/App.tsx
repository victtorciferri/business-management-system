import { Switch, Route } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import Layout from "@/components/layout/header";
import Dashboard from "@/pages/dashboard";
import Appointments from "@/pages/appointments";
import Customers from "@/pages/customers";
import Services from "@/pages/services";
import Checkout from "@/pages/checkout";
import NotFound from "@/pages/not-found";
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
    businessName: "Style Studio",
    phone: "555-123-4567",
    createdAt: new Date()
  });

  return (
    <QueryClientProvider client={queryClient}>
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
    </QueryClientProvider>
  );
}

export default App;
