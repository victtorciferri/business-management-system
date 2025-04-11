import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Appointment, Customer, Service } from "@shared/schema";
import { format } from "date-fns";
import { Edit, Trash2, CreditCard, Mail } from "lucide-react";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Link } from "wouter";
import { appointmentColors } from "@/utils/date-utils";

interface AppointmentItemProps {
  appointment: Appointment;
  customer: Customer | undefined;
  service: Service | undefined;
  onEdit: (appointment: Appointment) => void;
}

export function AppointmentItem({ 
  appointment, 
  customer, 
  service,
  onEdit
}: AppointmentItemProps) {
  const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const appointmentDate = new Date(appointment.date);
  const formattedDate = format(appointmentDate, "EEEE, MMMM d, yyyy");
  const formattedTime = format(appointmentDate, "h:mm a");
  
  const colorIndex = appointment.serviceId % appointmentColors.length;
  const color = appointmentColors[colorIndex];
  
  const handleDelete = async () => {
    try {
      await apiRequest("DELETE", `/api/appointments/${appointment.id}`, undefined);
      
      queryClient.invalidateQueries({
        queryKey: [`/api/appointments`],
      });
      
      toast({
        title: "Appointment deleted",
        description: "The appointment has been removed from your schedule.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete the appointment. Please try again.",
        variant: "destructive",
      });
    }
  };
  
  const handleSendReminder = async () => {
    try {
      await apiRequest("POST", "/api/send-reminder", { appointmentId: appointment.id });
      
      // Update appointment to mark reminder as sent
      await apiRequest("PUT", `/api/appointments/${appointment.id}`, {
        ...appointment,
        reminderSent: true
      });
      
      queryClient.invalidateQueries({
        queryKey: [`/api/appointments`],
      });
      
      toast({
        title: "Reminder sent",
        description: "Email reminder has been sent to the customer.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send the reminder. Please try again.",
        variant: "destructive",
      });
    }
  };
  
  return (
    <Card className={`${color.bg} border ${color.border} overflow-hidden`}>
      <CardContent className="p-6">
        <div className="flex justify-between items-start">
          <div className="space-y-1">
            <h3 className="font-medium text-lg">
              {customer ? `${customer.firstName} ${customer.lastName}` : "Unknown Customer"}
            </h3>
            <p className="text-sm text-gray-500">
              {service ? service.name : "Unknown Service"}
              {service && ` (${service.duration} min)`}
            </p>
            <div className="flex items-center space-x-2 mt-2">
              <span className="text-sm font-medium">{formattedDate}</span>
              <span className="text-xs bg-white rounded-full px-2 py-1 border">
                {formattedTime}
              </span>
            </div>
            {appointment.notes && (
              <p className="text-sm text-gray-600 mt-2 italic">
                "{appointment.notes}"
              </p>
            )}
          </div>
          
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="icon"
              onClick={() => onEdit(appointment)}
              title="Edit appointment"
            >
              <Edit className="h-4 w-4" />
            </Button>
            
            <AlertDialog open={isDeleteAlertOpen} onOpenChange={setIsDeleteAlertOpen}>
              <AlertDialogTrigger asChild>
                <Button 
                  variant="outline" 
                  size="icon"
                  className="text-red-500 border-red-200 hover:bg-red-50 hover:text-red-600"
                  title="Delete appointment"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will permanently delete this appointment. This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction 
                    onClick={handleDelete}
                    className="bg-red-600 hover:bg-red-700"
                  >
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
        
        <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-200">
          <div className="flex items-center">
            <span className={`inline-block w-2 h-2 rounded-full ${color.accent} mr-2`}></span>
            <span className="text-xs font-medium">
              Status: <span className="capitalize">{appointment.status}</span>
            </span>
          </div>
          
          <div className="flex gap-2">
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-xs"
              onClick={handleSendReminder}
              disabled={appointment.reminderSent}
            >
              <Mail className="h-3 w-3 mr-1" />
              {appointment.reminderSent ? "Reminder Sent" : "Send Reminder"}
            </Button>
            
            {appointment.paymentStatus !== "paid" && (
              <Button asChild variant="outline" size="sm" className="text-xs">
                <Link href={`/checkout/${appointment.id}`}>
                  <CreditCard className="h-3 w-3 mr-1" />
                  Collect Payment
                </Link>
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
