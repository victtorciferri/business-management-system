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
  // Payment processing and marketplace configuration
  platformFeePercentage: numeric("platform_fee_percentage").default("2.00"), // Default platform fee percentage (can be adjusted per business)
  // MercadoPago integration fields for marketplace payment split
  mercadopagoAccountId: text("mercadopago_account_id"), // MercadoPago account for the business
  mercadopagoIntegrationEnabled: boolean("mercadopago_integration_enabled").default(false),
  mercadopagoSellerId: text("mercadopago_seller_id"), // Seller ID for marketplace integration
  mercadopagoApplicationId: text("mercadopago_application_id"), // Application ID for OAuth
  mercadopagoClientId: text("mercadopago_client_id"), // OAuth client ID
  mercadopagoClientSecret: text("mercadopago_client_secret"), // OAuth client secret
  mercadopagoRefreshToken: text("mercadopago_refresh_token"), // OAuth refresh token
  mercadopagoAccessToken: text("mercadopago_access_token"), // OAuth access token
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
  platformFeePercentage: true,
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
  paymentProcessor: text("payment_processor").default("mercadopago"), // mercadopago, manual, etc.
  processorPaymentId: text("processor_payment_id"), // ID from Mercadopago or other processor
  merchantAccountId: text("merchant_account_id"), // Business-specific payment processor account ID
  
  // Marketplace payment split fields
  platformFeePercentage: numeric("platform_fee_percentage").default("2.00"), // AppointEase's percentage (default: 2%)
  platformFeeAmount: numeric("platform_fee_amount"), // Calculated amount for AppointEase
  businessAmount: numeric("business_amount"), // Amount going to the business after platform fee
  
  // Payment processing fields
  metadata: text("metadata"), // JSON string with additional payment details
  paymentUrl: text("payment_url"), // URL for payment checkout (Mercadopago generated URL)
  paymentMethod: text("payment_method"), // credit_card, debit_card, bank_transfer, etc.
  preferenceId: text("preference_id"), // Mercadopago preference ID for the payment
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => {
  return {
    appointmentIdIdx: index("payments_appointment_id_idx").on(table.appointmentId),
    statusIdx: index("payments_status_idx").on(table.status),
  };
});

export const insertPaymentSchema = createInsertSchema(payments).pick({
  appointmentId: true,
  amount: true,
  status: true,
  paymentProcessor: true,
  processorPaymentId: true,
  merchantAccountId: true,
  
  // Marketplace payment split fields
  platformFeePercentage: true,
  platformFeeAmount: true,
  businessAmount: true,
  
  // Payment processing fields
  metadata: true,
  paymentUrl: true,
  paymentMethod: true,
  preferenceId: true,
});

// Products schema
export const products = pgTable("products", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  name: text("name").notNull(),
  description: text("description"),
  price: numeric("price").notNull(),
  imageUrl: text("image_url"),
  inventory: integer("inventory").default(0),
  category: text("category").default("general"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => {
  return {
    userIdIdx: index("products_user_id_idx").on(table.userId),
    categoryIdx: index("products_category_idx").on(table.category),
  };
});

export const insertProductSchema = createInsertSchema(products).pick({
  userId: true,
  name: true,
  description: true,
  price: true,
  imageUrl: true,
  inventory: true,
  category: true,
  isActive: true,
});

// Define relationships between tables for Drizzle ORM
export const usersRelations = relations(users, ({ many }) => ({
  services: many(services),
  customers: many(customers),
  appointments: many(appointments),
  products: many(products),
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

export const productsRelations = relations(products, ({ one }) => ({
  business: one(users, {
    fields: [products.userId],
    references: [users.id],
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

export type Product = typeof products.$inferSelect;
export type InsertProduct = z.infer<typeof insertProductSchema>;
