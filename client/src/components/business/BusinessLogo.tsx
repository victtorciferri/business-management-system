import { memo } from 'react';
import yogaLogo from '@/assets/yoga-logo.svg';

interface BusinessLogoProps {
  className?: string;
  alt?: string;
  size?: number;
}

// This component is used to display the business logo
// It's memoized to avoid unnecessary re-renders
const BusinessLogo = memo(({ className = "h-10 w-auto", alt = "Pride&Flow Yoga", size = 40 }: BusinessLogoProps) => {
  return (
    <img
      src={yogaLogo}
      alt={alt}
      className={className}
      width={size}
      height={size}
    />
  );
});

BusinessLogo.displayName = 'BusinessLogo';

export default BusinessLogo;