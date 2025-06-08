import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LoaderIcon, ArrowLeftIcon, CheckCircle, XCircle, Clock } from "lucide-react";
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

export default function MockPayment() {
  const [_, setLocation] = useLocation();
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Get the appointment ID from the URL
  const searchParams = new URLSearchParams(window.location.search);
  const appointmentId = searchParams.get("appointmentId");
  const token = searchParams.get("token");
  const businessId = searchParams.get("businessId");
  
  // Fetch appointment details
  const { data: appointment, isLoading, error } = useQuery({
    queryKey: ['/api/appointments', appointmentId],
    queryFn: async (): Promise<AppointmentDetails | null> => {
      if (!appointmentId) return null;
      
      try {
        console.log('🔍 Fetching appointment details for ID:', appointmentId);
        
        // Use apiRequest for business slug routing to get appointment details
        const response = await apiRequest("GET", `/api/appointments/${appointmentId}`);
        if (!response.ok) throw new Error("Failed to fetch appointment");
        
        const appt = await response.json();
        console.log('✅ Appointment data received:', appt);
        
        // Get all services to find the specific one
        const serviceResponse = await apiRequest("GET", `/api/services?businessId=${businessId || appt.userId || 1}`);
        const services = await serviceResponse.json();
        const service = services.find((s: any) => s.id === appt.serviceId);
        
        console.log('✅ Service data received:', service);
        
        const appointmentDetails: AppointmentDetails = {
          id: appt.id,
          date: new Date(appt.date).toLocaleString(),
          serviceName: service?.name || "Service",
          servicePrice: service?.price || 0,
          businessName: service?.businessName || "Salon Elegante",
          staffName: appt.staffName
        };
        
        console.log('✅ Final appointment details:', appointmentDetails);
        
        return appointmentDetails;
      } catch (error) {
        console.error("❌ Error fetching appointment details:", error);
        return null;
      }
    },
    enabled: !!appointmentId
  });
  
  // Handle payment options
  const handlePayment = (result: 'success' | 'failure' | 'pending') => {
    setIsProcessing(true);
    
    // Simulate payment processing
    setTimeout(() => {
      const searchParams = new URLSearchParams();
      searchParams.append('appointmentId', appointmentId as string);
      if (token) searchParams.append('token', token);
      if (businessId) searchParams.append('businessId', businessId as string);
      
      // Redirect to appropriate result page
      setLocation(`/payment/${result}?${searchParams.toString()}`);
    }, 1500);
  };
  
  // Handle cancel booking
  const handleCancel = () => {
    if (token) {
      setLocation(`/customer-portal/my-appointments?token=${token}&businessId=${businessId}`);
    } else {
      setLocation("/appointments");
    }
  };
  
  return (
    <div className="max-w-md mx-auto mt-12">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span className="text-lg md:text-xl">Mock Payment Page</span>
            <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full">Testing Only</span>
          </CardTitle>
          <CardDescription>
            This is a simulated payment page for testing
          </CardDescription>
        </CardHeader>
        
        {isLoading ? (
          <CardContent className="flex justify-center py-8">
            <LoaderIcon className="h-8 w-8 animate-spin text-primary" />
          </CardContent>
        ) : error ? (
          <CardContent className="text-center text-red-500 py-6">
            Error loading appointment details
          </CardContent>
        ) : appointment ? (
          <>
            <CardContent className="space-y-6">
              <div className="border rounded-md p-4 space-y-3">
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
              
              <div className="bg-gray-50 p-4 rounded-md">
                <h3 className="font-medium mb-2">Payment Details</h3>
                <p className="text-sm text-muted-foreground">
                  This is a mock payment page. In a real application, this would connect to MercadoPago
                  payment gateway. Choose an outcome to simulate:
                </p>
              </div>
              
              <div className="grid grid-cols-3 gap-3">
                <Button
                  variant="default"
                  className="bg-green-600 hover:bg-green-700 flex-col h-auto py-3"
                  onClick={() => handlePayment('success')}
                  disabled={isProcessing}
                >
                  <CheckCircle className="h-5 w-5 mb-1" />
                  <span className="text-xs">Success</span>
                </Button>
                
                <Button
                  variant="default"
                  className="bg-red-600 hover:bg-red-700 flex-col h-auto py-3"
                  onClick={() => handlePayment('failure')}
                  disabled={isProcessing}
                >
                  <XCircle className="h-5 w-5 mb-1" />
                  <span className="text-xs">Failure</span>
                </Button>
                
                <Button
                  variant="default"
                  className="bg-yellow-600 hover:bg-yellow-700 flex-col h-auto py-3"
                  onClick={() => handlePayment('pending')}
                  disabled={isProcessing}
                >
                  <Clock className="h-5 w-5 mb-1" />
                  <span className="text-xs">Pending</span>
                </Button>
              </div>
            </CardContent>
            
            <CardFooter className="flex justify-between mt-4 pt-4 border-t">
              {isProcessing ? (
                <div className="w-full flex justify-center items-center">
                  <LoaderIcon className="h-5 w-5 animate-spin mr-2" />
                  <span>Processing payment...</span>
                </div>
              ) : (
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={handleCancel}
                >
                  <ArrowLeftIcon className="h-4 w-4 mr-2" />
                  Cancel and Go Back
                </Button>
              )}
            </CardFooter>
          </>
        ) : (
          <CardContent className="text-center text-muted-foreground py-6">
            No appointment information available
          </CardContent>
        )}
      </Card>
    </div>
  );
}