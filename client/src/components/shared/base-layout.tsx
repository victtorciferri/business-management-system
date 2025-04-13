import { User } from "@shared/schema";
import { ReactNode } from "react";
import BaseHeader, { NavigationItem } from "./base-header";
import { useLocation } from "wouter";

export interface BaseLayoutProps {
  children: ReactNode;
  business?: Omit<User, "password">;
  navigationItems: NavigationItem[];
  slug?: string;
  portalType: 'business' | 'customer';
  logoText?: string;
  footerText?: string;
  queryParams?: Record<string, string | null>;
}

export default function BaseLayout({
  children,
  business,
  navigationItems,
  slug,
  portalType,
  logoText,
  footerText,
  queryParams
}: BaseLayoutProps) {
  const [location] = useLocation();
  
  const businessName = business?.businessName || 'Salon Elegante';
  
  return (
    <div className="min-h-screen bg-gray-50">
      <BaseHeader
        business={business}
        navigationItems={navigationItems}
        currentPath={location}
        portalType={portalType}
        logoText={logoText || businessName}
        slug={slug}
        queryParams={queryParams}
      />
      <main className="container mx-auto px-4 py-8">
        {children}
      </main>
      <footer className="bg-white border-t py-6">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-sm text-gray-500">
              &copy; {new Date().getFullYear()} {businessName}. All rights reserved.
            </p>
            <p className="text-sm text-gray-400 mt-2 md:mt-0">
              Powered by <span className="text-primary-600 font-medium">AppointEase</span>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}