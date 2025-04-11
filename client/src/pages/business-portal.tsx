import { useEffect, useState } from "react";
import { useParams, Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { CalendarDays, Clock, DollarSign, Info } from "lucide-react";
import { AvailabilityHints } from "@/components/customer-portal/availability-hints";
import { User, Service } from "@shared/schema";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

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
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [activeTab, setActiveTab] = useState<string>(subPath || "services");
  
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
  
  // Set the document title to the business name when data is loaded
  useEffect(() => {
    if (data?.business?.businessName) {
      const pageTitle = subPath 
        ? `${subPath.charAt(0).toUpperCase() + subPath.slice(1)} - ${data.business.businessName}`
        : data.business.businessName;
      document.title = `${pageTitle} - AppointEase`;
    } else {
      document.title = "Business Portal - AppointEase";
    }
  }, [data, subPath]);
  
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
    <div className="container mx-auto py-8 px-4">
      <header className="mb-8 text-center md:text-left">
        <h1 className="text-4xl font-bold mb-2">{business.businessName}</h1>
        {business.phone && (
          <p className="text-lg text-muted-foreground">
            Contact: {business.phone}
          </p>
        )}
      </header>
      
      <Separator className="my-6" />
      
      {/* Navigation Tabs */}
      <Tabs 
        defaultValue={activeTab} 
        onValueChange={(value) => setActiveTab(value)}
        className="mb-8"
      >
        <TabsList className="mb-4">
          <TabsTrigger value="services" asChild>
            <Link href={`/${slug}`}>Services</Link>
          </TabsTrigger>
          <TabsTrigger value="about" asChild>
            <Link href={`/${slug}/about`}>About</Link>
          </TabsTrigger>
          <TabsTrigger value="booking" asChild>
            <Link href={`/${slug}/booking`}>Booking</Link>
          </TabsTrigger>
          <TabsTrigger value="contact" asChild>
            <Link href={`/${slug}/contact`}>Contact</Link>
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="services" className="grid grid-cols-1 md:grid-cols-12 gap-8">
          <div className="md:col-span-8">
            <h2 className="text-2xl font-bold mb-6">Our Services</h2>
            
            <div className="grid grid-cols-1 gap-4">
              {services.map((service) => (
                <Card 
                  key={service.id} 
                  className={`cursor-pointer transition-all duration-200 ${
                    selectedService?.id === service.id 
                      ? "ring-2 ring-primary" 
                      : "hover:shadow-md"
                  }`}
                  onClick={() => setSelectedService(service)}
                >
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-xl">{service.name}</CardTitle>
                      <div 
                        className="w-4 h-4 rounded-full" 
                        style={{ backgroundColor: service.color || "#06b6d4" }}
                      />
                    </div>
                    <CardDescription>{service.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="pb-2">
                    <div className="grid grid-cols-2 gap-2">
                      <div className="flex items-center">
                        <Clock className="w-4 h-4 mr-2 text-muted-foreground" />
                        <span>{service.duration} minutes</span>
                      </div>
                      <div className="flex items-center">
                        <DollarSign className="w-4 h-4 mr-2 text-muted-foreground" />
                        <span>${Number(service.price).toFixed(2)}</span>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button className="w-full" variant="outline">
                      Select
                    </Button>
                  </CardFooter>
                </Card>
              ))}
              
              {services.length === 0 && (
                <div className="text-center p-12 border rounded-lg bg-muted/50">
                  <Info className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-xl font-semibold mb-2">No Services Available</h3>
                  <p className="text-muted-foreground">
                    This business hasn't added any services yet.
                  </p>
                </div>
              )}
            </div>
          </div>
          
          <div className="md:col-span-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <CalendarDays className="w-5 h-5 mr-2" />
                  Book an Appointment
                </CardTitle>
                <CardDescription>
                  Select a service to schedule your appointment
                </CardDescription>
              </CardHeader>
              <CardContent>
                {selectedService ? (
                  <div className="space-y-4">
                    <div className="p-4 bg-muted rounded-lg">
                      <p className="font-medium">{selectedService.name}</p>
                      <div className="text-sm text-muted-foreground mt-1">
                        ${Number(selectedService.price).toFixed(2)} · {selectedService.duration} min
                      </div>
                    </div>
                    
                    <AvailabilityHints />
                    
                    <Button className="w-full" asChild>
                      <Link href={`/${slug}/booking?serviceId=${selectedService.id}`}>
                        Continue to Booking
                      </Link>
                    </Button>
                  </div>
                ) : (
                  <div className="text-center p-6">
                    <p className="text-muted-foreground">
                      Please select a service to continue
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="about">
          <Card>
            <CardHeader>
              <CardTitle>About {business.businessName}</CardTitle>
            </CardHeader>
            <CardContent>
              <p>
                Welcome to {business.businessName}! We are dedicated to providing exceptional services and experiences for our clients.
              </p>
              <p className="mt-4">
                To book an appointment, browse our services and select the one that best meets your needs.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="booking">
          <Card>
            <CardHeader>
              <CardTitle>Book an Appointment</CardTitle>
              <CardDescription>Select a service and time that works for you</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-6">
                <h3 className="text-lg font-medium mb-4">Available Services</h3>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {services.map(service => (
                    <Card key={service.id} className="cursor-pointer hover:shadow-md">
                      <CardHeader className="p-4">
                        <CardTitle className="text-lg">{service.name}</CardTitle>
                        <CardDescription>${Number(service.price).toFixed(2)} · {service.duration} min</CardDescription>
                      </CardHeader>
                    </Card>
                  ))}
                </div>
              </div>
              
              <Separator className="my-6" />
              
              <AvailabilityHints />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="contact">
          <Card>
            <CardHeader>
              <CardTitle>Contact Information</CardTitle>
              <CardDescription>Get in touch with {business.businessName}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {business.phone && (
                <div>
                  <h3 className="font-medium">Phone</h3>
                  <p>{business.phone}</p>
                </div>
              )}
              
              {business.email && (
                <div>
                  <h3 className="font-medium">Email</h3>
                  <p>{business.email}</p>
                </div>
              )}
              
              <div>
                <h3 className="font-medium">Online</h3>
                <p className="text-muted-foreground">
                  You can book appointments online through this portal.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}