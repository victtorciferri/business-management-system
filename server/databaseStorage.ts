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
  users, services, customers, appointments, payments, products,
  productVariants, carts, cartItems, staffAvailability
} from "@shared/schema";
import { db } from "./db";
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

  // Service methods
  async getService(id: number): Promise<Service | undefined> {
    const [service] = await db.select().from(services).where(eq(services.id, id));
    return service || undefined;
  }

  async getServicesByUserId(userId: number): Promise<Service[]> {
    return db.select().from(services).where(eq(services.userId, userId));
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
    const [newCustomer] = await db.insert(customers).values(customer).returning();
    return newCustomer;
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
    const [newAppointment] = await db.insert(appointments).values(appointment).returning();
    return newAppointment;
  }

  async updateAppointment(id: number, appointmentUpdate: Partial<InsertAppointment>): Promise<Appointment | undefined> {
    const [updatedAppointment] = await db
      .update(appointments)
      .set(appointmentUpdate)
      .where(eq(appointments.id, id))
      .returning();
    return updatedAppointment || undefined;
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
}