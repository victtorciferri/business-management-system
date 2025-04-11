import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Plus, Calendar, Search } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Appointment, Customer, Service } from "@shared/schema";
import { AppointmentForm } from "@/components/appointments/appointment-form";
import { AppointmentItem } from "@/components/appointments/appointment-item";
import { Input } from "@/components/ui/input";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { format, isFuture, isPast, startOfDay, endOfDay, addMonths } from "date-fns";

export default function Appointments() {
  const [isNewAppointmentOpen, setIsNewAppointmentOpen] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState<Appointment | null>(null);
  const [filter, setFilter] = useState("upcoming");
  const [searchTerm, setSearchTerm] = useState("");
  
  // In a real app, this would come from an auth context
  const userId = 1;
  
  // Get today's start and end for filtering
  const today = new Date();
  const startOfToday = startOfDay(today);
  const endOfToday = endOfDay(today);
  
  // Get 3 months ahead for date filtering
  const threeMonthsAhead = addMonths(today, 3);
  
  // Fetch appointments
  const { data: appointments = [], isLoading: isLoadingAppointments } = useQuery<Appointment[]>({
    queryKey: [`/api/appointments?userId=${userId}`],
  });
  
  // Fetch customers for appointment display
  const { data: customers = [] } = useQuery<Customer[]>({
    queryKey: [`/api/customers?userId=${userId}`],
  });
  
  // Fetch services for appointment display
  const { data: services = [] } = useQuery<Service[]>({
    queryKey: [`/api/services?userId=${userId}`],
  });
  
  // Filter and sort appointments based on selected filter
  const filteredAppointments = appointments
    .filter(appointment => {
      const appointmentDate = new Date(appointment.date);
      
      // Apply date filter
      if (filter === "upcoming") {
        return isFuture(appointmentDate);
      } else if (filter === "past") {
        return isPast(appointmentDate);
      } else if (filter === "today") {
        return appointmentDate >= startOfToday && appointmentDate <= endOfToday;
      }
      
      return true;
    })
    .filter(appointment => {
      // Apply search filter if search term is provided
      if (!searchTerm) return true;
      
      const customer = customers.find(c => c.id === appointment.customerId);
      const service = services.find(s => s.id === appointment.serviceId);
      
      const fullName = customer 
        ? `${customer.firstName} ${customer.lastName}`.toLowerCase() 
        : '';
      const serviceName = service ? service.name.toLowerCase() : '';
      const searchLower = searchTerm.toLowerCase();
      
      return fullName.includes(searchLower) || serviceName.includes(searchLower);
    })
    .sort((a, b) => {
      // Sort by date
      return filter === "past" 
        ? new Date(b.date).getTime() - new Date(a.date).getTime() // Newest first for past
        : new Date(a.date).getTime() - new Date(b.date).getTime(); // Oldest first for upcoming
    });
  
  const handleEdit = (appointment: Appointment) => {
    setEditingAppointment(appointment);
    setIsNewAppointmentOpen(true);
  };
  
  return (
    <div className="space-y-6">
      {/* Header and action buttons */}
      <div className="md:flex md:items-center md:justify-between">
        <div className="flex-1 min-w-0">
          <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
            Appointments
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Manage your scheduled appointments
          </p>
        </div>
        <div className="mt-4 flex md:mt-0 md:ml-4">
          <Button onClick={() => {
            setEditingAppointment(null);
            setIsNewAppointmentOpen(true);
          }}>
            <Calendar className="h-4 w-4 mr-2" />
            New Appointment
          </Button>
        </div>
      </div>
      
      {/* Filters and search */}
      <div className="flex flex-col md:flex-row md:items-center gap-4">
        <div className="w-full md:w-64">
          <Select 
            value={filter} 
            onValueChange={setFilter}
          >
            <SelectTrigger>
              <SelectValue placeholder="Filter appointments" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="upcoming">Upcoming Appointments</SelectItem>
              <SelectItem value="today">Today's Appointments</SelectItem>
              <SelectItem value="past">Past Appointments</SelectItem>
              <SelectItem value="all">All Appointments</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="w-full md:w-80 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input 
            placeholder="Search customers or services..." 
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>
      
      {/* Appointments list */}
      <div className="space-y-4">
        {isLoadingAppointments ? (
          <div className="text-center py-10">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
            <p className="mt-4 text-gray-500">Loading appointments...</p>
          </div>
        ) : filteredAppointments.length > 0 ? (
          filteredAppointments.map(appointment => (
            <AppointmentItem 
              key={appointment.id}
              appointment={appointment}
              customer={customers.find(c => c.id === appointment.customerId)}
              service={services.find(s => s.id === appointment.serviceId)}
              onEdit={handleEdit}
            />
          ))
        ) : (
          <div className="text-center py-10 bg-white rounded-lg shadow">
            <Calendar className="h-12 w-12 text-gray-400 mx-auto" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No appointments found</h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchTerm 
                ? "No appointments match your search." 
                : filter === "upcoming" 
                  ? "No upcoming appointments scheduled." 
                  : filter === "today" 
                    ? "No appointments scheduled for today."
                    : "No appointments found."}
            </p>
            <div className="mt-6">
              <Button onClick={() => {
                setEditingAppointment(null);
                setIsNewAppointmentOpen(true);
              }}>
                <Plus className="h-4 w-4 mr-2" />
                New Appointment
              </Button>
            </div>
          </div>
        )}
      </div>
      
      {/* New/Edit Appointment Dialog */}
      <Dialog open={isNewAppointmentOpen} onOpenChange={setIsNewAppointmentOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <AppointmentForm 
            userId={userId}
            existingAppointment={editingAppointment}
            onSubmitSuccess={() => {
              setIsNewAppointmentOpen(false);
              setEditingAppointment(null);
            }}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
