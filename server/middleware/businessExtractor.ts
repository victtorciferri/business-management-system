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
export async function businessExtractor(req: Request, res: Response, next: NextFunction) {
  try {
    let businessSlug: string | undefined;
    
    // Skip verbose logging for static assets and development URLs
    const isStaticAssetOrDevPath = req.path.includes('.') || 
                                  req.path.startsWith('/src/') || 
                                  req.path.startsWith('/@') ||
                                  req.path.startsWith('/_next');
    
    if (!isStaticAssetOrDevPath) {
      console.log(`Business extractor processing: ${req.path} (Host: ${req.headers.host})`);
    }
    
    // First check if the user is authenticated and has a business context
    if (req.isAuthenticated && req.isAuthenticated() && req.user) {
      // For authenticated users, we may already have a business context from their session
      if (req.user.businessSlug && req.user.role !== 'admin') {
        try {
          // Check the slug cache first
          const cacheKey = req.user.businessSlug;
          if (slugCache[cacheKey] && Date.now() - slugCache[cacheKey].timestamp < CACHE_DURATION) {
            if (slugCache[cacheKey].business) {
              console.log(`Using cached business data for slug: ${cacheKey}`);
              req.business = slugCache[cacheKey].business;
              req.businessConfig = slugCache[cacheKey].config;
              return next();
            }
          }
          
          console.log(`Looking up business by slug from authenticated user: ${req.user.businessSlug}`);
          const business = await storage.getUserByBusinessSlug(req.user.businessSlug);
          if (business) {
            console.log(`Found business by slug: ${req.user.businessSlug}`);
            const { password, ...sanitizedBusiness } = business;
            req.business = sanitizedBusiness as any;
            await attachBusinessConfig(req);
            
            // Cache the business data
            slugCache[cacheKey] = {
              business: sanitizedBusiness as any,
              timestamp: Date.now(),
              config: req.businessConfig
            };
            
            return next();
          } else {
            console.log(`Business not found by slug: ${req.user.businessSlug}`);
          }
        } catch (err) {
          console.error('Error fetching authenticated user business:', err);
        }
      }
    }
    
    // Check if we have a path parameter slug
    if (req.params.slug) {
      if (!RESERVED_PATHS.includes(req.params.slug)) {
        console.log(`Found slug in params: ${req.params.slug}`);
        businessSlug = req.params.slug;
      } else {
        console.log(`Slug ${req.params.slug} is in reserved paths, skipping`);
      }
    }
    // Special handling for /api/business/:slug endpoint
    else if (req.path.startsWith('/api/business/')) {
      const pathSegments = req.path.split('/').filter(Boolean);
      if (pathSegments.length >= 3 && pathSegments[0] === 'api' && pathSegments[1] === 'business') {
        if (!RESERVED_PATHS.includes(pathSegments[2])) {
          console.log(`Found slug in API business path: ${pathSegments[2]}`);
          businessSlug = pathSegments[2];
        } else {
          console.log(`API slug ${pathSegments[2]} is in reserved paths, skipping`);
        }
      }
    }
    // Check if the URL path starts with a potential business slug
    else if (req.path !== '/' && req.path !== '/business-portal' && !isStaticAssetOrDevPath) {
      const pathSegments = req.path.split('/').filter(Boolean);
      if (pathSegments.length > 0) {
        const potentialSlug = pathSegments[0];
        
        if (!potentialSlug.startsWith('@') && 
            !potentialSlug.includes('.') && 
            !RESERVED_PATHS.includes(potentialSlug)) {
          console.log(`Found potential slug in path: ${potentialSlug}`);
          businessSlug = potentialSlug;
        } else if (RESERVED_PATHS.includes(potentialSlug)) {
          console.log(`Path segment ${potentialSlug} is in reserved paths, skipping`);
        }
      }
    }
    
    // Check for custom domain if we didn't find a slug in the path
    if (!businessSlug && req.headers.host) {
      const host = req.headers.host.toLowerCase();
      
      // Skip localhost and IP addresses
      if (!host.includes('localhost') && 
          !host.includes('127.0.0.1') && 
          !host.match(/^\d+\.\d+\.\d+\.\d+/)) {
          
        // Remove port if present
        const cleanedHost = host.split(':')[0];
        
        // Check cache for this domain
        if (domainCache[cleanedHost] && 
            Date.now() - domainCache[cleanedHost].timestamp < CACHE_DURATION) {
          
          if (domainCache[cleanedHost].business) {
            req.business = domainCache[cleanedHost].business;
            req.businessConfig = domainCache[cleanedHost].config;
            return next();
          }
          // If the domain was cached as not found, skip the db query
          else if (domainCache[cleanedHost].business === null) {
            // Skip to subdomain check
          }
        } 
        else {
          // Not in cache, do the lookup
          try {
            const businessByDomain = await storage.getUserByCustomDomain(cleanedHost);
            
            if (businessByDomain) {
              const { password, ...sanitizedBusiness } = businessByDomain;
              req.business = sanitizedBusiness as any;
              await attachBusinessConfig(req);
              
              // Cache the successful result
              domainCache[cleanedHost] = {
                business: sanitizedBusiness as any,
                timestamp: Date.now(),
                config: req.businessConfig
              };
              
              return next();
            } 
            else {
              // Cache the "not found" result to avoid repeated lookups
              domainCache[cleanedHost] = {
                business: null,
                timestamp: Date.now()
              };
            }
          } catch (err) {
            console.error(`Error looking up domain '${cleanedHost}':`, err);
          }
        }
        
        // Fallback to subdomain logic if custom domain lookup fails
        if (!host.includes('appointease.com')) {
          const domainParts = host.split('.');
          
          if (domainParts.length >= 1) {
            const potentialSubdomainSlug = domainParts[0];
            
            if (!RESERVED_PATHS.includes(potentialSubdomainSlug)) {
              businessSlug = potentialSubdomainSlug;
            }
          }
        }
      }
    }
    
    // Now try to find the business by the slug we identified
    if (businessSlug) {
      // Check the cache first
      if (slugCache[businessSlug] && Date.now() - slugCache[businessSlug].timestamp < CACHE_DURATION) {
        console.log(`Using cached business data for slug: ${businessSlug}`);
        if (slugCache[businessSlug].business) {
          req.business = slugCache[businessSlug].business;
          req.businessConfig = slugCache[businessSlug].config;
          if (!isStaticAssetOrDevPath) {
            console.log(`Setting business from cache: ${req.business.businessName} (ID: ${req.business.id})`);
          }
          return next();
        }
        // Don't proceed with database lookup if we've cached a "not found" result
        console.log(`Business not found in cache for slug: ${businessSlug}`);
        return next();
      }
      
      try {
        console.log(`Looking up business data for slug: ${businessSlug}`);
        
        // Look up the business by slug
        const business = await storage.getUserByBusinessSlug(businessSlug);
        
        if (business) {
          const { password, ...sanitizedBusiness } = business;
          req.business = sanitizedBusiness as any;
          await attachBusinessConfig(req);
          
          console.log(`Found business for slug ${businessSlug}: ${business.businessName} (ID: ${business.id})`);
          
          // Cache the successful result
          slugCache[businessSlug] = {
            business: req.business,
            timestamp: Date.now(),
            config: req.businessConfig
          };
          
          return next();
        } else {
          console.log(`No business found for slug: ${businessSlug}`);
          
          // Cache the "not found" result to avoid repeated lookups
          slugCache[businessSlug] = {
            business: null,
            timestamp: Date.now()
          };
        }
      } catch (error) {
        console.error(`Error looking up business by slug ${businessSlug}:`, error);
      }
    }
    
    // Continue to the next middleware/route handler
    next();
  } catch (error) {
    console.error("Error in business extractor middleware:", error);
    // Continue even if there's an error, just without req.business
    next();
  }
}

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