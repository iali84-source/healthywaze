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
