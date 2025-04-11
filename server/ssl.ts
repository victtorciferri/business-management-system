import { IStorage } from './storage';
import { createServer as createHttpServer } from 'http';
import path from 'path';
import fs from 'fs';
import type { Express } from 'express';
import { pool, db } from './db';
import { sql } from 'drizzle-orm';

// For now, we'll implement a simpler SSL setup that works in the current environment
// We'll track custom domains in the database for future SSL implementation

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
  // Check if we need to ensure the ssl_domains table exists first
  try {
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS ssl_domains (
        id SERIAL PRIMARY KEY,
        domain VARCHAR(255) NOT NULL UNIQUE,
        user_id INTEGER NOT NULL REFERENCES users(id),
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        renewed_at TIMESTAMP
      )
    `);
    console.log('SSL domains table created or already exists');
    
    // Load existing domains from the database
    const existingDomains = await db.execute(sql`
      SELECT domain FROM ssl_domains
    `);
    
    for (const row of existingDomains.rows) {
      sslManager.add(row.domain);
    }
    
  } catch (error) {
    console.error('Error creating SSL domains table:', error);
  }
  
  // Middleware to check for custom domains and register them for SSL
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
      
      // If we found a user with this custom domain, register the domain for SSL
      if (user) {
        await registerDomainForSSL(host, user.id);
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