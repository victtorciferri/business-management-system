import express, { Request, Response } from "express";
import passport from "passport";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { storage } from "../storage";
import { db } from "../db";
import { requireAuth } from "../middleware/auth";
import { Business, defaultThemeSettings } from "@shared/config";

const router = express.Router();

// User registration schema
const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  businessName: z.string().min(2),
  businessSlug: z.string().min(2),
  firstName: z.string().min(2),
  lastName: z.string().min(2),
  username: z.string().min(2).optional()
});

/**
 * Register a new business account
 * POST /api/auth/register
 */
router.post("/register", async (req: Request, res: Response) => {
  try {
    const userData = registerSchema.parse(req.body);
    
    // Check if email already exists
    const existingUser = await storage.getUserByEmail(userData.email);
    if (existingUser) {
      return res.status(400).json({ message: "Email already registered" });
    }
    
    // Check if business slug is available
    const existingBusiness = await storage.getUserByBusinessSlug(userData.businessSlug);
    if (existingBusiness) {
      return res.status(400).json({ message: "Business URL already taken" });
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash(userData.password, 10);
      // Create new business account
    const newBusiness = await storage.createUser({
      ...userData,
      username: userData.username || userData.businessSlug, // Use businessSlug as username if not provided
      password: hashedPassword,
      role: 'owner',
      themeSettings: defaultThemeSettings
    });
    
    // Remove password from response
    const { password: _, ...businessData } = newBusiness;
    
    // Log the user in
    req.session.user = businessData;
    
    res.status(201).json({ 
      message: "Business registered successfully",
      business: businessData
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        message: "Invalid input data",
        errors: error.errors 
      });
    }
    console.error("Registration error:", error);
    res.status(500).json({ message: "Failed to register business" });
  }
});

/**
 * Login to business account
 * POST /api/auth/login
 */
router.post("/login", passport.authenticate("local"), (req: Request, res: Response) => {
  if (req.user) {
    const { password: _, ...userData } = req.user as Business;
    
    // Set session data for compatibility with admin routes
    if (req.session) {
      req.session.user = userData;
    }
    
    res.json({ user: userData });
  } else {
    res.status(401).json({ message: "Authentication failed" });
  }
});

/**
 * Logout from current session
 * POST /api/auth/logout
 */
router.post("/logout", (req: Request, res: Response) => {
  req.session.destroy((err) => {
    if (err) {
      console.error("Logout error:", err);
      return res.status(500).json({ message: "Failed to logout" });
    }
    res.json({ message: "Logged out successfully" });
  });
});

/**
 * Get current authenticated user
 * GET /api/auth/user
 */
router.get("/user", requireAuth, (req: Request, res: Response) => {
  if (req.user) {
    const { password: _, ...userData } = req.user as Business;
    res.json({ user: userData });
  } else {
    res.status(401).json({ message: "Not authenticated" });
  }
});

/**
 * Update user profile
 * PUT /api/auth/profile
 */
router.put("/profile", requireAuth, async (req: Request, res: Response) => {
  try {
    const updates = req.body;
    
    // Don't allow password updates through this endpoint
    delete updates.password;
    
    const updatedUser = await storage.updateUser(req.user!.id, updates);
    
    // Remove password from response
    const { password: _, ...userData } = updatedUser;
    
    // Update session
    req.session.user = userData;
    
    res.json({ user: userData });
  } catch (error) {
    console.error("Profile update error:", error);
    res.status(500).json({ message: "Failed to update profile" });
  }
});

/**
 * Change password
 * PUT /api/auth/password
 */
router.put("/password", requireAuth, async (req: Request, res: Response) => {
  try {
    const { currentPassword, newPassword } = req.body;
    
    const user = await storage.getUserById(req.user!.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    // Verify current password
    const isValid = await bcrypt.compare(currentPassword, user.password);
    if (!isValid) {
      return res.status(400).json({ message: "Current password is incorrect" });
    }
    
    // Hash and update new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await storage.updateUser(user.id, { password: hashedPassword });
    
    res.json({ message: "Password updated successfully" });
  } catch (error) {
    console.error("Password change error:", error);
    res.status(500).json({ message: "Failed to change password" });
  }
});

export default router;