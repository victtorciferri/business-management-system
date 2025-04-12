import { useState } from "react";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, CheckCircle, XCircle, AlertCircle } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";

export default function MockPayment() {
  const [_, setLocation] = useLocation();
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);
  const queryClient = useQueryClient();
  
  // Get the appointment ID from the URL
  const searchParams = new URLSearchParams(window.location.search);
  const appointmentId = searchParams.get("appointmentId");
  
  if (!appointmentId) {
    return (
      <div className="max-w-md mx-auto mt-12">
        <Card>
          <CardHeader className="border-b">
            <CardTitle className="flex items-center">
              <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
              Invalid Request
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <p className="text-center text-gray-600 mb-4">
              No appointment ID provided. Unable to process payment.
            </p>
            <div className="flex justify-center">
              <Button variant="outline" onClick={() => setLocation("/appointments")}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Appointments
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  const handleSuccessfulPayment = async () => {
    setIsProcessing(true);
    
    try {
      // Update payment status on the backend
      await apiRequest("POST", "/api/confirm-payment", {
        paymentIntentId: `mock_successful_${Date.now()}`,
        appointmentId: parseInt(appointmentId),
      });
      
      // Invalidate appointment queries to refresh data
      queryClient.invalidateQueries({
        queryKey: ["/api/appointments"],
      });
      
      toast({
        title: "Success",
        description: "Payment processed successfully",
      });
      
      // Redirect to success page
      setLocation(`/payment/success?appointmentId=${appointmentId}`);
    } catch (error) {
      console.error("Payment simulation error:", error);
      toast({
        title: "Error",
        description: "Failed to process mock payment",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };
  
  const handleFailedPayment = () => {
    toast({
      title: "Payment Failed",
      description: "Simulating a failed payment",
      variant: "destructive",
    });
    
    // Redirect to failure page
    setLocation(`/payment/failure?appointmentId=${appointmentId}`);
  };
  
  const handlePendingPayment = () => {
    toast({
      title: "Payment Pending",
      description: "Simulating a pending payment",
      variant: "default",
    });
    
    // Redirect to pending page
    setLocation(`/payment/pending?appointmentId=${appointmentId}`);
  };
  
  const handleCancel = () => {
    setLocation("/appointments");
  };
  
  return (
    <div className="max-w-md mx-auto mt-12">
      <Card>
        <CardHeader className="border-b">
          <CardTitle>Mock Payment Processor</CardTitle>
          <CardDescription>
            Development environment for testing payment flows
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="p-4 bg-blue-50 text-blue-700 rounded-md mb-6">
            <p className="text-sm">
              <AlertCircle className="h-4 w-4 inline-block mr-1" />
              In a real environment, users would be redirected to MercadoPago's checkout page. 
              This is a simulated payment environment for development purposes.
            </p>
          </div>
          
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              Appointment ID: <span className="font-mono">{appointmentId}</span>
            </p>
            
            <div className="grid grid-cols-1 gap-3 mt-6">
              <Button
                className="w-full"
                onClick={handleSuccessfulPayment}
                disabled={isProcessing}
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                {isProcessing ? "Processing..." : "Simulate Successful Payment"}
              </Button>
              
              <Button
                variant="outline"
                className="w-full"
                onClick={handleFailedPayment}
                disabled={isProcessing}
              >
                <XCircle className="h-4 w-4 mr-2" />
                Simulate Failed Payment
              </Button>
              
              <Button
                variant="outline"
                className="w-full"
                onClick={handlePendingPayment}
                disabled={isProcessing}
              >
                <AlertCircle className="h-4 w-4 mr-2" />
                Simulate Pending Payment
              </Button>
              
              <Button
                variant="ghost"
                className="w-full"
                onClick={handleCancel}
                disabled={isProcessing}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Cancel
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}