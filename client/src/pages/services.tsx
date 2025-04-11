import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Plus, Edit, Trash2, Settings } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Service, Appointment } from "@shared/schema";
import { ServiceForm } from "@/components/services/service-form";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useQueryClient } from "@tanstack/react-query";

export default function Services() {
  const [isNewServiceOpen, setIsNewServiceOpen] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [deleteServiceId, setDeleteServiceId] = useState<number | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  
  // In a real app, this would come from an auth context
  const userId = 1;
  
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Fetch services
  const { data: services = [], isLoading: isLoadingServices } = useQuery<Service[]>({
    queryKey: [`/api/services?userId=${userId}`],
  });
  
  // Fetch appointments to check which services are in use
  const { data: appointments = [] } = useQuery<Appointment[]>({
    queryKey: [`/api/appointments?userId=${userId}`],
  });
  
  // Filter services based on search term and sort by active status
  const filteredServices = services
    .filter(service => {
      if (!searchTerm) return true;
      
      const name = service.name.toLowerCase();
      const description = service.description?.toLowerCase() || '';
      const searchLower = searchTerm.toLowerCase();
      
      return name.includes(searchLower) || description.includes(searchLower);
    })
    .sort((a, b) => {
      // Active services first, then by name
      if (a.active && !b.active) return -1;
      if (!a.active && b.active) return 1;
      return a.name.localeCompare(b.name);
    });
  
  const handleEdit = (service: Service) => {
    setEditingService(service);
    setIsNewServiceOpen(true);
  };
  
  const handleDelete = async () => {
    if (!deleteServiceId) return;
    
    try {
      // Check if service has appointments
      const serviceAppointments = appointments.filter(
        appointment => appointment.serviceId === deleteServiceId
      );
      
      if (serviceAppointments.length > 0) {
        toast({
          title: "Cannot delete service",
          description: "This service is used in appointments. Please remove those appointments first.",
          variant: "destructive",
        });
        return;
      }
      
      await apiRequest("DELETE", `/api/services/${deleteServiceId}`, undefined);
      
      queryClient.invalidateQueries({
        queryKey: [`/api/services`],
      });
      
      toast({
        title: "Service deleted",
        description: "The service has been removed from your offerings.",
      });
      
      setIsDeleteDialogOpen(false);
      setDeleteServiceId(null);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete the service. Please try again.",
        variant: "destructive",
      });
    }
  };
  
  const confirmDelete = (id: number) => {
    setDeleteServiceId(id);
    setIsDeleteDialogOpen(true);
  };
  
  const toggleServiceActive = async (service: Service) => {
    try {
      const updatedService = {
        ...service,
        active: !service.active
      };
      
      await apiRequest("PUT", `/api/services/${service.id}`, updatedService);
      
      queryClient.invalidateQueries({
        queryKey: [`/api/services`],
      });
      
      toast({
        title: updatedService.active ? "Service activated" : "Service deactivated",
        description: updatedService.active 
          ? "The service is now available for booking." 
          : "The service is now hidden from booking.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update the service. Please try again.",
        variant: "destructive",
      });
    }
  };
  
  const formatPrice = (price: number | string) => {
    return `$${parseFloat(price.toString()).toFixed(2)}`;
  };
  
  const formatDuration = (minutes: number) => {
    if (minutes < 60) {
      return `${minutes} min`;
    }
    
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    
    if (remainingMinutes === 0) {
      return `${hours} ${hours === 1 ? 'hour' : 'hours'}`;
    }
    
    return `${hours} ${hours === 1 ? 'hour' : 'hours'} ${remainingMinutes} min`;
  };
  
  return (
    <div className="space-y-6">
      {/* Header and action buttons */}
      <div className="md:flex md:items-center md:justify-between">
        <div className="flex-1 min-w-0">
          <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
            Services
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Manage your service offerings
          </p>
        </div>
        <div className="mt-4 flex md:mt-0 md:ml-4">
          <Button onClick={() => {
            setEditingService(null);
            setIsNewServiceOpen(true);
          }}>
            <Plus className="h-4 w-4 mr-2" />
            Add Service
          </Button>
        </div>
      </div>
      
      {/* Search */}
      <div className="relative w-full max-w-md">
        <Input 
          placeholder="Search services..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      
      {/* Services Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {isLoadingServices ? (
          <div className="text-center py-10 col-span-full">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
            <p className="mt-4 text-gray-500">Loading services...</p>
          </div>
        ) : filteredServices.length > 0 ? (
          filteredServices.map(service => (
            <Card key={service.id} className={`overflow-hidden ${!service.active ? 'opacity-60' : ''}`}>
              <CardContent className="p-0">
                <div 
                  className="h-2" 
                  style={{ backgroundColor: service.color }}
                ></div>
                <div className="p-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium text-lg">{service.name}</h3>
                      <p className="text-sm text-gray-500">
                        {formatDuration(service.duration)} • {formatPrice(service.price)}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => handleEdit(service)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        className="text-red-500 hover:text-red-600"
                        onClick={() => confirmDelete(service.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  
                  {service.description && (
                    <p className="mt-3 text-sm text-gray-600">
                      {service.description}
                    </p>
                  )}
                  
                  <div className="mt-4 pt-4 border-t border-gray-200 flex justify-between items-center">
                    <div className="flex items-center">
                      <span className="text-sm font-medium mr-3">Active</span>
                      <Switch 
                        checked={service.active} 
                        onCheckedChange={() => toggleServiceActive(service)}
                      />
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="text-xs"
                      onClick={() => handleEdit(service)}
                    >
                      <Settings className="h-3 w-3 mr-1" />
                      Settings
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="text-center py-10 bg-white rounded-lg shadow col-span-full">
            <Settings className="h-12 w-12 text-gray-400 mx-auto" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No services found</h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchTerm 
                ? "No services match your search." 
                : "Get started by adding a new service."}
            </p>
            <div className="mt-6">
              <Button onClick={() => {
                setEditingService(null);
                setIsNewServiceOpen(true);
              }}>
                <Plus className="h-4 w-4 mr-2" />
                Add Service
              </Button>
            </div>
          </div>
        )}
      </div>
      
      {/* New/Edit Service Dialog */}
      <Dialog open={isNewServiceOpen} onOpenChange={setIsNewServiceOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <ServiceForm 
            userId={userId}
            existingService={editingService}
            onSubmitSuccess={() => {
              setIsNewServiceOpen(false);
              setEditingService(null);
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
              This will permanently delete this service. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDeleteServiceId(null)}>
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
