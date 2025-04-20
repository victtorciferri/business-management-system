import { pgTable, text, serial, integer, timestamp, boolean, numeric, primaryKey, index, foreignKey, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations, sql } from "drizzle-orm";
import { defaultTheme, Theme } from "./config";

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
  address: text("address"), // Business address for map integration
  city: text("city"), // City
  state: text("state"), // State or province
  postalCode: text("postal_code"), // ZIP or postal code
  country: text("country"), // Country
  latitude: text("latitude"), // Latitude for map coordinates
  longitude: text("longitude"), // Longitude for map coordinates
  role: text("role").notNull().default("business"), // "business", "admin", "staff", "customer"
  businessId: integer("business_id").references(() => users.id), // For staff accounts to link to the business
  subscription: text("subscription").default("free"), // "free", "basic", "premium", etc.
  subscriptionStatus: text("subscription_status").default("active"), // "active", "trial", "canceled", "expired"
  subscriptionExpiresAt: timestamp("subscription_expires_at"),
  maxServiceCount: integer("max_service_count").default(10),
  maxCustomerCount: integer("max_customer_count").default(100),
  maxAppointmentCount: integer("max_appointment_count").default(500),
  // Legacy theme settings - for backward compatibility
  themeSettings: jsonb("theme_settings").$type<{
    variant?: string;
    primaryColor?: string;
    secondaryColor?: string;
    accentColor?: string;
    textColor?: string;
    backgroundColor?: string;
    fontFamily?: string;
    borderRadius?: number;
    buttonStyle?: "rounded" | "square" | "pill";
    cardStyle?: "elevated" | "flat" | "bordered";
    appearance?: "light" | "dark" | "system";
  }>(),
  // New theme configuration - used for the new theming system
  theme: jsonb("theme").$type<Theme>().default(sql`${JSON.stringify(defaultTheme)}::jsonb`),
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
  address: true,
  city: true,
  state: true,
  postalCode: true,
  country: true,
  latitude: true,
  longitude: true,
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
  // Make businessSlug optional in the schema to match the database state
  businessSlug: text("business_slug"),
  name: text("name").notNull(),
  description: text("description"),
  duration: integer("duration").notNull(), // in minutes
  price: numeric("price").notNull(),
  color: text("color").default("#06b6d4"),
  active: boolean("active").default(true),
}, (table) => {
  return {
    userIdIdx: index("services_user_id_idx").on(table.userId),
    // Remove indexes that depend on businessSlug
  };
});

// Create a schema that doesn't require businessSlug
export const insertServiceSchema = createInsertSchema(services)
  .omit({ businessSlug: true })
  .extend({
    // Make businessSlug optional in the insert schema
    businessSlug: z.string().optional(),
  })
  .pick({
    userId: true,
    businessSlug: true,
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
  // Make businessSlug optional in the schema to match the database state
  businessSlug: text("business_slug"),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  email: text("email").notNull(),
  phone: text("phone"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => {
  return {
    userIdIdx: index("customers_user_id_idx").on(table.userId),
    // Remove indexes that depend on businessSlug
    userEmailIdx: index("customers_user_id_email_idx").on(table.userId, table.email),
  };
});

// Create a schema that doesn't require businessSlug
export const insertCustomerSchema = createInsertSchema(customers)
  .omit({ businessSlug: true })
  .extend({
    // Make businessSlug optional in the insert schema
    businessSlug: z.string().optional(),
  })
  .pick({
    userId: true,
    businessSlug: true,
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
  // Make businessSlug optional in the schema to match the database state
  businessSlug: text("business_slug"),
  customerId: integer("customer_id").notNull().references(() => customers.id, { onDelete: 'cascade' }),
  serviceId: integer("service_id").notNull().references(() => services.id, { onDelete: 'cascade' }),
  staffId: integer("staff_id").references(() => users.id), // Staff member assigned to this appointment
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
    // Keep only the index that doesn't depend on businessSlug
    userDateIdx: index("appointments_user_date_idx").on(table.userId, table.date),
  };
});

// Create a schema that doesn't require businessSlug
export const insertAppointmentSchema = createInsertSchema(appointments)
  .omit({ businessSlug: true })
  .extend({
    // Make businessSlug optional in the insert schema
    businessSlug: z.string().optional(),
    // Accept string for date (ISO format) instead of requiring a Date object
    date: z.string().or(z.date()),
  })
  .pick({
    userId: true,
    businessSlug: true,
    customerId: true,
    serviceId: true,
    staffId: true,
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
  businessSlug: text("business_slug").notNull(), // Add business slug for direct business scoping
  name: text("name").notNull(),
  description: text("description"),
  price: numeric("price").notNull(),
  stock: integer("stock").default(0),
  imageUrl: text("image_url"),
  hasVariants: boolean("has_variants").default(false),
  category: text("category").default("general"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => {
  return {
    userIdIdx: index("products_user_id_idx").on(table.userId),
    businessSlugIdx: index("products_business_slug_idx").on(table.businessSlug), // Add index for business slug
    categoryIdx: index("products_category_idx").on(table.category),
    businessCategoryIdx: index("products_business_category_idx").on(table.businessSlug, table.category), // Compound index for business category filtering
  };
});

export const insertProductSchema = createInsertSchema(products).pick({
  userId: true,
  businessSlug: true, // Add business slug to insert schema
  name: true,
  description: true,
  price: true,
  stock: true,
  imageUrl: true,
  hasVariants: true,
  category: true,
  isActive: true,
});

// Product Variants schema (for colors, sizes, etc.)
export const productVariants = pgTable("product_variants", {
  id: serial("id").primaryKey(),
  productId: integer("product_id").notNull().references(() => products.id, { onDelete: 'cascade' }),
  sku: text("sku").notNull(),
  size: text("size"), // S, M, L, XL, etc.
  color: text("color"), // Red, Blue, etc.
  additionalPrice: numeric("additional_price").default("0.00"), // Extra cost for this variant
  inventory: integer("inventory").default(0),
  imageUrl: text("image_url"), // Optional variant-specific image
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => {
  return {
    productIdIdx: index("product_variants_product_id_idx").on(table.productId),
    skuIdx: index("product_variants_sku_idx").on(table.sku),
  };
});

export const insertProductVariantSchema = createInsertSchema(productVariants).pick({
  productId: true,
  sku: true,
  size: true,
  color: true,
  additionalPrice: true,
  inventory: true,
  imageUrl: true,
  isActive: true,
});

// Shopping Cart schema
export const carts = pgTable("carts", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id), // Can be null for guest carts
  businessSlug: text("business_slug").notNull(), // Add business slug for direct business scoping
  customerId: integer("customer_id").references(() => customers.id), // Link to customer if logged in
  guestId: text("guest_id"), // Session ID for guest carts
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  status: text("status").default("active").notNull(), // active, completed, abandoned
}, (table) => {
  return {
    userIdIdx: index("carts_user_id_idx").on(table.userId),
    businessSlugIdx: index("carts_business_slug_idx").on(table.businessSlug), // Add index for business slug
    customerIdIdx: index("carts_customer_id_idx").on(table.customerId),
    guestIdIdx: index("carts_guest_id_idx").on(table.guestId),
    businessGuestIdx: index("carts_business_guest_idx").on(table.businessSlug, table.guestId), // Optimize guest lookups per business
  };
});

export const insertCartSchema = createInsertSchema(carts).pick({
  userId: true,
  businessSlug: true, // Add business slug to insert schema
  customerId: true,
  guestId: true,
  status: true,
});

// Cart Items schema
export const cartItems = pgTable("cart_items", {
  id: serial("id").primaryKey(),
  cartId: integer("cart_id").notNull().references(() => carts.id, { onDelete: 'cascade' }),
  productId: integer("product_id").notNull().references(() => products.id),
  variantId: integer("variant_id").references(() => productVariants.id),
  quantity: integer("quantity").notNull().default(1),
  price: numeric("price").notNull(), // Price at the time of adding to cart
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => {
  return {
    cartIdIdx: index("cart_items_cart_id_idx").on(table.cartId),
    productIdIdx: index("cart_items_product_id_idx").on(table.productId),
    variantIdIdx: index("cart_items_variant_id_idx").on(table.variantId),
  };
});

export const insertCartItemSchema = createInsertSchema(cartItems).pick({
  cartId: true,
  productId: true,
  variantId: true,
  quantity: true,
  price: true,
});

// Staff Availability schema
export const staffAvailability = pgTable("staff_availability", {
  id: serial("id").primaryKey(),
  staffId: integer("staff_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  businessSlug: text("business_slug").notNull(), // Add business slug for direct business scoping
  dayOfWeek: integer("day_of_week").notNull(), // 0 = Sunday, 1 = Monday, etc.
  startTime: text("start_time").notNull(), // Format: "HH:MM" in 24-hour format
  endTime: text("end_time").notNull(), // Format: "HH:MM" in 24-hour format
  isAvailable: boolean("is_available").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => {
  return {
    staffIdIdx: index("staff_availability_staff_id_idx").on(table.staffId),
    businessSlugIdx: index("staff_availability_business_slug_idx").on(table.businessSlug), // Add index for business slug
    dayOfWeekIdx: index("staff_availability_day_of_week_idx").on(table.dayOfWeek),
    // Compound index for business-specific day of week queries
    businessDayIdx: index("staff_availability_business_day_idx").on(table.businessSlug, table.dayOfWeek),
  };
});

export const insertStaffAvailabilitySchema = createInsertSchema(staffAvailability).pick({
  staffId: true,
  businessSlug: true, // Add business slug to insert schema
  dayOfWeek: true,
  startTime: true,
  endTime: true,
  isAvailable: true,
});

// Define relationships between tables for Drizzle ORM
export const usersRelations = relations(users, ({ many }) => ({
  services: many(services),
  customers: many(customers),
  appointments: many(appointments),
  products: many(products),
  availability: many(staffAvailability),
  themes: many(themes)
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
  staff: one(users, {
    fields: [appointments.staffId],
    references: [users.id],
  }),
  payments: many(payments),
}));

export const paymentsRelations = relations(payments, ({ one }) => ({
  appointment: one(appointments, {
    fields: [payments.appointmentId],
    references: [appointments.id],
  }),
}));

export const productsRelations = relations(products, ({ one, many }) => ({
  business: one(users, {
    fields: [products.userId],
    references: [users.id],
  }),
  variants: many(productVariants),
  cartItems: many(cartItems),
}));

export const productVariantsRelations = relations(productVariants, ({ one, many }) => ({
  product: one(products, {
    fields: [productVariants.productId],
    references: [products.id],
  }),
  cartItems: many(cartItems),
}));

export const cartsRelations = relations(carts, ({ one, many }) => ({
  user: one(users, {
    fields: [carts.userId],
    references: [users.id],
  }),
  customer: one(customers, {
    fields: [carts.customerId],
    references: [customers.id],
  }),
  items: many(cartItems),
}));

export const cartItemsRelations = relations(cartItems, ({ one }) => ({
  cart: one(carts, {
    fields: [cartItems.cartId],
    references: [carts.id],
  }),
  product: one(products, {
    fields: [cartItems.productId],
    references: [products.id],
  }),
  variant: one(productVariants, {
    fields: [cartItems.variantId],
    references: [productVariants.id],
  }),
}));

export const staffAvailabilityRelations = relations(staffAvailability, ({ one }) => ({
  staff: one(users, {
    fields: [staffAvailability.staffId],
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

export type ProductVariant = typeof productVariants.$inferSelect;
export type InsertProductVariant = z.infer<typeof insertProductVariantSchema>;

export type Cart = typeof carts.$inferSelect;
export type InsertCart = z.infer<typeof insertCartSchema>;

export type CartItem = typeof cartItems.$inferSelect;
export type InsertCartItem = z.infer<typeof insertCartItemSchema>;

export type StaffAvailability = typeof staffAvailability.$inferSelect;
export type InsertStaffAvailability = z.infer<typeof insertStaffAvailabilitySchema>;

// Customer access token schema
export const customerAccessTokens = pgTable("customer_access_tokens", {
  id: serial("id").primaryKey(),
  customerId: integer("customer_id").notNull().references(() => customers.id, { onDelete: 'cascade' }),
  token: text("token").notNull().unique(),
  businessId: integer("business_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  lastUsedAt: timestamp("last_used_at"),
}, (table) => {
  return {
    customerIdIdx: index("customer_tokens_customer_id_idx").on(table.customerId),
    tokenIdx: index("customer_tokens_token_idx").on(table.token),
    businessIdIdx: index("customer_tokens_business_id_idx").on(table.businessId),
  };
});

export const insertCustomerAccessTokenSchema = createInsertSchema(customerAccessTokens).pick({
  customerId: true,
  token: true,
  businessId: true,
  expiresAt: true,
});

export type CustomerAccessToken = typeof customerAccessTokens.$inferSelect;
export type InsertCustomerAccessToken = z.infer<typeof insertCustomerAccessTokenSchema>;

// Import our design token type
import { DesignTokens } from './designTokens';

// Theme schema for storing business themes - 2025 Edition
export const themes = pgTable("themes", {
  id: serial("id").primaryKey(),
  businessId: integer("business_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  businessSlug: text("business_slug").notNull(),
  name: text("name").notNull().default("Default Theme"),
  description: text("description"),
  isActive: boolean("is_active").default(true),
  isDefault: boolean("is_default").default(false),
  
  // Legacy theme properties (for backwards compatibility)
  primaryColor: text("primary_color").default("#4f46e5"),
  secondaryColor: text("secondary_color").default("#06b6d4"),
  accentColor: text("accent_color").default("#f59e0b"),
  textColor: text("text_color").default("#111827"),
  backgroundColor: text("background_color").default("#ffffff"),
  fontFamily: text("font_family").default("Inter, sans-serif"),
  borderRadius: integer("border_radius").default(8),
  spacing: integer("spacing").default(16),
  buttonStyle: text("button_style").default("default"),
  cardStyle: text("card_style").default("default"),
  appearance: text("appearance").default("system"),
  variant: text("variant").default("professional"),
  
  // New design token system - complete theme definition
  tokens: jsonb("tokens").$type<DesignTokens>(), // Complete design token system
  
  // Theme metadata
  baseThemeId: text("base_theme_id"), // ID of the theme this extends (if any)
  category: text("category").default("custom"),
  tags: jsonb("tags").$type<string[]>(),
  preview: text("preview"), // URL to preview image
  thumbnail: text("thumbnail"), // URL to thumbnail image
  popularity: integer("popularity").default(0), // For marketplace sorting
  
  // Business branding
  logoImageUrl: text("logo_image_url"),
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => {
  return {
    businessIdIdx: index("themes_business_id_idx").on(table.businessId),
    businessSlugIdx: index("themes_business_slug_idx").on(table.businessSlug),
    businessActiveIdx: index("themes_business_active_idx").on(table.businessId, table.isActive),
    categoryIdx: index("themes_category_idx").on(table.category),
  };
});

export const insertThemeSchema = createInsertSchema(themes).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  popularity: true,
});

export type ThemeEntity = typeof themes.$inferSelect;
export type InsertThemeEntity = typeof themes.$inferInsert;
export type InsertThemeSchemaType = z.infer<typeof insertThemeSchema>;

// Add relation for themes
export const themesRelations = relations(themes, ({ one }) => ({
  business: one(users, {
    fields: [themes.businessId],
    references: [users.id],
  }),
}));
