import express, { Request, Response } from "express";
import { storage } from "../storage";
import { db, query } from "../db";
import { z } from "zod";
import { insertCustomerSchema } from "@shared/schema";
import crypto from "crypto";
import { sendTokenEmail } from "../utils/emailUtils";

const router = express.Router();

/*********************************
 * Customer Routes
 *********************************/

router.get("/customers", async (req: Request, res: Response) => {
  try {
    let userId: number;
    
    if (req.business) {
      userId = req.business.id;
    } else {
      const userIdParam = req.query.userId as string;
      userId = userIdParam ? parseInt(userIdParam) : 1;
      
      if (isNaN(userId)) {
        return res.status(400).json({ message: "Invalid user ID" });
      }
    }
    
    const customers = await storage.getCustomersByUserId(userId);
    res.json(customers);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch customers" });
  }
});

router.post("/customers", async (req: Request, res: Response) => {
  try {
    const business = req.business;
    let customerData;
    
    if (req.body.businessSlug) {
      customerData = insertCustomerSchema.parse(req.body);
    } else {
      try {
        customerData = insertCustomerSchema.parse({
          ...req.body,
          businessSlug: business?.businessSlug || 'default'
        });
      } catch (parseError) {
        if (parseError instanceof z.ZodError) {
          const { Pool } = await import('pg');
          const pool = new Pool({ connectionString: process.env.DATABASE_URL });
          
          try {
            const result = await pool.query(
              `INSERT INTO customers 
               (user_id, first_name, last_name, email, phone, notes) 
               VALUES ($1, $2, $3, $4, $5, $6) 
               RETURNING id, user_id, first_name, last_name, email, phone, notes, created_at`,
              [
                req.body.userId, 
                req.body.firstName, 
                req.body.lastName, 
                req.body.email,
                req.body.phone || null,
                req.body.notes || null
              ]
            );
            
            if (result.rows.length > 0) {
              const customer = {
                id: result.rows[0].id,
                userId: result.rows[0].user_id,
                firstName: result.rows[0].first_name,
                lastName: result.rows[0].last_name,
                email: result.rows[0].email,
                phone: result.rows[0].phone || null,
                notes: result.rows[0].notes || null,
                createdAt: result.rows[0].created_at,
                businessSlug: business?.businessSlug || 'default'
              };
              
              return res.status(201).json(customer);
            }
          } catch (sqlError) {
            console.error('Raw SQL customer insertion error:', sqlError);
            throw sqlError;
          }
        }
        throw parseError;
      }
    }
    
    const customer = await storage.createCustomer(customerData);
    res.status(201).json(customer);
  } catch (error) {
    console.error('Customer creation error:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        message: "Invalid customer data", 
        errors: error.errors 
      });
    }
    res.status(500).json({ message: "Failed to create customer" });
  }
});

// POST /api/check-customer-exists
router.post("/check-customer-exists", async (req: Request, res: Response) => {
  try {
    const schema = z.object({
      email: z.string().email(),
      businessId: z.coerce.number().int().positive()
    });
    
    const { email, businessId } = schema.parse(req.body);
    
    console.log(`Checking if customer exists: ${email} for business ID: ${businessId}`);
    
    const customer = await storage.getCustomerByEmailAndBusinessId(email, businessId);
    
    if (customer) {
      return res.json({
        exists: true,
        customer: {
          id: customer.id,
          firstName: customer.firstName,
          lastName: customer.lastName,
          email: customer.email,
          phone: customer.phone
        }
      });
    } else {
      return res.json({
        exists: false
      });
    }
  } catch (error) {
    console.error("Error checking customer existence:", error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        message: "Invalid input data", 
        errors: error.errors 
      });
    }
    res.status(500).json({ message: "Failed to check customer existence" });
  }
});

/*********************************
 * Customer Access Token Routes
 *********************************/

router.post("/customer-access-token", async (req: Request, res: Response) => {
  try {
    const schema = z.object({
      email: z.string().email(),
      businessId: z.number().int().positive(),
      sendEmail: z.boolean().optional().default(false)
    });
    
    const { email, businessId, sendEmail } = schema.parse(req.body);
    
    console.log(`Creating customer access token for: ${email}, business ID: ${businessId}`);
    
    const customer = await storage.getCustomerByEmailAndBusinessId(email, businessId);
    
    if (!customer) {
      console.log(`Customer not found with email: ${email} for business ID: ${businessId}`);
      return res.status(404).json({ message: "Customer not found with the provided email for this business" });
    }
    
    // Check for existing valid token
    const { rows } = await query(
      'SELECT * FROM customer_access_tokens WHERE customer_id = $1 AND business_id = $2 AND expires_at > NOW() ORDER BY created_at DESC LIMIT 1',
      [customer.id, businessId]
    );
    
    if (rows.length > 0) {
      const existingToken = rows[0];
      await query(
        'UPDATE customer_access_tokens SET last_used_at = NOW() WHERE id = $1',
        [existingToken.id]
      );
      
      const business = await storage.getUser(businessId);
      
      if (sendEmail && business) {
        sendTokenEmail(req, existingToken.token, customer, business);
      }
      
      return res.status(200).json({ 
        token: existingToken.token,
        expiresAt: existingToken.expires_at,
        message: "Using existing valid token"
      });
    }
    
    // Generate new token if no valid existing token
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);
    
    const accessToken = await storage.createCustomerAccessToken({
      customerId: customer.id,
      token,
      expiresAt,
      businessId: businessId
    });
    
    const business = await storage.getUser(businessId);
    
    if (sendEmail && business) {
      sendTokenEmail(req, token, customer, business);
    }
    
    res.status(201).json({ 
      token: accessToken.token,
      expiresAt: accessToken.expiresAt 
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: "Invalid input data", errors: error.errors });
    }
    console.error("Error creating customer access token:", error);
    res.status(500).json({ message: "Failed to create customer access token" });
  }
});

router.get("/customer-profile", async (req: Request, res: Response) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader?.startsWith('Bearer ') 
      ? authHeader.substring(7) 
      : req.query.token as string;
    
    if (!token) {
      return res.status(401).json({ message: "Access token is required" });
    }
    
    const customer = await storage.getCustomerByAccessToken(token);
    
    if (!customer) {
      return res.status(401).json({ message: "Invalid or expired access token" });
    }
    
    const appointments = await storage.getAppointmentsByCustomerId(customer.id);
    
    res.json({
      customer,
      appointments
    });
  } catch (error) {
    console.error("Error fetching customer profile:", error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({ 
      message: "Failed to fetch customer profile", 
      error: errorMessage 
    });
  }
});

/*********************************
 * Public Appointment Booking
 *********************************/

// POST /api/customers/book-appointment - Public endpoint for customer appointment booking
router.post("/book-appointment", async (req: Request, res: Response) => {
  try {
    const appointmentSchema = z.object({
      businessId: z.coerce.number(),
      serviceId: z.coerce.number(),
      staffId: z.coerce.number(),
      customerId: z.coerce.number(),
      date: z.string(),
      time: z.string(),
      notes: z.string().optional()
    });

    const appointmentData = appointmentSchema.parse(req.body);
    
    // Verify the business exists
    const business = await storage.getUser(appointmentData.businessId);
    if (!business) {
      return res.status(404).json({ message: "Business not found" });
    }
    
    // Verify the service exists and belongs to the business
    const service = await storage.getServiceById(appointmentData.serviceId);
    if (!service || service.userId !== appointmentData.businessId) {
      return res.status(404).json({ message: "Service not found or doesn't belong to this business" });
    }
    
    // Verify the customer exists
    const customer = await storage.getCustomerById(appointmentData.customerId);
    if (!customer) {
      return res.status(404).json({ message: "Customer not found" });
    }
    
    // Create the appointment
    const appointment = await storage.createAppointment({
      businessId: appointmentData.businessId,
      serviceId: appointmentData.serviceId,
      staffId: appointmentData.staffId,
      customerId: appointmentData.customerId,
      date: appointmentData.date,
      time: appointmentData.time,
      notes: appointmentData.notes || '',
      status: 'scheduled' // Default status for new appointments
    });
    
    return res.status(201).json(appointment);
  } catch (error: any) {
    console.error("Error creating customer appointment:", error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        message: "Invalid appointment data", 
        errors: error.errors 
      });
    }
    return res.status(500).json({ 
      message: "Failed to create appointment", 
      error: error.message 
    });
  }
});

export default router;