import { Request, Response, NextFunction } from "express";
import { storage } from "../storage";
import fs from "fs";
import path from "path";

/**
 * Middleware to inject business data into the HTML response
 * This runs after the business is extracted and before Vite processes the HTML
 */
export async function businessDataInjector(req: Request, res: Response, next: NextFunction) {
  console.log(`[BusinessDataInjector] Called for path: ${req.path}, method: ${req.method}, business: ${req.business?.businessSlug || 'none'}`);
  
  // Only inject data for non-api routes
  if (req.path.startsWith('/api/')) {
    console.log(`[BusinessDataInjector] Skipping API route: ${req.path}`);
    return next();
  }

  // If we have business data from a previous handler, let's save it for injecting
  if (req.business) {
    console.log(`Business data injector for: ${req.path}, business: ${req.business.businessName}`);
    
    try {
      // Get services for this business if we're on a business portal
      const services = await storage.getServicesByUserId(req.business.id);
      const activeServices = services.filter(service => service.active);
      
      // Determine the subpath if we're on a business-specific page
      let subPath = "";
      if (req.originalUrl.includes(`/${req.business.businessSlug}/`)) {
        const parts = req.originalUrl.split(`/${req.business.businessSlug}/`);
        if (parts.length > 1) {
          subPath = parts[1].split('?')[0]; // Remove query params
        }
      }
      
      // Create a business data object to be injected into the HTML
      const businessData = {
        business: req.business,
        services: activeServices,
        subPath: subPath
      };
      
      // Store this on res.locals for use in subsequent middleware
      res.locals.BUSINESS_DATA = businessData;
      console.log(`Stored business data in res.locals for path: ${req.path}`);
    } catch (error) {
      console.error("Error preparing business data:", error);
    }
  }
  
  // Create a wrapper for res.send to intercept HTML responses
  const originalSend = res.send;
  res.send = function(body) {
    // Add debugging
    console.log(`BusinessDataInjector: Handling response for ${req.path}, has business: ${!!req.business}, content type: ${res.getHeader('content-type')}`);
    
    // Only modify HTML responses that have business data
    if (typeof body === 'string' && body.includes('<!DOCTYPE html>')) {
      // For debugging
      if (req.business) {
        console.log(`Business data available for ${req.path}, business: ${req.business.businessName}`);
      }
      
      if (res.locals.BUSINESS_DATA) {
        console.log(`Injecting business data into HTML response for: ${req.path}`);
        
        // Create the script tag with business data
        const businessDataScript = `
<script>
  window.BUSINESS_DATA = ${JSON.stringify(res.locals.BUSINESS_DATA)};
</script>`;
        
        // Insert the script right before the closing head tag
        body = body.replace('</head>', `${businessDataScript}\n</head>`);
      } else if (req.business) {
        // If we have business data on req but not in res.locals, add it
        console.log(`Business data not in res.locals, adding it for: ${req.path}`);
        
        // Create the script tag with business data
        const businessDataScript = `
<script>
  window.BUSINESS_DATA = ${JSON.stringify({
    business: req.business,
    services: [], // We'll fetch these on the client side
    subPath: ""
  })};
</script>`;
        
        // Insert the script right before the closing head tag
        body = body.replace('</head>', `${businessDataScript}\n</head>`);
      }
    }
    
    // Call the original send method
    return originalSend.call(this, body);
  };
  
  next();
}