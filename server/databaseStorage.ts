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
  users, services, customers, appointments, payments, products, productVariants, carts, cartItems, staffAvailability, customerAccessTokens, themes,
  UserRole, insertCustomerAccessTokenSchema,
} from "@shared/schema";
import { Theme } from "@shared/config";
import { db } from "./db";
import { eq, and, gte, lte, desc } from "drizzle-orm";
import { z } from "zod";

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
    const [user] = await db.select().from(users).where(eq(users.businessSlug, slug));
    return user || undefined;
  }

  async getUserByCustomDomain(domain: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.customDomain, domain));
    return user || undefined;
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
  async getCustomerByEmailAndBusinessId(email: string, businessId: number): Promise<Customer | undefined> {
    const [customer] = await db.select().from(customers).where(and(eq(customers.email, email), eq(customers.userId, businessId)));
    return customer || undefined;
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
    try {
      const [updatedAppointment] = await db
        .update(appointments)
        .set(appointmentUpdate)
        .where(eq(appointments.id, id))
        .returning();
      return updatedAppointment || undefined;
    } catch (error) {
      console.error("Error updating appointment:", error);
      return undefined;
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

  // Staff methods
  async getStaffByBusinessId(businessId: number): Promise<User[]> {
    return db.select().from(users).where(
      and(
        eq(users.businessId, businessId),
        eq(users.role, UserRole.STAFF)
      )
    );
  }

  async createStaffMember(staffData: InsertUser, businessId: number): Promise<User> {
    const [newStaff] = await db.insert(users).values({
      ...staffData,
      businessId,
      role: UserRole.STAFF
    }).returning();
    return newStaff;
  }

  async deleteStaffMember(staffId: number): Promise<boolean> {
    const result = await db.delete(users).where(eq(users.id, staffId));
    return !!result;
  }

  // Customer access token methods
  async createCustomerAccessToken(token: typeof insertCustomerAccessTokenSchema._input): Promise<typeof customerAccessTokens.$inferSelect> {
    const [newCustomerAccessToken] = await db
      .insert(customerAccessTokens)
      .values(token)
      .returning();
    return newCustomerAccessToken;
  }
  async getCustomerAccessToken(token: string): Promise<typeof customerAccessTokens.$inferSelect | undefined> {
    const [customerAccessToken] = await db
      .select()
      .from(customerAccessTokens)
      .where(eq(customerAccessTokens.token, token));
    return customerAccessToken || undefined;
  }  async deleteCustomerAccessToken(token: string): Promise<boolean> {
    const result = await db
      .delete(customerAccessTokens)
      .where(eq(customerAccessTokens.token, token));
    return !!result;
  }

  // Theme methods
  async getAllThemes(): Promise<Theme[]> {
    try {
      const result = await db.select().from(themes).orderBy(desc(themes.createdAt));
      
      return result.map(theme => ({
        name: theme.name,
        primaryColor: theme.primaryColor || '#4f46e5',
        secondaryColor: theme.secondaryColor || '#06b6d4',
        accentColor: theme.accentColor || '#f59e0b',
        textColor: theme.textColor || '#111827',
        backgroundColor: theme.backgroundColor || '#ffffff',
        fontFamily: theme.fontFamily || 'Inter, system-ui, sans-serif',
        borderRadius: theme.borderRadius || 8,
        spacing: theme.spacing || 16,
        buttonStyle: (theme.buttonStyle as 'default' | 'rounded' | 'square' | 'pill') || 'default',
        cardStyle: (theme.cardStyle as 'default' | 'elevated' | 'flat' | 'bordered') || 'default',
        variant: (theme.variant as 'professional' | 'tint' | 'vibrant' | 'custom') || 'professional',
        appearance: (theme.appearance as 'light' | 'dark' | 'system') || 'light',
        colorPalette: []
      }));
    } catch (error) {
      console.error('Error getting all themes:', error);
      return [];
    }
  }

  async getThemeById(id: number): Promise<ThemeEntity | undefined> {
    const [theme] = await db.select().from(themes).where(eq(themes.id, id));
    return theme || undefined;
  }

  async getThemesByBusinessId(businessId: number): Promise<ThemeEntity[]> {
    return db.select().from(themes).where(eq(themes.businessId, businessId));
  }

  async getThemesByBusinessSlug(businessSlug: string): Promise<ThemeEntity[]> {
    return db.select().from(themes).where(eq(themes.businessSlug, businessSlug));
  }

  async getActiveTheme(businessId: number): Promise<ThemeEntity | undefined> {
    const [theme] = await db.select().from(themes).where(
      and(eq(themes.businessId, businessId), eq(themes.isActive, true))
    );
    return theme || undefined;
  }

  async getDefaultTheme(businessId: number): Promise<ThemeEntity | undefined> {
    const [theme] = await db.select().from(themes).where(
      and(eq(themes.businessId, businessId), eq(themes.isDefault, true))
    );
    return theme || undefined;
  }

  async createTheme(theme: InsertThemeEntity): Promise<ThemeEntity> {
    const [newTheme] = await db.insert(themes).values(theme).returning();
    return newTheme;
  }

  async updateTheme(id: number, themeUpdate: Partial<InsertThemeEntity>): Promise<ThemeEntity | undefined> {
    const [updatedTheme] = await db
      .update(themes)
      .set(themeUpdate)
      .where(eq(themes.id, id))
      .returning();
    return updatedTheme || undefined;
  }

  async deleteTheme(id: number): Promise<boolean> {
    const result = await db.delete(themes).where(eq(themes.id, id));
    return !!result;
  }

  async activateTheme(id: number): Promise<ThemeEntity | undefined> {
    const [updatedTheme] = await db
      .update(themes)
      .set({ isActive: true })
      .where(eq(themes.id, id))
      .returning();
    return updatedTheme || undefined;
  }

  // Product methods (placeholder implementations)
  async getProduct(id: number): Promise<Product | undefined> {
    // TODO: Implement when products table is available
    return undefined;
  }

  async getProductsByUserId(userId: number): Promise<Product[]> {
    // TODO: Implement when products table is available  
    return [];
  }

  async getProductsByCategory(userId: number, category: string): Promise<Product[]> {
    // TODO: Implement when products table is available
    return [];
  }

  async createProduct(product: InsertProduct): Promise<Product> {
    // TODO: Implement when products table is available
    throw new Error("Products not implemented yet");
  }

  async updateProduct(id: number, product: Partial<InsertProduct>): Promise<Product | undefined> {
    // TODO: Implement when products table is available
    return undefined;
  }

  async deleteProduct(id: number): Promise<boolean> {
    // TODO: Implement when products table is available
    return false;
  }

  // Product Variant methods (placeholder implementations)
  async getProductVariant(id: number): Promise<ProductVariant | undefined> {
    return undefined;
  }

  async getProductVariantsByProductId(productId: number): Promise<ProductVariant[]> {
    return [];
  }

  async createProductVariant(variant: InsertProductVariant): Promise<ProductVariant> {
    throw new Error("Product variants not implemented yet");
  }

  async updateProductVariant(id: number, variant: Partial<InsertProductVariant>): Promise<ProductVariant | undefined> {
    return undefined;
  }

  async deleteProductVariant(id: number): Promise<boolean> {
    return false;
  }

  // Cart methods (placeholder implementations)
  async getCart(id: number): Promise<Cart | undefined> {
    return undefined;
  }

  async getCartByUserId(userId: number): Promise<Cart | undefined> {
    return undefined;
  }

  async getCartByCustomerId(customerId: number): Promise<Cart | undefined> {
    return undefined;
  }

  async getCartByGuestId(guestId: string): Promise<Cart | undefined> {
    return undefined;
  }

  async createCart(cart: InsertCart): Promise<Cart> {
    throw new Error("Carts not implemented yet");
  }

  async updateCart(id: number, cart: Partial<InsertCart>): Promise<Cart | undefined> {
    return undefined;
  }

  // Cart Item methods (placeholder implementations)
  async getCartItem(id: number): Promise<CartItem | undefined> {
    return undefined;
  }

  async getCartItemsByCartId(cartId: number): Promise<CartItem[]> {
    return [];
  }

  async addCartItem(item: InsertCartItem): Promise<CartItem> {
    throw new Error("Cart items not implemented yet");
  }

  async updateCartItem(id: number, item: Partial<InsertCartItem>): Promise<CartItem | undefined> {
    return undefined;
  }

  async removeCartItem(id: number): Promise<boolean> {
    return false;
  }

  // Staff Availability methods (placeholder implementations)
  async getStaffAvailability(staffId: number): Promise<StaffAvailability[]> {
    return [];
  }

  async getStaffAvailabilityById(id: number): Promise<StaffAvailability | undefined> {
    return undefined;
  }

  async createStaffAvailability(availability: InsertStaffAvailability): Promise<StaffAvailability> {
    throw new Error("Staff availability not implemented yet");
  }

  async updateStaffAvailability(id: number, availability: Partial<InsertStaffAvailability>): Promise<StaffAvailability | undefined> {
    return undefined;
  }

  async deleteStaffAvailability(id: number): Promise<boolean> {
    return false;
  }

  // Staff Appointments
  async getStaffAppointments(staffId: number): Promise<Appointment[]> {
    return db.select().from(appointments).where(eq(appointments.staffId, staffId));
  }  async getCustomerByAccessToken(token: string): Promise<Customer | undefined> {
    const result = await db
      .select()
      .from(customers)
      .innerJoin(customerAccessTokens, eq(customerAccessTokens.customerId, customers.id))
      .where(
        and(
          eq(customerAccessTokens.token, token),
          gte(customerAccessTokens.expiresAt, new Date())
        )
      )
      .limit(1);

    return result[0]?.customers || undefined;
  }

  async updateUser(id: number, userData: Partial<InsertUser>): Promise<User | undefined> {
    const [updatedUser] = await db
      .update(users)
      .set(userData)
      .where(eq(users.id, id))
      .returning();
    return updatedUser || undefined;
  }
}
