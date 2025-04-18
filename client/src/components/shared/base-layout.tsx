import { User } from "@shared/schema";
import { ReactNode, useEffect } from "react";
import BaseHeader, { NavigationItem } from "./base-header";
import { useLocation } from "wouter";
import { useTheme } from "@/contexts/ThemeContext";
import { Theme } from '@shared/config';

export interface BaseLayoutProps {
  children: ReactNode;
  business?: Omit<User, "password">;
  navigationItems: NavigationItem[];
  slug?: string;
  portalType: 'business' | 'customer';
  logoText?: string;
  footerText?: string;
  queryParams?: Record<string, string | null>;
  themeConfig?: Theme; // Pass theme settings from business config
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
  const { theme, getBackgroundColor, getTextColor, getPrimaryColor, updateTheme, isDarkMode } = useTheme();
  
  // Apply business theme configuration if provided
  useEffect(() => {
    if (themeConfig) {
      console.log('Applying theme config in BaseLayout:', themeConfig);
      updateTheme(themeConfig);
      
      // Manually apply dark mode class for business profile
      if (themeConfig.appearance === 'dark' || 
         (themeConfig.appearance === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
        console.log('Forcing dark mode in BaseLayout');
        document.documentElement.classList.add('dark');
      } else {
        console.log('Forcing light mode in BaseLayout');
        document.documentElement.classList.remove('dark');
      }
    } else if (business && business.theme) {
      // If no themeConfig but we have a business with theme, apply that theme
      console.log('Applying business.theme in BaseLayout:', business.theme);
      updateTheme({
        primaryColor: business.theme.primary || '#4f46e5',
        secondaryColor: business.theme.secondary || '#06b6d4',
        accentColor: business.theme.accent || '#f59e0b',
        textColor: business.theme.text || '#111827',
        backgroundColor: business.theme.background || '#ffffff',
        fontFamily: business.theme.font || 'Inter, sans-serif',
        borderRadius: typeof business.theme.borderRadius === 'string' ? business.theme.borderRadius : '8px',
        buttonStyle: business.theme.buttonStyle || 'default',
        cardStyle: business.theme.cardStyle || 'default',
        appearance: business.theme.appearance || 'system'
      });
      
      // Apply dark mode based on theme settings
      if (business.theme.appearance === 'dark' || 
         (business.theme.appearance === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
        console.log('Forcing dark mode from business.theme');
        document.documentElement.classList.add('dark');
      } else {
        console.log('Forcing light mode from business.theme');
        document.documentElement.classList.remove('dark');
      }
    }
  }, [themeConfig, business, updateTheme]);
  
  // Log current dark mode state
  useEffect(() => {
    console.log('Current dark mode state in BaseLayout:', isDarkMode);
    console.log('HTML class list:', document.documentElement.classList.toString());
  }, [isDarkMode]);
  
  const businessName = business?.businessName || logoText || 'Business Portal';
  
  return (
    // We use bg-background and text-foreground which automatically adapt to dark mode
    <div className="min-h-screen bg-background text-foreground">
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
      <footer className="bg-card border-t border-border py-6">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-sm text-foreground">
              &copy; {new Date().getFullYear()} {businessName}. {footerText || 'All rights reserved.'}
            </p>
            <p className="text-sm text-muted-foreground mt-2 md:mt-0">
              Powered by <span className="text-primary font-medium">AppointEase</span>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}