import { Router, Request, Response } from 'express';
import { storage } from '../storage';
import { db } from '../db';
import { themes } from '@shared/schema';

/**
 * Debug Routes
 * 
 * These routes are intended for debugging purposes only
 * They should be disabled in production
 */
const router = Router();

/**
 * GET /api/debug/auth-status
 * 
 * Returns the current authentication status including:
 * - Whether the user is authenticated
 * - Session information
 * - User data if authenticated
 */
router.get('/auth-status', (req: Request, res: Response) => {
  // Check if the user is authenticated via session
  const authenticated = req.session && req.session.user ? true : false;
  const sessionInfo = {
    id: req.sessionID,
    cookie: req.session?.cookie || null,
    isNew: req.session?.isNew || false,
    requiresRenewal: false
  };

  // Only return non-sensitive user data
  const user = authenticated ? {
    id: req.session?.user?.id,
    username: req.session?.user?.username,
    email: req.session?.user?.email,
    businessName: req.session?.user?.businessName,
    businessSlug: req.session?.user?.businessSlug,
    role: req.session?.user?.role,
    subscription: req.session?.user?.subscription,
  } : null;

  // Debug database connection status
  let databaseStatus = 'unknown';
  try {
    if (db) {
      databaseStatus = 'connected';
    } else {
      databaseStatus = 'not connected';
    }
  } catch (error) {
    databaseStatus = `error: ${error.message}`;
  }

  // Return full debug info
  return res.json({
    authenticated,
    sessionInfo,
    user,
    business: req.business || null,
    databaseStatus,
    timestamp: new Date().toISOString(),
    environment: {
      nodeEnv: process.env.NODE_ENV,
      sessionStoreType: 'PostgreSQL',
      sessionSecret: process.env.SESSION_SECRET ? 'set' : 'not set'
    }
  });
});

/**
 * POST /api/debug/theme-test
 * 
 * Tests theme creation and storage
 * Requires authentication
 */
router.post('/theme-test', async (req: Request, res: Response) => {
  try {
    // Check if the user is authenticated
    if (!req.session || !req.session.user) {
      return res.status(401).json({
        success: false,
        authenticated: false,
        message: 'Not authenticated'
      });
    }
    
    // Get request data
    const { name, businessId, businessSlug } = req.body;
    
    if (!name || !businessSlug) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields',
        requiredFields: ['name', 'businessSlug'],
        provided: req.body
      });
    }
    
    // Create a debug theme
    const debugTheme = {
      name: name || 'Debug Test Theme',
      businessId: businessId || req.session.user.id,
      businessSlug: businessSlug || req.session.user.businessSlug || 'salonelegante',
      primaryColor: '#3b82f6',
      secondaryColor: '#10b981',
      accentColor: '#f59e0b',
      backgroundColor: '#ffffff',
      textColor: '#1f2937',
      fontFamily: 'Inter, sans-serif',
      description: 'Debug test theme',
      borderRadius: 8,
      isDefault: false,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    // Log the actual data being inserted
    console.log('Debug theme creation - inserting theme data:', JSON.stringify(debugTheme, null, 2));
    
    // Try direct database insert to verify connection
    try {
      const dbResult = await db.insert(themes).values(debugTheme).returning();
      console.log('Debug theme creation - success:', dbResult);
      return res.json({
        success: true,
        debug: true,
        theme: dbResult[0] || null,
        message: 'Debug theme created successfully',
        user: {
          id: req.session.user.id,
          businessSlug: req.session.user.businessSlug
        }
      });
    } catch (dbError) {
      console.error('Debug theme creation - database error:', dbError);
      return res.status(500).json({
        success: false,
        message: 'Failed to create debug theme - database error',
        error: dbError.message,
        hint: dbError.hint || null,
        detail: dbError.detail || null,
        schema: dbError.schema || null,
        table: dbError.table || null,
        column: dbError.column || null,
        constraint: dbError.constraint || null,
        code: dbError.code || null,
        stack: process.env.NODE_ENV !== 'production' ? dbError.stack : undefined
      });
    }
  } catch (error) {
    console.error('Debug theme test failed:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to create debug theme',
      error: error.message,
      stack: process.env.NODE_ENV !== 'production' ? error.stack : undefined
    });
  }
});

/**
 * GET /api/debug/db-info
 * 
 * Returns information about the database connection
 * and schema
 */
router.get('/db-info', async (req: Request, res: Response) => {
  try {
    // Get table information from the database
    const tablesQuery = `
      SELECT 
        table_name,
        table_schema
      FROM 
        information_schema.tables
      WHERE 
        table_schema = 'public'
      ORDER BY 
        table_name
    `;
    
    const tablesResult = await db.execute(tablesQuery);
    
    // Return database information
    return res.json({
      success: true,
      database: {
        connected: true,
        url: process.env.DATABASE_URL ? 'SET (value hidden)' : 'NOT SET',
        tables: tablesResult
      }
    });
  } catch (error) {
    console.error('Database info request failed:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to get database information',
      error: error.message
    });
  }
});

/**
 * GET /api/debug/session-store-test
 * 
 * Tests the session store functionality
 */
router.get('/session-store-test', (req: Request, res: Response) => {
  // Create a debug counter in the session
  if (!req.session.debugCounter) {
    req.session.debugCounter = 1;
  } else {
    req.session.debugCounter += 1;
  }
  
  return res.json({
    success: true,
    sessionInfo: {
      id: req.sessionID,
      isNew: req.session.isNew,
      debugCounter: req.session.debugCounter,
      cookie: req.session.cookie
    },
    message: `Session counter incremented to ${req.session.debugCounter}`
  });
});

/**
 * POST /api/debug/add-theme-fields
 * 
 * Ensures that createdAt and updatedAt are added to theme objects before saving
 */
router.post('/add-theme-fields', async (req: Request, res: Response) => {
  try {
    // Get the theme data from the request body
    const themeData = req.body?.theme || {};
    
    console.log('Debug add-theme-fields - received:', JSON.stringify(themeData, null, 2));
    
    // Ensure required fields are present
    if (!themeData.businessId && req.session?.user?.id) {
      themeData.businessId = req.session.user.id;
    }
    
    if (!themeData.businessSlug && req.session?.user?.businessSlug) {
      themeData.businessSlug = req.session.user.businessSlug;
    } else if (!themeData.businessSlug) {
      themeData.businessSlug = 'salonelegante'; // Default fallback
    }
    
    if (!themeData.name) {
      themeData.name = 'Generated Theme';
    }
    
    // Always add timestamps
    themeData.createdAt = new Date();
    themeData.updatedAt = new Date();
    
    // Log the prepared theme data
    console.log('Debug add-theme-fields - prepared:', JSON.stringify(themeData, null, 2));
    
    // Try direct database insert to verify connection
    try {
      const dbResult = await db.insert(themes).values(themeData).returning();
      
      console.log('Debug add-theme-fields - success:', dbResult);
      return res.json({
        success: true,
        debug: true,
        theme: dbResult[0] || null,
        message: 'Theme created successfully with debug fields added',
      });
    } catch (dbError) {
      console.error('Debug add-theme-fields - database error:', dbError);
      return res.status(500).json({
        success: false,
        message: 'Failed to create theme - database error',
        error: dbError.message,
        hint: dbError.hint || null,
        detail: dbError.detail || null,
        schema: dbError.schema || null,
        table: dbError.table || null,
        column: dbError.column || null,
        constraint: dbError.constraint || null,
        code: dbError.code || null,
        stack: process.env.NODE_ENV !== 'production' ? dbError.stack : undefined
      });
    }
  } catch (error) {
    console.error('Debug add-theme-fields failed:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to process theme data',
      error: error.message,
      stack: process.env.NODE_ENV !== 'production' ? error.stack : undefined
    });
  }
});

export default router;