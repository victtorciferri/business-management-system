import { pgTable, text, serial, integer, timestamp, boolean, numeric, primaryKey, index, foreignKey } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// User schema (for authentication)
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email").notNull().unique(),
  businessName: text("business_name"),
  businessSlug: text("business_slug").unique(),
  customDomain: text("custom_domain").unique(),
  phone: text("phone"),
  role: text("role").notNull().default("business"), // "business", "admin", "customer"
  subscription: text("subscription").default("free"), // "free", "basic", "premium", etc.
  subscriptionStatus: text("subscription_status").default("active"), // "active", "trial", "canceled", "expired"
  subscriptionExpiresAt: timestamp("subscription_expires_at"),
  maxServiceCount: integer("max_service_count").default(10),
  maxCustomerCount: integer("max_customer_count").default(100),
  maxAppointmentCount: integer("max_appointment_count").default(500),
  mercadopagoAccountId: text("mercadopago_account_id"), // MercadoPago account for the business
  mercadopagoIntegrationEnabled: boolean("mercadopago_integration_enabled").default(false),
  emailConfirmed: boolean("email_confirmed").default(false),
  businessTimeZone: text("business_time_zone").default("America/Santiago"), // Default to Chile time zone
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => {
  return {
    businessSlugIdx: index("users_business_slug_idx").on(table.businessSlug),
    customDomainIdx: index("users_custom_domain_idx").on(table.customDomain),
  };
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  email: true,
  businessName: true,
  businessSlug: true,
  customDomain: true,
  phone: true,
  role: true,
  subscription: true,
  subscriptionStatus: true,
  subscriptionExpiresAt: true,
  mercadopagoAccountId: true,
  mercadopagoIntegrationEnabled: true,
  emailConfirmed: true,
  businessTimeZone: true,
});

// Service schema
export const services = pgTable("services", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  name: text("name").notNull(),
  description: text("description"),
  duration: integer("duration").notNull(), // in minutes
  price: numeric("price").notNull(),
  color: text("color").default("#06b6d4"),
  active: boolean("active").default(true),
}, (table) => {
  return {
    userIdIdx: index("services_user_id_idx").on(table.userId),
  };
});

export const insertServiceSchema = createInsertSchema(services).pick({
  userId: true,
  name: true,
  description: true,
  duration: true,
  price: true,
  color: true,
  active: true,
});

// Customer schema
export const customers = pgTable("customers", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  email: text("email").notNull(),
  phone: text("phone"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => {
  return {
    userIdIdx: index("customers_user_id_idx").on(table.userId),
    // Compound index for business-specific customer lookups
    userEmailIdx: index("customers_user_id_email_idx").on(table.userId, table.email),
  };
});

export const insertCustomerSchema = createInsertSchema(customers).pick({
  userId: true,
  firstName: true,
  lastName: true,
  email: true,
  phone: true,
  notes: true,
});

// Appointment schema
export const appointments = pgTable("appointments", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  customerId: integer("customer_id").notNull().references(() => customers.id, { onDelete: 'cascade' }),
  serviceId: integer("service_id").notNull().references(() => services.id, { onDelete: 'cascade' }),
  date: timestamp("date").notNull(),
  duration: integer("duration").notNull(), // in minutes
  status: text("status").notNull().default("scheduled"), // scheduled, completed, cancelled
  notes: text("notes"),
  reminderSent: boolean("reminder_sent").default(false),
  paymentStatus: text("payment_status").default("pending"), // pending, paid, refunded
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => {
  return {
    userIdIdx: index("appointments_user_id_idx").on(table.userId),
    dateIdx: index("appointments_date_idx").on(table.date),
    customerIdIdx: index("appointments_customer_id_idx").on(table.customerId),
    // Compound index for business-specific date range queries
    userDateIdx: index("appointments_user_date_idx").on(table.userId, table.date),
  };
});

export const insertAppointmentSchema = createInsertSchema(appointments).pick({
  userId: true,
  customerId: true,
  serviceId: true,
  date: true,
  duration: true,
  status: true,
  notes: true,
  reminderSent: true,
  paymentStatus: true,
});

// Payment schema
export const payments = pgTable("payments", {
  id: serial("id").primaryKey(),
  appointmentId: integer("appointment_id").notNull().references(() => appointments.id, { onDelete: 'cascade' }),
  amount: numeric("amount").notNull(),
  status: text("status").notNull().default("pending"), // pending, completed, refunded
  stripePaymentId: text("stripe_payment_id"),
  merchantAccountId: text("merchant_account_id"), // Store business-specific payment processor account ID
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => {
  return {
    appointmentIdIdx: index("payments_appointment_id_idx").on(table.appointmentId),
  };
});

export const insertPaymentSchema = createInsertSchema(payments).pick({
  appointmentId: true,
  amount: true,
  status: true,
  stripePaymentId: true,
  merchantAccountId: true,
});

// Define relationships between tables for Drizzle ORM
export const usersRelations = relations(users, ({ many }) => ({
  services: many(services),
  customers: many(customers),
  appointments: many(appointments),
}));

export const servicesRelations = relations(services, ({ one, many }) => ({
  business: one(users, {
    fields: [services.userId],
    references: [users.id],
  }),
  appointments: many(appointments),
}));

export const customersRelations = relations(customers, ({ one, many }) => ({
  business: one(users, {
    fields: [customers.userId],
    references: [users.id],
  }),
  appointments: many(appointments),
}));

export const appointmentsRelations = relations(appointments, ({ one, many }) => ({
  business: one(users, {
    fields: [appointments.userId],
    references: [users.id],
  }),
  customer: one(customers, {
    fields: [appointments.customerId],
    references: [customers.id],
  }),
  service: one(services, {
    fields: [appointments.serviceId],
    references: [services.id],
  }),
  payments: many(payments),
}));

export const paymentsRelations = relations(payments, ({ one }) => ({
  appointment: one(appointments, {
    fields: [payments.appointmentId],
    references: [appointments.id],
  }),
}));

// Types for export
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Service = typeof services.$inferSelect;
export type InsertService = z.infer<typeof insertServiceSchema>;

export type Customer = typeof customers.$inferSelect;
export type InsertCustomer = z.infer<typeof insertCustomerSchema>;

export type Appointment = typeof appointments.$inferSelect;
export type InsertAppointment = z.infer<typeof insertAppointmentSchema>;

export type Payment = typeof payments.$inferSelect;
export type InsertPayment = z.infer<typeof insertPaymentSchema>;
