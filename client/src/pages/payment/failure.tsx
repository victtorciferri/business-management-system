import { useState } from "react";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { XCircle, ArrowLeftIcon, AlertTriangle, RefreshCw } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

interface AppointmentDetails {
  id: number;
  date: string;
  serviceName: string;
  servicePrice: number;
  businessName: string;
  staffName?: string;
}

export default function PaymentFailure() {
  const [_, setLocation] = useLocation();
  const [appointment, setAppointment] = useState<AppointmentDetails | null>(null);
  
  // Get the appointment ID from the URL
  const searchParams = new URLSearchParams(window.location.search);
  const appointmentId = searchParams.get("appointmentId");
  const token = searchParams.get("token");
  const businessId = searchParams.get("businessId");
  
  // Fetch appointment details
  const { isLoading, error } = useQuery({
    queryKey: ['/api/appointments', appointmentId],
    queryFn: async () => {
      if (!appointmentId) return null;
      
      try {
        if (token) {
          const response = await fetch(`/api/appointments?token=${token}&businessId=${businessId}`);
          if (!response.ok) throw new Error("Failed to fetch appointments");
          
          const appointments = await response.json();
          const appt = appointments.find((a: any) => a.id === parseInt(appointmentId as string));
            if (appt) {
            const serviceResponse = await apiRequest("GET", `/api/services?businessId=${businessId}`);
            const services = await serviceResponse.json();
            const service = services.find((s: any) => s.id === appt.serviceId);
            
            setAppointment({
              id: appt.id,
              date: new Date(appt.date).toLocaleString(),
              serviceName: service?.name || "Service",
              servicePrice: service?.price || 0,
              businessName: appt.businessName || "Salon",
              staffName: appt.staffName
            });
          }
          return appointments;
        } else {
          const response = await apiRequest("GET", `/api/appointments/${appointmentId}`);
          if (!response.ok) throw new Error("Failed to fetch appointment");
          
          const appt = await response.json();
          
          const serviceResponse = await apiRequest("GET", `/api/services/${appt.serviceId}`);
          const service = await serviceResponse.json();
          
          setAppointment({
            id: appt.id,
            date: new Date(appt.date).toLocaleString(),
            serviceName: service.name,
            servicePrice: service.price,
            businessName: "Your Business",
            staffName: appt.staffName
          });
          
          return appt;
        }
      } catch (error) {
        console.error("Error fetching appointment details:", error);
        return null;
      }
    },
    enabled: !!appointmentId
  });
  
  // Handle navigation back
  const handleGoBack = () => {
    if (token) {
      setLocation(`/customer-portal/new-appointment?token=${token}&businessId=${businessId}`);
    } else {
      setLocation("/customer-portal/new-appointment");
    }
  };
  
  // Handle retry payment
  const handleRetryPayment = () => {
    if (appointmentId) {
      setLocation(`/payment/mock?appointmentId=${appointmentId}${token ? `&token=${token}` : ''}${businessId ? `&businessId=${businessId}` : ''}`);
    }
  };
  
  return (
    <div className="max-w-md mx-auto mt-12 p-4">
      <Card className="border-red-200 shadow-md">
        <CardHeader className="bg-red-50 text-red-800 rounded-t-lg">
          <div className="flex items-center justify-center mb-4">
            <div className="bg-red-100 p-3 rounded-full">
              <XCircle className="h-10 w-10 text-red-600" />
            </div>
          </div>
          <CardTitle className="text-center text-red-800">Payment Failed</CardTitle>
          <CardDescription className="text-center text-red-700">
            We couldn't process your payment
          </CardDescription>
        </CardHeader>
        
        {isLoading ? (
          <CardContent className="flex justify-center py-8">
            <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
          </CardContent>
        ) : error ? (
          <CardContent className="text-center text-red-500 py-6">
            Error loading appointment details
          </CardContent>
        ) : appointment ? (
          <CardContent className="space-y-4 p-6">
            <div className="border border-red-100 rounded-md p-4 space-y-3">
              <div className="flex justify-between items-center">
                <span className="font-medium">Appointment</span>
                <span>#{appointment.id}</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="font-medium">Business</span>
                <span>{appointment.businessName}</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="font-medium">Service</span>
                <span>{appointment.serviceName}</span>
              </div>
              
              {appointment.staffName && (
                <div className="flex justify-between items-center">
                  <span className="font-medium">Staff Member</span>
                  <span>{appointment.staffName}</span>
                </div>
              )}
              
              <div className="flex justify-between items-center">
                <span className="font-medium">Date & Time</span>
                <span>{appointment.date}</span>
              </div>
              
              <div className="flex justify-between items-center pt-2 border-t mt-2">
                <span className="font-medium">Amount</span>
                <span className="font-bold text-lg">${typeof appointment.servicePrice === 'number' ? appointment.servicePrice.toFixed(2) : appointment.servicePrice}</span>
              </div>
            </div>
            
            <div className="bg-red-50 p-4 rounded-md flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-red-800">
                Your payment was not processed successfully. Your appointment is on hold until payment is completed. You can try again or contact the business directly.
              </p>
            </div>
          </CardContent>
        ) : (
          <CardContent className="text-center text-muted-foreground py-6">
            No appointment information available
          </CardContent>
        )}
        
        <CardFooter className="flex flex-col sm:flex-row gap-3 justify-center p-6">
          <Button 
            variant="outline"
            className="border-red-300 text-red-700 hover:bg-red-50"
            onClick={handleGoBack}
          >
            <ArrowLeftIcon className="mr-2 h-4 w-4" />
            Back to Booking
          </Button>
          
          <Button 
            className="bg-red-600 hover:bg-red-700"
            onClick={handleRetryPayment}
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Try Payment Again
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}