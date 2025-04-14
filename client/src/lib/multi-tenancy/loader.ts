import { extractBusinessSlug } from '@/utils/tenant-router';
import { BusinessConfig } from '@/contexts/BusinessContext';

/**
 * Template Type
 * Defines the possible template types for different industries
 */
export type TemplateType = 'salon' | 'fitness' | 'medical' | 'general';

/**
 * Dynamic Component Loader Interface
 * Used to dynamically load components based on business configuration
 */
export interface DynamicComponentLoader<T> {
  // Load a component based on business slug and template type
  loadComponent: (businessSlug: string, templateType: TemplateType) => T;
  
  // Get a component path for lazy loading
  getComponentPath: (businessSlug: string, templateType: TemplateType) => string;
  
  // Check if a business-specific override exists
  hasBusinessOverride: (businessSlug: string) => boolean;
  
  // Check if a template-specific implementation exists
  hasTemplateImplementation: (templateType: TemplateType) => boolean;
}

/**
 * Create a dynamic component loader for customer portal components
 * This allows loading either business-specific overrides, industry templates,
 * or falling back to base components
 */
export function createDynamicLoader<T>(
  componentName: string,
  defaultComponent: T,
  templateComponents: Partial<Record<TemplateType, T>>,
  businessOverrides: Record<string, T> = {}
): DynamicComponentLoader<T> {
  
  return {
    /**
     * Load the appropriate component based on the override hierarchy:
     * 1. Business-specific override
     * 2. Industry template
     * 3. Base component
     */
    loadComponent: (businessSlug, templateType) => {
      // First check for a business-specific override
      if (businessOverrides[businessSlug]) {
        return businessOverrides[businessSlug];
      }
      
      // Then check for a template implementation
      if (templateComponents[templateType]) {
        return templateComponents[templateType]!;
      }
      
      // Fall back to the default implementation
      return defaultComponent;
    },
    
    /**
     * Get the path to the component for dynamic imports
     */
    getComponentPath: (businessSlug, templateType) => {
      // Business override path
      if (businessOverrides[businessSlug]) {
        return `@/components/customer-portal/overrides/${businessSlug}/${componentName}`;
      }
      
      // Template-specific path
      if (templateComponents[templateType]) {
        return `@/components/customer-portal/templates/${templateType}/${componentName}`;
      }
      
      // Base path
      return `@/components/customer-portal/base/${componentName}`;
    },
    
    /**
     * Check if a business-specific override exists
     */
    hasBusinessOverride: (businessSlug) => {
      return !!businessOverrides[businessSlug];
    },
    
    /**
     * Check if a template-specific implementation exists
     */
    hasTemplateImplementation: (templateType) => {
      return !!templateComponents[templateType];
    }
  };
}

/**
 * Load the appropriate layout component based on current business context
 * This is a convenience function that extracts business information from the URL
 * and configuration, then returns the appropriate component
 */
export function loadBusinessComponent<T>(
  pathname: string,
  config: BusinessConfig,
  defaultComponent: T,
  templateComponents: Partial<Record<TemplateType, T>>,
  businessOverrides: Record<string, T> = {}
): T {
  const businessSlug = extractBusinessSlug(pathname) || '';
  const templateType = config.industryType;
  
  const loader = createDynamicLoader('component', defaultComponent, templateComponents, businessOverrides);
  return loader.loadComponent(businessSlug, templateType);
}