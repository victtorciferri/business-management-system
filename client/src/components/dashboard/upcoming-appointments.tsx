import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Appointment, Customer, Service } from "@shared/schema";
import { format, isToday, addDays, isTomorrow, isPast } from "date-fns";

interface UpcomingAppointmentsProps {
  userId: number;
  limit?: number;
}

export function UpcomingAppointments({ userId, limit = 5 }: UpcomingAppointmentsProps) {
  // Fetch all future appointments
  const { data: appointments = [] } = useQuery<Appointment[]>({
    queryKey: [`/api/appointments?userId=${userId}`],
  });

  // Filter and sort upcoming appointments
  const upcomingAppointments = appointments
    .filter(appointment => !isPast(new Date(appointment.date)))
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, limit);

  // Fetch customers and services for display
  const { data: customers = [] } = useQuery<Customer[]>({
    queryKey: [`/api/customers?userId=${userId}`],
  });

  const { data: services = [] } = useQuery<Service[]>({
    queryKey: [`/api/services?userId=${userId}`],
  });

  const getCustomerName = (customerId: number) => {
    const customer = customers.find(c => c.id === customerId);
    return customer ? `${customer.firstName} ${customer.lastName}` : 'Unknown Customer';
  };

  const getServiceName = (serviceId: number) => {
    const service = services.find(s => s.id === serviceId);
    return service ? service.name : 'Unknown Service';
  };

  const formatAppointmentDate = (date: Date) => {
    if (isToday(date)) return 'Today';
    if (isTomorrow(date)) return 'Tomorrow';
    return format(date, 'MMM d');
  };

  const formatAppointmentTime = (date: Date) => {
    return format(date, 'h:mm a');
  };

  return (
    <Card>
      <CardHeader className="border-b">
        <CardTitle className="text-lg font-medium">Upcoming Appointments</CardTitle>
      </CardHeader>
      
      <CardContent className="p-0">
        <div className="divide-y divide-gray-200">
          {upcomingAppointments.length > 0 ? (
            upcomingAppointments.map(appointment => {
              const appointmentDate = new Date(appointment.date);
              
              return (
                <div key={appointment.id} className="py-3 px-6">
                  <div className="flex justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {getCustomerName(appointment.customerId)}
                      </p>
                      <p className="text-sm text-gray-500">
                        {getServiceName(appointment.serviceId)}
                      </p>
                    </div>
                    <div className="text-right text-sm">
                      <p className="font-medium text-gray-900">
                        {formatAppointmentDate(appointmentDate)}
                      </p>
                      <p className="text-gray-500">
                        {formatAppointmentTime(appointmentDate)}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="py-6 px-6 text-center">
              <p className="text-sm text-gray-500">No upcoming appointments</p>
            </div>
          )}
        </div>
      </CardContent>
      
      <CardFooter className="bg-gray-50 px-6 py-3">
        <div className="text-sm">
          <Link href="/appointments" className="font-medium text-primary-600 hover:text-primary-500">
            View all appointments
          </Link>
        </div>
      </CardFooter>
    </Card>
  );
}
