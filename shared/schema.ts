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
  promoBannerText: text("promo_banner_text").notNull().default("Free Shipping on Orders Over $50 | 30-Day Money-Back Guarantee | Natural Wellness You Can Trust"),
  heroHeadline: text("hero_headline").notNull().default("Natural Wellness Solutions Trusted by Families"),
  heroSubheadline: text("hero_subheadline").notNull().default("Discover premium natural remedies, supplements, and holistic wellness products loved by over 13,000 families. Your Trusted Family Loving Remedies - wellness that works."),
  heroButtonText: text("hero_button_text").notNull().default("Shop Now"),
  trustBadgeEnabled: boolean("trust_badge_enabled").notNull().default(true),
  trustBadgeText: text("trust_badge_text").notNull().default("13,000+ Families Trust Our Wellness Solutions | Proven Results | 30-Day Guarantee"),
  benefitOneText: text("benefit_one_text").notNull().default("Clinically Proven Formulas"),
  benefitTwoText: text("benefit_two_text").notNull().default("100% Natural Ingredients"),
  benefitThreeText: text("benefit_three_text").notNull().default("Money-Back Guarantee"),
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

export const passwordResetTokens = pgTable("password_reset_tokens", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  token: text("token").notNull().unique(),
  expiresAt: timestamp("expires_at").notNull(),
  used: boolean("used").notNull().default(false),
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
});

export const insertPasswordResetTokenSchema = createInsertSchema(passwordResetTokens).omit({ id: true, createdAt: true });
export type InsertPasswordResetToken = z.infer<typeof insertPasswordResetTokenSchema>;
export type PasswordResetToken = typeof passwordResetTokens.$inferSelect;

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

// Tax Rates - State/Region based tax calculation
export const taxRates = pgTable("tax_rates", {
  id: serial("id").primaryKey(),
  stateCode: text("state_code").notNull(), // e.g., "CA", "NY", "TX"
  stateName: text("state_name").notNull(),
  countyName: text("county_name"), // Optional county-level tax
  cityName: text("city_name"), // Optional city-level tax
  stateRate: decimal("state_rate", { precision: 5, scale: 4 }).notNull().default("0"), // e.g., 0.0725 = 7.25%
  countyRate: decimal("county_rate", { precision: 5, scale: 4 }).notNull().default("0"),
  cityRate: decimal("city_rate", { precision: 5, scale: 4 }).notNull().default("0"),
  specialRate: decimal("special_rate", { precision: 5, scale: 4 }).notNull().default("0"),
  combinedRate: decimal("combined_rate", { precision: 5, scale: 4 }).notNull(), // Total of all rates
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
  updatedAt: timestamp("updated_at").notNull().default(sql`now()`),
});

// Accounting & Financial System
export const shippingRates = pgTable("shipping_rates", {
  id: serial("id").primaryKey(),
  carrier: text("carrier").notNull(), // "USPS", "UPS", "FedEx"
  serviceType: text("service_type").notNull(), // "standard", "express", "overnight"
  minWeight: decimal("min_weight", { precision: 8, scale: 2 }).notNull(), // ounces
  maxWeight: decimal("max_weight", { precision: 8, scale: 2 }).notNull(),
  baseCost: decimal("base_cost", { precision: 10, scale: 2 }).notNull(),
  costPerOunce: decimal("cost_per_ounce", { precision: 8, scale: 4 }).notNull(),
  estimatedDays: integer("estimated_days"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
  updatedAt: timestamp("updated_at").notNull().default(sql`now()`),
});

export const discountCodes = pgTable("discount_codes", {
  id: serial("id").primaryKey(),
  code: text("code").notNull().unique(),
  type: text("type").notNull(), // "percentage", "fixed", "free_shipping"
  value: decimal("value", { precision: 10, scale: 2 }).notNull(),
  maxUses: integer("max_uses"),
  currentUses: integer("current_uses").notNull().default(0),
  minOrderAmount: decimal("min_order_amount", { precision: 10, scale: 2 }).default("0"),
  validFrom: timestamp("valid_from").notNull(),
  validUntil: timestamp("valid_until"),
  isActive: boolean("is_active").notNull().default(true),
  // Post-order discount tracking
  generatedForOrderId: varchar("generated_for_order_id").references(() => orders.id),
  forCustomerEmail: text("for_customer_email"),
  source: text("source").default("manual"), // "manual", "post_order", "loyalty", "campaign"
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
});

export const promotionCampaigns = pgTable("promotion_campaigns", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  discountCodeId: integer("discount_code_id").references(() => discountCodes.id),
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date"),
  budget: decimal("budget", { precision: 12, scale: 2 }),
  budgetSpent: decimal("budget_spent", { precision: 12, scale: 2 }).notNull().default("0"),
  targetAudience: text("target_audience"), // "all", "new_customers", "repeat"
  expectedRoi: decimal("expected_roi", { precision: 8, scale: 2 }),
  actualRoi: decimal("actual_roi", { precision: 8, scale: 2 }),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
});

export const financialRecords = pgTable("financial_records", {
  id: serial("id").primaryKey(),
  orderId: varchar("order_id").references(() => orders.id),
  productId: varchar("product_id").references(() => products.id),
  recordType: text("record_type").notNull(), // "sale", "refund", "discount", "shipping"
  revenue: decimal("revenue", { precision: 12, scale: 2 }).notNull().default("0"),
  cost: decimal("cost", { precision: 12, scale: 2 }).notNull().default("0"),
  shippingCost: decimal("shipping_cost", { precision: 10, scale: 2 }).notNull().default("0"),
  discountAmount: decimal("discount_amount", { precision: 10, scale: 2 }).notNull().default("0"),
  profit: decimal("profit", { precision: 12, scale: 2 }).notNull().default("0"),
  profitMargin: decimal("profit_margin", { precision: 8, scale: 2 }).notNull().default("0"), // percentage
  taxAmount: decimal("tax_amount", { precision: 10, scale: 2 }).notNull().default("0"),
  quantity: integer("quantity").notNull().default(1),
  discountCodeUsed: text("discount_code_used"),
  shippingCarrier: text("shipping_carrier"),
  shippingTrackingNumber: text("shipping_tracking_number"),
  notes: text("notes"),
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
});

// Newsletter System
export const newsletters = pgTable("newsletters", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  subject: text("subject").notNull(),
  content: text("content").notNull(), // HTML content
  category: text("category").notNull(), // "yoga", "lotion", "energy_drinks", etc.
  productIds: text("product_ids"), // JSON array of product IDs to feature
  status: text("status").notNull().default("draft"), // draft, scheduled, sent
  scheduledAt: timestamp("scheduled_at"),
  sentAt: timestamp("sent_at"),
  recipientCount: integer("recipient_count").default(0),
  openRate: decimal("open_rate", { precision: 5, scale: 2 }).default("0"),
  clickRate: decimal("click_rate", { precision: 5, scale: 2 }).default("0"),
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
  updatedAt: timestamp("updated_at").notNull().default(sql`now()`),
});

export const newsletterSubscribers = pgTable("newsletter_subscribers", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  userId: integer("user_id").references(() => users.id),
  category: text("category"), // "all", "yoga", "lotion", "energy_drinks", etc.
  isSubscribed: boolean("is_subscribed").notNull().default(true),
  subscriptionDate: timestamp("subscription_date").notNull().default(sql`now()`),
  unsubscribeDate: timestamp("unsubscribe_date"),
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
});

export const newsletterEvents = pgTable("newsletter_events", {
  id: serial("id").primaryKey(),
  newsletterId: integer("newsletter_id").notNull().references(() => newsletters.id),
  subscriberId: integer("subscriber_id").notNull().references(() => newsletterSubscribers.id),
  eventType: text("event_type").notNull(), // "sent", "opened", "clicked", "bounced"
  clickUrl: text("click_url"),
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
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

export const insertTaxRateSchema = createInsertSchema(taxRates).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertShippingRateSchema = createInsertSchema(shippingRates).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertDiscountCodeSchema = createInsertSchema(discountCodes).omit({
  id: true,
  createdAt: true,
});

export const insertPromotionCampaignSchema = createInsertSchema(promotionCampaigns).omit({
  id: true,
  createdAt: true,
});

export const insertFinancialRecordSchema = createInsertSchema(financialRecords).omit({
  id: true,
  createdAt: true,
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
export type InsertTaxRate = z.infer<typeof insertTaxRateSchema>;
export type TaxRate = typeof taxRates.$inferSelect;
export type InsertShippingRate = z.infer<typeof insertShippingRateSchema>;
export type ShippingRate = typeof shippingRates.$inferSelect;
export type InsertDiscountCode = z.infer<typeof insertDiscountCodeSchema>;
export type DiscountCode = typeof discountCodes.$inferSelect;
export type InsertPromotionCampaign = z.infer<typeof insertPromotionCampaignSchema>;
export type PromotionCampaign = typeof promotionCampaigns.$inferSelect;
export type InsertFinancialRecord = z.infer<typeof insertFinancialRecordSchema>;
export type FinancialRecord = typeof financialRecords.$inferSelect;

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

export type Newsletter = typeof newsletters.$inferSelect;
export type InsertNewsletter = typeof newsletters.$inferInsert;
export type NewsletterSubscriber = typeof newsletterSubscribers.$inferSelect;
export type InsertNewsletterSubscriber = typeof newsletterSubscribers.$inferInsert;
export type NewsletterEvent = typeof newsletterEvents.$inferSelect;
export type InsertNewsletterEvent = typeof newsletterEvents.$inferInsert;

export const insertNewsletterSchema = createInsertSchema(newsletters).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  sentAt: true,
  recipientCount: true,
  openRate: true,
  clickRate: true,
});

export const insertNewsletterSubscriberSchema = createInsertSchema(newsletterSubscribers).omit({
  id: true,
  subscriptionDate: true,
  createdAt: true,
});

// Blog Posts - for newsletter archives and wellness articles
export const blogPosts = pgTable("blog_posts", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  slug: text("slug").notNull().unique(),
  excerpt: text("excerpt"), // Short preview text
  content: text("content").notNull(), // Full article content (plain text/markdown)
  category: text("category"), // wellness, nutrition, fitness, etc.
  featuredImage: text("featured_image"), // Optional header image URL
  author: text("author").default("HealthyWaze Team"),
  isPublished: boolean("is_published").notNull().default(false),
  isFromNewsletter: boolean("is_from_newsletter").notNull().default(false), // Marks if converted from newsletter
  newsletterId: integer("newsletter_id"),
  publishedAt: timestamp("published_at"),
  views: integer("views").notNull().default(0),
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
  updatedAt: timestamp("updated_at").notNull().default(sql`now()`),
});

// ============================================
// SHOPIFY-LEVEL E-COMMERCE FEATURES
// ============================================

// Persistent Carts - Database-backed cart storage
export const carts = pgTable("carts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: integer("user_id").references(() => users.id),
  sessionToken: text("session_token"), // For guest carts
  notes: text("notes"), // Customer notes for the order
  discountCodeId: integer("discount_code_id").references(() => discountCodes.id),
  subtotal: decimal("subtotal", { precision: 10, scale: 2 }).notNull().default("0"),
  discountAmount: decimal("discount_amount", { precision: 10, scale: 2 }).notNull().default("0"),
  total: decimal("total", { precision: 10, scale: 2 }).notNull().default("0"),
  status: text("status").notNull().default("active"), // active, abandoned, converted
  convertedOrderId: varchar("converted_order_id").references(() => orders.id),
  lastActivityAt: timestamp("last_activity_at").notNull().default(sql`now()`),
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
  updatedAt: timestamp("updated_at").notNull().default(sql`now()`),
});

export const cartItems = pgTable("cart_items", {
  id: serial("id").primaryKey(),
  cartId: varchar("cart_id").notNull().references(() => carts.id, { onDelete: "cascade" }),
  productId: varchar("product_id").notNull().references(() => products.id),
  variantId: varchar("variant_id"), // For variant support
  quantity: integer("quantity").notNull().default(1),
  unitPrice: decimal("unit_price", { precision: 10, scale: 2 }).notNull(),
  totalPrice: decimal("total_price", { precision: 10, scale: 2 }).notNull(),
  addedAt: timestamp("added_at").notNull().default(sql`now()`),
});

export const savedForLater = pgTable("saved_for_later", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  productId: varchar("product_id").notNull().references(() => products.id),
  variantId: varchar("variant_id"),
  savedAt: timestamp("saved_at").notNull().default(sql`now()`),
});

// Product Variants - Size, Color, Options
export const productOptions = pgTable("product_options", {
  id: serial("id").primaryKey(),
  productId: varchar("product_id").notNull().references(() => products.id, { onDelete: "cascade" }),
  name: text("name").notNull(), // "Size", "Color", "Flavor"
  position: integer("position").notNull().default(1), // Display order
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
});

export const productOptionValues = pgTable("product_option_values", {
  id: serial("id").primaryKey(),
  optionId: integer("option_id").notNull().references(() => productOptions.id, { onDelete: "cascade" }),
  value: text("value").notNull(), // "Small", "Red", "Berry"
  position: integer("position").notNull().default(1),
});

export const productVariants = pgTable("product_variants", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  productId: varchar("product_id").notNull().references(() => products.id, { onDelete: "cascade" }),
  sku: text("sku"), // Unique SKU per variant
  title: text("title").notNull(), // "Small / Red"
  option1: text("option1"), // First option value
  option2: text("option2"), // Second option value
  option3: text("option3"), // Third option value
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  compareAtPrice: decimal("compare_at_price", { precision: 10, scale: 2 }), // Original/MSRP
  costPerItem: decimal("cost_per_item", { precision: 10, scale: 2 }), // Your cost
  stock: integer("stock").notNull().default(0),
  lowStockThreshold: integer("low_stock_threshold").default(5),
  weight: decimal("weight", { precision: 8, scale: 2 }), // In ounces
  barcode: text("barcode"), // UPC/ISBN
  imageUrl: text("image_url"),
  isDefault: boolean("is_default").notNull().default(false),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
  updatedAt: timestamp("updated_at").notNull().default(sql`now()`),
});

// Inventory Tracking
export const inventoryAlerts = pgTable("inventory_alerts", {
  id: serial("id").primaryKey(),
  productId: varchar("product_id").notNull().references(() => products.id),
  variantId: varchar("variant_id").references(() => productVariants.id),
  alertType: text("alert_type").notNull(), // "low_stock", "out_of_stock", "restock"
  currentStock: integer("current_stock").notNull(),
  threshold: integer("threshold"),
  isResolved: boolean("is_resolved").notNull().default(false),
  resolvedAt: timestamp("resolved_at"),
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
});

// Order Editing & Revisions
export const orderRevisions = pgTable("order_revisions", {
  id: serial("id").primaryKey(),
  orderId: varchar("order_id").notNull().references(() => orders.id),
  revisedBy: integer("revised_by").references(() => users.id), // Admin who made change
  revisionType: text("revision_type").notNull(), // "items", "shipping", "discount", "cancel"
  previousState: text("previous_state").notNull(), // JSON of previous values
  newState: text("new_state").notNull(), // JSON of new values
  reason: text("reason"), // Why the change was made
  customerNotified: boolean("customer_notified").notNull().default(false),
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
});

// Order Timeline - Full audit trail
export const orderTimeline = pgTable("order_timeline", {
  id: serial("id").primaryKey(),
  orderId: varchar("order_id").notNull().references(() => orders.id),
  eventType: text("event_type").notNull(), // "created", "paid", "shipped", "delivered", "edited", "refunded"
  title: text("title").notNull(),
  description: text("description"),
  userId: integer("user_id").references(() => users.id),
  metadata: text("metadata"), // JSON additional data
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
});

// Draft Orders - Admin-created orders
export const draftOrders = pgTable("draft_orders", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  createdBy: integer("created_by").notNull().references(() => users.id),
  customerEmail: text("customer_email"),
  customerName: text("customer_name"),
  customerPhone: text("customer_phone"),
  shippingAddressLine1: text("shipping_address_line1"),
  shippingAddressLine2: text("shipping_address_line2"),
  shippingCity: text("shipping_city"),
  shippingState: text("shipping_state"),
  shippingZip: text("shipping_zip"),
  shippingCountry: text("shipping_country").default("United States"),
  notes: text("notes"),
  subtotal: decimal("subtotal", { precision: 10, scale: 2 }).notNull().default("0"),
  discountAmount: decimal("discount_amount", { precision: 10, scale: 2 }).notNull().default("0"),
  shippingCost: decimal("shipping_cost", { precision: 10, scale: 2 }).notNull().default("0"),
  taxAmount: decimal("tax_amount", { precision: 10, scale: 2 }).notNull().default("0"),
  total: decimal("total", { precision: 10, scale: 2 }).notNull().default("0"),
  status: text("status").notNull().default("open"), // open, invoice_sent, completed
  invoiceSentAt: timestamp("invoice_sent_at"),
  convertedOrderId: varchar("converted_order_id").references(() => orders.id),
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
  updatedAt: timestamp("updated_at").notNull().default(sql`now()`),
});

export const draftOrderItems = pgTable("draft_order_items", {
  id: serial("id").primaryKey(),
  draftOrderId: varchar("draft_order_id").notNull().references(() => draftOrders.id, { onDelete: "cascade" }),
  productId: varchar("product_id").references(() => products.id),
  variantId: varchar("variant_id").references(() => productVariants.id),
  customTitle: text("custom_title"), // For custom line items
  quantity: integer("quantity").notNull().default(1),
  unitPrice: decimal("unit_price", { precision: 10, scale: 2 }).notNull(),
  totalPrice: decimal("total_price", { precision: 10, scale: 2 }).notNull(),
});

// Gift Cards & Store Credit
export const giftCards = pgTable("gift_cards", {
  id: serial("id").primaryKey(),
  code: text("code").notNull().unique(),
  initialBalance: decimal("initial_balance", { precision: 10, scale: 2 }).notNull(),
  currentBalance: decimal("current_balance", { precision: 10, scale: 2 }).notNull(),
  currency: text("currency").notNull().default("USD"),
  purchasedByUserId: integer("purchased_by_user_id").references(() => users.id),
  purchaseOrderId: varchar("purchase_order_id").references(() => orders.id),
  recipientEmail: text("recipient_email"),
  recipientName: text("recipient_name"),
  personalMessage: text("personal_message"),
  expiresAt: timestamp("expires_at"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
});

export const giftCardTransactions = pgTable("gift_card_transactions", {
  id: serial("id").primaryKey(),
  giftCardId: integer("gift_card_id").notNull().references(() => giftCards.id),
  orderId: varchar("order_id").references(() => orders.id),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  type: text("type").notNull(), // "purchase", "redemption", "refund", "adjustment"
  balanceAfter: decimal("balance_after", { precision: 10, scale: 2 }).notNull(),
  note: text("note"),
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
});

// Refunds & Returns
export const returns = pgTable("returns", {
  id: serial("id").primaryKey(),
  orderId: varchar("order_id").notNull().references(() => orders.id),
  returnNumber: text("return_number").notNull().unique(), // RET-12345
  reason: text("reason").notNull(),
  customerNotes: text("customer_notes"),
  adminNotes: text("admin_notes"),
  status: text("status").notNull().default("requested"), // requested, approved, received, refunded, declined
  refundMethod: text("refund_method"), // "original_payment", "store_credit", "gift_card"
  refundAmount: decimal("refund_amount", { precision: 10, scale: 2 }),
  restockItems: boolean("restock_items").notNull().default(true),
  trackingNumber: text("tracking_number"), // Return shipping tracking
  processedBy: integer("processed_by").references(() => users.id),
  processedAt: timestamp("processed_at"),
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
  updatedAt: timestamp("updated_at").notNull().default(sql`now()`),
});

export const returnItems = pgTable("return_items", {
  id: serial("id").primaryKey(),
  returnId: integer("return_id").notNull().references(() => returns.id, { onDelete: "cascade" }),
  orderItemId: varchar("order_item_id").notNull().references(() => orderItems.id),
  quantity: integer("quantity").notNull(),
  reason: text("reason"),
  condition: text("condition"), // "unopened", "opened", "damaged"
  refundAmount: decimal("refund_amount", { precision: 10, scale: 2 }),
});

// Insert schemas for new tables
export const insertCartSchema = createInsertSchema(carts).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  lastActivityAt: true,
});

export const insertCartItemSchema = createInsertSchema(cartItems).omit({
  id: true,
  addedAt: true,
});

export const insertSavedForLaterSchema = createInsertSchema(savedForLater).omit({
  id: true,
  savedAt: true,
});

export const insertProductOptionSchema = createInsertSchema(productOptions).omit({
  id: true,
  createdAt: true,
});

export const insertProductOptionValueSchema = createInsertSchema(productOptionValues).omit({
  id: true,
});

export const insertProductVariantSchema = createInsertSchema(productVariants).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertInventoryAlertSchema = createInsertSchema(inventoryAlerts).omit({
  id: true,
  createdAt: true,
});

export const insertOrderRevisionSchema = createInsertSchema(orderRevisions).omit({
  id: true,
  createdAt: true,
});

export const insertOrderTimelineSchema = createInsertSchema(orderTimeline).omit({
  id: true,
  createdAt: true,
});

export const insertDraftOrderSchema = createInsertSchema(draftOrders).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertDraftOrderItemSchema = createInsertSchema(draftOrderItems).omit({
  id: true,
});

export const insertGiftCardSchema = createInsertSchema(giftCards).omit({
  id: true,
  createdAt: true,
});

export const insertGiftCardTransactionSchema = createInsertSchema(giftCardTransactions).omit({
  id: true,
  createdAt: true,
});

export const insertReturnSchema = createInsertSchema(returns).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertReturnItemSchema = createInsertSchema(returnItems).omit({
  id: true,
});

// Types for new tables
export type Cart = typeof carts.$inferSelect;
export type InsertCart = z.infer<typeof insertCartSchema>;
export type CartItemDB = typeof cartItems.$inferSelect;
export type InsertCartItem = z.infer<typeof insertCartItemSchema>;
export type SavedForLater = typeof savedForLater.$inferSelect;
export type InsertSavedForLater = z.infer<typeof insertSavedForLaterSchema>;
export type ProductOption = typeof productOptions.$inferSelect;
export type InsertProductOption = z.infer<typeof insertProductOptionSchema>;
export type ProductOptionValue = typeof productOptionValues.$inferSelect;
export type InsertProductOptionValue = z.infer<typeof insertProductOptionValueSchema>;
export type ProductVariant = typeof productVariants.$inferSelect;
export type InsertProductVariant = z.infer<typeof insertProductVariantSchema>;
export type InventoryAlert = typeof inventoryAlerts.$inferSelect;
export type InsertInventoryAlert = z.infer<typeof insertInventoryAlertSchema>;
export type OrderRevision = typeof orderRevisions.$inferSelect;
export type InsertOrderRevision = z.infer<typeof insertOrderRevisionSchema>;
export type OrderTimelineEvent = typeof orderTimeline.$inferSelect;
export type InsertOrderTimelineEvent = z.infer<typeof insertOrderTimelineSchema>;
export type DraftOrder = typeof draftOrders.$inferSelect;
export type InsertDraftOrder = z.infer<typeof insertDraftOrderSchema>;
export type DraftOrderItem = typeof draftOrderItems.$inferSelect;
export type InsertDraftOrderItem = z.infer<typeof insertDraftOrderItemSchema>;
export type GiftCard = typeof giftCards.$inferSelect;
export type InsertGiftCard = z.infer<typeof insertGiftCardSchema>;
export type GiftCardTransaction = typeof giftCardTransactions.$inferSelect;
export type InsertGiftCardTransaction = z.infer<typeof insertGiftCardTransactionSchema>;
export type Return = typeof returns.$inferSelect;
export type InsertReturn = z.infer<typeof insertReturnSchema>;
export type ReturnItem = typeof returnItems.$inferSelect;
export type InsertReturnItem = z.infer<typeof insertReturnItemSchema>;

export const insertBlogPostSchema = createInsertSchema(blogPosts).omit({
  id: true,
  views: true,
  createdAt: true,
  updatedAt: true,
});

export type BlogPost = typeof blogPosts.$inferSelect;
export type InsertBlogPost = z.infer<typeof insertBlogPostSchema>;

// AI Chat Sessions for Wellness Advisor
export const aiChatSessions = pgTable("ai_chat_sessions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  visitorId: text("visitor_id"), 
  userId: integer("user_id").references(() => users.id),
  summary: text("summary"),
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
  updatedAt: timestamp("updated_at").notNull().default(sql`now()`),
});

export const aiChatMessages = pgTable("ai_chat_messages", {
  id: serial("id").primaryKey(),
  sessionId: varchar("session_id").notNull().references(() => aiChatSessions.id),
  role: text("role").notNull(), 
  content: text("content").notNull(),
  recommendedProductIds: text("recommended_product_ids"), 
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
});

export const insertAiChatSessionSchema = createInsertSchema(aiChatSessions).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertAiChatMessageSchema = createInsertSchema(aiChatMessages).omit({
  id: true,
  createdAt: true,
});

export type AiChatSession = typeof aiChatSessions.$inferSelect;
export type InsertAiChatSession = z.infer<typeof insertAiChatSessionSchema>;
export type AiChatMessage = typeof aiChatMessages.$inferSelect;
export type InsertAiChatMessage = z.infer<typeof insertAiChatMessageSchema>;

// ============================================
// MARKETING ATTRIBUTION & ROI OPTIMIZATION
// ============================================

// Marketing sessions - captures UTM parameters and ad click data
export const marketingSessions = pgTable("marketing_sessions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  visitorId: text("visitor_id").notNull(), // Session token from cart
  userId: integer("user_id").references(() => users.id),
  
  // UTM Parameters (from Google Ads, Facebook, etc.)
  utmSource: text("utm_source"), // google, facebook, instagram, email
  utmMedium: text("utm_medium"), // cpc, organic, social, email
  utmCampaign: text("utm_campaign"), // spring_sale, wellness_promo
  utmTerm: text("utm_term"), // keyword for paid search
  utmContent: text("utm_content"), // ad variation identifier
  
  // Google Ads specific
  gclid: text("gclid"), // Google Click ID for conversion tracking
  gbraid: text("gbraid"), // Google App conversion tracking
  wbraid: text("wbraid"), // Web-to-App conversion tracking
  
  // Facebook/Meta specific
  fbclid: text("fbclid"), // Facebook Click ID
  
  // Landing page and referrer
  landingPage: text("landing_page"),
  referrer: text("referrer"),
  
  // Device info
  deviceType: text("device_type"), // mobile, desktop, tablet
  browser: text("browser"),
  
  // Session timing
  firstSeen: timestamp("first_seen").notNull().default(sql`now()`),
  lastSeen: timestamp("last_seen").notNull().default(sql`now()`),
  
  // Conversion tracking
  convertedToOrder: boolean("converted_to_order").default(false),
  orderId: varchar("order_id").references(() => orders.id),
  orderTotal: decimal("order_total", { precision: 10, scale: 2 }),
});

// Promo codes for campaign tracking
export const promoCodes = pgTable("promo_codes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  code: text("code").notNull().unique(),
  description: text("description"),
  
  // Discount settings
  discountType: text("discount_type").notNull().default("percentage"), // percentage, fixed
  discountValue: decimal("discount_value", { precision: 10, scale: 2 }).notNull(),
  minimumOrder: decimal("minimum_order", { precision: 10, scale: 2 }).default("0"),
  
  // Usage limits
  maxUses: integer("max_uses"), // null = unlimited
  usedCount: integer("used_count").notNull().default(0),
  maxUsesPerCustomer: integer("max_uses_per_customer").default(1),
  
  // Campaign tracking
  campaignName: text("campaign_name"), // Links to utm_campaign
  source: text("source"), // google, facebook, influencer_john
  
  // Validity
  startsAt: timestamp("starts_at"),
  expiresAt: timestamp("expires_at"),
  isActive: boolean("is_active").notNull().default(true),
  
  // Metrics (calculated)
  totalRevenue: decimal("total_revenue", { precision: 10, scale: 2 }).default("0"),
  totalDiscount: decimal("total_discount", { precision: 10, scale: 2 }).default("0"),
  
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
});

// Promo code usage tracking
export const promoCodeUsages = pgTable("promo_code_usages", {
  id: serial("id").primaryKey(),
  promoCodeId: varchar("promo_code_id").notNull().references(() => promoCodes.id),
  orderId: varchar("order_id").notNull().references(() => orders.id),
  userId: integer("user_id").references(() => users.id),
  discountAmount: decimal("discount_amount", { precision: 10, scale: 2 }).notNull(),
  orderTotal: decimal("order_total", { precision: 10, scale: 2 }).notNull(),
  usedAt: timestamp("used_at").notNull().default(sql`now()`),
});

// Customer Lifetime Value tracking
export const customerMetrics = pgTable("customer_metrics", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().unique().references(() => users.id),
  
  // Lifetime value metrics
  totalOrders: integer("total_orders").notNull().default(0),
  totalSpent: decimal("total_spent", { precision: 10, scale: 2 }).notNull().default("0"),
  averageOrderValue: decimal("average_order_value", { precision: 10, scale: 2 }).default("0"),
  
  // Acquisition info
  firstOrderDate: timestamp("first_order_date"),
  lastOrderDate: timestamp("last_order_date"),
  acquisitionSource: text("acquisition_source"), // utm_source from first order
  acquisitionCampaign: text("acquisition_campaign"), // utm_campaign from first order
  acquisitionCost: decimal("acquisition_cost", { precision: 10, scale: 2 }).default("0"),
  
  // Calculated CLV
  estimatedLifetimeValue: decimal("estimated_lifetime_value", { precision: 10, scale: 2 }).default("0"),
  profitMargin: decimal("profit_margin", { precision: 10, scale: 2 }).default("0"),
  
  // Engagement metrics
  emailOpens: integer("email_opens").default(0),
  emailClicks: integer("email_clicks").default(0),
  lastEmailInteraction: timestamp("last_email_interaction"),
  
  // Segmentation
  segment: text("segment").default("new"), // new, active, at_risk, churned, vip
  
  updatedAt: timestamp("updated_at").notNull().default(sql`now()`),
});

// Post-purchase survey responses
export const postPurchaseSurveys = pgTable("post_purchase_surveys", {
  id: serial("id").primaryKey(),
  orderId: varchar("order_id").notNull().references(() => orders.id),
  userId: integer("user_id").references(() => users.id),
  
  // "How did you hear about us?" question
  heardAboutUs: text("heard_about_us"), // google_ad, facebook, friend, influencer, other
  heardAboutUsOther: text("heard_about_us_other"), // If "other" selected
  
  // Additional feedback
  satisfactionRating: integer("satisfaction_rating"), // 1-5
  wouldRecommend: boolean("would_recommend"),
  feedback: text("feedback"),
  
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
});

// Marketing campaign cost tracking (for ROAS calculation)
export const marketingCampaigns = pgTable("marketing_campaigns", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  platform: text("platform").notNull(), // google_ads, facebook_ads, instagram, email
  
  // Campaign identifiers (to match with UTM)
  utmCampaign: text("utm_campaign"),
  utmSource: text("utm_source"),
  
  // Cost tracking
  totalSpend: decimal("total_spend", { precision: 10, scale: 2 }).notNull().default("0"),
  dailyBudget: decimal("daily_budget", { precision: 10, scale: 2 }),
  
  // Metrics (calculated from attribution)
  impressions: integer("impressions").default(0),
  clicks: integer("clicks").default(0),
  conversions: integer("conversions").default(0),
  revenue: decimal("revenue", { precision: 10, scale: 2 }).default("0"),
  
  // Calculated ROAS
  roas: decimal("roas", { precision: 10, scale: 2 }).default("0"), // Return on Ad Spend
  cpa: decimal("cpa", { precision: 10, scale: 2 }).default("0"), // Cost per Acquisition
  
  // Status
  status: text("status").default("active"), // active, paused, ended
  startsAt: timestamp("starts_at"),
  endsAt: timestamp("ends_at"),
  
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
  updatedAt: timestamp("updated_at").notNull().default(sql`now()`),
});

// Referral Program
export const referrals = pgTable("referrals", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  referrerId: integer("referrer_id").notNull().references(() => users.id), // User who referred
  referredEmail: text("referred_email").notNull(), // Email of person referred
  referredUserId: integer("referred_user_id").references(() => users.id), // User who signed up (once registered)
  
  // Referral tracking
  referralCode: varchar("referral_code", { length: 20 }).notNull(), // The code that was used
  status: text("status").notNull().default("pending"), // pending, registered, converted (first purchase)
  
  // Rewards
  referrerRewardPoints: integer("referrer_reward_points").default(0), // Points awarded to referrer
  referredRewardPoints: integer("referred_reward_points").default(0), // Points/discount for new customer
  
  // Conversion tracking
  convertedOrderId: varchar("converted_order_id").references(() => orders.id), // First order by referred user
  convertedAt: timestamp("converted_at"),
  
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
});

export const referralCodes = pgTable("referral_codes", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().unique().references(() => users.id),
  code: varchar("code", { length: 20 }).notNull().unique(),
  timesUsed: integer("times_used").notNull().default(0),
  totalPointsEarned: integer("total_points_earned").notNull().default(0),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
});

export const insertReferralSchema = createInsertSchema(referrals).omit({
  id: true,
  referredUserId: true,
  status: true,
  referrerRewardPoints: true,
  referredRewardPoints: true,
  convertedOrderId: true,
  convertedAt: true,
  createdAt: true,
});

export const insertReferralCodeSchema = createInsertSchema(referralCodes).omit({
  id: true,
  timesUsed: true,
  totalPointsEarned: true,
  createdAt: true,
});

export type Referral = typeof referrals.$inferSelect;
export type InsertReferral = z.infer<typeof insertReferralSchema>;
export type ReferralCode = typeof referralCodes.$inferSelect;
export type InsertReferralCode = z.infer<typeof insertReferralCodeSchema>;

// Insert schemas
export const insertMarketingSessionSchema = createInsertSchema(marketingSessions).omit({
  id: true,
  firstSeen: true,
  lastSeen: true,
});

export const insertPromoCodeSchema = createInsertSchema(promoCodes).omit({
  id: true,
  usedCount: true,
  totalRevenue: true,
  totalDiscount: true,
  createdAt: true,
});

export const insertPromoCodeUsageSchema = createInsertSchema(promoCodeUsages).omit({
  id: true,
  usedAt: true,
});

export const insertCustomerMetricsSchema = createInsertSchema(customerMetrics).omit({
  id: true,
  updatedAt: true,
});

export const insertPostPurchaseSurveySchema = createInsertSchema(postPurchaseSurveys).omit({
  id: true,
  createdAt: true,
});

export const insertMarketingCampaignSchema = createInsertSchema(marketingCampaigns).omit({
  id: true,
  impressions: true,
  clicks: true,
  conversions: true,
  revenue: true,
  roas: true,
  cpa: true,
  createdAt: true,
  updatedAt: true,
});

// Types
export type MarketingSession = typeof marketingSessions.$inferSelect;
export type InsertMarketingSession = z.infer<typeof insertMarketingSessionSchema>;
export type PromoCode = typeof promoCodes.$inferSelect;
export type InsertPromoCode = z.infer<typeof insertPromoCodeSchema>;
export type PromoCodeUsage = typeof promoCodeUsages.$inferSelect;
export type InsertPromoCodeUsage = z.infer<typeof insertPromoCodeUsageSchema>;
export type CustomerMetrics = typeof customerMetrics.$inferSelect;
export type InsertCustomerMetrics = z.infer<typeof insertCustomerMetricsSchema>;
export type PostPurchaseSurvey = typeof postPurchaseSurveys.$inferSelect;
export type InsertPostPurchaseSurvey = z.infer<typeof insertPostPurchaseSurveySchema>;
export type MarketingCampaign = typeof marketingCampaigns.$inferSelect;
export type InsertMarketingCampaign = z.infer<typeof insertMarketingCampaignSchema>;
