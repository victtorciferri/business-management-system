import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Appointment, Customer, Service } from "@shared/schema";
import { format } from "date-fns";
import { apiRequest } from "@/lib/queryClient";
import { useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { CreditCard, AlertCircle, ExternalLink } from "lucide-react";

interface CheckoutFormProps {
  appointment: Appointment;
  customer: Customer;
  service: Service;
  paymentUrl?: string | null;
  preferenceId?: string | null;
  isMockPayment?: boolean;
}

export function CheckoutForm({ 
  appointment, 
  customer, 
  service, 
  paymentUrl, 
  preferenceId,
  isMockPayment = false
}: CheckoutFormProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [_, setLocation] = useLocation();

  const appointmentDate = new Date(appointment.date);
  const formattedDate = format(appointmentDate, "MMMM d, yyyy");
  const formattedTime = format(appointmentDate, "h:mm a");

  // Handle direct payment via MercadoPago
  const handleMercadopagoPayment = () => {
    if (paymentUrl) {
      // Redirect to MercadoPago payment page
      window.location.href = paymentUrl;
    } else {
      toast({
        title: "Payment Error",
        description: "Unable to initialize payment. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Handle mock payment (for development without MercadoPago credentials)
  const handleMockPayment = async () => {
    setIsProcessing(true);

    try {
      // Simulate a successful payment process
      toast({
        title: "Processing Payment",
        description: "Please wait while we process your payment...",
      });
      
      // Wait for 2 seconds to simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Call our confirm-payment endpoint
      await apiRequest("POST", "/api/confirm-payment", {
        paymentIntentId: preferenceId || "mercadopago_mock_id",
        appointmentId: appointment.id,
      });

      // Invalidate appointments query to refresh the data
      queryClient.invalidateQueries({
        queryKey: [`/api/appointments`],
      });

      toast({
        title: "Payment Successful",
        description: `Payment of $${service.price} has been processed.`,
      });

      // Redirect to the appointments page
      setLocation("/appointments");
    } catch (error) {
      console.error("Payment error:", error);
      toast({
        title: "Payment Failed",
        description: "There was an error processing your payment. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // Main form submission handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isMockPayment) {
      handleMockPayment();
    } else {
      handleMercadopagoPayment();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="p-4 bg-gray-50 rounded-lg mb-4">
        <h3 className="font-medium text-gray-900 mb-2">Appointment Details</h3>
        <div className="space-y-1">
          <p className="text-sm">
            <span className="font-medium">Customer:</span>{" "}
            {customer.firstName} {customer.lastName}
          </p>
          <p className="text-sm">
            <span className="font-medium">Service:</span> {service.name}
          </p>
          <p className="text-sm">
            <span className="font-medium">Date:</span> {formattedDate} at {formattedTime}
          </p>
          <p className="text-sm">
            <span className="font-medium">Amount:</span> ${service.price}
          </p>
        </div>
      </div>

      <Card>
        <CardContent className="p-4 flex flex-col items-center justify-center">
          <div className="text-center p-6">
            {isMockPayment ? (
              <>
                <CreditCard className="h-12 w-12 text-primary mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">Development Mode Payment</h3>
                <p className="text-gray-500 mb-4">
                  You're using a simulated payment process. In production, this would redirect to MercadoPago.
                </p>
              </>
            ) : !paymentUrl ? (
              <>
                <AlertCircle className="h-12 w-12 text-amber-500 mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">Payment Not Initialized</h3>
                <p className="text-gray-500 mb-4">
                  Unable to initialize payment. The business needs to configure MercadoPago integration.
                </p>
              </>
            ) : (
              <>
                <CreditCard className="h-12 w-12 text-primary mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">MercadoPago Checkout</h3>
                <p className="text-gray-500 mb-4">
                  You'll be redirected to MercadoPago's secure payment page to complete your payment.
                </p>
                <div className="flex items-center justify-center gap-2 mb-4 text-sm text-gray-500">
                  <ExternalLink className="h-4 w-4" />
                  <span>You'll be redirected to MercadoPago for secure payment</span>
                </div>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button 
          type="submit" 
          disabled={isProcessing || (!paymentUrl && !isMockPayment)}
          className="w-full sm:w-auto"
        >
          {isProcessing ? "Processing..." : `Pay $${service.price}`}
        </Button>
      </div>
    </form>
  );
}
