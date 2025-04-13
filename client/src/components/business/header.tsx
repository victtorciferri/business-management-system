import { User } from "@shared/schema";
import BaseHeader from "@/components/shared/base-header";
import { 
  HomeIcon, 
  ShoppingBagIcon, 
  CalendarIcon, 
  ClipboardListIcon, 
  InfoIcon,
  LayoutDashboard
} from "lucide-react";
import { NavigationItem } from "@/components/shared/base-header";

interface BusinessHeaderProps {
  business: Omit<User, "password">;
  slug: string;
  currentPath: string;
}

// This component is kept for backward compatibility
// It now uses the BaseHeader component under the hood
export default function BusinessHeader({ business, slug, currentPath }: BusinessHeaderProps) {
  // Define business portal navigation items
  const navigationItems: NavigationItem[] = [
    {
      label: "Home",
      path: `/${slug}`,
      icon: <HomeIcon className="h-4 w-4 mr-2" />,
      isActive: currentPath === `/${slug}` || currentPath.startsWith(`/${slug}/home`)
    },
    {
      label: "Services",
      path: `/${slug}/services`,
      icon: <ShoppingBagIcon className="h-4 w-4 mr-2" />,
      isActive: currentPath.startsWith(`/${slug}/services`)
    },
    {
      label: "Store",
      path: `/${slug}/store`,
      icon: <LayoutDashboard className="h-4 w-4 mr-2" />,
      isActive: currentPath.startsWith(`/${slug}/store`)
    },
    {
      label: "Book",
      path: `/${slug}/book`,
      icon: <CalendarIcon className="h-4 w-4 mr-2" />,
      isActive: currentPath.startsWith(`/${slug}/book`)
    },
    {
      label: "My Appointments",
      path: `/${slug}/my-appointments`,
      icon: <ClipboardListIcon className="h-4 w-4 mr-2" />,
      isActive: currentPath.startsWith(`/${slug}/my-appointments`)
    },
    {
      label: "About",
      path: `/${slug}/about`,
      icon: <InfoIcon className="h-4 w-4 mr-2" />,
      isActive: currentPath.startsWith(`/${slug}/about`)
    }
  ];
  
  return (
    <BaseHeader
      business={business}
      navigationItems={navigationItems}
      currentPath={currentPath}
      portalType="business"
      logoText={business.businessName}
      slug={slug}
    />
  );
}