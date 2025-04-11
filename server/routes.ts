import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { db } from "./db";
import { 
  insertUserSchema, 
  insertServiceSchema, 
  insertCustomerSchema, 
  insertAppointmentSchema,
  insertPaymentSchema,
  users
} from "@shared/schema";
import { eq, sql, desc } from "drizzle-orm";
import { z } from "zod";
import Stripe from "stripe";
import nodemailer from "nodemailer";
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
      const appointmentData = insertAppointmentSchema.parse(req.body);
      const appointment = await storage.createAppointment(appointmentData);
      res.status(201).json(appointment);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid appointment data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create appointment" });
    }
  });
  
  app.put("/api/appointments/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid appointment ID" });
      }
      
      const appointmentData = insertAppointmentSchema.partial().parse(req.body);
      const appointment = await storage.updateAppointment(id, appointmentData);
      
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
      
      // Send email notification
      const info = await transporter.sendMail({
        from: process.env.EMAIL_FROM || '"AppointEase" <noreply@appointease.com>',
        to: customer.email,
        subject: `Appointment Reminder: ${service.name} on ${formattedDate}`,
        html: `
          <h2>Appointment Reminder</h2>
          <p>Hello ${customer.firstName},</p>
          <p>This is a reminder for your upcoming appointment:</p>
          <ul>
            <li><strong>Service:</strong> ${service.name}</li>
            <li><strong>Date:</strong> ${formattedDate}</li>
            <li><strong>Time:</strong> ${formattedTime}</li>
            <li><strong>Duration:</strong> ${service.duration} minutes</li>
          </ul>
          <p>If you need to reschedule or cancel, please contact us as soon as possible.</p>
          <p>Thank you!</p>
        `,
      });
      
      // Update appointment to mark reminder as sent
      await storage.updateAppointment(appointmentId, { reminderSent: true });
      
      res.json({ message: "Reminder sent successfully", messageId: info.messageId });
    } catch (error) {
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

  // Admin API routes - middleware to check admin role
  const requireAdmin = (req: Request, res: Response, next: NextFunction) => {
    // Check if user is authenticated and has admin role
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Authentication required" });
    }
    
    if (req.user && req.user.role === 'admin') {
      return next();
    }
    
    return res.status(403).json({ message: "Admin access required" });
  };

  app.get("/api/admin/businesses", requireAdmin, async (req: Request, res: Response) => {
    try {
      // In a real app, we would check for admin authentication
      // For now, we'll just return all users (assuming they're businesses)
      
      // Get all business users from the database using direct SQL
      // Note: We're not filtering by role since we're troubleshooting
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
          createdAt: row.created_at ? new Date(row.created_at) : new Date(),
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
        return res.status(400).json({ message: "Business ID is required" });
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
        return res.status(400).json({ message: "Business ID is required" });
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
        return res.status(400).json({ message: "Business ID is required" });
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

  // Create the HTTP server
  const httpServer = createServer(app);
  return httpServer;
}
