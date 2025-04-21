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
  ThemeEntity, InsertThemeEntity
} from "@shared/schema";
import { DatabaseStorage } from "./databaseStorage";

/**
 * BusinessSlugAdapter - Adapts storage operations to handle missing business_slug column
 * 
 * This adapter wraps the DatabaseStorage class and provides compatibility methods to 
 * handle the schema mismatch between the code (which expects business_slug columns) and
 * the database (which does not have these columns).
 */
export class BusinessSlugAdapter implements IStorage {
  private storage: DatabaseStorage;
  
  constructor() {
    this.storage = new DatabaseStorage();
  }

  /**
   * Helper method to transform stored objects by adding business slug 
   */
  private addBusinessSlugToObject(obj: any, businessId: number, businessSlug?: string): any {
    // If the object is already properly formed or null/undefined, return it as is
    if (!obj || obj.businessSlug) return obj;
    
    // For objects that need business slug, add it based on userId
    if (obj.userId && !obj.businessSlug) {
      return {
        ...obj,
        businessSlug: businessSlug || `business-${businessId}` // Fallback to a generated slug
      };
    }
    
    return obj;
  }

  /**
   * Helper method to add business slug to arrays of objects
   */
  private addBusinessSlugToArray(arr: any[], businessId?: number, businessSlug?: string): any[] {
    if (!arr || !Array.isArray(arr)) return arr;
    return arr.map(item => {
      const itemBusinessId = businessId || item.userId;
      return this.addBusinessSlugToObject(item, itemBusinessId, businessSlug);
    });
  }

  /**
   * Helper method to extract the business ID from the business slug
   */
  private extractBusinessId(businessSlug?: string): number | undefined {
    if (!businessSlug) return undefined;
    
    // Try to extract a number from the end of a slug like "business-123"
    const match = businessSlug.match(/business-(\d+)$/);
    if (match && match[1]) {
      return parseInt(match[1], 10);
    }
    
    return undefined;
  }

  /**
   * Helper method to strip businessSlug from insert objects
   * This ensures we don't try to insert into non-existent columns
   */
  private stripBusinessSlug<T>(obj: T): Omit<T, 'businessSlug'> {
    if (!obj) return obj as Omit<T, 'businessSlug'>;
    
    const result = { ...obj };
    // @ts-ignore - need to delete potentially non-existent property
    delete result.businessSlug;
    return result as Omit<T, 'businessSlug'>;
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.storage.getUser(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return this.storage.getUserByUsername(username);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return this.storage.getUserByEmail(email);
  }

  async getUserByBusinessSlug(slug: string): Promise<User | undefined> {
    return this.storage.getUserByBusinessSlug(slug);
  }

  async getUserByCustomDomain(domain: string): Promise<User | undefined> {
    return this.storage.getUserByCustomDomain(domain);
  }

  async createUser(user: InsertUser): Promise<User> {
    return this.storage.createUser(user);
  }

  // Service methods
  async getService(id: number): Promise<Service | undefined> {
    const service = await this.storage.getService(id);
    if (service) {
      const serviceWithBusinessSlug = this.addBusinessSlugToObject(service, service.userId);
      return serviceWithBusinessSlug;
    }
    return undefined;
  }

  async getServicesByUserId(userId: number): Promise<Service[]> {
    const services = await this.storage.getServicesByUserId(userId);
    return this.addBusinessSlugToArray(services, userId);
  }

  async createService(service: InsertService): Promise<Service> {
    // Remove the businessSlug from the service object before insertion
    const serviceWithoutSlug = this.stripBusinessSlug(service);
    const createdService = await this.storage.createService(serviceWithoutSlug as InsertService);
    
    // Add the businessSlug property to the returned object
    return this.addBusinessSlugToObject(createdService, createdService.userId, service.businessSlug);
  }

  async updateService(id: number, serviceUpdate: Partial<InsertService>): Promise<Service | undefined> {
    // Remove the businessSlug from the update object
    const updateWithoutSlug = this.stripBusinessSlug(serviceUpdate);
    const updatedService = await this.storage.updateService(id, updateWithoutSlug as Partial<InsertService>);
    
    if (updatedService) {
      return this.addBusinessSlugToObject(updatedService, updatedService.userId, serviceUpdate.businessSlug);
    }
    return undefined;
  }

  async deleteService(id: number): Promise<boolean> {
    return this.storage.deleteService(id);
  }

  // Customer methods
  async getCustomer(id: number): Promise<Customer | undefined> {
    const customer = await this.storage.getCustomer(id);
    if (customer) {
      return this.addBusinessSlugToObject(customer, customer.userId);
    }
    return undefined;
  }

  async getCustomersByUserId(userId: number): Promise<Customer[]> {
    const customers = await this.storage.getCustomersByUserId(userId);
    return this.addBusinessSlugToArray(customers, userId);
  }

  async createCustomer(customer: InsertCustomer): Promise<Customer> {
    // Remove the businessSlug from the customer object before insertion
    const customerWithoutSlug = this.stripBusinessSlug(customer);
    const createdCustomer = await this.storage.createCustomer(customerWithoutSlug as InsertCustomer);
    
    // Add the businessSlug property to the returned object
    return this.addBusinessSlugToObject(createdCustomer, createdCustomer.userId, customer.businessSlug);
  }

  async updateCustomer(id: number, customerUpdate: Partial<InsertCustomer>): Promise<Customer | undefined> {
    // Remove the businessSlug from the update object
    const updateWithoutSlug = this.stripBusinessSlug(customerUpdate);
    const updatedCustomer = await this.storage.updateCustomer(id, updateWithoutSlug as Partial<InsertCustomer>);
    
    if (updatedCustomer) {
      return this.addBusinessSlugToObject(updatedCustomer, updatedCustomer.userId, customerUpdate.businessSlug);
    }
    return undefined;
  }

  async deleteCustomer(id: number): Promise<boolean> {
    return this.storage.deleteCustomer(id);
  }

  // Appointment methods 
  async getAppointment(id: number): Promise<Appointment | undefined> {
    const appointment = await this.storage.getAppointment(id);
    if (appointment) {
      return this.addBusinessSlugToObject(appointment, appointment.userId);
    }
    return undefined;
  }

  async getAppointmentsByUserId(userId: number): Promise<Appointment[]> {
    const appointments = await this.storage.getAppointmentsByUserId(userId);
    return this.addBusinessSlugToArray(appointments, userId);
  }

  async getAppointmentsByCustomerId(customerId: number): Promise<Appointment[]> {
    const appointments = await this.storage.getAppointmentsByCustomerId(customerId);
    return this.addBusinessSlugToArray(appointments);
  }

  async getAppointmentsByDateRange(userId: number, startDate: Date, endDate: Date): Promise<Appointment[]> {
    const appointments = await this.storage.getAppointmentsByDateRange(userId, startDate, endDate);
    return this.addBusinessSlugToArray(appointments, userId);
  }

  async createAppointment(appointment: InsertAppointment): Promise<Appointment> {
    // Remove the businessSlug from the appointment object before insertion
    const appointmentWithoutSlug = this.stripBusinessSlug(appointment);
    const createdAppointment = await this.storage.createAppointment(appointmentWithoutSlug as InsertAppointment);
    
    // Add the businessSlug property to the returned object
    return this.addBusinessSlugToObject(createdAppointment, createdAppointment.userId, appointment.businessSlug);
  }

  async updateAppointment(id: number, appointmentUpdate: Partial<InsertAppointment>): Promise<Appointment | undefined> {
    // Remove the businessSlug from the update object
    const updateWithoutSlug = this.stripBusinessSlug(appointmentUpdate);
    const updatedAppointment = await this.storage.updateAppointment(id, updateWithoutSlug as Partial<InsertAppointment>);
    
    if (updatedAppointment) {
      return this.addBusinessSlugToObject(updatedAppointment, updatedAppointment.userId, appointmentUpdate.businessSlug);
    }
    return undefined;
  }

  async deleteAppointment(id: number): Promise<boolean> {
    return this.storage.deleteAppointment(id);
  }

  // Payment methods
  async getPayment(id: number): Promise<Payment | undefined> {
    return this.storage.getPayment(id);
  }

  async getPaymentsByAppointmentId(appointmentId: number): Promise<Payment[]> {
    return this.storage.getPaymentsByAppointmentId(appointmentId);
  }

  async createPayment(payment: InsertPayment): Promise<Payment> {
    return this.storage.createPayment(payment);
  }

  async updatePayment(id: number, paymentUpdate: Partial<InsertPayment>): Promise<Payment | undefined> {
    return this.storage.updatePayment(id, paymentUpdate);
  }

  // Product methods
  async getProduct(id: number): Promise<Product | undefined> {
    const product = await this.storage.getProduct(id);
    if (product) {
      return this.addBusinessSlugToObject(product, product.userId);
    }
    return undefined;
  }

  async getProductsByUserId(userId: number): Promise<Product[]> {
    const products = await this.storage.getProductsByUserId(userId);
    return this.addBusinessSlugToArray(products, userId);
  }

  async getProductsByCategory(userId: number, category: string): Promise<Product[]> {
    const products = await this.storage.getProductsByCategory(userId, category);
    return this.addBusinessSlugToArray(products, userId);
  }

  async createProduct(product: InsertProduct): Promise<Product> {
    const productWithoutSlug = this.stripBusinessSlug(product);
    const createdProduct = await this.storage.createProduct(productWithoutSlug as InsertProduct);
    return this.addBusinessSlugToObject(createdProduct, createdProduct.userId, product.businessSlug);
  }

  async updateProduct(id: number, productUpdate: Partial<InsertProduct>): Promise<Product | undefined> {
    const updateWithoutSlug = this.stripBusinessSlug(productUpdate);
    const updatedProduct = await this.storage.updateProduct(id, updateWithoutSlug as Partial<InsertProduct>);
    
    if (updatedProduct) {
      return this.addBusinessSlugToObject(updatedProduct, updatedProduct.userId, productUpdate.businessSlug);
    }
    return undefined;
  }

  async deleteProduct(id: number): Promise<boolean> {
    return this.storage.deleteProduct(id);
  }

  // Product variant methods
  async getProductVariant(id: number): Promise<ProductVariant | undefined> {
    return this.storage.getProductVariant(id);
  }

  async getProductVariantsByProductId(productId: number): Promise<ProductVariant[]> {
    return this.storage.getProductVariantsByProductId(productId);
  }

  async createProductVariant(variant: InsertProductVariant): Promise<ProductVariant> {
    return this.storage.createProductVariant(variant);
  }

  async updateProductVariant(id: number, variantUpdate: Partial<InsertProductVariant>): Promise<ProductVariant | undefined> {
    return this.storage.updateProductVariant(id, variantUpdate);
  }

  async deleteProductVariant(id: number): Promise<boolean> {
    return this.storage.deleteProductVariant(id);
  }

  // Cart methods
  async getCart(id: number): Promise<Cart | undefined> {
    const cart = await this.storage.getCart(id);
    if (cart) {
      return this.addBusinessSlugToObject(cart, cart.userId!);
    }
    return undefined;
  }

  async getCartByUserId(userId: number): Promise<Cart | undefined> {
    const cart = await this.storage.getCartByUserId(userId);
    if (cart) {
      return this.addBusinessSlugToObject(cart, userId);
    }
    return undefined;
  }

  async getCartByCustomerId(customerId: number): Promise<Cart | undefined> {
    const cart = await this.storage.getCartByCustomerId(customerId);
    if (cart) {
      return this.addBusinessSlugToObject(cart, cart.userId!);
    }
    return undefined;
  }

  async getCartByGuestId(guestId: string): Promise<Cart | undefined> {
    const cart = await this.storage.getCartByGuestId(guestId);
    if (cart) {
      return this.addBusinessSlugToObject(cart, cart.userId!);
    }
    return undefined;
  }

  async createCart(cart: InsertCart): Promise<Cart> {
    const cartWithoutSlug = this.stripBusinessSlug(cart);
    const createdCart = await this.storage.createCart(cartWithoutSlug as InsertCart);
    return this.addBusinessSlugToObject(createdCart, createdCart.userId!, cart.businessSlug);
  }

  async updateCart(id: number, cartUpdate: Partial<InsertCart>): Promise<Cart | undefined> {
    const updateWithoutSlug = this.stripBusinessSlug(cartUpdate);
    const updatedCart = await this.storage.updateCart(id, updateWithoutSlug as Partial<InsertCart>);
    
    if (updatedCart) {
      return this.addBusinessSlugToObject(updatedCart, updatedCart.userId!, cartUpdate.businessSlug);
    }
    return undefined;
  }

  // Cart item methods
  async getCartItem(id: number): Promise<CartItem | undefined> {
    return this.storage.getCartItem(id);
  }

  async getCartItemsByCartId(cartId: number): Promise<CartItem[]> {
    return this.storage.getCartItemsByCartId(cartId);
  }

  async addCartItem(item: InsertCartItem): Promise<CartItem> {
    return this.storage.addCartItem(item);
  }

  async updateCartItem(id: number, itemUpdate: Partial<InsertCartItem>): Promise<CartItem | undefined> {
    return this.storage.updateCartItem(id, itemUpdate);
  }

  async removeCartItem(id: number): Promise<boolean> {
    return this.storage.removeCartItem(id);
  }

  // Staff methods
  async getStaffByBusinessId(businessId: number): Promise<User[]> {
    return this.storage.getStaffByBusinessId(businessId);
  }

  async createStaffMember(staffData: InsertUser, businessId: number): Promise<User> {
    return this.storage.createStaffMember(staffData, businessId);
  }

  async deleteStaffMember(staffId: number): Promise<boolean> {
    return this.storage.deleteStaffMember(staffId);
  }

  // Staff availability methods
  async getStaffAvailability(staffId: number): Promise<StaffAvailability[]> {
    const availability = await this.storage.getStaffAvailability(staffId);
    return this.addBusinessSlugToArray(availability);
  }

  async getStaffAvailabilityById(id: number): Promise<StaffAvailability | undefined> {
    const availability = await this.storage.getStaffAvailabilityById(id);
    if (availability) {
      return this.addBusinessSlugToObject(availability, availability.staffId);
    }
    return undefined;
  }

  async createStaffAvailability(availability: InsertStaffAvailability): Promise<StaffAvailability> {
    const availabilityWithoutSlug = this.stripBusinessSlug(availability);
    const createdAvailability = await this.storage.createStaffAvailability(availabilityWithoutSlug as InsertStaffAvailability);
    return this.addBusinessSlugToObject(createdAvailability, createdAvailability.staffId, availability.businessSlug);
  }

  async updateStaffAvailability(id: number, availabilityUpdate: Partial<InsertStaffAvailability>): Promise<StaffAvailability | undefined> {
    const updateWithoutSlug = this.stripBusinessSlug(availabilityUpdate);
    const updatedAvailability = await this.storage.updateStaffAvailability(id, updateWithoutSlug as Partial<InsertStaffAvailability>);
    
    if (updatedAvailability) {
      return this.addBusinessSlugToObject(updatedAvailability, updatedAvailability.staffId, availabilityUpdate.businessSlug);
    }
    return undefined;
  }

  async deleteStaffAvailability(id: number): Promise<boolean> {
    return this.storage.deleteStaffAvailability(id);
  }

  // Staff appointments
  async getStaffAppointments(staffId: number): Promise<Appointment[]> {
    const appointments = await this.storage.getStaffAppointments(staffId);
    return this.addBusinessSlugToArray(appointments);
  }

  // Customer access token methods
  async createCustomerAccessToken(token: InsertCustomerAccessToken): Promise<CustomerAccessToken> {
    return this.storage.createCustomerAccessToken(token);
  }

  async getCustomerAccessToken(token: string): Promise<CustomerAccessToken | undefined> {
    return this.storage.getCustomerAccessToken(token);
  }

  async getCustomerByAccessToken(token: string): Promise<Customer | undefined> {
    try {
      const customer = await this.storage.getCustomerByAccessToken(token);
      if (customer) {
        // Just return the customer directly without trying to add business_slug
        // This is because we're now sure that the business_slug field doesn't
        // exist in the database and we should avoid trying to add it
        return customer;
      }
      return undefined;
    } catch (error) {
      console.error("Error in adapter getCustomerByAccessToken:", error);
      return undefined;
    }
  }

  async deleteCustomerAccessToken(token: string): Promise<boolean> {
    return this.storage.deleteCustomerAccessToken(token);
  }

  async getCustomerByEmailAndBusinessId(email: string, businessId: number): Promise<Customer | undefined> {
    const customer = await this.storage.getCustomerByEmailAndBusinessId(email, businessId);
    if (customer) {
      return this.addBusinessSlugToObject(customer, businessId);
    }
    return undefined;
  }

  // Theme methods
  async getThemeById(id: number): Promise<ThemeEntity | undefined> {
    return this.storage.getThemeById(id);
  }

  async getThemesByBusinessId(businessId: number): Promise<ThemeEntity[]> {
    return this.storage.getThemesByBusinessId(businessId);
  }

  async getThemesByBusinessSlug(businessSlug: string): Promise<ThemeEntity[]> {
    // Extract businessId from slug or use direct lookup
    const businessId = this.extractBusinessId(businessSlug);
    if (businessId) {
      return this.getThemesByBusinessId(businessId);
    }
    // If we can't extract ID from slug, fall back to original method
    return this.storage.getThemesByBusinessSlug(businessSlug);
  }

  async getActiveTheme(businessId: number): Promise<ThemeEntity | undefined> {
    return this.storage.getActiveTheme(businessId);
  }

  async getDefaultTheme(businessId: number): Promise<ThemeEntity | undefined> {
    return this.storage.getDefaultTheme(businessId);
  }

  async createTheme(theme: InsertThemeEntity): Promise<ThemeEntity> {
    return this.storage.createTheme(theme);
  }

  async updateTheme(id: number, themeUpdate: Partial<InsertThemeEntity>): Promise<ThemeEntity | undefined> {
    return this.storage.updateTheme(id, themeUpdate);
  }

  async deleteTheme(id: number): Promise<boolean> {
    return this.storage.deleteTheme(id);
  }

  async activateTheme(id: number): Promise<ThemeEntity | undefined> {
    return this.storage.activateTheme(id);
  }
}