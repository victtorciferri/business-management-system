import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { useQuery } from "@tanstack/react-query";
import { Appointment } from "@shared/schema";
import { format, isSameDay, startOfMonth, endOfMonth } from "date-fns";

interface MonthlyCalendarProps {
  userId: number;
  onDateSelect?: (date: Date) => void;
}

export function MonthlyCalendar({ userId, onDateSelect }: MonthlyCalendarProps) {
  const [month, setMonth] = useState<Date>(new Date());
  
  const monthStart = startOfMonth(month);
  const monthEnd = endOfMonth(month);
  
  // Query appointments for the visible month
  const { data: appointments = [] } = useQuery<Appointment[]>({
    queryKey: [`/api/appointments?userId=${userId}&startDate=${monthStart.toISOString()}&endDate=${monthEnd.toISOString()}`],
  });

  // Group appointments by date
  const appointmentDates = appointments.reduce((acc, appointment) => {
    const date = new Date(appointment.date);
    const dateString = date.toDateString();
    
    if (!acc[dateString]) {
      acc[dateString] = [];
    }
    
    acc[dateString].push(appointment);
    return acc;
  }, {} as Record<string, Appointment[]>);
  
  // Function to handle date selection
  const handleSelect = (date: Date | undefined) => {
    if (date && onDateSelect) {
      onDateSelect(date);
    }
  };
  
  // Function to modify day cell appearance based on appointments
  const modifiers = {
    hasAppointments: Object.keys(appointmentDates).map(dateStr => new Date(dateStr)),
  };
  
  const modifiersStyles = {
    hasAppointments: {
      color: 'inherit',
      backgroundColor: 'inherit',
    },
  };

  return (
    <Card>
      <CardHeader className="border-b">
        <CardTitle className="text-lg font-medium">
          {format(month, "MMMM yyyy")}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <Calendar
          mode="single"
          month={month}
          onMonthChange={setMonth}
          selected={undefined}
          onSelect={handleSelect}
          modifiers={modifiers}
          modifiersStyles={modifiersStyles}
          components={{
            DayContent: ({ date, activeModifiers }) => {
              const dateStr = date.toDateString();
              const hasAppointments = appointmentDates[dateStr]?.length > 0;
              
              return (
                <div className="relative w-full h-full flex items-center justify-center">
                  <div>{date.getDate()}</div>
                  {hasAppointments && (
                    <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2">
                      <div className="h-1 w-1 rounded-full bg-primary-500"></div>
                    </div>
                  )}
                </div>
              );
            },
          }}
        />
        
        <div className="mt-4 text-sm flex space-x-4 px-4 py-2">
          <div className="flex items-center">
            <div className="h-3 w-3 rounded-full bg-primary-500 mr-2"></div>
            <span className="text-gray-600">Appointments</span>
          </div>
          <div className="flex items-center">
            <div className="h-3 w-3 rounded-full bg-green-500 mr-2"></div>
            <span className="text-gray-600">Available</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
