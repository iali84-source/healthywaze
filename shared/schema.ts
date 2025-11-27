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
  isFeatured: boolean("is_featured").notNull().default(false),
  profitabilityScore: decimal("profitability_score", { precision: 10, scale: 2 }).notNull().default("0"),
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
  siteName: text("site_name").notNull().default("Your Trusted Family Loving Remedies"),
  logoUrl: text("logo_url"),
  primaryColor: text("primary_color").notNull().default("22 163 74"),
  secondaryColor: text("secondary_color").notNull().default("234 88 12"),
  accentColor: text("accent_color").notNull().default("20 184 166"),
  promoBannerEnabled: boolean("promo_banner_enabled").notNull().default(true),
  promoBannerText: text("promo_banner_text").notNull().default("Free Shipping on Orders Over $75 | 30-Day Money-Back Guarantee"),
  heroHeadline: text("hero_headline").notNull().default("Your Trusted Family Loving Remedies"),
  heroSubheadline: text("hero_subheadline").notNull().default("Discover wellness products loved and trusted by families for generations - Stay energized, focused, and on track"),
  heroButtonText: text("hero_button_text").notNull().default("Shop Now"),
  trustBadgeEnabled: boolean("trust_badge_enabled").notNull().default(true),
  trustBadgeText: text("trust_badge_text").notNull().default("Your Trusted Family Loving Remedies - 13,000+ Happy Families"),
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

export const reviews = pgTable("reviews", {
  id: serial("id").primaryKey(),
  productId: varchar("product_id").notNull().references(() => products.id),
  userId: integer("user_id").notNull().references(() => users.id),
  orderId: varchar("order_id").references(() => orders.id),
  rating: integer("rating").notNull(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  isVerified: boolean("is_verified").notNull().default(false),
  helpfulCount: integer("helpful_count").notNull().default(0),
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
  updatedAt: timestamp("updated_at").notNull().default(sql`now()`),
});

// Loyalty Program - Points & Tiers
export const loyaltyAccounts = pgTable("loyalty_accounts", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().unique().references(() => users.id),
  totalPoints: integer("total_points").notNull().default(0),
  tier: text("tier").notNull().default("bronze"), // bronze, silver, gold, platinum
  redeemedPoints: integer("redeemed_points").notNull().default(0),
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
  updatedAt: timestamp("updated_at").notNull().default(sql`now()`),
});

export const loyaltyTransactions = pgTable("loyalty_transactions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  orderId: varchar("order_id").references(() => orders.id),
  pointsEarned: integer("points_earned").notNull().default(0),
  pointsRedeemed: integer("points_redeemed").notNull().default(0),
  type: text("type").notNull(), // purchase, redemption, bonus, referral
  description: text("description"),
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
});

// Email Automation - Sequences & Templates
export const emailSequences = pgTable("email_sequences", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(), // "Welcome", "Post-Purchase", "Re-engagement"
  automationType: text("automation_type").notNull(), // "welcome", "post_purchase", "abandoned_cart", "re_engagement"
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
});

export const emailTemplates = pgTable("email_templates", {
  id: serial("id").primaryKey(),
  sequenceId: integer("sequence_id").notNull().references(() => emailSequences.id),
  stepNumber: integer("step_number").notNull(), // 1, 2, 3 for multi-step sequences
  delayMinutes: integer("delay_minutes").notNull().default(0), // Time after trigger
  subject: text("subject").notNull(),
  content: text("content").notNull(), // HTML email content
  sendCondition: text("send_condition"), // "first_purchase", "after_24h", etc
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
});

export const customerEmailEvents = pgTable("customer_email_events", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  sequenceId: integer("sequence_id").notNull().references(() => emailSequences.id),
  templateId: integer("template_id").notNull().references(() => emailTemplates.id),
  orderId: varchar("order_id").references(() => orders.id),
  status: text("status").notNull().default("pending"), // pending, sent, opened, clicked
  sentAt: timestamp("sent_at"),
  openedAt: timestamp("opened_at"),
  clickedAt: timestamp("clicked_at"),
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
});

// Abandoned Carts - For recovery emails
export const abandonedCarts = pgTable("abandoned_carts", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  customerEmail: text("customer_email").notNull(),
  cartItems: text("cart_items").notNull(), // JSON stringified
  cartTotal: decimal("cart_total", { precision: 10, scale: 2 }).notNull(),
  recoveryCode: text("recovery_code").notNull().unique(), // Unique code for recovery link
  status: text("status").notNull().default("abandoned"), // abandoned, recovered, converted
  firstReminderSentAt: timestamp("first_reminder_sent_at"),
  secondReminderSentAt: timestamp("second_reminder_sent_at"),
  finalReminderSentAt: timestamp("final_reminder_sent_at"),
  convertedOrderId: varchar("converted_order_id").references(() => orders.id),
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

export const insertReviewSchema = createInsertSchema(reviews).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  helpfulCount: true,
}).extend({
  rating: z.number().int().min(1).max(5),
  title: z.string().min(5).max(200),
  content: z.string().min(10).max(2000),
});

export const insertLoyaltyAccountSchema = createInsertSchema(loyaltyAccounts).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertLoyaltyTransactionSchema = createInsertSchema(loyaltyTransactions).omit({
  id: true,
  createdAt: true,
});

export const insertEmailSequenceSchema = createInsertSchema(emailSequences).omit({
  id: true,
  createdAt: true,
});

export const insertEmailTemplateSchema = createInsertSchema(emailTemplates).omit({
  id: true,
  createdAt: true,
});

export const insertCustomerEmailEventSchema = createInsertSchema(customerEmailEvents).omit({
  id: true,
  createdAt: true,
});

export const insertAbandonedCartSchema = createInsertSchema(abandonedCarts).omit({
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
export type InsertReview = z.infer<typeof insertReviewSchema>;
export type Review = typeof reviews.$inferSelect;
export type InsertLoyaltyAccount = z.infer<typeof insertLoyaltyAccountSchema>;
export type LoyaltyAccount = typeof loyaltyAccounts.$inferSelect;
export type InsertLoyaltyTransaction = z.infer<typeof insertLoyaltyTransactionSchema>;
export type LoyaltyTransaction = typeof loyaltyTransactions.$inferSelect;
export type InsertEmailSequence = z.infer<typeof insertEmailSequenceSchema>;
export type EmailSequence = typeof emailSequences.$inferSelect;
export type InsertEmailTemplate = z.infer<typeof insertEmailTemplateSchema>;
export type EmailTemplate = typeof emailTemplates.$inferSelect;
export type InsertCustomerEmailEvent = z.infer<typeof insertCustomerEmailEventSchema>;
export type CustomerEmailEvent = typeof customerEmailEvents.$inferSelect;
export type InsertAbandonedCart = z.infer<typeof insertAbandonedCartSchema>;
export type AbandonedCart = typeof abandonedCarts.$inferSelect;

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
