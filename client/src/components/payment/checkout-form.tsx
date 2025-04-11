import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Appointment, Customer, Service } from "@shared/schema";
import { format } from "date-fns";
import { apiRequest } from "@/lib/queryClient";
import { useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { CreditCard, AlertCircle } from "lucide-react";

interface CheckoutFormProps {
  appointment: Appointment;
  customer: Customer;
  service: Service;
}

export function CheckoutForm({ appointment, customer, service }: CheckoutFormProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [_, setLocation] = useLocation();

  const appointmentDate = new Date(appointment.date);
  const formattedDate = format(appointmentDate, "MMMM d, yyyy");
  const formattedTime = format(appointmentDate, "h:mm a");

  // This is a placeholder for the Mercadopago implementation
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    try {
      // Simulating a payment process for now
      // This will be replaced with Mercadopago integration
      
      // In a real implementation, we would:
      // 1. Create a Mercadopago preference
      // 2. Redirect user to Mercadopago checkout or render embedded form
      // 3. Handle the callback/webhook when payment completes
      
      setTimeout(async () => {
        // Mock successful payment
        // Update the appointment payment status on our backend
        await apiRequest("POST", "/api/confirm-payment", {
          paymentIntentId: "mercadopago_placeholder_id",
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

        // Redirect back to appointments page
        setLocation("/appointments");
        
        setIsProcessing(false);
      }, 2000);
    } catch (error) {
      toast({
        title: "Payment Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
      setIsProcessing(false);
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
            <AlertCircle className="h-12 w-12 text-amber-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">Mercadopago Integration Pending</h3>
            <p className="text-gray-500 mb-4">
              Payment processing with Mercadopago will be implemented soon. This is a placeholder for the payment form.
            </p>
            <div className="flex items-center justify-center gap-2 mb-4 text-sm text-gray-500">
              <CreditCard className="h-4 w-4" />
              <span>Supports credit/debit cards and local payment methods</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button 
          type="submit" 
          disabled={isProcessing}
          className="w-full sm:w-auto"
        >
          {isProcessing ? "Processing..." : `Pay $${service.price}`}
        </Button>
      </div>
    </form>
  );
}
