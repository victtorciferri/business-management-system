import express, { Request, Response } from "express";
import { storage } from "../storage";
import { db, query } from "../db";
import { sql } from "drizzle-orm";
import { z } from "zod";
import { requireAuth } from "../middleware/auth";

const router = express.Router();

// GET /api/business/:slug
router.get("/:slug", async (req: Request, res: Response) => {
  try {
    const { slug } = req.params;
    
    const reservedWords = [
      'products', 'services', 'dashboard', 'appointments', 
      'customers', 'admin', 'auth', 'checkout'
    ];
    
    if (reservedWords.includes(slug)) {
      console.log(`Skipping business lookup for reserved word: ${slug}`);
      return res.status(404).json({ message: "Not a valid business slug" });
    }
    
    console.log(`API request for business with slug: ${slug}`);
    
    let result = await query('SELECT * FROM users WHERE business_slug = $1', [slug]);
    
    if (!result.rows || result.rows.length === 0) {
      result = await query('SELECT * FROM users WHERE custom_domain = $1', [slug]);
      
      if (!result.rows || result.rows.length === 0) {
        return res.status(404).json({ message: "Business not found" });
      }
    }

    const business = await storage.processBusinessResult(result.rows[0]);
    const services = await storage.getServicesByUserId(business.id);

    return res.json({
      business,
      services
    });
  } catch (error) {
    console.error(`Error fetching business data:`, error);
    res.status(500).json({ message: "Failed to fetch business data" });
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
    
    if (!result || result.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    const { password, ...updatedUser } = result[0];
    res.status(200).json({ user: updatedUser });
  } catch (error) {
    console.error('Error updating business logo:', error);
    res.status(500).json({ error: 'Failed to update business logo' });
  }
});

export default router;