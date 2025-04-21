import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { type Service } from "@shared/schema";
import { ArrowLeftIcon, Clock, DollarSign } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import CustomerPortalLayout from "@/components/customer-portal/layout";
import { useBusinessContext } from "@/contexts/BusinessContext";
import { useLanguage } from "@/contexts/LanguageContext";

export default function CustomerServices() {
  const [location, navigate] = useLocation();
  const params = new URLSearchParams(window.location.search);
  const accessToken = params.get("token");
  const businessId = params.get("businessId");
  const { t } = useLanguage();
  
  // Get services and business data from context
  const { business, services: contextServices, loading } = useBusinessContext();
  
  // Fallback to API query if not available in context
  const { data: servicesData, isLoading: isServicesLoading } = useQuery({
    queryKey: ['/api/services'],
    enabled: !contextServices || contextServices.length === 0
  });
  
  // Use context services if available, or fallback to API results
  const services = contextServices || servicesData;
  const isLoading = loading || isServicesLoading;
  
  return (
    <CustomerPortalLayout 
      businessId={businessId} 
      accessToken={accessToken}
    >
      <div className="mb-8 flex items-center">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => navigate(accessToken ? `/customer-portal?token=${accessToken}` : "/customer-portal")} 
          className="mr-2"
        >
          <ArrowLeftIcon className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t('common.services')}</h1>
          <p className="text-muted-foreground">Browse our available services and choose the one that's right for you</p>
        </div>
      </div>
      
      {isLoading ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="overflow-hidden">
              <CardHeader className="pb-2">
                <Skeleton className="h-6 w-3/4 mb-2" />
                <Skeleton className="h-4 w-1/2" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-20 w-full mb-4" />
                <div className="flex justify-between">
                  <Skeleton className="h-4 w-1/4" />
                  <Skeleton className="h-4 w-1/4" />
                </div>
              </CardContent>
              <CardFooter>
                <Skeleton className="h-9 w-full" />
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {services?.filter((service: Service) => service.active).map((service: Service) => (
            <Card key={service.id} className="overflow-hidden">
              <div className="h-2 bg-gradient-to-r" style={{ backgroundColor: service.color }}></div>
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
                  className="w-full" 
                  onClick={() => navigate(
                    accessToken 
                      ? `/customer-portal/book?serviceId=${service.id}&token=${accessToken}` 
                      : `/customer-portal/book?serviceId=${service.id}`
                  )}
                >
                  {t('services.book_now')}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </CustomerPortalLayout>
  );
}