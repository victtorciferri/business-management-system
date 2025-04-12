import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Clock, ArrowLeft } from "lucide-react";

export default function PaymentPending() {
  const [_, setLocation] = useLocation();
  
  // Get the appointment ID from the URL
  const searchParams = new URLSearchParams(window.location.search);
  const appointmentId = searchParams.get("appointmentId");
  
  const handleViewAppointments = () => {
    setLocation("/appointments");
  };
  
  return (
    <div className="max-w-md mx-auto mt-12">
      <Card>
        <CardHeader className="border-b">
          <CardTitle className="flex items-center">
            <Clock className="h-5 w-5 text-amber-500 mr-2" />
            Payment Pending
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="bg-amber-50 p-4 rounded-md mb-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <Clock className="h-5 w-5 text-amber-400" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-amber-700">
                  Your payment is being processed. Your appointment will be confirmed once the payment is complete.
                </p>
              </div>
            </div>
          </div>
          
          <div className="space-y-3">
            <p className="text-sm text-gray-600">
              Some payment methods can take a bit longer to process. You will receive a confirmation email once your payment is complete.
            </p>
            <p className="text-sm text-gray-600">
              If you have any questions, please contact the business or check your payment status in your payment provider's portal.
            </p>
            
            <div className="flex justify-center pt-4">
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