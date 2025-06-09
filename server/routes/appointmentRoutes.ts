import express, { Request, Response } from "express";
import { storage } from "../storage";
import { validateAppointmentBooking } from "../utils/appointmentValidation";

const router = express.Router();

/*********************************
 * Service Routes
 *********************************/

// GET /api/services - Public endpoint for browsing services
router.get("/services", async (req: Request, res: Response) => {
  try {
    // For public access, we need to get services by business
    // Check if businessId is provided as query parameter (for customer portal)
    const businessId = req.query.businessId || req.body.businessId;
    let business = req.business;
    
    if (!business && businessId) {
      // If business context not set but businessId provided, fetch business directly
      business = await storage.getUser(parseInt(businessId as string));
    }
    
    if (!business) {
      return res.status(404).json({ message: "Business not found" });
    }
    
    const services = await storage.getServicesByUserId(business.id);
    return res.json(services);
  } catch (error: any) {
    console.error("Error fetching services:", error);
    return res.status(500).json({ message: "Failed to fetch services", error: error.message });
  }
});

// POST /api/services
router.post("/services", async (req: Request, res: Response) => {
  try {
    const user = req.user || req.session?.user;
    if (!user) {
      return res.status(401).json({ message: "Authentication required" });
    }
    const userId = user.id;
    const serviceData = { ...req.body, userId };
    const service = await storage.createService(serviceData);
    return res.status(201).json(service);
  } catch (error: any) {
    console.error("Error creating service:", error);
    return res.status(500).json({ message: "Failed to create service", error: error.message });
  }
});

/*********************************
 * Appointment Routes
 *********************************/

// GET /api/appointments
router.get("/appointments", async (req: Request, res: Response) => {
  try {
    const user = req.user || req.session?.user;
    if (!user) {
      return res.status(401).json({ message: "Authentication required" });
    }    let appointments;
    // Assuming business users see appointments for their business,
    // while customers see their own.
    if (user.role === "business") {
      appointments = await storage.getAppointmentsByUserId(user.id);
    } else {
      appointments = await storage.getAppointmentsByCustomerId(user.id);
    }
    return res.json(appointments);
  } catch (error: any) {
    console.error("Error fetching appointments:", error);
    return res.status(500).json({ message: "Failed to fetch appointments", error: error.message });
  }
});

// POST /api/appointments
router.post("/appointments", async (req: Request, res: Response) => {
  try {
    const user = req.user || req.session?.user;
    if (!user) {
      return res.status(401).json({ message: "Authentication required" });
    }
    
    // Validate and extract appointment data
    const appointmentData = req.body;
    
    // If staffId and appointment time are provided, validate for conflicts
    if (appointmentData.staffId && appointmentData.date) {
      const appointmentDate = new Date(appointmentData.date);
      const duration = appointmentData.duration || 60; // Default to 60 minutes if not specified
      
      // Validate appointment to prevent double booking
      const validation = await validateAppointmentBooking({
        staffId: appointmentData.staffId,
        date: appointmentDate,
        duration: duration
      });
      
      if (!validation.isValid) {
        console.log(`❌ Appointment creation validation failed: ${validation.error}`);
        return res.status(409).json({ 
          message: validation.error || "Appointment slot not available",
          code: "BOOKING_CONFLICT"
        });
      }
      
      console.log("✅ Appointment validation passed, creating appointment...");
    }
    
    const appointment = await storage.createAppointment(appointmentData);
    return res.status(201).json(appointment);
  } catch (error: any) {
    console.error("Error creating appointment:", error);
    return res.status(500).json({ message: "Failed to create appointment", error: error.message });
  }
});

// GET /api/appointments/:id - Get a specific appointment (for payment flow)
router.get("/appointments/:id", async (req: Request, res: Response) => {
  try {
    console.log("🎯 GET /appointments/:id route handler executed - ID:", req.params.id);
    
    const appointmentId = parseInt(req.params.id, 10);
    if (isNaN(appointmentId)) {
      console.log("❌ Invalid appointment ID:", req.params.id);
      return res.status(400).json({ message: "Invalid appointment ID" });
    }
    
    console.log("🔍 Fetching appointment with ID:", appointmentId);
    const appointment = await storage.getAppointment(appointmentId);
    
    if (!appointment) {
      console.log("❌ Appointment not found:", appointmentId);
      return res.status(404).json({ message: "Appointment not found" });
    }
    
    console.log("✅ Appointment found:", appointment);
    return res.json(appointment);
  } catch (error: any) {
    console.error("❌ Error fetching appointment:", error);
    return res.status(500).json({ message: "Failed to fetch appointment", error: error.message });
  }
});

// PUT /api/appointments/:id
router.put("/appointments/:id", async (req: Request, res: Response) => {
  try {
    if (!req.session?.user) {
      return res.status(401).json({ message: "Authentication required" });
    }
    const appointmentId = parseInt(req.params.id, 10);
    if (isNaN(appointmentId)) {
      return res.status(400).json({ message: "Invalid appointment ID" });
    }
    
    const updatedData = req.body;
    
    // If updating time/staff, validate for conflicts
    if (updatedData.staffId && updatedData.date) {
      const appointmentDate = new Date(updatedData.date);
      const duration = updatedData.duration || 60; // Default to 60 minutes if not specified
      
      // Validate appointment to prevent double booking (exclude current appointment)
      const validation = await validateAppointmentBooking({
        staffId: updatedData.staffId,
        date: appointmentDate,
        duration: duration,
        excludeAppointmentId: appointmentId
      });
      
      if (!validation.isValid) {
        console.log(`❌ Appointment update validation failed: ${validation.error}`);
        return res.status(409).json({ 
          message: validation.error || "Appointment slot not available",
          code: "BOOKING_CONFLICT"
        });
      }
      
      console.log("✅ Appointment update validation passed...");
    }
    
    const updatedAppointment = await storage.updateAppointment(appointmentId, updatedData);
    if (!updatedAppointment) {
      return res.status(404).json({ message: "Appointment not found" });
    }
    return res.json(updatedAppointment);
  } catch (error: any) {
    console.error("Error updating appointment:", error);
    return res.status(500).json({ message: "Failed to update appointment", error: error.message });
  }
});

// DELETE /api/appointments/:id
router.delete("/appointments/:id", async (req: Request, res: Response) => {
  try {
    if (!req.session?.user) {
      return res.status(401).json({ message: "Authentication required" });
    }
    const appointmentId = parseInt(req.params.id, 10);
    if (isNaN(appointmentId)) {
      return res.status(400).json({ message: "Invalid appointment ID" });
    }
    const result = await storage.deleteAppointment(appointmentId);
    if (!result) {
      return res.status(404).json({ message: "Appointment not found" });
    }
    return res.status(204).end();
  } catch (error: any) {
    console.error("Error deleting appointment:", error);
    return res.status(500).json({ message: "Failed to delete appointment", error: error.message });
  }
});

export default router;