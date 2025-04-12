import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { CalendarIcon, ClipboardListIcon, ShoppingBagIcon, SearchIcon, CheckIcon } from "lucide-react";

export default function CustomerPortal() {
  const [location, navigate] = useLocation();
  const params = new URLSearchParams(window.location.search);
  const accessToken = params.get("token");
  const businessId = params.get("businessId");
  
  return (
    <div className="container mx-auto py-10">
      <div className="flex flex-col items-center mb-10 text-center">
        <h1 className="text-4xl font-bold tracking-tight mb-4">
          <span className="bg-gradient-to-r from-primary to-indigo-500 text-transparent bg-clip-text">
            Salon Elegante
          </span>
        </h1>
        <p className="text-lg text-muted-foreground max-w-xl mb-8">
          Book your next appointment online and enjoy the best beauty and wellness services
        </p>
        
        {/* Main call to action buttons */}
        <div className="grid gap-6 md:grid-cols-2 max-w-3xl w-full mb-12">
          <Card className="transition-all hover:shadow-md border-2 border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center justify-center gap-2 text-xl">
                <SearchIcon className="h-6 w-6 text-primary" />
                Look for Appointment
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="mb-6 text-muted-foreground">
                Already have an appointment? Check your appointment details by entering your email.
              </p>
              <Button 
                className="w-full text-lg py-6" 
                size="lg"
                onClick={() => navigate(businessId 
                  ? `/customer-portal/zero-friction?businessId=${businessId}` 
                  : "/customer-portal/zero-friction")}
              >
                Find My Appointment
              </Button>
            </CardContent>
          </Card>
          
          <Card className="transition-all hover:shadow-md border-2 border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center justify-center gap-2 text-xl">
                <CalendarIcon className="h-6 w-6 text-primary" />
                New Appointment
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="mb-6 text-muted-foreground">
                Schedule a new appointment with our simple booking process.
              </p>
              <Button 
                className="w-full text-lg py-6" 
                size="lg"
                onClick={() => navigate(businessId 
                  ? `/customer-portal/new-appointment?businessId=${businessId}` 
                  : "/customer-portal/new-appointment")}
              >
                Book Now
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
      
      <div className="grid gap-6 md:grid-cols-3">
        <Card className="transition-all hover:shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShoppingBagIcon className="h-5 w-5 text-primary" />
              Our Services
            </CardTitle>
            <CardDescription>
              Explore our range of services
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="mb-4 text-sm">
              Browse through our wide range of professional services tailored to meet your needs.
            </p>
            <Button className="w-full" onClick={() => {
              let url = "/customer-portal/services";
              const params = [];
              if (accessToken) params.push(`token=${accessToken}`);
              if (businessId) params.push(`businessId=${businessId}`);
              if (params.length > 0) url += `?${params.join('&')}`;
              navigate(url);
            }}>
              View Services
            </Button>
          </CardContent>
        </Card>
        
        <Card className="transition-all hover:shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ClipboardListIcon className="h-5 w-5 text-primary" />
              My Appointments
            </CardTitle>
            <CardDescription>
              View and manage your appointments
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="mb-4 text-sm">
              Check the status of your upcoming appointments and view your appointment history.
            </p>
            <Button className="w-full" onClick={() => {
              let url = "/customer-portal/my-appointments";
              const params = [];
              if (accessToken) params.push(`token=${accessToken}`);
              if (businessId) params.push(`businessId=${businessId}`);
              if (params.length > 0) url += `?${params.join('&')}`;
              navigate(url);
            }}>
              View Appointments
            </Button>
          </CardContent>
        </Card>
        
        <Card className="transition-all hover:shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckIcon className="h-5 w-5 text-primary" />
              About Us
            </CardTitle>
            <CardDescription>
              Learn more about our salon
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="mb-4 text-sm">
              Discover our story, our team, and the high-quality services we provide to our clients.
            </p>
            <Button variant="outline" className="w-full" onClick={() => {
              let url = "/customer-portal/about";
              const params = [];
              if (accessToken) params.push(`token=${accessToken}`);
              if (businessId) params.push(`businessId=${businessId}`);
              if (params.length > 0) url += `?${params.join('&')}`;
              navigate(url);
            }}>
              Read More
            </Button>
          </CardContent>
        </Card>
      </div>
      
      <div className="mt-12 text-center">
        <p className="text-muted-foreground mb-6">Need help? Contact us at <span className="text-primary">contact@salonelegante.cl</span> or call <span className="text-primary">+56 9 9876 5432</span></p>
        <Button variant="outline" onClick={() => navigate("/")}>
          Business Login
        </Button>
      </div>
    </div>
  );
}