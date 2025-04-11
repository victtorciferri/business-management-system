import { Link } from "wouter";
import { User } from "@shared/schema";
import { Home, Calendar, Store, Info, Menu } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { Button } from "@/components/ui/button";

interface BusinessHeaderProps {
  business: Omit<User, "password">;
  slug: string;
  currentPath: string;
}

export default function BusinessHeader({ business, slug, currentPath }: BusinessHeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Define the navigation items for business websites
  const navItems = [
    { name: "Home", path: `/${slug}`, icon: <Home className="h-4 w-4 mr-2" /> },
    { name: "Schedule", path: `/${slug}/schedule`, icon: <Calendar className="h-4 w-4 mr-2" /> },
    { name: "About Us", path: `/${slug}/about`, icon: <Info className="h-4 w-4 mr-2" /> },
    { name: "Store", path: `/${slug}/store`, icon: <Store className="h-4 w-4 mr-2" /> },
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
              <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary-500 to-primary-700">
                {business.businessName}
              </h1>
            </div>
            
            {/* Navigation */}
            <nav className="hidden md:ml-6 md:flex md:space-x-8" aria-label="Main">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  href={item.path}
                  className={cn(
                    "inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium",
                    getActivePath(item.path)
                      ? "border-primary-500 text-gray-900"
                      : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
                  )}
                >
                  {item.icon}
                  {item.name}
                </Link>
              ))}
            </nav>
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
            <Link
              key={item.path}
              href={item.path}
              className={cn(
                "block pl-3 pr-4 py-2 border-l-4 text-base font-medium",
                getActivePath(item.path)
                  ? "bg-primary-50 border-primary-500 text-primary-700"
                  : "border-transparent text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700"
              )}
              onClick={() => setMobileMenuOpen(false)}
            >
              <div className="flex items-center">
                {item.icon}
                {item.name}
              </div>
            </Link>
          ))}
        </div>
      </div>
    </header>
  );
}