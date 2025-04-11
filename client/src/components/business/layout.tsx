import { User } from "@shared/schema";
import BusinessHeader from "./header";
import { useLocation } from "wouter";

interface BusinessLayoutProps {
  children: React.ReactNode;
  business: Omit<User, "password">;
  slug: string;
}

export default function BusinessLayout({ children, business, slug }: BusinessLayoutProps) {
  const [location] = useLocation();
  
  return (
    <div className="min-h-screen bg-gray-50">
      <BusinessHeader 
        business={business} 
        slug={slug} 
        currentPath={location} 
      />
      <main className="container mx-auto px-4 py-8">
        {children}
      </main>
      <footer className="bg-white border-t py-6">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-sm text-gray-500">
              &copy; {new Date().getFullYear()} {business.businessName}. All rights reserved.
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