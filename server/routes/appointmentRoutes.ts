import express, { Request, Response } from "express";
import { storage } from "../storage";

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
    }
    let appointments;
    // Assuming business users see appointments for their business,
    // while customers see their own.
    if (user.role === "business") {
      appointments = await storage.getAppointmentsByBusinessId(user.id);
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
    // Validate and extract appointment data as necessary
    const appointmentData = req.body;
    const appointment = await storage.createAppointment(appointmentData);
    return res.status(201).json(appointment);
  } catch (error: any) {
    console.error("Error creating appointment:", error);
    return res.status(500).json({ message: "Failed to create appointment", error: error.message });
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