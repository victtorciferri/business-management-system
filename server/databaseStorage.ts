import { IStorage } from "./storage";
import {
  User, InsertUser,
  Service, InsertService,
  Customer, InsertCustomer,
  Appointment, InsertAppointment,
  Payment, InsertPayment,
  users, services, customers, appointments, payments,
} from "@shared/schema";
import { db } from "./db";
import { eq, and, gte, lte } from "drizzle-orm";

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
}