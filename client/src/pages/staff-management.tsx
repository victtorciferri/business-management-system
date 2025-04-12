import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Loader2, PlusCircle, UserCog, Calendar, Users, Edit, Trash } from "lucide-react";
import { Link } from "wouter";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// Staff form schema
const staffFormSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  email: z.string().email("Please enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  role: z.enum(["staff"], { required_error: "Role is required" }),
});

type StaffFormValues = z.infer<typeof staffFormSchema>;

export default function StaffManagement() {
  const { toast } = useToast();
  const [isStaffDialogOpen, setIsStaffDialogOpen] = useState(false);

  // Fetch staff members
  const { data: staffMembers, isLoading: isLoadingStaff } = useQuery({
    queryKey: ["/api/staff"],
    queryFn: ({ signal }) => 
      fetch("/api/staff", { signal })
        .then(res => {
          if (!res.ok) throw new Error("Failed to fetch staff members");
          return res.json();
        }),
  });

  // Create staff form
  const form = useForm<StaffFormValues>({
    resolver: zodResolver(staffFormSchema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
      role: "staff",
    },
  });

  // Create staff mutation
  const createStaffMutation = useMutation({
    mutationFn: async (values: StaffFormValues) => {
      const res = await apiRequest("POST", "/api/staff", values);
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Staff member created",
        description: "The staff member has been successfully added.",
      });
      setIsStaffDialogOpen(false);
      form.reset();
      queryClient.invalidateQueries({ queryKey: ["/api/staff"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to create staff member",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Delete staff mutation
  const deleteStaffMutation = useMutation({
    mutationFn: async (staffId: number) => {
      const res = await apiRequest("DELETE", `/api/staff/${staffId}`);
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Staff member deleted",
        description: "The staff member has been successfully removed.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/staff"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to delete staff member",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  function onSubmit(values: StaffFormValues) {
    createStaffMutation.mutate(values);
  }

  function handleDeleteStaff(staffId: number) {
    if (confirm("Are you sure you want to delete this staff member? All their schedules and appointments will be reassigned.")) {
      deleteStaffMutation.mutate(staffId);
    }
  }

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Staff Management</h1>
        <Dialog open={isStaffDialogOpen} onOpenChange={setIsStaffDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Staff Member
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Add New Staff Member</DialogTitle>
              <DialogDescription>
                Create an account for a staff member to manage appointments and customers.
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Username</FormLabel>
                      <FormControl>
                        <Input placeholder="johnsmith" {...field} />
                      </FormControl>
                      <FormDescription>
                        This will be used for login.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="john@example.com" {...field} />
                      </FormControl>
                      <FormDescription>
                        Staff email for notifications.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <Input type="password" placeholder="••••••" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <DialogFooter>
                  <Button type="submit" disabled={createStaffMutation.isPending}>
                    {createStaffMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Create Staff Member
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="active">
        <TabsList className="mb-4">
          <TabsTrigger value="active">Active Staff</TabsTrigger>
          <TabsTrigger value="schedules">Staff Schedules</TabsTrigger>
        </TabsList>
        
        <TabsContent value="active" className="mt-0">
          {isLoadingStaff ? (
            <div className="flex justify-center p-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : !staffMembers || staffMembers.length === 0 ? (
            <div className="text-center p-8 border rounded-lg">
              <UserCog className="h-10 w-10 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-medium">No staff members found</h3>
              <p className="text-muted-foreground mt-2">
                Add your first staff member to manage appointments and schedules.
              </p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {staffMembers.map((staff: any) => (
                <Card key={staff.id} className="overflow-hidden">
                  <CardHeader className="pb-2">
                    <CardTitle>{staff.username}</CardTitle>
                    <CardDescription>{staff.email}</CardDescription>
                  </CardHeader>
                  <CardContent className="pb-3">
                    <div className="flex items-center text-sm mb-2">
                      <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
                      <span>{staff.appointmentsCount || 0} Appointments</span>
                    </div>
                    <div className="flex items-center text-sm">
                      <Users className="mr-2 h-4 w-4 text-muted-foreground" />
                      <span>{staff.customersCount || 0} Customers</span>
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-between border-t pt-3 pb-3 bg-muted/50">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      asChild
                    >
                      <Link href={`/staff-profile/${staff.id}`}>
                        <Edit className="mr-2 h-4 w-4" />
                        Manage
                      </Link>
                    </Button>
                    <Button 
                      variant="destructive" 
                      size="sm"
                      onClick={() => handleDeleteStaff(staff.id)}
                      disabled={deleteStaffMutation.isPending}
                    >
                      {deleteStaffMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      <Trash className="mr-2 h-4 w-4" />
                      Remove
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="schedules">
          <div className="border rounded-lg p-6">
            <h2 className="text-xl font-bold mb-4">Weekly Staff Schedule Overview</h2>
            
            {isLoadingStaff ? (
              <div className="flex justify-center p-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : !staffMembers || staffMembers.length === 0 ? (
              <div className="text-center p-8">
                <p className="text-muted-foreground">No staff members available to schedule.</p>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="flex space-x-2 mb-4">
                  <Select defaultValue="all">
                    <SelectTrigger className="w-[200px]">
                      <SelectValue placeholder="Select Staff Member" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Staff Members</SelectItem>
                      {staffMembers.map((staff: any) => (
                        <SelectItem key={staff.id} value={staff.id.toString()}>
                          {staff.username}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="overflow-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr>
                        <th className="border p-2 bg-muted">Staff Member</th>
                        <th className="border p-2 bg-muted">Monday</th>
                        <th className="border p-2 bg-muted">Tuesday</th>
                        <th className="border p-2 bg-muted">Wednesday</th>
                        <th className="border p-2 bg-muted">Thursday</th>
                        <th className="border p-2 bg-muted">Friday</th>
                        <th className="border p-2 bg-muted">Saturday</th>
                        <th className="border p-2 bg-muted">Sunday</th>
                      </tr>
                    </thead>
                    <tbody>
                      {staffMembers.map((staff: any) => (
                        <tr key={staff.id}>
                          <td className="border p-2 font-medium">{staff.username}</td>
                          <td className="border p-2 text-sm text-center">
                            {staff.availability?.find((a: any) => a.dayOfWeek === 1)?.startTime} - {staff.availability?.find((a: any) => a.dayOfWeek === 1)?.endTime || 'Off'}
                          </td>
                          <td className="border p-2 text-sm text-center">
                            {staff.availability?.find((a: any) => a.dayOfWeek === 2)?.startTime} - {staff.availability?.find((a: any) => a.dayOfWeek === 2)?.endTime || 'Off'}
                          </td>
                          <td className="border p-2 text-sm text-center">
                            {staff.availability?.find((a: any) => a.dayOfWeek === 3)?.startTime} - {staff.availability?.find((a: any) => a.dayOfWeek === 3)?.endTime || 'Off'}
                          </td>
                          <td className="border p-2 text-sm text-center">
                            {staff.availability?.find((a: any) => a.dayOfWeek === 4)?.startTime} - {staff.availability?.find((a: any) => a.dayOfWeek === 4)?.endTime || 'Off'}
                          </td>
                          <td className="border p-2 text-sm text-center">
                            {staff.availability?.find((a: any) => a.dayOfWeek === 5)?.startTime} - {staff.availability?.find((a: any) => a.dayOfWeek === 5)?.endTime || 'Off'}
                          </td>
                          <td className="border p-2 text-sm text-center">
                            {staff.availability?.find((a: any) => a.dayOfWeek === 6)?.startTime} - {staff.availability?.find((a: any) => a.dayOfWeek === 6)?.endTime || 'Off'}
                          </td>
                          <td className="border p-2 text-sm text-center">
                            {staff.availability?.find((a: any) => a.dayOfWeek === 0)?.startTime} - {staff.availability?.find((a: any) => a.dayOfWeek === 0)?.endTime || 'Off'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}