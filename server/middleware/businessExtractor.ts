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
    
    // Log incoming request path for debugging
    console.log(`Business extractor middleware processing path: ${req.path}`);
    
    // Check if we have a path parameter slug
    if (req.params.slug) {
      console.log(`Found slug parameter: ${req.params.slug}`);
      businessSlug = req.params.slug;
    }
    // Check if the URL path starts with a potential business slug
    // This handles URLs like /salonelegante or /salonelegante/services
    else if (req.path !== '/' && req.path !== '/business-portal') {
      // Extract the first segment of the path
      const pathSegments = req.path.split('/').filter(Boolean);
      if (pathSegments.length > 0) {
        const potentialSlug = pathSegments[0];
        console.log(`Extracted potential slug from path: ${potentialSlug}`);
        
        // Skip if it starts with "api", "assets", "src", or other known routes
        if (!potentialSlug.startsWith('api') && 
            !potentialSlug.startsWith('assets') && 
            !potentialSlug.startsWith('src') && 
            !potentialSlug.startsWith('components')) {
          businessSlug = potentialSlug;
          console.log(`Using path segment as business slug: ${businessSlug}`);
        } else {
          console.log(`Skipping path segment as business slug (reserved word): ${potentialSlug}`);
        }
      }
    }
    // Check if we have a custom domain (excluding localhost and default domains)
    else if (req.headers.host) {
      const host = req.headers.host.toLowerCase();
      console.log(`Checking host header: ${host}`);
      
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
          console.log(`Using domain part as business slug: ${businessSlug}`);
        }
      } else {
        console.log(`Skipping host as business source (local/main domain): ${host}`);
      }
    }
    
    // If we found a potential business slug, look it up in the database
    if (businessSlug) {
      console.log(`Looking up business slug in middleware: ${businessSlug}`);
      const business = await storage.getUserByBusinessSlug(businessSlug);
      
      if (business) {
        console.log(`Business found for slug ${businessSlug}: ${business.businessName}`);
        // Remove sensitive information before attaching to request
        const { password, ...sanitizedBusiness } = business;
        req.business = sanitizedBusiness;
      } else {
        console.log(`No business found for slug: ${businessSlug}`);
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