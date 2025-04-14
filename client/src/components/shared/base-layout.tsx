import { User } from "@shared/schema";
import { ReactNode, useEffect } from "react";
import BaseHeader, { NavigationItem } from "./base-header";
import { useLocation } from "wouter";
import { useTheme } from "@/contexts/ThemeContext";
import { ThemeSettings } from "@/contexts/ThemeContext";

export interface BaseLayoutProps {
  children: ReactNode;
  business?: Omit<User, "password">;
  navigationItems: NavigationItem[];
  slug?: string;
  portalType: 'business' | 'customer';
  logoText?: string;
  footerText?: string;
  queryParams?: Record<string, string | null>;
  themeConfig?: ThemeSettings; // Pass theme settings from business config
}

export default function BaseLayout({
  children,
  business,
  navigationItems,
  slug,
  portalType,
  logoText,
  footerText,
  queryParams,
  themeConfig
}: BaseLayoutProps) {
  const [location] = useLocation();
  // Use theme context for styling
  const { theme, getBackgroundColor, getTextColor, getPrimaryColor, updateTheme } = useTheme();
  
  // Apply business theme configuration if provided
  useEffect(() => {
    if (themeConfig) {
      updateTheme(themeConfig);
    }
  }, [themeConfig, updateTheme]);
  
  const businessName = business?.businessName || logoText || 'Business Portal';
  
  return (
    <div className={`min-h-screen ${getBackgroundColor()}`}>
      <BaseHeader
        business={business}
        navigationItems={navigationItems}
        currentPath={location}
        portalType={portalType}
        logoText={logoText || businessName}
        slug={slug}
        queryParams={queryParams}
      />
      <main className={`container mx-auto px-4 py-8 ${theme.fontFamily}`}>
        {children}
      </main>
      <footer className="bg-white border-t py-6">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className={`text-sm ${getTextColor()}`}>
              &copy; {new Date().getFullYear()} {businessName}. {footerText || 'All rights reserved.'}
            </p>
            <p className="text-sm text-gray-400 mt-2 md:mt-0">
              Powered by <span className={`${getPrimaryColor()} font-medium`}>AppointEase</span>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}