import { useState, useEffect } from "react";
import { useStripe, useElements, PaymentElement } from "@stripe/react-stripe-js";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Appointment, Customer, Service } from "@shared/schema";
import { format } from "date-fns";
import { apiRequest } from "@/lib/queryClient";
import { useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";

interface CheckoutFormProps {
  appointment: Appointment;
  customer: Customer;
  service: Service;
}

export function CheckoutForm({ appointment, customer, service }: CheckoutFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [_, setLocation] = useLocation();

  const appointmentDate = new Date(appointment.date);
  const formattedDate = format(appointmentDate, "MMMM d, yyyy");
  const formattedTime = format(appointmentDate, "h:mm a");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);

    try {
      // Confirm the payment
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: window.location.origin,
        },
        redirect: "if_required",
      });

      if (error) {
        toast({
          title: "Payment Failed",
          description: error.message,
          variant: "destructive",
        });
      } else if (paymentIntent && paymentIntent.status === "succeeded") {
        // Update the appointment payment status on our backend
        await apiRequest("POST", "/api/confirm-payment", {
          paymentIntentId: paymentIntent.id,
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
      }
    } catch (error) {
      toast({
        title: "Payment Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    }

    setIsProcessing(false);
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

      <div className="p-4 border rounded-lg">
        <h3 className="font-medium text-gray-900 mb-4">Payment Information</h3>
        <PaymentElement />
      </div>

      <div className="flex justify-end">
        <Button 
          type="submit" 
          disabled={!stripe || isProcessing}
          className="w-full sm:w-auto"
        >
          {isProcessing ? "Processing..." : `Pay $${service.price}`}
        </Button>
      </div>
    </form>
  );
}
