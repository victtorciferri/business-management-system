import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Plus, UserPlus, Search, Mail, Calendar, Trash2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Customer, Appointment } from "@shared/schema";
import { CustomerForm } from "@/components/customers/customer-form";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import { apiRequest } from "@/lib/queryClient";
import { useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";

export default function Customers() {
  const [isNewCustomerOpen, setIsNewCustomerOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [deleteCustomerId, setDeleteCustomerId] = useState<number | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  
  // In a real app, this would come from an auth context
  const userId = 1;
  
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Fetch customers
  const { data: customers = [], isLoading: isLoadingCustomers } = useQuery<Customer[]>({
    queryKey: [`/api/customers?userId=${userId}`],
  });
  
  // Fetch appointments to check which customers have appointments
  const { data: appointments = [] } = useQuery<Appointment[]>({
    queryKey: [`/api/appointments?userId=${userId}`],
  });
  
  // Filter customers based on search term
  const filteredCustomers = customers.filter(customer => {
    if (!searchTerm) return true;
    
    const fullName = `${customer.firstName} ${customer.lastName}`.toLowerCase();
    const email = customer.email.toLowerCase();
    const phone = customer.phone?.toLowerCase() || '';
    const searchLower = searchTerm.toLowerCase();
    
    return fullName.includes(searchLower) || 
           email.includes(searchLower) || 
           phone.includes(searchLower);
  });
  
  const handleEdit = (customer: Customer) => {
    setEditingCustomer(customer);
    setIsNewCustomerOpen(true);
  };
  
  const handleDelete = async () => {
    if (!deleteCustomerId) return;
    
    try {
      // Check if customer has appointments
      const customerAppointments = appointments.filter(
        appointment => appointment.customerId === deleteCustomerId
      );
      
      if (customerAppointments.length > 0) {
        toast({
          title: "Cannot delete customer",
          description: "This customer has appointments. Delete their appointments first.",
          variant: "destructive",
        });
        return;
      }
      
      await apiRequest("DELETE", `/api/customers/${deleteCustomerId}`, undefined);
      
      queryClient.invalidateQueries({
        queryKey: [`/api/customers`],
      });
      
      toast({
        title: "Customer deleted",
        description: "The customer has been removed from your records.",
      });
      
      setIsDeleteDialogOpen(false);
      setDeleteCustomerId(null);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete the customer. Please try again.",
        variant: "destructive",
      });
    }
  };
  
  const confirmDelete = (id: number) => {
    setDeleteCustomerId(id);
    setIsDeleteDialogOpen(true);
  };
  
  const getCustomerAppointmentCount = (customerId: number) => {
    return appointments.filter(appointment => appointment.customerId === customerId).length;
  };
  
  return (
    <div className="space-y-6">
      {/* Header and action buttons */}
      <div className="md:flex md:items-center md:justify-between">
        <div className="flex-1 min-w-0">
          <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
            Customers
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Manage your customer database
          </p>
        </div>
        <div className="mt-4 flex md:mt-0 md:ml-4">
          <Button onClick={() => {
            setEditingCustomer(null);
            setIsNewCustomerOpen(true);
          }}>
            <UserPlus className="h-4 w-4 mr-2" />
            New Customer
          </Button>
        </div>
      </div>
      
      {/* Search */}
      <div className="relative w-full max-w-md">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
        <Input 
          placeholder="Search customers..." 
          className="pl-10"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      
      {/* Customers Table */}
      <Card>
        <CardContent className="p-0">
          {isLoadingCustomers ? (
            <div className="text-center py-10">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
              <p className="mt-4 text-gray-500">Loading customers...</p>
            </div>
          ) : filteredCustomers.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Appointments</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCustomers.map(customer => (
                  <TableRow key={customer.id}>
                    <TableCell className="font-medium">
                      {customer.firstName} {customer.lastName}
                    </TableCell>
                    <TableCell>{customer.email}</TableCell>
                    <TableCell>{customer.phone || "—"}</TableCell>
                    <TableCell>{getCustomerAppointmentCount(customer.id)}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            Actions
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Customer Options</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => handleEdit(customer)}>
                            <UserPlus className="h-4 w-4 mr-2" />
                            Edit Details
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => {
                            setEditingCustomer(null);
                            setIsNewCustomerOpen(true);
                            // In a real app, this would navigate to the new appointment page with the customer pre-selected
                          }}>
                            <Calendar className="h-4 w-4 mr-2" />
                            New Appointment
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => {
                            // In a real app, this would trigger an email to the customer
                            toast({
                              title: "Email sent",
                              description: `Email has been sent to ${customer.email}`,
                            });
                          }}>
                            <Mail className="h-4 w-4 mr-2" />
                            Send Email
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            onClick={() => confirmDelete(customer.id)}
                            className="text-red-600 focus:text-red-600"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete Customer
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-10">
              <UserPlus className="h-12 w-12 text-gray-400 mx-auto" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No customers found</h3>
              <p className="mt-1 text-sm text-gray-500">
                {searchTerm 
                  ? "No customers match your search." 
                  : "Get started by adding a new customer."}
              </p>
              <div className="mt-6">
                <Button onClick={() => {
                  setEditingCustomer(null);
                  setIsNewCustomerOpen(true);
                }}>
                  <Plus className="h-4 w-4 mr-2" />
                  New Customer
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* New/Edit Customer Dialog */}
      <Dialog open={isNewCustomerOpen} onOpenChange={setIsNewCustomerOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <CustomerForm 
            userId={userId}
            existingCustomer={editingCustomer}
            onSubmitSuccess={() => {
              setIsNewCustomerOpen(false);
              setEditingCustomer(null);
            }}
          />
        </DialogContent>
      </Dialog>
      
      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this customer and all their information. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDeleteCustomerId(null)}>
              Cancel
            </AlertDialogCancel>
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
  );
}
