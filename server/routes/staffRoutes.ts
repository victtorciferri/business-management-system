import express, { Request, Response, NextFunction } from "express";
import { storage } from "../storage";
const router = express.Router();

/*********************************
 * Staff Management Routes
 *********************************/

// GET /api/staff
router.get("/", async (req: Request, res: Response) => {
  try {
    // Public access: if businessId is provided as query parameter
    if (req.query.businessId) {
      const businessId = parseInt(req.query.businessId as string);
      const staffMembers = await storage.getStaffByBusinessId(businessId);
      if (!staffMembers) return res.json([]);
      // Return only public fields for public access
      const publicStaffInfo = staffMembers
        .filter((staff) => staff.role === "staff")
        .map((staff) => ({
          id: staff.id,
          username: staff.username,
          email: staff.email,
          phone: staff.phone,
          role: staff.role,
        }));
      return res.json(publicStaffInfo);
    }
    // Authenticated access
    if (!req.session?.user) {
      return res.status(401).json({ message: "Authentication required" });
    }
    const businessId =
      req.session.user.role === "business"
        ? req.session.user.id
        : req.session.user.id;
    const staffMembers = await storage.getStaffByBusinessId(businessId);
    const staffWithCounts = await Promise.all(
      staffMembers
        .filter((staff) => staff.role === "staff")
        .map(async (staff) => {
          const appointments = await storage.getStaffAppointments(staff.id);
          const availability = await storage.getStaffAvailability(staff.id);
          return { ...staff, appointmentsCount: appointments.length, availability };
        })
    );
    res.json(staffWithCounts);
  } catch (error) {
    console.error("Error fetching staff:", error);
    res.status(500).json({ message: "Failed to fetch staff members" });
  }
});

// GET /api/staff/:id
router.get("/:id", async (req: Request, res: Response) => {
  try {
    if (
      !req.session?.user ||
      (req.session.user.role !== "business" &&
        req.session.user.role !== "admin" &&
        req.session.user.id !== parseInt(req.params.id))
    ) {
      return res.status(403).json({ message: "Not authorized to view this staff profile" });
    }
    const staffId = parseInt(req.params.id);
    const staff = await storage.getUser(staffId);
    if (!staff) return res.status(404).json({ message: "Staff member not found" });
    if (req.session.user.role === "business" && staff.businessId !== req.session.user.id) {
      return res.status(403).json({ message: "This staff member does not belong to your business" });
    }
    const { password, ...staffData } = staff;
    res.json(staffData);
  } catch (error) {
    console.error("Error fetching staff profile:", error);
    res.status(500).json({ message: "Failed to fetch staff profile" });
  }
});

// POST /api/staff
router.post("/", async (req: Request, res: Response) => {
  try {
    if (!req.session?.user || (req.session.user.role !== "business" && req.session.user.role !== "admin")) {
      return res.status(403).json({ message: "Not authorized to create staff members" });
    }
    const { username, email, password, role } = req.body;
    if (role !== "staff") {
      return res.status(400).json({ message: "Invalid role for staff member" });
    }
    const existingUser = await storage.getUserByUsername(username);
    if (existingUser) return res.status(400).json({ message: "Username already exists" });
    const existingEmail = await storage.getUserByEmail(email);
    if (existingEmail) return res.status(400).json({ message: "Email already exists" });
    const bcrypt = require("bcrypt");
    const hashedPassword = await bcrypt.hash(password, 10);
    const businessId = req.session.user.role === "business" ? req.session.user.id : req.body.businessId;
    const staffMember = await storage.createStaffMember({
      username,
      email,
      password: hashedPassword,
      role: "staff",
      businessId,
    }, businessId);
    const { password: removed, ...staffData } = staffMember;
    res.status(201).json(staffData);
  } catch (error) {
    console.error("Error creating staff member:", error);
    res.status(500).json({ message: "Failed to create staff member" });
  }
});

// DELETE /api/staff/:id
router.delete("/:id", async (req: Request, res: Response) => {
  try {
    if (!req.session?.user || (req.session.user.role !== "business" && req.session.user.role !== "admin")) {
      return res.status(403).json({ message: "Not authorized to delete staff members" });
    }
    const staffId = parseInt(req.params.id);
    const staff = await storage.getUser(staffId);
    if (!staff) return res.status(404).json({ message: "Staff member not found" });
    if (req.session.user.role === "business" && staff.businessId !== req.session.user.id) {
      return res.status(403).json({ message: "This staff member does not belong to your business" });
    }
    await storage.deleteStaffMember(staffId);
    res.status(200).json({ message: "Staff member deleted successfully" });
  } catch (error) {
    console.error("Error deleting staff member:", error);
    res.status(500).json({ message: "Failed to delete staff member" });
  }
});

/*********************************
 * Staff Availability Routes
 *********************************/

// GET /api/staff/:id/availability
router.get("/:id/availability", async (req: Request, res: Response) => {
  try {
    if (req.query.businessId) {
      const businessId = parseInt(req.query.businessId as string);
      const staffId = parseInt(req.params.id);
      if (isNaN(businessId) || isNaN(staffId)) {
        return res.status(400).json({ message: "Invalid parameters" });
      }
      const staff = await storage.getUser(staffId);
      const business = await storage.getUser(businessId);
      if (!staff || !business || business.role !== "business") {
        return res.status(404).json({ message: "Staff or business not found" });
      }
      if (staff.businessId !== businessId) {
        return res.status(403).json({ message: "Staff not associated with this business" });
      }
      const availability = await storage.getStaffAvailability(staffId);
      return res.json(availability);
    }
    if (!req.session?.user) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    const staffId = parseInt(req.params.id);
    const staff = await storage.getUser(staffId);
    if (!staff) return res.status(404).json({ message: "Staff member not found" });
    if (req.session.user.role === "business" && staff.businessId !== req.session.user.id && req.session.user.id !== staffId) {
      return res.status(403).json({ message: "Not authorized to view this staff's availability" });
    }
    const availability = await storage.getStaffAvailability(staffId);
    res.json(availability);
  } catch (error) {
    console.error("Error fetching staff availability:", error);
    res.status(500).json({ message: "Failed to fetch staff availability" });
  }
});

// POST /api/staff/:id/availability
router.post("/:id/availability", async (req: Request, res: Response) => {
  try {
    if (!req.session?.user) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    const staffId = parseInt(req.params.id);
    const staff = await storage.getUser(staffId);
    if (!staff) return res.status(404).json({ message: "Staff member not found" });
    if (req.session.user.role === "business" && staff.businessId !== req.session.user.id && req.session.user.id !== staffId) {
      return res.status(403).json({ message: "Not authorized to manage this staff's availability" });
    }
    const { dayOfWeek, startTime, endTime, isAvailable } = req.body;
    if (dayOfWeek < 0 || dayOfWeek > 6) {
      return res.status(400).json({ message: "Invalid day of week" });
    }
    const availability = await storage.createStaffAvailability({
      staffId,
      dayOfWeek,
      startTime,
      endTime,
      isAvailable: isAvailable !== undefined ? isAvailable : true,
    });
    res.status(201).json(availability);
  } catch (error) {
    console.error("Error creating staff availability:", error);
    res.status(500).json({ message: "Failed to create staff availability" });
  }
});

// DELETE /api/staff/availability/:id
router.delete("/availability/:id", async (req: Request, res: Response) => {
  try {
    if (!req.session?.user) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    const availabilityId = parseInt(req.params.id);
    const availability = await storage.getStaffAvailabilityById(availabilityId);
    if (!availability) return res.status(404).json({ message: "Availability slot not found" });
    const staff = await storage.getUser(availability.staffId);
    if (req.session.user.role === "business" && staff?.businessId !== req.session.user.id && req.session.user.id !== availability.staffId) {
      return res.status(403).json({ message: "Not authorized to manage this staff's availability" });
    }
    await storage.deleteStaffAvailability(availabilityId);
    res.status(200).json({ message: "Availability slot deleted successfully" });
  } catch (error) {
    console.error("Error deleting staff availability:", error);
    res.status(500).json({ message: "Failed to delete staff availability" });
  }
});

/*********************************
 * Staff Appointments Routes
 *********************************/

// GET /api/staff/:id/appointments
router.get("/:id/appointments", async (req: Request, res: Response) => {
  try {
    if (!req.session?.user) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    const staffId = parseInt(req.params.id);
    const staff = await storage.getUser(staffId);
    if (!staff) return res.status(404).json({ message: "Staff member not found" });
    if (req.session.user.role === "business" && staff.businessId !== req.session.user.id && req.session.user.id !== staffId) {
      return res.status(403).json({ message: "Not authorized to view this staff's appointments" });
    }
    const appointments = await storage.getStaffAppointments(staffId);
    res.json(appointments);
  } catch (error) {
    console.error("Error fetching staff appointments:", error);
    res.status(500).json({ message: "Failed to fetch staff appointments" });
  }
});

export default router;