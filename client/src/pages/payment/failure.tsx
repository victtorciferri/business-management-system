import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertTriangle, ArrowLeft, RefreshCw } from "lucide-react";

export default function PaymentFailure() {
  const [_, setLocation] = useLocation();
  
  // Get the appointment ID from the URL
  const searchParams = new URLSearchParams(window.location.search);
  const appointmentId = searchParams.get("appointmentId");
  
  const handleRetryPayment = () => {
    // Redirect back to checkout page
    if (appointmentId) {
      setLocation(`/checkout?appointmentId=${appointmentId}`);
    } else {
      setLocation("/appointments");
    }
  };
  
  const handleViewAppointments = () => {
    setLocation("/appointments");
  };
  
  return (
    <div className="max-w-md mx-auto mt-12">
      <Card>
        <CardHeader className="border-b">
          <CardTitle className="flex items-center">
            <AlertTriangle className="h-5 w-5 text-red-500 mr-2" />
            Payment Failed
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="bg-red-50 p-4 rounded-md mb-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <AlertTriangle className="h-5 w-5 text-red-400" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">
                  There was a problem processing your payment. Your appointment is not confirmed.
                </p>
              </div>
            </div>
          </div>
          
          <div className="space-y-3">
            <p className="text-sm text-gray-600">
              Your payment was not completed successfully. You can try again or contact the business for assistance.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
              {appointmentId && (
                <Button onClick={handleRetryPayment} variant="default">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Try Again
                </Button>
              )}
              <Button onClick={handleViewAppointments} variant="outline">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Appointments
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}