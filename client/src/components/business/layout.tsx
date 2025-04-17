import { User } from "@shared/schema";
import { useLocation } from "wouter";
import BaseLayout from "@/components/shared/base-layout";
import { NavigationItem } from "@/components/shared/base-header";
import { 
  HomeIcon, 
  ShoppingBagIcon, 
  CalendarIcon, 
  ClipboardListIcon, 
  InfoIcon,
  LayoutDashboard
} from "lucide-react";

interface BusinessLayoutProps {
  children: React.ReactNode;
  business: Omit<User, "password">;
  slug: string;
}

export default function BusinessLayout({ children, business, slug }: BusinessLayoutProps) {
  const [location] = useLocation();
  
  // Define business portal navigation items
  const navigationItems: NavigationItem[] = [
    {
      label: "Home",
      path: `/${slug}`,
      icon: <HomeIcon className="h-4 w-4 mr-2" />,
      isActive: location === `/${slug}` || location.startsWith(`/${slug}/home`)
    },
    {
      label: "Services",
      path: `/${slug}/services`,
      icon: <ShoppingBagIcon className="h-4 w-4 mr-2" />,
      isActive: location.startsWith(`/${slug}/services`)
    },
    {
      label: "Store",
      path: `/${slug}/store`,
      icon: <LayoutDashboard className="h-4 w-4 mr-2" />,
      isActive: location.startsWith(`/${slug}/store`)
    },
    {
      label: "Book",
      path: `/${slug}/book`,
      icon: <CalendarIcon className="h-4 w-4 mr-2" />,
      isActive: location.startsWith(`/${slug}/book`)
    },
    {
      label: "My Appointments",
      path: `/${slug}/my-appointments`,
      icon: <ClipboardListIcon className="h-4 w-4 mr-2" />,
      isActive: location.startsWith(`/${slug}/my-appointments`)
    },
    {
      label: "About",
      path: `/${slug}/about`,
      icon: <InfoIcon className="h-4 w-4 mr-2" />,
      isActive: location.startsWith(`/${slug}/about`)
    }
  ];
  
  return (
    <BaseLayout
      business={business}
      navigationItems={navigationItems}
      slug={slug}
      portalType="business"
      logoText={business.businessName}
      themeConfig={business.themeSettings}
    >
      {children}
    </BaseLayout>
  );
}