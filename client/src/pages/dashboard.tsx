import { Button } from "@/components/ui/button";
import { Plus, Calendar, Eye } from "lucide-react";
import { StatsOverview } from "@/components/dashboard/stats-overview";
import { DailySchedule } from "@/components/dashboard/daily-schedule";
import { MonthlyCalendar } from "@/components/dashboard/monthly-calendar";
import { UpcomingAppointments } from "@/components/dashboard/upcoming-appointments";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { useState } from "react";
import { AppointmentForm } from "@/components/appointments/appointment-form";
import { format } from "date-fns";
import { useAuth } from "@/hooks/use-auth";

export default function Dashboard() {
  const [isNewAppointmentOpen, setIsNewAppointmentOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  
  // In a real app, this would come from an auth context
  const userId = 1;

  const { logoutMutation } = useAuth();
  
  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
  };
  
  return (
    <div className="space-y-6">
      {/* Header and action buttons */}
      <div className="md:flex md:items-center md:justify-between">
        <div className="flex-1 min-w-0">
          <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
            Business Dashboard
          </h2>
          <div className="mt-1 text-sm text-gray-500 flex flex-col sm:flex-row space-y-1 sm:space-y-0 sm:space-x-4">
            <a href="/customer-portal" className="text-primary hover:underline font-medium" target="_blank">
              View Customer Portal →
            </a>
            <a href="/preview/1" className="text-primary hover:underline font-medium" target="_blank">
              Preview Business Page →
            </a>
          </div>
          <p className="mt-1 text-sm text-gray-500">
            Today is {format(new Date(), "EEEE, MMMM d, yyyy")}
          </p>
        </div>
        <div className="mt-4 flex flex-wrap gap-3 md:mt-0 md:ml-4">
          <Button asChild variant="outline">
            <a href="/services">
              <Plus className="h-4 w-4 mr-2" />
              Add Service
            </a>
          </Button>
          
          <Button asChild variant="outline">
            <a href={`/preview/${userId}`} target="_blank">
              <Eye className="h-4 w-4 mr-2" />
              Preview Business
            </a>
          </Button>
          
          <Dialog open={isNewAppointmentOpen} onOpenChange={setIsNewAppointmentOpen}>
            <DialogTrigger asChild>
              <Button>
                <Calendar className="h-4 w-4 mr-2" />
                New Appointment
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <AppointmentForm 
                userId={userId}
                initialDate={selectedDate}
                onSubmitSuccess={() => setIsNewAppointmentOpen(false)}
              />
            </DialogContent>
          </Dialog>
        </div>
      </div>
      
      {/* Stats Overview */}
      <StatsOverview userId={userId} />
      
      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Daily Schedule */}
        <DailySchedule userId={userId} />
        
        {/* Right Column: Calendar & Upcoming */}
        <div className="space-y-8">
          <MonthlyCalendar userId={userId} onDateSelect={handleDateSelect} />
          <UpcomingAppointments userId={userId} />
        </div>
      </div>
    </div>
  );
}
