import { User, Service } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock, DollarSign, BadgeCheck, Calendar, Heart, Star } from "lucide-react";
import { useLocation } from "wouter";
import { BusinessMap } from "@/components/maps/BusinessMap";
import { useLanguage } from "@/contexts/LanguageContext";

interface HomePageProps {
  business: Omit<User, "password">;
  services: Service[];
  slug: string;
}

export default function HomePage({ business, services, slug }: HomePageProps) {
  const [, setLocation] = useLocation();
  const { t } = useLanguage();

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
      <section className="relative">
        <div className="max-w-4xl mx-auto text-center px-4">
          <h1 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-primary to-indigo-500 text-transparent bg-clip-text">
            {t('homepage.welcome')} {business.businessName}
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            {t('homepage.experience')} 
            {t('homepage.book_today')}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              className="gap-2"
              onClick={() => window.location.href = `/customer-portal/new-appointment?businessId=${business.id}`}
            >
              <Calendar className="h-5 w-5" />
              {t('homepage.book_appointment')}
            </Button>
            <Button 
              variant="outline" 
              size="lg"
              className="gap-2"
              onClick={() => setLocation(`/${slug}/store`)}
            >
              <Heart className="h-5 w-5" />
              {t('homepage.view_services')}
            </Button>
          </div>
        </div>
      </section>

      {/* Featured Services */}
      <section className="max-w-5xl mx-auto px-4">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold mb-4">{t('common.services')}</h2>
          <p className="text-muted-foreground">Discover our range of professional services</p>
        </div>
        
        <div className="grid gap-6 md:grid-cols-3">
          {featuredServices.map((service) => (
            <Card key={service.id} className="overflow-hidden">
              <div className="h-2" style={{ backgroundColor: service.color }}></div>
              <CardHeader>
                <CardTitle>{service.name}</CardTitle>
                <CardDescription>{t('services.professional_service')}</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="mb-4 text-sm">{service.description}</p>
                <div className="flex justify-between text-sm">
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span>{service.duration} {t('services.minutes')}</span>
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
                  onClick={() => window.location.href = `/customer-portal/new-appointment?businessId=${business.id}&serviceId=${service.id}`}
                >
                  {t('services.book_now')}
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
              {t('homepage.view_services')}
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
          <h2 className="text-3xl font-bold mb-4">{t('homepage.testimonials')}</h2>
          <p className="text-muted-foreground">{t('homepage.testimonials_desc')}</p>
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
            {t('homepage.book_discover')} {business.businessName}.
          </p>
          <Button 
            size="lg" 
            variant="secondary"
            className="gap-2"
            onClick={() => window.location.href = `/customer-portal/new-appointment?businessId=${business.id}`}
          >
            <Calendar className="h-5 w-5" />
            {t('homepage.book_appointment')}
          </Button>
        </div>
      </section>
      
      {/* Business Location Map */}
      <section className="max-w-5xl mx-auto px-4 py-8">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold mb-4">{t('homepage.visit_us')}</h2>
          <p className="text-muted-foreground">{t('homepage.find_location')}</p>
        </div>
        <div className="max-w-3xl mx-auto">
          <BusinessMap business={business} />
        </div>
      </section>
    </div>
  );
}