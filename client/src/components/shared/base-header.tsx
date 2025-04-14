import { User } from "@shared/schema";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { ReactNode } from "react";
import { useTheme } from "@/contexts/ThemeContext";
import { useBusinessContext } from "@/contexts/BusinessContext";

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
  const { theme, getPrimaryColor, getTextColor, getButtonClass } = useTheme();
  const { config } = useBusinessContext();

  // Helper function to build URL with query parameters
  const buildUrl = (path: string) => {
    const params = Object.entries(queryParams)
      .filter(([_, value]) => value !== null && value !== undefined)
      .map(([key, value]) => `${key}=${value}`);
    
    return path + (params.length ? `?${params.join('&')}` : '');
  };

  // Get logo based on business configuration
  const renderLogo = () => {
    // If a logo URL is available, use it
    if (business?.logoUrl || config.logoUrl) {
      return (
        <img 
          src={business?.logoUrl || config.logoUrl || ""} 
          alt={`${logoText} logo`} 
          className="h-10 w-auto mr-3"
        />
      );
    }
    
    // Otherwise use the text initial logo
    const logoInitial = logoText.substring(0, 1).toUpperCase();
    return (
      <div className={`h-10 w-10 ${theme.borderRadius} bg-gradient-to-br from-${theme.primaryColor} to-${theme.accentColor} flex items-center justify-center text-white font-bold text-xl mr-3`}>
        {logoInitial}
      </div>
    );
  };

  // Get portal label based on business locale
  const getPortalLabel = () => {
    if (portalType === 'customer') {
      if (config.locale === 'es') return 'Portal de Clientes';
      if (config.locale === 'pt') return 'Portal do Cliente';
      return 'Customer Portal';
    }
    return '';
  };

  return (
    <header className="bg-white shadow">
      <div className={`container mx-auto px-4 ${theme.fontFamily}`}>
        <div className="flex flex-col md:flex-row justify-between items-center py-4">
          {/* Logo and Business Name */}
          <div className="flex items-center mb-4 md:mb-0">
            <Link href={portalType === 'business' && slug ? `/${slug}` : buildUrl('/customer-portal')}>
              <a className="flex items-center">
                {renderLogo()}
                <h1 className={`text-xl font-bold ${getTextColor()}`}>
                  {logoText}
                  {portalType === 'customer' && (
                    <span className={`${getPrimaryColor()} font-normal ml-2`}>
                      {getPortalLabel()}
                    </span>
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
                className={`flex items-center ${getButtonClass()}`}
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