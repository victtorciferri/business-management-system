import { Link, useLocation } from "wouter";
import { User } from "@shared/schema";
import { Menu, Bell, LogOut, Sun, Moon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useGlobalTheme } from "@/providers/GlobalThemeProvider";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ColorModeToggle } from '../theme-aware/ColorModeToggle';
import { LanguageSelector } from '../ui/language-selector'; // Added import

interface LayoutProps {
  children: React.ReactNode;
  currentUser: User | null;
}

export default function Layout({ children, currentUser }: LayoutProps) {
  const [location] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { logoutMutation } = useAuth();
  const { resolvedColorMode, setColorMode } = useGlobalTheme();
  const isDarkMode = resolvedColorMode === 'dark';

  // Function to toggle dark mode
  const toggleDarkMode = () => {
    setColorMode(isDarkMode ? 'light' : 'dark');
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const handleLogout = () => {
    logoutMutation.mutate();
    window.location.href = '/auth';
  };

  // Different navigation items based on user role
  const businessOwnerNavItems = [
    { name: "Dashboard", path: "/" },
    { name: "Appointments", path: "/appointments" },
    { name: "Customers", path: "/customers" },
    { name: "Services", path: "/services" },
    { name: "Products", path: "/products" },
    { name: "Staff", path: "/staff-management" },
    { name: "Business Profile", path: "/business-profile" },
    { name: "Custom Domain", path: "/custom-domain" },
  ];

  const staffNavItems = [
    { name: "Dashboard", path: "/" },
    { name: "My Schedule", path: "/staff/schedule" },
    { name: "My Profile", path: `/staff/${currentUser?.id}/profile` },
    { name: "Appointments", path: "/appointments" },
    { name: "Customers", path: "/customers" },
  ];

  const adminNavItems = [
    { name: "Admin Dashboard", path: "/admin" },
  ];

  // Select navigation items based on user role
  let navItems;
  if (currentUser?.role === 'admin') {
    navItems = adminNavItems;
  } else if (currentUser?.role === 'staff') {
    navItems = staffNavItems;
  } else {
    navItems = businessOwnerNavItems;
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="bg-card border-b border-border shadow-sm">
        <div className="mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <h1 className="text-xl font-bold text-primary">AppointEase</h1>
              </div>
              <nav className="hidden sm:ml-6 sm:flex sm:space-x-8" aria-label="Main">
                {navItems.map((item) => (
                  <Link 
                    key={item.path} 
                    href={item.path}
                    className={
                      location === item.path
                        ? "border-primary text-foreground inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                        : "border-transparent text-muted-foreground hover:border-border hover:text-foreground inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                    }
                  >
                    {item.name}
                  </Link>
                ))}
              </nav>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:items-center">
              {/* Theme toggle */}
              <div className="flex items-center gap-2"> {/* Modified div */}
                <LanguageSelector /> {/* Added LanguageSelector */}
                <ColorModeToggle />
              </div>

              <Button variant="ghost" size="icon" className="relative text-muted-foreground hover:text-foreground focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary">
                <span className="sr-only">View notifications</span>
                <Bell className="h-5 w-5" />
              </Button>

              {/* Profile dropdown */}
              <div className="ml-3 relative">
                <div>
                  <Button 
                    variant="ghost" 
                    className="flex text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                  >
                    <span className="sr-only">Open user menu</span>
                    <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground">
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
                  className="ml-4 text-muted-foreground hover:text-foreground flex items-center"
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
                className="inline-flex items-center justify-center p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary"
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
                    ? "bg-primary/10 border-primary text-primary dark:text-primary block pl-3 pr-4 py-2 border-l-4 text-base font-medium"
                    : "border-transparent text-muted-foreground hover:bg-muted hover:border-muted-foreground hover:text-foreground block pl-3 pr-4 py-2 border-l-4 text-base font-medium"
                }
                onClick={() => setMobileMenuOpen(false)}
              >
                {item.name}
              </Link>
            ))}

            {/* Mobile theme toggle */}
            <button
              className="border-transparent text-muted-foreground hover:bg-muted hover:border-muted-foreground hover:text-foreground block w-full text-left pl-3 pr-4 py-2 border-l-4 text-base font-medium flex items-center"
              onClick={() => {
                toggleDarkMode();
              }}
            >
              {isDarkMode ? <Sun className="h-4 w-4 mr-2" /> : <Moon className="h-4 w-4 mr-2" />}
              {isDarkMode ? "Light mode" : "Dark mode"}
            </button>

            {/* Mobile logout button */}
            {currentUser && (
              <button
                className="border-transparent text-muted-foreground hover:bg-muted hover:border-muted-foreground hover:text-foreground block w-full text-left pl-3 pr-4 py-2 border-l-4 text-base font-medium flex items-center"
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