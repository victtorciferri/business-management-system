import { useState } from "react";
import { useParams, useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Loader2, Calendar, Clock, Plus } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";

// Staff availability form schema
const availabilityFormSchema = z.object({
  dayOfWeek: z.coerce.number().min(0).max(6),
  startTime: z.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, "Invalid time format. Use HH:MM (24h format)"),
  endTime: z.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, "Invalid time format. Use HH:MM (24h format)"),
  isAvailable: z.boolean().default(true),
});

type AvailabilityFormValues = z.infer<typeof availabilityFormSchema>;

// Day names for reference
const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

interface StaffProfileProps {
  staffId?: string;
}

export default function StaffProfile({ staffId: propStaffId }: StaffProfileProps = {}) {
  const params = useParams<{ id: string }>();
  const id = propStaffId || params.id;
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [isAvailabilityDialogOpen, setIsAvailabilityDialogOpen] = useState(false);

  // Fetch staff profile
  const { data: staff, isLoading: isLoadingStaff } = useQuery({
    queryKey: [`/api/staff/${id}`],
    queryFn: ({ signal }) =>
      fetch(`/api/staff/${id}`, { signal })
        .then(res => {
          if (!res.ok) {
            if (res.status === 404) {
              navigate("/staff-management");
              throw new Error("Staff member not found");
            }
            throw new Error("Failed to fetch staff profile");
          }
          return res.json();
        }),
  });

  // Fetch staff availability
  const { data: availability, isLoading: isLoadingAvailability } = useQuery({
    queryKey: [`/api/staff/${id}/availability`],
    queryFn: ({ signal }) =>
      fetch(`/api/staff/${id}/availability`, { signal })
        .then(res => {
          if (!res.ok) throw new Error("Failed to fetch staff availability");
          return res.json();
        }),
    enabled: !!id,
  });

  // Fetch staff appointments
  const { data: appointments, isLoading: isLoadingAppointments } = useQuery({
    queryKey: [`/api/staff/${id}/appointments`],
    queryFn: ({ signal }) =>
      fetch(`/api/staff/${id}/appointments`, { signal })
        .then(res => {
          if (!res.ok) throw new Error("Failed to fetch staff appointments");
          return res.json();
        }),
    enabled: !!id,
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
      const res = await apiRequest("POST", `/api/staff/${id}/availability`, {
        ...values,
        staffId: parseInt(id),
      });
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Availability added",
        description: "Staff availability has been updated successfully.",
      });
      setIsAvailabilityDialogOpen(false);
      availabilityForm.reset({
        dayOfWeek: 1,
        startTime: "09:00",
        endTime: "17:00",
        isAvailable: true,
      });
      queryClient.invalidateQueries({ queryKey: [`/api/staff/${id}/availability`] });
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
        description: "Staff availability has been removed successfully.",
      });
      queryClient.invalidateQueries({ queryKey: [`/api/staff/${id}/availability`] });
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

  if (isLoadingStaff) {
    return (
      <div className="flex justify-center items-center h-[calc(100vh-4rem)]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!staff) {
    return null; // We'll be redirected by the query if staff not found
  }

  return (
    <div className="container mx-auto py-6">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-6 gap-4">
        <div>
          <h1 className="text-3xl font-bold">{staff.username}</h1>
          <p className="text-muted-foreground">{staff.email}</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={() => navigate("/staff-management")}>
            Back to Staff List
          </Button>
        </div>
      </div>

      <Tabs defaultValue="profile" className="mt-6">
        <TabsList>
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="schedule">Work Schedule</TabsTrigger>
          <TabsTrigger value="appointments">Appointments</TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="mt-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Staff Information</CardTitle>
                <CardDescription>Basic information about this staff member</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-1">Username</h3>
                  <p>{staff.username}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-1">Email</h3>
                  <p>{staff.email}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-1">Role</h3>
                  <Badge variant="outline">{staff.role}</Badge>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-1">Joined</h3>
                  <p>{new Date(staff.createdAt).toLocaleDateString()}</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Statistics</CardTitle>
                <CardDescription>Activity and performance metrics</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Calendar className="h-5 w-5 mr-2 text-muted-foreground" />
                    <span>Total Appointments</span>
                  </div>
                  <span className="font-bold">{appointments?.length || 0}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Clock className="h-5 w-5 mr-2 text-muted-foreground" />
                    <span>Working Days</span>
                  </div>
                  <span className="font-bold">{availability?.length || 0} days/week</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="schedule" className="mt-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div>
                <CardTitle>Work Schedule</CardTitle>
                <CardDescription>Manage when this staff member is available to work</CardDescription>
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
                    Add working hours for this staff member.
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
              <CardTitle>Appointments</CardTitle>
              <CardDescription>All appointments assigned to this staff member</CardDescription>
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
                    This staff member has no appointments assigned.
                  </p>
                </div>
              ) : (
                <div className="overflow-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr>
                        <th className="border p-2 bg-muted text-left">Date & Time</th>
                        <th className="border p-2 bg-muted text-left">Customer</th>
                        <th className="border p-2 bg-muted text-left">Service</th>
                        <th className="border p-2 bg-muted text-left">Duration</th>
                        <th className="border p-2 bg-muted text-left">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {appointments.map((appointment: any) => (
                        <tr key={appointment.id}>
                          <td className="border p-2">
                            {new Date(appointment.date).toLocaleDateString()} 
                            {" "}
                            {new Date(appointment.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                          </td>
                          <td className="border p-2">
                            {appointment.customer?.firstName} {appointment.customer?.lastName}
                          </td>
                          <td className="border p-2">{appointment.service?.name}</td>
                          <td className="border p-2">{appointment.duration} min</td>
                          <td className="border p-2">
                            <Badge 
                              variant="outline" 
                              className={
                                appointment.status === "completed" 
                                  ? "bg-green-50 text-green-700 border-green-200"
                                  : appointment.status === "cancelled"
                                  ? "bg-red-50 text-red-700 border-red-200"
                                  : "bg-blue-50 text-blue-700 border-blue-200"
                              }
                            >
                              {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                            </Badge>
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
      </Tabs>
    </div>
  );
}