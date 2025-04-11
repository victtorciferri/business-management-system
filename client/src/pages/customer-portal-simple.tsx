import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { type Service, type Customer, type Appointment } from "@shared/schema";
import { format, addDays } from "date-fns";
import { Clock, CalendarIcon, DollarSign } from "lucide-react";

export default function CustomerPortalSimple() {
  const [activeTab, setActiveTab] = useState("services");
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    notes: ""
  });
  const [searchEmail, setSearchEmail] = useState("");
  
  // Fetch services
  const { data: services, isLoading: servicesLoading } = useQuery({
    queryKey: ['/api/services'],
    enabled: true
  });
  
  // Fetch customer data based on email
  const { data: customers } = useQuery({
    queryKey: ['/api/customers'],
    enabled: true
  });
  
  // Fetch appointments
  const { data: appointments } = useQuery({
    queryKey: ['/api/appointments'],
    enabled: true
  });
  
  // Find customer by email
  const customer = customers?.find((c: Customer) => c.email === searchEmail);
  
  // Find appointments for customer
  const customerAppointments = appointments?.filter(
    (a: Appointment) => customer && a.customerId === customer.id
  );
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleServiceSelect = (service: Service) => {
    setSelectedService(service);
    setActiveTab("book");
  };
  
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // This would trigger the customers query if we had implemented real search
  };
  
  // Status badges
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'scheduled':
        return <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-medium">Scheduled</span>;
      case 'completed':
        return <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-medium">Completed</span>;
      case 'cancelled':
        return <span className="bg-red-100 text-red-800 px-2 py-1 rounded text-xs font-medium">Cancelled</span>;
      default:
        return <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded text-xs font-medium">{status}</span>;
    }
  };
  
  return (
    <div className="container mx-auto py-10">
      <div className="flex flex-col items-center mb-10 text-center">
        <h1 className="text-4xl font-bold tracking-tight mb-4">
          <span className="bg-gradient-to-r from-primary to-indigo-500 text-transparent bg-clip-text">
            Salon Elegante
          </span>
        </h1>
        <p className="text-lg text-muted-foreground max-w-xl">
          Book your next appointment online and enjoy the best beauty and wellness services
        </p>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="services">Our Services</TabsTrigger>
          <TabsTrigger value="book">Book Appointment</TabsTrigger>
          <TabsTrigger value="my-appointments">My Appointments</TabsTrigger>
        </TabsList>
        
        {/* Services Tab */}
        <TabsContent value="services">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {services?.map((service: Service) => (
              <Card key={service.id} className="overflow-hidden">
                <div className="h-2" style={{ backgroundColor: service.color }}></div>
                <CardHeader>
                  <CardTitle>{service.name}</CardTitle>
                  <CardDescription>Professional service</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="mb-4 text-sm">{service.description}</p>
                  <div className="flex justify-between text-sm">
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span>{service.duration} mins</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <DollarSign className="h-4 w-4 text-muted-foreground" />
                      <span>${service.price}</span>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button 
                    className="w-full" 
                    onClick={() => handleServiceSelect(service)}
                  >
                    Book Now
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </TabsContent>
        
        {/* Book Appointment Tab */}
        <TabsContent value="book">
          <div className="grid gap-8 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Select Date</CardTitle>
                <CardDescription>Choose when you'd like to schedule your appointment</CardDescription>
              </CardHeader>
              <CardContent>
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  disabled={(date) => date < new Date() || date > addDays(new Date(), 60)}
                  className="rounded-md border mx-auto"
                />
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Your Information</CardTitle>
                <CardDescription>
                  {selectedService 
                    ? `Booking for ${selectedService.name} (${selectedService.duration} mins)` 
                    : "Please select a service first"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label htmlFor="firstName" className="text-sm font-medium">First Name</label>
                      <Input 
                        id="firstName" 
                        name="firstName" 
                        placeholder="John"  
                        value={formData.firstName}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="lastName" className="text-sm font-medium">Last Name</label>
                      <Input 
                        id="lastName" 
                        name="lastName" 
                        placeholder="Doe"  
                        value={formData.lastName}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <label htmlFor="email" className="text-sm font-medium">Email</label>
                    <Input 
                      id="email" 
                      name="email" 
                      type="email" 
                      placeholder="johndoe@example.com"  
                      value={formData.email}
                      onChange={handleInputChange}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label htmlFor="phone" className="text-sm font-medium">Phone Number</label>
                    <Input 
                      id="phone" 
                      name="phone" 
                      placeholder="+56 9 XXXX XXXX"  
                      value={formData.phone}
                      onChange={handleInputChange}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label htmlFor="notes" className="text-sm font-medium">Special Requests or Notes</label>
                    <Textarea 
                      id="notes" 
                      name="notes" 
                      placeholder="Any special requests or information we should know" 
                      value={formData.notes}
                      onChange={handleInputChange}
                    />
                  </div>
                </form>
              </CardContent>
              <CardFooter>
                <Button 
                  className="w-full" 
                  disabled={!selectedDate || !selectedService}
                >
                  Book Appointment
                </Button>
              </CardFooter>
            </Card>
          </div>
        </TabsContent>
        
        {/* My Appointments Tab */}
        <TabsContent value="my-appointments">
          <Card>
            <CardHeader>
              <CardTitle>Find Your Appointments</CardTitle>
              <CardDescription>Enter your email to view your appointments</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSearchSubmit} className="flex space-x-2">
                <Input 
                  placeholder="Enter your email address" 
                  type="email"
                  value={searchEmail}
                  onChange={(e) => setSearchEmail(e.target.value)}
                  className="flex-1"
                />
                <Button type="submit">
                  Find Appointments
                </Button>
              </form>
              
              {searchEmail && customer && customerAppointments && customerAppointments.length > 0 && (
                <div className="mt-6">
                  <h3 className="text-lg font-medium mb-4">Your Scheduled Appointments</h3>
                  <div className="rounded-md border">
                    <div className="grid grid-cols-4 gap-4 p-4 font-medium border-b">
                      <div>Service</div>
                      <div>Date</div>
                      <div>Time</div>
                      <div>Status</div>
                    </div>
                    <div className="divide-y">
                      {customerAppointments.map((appointment: Appointment) => {
                        const appointmentDate = new Date(appointment.date);
                        return (
                          <div key={appointment.id} className="grid grid-cols-4 gap-4 p-4">
                            <div>{services?.find((s: Service) => s.id === appointment.serviceId)?.name}</div>
                            <div>{format(appointmentDate, 'MMM dd, yyyy')}</div>
                            <div>{format(appointmentDate, 'h:mm a')}</div>
                            <div>{getStatusBadge(appointment.status)}</div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}
              
              {searchEmail && (!customer || !customerAppointments || customerAppointments.length === 0) && (
                <div className="text-center py-8 mt-4">
                  <CalendarIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-xl font-medium mb-2">No Appointments Found</h3>
                  <p className="text-muted-foreground mb-4">
                    We couldn't find any appointments with the email address provided.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      <div className="mt-12 text-center">
        <p className="text-muted-foreground mb-6">
          Need help? Contact us at <span className="text-primary">contact@salonelegante.cl</span> or call <span className="text-primary">+56 9 9876 5432</span>
        </p>
        <Button variant="outline" onClick={() => window.location.href = "/"}>
          Business Login
        </Button>
      </div>
    </div>
  );
}