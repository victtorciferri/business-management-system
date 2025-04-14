import { Request, Response, NextFunction } from "express";
import { storage } from "../storage";
import { db, pool } from "../db";

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
      
      // Use business config if it's already attached to the request
      // Otherwise, create a basic config with defaults
      const businessConfig = req.businessConfig || await createDefaultBusinessConfig(req.business);
      
      // Create a business data object to be injected into the HTML
      const businessData = {
        business: req.business,
        services: activeServices,
        subPath: subPath,
        config: businessConfig
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
        // If we have business data on req but not in res.locals, create minimal data object
        console.log(`Business data not in res.locals, adding minimal data for: ${req.path}`);
        
        // Create a business config if we don't have one already
        const businessConfig = req.businessConfig || {
          id: req.business.id,
          name: req.business.businessName,
          slug: req.business.businessSlug,
          email: req.business.email,
          phone: req.business.phone,
          
          // Default theme settings
          themeSettings: {
            primaryColor: '#4f46e5',
            secondaryColor: '#06b6d4',
            accentColor: '#f59e0b',
            textColor: '#1f2937',
            backgroundColor: '#ffffff',
            fontFamily: 'sans-serif',
            borderRadius: 'rounded-md',
            buttonStyle: 'rounded',
            cardStyle: 'elevated',
          },
          
          // Default industry type
          industryType: 'general',
        };
        
        // Create the script tag with business data
        const businessDataScript = `
<script>
  window.BUSINESS_DATA = ${JSON.stringify({
    business: req.business,
    services: [], // We'll fetch these on the client side
    subPath: "",
    config: businessConfig
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

/**
 * Helper function to create a default business configuration
 * Used when businessConfig isn't already attached to the request
 */
async function createDefaultBusinessConfig(business: any) {
  if (!business || !business.id) {
    return {
      id: 0,
      name: null,
      slug: null,
      email: "",
      themeSettings: {
        primaryColor: '#4f46e5',
        secondaryColor: '#06b6d4',
        accentColor: '#f59e0b',
        textColor: '#1f2937',
        backgroundColor: '#ffffff',
        fontFamily: 'sans-serif',
        borderRadius: 'rounded-md',
        buttonStyle: 'rounded',
        cardStyle: 'elevated',
      },
      industryType: 'general',
    };
  }
  
  try {
    // Use the pool to directly query the database
    const themeResult = await pool.query(
      'SELECT theme_settings, industry_type FROM users WHERE id = $1',
      [business.id]
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
      
      // Create a business config object
      return {
        id: business.id,
        name: business.businessName,
        slug: business.businessSlug,
        email: business.email,
        phone: business.phone,
        address: business.address,
        city: business.city,
        state: business.state,
        postalCode: business.postalCode,
        country: business.country,
        latitude: business.latitude,
        longitude: business.longitude,
        
        // Theme settings
        themeSettings,
        
        // Industry type
        industryType: (row.industry_type as string) || 'general',
        
        // Default configurations
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
    }
    
    // Fallback to minimal config if query didn't return results
    return {
      id: business.id,
      name: business.businessName,
      slug: business.businessSlug,
      email: business.email,
      phone: business.phone,
      themeSettings: {
        primaryColor: '#4f46e5',
        secondaryColor: '#06b6d4',
        accentColor: '#f59e0b',
        textColor: '#1f2937',
        backgroundColor: '#ffffff',
        fontFamily: 'sans-serif',
        borderRadius: 'rounded-md',
        buttonStyle: 'rounded',
        cardStyle: 'elevated',
      },
      industryType: 'general',
    };
  } catch (err) {
    console.error('Error creating default business config:', err);
    
    // Return minimal config on error
    return {
      id: business.id,
      name: business.businessName,
      slug: business.businessSlug,
      email: business.email,
      themeSettings: {
        primaryColor: '#4f46e5',
        secondaryColor: '#06b6d4',
        accentColor: '#f59e0b',
        textColor: '#1f2937',
        backgroundColor: '#ffffff',
        fontFamily: 'sans-serif',
        borderRadius: 'rounded-md',
        buttonStyle: 'rounded',
        cardStyle: 'elevated',
      },
      industryType: 'general',
    };
  }
}