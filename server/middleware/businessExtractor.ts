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
  'robots.txt', 'sitemap.xml', 'manifest.json'
];

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
    
    // Log incoming request path for debugging (less verbose)
    console.log(`Business extractor middleware processing path: ${req.path}`);
    
    // First check if the user is authenticated and has a business context
    if (req.isAuthenticated && req.isAuthenticated() && req.user) {
      // For authenticated users, we may already have a business context from their session
      // This is useful for admin and dashboard views where the current user = current business
      if (req.user.businessSlug && req.user.role !== 'admin') {
        try {
          const business = await storage.getUserByBusinessSlug(req.user.businessSlug);
          if (business) {
            // Remove password and create a properly typed sanitized business object
            const { password, ...sanitizedBusiness } = business;
            // The 'as any' is a temporary workaround for the type mismatch
            req.business = sanitizedBusiness as any;
            
            // Skip the rest of the middleware
            return next();
          }
        } catch (err) {
          console.error('Error fetching authenticated user business:', err);
        }
      }
    }
    
    // Check if we have a path parameter slug
    if (req.params.slug) {
      console.log(`Found slug parameter: ${req.params.slug}`);
      // Only treat as business slug if it's not a reserved path
      if (!RESERVED_PATHS.includes(req.params.slug)) {
        businessSlug = req.params.slug;
      } else {
        console.log(`Slug parameter is a reserved word: ${req.params.slug}`);
      }
    }
    // Special handling for /api/business/:slug endpoint
    else if (req.path.startsWith('/api/business/')) {
      const pathSegments = req.path.split('/').filter(Boolean);
      if (pathSegments.length >= 3 && pathSegments[0] === 'api' && pathSegments[1] === 'business') {
        if (!RESERVED_PATHS.includes(pathSegments[2])) {
          businessSlug = pathSegments[2];
          console.log(`Extracted business slug from API path: ${businessSlug}`);
        } else {
          console.log(`Skipping business slug extraction for reserved API path: ${pathSegments[2]}`);
        }
      }
    }
    // Check if the URL path starts with a potential business slug
    // This handles URLs like /salonelegante or /salonelegante/services
    else if (req.path !== '/' && req.path !== '/business-portal') {
      // Extract the first segment of the path
      const pathSegments = req.path.split('/').filter(Boolean);
      if (pathSegments.length > 0) {
        const potentialSlug = pathSegments[0];
        console.log(`Extracted potential slug from path: ${potentialSlug}`);
        
        if (!potentialSlug.startsWith('@') && 
            !potentialSlug.includes('.') && 
            !RESERVED_PATHS.includes(potentialSlug)) {
          businessSlug = potentialSlug;
          console.log(`Using path segment as business slug: ${businessSlug}`);
        } else {
          console.log(`Skipping path segment as business slug (reserved word): ${potentialSlug}`);
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
        
        try {
          // Direct query for custom domain to debug issues
          const domainQueryResult = await db.execute(
            sql`SELECT * FROM users WHERE custom_domain = ${cleanedHost}`
          );
          const domainRows = domainQueryResult.rows || [];
          console.log(`Direct SQL query result for custom domain '${cleanedHost}':`, domainRows);
          
          // Try to look up the business by custom domain
          const businessByDomain = await storage.getUserByCustomDomain(cleanedHost);
          
          if (businessByDomain) {
            console.log(`Business found for custom domain ${cleanedHost}: ${businessByDomain.businessName}`);
            // Remove password and create a properly typed sanitized business object
            const { password, ...sanitizedBusiness } = businessByDomain;
            // The 'as any' is a temporary workaround for the type mismatch
            req.business = sanitizedBusiness as any;
            
            // Load business configuration including theme settings
            await attachBusinessConfig(req);
            
            // Skip the remaining checks
            return next();
          }
        } catch (err) {
          console.error('Error fetching business by custom domain:', err);
        }
        
        // Fallback to subdomain logic if custom domain lookup fails
        if (!host.includes('appointease.com')) {
          // Extract subdomain
          const domainParts = host.split('.');
          
          if (domainParts.length >= 1) {
            // Use the first part as the slug
            const potentialSubdomainSlug = domainParts[0];
            
            // Don't treat reserved paths as business slugs
            if (!RESERVED_PATHS.includes(potentialSubdomainSlug)) {
              businessSlug = potentialSubdomainSlug;
              console.log(`Using subdomain as business slug: ${businessSlug}`);
            }
          }
        }
      }
    }
    
    // If we found a potential business slug, look it up in the database
    if (businessSlug) {
      try {
        console.log(`Looking up business with slug: ${businessSlug}`);
        
        // Direct query for slug to debug issues
        const slugQueryResult = await db.execute(
          sql`SELECT * FROM users WHERE business_slug = ${businessSlug}`
        );
        const slugRows = slugQueryResult.rows || [];
        console.log(`Direct SQL query result for slug '${businessSlug}':`, slugRows);
        
        const business = await storage.getUserByBusinessSlug(businessSlug);
        
        if (business) {
          console.log(`Business found for slug ${businessSlug}: ${business.businessName}`);
          // Remove password and create a properly typed sanitized business object
          const { password, ...sanitizedBusiness } = business;
          // The 'as any' is a temporary workaround for the type mismatch
          req.business = sanitizedBusiness as any;
          
          // Load business configuration including theme settings
          await attachBusinessConfig(req);
        } else {
          console.log(`No business found for slug: ${businessSlug}`);
        }
      } catch (err) {
        console.error(`Error looking up business slug '${businessSlug}':`, err);
      }
    } else {
      console.log('No business slug identified for this request');
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
    // Check if the business has theme settings
    const themeResult = await db.execute(
      sql`SELECT theme_settings, industry_type FROM users WHERE id = ${req.business.id}`
    );
    
    const rows = themeResult.rows || [];
    
    if (rows.length > 0) {
      const row = rows[0];
      
      // Parse theme settings if it exists
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
      
      // If theme_settings column exists and has data, merge with defaults
      if (row.theme_settings) {
        try {
          const parsedSettings = typeof row.theme_settings === 'string' 
            ? JSON.parse(row.theme_settings) 
            : row.theme_settings;
            
          themeSettings = { ...themeSettings, ...parsedSettings };
        } catch (e) {
          console.error('Error parsing theme settings:', e);
        }
      }
      
      // Create a business config object with only the properties we know exist on the business object
      const businessConfig: BusinessConfig = {
        id: req.business.id,
        name: req.business.businessName,
        slug: req.business.businessSlug,
        email: req.business.email,
        phone: req.business.phone,
        
        // Theme settings
        themeSettings,
        
        // Industry type
        industryType: (row.industry_type as string) || 'general',
        
        // Default configurations - these would be customizable in a full implementation
        showMap: true,
        showTestimonials: true,
        showServices: true,
        showPhone: true,
        showAddress: true,
        showEmail: true,
        
        locale: 'en',
        timeZone: 'UTC',
        currencyCode: 'USD',
        currencySymbol: '$',
        
        use24HourFormat: false,
        appointmentBuffer: 15,
        allowSameTimeSlotForDifferentServices: false,
        cancellationWindowHours: 24,
        
        customTexts: {},
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
    }
  } catch (err) {
    console.error('Error attaching business config:', err);
  }
}