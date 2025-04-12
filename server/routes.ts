import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { db } from "./db";
import rateLimit from 'express-rate-limit';
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
  users
} from "@shared/schema";
import { eq, sql, desc } from "drizzle-orm";
import { z } from "zod";
import Stripe from "stripe";
import nodemailer from "nodemailer";
import crypto from "crypto";
import { businessExtractor } from "./middleware/businessExtractor";
import { manuallyRegisterDomain, getRegisteredDomains } from "./ssl";

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

export async function registerRoutes(app: Express): Promise<Server> {
  // Apply the business extractor middleware to all routes
  app.use(businessExtractor);
  
  // Add a custom middleware to inject business data into HTML responses
  app.use(async (req, res, next) => {
    // Skip for API routes
    if (req.path.startsWith('/api/')) {
      return next();
    }
    
    // Intercept the response.send for HTML responses if we have business data
    if (req.business) {
      console.log(`Custom injector: Setup for path ${req.path}, business: ${req.business.businessName}`);
      
      // Get services for this business while we have the chance
      try {
        const services = await storage.getServicesByUserId(req.business.id);
        const activeServices = services.filter(service => service.active);
        
        // Determine subpath for business portal routes
        let subPath = "";
        if (req.originalUrl !== `/${req.business.businessSlug}`) {
          const regex = new RegExp(`^/${req.business.businessSlug}/(.*)$`);
          const match = req.originalUrl.match(regex);
          if (match && match[1]) {
            subPath = match[1].split('?')[0]; // Remove query params
          }
        }
        
        // Store business data for injection
        req.app.locals.BUSINESS_DATA = {
          business: req.business,
          services: activeServices,
          subPath: subPath
        };
        
        console.log(`Stored business data for path ${req.path}: ${JSON.stringify(req.app.locals.BUSINESS_DATA).slice(0, 100)}...`);
        
        // Override the res.send method to inject the business data
        const originalSend = res.send;
        res.send = function(body) {
          if (typeof body === 'string' && body.includes('<!DOCTYPE html>')) {
            console.log(`Injecting business data for path ${req.path}`);
            
            // Create script tag with business data
            const businessDataScript = `
<script>
  window.BUSINESS_DATA = ${JSON.stringify(req.app.locals.BUSINESS_DATA)};
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
      
      // Get services for this business
      const services = await storage.getServicesByUserId(business.id);
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
      
      // Get the business by ID
      const business = await storage.getUser(id);
      
      if (!business) {
        console.log(`No business found with ID: ${id}`);
        return res.status(404).json({ message: "Business not found" });
      }
      
      // Get services for this business
      const services = await storage.getServicesByUserId(business.id);
      const activeServices = services.filter(service => service.active);
      
      // Remove sensitive data
      const { password: _, ...businessData } = business;
      
      // Return the business data with preview flag
      res.json({
        business: businessData,
        services: activeServices,
        isPreview: true
      });
      
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
      
      if (!user || user.password !== password) {
        return res.status(401).json({ message: "Invalid credentials" });
      }
      
      // In a real app, we would use proper authentication with sessions or tokens
      // For this MVP, we'll just return the user
      res.json(user);
    } catch (error) {
      res.status(500).json({ message: "Login failed" });
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
      const customerData = insertCustomerSchema.parse(req.body);
      const customer = await storage.createCustomer(customerData);
      res.status(201).json(customer);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid customer data", errors: error.errors });
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
      
      // Find the customer with the provided email and business ID
      const customer = await storage.getCustomerByEmailAndBusinessId(email, businessId);
      
      if (!customer) {
        return res.status(404).json({ message: "Customer not found with the provided email for this business" });
      }
      
      // Generate a random token
      const token = crypto.randomBytes(32).toString('hex');
      
      // Set expiration to 7 days from now
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7);
      
      // Create the access token in the database
      const accessToken = await storage.createCustomerAccessToken({
        customerId: customer.id,
        token,
        expiresAt
      });
      
      // Get the business information
      const business = await storage.getUser(businessId);
      
      if (sendEmail && business) {
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
          
          console.log(`Access token email sent to ${customer.email}`);
        } catch (emailError) {
          console.error("Error sending access token email:", emailError);
          // Continue processing even if email fails - we'll still return the token
        }
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
      
      if (!token) {
        return res.status(401).json({ message: "Access token is required" });
      }
      
      // Get the customer using the access token
      const customer = await storage.getCustomerByAccessToken(token);
      
      if (!customer) {
        return res.status(401).json({ message: "Invalid or expired access token" });
      }
      
      // Get the customer's appointments
      const appointments = await storage.getAppointmentsByCustomerId(customer.id);
      
      // Return the customer profile with appointments
      res.json({
        customer,
        appointments
      });
    } catch (error) {
      console.error("Error fetching customer profile:", error);
      res.status(500).json({ message: "Failed to fetch customer profile" });
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
        expiresAt
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
      
      // Get platform fee from business settings (defaults to 2% if not set)
      const platformFeePercentage = parseFloat(business.platformFeePercentage?.toString() || "2.00");
      const amount = parseFloat(service.price.toString());
      const platformFeeAmount = (amount * platformFeePercentage) / 100;
      const businessAmount = amount - platformFeeAmount;
      
      // Create a placeholder for payment processing (will be replaced by Mercadopago)
      // In a real implementation, we would:
      // 1. Create a Mercadopago preference with the payment details
      // 2. Set up payment split between AppointEase platform and the business
      // 3. Return the preference ID and init point URL
      
      // For now, just generate a mock client secret
      const mockClientSecret = `mp_test_${Date.now()}_${appointmentId}`;
      
      // Save payment information with marketplace split details
      await storage.createPayment({
        appointmentId: appointment.id,
        amount: service.price,
        status: "pending",
        paymentProcessor: "mercadopago",
        processorPaymentId: mockClientSecret,
        merchantAccountId: business.mercadopagoAccountId || null,
        
        // Marketplace payment split fields
        platformFeePercentage: platformFeePercentage.toString(),
        platformFeeAmount: platformFeeAmount.toString(),
        businessAmount: businessAmount.toString(),
        
        // Additional Mercadopago-specific fields can be added here
        preferenceId: null, // Will contain the Mercadopago preference ID
      });
      
      // Return client secret and payment URL for the frontend
      res.json({ 
        clientSecret: mockClientSecret,
        paymentUrl: null, // Will be the redirect URL from Mercadopago
      });
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
      if (!req.isAuthenticated || !req.isAuthenticated()) {
        return res.status(401).json({ message: "Authentication required" });
      }
      
      const userId = req.user.id;
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
      if (!req.isAuthenticated || !req.isAuthenticated()) {
        return res.status(401).json({ message: "Authentication required" });
      }
      
      const userId = req.user.id;
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
      if (!req.isAuthenticated || !req.isAuthenticated()) {
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
      if (product.userId !== req.user.id) {
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
      if (!req.isAuthenticated || !req.isAuthenticated()) {
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
      if (product.userId !== req.user.id) {
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
      if (!req.isAuthenticated || !req.isAuthenticated()) {
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
      if (product.userId !== req.user.id) {
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
      if (!req.isAuthenticated || !req.isAuthenticated()) {
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
      if (product.userId !== req.user.id) {
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
      if (!req.isAuthenticated || !req.isAuthenticated()) {
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
      if (product.userId !== req.user.id) {
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
      if (!req.isAuthenticated || !req.isAuthenticated()) {
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
      if (product.userId !== req.user.id) {
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
      if (!req.isAuthenticated || !req.isAuthenticated()) {
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
      if (product.userId !== req.user.id) {
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
      
      if (req.isAuthenticated && req.isAuthenticated()) {
        // If user is logged in, get cart by user ID
        cart = await storage.getCartByUserId(req.user.id);
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
      
      if (req.isAuthenticated && req.isAuthenticated()) {
        userId = req.user.id;
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
      if (req.isAuthenticated && req.isAuthenticated() && cart.userId && cart.userId !== req.user.id) {
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
      if (req.isAuthenticated && req.isAuthenticated() && cart.userId && cart.userId !== req.user.id) {
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
    if (!req.isAuthenticated || !req.isAuthenticated()) {
      return res.status(401).json({ message: "Authentication required" });
    }
    
    // Type assertion to tell TypeScript that req.user has the properties we expect
    const user = req.user as Express.User;
    
    if (user && user.role === 'admin') {
      return next();
    }
    
    return res.status(403).json({ message: "Admin access required" });
  };

  app.get("/api/admin/businesses", requireAdmin, async (req: Request, res: Response) => {
    try {
      // In a real app, we would check for admin authentication
      // For now, we'll just return all users (assuming they're businesses)
      
      // Get only business users (not admin users)
      const businessesResult = await db.execute(sql`
        SELECT 
          id, 
          username, 
          email, 
          business_name, 
          business_slug, 
          custom_domain, 
          phone, 
          platform_fee_percentage, 
          subscription, 
          subscription_status,
          created_at
        FROM users 
        WHERE role = 'business'
        ORDER BY id DESC
      `);
      
      // Map the result to proper user objects and remove sensitive information
      const businessRows = businessesResult.rows || [];
      const safeBusinesses = businessRows.map(row => {
        // Convert snake_case column names to camelCase
        const business = {
          id: row.id,
          username: row.username,
          email: row.email,
          businessName: row.business_name,
          businessSlug: row.business_slug,
          customDomain: row.custom_domain,
          phone: row.phone,
          subscription: row.subscription,
          subscriptionStatus: row.subscription_status,
          platformFeePercentage: row.platform_fee_percentage,
          createdAt: typeof row.created_at === 'string' ? new Date(row.created_at) : new Date(),
          role: "business" // We're assuming all users are businesses for now
        };
        return business;
      });
      
      res.json(safeBusinesses);
    } catch (error) {
      console.error("Error fetching businesses:", error);
      res.status(500).json({ message: "Failed to fetch businesses" });
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
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Authentication required" });
      }
      
      // If user is a staff member, they can only see themselves
      if (req.user.role === "staff") {
        const staffMember = await storage.getUser(req.user.id);
        if (staffMember) {
          return res.json([staffMember]);
        } else {
          return res.status(404).json({ message: "Staff member not found" });
        }
      }
      
      // For business owners and admins, get all staff
      if (req.user.role !== "business" && req.user.role !== "admin") {
        return res.status(403).json({ message: "Not authorized to view all staff" });
      }
      
      const businessId = req.user.role === "business" ? req.user.id : undefined;
      const staffMembers = await storage.getStaffByBusinessId(businessId || req.user.id);
      
      // Get appointment counts for each staff member
      const staffWithCounts = await Promise.all(
        staffMembers.map(async (staff) => {
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
      if (!req.isAuthenticated() || (req.user.role !== "business" && req.user.role !== "admin" && req.user.id !== parseInt(req.params.id))) {
        return res.status(403).json({ message: "Not authorized to view this staff profile" });
      }
      
      const staffId = parseInt(req.params.id);
      const staff = await storage.getUser(staffId);
      
      if (!staff) {
        return res.status(404).json({ message: "Staff member not found" });
      }
      
      // Check if the staff belongs to the current business (if current user is a business)
      if (req.user.role === "business" && staff.businessId !== req.user.id) {
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
      if (!req.isAuthenticated() || (req.user.role !== "business" && req.user.role !== "admin")) {
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
      const businessId = req.user.role === "business" ? req.user.id : req.body.businessId;
      
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
      if (!req.isAuthenticated() || (req.user.role !== "business" && req.user.role !== "admin")) {
        return res.status(403).json({ message: "Not authorized to delete staff members" });
      }
      
      const staffId = parseInt(req.params.id);
      const staff = await storage.getUser(staffId);
      
      if (!staff) {
        return res.status(404).json({ message: "Staff member not found" });
      }
      
      // Check if the staff belongs to the current business (if current user is a business)
      if (req.user.role === "business" && staff.businessId !== req.user.id) {
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
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      const staffId = parseInt(req.params.id);
      const staff = await storage.getUser(staffId);
      
      if (!staff) {
        return res.status(404).json({ message: "Staff member not found" });
      }
      
      // Check permissions
      if (req.user.role === "business" && staff.businessId !== req.user.id && req.user.id !== staffId) {
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
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      const staffId = parseInt(req.params.id);
      const staff = await storage.getUser(staffId);
      
      if (!staff) {
        return res.status(404).json({ message: "Staff member not found" });
      }
      
      // Check permissions
      if (req.user.role === "business" && staff.businessId !== req.user.id && req.user.id !== staffId) {
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
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      const availabilityId = parseInt(req.params.id);
      const availability = await storage.getStaffAvailabilityById(availabilityId);
      
      if (!availability) {
        return res.status(404).json({ message: "Availability slot not found" });
      }
      
      const staff = await storage.getUser(availability.staffId);
      
      // Check permissions
      if (req.user.role === "business" && staff?.businessId !== req.user.id && req.user.id !== availability.staffId) {
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
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      const staffId = parseInt(req.params.id);
      const staff = await storage.getUser(staffId);
      
      if (!staff) {
        return res.status(404).json({ message: "Staff member not found" });
      }
      
      // Check permissions
      if (req.user.role === "business" && staff.businessId !== req.user.id && req.user.id !== staffId) {
        return res.status(403).json({ message: "Not authorized to view this staff's appointments" });
      }
      
      const appointments = await storage.getStaffAppointments(staffId);
      res.json(appointments);
    } catch (error) {
      console.error("Error fetching staff appointments:", error);
      res.status(500).json({ message: "Failed to fetch staff appointments" });
    }
  });

  // Create the HTTP server
  const httpServer = createServer(app);
  return httpServer;
}
