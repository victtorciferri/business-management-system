import { User } from "@shared/schema";
import { useLocation } from "wouter";
import { useContext, useEffect } from "react"; 
import BaseLayout from "@/components/shared/base-layout";
import { NavigationItem } from "@/components/shared/base-header";
import { ThemeContext } from "@/contexts/ThemeContext";
import { applyTheme } from "@/utils/applyTheme";
import { 
  HomeIcon, 
  ShoppingBagIcon, 
  CalendarIcon, 
  ClipboardListIcon, 
  InfoIcon,
  LayoutDashboard
} from "lucide-react";

interface BusinessLayoutProps {
  children: React.ReactNode;
  business: Omit<User, "password">;
  slug: string;
}

export default function BusinessLayout({ children, business, slug }: BusinessLayoutProps) {
  const [location] = useLocation();
  const { theme, updateBusinessTheme } = useContext(ThemeContext);
  
  // Define business portal navigation items
  const navigationItems: NavigationItem[] = [
    {
      label: "Home",
      path: `/${slug}`,
      icon: <HomeIcon className="h-4 w-4 mr-2" />,
      isActive: location === `/${slug}` || location.startsWith(`/${slug}/home`)
    },
    {
      label: "Services",
      path: `/${slug}/services`,
      icon: <ShoppingBagIcon className="h-4 w-4 mr-2" />,
      isActive: location.startsWith(`/${slug}/services`)
    },
    {
      label: "Store",
      path: `/${slug}/store`,
      icon: <LayoutDashboard className="h-4 w-4 mr-2" />,
      isActive: location.startsWith(`/${slug}/store`)
    },
    {
      label: "Book",
      path: `/${slug}/book`,
      icon: <CalendarIcon className="h-4 w-4 mr-2" />,
      isActive: location.startsWith(`/${slug}/book`)
    },
    {
      label: "My Appointments",
      path: `/${slug}/my-appointments`,
      icon: <ClipboardListIcon className="h-4 w-4 mr-2" />,
      isActive: location.startsWith(`/${slug}/my-appointments`)
    },
    {
      label: "About",
      path: `/${slug}/about`,
      icon: <InfoIcon className="h-4 w-4 mr-2" />,
      isActive: location.startsWith(`/${slug}/about`)
    }
  ];
  
  // Add effect to apply the theme when business is loaded
  useEffect(() => {
    if (business) {
      // First try to use the modern theme object if it exists
      if (business.theme) {
        console.log("BusinessLayout: Applying theme from business.theme", business.theme);
        updateBusinessTheme(business.theme);
      }
      // Otherwise fallback to legacy theme settings
      else if (business.themeSettings) {
        console.log("BusinessLayout: Applying theme from themeSettings", business.themeSettings);
        
        // Convert legacy theme settings to new theme format if needed
        const themeFromLegacy = {
          name: "Business Theme",
          primary: business.themeSettings.primaryColor ? 
            (business.themeSettings.primaryColor.startsWith('#') ? 
              business.themeSettings.primaryColor : 
              `#${business.themeSettings.primaryColor.replace('indigo-600', '4F46E5')}`) : 
            "#4F46E5",
          secondary: business.themeSettings.secondaryColor ? 
            (business.themeSettings.secondaryColor.startsWith('#') ? 
              business.themeSettings.secondaryColor : 
              `#${business.themeSettings.secondaryColor.replace('gray-200', 'E5E7EB')}`) : 
            "#9333EA",
          background: business.themeSettings.backgroundColor ? 
            (business.themeSettings.backgroundColor.startsWith('#') ? 
              business.themeSettings.backgroundColor : 
              `#${business.themeSettings.backgroundColor.replace('white', 'FFFFFF')}`) : 
            "#FFFFFF",
          text: business.themeSettings.textColor ? 
            (business.themeSettings.textColor.startsWith('#') ? 
              business.themeSettings.textColor : 
              `#${business.themeSettings.textColor.replace('gray-800', '1F2937')}`) : 
            "#111827",
          appearance: business.themeSettings.appearance || "system",
          font: "Inter",
          borderRadius: "0.375rem",
          spacing: "1rem"
        };
        
        // Apply theme
        updateBusinessTheme(themeFromLegacy);
      }
    }
  }, [business, updateBusinessTheme]);

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