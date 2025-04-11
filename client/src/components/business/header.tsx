import { Link } from "wouter";
import { User } from "@shared/schema";
import { Home, Calendar, Store, Info } from "lucide-react";
import { cn } from "@/lib/utils";

interface BusinessHeaderProps {
  business: Omit<User, "password">;
  slug: string;
  currentPath: string;
}

export default function BusinessHeader({ business, slug, currentPath }: BusinessHeaderProps) {
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

  return (
    <header className="bg-white shadow-sm border-b">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
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
          <nav className="hidden md:flex space-x-8">
            {navItems.map((item) => (
              <Link
                key={item.path}
                href={item.path}
                className={cn(
                  "inline-flex items-center px-1 pt-1 text-sm font-medium border-b-2 transition-colors",
                  getActivePath(item.path)
                    ? "border-primary-500 text-gray-900"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                )}
              >
                {item.icon}
                {item.name}
              </Link>
            ))}
          </nav>
          
          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              type="button"
              className="bg-white rounded-md p-2 inline-flex items-center justify-center text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500"
              aria-expanded="false"
            >
              <span className="sr-only">Open main menu</span>
              <svg
                className="h-6 w-6"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>
      
      {/* Mobile menu, show/hide based on menu state */}
      <div className="hidden md:hidden">
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