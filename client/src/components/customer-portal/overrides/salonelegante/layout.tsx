import React from 'react';
import { SalonLayout } from '../../templates/salon/layout';
import { useBusinessContext } from '@/contexts/BusinessContext';
import { Container } from '@/components/ui/layout';

interface SalonEleganteLayoutProps {
  children: React.ReactNode;
  hideHeader?: boolean;
  hideFooter?: boolean;
}

/**
 * Business-specific override for Salon Elegante
 * This extends the salon template with business-specific customizations
 */
export function SalonEleganteLayout({
  children,
  hideHeader = false,
  hideFooter = false,
}: SalonEleganteLayoutProps) {
  const { business, config } = useBusinessContext();
  
  // Apply business-specific styles
  // In a real implementation, these would be loaded from the database
  const customStyles = {
    // Salon Elegante's specific brand colors
    primaryColor: '#8b5cf6', // Purple
    accentColor: '#f59e0b',  // Amber
    fontFamily: '"Playfair Display", serif',
  };
  
  // Business-specific custom header banner
  const BusinessCustomHeader = !hideHeader ? (
    <div 
      className="py-4 text-white text-center"
      style={{ backgroundColor: customStyles.primaryColor }}
    >
      <Container>
        <p className="text-sm font-light">
          Welcome to Salon Elegante - Where Beauty Meets Sophistication | Book Now and Get 15% Off Your First Visit
        </p>
      </Container>
    </div>
  ) : null;
  
  return (
    <div className="salon-elegante-theme">
      {/* Custom styles could be injected here */}
      <style jsx global>{`
        .salon-elegante-theme h1, 
        .salon-elegante-theme h2, 
        .salon-elegante-theme h3 {
          font-family: ${customStyles.fontFamily};
        }
        
        .salon-elegante-theme .custom-accent {
          color: ${customStyles.accentColor};
        }
      `}</style>
      
      {/* Display business-specific header banner */}
      {BusinessCustomHeader}
      
      {/* Use the industry template but override with business-specific elements */}
      <SalonLayout hideHeader={hideHeader} hideFooter={hideFooter}>
        {children}
      </SalonLayout>
    </div>
  );
}