import { User, Service } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock, DollarSign, BadgeCheck, Calendar, Heart, Star, Sparkles, User as UserIcon } from "lucide-react";
import { useLocation } from "wouter";
import { BusinessMap } from "@/components/maps/BusinessMap";

interface HomePageProps {
  business: Omit<User, "password">;
  services: Service[];
  slug: string;
}

export default function HomePage({ business, services, slug }: HomePageProps) {
  const [, setLocation] = useLocation();

  // Display only a subset of services on homepage
  const featuredServices = services?.slice(0, 3) || [];

  // Customer testimonials
  const testimonials = [
    {
      name: "Carolina Herrera",
      comment: "Amazing service! The staff was professional and I loved my new look.",
      rating: 5
    },
    {
      name: "Juan Mendez",
      comment: "Always a great experience. I've been coming here for over a year and I'm always satisfied.",
      rating: 5
    },
    {
      name: "Andrea Fuentes",
      comment: "Very satisfied with the results. Will definitely come back again.",
      rating: 4
    }
  ];

  return (
    <div className="space-y-16 py-6">
      {/* Hero Section */}
      <section className="relative py-12 overflow-hidden">
        <div className="absolute inset-0 opacity-5" 
          style={{ 
            backgroundImage: 'radial-gradient(var(--primary) 1px, transparent 1px), radial-gradient(var(--secondary) 1px, transparent 1px)',
            backgroundSize: '40px 40px',
            backgroundPosition: '0 0, 20px 20px'
          }}
        />
        <div 
          className="absolute top-0 left-0 w-full h-40 opacity-20"
          style={{ 
            background: 'linear-gradient(to bottom, var(--primary) 0%, transparent 100%)',
            clipPath: 'ellipse(80% 60% at 50% 0%)'
          }}
        />
        <div 
          className="absolute bottom-0 right-0 w-full h-40 opacity-20"
          style={{ 
            background: 'linear-gradient(to top, var(--secondary) 0%, transparent 100%)',
            clipPath: 'ellipse(80% 60% at 50% 100%)'
          }}
        />
        <div className="max-w-4xl mx-auto text-center px-4 relative z-10">
          <h1 className="text-4xl md:text-5xl font-bold mb-6 relative">
            <span className="relative z-10 text-foreground">Welcome to {business.businessName}</span>
            <div 
              className="absolute inset-0 opacity-80 blur-[1px] -z-10"
              style={{ 
                background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                color: 'transparent'
              }}
            >
              Welcome to {business.businessName}
            </div>
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Experience exceptional beauty and wellness services tailored to your needs. 
            Book your appointment today for a rejuvenating experience.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              className="gap-2 shadow-sm hover:shadow-md transition-all duration-300 bg-gradient-to-r from-primary to-primary/90"
              onClick={() => window.location.href = `/customer-portal/new-appointment?businessId=${business.id}`}
            >
              <Calendar className="h-5 w-5" />
              Book Appointment
            </Button>
            <Button 
              variant="outline" 
              size="lg"
              className="gap-2 shadow-sm hover:shadow-md transition-all duration-300 border-1"
              onClick={() => setLocation(`/${slug}/store`)}
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
          <h2 className="text-3xl font-bold mb-4 relative inline-block">
            <span className="relative z-10">Our Services</span>
            <div 
              className="absolute bottom-0 left-0 w-full h-1 rounded-full opacity-70"
              style={{ background: 'linear-gradient(90deg, var(--primary), var(--secondary))' }}
            ></div>
          </h2>
          <p className="text-muted-foreground">Discover our range of professional services</p>
        </div>
        
        <div className="grid gap-6 md:grid-cols-3">
          {featuredServices.map((service) => (
            <Card key={service.id} className="overflow-hidden group transition-all duration-300 hover:shadow-lg">
              <div 
                className="h-1.5 w-full transition-all duration-300 group-hover:h-2"
                style={{ 
                  background: `linear-gradient(90deg, ${service.color || 'var(--primary)'}, var(--secondary))` 
                }}
              ></div>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div 
                    className="w-10 h-10 rounded-full flex items-center justify-center" 
                    style={{ backgroundColor: `${service.color || 'var(--primary)'}20` }}
                  >
                    <Sparkles className="h-5 w-5" style={{ color: service.color || 'var(--primary)' }} />
                  </div>
                  <div>
                    <CardTitle>{service.name}</CardTitle>
                    <CardDescription>Professional service</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="mb-4 text-sm">{service.description}</p>
                <div className="flex justify-between text-sm bg-muted/30 p-2 rounded-md">
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4 text-primary" />
                    <span>{service.duration} mins</span>
                  </div>
                  <div className="flex items-center gap-1 font-medium">
                    <DollarSign className="h-4 w-4 text-primary" />
                    <span>${service.price}</span>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button 
                  className="w-full transition-all duration-300 group-hover:bg-primary group-hover:text-primary-foreground"
                  onClick={() => window.location.href = `/customer-portal/new-appointment?businessId=${business.id}&serviceId=${service.id}`}
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
              onClick={() => setLocation(`/${slug}/store`)}
            >
              View All Services
            </Button>
          </div>
        )}
      </section>
      
      {/* Why Choose Us */}
      <section className="bg-background py-16">
        <div className="max-w-5xl mx-auto px-4">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold mb-4 relative inline-block">
              <span className="relative z-10">Why Choose Us</span>
              <div 
                className="absolute bottom-0 left-0 w-full h-1 rounded-full opacity-70"
                style={{ background: 'linear-gradient(90deg, var(--primary), var(--secondary))' }}
              ></div>
            </h2>
            <p className="text-muted-foreground">Experience the difference at {business.businessName}</p>
          </div>
          
          <div className="grid gap-6 md:grid-cols-3">
            <Card>
              <CardHeader className="text-center">
                <div className="w-12 h-12 mx-auto bg-primary/20 rounded-full flex items-center justify-center mb-3">
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
                <div className="w-12 h-12 mx-auto bg-secondary/20 rounded-full flex items-center justify-center mb-3">
                  <Star className="h-6 w-6 text-secondary" />
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
                <div className="w-12 h-12 mx-auto bg-accent/20 rounded-full flex items-center justify-center mb-3">
                  <Heart className="h-6 w-6 text-accent" />
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
          <h2 className="text-3xl font-bold mb-4 relative inline-block">
            <span className="relative z-10">What Our Clients Say</span>
            <div 
              className="absolute bottom-0 left-0 w-full h-1 rounded-full opacity-70"
              style={{ background: 'linear-gradient(90deg, var(--primary), var(--secondary))' }}
            ></div>
          </h2>
          <p className="text-muted-foreground">Read testimonials from our satisfied customers</p>
        </div>
        
        <div className="grid gap-6 md:grid-cols-3">
          {testimonials.map((testimonial, index) => (
            <Card key={index} className="overflow-hidden group transition-all duration-300 hover:shadow-lg">
              <div 
                className="h-1 w-full bg-gradient-to-r from-primary/30 to-secondary/30 group-hover:h-1.5 transition-all duration-300"
              ></div>
              <CardHeader className="pb-2">
                <div className="flex items-center mb-3 bg-muted/40 rounded-full w-fit px-3 py-1">
                  {[...Array(5)].map((_, i) => (
                    <Star 
                      key={i} 
                      className={`h-4 w-4 ${i < testimonial.rating ? 'text-primary fill-primary' : 'text-muted-foreground'}`} 
                      fill={i < testimonial.rating ? "currentColor" : "none"}
                    />
                  ))}
                </div>
                <CardTitle className="text-lg flex items-center gap-2">
                  <div className="rounded-full bg-secondary/10 p-1">
                    <div className="rounded-full bg-secondary/20 p-0.5">
                      <UserIcon className="h-5 w-5 text-secondary" />
                    </div>
                  </div>
                  {testimonial.name}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="relative">
                  <span className="absolute top-0 left-0 text-4xl opacity-20 text-primary">"</span>
                  <p className="italic text-muted-foreground pt-2 pl-5">{testimonial.comment}</p>
                  <span className="absolute bottom-0 right-0 text-4xl opacity-20 text-primary">"</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
      
      {/* CTA */}
      <section className="relative py-20 text-primary-foreground overflow-hidden">
        <div 
          className="absolute inset-0 z-0" 
          style={{ 
            background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
          }}
        />
        <div 
          className="absolute inset-0 z-0 opacity-20" 
          style={{ 
            backgroundImage: 'radial-gradient(circle at 25px 25px, rgba(255,255,255,0.2) 2%, transparent 0%), radial-gradient(circle at 75px 75px, rgba(255,255,255,0.2) 2%, transparent 0%)',
            backgroundSize: '100px 100px',
          }}
        />
        <div 
          className="absolute top-0 left-0 right-0 h-12 bg-gradient-to-b from-white/10 to-transparent"
        />
        <div 
          className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-black/10 to-transparent"
        />
        <div className="max-w-3xl mx-auto text-center px-4 relative z-10">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            <span className="relative">
              Ready to Experience Our Services?
              <div className="absolute -bottom-1 left-0 w-full h-1 bg-white/30 rounded-full"></div>
            </span>
          </h2>
          <p className="text-lg opacity-90 mb-8 max-w-xl mx-auto">
            Book your appointment today and discover why our clients love {business.businessName}.
          </p>
          <Button 
            size="lg" 
            variant="secondary"
            className="gap-2 shadow-md hover:shadow-lg transform hover:-translate-y-1 transition-all duration-300"
            onClick={() => window.location.href = `/customer-portal/new-appointment?businessId=${business.id}`}
          >
            <Calendar className="h-5 w-5" />
            Book Your Appointment
          </Button>
        </div>
      </section>
      
      {/* Business Location Map */}
      <section className="max-w-5xl mx-auto px-4 py-8">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold mb-4 relative inline-block">
            <span className="relative z-10">Visit Us</span>
            <div 
              className="absolute bottom-0 left-0 w-full h-1 rounded-full opacity-70"
              style={{ background: 'linear-gradient(90deg, var(--primary), var(--secondary))' }}
            ></div>
          </h2>
          <p className="text-muted-foreground">Find us at our convenient location</p>
        </div>
        <div className="max-w-3xl mx-auto">
          <BusinessMap business={business} />
        </div>
      </section>
    </div>
  );
}