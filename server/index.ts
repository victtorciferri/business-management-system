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
