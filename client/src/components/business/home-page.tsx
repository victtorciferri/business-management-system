import { User, Service } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CalendarDays, Clock, DollarSign, ArrowRight, Star } from "lucide-react";
import { Link } from "wouter";

interface HomePageProps {
  business: Omit<User, "password">;
  services: Service[];
  slug: string;
}

export default function HomePage({ business, services, slug }: HomePageProps) {
  // Display featured services (up to 3)
  const featuredServices = services.slice(0, 3);
  
  return (
    <div className="space-y-12">
      {/* Hero Section */}
      <section className="py-12 md:py-16 bg-gradient-to-br from-primary-50 to-white rounded-xl">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-primary-600 to-primary-800">
            Welcome to {business.businessName}
          </h1>
          <p className="text-xl text-gray-700 mb-8 max-w-3xl mx-auto">
            Book appointments online with ease and discover our premium services tailored just for you.
          </p>
          <Button size="lg" asChild>
            <Link href={`/${slug}/schedule`}>
              Book an Appointment <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </section>

      {/* Featured Services */}
      <section>
        <div className="container mx-auto px-4">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold mb-4">Our Services</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              We offer a variety of professional services to meet your needs. Book your appointment today.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {featuredServices.map((service) => (
              <Card key={service.id} className="overflow-hidden">
                <div className="h-2 bg-gradient-to-r from-primary-400 to-primary-600"></div>
                <CardContent className="p-6">
                  <h3 className="text-xl font-bold mb-2 flex items-center">
                    <div 
                      className="w-3 h-3 rounded-full mr-2" 
                      style={{ backgroundColor: service.color || "#06b6d4" }}
                    ></div>
                    {service.name}
                  </h3>
                  <p className="text-gray-600 mb-4 line-clamp-2">{service.description}</p>
                  
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <div className="flex items-center text-sm text-gray-600">
                      <Clock className="w-4 h-4 mr-2 text-primary-500" />
                      {service.duration} minutes
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <DollarSign className="w-4 h-4 mr-2 text-primary-500" />
                      ${Number(service.price).toFixed(2)}
                    </div>
                  </div>
                  
                  <Button variant="outline" size="sm" className="w-full" asChild>
                    <Link href={`/${slug}/schedule?serviceId=${service.id}`}>
                      Book Now
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
            
            {/* If there are no services, show a placeholder */}
            {services.length === 0 && (
              <div className="col-span-1 md:col-span-3 text-center p-8 border rounded-lg bg-gray-50">
                <p className="text-gray-600">No services available at the moment.</p>
              </div>
            )}
          </div>
          
          {services.length > 3 && (
            <div className="text-center mt-8">
              <Button variant="outline" asChild>
                <Link href={`/${slug}/services`}>View All Services</Link>
              </Button>
            </div>
          )}
        </div>
      </section>
      
      {/* Testimonials/Reviews Section */}
      <section className="bg-gray-50 py-12 rounded-xl">
        <div className="container mx-auto px-4">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold mb-4">What Our Clients Say</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              We pride ourselves on providing exceptional service to all our clients.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex text-yellow-400 mb-3">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-current" />
                  ))}
                </div>
                <p className="text-gray-700 mb-4">
                  "Amazing service! I've been a customer for over a year and couldn't be happier."
                </p>
                <div className="font-medium">Maria S.</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex text-yellow-400 mb-3">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-current" />
                  ))}
                </div>
                <p className="text-gray-700 mb-4">
                  "The online booking system is so convenient. Saves me so much time!"
                </p>
                <div className="font-medium">Carlos R.</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex text-yellow-400 mb-3">
                  {[...Array(4)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-current" />
                  ))}
                  <Star className="h-4 w-4 text-gray-300" />
                </div>
                <p className="text-gray-700 mb-4">
                  "Professional staff and great atmosphere. Highly recommend!"
                </p>
                <div className="font-medium">Ana P.</div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="bg-primary-600 text-white py-12 md:py-16 rounded-xl">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Book Your Appointment?</h2>
          <p className="text-xl opacity-90 mb-8 max-w-2xl mx-auto">
            Schedule your appointment today and experience our exceptional services.
          </p>
          <Button size="lg" variant="secondary" asChild>
            <Link href={`/${slug}/schedule`}>
              Book Now <CalendarDays className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </section>
    </div>
  );
}