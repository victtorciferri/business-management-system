import { Request, Response, NextFunction } from "express";
import { storage } from "../storage";
import { User } from "@shared/schema";

// Define a type that extends Express.Request to include the business property
declare global {
  namespace Express {
    interface Request {
      business?: Omit<User, "password">;
    }
  }
}

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
    
    // Check if we have a path parameter slug
    if (req.params.slug) {
      businessSlug = req.params.slug;
    }
    // Check if the URL path starts with a potential business slug
    // This handles URLs like /salonelegante or /salonelegante/services
    else if (req.path !== '/' && req.path !== '/business-portal') {
      // Extract the first segment of the path
      const pathSegments = req.path.split('/').filter(Boolean);
      if (pathSegments.length > 0) {
        const potentialSlug = pathSegments[0];
        
        // Skip if it starts with "api", "assets", "src", or other known routes
        if (!potentialSlug.startsWith('api') && 
            !potentialSlug.startsWith('assets') && 
            !potentialSlug.startsWith('src') && 
            !potentialSlug.startsWith('components')) {
          businessSlug = potentialSlug;
        }
      }
    }
    // Check if we have a custom domain (excluding localhost and default domains)
    else if (req.headers.host) {
      const host = req.headers.host.toLowerCase();
      
      // Skip localhost, IP addresses, and our main domain
      if (!host.includes('localhost') && 
          !host.includes('127.0.0.1') && 
          !host.includes('appointease.com') && 
          !host.match(/^\d+\.\d+\.\d+\.\d+/)) {
        
        // Extract subdomain or domain
        const domainParts = host.split('.');
        
        // For subdomains like businessname.example.com
        // For custom domains like businessname.com
        if (domainParts.length >= 1) {
          // Use the first part as the slug (businessname)
          businessSlug = domainParts[0];
        }
      }
    }
    
    // If we found a potential business slug, look it up in the database
    if (businessSlug) {
      const business = await storage.getUserByBusinessSlug(businessSlug);
      
      if (business) {
        // Remove sensitive information before attaching to request
        const { password, ...sanitizedBusiness } = business;
        req.business = sanitizedBusiness;
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