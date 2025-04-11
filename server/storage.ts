import {
  User, InsertUser,
  Service, InsertService,
  Customer, InsertCustomer,
  Appointment, InsertAppointment,
  Payment, InsertPayment,
} from "@shared/schema";
import { DatabaseStorage } from "./databaseStorage";

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getUserByBusinessSlug(slug: string): Promise<User | undefined>;
  getUserByCustomDomain(domain: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Service methods
  getService(id: number): Promise<Service | undefined>;
  getServicesByUserId(userId: number): Promise<Service[]>;
  createService(service: InsertService): Promise<Service>;
  updateService(id: number, service: Partial<InsertService>): Promise<Service | undefined>;
  deleteService(id: number): Promise<boolean>;
  
  // Customer methods
  getCustomer(id: number): Promise<Customer | undefined>;
  getCustomersByUserId(userId: number): Promise<Customer[]>;
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
}

// Create a database storage instance
export const storage = new DatabaseStorage();