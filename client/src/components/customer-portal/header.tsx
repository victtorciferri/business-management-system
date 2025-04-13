import { User } from "@shared/schema";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { 
  CalendarIcon, 
  ClipboardListIcon, 
  HomeIcon, 
  ShoppingBagIcon, 
  InfoIcon,
  UserCircle
} from "lucide-react";

interface CustomerPortalHeaderProps {
  business?: Omit<User, "password">;
  businessId?: string | null;
  accessToken?: string | null;
  currentPath: string;
}

export default function CustomerPortalHeader({ 
  business, 
  businessId, 
  accessToken, 
  currentPath 
}: CustomerPortalHeaderProps) {
  const [_, navigate] = useLocation();
  
  // Helper function to build URL with query parameters
  const buildUrl = (path: string) => {
    const params = [];
    if (accessToken) params.push(`token=${accessToken}`);
    if (businessId) params.push(`businessId=${businessId}`);
    return path + (params.length ? `?${params.join('&')}` : '');
  };
  
  // Define navigation items
  const navItems = [
    { 
      label: "Home", 
      icon: <HomeIcon className="h-4 w-4 mr-2" />,
      path: "/customer-portal",
      isActive: currentPath === "/customer-portal" 
    },
    { 
      label: "New Appointment", 
      icon: <CalendarIcon className="h-4 w-4 mr-2" />,
      path: "/customer-portal/new-appointment",
      isActive: currentPath === "/customer-portal/new-appointment"
    },
    { 
      label: "My Appointments", 
      icon: <ClipboardListIcon className="h-4 w-4 mr-2" />,
      path: "/customer-portal/my-appointments",
      isActive: currentPath === "/customer-portal/my-appointments"
    },
    { 
      label: "Services", 
      icon: <ShoppingBagIcon className="h-4 w-4 mr-2" />,
      path: "/customer-portal/services",
      isActive: currentPath === "/customer-portal/services"
    }
  ];
  
  return (
    <header className="bg-white shadow">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center py-4">
          {/* Logo and Business Name */}
          <div className="flex items-center mb-4 md:mb-0">
            <Link href={buildUrl("/customer-portal")}>
              <a className="flex items-center">
                <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center text-white font-bold text-xl mr-3">
                  {business?.businessName?.substring(0, 1).toUpperCase() || "S"}
                </div>
                <h1 className="text-xl font-bold text-gray-900">
                  {business?.businessName || 'Salon Elegante'} <span className="text-primary font-normal">Customer Portal</span>
                </h1>
              </a>
            </Link>
          </div>
          
          {/* Navigation */}
          <nav className="flex flex-wrap gap-2">
            {navItems.map((item) => (
              <Button
                key={item.path}
                variant={item.isActive ? "default" : "ghost"}
                size="sm"
                className="flex items-center"
                onClick={() => navigate(buildUrl(item.path))}
              >
                {item.icon}
                {item.label}
              </Button>
            ))}
          </nav>
        </div>
      </div>
    </header>
  );
}