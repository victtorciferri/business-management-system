import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, ArrowLeftIcon, Calendar } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useLanguage } from "@/contexts/LanguageContext";

interface AppointmentDetails {
  id: number;
  date: string;
  serviceName: string;
  servicePrice: number;
  businessName: string;
  staffName?: string;
}

export default function PaymentSuccess() {
  const [_, setLocation] = useLocation();
  const [appointment, setAppointment] = useState<AppointmentDetails | null>(null);
  const { t } = useLanguage();
  
  // Get the appointment ID from the URL
  const searchParams = new URLSearchParams(window.location.search);
  const appointmentId = searchParams.get("appointmentId");
  const token = searchParams.get("token");
  const businessId = searchParams.get("businessId");
  
  // Fetch appointment details similar to mock payment page
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
            const serviceResponse = await fetch(`/api/services?businessId=${businessId}`);
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
          const response = await fetch(`/api/appointments/${appointmentId}`);
          if (!response.ok) throw new Error("Failed to fetch appointment");
          
          const appt = await response.json();
          
          const serviceResponse = await fetch(`/api/services/${appt.serviceId}`);
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
  
  // Also update the appointment status to confirmed via API
  useEffect(() => {
    if (appointmentId) {
      fetch(`/api/appointments/${appointmentId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: 'scheduled',
          paymentStatus: 'paid'
        }),
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
      setLocation("/appointments");
    }
  };
  
  return (
    <div className="max-w-md mx-auto mt-12 p-4">
      <Card className="border-green-200 shadow-md">
        <CardHeader className="bg-green-50 text-green-800 rounded-t-lg">
          <div className="flex items-center justify-center mb-4">
            <div className="bg-green-100 p-3 rounded-full">
              <CheckCircle className="h-10 w-10 text-green-600" />
            </div>
          </div>
          <CardTitle className="text-center text-green-800">{t('payment.successful')}</CardTitle>
          <CardDescription className="text-center text-green-700">
            {t('payment.confirmed')}
          </CardDescription>
        </CardHeader>
        
        {isLoading ? (
          <CardContent className="flex justify-center py-8">
            <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
          </CardContent>
        ) : error ? (
          <CardContent className="text-center text-red-500 py-6">
            {t('payment.error_loading')}
          </CardContent>
        ) : appointment ? (
          <CardContent className="space-y-4 p-6">
            <div className="border border-green-100 rounded-md p-4 space-y-3">
              <div className="flex justify-between items-center">
                <span className="font-medium">{t('payment.appointment')}</span>
                <span>#{appointment.id}</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="font-medium">{t('payment.business')}</span>
                <span>{appointment.businessName}</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="font-medium">{t('payment.service')}</span>
                <span>{appointment.serviceName}</span>
              </div>
              
              {appointment.staffName && (
                <div className="flex justify-between items-center">
                  <span className="font-medium">{t('payment.staff_member')}</span>
                  <span>{appointment.staffName}</span>
                </div>
              )}
              
              <div className="flex justify-between items-center">
                <span className="font-medium">{t('payment.date_time')}</span>
                <span>{appointment.date}</span>
              </div>
              
              <div className="flex justify-between items-center pt-2 border-t mt-2">
                <span className="font-medium">{t('payment.amount_paid')}</span>
                <span className="font-bold text-lg">${typeof appointment.servicePrice === 'number' ? appointment.servicePrice.toFixed(2) : appointment.servicePrice}</span>
              </div>
            </div>
            
            <div className="bg-green-50 p-4 rounded-md">
              <p className="text-sm text-green-800">
                {t('payment.confirmation_message')}
              </p>
            </div>
          </CardContent>
        ) : (
          <CardContent className="text-center text-muted-foreground py-6">
            {t('payment.no_information')}
          </CardContent>
        )}
        
        <CardFooter className="flex justify-center p-6">
          <Button 
            className="bg-green-600 hover:bg-green-700" 
            onClick={handleViewAppointments}
          >
            <Calendar className="mr-2 h-4 w-4" />
            {t('payment.view_appointments')}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}