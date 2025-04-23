import { memo } from 'react';
import prideFlowLogo from '@/assets/pride-flow-logo.svg';
import yogaLogo from '@/assets/yoga-logo.svg';

interface BusinessLogoProps {
  className?: string;
  alt?: string;
  size?: number;
  businessSlug?: string;
}

// This component is used to display the business logo
// It's memoized to avoid unnecessary re-renders
const BusinessLogo = memo(({ 
  className = "h-10 w-auto", 
  alt = "Pride&Flow Yoga", 
  size = 40,
  businessSlug
}: BusinessLogoProps) => {
  // Use different logos based on business slug
  const logoSrc = businessSlug === 'prideandflow' ? prideFlowLogo : yogaLogo;
  
  return (
    <img
      src={logoSrc}
      alt={alt}
      className={className}
      width={size}
      height={size}
    />
  );
});

BusinessLogo.displayName = 'BusinessLogo';

export default BusinessLogo;