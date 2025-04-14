import { Business } from '@/contexts/BusinessContext';

/**
 * Permission levels for multi-tenant access control
 */
export enum PermissionLevel {
  // No access to any resources
  NONE = 'none',
  
  // Read-only access to public resources
  READ = 'read',
  
  // Can create and update their own resources
  WRITE = 'write',
  
  // Full access to all business resources
  ADMIN = 'admin',
  
  // Platform-level administrative access
  PLATFORM_ADMIN = 'platform_admin'
}

/**
 * Resource types that can be permission-controlled
 */
export type ResourceType = 
  | 'appointments'
  | 'customers'
  | 'services'
  | 'products'
  | 'payments'
  | 'staff'
  | 'settings'
  | 'analytics';

/**
 * Permission check interface
 */
export interface PermissionChecker {
  // Check if the current user can perform an action on a resource
  canAccess: (resourceType: ResourceType, action: 'read' | 'create' | 'update' | 'delete') => boolean;
  
  // Check if the current user is a business admin
  isBusinessAdmin: () => boolean;
  
  // Check if the current user is a platform admin
  isPlatformAdmin: () => boolean;
  
  // Check if the current user belongs to a specific business
  belongsToBusiness: (businessSlug: string) => boolean;
}

/**
 * Create a permission checker based on the current user and business context
 */
export function createPermissionChecker(
  currentUser: { id: number; role: string } | null,
  currentBusiness: Business | null
): PermissionChecker {
  
  // Check if user is a platform admin
  const isPlatformAdmin = () => {
    return currentUser?.role === 'platform_admin';
  };
  
  // Check if user is a business admin for the current business
  const isBusinessAdmin = () => {
    if (!currentUser || !currentBusiness) return false;
    
    return currentUser.role === 'admin' && 
      (currentBusiness.id === currentUser.id || // User is the business owner
       currentBusiness.businessId === currentUser.id); // User is admin of this business
  };
  
  // Check if user belongs to the specified business
  const belongsToBusiness = (businessSlug: string) => {
    if (!currentUser || !currentBusiness) return false;
    
    return currentBusiness.businessSlug === businessSlug;
  };
  
  // Check if user can access a specific resource
  const canAccess = (resourceType: ResourceType, action: 'read' | 'create' | 'update' | 'delete'): boolean => {
    // Platform admins can do anything
    if (isPlatformAdmin()) return true;
    
    // Business admins can do anything within their business
    if (isBusinessAdmin()) return true;
    
    // Staff members have limited permissions
    if (currentUser?.role === 'staff') {
      switch (resourceType) {
        case 'appointments':
          return true; // Staff can manage appointments
          
        case 'customers':
          return action === 'read' || action === 'create'; // Staff can view and create customers
          
        case 'services':
          return action === 'read'; // Staff can only view services
          
        case 'products':
          return action === 'read'; // Staff can only view products
          
        case 'payments':
          return action === 'read' || action === 'create'; // Staff can view and create payments
          
        default:
          return false; // No access to other resources
      }
    }
    
    // For customers, only allow read access to public resources
    if (currentUser?.role === 'customer') {
      return action === 'read' && 
        ['services', 'products'].includes(resourceType);
    }
    
    // Default deny
    return false;
  };
  
  return {
    canAccess,
    isBusinessAdmin,
    isPlatformAdmin,
    belongsToBusiness
  };
}