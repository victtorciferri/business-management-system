import { Router } from "express";
const router = Router();

insertAppointmentSchema,
            Powered by AppointEase - Intelligent appointment scheduling for small businesses
        Powered by AppointEase - Intelligent appointment scheduling for small businesses
        'products', 'services', 'dashboard', 'appointments', 
        'products', 'services', 'dashboard', 'appointments', 
  // This will handle URLs like /:slug/services, /:slug/appointments, etc.
      // Get the customer's appointments
      console.log(`Fetching appointments for customer ID: ${customer.id}`);
      const appointments = await storage.getAppointmentsByCustomerId(customer.id);
      console.log(`Found ${appointments.length} appointments for customer`);
      // Return the customer profile with appointments
        appointments
              Powered by AppointEase - Intelligent appointment scheduling for small businesses
          Powered by AppointEase - Intelligent appointment scheduling for small businesses
   * Used during appointment booking to identify existing customers
   * Zero-friction customer appointments endpoint
   * This endpoint allows customers to see their appointments by just providing their email
   * - Only returns limited data (future appointments only)
          appointments: [] 
          // Continue even if profile creation fails - just return empty appointments
      // If we have a customer, get their appointments
      let appointments = [];
        // Get current and future appointments
        // Set time to beginning of day to include today's appointments
        const allAppointments = await storage.getAppointmentsByCustomerId(customer.id);
        // Filter for future and today's appointments that are scheduled or pending
        appointments = allAppointments.filter(appt => {
        const serviceIds = [...new Set(appointments.map(a => a.serviceId))];
        appointments = appointments.map(appointment => {
          const service = services.find(s => s && s.id === appointment.serviceId);
          const appointmentDate = new Date(appointment.date);
            id: appointment.id,
            date: appointmentDate.toISOString(),
            formattedDate: appointmentDate.toLocaleDateString('en-US', { 
            formattedTime: appointmentDate.toLocaleTimeString('en-US', { 
            duration: appointment.duration,
            status: appointment.status,
      // Set a cookie to remember the user for 48 hours if they have appointments
      if (customer && appointments.length > 0) {
        appointments
        appointments: [] 
  // Appointment routes
  app.get("/api/appointments", async (req: Request, res: Response) => {
      let appointments;
        appointments = await storage.getAppointmentsByDateRange(userId, startDate, endDate);
          appointments = await storage.getAppointmentsByCustomerId(customerId);
          appointments = await storage.getAppointmentsByUserId(userId);
        appointments = await storage.getAppointmentsByUserId(userId);
      res.json(appointments);
      res.status(500).json({ message: "Failed to fetch appointments" });
  app.post("/api/appointments", async (req: Request, res: Response) => {
      console.log("Received appointment data:", JSON.stringify(req.body));
      // Validate appointment data
        const appointmentData = insertAppointmentSchema.parse(req.body);
        console.log("Validated appointment data:", JSON.stringify(appointmentData));
        // Create an appointment object with correct date type
        const processedAppointmentData = {
          ...appointmentData,
          date: typeof appointmentData.date === 'string' 
            ? new Date(appointmentData.date) 
            : appointmentData.date
        console.log("Processed appointment data:", JSON.stringify({
          ...processedAppointmentData,
          date: processedAppointmentData.date.toISOString()
        const service = await storage.getService(processedAppointmentData.serviceId);
          // Get existing appointments for this service on this date
          const userId = processedAppointmentData.userId;
          const appointmentDate = processedAppointmentData.date;
          const startOfDay = new Date(appointmentDate);
          const endOfDay = new Date(appointmentDate);
          const dailyAppointments = await storage.getAppointmentsByDateRange(userId, startOfDay, endOfDay);
            dailyAppointments,
            appointmentDate
        // Create appointment
        const appointment = await storage.createAppointment(processedAppointmentData);
        console.log("Created appointment:", JSON.stringify(appointment));
        res.status(201).json(appointment);
            message: "Invalid appointment data", 
      console.error("Failed to create appointment:", error);
      res.status(500).json({ message: "Failed to create appointment", error: String(error) });
  app.put("/api/appointments/:id", async (req: Request, res: Response) => {
        return res.status(400).json({ message: "Invalid appointment ID" });
      const appointmentData = insertAppointmentSchema.partial().parse(req.body);
      // Create updated appointment data with proper date conversion
      const processedAppointmentData = appointmentData.date
            ...appointmentData,
            date: typeof appointmentData.date === 'string'
              ? new Date(appointmentData.date)
              : appointmentData.date
        : appointmentData;
      const appointment = await storage.updateAppointment(id, processedAppointmentData);
      if (!appointment) {
        return res.status(404).json({ message: "Appointment not found" });
      res.json(appointment);
        return res.status(400).json({ message: "Invalid appointment data", errors: error.errors });
      res.status(500).json({ message: "Failed to update appointment" });
  app.delete("/api/appointments/:id", async (req: Request, res: Response) => {
        return res.status(400).json({ message: "Invalid appointment ID" });
      const success = await storage.deleteAppointment(id);
        return res.status(404).json({ message: "Appointment not found" });
      res.status(500).json({ message: "Failed to delete appointment" });
      const { appointmentId } = req.body;
      console.log("Sending reminder for appointment ID:", appointmentId);
      if (!appointmentId) {
        return res.status(400).json({ message: "Appointment ID is required" });
      const appointment = await storage.getAppointment(appointmentId);
      if (!appointment) {
        return res.status(404).json({ message: "Appointment not found" });
      const customer = await storage.getCustomer(appointment.customerId);
      const service = await storage.getService(appointment.serviceId);
      const appointmentDate = new Date(appointment.date);
      const formattedDate = appointmentDate.toLocaleDateString();
      const formattedTime = appointmentDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      console.log(`Subject: Appointment Reminder: ${service.name} on ${formattedDate}`);
      const mockMessageId = `mock_${Date.now()}_${appointmentId}@appointease.com`;
      // Update appointment to mark reminder as sent
      await storage.updateAppointment(appointmentId, { reminderSent: true });
          subject: `Appointment Reminder: ${service.name} on ${formattedDate}`,
          appointmentDate: formattedDate,
          appointmentTime: formattedTime
      const { appointmentId } = req.body;
      if (!appointmentId) {
        return res.status(400).json({ message: "Appointment ID is required" });
      const appointment = await storage.getAppointment(appointmentId);
      if (!appointment) {
        return res.status(404).json({ message: "Appointment not found" });
      const service = await storage.getService(appointment.serviceId);
      const business = await storage.getUser(appointment.userId);
      const customer = await storage.getCustomer(appointment.customerId);
          const mockClientSecret = `mp_test_${Date.now()}_${appointmentId}`;
            appointmentId: appointment.id,
            paymentUrl: `/payment/mock?appointmentId=${appointmentId}`,
        const preferenceResult = await createPreference(business, service, customer, appointment);
          appointmentId: appointment.id,
      const { paymentIntentId, appointmentId } = req.body;
      if (!paymentIntentId || !appointmentId) {
        return res.status(400).json({ message: "Payment Intent ID and Appointment ID are required" });
      // Update appointment payment status
      const appointment = await storage.updateAppointment(parseInt(appointmentId), {
      if (!appointment) {
        return res.status(404).json({ message: "Appointment not found" });
      const payments = await storage.getPaymentsByAppointmentId(parseInt(appointmentId));
      // Extract appointment ID from the external reference (format: app_APPOINTMENTID_TIMESTAMP)
      const appointmentId = parseInt(externalRefParts[1]);
      if (isNaN(appointmentId)) {
        return res.status(400).json({ message: "Invalid appointment ID in external reference" });
      // Find the appointment
      const appointment = await storage.getAppointment(appointmentId);
      if (!appointment) {
        return res.status(404).json({ message: "Appointment not found" });
      // Update appointment status based on payment status
        await storage.updateAppointment(appointmentId, {
        const payments = await storage.getPaymentsByAppointmentId(appointmentId);
      // Get all appointments for analysis
      const appointments = await storage.getAppointmentsByUserId(userId);
      // Count appointments by hour and day of week
      appointments.forEach(appointment => {
        const date = new Date(appointment.date);
      // Determine peak hours (top 30% of hours by appointment count)
      // Determine peak days (top 40% of days by appointment count)
        totalAppointments: appointments.length
  app.get("/api/admin/appointments", requireAdmin, async (req: Request, res: Response) => {
      // Get all appointments for the specified business
      const allAppointments = await storage.getAppointmentsByUserId(parseInt(businessId.toString()));
      res.json(allAppointments);
      console.error("Error fetching appointments:", error);
      res.status(500).json({ message: "Failed to fetch appointments" });
      // Get all appointments for the business
      const appointments = await storage.getAppointmentsByUserId(parseInt(businessId.toString()));
      if (!appointments || appointments.length === 0) {
      // Get all payments for these appointments
      const paymentsPromises = appointments.map(appointment => 
        storage.getPaymentsByAppointmentId(appointment.id)
      // Get appointment counts for each staff member
          const appointments = await storage.getStaffAppointments(staff.id);
            appointmentsCount: appointments.length,
  app.get("/api/staff/:id/appointments", async (req: Request, res: Response) => {
        return res.status(403).json({ message: "Not authorized to view this staff's appointments" });
      const appointments = await storage.getStaffAppointments(staffId);
      res.json(appointments);
      console.error("Error fetching staff appointments:", error);
      res.status(500).json({ message: "Failed to fetch staff appointments" });

export default router;
