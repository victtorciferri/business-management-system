import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Clock, ArrowLeft, RotateCw } from "lucide-react";

export default function PaymentPending() {
  const [_, setLocation] = useLocation();
  
  // Get the appointment ID from the URL
  const searchParams = new URLSearchParams(window.location.search);
  const appointmentId = searchParams.get("appointmentId");
  const token = searchParams.get("token");
  const businessId = searchParams.get("businessId");
  
  // Handle checking payment status
  const handleCheckStatus = () => {
    // Simulate refreshing the page to check for updates
    window.location.reload();
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
          <div className="mx-auto mb-4 bg-yellow-100 w-16 h-16 rounded-full flex items-center justify-center">
            <Clock className="h-8 w-8 text-yellow-600" />
          </div>
          <CardTitle className="text-2xl">Payment Pending</CardTitle>
          <CardDescription>
            Your payment is still being processed
          </CardDescription>
        </CardHeader>
        
        <CardContent className="pt-6 space-y-6">
          <div className="p-4 bg-yellow-50 rounded-md">
            <p className="text-sm text-center">
              Your payment is being processed, but we haven't received confirmation from the payment provider yet. This might take a few minutes.
            </p>
          </div>
          
          <div className="text-center text-sm text-muted-foreground space-y-1">
            <p>Your appointment is <strong>temporarily</strong> on hold.</p>
            <p>Once the payment is confirmed, your appointment will be automatically confirmed.</p>
            <p>You'll receive an email notification when this happens.</p>
          </div>
          
          <div className="grid grid-cols-1 gap-3 pt-4">
            <Button 
              onClick={handleCheckStatus}
              className="w-full"
            >
              <RotateCw className="h-4 w-4 mr-2" />
              Check Payment Status
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