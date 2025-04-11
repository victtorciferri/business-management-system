import { Link, useLocation } from "wouter";
import { User } from "@shared/schema";
import { Menu, Bell, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";

interface LayoutProps {
  children: React.ReactNode;
  currentUser: User | null;
}

export default function Layout({ children, currentUser }: LayoutProps) {
  const [location] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { logout } = useAuth();

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };
  
  const handleLogout = async () => {
    await logout();
    window.location.href = '/auth';
  };

  // Different navigation items based on user role
  const businessNavItems = [
    { name: "Dashboard", path: "/" },
    { name: "Appointments", path: "/appointments" },
    { name: "Customers", path: "/customers" },
    { name: "Services", path: "/services" },
    { name: "Products", path: "/products" },
    { name: "Custom Domain", path: "/custom-domain" },
  ];
  
  const adminNavItems = [
    { name: "Admin Dashboard", path: "/admin" },
  ];
  
  // Select navigation items based on user role
  const navItems = currentUser?.role === 'admin' 
    ? adminNavItems 
    : businessNavItems;

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800">
      <header className="bg-white shadow">
        <div className="mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <h1 className="text-xl font-bold text-primary-600">AppointEase</h1>
              </div>
              <nav className="hidden sm:ml-6 sm:flex sm:space-x-8" aria-label="Main">
                {navItems.map((item) => (
                  <Link 
                    key={item.path} 
                    href={item.path}
                    className={
                      location === item.path
                        ? "border-primary-500 text-gray-900 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                        : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                    }
                  >
                    {item.name}
                  </Link>
                ))}
              </nav>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:items-center">
              <Button variant="ghost" size="icon" className="relative text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500">
                <span className="sr-only">View notifications</span>
                <Bell className="h-5 w-5" />
              </Button>

              {/* Profile dropdown */}
              <div className="ml-3 relative">
                <div>
                  <Button 
                    variant="ghost" 
                    className="flex text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                  >
                    <span className="sr-only">Open user menu</span>
                    <div className="h-8 w-8 rounded-full bg-primary-600 flex items-center justify-center text-white">
                      <span className="text-xs font-medium">
                        {currentUser ? currentUser.username.substring(0, 2).toUpperCase() : "NA"}
                      </span>
                    </div>
                  </Button>
                </div>
              </div>
              
              {/* Logout button */}
              {currentUser && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="ml-4 text-gray-500 hover:text-gray-700 flex items-center"
                  onClick={handleLogout}
                >
                  <LogOut className="h-4 w-4 mr-1" />
                  Logout
                </Button>
              )}
            </div>
            <div className="-mr-2 flex items-center sm:hidden">
              {/* Mobile menu button */}
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

        {/* Mobile menu */}
        <div className={`sm:hidden ${mobileMenuOpen ? 'block' : 'hidden'}`} id="mobile-menu">
          <div className="pt-2 pb-3 space-y-1">
            {navItems.map((item) => (
              <Link 
                key={item.path} 
                href={item.path}
                className={
                  location === item.path
                    ? "bg-primary-50 border-primary-500 text-primary-700 block pl-3 pr-4 py-2 border-l-4 text-base font-medium"
                    : "border-transparent text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700 block pl-3 pr-4 py-2 border-l-4 text-base font-medium"
                }
                onClick={() => setMobileMenuOpen(false)}
              >
                {item.name}
              </Link>
            ))}
            
            {/* Mobile logout button */}
            {currentUser && (
              <button
                className="border-transparent text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700 block w-full text-left pl-3 pr-4 py-2 border-l-4 text-base font-medium flex items-center"
                onClick={() => {
                  setMobileMenuOpen(false);
                  handleLogout();
                }}
              >
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {children}
        </div>
      </main>
    </div>
  );
}
