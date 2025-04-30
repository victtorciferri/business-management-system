import { IStorage } from './storage';
import { createServer as createHttpServer } from 'http';
import type { Express } from 'express';
import { db } from './db';
import { sql } from 'drizzle-orm';


// Simplified SSL tracking without database interaction
// Set up simple SSL tracking
const sslManager = {
  domains: new Set<string>(),
  add: async (domain: string) => {
    sslManager.domains.add(domain);
    console.log(`Domain ${domain} registered for SSL tracking`);
    return true;
  },
  has: (domain: string) => {
    return sslManager.domains.has(domain);
  },
  serve: (app: Express) => {
    // In a real production environment, this would set up HTTPS
    // For now, just return the HTTP server
    console.log(`SSL tracking active for ${sslManager.domains.size} domains`);
    return createHttpServer(app);
  }
};

// Function to initialize SSL with an Express app
export async function setupSSL(app: Express, storage: IStorage) {
  // Middleware to check for custom domains. It no longer registers domains in a database.
  // It just checks if a user has the custom domain.
  app.use(async (req, res, next) => {
    try {
      const host = req.hostname;
      
      // Skip localhost, IP addresses and default domain
      if (
        host === 'localhost' || 
        host.match(/^\d+\.\d+\.\d+\.\d+$/) || 
        host === 'appointease.com' ||
        host.endsWith('.replit.dev') ||
        host.endsWith('.repl.co')
      ) {
        return next();
      }
      
      // Check if this is a custom domain
      const user = await storage.getUserByCustomDomain(host);
      
      // If we found a user with this custom domain, register the domain in the SSL manager.
      if (user) {
        await sslManager.add(host);
      }
    } catch (error) {
      console.error('Error in SSL check middleware:', error);
    }
    
    next();
  });
  
  // Return the HTTP server
  return createHttpServer(app);
}

// Function to get the current list of registered domains
export async function getRegisteredDomains() {
  try {
    const result = await db.execute(sql`
      SELECT domain, user_id, created_at, renewed_at
      FROM ssl_domains
      ORDER BY created_at DESC
    `);
    
    return result.rows;
  } catch (error) {
    console.error('Error fetching registered domains:', error);
    return [];
  }
}

// Function to manually register a domain for SSL
export async function manuallyRegisterDomain(domain: string, userId: number) {
  return await registerDomainForSSL(domain, userId);
}

// Helper function
async function registerDomainForSSL(domain: string, userId: number) {
  try {
    // First check if domain is already registered
    const existingDomain = await db.execute(sql`
      SELECT * FROM ssl_domains WHERE domain = ${domain}
    `);
    
    if (existingDomain.rows.length === 0) {
      // Register domain in our database
      await db.execute(sql`
        INSERT INTO ssl_domains (domain, user_id)
        VALUES (${domain}, ${userId})
      `);
      
      // Add the domain to our tracking
      await sslManager.add(domain);
      
      console.log(`Domain ${domain} registered for SSL certificates`);
      return true;
    } else {
      console.log(`Domain ${domain} already registered for SSL certificates`);
      return false;
    }
  } catch (error) {
    console.error(`Error registering domain ${domain} for SSL:`, error);
    return false;
  }
}