import { Link, useLocation } from "wouter";
import { User } from "@shared/schema";
import { Home, Calendar, Store, Info, Menu, Clock, UserCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface BusinessHeaderProps {
  business: Omit<User, "password">;
  slug: string;
  currentPath: string;
}

export default function BusinessHeader({ business, slug, currentPath }: BusinessHeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState("home");

  // Define the navigation items for business websites
  const navItems = [
    { name: "Home", path: `/${slug}`, value: "home", icon: <Home className="h-4 w-4 mr-2" /> },
    { name: "Our Services", path: `/${slug}/store`, value: "services", icon: <Store className="h-4 w-4 mr-2" /> },
    { name: "Book Appointment", path: `/${slug}/schedule`, value: "book", icon: <Calendar className="h-4 w-4 mr-2" /> },
    { name: "My Appointments", path: `/${slug}?tab=my-appointments`, value: "my-appointments", icon: <Clock className="h-4 w-4 mr-2" /> },
  ];

  // Determine the active path
  const getActivePath = (path: string) => {
    if (path === `/${slug}` && currentPath === `/${slug}`) {
      return true;
    }
    return currentPath.startsWith(path);
  };
  
  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };
  
  // Determine which tab should be active based on the current path
  useEffect(() => {
    if (currentPath.includes('/schedule')) {
      setActiveTab('book');
    } else if (currentPath.includes('/store')) {
      setActiveTab('services');
    } else if (currentPath.includes('/about')) {
      setActiveTab('about');
    } else if (currentPath.includes('?tab=my-appointments')) {
      setActiveTab('my-appointments');
    } else {
      setActiveTab('home');
    }
  }, [currentPath]);
  
  // Handle tab change 
  const handleTabChange = (value: string) => {
    setActiveTab(value);
    
    // Map tab values to paths
    switch (value) {
      case 'home':
        setLocation(`/${slug}`);
        break;
      case 'services':
        setLocation(`/${slug}/store`);
        break;
      case 'book':
        setLocation(`/${slug}/schedule`);
        break;
      case 'my-appointments':
        setLocation(`/${slug}?tab=my-appointments`);
        break;
      case 'about':
        setLocation(`/${slug}/about`);
        break;
      default:
        setLocation(`/${slug}`);
    }
  };

  return (
    <header className="bg-white shadow">
      <div className="mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            {/* Logo and Business Name */}
            <div className="flex-shrink-0 flex items-center">
              <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center text-white font-bold text-xl mr-3">
                {business.businessName?.substring(0, 1).toUpperCase() || "B"}
              </div>
              <h1 className="text-xl font-bold text-gray-900">
                {business.businessName}
              </h1>
            </div>
            
            {/* Desktop Navigation with Tabs */}
            <div className="hidden md:ml-6 md:flex md:items-center">
              <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
                <TabsList>
                  {navItems.map((item) => (
                    <TabsTrigger key={item.value} value={item.value} className="flex items-center gap-1.5">
                      {item.icon}
                      {item.name}
                    </TabsTrigger>
                  ))}
                </TabsList>
              </Tabs>
            </div>
          </div>
          
          {/* Mobile menu button */}
          <div className="-mr-2 flex items-center md:hidden">
            <Button 
              variant="ghost" 
              size="icon"
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500"
              onClick={toggleMobileMenu}
            >
              <span className="sr-only">Open main menu</span>
              <Menu className="h-6 w-6" />
            </Button>
          </div>
        </div>
      </div>
      
      {/* Mobile menu, show/hide based on menu state */}
      <div className={`md:hidden ${mobileMenuOpen ? 'block' : 'hidden'}`} id="mobile-menu">
        <div className="pt-2 pb-3 space-y-1">
          {navItems.map((item) => (
            <button
              key={item.path}
              onClick={() => {
                handleTabChange(item.value);
                setMobileMenuOpen(false);
              }}
              className={cn(
                "w-full text-left block pl-3 pr-4 py-2 border-l-4 text-base font-medium",
                activeTab === item.value
                  ? "bg-primary-50 border-primary-500 text-primary-700"
                  : "border-transparent text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700"
              )}
            >
              <div className="flex items-center">
                {item.icon}
                {item.name}
              </div>
            </button>
          ))}
        </div>
      </div>
    </header>
  );
}