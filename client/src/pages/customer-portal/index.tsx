import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { CalendarIcon, ClipboardListIcon, ShoppingBagIcon } from "lucide-react";

export default function CustomerPortal() {
  const [location, navigate] = useLocation();
  const params = new URLSearchParams(window.location.search);
  const accessToken = params.get("token");
  
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
            <Button className="w-full" onClick={() => 
              navigate(accessToken 
                ? `/customer-portal/services?token=${accessToken}` 
                : "/customer-portal/services")
            }>
              View Services
            </Button>
          </CardContent>
        </Card>
        
        <Card className="transition-all hover:shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalendarIcon className="h-5 w-5 text-primary" />
              Book Appointment
            </CardTitle>
            <CardDescription>
              Schedule a new appointment
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="mb-4 text-sm">
              Easily book your next appointment with our convenient online scheduling system.
            </p>
            <Button className="w-full" onClick={() => 
              navigate(accessToken 
                ? `/customer-portal/book?token=${accessToken}` 
                : "/customer-portal/book")
            }>
              Book Now
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
            <Button className="w-full" onClick={() => navigate("/customer-portal/my-appointments")}>
              View Appointments
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