import {
  User, InsertUser,
  Service,
  InsertService,
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
import { db } from "./db";
import { users } from "./db/schema";
import { BusinessSlugAdapter } from "./businessSlugAdapter";

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getUserByBusinessSlug(slug: string): Promise<User | undefined>;
  getUserByCustomDomain(domain: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, userData: Partial<InsertUser>): Promise<User | undefined>;

  // Theme methods
  getThemeById(id: number): Promise<ThemeEntity | undefined>;
  getThemesByBusinessId(businessId: number): Promise<ThemeEntity[]>;
  getThemesByBusinessSlug(businessSlug: string): Promise<ThemeEntity[]>;
  getActiveTheme(businessId: number): Promise<ThemeEntity | undefined>;
  getDefaultTheme(businessId: number): Promise<ThemeEntity | undefined>;
  createTheme(theme: InsertThemeEntity): Promise<ThemeEntity>;
  updateTheme(id: number, theme: Partial<InsertThemeEntity>): Promise<ThemeEntity | undefined>;
  deleteTheme(id: number): Promise<boolean>;
  activateTheme(id: number): Promise<ThemeEntity | undefined>;

  // Service methods
  getService(id: number): Promise<Service | undefined>;
  getServicesByUserId(userId: number): Promise<Service[]>;
  createService(service: InsertService): Promise<Service>;
  updateService(id: number, service: Partial<InsertService>): Promise<Service | undefined>;
  deleteService(id: number): Promise<boolean>;
  
// Customer methods
  getCustomer(id: number): Promise<Customer | undefined>;
  getCustomersByUserId(userId: number): Promise<Customer[]>;
  getCustomerByEmailAndBusinessId(email: string, businessId: number): Promise<Customer | undefined>;
  createCustomer(customer: InsertCustomer): Promise<Customer>;
  updateCustomer(id: number, customer: Partial<InsertCustomer>): Promise<Customer | undefined>;
  deleteCustomer(id: number): Promise<boolean>;
  
  // Appointment methods
  getAppointment(id: number): Promise<Appointment | undefined>;
  getAppointmentsByUserId(userId: number): Promise<Appointment[]>;
  getAppointmentsByCustomerId(customerId: number): Promise<Appointment[]>;
  getAppointmentsByDateRange(userId: number, startDate: Date, endDate: Date): Promise<Appointment[]>;
  createAppointment(appointment: InsertAppointment): Promise<Appointment>;
  updateAppointment(id: number, appointment: Partial<InsertAppointment>): Promise<Appointment | undefined>;
  deleteAppointment(id: number): Promise<boolean>;
  
  // Payment methods
  getPayment(id: number): Promise<Payment | undefined>;
  getPaymentsByAppointmentId(appointmentId: number): Promise<Payment[]>;
  createPayment(payment: InsertPayment): Promise<Payment>;
  updatePayment(id: number, payment: Partial<InsertPayment>): Promise<Payment | undefined>;
  
  // Product methods
  getProduct(id: number): Promise<Product | undefined>;
  getProductsByUserId(userId: number): Promise<Product[]>;
  getProductsByCategory(userId: number, category: string): Promise<Product[]>;
  createProduct(product: InsertProduct): Promise<Product>;
  updateProduct(id: number, product: Partial<InsertProduct>): Promise<Product | undefined>;
  deleteProduct(id: number): Promise<boolean>;
  
  // Product Variant methods
  getProductVariant(id: number): Promise<ProductVariant | undefined>;
  getProductVariantsByProductId(productId: number): Promise<ProductVariant[]>;
  createProductVariant(variant: InsertProductVariant): Promise<ProductVariant>;
  updateProductVariant(id: number, variant: Partial<InsertProductVariant>): Promise<ProductVariant | undefined>;
  deleteProductVariant(id: number): Promise<boolean>;
  
  // Cart methods
  getCart(id: number): Promise<Cart | undefined>;
  getCartByUserId(userId: number): Promise<Cart | undefined>;
  getCartByCustomerId(customerId: number): Promise<Cart | undefined>;
  getCartByGuestId(guestId: string): Promise<Cart | undefined>;
  createCart(cart: InsertCart): Promise<Cart>;
  updateCart(id: number, cart: Partial<InsertCart>): Promise<Cart | undefined>;
  
  // Cart Item methods
  getCartItem(id: number): Promise<CartItem | undefined>;
  getCartItemsByCartId(cartId: number): Promise<CartItem[]>;
  addCartItem(item: InsertCartItem): Promise<CartItem>;
  updateCartItem(id: number, item: Partial<InsertCartItem>): Promise<CartItem | undefined>;
  removeCartItem(id: number): Promise<boolean>;
  
  // Staff methods
  getStaffByBusinessId(businessId: number): Promise<User[]>;
  createStaffMember(staffData: InsertUser, businessId: number): Promise<User>;
  deleteStaffMember(staffId: number): Promise<boolean>;
  
  // Staff Availability methods
  getStaffAvailability(staffId: number): Promise<StaffAvailability[]>;
  getStaffAvailabilityById(id: number): Promise<StaffAvailability | undefined>;
  createStaffAvailability(availability: InsertStaffAvailability): Promise<StaffAvailability>;
  updateStaffAvailability(id: number, availability: Partial<InsertStaffAvailability>): Promise<StaffAvailability | undefined>;
  deleteStaffAvailability(id: number): Promise<boolean>;
  
  // Staff Appointments
  getStaffAppointments(staffId: number): Promise<Appointment[]>;
  
  // Customer Access Token methods
  createCustomerAccessToken(token: InsertCustomerAccessToken): Promise<CustomerAccessToken>;
  getCustomerAccessToken(token: string): Promise<CustomerAccessToken | undefined>;
  getCustomerByAccessToken(token: string): Promise<Customer | undefined>;
  deleteCustomerAccessToken(token: string): Promise<boolean>;
}

class BusinessSlugAdapterImpl extends BusinessSlugAdapter implements IStorage {
  async getStaffByBusinessId(businessId: number): Promise<User[]> {
    const staffs = await db.query.users.findMany({
      where: (users, { eq }) => eq(users.businessId, businessId),
    });
    return staffs;
  }
}

// Use our adapter to handle the business_slug mismatch
export const storage: IStorage = new BusinessSlugAdapterImpl();
