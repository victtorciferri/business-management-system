import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertUserSchema, 
  insertServiceSchema, 
  insertCustomerSchema, 
  insertAppointmentSchema,
  insertPaymentSchema 
} from "@shared/schema";
import { z } from "zod";
import Stripe from "stripe";
import nodemailer from "nodemailer";
import { businessExtractor } from "./middleware/businessExtractor";

// Initialize Stripe if secret key is available
let stripe: Stripe | undefined;
if (process.env.STRIPE_SECRET_KEY) {
  stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: "2025-03-31.basil",
  });
}

// Initialize Nodemailer transporter
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || "smtp.example.com",
  port: parseInt(process.env.EMAIL_PORT || "587"),
  secure: process.env.EMAIL_SECURE === "true",
  auth: {
    user: process.env.EMAIL_USER || "user@example.com",
    pass: process.env.EMAIL_PASSWORD || "password",
  },
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Apply the business extractor middleware to all routes
  app.use(businessExtractor);
  
  // Add an endpoint to get the current business (for debugging)
  app.get("/api/current-business", (req, res) => {
    if (req.business) {
      res.json({ business: req.business });
    } else {
      res.status(404).json({ message: "No business context found" });
    }
  });
  
  // Business public portal route - works with both /:slug and custom domains
  app.get("/business-portal", async (req, res) => {
    try {
      // Check if we have a business context from the middleware
      if (!req.business) {
        return res.status(404).send("Business not found");
      }
      
      // Get services for this business
      const services = await storage.getServicesByUserId(req.business.id);
      const activeServices = services.filter(service => service.active);
      
      // Return the business portal page with business data
      res.send(`
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>${req.business.businessName || 'Business Portal'}</title>
          <link rel="stylesheet" href="/assets/main.css">
          <script>
            window.BUSINESS_DATA = ${JSON.stringify({
              business: req.business,
              services: activeServices
            })};
          </script>
        </head>
        <body>
          <div id="root"></div>
          <script type="module" src="/src/main.tsx"></script>
        </body>
        </html>
      `);
    } catch (error) {
      console.error("Error rendering business portal:", error);
      res.status(500).send("Error loading business portal");
    }
  });
  
  // Catch-all route for business-specific pages
  // This will handle URLs like /:slug/services, /:slug/appointments, etc.
  app.get("/:slug/*", async (req, res) => {
    // The businessExtractor middleware should have already attached the business to req.business
    if (!req.business) {
      return res.status(404).send("Business not found");
    }
    
    try {
      // Get services for this business
      const services = await storage.getServicesByUserId(req.business.id);
      const activeServices = services.filter(service => service.active);
      
      // Return the business portal page with business data and subpage information
      const subPath = req.params['0'] as string; // This captures the part after /:slug/
      
      res.send(`
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>${req.business.businessName || 'Business Portal'} - ${subPath.charAt(0).toUpperCase() + subPath.slice(1)}</title>
          <link rel="stylesheet" href="/assets/main.css">
          <script>
            window.BUSINESS_DATA = ${JSON.stringify({
              business: req.business,
              services: activeServices,
              subPath: subPath // Pass the subpath to the frontend for routing
            })};
          </script>
        </head>
        <body>
          <div id="root"></div>
          <script type="module" src="/src/main.tsx"></script>
        </body>
        </html>
      `);
    } catch (error) {
      console.error("Error rendering business page:", error);
      res.status(500).send("Error loading business page");
    }
  });
  
  // Catch-all route for the root path that redirects to business-portal if a business context exists
  app.get("/", (req, res) => {
    if (req.business) {
      // If accessed via custom domain or a subdomain, redirect to the business portal
      res.redirect("/business-portal");
    } else {
      // If no business context, serve the main application
      res.send(`
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>AppointEase - Appointment Scheduling Platform</title>
          <link rel="stylesheet" href="/assets/main.css">
        </head>
        <body>
          <div id="root"></div>
          <script type="module" src="/src/main.tsx"></script>
        </body>
        </html>
      `);
    }
  });
  
  // User routes
  app.get("/api/business/:slug", async (req: Request, res: Response) => {
    try {
      const { slug } = req.params;
      const business = await storage.getUserByBusinessSlug(slug);
      
      if (!business) {
        return res.status(404).json({ message: "Business not found" });
      }
      
      // Get services for this business
      const services = await storage.getServicesByUserId(business.id);
      
      // Return business data excluding sensitive information
      const { password, ...businessData } = business;
      
      res.json({
        business: businessData,
        services: services.filter(service => service.active)
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch business data" });
    }
  });
  
  app.post("/api/users", async (req: Request, res: Response) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      const existingUser = await storage.getUserByUsername(userData.username);
      
      if (existingUser) {
        return res.status(400).json({ message: "Username already exists" });
      }
      
      // Generate a business slug if not provided
      if (!userData.businessSlug && userData.businessName) {
        userData.businessSlug = userData.businessName
          .toLowerCase()
          .replace(/[^a-z0-9]/g, '') // Remove non-alphanumeric characters
          .replace(/\s+/g, '');      // Remove spaces
      }
      
      const user = await storage.createUser(userData);
      res.status(201).json(user);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid user data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create user" });
    }
  });
  
  app.post("/api/login", async (req: Request, res: Response) => {
    try {
      const { username, password } = req.body;
      const user = await storage.getUserByUsername(username);
      
      if (!user || user.password !== password) {
        return res.status(401).json({ message: "Invalid credentials" });
      }
      
      // In a real app, we would use proper authentication with sessions or tokens
      // For this MVP, we'll just return the user
      res.json(user);
    } catch (error) {
      res.status(500).json({ message: "Login failed" });
    }
  });
  
  // Service routes
  app.get("/api/services", async (req: Request, res: Response) => {
    try {
      // Get userId from business context or query parameter
      let userId: number;
      
      if (req.business) {
        // If we have a business context from the URL or domain, use that
        userId = req.business.id;
      } else {
        // Otherwise use the userId query parameter (or default to 1)
        const userIdParam = req.query.userId as string;
        userId = userIdParam ? parseInt(userIdParam) : 1;
        
        if (isNaN(userId)) {
          return res.status(400).json({ message: "Invalid user ID" });
        }
      }
      
      const services = await storage.getServicesByUserId(userId);
      res.json(services);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch services" });
    }
  });
  
  app.post("/api/services", async (req: Request, res: Response) => {
    try {
      const serviceData = insertServiceSchema.parse(req.body);
      const service = await storage.createService(serviceData);
      res.status(201).json(service);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid service data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create service" });
    }
  });
  
  app.put("/api/services/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid service ID" });
      }
      
      const serviceData = insertServiceSchema.partial().parse(req.body);
      const service = await storage.updateService(id, serviceData);
      
      if (!service) {
        return res.status(404).json({ message: "Service not found" });
      }
      
      res.json(service);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid service data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update service" });
    }
  });
  
  app.delete("/api/services/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid service ID" });
      }
      
      const success = await storage.deleteService(id);
      
      if (!success) {
        return res.status(404).json({ message: "Service not found" });
      }
      
      res.status(204).end();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete service" });
    }
  });
  
  // Customer routes
  app.get("/api/customers", async (req: Request, res: Response) => {
    try {
      // Get userId from business context or query parameter
      let userId: number;
      
      if (req.business) {
        // If we have a business context from the URL or domain, use that
        userId = req.business.id;
      } else {
        // Otherwise use the userId query parameter (or default to 1)
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
  
  app.post("/api/customers", async (req: Request, res: Response) => {
    try {
      const customerData = insertCustomerSchema.parse(req.body);
      const customer = await storage.createCustomer(customerData);
      res.status(201).json(customer);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid customer data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create customer" });
    }
  });
  
  app.put("/api/customers/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid customer ID" });
      }
      
      const customerData = insertCustomerSchema.partial().parse(req.body);
      const customer = await storage.updateCustomer(id, customerData);
      
      if (!customer) {
        return res.status(404).json({ message: "Customer not found" });
      }
      
      res.json(customer);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid customer data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update customer" });
    }
  });
  
  app.delete("/api/customers/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid customer ID" });
      }
      
      const success = await storage.deleteCustomer(id);
      
      if (!success) {
        return res.status(404).json({ message: "Customer not found" });
      }
      
      res.status(204).end();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete customer" });
    }
  });
  
  // Appointment routes
  app.get("/api/appointments", async (req: Request, res: Response) => {
    try {
      // Get userId from business context or query parameter
      let userId: number;
      
      if (req.business) {
        // If we have a business context from the URL or domain, use that
        userId = req.business.id;
      } else {
        // Otherwise use the userId query parameter (or default to 1)
        const userIdParam = req.query.userId as string;
        userId = userIdParam ? parseInt(userIdParam) : 1;
        
        if (isNaN(userId)) {
          return res.status(400).json({ message: "Invalid user ID" });
        }
      }
      
      let appointments;
      if (req.query.startDate && req.query.endDate) {
        const startDate = new Date(req.query.startDate as string);
        const endDate = new Date(req.query.endDate as string);
        appointments = await storage.getAppointmentsByDateRange(userId, startDate, endDate);
      } else if (req.query.customerId) {
        // For customer portal, allow fetching by customer ID
        const customerId = parseInt(req.query.customerId as string);
        if (!isNaN(customerId)) {
          appointments = await storage.getAppointmentsByCustomerId(customerId);
        } else {
          appointments = await storage.getAppointmentsByUserId(userId);
        }
      } else {
        appointments = await storage.getAppointmentsByUserId(userId);
      }
      
      res.json(appointments);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch appointments" });
    }
  });
  
  app.post("/api/appointments", async (req: Request, res: Response) => {
    try {
      const appointmentData = insertAppointmentSchema.parse(req.body);
      const appointment = await storage.createAppointment(appointmentData);
      res.status(201).json(appointment);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid appointment data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create appointment" });
    }
  });
  
  app.put("/api/appointments/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid appointment ID" });
      }
      
      const appointmentData = insertAppointmentSchema.partial().parse(req.body);
      const appointment = await storage.updateAppointment(id, appointmentData);
      
      if (!appointment) {
        return res.status(404).json({ message: "Appointment not found" });
      }
      
      res.json(appointment);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid appointment data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update appointment" });
    }
  });
  
  app.delete("/api/appointments/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid appointment ID" });
      }
      
      const success = await storage.deleteAppointment(id);
      
      if (!success) {
        return res.status(404).json({ message: "Appointment not found" });
      }
      
      res.status(204).end();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete appointment" });
    }
  });
  
  // Email notification route
  app.post("/api/send-reminder", async (req: Request, res: Response) => {
    try {
      const { appointmentId } = req.body;
      
      if (!appointmentId) {
        return res.status(400).json({ message: "Appointment ID is required" });
      }
      
      const appointment = await storage.getAppointment(appointmentId);
      
      if (!appointment) {
        return res.status(404).json({ message: "Appointment not found" });
      }
      
      const customer = await storage.getCustomer(appointment.customerId);
      const service = await storage.getService(appointment.serviceId);
      
      if (!customer || !service) {
        return res.status(404).json({ message: "Customer or service not found" });
      }
      
      // Format the date
      const appointmentDate = new Date(appointment.date);
      const formattedDate = appointmentDate.toLocaleDateString();
      const formattedTime = appointmentDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      
      // Send email notification
      const info = await transporter.sendMail({
        from: process.env.EMAIL_FROM || '"AppointEase" <noreply@appointease.com>',
        to: customer.email,
        subject: `Appointment Reminder: ${service.name} on ${formattedDate}`,
        html: `
          <h2>Appointment Reminder</h2>
          <p>Hello ${customer.firstName},</p>
          <p>This is a reminder for your upcoming appointment:</p>
          <ul>
            <li><strong>Service:</strong> ${service.name}</li>
            <li><strong>Date:</strong> ${formattedDate}</li>
            <li><strong>Time:</strong> ${formattedTime}</li>
            <li><strong>Duration:</strong> ${service.duration} minutes</li>
          </ul>
          <p>If you need to reschedule or cancel, please contact us as soon as possible.</p>
          <p>Thank you!</p>
        `,
      });
      
      // Update appointment to mark reminder as sent
      await storage.updateAppointment(appointmentId, { reminderSent: true });
      
      res.json({ message: "Reminder sent successfully", messageId: info.messageId });
    } catch (error) {
      res.status(500).json({ message: "Failed to send reminder" });
    }
  });
  
  // Payment routes
  app.post("/api/create-payment-intent", async (req: Request, res: Response) => {
    try {
      if (!stripe) {
        return res.status(500).json({ message: "Stripe is not configured" });
      }
      
      const { appointmentId } = req.body;
      
      if (!appointmentId) {
        return res.status(400).json({ message: "Appointment ID is required" });
      }
      
      const appointment = await storage.getAppointment(appointmentId);
      
      if (!appointment) {
        return res.status(404).json({ message: "Appointment not found" });
      }
      
      const service = await storage.getService(appointment.serviceId);
      
      if (!service) {
        return res.status(404).json({ message: "Service not found" });
      }
      
      // Create a PaymentIntent with the service price
      const paymentIntent = await stripe.paymentIntents.create({
        amount: parseFloat(service.price.toString()) * 100, // Convert to cents
        currency: "usd",
        metadata: {
          appointmentId: appointment.id.toString(),
          serviceId: service.id.toString(),
        },
      });
      
      // Save payment information
      await storage.createPayment({
        appointmentId: appointment.id,
        amount: service.price,
        status: "pending",
        stripePaymentId: paymentIntent.id,
      });
      
      res.json({ clientSecret: paymentIntent.client_secret });
    } catch (error) {
      res.status(500).json({ message: "Payment processing failed" });
    }
  });
  
  app.post("/api/confirm-payment", async (req: Request, res: Response) => {
    try {
      const { paymentIntentId, appointmentId } = req.body;
      
      if (!paymentIntentId || !appointmentId) {
        return res.status(400).json({ message: "Payment Intent ID and Appointment ID are required" });
      }
      
      // Update appointment payment status
      const appointment = await storage.updateAppointment(parseInt(appointmentId), {
        paymentStatus: "paid",
      });
      
      if (!appointment) {
        return res.status(404).json({ message: "Appointment not found" });
      }
      
      // Find and update payment record
      const payments = await storage.getPaymentsByAppointmentId(parseInt(appointmentId));
      
      if (payments.length > 0) {
        const payment = payments[0];
        await storage.updatePayment(payment.id, {
          status: "completed",
        });
      }
      
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ message: "Failed to confirm payment" });
    }
  });

  // Availability analysis endpoint
  app.get("/api/availability-analysis", async (req: Request, res: Response) => {
    try {
      // Get userId from business context or query parameter
      let userId: number;
      
      if (req.business) {
        // If we have a business context from the URL or domain, use that
        userId = req.business.id;
      } else {
        // Otherwise use the userId query parameter (or default to 1)
        const userIdParam = req.query.userId as string;
        userId = userIdParam ? parseInt(userIdParam) : 1;
        
        if (isNaN(userId)) {
          return res.status(400).json({ message: "Invalid user ID" });
        }
      }
      
      // Get all appointments for analysis
      const appointments = await storage.getAppointmentsByUserId(userId);
      
      // Initialize data structures for analysis
      const hourlyCount: Record<string, number> = {};
      const dayOfWeekCount: Record<string, number> = {};
      const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      
      // Initialize with zeros
      for (let hour = 8; hour < 20; hour++) {
        hourlyCount[hour] = 0;
      }
      
      for (const day of daysOfWeek) {
        dayOfWeekCount[day] = 0;
      }
      
      // Count appointments by hour and day of week
      appointments.forEach(appointment => {
        const date = new Date(appointment.date);
        const hour = date.getHours();
        const dayOfWeek = daysOfWeek[date.getDay()];
        
        if (hourlyCount[hour] !== undefined) {
          hourlyCount[hour]++;
        }
        
        dayOfWeekCount[dayOfWeek]++;
      });
      
      // Determine peak hours (top 30% of hours by appointment count)
      const hourEntries = Object.entries(hourlyCount);
      const sortedHourEntries = hourEntries.sort((a, b) => b[1] - a[1]);
      const peakHourCount = Math.ceil(sortedHourEntries.length * 0.3);
      const peakHours = sortedHourEntries.slice(0, peakHourCount).map(entry => parseInt(entry[0]));
      
      // Determine peak days (top 40% of days by appointment count)
      const dayEntries = Object.entries(dayOfWeekCount);
      const sortedDayEntries = dayEntries.sort((a, b) => b[1] - a[1]);
      const peakDayCount = Math.ceil(sortedDayEntries.length * 0.4);
      const peakDays = sortedDayEntries.slice(0, peakDayCount).map(entry => entry[0]);
      
      // Return the analysis
      res.json({
        hourlyCount,
        dayOfWeekCount,
        peakHours,
        peakDays,
        offPeakHours: sortedHourEntries.slice(peakHourCount).map(entry => parseInt(entry[0])),
        offPeakDays: sortedDayEntries.slice(peakDayCount).map(entry => entry[0]),
        totalAppointments: appointments.length
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to analyze availability" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
