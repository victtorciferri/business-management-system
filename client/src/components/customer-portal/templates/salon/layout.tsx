import React from 'react';
import { CustomerPortalBaseLayout } from '../../base/layout';
import { useBusinessContext } from '@/contexts/BusinessContext';
import { Container } from '@/components/ui/layout';
import { Separator } from '@/components/ui/separator';
import { Scissors, Calendar, Clock, Instagram, Facebook, Twitter } from 'lucide-react';
import { extractSubpath, buildBusinessUrl } from '@/utils/tenant-router';
import { Link } from 'wouter';

interface SalonLayoutProps {
  children: React.ReactNode;
  hideHeader?: boolean;
  hideFooter?: boolean;
}

/**
 * Salon-specific layout that extends the base customer portal layout
 * with industry-specific styling and components
 */
export function SalonLayout({
  children,
  hideHeader = false,
  hideFooter = false,
}: SalonLayoutProps) {
  const { business, services, config } = useBusinessContext();
  
  // Additional salon-specific UI elements
  const SalonHeader = !hideHeader ? (
    <div className="bg-primary/10 py-4">
      <Container>
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <Scissors className="h-5 w-5 text-primary" />
            <span className="text-sm">Professional Hair & Beauty Services</span>
          </div>
          
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" />
              <span className="text-sm">Book Online 24/7</span>
            </div>
            
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-primary" />
              <span className="text-sm">Mon-Sat: 9am-7pm</span>
            </div>
            
            <div className="flex items-center gap-2">
              <div className="flex space-x-2">
                <a href="#" className="hover:text-primary">
                  <Instagram className="h-5 w-5" />
                </a>
                <a href="#" className="hover:text-primary">
                  <Facebook className="h-5 w-5" />
                </a>
                <a href="#" className="hover:text-primary">
                  <Twitter className="h-5 w-5" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </div>
  ) : null;
  
  // Additional salon-specific footer content
  const SalonFooterContent = !hideFooter ? (
    <div className="bg-primary/5 py-6">
      <Container>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="font-bold text-primary mb-4">Our Specialties</h3>
            <ul className="space-y-2">
              {services?.slice(0, 5).map((service) => (
                <li key={service.id} className="flex items-center gap-2">
                  <Scissors className="h-4 w-4 text-primary" />
                  <span>{service.name}</span>
                </li>
              ))}
            </ul>
          </div>
          
          <div>
            <h3 className="font-bold text-primary mb-4">Visit Our Salon</h3>
            {business?.address && (
              <address className="not-italic mb-4 flex flex-col space-y-1">
                <span>{business.address}</span>
                <span>{business.city}, {business.state} {business.postalCode}</span>
                {business.phone && <span>Phone: {business.phone}</span>}
              </address>
            )}
            
            <Link href={buildBusinessUrl(business?.businessSlug || '', '/book')}>
              <span className="text-primary hover:underline">Book an Appointment →</span>
            </Link>
          </div>
          
          <div>
            <h3 className="font-bold text-primary mb-4">Follow Us</h3>
            <div className="flex space-x-4 mb-4">
              <a href="#" className="bg-primary text-white p-2 rounded-full hover:bg-primary/80">
                <Instagram className="h-5 w-5" />
              </a>
              <a href="#" className="bg-primary text-white p-2 rounded-full hover:bg-primary/80">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" className="bg-primary text-white p-2 rounded-full hover:bg-primary/80">
                <Twitter className="h-5 w-5" />
              </a>
            </div>
            <p className="text-sm">
              Follow us on social media for the latest styles, promotions, and salon updates!
            </p>
          </div>
        </div>
        
        <Separator className="my-6" />
        
        <div className="text-center text-sm">
          <p className="mb-2">
            &copy; {new Date().getFullYear()} {business?.businessName}. All rights reserved.
          </p>
          <p>
            <a href="#" className="text-primary hover:underline mr-4">Privacy Policy</a>
            <a href="#" className="text-primary hover:underline">Terms of Service</a>
          </p>
        </div>
      </Container>
    </div>
  ) : null;
  
  // Use the base layout but inject salon-specific elements
  return (
    <>
      {SalonHeader}
      <CustomerPortalBaseLayout hideHeader={hideHeader} hideFooter={hideFooter}>
        {children}
      </CustomerPortalBaseLayout>
      {SalonFooterContent}
    </>
  );
}