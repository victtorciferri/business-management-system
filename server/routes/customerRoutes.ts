import { Router } from "express";
const router = Router();

insertCustomerSchema, 
    // Send email to the customer
      to: customer.email,
      subject: `Access Your ${business.businessName} Customer Portal`,
          <h2>Access Your Customer Portal</h2>
          <p>Hello ${customer.firstName},</p>
          <p>You can now access your customer portal for ${business.businessName} by clicking the button below.</p>
              Access Customer Portal
        Hello ${customer.firstName},
        You can now access your customer portal for ${business.businessName} by clicking the link below:
    console.log(`Email sent successfully to ${customer.email}`);
        'customers', 'admin', 'auth', 'checkout'
   * Used by the customer portal when accessed via businessId parameter
        'customers', 'admin', 'auth', 'checkout'
  // Customer routes
  app.get("/api/customers", async (req: Request, res: Response) => {
      const customers = await storage.getCustomersByUserId(userId);
      res.json(customers);
      res.status(500).json({ message: "Failed to fetch customers" });
  app.post("/api/customers", async (req: Request, res: Response) => {
      let customerData;
        customerData = insertCustomerSchema.parse(req.body);
          customerData = insertCustomerSchema.parse({
            console.log('Using flexible schema for customer creation');
              // Insert customer using raw SQL to bypass schema validation issues
                `INSERT INTO customers 
                const customer = {
                return res.status(201).json(customer);
              console.error('Raw SQL customer insertion error:', sqlError);
      const customer = await storage.createCustomer(customerData);
      res.status(201).json(customer);
      console.error('Customer creation error:', error);
          message: "Invalid customer data", 
      res.status(500).json({ message: "Failed to create customer" });
  app.put("/api/customers/:id", async (req: Request, res: Response) => {
        return res.status(400).json({ message: "Invalid customer ID" });
      const customerData = insertCustomerSchema.partial().parse(req.body);
      const customer = await storage.updateCustomer(id, customerData);
      if (!customer) {
        return res.status(404).json({ message: "Customer not found" });
      res.json(customer);
        return res.status(400).json({ message: "Invalid customer data", errors: error.errors });
      res.status(500).json({ message: "Failed to update customer" });
  app.delete("/api/customers/:id", async (req: Request, res: Response) => {
        return res.status(400).json({ message: "Invalid customer ID" });
      const success = await storage.deleteCustomer(id);
        return res.status(404).json({ message: "Customer not found" });
      res.status(500).json({ message: "Failed to delete customer" });
      // Find the customer with the provided email and business ID
      const customer = await storage.getCustomerByEmailAndBusinessId(email, businessId);
      if (!customer) {
        console.log(`Customer not found with email: ${email} for business ID: ${businessId}`);
        return res.status(404).json({ message: "Customer not found with the provided email for this business" });
      console.log(`Found customer: ${customer.firstName} ${customer.lastName} (ID: ${customer.id})`);
          [customer.id, businessId]
          customerId: customer.id,
  app.get("/api/customer-profile", async (req: Request, res: Response) => {
      if (!customer) {
      console.log(`Found customer: ${customer.firstName} ${customer.lastName} (ID: ${customer.id})`);
        customer,
      console.error("Error fetching customer profile:", error);
        message: "Failed to fetch customer profile", 
  // Send an access link to customer via email
  app.post("/api/send-customer-access-link", async (req: Request, res: Response) => {
      // Find the customer with the provided email and business ID
      const customer = await storage.getCustomerByEmailAndBusinessId(email, businessId);
      if (!customer) {
        return res.status(404).json({ message: "Customer not found with the provided email for this business" });
        customerId: customer.id,
      // Send email to the customer
        to: customer.email,
        subject: `Access Your ${business.businessName} Customer Portal`,
            <h2>Access Your Customer Portal</h2>
            <p>Hello ${customer.firstName},</p>
            <p>You can now access your customer portal for ${business.businessName} by clicking the button below.</p>
                Access Customer Portal
          Hello ${customer.firstName},
          You can now access your customer portal for ${business.businessName} by clicking the link below:
        email: customer.email
      console.error("Error sending customer access link:", error);
      res.status(500).json({ message: "Failed to send customer access link" });
   * Check if a customer exists by email for a business
  app.post("/api/check-customer-exists", async (req: Request, res: Response) => {
      // Find the customer with the provided email and business ID
      const customer = await storage.getCustomerByEmailAndBusinessId(email, businessId);
      if (customer) {
        // Return customer data without sensitive information
          customer: {
            id: customer.id,
            firstName: customer.firstName,
            lastName: customer.lastName,
            email: customer.email,
            phone: customer.phone
        // Return exists: false if no customer found
      console.error("Error checking if customer exists:", error);
      res.status(500).json({ message: "Failed to check if customer exists" });
   * - Creates a customer profile silently if not found
      // Find the customer with the provided email and business ID
      let customer = await storage.getCustomerByEmailAndBusinessId(email, businessId);
      // If customer doesn't exist, create a new customer profile silently
      if (!customer) {
          // Create the customer with minimal information
          customer = await storage.createCustomer({
          console.error("Error creating customer profile:", error);
      if (customer) {
      // Get customer initials for display
      if (customer) {
        if (customer.firstName) {
          initials += customer.firstName.charAt(0).toUpperCase();
        if (customer.lastName) {
          initials += customer.lastName.charAt(0).toUpperCase();
        customerExists: !!customer,
        customerInitials: initials || null,
        customerFirstName: customer && customer.firstName ? customer.firstName : null,
      } else if (req.query.customerId) {
        // For customer portal, allow fetching by customer ID
        const customerId = parseInt(req.query.customerId as string);
        if (!isNaN(customerId)) {
      if (!customer || !service) {
        return res.status(404).json({ message: "Customer or service not found" });
      console.log(`To: ${customer.email}`);
      console.log(`Content: Reminder for ${customer.firstName} ${customer.lastName} about ${service.name} on ${formattedDate} at ${formattedTime}`);
          recipient: customer.email,
      // Get the customer information
      if (!customer) {
        return res.status(404).json({ message: "Customer not found" });
      } else if (req.query.customerId) {
        // If accessing as a customer, get cart by customer ID
        cart = await storage.getCartByCustomerId(parseInt(req.query.customerId as string));
      let customerId = null;
      } else if (req.body.customerId) {
        customerId = parseInt(req.body.customerId);
      } else if (customerId) {
        cart = await storage.getCartByCustomerId(customerId);
        customerId,
  app.get("/api/admin/customers", requireAdmin, async (req: Request, res: Response) => {
      // Get all customers for the specified business
      const allCustomers = await storage.getCustomersByUserId(parseInt(businessId.toString()));
      res.json(allCustomers);
      console.error("Error fetching customers:", error);
      res.status(500).json({ message: "Failed to fetch customers" });
      // For customer portal case - access via businessId query parameter (doesn't require authentication)
      // For customer portal - allow public access with businessId validation

export default router;
