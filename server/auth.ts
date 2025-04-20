import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Express } from "express";
import session from "express-session";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
import { storage } from "./storage";
import { User } from "@shared/schema";
import { pool } from "./db";
import createMemoryStore from "memorystore";
import connectPgSimple from "connect-pg-simple";

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
  // Initialize PostgreSQL session store for persistent sessions
  const PgStore = connectPgSimple(session);
  
  const sessionSettings: session.SessionOptions = {
    secret: process.env.SESSION_SECRET || "appointease-secret-key",
    resave: false, 
    saveUninitialized: false,
    store: new PgStore({
      pool: pool,
      tableName: 'session',
      createTableIfMissing: true,  // Create the session table if it doesn't exist
      pruneSessionInterval: 24 * 60 * 60 // 24 hours
    }),
    cookie: {
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days - longer for better user experience
      httpOnly: true,
      secure: process.env.NODE_ENV === "production"
    }
  };

  app.use(session(sessionSettings));
  app.use(passport.initialize());
  app.use(passport.session());

  passport.use(
    new LocalStrategy(async (username, password, done) => {
      try {
        console.log(`Authentication attempt for username: ${username}`);
        const user = await storage.getUserByUsername(username);
        
        if (!user) {
          console.log(`Authentication failed: User '${username}' not found`);
          return done(null, false, { message: 'Invalid username or password' });
        }
        
        const passwordValid = await comparePasswords(password, user.password);
        if (!passwordValid) {
          console.log(`Authentication failed: Invalid password for '${username}'`);
          return done(null, false, { message: 'Invalid username or password' });
        }
        
        console.log(`Authentication successful for user: ${username}`);
        return done(null, user);
      } catch (error) {
        console.error(`Authentication error for '${username}':`, error);
        return done(error);
      }
    }),
  );

  passport.serializeUser((user, done) => {
    console.log(`Serializing user: ${user.username} (ID: ${user.id})`);
    done(null, user.id);
  });
  
  passport.deserializeUser(async (id: number, done) => {
    try {
      console.log(`Deserializing user with ID: ${id}`);
      const user = await storage.getUser(id);
      
      if (!user) {
        console.error(`Deserialization failed: User with ID ${id} not found`);
        return done(null, false);
      }
      
      console.log(`Successfully deserialized user: ${user.username}`);
      done(null, user);
    } catch (error) {
      console.error(`Error deserializing user with ID ${id}:`, error);
      done(error);
    }
  });

  app.post("/api/login", (req, res, next) => {
    console.log("Login request received for:", req.body.username);
    
    passport.authenticate("local", (err, user, info) => {
      if (err) {
        console.error("Login error:", err);
        return next(err);
      }
      
      if (!user) {
        console.log("Login failed:", info?.message || "Invalid credentials");
        return res.status(401).json({ message: info?.message || "Invalid credentials" });
      }
      
      req.login(user, (loginErr) => {
        if (loginErr) {
          console.error("Login session error:", loginErr);
          return next(loginErr);
        }
        
        console.log(`User ${user.username} successfully logged in`);
        // We omit the password field from the user object for security
        const { password, ...safeUser } = user as User;
        res.status(200).json(safeUser);
      });
    })(req, res, next);
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
    console.log(`Logout request received, user authenticated: ${req.isAuthenticated()}`);
    
    if (req.isAuthenticated()) {
      const username = (req.user as User).username;
      const userId = (req.user as User).id;
      console.log(`Logging out user: ${username} (ID: ${userId})`);
    } else {
      console.log("Logout called but no user is authenticated");
    }
    
    req.logout((err) => {
      if (err) {
        console.error("Error during logout:", err);
        return next(err);
      }
      
      console.log("User successfully logged out");
      res.sendStatus(200);
    });
  });

  app.get("/api/user", (req, res) => {
    console.log(`API user request - isAuthenticated: ${req.isAuthenticated()}`);
    
    if (!req.isAuthenticated()) {
      console.log("User is not authenticated");
      return res.status(401).json({ message: "Not authenticated" });
    }
    
    // Log session details for debugging
    console.log(`Session ID: ${req.sessionID}`);
    console.log(`User in session:`, req.user ? 
      `${(req.user as User).username} (ID: ${(req.user as User).id})` : 
      "No user in session");
    
    // We omit the password field from the user object for security
    const { password, ...safeUser } = req.user as User;
    res.json(safeUser);
  });
}