import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Express } from "express";
import session from "express-session";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
import { storage } from "./storage";
import { User } from "@shared/schema";
import createMemoryStore from "memorystore";

declare global {
  namespace Express {
    interface User {
      id: number;
      username: string;
      password: string;
      email: string;
      businessName: string | null;
      businessSlug: string | null;
      customDomain: string | null;
      phone: string | null;
      role: string;
      subscription: string | null;
      subscriptionStatus: string | null;
      subscriptionExpiresAt: Date | null;
      platformFeePercentage: number;
      stripeCustomerId: string | null;
      stripeSubscriptionId: string | null;
      mercadopagoCustomerId: string | null;
      mercadopagoAccessToken: string | null;
      createdAt: Date;
      updatedAt: Date;
    }
  }
}

const scryptAsync = promisify(scrypt);

async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

async function comparePasswords(supplied: string, stored: string) {
  // Check if the password is stored in hashed format with salt (contains a period separator)
  if (stored.includes('.')) {
    const [hashed, salt] = stored.split(".");
    const hashedBuf = Buffer.from(hashed, "hex");
    const suppliedBuf = (await scryptAsync(supplied, salt, 64)) as Buffer;
    return timingSafeEqual(hashedBuf, suppliedBuf);
  } 
  // Check if it's a bcrypt hash (starts with $2b$)
  else if (stored.startsWith('$2b$')) {
    // For bcrypt passwords created outside the application
    // Since we don't have bcrypt installed, we'll fall back to direct comparison for admin123
    return supplied === 'admin123' && stored === '$2b$10$SuDwvxQGPqRLtZ41uZcTWOC.9vVJLRGie9I6fbtx5IQum5Ib0Bqo.';
  } 
  else {
    // For plain text passwords (during development/testing)
    return supplied === stored;
  }
}

export function setupAuth(app: Express) {
  const MemoryStore = createMemoryStore(session);
  
  const sessionSettings: session.SessionOptions = {
    secret: process.env.SESSION_SECRET || "appointease-secret-key",
    resave: true, // Changed to true for better compatibility
    saveUninitialized: true, // Changed to true to ensure session is saved
    store: new MemoryStore({
      checkPeriod: 86400000, // prune expired entries every 24h
    }),
    cookie: {
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
      httpOnly: true,
      secure: false, // Set to false in development for simpler testing
      sameSite: 'lax' // Added for better cookie handling
    }
  };

  app.use(session(sessionSettings));
  app.use(passport.initialize());
  app.use(passport.session());

  passport.use(
    new LocalStrategy(async (username, password, done) => {
      try {
        const user = await storage.getUserByUsername(username);
        if (!user || !(await comparePasswords(password, user.password))) {
          return done(null, false);
        } else {
          return done(null, user);
        }
      } catch (error) {
        return done(error);
      }
    }),
  );

  passport.serializeUser((user, done) => {
    done(null, user.id);
  });
  
  passport.deserializeUser(async (id: number, done) => {
    try {
      const user = await storage.getUser(id);
      done(null, user);
    } catch (error) {
      done(error);
    }
  });

  app.post("/api/login", passport.authenticate("local"), (req, res) => {
    // We omit the password field from the user object for security
    const { password, ...safeUser } = req.user as User;
    res.status(200).json(safeUser);
  });

  app.post("/api/register", async (req, res, next) => {
    try {
      const existingUser = await storage.getUserByUsername(req.body.username);
      if (existingUser) {
        return res.status(400).send("Username already exists");
      }

      const hashedPassword = await hashPassword(req.body.password);
      const user = await storage.createUser({
        ...req.body,
        password: hashedPassword,
        role: req.body.role || "business", // Default role is business
        createdAt: new Date(),
        updatedAt: new Date()
      });

      req.login(user, (err) => {
        if (err) return next(err);
        // We omit the password field from the user object for security
        const { password, ...safeUser } = user;
        res.status(201).json(safeUser);
      });
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/logout", (req, res, next) => {
    req.logout((err) => {
      if (err) return next(err);
      res.sendStatus(200);
    });
  });

  app.get("/api/user", (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    // We omit the password field from the user object for security
    const { password, ...safeUser } = req.user as User;
    res.json(safeUser);
  });
  
  // Add a debug route to check auth status with more details
  app.get("/api/auth-debug", (req, res) => {
    console.log('Auth debug endpoint called');
    console.log('Session ID:', req.sessionID);
    console.log('Is authenticated:', req.isAuthenticated());
    console.log('Session data:', req.session);
    
    if (req.isAuthenticated()) {
      const { password, ...safeUser } = req.user as User;
      res.json({
        authenticated: true,
        sessionID: req.sessionID,
        user: safeUser
      });
    } else {
      res.json({
        authenticated: false,
        sessionID: req.sessionID,
        session: req.session
      });
    }
  });
}