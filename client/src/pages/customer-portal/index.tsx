import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { 
  Calendar, 
  CalendarIcon, 
  Clock, 
  DollarSign, 
  BadgeCheck, 
  Heart, 
  Star 
} from "lucide-react";
import { BusinessMap } from "@/components/maps/BusinessMap";
import CustomerPortalLayout from "@/components/customer-portal/layout";
import { useBusinessContext } from "@/contexts/BusinessContext";
import { useTheme } from "@/contexts/ThemeContext";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import HomePage from "@/components/business/home-page";

export default function CustomerPortal() {
  const [location, navigate] = useLocation();
  const params = new URLSearchParams(window.location.search);
  const accessToken = params.get("token");
  const businessId = params.get("businessId");
  const businessSlug = params.get("businessSlug");
  
  // Get business data from context
  const { business, services, loading } = useBusinessContext();
  // Get theme data for styling
  const { theme, getPrimaryColor, getTextColor, getBackgroundColor } = useTheme();
  
  // Display only a subset of services on homepage
  const featuredServices = services?.slice(0, 3) || [];
  
  // Generic customer testimonials that can be used for any business type
  const defaultTestimonials = [
    {
      name: "Customer 1",
      comment: "Amazing service! The staff was professional and I loved my experience.",
      rating: 5
    },
    {
      name: "Customer 2",
      comment: "Always a great experience. I've been coming here regularly and I'm always satisfied.",
      rating: 5
    },
    {
      name: "Customer 3",
      comment: "Very satisfied with the results. Will definitely come back again.",
      rating: 4
    }
  ];
  
  // Use business-specific testimonials if available or fallback to generic ones
  // TODO: In future implementation, fetch business testimonials from API
  const testimonials = business?.testimonials || defaultTestimonials;
  
  return (
    <CustomerPortalLayout 
      businessId={businessId} 
      accessToken={accessToken}
    >
      <div className="container mx-auto py-10">
        <div className="flex flex-col items-center mb-10 text-center">
          <h1 className="text-4xl font-bold tracking-tight mb-4">
            <span className="bg-gradient-to-r from-primary to-indigo-500 text-transparent bg-clip-text">
              {business?.businessName || 'Business Portal'}
            </span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-xl">
            Book your next appointment online and enjoy our professional services
          </p>
        </div>
        
        <Tabs value="home" className="w-full">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="home">Home</TabsTrigger>
            <TabsTrigger value="services">Our Services</TabsTrigger>
            <TabsTrigger value="store">Store</TabsTrigger>
            <TabsTrigger value="book">Book Appointment</TabsTrigger>
            <TabsTrigger value="my-appointments">My Appointments</TabsTrigger>
            <TabsTrigger value="about">About Us</TabsTrigger>
          </TabsList>
          
          {/* Home Tab */}
          <TabsContent value="home">
            {business ? (
              <div className="space-y-16 py-6">
                {/* Hero Section */}
                <section className="relative bg-white">
                  <div className="max-w-4xl mx-auto text-center px-4">
                    <h1 className={`text-4xl md:text-5xl font-bold mb-6 text-${theme.primaryColor}`}>
                      Welcome to {business.businessName}
                    </h1>
                    <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
                      Experience exceptional professional services tailored to your needs. 
                      Book your appointment today for a great experience.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                      <Button 
                        size="lg" 
                        className="gap-2"
                        onClick={() => navigate(businessId 
                          ? `/customer-portal/new-appointment?businessId=${businessId}` 
                          : "/customer-portal/new-appointment")}
                      >
                        <Calendar className="h-5 w-5" />
                        Book Appointment
                      </Button>
                      <Button 
                        variant="outline" 
                        size="lg"
                        className="gap-2"
                        onClick={() => navigate(businessId 
                          ? `/customer-portal/services?businessId=${businessId}` 
                          : "/customer-portal/services")}
                      >
                        <Heart className="h-5 w-5" />
                        View Services
                      </Button>
                    </div>
                  </div>
                </section>

                {/* Featured Services */}
                <section className="max-w-5xl mx-auto px-4">
                  <div className="text-center mb-10">
                    <h2 className="text-3xl font-bold mb-4">Our Services</h2>
                    <p className="text-muted-foreground">Discover our range of professional services</p>
                  </div>
                  
                  <div className="grid gap-6 md:grid-cols-3">
                    {featuredServices.map((service) => (
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
                            variant="secondary"
                            className="w-full"
                            onClick={() => navigate(businessId 
                              ? `/customer-portal/new-appointment?businessId=${businessId}&serviceId=${service.id}` 
                              : `/customer-portal/new-appointment?serviceId=${service.id}`)}
                          >
                            Book Now
                          </Button>
                        </CardFooter>
                      </Card>
                    ))}
                  </div>
                  
                  {services?.length > 3 && (
                    <div className="mt-8 text-center">
                      <Button 
                        variant="outline"
                        onClick={() => navigate(businessId 
                          ? `/customer-portal/services?businessId=${businessId}` 
                          : "/customer-portal/services")}
                      >
                        View All Services
                      </Button>
                    </div>
                  )}
                </section>
                
                {/* Why Choose Us */}
                <section className="bg-gray-50 py-16">
                  <div className="max-w-5xl mx-auto px-4">
                    <div className="text-center mb-10">
                      <h2 className="text-3xl font-bold mb-4">Why Choose Us</h2>
                      <p className="text-muted-foreground">Experience the difference at {business.businessName}</p>
                    </div>
                    
                    <div className="grid gap-6 md:grid-cols-3">
                      <Card>
                        <CardHeader className="text-center">
                          <div className="w-12 h-12 mx-auto bg-primary/10 rounded-full flex items-center justify-center mb-3">
                            <BadgeCheck className="h-6 w-6 text-primary" />
                          </div>
                          <CardTitle>Professional Staff</CardTitle>
                        </CardHeader>
                        <CardContent className="text-center">
                          <p className="text-muted-foreground">
                            Our team of certified professionals is dedicated to providing the highest quality services.
                          </p>
                        </CardContent>
                      </Card>
                      
                      <Card>
                        <CardHeader className="text-center">
                          <div className="w-12 h-12 mx-auto bg-primary/10 rounded-full flex items-center justify-center mb-3">
                            <Star className="h-6 w-6 text-primary" />
                          </div>
                          <CardTitle>Premium Products</CardTitle>
                        </CardHeader>
                        <CardContent className="text-center">
                          <p className="text-muted-foreground">
                            We use only the highest quality products to ensure the best results for our clients.
                          </p>
                        </CardContent>
                      </Card>
                      
                      <Card>
                        <CardHeader className="text-center">
                          <div className="w-12 h-12 mx-auto bg-primary/10 rounded-full flex items-center justify-center mb-3">
                            <Heart className="h-6 w-6 text-primary" />
                          </div>
                          <CardTitle>Customer Satisfaction</CardTitle>
                        </CardHeader>
                        <CardContent className="text-center">
                          <p className="text-muted-foreground">
                            Your satisfaction is our priority. We strive to exceed your expectations with every visit.
                          </p>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                </section>
                
                {/* Testimonials */}
                <section className="max-w-5xl mx-auto px-4">
                  <div className="text-center mb-10">
                    <h2 className="text-3xl font-bold mb-4">What Our Clients Say</h2>
                    <p className="text-muted-foreground">Read testimonials from our satisfied customers</p>
                  </div>
                  
                  <div className="grid gap-6 md:grid-cols-3">
                    {testimonials.map((testimonial, index) => (
                      <Card key={index}>
                        <CardHeader>
                          <div className="flex items-center mb-2">
                            {[...Array(5)].map((_, i) => (
                              <Star 
                                key={i} 
                                className={`h-4 w-4 ${i < testimonial.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`} 
                              />
                            ))}
                          </div>
                          <CardTitle className="text-lg">{testimonial.name}</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="italic text-muted-foreground">"{testimonial.comment}"</p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </section>
                
                {/* CTA */}
                <section className="bg-primary text-white py-16">
                  <div className="max-w-3xl mx-auto text-center px-4">
                    <h2 className="text-3xl font-bold mb-6">Ready to Experience Our Services?</h2>
                    <p className="text-lg opacity-90 mb-8">
                      Book your appointment today and discover why our clients love {business.businessName}.
                    </p>
                    <Button 
                      size="lg" 
                      variant="secondary"
                      className="gap-2"
                      onClick={() => navigate(businessId 
                        ? `/customer-portal/new-appointment?businessId=${businessId}` 
                        : "/customer-portal/new-appointment")}
                    >
                      <Calendar className="h-5 w-5" />
                      Book Your Appointment
                    </Button>
                  </div>
                </section>
                
                {/* Business Location Map */}
                <section className="max-w-5xl mx-auto px-4 py-8">
                  <div className="text-center mb-10">
                    <h2 className="text-3xl font-bold mb-4">Visit Us</h2>
                    <p className="text-muted-foreground">Find us at our convenient location</p>
                  </div>
                  <div className="max-w-3xl mx-auto">
                    <BusinessMap business={business} />
                  </div>
                </section>
              </div>
            ) : (
              <div className="animate-pulse space-y-6 py-8">
                <div className="h-8 bg-gray-200 rounded w-1/3 mx-auto"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto"></div>
                <div className="h-64 bg-gray-200 rounded mx-auto"></div>
              </div>
            )}
          </TabsContent>
          
          {/* Services Tab */}
          <TabsContent value="services">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {services?.map((service) => (
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
                      onClick={() => navigate(businessId 
                        ? `/customer-portal/new-appointment?businessId=${businessId}&serviceId=${service.id}` 
                        : `/customer-portal/new-appointment?serviceId=${service.id}`)}
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
                    <Calendar className="w-8 h-8 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-2">Our New Booking Experience</h3>
                    <p className="text-muted-foreground max-w-md mx-auto">
                      We've improved our appointment booking system to make scheduling easier for you.
                    </p>
                  </div>
                  <Button 
                    size="lg" 
                    onClick={() => navigate(businessId 
                      ? `/customer-portal/new-appointment?businessId=${businessId}` 
                      : "/customer-portal/new-appointment")}
                    className="mt-4"
                  >
                    Start Booking Process
                  </Button>
                </div>
              </CardContent>
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
                <Button onClick={() => navigate(businessId 
                  ? `/customer-portal/my-appointments?businessId=${businessId}` 
                  : "/customer-portal/my-appointments")}
                  className="w-full"
                >
                  Find My Appointments
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* About Tab */}
          <TabsContent value="about">
            <Card>
              <CardHeader>
                <CardTitle>About Us</CardTitle>
                <CardDescription>Learn more about our business</CardDescription>
              </CardHeader>
              <CardContent>
                <p>
                  {business?.businessName || 'Our business'} is dedicated to providing the highest quality professional services in a comfortable and welcoming environment.
                </p>
                <p className="mt-4">
                  Located in {business?.city || 'the heart of the city'}, we've been serving our community with passion and dedication.
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
        
        <div className="mt-12 text-center">
          <p className="text-muted-foreground mb-6">
            Need help? Contact us at <span className="text-primary">
              {business?.email || 'contact@example.com'}
            </span> or call <span className="text-primary">
              {business?.phone || '+1 555-123-4567'}
            </span>
          </p>
          <Button variant="outline" onClick={() => navigate("/")}>
            Business Login
          </Button>
        </div>
      </div>
    </CustomerPortalLayout>
  );
}