import express, { type Express, type Request, type Response, type NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { db, pool, query } from "./db";
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
  insertCartItemSchema,  insertCustomerAccessTokenSchema,
  users,
  User,
  Customer,
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
import { businessExtractor, RESERVED_PATHS } from "./middleware/businessExtractor";
import { manuallyRegisterDomain, getRegisteredDomains } from "./ssl";
import session from "express-session";
import adminRoutes from "./routes/adminRoutes";
import staffRoutes from "./routes/staffRoutes";
import debugRoutes from "./routes/debugRoutes";
import productRoutes from "./routes/productRoutes";
import shoppingCartRoutes from "./routes/shoppingCartRoutes";
import paymentRoutes from "./routes/paymentRoutes";
import appointmentRoutes from "./routes/appointmentRoutes";
import customerRoutes from "./routes/customerRoutes";
import authRoutes from "./routes/authRoutes";
import businessRoutes from "./routes/businessRoutes";
import cors from "cors";
import passport from "passport";

// Initialize Stripe if secret key is available
let stripe: Stripe | undefined;
if (process.env.STRIPE_SECRET_KEY) {
  stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: "2025-04-30.basil",
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

export async function registerRoutes(app: Express): Promise<Server> {  // CORS configuration - simplified
  app.use(cors({
    origin: [
      'https://appointease.cl',
      /\.appointease\.cl$/,
      'http://localhost:3000',
      'http://localhost:5173',
      'http://127.0.0.1:3000',
      'http://127.0.0.1:5173',
      /\.cloudworkstations\.dev$/,  // Allow cloud workstations domains
      /\.run\.app$/  // Allow Google Cloud Run domains
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Business-Slug']
  }));

  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  // Session configuration
  app.use(session({
    secret: process.env.SESSION_SECRET || 'dev-secret-123',
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: false, // Allow HTTP and HTTPS for development
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
      sameSite: 'lax', // Allow cross-site requests in development
      httpOnly: true
    }
  }));

  // Core middleware
  app.use(businessExtractor);
  app.use(themeMiddleware);

  // Add current business endpoint - must come after businessExtractor
  app.get("/api/current-business", async (req: Request, res: Response) => {
    try {
      // Check if there's a business in the request context (from businessExtractor middleware)
      if (req.business) {
        // Get services for this business
        const services = await storage.getServicesByUserId(req.business.id);
        
        return res.json({ 
          business: req.business,
          services: services || []
        });
      }
      
      // No business context found
      return res.json({ 
        business: null,
        services: []
      });
    } catch (error) {
      console.error("Error fetching current business:", error);
      res.status(500).json({ message: "Failed to fetch current business" });
    }
  });

  // Static file serving
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
  }  // Business slug API routes - handle API calls within business context
  // MUST come before static file serving to prevent conflicts
  const businessApiRouter = express.Router();
    // Set up business context for all business API routes
  businessApiRouter.use(async (req: Request, res: Response, next: NextFunction) => {
    // Get slug from the original request params (set by Express router)
    const slug = req.originalUrl.split('/')[1]; // Extract from URL path
    console.log(`🔧 Business API router for slug: ${slug}, path: ${req.path}, url: ${req.url}`);
    
    // Skip reserved paths
    if (RESERVED_PATHS.includes(slug)) {
      console.log(`⏭️ Skipping reserved path: ${slug}`);
      return next('route');
    }
    
    try {
      if (!req.business) {
        console.log(`🔍 Looking up business for slug: ${slug}`);
        const business = await storage.getUserBySlug(slug);
        if (business) {
          req.business = business;
          console.log(`✅ Found business: ${business.businessName} (ID: ${business.id})`);
        } else {
          console.log(`❌ No business found for slug: ${slug}`);
          return res.status(404).json({ message: "Business not found" });
        }
      }
      next();
    } catch (error) {
      console.error('❌ Error setting business context for API:', error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
    // Mount the API routes within the business context
  businessApiRouter.use("/admin", adminRoutes);
  businessApiRouter.use("/staff", staffRoutes);
  businessApiRouter.use("/auth", authRoutes);
  businessApiRouter.use("/business", businessRoutes);
  businessApiRouter.use("/themes", themeRoutes);
  businessApiRouter.use("/theme-api", themeApiRoutes);
  businessApiRouter.use("/", appointmentRoutes); // For /services and /appointments endpoints
  businessApiRouter.use("/customers", customerRoutes);
  
  // Add customer access token route at root level within business context
  businessApiRouter.use("/customer-access-token", (req, res, next) => {
    // Forward to the customer routes handler
    req.url = "/customer-access-token";
    customerRoutes(req, res, next);
  });
  
  businessApiRouter.use("/products", productRoutes);
  businessApiRouter.use("/cart", shoppingCartRoutes);
  businessApiRouter.use("/payments", paymentRoutes);
  
  if (process.env.NODE_ENV === 'development') {
    businessApiRouter.use("/debug", debugRoutes);
  }
  // Mount the business API router - THIS MUST COME BEFORE CATCH-ALL ROUTES
  app.use("/:slug/api", (req, res, next) => {
    console.log(`🎯 Business API route matched: ${req.originalUrl}, method: ${req.method}, path: ${req.path}`);
    console.log(`🔍 Route stack for businessApiRouter:`, businessApiRouter.stack.map(layer => ({ 
      regexp: layer.regexp.toString(), 
      keys: layer.keys,
      name: layer.handle.name || 'anonymous'
    })));
    next();
  }, businessApiRouter);

  // Serve static files with enhanced logging
  app.use('/uploads', (req, res, next) => {
    console.log(`Static file request for: ${req.path}`);
    const fullPath = path.join(uploadsDir, req.path);
    console.log(`Full path: ${fullPath}`);
    console.log(`File exists: ${fs.existsSync(fullPath)}`);
    next();
  }, express.static(uploadsDir));
  // API Routes - MUST come after business slug API middleware
  app.use("/api/admin", adminRoutes);
  app.use("/api/staff", staffRoutes);
  app.use("/api/auth", authRoutes);
  app.use("/api/business", businessRoutes);
  app.use("/api/themes", themeRoutes);
  app.use("/api/theme-api", themeApiRoutes);
  app.use("/api", appointmentRoutes); // Register at /api for both /services and /appointments endpoints
  app.use("/api/customers", customerRoutes);
  
  // Add customer access token route at root API level to match frontend expectations
  app.use("/api/customer-access-token", (req, res, next) => {
    // Forward to the customer routes handler
    req.url = "/customer-access-token";
    customerRoutes(req, res, next);
  });
  
  app.use("/api/products", productRoutes);
  app.use("/api/cart", shoppingCartRoutes);
  app.use("/api/payments", paymentRoutes);

  if (process.env.NODE_ENV === 'development') {
    app.use("/api/debug", debugRoutes);
  }

  // Health check endpoint
  app.get("/health", (_req: Request, res: Response) => {
    res.json({ status: "healthy" });
  });

  // Serve static assets from the built client
  const publicDir = path.join(process.cwd(), 'dist', 'public');
  console.log('======== PUBLIC STATIC FILES SETUP ========');
  console.log('Public directory path:', publicDir);

  if (!fs.existsSync(publicDir)) {
    console.error('ERROR: Public directory does not exist. Have you run npm run build?');
  } else {
    console.log('Public directory exists');
  }
  app.use(express.static(publicDir));
  // Root path handler - simplified
  app.get("/", async (req: Request, res: Response) => {
    if (req.business) {
      return res.json({ business: req.business });
    }
    // Redirect to auth page instead of external site
    res.redirect('/auth');
  });  // Catch-all route for business subdomains/slugs - MUST exclude API routes
  app.get("/:slug/*", async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { slug } = req.params;
      
      // Skip asset paths and API routes - don't treat them as business slugs
      if (slug.startsWith('@') || 
          slug === 'src' || 
          slug === 'api' || 
          slug === 'uploads' || 
          slug === 'static' || 
          slug === 'health') {
        return next();
      }

      // Skip reserved paths - don't treat them as business slugs
      if (RESERVED_PATHS.includes(slug)) {
        return next();
      }

      // CRITICAL: Skip if this is an API call to avoid conflicts with business API routes
      if (req.path.includes('/api/') || req.originalUrl.includes('/api/')) {
        console.log(`🚫 Skipping API route in catch-all: ${req.originalUrl}`);
        return next();
      }

      const business = req.business;
      if (!business) {
        return res.status(404).json({ 
          message: "Business not found",
          slug,
          path: req.path 
        });
      }

      // For frontend routes (non-API), serve the React HTML file
      // The business context is already attached to req.business by businessExtractor middleware
      const indexPath = path.join(process.cwd(), 'dist', 'public', 'index.html');
      if (fs.existsSync(indexPath)) {
        res.sendFile(indexPath);
      } else {
        res.status(404).json({ message: "Application not found. Please run npm run build." });
      }
    } catch (error) {
      next(error);
    }
  });

  // Fallback route - serve React app for all non-API requests
  app.get("*", (req: Request, res: Response) => {
    const indexPath = path.join(process.cwd(), 'dist', 'public', 'index.html');
    if (fs.existsSync(indexPath)) {
      res.sendFile(indexPath);
    } else {
      res.status(404).json({ message: "Application not found. Please run npm run build." });
    }
  });

  // Error handling
  app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
    console.error('Unhandled error:', err);
    res.status(500).json({ 
      message: "Internal server error"
    });
  });

  return createServer(app);
}
