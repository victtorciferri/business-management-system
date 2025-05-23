import express, { type Express, type Request, type Response, type NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { db, pool } from "./db";
import { sql } from "drizzle-orm";
import rateLimit from 'express-rate-limit';
import path from 'path';
import fs from 'fs';
import { createPreference, processWebhook } from './mercadopago';
import themeRoutes from './routes/themeRoutes';
import themeApiRoutes from './routes/themeApiRoutes';
import themeTestRoutes from './routes/theme-test';
import themeMarketplaceRoutes from './routes/theme-marketplace';
import uploadRouter from './routes/upload';
import { convertLegacyThemeToTheme, convertThemeToLegacyTheme, updateThemeForBusiness, getThemeForBusiness } from './utils/themeUtils';
import { 
  insertUserSchema, 
  insertServiceSchema, 
  insertCustomerSchema, 
  insertAppointmentSchema,
  insertPaymentSchema,
  insertProductSchema,
  insertProductVariantSchema,
  insertCartSchema,
  insertCartItemSchema,
  insertCustomerAccessTokenSchema,
  users,
  User,
  themes
} from "@shared/schema";
import { defaultTheme, Theme } from "@shared/config";
import { themeMiddleware, handlePublicThemeUpdate } from "./middleware/themeMiddleware";

// Extend the Express Session to include user
declare module 'express-session' {
  interface SessionData {
    user: User;
  }
}
import { eq, desc } from "drizzle-orm";
import { z } from "zod";
import Stripe from "stripe";
import nodemailer from "nodemailer";
import crypto from "crypto";
import { businessExtractor } from "./middleware/businessExtractor";
import { manuallyRegisterDomain, getRegisteredDomains } from "./ssl";
import session from "express-session";

// Initialize Stripe if secret key is available
let stripe: Stripe | undefined;
if (process.env.STRIPE_SECRET_KEY) {
  stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: "2025-03-31.basil",
  });
}

// Initialize Nodemailer transporter
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || "smtp.example.com",
  port: parseInt(process.env.EMAIL_PORT || "587"),
  secure: process.env.EMAIL_SECURE === "true",
  auth: {
    user: process.env.EMAIL_USER || "user@example.com",
    pass: process.env.EMAIL_PASSWORD || "password",
  },
});

// Helper function to send customer access token emails
const sendTokenEmail = async (req: Request, token: string, customer: Customer, business: User) => {
  try {
    // Get the base URL from request
    let baseUrl = `${req.protocol}://${req.get('host')}`;
    
    // If it's a custom domain or business slug access, adjust the URL
    if (req.business) {
      if (req.business.customDomain) {
        baseUrl = `https://${req.business.customDomain}`;
      } else if (req.business.businessSlug) {
        baseUrl = `${req.protocol}://${req.get('host')}/${req.business.businessSlug}`;
      }
    } else if (business.customDomain) {
      baseUrl = `https://${business.customDomain}`;
    } else if (business.businessSlug) {
      baseUrl = `${req.protocol}://${req.get('host')}/${business.businessSlug}`;
    }
    
    // Create the access URL
    const accessUrl = `${baseUrl}/customer-portal?token=${token}`;
    
    console.log(`Sending access token email to ${customer.email} with URL: ${accessUrl.substring(0, 30)}...`);
    
    // Send email to the customer
    await transporter.sendMail({
      from: process.env.EMAIL_FROM || 'noreply@appointease.com',
      to: customer.email,
      subject: `Access Your ${business.businessName} Customer Portal`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Access Your Customer Portal</h2>
          <p>Hello ${customer.firstName},</p>
          <p>You can now access your customer portal for ${business.businessName} by clicking the button below.</p>
          <div style="margin: 30px 0;">
            <a href="${accessUrl}" style="background-color: #4f46e5; color: white; padding: 12px 20px; border-radius: 4px; text-decoration: none; font-weight: bold;">
              Access Customer Portal
            </a>
          </div>
          <p>This link will expire in 7 days.</p>
          <p>If you didn't request this email, you can safely ignore it.</p>
          <hr style="border: none; border-top: 1px solid #eaeaea; margin: 20px 0;" />
          <p style="color: #666; font-size: 12px;">
            Powered by AppointEase - Intelligent appointment scheduling for small businesses
          </p>
        </div>
      `,
      text: `
        Hello ${customer.firstName},
        
        You can now access your customer portal for ${business.businessName} by clicking the link below:
        
        ${accessUrl}
        
        This link will expire in 7 days.
        
        If you didn't request this email, you can safely ignore it.
        
        Powered by AppointEase - Intelligent appointment scheduling for small businesses
      `
    });
    
    console.log(`Email sent successfully to ${customer.email}`);
  } catch (error) {
    console.error("Error sending access token email:", error);
    // Email failure is non-fatal, so we just log the error
  }
};

export async function registerRoutes(app: Express): Promise<Server> {
  // Set up memory-backed session store for development
  const sessionMiddleware = session({
    secret: process.env.SESSION_SECRET || "appointease-secret-key",
    resave: true,
    saveUninitialized: true,
    cookie: {
      secure: false, // set to true if using HTTPS
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
      httpOnly: true,
      sameSite: 'lax'
    }
  });

  app.use(sessionMiddleware);

  // Setup and serve static files from the 'uploads' directory
  const uploadsDir = path.join(process.cwd(), 'uploads');
  console.log('======== STATIC FILES SETUP ========');
  console.log('Uploads directory path:', uploadsDir);
  
  // Create uploads directory if it doesn't exist
  if (!fs.existsSync(uploadsDir)) {
    console.log('Uploads directory does not exist, creating it...');
    fs.mkdirSync(uploadsDir, { recursive: true });
    console.log('Uploads directory created');
  } else {
    console.log('Uploads directory already exists');
  }
  
  // Check if directory is writable
  try {
    const testFile = path.join(uploadsDir, '.test_write');
    fs.writeFileSync(testFile, 'test');
    fs.unlinkSync(testFile);
    console.log('Uploads directory is writable');
  } catch (err) {
    console.error('ERROR: Uploads directory is not writable:', err);
  }
  
  // Serve static files with enhanced logging
  app.use('/uploads', (req, res, next) => {
    console.log(`Static file request for: ${req.path}`);
    const fullPath = path.join(uploadsDir, req.path);
    console.log(`Full path: ${fullPath}`);
    console.log(`File exists: ${fs.existsSync(fullPath)}`);
    next();
  }, express.static(uploadsDir));
  /**
   * GET /api/default-theme
   * Get the default theme for reference - accessible without authentication or business context
   * This endpoint is placed BEFORE the business extractor middleware
   */
  app.get("/api/default-theme", (_req: Request, res: Response) => {
    return res.json({ theme: defaultTheme });
  });
  
  /**
   * GET /api/themes/presets
   * Get a list of predefined theme presets
   * This endpoint is accessible without authentication or business context
   */
  app.get("/api/themes/presets", (_req: Request, res: Response) => {
    try {
      // Using hard-coded presets to avoid import issues
      const defaultTheme = {
        name: 'Default Theme',
        primaryColor: '#0077B6',
        secondaryColor: '#023E8A',
        accentColor: '#48CAE4',
        backgroundColor: '#FFFFFF',
        textColor: '#111827',
        fontFamily: 'Inter, system-ui, sans-serif',
        borderRadius: 8,
        spacing: 16,
        buttonStyle: 'default',
        cardStyle: 'default',
        appearance: 'light',
        variant: 'professional',
        colorPalette: [],
      };
      
      const presets = [
        {
          id: 'elegant-spa',
          name: 'Elegant Spa',
          description: 'A sophisticated and calming theme for salons and spas',
          category: 'beauty',
          theme: {
            ...defaultTheme,
            name: "Elegant Spa",
            variant: "professional",
            primaryColor: "#9D7E79",
            secondaryColor: "#694E4E",
            accentColor: "#D4B2A7",
            backgroundColor: "#FAF6F6",
            textColor: "#362F2F",
            fontFamily: "Playfair Display, serif",
            borderRadius: 8,
            spacing: 16,
            buttonStyle: "rounded",
            cardStyle: "elevated",
            appearance: "light",
          }
        },
        {
          id: 'modern-salon',
          name: 'Modern Salon',
          description: 'A bold and contemporary look for modern salons',
          category: 'beauty',
          theme: {
            ...defaultTheme,
            name: "Modern Salon",
            variant: "vibrant",
            primaryColor: "#FF5A5F",
            secondaryColor: "#484848",
            accentColor: "#FFB400",
            backgroundColor: "#FFFFFF",
            textColor: "#2D2D2D",
            fontFamily: "Poppins, sans-serif",
            borderRadius: 12,
            spacing: 18,
            buttonStyle: "pill",
            cardStyle: "default",
            appearance: "light",
          }
        },
        {
          id: 'fitness-studio',
          name: 'Fitness Studio',
          description: 'An energetic theme for fitness and training services',
          category: 'fitness',
          theme: {
            ...defaultTheme,
            name: "Fitness Studio",
            variant: "vibrant",
            primaryColor: "#FF3D00",
            secondaryColor: "#212121",
            accentColor: "#FFC107",
            backgroundColor: "#FAFAFA",
            textColor: "#212121",
            fontFamily: "Montserrat, sans-serif",
            borderRadius: 4,
            spacing: 16,
            buttonStyle: "square",
            cardStyle: "default",
            appearance: "light",
          }
        },
        {
          id: 'dark-professional',
          name: 'Dark Professional',
          description: 'A sleek dark theme for professional services',
          category: 'dark',
          theme: {
            ...defaultTheme,
            name: "Dark Professional",
            variant: "professional",
            primaryColor: "#60A5FA",
            secondaryColor: "#A78BFA",
            accentColor: "#F472B6",
            backgroundColor: "#111827",
            textColor: "#F9FAFB",
            fontFamily: "Inter, system-ui, sans-serif",
            borderRadius: 8,
            spacing: 16,
            buttonStyle: "default",
            cardStyle: "bordered",
            appearance: "dark",
          }
        }
      ];
      
      const categories = ['beauty', 'fitness', 'dark'];
      
      // Return all theme presets with complete information and categories
      res.json({ 
        presets: presets,
        categories: categories
      });
    } catch (error) {
      console.error('Error loading theme presets:', error);
      res.status(500).json({ 
        error: 'Failed to load theme presets',
        message: 'An error occurred while loading theme presets.' 
      });
    }
  });
  
  /**
   * POST /api/public/theme/:businessId
   * Special theme update endpoint that doesn't require authentication
   * This should be placed BEFORE the businessExtractor middleware
   */
  app.post("/api/public/theme/:businessId", handlePublicThemeUpdate);
  
  // Apply the business extractor middleware to all routes
  app.use(businessExtractor);
  
  // Apply theme middleware to all routes after business extractor
  app.use(themeMiddleware);
  
  // Register theme-related routes
  app.use('/api/business', themeRoutes);
  
  // Register the new theme API routes
  app.use(themeApiRoutes);
  
  // Register the theme test routes (for development only)
  app.use(themeTestRoutes);
  
  // Register the theme marketplace routes
  app.use('/api/themes', themeMarketplaceRoutes);
  
  // Register upload routes for image handling
  app.use('/api', uploadRouter);
  
  // Endpoint to update business logo
  app.patch('/api/business/logo', async (req: Request, res: Response) => {
    try {
      if (!req.user || !req.user.id) {
        return res.status(401).json({ error: 'Unauthorized' });
      }
      
      const { logoUrl } = req.body;
      
      // Update the user's logo_url in the database
      const result = await db.update(users)
        .set({ logoUrl })
        .where(eq(users.id, req.user.id))
        .returning();
        
      if (!result || result.length === 0) {
        return res.status(404).json({ error: 'User not found' });
      }
      
      // Remove password from response
      const { password, ...updatedUser } = result[0];
      
      res.status(200).json({ user: updatedUser });
    } catch (error) {
      console.error('Error updating business logo:', error);
      res.status(500).json({ error: 'Failed to update business logo' });
    }
  });
  
  // Make the theme API available by using the router directly
  app.use(themeApiRoutes);

  /**
   * GET /api/business/theme
   * Returns the current theme for the authenticated business
   * Requires authentication and business context
   * 
   * NOTE: This route is now implemented as an async function further down in the file
   * at around line 1924. The implementation below is commented out to avoid duplicates.
   */
  /* REMOVED DUPLICATE ROUTE - Using async implementation below */

  /**
   * POST /api/business/theme
   * Updates the theme for the authenticated business
   * Requires authentication and business context
   * 
   * NOTE: This route is now implemented as an async function further down in the file
   * at around line 1946. The implementation below is commented out to avoid duplicates.
   */
  /* REMOVED DUPLICATE ROUTE - Using async implementation below */
  
  // Add a custom middleware to inject business data into HTML responses
  app.use(async (req, res, next) => {
    // Skip for API routes and static assets
    if (req.path.startsWith('/api/') || 
        req.path.includes('.') || 
        req.path.startsWith('/@') || 
        req.path.startsWith('/src/')) {
      return next();
    }
    
    // Intercept the response.send for HTML responses if we have business data
    if (req.business) {
      console.log(`Custom injector: Setup for path ${req.path}, business: ${req.business.businessName}`);
      
      // Get services for this business while we have the chance
      try {
        const services = await storage.getServicesByUserId(req.business.id);
        const activeServices = services.filter(service => service.active || true);
        
        // Determine subpath for business portal routes
        let subPath = "";
        const slug = req.business.businessSlug;
        
        if (slug && req.originalUrl !== `/${slug}`) {
          const pathParts = req.originalUrl.split('/');
          // Find the slug index in the path
          const slugIndex = pathParts.findIndex(part => part === slug);
          
          if (slugIndex >= 0 && slugIndex < pathParts.length - 1) {
            // Get everything after the slug
            subPath = pathParts.slice(slugIndex + 1).join('/').split('?')[0];
          }
        }
        
        // Store business data for injection
        const businessData = {
          business: req.business,
          services: activeServices,
          subPath: subPath
        };
        
        // Store in res.locals for future middleware
        res.locals.BUSINESS_DATA = businessData;
        
        // Override the res.send method to inject the business data
        const originalSend = res.send;
        res.send = function(body) {
          if (typeof body === 'string' && body.includes('<!DOCTYPE html>')) {
            console.log(`Injecting business data for path ${req.path}`);
            
            // Create script tag with business data
            const businessDataScript = `
<script>
  window.BUSINESS_DATA = ${JSON.stringify(businessData)};
</script>`;
            
            // Inject before closing head tag
            body = body.replace('</head>', `${businessDataScript}\n</head>`);
          }
          
          return originalSend.call(this, body);
        };
      } catch (err) {
        console.error('Error preparing business data for injection:', err);
      }
    }
    
    next();
  });
  
  /**************************************
   * API ROUTES - MUST COME FIRST
   **************************************/
  
  // Add an endpoint to get the current business (for debugging)
  app.get("/api/current-business", (req, res) => {
    if (req.business) {
      res.json({ business: req.business });
    } else {
      res.status(404).json({ message: "No business context found" });
    }
  });
  
  // Test endpoint to check database connectivity
  app.get("/api/db-test", async (req, res) => {
    try {
      // Try direct SQL query
      const { Pool } = await import('@neondatabase/serverless');
      const pool = new Pool({ connectionString: process.env.DATABASE_URL });
      const result = await pool.query('SELECT * FROM users WHERE business_slug = $1', ['salonelegante']);
      
      console.log('Direct database query result:', result.rows);
      
      if (result.rows.length > 0) {
        res.json({ 
          message: "Database connection successful", 
          user: result.rows[0],
          connectionString: process.env.DATABASE_URL ? "Database URL is set" : "No Database URL found"
        });
      } else {
        res.json({ 
          message: "No business found with slug 'salonelegante'",
          connectionString: process.env.DATABASE_URL ? "Database URL is set" : "No Database URL found"
        });
      }
    } catch (error) {
      console.error('Database test error:', error);
      res.status(500).json({ 
        message: "Database test failed", 
        error: error.message,
        connectionString: process.env.DATABASE_URL ? "Database URL is set" : "No Database URL found"
      });
    }
  });
  
  // User routes - these need to be defined before the catch-all routes
  app.get("/api/business/:slug", async (req: Request, res: Response) => {
    try {
      const { slug } = req.params;
      
      // Skip reserved words for API endpoints
      const reservedWords = [
        'products', 'services', 'dashboard', 'appointments', 
        'customers', 'admin', 'auth', 'checkout'
      ];
      
      if (reservedWords.includes(slug)) {
        console.log(`Skipping business lookup for reserved word: ${slug}`);
        return res.status(404).json({ message: "Not a valid business slug" });
      }
      
      console.log(`API request for business with slug: ${slug}`);
      
      // Use the verified working approach from our test endpoint
      const { Pool } = await import('@neondatabase/serverless');
      const pool = new Pool({ connectionString: process.env.DATABASE_URL });
      
      // First try to find by slug
      let result = await pool.query('SELECT * FROM users WHERE business_slug = $1', [slug]);
      
      // If not found by slug, try by custom domain
      if (!result.rows || result.rows.length === 0) {
        console.log(`Business with slug ${slug} not found, trying by custom domain...`);
        result = await pool.query('SELECT * FROM users WHERE custom_domain = $1', [slug]);
      }
      
      console.log(`Raw SQL business data for '${slug}':`, result.rows);
      
      if (!result.rows || result.rows.length === 0) {
        console.log(`Business with slug or domain ${slug} not found in database`);
        return res.status(404).json({ message: "Business not found" });
      }
      
      // Convert snake_case to camelCase
      const business = {
        id: result.rows[0].id,
        username: result.rows[0].username,
        password: result.rows[0].password,
        email: result.rows[0].email,
        businessName: result.rows[0].business_name,
        businessSlug: result.rows[0].business_slug,
        customDomain: result.rows[0].custom_domain,
        phone: result.rows[0].phone,
        // Add address fields
        address: result.rows[0].address,
        city: result.rows[0].city,
        state: result.rows[0].state,
        postalCode: result.rows[0].postal_code,
        country: result.rows[0].country,
        latitude: result.rows[0].latitude,
        longitude: result.rows[0].longitude,
        // Add logo URL
        logoUrl: result.rows[0].logo_url,
        coverImageUrl: result.rows[0].cover_image_url,
        // Add theme settings from JSONB column
        themeSettings: result.rows[0].theme_settings || {
          primaryColor: '#4f46e5',
          secondaryColor: '#06b6d4',
          accentColor: '#f59e0b',
          variant: 'professional',
          appearance: 'system',
          borderRadius: 8,
          fontFamily: 'Inter, sans-serif',
          textColor: '#111827',
          backgroundColor: '#ffffff',
          buttonStyle: 'default',
          cardStyle: 'default'
        },
        industryType: result.rows[0].industry_type || 'general',
        createdAt: new Date(result.rows[0].created_at)
      };
      
      console.log(`Mapped business object:`, business);
      
      // Get services for this business using parameterized query
      const servicesResult = await pool.query(
        'SELECT * FROM services WHERE user_id = $1 AND active = true',
        [business.id]
      );
      
      console.log(`Raw SQL services for business:`, servicesResult.rows);
      
      // Map service rows to camelCase properties
      const services = servicesResult.rows.map(row => ({
        id: row.id,
        userId: row.user_id,
        name: row.name,
        description: row.description,
        duration: row.duration,
        price: row.price,
        color: row.color,
        active: row.active
      }));
      
      // Return business data excluding sensitive information
      const { password: _, ...businessData } = business;
      
      // Return JSON response
      const response = {
        business: businessData,
        services: services
      };
      
      console.log(`Returning business response: ${JSON.stringify(response, null, 2)}`);
      res.json(response);
    } catch (error) {
      console.error(`Error fetching business data: ${error}`);
      res.status(500).json({ message: "Failed to fetch business data" });
    }
  });
  
  /**
   * GET /api/business/id/:id
   * Get business data for a specific business by ID
   * Used by the customer portal when accessed via businessId parameter
   */
  app.get("/api/business/id/:id", async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      
      if (!id || isNaN(parseInt(id, 10))) {
        return res.status(400).json({ message: "Valid business ID is required" });
      }
      
      console.log(`API request for business with ID: ${id}`);
      
      // Use the same approach as the business/:slug endpoint
      const { Pool } = await import('@neondatabase/serverless');
      const pool = new Pool({ connectionString: process.env.DATABASE_URL });
      
      // Find by ID
      let result = await pool.query('SELECT * FROM users WHERE id = $1', [parseInt(id, 10)]);
      
      if (!result.rows || result.rows.length === 0) {
        return res.status(404).json({ message: "Business not found" });
      }
      
      // Process business data similar to the slug endpoint
      const business = {
        id: result.rows[0].id,
        username: result.rows[0].username,
        password: result.rows[0].password,
        email: result.rows[0].email,
        businessName: result.rows[0].business_name,
        businessSlug: result.rows[0].business_slug,
        customDomain: result.rows[0].custom_domain,
        phone: result.rows[0].phone,
        address: result.rows[0].address,
        city: result.rows[0].city,
        state: result.rows[0].state,
        postalCode: result.rows[0].postal_code,
        country: result.rows[0].country,
        latitude: result.rows[0].latitude,
        longitude: result.rows[0].longitude,
        // Add logo URL
        logoUrl: result.rows[0].logo_url,
        coverImageUrl: result.rows[0].cover_image_url,
        themeSettings: result.rows[0].theme_settings || {
          primaryColor: '#4f46e5',
          secondaryColor: '#06b6d4',
          accentColor: '#f59e0b',
          textColor: '#111827',
          backgroundColor: '#ffffff',
          fontFamily: 'Inter, sans-serif',
          borderRadius: 8,
          buttonStyle: 'default',
          cardStyle: 'default',
          appearance: 'light',
        },
        theme: result.rows[0].theme || {
          name: "Professional Default",
          primary: '#4f46e5',
          secondary: '#06b6d4',
          text: '#111827',
          background: '#ffffff',
          borderRadius: 8,
          fontFamily: 'Inter, sans-serif',
          appearance: 'light',
        },
        industryType: result.rows[0].industry_type || 'general',
        createdAt: new Date(result.rows[0].created_at)
      };
      
      console.log(`Mapped business object by ID:`, business);
      
      // Get services for this business using parameterized query
      const servicesResult = await pool.query(
        'SELECT * FROM services WHERE user_id = $1 AND active = true',
        [business.id]
      );
      
      // Map service rows to camelCase properties
      const services = servicesResult.rows.map(row => ({
        id: row.id,
        userId: row.user_id,
        name: row.name,
        description: row.description,
        duration: row.duration,
        price: row.price,
        color: row.color,
        active: row.active
      }));
      
      // Return business data excluding sensitive information
      const { password: _, ...businessData } = business;
      
      // Return JSON response
      const response = {
        business: businessData,
        services: services
      };
      
      res.json(response);
    } catch (error) {
      console.error(`Error fetching business data by ID: ${error}`);
      res.status(500).json({ message: "Failed to fetch business data" });
    }
  });
  
  // Endpoint for the frontend to check current business context
  app.get("/api/current-business", async (req: Request, res: Response) => {
    try {
      if (req.business) {
        // Get services for this business
        const services = await storage.getServicesByUserId(req.business.id);
        const activeServices = services.filter(service => service.active);
        
        // Return the business data without password
        const { password: _, ...businessData } = req.business;
        
        res.json({
          business: businessData,
          services: activeServices
        });
      } else {
        // No business context found
        res.json({ business: null });
      }
    } catch (error) {
      console.error("Error checking business context:", error);
      res.status(500).json({ message: "Failed to check business context" });
    }
  });
  
  // API endpoint to get business data by slug or domain
  app.get("/api/business-data/:slug", async (req: Request, res: Response) => {
    try {
      const { slug } = req.params;
      
      // Skip reserved words for API endpoints
      const reservedWords = [
        'products', 'services', 'dashboard', 'appointments', 
        'customers', 'admin', 'auth', 'checkout'
      ];
      
      if (reservedWords.includes(slug)) {
        console.log(`Skipping business lookup for reserved word: ${slug}`);
        return res.status(404).json({ message: "Not a valid business slug" });
      }
      
      console.log(`Fetching business data for slug: ${slug} from API endpoint`);
      
      // First try to get the business by slug
      let business = await storage.getUserByBusinessSlug(slug);
      
      // If not found by slug, try by custom domain
      if (!business) {
        console.log(`Business not found by slug ${slug}, trying as custom domain...`);
        business = await storage.getUserByCustomDomain(slug);
      }
      
      console.log(`API endpoint - Business lookup result:`, business ? `Found: ${business.businessName}` : 'Not found');
      
      if (!business) {
        console.log(`No business found for slug or domain: ${slug}`);
        return res.status(404).json({ message: "Business not found" });
      }
      
      // Get services for this business using direct SQL query if storage method fails
      let services = [];
      try {
        // Try regular storage method first
        services = await storage.getServicesByUserId(business.id);
      } catch (error) {
        // If error contains "business_slug" column not found, use direct SQL
        if (error.toString().includes("business_slug")) {
          console.log("business_slug column not found in services table, using userId filter only");
          try {
            // Direct SQL query using only user_id for filtering (avoid business_slug column)
            const result = await db.execute(sql`
              SELECT * FROM services WHERE user_id = ${business.id} ORDER BY id
            `);
            
            services = result.rows.map(row => ({
              id: row.id,
              userId: row.user_id,
              name: row.name,
              description: row.description,
              duration: row.duration,
              price: row.price,
              color: row.color,
              active: row.active
            }));
          } catch (sqlError) {
            console.error("Error fetching services with direct SQL:", sqlError);
            services = []; // Default to empty if both methods fail
          }
        } else {
          console.error("Error fetching services:", error);
          services = []; // Default to empty array if error
        }
      }
      const activeServices = services.filter(service => service.active);
      
      // Determine subpath for business portal routes if from referer
      let subPath = "";
      const referer = req.headers.referer;
      if (referer) {
        const urlObj = new URL(referer);
        const regex = new RegExp(`^/${slug}/(.*)$`);
        const match = urlObj.pathname.match(regex);
        if (match && match[1]) {
          subPath = match[1].split('?')[0]; // Remove query params
        }
      }
      
      // Remove sensitive data
      const { password: _, ...businessData } = business;
      
      // Return the business data
      res.json({
        business: businessData,
        services: activeServices,
        subPath
      });
      
      console.log(`Returned business data for ${slug}`);
    } catch (error) {
      console.error(`Error fetching business data for ${req.params.slug}:`, error);
      res.status(500).json({ message: "Failed to fetch business data" });
    }
  });
  
  // API endpoint to get business data by ID for preview purposes
  app.get("/api/preview-business/:id", async (req: Request, res: Response) => {
    try {
      const id = Number(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid business ID" });
      }
      
      console.log(`Fetching business preview data for ID: ${id}`);
      
      // Get the business by ID with detailed error logging
      let business;
      try {
        business = await storage.getUser(id);
        console.log(`Storage.getUser(${id}) result:`, business ? 'Found' : 'Not found');
      } catch (dbError) {
        console.error(`Database error in getUser(${id}):`, dbError);
        throw new Error(`Database error: ${dbError.message}`);
      }
      
      if (!business) {
        console.log(`No business found with ID: ${id}`);
        return res.status(404).json({ message: "Business not found" });
      }
      
      // Get services for this business
      let services = [];
      try {
        services = await storage.getServicesByUserId(business.id);
        console.log(`Retrieved ${services.length} services for business ID ${business.id}`);
      } catch (servicesError) {
        console.error(`Error fetching services for business ID ${business.id}:`, servicesError);
        // Continue without services if this fails
        services = [];
      }
      
      const activeServices = services.filter(service => service.active);
      console.log(`Filtered to ${activeServices.length} active services`);
      
      // Remove sensitive data - check that business has expected structure first
      if (!business.password) {
        console.warn(`Business object missing password field - unexpected structure`);
        console.log('Business object structure:', Object.keys(business));
        
        // Use a safer approach to avoid errors
        const businessData = { ...business };
        delete businessData.password;
        
        // Return the business data with preview flag
        res.json({
          business: businessData,
          services: activeServices,
          isPreview: true
        });
      } else {
        // Normal path - destructure as expected
        const { password: _, ...businessData } = business;
        
        // Return the business data with preview flag
        res.json({
          business: businessData,
          services: activeServices,
          isPreview: true
        });
      }
      
      console.log(`Returned preview business data for ID: ${id}`);
    } catch (error) {
      console.error(`Error fetching preview business data for ID: ${req.params.id}:`, error);
      res.status(500).json({ message: "Failed to fetch business preview data" });
    }
  });

  /**************************************
   * HTML ROUTES - COME AFTER API ROUTES
   **************************************/
  
  // Business public portal route - works with both /:slug and custom domains
  app.get("/business-portal", async (req, res) => {
    try {
      // Check if we have a business context from the middleware
      if (!req.business) {
        return res.status(404).send("Business not found");
      }
      
      // Get services for this business
      const services = await storage.getServicesByUserId(req.business.id);
      const activeServices = services.filter(service => service.active);
      
      // Return the business portal page with business data
      res.send(`
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>${req.business.businessName || 'Business Portal'}</title>
          <link rel="stylesheet" href="/assets/main.css">
          <script>
            window.BUSINESS_DATA = ${JSON.stringify({
              business: req.business,
              services: activeServices
            })};
          </script>
        </head>
        <body>
          <div id="root"></div>
          <script type="module" src="/src/main.tsx"></script>
        </body>
        </html>
      `);
    } catch (error) {
      console.error("Error rendering business portal:", error);
      res.status(500).send("Error loading business portal");
    }
  });
  
  // Route for direct business slug - e.g., /salonelegante
  app.get("/:slug", async (req, res, next) => {
    console.log(`Processing /:slug route for ${req.params.slug}`);
    
    // The businessExtractor middleware should have already attached the business to req.business
    if (!req.business) {
      console.log(`No business found for slug ${req.params.slug}, passing to next handler`);
      return next(); // Let Vite handle this request if it's not a business
    }
    
    // Let Vite handle the request - our businessDataInjector middleware will add the data
    console.log(`Found business for slug ${req.params.slug}, sending to Vite`);
    next();
  });

  // Catch-all route for business-specific pages
  // This will handle URLs like /:slug/services, /:slug/appointments, etc.
  app.get("/:slug/*", async (req, res, next) => {
    console.log(`Processing /:slug/* route for ${req.params.slug} with subpath ${req.params['0']}`);
    
    // The businessExtractor middleware should have already attached the business to req.business
    if (!req.business) {
      console.log(`No business found for slug ${req.params.slug}, passing to next handler`);
      return next(); // Let Vite handle this request if it's not a business
    }
    
    // Let Vite handle the request - our businessDataInjector middleware will add the data
    console.log(`Found business for slug ${req.params.slug} with subpath ${req.params['0']}, sending to Vite`);
    next();
  });
  
  // Catch-all route for the root path that redirects to business-portal if a business context exists
  app.get("/", (req, res, next) => {
    console.log(`Processing / route, business context: ${!!req.business}`);
    
    if (req.business) {
      // Set business data as a local property on the request for Vite to use
      req.app.locals.BUSINESS_DATA = {
        business: req.business,
        services: [], // We'll fetch these on the client side
        subPath: "dashboard" // Default to dashboard for main business 
      };
    }
    
    // Let Vite handle the request
    next();
  });
  
  app.post("/api/users", async (req: Request, res: Response) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      const existingUser = await storage.getUserByUsername(userData.username);
      
      if (existingUser) {
        return res.status(400).json({ message: "Username already exists" });
      }
      
      // Generate a business slug if not provided
      if (!userData.businessSlug && userData.businessName) {
        userData.businessSlug = userData.businessName
          .toLowerCase()
          .replace(/[^a-z0-9]/g, '') // Remove non-alphanumeric characters
          .replace(/\s+/g, '');      // Remove spaces
      }
      
      const user = await storage.createUser(userData);
      res.status(201).json(user);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid user data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create user" });
    }
  });
  
  app.post("/api/login", async (req: Request, res: Response) => {
    try {
      const { username, password } = req.body;
      const user = await storage.getUserByUsername(username);
      
      // Import password comparison function from auth.ts
      const { comparePasswords } = await import('./auth');
      
      if (!user) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      // Check if password matches using secure comparison
      const passwordMatches = await comparePasswords(password, user.password);
      if (!passwordMatches) {
        return res.status(401).json({ message: "Invalid credentials" });
      }
      
      // Store user in session for authentication
      req.session.user = user;
      
      // Ensure session is saved before sending response
      req.session.save(err => {
        if (err) {
          console.error("Session save error:", err);
          return res.status(500).json({ message: "Session save failed" });
        }
        
        // Also set in req.user for passport compatibility
        req.user = user;
        
        // Remove sensitive data before sending to client
        const { password: _, ...userWithoutPassword } = user;
        
        console.log("Login successful for user:", user.username);
        res.json(userWithoutPassword);
      });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ message: "Login failed" });
    }
  });
  
  /**
   * Get the currently authenticated user
   * This endpoint is used by the auth hook on the frontend
   */
  app.get("/api/user", (req: Request, res: Response) => {
    console.log("User authentication check:", {
      sessionID: req.sessionID,
      hasSession: !!req.session,
      sessionCookie: req.session?.cookie,
      userInSession: !!req.session?.user,
      sessionData: req.session
    });
    
    if (!req.session?.user) {
      console.log("User not authenticated when calling /api/user");
      return res.status(401).json({ message: "Not authenticated" });
    }
    
    console.log("User authenticated when calling /api/user", {
      userID: req.session.user.id,
      username: req.session.user.username
    });
    
    return res.json(req.session.user);
  });
  
  /**
   * Debug endpoint for checking authentication state
   * This is used for debugging session issues
   */
  app.get("/api/auth-debug", (req: Request, res: Response) => {
    const debugInfo = {
      isAuthenticated: !!req.session?.user,
      sessionID: req.sessionID,
      hasSession: !!req.session,
      sessionCookie: req.session?.cookie,
      headers: {
        cookie: req.headers.cookie
      }
    };
    
    console.log("Auth debug info:", debugInfo);
    res.json(debugInfo);
  });
  
  app.post("/api/logout", (req: Request, res: Response) => {
    if (req.session) {
      req.session.destroy((err) => {
        if (err) {
          return res.status(500).json({ message: "Failed to logout" });
        }
        res.clearCookie('connect.sid');
        return res.status(200).json({ message: "Logged out successfully" });
      });
    } else {
      return res.status(200).json({ message: "Already logged out" });
    }
  });
  
  // Service routes
  app.get("/api/services", async (req: Request, res: Response) => {
    try {
      // Get userId from business context or query parameter
      let userId: number;
      
      if (req.business) {
        // If we have a business context from the URL or domain, use that
        userId = req.business.id;
      } else {
        // Otherwise use the userId query parameter (or default to 1)
        const userIdParam = req.query.userId as string;
        userId = userIdParam ? parseInt(userIdParam) : 1;
        
        if (isNaN(userId)) {
          return res.status(400).json({ message: "Invalid user ID" });
        }
      }
      
      const services = await storage.getServicesByUserId(userId);
      res.json(services);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch services" });
    }
  });
  
  app.post("/api/services", async (req: Request, res: Response) => {
    try {
      const serviceData = insertServiceSchema.parse(req.body);
      const service = await storage.createService(serviceData);
      res.status(201).json(service);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid service data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create service" });
    }
  });
  
  app.put("/api/services/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid service ID" });
      }
      
      const serviceData = insertServiceSchema.partial().parse(req.body);
      const service = await storage.updateService(id, serviceData);
      
      if (!service) {
        return res.status(404).json({ message: "Service not found" });
      }
      
      res.json(service);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid service data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update service" });
    }
  });
  
  app.delete("/api/services/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid service ID" });
      }
      
      const success = await storage.deleteService(id);
      
      if (!success) {
        return res.status(404).json({ message: "Service not found" });
      }
      
      res.status(204).end();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete service" });
    }
  });
  
  // Customer routes
  app.get("/api/customers", async (req: Request, res: Response) => {
    try {
      // Get userId from business context or query parameter
      let userId: number;
      
      if (req.business) {
        // If we have a business context from the URL or domain, use that
        userId = req.business.id;
      } else {
        // Otherwise use the userId query parameter (or default to 1)
        const userIdParam = req.query.userId as string;
        userId = userIdParam ? parseInt(userIdParam) : 1;
        
        if (isNaN(userId)) {
          return res.status(400).json({ message: "Invalid user ID" });
        }
      }
      
      const customers = await storage.getCustomersByUserId(userId);
      res.json(customers);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch customers" });
    }
  });
  
  app.post("/api/customers", async (req: Request, res: Response) => {
    try {
      // Get the business data for the slug if available
      const business = req.business;
      let customerData;
      
      // Dynamically handle whether businessSlug is in the database
      if (req.body.businessSlug) {
        // Try to preserve the businessSlug if provided
        customerData = insertCustomerSchema.parse(req.body);
      } else {
        // If no businessSlug in request, create without it and use raw SQL if needed
        try {
          customerData = insertCustomerSchema.parse({
            ...req.body,
            businessSlug: business?.businessSlug || 'default'
          });
        } catch (parseError) {
          // If Zod fails due to schema mismatch, use a more flexible approach
          if (parseError instanceof z.ZodError) {
            console.log('Using flexible schema for customer creation');
            
            // If the schema validation fails, we'll use a different approach with raw SQL insertion
            const { Pool } = await import('@neondatabase/serverless');
            const pool = new Pool({ connectionString: process.env.DATABASE_URL });
            
            try {
              // Insert customer using raw SQL to bypass schema validation issues
              const result = await pool.query(
                `INSERT INTO customers 
                 (user_id, first_name, last_name, email, phone, notes) 
                 VALUES ($1, $2, $3, $4, $5, $6) 
                 RETURNING id, user_id, first_name, last_name, email, phone, notes, created_at`,
                [
                  req.body.userId, 
                  req.body.firstName, 
                  req.body.lastName, 
                  req.body.email,
                  req.body.phone || null,
                  req.body.notes || null
                ]
              );
              
              if (result.rows.length > 0) {
                // Map the result to our expected format
                const customer = {
                  id: result.rows[0].id,
                  userId: result.rows[0].user_id,
                  firstName: result.rows[0].first_name,
                  lastName: result.rows[0].last_name,
                  email: result.rows[0].email,
                  phone: result.rows[0].phone || null,
                  notes: result.rows[0].notes || null,
                  createdAt: result.rows[0].created_at,
                  businessSlug: business?.businessSlug || 'default'
                };
                
                return res.status(201).json(customer);
              }
            } catch (sqlError) {
              console.error('Raw SQL customer insertion error:', sqlError);
              throw sqlError;
            }
          }
          
          throw parseError; // Re-throw if not a Zod error or if the SQL approach failed
        }
      }
      
      // Use the standard approach if validation passed
      const customer = await storage.createCustomer(customerData);
      res.status(201).json(customer);
    } catch (error) {
      console.error('Customer creation error:', error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Invalid customer data", 
          errors: error.errors 
        });
      }
      res.status(500).json({ message: "Failed to create customer" });
    }
  });
  
  app.put("/api/customers/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid customer ID" });
      }
      
      const customerData = insertCustomerSchema.partial().parse(req.body);
      const customer = await storage.updateCustomer(id, customerData);
      
      if (!customer) {
        return res.status(404).json({ message: "Customer not found" });
      }
      
      res.json(customer);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid customer data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update customer" });
    }
  });
  
  app.delete("/api/customers/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid customer ID" });
      }
      
      const success = await storage.deleteCustomer(id);
      
      if (!success) {
        return res.status(404).json({ message: "Customer not found" });
      }
      
      res.status(204).end();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete customer" });
    }
  });
  
  // Customer Access Token routes
  app.post("/api/customer-access-token", async (req: Request, res: Response) => {
    try {
      // Validate email and businessId from request
      const schema = z.object({
        email: z.string().email(),
        businessId: z.number().int().positive(),
        sendEmail: z.boolean().optional().default(false)
      });
      
      const { email, businessId, sendEmail } = schema.parse(req.body);
      
      console.log(`Creating customer access token for: ${email}, business ID: ${businessId}`);
      
      // Find the customer with the provided email and business ID
      const customer = await storage.getCustomerByEmailAndBusinessId(email, businessId);
      
      if (!customer) {
        console.log(`Customer not found with email: ${email} for business ID: ${businessId}`);
        return res.status(404).json({ message: "Customer not found with the provided email for this business" });
      }
      
      console.log(`Found customer: ${customer.firstName} ${customer.lastName} (ID: ${customer.id})`);
      
      // First check if there's already a valid token for this customer
      try {
        // Query to find existing active tokens for this customer
        const { rows } = await pool.query(
          'SELECT * FROM customer_access_tokens WHERE customer_id = $1 AND business_id = $2 AND expires_at > NOW() ORDER BY created_at DESC LIMIT 1',
          [customer.id, businessId]
        );
        
        // If we found an existing valid token, use it instead of creating a new one
        if (rows.length > 0) {
          const existingToken = rows[0];
          console.log(`Found existing valid token (ID: ${existingToken.id}) for customer, expires: ${new Date(existingToken.expires_at).toISOString()}`);
          
          // Update the last_used_at timestamp
          await pool.query(
            'UPDATE customer_access_tokens SET last_used_at = NOW() WHERE id = $1',
            [existingToken.id]
          );
          
          // Get the business information for the email
          const business = await storage.getUser(businessId);
          
          if (sendEmail && business) {
            sendTokenEmail(req, existingToken.token, customer, business);
          }
          
          // Return the existing token
          return res.status(200).json({ 
            token: existingToken.token,
            expiresAt: existingToken.expires_at,
            message: "Using existing valid token"
          });
        }
      } catch (existingTokenError) {
        console.error("Error checking for existing tokens:", existingTokenError);
        // Continue with creating a new token if the check fails
      }
      
      // Generate a random token
      const token = crypto.randomBytes(32).toString('hex');
      
      // Set expiration to 7 days from now
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7);
      
      console.log(`Generated new token for customer ID ${customer.id}, expires: ${expiresAt.toISOString()}`);
      
      // Create the access token in the database
      let accessToken;
      try {
        accessToken = await storage.createCustomerAccessToken({
          customerId: customer.id,
          token,
          expiresAt,
          businessId: businessId
        });
        console.log(`Created new access token with ID: ${accessToken.id}`);
      } catch (tokenCreateError) {
        console.error("Error creating access token in database:", tokenCreateError);
        return res.status(500).json({ message: "Failed to create access token" });
      }
      
      // Get the business information
      const business = await storage.getUser(businessId);
      
      if (sendEmail && business) {
        sendTokenEmail(req, token, customer, business);
      }
      
      // Return the token
      res.status(201).json({ 
        token: accessToken.token,
        expiresAt: accessToken.expiresAt 
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid input data", errors: error.errors });
      }
      console.error("Error creating customer access token:", error);
      res.status(500).json({ message: "Failed to create customer access token" });
    }
  });
  
  app.get("/api/customer-profile", async (req: Request, res: Response) => {
    try {
      // Get the token from the Authorization header or query parameter
      const authHeader = req.headers.authorization;
      const token = authHeader?.startsWith('Bearer ') 
        ? authHeader.substring(7) 
        : req.query.token as string;
      
      console.log(`Customer-profile endpoint accessed with token: ${token ? token.substring(0, 10) + '...' : 'none'}`);
      
      if (!token) {
        console.log('No token provided in the request');
        return res.status(401).json({ message: "Access token is required" });
      }
      
      // Get the customer using the access token
      console.log(`Looking up customer with token: ${token.substring(0, 10)}...`);
      const customer = await storage.getCustomerByAccessToken(token);
      
      if (!customer) {
        console.log('No customer found with provided token');
        return res.status(401).json({ message: "Invalid or expired access token" });
      }
      
      console.log(`Found customer: ${customer.firstName} ${customer.lastName} (ID: ${customer.id})`);
      
      // Get the customer's appointments
      console.log(`Fetching appointments for customer ID: ${customer.id}`);
      const appointments = await storage.getAppointmentsByCustomerId(customer.id);
      console.log(`Found ${appointments.length} appointments for customer`);
      
      // Return the customer profile with appointments
      res.json({
        customer,
        appointments
      });
    } catch (error) {
      console.error("Error fetching customer profile:", error);
      // Provide more detailed error message
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      res.status(500).json({ 
        message: "Failed to fetch customer profile", 
        error: errorMessage 
      });
    }
  });
  
  // Send an access link to customer via email
  app.post("/api/send-customer-access-link", async (req: Request, res: Response) => {
    try {
      // Validate required fields
      const schema = z.object({
        email: z.string().email(),
        businessId: z.number().int().positive()
      });
      
      const { email, businessId } = schema.parse(req.body);
      
      // Find the customer with the provided email and business ID
      const customer = await storage.getCustomerByEmailAndBusinessId(email, businessId);
      
      if (!customer) {
        return res.status(404).json({ message: "Customer not found with the provided email for this business" });
      }
      
      // Get the business information
      const business = await storage.getUser(businessId);
      
      if (!business) {
        return res.status(404).json({ message: "Business not found" });
      }
      
      // Generate a new access token
      const token = crypto.randomBytes(32).toString('hex');
      
      // Set expiration to 7 days from now
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7);
      
      // Create the access token in the database
      await storage.createCustomerAccessToken({
        customerId: customer.id,
        token,
        expiresAt,
        businessId: businessId
      });
      
      // Get the base URL from request
      let baseUrl = `${req.protocol}://${req.get('host')}`;
      
      // If it's a custom domain or business slug access, adjust the URL
      if (req.business) {
        if (req.business.customDomain) {
          baseUrl = `https://${req.business.customDomain}`;
        } else if (req.business.businessSlug) {
          baseUrl = `${req.protocol}://${req.get('host')}/${req.business.businessSlug}`;
        }
      } else if (business.customDomain) {
        baseUrl = `https://${business.customDomain}`;
      } else if (business.businessSlug) {
        baseUrl = `${req.protocol}://${req.get('host')}/${business.businessSlug}`;
      }
      
      // Create the access URL
      const accessUrl = `${baseUrl}/customer-portal?token=${token}`;
      
      // Send email to the customer
      await transporter.sendMail({
        from: process.env.EMAIL_FROM || 'noreply@appointease.com',
        to: customer.email,
        subject: `Access Your ${business.businessName} Customer Portal`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2>Access Your Customer Portal</h2>
            <p>Hello ${customer.firstName},</p>
            <p>You can now access your customer portal for ${business.businessName} by clicking the button below.</p>
            <div style="margin: 30px 0;">
              <a href="${accessUrl}" style="background-color: #4f46e5; color: white; padding: 12px 20px; border-radius: 4px; text-decoration: none; font-weight: bold;">
                Access Customer Portal
              </a>
            </div>
            <p>This link will expire in 7 days.</p>
            <p>If you didn't request this email, you can safely ignore it.</p>
            <hr style="border: none; border-top: 1px solid #eaeaea; margin: 20px 0;" />
            <p style="color: #666; font-size: 12px;">
              Powered by AppointEase - Intelligent appointment scheduling for small businesses
            </p>
          </div>
        `,
        text: `
          Hello ${customer.firstName},
          
          You can now access your customer portal for ${business.businessName} by clicking the link below:
          
          ${accessUrl}
          
          This link will expire in 7 days.
          
          If you didn't request this email, you can safely ignore it.
          
          Powered by AppointEase - Intelligent appointment scheduling for small businesses
        `
      });
      
      res.json({ 
        message: "Access link sent successfully",
        email: customer.email
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid input data", errors: error.errors });
      }
      console.error("Error sending customer access link:", error);
      res.status(500).json({ message: "Failed to send customer access link" });
    }
  });
  
  /**
   * Check if a customer exists by email for a business
   * Used during appointment booking to identify existing customers
   */
  app.post("/api/check-customer-exists", async (req: Request, res: Response) => {
    try {
      // Validate required fields
      const schema = z.object({
        email: z.string().email(),
        businessId: z.number().int().positive()
      });
      
      const { email, businessId } = schema.parse(req.body);
      
      // Find the customer with the provided email and business ID
      const customer = await storage.getCustomerByEmailAndBusinessId(email, businessId);
      
      if (customer) {
        // Return customer data without sensitive information
        return res.json({
          exists: true,
          customer: {
            id: customer.id,
            firstName: customer.firstName,
            lastName: customer.lastName,
            email: customer.email,
            phone: customer.phone
          }
        });
      } else {
        // Return exists: false if no customer found
        return res.json({
          exists: false
        });
      }
    } catch (error) {
      console.error("Error checking if customer exists:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid input data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to check if customer exists" });
    }
  });
  
  /**
   * Zero-friction customer appointments endpoint
   * This endpoint allows customers to see their appointments by just providing their email
   * Security measures included:
   * - Rate limiting (implemented through middleware)
   * - No disclosure if an email exists or not
   * - Only returns limited data (future appointments only)
   * - Creates a customer profile silently if not found
   */
  app.post("/api/zero-friction-lookup", rateLimit({
    windowMs: 60 * 1000, // 1 minute window
    max: 3, // 3 requests per window
    standardHeaders: true, 
    message: { message: 'Too many requests, please try again later.', retryAfter: 60 }
  }), async (req: Request, res: Response) => {
    try {
      // Get the IP address for rate limiting
      const ipAddress = req.ip || req.socket.remoteAddress || 'unknown';
      
      // Very simple rate limiting - in production, use a proper rate limiting middleware
      const now = Date.now();
      const minute = 60 * 1000;
      const day = 24 * 60 * 60 * 1000;
      
      // Initialize rate limiting data structure if it doesn't exist
      if (!global.rateLimits) {
        global.rateLimits = {
          byIP: new Map()
        };
      }
      
      // Get or create rate limit record for this IP
      let rateLimitData = global.rateLimits.byIP.get(ipAddress) || {
        requestsPerMinute: [],
        requestsPerDay: []
      };
      
      // Clean up old entries
      rateLimitData.requestsPerMinute = rateLimitData.requestsPerMinute.filter(
        time => now - time < minute
      );
      rateLimitData.requestsPerDay = rateLimitData.requestsPerDay.filter(
        time => now - time < day
      );
      
      // Check rate limits (3/minute, 20/day)
      if (rateLimitData.requestsPerMinute.length >= 3) {
        return res.status(429).json({ 
          message: "Too many requests. Please try again later.",
          retryAfter: 60 // seconds
        });
      }
      
      if (rateLimitData.requestsPerDay.length >= 20) {
        return res.status(429).json({ 
          message: "Daily limit exceeded. Please try again tomorrow.",
          retryAfter: 86400 // seconds (24 hours)
        });
      }
      
      // Update rate limit tracking
      rateLimitData.requestsPerMinute.push(now);
      rateLimitData.requestsPerDay.push(now);
      global.rateLimits.byIP.set(ipAddress, rateLimitData);
      
      // Validate email from request
      const schema = z.object({
        email: z.string().email(),
        businessId: z.number().int().positive()
      });
      
      const { email, businessId } = schema.parse(req.body);
      
      // Find the business
      const business = await storage.getUser(businessId);
      if (!business) {
        // Don't disclose business doesn't exist for security
        return res.status(200).json({ 
          message: "Check your upcoming bookings.",
          appointments: [] 
        });
      }
      
      // Find the customer with the provided email and business ID
      let customer = await storage.getCustomerByEmailAndBusinessId(email, businessId);
      
      // If customer doesn't exist, create a new customer profile silently
      if (!customer) {
        try {
          // Extract potential name from email (e.g., john.doe@example.com -> John Doe)
          const emailPrefix = email.split('@')[0];
          const nameParts = emailPrefix.split(/[._-]/);
          const firstName = nameParts[0].charAt(0).toUpperCase() + nameParts[0].slice(1);
          const lastName = nameParts.length > 1 
            ? nameParts[1].charAt(0).toUpperCase() + nameParts[1].slice(1) 
            : '';
          
          // Create the customer with minimal information
          customer = await storage.createCustomer({
            userId: businessId,
            email: email,
            firstName: firstName,
            lastName: lastName,
            phone: null,
            notes: "Auto-created through zero-friction portal"
          });
        } catch (error) {
          console.error("Error creating customer profile:", error);
          // Continue even if profile creation fails - just return empty appointments
        }
      }
      
      // If we have a customer, get their appointments
      let appointments = [];
      if (customer) {
        // Get current and future appointments
        const now = new Date();
        // Set time to beginning of day to include today's appointments
        now.setHours(0, 0, 0, 0);
        const allAppointments = await storage.getAppointmentsByCustomerId(customer.id);
        
        // Filter for future and today's appointments that are scheduled or pending
        appointments = allAppointments.filter(appt => {
          const apptDate = new Date(appt.date);
          return apptDate >= now && (appt.status === 'scheduled' || appt.status === 'pending');
        });
        
        // Fetch services to get service names
        const serviceIds = [...new Set(appointments.map(a => a.serviceId))];
        const services = await Promise.all(
          serviceIds.map(id => storage.getService(id))
        );
        
        // Map to simplified view with only necessary fields
        appointments = appointments.map(appointment => {
          const service = services.find(s => s && s.id === appointment.serviceId);
          const appointmentDate = new Date(appointment.date);
          
          return {
            id: appointment.id,
            date: appointmentDate.toISOString(),
            formattedDate: appointmentDate.toLocaleDateString('en-US', { 
              month: 'short', 
              day: 'numeric', 
              year: 'numeric' 
            }),
            formattedTime: appointmentDate.toLocaleTimeString('en-US', { 
              hour: 'numeric', 
              minute: '2-digit',
              hour12: true 
            }),
            serviceName: service ? service.name : 'Service',
            duration: appointment.duration,
            status: appointment.status,
            businessName: business.businessName
          };
        });
      }
      
      // Get customer initials for display
      let initials = '';
      if (customer) {
        if (customer.firstName) {
          initials += customer.firstName.charAt(0).toUpperCase();
        }
        if (customer.lastName) {
          initials += customer.lastName.charAt(0).toUpperCase();
        }
      }
      
      // Set a cookie to remember the user for 48 hours if they have appointments
      if (customer && appointments.length > 0) {
        res.cookie('appointease_email', email, {
          maxAge: 48 * 60 * 60 * 1000, // 48 hours
          httpOnly: true,
          secure: req.secure,
          sameSite: 'lax'
        });
      }
      
      // Same response regardless if the email exists or not - for privacy
      return res.status(200).json({
        message: "Check your upcoming bookings.",
        customerExists: !!customer,
        customerInitials: initials || null,
        customerFirstName: customer && customer.firstName ? customer.firstName : null,
        appointments
      });
      
    } catch (error) {
      console.error("Error in zero-friction portal:", error);
      // For security, don't expose details of the error
      res.status(200).json({ 
        message: "There was an issue processing your request.",
        appointments: [] 
      });
    }
  });
  
  // Appointment routes
  app.get("/api/appointments", async (req: Request, res: Response) => {
    try {
      // Get userId from business context or query parameter
      let userId: number;
      
      if (req.business) {
        // If we have a business context from the URL or domain, use that
        userId = req.business.id;
      } else {
        // Otherwise use the userId query parameter (or default to 1)
        const userIdParam = req.query.userId as string;
        userId = userIdParam ? parseInt(userIdParam) : 1;
        
        if (isNaN(userId)) {
          return res.status(400).json({ message: "Invalid user ID" });
        }
      }
      
      let appointments;
      if (req.query.startDate && req.query.endDate) {
        const startDate = new Date(req.query.startDate as string);
        const endDate = new Date(req.query.endDate as string);
        appointments = await storage.getAppointmentsByDateRange(userId, startDate, endDate);
      } else if (req.query.customerId) {
        // For customer portal, allow fetching by customer ID
        const customerId = parseInt(req.query.customerId as string);
        if (!isNaN(customerId)) {
          appointments = await storage.getAppointmentsByCustomerId(customerId);
        } else {
          appointments = await storage.getAppointmentsByUserId(userId);
        }
      } else {
        appointments = await storage.getAppointmentsByUserId(userId);
      }
      
      res.json(appointments);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch appointments" });
    }
  });
  
  app.post("/api/appointments", async (req: Request, res: Response) => {
    try {
      console.log("Received appointment data:", JSON.stringify(req.body));
      
      // Validate appointment data
      try {
        const appointmentData = insertAppointmentSchema.parse(req.body);
        console.log("Validated appointment data:", JSON.stringify(appointmentData));
        
        // Create an appointment object with correct date type
        const processedAppointmentData = {
          ...appointmentData,
          // Convert date string to Date object if it's a string
          date: typeof appointmentData.date === 'string' 
            ? new Date(appointmentData.date) 
            : appointmentData.date
        };
        
        console.log("Processed appointment data:", JSON.stringify({
          ...processedAppointmentData,
          date: processedAppointmentData.date.toISOString()
        }));

        // Get the service to check capacity limits
        const service = await storage.getService(processedAppointmentData.serviceId);
        if (!service) {
          return res.status(404).json({ message: "Service not found" });
        }

        // For class-based services, check if there's still capacity available
        if (service.serviceType === 'class' && service.capacity && service.capacity > 1) {
          // Get existing appointments for this service on this date
          const userId = processedAppointmentData.userId;
          const appointmentDate = processedAppointmentData.date;
          const startOfDay = new Date(appointmentDate);
          startOfDay.setHours(0, 0, 0, 0);
          
          const endOfDay = new Date(appointmentDate);
          endOfDay.setHours(23, 59, 59, 999);

          const dailyAppointments = await storage.getAppointmentsByDateRange(userId, startOfDay, endOfDay);

          // Import the checkServiceAvailability function
          const { checkServiceAvailability } = await import('../shared/serviceUtils.js');
          
          // Check if there's capacity available
          const availabilityCheck = await checkServiceAvailability(
            service,
            dailyAppointments,
            appointmentDate
          );

          if (!availabilityCheck.available) {
            return res.status(400).json({ 
              message: "Class is full", 
              capacity: availabilityCheck.capacity,
              booked: availabilityCheck.booked,
              remaining: availabilityCheck.remaining
            });
          }
        }
        
        // Create appointment
        const appointment = await storage.createAppointment(processedAppointmentData);
        console.log("Created appointment:", JSON.stringify(appointment));
        
        res.status(201).json(appointment);
      } catch (validationError) {
        console.error("Validation error:", validationError);
        if (validationError instanceof z.ZodError) {
          return res.status(400).json({ 
            message: "Invalid appointment data", 
            errors: validationError.errors,
            formattedErrors: validationError.errors.map(err => `${err.path.join('.')}: ${err.message}`) 
          });
        }
        throw validationError; // Re-throw for the outer catch block
      }
    } catch (error) {
      console.error("Failed to create appointment:", error);
      res.status(500).json({ message: "Failed to create appointment", error: String(error) });
    }
  });
  
  app.put("/api/appointments/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid appointment ID" });
      }
      
      const appointmentData = insertAppointmentSchema.partial().parse(req.body);
      
      // Create updated appointment data with proper date conversion
      const processedAppointmentData = appointmentData.date
        ? {
            ...appointmentData,
            // Convert date string to Date object if it's a string
            date: typeof appointmentData.date === 'string'
              ? new Date(appointmentData.date)
              : appointmentData.date
          }
        : appointmentData;
        
      const appointment = await storage.updateAppointment(id, processedAppointmentData);
      
      if (!appointment) {
        return res.status(404).json({ message: "Appointment not found" });
      }
      
      res.json(appointment);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid appointment data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update appointment" });
    }
  });
  
  app.delete("/api/appointments/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid appointment ID" });
      }
      
      const success = await storage.deleteAppointment(id);
      
      if (!success) {
        return res.status(404).json({ message: "Appointment not found" });
      }
      
      res.status(204).end();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete appointment" });
    }
  });
  
  // Email notification route
  app.post("/api/send-reminder", async (req: Request, res: Response) => {
    try {
      const { appointmentId } = req.body;
      
      console.log("Sending reminder for appointment ID:", appointmentId);
      
      if (!appointmentId) {
        return res.status(400).json({ message: "Appointment ID is required" });
      }
      
      const appointment = await storage.getAppointment(appointmentId);
      
      if (!appointment) {
        return res.status(404).json({ message: "Appointment not found" });
      }
      
      const customer = await storage.getCustomer(appointment.customerId);
      const service = await storage.getService(appointment.serviceId);
      
      if (!customer || !service) {
        return res.status(404).json({ message: "Customer or service not found" });
      }
      
      // Format the date
      const appointmentDate = new Date(appointment.date);
      const formattedDate = appointmentDate.toLocaleDateString();
      const formattedTime = appointmentDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      
      // For development: Just log the email we would send
      // In production, we would use a service like SendGrid or use a configured SMTP server
      console.log("Would send email reminder with the following details:");
      console.log(`To: ${customer.email}`);
      console.log(`Subject: Appointment Reminder: ${service.name} on ${formattedDate}`);
      console.log(`Content: Reminder for ${customer.firstName} ${customer.lastName} about ${service.name} on ${formattedDate} at ${formattedTime}`);
      
      // In a real implementation, we would use:
      // const info = await transporter.sendMail({...}); 
      
      // Mock successful email sending
      const mockMessageId = `mock_${Date.now()}_${appointmentId}@appointease.com`;
      
      // Update appointment to mark reminder as sent
      await storage.updateAppointment(appointmentId, { reminderSent: true });
      
      res.json({ 
        message: "Reminder sent successfully (simulated for development)",
        messageId: mockMessageId,
        details: {
          recipient: customer.email,
          subject: `Appointment Reminder: ${service.name} on ${formattedDate}`,
          appointmentDate: formattedDate,
          appointmentTime: formattedTime
        }
      });
    } catch (error) {
      console.error("Error sending reminder:", error);
      res.status(500).json({ message: "Failed to send reminder" });
    }
  });
  
  // Using MercadoPago helpers imported at the top of the file
  
  // Payment routes
  app.post("/api/create-payment-intent", async (req: Request, res: Response) => {
    try {
      const { appointmentId } = req.body;
      
      if (!appointmentId) {
        return res.status(400).json({ message: "Appointment ID is required" });
      }
      
      const appointment = await storage.getAppointment(appointmentId);
      
      if (!appointment) {
        return res.status(404).json({ message: "Appointment not found" });
      }
      
      const service = await storage.getService(appointment.serviceId);
      
      if (!service) {
        return res.status(404).json({ message: "Service not found" });
      }
      
      // Get the business user information
      const business = await storage.getUser(appointment.userId);
      
      if (!business) {
        return res.status(404).json({ message: "Business not found" });
      }
      
      // Get the customer information
      const customer = await storage.getCustomer(appointment.customerId);
      
      if (!customer) {
        return res.status(404).json({ message: "Customer not found" });
      }
      
      // Calculate platform fee
      const platformFeePercentage = parseFloat(business.platformFeePercentage?.toString() || "2.00");
      const amount = parseFloat(service.price.toString());
      const platformFeeAmount = (amount * platformFeePercentage) / 100;
      const businessAmount = amount - platformFeeAmount;
      
      try {
        // Create a MercadoPago preference with payment details
        // Check if business has MercadoPago configured
        if (!business.mercadopagoAccessToken) {
          // No MercadoPago integration, use mock for development
          console.log("MercadoPago not configured for business, using mock payment flow");
          
          // For development: generate a mock preference
          const mockClientSecret = `mp_test_${Date.now()}_${appointmentId}`;
          const mockPreferenceId = `pref_${Date.now()}`;
          
          // Create a payment record
          await storage.createPayment({
            appointmentId: appointment.id,
            amount: service.price,
            status: "pending",
            paymentProcessor: "mercadopago",
            processorPaymentId: mockClientSecret,
            merchantAccountId: business.mercadopagoAccountId || null,
            platformFeePercentage: platformFeePercentage.toString(),
            platformFeeAmount: platformFeeAmount.toString(),
            businessAmount: businessAmount.toString(),
            preferenceId: mockPreferenceId,
          });
          
          // Return mock data
          return res.json({
            clientSecret: mockClientSecret,
            paymentUrl: `/payment/mock?appointmentId=${appointmentId}`,
            preferenceId: mockPreferenceId,
            isMockPayment: true
          });
        }
        
        // Using real MercadoPago integration
        const preferenceResult = await createPreference(business, service, customer, appointment);
        
        if (!preferenceResult) {
          throw new Error("Failed to create MercadoPago preference");
        }
        
        // Save payment information with marketplace split details
        await storage.createPayment({
          appointmentId: appointment.id,
          amount: service.price,
          status: "pending",
          paymentProcessor: "mercadopago",
          processorPaymentId: preferenceResult.preference.id,
          merchantAccountId: business.mercadopagoAccountId || null,
          platformFeePercentage: platformFeePercentage.toString(),
          platformFeeAmount: preferenceResult.platformFeeAmount.toString(),
          businessAmount: preferenceResult.businessAmount.toString(),
          preferenceId: preferenceResult.preference.id,
          paymentUrl: preferenceResult.preference.init_point,
          metadata: JSON.stringify({
            externalReference: preferenceResult.externalReference
          })
        });
        
        // Return client secret and payment URL for the frontend
        res.json({ 
          clientSecret: preferenceResult.preference.id,
          paymentUrl: preferenceResult.preference.init_point,
          preferenceId: preferenceResult.preference.id,
          isMockPayment: false
        });
      } catch (mpError) {
        console.error("MercadoPago error:", mpError);
        return res.status(500).json({ message: "Payment processing failed: " + mpError.message });
      }
    } catch (error) {
      console.error("Payment processing error:", error);
      res.status(500).json({ message: "Payment processing failed" });
    }
  });
  
  app.post("/api/confirm-payment", async (req: Request, res: Response) => {
    try {
      const { paymentIntentId, appointmentId } = req.body;
      
      if (!paymentIntentId || !appointmentId) {
        return res.status(400).json({ message: "Payment Intent ID and Appointment ID are required" });
      }
      
      // Update appointment payment status
      const appointment = await storage.updateAppointment(parseInt(appointmentId), {
        paymentStatus: "paid",
      });
      
      if (!appointment) {
        return res.status(404).json({ message: "Appointment not found" });
      }
      
      // Find and update payment record
      const payments = await storage.getPaymentsByAppointmentId(parseInt(appointmentId));
      
      if (payments.length > 0) {
        const payment = payments[0];
        await storage.updatePayment(payment.id, {
          status: "completed",
        });
      }
      
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ message: "Failed to confirm payment" });
    }
  });
  
  // MercadoPago webhook handler
  app.post("/api/webhooks/mercadopago", async (req: Request, res: Response) => {
    try {
      const data = req.body;
      console.log("Received MercadoPago webhook:", JSON.stringify(data));
      
      // Process the webhook data
      const result = await processWebhook(data);
      
      if (!result) {
        return res.status(200).end(); // Acknowledge receipt even if not a payment notification
      }
      
      // Extract appointment ID from the external reference (format: app_APPOINTMENTID_TIMESTAMP)
      const externalRefParts = result.externalReference.split('_');
      if (externalRefParts.length < 2) {
        return res.status(400).json({ message: "Invalid external reference format" });
      }
      
      const appointmentId = parseInt(externalRefParts[1]);
      
      if (isNaN(appointmentId)) {
        return res.status(400).json({ message: "Invalid appointment ID in external reference" });
      }
      
      // Find the appointment
      const appointment = await storage.getAppointment(appointmentId);
      
      if (!appointment) {
        return res.status(404).json({ message: "Appointment not found" });
      }
      
      // Update appointment status based on payment status
      if (result.status === "approved") {
        await storage.updateAppointment(appointmentId, {
          paymentStatus: "paid",
        });
        
        // Update payment record
        const payments = await storage.getPaymentsByAppointmentId(appointmentId);
        
        if (payments.length > 0) {
          const payment = payments[0];
          await storage.updatePayment(payment.id, {
            status: "completed",
            processorPaymentId: result.paymentId.toString()
          });
        }
      }
      
      // Return success response
      res.status(200).json({ success: true });
    } catch (error) {
      console.error("Error processing MercadoPago webhook:", error);
      res.status(500).json({ message: "Failed to process webhook" });
    }
  });

  // Availability analysis endpoint
  app.get("/api/availability-analysis", async (req: Request, res: Response) => {
    try {
      // Get userId from business context or query parameter
      let userId: number;
      
      if (req.business) {
        // If we have a business context from the URL or domain, use that
        userId = req.business.id;
      } else {
        // Otherwise use the userId query parameter (or default to 1)
        const userIdParam = req.query.userId as string;
        userId = userIdParam ? parseInt(userIdParam) : 1;
        
        if (isNaN(userId)) {
          return res.status(400).json({ message: "Invalid user ID" });
        }
      }
      
      // Get all appointments for analysis
      const appointments = await storage.getAppointmentsByUserId(userId);
      
      // Initialize data structures for analysis
      const hourlyCount: Record<string, number> = {};
      const dayOfWeekCount: Record<string, number> = {};
      const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      
      // Initialize with zeros
      for (let hour = 8; hour < 20; hour++) {
        hourlyCount[hour] = 0;
      }
      
      for (const day of daysOfWeek) {
        dayOfWeekCount[day] = 0;
      }
      
      // Count appointments by hour and day of week
      appointments.forEach(appointment => {
        const date = new Date(appointment.date);
        const hour = date.getHours();
        const dayOfWeek = daysOfWeek[date.getDay()];
        
        if (hourlyCount[hour] !== undefined) {
          hourlyCount[hour]++;
        }
        
        dayOfWeekCount[dayOfWeek]++;
      });
      
      // Determine peak hours (top 30% of hours by appointment count)
      const hourEntries = Object.entries(hourlyCount);
      const sortedHourEntries = hourEntries.sort((a, b) => b[1] - a[1]);
      const peakHourCount = Math.ceil(sortedHourEntries.length * 0.3);
      const peakHours = sortedHourEntries.slice(0, peakHourCount).map(entry => parseInt(entry[0]));
      
      // Determine peak days (top 40% of days by appointment count)
      const dayEntries = Object.entries(dayOfWeekCount);
      const sortedDayEntries = dayEntries.sort((a, b) => b[1] - a[1]);
      const peakDayCount = Math.ceil(sortedDayEntries.length * 0.4);
      const peakDays = sortedDayEntries.slice(0, peakDayCount).map(entry => entry[0]);
      
      // Return the analysis
      res.json({
        hourlyCount,
        dayOfWeekCount,
        peakHours,
        peakDays,
        offPeakHours: sortedHourEntries.slice(peakHourCount).map(entry => parseInt(entry[0])),
        offPeakDays: sortedDayEntries.slice(peakDayCount).map(entry => entry[0]),
        totalAppointments: appointments.length
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to analyze availability" });
    }
  });

  // Custom domain and SSL management routes
  app.get("/api/domains", async (req: Request, res: Response) => {
    try {
      // Check if the user is part of request context (from businessExtractor)
      // Or if the request has a specific user ID
      const userId = req.body.userId || req.query.userId;
      
      if (!userId) {
        return res.status(401).json({ message: "User ID required" });
      }
      
      // Get the registered domains for this user from the database
      const registeredDomains = await getRegisteredDomains();
      const userDomains = registeredDomains.filter(domain => domain.user_id === Number(userId));
      
      // Return the domains
      res.json({ domains: userDomains });
    } catch (error) {
      console.error("Error fetching domains:", error);
      res.status(500).json({ message: "Failed to fetch domains" });
    }
  });
  
  // Route to register a new custom domain
  app.post("/api/domains", async (req: Request, res: Response) => {
    try {
      // Get the user ID from the request body
      const { userId, domain } = req.body;
      
      if (!userId) {
        return res.status(401).json({ message: "User ID required" });
      }
      
      if (!domain) {
        return res.status(400).json({ message: "Domain is required" });
      }
      
      // Validate domain format with a regex
      const domainRegex = /^[a-zA-Z0-9][a-zA-Z0-9-]{1,61}[a-zA-Z0-9]\.[a-zA-Z]{2,}$/;
      if (!domainRegex.test(domain)) {
        return res.status(400).json({ message: "Invalid domain format" });
      }
      
      // Register the domain
      const registered = await manuallyRegisterDomain(domain, Number(userId));
      
      // Update the user's customDomain field
      if (registered) {
        const user = await storage.getUser(Number(userId));
        if (user) {
          // Update using raw SQL for now - more compatible with different DB setups
          await db.execute(sql`
            UPDATE users 
            SET custom_domain = ${domain} 
            WHERE id = ${Number(userId)}
          `);
          
          res.status(201).json({ message: "Domain registered successfully", domain });
        } else {
          res.status(404).json({ message: "User not found" });
        }
      } else {
        res.status(400).json({ message: "Domain already registered" });
      }
    } catch (error) {
      console.error("Error registering domain:", error);
      res.status(500).json({ message: "Failed to register domain" });
    }
  });
  
  /**
   * Update business theme settings
   * This endpoint updates the theme settings for the current logged-in business
   */
  /**
   * GET /api/business/theme
   * Retrieve the theme for the current business
   */
  app.get("/api/business/theme", async (req: Request, res: Response) => {
    try {
      if (!req.session?.user) {
        return res.status(401).json({ message: "Authentication required" });
      }
      
      const userId = req.session.user.id;
      
      // Get the theme for the business
      const theme = await getThemeForBusiness(userId);
      
      return res.json({ theme });
    } catch (error) {
      console.error('Error fetching business theme:', error);
      return res.status(500).json({ message: "Failed to fetch business theme" });
    }
  });
  
  /**
   * POST /api/business/theme
   * Update the theme for the current business
   */
  app.post("/api/business/theme", async (req: Request, res: Response) => {
    try {
      if (!req.session?.user) {
        return res.status(401).json({ message: "Authentication required" });
      }
      
      const userId = req.session.user.id;
      const { theme } = req.body;
      
      if (!theme || typeof theme !== 'object') {
        return res.status(400).json({ message: "Invalid theme format" });
      }
      
      // Validate required theme properties - supporting both naming conventions
      const requiredPropertyMappings = [
        ['primary', 'primaryColor'],
        ['secondary', 'secondaryColor'], 
        ['background', 'backgroundColor'], 
        ['text', 'textColor']
      ];
      
      // Check each required property, allowing either naming convention
      for (const [oldProp, newProp] of requiredPropertyMappings) {
        // If neither property exists, return an error
        if (!theme[oldProp] && !theme[newProp]) {
          return res.status(400).json({ 
            message: `Missing required theme property: ${oldProp} or ${newProp}. At least one must be provided.`
          });
        }
        
        // If the old property exists, validate it
        if (theme[oldProp] && (typeof theme[oldProp] !== 'string' || !theme[oldProp].match(/^#[0-9A-Fa-f]{6}$/))) {
          return res.status(400).json({ 
            message: `Invalid theme property: ${oldProp}. Must be a valid hex color.`
          });
        }
        
        // If the new property exists, validate it
        if (theme[newProp] && (typeof theme[newProp] !== 'string' || !theme[newProp].match(/^#[0-9A-Fa-f]{6}$/))) {
          return res.status(400).json({ 
            message: `Invalid theme property: ${newProp}. Must be a valid hex color.`
          });
        }
      }
      
      // Normalize the theme to ensure both naming conventions are present
      for (const [oldProp, newProp] of requiredPropertyMappings) {
        if (theme[oldProp] && !theme[newProp]) {
          theme[newProp] = theme[oldProp];
        } else if (theme[newProp] && !theme[oldProp]) {
          theme[oldProp] = theme[newProp];
        }
      }
      
      // Update the theme in the database
      await updateThemeForBusiness(userId, theme);
      
      return res.json({ 
        message: "Theme updated successfully",
        theme
      });
    } catch (error) {
      console.error('Error updating business theme:', error);
      return res.status(500).json({ message: "Failed to update business theme" });
    }
  });
  
  /**
   * GET /api/business/default-theme
   * Get the default theme for reference - this should be accessible without authentication
   */
  app.get("/api/business/default-theme", (_req: Request, res: Response) => {
    return res.json({ theme: defaultTheme });
  });
  
  /**
   * Legacy endpoint - Kept for backward compatibility
   * This endpoint will be deprecated in future versions
   */
  app.patch("/api/business/theme-settings", async (req: Request, res: Response) => {
    try {
      if (!req.session?.user) {
        return res.status(401).json({ message: "Authentication required" });
      }
      
      const userId = req.session.user.id;
      const { themeSettings } = req.body;
      
      if (!themeSettings || typeof themeSettings !== 'object') {
        return res.status(400).json({ message: "Invalid theme settings format" });
      }

      // Check if theme_settings column exists before trying to update it
      const checkResult = await pool.query(`
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name = 'users' AND column_name = 'theme_settings'
      `);
      
      if (checkResult.rows.length === 0) {
        // Add the column if it doesn't exist
        await pool.query(`
          ALTER TABLE users 
          ADD COLUMN theme_settings JSONB DEFAULT '{
            "primaryColor": "indigo-600",
            "secondaryColor": "gray-200",
            "accentColor": "amber-500",
            "textColor": "gray-800",
            "backgroundColor": "white",
            "fontFamily": "sans-serif",
            "borderRadius": "rounded-md",
            "buttonStyle": "rounded",
            "cardStyle": "elevated"
          }'
        `);
      }
      
      // Update theme settings using native PostgreSQL query to handle JSONB
      await pool.query(`
        UPDATE users 
        SET theme_settings = $1::jsonb
        WHERE id = $2
      `, [JSON.stringify(themeSettings), userId]);
      
      // Also update the new theme column for consistency
      const theme = {
        name: "Legacy Settings",  // Add a name for the theme
        // Include both naming conventions for maximum compatibility
        primary: themeSettings.primaryColor || '#1E3A8A',
        primaryColor: themeSettings.primaryColor || '#1E3A8A',
        secondary: themeSettings.secondaryColor || '#9333EA',
        secondaryColor: themeSettings.secondaryColor || '#9333EA',
        background: themeSettings.backgroundColor || '#FFFFFF',
        backgroundColor: themeSettings.backgroundColor || '#FFFFFF',
        text: themeSettings.textColor || '#111827',
        textColor: themeSettings.textColor || '#111827',
        accent: themeSettings.accentColor || '#F59E0B',
        accentColor: themeSettings.accentColor || '#F59E0B',
        appearance: themeSettings.appearance || 'system',
        fontFamily: themeSettings.fontFamily || defaultTheme.fontFamily,
        font: themeSettings.fontFamily || defaultTheme.fontFamily,
        borderRadius: themeSettings.borderRadius || defaultTheme.borderRadius,
        spacing: themeSettings.spacing || defaultTheme.spacing,
        buttonStyle: themeSettings.buttonStyle || 'default',
        cardStyle: themeSettings.cardStyle || 'default',
        variant: themeSettings.variant || 'professional'
      };
      
      await updateThemeForBusiness(userId, theme);
      
      return res.json({ success: true, themeSettings });
    } catch (error) {
      console.error('Error updating theme settings:', error);
      return res.status(500).json({ message: "Failed to update theme settings" });
    }
  });
  
  /**
   * Update business location information
   * PATCH /api/business/location
   */
  app.patch("/api/business/location", async (req: Request, res: Response) => {
    try {
      if (!req.isAuthenticated()) {
        console.log('User not authenticated for location update');
        return res.status(401).json({ message: "Authentication required" });
      }
      
      const userId = req.user.id;
      const { address, city, state, postalCode, country, latitude, longitude } = req.body;
      
      // Update the business location in the database
      try {
        await db.execute(sql`
          UPDATE users
          SET 
            address = ${address || null},
            city = ${city || null},
            state = ${state || null},
            postal_code = ${postalCode || null},
            country = ${country || null},
            latitude = ${latitude || null},
            longitude = ${longitude || null},
            updated_at = NOW()
          WHERE id = ${userId}
        `);
        
        console.log(`Updated location for business ID: ${userId}`);
        
        // Return success
        return res.json({ 
          message: "Location updated successfully",
          location: {
            address,
            city,
            state,
            postalCode,
            country,
            latitude,
            longitude
          }
        });
      } catch (dbError) {
        console.error('Error updating location:', dbError);
        return res.status(500).json({ message: "Database error while updating location" });
      }
    } catch (error) {
      console.error('Error updating business location:', error);
      return res.status(500).json({ message: "Failed to update business location" });
    }
  });

  /**
   * Update business industry type (template)
   * This endpoint updates the industry type for the current logged-in business
   */
  app.patch("/api/business/industry-type", async (req: Request, res: Response) => {
    try {
      if (!req.session?.user) {
        return res.status(401).json({ message: "Authentication required" });
      }
      
      const userId = req.session.user.id;
      const { industryType } = req.body;
      
      if (!industryType || !['salon', 'fitness', 'medical', 'general'].includes(industryType)) {
        return res.status(400).json({ message: "Invalid industry type" });
      }

      // Check if industry_type column exists before trying to update it
      const checkResult = await pool.query(`
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name = 'users' AND column_name = 'industry_type'
      `);
      
      if (checkResult.rows.length === 0) {
        // Add the column if it doesn't exist
        await pool.query(`
          ALTER TABLE users 
          ADD COLUMN industry_type TEXT DEFAULT 'general'
        `);
      }
      
      // Update industry type
      await pool.query(`
        UPDATE users 
        SET industry_type = $1
        WHERE id = $2
      `, [industryType, userId]);
      
      return res.json({ success: true, industryType });
    } catch (error) {
      console.error('Error updating industry type:', error);
      return res.status(500).json({ message: "Failed to update industry type" });
    }
  });
  
  // API endpoint to update a business's platform fee percentage
  app.patch("/api/business/platform-fee", async (req: Request, res: Response) => {
    try {
      const { userId, platformFeePercentage } = req.body;
      
      if (!userId) {
        return res.status(400).json({ message: "User ID is required" });
      }
      
      if (platformFeePercentage === undefined || platformFeePercentage === null) {
        return res.status(400).json({ message: "Platform fee percentage is required" });
      }
      
      // Validate the platform fee percentage (must be a number between 0 and 100)
      const feePercentage = parseFloat(platformFeePercentage);
      if (isNaN(feePercentage) || feePercentage < 0 || feePercentage > 100) {
        return res.status(400).json({ message: "Platform fee percentage must be a number between 0 and 100" });
      }
      
      // Update the user's platform fee percentage
      const user = await storage.getUser(parseInt(userId.toString()));
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Update using raw SQL
      await db.execute(sql`
        UPDATE users 
        SET platform_fee_percentage = ${feePercentage.toString()} 
        WHERE id = ${parseInt(userId.toString())}
      `);
      
      res.json({ 
        message: "Platform fee percentage updated successfully",
        platformFeePercentage: feePercentage 
      });
    } catch (error) {
      console.error("Error updating platform fee percentage:", error);
      res.status(500).json({ message: "Failed to update platform fee percentage" });
    }
  });
  
  // Product routes
  app.get("/api/products", async (req: Request, res: Response) => {
    try {
      if (!req.session?.user) {
        return res.status(401).json({ message: "Authentication required" });
      }
      
      const userId = req.session.user.id;
      let products;
      
      if (req.query.category) {
        products = await storage.getProductsByCategory(userId, req.query.category as string);
      } else {
        products = await storage.getProductsByUserId(userId);
      }
      
      return res.json(products);
    } catch (error) {
      console.error("Error fetching products:", error);
      return res.status(500).json({ message: "Failed to fetch products" });
    }
  });

  app.post("/api/products", async (req: Request, res: Response) => {
    try {
      if (!req.session?.user) {
        return res.status(401).json({ message: "Authentication required" });
      }
      
      const userId = req.session.user.id;
      const productData = insertProductSchema.parse({
        ...req.body,
        userId
      });
      
      const product = await storage.createProduct(productData);
      return res.status(201).json(product);
    } catch (error) {
      console.error("Error creating product:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid product data", errors: error.errors });
      }
      return res.status(500).json({ message: "Failed to create product" });
    }
  });

  app.get("/api/products/:id", async (req: Request, res: Response) => {
    try {
      if (!req.session?.user) {
        return res.status(401).json({ message: "Authentication required" });
      }
      
      const productId = parseInt(req.params.id);
      if (isNaN(productId)) {
        return res.status(400).json({ message: "Invalid product ID" });
      }
      
      const product = await storage.getProduct(productId);
      
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
      
      // Ensure user can only access their own products
      if (product.userId !== req.session.user.id) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      return res.json(product);
    } catch (error) {
      console.error("Error fetching product:", error);
      return res.status(500).json({ message: "Failed to fetch product" });
    }
  });

  app.put("/api/products/:id", async (req: Request, res: Response) => {
    try {
      if (!req.session?.user) {
        return res.status(401).json({ message: "Authentication required" });
      }
      
      const productId = parseInt(req.params.id);
      if (isNaN(productId)) {
        return res.status(400).json({ message: "Invalid product ID" });
      }
      
      const product = await storage.getProduct(productId);
      
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
      
      // Ensure user can only update their own products
      if (product.userId !== req.session.user.id) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      const productData = insertProductSchema.partial().parse(req.body);
      
      // Prevent changing the userId
      delete productData.userId;
      
      const updatedProduct = await storage.updateProduct(productId, productData);
      return res.json(updatedProduct);
    } catch (error) {
      console.error("Error updating product:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid product data", errors: error.errors });
      }
      return res.status(500).json({ message: "Failed to update product" });
    }
  });

  app.delete("/api/products/:id", async (req: Request, res: Response) => {
    try {
      if (!req.session?.user) {
        return res.status(401).json({ message: "Authentication required" });
      }
      
      const productId = parseInt(req.params.id);
      if (isNaN(productId)) {
        return res.status(400).json({ message: "Invalid product ID" });
      }
      
      const product = await storage.getProduct(productId);
      
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
      
      // Ensure user can only delete their own products
      if (product.userId !== req.session.user.id) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      await storage.deleteProduct(productId);
      return res.status(204).end();
    } catch (error) {
      console.error("Error deleting product:", error);
      return res.status(500).json({ message: "Failed to delete product" });
    }
  });
  
  // Product Variants routes
  app.get("/api/products/:productId/variants", async (req: Request, res: Response) => {
    try {
      if (!req.session?.user) {
        return res.status(401).json({ message: "Authentication required" });
      }
      
      const productId = parseInt(req.params.productId);
      
      if (isNaN(productId)) {
        return res.status(400).json({ message: "Invalid product ID" });
      }
      
      // Get the product to verify ownership
      const product = await storage.getProduct(productId);
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
      
      // Ensure user can only access variants of their own products
      if (product.userId !== req.session.user.id) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      const variants = await storage.getProductVariantsByProductId(productId);
      return res.json(variants);
    } catch (error) {
      console.error("Error fetching product variants:", error);
      return res.status(500).json({ message: "Failed to fetch product variants" });
    }
  });
  
  app.post("/api/products/:productId/variants", async (req: Request, res: Response) => {
    try {
      if (!req.session?.user) {
        return res.status(401).json({ message: "Authentication required" });
      }
      
      const productId = parseInt(req.params.productId);
      
      if (isNaN(productId)) {
        return res.status(400).json({ message: "Invalid product ID" });
      }
      
      const product = await storage.getProduct(productId);
      
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
      
      // Ensure user can only add variants to their own products
      if (product.userId !== req.session.user.id) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      const variantData = {
        ...req.body,
        productId
      };
      
      const newVariant = await storage.createProductVariant(variantData);
      
      // Update product to indicate it has variants
      if (!product.hasVariants) {
        await storage.updateProduct(productId, { hasVariants: true });
      }
      
      return res.status(201).json(newVariant);
    } catch (error) {
      console.error("Error creating product variant:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid variant data", errors: error.errors });
      }
      return res.status(500).json({ message: "Failed to create product variant" });
    }
  });
  
  app.put("/api/product-variants/:id", async (req: Request, res: Response) => {
    try {
      if (!req.session?.user) {
        return res.status(401).json({ message: "Authentication required" });
      }
      
      const variantId = parseInt(req.params.id);
      
      if (isNaN(variantId)) {
        return res.status(400).json({ message: "Invalid variant ID" });
      }
      
      const variant = await storage.getProductVariant(variantId);
      
      if (!variant) {
        return res.status(404).json({ message: "Product variant not found" });
      }
      
      const product = await storage.getProduct(variant.productId);
      
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
      
      // Ensure user can only update variants of their own products
      if (product.userId !== req.session.user.id) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      const updatedVariant = await storage.updateProductVariant(variantId, req.body);
      return res.json(updatedVariant);
    } catch (error) {
      console.error("Error updating product variant:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid variant data", errors: error.errors });
      }
      return res.status(500).json({ message: "Failed to update product variant" });
    }
  });
  
  app.delete("/api/product-variants/:id", async (req: Request, res: Response) => {
    try {
      if (!req.session?.user) {
        return res.status(401).json({ message: "Authentication required" });
      }
      
      const variantId = parseInt(req.params.id);
      
      if (isNaN(variantId)) {
        return res.status(400).json({ message: "Invalid variant ID" });
      }
      
      const variant = await storage.getProductVariant(variantId);
      
      if (!variant) {
        return res.status(404).json({ message: "Product variant not found" });
      }
      
      const product = await storage.getProduct(variant.productId);
      
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
      
      // Ensure user can only delete variants of their own products
      if (product.userId !== req.session.user.id) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      await storage.deleteProductVariant(variantId);
      
      // Check if there are any remaining variants
      const remainingVariants = await storage.getProductVariantsByProductId(variant.productId);
      
      // If no variants are left, update the product to indicate it no longer has variants
      if (remainingVariants.length === 0) {
        await storage.updateProduct(variant.productId, { hasVariants: false });
      }
      
      return res.status(204).end();
    } catch (error) {
      console.error("Error deleting product variant:", error);
      return res.status(500).json({ message: "Failed to delete product variant" });
    }
  });
  
  // Shopping Cart routes
  app.get("/api/cart", async (req: Request, res: Response) => {
    try {
      let cart;
      
      if (req.isAuthenticated && !!req.session?.user) {
        // If user is logged in, get cart by user ID
        cart = await storage.getCartByUserId(req.session.user.id);
      } else if (req.query.guestId) {
        // If user is not logged in but has a guest ID, get cart by guest ID
        cart = await storage.getCartByGuestId(req.query.guestId as string);
      } else if (req.query.customerId) {
        // If accessing as a customer, get cart by customer ID
        cart = await storage.getCartByCustomerId(parseInt(req.query.customerId as string));
      } else {
        // No identifiers provided
        return res.status(400).json({ message: "Missing identifier for cart retrieval" });
      }
      
      if (!cart) {
        return res.status(404).json({ message: "Cart not found" });
      }
      
      // Get cart items
      const cartItems = await storage.getCartItemsByCartId(cart.id);
      
      return res.json({
        ...cart,
        items: cartItems
      });
    } catch (error) {
      console.error("Error fetching cart:", error);
      return res.status(500).json({ message: "Failed to fetch cart" });
    }
  });
  
  app.post("/api/cart", async (req: Request, res: Response) => {
    try {
      let userId = null;
      let customerId = null;
      let guestId = null;
      
      if (req.isAuthenticated && !!req.session?.user) {
        userId = req.session.user.id;
      } else if (req.body.customerId) {
        customerId = parseInt(req.body.customerId);
      } else if (req.body.guestId) {
        guestId = req.body.guestId;
      } else {
        // Generate a new guest ID if none provided
        guestId = crypto.randomUUID();
      }
      
      // Check if cart already exists
      let cart;
      if (userId) {
        cart = await storage.getCartByUserId(userId);
      } else if (customerId) {
        cart = await storage.getCartByCustomerId(customerId);
      } else if (guestId) {
        cart = await storage.getCartByGuestId(guestId);
      }
      
      // If cart already exists, return it
      if (cart) {
        const cartItems = await storage.getCartItemsByCartId(cart.id);
        return res.json({
          ...cart,
          items: cartItems
        });
      }
      
      // Create new cart
      const newCart = await storage.createCart({
        userId,
        customerId,
        guestId,
        status: 'active'
      });
      
      return res.status(201).json({
        ...newCart,
        items: []
      });
    } catch (error) {
      console.error("Error creating cart:", error);
      return res.status(500).json({ message: "Failed to create cart" });
    }
  });
  
  app.post("/api/cart/items", async (req: Request, res: Response) => {
    try {
      const { cartId, productId, variantId, quantity } = req.body;
      
      if (!cartId || !productId || !quantity) {
        return res.status(400).json({ message: "Cart ID, product ID, and quantity are required" });
      }
      
      // Fetch the cart to ensure it exists
      const cart = await storage.getCart(cartId);
      
      if (!cart) {
        return res.status(404).json({ message: "Cart not found" });
      }
      
      // Check if the product exists
      const product = await storage.getProduct(productId);
      
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
      
      // If variantId is provided, check if the variant exists
      if (variantId) {
        const variant = await storage.getProductVariant(variantId);
        
        if (!variant) {
          return res.status(404).json({ message: "Product variant not found" });
        }
        
        // Check if the variant belongs to the product
        if (variant.productId !== productId) {
          return res.status(400).json({ message: "Variant does not belong to the specified product" });
        }
      }
      
      // Get the price from the product or variant
      let price = product.price;
      
      if (variantId) {
        const variant = await storage.getProductVariant(variantId);
        if (variant && variant.additionalPrice) {
          // The variant price is added to the base product price
          // We need to parse them as floats to ensure proper addition
          const basePrice = parseFloat(product.price);
          const additionalPrice = parseFloat(variant.additionalPrice);
          price = (basePrice + additionalPrice).toString();
        }
      }
      
      // Create cart item
      const cartItem = await storage.addCartItem({
        cartId,
        productId,
        variantId,
        quantity,
        price
      });
      
      // Update cart's status if needed
      await storage.updateCart(cartId, { status: 'active' });
      
      return res.status(201).json(cartItem);
    } catch (error) {
      console.error("Error adding item to cart:", error);
      return res.status(500).json({ message: "Failed to add item to cart" });
    }
  });
  
  app.put("/api/cart/items/:id", async (req: Request, res: Response) => {
    try {
      const itemId = parseInt(req.params.id);
      const { quantity } = req.body;
      
      if (isNaN(itemId)) {
        return res.status(400).json({ message: "Invalid cart item ID" });
      }
      
      if (quantity === undefined) {
        return res.status(400).json({ message: "Quantity is required" });
      }
      
      // Get the cart item
      const cartItem = await storage.getCartItem(itemId);
      
      if (!cartItem) {
        return res.status(404).json({ message: "Cart item not found" });
      }
      
      // Get the cart
      const cart = await storage.getCart(cartItem.cartId);
      
      if (!cart) {
        return res.status(404).json({ message: "Cart not found" });
      }
      
      // Check if the authenticated user owns the cart
      if (req.isAuthenticated && !!req.session?.user && cart.userId && cart.userId !== req.session.user.id) {
        return res.status(403).json({ message: "You do not have permission to update this cart item" });
      }
      
      // Update the cart item with just the quantity
      const updatedCartItem = await storage.updateCartItem(itemId, {
        quantity
      });
      
      // Update cart status if needed
      await storage.updateCart(cartItem.cartId, { status: 'active' });
      
      return res.json(updatedCartItem);
    } catch (error) {
      console.error("Error updating cart item:", error);
      return res.status(500).json({ message: "Failed to update cart item" });
    }
  });
  
  app.delete("/api/cart/items/:id", async (req: Request, res: Response) => {
    try {
      const itemId = parseInt(req.params.id);
      
      if (isNaN(itemId)) {
        return res.status(400).json({ message: "Invalid cart item ID" });
      }
      
      // Get the cart item
      const cartItem = await storage.getCartItem(itemId);
      
      if (!cartItem) {
        return res.status(404).json({ message: "Cart item not found" });
      }
      
      // Get the cart
      const cart = await storage.getCart(cartItem.cartId);
      
      if (!cart) {
        return res.status(404).json({ message: "Cart not found" });
      }
      
      // Check if the authenticated user owns the cart
      if (req.isAuthenticated && !!req.session?.user && cart.userId && cart.userId !== req.session.user.id) {
        return res.status(403).json({ message: "You do not have permission to delete this cart item" });
      }
      
      // Remove the cart item
      await storage.removeCartItem(itemId);
      
      // Update cart status if needed
      await storage.updateCart(cartItem.cartId, { status: 'active' });
      
      return res.status(204).end();
    } catch (error) {
      console.error("Error removing cart item:", error);
      return res.status(500).json({ message: "Failed to remove cart item" });
    }
  });

  // Admin API routes - middleware to check admin role
  const requireAdmin = (req: Request, res: Response, next: NextFunction) => {
    // Check if user is authenticated and has admin role
    // Support both Passport authentication (req.user) and session-based authentication (req.session?.user)
    const user = req.user || req.session?.user;
    
    // Enhanced logging to debug authentication issues
    console.log('Admin auth check details:', { 
      sessionExists: !!req.session, 
      userInSession: !!req.session?.user,
      userInRequest: !!req.user,
      userRole: user?.role,
      sessionID: req.sessionID
    });
    
    // For debugging, also log the session and cookies
    if (!user) {
      console.log('Authentication required - no user in session or request. Session cookie:', req.headers.cookie);
      console.log('Session content:', req.session);
      
      // Check if session exists but user is missing - try to refresh from passport
      if (req.session && req.sessionID && !req.session.user && !req.user) {
        console.log('Session exists but no user found - this may be a session synchronization issue');
        return res.status(401).json({ 
          message: "Authentication required", 
          sessionError: "Session exists but user data is missing"
        });
      }
      
      return res.status(401).json({ message: "Authentication required" });
    }
    
    // If user exists but doesn't have admin role
    if (user.role !== 'admin') {
      console.log('Admin access denied for user:', user.username, 'with role:', user.role);
      return res.status(403).json({ message: "Admin access required" });
    }
    
    // User is authenticated and has admin role
    console.log('Admin access granted for user:', user.username);
    
    // Ensure user is available in both places
    req.user = user;
    if (req.session) {
      req.session.user = user;
    }
    
    return next();
  };

  app.get("/api/admin/businesses", requireAdmin, async (req: Request, res: Response) => {
    try {
      // Authentication already checked in requireAdmin middleware
      // Get only business users (not admin users)
      const businessesResult = await db.execute(sql`
        SELECT 
          id, 
          email, 
          business_name, 
          business_slug, 
          custom_domain, 
          subscription_status,
          created_at
        FROM users 
        WHERE role = 'business'
        ORDER BY id DESC
      `);
      
      // Map the result to proper user objects and remove sensitive information
      const businessRows = businessesResult.rows || [];
      const safeBusinesses = businessRows.map(row => {
        // Convert snake_case column names to camelCase and map to the required fields
        return {
          id: row.id,
          name: row.business_name,
          slug: row.business_slug,
          customDomain: row.custom_domain,
          subscriptionStatus: row.subscription_status,
          ownerEmail: row.email,
          createdAt: typeof row.created_at === 'string' ? new Date(row.created_at) : row.created_at
        };
      });
      
      console.log(`Returning ${safeBusinesses.length} businesses`);
      res.json(safeBusinesses);
    } catch (error) {
      console.error("Error fetching businesses:", error);
      res.status(500).json({ message: "Failed to fetch businesses" });
    }
  });
  
  // Update business details (Admin only)
  app.put("/api/admin/business/:id", requireAdmin, async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { name, slug, customDomain, ownerEmail, platformFeePercentage } = req.body;
      
      // Validate inputs
      if (!name || !slug) {
        return res.status(400).json({ message: "Business name and slug are required" });
      }
      
      // Check if slug is already taken (excluding current business)
      const slugCheckResult = await db.execute(sql`
        SELECT id FROM users 
        WHERE business_slug = ${slug} AND id != ${parseInt(id, 10)}
      `);
      
      if (slugCheckResult.rows && slugCheckResult.rows.length > 0) {
        return res.status(400).json({ message: "Business slug already in use" });
      }
      
      // Update business details
      const updateResult = await db.execute(sql`
        UPDATE users
        SET 
          business_name = ${name},
          business_slug = ${slug},
          custom_domain = ${customDomain},
          email = ${ownerEmail},
          platform_fee_percentage = ${platformFeePercentage || 2.0},
          updated_at = NOW()
        WHERE id = ${parseInt(id, 10)}
        RETURNING id, business_name, business_slug, custom_domain, email, platform_fee_percentage, updated_at
      `);
      
      if (!updateResult.rows || updateResult.rows.length === 0) {
        return res.status(404).json({ message: "Business not found" });
      }
      
      // Convert snake_case to camelCase for the response
      const updatedBusiness = {
        id: updateResult.rows[0].id,
        name: updateResult.rows[0].business_name,
        slug: updateResult.rows[0].business_slug,
        customDomain: updateResult.rows[0].custom_domain,
        ownerEmail: updateResult.rows[0].email,
        platformFeePercentage: updateResult.rows[0].platform_fee_percentage,
        updatedAt: updateResult.rows[0].updated_at
      };
      
      res.json(updatedBusiness);
    } catch (error) {
      console.error("Error updating business:", error);
      res.status(500).json({ message: "Failed to update business" });
    }
  });
  
  // Theme settings update endpoint for Admin
  app.get("/api/admin/business/:id/theme", requireAdmin, async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      
      if (!id || isNaN(parseInt(id, 10))) {
        return res.status(400).json({ message: "Invalid business ID" });
      }
      
      const businessId = parseInt(id, 10);
      console.log(`Admin requesting theme for business ID: ${businessId}`);
      
      // Use the themeOperations from middleware if available
      if ((req as any).themeOperations && (req as any).themeOperations.getTheme) {
        const theme = await (req as any).themeOperations.getTheme(businessId);
        if (theme) {
          return res.json({ theme });
        }
      }
      
      // Fallback: Fetch theme settings using the JSONB column
      const result = await db.execute(sql`
        SELECT 
          id, 
          business_name, 
          business_slug,
          theme_settings,
          theme,
          industry_type
        FROM users
        WHERE id = ${businessId}
      `);
      
      if (!result.rows || result.rows.length === 0) {
        return res.status(404).json({ message: "Business not found" });
      }
      
      // Check for theme in this order: 1. new format in theme column, 2. legacy format in theme_settings
      if (result.rows[0].theme) {
        // Return theme from the new format column
        return res.json({ theme: result.rows[0].theme });
      } else if (result.rows[0].theme_settings) {
        // Convert and return from the legacy format
        const theme = convertLegacyThemeToTheme(result.rows[0].theme_settings);
        return res.json({ theme });
      }
      
      // Use default values if nothing is set
      const defaultThemeSettings = {
        name: "Professional Default",  // Add a name for the theme
        primaryColor: '#4f46e5',
        secondaryColor: '#06b6d4',
        accentColor: '#f59e0b',
        variant: 'professional',
        appearance: 'system',
        borderRadius: 8,
        fontFamily: 'Inter, sans-serif',
        textColor: '#111827',
        backgroundColor: '#ffffff',
        buttonStyle: 'default',
        cardStyle: 'default'
      };
      
      // Prepare response with theme data
      const themeData = {
        id: result.rows[0].id,
        businessName: result.rows[0].business_name,
        businessSlug: result.rows[0].business_slug,
        theme: result.rows[0].theme_settings || defaultThemeSettings,
        industryType: result.rows[0].industry_type || 'general'
      };
      
      res.json(themeData);
    } catch (error) {
      console.error("Error fetching theme settings:", error);
      res.status(500).json({ message: "Failed to fetch theme settings" });
    }
  });

  app.post("/api/admin/business/:id/theme", requireAdmin, async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { theme } = req.body;
      
      if (!id || isNaN(parseInt(id, 10))) {
        return res.status(400).json({ message: "Invalid business ID" });
      }
      
      if (!theme || typeof theme !== 'object') {
        return res.status(400).json({ message: "Theme data is required" });
      }
      
      const businessId = parseInt(id, 10);
      console.log(`Admin updating theme for business ID: ${businessId}`);
      
      // Use the themeOperations from middleware if available
      if ((req as any).themeOperations && (req as any).themeOperations.updateTheme) {
        const result = await (req as any).themeOperations.updateTheme(businessId, theme);
        if (result) {
          return res.json({ 
            message: "Theme updated successfully via middleware",
            theme
          });
        }
      }
      
      // Fallback: update theme directly using updateThemeForBusiness utility
      try {
        await updateThemeForBusiness(businessId, theme, db);
        console.log(`Admin successfully updated theme for business ID: ${businessId}`);
        
        return res.json({ 
          message: "Theme updated successfully",
          theme
        });
      } catch (dbError) {
        console.error('Error in database update:', dbError);
        
        // As a last resort, try direct SQL
        console.log('Attempting direct SQL update as fallback...');
        
        // Check if the business exists first
        const business = await storage.getUser(businessId);
        if (!business) {
          return res.status(404).json({ message: "Business not found" });
        }
        
        // Convert legacy theme format if needed
        const legacyThemeSettings = convertThemeToLegacyTheme(theme);
        
        // Update using the legacy format in theme_settings column
        await db.execute(sql`
          UPDATE users
          SET theme_settings = ${JSON.stringify(legacyThemeSettings)}::jsonb,
              theme = ${JSON.stringify(theme)}::jsonb,
              updated_at = NOW()
          WHERE id = ${businessId}
        `);
        
        console.log(`Admin successfully updated theme via direct SQL for business ID: ${businessId}`);
        
        // Return updated theme data
        return res.json({ 
          message: "Theme updated successfully via direct SQL",
          theme
        });
      }
    } catch (error) {
      console.error("Error updating theme:", error);
      res.status(500).json({ message: "Failed to update theme" });
    }
  });
  
  // Keep the legacy PUT endpoint for backward compatibility
  app.put("/api/admin/business/:id/theme", requireAdmin, async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { 
        primaryColor,
        secondaryColor,
        accentColor,
        variant, 
        appearance, 
        radius,
        fontFamily,
        textColor,
        backgroundColor,
        buttonStyle,
        cardStyle,
        industryType
      } = req.body;
      
      // Create theme settings JSON object
      const themeSettings = {
        name: "Admin Updated Theme",  // Add a name for the theme
        primaryColor: primaryColor || '#4f46e5',
        secondaryColor: secondaryColor || '#06b6d4',
        accentColor: accentColor || '#f59e0b',
        textColor: textColor || '#111827',
        backgroundColor: backgroundColor || '#ffffff',
        fontFamily: fontFamily || 'Inter, sans-serif',
        borderRadius: radius || 6,
        buttonStyle: buttonStyle || 'default',
        cardStyle: cardStyle || 'default',
        variant: variant || 'professional',
        appearance: appearance || 'system'
      };
      
      // Update theme settings using JSONB column
      const updateResult = await db.execute(sql`
        UPDATE users
        SET 
          theme_settings = ${JSON.stringify(themeSettings)}::jsonb,
          industry_type = ${industryType || 'general'},
          updated_at = NOW()
        WHERE id = ${parseInt(id, 10)}
        RETURNING id, business_name, theme_settings, industry_type
      `);
      
      if (!updateResult.rows || updateResult.rows.length === 0) {
        return res.status(404).json({ message: "Business not found" });
      }
      
      // Format the response
      const updatedTheme = {
        id: updateResult.rows[0].id,
        businessName: updateResult.rows[0].business_name,
        theme: updateResult.rows[0].theme_settings,
        industryType: updateResult.rows[0].industry_type
      };
      
      res.json(updatedTheme);
    } catch (error) {
      console.error("Error updating theme settings:", error);
      res.status(500).json({ message: "Failed to update theme settings" });
    }
  });

  app.get("/api/admin/customers", requireAdmin, async (req: Request, res: Response) => {
    try {
      const { businessId } = req.query;
      
      if (!businessId) {
        // If no businessId is provided, return an empty array (for initial admin dashboard load)
        return res.json([]);
      }
      
      // Get all customers for the specified business
      const allCustomers = await storage.getCustomersByUserId(parseInt(businessId.toString()));
      
      res.json(allCustomers);
    } catch (error) {
      console.error("Error fetching customers:", error);
      res.status(500).json({ message: "Failed to fetch customers" });
    }
  });
  
  app.get("/api/admin/appointments", requireAdmin, async (req: Request, res: Response) => {
    try {
      const { businessId } = req.query;
      
      if (!businessId) {
        // If no businessId is provided, return an empty array (for initial admin dashboard load)
        return res.json([]);
      }
      
      // Get all appointments for the specified business
      const allAppointments = await storage.getAppointmentsByUserId(parseInt(businessId.toString()));
      
      res.json(allAppointments);
    } catch (error) {
      console.error("Error fetching appointments:", error);
      res.status(500).json({ message: "Failed to fetch appointments" });
    }
  });
  
  app.get("/api/admin/payments", requireAdmin, async (req: Request, res: Response) => {
    try {
      const { businessId } = req.query;
      
      if (!businessId) {
        // If no businessId is provided, return an empty array (for initial admin dashboard load)
        return res.json([]);
      }
      
      // Get all appointments for the business
      const appointments = await storage.getAppointmentsByUserId(parseInt(businessId.toString()));
      
      if (!appointments || appointments.length === 0) {
        return res.json([]);
      }
      
      // Get all payments for these appointments
      const paymentsPromises = appointments.map(appointment => 
        storage.getPaymentsByAppointmentId(appointment.id)
      );
      
      const paymentsArrays = await Promise.all(paymentsPromises);
      
      // Flatten the array of arrays
      const allPayments = paymentsArrays.flat();
      
      res.json(allPayments);
    } catch (error) {
      console.error("Error fetching payments:", error);
      res.status(500).json({ message: "Failed to fetch payments" });
    }
  });

  // Staff Management Routes
  app.get("/api/staff", async (req: Request, res: Response) => {
    try {
      if (req.query.businessId) {
        // Public access for customer portal
        const businessId = parseInt(req.query.businessId as string);
        // Get staff for this business with limited fields
        const staffMembers = await storage.getStaffByBusinessId(businessId);
        if(!staffMembers) {
          return res.json([])
        }
        // Return filtered public info
        const publicStaffInfo = staffMembers
          .filter((staff) => staff.role === "staff")
          .map(staff => ({
            id: staff.id,
            username: staff.username,
            email: staff.email,
            phone: staff.phone,
            role: staff.role
          }));
        return res.json(publicStaffInfo);
      }
  
      // For authenticated access
      if (!!!req.session?.user) {
        return res.status(401).json({ message: "Authentication required" });
      }
  
      const businessId = req.session.user.role === "business" ? req.session.user.id : undefined;
      const staffMembers = await storage.getStaffByBusinessId(businessId || req.session.user.id);
      
      // Get appointment counts and availability for each staff member
      const staffWithCounts = await Promise.all(
        staffMembers
          .filter((staff) => staff.role === "staff")
          .map(async (staff) => {
            const appointments = await storage.getStaffAppointments(staff.id);
            return {
              ...staff,
              appointmentsCount: appointments.length,
              availability: await storage.getStaffAvailability(staff.id)
            };
          })
      );
  
      res.json(staffWithCounts);
  
    } catch (error) {
      console.error("Error fetching staff:", error);
      res.status(500).json({ message: "Failed to fetch staff members" });
    }
  });

  app.get("/api/staff/:id", async (req: Request, res: Response) => {
    try {
      if (!!!req.session?.user || (req.session.user.role !== "business" && req.session.user.role !== "admin" && req.session.user.id !== parseInt(req.params.id))) {
        return res.status(403).json({ message: "Not authorized to view this staff profile" });
      }
      
      const staffId = parseInt(req.params.id);
      const staff = await storage.getUser(staffId);
      
      if (!staff) {
        return res.status(404).json({ message: "Staff member not found" });
      }
      
      // Check if the staff belongs to the current business (if current user is a business)
      if (req.session.user.role === "business" && staff.businessId !== req.session.user.id) {
        return res.status(403).json({ message: "This staff member does not belong to your business" });
      }
      
      // Remove sensitive data
      const { password, ...staffData } = staff;
      
      res.json(staffData);
    } catch (error) {
      console.error("Error fetching staff profile:", error);
      res.status(500).json({ message: "Failed to fetch staff profile" });
    }
  });

  app.post("/api/staff", async (req: Request, res: Response) => {
    try {
      if (!!!req.session?.user || (req.session.user.role !== "business" && req.session.user.role !== "admin")) {
        return res.status(403).json({ message: "Not authorized to create staff members" });
      }
      
      const { username, email, password, role } = req.body;
      
      if (role !== "staff") {
        return res.status(400).json({ message: "Invalid role for staff member" });
      }
      
      // Check if username or email already exists
      const existingUser = await storage.getUserByUsername(username);
      if (existingUser) {
        return res.status(400).json({ message: "Username already exists" });
      }
      
      const existingEmail = await storage.getUserByEmail(email);
      if (existingEmail) {
        return res.status(400).json({ message: "Email already exists" });
      }
      
      // Hash password
      const bcrypt = require('bcrypt');
      const hashedPassword = await bcrypt.hash(password, 10);
      
      // Create staff member
      const businessId = req.session.user.role === "business" ? req.session.user.id : req.body.businessId;
      
      const staffMember = await storage.createStaffMember({
        username,
        email,
        password: hashedPassword,
        role: "staff",
        businessId
      }, businessId);
      
      // Remove sensitive data
      const { password: pw, ...staffData } = staffMember;
      
      res.status(201).json(staffData);
    } catch (error) {
      console.error("Error creating staff member:", error);
      res.status(500).json({ message: "Failed to create staff member" });
    }
  });

  app.delete("/api/staff/:id", async (req: Request, res: Response) => {
    try {
      if (!!!req.session?.user || (req.session.user.role !== "business" && req.session.user.role !== "admin")) {
        return res.status(403).json({ message: "Not authorized to delete staff members" });
      }
      
      const staffId = parseInt(req.params.id);
      const staff = await storage.getUser(staffId);
      
      if (!staff) {
        return res.status(404).json({ message: "Staff member not found" });
      }
      
      // Check if the staff belongs to the current business (if current user is a business)
      if (req.session.user.role === "business" && staff.businessId !== req.session.user.id) {
        return res.status(403).json({ message: "This staff member does not belong to your business" });
      }
      
      // Delete staff member
      await storage.deleteStaffMember(staffId);
      
      res.status(200).json({ message: "Staff member deleted successfully" });
    } catch (error) {
      console.error("Error deleting staff member:", error);
      res.status(500).json({ message: "Failed to delete staff member" });
    }
  });

  // Staff Availability Routes
  app.get("/api/staff/:id/availability", async (req: Request, res: Response) => {
    try {
      // For customer portal - allow public access with businessId validation
      if (req.query.businessId) {
        const businessId = parseInt(req.query.businessId as string);
        const staffId = parseInt(req.params.id);
        
        if (isNaN(businessId) || isNaN(staffId)) {
          return res.status(400).json({ message: "Invalid parameters" });
        }
        
        // Validate both staff and business exist
        const staff = await storage.getUser(staffId);
        const business = await storage.getUser(businessId);
        
        if (!staff || !business || business.role !== "business") {
          return res.status(404).json({ message: "Staff or business not found" });
        }
        
        // Verify staff belongs to this business
        if (staff.businessId !== businessId) {
          return res.status(403).json({ message: "Staff not associated with this business" });
        }
        
        // Return availability for public view
        const availability = await storage.getStaffAvailability(staffId);
        return res.json(availability);
      }
      
      // For authenticated users (admin, business owner, staff)
      if (!!!req.session?.user) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      const staffId = parseInt(req.params.id);
      const staff = await storage.getUser(staffId);
      
      if (!staff) {
        return res.status(404).json({ message: "Staff member not found" });
      }
      
      // Check permissions
      if (req.session.user.role === "business" && staff.businessId !== req.session.user.id && req.session.user.id !== staffId) {
        return res.status(403).json({ message: "Not authorized to view this staff's availability" });
      }
      
      const availability = await storage.getStaffAvailability(staffId);
      res.json(availability);
    } catch (error) {
      console.error("Error fetching staff availability:", error);
      res.status(500).json({ message: "Failed to fetch staff availability" });
    }
  });

  app.post("/api/staff/:id/availability", async (req: Request, res: Response) => {
    try {
      if (!!!req.session?.user) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      const staffId = parseInt(req.params.id);
      const staff = await storage.getUser(staffId);
      
      if (!staff) {
        return res.status(404).json({ message: "Staff member not found" });
      }
      
      // Check permissions
      if (req.session.user.role === "business" && staff.businessId !== req.session.user.id && req.session.user.id !== staffId) {
        return res.status(403).json({ message: "Not authorized to manage this staff's availability" });
      }
      
      const { dayOfWeek, startTime, endTime, isAvailable } = req.body;
      
      // Validate input
      if (dayOfWeek < 0 || dayOfWeek > 6) {
        return res.status(400).json({ message: "Invalid day of week" });
      }
      
      // Create availability
      const availability = await storage.createStaffAvailability({
        staffId,
        dayOfWeek,
        startTime,
        endTime,
        isAvailable: isAvailable !== undefined ? isAvailable : true
      });
      
      res.status(201).json(availability);
    } catch (error) {
      console.error("Error creating staff availability:", error);
      res.status(500).json({ message: "Failed to create staff availability" });
    }
  });

  app.delete("/api/staff/availability/:id", async (req: Request, res: Response) => {
    try {
      if (!!!req.session?.user) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      const availabilityId = parseInt(req.params.id);
      const availability = await storage.getStaffAvailabilityById(availabilityId);
      
      if (!availability) {
        return res.status(404).json({ message: "Availability slot not found" });
      }
      
      const staff = await storage.getUser(availability.staffId);
      
      // Check permissions
      if (req.session.user.role === "business" && staff?.businessId !== req.session.user.id && req.session.user.id !== availability.staffId) {
        return res.status(403).json({ message: "Not authorized to manage this staff's availability" });
      }
      
      // Delete availability
      await storage.deleteStaffAvailability(availabilityId);
      
      res.status(200).json({ message: "Availability slot deleted successfully" });
    } catch (error) {
      console.error("Error deleting staff availability:", error);
      res.status(500).json({ message: "Failed to delete staff availability" });
    }
  });

  app.get("/api/staff/:id/appointments", async (req: Request, res: Response) => {
    try {
      if (!!!req.session?.user) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      const staffId = parseInt(req.params.id);
      const staff = await storage.getUser(staffId);
      
      if (!staff) {
        return res.status(404).json({ message: "Staff member not found" });
      }
      
      // Check permissions
      if (req.session.user.role === "business" && staff.businessId !== req.session.user.id && req.session.user.id !== staffId) {
        return res.status(403).json({ message: "Not authorized to view this staff's appointments" });
      }
      
      const appointments = await storage.getStaffAppointments(staffId);
      res.json(appointments);
    } catch (error) {
      console.error("Error fetching staff appointments:", error);
      res.status(500).json({ message: "Failed to fetch staff appointments" });
    }
  });

  // Test API endpoints for error handling demonstration
  app.get("/api/test-error", (_req: Request, res: Response) => {
    try {
      throw new Error("This is a test error with a detailed stack trace.");
    } catch (error) {
      if (error instanceof Error) {
        const errorDetails = {
          message: error.message,
          name: error.name,
          stack: error.stack,
          code: "TEST_ERROR_CODE",
          details: {
            timestamp: new Date().toISOString(),
            requestId: Math.random().toString(36).substring(2, 15),
            environment: process.env.NODE_ENV || "development",
          }
        };
        res.status(500).json(errorDetails);
      } else {
        res.status(500).json({ message: "Unknown error occurred" });
      }
    }
  });

  app.get("/api/test-error/:code", (req: Request, res: Response) => {
    const code = parseInt(req.params.code);
    if (isNaN(code) || code < 100 || code > 599) {
      return res.status(400).json({ message: "Invalid HTTP status code. Please provide a code between 100-599." });
    }
    
    const errorMessages: Record<number, string> = {
      400: "Bad request - The server could not understand the request.",
      401: "Unauthorized - Authentication is required and has failed or not been provided.",
      403: "Forbidden - You don't have permission to access this resource.",
      404: "Not found - The requested resource does not exist.",
      422: "Unprocessable Entity - The request was well-formed but contains semantic errors.",
      429: "Too Many Requests - You've sent too many requests in a given amount of time.",
      500: "Internal Server Error - Something went wrong on the server.",
      503: "Service Unavailable - The server is currently unable to handle the request."
    };
    
    const message = errorMessages[code] || `Test error with status code ${code}`;
    
    res.status(code).json({
      message,
      error: "Test Error",
      code: `TEST_${code}`,
      details: {
        timestamp: new Date().toISOString(),
        requestId: Math.random().toString(36).substring(2, 15),
        path: req.path,
        method: req.method
      }
    });
  });

  // Add debug endpoint for testing business slug lookup
  app.get("/api/debug/business-lookup/:slug", async (req: Request, res: Response) => {
    try {
      const { slug } = req.params;
      console.log(`Debug business lookup for slug: ${slug}`);
      
      // Directly test the storage method
      const business = await storage.getUserByBusinessSlug(slug);
      
      if (business) {
        // Return sanitized business data
        const { password, ...sanitizedBusiness } = business;
        console.log(`Debug lookup found business:`, sanitizedBusiness);
        return res.json({
          found: true,
          business: sanitizedBusiness
        });
      } else {
        console.log(`Debug lookup - no business found for slug: ${slug}`);
        return res.json({
          found: false,
          message: "No business found with this slug"
        });
      }
    } catch (error) {
      console.error("Error in debug business lookup:", error);
      return res.status(500).json({ 
        error: "Error looking up business",
        message: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  // Add debug endpoint for testing admin businesses API
  app.get("/api/debug/admin-businesses", async (req: Request, res: Response) => {
    try {
      console.log('Admin businesses debug endpoint called');
      console.log('Session:', {
        id: req.sessionID,
        user: req.session?.user?.username,
        role: req.session?.user?.role
      });
      
      // If user is not authenticated, return 401
      if (!req.session?.user) {
        console.log('Not authenticated in admin-businesses debug endpoint');
        return res.status(401).json({
          error: 'Not authenticated',
          message: 'You must be logged in as admin'
        });
      }
      
      // If user is not admin, return 403
      if (req.session.user.role !== 'admin') {
        console.log('Not admin in admin-businesses debug endpoint');
        return res.status(403).json({
          error: 'Not admin',
          message: 'You must be an admin to access this endpoint',
          role: req.session.user.role
        });
      }
      
      // Get all businesses - directly run SQL query
      const businessesResult = await db.execute(sql`
        SELECT 
          id, 
          email, 
          business_name, 
          business_slug, 
          custom_domain, 
          subscription_status,
          created_at
        FROM users 
        WHERE role = 'business'
        ORDER BY id DESC
      `);
      
      // Map the businesses data
      const businesses = businessesResult.rows.map(row => ({
        id: row.id,
        name: row.business_name,
        slug: row.business_slug,
        email: row.email,
        createdAt: row.created_at
      }));
      
      console.log(`Found ${businesses.length} businesses in debug endpoint`);
      
      return res.json({
        authenticated: true,
        isAdmin: true,
        userInfo: {
          id: req.session.user.id,
          username: req.session.user.username,
          role: req.session.user.role
        },
        businesses
      });
    } catch (error) {
      console.error('Error in admin-businesses debug endpoint:', error);
      return res.status(500).json({
        error: 'Server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Add debug endpoint for testing business slugs
  app.get("/api/debug/check-admin-session", (req: Request, res: Response) => {
    try {
      console.log('Check admin session debug endpoint called');
      console.log('Full session data:', req.session);
      console.log('Session ID:', req.sessionID);
      console.log('Cookies:', req.headers.cookie);
      
      const user = req.session?.user;
      
      if (!user) {
        console.log('No user in session');
        return res.status(401).json({
          error: 'Not authenticated',
          message: 'No user found in session',
          session: {
            id: req.sessionID,
            exists: !!req.session
          }
        });
      }
      
      console.log('User found in session:', {
        id: user.id,
        username: user.username,
        role: user.role
      });
      
      if (user.role !== 'admin') {
        return res.status(403).json({
          error: 'Not admin',
          message: 'User is not an admin',
          userRole: user.role
        });
      }
      
      // Try to manually add the user to req.user
      req.user = user;
      
      return res.status(200).json({
        success: true,
        message: 'Admin user found in session',
        user: {
          id: user.id,
          username: user.username,
          role: user.role
        }
      });
    } catch (error) {
      console.error('Error in check-admin-session:', error);
      return res.status(500).json({
        error: 'Server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Create the HTTP server
  const httpServer = createServer(app);
  return httpServer;
}
