import { User, Service } from "@shared/schema";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Clock, DollarSign } from "lucide-react";

interface StorePageProps {
  business: Omit<User, "password">;
  services: Service[];
  slug: string;
}

export default function StorePage({ business, services, slug }: StorePageProps) {
  return (
    <div className="container mx-auto py-10">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold mb-4">Our Services</h1>
          <p className="text-lg text-muted-foreground max-w-xl mx-auto">
            We offer a range of professional beauty and wellness services tailored to your needs
          </p>
        </div>
        
        <div className="grid gap-6 md:grid-cols-2">
          {services?.map((service) => (
            <Card key={service.id} className="overflow-hidden">
              <div className="h-2" style={{ backgroundColor: service.color }}></div>
              <CardHeader>
                <CardTitle>{service.name}</CardTitle>
                <CardDescription>Professional service</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="mb-4">{service.description}</p>
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
                  onClick={() => {
                    // Logic to navigate to book page with this service pre-selected
                    window.location.href = `/${slug}/schedule?service=${service.id}`;
                  }}
                >
                  Book This Service
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
        
        <div className="mt-16 text-center">
          <h2 className="text-2xl font-bold mb-4">Ready to Book?</h2>
          <p className="text-muted-foreground mb-6">
            Choose a service above or view all available appointments
          </p>
          <Button 
            variant="outline" 
            size="lg"
            onClick={() => {
              window.location.href = `/${slug}/schedule`;
            }}
          >
            View All Appointment Times
          </Button>
        </div>
      </div>
    </div>
  );
}