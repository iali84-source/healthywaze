import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, decimal, boolean, timestamp, serial } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const products = pgTable("products", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  description: text("description").notNull(),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  imageUrl: text("image_url"),
  stock: integer("stock").notNull().default(0),
  isPublished: boolean("is_published").notNull().default(true),
  category: text("category"),
  catalogNumber: text("catalog_number"),
  upc: text("upc"),
  views: integer("views").notNull().default(0),
  sales: integer("sales").notNull().default(0),
  adSpend: decimal("ad_spend", { precision: 10, scale: 2 }).notNull().default("0"),
  productCost: decimal("product_cost", { precision: 10, scale: 2 }).notNull().default("0"),
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
});

export const orders = pgTable("orders", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: integer("user_id").references(() => users.id),
  customerEmail: text("customer_email").notNull(),
  customerName: text("customer_name").notNull(),
  customerPhone: text("customer_phone"),
  
  // Legacy shipping address field (for backward compatibility)
  shippingAddress: text("shipping_address"),
  
  // Structured shipping address
  shippingAddressLine1: text("shipping_address_line1"),
  shippingAddressLine2: text("shipping_address_line2"),
  shippingCity: text("shipping_city"),
  shippingState: text("shipping_state"),
  shippingZip: text("shipping_zip"),
  shippingCountry: text("shipping_country").default("United States"),
  
  // Structured billing address
  billingAddressLine1: text("billing_address_line1"),
  billingAddressLine2: text("billing_address_line2"),
  billingCity: text("billing_city"),
  billingState: text("billing_state"),
  billingZip: text("billing_zip"),
  billingCountry: text("billing_country").default("United States"),
  
  // Flag to indicate if billing address same as shipping
  billingSameAsShipping: boolean("billing_same_as_shipping").default(true),
  
  total: decimal("total", { precision: 10, scale: 2 }).notNull(),
  status: text("status").notNull().default("pending"),
  stripePaymentIntentId: text("stripe_payment_intent_id"),
  trackingNumber: text("tracking_number"),
  shippingProvider: text("shipping_provider"),
  estimatedDelivery: text("estimated_delivery"),
  shippingNotes: text("shipping_notes"),
  notificationsSent: boolean("notifications_sent").notNull().default(false),
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
});

export const orderItems = pgTable("order_items", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  orderId: varchar("order_id").notNull().references(() => orders.id),
  productId: varchar("product_id").notNull().references(() => products.id),
  productName: text("product_name").notNull(),
  productPrice: decimal("product_price", { precision: 10, scale: 2 }).notNull(),
  quantity: integer("quantity").notNull(),
});

export const siteSettings = pgTable("site_settings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  promoBannerEnabled: boolean("promo_banner_enabled").notNull().default(true),
  promoBannerText: text("promo_banner_text").notNull().default("Free Shipping on Orders Over $75 | 30-Day Money-Back Guarantee"),
  heroHeadline: text("hero_headline").notNull().default("Your Wellness Journey\nMade Simple"),
  heroSubheadline: text("hero_subheadline").notNull().default("Powerful products to help you stay energized, focused, and on track"),
  heroButtonText: text("hero_button_text").notNull().default("Shop Now"),
  trustBadgeEnabled: boolean("trust_badge_enabled").notNull().default(true),
  trustBadgeText: text("trust_badge_text").notNull().default("13,000+ Happy Customers"),
  benefitOneText: text("benefit_one_text").notNull().default("Feel Amazing"),
  benefitTwoText: text("benefit_two_text").notNull().default("Stay Energized"),
  benefitThreeText: text("benefit_three_text").notNull().default("Live Better"),
  updatedAt: timestamp("updated_at").notNull().default(sql`now()`),
});

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  role: text("role").notNull().default("customer"),
  email: text("email"),
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
});

export const customerAddresses = pgTable("customer_addresses", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  label: text("label"),
  fullName: text("full_name").notNull(),
  addressLine1: text("address_line1").notNull(),
  addressLine2: text("address_line2"),
  city: text("city").notNull(),
  state: text("state").notNull(),
  zip: text("zip").notNull(),
  country: text("country").notNull().default("United States"),
  phone: text("phone"),
  isDefault: boolean("is_default").default(false),
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
  updatedAt: timestamp("updated_at").notNull().default(sql`now()`),
});

export const insertProductSchema = createInsertSchema(products).omit({
  id: true,
  createdAt: true,
  views: true,
  sales: true,
});

export const insertOrderSchema = createInsertSchema(orders).omit({
  id: true,
  createdAt: true,
  status: true,
});

export const insertOrderItemSchema = createInsertSchema(orderItems).omit({
  id: true,
});

export const insertSiteSettingsSchema = createInsertSchema(siteSettings).omit({
  id: true,
  updatedAt: true,
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
});

export const insertCustomerAddressSchema = createInsertSchema(customerAddresses).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertProduct = z.infer<typeof insertProductSchema>;
export type Product = typeof products.$inferSelect;
export type InsertOrder = z.infer<typeof insertOrderSchema>;
export type Order = typeof orders.$inferSelect;
export type InsertOrderItem = z.infer<typeof insertOrderItemSchema>;
export type OrderItem = typeof orderItems.$inferSelect;
export type InsertSiteSettings = z.infer<typeof insertSiteSettingsSchema>;
export type SiteSettings = typeof siteSettings.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertCustomerAddress = z.infer<typeof insertCustomerAddressSchema>;
export type CustomerAddress = typeof customerAddresses.$inferSelect;

export interface CartItem {
  productId: string;
  name: string;
  price: string;
  quantity: number;
  imageUrl?: string;
}

export interface AnalyticsData {
  totalRevenue: number;
  totalOrders: number;
  totalViews: number;
  conversionRate: number;
  topProducts: Array<{
    id: string;
    name: string;
    sales: number;
    revenue: number;
    views: number;
    conversionRate: number;
  }>;
}

export interface ProductTestingMetrics {
  id: string;
  name: string;
  views: number;
  sales: number;
  revenue: number;
  adSpend: number;
  productCost: number;
  profit: number;
  roi: number;
  roas: number;
  cpa: number;
  conversionRate: number;
  profitMargin: number;
  status: "winner" | "testing" | "loser" | "needs_data";
  recommendation: string;
}
