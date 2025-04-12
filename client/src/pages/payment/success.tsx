import { useEffect } from "react";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useQueryClient } from "@tanstack/react-query";

export default function PaymentSuccess() {
  const [_, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Get the appointment ID from the URL
  const searchParams = new URLSearchParams(window.location.search);
  const appointmentId = searchParams.get("appointmentId");
  
  // Update appointment status when returning from successful payment
  useEffect(() => {
    if (!appointmentId) return;
    
    const confirmPayment = async () => {
      try {
        await apiRequest("POST", "/api/confirm-payment", {
          paymentIntentId: searchParams.get("payment_id") || "mercadopago_manual_confirmation",
          appointmentId: parseInt(appointmentId),
        });
        
        // Invalidate appointments query to refresh the data
        queryClient.invalidateQueries({
          queryKey: ["/api/appointments"],
        });
        
        toast({
          title: "Payment Confirmed",
          description: "Your payment has been successfully processed.",
        });
      } catch (error) {
        console.error("Error confirming payment:", error);
        toast({
          title: "Error",
          description: "There was a problem confirming your payment. Please contact support.",
          variant: "destructive",
        });
      }
    };
    
    confirmPayment();
  }, [appointmentId]);
  
  const handleViewAppointments = () => {
    setLocation("/appointments");
  };
  
  return (
    <div className="max-w-md mx-auto mt-12">
      <Card>
        <CardHeader className="border-b">
          <CardTitle className="flex items-center">
            <Check className="h-5 w-5 text-green-500 mr-2" />
            Payment Successful
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="bg-green-50 p-4 rounded-md mb-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <Check className="h-5 w-5 text-green-400" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-green-700">
                  Your payment has been processed successfully. Your appointment is now confirmed.
                </p>
              </div>
            </div>
          </div>
          
          <div className="space-y-3">
            <p className="text-sm text-gray-600">
              A confirmation has been sent to your email address. You can view your appointment details in your appointments page.
            </p>
            
            <div className="flex justify-center pt-4">
              <Button onClick={handleViewAppointments}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                View My Appointments
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}