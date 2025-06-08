import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Clock, ArrowLeftIcon, AlertCircle, Calendar } from "lucide-react";
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

export default function PaymentPending() {
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
        if (token) {          const response = await fetch(`/api/appointments?token=${token}&businessId=${businessId}`);
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
    // Update appointment status to 'pending_payment' if needed
  useEffect(() => {
    if (appointmentId) {
      apiRequest("PUT", `/api/appointments/${appointmentId}`, {
        status: 'pending',
        paymentStatus: 'pending'
      })
      .then(response => {
        if (!response.ok) {
          throw new Error('Failed to update appointment status');
        }
        return response.json();
      })
      .then(data => {
        console.log('Appointment status updated:', data);
      })
      .catch(error => {
        console.error('Error updating appointment status:', error);
      });
    }
  }, [appointmentId]);
    // Handle navigation back
  const handleViewAppointments = () => {
    if (token) {
      setLocation(`/customer-portal/my-appointments?token=${token}&businessId=${businessId}`);
    } else {
      // Redirect to business-aware customer portal route instead of /appointments
      setLocation(`/customer-portal/my-appointments${businessId ? `?businessId=${businessId}` : ''}`);
    }
  };
  
  return (
    <div className="max-w-md mx-auto mt-12 p-4">
      <Card className="border-yellow-200 shadow-md">
        <CardHeader className="bg-yellow-50 text-yellow-800 rounded-t-lg">
          <div className="flex items-center justify-center mb-4">
            <div className="bg-yellow-100 p-3 rounded-full">
              <Clock className="h-10 w-10 text-yellow-600" />
            </div>
          </div>
          <CardTitle className="text-center text-yellow-800">Payment Processing</CardTitle>
          <CardDescription className="text-center text-yellow-700">
            Your payment is being processed
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
            <div className="border border-yellow-100 rounded-md p-4 space-y-3">
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
            
            <div className="bg-yellow-50 p-4 rounded-md flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-yellow-800">
                <p className="mb-2">
                  Your payment is being processed. This may take a few minutes.
                </p>
                <p>
                  Your appointment will be confirmed automatically once the payment clears. 
                  You'll receive an email confirmation when your payment is complete.
                </p>
              </div>
            </div>
          </CardContent>
        ) : (
          <CardContent className="text-center text-muted-foreground py-6">
            No appointment information available
          </CardContent>
        )}
        
        <CardFooter className="flex justify-center p-6">
          <Button 
            variant="outline"
            className="border-yellow-300 text-yellow-700 hover:bg-yellow-50"
            onClick={handleViewAppointments}
          >
            <Calendar className="mr-2 h-4 w-4" />
            View My Appointments
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}