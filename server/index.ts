import express, { type Request, Response, NextFunction } from "express";
import path from "path";
import { fileURLToPath } from "url";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import { seedDatabase } from "./seed";
import { businessDataInjector } from "./middleware/businessDataInjector";
import { businessExtractor } from "./middleware/businessExtractor";
import { setupSSL } from "./ssl";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import { registerThemeRoutes } from "./theme/registerThemeRoutes";

// Get current file path and directory path
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Serve uploaded files from the uploads directory
const uploadsDir = path.join(__dirname, '../uploads');
app.use('/uploads', express.static(uploadsDir));

// Import multer for handling file uploads
import multer from 'multer';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';

// Setup multer storage for memory buffer (will process before saving)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
});

// Direct image upload route that bypasses authentication
// This will be accessible without login requirements
app.post('/direct-upload', upload.single('image'), async (req, res) => {
  console.log('Direct upload endpoint hit');
  
  if (!req.file) {
    console.log('No file provided in direct upload');
    return res.status(400).json({ error: 'No file uploaded' });
  }
  
  try {
    console.log('Processing file in direct upload:', req.file.originalname);
    
    // Ensure the uploads directory exists
    if (!fs.existsSync(uploadsDir)) {
      console.log('Creating uploads directory');
      fs.mkdirSync(uploadsDir, { recursive: true });
    }
    
    // Generate a unique filename to avoid collisions
    const uniqueFilename = `${uuidv4()}-${req.file.originalname.replace(/\s+/g, '_')}`;
    const filePath = path.join(uploadsDir, uniqueFilename);
    
    // Write the file directly from buffer
    await fs.promises.writeFile(filePath, req.file.buffer);
    console.log('File saved to:', filePath);
    
    // Return a direct URL to the uploaded file
    const imageUrl = `/uploads/${uniqueFilename}`;
    
    // Explicitly set content type as JSON
    res.setHeader('Content-Type', 'application/json');
    console.log('Sending direct upload JSON response with URL:', imageUrl);
    
    // Return a simple JSON object with the URL
    return res.status(200).json({
      url: imageUrl,
      success: true
    });
  } catch (error) {
    console.error('Error in direct upload:', error);
    return res.status(500).json({ 
      error: 'Failed to upload file',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});



// Direct update logo endpoint that bypasses problematic middleware
// This is the companion to the direct-upload endpoint
app.post('/direct-update-logo', express.json(), async (req, res) => {
  console.log('Direct update logo endpoint hit with body:', req.body);
  
  try {
    const { logoUrl, userId } = req.body;
    
    if (!logoUrl || !userId) {
      console.log('Missing required fields for direct update logo');
      return res.status(400).json({ 
        error: 'Missing required fields', 
        success: false 
      });
    }
    
    console.log(`Direct updating logo for user ID ${userId} with logo URL: ${logoUrl}`);
    
    // Import storage directly to avoid middleware issues
    const { storage } = await import('./storage');
    
    // Get current user
    const user = await storage.getUser(userId);
    if (!user) {
      console.log(`User with ID ${userId} not found in direct update logo`);
      return res.status(404).json({ 
        error: 'User not found', 
        success: false 
      });
    }
    
    console.log('Current user data before update:', { ...user, password: '[REDACTED]' });
    
    // Update user with new logo URL
    const updatedUser = await storage.updateUser(userId, { logoUrl });
    
    if (!updatedUser) {
      console.log('storage.updateUser returned null or undefined in direct update');
      return res.status(500).json({ 
        error: 'Failed to update logo', 
        success: false 
      });
    }
    
    console.log('Updated user data in direct endpoint:', { ...updatedUser, password: '[REDACTED]' });
    
    // Explicitly set content type
    res.setHeader('Content-Type', 'application/json');
    
    // Return a successful response with user data (without password)
    const { password, ...userWithoutPassword } = updatedUser;
    return res.status(200).json({
      ...userWithoutPassword,
      success: true
    });
  } catch (error) {
    console.error('Error in direct update logo:', error);
    return res.status(500).json({ 
      error: 'Failed to update logo',
      message: error instanceof Error ? error.message : 'Unknown error',
      success: false
    });
  }
});

// Direct business data endpoint for the customer portal
// This endpoint bypasses middleware that might interfere with responses
app.get('/direct-business-data/:businessId', async (req, res) => {
  console.log('Direct business data endpoint hit for:', req.params.businessId);
  
  try {
    const businessId = parseInt(req.params.businessId, 10);
    
    if (isNaN(businessId)) {
      console.log('Invalid business ID in direct business data endpoint');
      return res.status(400).json({ 
        error: 'Invalid business ID', 
        success: false 
      });
    }
    
    // Import storage directly to avoid middleware issues
    const { storage } = await import('./storage');
    
    // Get business data
    const business = await storage.getUser(businessId);
    if (!business) {
      console.log(`Business with ID ${businessId} not found in direct business data endpoint`);
      return res.status(404).json({ 
        error: 'Business not found', 
        success: false 
      });
    }
    
    // Get services for this business
    const services = await storage.getServicesByUserId(businessId);
    const activeServices = services.filter(service => service.active || true);
    
    console.log(`Direct business data endpoint: Found business "${business.businessName}" with ${activeServices.length} services`);
    
    // Explicitly set content type
    res.setHeader('Content-Type', 'application/json');
    
    // Return a successful response with business data (without password)
    const { password, ...businessWithoutPassword } = business;
    return res.status(200).json({
      business: businessWithoutPassword,
      services: activeServices,
      success: true
    });
  } catch (error) {
    console.error('Error in direct business data endpoint:', error);
    return res.status(500).json({ 
      error: 'Failed to fetch business data',
      message: error instanceof Error ? error.message : 'Unknown error',
      success: false
    });
  }
});

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  // Seed the database with initial data
  await seedDatabase();
  
  // Set up authentication
  setupAuth(app);
  
  // Add the business extractor middleware before routes
  app.use(businessExtractor);
  
  // Register theme routes for the new theme engine
  registerThemeRoutes(app);
  
  // Let the routes.ts define all routes
  let server = await registerRoutes(app);
  
  // Set up SSL certificate handling with Greenlock
  try {
    const sslServer = await setupSSL(app, storage);
    console.log("SSL setup completed successfully");
    
    // If in production, use the SSL server instead
    if (process.env.NODE_ENV === 'production') {
      server = sslServer;
    }
  } catch (error) {
    console.error("Error setting up SSL:", error);
    // Continue with HTTP if SSL setup fails
  }
  
  // No need for businessDataInjector here as it's now handled in routes.ts
  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    const stack = process.env.NODE_ENV === "development" ? err.stack : undefined;
    const errorDetails = {
      message,
      error: err.name || "Error",
      stack,
      details: err.details || err.errors || undefined,
      code: err.code,
      path: _req.path,
      method: _req.method
    };

    console.error("Server error:", errorDetails);
    res.status(status).json(errorDetails);
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // ALWAYS serve the app on port 5000
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  const port = 5000;
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true,
  }, () => {
    log(`serving on port ${port}`);
  });
})();
