import { useState, useEffect } from "react";
import { useParams, useLocation } from "wouter";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckoutForm } from "@/components/payment/checkout-form";
import { useQuery } from "@tanstack/react-query";
import { Appointment, Customer, Service } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { ArrowLeft, CreditCard } from "lucide-react";

// Initialize Stripe
if (!import.meta.env.VITE_STRIPE_PUBLIC_KEY) {
  console.error("Missing required Stripe key: VITE_STRIPE_PUBLIC_KEY");
}
const stripePromise = loadStripe(
  import.meta.env.VITE_STRIPE_PUBLIC_KEY || "pk_test_placeholder"
);

interface CheckoutProps {
  appointmentId: number;
}

export default function Checkout({ appointmentId }: CheckoutProps) {
  const [_, setLocation] = useLocation();
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  
  // In a real app, this would come from an auth context
  const userId = 1;
  
  // Fetch appointment details
  const { data: appointment, isLoading: isLoadingAppointment } = useQuery<Appointment>({
    queryKey: [`/api/appointments?userId=${userId}&appointmentId=${appointmentId}`],
    enabled: !!appointmentId,
  });
  
  // Appointment could be undefined, so we need to handle that case
  const customerId = appointment?.customerId;
  const serviceId = appointment?.serviceId;
  
  // Fetch customer details
  const { data: customer, isLoading: isLoadingCustomer } = useQuery<Customer>({
    queryKey: [`/api/customers?userId=${userId}&customerId=${customerId}`],
    enabled: !!customerId,
  });
  
  // Fetch service details
  const { data: service, isLoading: isLoadingService } = useQuery<Service>({
    queryKey: [`/api/services?userId=${userId}&serviceId=${serviceId}`],
    enabled: !!serviceId,
  });
  
  // Create payment intent when the component mounts
  useEffect(() => {
    if (!appointment || !service) return;
    
    // Check if payment already made
    if (appointment.paymentStatus === "paid") {
      return;
    }
    
    const createPaymentIntent = async () => {
      try {
        const response = await apiRequest("POST", "/api/create-payment-intent", {
          appointmentId: appointment.id,
        });
        
        const data = await response.json();
        setClientSecret(data.clientSecret);
      } catch (error) {
        console.error("Error creating payment intent:", error);
      }
    };
    
    createPaymentIntent();
  }, [appointment, service]);
  
  const isLoading = isLoadingAppointment || isLoadingCustomer || isLoadingService;
  
  const goBack = () => {
    setLocation("/appointments");
  };
  
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        <p className="mt-4 text-gray-500">Loading payment details...</p>
      </div>
    );
  }
  
  if (!appointment || !customer || !service) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="text-center max-w-md mx-auto">
          <CreditCard className="h-12 w-12 text-gray-400 mx-auto" />
          <h3 className="mt-2 text-xl font-medium text-gray-900">Appointment not found</h3>
          <p className="mt-1 text-gray-500">
            We couldn't find the appointment details needed for this payment.
          </p>
          <Button className="mt-6" onClick={goBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Appointments
          </Button>
        </div>
      </div>
    );
  }
  
  // Check if payment already made
  if (appointment.paymentStatus === "paid") {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="text-center max-w-md mx-auto">
          <div className="h-12 w-12 rounded-full bg-green-100 text-green-600 flex items-center justify-center mx-auto">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
            </svg>
          </div>
          <h3 className="mt-2 text-xl font-medium text-gray-900">Payment Already Completed</h3>
          <p className="mt-1 text-gray-500">
            This appointment has already been paid for.
          </p>
          <Button className="mt-6" onClick={goBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Appointments
          </Button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <Button variant="outline" onClick={goBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Appointments
        </Button>
      </div>
      
      <Card>
        <CardHeader className="border-b">
          <CardTitle className="text-xl">Process Payment</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          {clientSecret ? (
            <Elements 
              stripe={stripePromise} 
              options={{ clientSecret, appearance: { theme: 'stripe' } }}
            >
              <CheckoutForm 
                appointment={appointment} 
                customer={customer} 
                service={service} 
              />
            </Elements>
          ) : (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
