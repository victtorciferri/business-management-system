import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, ArrowLeft, Loader2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

interface AppointmentDetails {
  id: number;
  date: string;
  serviceName?: string;
  businessName?: string;
  staffName?: string;
}

export default function PaymentSuccess() {
  const [_, setLocation] = useLocation();
  const [appointment, setAppointment] = useState<AppointmentDetails | null>(null);
  
  // Get the appointment ID from the URL
  const searchParams = new URLSearchParams(window.location.search);
  const appointmentId = searchParams.get("appointmentId");
  const token = searchParams.get("token");
  const businessId = searchParams.get("businessId");
  
  // Fetch appointment details
  const { isLoading, error } = useQuery({
    queryKey: ["/api/appointments", appointmentId],
    queryFn: async () => {
      if (!appointmentId) return null;
      
      try {
        // For customer portal with token
        if (token) {
          const response = await fetch(`/api/appointments?token=${token}&businessId=${businessId}`);
          if (!response.ok) throw new Error("Failed to fetch appointment");
          
          const appointments = await response.json();
          const appt = appointments.find((a: any) => a.id === parseInt(appointmentId as string));
          
          if (appt) {
            setAppointment({
              id: appt.id,
              date: new Date(appt.date).toLocaleString(),
              serviceName: appt.serviceName,
              businessName: appt.businessName,
              staffName: appt.staffName
            });
          }
          return appointments;
        } 
        // For business owner
        else {
          const response = await fetch(`/api/appointments/${appointmentId}`);
          if (!response.ok) throw new Error("Failed to fetch appointment");
          
          const appt = await response.json();
          setAppointment({
            id: appt.id,
            date: new Date(appt.date).toLocaleString(),
            serviceName: appt.serviceName,
            businessName: appt.businessName,
            staffName: appt.staffName
          });
          return appt;
        }
      } catch (error) {
        console.error("Error fetching appointment:", error);
        return null;
      }
    },
    enabled: !!appointmentId
  });
  
  // Handle navigation based on user type
  const navigateBack = () => {
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
          <div className="mx-auto mb-4 bg-green-100 w-16 h-16 rounded-full flex items-center justify-center">
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
          <CardTitle className="text-2xl">Payment Successful</CardTitle>
          <CardDescription>
            Your appointment has been confirmed
          </CardDescription>
        </CardHeader>
        
        <CardContent className="pt-6 space-y-6">
          {isLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : error ? (
            <div className="text-center text-red-500 py-4">
              Error loading appointment details
            </div>
          ) : appointment ? (
            <div className="space-y-4">
              <div className="p-4 bg-green-50 rounded-md space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm font-medium">Appointment:</span>
                  <span className="text-sm">#{appointment.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-medium">Date & Time:</span>
                  <span className="text-sm">{appointment.date}</span>
                </div>
                {appointment.serviceName && (
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">Service:</span>
                    <span className="text-sm">{appointment.serviceName}</span>
                  </div>
                )}
                {appointment.staffName && (
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">Staff:</span>
                    <span className="text-sm">{appointment.staffName}</span>
                  </div>
                )}
              </div>
              
              <div className="text-center text-sm text-muted-foreground">
                <p>Your appointment has been confirmed and payment processed successfully.</p>
                <p>We've sent a confirmation email with all the details.</p>
              </div>
            </div>
          ) : (
            <div className="text-center text-muted-foreground py-4">
              No appointment information available
            </div>
          )}
          
          <div className="flex justify-center pt-4">
            <Button onClick={navigateBack}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Return to Appointments
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}