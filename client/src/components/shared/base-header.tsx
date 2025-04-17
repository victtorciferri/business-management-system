import { User } from "@shared/schema";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { ReactNode } from "react";
import { useTheme } from "@/contexts/ThemeContext";
import { useBusinessContext } from "@/contexts/BusinessContext";
import { Moon, Sun } from "lucide-react";
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
  const { theme, getPrimaryColor, getTextColor, getButtonClass, isDarkMode, toggleDarkMode } = useTheme();
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
    const gradientClasses = isDarkMode 
      ? 'bg-gradient-to-br from-purple-600 to-indigo-800'
      : `bg-gradient-to-br from-${theme.primaryColor} to-${theme.accentColor}`;
      
    return (
      <div className={`h-10 w-10 rounded-${theme.borderRadius} ${gradientClasses} flex items-center justify-center text-white font-bold text-xl mr-3`}>
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
    <header className={`${isDarkMode ? 'bg-card border-b border-border' : 'bg-white border-gray-200'} shadow`}>
      <div className={`container mx-auto px-4 ${theme.fontFamily}`}>
        <div className="flex flex-col md:flex-row justify-between items-center py-4">
          {/* Logo and Business Name */}
          <div className="flex items-center mb-4 md:mb-0">
            <Link href={portalType === 'business' && slug ? `/${slug}` : buildUrl('/customer-portal')}>
              <a className="flex items-center">
                {renderLogo()}
                <h1 className={`text-xl font-bold ${isDarkMode ? 'text-foreground' : 'text-gray-800'}`}>
                  {logoText}
                  {portalType === 'customer' && (
                    <span className={`${isDarkMode ? 'text-primary' : getPrimaryColor()} font-normal ml-2`}>
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
                className={`flex items-center ${isDarkMode ? 'bg-primary hover:bg-primary/80 text-white' : 'bg-gray-600 hover:bg-gray-700 text-white'} ${
                  isDarkMode && !item.isActive 
                    ? 'text-muted-foreground hover:text-foreground hover:bg-muted' 
                    : ''
                }`}
                onClick={() => navigate(buildUrl(item.path))}
              >
                {item.icon}
                {item.label}
              </Button>
            ))}
            
            {/* Dark mode toggle for all sites */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="sm"
                  className={`ml-2 ${
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
                  {isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </nav>
        </div>
      </div>
    </header>
  );
}