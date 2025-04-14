import React from 'react';
import { useLocation } from 'wouter';
import { useBusinessContext } from '@/contexts/BusinessContext';
import { Container } from '@/components/ui/layout';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { Link } from 'wouter';
import { extractSubpath, buildBusinessUrl } from '@/utils/tenant-router';
import { Loader2 } from 'lucide-react';

interface CustomerPortalLayoutProps {
  children: React.ReactNode;
  hideHeader?: boolean;
  hideFooter?: boolean;
}

/**
 * Base layout for customer portal pages
 * This serves as the foundation that can be extended by industry templates
 * and business-specific overrides
 */
export function CustomerPortalBaseLayout({
  children,
  hideHeader = false,
  hideFooter = false,
}: CustomerPortalLayoutProps) {
  const { business, isLoading, error } = useBusinessContext();
  const [location] = useLocation();
  
  // Handle loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  
  // Handle error state
  if (error || !business) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <h1 className="text-2xl font-bold mb-4">Business Not Found</h1>
        <p className="text-gray-500 mb-4">
          {error?.message || "We couldn't find the business you're looking for."}
        </p>
        <Button asChild>
          <Link href="/">Go Home</Link>
        </Button>
      </div>
    );
  }
  
  // Get current subpath for navigation
  const currentSubpath = extractSubpath(location);
  
  // Build links with business context
  const buildLink = (path: string) => buildBusinessUrl(business.businessSlug || '', path);
  
  return (
    <div className="flex flex-col min-h-screen">
      {!hideHeader && (
        <header className="border-b">
          <Container>
            <div className="flex h-16 items-center justify-between">
              <div className="flex items-center space-x-4">
                <Link href={buildLink('/')}>
                  <h1 className="text-xl font-bold">{business.businessName}</h1>
                </Link>
              </div>
              
              <nav className="flex items-center space-x-4">
                <Link href={buildLink('/')}>
                  <span className={`${currentSubpath === '/' ? 'font-bold' : ''}`}>
                    Home
                  </span>
                </Link>
                <Link href={buildLink('/services')}>
                  <span className={`${currentSubpath === '/services' ? 'font-bold' : ''}`}>
                    Services
                  </span>
                </Link>
                <Link href={buildLink('/book')}>
                  <span className={`${currentSubpath === '/book' ? 'font-bold' : ''}`}>
                    Book Now
                  </span>
                </Link>
                <Link href={buildLink('/my-appointments')}>
                  <span className={`${currentSubpath === '/my-appointments' ? 'font-bold' : ''}`}>
                    My Appointments
                  </span>
                </Link>
              </nav>
            </div>
          </Container>
        </header>
      )}
      
      <main className="flex-1">
        {children}
      </main>
      
      {!hideFooter && (
        <footer className="border-t py-6 md:py-10">
          <Container>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div>
                <h3 className="font-bold mb-4">{business.businessName}</h3>
                {business.address && (
                  <address className="not-italic mb-2">
                    {business.address}
                    <br />
                    {business.city}, {business.state} {business.postalCode}
                  </address>
                )}
                {business.phone && (
                  <p className="mb-2">
                    Phone: {business.phone}
                  </p>
                )}
                {business.email && (
                  <p className="mb-2">
                    Email: {business.email}
                  </p>
                )}
              </div>
              
              <div>
                <h3 className="font-bold mb-4">Quick Links</h3>
                <ul className="space-y-2">
                  <li>
                    <Link href={buildLink('/')}>Home</Link>
                  </li>
                  <li>
                    <Link href={buildLink('/services')}>Services</Link>
                  </li>
                  <li>
                    <Link href={buildLink('/book')}>Book an Appointment</Link>
                  </li>
                  <li>
                    <Link href={buildLink('/my-appointments')}>My Appointments</Link>
                  </li>
                </ul>
              </div>
              
              <div>
                <h3 className="font-bold mb-4">Our Hours</h3>
                <ul className="space-y-2">
                  <li>Monday - Friday: 9am - 7pm</li>
                  <li>Saturday: 9am - 5pm</li>
                  <li>Sunday: Closed</li>
                </ul>
              </div>
            </div>
            
            <Separator className="my-6" />
            
            <div className="text-center text-sm text-gray-500">
              <p>
                &copy; {new Date().getFullYear()} {business.businessName}. All rights reserved.
              </p>
            </div>
          </Container>
        </footer>
      )}
    </div>
  );
}