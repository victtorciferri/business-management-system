import express, { Request, Response } from "express";
import { sql } from "drizzle-orm";
import { db } from "../db";

const router = express.Router();

// GET /api/test-error
router.get("/test-error", (_req: Request, res: Response) => {
    try {
        throw new Error("This is a test error with a detailed stack trace.");
    } catch (error) {
        if (error instanceof Error) {
            const errorDetails = {
                message: error.message,
                name: error.name,
                stack: error.stack,
                code: "TEST_ERROR_CODE",
                details: {
                    timestamp: new Date().toISOString(),
                    requestId: Math.random().toString(36).substring(2, 15),
                    environment: process.env.NODE_ENV || "development",
                }
            };
            res.status(500).json(errorDetails);
        } else {
            res.status(500).json({ message: "Unknown error occurred" });
        }
    }
});

// GET /api/test-error/:code
router.get("/test-error/:code", (req: Request, res: Response) => {
    const code = parseInt(req.params.code, 10);
    if (isNaN(code) || code < 100 || code > 599) {
        return res.status(400).json({ message: "Invalid HTTP status code. Please provide a code between 100-599." });
    }
    const errorMessages: Record<number, string> = {
        400: "Bad request - The server could not understand the request.",
        401: "Unauthorized - Authentication is required and has failed or not been provided.",
        403: "Forbidden - You don't have permission to access this resource.",
        404: "Not found - The requested resource does not exist.",
        422: "Unprocessable Entity - The request was well-formed but contains semantic errors.",
        429: "Too Many Requests - You've sent too many requests in a given amount of time.",
        500: "Internal Server Error - Something went wrong on the server.",
        503: "Service Unavailable - The server is currently unable to handle the request."
    };
    const message = errorMessages[code] || `Test error with status code ${code}`;
    res.status(code).json({
        message,
        error: "Test Error",
        code: `TEST_${code}`,
        details: {
            timestamp: new Date().toISOString(),
            requestId: Math.random().toString(36).substring(2, 15),
            path: req.path,
            method: req.method
        }
    });
});

// GET /api/debug/business-lookup/:slug
router.get("/business-lookup/:slug", async (req: Request, res: Response) => {
    try {
        const { slug } = req.params;
        // Import storage dynamically from ../storage
        const { storage } = await import("../storage");
        const business = await storage.getUserByBusinessSlug(slug);
        if (business) {
            const { password, ...sanitizedBusiness } = business;
            return res.json({ found: true, business: sanitizedBusiness });
        } else {
            return res.json({ found: false, message: "No business found with this slug" });
        }
    } catch (error) {
        return res.status(500).json({ 
            error: "Error looking up business", 
            message: error instanceof Error ? error.message : "Unknown error"
        });
    }
});

// GET /api/debug/admin-businesses
router.get("/admin-businesses", async (req: Request, res: Response) => {
    try {
        const user = req.session?.user;
        if (!user) {
            return res.status(401).json({
                error: "Not authenticated",
                message: "You must be logged in as admin"
            });
        }
        if (user.role !== "admin") {
            return res.status(403).json({
                error: "Not admin",
                message: "You must be an admin to access this endpoint",
                role: user.role
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
        const businesses = businessesResult.rows.map(row => ({
            id: row.id,
            name: row.business_name,
            slug: row.business_slug,
            email: row.email,
            createdAt: row.created_at
        }));
        return res.json({
            authenticated: true,
            isAdmin: true,
            userInfo: {
                id: user.id,
                username: user.username,
                role: user.role
            },
            businesses
        });
    } catch (error) {
        return res.status(500).json({
            error: "Server error",
            message: error instanceof Error ? error.message : "Unknown error"
        });
    }
});
  
// GET /api/debug/check-admin-session
router.get("/check-admin-session", (req: Request, res: Response) => {
    try {
        const user = req.session?.user;
        if (!user) {
            return res.status(401).json({
                error: "Not authenticated",
                message: "No user found in session",
                session: {
                    id: req.sessionID,
                    exists: !!req.session
                }
            });
        }
        if (user.role !== "admin") {
            return res.status(403).json({
                error: "Not admin",
                message: "User is not an admin",
                userRole: user.role
            });
        }
        req.user = user;
        return res.status(200).json({
            success: true,
            message: "Admin user found in session",
            user: {
                id: user.id,
                username: user.username,
                role: user.role
            }
        });
    } catch (error) {
        return res.status(500).json({
            error: "Server error",
            message: error instanceof Error ? error.message : "Unknown error"
        });
    }
});
  
// GET /api/debug/customer-tokens
router.get("/customer-tokens", async (req: Request, res: Response) => {
    try {
        const tokens = await db.execute(sql`
            SELECT 
                cat.id,
                cat.token,
                cat.customer_id,
                cat.business_id,
                cat.expires_at,
                cat.created_at,
                c.email,
                c.first_name,
                c.last_name
            FROM customer_access_tokens cat
            JOIN customers c ON cat.customer_id = c.id
            ORDER BY cat.created_at DESC
            LIMIT 10
        `);
        res.json(tokens);
    } catch (error) {
        console.error("Error fetching customer tokens:", error);
        res.status(500).json({ message: "Failed to fetch customer tokens", error: error.message });
    }
});

// GET /api/debug/test-token/:token
router.get("/test-token/:token", async (req: Request, res: Response) => {
    try {
        const { token } = req.params;
        const result = await db.execute(sql`
            SELECT 
                cat.id,
                cat.token,
                cat.customer_id,
                cat.business_id,
                cat.expires_at,
                cat.created_at,
                c.email,
                c.first_name,
                c.last_name,
                (cat.expires_at > NOW()) as is_valid
            FROM customer_access_tokens cat
            JOIN customers c ON cat.customer_id = c.id
            WHERE cat.token = ${token}
        `);
        res.json({ token, result });
    } catch (error) {
        console.error("Error testing token:", error);
        res.status(500).json({ message: "Failed to test token", error: error.message });
    }
});

// GET /api/debug/staff-list
router.get("/staff-list", async (req: Request, res: Response) => {
    try {
        const staff = await db.execute(sql`
            SELECT 
                id,
                user_id,
                name,
                email,
                role,
                is_active,
                created_at
            FROM staff
            ORDER BY created_at DESC
            LIMIT 10
        `);
        res.json(staff);
    } catch (error) {
        console.error("Error fetching staff:", error);
        res.status(500).json({ message: "Failed to fetch staff", error: error.message });
    }
});

export default router;