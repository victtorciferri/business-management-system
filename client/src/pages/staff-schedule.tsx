import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, Plus } from "lucide-react";
import { Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { queryClient } from "@/lib/queryClient";
import { apiRequest } from "@/lib/queryClient";

// Form validation schema
const availabilityFormSchema = z.object({
  dayOfWeek: z.number().min(0).max(6),
  startTime: z.string(),
  endTime: z.string(),
  isAvailable: z.boolean(),
});

type AvailabilityFormValues = z.infer<typeof availabilityFormSchema>;

// Day names for reference
const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export default function StaffSchedule() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isAvailabilityDialogOpen, setIsAvailabilityDialogOpen] = useState(false);
  const staffId = user?.id.toString();

  // Fetch staff availability
  const { data: availability, isLoading: isLoadingAvailability } = useQuery({
    queryKey: [`/api/staff/${staffId}/availability`],
    queryFn: ({ signal }) =>
      fetch(`/api/staff/${staffId}/availability`, { signal })
        .then(res => {
          if (!res.ok) throw new Error("Failed to fetch staff availability");
          return res.json();
        }),
    enabled: !!staffId,
  });

  // Fetch staff appointments
  const { data: appointments, isLoading: isLoadingAppointments } = useQuery({
    queryKey: [`/api/staff/${staffId}/appointments`],
    queryFn: ({ signal }) =>
      fetch(`/api/staff/${staffId}/appointments`, { signal })
        .then(res => {
          if (!res.ok) throw new Error("Failed to fetch staff appointments");
          return res.json();
        }),
    enabled: !!staffId,
  });

  // Availability form
  const availabilityForm = useForm<AvailabilityFormValues>({
    resolver: zodResolver(availabilityFormSchema),
    defaultValues: {
      dayOfWeek: 1,
      startTime: "09:00",
      endTime: "17:00",
      isAvailable: true,
    },
  });

  // Add staff availability mutation
  const addAvailabilityMutation = useMutation({
    mutationFn: async (values: AvailabilityFormValues) => {
      const res = await apiRequest("POST", `/api/staff/${staffId}/availability`, {
        ...values,
        staffId: parseInt(staffId || "0"),
      });
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Availability added",
        description: "Your availability has been updated successfully.",
      });
      setIsAvailabilityDialogOpen(false);
      availabilityForm.reset({
        dayOfWeek: 1,
        startTime: "09:00",
        endTime: "17:00",
        isAvailable: true,
      });
      queryClient.invalidateQueries({ queryKey: [`/api/staff/${staffId}/availability`] });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to update availability",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Delete availability mutation
  const deleteAvailabilityMutation = useMutation({
    mutationFn: async (availabilityId: number) => {
      const res = await apiRequest("DELETE", `/api/staff/availability/${availabilityId}`);
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Availability removed",
        description: "Your availability has been removed successfully.",
      });
      queryClient.invalidateQueries({ queryKey: [`/api/staff/${staffId}/availability`] });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to remove availability",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  function onSubmitAvailability(values: AvailabilityFormValues) {
    addAvailabilityMutation.mutate(values);
  }

  function handleDeleteAvailability(availabilityId: number) {
    if (confirm("Are you sure you want to remove this availability slot?")) {
      deleteAvailabilityMutation.mutate(availabilityId);
    }
  }

  if (!user) {
    return null; // User should be redirected by the auth check
  }

  return (
    <div className="container mx-auto py-6">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-6 gap-4">
        <div>
          <h1 className="text-3xl font-bold">My Schedule</h1>
          <p className="text-muted-foreground">Manage your working hours and view your appointments</p>
        </div>
      </div>

      <Tabs defaultValue="schedule" className="mt-6">
        <TabsList>
          <TabsTrigger value="schedule">Work Schedule</TabsTrigger>
          <TabsTrigger value="appointments">My Appointments</TabsTrigger>
        </TabsList>

        <TabsContent value="schedule" className="mt-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div>
                <CardTitle>Work Schedule</CardTitle>
                <CardDescription>Manage when you are available to work</CardDescription>
              </div>
              <Dialog open={isAvailabilityDialogOpen} onOpenChange={setIsAvailabilityDialogOpen}>
                <DialogTrigger asChild>
                  <Button size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Schedule
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle>Add Availability</DialogTitle>
                  </DialogHeader>
                  <Form {...availabilityForm}>
                    <form onSubmit={availabilityForm.handleSubmit(onSubmitAvailability)} className="space-y-4 pt-4">
                      <FormField
                        control={availabilityForm.control}
                        name="dayOfWeek"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Day of Week</FormLabel>
                            <Select 
                              onValueChange={(value) => field.onChange(parseInt(value))}
                              value={field.value.toString()}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select a day" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {dayNames.map((day, index) => (
                                  <SelectItem key={index} value={index.toString()}>
                                    {day}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <div className="flex gap-4">
                        <FormField
                          control={availabilityForm.control}
                          name="startTime"
                          render={({ field }) => (
                            <FormItem className="flex-1">
                              <FormLabel>Start Time</FormLabel>
                              <FormControl>
                                <Input type="time" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={availabilityForm.control}
                          name="endTime"
                          render={({ field }) => (
                            <FormItem className="flex-1">
                              <FormLabel>End Time</FormLabel>
                              <FormControl>
                                <Input type="time" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      <FormField
                        control={availabilityForm.control}
                        name="isAvailable"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                            <div className="space-y-0.5">
                              <FormLabel>Available</FormLabel>
                            </div>
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      <Button 
                        type="submit" 
                        className="w-full" 
                        disabled={addAvailabilityMutation.isPending}
                      >
                        {addAvailabilityMutation.isPending && (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        )}
                        Save Schedule
                      </Button>
                    </form>
                  </Form>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              {isLoadingAvailability ? (
                <div className="flex justify-center p-8">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : !availability || availability.length === 0 ? (
                <div className="text-center p-8 border rounded-lg">
                  <Calendar className="h-10 w-10 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-medium">No schedule set</h3>
                  <p className="text-muted-foreground mt-2">
                    Add your working hours to let clients know when you're available.
                  </p>
                </div>
              ) : (
                <div className="overflow-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr>
                        <th className="border p-2 bg-muted text-left">Day</th>
                        <th className="border p-2 bg-muted text-left">Hours</th>
                        <th className="border p-2 bg-muted text-left">Status</th>
                        <th className="border p-2 bg-muted text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {availability.map((slot: any) => (
                        <tr key={slot.id}>
                          <td className="border p-2">{dayNames[slot.dayOfWeek]}</td>
                          <td className="border p-2">{slot.startTime} - {slot.endTime}</td>
                          <td className="border p-2">
                            {slot.isAvailable ? (
                              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                                Available
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                                Unavailable
                              </Badge>
                            )}
                          </td>
                          <td className="border p-2 text-right">
                            <Button 
                              variant="destructive" 
                              size="sm"
                              onClick={() => handleDeleteAvailability(slot.id)}
                              disabled={deleteAvailabilityMutation.isPending}
                            >
                              Remove
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="appointments" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>My Appointments</CardTitle>
              <CardDescription>All appointments assigned to you</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingAppointments ? (
                <div className="flex justify-center p-8">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : !appointments || appointments.length === 0 ? (
                <div className="text-center p-8 border rounded-lg">
                  <Calendar className="h-10 w-10 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-medium">No appointments</h3>
                  <p className="text-muted-foreground mt-2">
                    You don't have any appointments scheduled yet.
                  </p>
                </div>
              ) : (
                <div className="overflow-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr>
                        <th className="border p-2 bg-muted text-left">Date</th>
                        <th className="border p-2 bg-muted text-left">Time</th>
                        <th className="border p-2 bg-muted text-left">Customer</th>
                        <th className="border p-2 bg-muted text-left">Service</th>
                        <th className="border p-2 bg-muted text-left">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {appointments.map((appointment: any) => {
                        const appointmentDate = new Date(appointment.date);
                        return (
                          <tr key={appointment.id}>
                            <td className="border p-2">{appointmentDate.toLocaleDateString()}</td>
                            <td className="border p-2">{appointment.startTime} - {appointment.endTime}</td>
                            <td className="border p-2">{appointment.customerName}</td>
                            <td className="border p-2">{appointment.serviceName}</td>
                            <td className="border p-2">
                              <Badge 
                                variant="outline" 
                                className={
                                  appointment.status === 'completed' 
                                    ? "bg-green-50 text-green-700 border-green-200"
                                    : appointment.status === 'cancelled'
                                    ? "bg-red-50 text-red-700 border-red-200"
                                    : "bg-blue-50 text-blue-700 border-blue-200"
                                }
                              >
                                {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                              </Badge>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}