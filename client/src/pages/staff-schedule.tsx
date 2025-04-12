import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { format, parseISO, addMinutes } from "date-fns";
import { Calendar, Clock, Check, X, Edit, Copy, Plus, Trash2, AlertCircle } from "lucide-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Switch } from "@/components/ui/switch";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { Appointment, StaffAvailability } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

const weekDays = [
  { id: 0, name: "Sunday" },
  { id: 1, name: "Monday" },
  { id: 2, name: "Tuesday" },
  { id: 3, name: "Wednesday" },
  { id: 4, name: "Thursday" },
  { id: 5, name: "Friday" },
  { id: 6, name: "Saturday" }
];

const timeSlots = Array.from({ length: 24 * 4 }, (_, i) => {
  const hour = Math.floor(i / 4);
  const minute = (i % 4) * 15;
  return `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
});

// Interface for break periods
interface BreakPeriod {
  id: string;
  startTime: string;
  endTime: string;
}

// Interface for day schedule in the new UI
interface DaySchedule {
  dayId: number;
  dayName: string;
  isEnabled: boolean;
  startTime: string;
  endTime: string;
  breaks: BreakPeriod[];
  existingAvailabilityId?: number;
}

// Helper to create a unique ID for breaks
const generateUniqueId = () => `break_${Math.random().toString(36).substr(2, 9)}`;

export default function StaffSchedule() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("availability");
  const [showBreakDialog, setShowBreakDialog] = useState(false);
  const [selectedDayForBreak, setSelectedDayForBreak] = useState<number | null>(null);
  const [newBreak, setNewBreak] = useState<BreakPeriod>({
    id: generateUniqueId(),
    startTime: "12:00",
    endTime: "13:00"
  });

  // Initialize schedule state
  const [scheduleState, setScheduleState] = useState<DaySchedule[]>([]);
  const [hasPendingChanges, setHasPendingChanges] = useState(false);

  // Fetch staff availability data
  const { 
    data: availabilityData, 
    isLoading: availabilityLoading 
  } = useQuery({
    queryKey: ['/api/staff', user?.id, 'availability'],
    queryFn: async () => {
      if (!user?.id) return [];
      const res = await fetch(`/api/staff/${user.id}/availability`);
      if (!res.ok) {
        throw new Error('Failed to fetch availability');
      }
      return res.json();
    },
    enabled: !!user?.id
  });

  // Fetch staff appointments
  const { 
    data: appointmentsData, 
    isLoading: appointmentsLoading 
  } = useQuery({
    queryKey: ['/api/staff', user?.id, 'appointments'],
    queryFn: async () => {
      if (!user?.id) return [];
      const res = await fetch(`/api/staff/${user.id}/appointments`);
      if (!res.ok) {
        throw new Error('Failed to fetch appointments');
      }
      return res.json();
    },
    enabled: !!user?.id
  });

  // Initialize schedule data when availability data is loaded
  useEffect(() => {
    if (availabilityData && Array.isArray(availabilityData)) {
      const initialSchedule = weekDays.map(day => {
        // Find existing availability for this day
        const existingAvailability = availabilityData.find(
          (a: StaffAvailability) => a.dayOfWeek === day.id
        );
        
        return {
          dayId: day.id,
          dayName: day.name,
          isEnabled: !!existingAvailability,
          startTime: existingAvailability?.startTime || "09:00",
          endTime: existingAvailability?.endTime || "17:00",
          breaks: [], // In the future, breaks can be stored in a separate table
          existingAvailabilityId: existingAvailability?.id
        };
      });
      
      setScheduleState(initialSchedule);
    }
  }, [availabilityData]);

  // Create/Update availability mutations combined
  const saveAvailabilityMutation = useMutation({
    mutationFn: async (schedules: DaySchedule[]) => {
      // Filter only enabled days
      const enabledSchedules = schedules.filter(schedule => schedule.isEnabled);
      
      // Process each day's schedule - create, update or delete as needed
      const operations = enabledSchedules.map(async (schedule) => {
        const data = {
          staffId: user?.id,
          dayOfWeek: schedule.dayId,
          startTime: schedule.startTime,
          endTime: schedule.endTime,
          isAvailable: true // Always true when explicitly set
        };
        
        if (schedule.existingAvailabilityId) {
          // Update existing
          return fetch(`/api/staff/availability/${schedule.existingAvailabilityId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
          });
        } else {
          // Create new
          return fetch(`/api/staff/${user?.id}/availability`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
          });
        }
      });
      
      // Find days that need to be deleted (were enabled before but now disabled)
      const daysToDelete = schedules
        .filter(s => !s.isEnabled && s.existingAvailabilityId)
        .map(s => s.existingAvailabilityId);
        
      const deleteOperations = daysToDelete.map(id => 
        fetch(`/api/staff/availability/${id}`, {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' }
        })
      );
      
      // Execute all operations
      await Promise.all([...operations, ...deleteOperations]);
      
      return true;
    },
    onSuccess: () => {
      toast({
        title: "Horario guardado",
        description: "Su disponibilidad ha sido actualizada correctamente",
      });
      // Force refetch the availability data
      queryClient.invalidateQueries({ queryKey: ['/api/staff', user?.id, 'availability'] });
      setHasPendingChanges(false);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: `No se pudo guardar el horario: ${error.message}`,
        variant: "destructive"
      });
    }
  });

  // Handle toggle day availability
  const handleToggleDay = (dayId: number, isEnabled: boolean) => {
    setScheduleState(prev => 
      prev.map(day => 
        day.dayId === dayId ? { ...day, isEnabled } : day
      )
    );
    setHasPendingChanges(true);
  };

  // Handle time changes
  const handleTimeChange = (dayId: number, field: 'startTime' | 'endTime', value: string) => {
    setScheduleState(prev => 
      prev.map(day => 
        day.dayId === dayId ? { ...day, [field]: value } : day
      )
    );
    setHasPendingChanges(true);
  };

  // Add break to a day
  const handleAddBreak = (dayId: number) => {
    setSelectedDayForBreak(dayId);
    setNewBreak({
      id: generateUniqueId(),
      startTime: "12:00",
      endTime: "13:00"
    });
    setShowBreakDialog(true);
  };
  
  // Save break
  const handleSaveBreak = () => {
    if (selectedDayForBreak === null) return;
    
    setScheduleState(prev => 
      prev.map(day => {
        if (day.dayId === selectedDayForBreak) {
          return {
            ...day,
            breaks: [...day.breaks, newBreak]
          };
        }
        return day;
      })
    );
    
    setShowBreakDialog(false);
    setHasPendingChanges(true);
  };
  
  // Delete break
  const handleDeleteBreak = (dayId: number, breakId: string) => {
    setScheduleState(prev => 
      prev.map(day => {
        if (day.dayId === dayId) {
          return {
            ...day,
            breaks: day.breaks.filter(b => b.id !== breakId)
          };
        }
        return day;
      })
    );
    setHasPendingChanges(true);
  };
  
  // Copy settings from one day to all others
  const handleCopyToAll = (sourceDayId: number) => {
    const sourceDay = scheduleState.find(day => day.dayId === sourceDayId);
    if (!sourceDay) return;
    
    setScheduleState(prev => 
      prev.map(day => 
        day.dayId !== sourceDayId ? {
          ...day,
          isEnabled: sourceDay.isEnabled,
          startTime: sourceDay.startTime,
          endTime: sourceDay.endTime,
          breaks: [...sourceDay.breaks] // Copy the breaks too
        } : day
      )
    );
    setHasPendingChanges(true);
    
    toast({
      title: "Configuración copiada",
      description: "La configuración ha sido copiada a todos los días"
    });
  };
  
  // Save all changes
  const handleSaveAll = () => {
    saveAvailabilityMutation.mutate(scheduleState);
  };

  // Format appointment date and time
  const formatAppointmentTime = (appointment: Appointment) => {
    try {
      // Get appointment date and calculate end time based on duration
      const appointmentDate = appointment.date instanceof Date 
        ? appointment.date 
        : new Date(appointment.date);
      
      // Format the date string
      const dateStr = format(appointmentDate, "EEEE, MMMM d");
      
      // Calculate the end time by adding duration minutes to the start time
      const endTime = addMinutes(appointmentDate, appointment.duration);
      
      // Format the time string
      const timeStr = `${format(appointmentDate, "HH:mm")} - ${format(endTime, "HH:mm")}`;
      
      return { date: dateStr, time: timeStr };
    } catch (error) {
      console.error("Error formatting date:", error);
      return { date: "Invalid date", time: "Invalid time" };
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">My Schedule</h1>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-2 w-[400px]">
          <TabsTrigger value="availability">Availability</TabsTrigger>
          <TabsTrigger value="appointments">Appointments</TabsTrigger>
        </TabsList>
        
        {/* Availability Tab */}
        <TabsContent value="availability" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">My Availability</h2>
            {hasPendingChanges && (
              <Badge variant="outline" className="text-amber-500 border-amber-500 mr-4 px-2">
                <AlertCircle className="h-4 w-4 mr-1 inline" />
                Pending changes
              </Badge>
            )}
            <Button 
              onClick={handleSaveAll} 
              disabled={!hasPendingChanges || saveAvailabilityMutation.isPending}
            >
              {saveAvailabilityMutation.isPending && (
                <div className="animate-spin mr-2 h-4 w-4 border-2 border-background border-t-transparent rounded-full" />
              )}
              Save Changes
            </Button>
          </div>
          
          {availabilityLoading ? (
            <div className="flex justify-center p-8">
              <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
            </div>
          ) : (
            <div className="border rounded-md overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[150px]">Day</TableHead>
                    <TableHead className="w-[70px] text-center">Available</TableHead>
                    <TableHead className="w-[160px]">Start Time</TableHead>
                    <TableHead className="w-[160px]">End Time</TableHead>
                    <TableHead>Breaks</TableHead>
                    <TableHead className="w-[120px] text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {scheduleState.map((day) => (
                    <TableRow key={day.dayId}>
                      <TableCell className="font-medium">
                        {day.dayName}
                      </TableCell>
                      <TableCell className="text-center">
                        <Switch 
                          checked={day.isEnabled} 
                          onCheckedChange={(checked) => handleToggleDay(day.dayId, checked)}
                        />
                      </TableCell>
                      <TableCell>
                        <Select 
                          value={day.startTime} 
                          onValueChange={(value) => handleTimeChange(day.dayId, 'startTime', value)}
                          disabled={!day.isEnabled}
                        >
                          <SelectTrigger className="w-[130px]">
                            <SelectValue placeholder="Start" />
                          </SelectTrigger>
                          <SelectContent>
                            {timeSlots.map(time => (
                              <SelectItem key={`${day.dayId}-start-${time}`} value={time}>
                                {time}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>
                        <Select 
                          value={day.endTime} 
                          onValueChange={(value) => handleTimeChange(day.dayId, 'endTime', value)}
                          disabled={!day.isEnabled}
                        >
                          <SelectTrigger className="w-[130px]">
                            <SelectValue placeholder="End" />
                          </SelectTrigger>
                          <SelectContent>
                            {timeSlots.map(time => (
                              <SelectItem key={`${day.dayId}-end-${time}`} value={time}>
                                {time}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-2">
                          {day.breaks.map(breakPeriod => (
                            <Badge 
                              key={breakPeriod.id} 
                              variant="secondary"
                              className="px-2 py-1"
                            >
                              {breakPeriod.startTime} - {breakPeriod.endTime}
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-4 w-4 ml-1 hover:bg-transparent"
                                onClick={() => handleDeleteBreak(day.dayId, breakPeriod.id)}
                              >
                                <X className="h-3 w-3" />
                              </Button>
                            </Badge>
                          ))}
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-7"
                            onClick={() => handleAddBreak(day.dayId)}
                            disabled={!day.isEnabled}
                          >
                            <Plus className="h-3 w-3 mr-1" />
                            Break
                          </Button>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleCopyToAll(day.dayId)}
                          disabled={!day.isEnabled}
                          className="h-7"
                        >
                          <Copy className="h-3 w-3 mr-1" />
                          Copy to all
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </TabsContent>
        
        {/* Appointments Tab */}
        <TabsContent value="appointments" className="space-y-4">
          <h2 className="text-xl font-semibold">My Appointments</h2>
          
          {appointmentsLoading ? (
            <div className="flex justify-center p-8">
              <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
            </div>
          ) : (
            <div className="space-y-4">
              {appointmentsData && appointmentsData.length > 0 ? (
                appointmentsData.map((appointment: Appointment) => {
                  const { date, time } = formatAppointmentTime(appointment);
                  return (
                    <Card key={appointment.id}>
                      <CardHeader className="pb-2">
                        <CardTitle>Appointment #{appointment.id}</CardTitle>
                        <CardDescription>
                          Service ID: {appointment.serviceId} | Customer ID: {appointment.customerId}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        <div className="flex items-center">
                          <Calendar className="h-5 w-5 mr-2 text-muted-foreground" />
                          <span className="capitalize">{date}</span>
                        </div>
                        <div className="flex items-center">
                          <Clock className="h-5 w-5 mr-2 text-muted-foreground" />
                          <span>{time}</span>
                        </div>
                      </CardContent>
                      <CardFooter>
                        <div className="flex items-center">
                          <div className={`w-3 h-3 rounded-full mr-2 ${
                            appointment.status === 'confirmed' ? 'bg-green-500' : 
                            appointment.status === 'pending' ? 'bg-yellow-500' : 
                            appointment.status === 'cancelled' ? 'bg-red-500' : 'bg-gray-500'
                          }`} />
                          <span className="capitalize">{appointment.status}</span>
                        </div>
                      </CardFooter>
                    </Card>
                  );
                })
              ) : (
                <div className="p-6 text-center border rounded-lg bg-muted/10">
                  <p className="text-muted-foreground">
                    You don't have any scheduled appointments at this time.
                  </p>
                </div>
              )}
            </div>
          )}
        </TabsContent>
      </Tabs>
      
      {/* Add Break Dialog */}
      <Dialog open={showBreakDialog} onOpenChange={setShowBreakDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Break</DialogTitle>
            <DialogDescription>
              Configure a break period for this day.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="dayName">Day</Label>
              <Input 
                id="dayName" 
                value={scheduleState.find(day => day.dayId === selectedDayForBreak)?.dayName || ''} 
                disabled 
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="breakStartTime">Start Time</Label>
                <Select 
                  value={newBreak.startTime} 
                  onValueChange={(value) => setNewBreak({...newBreak, startTime: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Break start time" />
                  </SelectTrigger>
                  <SelectContent>
                    {timeSlots.map(time => (
                      <SelectItem key={`break-start-${time}`} value={time}>
                        {time}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="breakEndTime">End Time</Label>
                <Select 
                  value={newBreak.endTime} 
                  onValueChange={(value) => setNewBreak({...newBreak, endTime: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Break end time" />
                  </SelectTrigger>
                  <SelectContent>
                    {timeSlots.map(time => (
                      <SelectItem key={`break-end-${time}`} value={time}>
                        {time}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowBreakDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveBreak}>
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}