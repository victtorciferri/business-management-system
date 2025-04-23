import { IStorage } from "./storage";
import { 
  User, InsertUser, 
  Service, InsertService, 
  Customer, InsertCustomer, 
  Appointment, InsertAppointment, 
  Payment, InsertPayment,
  Product, InsertProduct,
  ProductVariant, InsertProductVariant,
  Cart, InsertCart,
  CartItem, InsertCartItem,
  StaffAvailability, InsertStaffAvailability,
  CustomerAccessToken, InsertCustomerAccessToken,
  ThemeEntity, InsertThemeEntity,
  users, services, customers, appointments, payments, products,
  productVariants, carts, cartItems, staffAvailability, customerAccessTokens, themes
} from "@shared/schema";
import { db, pool } from "./db";
import { eq, and, gte, lte, desc } from "drizzle-orm";

export class DatabaseStorage implements IStorage {
  // User methods
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || undefined;
  }

  async getUserByBusinessSlug(slug: string): Promise<User | undefined> {
    try {
      console.log(`Looking up business with slug: ${slug}`);
      
      // Use direct parameterized query with Pool - the proven working approach
      const { Pool } = await import('@neondatabase/serverless');
      const pool = new Pool({ connectionString: process.env.DATABASE_URL });
      const result = await pool.query('SELECT * FROM users WHERE business_slug = $1', [slug]);
      
      console.log(`Direct SQL query result for slug '${slug}':`, result.rows);
      
      if (result.rows.length > 0) {
        // Convert snake_case to camelCase with proper type handling
        const row = result.rows[0];
        const user: User = {
          id: Number(row.id),
          username: String(row.username),
          password: String(row.password),
          email: String(row.email),
          businessName: String(row.business_name),
          businessSlug: String(row.business_slug),
          customDomain: row.custom_domain ? String(row.custom_domain) : null,
          phone: row.phone ? String(row.phone) : null,
          role: String(row.role),
          // Add address fields
          address: row.address ? String(row.address) : null,
          city: row.city ? String(row.city) : null,
          state: row.state ? String(row.state) : null,
          postalCode: row.postal_code ? String(row.postal_code) : null,
          country: row.country ? String(row.country) : null,
          latitude: row.latitude ? String(row.latitude) : null,
          longitude: row.longitude ? String(row.longitude) : null,
          createdAt: new Date(String(row.created_at))
        };
        return user;
      }
      
      return undefined;
    } catch (error) {
      console.error(`Error finding business by slug ${slug}:`, error);
      return undefined;
    }
  }
  
  async getUserByCustomDomain(domain: string): Promise<User | undefined> {
    try {
      console.log(`Looking up business with custom domain: ${domain}`);
      
      // Use direct parameterized query with Pool
      const { Pool } = await import('@neondatabase/serverless');
      const pool = new Pool({ connectionString: process.env.DATABASE_URL });
      const result = await pool.query('SELECT * FROM users WHERE custom_domain = $1', [domain]);
      
      console.log(`Direct SQL query result for custom domain '${domain}':`, result.rows);
      
      if (result.rows.length > 0) {
        // Convert snake_case to camelCase with proper type handling
        const row = result.rows[0];
        const user: User = {
          id: Number(row.id),
          username: String(row.username),
          password: String(row.password),
          email: String(row.email),
          businessName: String(row.business_name),
          businessSlug: String(row.business_slug),
          customDomain: row.custom_domain ? String(row.custom_domain) : null,
          phone: row.phone ? String(row.phone) : null,
          role: String(row.role),
          // Add address fields
          address: row.address ? String(row.address) : null,
          city: row.city ? String(row.city) : null,
          state: row.state ? String(row.state) : null,
          postalCode: row.postal_code ? String(row.postal_code) : null,
          country: row.country ? String(row.country) : null,
          latitude: row.latitude ? String(row.latitude) : null,
          longitude: row.longitude ? String(row.longitude) : null,
          createdAt: new Date(String(row.created_at))
        };
        return user;
      }
      
      return undefined;
    } catch (error) {
      console.error(`Error finding business by custom domain ${domain}:`, error);
      return undefined;
    }
  }

  async createUser(user: InsertUser): Promise<User> {
    const [newUser] = await db.insert(users).values(user).returning();
    return newUser;
  }
  
  async updateUser(id: number, userData: Partial<InsertUser>): Promise<User | undefined> {
    const [updatedUser] = await db
      .update(users)
      .set(userData)
      .where(eq(users.id, id))
      .returning();
    return updatedUser || undefined;
  }

  // Service methods
  async getService(id: number): Promise<Service | undefined> {
    const [service] = await db.select().from(services).where(eq(services.id, id));
    return service || undefined;
  }

  async getServicesByUserId(userId: number): Promise<Service[]> {
    try {
      // First, get the business details to obtain the businessSlug
      const [business] = await db.select().from(users).where(eq(users.id, userId));
      
      if (!business) {
        console.error(`No business found with user ID ${userId} for services lookup`);
        return [];
      }
      
      // Directly query by userId only - no longer using the business_slug for querying
      // This is the safest approach since we know the business_slug column is missing
      console.log(`Fetching services for user ID ${userId} (no business_slug filtering)`);
      const serviceList = await db.select().from(services).where(eq(services.userId, userId));
      
      // Logging for debugging
      console.log(`Found ${serviceList.length} services for user ID ${userId}`);
      
      return serviceList;
    } catch (error) {
      console.error(`Error fetching services for user ID ${userId}:`, error);
      console.error(error); // Log the actual error details
      // Return empty array instead of throwing, to prevent cascading errors
      return []; 
    }
  }

  async createService(service: InsertService): Promise<Service> {
    const [newService] = await db.insert(services).values(service).returning();
    return newService;
  }

  async updateService(id: number, serviceUpdate: Partial<InsertService>): Promise<Service | undefined> {
    const [updatedService] = await db
      .update(services)
      .set(serviceUpdate)
      .where(eq(services.id, id))
      .returning();
    return updatedService || undefined;
  }

  async deleteService(id: number): Promise<boolean> {
    const result = await db.delete(services).where(eq(services.id, id));
    return !!result;
  }

  // Customer methods
  async getCustomer(id: number): Promise<Customer | undefined> {
    const [customer] = await db.select().from(customers).where(eq(customers.id, id));
    return customer || undefined;
  }

  async getCustomersByUserId(userId: number): Promise<Customer[]> {
    return db.select().from(customers).where(eq(customers.userId, userId));
  }

  async createCustomer(customer: InsertCustomer): Promise<Customer> {
    try {
      // Try using Drizzle ORM first
      const [newCustomer] = await db.insert(customers).values(customer).returning();
      return newCustomer;
    } catch (error) {
      // If the ORM insertion fails (possibly due to missing business_slug column), 
      // fallback to raw SQL insertion
      console.error("Drizzle insertion error:", error);
      console.log("Falling back to raw SQL insertion for customer");
      
      try {
        // Check if we need to exclude businessSlug from the insertion
        let sqlQuery = "";
        let values = [];
        
        if ('businessSlug' in customer) {
          // Include businessSlug in insertion if this column exists
          sqlQuery = `
            INSERT INTO customers 
            (user_id, business_slug, first_name, last_name, email, phone, notes) 
            VALUES ($1, $2, $3, $4, $5, $6, $7) 
            RETURNING id, user_id, first_name, last_name, email, phone, notes, created_at
          `;
          values = [
            customer.userId, 
            customer.businessSlug, 
            customer.firstName, 
            customer.lastName,
            customer.email,
            customer.phone || null,
            customer.notes || null
          ];
        } else {
          // Exclude businessSlug if this column doesn't exist
          sqlQuery = `
            INSERT INTO customers 
            (user_id, first_name, last_name, email, phone, notes) 
            VALUES ($1, $2, $3, $4, $5, $6) 
            RETURNING id, user_id, first_name, last_name, email, phone, notes, created_at
          `;
          values = [
            customer.userId, 
            customer.firstName, 
            customer.lastName,
            customer.email,
            customer.phone || null,
            customer.notes || null
          ];
        }
        
        const result = await pool.query(sqlQuery, values);
        
        if (result.rows.length === 0) {
          throw new Error("Failed to create customer with raw SQL");
        }
        
        // Map SQL result to our Customer type
        return {
          id: result.rows[0].id,
          userId: result.rows[0].user_id,
          firstName: result.rows[0].first_name,
          lastName: result.rows[0].last_name,
          email: result.rows[0].email,
          phone: result.rows[0].phone || null,
          notes: result.rows[0].notes || null,
          createdAt: result.rows[0].created_at,
          businessSlug: customer.businessSlug || 'default'
        };
      } catch (sqlError) {
        console.error("Raw SQL customer insertion error:", sqlError);
        throw sqlError;
      }
    }
  }

  async updateCustomer(id: number, customerUpdate: Partial<InsertCustomer>): Promise<Customer | undefined> {
    const [updatedCustomer] = await db
      .update(customers)
      .set(customerUpdate)
      .where(eq(customers.id, id))
      .returning();
    return updatedCustomer || undefined;
  }

  async deleteCustomer(id: number): Promise<boolean> {
    const result = await db.delete(customers).where(eq(customers.id, id));
    return !!result;
  }

  // Appointment methods
  async getAppointment(id: number): Promise<Appointment | undefined> {
    const [appointment] = await db.select().from(appointments).where(eq(appointments.id, id));
    return appointment || undefined;
  }

  async getAppointmentsByUserId(userId: number): Promise<Appointment[]> {
    return db.select().from(appointments).where(eq(appointments.userId, userId));
  }

  async getAppointmentsByCustomerId(customerId: number): Promise<Appointment[]> {
    return db.select().from(appointments).where(eq(appointments.customerId, customerId));
  }

  async getAppointmentsByDateRange(userId: number, startDate: Date, endDate: Date): Promise<Appointment[]> {
    return db.select().from(appointments).where(
      and(
        eq(appointments.userId, userId),
        gte(appointments.date, startDate),
        lte(appointments.date, endDate)
      )
    );
  }

  async createAppointment(appointment: InsertAppointment): Promise<Appointment> {
    try {
      // Remove the businessSlug property if it exists since it's not in the database
      const { businessSlug, ...appointmentData } = appointment;
      
      console.log('Creating appointment with data:', appointmentData);
      const [newAppointment] = await db.insert(appointments).values(appointmentData).returning();
      return newAppointment;
    } catch (error) {
      console.error('Error creating appointment:', error);
      throw error;
    }
  }

  async updateAppointment(id: number, appointmentUpdate: Partial<InsertAppointment>): Promise<Appointment | undefined> {
    try {
      // Remove the businessSlug property if it exists since it's not in the database
      const { businessSlug, ...appointmentData } = appointmentUpdate;
      
      console.log('Updating appointment with data:', appointmentData);
      const [updatedAppointment] = await db
        .update(appointments)
        .set(appointmentData)
        .where(eq(appointments.id, id))
        .returning();
      return updatedAppointment || undefined;
    } catch (error) {
      console.error('Error updating appointment:', error);
      throw error;
    }
  }

  async deleteAppointment(id: number): Promise<boolean> {
    const result = await db.delete(appointments).where(eq(appointments.id, id));
    return !!result;
  }

  // Payment methods
  async getPayment(id: number): Promise<Payment | undefined> {
    const [payment] = await db.select().from(payments).where(eq(payments.id, id));
    return payment || undefined;
  }

  async getPaymentsByAppointmentId(appointmentId: number): Promise<Payment[]> {
    return db.select().from(payments).where(eq(payments.appointmentId, appointmentId));
  }

  async createPayment(payment: InsertPayment): Promise<Payment> {
    const [newPayment] = await db.insert(payments).values(payment).returning();
    return newPayment;
  }

  async updatePayment(id: number, paymentUpdate: Partial<InsertPayment>): Promise<Payment | undefined> {
    const [updatedPayment] = await db
      .update(payments)
      .set(paymentUpdate)
      .where(eq(payments.id, id))
      .returning();
    return updatedPayment || undefined;
  }
  
  // Product methods
  async getProduct(id: number): Promise<Product | undefined> {
    const [product] = await db.select().from(products).where(eq(products.id, id));
    return product || undefined;
  }
  
  async getProductsByUserId(userId: number): Promise<Product[]> {
    return db.select().from(products).where(eq(products.userId, userId));
  }
  
  async getProductsByCategory(userId: number, category: string): Promise<Product[]> {
    return db.select().from(products)
      .where(and(
        eq(products.userId, userId),
        eq(products.category, category)
      ));
  }
  
  async createProduct(product: InsertProduct): Promise<Product> {
    const [newProduct] = await db.insert(products).values(product).returning();
    return newProduct;
  }
  
  async updateProduct(id: number, productUpdate: Partial<InsertProduct>): Promise<Product | undefined> {
    const [updatedProduct] = await db
      .update(products)
      .set(productUpdate)
      .where(eq(products.id, id))
      .returning();
    return updatedProduct || undefined;
  }
  
  async deleteProduct(id: number): Promise<boolean> {
    const result = await db.delete(products).where(eq(products.id, id));
    return !!result;
  }
  
  // Product Variant methods
  async getProductVariant(id: number): Promise<ProductVariant | undefined> {
    const [variant] = await db.select().from(productVariants).where(eq(productVariants.id, id));
    return variant || undefined;
  }
  
  async getProductVariantsByProductId(productId: number): Promise<ProductVariant[]> {
    return db.select().from(productVariants).where(eq(productVariants.productId, productId));
  }
  
  async createProductVariant(variant: InsertProductVariant): Promise<ProductVariant> {
    const [newVariant] = await db.insert(productVariants).values(variant).returning();
    return newVariant;
  }
  
  async updateProductVariant(id: number, variantUpdate: Partial<InsertProductVariant>): Promise<ProductVariant | undefined> {
    const [updatedVariant] = await db
      .update(productVariants)
      .set(variantUpdate)
      .where(eq(productVariants.id, id))
      .returning();
    return updatedVariant || undefined;
  }
  
  async deleteProductVariant(id: number): Promise<boolean> {
    const result = await db.delete(productVariants).where(eq(productVariants.id, id));
    return !!result;
  }
  
  // Cart methods
  async getCart(id: number): Promise<Cart | undefined> {
    const [cart] = await db.select().from(carts).where(eq(carts.id, id));
    return cart || undefined;
  }
  
  async getCartByUserId(userId: number): Promise<Cart | undefined> {
    const [cart] = await db.select().from(carts)
      .where(and(
        eq(carts.userId, userId),
        eq(carts.status, "active")
      ));
    return cart || undefined;
  }
  
  async getCartByCustomerId(customerId: number): Promise<Cart | undefined> {
    const [cart] = await db.select().from(carts)
      .where(and(
        eq(carts.customerId, customerId),
        eq(carts.status, "active")
      ));
    return cart || undefined;
  }
  
  async getCartByGuestId(guestId: string): Promise<Cart | undefined> {
    const [cart] = await db.select().from(carts)
      .where(and(
        eq(carts.guestId, guestId),
        eq(carts.status, "active")
      ));
    return cart || undefined;
  }
  
  async createCart(cart: InsertCart): Promise<Cart> {
    const [newCart] = await db.insert(carts).values(cart).returning();
    return newCart;
  }
  
  async updateCart(id: number, cartUpdate: Partial<InsertCart>): Promise<Cart | undefined> {
    const [updatedCart] = await db
      .update(carts)
      .set(cartUpdate)
      .where(eq(carts.id, id))
      .returning();
    return updatedCart || undefined;
  }
  
  // Cart Item methods
  async getCartItem(id: number): Promise<CartItem | undefined> {
    const [item] = await db.select().from(cartItems).where(eq(cartItems.id, id));
    return item || undefined;
  }
  
  async getCartItemsByCartId(cartId: number): Promise<CartItem[]> {
    return db.select().from(cartItems).where(eq(cartItems.cartId, cartId));
  }
  
  async addCartItem(item: InsertCartItem): Promise<CartItem> {
    const [newItem] = await db.insert(cartItems).values(item).returning();
    return newItem;
  }
  
  async updateCartItem(id: number, itemUpdate: Partial<InsertCartItem>): Promise<CartItem | undefined> {
    const [updatedItem] = await db
      .update(cartItems)
      .set(itemUpdate)
      .where(eq(cartItems.id, id))
      .returning();
    return updatedItem || undefined;
  }
  
  async removeCartItem(id: number): Promise<boolean> {
    const result = await db.delete(cartItems).where(eq(cartItems.id, id));
    return !!result;
  }

  // Staff methods
  async getStaffByBusinessId(businessId: number): Promise<User[]> {
    try {
      const staff = await db
        .select()
        .from(users)
        .where(and(
          eq(users.role, "staff"),
          eq(users.businessId, businessId)
        ));
      
      return staff;
    } catch (error) {
      console.error("Error fetching staff by business ID:", error);
      return [];
    }
  }

  async createStaffMember(staffData: InsertUser, businessId: number): Promise<User> {
    try {
      const [newStaff] = await db
        .insert(users)
        .values({
          ...staffData,
          businessId,
          role: "staff",
        })
        .returning();
      
      return newStaff;
    } catch (error) {
      console.error("Error creating staff member:", error);
      throw error;
    }
  }

  async deleteStaffMember(staffId: number): Promise<boolean> {
    try {
      // First delete all availability entries
      await db.delete(staffAvailability).where(eq(staffAvailability.staffId, staffId));
      
      // Then delete the staff member
      const result = await db.delete(users).where(eq(users.id, staffId));
      
      return !!result;
    } catch (error) {
      console.error("Error deleting staff member:", error);
      return false;
    }
  }
  
  // Staff Availability methods
  async getStaffAvailability(staffId: number): Promise<StaffAvailability[]> {
    try {
      const availability = await db
        .select()
        .from(staffAvailability)
        .where(eq(staffAvailability.staffId, staffId));
      
      return availability;
    } catch (error) {
      console.error("Error fetching staff availability:", error);
      return [];
    }
  }

  async getStaffAvailabilityById(id: number): Promise<StaffAvailability | undefined> {
    try {
      const [availability] = await db
        .select()
        .from(staffAvailability)
        .where(eq(staffAvailability.id, id));
      
      return availability || undefined;
    } catch (error) {
      console.error("Error fetching staff availability by ID:", error);
      return undefined;
    }
  }

  async createStaffAvailability(availability: InsertStaffAvailability): Promise<StaffAvailability> {
    try {
      const [newAvailability] = await db
        .insert(staffAvailability)
        .values(availability)
        .returning();
      
      return newAvailability;
    } catch (error) {
      console.error("Error creating staff availability:", error);
      throw error;
    }
  }

  async updateStaffAvailability(id: number, availability: Partial<InsertStaffAvailability>): Promise<StaffAvailability | undefined> {
    try {
      const [updatedAvailability] = await db
        .update(staffAvailability)
        .set(availability)
        .where(eq(staffAvailability.id, id))
        .returning();
      
      return updatedAvailability || undefined;
    } catch (error) {
      console.error("Error updating staff availability:", error);
      return undefined;
    }
  }

  async deleteStaffAvailability(id: number): Promise<boolean> {
    try {
      const result = await db
        .delete(staffAvailability)
        .where(eq(staffAvailability.id, id));
      
      return !!result;
    } catch (error) {
      console.error("Error deleting staff availability:", error);
      return false;
    }
  }
  
  // Staff Appointments
  async getStaffAppointments(staffId: number): Promise<Appointment[]> {
    try {
      const staffAppointments = await db
        .select()
        .from(appointments)
        .where(eq(appointments.staffId, staffId))
        .orderBy(desc(appointments.date));
      
      return staffAppointments;
    } catch (error) {
      console.error("Error fetching staff appointments:", error);
      return [];
    }
  }

  // Customer Access Token methods
  async createCustomerAccessToken(token: InsertCustomerAccessToken): Promise<CustomerAccessToken> {
    try {
      const [newToken] = await db.insert(customerAccessTokens).values(token).returning();
      return newToken;
    } catch (error) {
      console.error("Error creating customer access token:", error);
      throw error;
    }
  }

  async getCustomerAccessToken(token: string): Promise<CustomerAccessToken | undefined> {
    try {
      const [accessToken] = await db
        .select()
        .from(customerAccessTokens)
        .where(eq(customerAccessTokens.token, token));
      
      return accessToken || undefined;
    } catch (error) {
      console.error("Error fetching customer access token:", error);
      return undefined;
    }
  }

  async getCustomerByAccessToken(token: string): Promise<Customer | undefined> {
    try {
      // First get the token and make sure it's not expired
      console.log(`Checking for customer access token: ${token.substring(0, 10)}...`);
      
      const [accessToken] = await db
        .select()
        .from(customerAccessTokens)
        .where(eq(customerAccessTokens.token, token));
      
      if (!accessToken) {
        console.log('Token not found in database');
        return undefined;
      }
      
      // Check if token is expired separately to provide better logging
      if (new Date(accessToken.expiresAt) < new Date()) {
        console.log(`Token found but expired. Expiration: ${accessToken.expiresAt}, Current: ${new Date()}`);
        return undefined;
      }
      
      // Update the last used timestamp
      await db
        .update(customerAccessTokens)
        .set({ lastUsedAt: new Date() })
        .where(eq(customerAccessTokens.token, token));
      
      // Then get the customer
      const [customer] = await db
        .select()
        .from(customers)
        .where(eq(customers.id, accessToken.customerId));
      
      if (!customer) {
        console.log(`Token valid but no customer found with ID: ${accessToken.customerId}`);
        return undefined;
      }
      
      console.log(`Successfully retrieved customer: ${customer.firstName} ${customer.lastName}`);
      return customer;
    } catch (error) {
      console.error("Error fetching customer by access token:", error);
      return undefined;
    }
  }

  async deleteCustomerAccessToken(token: string): Promise<boolean> {
    try {
      const result = await db
        .delete(customerAccessTokens)
        .where(eq(customerAccessTokens.token, token));
      
      return !!result;
    } catch (error) {
      console.error("Error deleting customer access token:", error);
      return false;
    }
  }

  async getCustomerByEmailAndBusinessId(email: string, businessId: number): Promise<Customer | undefined> {
    try {
      // Use raw SQL to avoid potential column name issues
      const { rows } = await pool.query(
        'SELECT * FROM customers WHERE email = $1 AND user_id = $2',
        [email, businessId]
      );
      
      if (rows.length === 0) {
        return undefined;
      }
      
      // Log the actual column names returned for debugging
      console.log("Customer columns available:", Object.keys(rows[0]));
      
      // Map the raw SQL result to our customer type - never reference business_slug directly
      return {
        id: rows[0].id,
        userId: rows[0].user_id,
        firstName: rows[0].first_name,
        lastName: rows[0].last_name,
        email: rows[0].email,
        phone: rows[0].phone || null,
        notes: rows[0].notes || null,
        createdAt: rows[0].created_at,
        // Generate a synthetic businessSlug from the businessId, never try to access non-existent column
        businessSlug: `business-${businessId}`
      };
    } catch (error) {
      console.error("Error fetching customer by email and business ID:", error);
      console.error(error); // Log the full error
      return undefined;
    }
  }

  // Theme methods
  async getThemeById(id: number): Promise<ThemeEntity | undefined> {
    try {
      const [theme] = await db.select().from(themes).where(eq(themes.id, id));
      return theme || undefined;
    } catch (error) {
      console.error(`Error fetching theme by ID ${id}:`, error);
      return undefined;
    }
  }

  async getThemesByBusinessId(businessId: number): Promise<ThemeEntity[]> {
    try {
      return await db.select().from(themes)
        .where(eq(themes.businessId, businessId))
        .orderBy(desc(themes.updatedAt));
    } catch (error) {
      console.error(`Error fetching themes for business ID ${businessId}:`, error);
      return [];
    }
  }

  async getThemesByBusinessSlug(businessSlug: string): Promise<ThemeEntity[]> {
    try {
      return await db.select().from(themes)
        .where(eq(themes.businessSlug, businessSlug))
        .orderBy(desc(themes.updatedAt));
    } catch (error) {
      console.error(`Error fetching themes for business slug ${businessSlug}:`, error);
      return [];
    }
  }

  async getActiveTheme(businessId: number): Promise<ThemeEntity | undefined> {
    try {
      const [theme] = await db.select().from(themes)
        .where(and(
          eq(themes.businessId, businessId),
          eq(themes.isActive, true)
        ));
      
      if (!theme) {
        // If no active theme is found, try to get the default theme
        return this.getDefaultTheme(businessId);
      }
      
      return theme;
    } catch (error) {
      console.error(`Error fetching active theme for business ID ${businessId}:`, error);
      return undefined;
    }
  }

  async getDefaultTheme(businessId: number): Promise<ThemeEntity | undefined> {
    try {
      const [theme] = await db.select().from(themes)
        .where(and(
          eq(themes.businessId, businessId),
          eq(themes.isDefault, true)
        ));
      
      return theme || undefined;
    } catch (error) {
      console.error(`Error fetching default theme for business ID ${businessId}:`, error);
      return undefined;
    }
  }

  async createTheme(theme: InsertThemeEntity): Promise<ThemeEntity> {
    try {
      // If this theme is marked as active, deactivate all other themes
      if (theme.isActive) {
        await db.update(themes)
          .set({ isActive: false })
          .where(eq(themes.businessId, theme.businessId));
      }
      
      // If this theme is marked as default, update existing default theme
      if (theme.isDefault) {
        await db.update(themes)
          .set({ isDefault: false })
          .where(and(
            eq(themes.businessId, theme.businessId),
            eq(themes.isDefault, true)
          ));
      }
      
      // Create the new theme
      const [newTheme] = await db.insert(themes).values(theme).returning();
      return newTheme;
    } catch (error) {
      console.error('Error creating theme:', error);
      throw error;
    }
  }

  async updateTheme(id: number, themeUpdate: Partial<InsertThemeEntity>): Promise<ThemeEntity | undefined> {
    try {
      // Get the current theme to get the businessId
      const [existingTheme] = await db.select().from(themes).where(eq(themes.id, id));
      
      if (!existingTheme) {
        return undefined;
      }
      
      // If this theme is being set as active, deactivate other themes
      if (themeUpdate.isActive && !existingTheme.isActive) {
        await db.update(themes)
          .set({ isActive: false })
          .where(eq(themes.businessId, existingTheme.businessId));
      }
      
      // If this theme is being set as default, update other default theme
      if (themeUpdate.isDefault && !existingTheme.isDefault) {
        await db.update(themes)
          .set({ isDefault: false })
          .where(and(
            eq(themes.businessId, existingTheme.businessId),
            eq(themes.isDefault, true)
          ));
      }
      
      // Update the theme
      const [updatedTheme] = await db.update(themes)
        .set({
          ...themeUpdate,
          updatedAt: new Date()
        })
        .where(eq(themes.id, id))
        .returning();
      
      return updatedTheme || undefined;
    } catch (error) {
      console.error(`Error updating theme ID ${id}:`, error);
      return undefined;
    }
  }

  async deleteTheme(id: number): Promise<boolean> {
    try {
      // Check if this is the default theme
      const [existingTheme] = await db.select().from(themes).where(eq(themes.id, id));
      
      if (!existingTheme) {
        return false;
      }
      
      // Cannot delete the default theme
      if (existingTheme.isDefault) {
        console.warn(`Cannot delete default theme (ID: ${id})`);
        return false;
      }
      
      const result = await db.delete(themes).where(eq(themes.id, id));
      return !!result;
    } catch (error) {
      console.error(`Error deleting theme ID ${id}:`, error);
      return false;
    }
  }

  async activateTheme(id: number): Promise<ThemeEntity | undefined> {
    try {
      // Get the theme to find the businessId
      const [theme] = await db.select().from(themes).where(eq(themes.id, id));
      
      if (!theme) {
        return undefined;
      }
      
      // Deactivate all themes for this business
      await db.update(themes)
        .set({ isActive: false })
        .where(eq(themes.businessId, theme.businessId));
      
      // Activate the requested theme
      const [activatedTheme] = await db.update(themes)
        .set({ 
          isActive: true,
          updatedAt: new Date()
        })
        .where(eq(themes.id, id))
        .returning();
      
      return activatedTheme || undefined;
    } catch (error) {
      console.error(`Error activating theme ID ${id}:`, error);
      return undefined;
    }
  }
}