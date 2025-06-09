import express, { Request, Response } from "express";
import { storage } from "../storage";
import { db, query } from "../db";
import { z } from "zod";
import { insertCustomerSchema } from "@shared/schema";
import crypto from "crypto";
import { validateAppointmentBooking } from "../utils/appointmentValidation";

const router = express.Router();

/*********************************
 * Customer Routes
 *********************************/

router.get("/", async (req: Request, res: Response) => {
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

router.post("/", async (req: Request, res: Response) => {
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
    const service = await storage.getService(appointmentData.serviceId);
    if (!service || service.userId !== appointmentData.businessId) {
      return res.status(404).json({ message: "Service not found or doesn't belong to this business" });
    }
    
    // Verify the customer exists
    const customer = await storage.getCustomer(appointmentData.customerId);
    if (!customer) {
      return res.status(404).json({ message: "Customer not found" });
    }
    
    // Parse the date string into a Date object
    // The frontend sends date as ISO string from appointmentDate.toISOString()
    // This already includes the correct date and time, so we can use it directly
    const appointmentDate = new Date(appointmentData.date);
    
    // Validate that we have a valid date
    if (isNaN(appointmentDate.getTime())) {
      return res.status(400).json({ message: "Invalid date format" });
    }
    
    console.log("Creating appointment with date:", appointmentDate.toISOString());
    
    // ⚠️ VALIDATE APPOINTMENT TO PREVENT DOUBLE BOOKING
    const validation = await validateAppointmentBooking({
      staffId: appointmentData.staffId,
      date: appointmentDate,
      duration: service.duration
    });
    
    if (!validation.isValid) {
      console.log(`❌ Appointment booking validation failed: ${validation.error}`);
      return res.status(409).json({ 
        message: validation.error || "Appointment slot not available",
        code: "BOOKING_CONFLICT"
      });
    }
    
    console.log("✅ Appointment validation passed, creating appointment...");
    
    // Create the appointment
    const appointment = await storage.createAppointment({
      userId: appointmentData.businessId, // businessId maps to userId in the appointments table
      serviceId: appointmentData.serviceId,
      staffId: appointmentData.staffId,
      customerId: appointmentData.customerId,
      date: appointmentDate, // Pass Date object
      duration: service.duration, // Include service duration
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