import express, { Request, Response } from "express";
import { storage } from "../storage";
import { db, query } from "../db";
import { sql } from "drizzle-orm";
import { z } from "zod";
import { requireAuth } from "../middleware/auth";

const router = express.Router();

// Root business route - shows available endpoints
router.get("/", (req: Request, res: Response) => {
  res.json({
    message: "Business API endpoints",
    endpoints: [
      "GET /api/business/:slug - Get business by slug",
      "PATCH /api/business/logo - Update business logo (requires auth)"
    ]
  });
});

// GET /api/business/:slug
router.get("/:slug", async (req: Request, res: Response) => {
  try {
    const { slug } = req.params;
    const business = await storage.getUserByBusinessSlug(slug);
    if (!business) {
      return res.status(404).json({ message: "Business not found" });
    }
    res.json({ business });
  } catch (error) {
    console.error("Error fetching business:", error);
    res.status(500).json({ message: "Failed to fetch business" });
  }
});

// PATCH /api/business/logo
router.patch('/logo', requireAuth, async (req: Request, res: Response) => {
  try {
    const result = await db.execute(sql`
      UPDATE users 
      SET logo_url = ${req.body.logoUrl}
      WHERE id = ${req.user!.id}
      RETURNING *
    `);
    
    if (!result.rows || result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    const { password, ...updatedUser } = result.rows[0];
    res.status(200).json({ user: updatedUser });
  } catch (error) {
    console.error('Error updating business logo:', error);
    res.status(500).json({ error: 'Failed to update business logo' });
  }
});

export default router;