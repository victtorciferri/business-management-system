import express, { Request, Response, NextFunction } from "express";
import { sql } from "drizzle-orm";
import { db, pool } from "../db";
import { storage } from "../storage";
import { updateThemeForBusiness, convertLegacyThemeToTheme } from "../utils/themeUtils";

const router = express.Router();

// Middleware: Admin check
const requireAdmin = (req: Request, res: Response, next: NextFunction) => {
    const user = req.user || req.session?.user;
    console.log("Admin auth check:", { user });
    if (!user) {
        return res.status(401).json({ message: "Authentication required" });
    }
    if (user.role !== "admin") {
        return res.status(403).json({ message: "Admin access required" });
    }
    req.user = user;
    if (req.session) {
        req.session.user = user;
    }
    next();
};

// GET /api/admin/businesses
router.get("/businesses", requireAdmin, async (req: Request, res: Response) => {
    try {
        const businessesResult = await db.execute(sql`
            SELECT 
              id, 
              email, 
              business_name, 
              business_slug, 
              custom_domain, 
              subscription_status,
              created_at
            FROM users 
            WHERE role IN ('business', 'owner') AND business_name IS NOT NULL
            ORDER BY id DESC
        `);
        const businessRows = businessesResult.rows || [];
        const safeBusinesses = businessRows.map((row) => ({
            id: row.id,
            name: row.business_name,
            slug: row.business_slug,
            customDomain: row.custom_domain,
            subscriptionStatus: row.subscription_status,
            ownerEmail: row.email,
            createdAt: row.created_at ? new Date(row.created_at) : null,
        }));
        res.json(safeBusinesses);
    } catch (error) {
        console.error("Error fetching businesses:", error);
        res.status(500).json({ message: "Failed to fetch businesses" });
    }
});

// PUT /api/admin/business/:id
router.put("/business/:id", requireAdmin, async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { name, slug, customDomain, ownerEmail, platformFeePercentage } = req.body;
        if (!name || !slug) {
            return res.status(400).json({ message: "Business name and slug are required" });
        }
        const slugCheckResult = await db.execute(sql`
            SELECT id FROM users 
            WHERE business_slug = ${slug} AND id != ${parseInt(id, 10)}
        `);
        if (slugCheckResult.rows && slugCheckResult.rows.length > 0) {
            return res.status(400).json({ message: "Business slug already in use" });
        }
        const updateResult = await db.execute(sql`
            UPDATE users
            SET 
              business_name = ${name},
              business_slug = ${slug},
              custom_domain = ${customDomain},
              email = ${ownerEmail},
              platform_fee_percentage = ${platformFeePercentage || "2.0"},
              updated_at = NOW()
            WHERE id = ${parseInt(id, 10)}
            RETURNING id, business_name, business_slug, custom_domain, email, platform_fee_percentage, updated_at
        `);
        if (!updateResult.rows || updateResult.rows.length === 0) {
            return res.status(404).json({ message: "Business not found" });
        }
        const updatedBusiness = {
            id: updateResult.rows[0].id,
            name: updateResult.rows[0].business_name,
            slug: updateResult.rows[0].business_slug,
            customDomain: updateResult.rows[0].custom_domain,
            ownerEmail: updateResult.rows[0].email,
            platformFeePercentage: updateResult.rows[0].platform_fee_percentage,
            updatedAt: updateResult.rows[0].updated_at,
        };
        res.json(updatedBusiness);
    } catch (error) {
        console.error("Error updating business:", error);
        res.status(500).json({ message: "Failed to update business" });
    }
});

// GET /api/admin/business/:id/theme
router.get("/business/:id/theme", requireAdmin, async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        if (!id || isNaN(parseInt(id, 10))) {
            return res.status(400).json({ message: "Invalid business ID" });
        }
        const businessId = parseInt(id, 10);
        const result = await db.execute(sql`
            SELECT 
              id, 
              business_name, 
              business_slug,
              theme_settings,
              theme,
              industry_type
            FROM users
            WHERE id = ${businessId}
        `);
        if (!result.rows || result.rows.length === 0) {
            return res.status(404).json({ message: "Business not found" });
        }
        if (result.rows[0].theme) {
            return res.json({ theme: result.rows[0].theme });
        } else if (result.rows[0].theme_settings) {
            const theme = convertLegacyThemeToTheme(result.rows[0].theme_settings);
            return res.json({ theme });
        }
        res.json({ theme: null });
    } catch (error) {
        console.error("Error fetching theme settings:", error);
        res.status(500).json({ message: "Failed to fetch theme settings" });
    }
});

// POST /api/admin/business/:id/theme
router.post("/business/:id/theme", requireAdmin, async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { theme } = req.body;
        if (!id || isNaN(parseInt(id, 10))) {
            return res.status(400).json({ message: "Invalid business ID" });
        }
        if (!theme || typeof theme !== "object") {
            return res.status(400).json({ message: "Theme data is required" });
        }
        const businessId = parseInt(id, 10);
        try {
            await updateThemeForBusiness(businessId, theme);
            return res.json({ message: "Theme updated successfully", theme });
        } catch (dbError) {
            console.error("Error updating theme in database:", dbError);
            return res.status(500).json({ message: "Failed to update theme" });
        }
    } catch (error) {
        console.error("Error updating theme:", error);
        res.status(500).json({ message: "Failed to update theme" });
    }
});

// PUT /api/admin/business/:id/theme (Legacy endpoint)
router.put("/business/:id/theme", requireAdmin, async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const {
            primaryColor,
            secondaryColor,
            accentColor,
            variant,
            appearance,
            radius,
            fontFamily,
            textColor,
            backgroundColor,
            buttonStyle,
            cardStyle,
            industryType,
        } = req.body;
        const themeSettings = {
            name: "Admin Updated Theme",
            primaryColor: primaryColor || "#4f46e5",
            secondaryColor: secondaryColor || "#06b6d4",
            accentColor: accentColor || "#f59e0b",
            textColor: textColor || "#111827",
            backgroundColor: backgroundColor || "#ffffff",
            fontFamily: fontFamily || "Inter, sans-serif",
            borderRadius: radius || 6,
            buttonStyle: buttonStyle || "default",
            cardStyle: cardStyle || "default",
            variant: variant || "professional",
            appearance: appearance || "system",
        };
        const updateResult = await db.execute(sql`
            UPDATE users
            SET 
              theme_settings = ${JSON.stringify(themeSettings)}::jsonb,
              industry_type = ${industryType || "general"},
              updated_at = NOW()
            WHERE id = ${parseInt(id, 10)}
            RETURNING id, business_name, theme_settings, industry_type
        `);
        if (!updateResult.rows || updateResult.rows.length === 0) {
            return res.status(404).json({ message: "Business not found" });
        }
        const updatedTheme = {
            id: updateResult.rows[0].id,
            businessName: updateResult.rows[0].business_name,
            theme: updateResult.rows[0].theme_settings,
            industryType: updateResult.rows[0].industry_type,
        };
        res.json(updatedTheme);
    } catch (error) {
        console.error("Error updating theme settings:", error);
        res.status(500).json({ message: "Failed to update theme settings" });
    }
});

// GET /api/admin/customers
router.get("/customers", requireAdmin, async (req: Request, res: Response) => {
    try {
        const { businessId } = req.query;
        if (!businessId) {
            return res.json([]);
        }
        const allCustomers = await storage.getCustomersByUserId(parseInt(businessId.toString()));
        res.json(allCustomers);
    } catch (error) {
        console.error("Error fetching customers:", error);
        res.status(500).json({ message: "Failed to fetch customers" });
    }
});

// GET /api/admin/appointments
router.get("/appointments", requireAdmin, async (req: Request, res: Response) => {
    try {
        const { businessId } = req.query;
        if (!businessId) {
            return res.json([]);
        }
        const allAppointments = await storage.getAppointmentsByUserId(parseInt(businessId.toString()));
        res.json(allAppointments);
    } catch (error) {
        console.error("Error fetching appointments:", error);
        res.status(500).json({ message: "Failed to fetch appointments" });
    }
});

// GET /api/admin/payments
router.get("/payments", requireAdmin, async (req: Request, res: Response) => {
    try {
        const { businessId } = req.query;
        if (!businessId) {
            return res.json([]);
        }
        const appointments = await storage.getAppointmentsByUserId(parseInt(businessId.toString()));
        if (!appointments || appointments.length === 0) {
            return res.json([]);
        }
        const paymentsPromises = appointments.map((a) => storage.getPaymentsByAppointmentId(a.id));
        const paymentsArrays = await Promise.all(paymentsPromises);
        const allPayments = paymentsArrays.flat();
        res.json(allPayments);
    } catch (error) {
        console.error("Error fetching payments:", error);
        res.status(500).json({ message: "Failed to fetch payments" });
    }
});

// Admin Debug Endpoints

// GET /api/debug/admin-businesses
router.get("/debug/admin-businesses", requireAdmin, async (req: Request, res: Response) => {
    try {
        console.log("Admin businesses debug endpoint called");
        console.log("Session:", {
            id: req.sessionID,
            user: req.session?.user?.username,
            role: req.session?.user?.role,
        });
        if (!req.session?.user) {
            return res.status(401).json({
                error: "Not authenticated",
                message: "You must be logged in as admin",
            });
        }
        if (req.session.user.role !== "admin") {
            return res.status(403).json({
                error: "Not admin",
                message: "You must be an admin to access this endpoint",
                role: req.session.user.role,
            });
        }        const businessesResult = await db.execute(sql`
            SELECT 
              id, 
              email, 
              business_name, 
              business_slug, 
              custom_domain, 
              subscription_status,
              created_at
            FROM users 
            WHERE role IN ('business', 'owner') AND business_name IS NOT NULL
            ORDER BY id DESC
        `);
        const businesses = businessesResult.rows.map((row) => ({
            id: row.id,
            name: row.business_name,
            slug: row.business_slug,
            email: row.email,
            createdAt: row.created_at,
        }));
        return res.json({
            authenticated: true,
            isAdmin: true,
            userInfo: {
                id: req.session.user.id,
                username: req.session.user.username,
                role: req.session.user.role,
            },
            businesses,
        });
    } catch (error) {
        console.error("Error in admin-businesses debug endpoint:", error);
        return res.status(500).json({
            error: "Server error",
            message: error instanceof Error ? error.message : "Unknown error",
        });
    }
});

// GET /api/debug/check-admin-session
router.get("/debug/check-admin-session", (req: Request, res: Response) => {
    try {
        console.log("Check admin session debug endpoint called");
        console.log("Full session data:", req.session);
        console.log("Session ID:", req.sessionID);
        console.log("Cookies:", req.headers.cookie);
        const user = req.session?.user;
        if (!user) {
            return res.status(401).json({
                error: "Not authenticated",
                message: "No user found in session",
                session: {
                    id: req.sessionID,
                    exists: !!req.session,
                },
            });
        }
        if (user.role !== "admin") {
            return res.status(403).json({
                error: "Not admin",
                message: "User is not an admin",
                userRole: user.role,
            });
        }
        req.user = user;
        return res.status(200).json({
            success: true,
            message: "Admin user found in session",
            user: {
                id: user.id,
                username: user.username,
                role: user.role,
            },
        });
    } catch (error) {
        console.error("Error in check-admin-session:", error);
        return res.status(500).json({
            error: "Server error",
            message: error instanceof Error ? error.message : "Unknown error",
        });
    }
});

export default router;