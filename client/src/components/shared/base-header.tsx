import { User } from "@shared/schema";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { ReactNode } from "react";

export interface NavigationItem {
  label: string;
  path: string;
  icon?: ReactNode;
  isActive: boolean;
}

interface BaseHeaderProps {
  business?: Omit<User, "password">;
  navigationItems: NavigationItem[];
  currentPath: string;
  portalType: 'business' | 'customer';
  logoText: string;
  slug?: string;
  queryParams?: Record<string, string | null>;
}

export default function BaseHeader({
  business,
  navigationItems,
  currentPath,
  portalType,
  logoText,
  slug,
  queryParams = {}
}: BaseHeaderProps) {
  const [_, navigate] = useLocation();

  // Helper function to build URL with query parameters
  const buildUrl = (path: string) => {
    const params = Object.entries(queryParams)
      .filter(([_, value]) => value !== null && value !== undefined)
      .map(([key, value]) => `${key}=${value}`);
    
    return path + (params.length ? `?${params.join('&')}` : '');
  };

  // Get the first character of the business name for the logo
  const logoInitial = logoText.substring(0, 1).toUpperCase();

  return (
    <header className="bg-white shadow">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center py-4">
          {/* Logo and Business Name */}
          <div className="flex items-center mb-4 md:mb-0">
            <Link href={portalType === 'business' && slug ? `/${slug}` : buildUrl('/customer-portal')}>
              <a className="flex items-center">
                <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center text-white font-bold text-xl mr-3">
                  {logoInitial}
                </div>
                <h1 className="text-xl font-bold text-gray-900">
                  {logoText}
                  {portalType === 'customer' && (
                    <span className="text-primary font-normal ml-2">Customer Portal</span>
                  )}
                </h1>
              </a>
            </Link>
          </div>

          {/* Navigation */}
          <nav className="flex flex-wrap gap-2">
            {navigationItems.map((item) => (
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