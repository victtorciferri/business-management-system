import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { format, addDays } from "date-fns";
import { Clock, CalendarIcon, DollarSign, CalendarPlus } from "lucide-react";
import { User, Service, Customer, Appointment } from "@shared/schema";
import { useTheme } from "@/contexts/ThemeContext";
import { applyTheme } from "@/utils/applyTheme";
import { useLanguage } from "@/contexts/LanguageContext";

// Import business components
import BusinessLayout from "@/components/business/layout";
import HomePage from "@/components/business/home-page";
import AboutPage from "@/components/business/about-page";
import StorePage from "@/components/business/store-page";
import { AvailabilityHints } from "@/components/customer-portal/availability-hints";

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
  const [location] = useLocation();
  const [activeTab, setActiveTab] = useState("home");
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    notes: ""
  });
  const [searchEmail, setSearchEmail] = useState("");
  
  // Access language context
  const { t } = useLanguage();
  
  // Access theme context
  const { theme, businessTheme, updateBusinessTheme } = useTheme();
  
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
  
  // Fetch the theme for this business
  const { data: themeData } = useQuery({
    queryKey: [`/api/business/${slug}/theme`],
    queryFn: async () => {
      console.log(`Fetching theme for business: ${slug}`);
      try {
        const response = await fetch(`/api/business/${slug}/theme`);
        if (!response.ok) {
          console.error(`Failed to fetch business theme: ${response.status} ${response.statusText}`);
          return null;
        }
        const data = await response.json();
        console.log(`Received theme data:`, data);
        return data;
      } catch (error) {
        console.error("Error fetching business theme:", error);
        return null;
      }
    },
    enabled: !!slug
  });
  
  // Fetch customer appointments if searching
  const { data: customers = [] } = useQuery<Customer[]>({
    queryKey: ['/api/customers'],
    enabled: activeTab === "my-appointments" && !!searchEmail
  });
  
  // Fetch appointments
  const { data: appointments = [] } = useQuery<Appointment[]>({
    queryKey: ['/api/appointments'],
    enabled: activeTab === "my-appointments" && !!searchEmail
  });
  
  // Find customer by email
  const customer = customers.find((c: Customer) => c.email === searchEmail);
  
  // Find appointments for customer
  const customerAppointments = appointments.filter(
    (a: Appointment) => customer && a.customerId === customer.id
  );
  
  // Apply the theme when it's loaded
  useEffect(() => {
    if (themeData?.theme) {
      console.log("Applying business theme:", themeData.theme);
      updateBusinessTheme(themeData.theme); // Use updateBusinessTheme instead of setTheme
      applyTheme(themeData.theme);
    }
  }, [themeData, updateBusinessTheme]);
  
  // Set the document title to the business name when data is loaded
  useEffect(() => {
    if (data?.business?.businessName) {
      const pageTitlePrefix = subPath && subPath !== "home" ? 
        `${subPath.charAt(0).toUpperCase() + subPath.slice(1)} - ` : "";
      document.title = `${pageTitlePrefix}${data.business.businessName} - AppointEase`;
    } else {
      document.title = "Business Portal - AppointEase";
    }
    
    // Set active tab based on subPath
    if (subPath) {
      switch (subPath) {
        case "about":
          setActiveTab("about");
          break;
        case "store":
          setActiveTab("store");
          break;
        default:
          setActiveTab("home");
      }
    }
  }, [data, subPath]);
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleServiceSelect = (service: Service) => {
    // Redirect to new appointment flow with context
    window.location.href = `/customer-portal/new-appointment?businessId=${business.id}&serviceId=${service.id}`;
  };
  
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Redirect to customer portal zero-friction page with email and businessId
    window.location.href = `/customer-portal/zero-friction?email=${searchEmail}&businessId=${business.id}`;
  };
  
  // Status badges
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'scheduled':
        return <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-medium">{t('appointments.status_scheduled')}</span>;
      case 'completed':
        return <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-medium">{t('appointments.status_completed')}</span>;
      case 'cancelled':
        return <span className="bg-red-100 text-red-800 px-2 py-1 rounded text-xs font-medium">{t('appointments.status_cancelled')}</span>;
      default:
        return <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded text-xs font-medium">{status}</span>;
    }
  };
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div>
        <span className="ml-3 text-muted-foreground">{t('common.loading')}</span>
      </div>
    );
  }
  
  if (error || !data) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <h1 className="text-3xl font-bold mb-4">{t('error.business_not_found')}</h1>
        <p className="text-lg text-muted-foreground mb-6">
          {t('error.business_not_exist')}
        </p>
        <Button onClick={() => window.history.back()}>{t('common.go_back')}</Button>
      </div>
    );
  }
  
  const { business, services } = data;
  
  return (
    <BusinessLayout business={business} slug={slug}>
      {/* Only show tabs on the main page, not with subpaths */}
      {!subPath ? (
        <div className="container mx-auto py-10">
          <div className="flex flex-col items-center mb-10 text-center">
            <h1 className="text-4xl font-bold tracking-tight mb-4">
              <span className="bg-gradient-to-r from-primary to-indigo-500 text-transparent bg-clip-text">
                {business.businessName}
              </span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-xl">
              {t('homepage.experience')}
            </p>
          </div>
          
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-6">
              <TabsTrigger value="home">{t('navigation.home')}</TabsTrigger>
              <TabsTrigger value="services">{t('navigation.services')}</TabsTrigger>
              <TabsTrigger value="store">{t('navigation.store')}</TabsTrigger>
              <TabsTrigger value="book">{t('navigation.book')}</TabsTrigger>
              <TabsTrigger value="my-appointments">{t('navigation.my_appointments')}</TabsTrigger>
              <TabsTrigger value="about">{t('navigation.about')}</TabsTrigger>
            </TabsList>
            
            {/* Home Tab */}
            <TabsContent value="home">
              <HomePage business={business} services={services} slug={slug} />
            </TabsContent>
            
            {/* Services Tab */}
            <TabsContent value="services">
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {services?.map((service: Service) => (
                  <Card key={service.id} className="overflow-hidden">
                    <div className="h-2" style={{ backgroundColor: (service.color as string) || "#cccccc" }}></div>
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
                        onClick={() => handleServiceSelect(service)}
                      >
                        {t('services.book_now')}
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
                  <CardTitle>{t('appointments.new_booking')}</CardTitle>
                  <CardDescription>{t('appointments.booking_description')}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center space-y-6 py-4">
                    <div className="mx-auto bg-primary/10 w-16 h-16 flex items-center justify-center rounded-full">
                      <CalendarPlus className="w-8 h-8 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold mb-2">{t('appointments.booking_experience')}</h3>
                      <p className="text-muted-foreground max-w-md mx-auto">
                        {t('appointments.booking_improved')}
                      </p>
                    </div>
                    <Button 
                      size="lg"
                      onClick={() => window.location.href = `/customer-portal/new-appointment?businessId=${business.id}`}
                      className="mt-4"
                    >
                      {t('appointments.start_booking')}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            {/* Store Tab */}
            <TabsContent value="store">
              <StorePage business={business} services={services} slug={slug} />
            </TabsContent>
            
            {/* About Us Tab */}
            <TabsContent value="about">
              <AboutPage business={business} slug={slug} />
            </TabsContent>
            

            
            {/* My Appointments Tab */}
            <TabsContent value="my-appointments">
              <Card>
                <CardHeader>
                  <CardTitle>{t('appointments.find_yours')}</CardTitle>
                  <CardDescription>{t('appointments.enter_email')}</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSearchSubmit} className="flex space-x-2">
                    <Input 
                      placeholder={t('appointments.email_placeholder')}
                      type="email"
                      value={searchEmail}
                      onChange={(e) => setSearchEmail(e.target.value)}
                      className="flex-1"
                    />
                    <Button onClick={() => window.location.href = `/customer-portal/my-appointments?email=${searchEmail}&businessId=${business.id}`}>
                      {t('appointments.find_button')}
                    </Button>
                  </form>
                  
                  {searchEmail && customer && customerAppointments && customerAppointments.length > 0 && (
                    <div className="mt-6">
                      <h3 className="text-lg font-medium mb-4">{t('appointments.your_scheduled')}</h3>
                      <div className="rounded-md border">
                        <div className="grid grid-cols-4 gap-4 p-4 font-medium border-b">
                          <div>{t('appointments.service')}</div>
                          <div>{t('appointments.date')}</div>
                          <div>{t('appointments.time')}</div>
                          <div>{t('appointments.status')}</div>
                        </div>
                        <div className="divide-y">
                          {customerAppointments.map((appointment: Appointment) => {
                            const appointmentDate = new Date(appointment.date);
                            return (
                              <div key={appointment.id} className="grid grid-cols-4 gap-4 p-4">
                                <div>{services?.find((s: Service) => s.id === appointment.serviceId)?.name}</div>
                                <div>{format(appointmentDate, 'MMM dd, yyyy')}</div>
                                <div>{format(appointmentDate, 'h:mm a')}</div>
                                <div>{getStatusBadge(appointment.status)}</div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {searchEmail && (!customer || !customerAppointments || customerAppointments.length === 0) && (
                    <div className="text-center py-8 mt-4">
                      <CalendarIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-xl font-medium mb-2">{t('appointments.none_found')}</h3>
                      <p className="text-muted-foreground mb-4">
                        {t('appointments.not_found_message')}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
          
          <div className="mt-12 text-center">
            <p className="text-muted-foreground mb-6">
              {t('footer.need_help')} <span className="text-primary">contact@{business.businessSlug}.cl</span> {t('footer.or_call')} <span className="text-primary">{business.phone || "+56 9 9876 5432"}</span>
            </p>
            <Button variant="outline" onClick={() => window.location.href = "/"}>
              {t('footer.business_login')}
            </Button>
          </div>
        </div>
      ) : (
        // When accessed with a subpath, render the appropriate content
        <>
          {subPath === "about" && <AboutPage business={business} slug={slug} />}
          {/* Removed old scheduling system */}
          {subPath === "store" && <StorePage business={business} services={services} slug={slug} />}
          {!["about", "store"].includes(subPath as string) && <HomePage business={business} services={services} slug={slug} />}
        </>
      )}
    </BusinessLayout>
  );
}