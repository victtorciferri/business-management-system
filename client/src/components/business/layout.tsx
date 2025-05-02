import { User } from "@shared/schema";
import { useLocation } from "wouter";
import { useContext, useEffect } from "react"; 
import { ReactNode } from "react";
import BaseLayout from "@/components/shared/base-layout";
import { NavigationItem } from "@/components/shared/base-header";
import { ThemeContext } from "@/contexts/ThemeContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { 
  HomeIcon, 
  ShoppingBagIcon, 
  CalendarIcon, 
  ClipboardListIcon, 
  InfoIcon,
  LayoutDashboard,
} from "lucide-react";

// Define a proper Theme type (replace with actual type from shared/config if available)
type Theme = {
  // ... other properties
  name?: string;
  primary?: string;
  secondary?: string;
  accent?: string;
  text?: string;
  background?: string;
  font?: string;
  borderRadius?: string | number;
  buttonStyle?: string;
  cardStyle?: string;
  appearance?: string;
  variant?: string;
  colorPalette?: string[];
};

interface BusinessLayoutProps {
  children: ReactNode;
  business: Omit<User, "password">;
  slug: string;
}

export default function BusinessLayout({ children, business, slug }: BusinessLayoutProps) {
  const [location] = useLocation();
  const { theme, setTheme } = useContext(ThemeContext);
  const { t } = useLanguage();
  
  // Define business portal navigation items
  const navigationItems: NavigationItem[] = [
    {
      label: t('common.home'),
      path: `/${slug}`,
      icon: <HomeIcon className="h-4 w-4 mr-2" />,
      isActive: location === `/${slug}` || location.startsWith(`/${slug}/home`)
    },
    {
      label: t('common.services'),
      path: `/${slug}/services`,
      icon: <ShoppingBagIcon className="h-4 w-4 mr-2" />,
      isActive: location.startsWith(`/${slug}/services`)
    },
    {
      label: t('common.store'),
      path: `/${slug}/store`,
      icon: <LayoutDashboard className="h-4 w-4 mr-2" />,
      isActive: location.startsWith(`/${slug}/store`)
    },
    {
      label: t('common.book'),
      path: `/${slug}/book`,
      icon: <CalendarIcon className="h-4 w-4 mr-2" />,
      isActive: location.startsWith(`/${slug}/book`)
    },
    {
      label: t('common.appointments'),
      path: `/${slug}/my-appointments`,
      icon: <ClipboardListIcon className="h-4 w-4 mr-2" />,
      isActive: location.startsWith(`/${slug}/my-appointments`)
    },
    {
      label: t('common.about'),
      path: `/${slug}/about`,
      icon: <InfoIcon className="h-4 w-4 mr-2" />,
      isActive: location.startsWith(`/${slug}/about`)
    }
  ];
  
  // Add effect to apply the theme when business is loaded
  useEffect(() => {
    if (business) {
      // First check if themeSettings contains the new theme format properties
      if (business.themeSettings && (
        business.themeSettings.primaryColor || 
        business.themeSettings.secondaryColor || 
        business.themeSettings.accentColor
      )) {
        console.log("BusinessLayout: Applying theme from themeSettings", business.themeSettings);
        
        // Convert to proper Theme format
        const themeFromSettings = {
          name: business.themeSettings.name || "Business Theme",
          primaryColor: business.themeSettings.primaryColor || "#4F46E5",
          secondaryColor: business.themeSettings.secondaryColor || "#9333EA",
          accentColor: business.themeSettings.accentColor || "#F59E0B",
          backgroundColor: business.themeSettings.backgroundColor || "#FFFFFF",
          textColor: business.themeSettings.textColor || "#111827",
          fontFamily: business.themeSettings.fontFamily || "Inter, system-ui, sans-serif",
          borderRadius: typeof business.themeSettings.borderRadius === 'number' 
            ? business.themeSettings.borderRadius 
            : (business.themeSettings.borderRadius === 'rounded-md' ? 8 : 4),
          spacing: typeof business.themeSettings.spacing === 'number'
            ? business.themeSettings.spacing
            : 16,
          buttonStyle: business.themeSettings.buttonStyle || "default",
          cardStyle: business.themeSettings.cardStyle || "default",
          appearance: business.themeSettings.appearance || "light",
          variant: business.themeSettings.variant || "professional",
          colorPalette: business.themeSettings.colorPalette || []
        };
        
        // Apply theme
        setTheme(themeFromSettings);
      }
      // Next try to use the theme object if it exists
      else if (business.theme) {
        console.log("BusinessLayout: Applying theme from business.theme", business.theme);
        
        // Convert legacy theme format to our new format if needed
        const properTheme = {
          name: business.theme.name || "Business Theme",
          primaryColor: business.theme.primaryColor || business.theme.primary || "#4F46E5",
          secondaryColor:
            business.theme.secondaryColor || business.theme.secondary || "#9333EA",
          accentColor: business.theme.accentColor || business.theme.accent || "#F59E0B",
          backgroundColor: business.theme.backgroundColor || business.theme.background || "#FFFFFF",
          textColor: business.theme.textColor || business.theme.text || "#111827",
          fontFamily: business.theme.fontFamily || business.theme.font || "Inter, system-ui, sans-serif",
          borderRadius:
            typeof business.theme.borderRadius === "number"
              ? business.theme.borderRadius
            : 8,
          spacing: typeof business.theme.spacing === 'number'
            ? business.theme.spacing
            : 16,
          buttonStyle: business.theme.buttonStyle || "default",
          cardStyle: business.theme.cardStyle || "default",
          appearance: business.theme.appearance || "light",
          variant: business.theme.variant || "professional",
          colorPalette: business.theme.colorPalette || []
        };
        
        setTheme(properTheme);
      }
      // Fallback to legacy theme settings in older format
      else if (business.themeSettings) {
        console.log("BusinessLayout: Applying legacy theme from themeSettings", business.themeSettings);
        
        // Convert very old legacy theme settings to new theme format
        const themeFromLegacy = {
          name: "Business Theme",
          primaryColor: business.themeSettings.primaryColor ? 
            (business.themeSettings.primaryColor.startsWith('#') ? 
              business.themeSettings.primaryColor : 
              `#${business.themeSettings.primaryColor.replace('indigo-600', '4F46E5')}`) : 
            "#4F46E5",
          secondaryColor: business.themeSettings.secondaryColor ? 
            (business.themeSettings.secondaryColor.startsWith('#') ? 
              business.themeSettings.secondaryColor : 
              `#${business.themeSettings.secondaryColor.replace('gray-200', 'E5E7EB')}`) : 
            "#9333EA",
          backgroundColor: business.themeSettings.backgroundColor ? 
            (business.themeSettings.backgroundColor.startsWith('#') ? 
              business.themeSettings.backgroundColor : 
              `#${business.themeSettings.backgroundColor.replace('white', 'FFFFFF')}`) : 
            "#FFFFFF",
          textColor: business.themeSettings.textColor ? 
            (business.themeSettings.textColor.startsWith('#') ? 
              business.themeSettings.textColor : 
              `#${business.themeSettings.textColor.replace('gray-800', '1F2937')}`) : 
            "#111827",
          accentColor: "#F59E0B",
          appearance: business.themeSettings.appearance || "light",
          fontFamily: "Inter, system-ui, sans-serif",
          borderRadius: 8,
          spacing: 16,
          buttonStyle: "default",
          cardStyle: "default",
          variant: "professional",
          colorPalette: []
        };
        
        // Apply theme
        setTheme(themeFromLegacy);
      }
    }
  }, [business, setTheme]);

  return (
    <BaseLayout
      business={business}
      navigationItems={navigationItems}
      slug={slug}
      portalType="business"
      logoText={business.businessName || ""}
      themeConfig={business.themeSettings || undefined}
    >
      {children}
    </BaseLayout>
  );
}