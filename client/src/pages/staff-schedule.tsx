import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { format, parseISO, addMinutes } from "date-fns";
import { es } from "date-fns/locale";
import { Calendar, Clock, Check, X, Edit } from "lucide-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Appointment, StaffAvailability } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

const weekDays = [
  { id: 0, name: "Domingo" },
  { id: 1, name: "Lunes" },
  { id: 2, name: "Martes" },
  { id: 3, name: "Miércoles" },
  { id: 4, name: "Jueves" },
  { id: 5, name: "Viernes" },
  { id: 6, name: "Sábado" }
];

const timeSlots = Array.from({ length: 24 * 4 }, (_, i) => {
  const hour = Math.floor(i / 4);
  const minute = (i % 4) * 15;
  return `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
});

export default function StaffSchedule() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("availability");
  const [showAvailabilityDialog, setShowAvailabilityDialog] = useState(false);
  const [newAvailability, setNewAvailability] = useState({
    dayOfWeek: "1",
    startTime: "09:00",
    endTime: "17:00"
  });
  const [editingAvailabilityId, setEditingAvailabilityId] = useState<number | null>(null);

  // Fetch staff availability data
  const { 
    data: availabilityData, 
    isLoading: availabilityLoading 
  } = useQuery({
    queryKey: ['/api/staff', user?.id, 'availability'],
    enabled: !!user?.id
  });

  // Fetch staff appointments
  const { 
    data: appointmentsData, 
    isLoading: appointmentsLoading 
  } = useQuery({
    queryKey: ['/api/staff', user?.id, 'appointments'],
    enabled: !!user?.id
  });

  // Create availability mutation
  const createAvailabilityMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest('POST', `/api/staff/${user?.id}/availability`, data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Horario agregado",
        description: "Su disponibilidad ha sido actualizada correctamente",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/staff', user?.id, 'availability'] });
      setShowAvailabilityDialog(false);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: `No se pudo agregar el horario: ${error.message}`,
        variant: "destructive"
      });
    }
  });

  // Update availability mutation
  const updateAvailabilityMutation = useMutation({
    mutationFn: async ({id, data}: {id: number, data: any}) => {
      const response = await apiRequest('PUT', `/api/staff/availability/${id}`, data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Horario actualizado",
        description: "Su disponibilidad ha sido actualizada correctamente",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/staff', user?.id, 'availability'] });
      setShowAvailabilityDialog(false);
      setEditingAvailabilityId(null);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: `No se pudo actualizar el horario: ${error.message}`,
        variant: "destructive"
      });
    }
  });

  // Delete availability mutation
  const deleteAvailabilityMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await apiRequest('DELETE', `/api/staff/availability/${id}`);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Horario eliminado",
        description: "El horario ha sido eliminado correctamente",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/staff', user?.id, 'availability'] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: `No se pudo eliminar el horario: ${error.message}`,
        variant: "destructive"
      });
    }
  });

  // Handle form submission for new availability
  const handleAddAvailability = () => {
    if (editingAvailabilityId) {
      updateAvailabilityMutation.mutate({
        id: editingAvailabilityId,
        data: {
          dayOfWeek: parseInt(newAvailability.dayOfWeek),
          startTime: newAvailability.startTime,
          endTime: newAvailability.endTime
        }
      });
    } else {
      createAvailabilityMutation.mutate({
        staffId: user?.id,
        dayOfWeek: parseInt(newAvailability.dayOfWeek),
        startTime: newAvailability.startTime,
        endTime: newAvailability.endTime
      });
    }
  };

  // Handle edit availability
  const handleEditAvailability = (availability: StaffAvailability) => {
    setNewAvailability({
      dayOfWeek: availability.dayOfWeek.toString(),
      startTime: availability.startTime,
      endTime: availability.endTime
    });
    setEditingAvailabilityId(availability.id);
    setShowAvailabilityDialog(true);
  };

  // Handle dialog open with clean form
  const handleAddNewAvailability = () => {
    setNewAvailability({
      dayOfWeek: "1",
      startTime: "09:00",
      endTime: "17:00"
    });
    setEditingAvailabilityId(null);
    setShowAvailabilityDialog(true);
  };

  // Format appointment date and time
  const formatAppointmentTime = (appointment: Appointment) => {
    try {
      const startDate = parseISO(appointment.startTime.toString());
      const endDate = parseISO(appointment.endTime.toString());
      
      const dateStr = format(startDate, "EEEE d 'de' MMMM", { locale: es });
      const timeStr = `${format(startDate, "HH:mm")} - ${format(endDate, "HH:mm")}`;
      
      return { date: dateStr, time: timeStr };
    } catch (error) {
      console.error("Error formatting date:", error);
      return { date: "Fecha inválida", time: "Hora inválida" };
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">Mi Horario</h1>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-2 w-[400px]">
          <TabsTrigger value="availability">Disponibilidad</TabsTrigger>
          <TabsTrigger value="appointments">Citas</TabsTrigger>
        </TabsList>
        
        {/* Availability Tab */}
        <TabsContent value="availability" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Mi Disponibilidad</h2>
            <Button onClick={handleAddNewAvailability}>
              Agregar Disponibilidad
            </Button>
          </div>
          
          {availabilityLoading ? (
            <div className="flex justify-center p-8">
              <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {availabilityData && availabilityData.length > 0 ? (
                availabilityData.map((availability: StaffAvailability) => (
                  <Card key={availability.id}>
                    <CardHeader className="pb-2">
                      <CardTitle className="flex items-center">
                        <Calendar className="h-5 w-5 mr-2" />
                        {weekDays.find(day => day.id === availability.dayOfWeek)?.name}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center">
                        <Clock className="h-5 w-5 mr-2 text-muted-foreground" />
                        <span>
                          {availability.startTime} - {availability.endTime}
                        </span>
                      </div>
                    </CardContent>
                    <CardFooter className="flex justify-end space-x-2 pt-0">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditAvailability(availability)}
                      >
                        <Edit className="h-4 w-4 mr-1" />
                        Editar
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => deleteAvailabilityMutation.mutate(availability.id)}
                      >
                        <X className="h-4 w-4 mr-1" />
                        Eliminar
                      </Button>
                    </CardFooter>
                  </Card>
                ))
              ) : (
                <div className="col-span-full p-6 text-center border rounded-lg bg-muted/10">
                  <p className="text-muted-foreground">
                    Aún no ha agregado su disponibilidad. Haga clic en "Agregar Disponibilidad" para comenzar.
                  </p>
                </div>
              )}
            </div>
          )}
        </TabsContent>
        
        {/* Appointments Tab */}
        <TabsContent value="appointments" className="space-y-4">
          <h2 className="text-xl font-semibold">Mis Citas</h2>
          
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
                        <CardTitle>{appointment.serviceName}</CardTitle>
                        <CardDescription>
                          Cliente: {appointment.customerName}
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
                    No tiene citas programadas en este momento.
                  </p>
                </div>
              )}
            </div>
          )}
        </TabsContent>
      </Tabs>
      
      {/* Add/Edit Availability Dialog */}
      <Dialog open={showAvailabilityDialog} onOpenChange={setShowAvailabilityDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingAvailabilityId ? "Editar Disponibilidad" : "Agregar Disponibilidad"}
            </DialogTitle>
            <DialogDescription>
              Configure su disponibilidad para atender citas.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="dayOfWeek">Día de la semana</Label>
              <Select 
                value={newAvailability.dayOfWeek} 
                onValueChange={(value) => setNewAvailability({...newAvailability, dayOfWeek: value})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccione el día" />
                </SelectTrigger>
                <SelectContent>
                  {weekDays.map(day => (
                    <SelectItem key={day.id} value={day.id.toString()}>
                      {day.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startTime">Hora de inicio</Label>
                <Select 
                  value={newAvailability.startTime} 
                  onValueChange={(value) => setNewAvailability({...newAvailability, startTime: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Hora de inicio" />
                  </SelectTrigger>
                  <SelectContent>
                    {timeSlots.map(time => (
                      <SelectItem key={`start-${time}`} value={time}>
                        {time}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="endTime">Hora de fin</Label>
                <Select 
                  value={newAvailability.endTime} 
                  onValueChange={(value) => setNewAvailability({...newAvailability, endTime: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Hora de fin" />
                  </SelectTrigger>
                  <SelectContent>
                    {timeSlots.map(time => (
                      <SelectItem key={`end-${time}`} value={time}>
                        {time}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAvailabilityDialog(false)}>
              Cancelar
            </Button>
            <Button 
              onClick={handleAddAvailability}
              disabled={createAvailabilityMutation.isPending || updateAvailabilityMutation.isPending}
            >
              {(createAvailabilityMutation.isPending || updateAvailabilityMutation.isPending) && (
                <div className="animate-spin mr-2 h-4 w-4 border-2 border-background border-t-transparent rounded-full"></div>
              )}
              {editingAvailabilityId ? "Actualizar" : "Guardar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}