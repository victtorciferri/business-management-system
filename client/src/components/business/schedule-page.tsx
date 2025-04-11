import { useState } from "react";
import { User, Service } from "@shared/schema";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Clock, DollarSign } from "lucide-react";
import { AvailabilityHints } from "@/components/customer-portal/availability-hints";

interface SchedulePageProps {
  business: Omit<User, "password">;
  services: Service[];
  slug: string;
}

export default function SchedulePage({ business, services, slug }: SchedulePageProps) {
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  
  // Generate example time slots (in a real app these would come from the server)
  const timeSlots = [
    "9:00 AM", "9:30 AM", "10:00 AM", "10:30 AM", 
    "11:00 AM", "11:30 AM", "1:00 PM", "1:30 PM",
    "2:00 PM", "2:30 PM", "3:00 PM", "3:30 PM", 
    "4:00 PM", "4:30 PM"
  ];
  
  // Handle service selection
  const handleServiceSelect = (serviceId: string) => {
    const service = services.find(s => s.id.toString() === serviceId);
    setSelectedService(service || null);
  };
  
  // Handle time selection
  const handleTimeSelect = (time: string) => {
    setSelectedTime(time);
  };
  
  return (
    <div className="max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">Schedule an Appointment</h1>
      
      <Tabs defaultValue="appointment" className="w-full">
        <TabsList className="grid w-full grid-cols-2 md:w-[400px]">
          <TabsTrigger value="appointment">New Appointment</TabsTrigger>
          <TabsTrigger value="existing">My Appointments</TabsTrigger>
        </TabsList>
        
        <TabsContent value="appointment" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Service Selection */}
            <Card className="md:col-span-1">
              <CardHeader>
                <CardTitle>Select a Service</CardTitle>
                <CardDescription>Choose the service you'd like to book</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {services.map(service => (
                    <Card 
                      key={service.id} 
                      className={`cursor-pointer transition-all ${
                        selectedService?.id === service.id 
                          ? "ring-2 ring-primary-500" 
                          : "hover:border-primary-200"
                      }`}
                      onClick={() => setSelectedService(service)}
                    >
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-medium">{service.name}</h3>
                            <div className="flex items-center text-sm text-muted-foreground mt-1">
                              <Clock className="w-3 h-3 mr-1" />
                              <span>{service.duration} min</span>
                              <span className="mx-1">•</span>
                              <DollarSign className="w-3 h-3 mr-1" />
                              <span>${Number(service.price).toFixed(2)}</span>
                            </div>
                          </div>
                          <div 
                            className="w-3 h-3 rounded-full" 
                            style={{ backgroundColor: service.color || "#06b6d4" }}
                          />
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                  
                  {services.length === 0 && (
                    <div className="text-center p-4 border rounded-lg">
                      <p className="text-muted-foreground">No services available</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
            
            {/* Date and Time Selection */}
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>Select Date & Time</CardTitle>
                <CardDescription>Choose when you'd like your appointment</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Calendar */}
                  <div>
                    <Calendar
                      mode="single"
                      selected={selectedDate}
                      onSelect={setSelectedDate}
                      className="rounded-md border"
                      disabled={{ before: new Date() }}
                    />
                  </div>
                  
                  {/* Time Slots */}
                  <div>
                    <h3 className="text-sm font-medium mb-3">Available Times</h3>
                    {selectedDate ? (
                      <div className="grid grid-cols-2 gap-2">
                        {timeSlots.map(time => (
                          <Button
                            key={time}
                            variant={selectedTime === time ? "default" : "outline"}
                            size="sm"
                            className="justify-start"
                            onClick={() => handleTimeSelect(time)}
                          >
                            {time}
                          </Button>
                        ))}
                      </div>
                    ) : (
                      <p className="text-muted-foreground text-sm">Please select a date first</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* Customer Information & Booking Summary */}
            <Card className="md:col-span-3">
              <CardHeader>
                <CardTitle>Customer Information</CardTitle>
                <CardDescription>
                  {selectedService && selectedDate && selectedTime 
                    ? "Complete your booking" 
                    : "Select a service, date, and time to continue"
                  }
                </CardDescription>
              </CardHeader>
              <CardContent>
                {selectedService && selectedDate && selectedTime ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Customer Form */}
                    <div className="space-y-4">
                      <div>
                        <label className="text-sm font-medium">Full Name</label>
                        <input 
                          type="text" 
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                          placeholder="Enter your full name"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium">Email</label>
                        <input 
                          type="email" 
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                          placeholder="Enter your email"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium">Phone</label>
                        <input 
                          type="tel" 
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                          placeholder="Enter your phone number"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium">Special Requests (Optional)</label>
                        <textarea 
                          className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                          placeholder="Any special requests or notes"
                        />
                      </div>
                    </div>
                    
                    {/* Booking Summary */}
                    <div>
                      <Card>
                        <CardHeader>
                          <CardTitle>Booking Summary</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-4">
                            <div className="bg-muted p-4 rounded-lg">
                              <div className="flex justify-between mb-2">
                                <span className="font-medium">Service:</span>
                                <span>{selectedService.name}</span>
                              </div>
                              <div className="flex justify-between mb-2">
                                <span className="font-medium">Duration:</span>
                                <span>{selectedService.duration} minutes</span>
                              </div>
                              <div className="flex justify-between mb-2">
                                <span className="font-medium">Date:</span>
                                <span>{selectedDate.toLocaleDateString()}</span>
                              </div>
                              <div className="flex justify-between mb-2">
                                <span className="font-medium">Time:</span>
                                <span>{selectedTime}</span>
                              </div>
                              <div className="flex justify-between pt-2 border-t mt-2">
                                <span className="font-medium">Total:</span>
                                <span className="font-bold">${Number(selectedService.price).toFixed(2)}</span>
                              </div>
                            </div>
                            
                            <AvailabilityHints />
                            
                            <Button className="w-full">Confirm Booking</Button>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <p className="text-muted-foreground">
                      Please select a service, date, and time to continue with your booking.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="existing" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>My Appointments</CardTitle>
              <CardDescription>View and manage your upcoming appointments</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Email</label>
                  <div className="flex gap-2 mt-1">
                    <input 
                      type="email" 
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      placeholder="Enter your email address"
                    />
                    <Button>Find Appointments</Button>
                  </div>
                </div>
                
                <div className="text-center py-8 border rounded-lg">
                  <p className="text-muted-foreground">
                    Enter your email to view your appointments
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}