import { User } from "@shared/schema";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { ReactNode } from "react";
import { useTheme } from "@/contexts/ThemeContext";
import { useBusinessContext } from "@/contexts/BusinessContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { Moon, Sun } from "lucide-react";
import { LanguageSelector } from "@/components/ui/language-selector";
import BusinessLogo from "@/components/business/BusinessLogo";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";

export interface NavigationItem {
  label: string;
  path: string;
  icon?: ReactNode;
  isActive: boolean;
}

// Extended business interface to include logoUrl
interface BusinessWithLogo extends Omit<User, "password"> {
  logoUrl?: string;
}

interface BaseHeaderProps {
  business?: BusinessWithLogo;
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
  const { theme, isDarkMode, toggleDarkMode } = useTheme();
  const { config } = useBusinessContext();
  const { t } = useLanguage();
  
  // Helper functions for theme color management - use yoga green for Pride&Flow
  const getPrimaryColor = () => {
    // Use green colors for Pride&Flow
    if (logoText === "Pride&Flow Yoga" || business?.businessSlug === "prideandflow" || slug === "prideandflow") {
      return 'text-green-600';
    }
    return 'text-blue-600';
  };
  
  const getTextColor = () => isDarkMode ? 'text-foreground' : 'text-gray-800';
  
  const getButtonClass = () => {
    // Use green colors for Pride&Flow
    if (logoText === "Pride&Flow Yoga" || business?.businessSlug === "prideandflow" || slug === "prideandflow") {
      return isDarkMode ? 'bg-green-700' : 'bg-green-600';
    }
    return isDarkMode ? 'bg-primary' : 'bg-blue-600';
  };

  // Helper function to build URL with query parameters
  const buildUrl = (path: string) => {
    const params = Object.entries(queryParams)
      .filter(([_, value]) => value !== null && value !== undefined)
      .map(([key, value]) => `${key}=${value}`);
    
    return path + (params.length ? `?${params.join('&')}` : '');
  };

  // Get logo based on business configuration
  const renderLogo = () => {
    // Special case for Pride&Flow Yoga
    if (logoText === "Pride&Flow Yoga" || business?.businessSlug === "prideandflow" || slug === "prideandflow") {
      return <BusinessLogo className="h-10 w-auto mr-3" />;
    }
    
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
    const gradientClasses = isDarkMode 
      ? 'bg-gradient-to-br from-purple-600 to-indigo-800'
      : 'bg-gradient-to-br from-blue-600 to-indigo-600';
      
    return (
      <div className={`h-10 w-10 rounded-md ${gradientClasses} flex items-center justify-center text-white font-bold text-xl mr-3`}>
        {logoInitial}
      </div>
    );
  };

  // Get portal label based on language context
  const getPortalLabel = () => {
    if (portalType === 'customer') {
      return t('common.customer_portal');
    }
    return '';
  };
  
  return (
    <header className={`${isDarkMode ? 'bg-card border-b border-border' : 'bg-white border-gray-200'} shadow`}>
      <div className={`container mx-auto px-4 ${theme.fontFamily}`}>
        <div className="flex flex-col md:flex-row justify-between items-center py-4">
          {/* Logo and Business Name */}
          <div className="flex items-center mb-4 md:mb-0">
            <div 
              className="flex items-center cursor-pointer" 
              onClick={() => navigate(portalType === 'business' && slug ? `/${slug}` : buildUrl('/customer-portal'))}
            >
              {renderLogo()}
              <h1 className={`text-xl font-bold ${isDarkMode ? 'text-foreground' : 'text-gray-800'}`}>
                {logoText}
                {portalType === 'customer' && (
                  <span className={`${isDarkMode ? 'text-primary' : getPrimaryColor()} font-normal ml-2`}>
                    {getPortalLabel()}
                  </span>
                )}
              </h1>
            </div>
          </div>

          {/* Navigation */}
          <div className="flex items-center">
            <ul className="flex items-center space-x-2 mr-2">
              {navigationItems.map((item) => (
                <li key={item.path}>
                  <Button
                    variant={item.isActive ? "default" : "ghost"}
                    size="sm"
                    className={`flex items-center ${
                      item.isActive 
                        ? (isDarkMode 
                            ? 'bg-primary hover:bg-primary/80 text-white' 
                            : `${getButtonClass()} hover:opacity-90 text-white`)
                        : (isDarkMode 
                            ? 'text-muted-foreground hover:text-foreground hover:bg-muted' 
                            : 'text-gray-700 hover:text-gray-900')
                    }`}
                    onClick={() => navigate(buildUrl(item.path))}
                  >
                    {item.icon}
                    {item.label}
                  </Button>
                </li>
              ))}
            </ul>
            
            {/* Language selector */}
            <div className="mx-2">
              <LanguageSelector />
            </div>
            
            {/* Dark mode toggle for all sites */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="sm"
                  className={`${
                    isDarkMode 
                      ? 'text-muted-foreground hover:text-foreground hover:bg-muted' 
                      : 'text-gray-700 hover:text-gray-900'
                  }`}
                >
                  {isDarkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={toggleDarkMode}>
                  {isDarkMode ? t('common.switchToLightMode') : t('common.switchToDarkMode')}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  );
}