import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Edit, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Appointment, Customer, Service } from "@shared/schema";
import { appointmentColors } from "@/utils/date-utils";
import { format, addDays, isSameDay } from "date-fns";
import { AppointmentForm } from "@/components/appointments/appointment-form";

interface DailyScheduleProps {
  userId: number;
}

export function DailySchedule({ userId }: DailyScheduleProps) {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [isNewAppointmentOpen, setIsNewAppointmentOpen] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState<Appointment | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Format date for display
  const formattedDate = format(selectedDate, "MMMM d, yyyy");

  // Create time slots for the day (from 9 AM to 5 PM)
  const timeSlots = Array.from({ length: 9 }, (_, i) => {
    const hour = i + 9;
    return {
      time: `${hour % 12 || 12}:00 ${hour < 12 ? 'AM' : 'PM'}`,
      hour,
    };
  });

  // Functions to navigate between days
  const goToPreviousDay = () => setSelectedDate(prev => addDays(prev, -1));
  const goToNextDay = () => setSelectedDate(prev => addDays(prev, 1));

  // Query to fetch appointments for the selected date
  const startOfDay = new Date(selectedDate);
  startOfDay.setHours(0, 0, 0, 0);
  
  const endOfDay = new Date(selectedDate);
  endOfDay.setHours(23, 59, 59, 999);

  const { data: appointments = [] } = useQuery<Appointment[]>({
    queryKey: [`/api/appointments?userId=${userId}&startDate=${startOfDay.toISOString()}&endDate=${endOfDay.toISOString()}`],
  });

  // Fetch services
  const { data: services = [] } = useQuery<Service[]>({
    queryKey: [`/api/services?userId=${userId}`],
  });

  // Fetch customers
  const { data: customers = [] } = useQuery<Customer[]>({
    queryKey: [`/api/customers?userId=${userId}`],
  });

  // Handle appointment edit
  const handleEditAppointment = (appointment: Appointment) => {
    setEditingAppointment(appointment);
    setIsNewAppointmentOpen(true);
  };

  // Handle appointment delete
  const handleDeleteAppointment = async (appointmentId: number) => {
    try {
      await fetch(`/api/appointments/${appointmentId}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      
      queryClient.invalidateQueries({
        queryKey: [`/api/appointments`],
      });
      
      toast({
        title: "Appointment deleted",
        description: "The appointment has been removed from the schedule.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Could not delete the appointment.",
        variant: "destructive",
      });
    }
  };

  const getCustomerName = (customerId: number) => {
    const customer = customers.find(c => c.id === customerId);
    return customer ? `${customer.firstName} ${customer.lastName}` : 'Unknown Customer';
  };

  const getServiceName = (serviceId: number) => {
    const service = services.find(s => s.id === serviceId);
    return service ? service.name : 'Unknown Service';
  };

  const getServiceDuration = (serviceId: number) => {
    const service = services.find(s => s.id === serviceId);
    return service ? service.duration : 0;
  };

  return (
    <Card className="lg:col-span-2">
      <CardHeader className="flex flex-row items-center justify-between border-b">
        <CardTitle className="text-lg font-medium">Today's Schedule</CardTitle>
        <div className="flex space-x-3">
          <div className="relative">
            <Button variant="outline">
              {formattedDate}
            </Button>
          </div>
          <div className="flex">
            <Button
              variant="outline"
              size="icon"
              onClick={goToPreviousDay}
              className="rounded-r-none"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={goToNextDay}
              className="rounded-l-none"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        <div className="space-y-6">
          {timeSlots.map((slot) => {
            const slotAppointments = appointments.filter(appointment => {
              const appointmentDate = new Date(appointment.date);
              return appointmentDate.getHours() === slot.hour;
            });

            return (
              <div key={slot.hour} className="relative">
                <div className="flex items-center space-x-3">
                  <div className="flex-shrink-0 text-right w-16 text-sm text-gray-500">
                    {slot.time}
                  </div>
                  
                  {slotAppointments.length > 0 ? (
                    slotAppointments.map(appointment => {
                      const serviceId = appointment.serviceId;
                      const serviceDuration = getServiceDuration(serviceId);
                      const colorIndex = serviceId % appointmentColors.length;
                      const color = appointmentColors[colorIndex];
                      
                      return (
                        <div 
                          key={appointment.id}
                          className={`h-12 flex-grow rounded-lg ${color.bg} border ${color.border} p-2 flex items-center cursor-pointer hover:${color.hoverBg} transition-all duration-200`}
                        >
                          <div className={`w-2 h-full ${color.accent} rounded-full mr-3`}></div>
                          <div className="flex-grow">
                            <p className="text-sm font-medium">
                              {getCustomerName(appointment.customerId)}
                            </p>
                            <p className="text-xs text-gray-500">
                              {getServiceName(serviceId)} ({serviceDuration}m)
                            </p>
                          </div>
                          <div className="flex-shrink-0 flex space-x-1">
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-6 w-6 text-gray-400 hover:text-gray-500"
                              onClick={() => handleEditAppointment(appointment)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-6 w-6 text-gray-400 hover:text-red-500"
                              onClick={() => handleDeleteAppointment(appointment.id)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="h-12 flex-grow rounded-lg bg-gray-100 border border-gray-200 p-2 flex items-center">
                      <p className="text-sm text-gray-400 italic">Available</p>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>

      {/* New/Edit Appointment Dialog */}
      <Dialog open={isNewAppointmentOpen} onOpenChange={setIsNewAppointmentOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <AppointmentForm 
            userId={userId}
            initialDate={selectedDate}
            existingAppointment={editingAppointment}
            onSubmitSuccess={() => {
              setIsNewAppointmentOpen(false);
              setEditingAppointment(null);
            }}
          />
        </DialogContent>
      </Dialog>
    </Card>
  );
}
