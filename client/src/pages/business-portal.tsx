import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { format, addDays } from "date-fns";
import { Clock, CalendarIcon, DollarSign } from "lucide-react";
import { User, Service, Customer, Appointment } from "@shared/schema";

// Import business components
import BusinessLayout from "@/components/business/layout";
import HomePage from "@/components/business/home-page";
import AboutPage from "@/components/business/about-page";
import StorePage from "@/components/business/store-page";
import { AvailabilityHints } from "@/components/customer-portal/availability-hints";

interface BusinessPortalData {
  business: Omit<User, "password">;
  services: Service[];
  isPreview?: boolean;
}

interface BusinessPortalProps {
  slug: string;
  subPath?: string;
  initialData?: BusinessPortalData | null;
}

export default function BusinessPortal({ slug, subPath, initialData }: BusinessPortalProps) {
  const [location] = useLocation();
  const [activeTab, setActiveTab] = useState("home");
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
  
  // Fetch business data by slug if not provided
  const { data, isLoading, error } = useQuery<BusinessPortalData>({
    queryKey: ["/api/business", slug],
    queryFn: async () => {
      const response = await fetch(`/api/business/${slug}`);
      if (!response.ok) {
        throw new Error("Business not found");
      }
      return response.json();
    },
    enabled: !!slug && !initialData,
    initialData: initialData || undefined,
  });
  
  // Fetch customer appointments if searching
  const { data: customers } = useQuery({
    queryKey: ['/api/customers'],
    enabled: activeTab === "my-appointments" && !!searchEmail
  });
  
  // Fetch appointments
  const { data: appointments } = useQuery({
    queryKey: ['/api/appointments'],
    enabled: activeTab === "my-appointments" && !!searchEmail
  });
  
  // Find customer by email
  const customer = customers?.find((c: Customer) => c.email === searchEmail);
  
  // Find appointments for customer
  const customerAppointments = appointments?.filter(
    (a: Appointment) => customer && a.customerId === customer.id
  );
  
  // Set the document title to the business name when data is loaded
  useEffect(() => {
    if (data?.business?.businessName) {
      const pageTitlePrefix = subPath && subPath !== "home" ? 
        `${subPath.charAt(0).toUpperCase() + subPath.slice(1)} - ` : "";
      document.title = `${pageTitlePrefix}${data.business.businessName} - AppointEase`;
    } else {
      document.title = "Business Portal - AppointEase";
    }
    
    // Set active tab based on subPath
    if (subPath) {
      switch (subPath) {
        case "schedule":
          setActiveTab("book");
          break;
        case "about":
          setActiveTab("about");
          break;
        case "store":
          setActiveTab("store");
          break;
        default:
          setActiveTab("home");
      }
    }
  }, [data, subPath]);
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleServiceSelect = (service: Service) => {
    // Redirect to new appointment flow
    window.location.href = `/customer-portal/new-appointment`;
  };
  
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // This would trigger the customers query
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
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }
  
  if (error || !data) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <h1 className="text-3xl font-bold mb-4">Business Not Found</h1>
        <p className="text-lg text-muted-foreground mb-6">
          The business you're looking for doesn't seem to exist.
        </p>
        <Button onClick={() => window.history.back()}>Go Back</Button>
      </div>
    );
  }
  
  const { business, services } = data;
  
  return (
    <BusinessLayout business={business} slug={slug}>
      {/* Only show tabs on the main page, not with subpaths */}
      {!subPath ? (
        <div className="container mx-auto py-10">
          <div className="flex flex-col items-center mb-10 text-center">
            <h1 className="text-4xl font-bold tracking-tight mb-4">
              <span className="bg-gradient-to-r from-primary to-indigo-500 text-transparent bg-clip-text">
                {business.businessName}
              </span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-xl">
              Book your next appointment online and enjoy the best beauty and wellness services
            </p>
          </div>
          
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-7">
              <TabsTrigger value="home">Home</TabsTrigger>
              <TabsTrigger value="services">Our Services</TabsTrigger>
              <TabsTrigger value="store">Store</TabsTrigger>
              <TabsTrigger value="book">Book Appointment</TabsTrigger>
              <TabsTrigger value="my-appointments">My Appointments</TabsTrigger>
              <TabsTrigger value="zero-friction">Quick Check</TabsTrigger>
              <TabsTrigger value="about">About Us</TabsTrigger>
            </TabsList>
            
            {/* Home Tab */}
            <TabsContent value="home">
              <HomePage business={business} services={services} slug={slug} />
            </TabsContent>
            
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
              <Card>
                <CardHeader>
                  <CardTitle>New Appointment Booking</CardTitle>
                  <CardDescription>Book your appointment with our new streamlined system</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center space-y-6 py-4">
                    <div className="mx-auto bg-primary/10 w-16 h-16 flex items-center justify-center rounded-full">
                      <CalendarPlus className="w-8 h-8 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold mb-2">Our New Booking Experience</h3>
                      <p className="text-muted-foreground max-w-md mx-auto">
                        We've improved our appointment booking system to make scheduling easier for you.
                      </p>
                    </div>
                    <Button 
                      size="lg"
                      onClick={() => window.location.href = `/customer-portal/new-appointment?businessId=${business.id}`}
                      className="mt-4"
                    >
                      Start Booking Process
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            {/* Store Tab */}
            <TabsContent value="store">
              <StorePage business={business} services={services} slug={slug} />
            </TabsContent>
            
            {/* About Us Tab */}
            <TabsContent value="about">
              <AboutPage business={business} slug={slug} />
            </TabsContent>
            
            {/* Zero-Friction Tab */}
            <TabsContent value="zero-friction">
              <Card>
                <CardHeader>
                  <CardTitle>Quick Appointment Lookup</CardTitle>
                  <CardDescription>
                    Instantly check your appointments with just your email - no login required!
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="max-w-xl mx-auto">
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 gap-4 text-center">
                        <div className="flex flex-col items-center">
                          <div className="mb-2 p-2 bg-primary/10 rounded-full">
                            <CalendarIcon className="h-6 w-6 text-primary" />
                          </div>
                          <h3 className="text-lg font-medium">Check Your Appointments</h3>
                          <p className="text-muted-foreground text-sm">
                            Enter your email to instantly view your upcoming appointments
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex flex-col gap-4">
                        <div className="flex flex-col sm:flex-row gap-2">
                          <Input 
                            placeholder="Enter your email address" 
                            type="email"
                            className="flex-1"
                            value={searchEmail}
                            onChange={(e) => setSearchEmail(e.target.value)}
                          />
                          <Button 
                            onClick={() => window.location.href = `/customer-portal/zero-friction?email=${searchEmail}`}
                            className="sm:w-auto w-full"
                          >
                            Check Appointments
                          </Button>
                        </div>
                        <div className="text-center">
                          <Button variant="outline" onClick={() => window.location.href = `/customer-portal/new-appointment?businessId=${business.id}`}>
                            Book New Appointment
                          </Button>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-center py-3">
                        <div className="w-full border-t"></div>
                        <span className="px-3 text-xs text-muted-foreground">Secure & Private</span>
                        <div className="w-full border-t"></div>
                      </div>
                      
                      <div className="text-center text-sm text-muted-foreground">
                        <p>No login required. We only show your future appointments.</p>
                        <p>Only you can access your personal appointment information.</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="justify-center">
                  <Button variant="outline" onClick={() => window.location.href = `/${slug}/customer-portal/zero-friction`}>
                    Advanced Lookup
                  </Button>
                </CardFooter>
              </Card>
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
              Need help? Contact us at <span className="text-primary">contact@{business.businessSlug}.cl</span> or call <span className="text-primary">{business.phone || "+56 9 9876 5432"}</span>
            </p>
            <Button variant="outline" onClick={() => window.location.href = "/"}>
              Business Login
            </Button>
          </div>
        </div>
      ) : (
        // When accessed with a subpath, render the appropriate content
        <>
          {subPath === "about" && <AboutPage business={business} slug={slug} />}
          {subPath === "schedule" && (
            <div className="container mx-auto py-10">
              {/* Book appointment content (same as book tab) */}
              <div className="grid gap-8 md:grid-cols-3">
                <div className="space-y-6 md:col-span-2">
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
                </div>
                
                {/* Availability hints column */}
                <div>
                  <AvailabilityHints />
                </div>
              </div>
            </div>
          )}
          {subPath === "store" && <StorePage business={business} services={services} slug={slug} />}
          {!["about", "schedule", "store"].includes(subPath as string) && <HomePage business={business} services={services} slug={slug} />}
        </>
      )}
    </BusinessLayout>
  );
}