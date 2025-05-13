import { Request, Response, NextFunction } from "express";
import { storage } from "../storage";
import { User } from "@shared/schema";
import { sql } from "drizzle-orm";
import { db } from "../db";

// Define a type that extends Express.Request to include the business property
declare global {
  namespace Express {
    interface Request {
      business?: Omit<User, "password">;
      businessConfig?: BusinessConfig;
    }
  }
}

// Define business config interface
export interface BusinessConfig {
  id: number;
  name: string | null;
  slug: string | null;
  email: string;
  phone: string | null;
  
  // Theme settings
  themeSettings: {
    primaryColor: string;
    secondaryColor: string;
    accentColor: string;
    textColor: string;
    backgroundColor: string;
    fontFamily: string;
    borderRadius: string;
    buttonStyle: string;
    cardStyle: string;
  };
  
  // Industry type
  industryType: string;
  
  // Optional fields that may be included
  address?: string | null;
  city?: string | null;
  state?: string | null;
  postalCode?: string | null;
  country?: string | null;
  latitude?: string | null;
  longitude?: string | null;
  
  // Display options
  showMap?: boolean;
  showTestimonials?: boolean;
  showServices?: boolean;
  showPhone?: boolean;
  showAddress?: boolean;
  showEmail?: boolean;
  
  // Localization settings
  locale?: string;
  timeZone?: string;
  currencyCode?: string;
  currencySymbol?: string;
  
  // Business settings
  use24HourFormat?: boolean;
  appointmentBuffer?: number;
  allowSameTimeSlotForDifferentServices?: boolean;
  cancellationWindowHours?: number;
  
  // Custom texts
  customTexts?: Record<string, string>;
}

// Comprehensive list of reserved paths that shouldn't be treated as business slugs
const RESERVED_PATHS = [
  'api', 'assets', 'src', 'components', 
  'products', 'services', 'dashboard', 'appointments', 
  'customers', 'admin', 'auth', 'checkout',
  'login', 'register', 'logout', 'signup',
  'profile', 'settings', 'theme', 'templates',
  'images', 'css', 'js', 'fonts', 'favicon.ico',
  'robots.txt', 'sitemap.xml', 'manifest.json',
  '@react-refresh', '@fs', '@id', '@vite'
];

// Simple in-memory cache for business lookups
// This significantly reduces database queries for common paths
const slugCache: Record<string, {
  business: Omit<User, "password"> | null, 
  timestamp: number,
  config?: BusinessConfig
}> = {};

const domainCache: Record<string, {
  business: Omit<User, "password"> | null, 
  timestamp: number,
  config?: BusinessConfig
}> = {};

// Cache duration in milliseconds (5 minutes)
const CACHE_DURATION = 5 * 60 * 1000;

// Clear expired cache entries periodically (every minute)
setInterval(() => {
  const now = Date.now();
  Object.keys(slugCache).forEach(key => {
    if (now - slugCache[key].timestamp > CACHE_DURATION) {
      delete slugCache[key];
    }
  });
  Object.keys(domainCache).forEach(key => {
    if (now - domainCache[key].timestamp > CACHE_DURATION) {
      delete domainCache[key];
    }
  });
}, 60 * 1000);

/**
 * Middleware to extract business information from:
 * 1. URL path parameter (/:slug)
 * 2. Custom domain (Host header)
 * 
 * Attaches the business object to req.business for use in subsequent routes
 */
export const businessExtractor = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Skip API routes
    if (req.path.startsWith('/api/')) {
      return next();
    }

    const host = req.get('host') || '';
    const domain = host.replace(/:\d+$/, ''); // Remove port number
    
    // Try getting business from subdomain
    if (domain.endsWith('appointease.cl')) {
      const subdomain = domain.replace('.appointease.cl', '');
      if (subdomain !== 'www' && subdomain !== '') {
        const business = await storage.getUserByBusinessSlug(subdomain);
        if (business) {
          req.business = business;
          return next();
        }
      }
    }

    // Try getting business from path
    const pathSegments = req.path.split('/').filter(Boolean);
    if (pathSegments.length > 0) {
      const possibleSlug = pathSegments[0];
      const business = await storage.getUserByBusinessSlug(possibleSlug);
      if (business) {
        req.business = business;
      }
    }

    next();
  } catch (error) {
    console.error('Error in business extractor:', error);
    next(error);
  }
};

/**
 * Helper function to attach business configuration to the request
 * Includes theme settings and other business-specific configuration
 */
async function attachBusinessConfig(req: Request) {
  if (!req.business || !req.business.id) return;
  
  try {
    // Default theme settings - used as fallback
    let themeSettings = {
      primaryColor: '#4f46e5',
      secondaryColor: '#06b6d4',
      accentColor: '#f59e0b',
      textColor: '#1f2937',
      backgroundColor: '#ffffff',
      fontFamily: 'sans-serif',
      borderRadius: 'rounded-md',
      buttonStyle: 'rounded',
      cardStyle: 'elevated',
    };
    
    let industryType = 'general';
    
    // First try to use the business object's properties if already present
    if (req.business.themeSettings) {
      try {
        // Handle both string and object cases
        const parsedSettings = typeof req.business.themeSettings === 'string'
          ? JSON.parse(req.business.themeSettings)
          : req.business.themeSettings;
        
        themeSettings = { ...themeSettings, ...parsedSettings };
      } catch (e) {
        // Silent error - will use defaults
      }
    }
    
    if (req.business.industryType) {
      industryType = req.business.industryType;
    }
    
    // Create a business config object
    const businessConfig: BusinessConfig = {
      id: req.business.id,
      name: req.business.businessName,
      slug: req.business.businessSlug,
      email: req.business.email,
      phone: req.business.phone,
      
      // Theme settings
      themeSettings,
      
      // Industry type
      industryType: industryType,
      
      // Display options with defaults
      showMap: req.business.showMap ?? true,
      showTestimonials: req.business.showTestimonials ?? true,
      showServices: req.business.showServices ?? true,
      showPhone: req.business.showPhone ?? true,
      showAddress: req.business.showAddress ?? true,
      showEmail: req.business.showEmail ?? true,
      
      // Localization settings with defaults
      locale: req.business.locale || 'en',
      timeZone: req.business.businessTimeZone || 'UTC',
      currencyCode: req.business.currencyCode || 'USD',
      currencySymbol: req.business.currencySymbol || '$',
      
      // Business settings with defaults
      use24HourFormat: req.business.use24HourFormat ?? false,
      appointmentBuffer: req.business.appointmentBuffer || 15,
      allowSameTimeSlotForDifferentServices: 
        req.business.allowSameTimeSlotForDifferentServices ?? false,
      cancellationWindowHours: req.business.cancellationWindowHours || 24,
      
      // Custom texts
      customTexts: req.business.customTexts || {},
    };
    
    // Add optional fields if they exist on the business object
    if ('address' in req.business) businessConfig.address = req.business.address as string | null;
    if ('city' in req.business) businessConfig.city = req.business.city as string | null;
    if ('state' in req.business) businessConfig.state = req.business.state as string | null;
    if ('postalCode' in req.business) businessConfig.postalCode = req.business.postalCode as string | null;
    if ('country' in req.business) businessConfig.country = req.business.country as string | null;
    if ('latitude' in req.business) businessConfig.latitude = req.business.latitude as string | null;
    if ('longitude' in req.business) businessConfig.longitude = req.business.longitude as string | null;
    
    // Attach config to request
    req.businessConfig = businessConfig;
  } catch (err) {
    console.error('Error attaching business config:', err);
  }
}