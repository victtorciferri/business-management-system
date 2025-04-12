import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { XCircle, ArrowLeft, RefreshCw } from "lucide-react";

export default function PaymentFailure() {
  const [_, setLocation] = useLocation();
  
  // Get the appointment ID from the URL
  const searchParams = new URLSearchParams(window.location.search);
  const appointmentId = searchParams.get("appointmentId");
  const token = searchParams.get("token");
  const businessId = searchParams.get("businessId");
  
  // Handle retry payment
  const handleRetryPayment = () => {
    // In a real implementation, we would redirect to MercadoPago checkout
    // For now, redirect to our mock payment page for testing
    setLocation(`/payment/mock?appointmentId=${appointmentId}&token=${token}&businessId=${businessId}`);
  };
  
  // Handle return to appointments
  const handleReturnToAppointments = () => {
    if (token) {
      // Customer view
      setLocation(`/customer-portal/my-appointments?token=${token}&businessId=${businessId}`);
    } else {
      // Business owner view
      setLocation("/appointments");
    }
  };
  
  return (
    <div className="max-w-md mx-auto mt-12">
      <Card>
        <CardHeader className="text-center border-b">
          <div className="mx-auto mb-4 bg-red-100 w-16 h-16 rounded-full flex items-center justify-center">
            <XCircle className="h-8 w-8 text-red-600" />
          </div>
          <CardTitle className="text-2xl">Payment Failed</CardTitle>
          <CardDescription>
            There was a problem processing your payment
          </CardDescription>
        </CardHeader>
        
        <CardContent className="pt-6 space-y-6">
          <div className="p-4 bg-red-50 rounded-md space-y-3">
            <p className="text-sm text-center">
              Your payment could not be processed. This could be due to:
            </p>
            <ul className="text-sm space-y-1 list-disc pl-5">
              <li>Insufficient funds</li>
              <li>Card declined by your bank</li>
              <li>Incorrect payment information</li>
              <li>Temporary payment system error</li>
            </ul>
          </div>
          
          <div className="text-center text-sm text-muted-foreground space-y-1">
            <p>Your appointment has <strong>not</strong> been confirmed.</p>
            <p>No charges have been made to your payment method.</p>
          </div>
          
          <div className="grid grid-cols-1 gap-3 pt-4">
            <Button 
              onClick={handleRetryPayment}
              className="w-full"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Try Payment Again
            </Button>
            
            <Button 
              variant="outline"
              onClick={handleReturnToAppointments}
              className="w-full"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Return to Appointments
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}