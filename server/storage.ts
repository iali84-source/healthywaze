import {
  type Product,
  type InsertProduct,
  type Order,
  type InsertOrder,
  type OrderItem,
  type InsertOrderItem,
  type SiteSettings,
  type InsertSiteSettings,
  type AnalyticsData,
  type User,
  type InsertUser,
  type CustomerAddress,
  type InsertCustomerAddress,
  type Review,
  type InsertReview,
  type LoyaltyAccount,
  type InsertLoyaltyAccount,
  type LoyaltyTransaction,
  type InsertLoyaltyTransaction,
  type EmailSequence,
  type InsertEmailSequence,
  type EmailTemplate,
  type InsertEmailTemplate,
  type CustomerEmailEvent,
  type InsertCustomerEmailEvent,
  type AbandonedCart,
  type InsertAbandonedCart,
  type ShippingRate,
  type InsertShippingRate,
  type DiscountCode,
  type InsertDiscountCode,
  type PromotionCampaign,
  type InsertPromotionCampaign,
  type FinancialRecord,
  type InsertFinancialRecord,
  type Newsletter,
  type InsertNewsletter,
  type NewsletterSubscriber,
  type InsertNewsletterSubscriber,
  type NewsletterEvent,
  type InsertNewsletterEvent,
  type BlogPost,
  type InsertBlogPost,
  type AiChatSession,
  type InsertAiChatSession,
  type AiChatMessage,
  type InsertAiChatMessage,
  type Cart,
  type InsertCart,
  type CartItemDB,
  type InsertCartItem,
  type SavedForLater,
  type InsertSavedForLater,
  type ProductVariant,
  type InsertProductVariant,
  type ProductOption,
  type InsertProductOption,
  type OrderRevision,
  type InsertOrderRevision,
  type OrderTimelineEvent,
  type InsertOrderTimelineEvent,
  products,
  orders,
  orderItems,
  siteSettings,
  users,
  customerAddresses,
  reviews,
  loyaltyAccounts,
  loyaltyTransactions,
  emailSequences,
  emailTemplates,
  customerEmailEvents,
  abandonedCarts,
  shippingRates,
  discountCodes,
  promotionCampaigns,
  financialRecords,
  newsletters,
  newsletterSubscribers,
  newsletterEvents,
  blogPosts,
  aiChatSessions,
  aiChatMessages,
  carts,
  cartItems,
  savedForLater,
  productVariants,
  productOptions,
  orderRevisions,
  orderTimeline,
} from "@shared/schema";
import { db, pool } from "./db";
import { eq, desc, sql, and, or, gte, lte, ilike, inArray } from "drizzle-orm";
import session from "express-session";
import connectPg from "connect-pg-simple";

const PostgresSessionStore = connectPg(session);

export interface ProductFilters {
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  minRating?: number;
  search?: string;
}

export interface IStorage {
  // Products
  getProducts(filters?: ProductFilters): Promise<Product[]>;
  getProduct(id: string): Promise<Product | undefined>;
  createProduct(product: InsertProduct): Promise<Product>;
  updateProduct(id: string, product: Partial<InsertProduct>): Promise<Product | undefined>;
  deleteProduct(id: string): Promise<boolean>;
  incrementProductViews(id: string): Promise<void>;
  bulkArchiveProducts(productIds: string[]): Promise<number>;
  bulkUnarchiveProducts(productIds: string[]): Promise<number>;
  getArchivedProducts(): Promise<Product[]>;
  restoreArchivedProducts(): Promise<number>;

  // Orders
  getOrders(): Promise<Order[]>;
  getOrdersByUserId(userId: number): Promise<Order[]>;
  getOrder(id: string): Promise<Order | undefined>;
  createOrder(order: InsertOrder): Promise<Order>;
  updateOrder(id: string, order: Partial<Order>): Promise<Order | undefined>;
  
  // Order Items
  getOrderItems(orderId: string): Promise<OrderItem[]>;
  createOrderItem(item: InsertOrderItem): Promise<OrderItem>;

  // Analytics
  getAnalytics(): Promise<AnalyticsData>;

  // Site Settings
  getSiteSettings(): Promise<SiteSettings>;
  updateSiteSettings(updates: Partial<InsertSiteSettings>): Promise<SiteSettings>;

  // Users
  getUserByUsername(username: string): Promise<User | undefined>;
  getUser(id: number): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Customer Addresses
  getCustomerAddresses(userId: number): Promise<CustomerAddress[]>;
  getCustomerAddress(id: number): Promise<CustomerAddress | undefined>;
  createCustomerAddress(address: InsertCustomerAddress): Promise<CustomerAddress>;
  updateCustomerAddress(id: number, address: Partial<InsertCustomerAddress>): Promise<CustomerAddress | undefined>;
  deleteCustomerAddress(id: number): Promise<boolean>;
  setDefaultAddress(userId: number, addressId: number): Promise<void>;

  // Reviews
  getProductReviews(productId: string): Promise<Review[]>;
  getUserProductReview(productId: string, userId: number): Promise<Review | undefined>;
  createReview(review: InsertReview): Promise<Review>;
  incrementHelpfulCount(reviewId: number): Promise<void>;
  hasUserPurchasedProduct(productId: string, userId: number): Promise<boolean>;

  // Loyalty Program
  getLoyaltyAccount(userId: number): Promise<LoyaltyAccount | undefined>;
  createLoyaltyAccount(account: InsertLoyaltyAccount): Promise<LoyaltyAccount>;
  updateLoyaltyAccount(userId: number, updates: Partial<InsertLoyaltyAccount>): Promise<LoyaltyAccount | undefined>;
  addLoyaltyPoints(userId: number, points: number, type: string, description?: string): Promise<LoyaltyTransaction>;
  redeemLoyaltyPoints(userId: number, points: number, description?: string): Promise<LoyaltyTransaction>;
  getLoyaltyTransactions(userId: number): Promise<LoyaltyTransaction[]>;

  // Email Automation
  getEmailSequences(): Promise<EmailSequence[]>;
  getEmailSequence(id: number): Promise<EmailSequence | undefined>;
  createEmailSequence(sequence: InsertEmailSequence): Promise<EmailSequence>;
  updateEmailSequence(id: number, updates: Partial<InsertEmailSequence>): Promise<EmailSequence | undefined>;
  
  getEmailTemplates(sequenceId: number): Promise<EmailTemplate[]>;
  createEmailTemplate(template: InsertEmailTemplate): Promise<EmailTemplate>;
  updateEmailTemplate(id: number, updates: Partial<InsertEmailTemplate>): Promise<EmailTemplate | undefined>;

  trackEmailEvent(event: InsertCustomerEmailEvent): Promise<CustomerEmailEvent>;
  updateEmailEventStatus(eventId: number, status: string): Promise<CustomerEmailEvent | undefined>;

  // Abandoned Carts
  createAbandonedCart(cart: InsertAbandonedCart): Promise<AbandonedCart>;
  getAbandonedCarts(): Promise<AbandonedCart[]>;
  getAbandonedCartByCode(code: string): Promise<AbandonedCart | undefined>;
  updateAbandonedCartStatus(id: number, status: string): Promise<AbandonedCart | undefined>;
  markCartRecovered(cartId: number, orderId: string): Promise<AbandonedCart | undefined>;

  // Accounting & Financial
  getShippingRates(carrier?: string): Promise<any[]>;
  createShippingRate(rate: any): Promise<any>;
  
  getDiscountCodes(active?: boolean): Promise<any[]>;
  getDiscountCode(code: string): Promise<any | undefined>;
  createDiscountCode(discount: any): Promise<any>;
  validateDiscountCode(code: string, orderTotal: number): Promise<{ valid: boolean; discount: number }>;
  
  getPromotionCampaigns(): Promise<any[]>;
  createPromotionCampaign(campaign: any): Promise<any>;
  
  getFinancialRecords(orderId?: string): Promise<any[]>;
  createFinancialRecord(record: any): Promise<any>;
  getFinancialSummary(startDate?: Date, endDate?: Date): Promise<any>;

  // Newsletter System
  getNewsletters(): Promise<Newsletter[]>;
  getNewsletter(id: number): Promise<Newsletter | undefined>;
  createNewsletter(newsletter: InsertNewsletter): Promise<Newsletter>;
  updateNewsletter(id: number, updates: Partial<InsertNewsletter>): Promise<Newsletter | undefined>;
  deleteNewsletter(id: number): Promise<boolean>;

  getNewsletterSubscribers(category?: string): Promise<NewsletterSubscriber[]>;
  subscribeToNewsletter(subscriber: InsertNewsletterSubscriber): Promise<NewsletterSubscriber>;
  unsubscribeFromNewsletter(email: string): Promise<boolean>;

  trackNewsletterEvent(event: InsertNewsletterEvent): Promise<NewsletterEvent>;
  getNewsletterStats(newsletterId: number): Promise<any>;

  // Blog Posts
  getBlogPosts(publishedOnly?: boolean): Promise<BlogPost[]>;
  getBlogPost(id: number): Promise<BlogPost | undefined>;
  getBlogPostBySlug(slug: string): Promise<BlogPost | undefined>;
  createBlogPost(post: InsertBlogPost): Promise<BlogPost>;
  updateBlogPost(id: number, updates: Partial<InsertBlogPost>): Promise<BlogPost | undefined>;
  deleteBlogPost(id: number): Promise<boolean>;
  incrementBlogPostViews(id: number): Promise<void>;

  // AI Chat Sessions
  createAiChatSession(session: InsertAiChatSession): Promise<AiChatSession>;
  getAiChatSession(id: string): Promise<AiChatSession | undefined>;
  getAiChatMessages(sessionId: string): Promise<AiChatMessage[]>;
  createAiChatMessage(message: InsertAiChatMessage): Promise<AiChatMessage>;
  getRelatedProducts(category?: string, limit?: number): Promise<Product[]>;

  // Persistent Carts (Shopify-level)
  getCart(id: string): Promise<Cart | undefined>;
  getCartByUserId(userId: number): Promise<Cart | undefined>;
  getCartBySessionToken(sessionToken: string): Promise<Cart | undefined>;
  createCart(cart: InsertCart): Promise<Cart>;
  updateCart(id: string, updates: Partial<InsertCart>): Promise<Cart | undefined>;
  deleteCart(id: string): Promise<boolean>;
  mergeGuestCartToUser(sessionToken: string, userId: number): Promise<Cart | undefined>;
  
  // Cart Items
  getCartItems(cartId: string): Promise<CartItemDB[]>;
  addCartItem(item: InsertCartItem): Promise<CartItemDB>;
  updateCartItem(id: number, updates: Partial<InsertCartItem>): Promise<CartItemDB | undefined>;
  removeCartItem(id: number): Promise<boolean>;
  clearCart(cartId: string): Promise<boolean>;
  recalculateCartTotals(cartId: string): Promise<Cart | undefined>;
  
  // Save for Later
  getSavedForLater(userId: number): Promise<SavedForLater[]>;
  saveForLater(item: InsertSavedForLater): Promise<SavedForLater>;
  moveToCart(savedItemId: number, cartId: string): Promise<CartItemDB | undefined>;
  removeSavedItem(id: number): Promise<boolean>;

  // Product Variants
  getProductVariants(productId: string): Promise<ProductVariant[]>;
  getProductVariant(id: string): Promise<ProductVariant | undefined>;
  createProductVariant(variant: InsertProductVariant): Promise<ProductVariant>;
  updateProductVariant(id: string, updates: Partial<InsertProductVariant>): Promise<ProductVariant | undefined>;
  deleteProductVariant(id: string): Promise<boolean>;

  // Order Revisions (for order editing)
  getOrderRevisions(orderId: string): Promise<OrderRevision[]>;
  createOrderRevision(revision: InsertOrderRevision): Promise<OrderRevision>;
  
  // Order Timeline
  getOrderTimeline(orderId: string): Promise<OrderTimelineEvent[]>;
  addOrderTimelineEvent(event: InsertOrderTimelineEvent): Promise<OrderTimelineEvent>;

  // Session Store
  sessionStore: session.Store;
}

export class DatabaseStorage implements IStorage {
  sessionStore: session.Store;

  constructor() {
    this.sessionStore = new PostgresSessionStore({
      pool,
      createTableIfMissing: true,
    });
  }

  // Products
  async getProducts(filters?: ProductFilters): Promise<Product[]> {
    let query = db.select().from(products);
    
    // Build WHERE conditions
    // Always filter to only show published products
    const conditions = [eq(products.isPublished, true)];
    
    if (filters?.category) {
      conditions.push(eq(products.category, filters.category));
    }
    
    if (filters?.minPrice !== undefined) {
      conditions.push(sql`CAST(${products.price} AS NUMERIC) >= ${filters.minPrice}`);
    }
    
    if (filters?.maxPrice !== undefined) {
      conditions.push(sql`CAST(${products.price} AS NUMERIC) <= ${filters.maxPrice}`);
    }
    
    if (filters?.search) {
      const searchCondition = or(
        ilike(products.name, `%${filters.search}%`),
        ilike(products.description, `%${filters.search}%`)
      );
      if (searchCondition) {
        conditions.push(searchCondition);
      }
    }
    
    // Apply filters if any
    if (conditions.length > 0) {
      query = query.where(and(...conditions)) as any;
    }
    
    const allProducts = await query;
    
    // If minRating filter is specified, we need to calculate ratings from reviews
    if (filters?.minRating !== undefined && filters.minRating > 0) {
      const productIds = allProducts.map(p => p.id);
      
      if (productIds.length === 0) {
        return [];
      }
      
      // Get average ratings for products that have reviews
      // Use inArray() for proper Drizzle parameter binding
      const ratingsQuery = await db
        .select({
          productId: reviews.productId,
          avgRating: sql<number>`avg(${reviews.rating})::float`,
        })
        .from(reviews)
        .where(inArray(reviews.productId, productIds))
        .groupBy(reviews.productId);
      
      const ratingsMap = new Map(
        ratingsQuery.map(r => [r.productId, r.avgRating])
      );
      
      // Filter products by minimum rating
      // Products without reviews are excluded (cannot meet minRating requirement)
      return allProducts.filter(p => {
        const rating = ratingsMap.get(p.id);
        return rating !== undefined && rating >= filters.minRating!;
      });
    }
    
    return allProducts;
  }

  async getProduct(id: string): Promise<Product | undefined> {
    const [product] = await db.select().from(products).where(eq(products.id, id));
    return product || undefined;
  }

  async createProduct(insertProduct: InsertProduct): Promise<Product> {
    const [product] = await db
      .insert(products)
      .values(insertProduct)
      .returning();
    return product;
  }

  async updateProduct(id: string, updates: Partial<InsertProduct>): Promise<Product | undefined> {
    const [product] = await db
      .update(products)
      .set(updates)
      .where(eq(products.id, id))
      .returning();
    return product || undefined;
  }

  async deleteProduct(id: string): Promise<boolean> {
    const result = await db.delete(products).where(eq(products.id, id));
    return result.rowCount ? result.rowCount > 0 : false;
  }

  async incrementProductViews(id: string): Promise<void> {
    await db
      .update(products)
      .set({ views: sql`${products.views} + 1` })
      .where(eq(products.id, id));
  }

  async bulkArchiveProducts(productIds: string[]): Promise<number> {
    if (productIds.length === 0) return 0;
    const result = await db
      .update(products)
      .set({ isPublished: false })
      .where(inArray(products.id, productIds));
    return result.rowCount || 0;
  }

  async bulkUnarchiveProducts(productIds: string[]): Promise<number> {
    if (productIds.length === 0) return 0;
    const result = await db
      .update(products)
      .set({ isPublished: true })
      .where(inArray(products.id, productIds));
    return result.rowCount || 0;
  }

  async getArchivedProducts(): Promise<Product[]> {
    return db.select().from(products).where(eq(products.isPublished, false));
  }

  async restoreArchivedProducts(): Promise<number> {
    const result = await db
      .update(products)
      .set({ isPublished: true })
      .where(eq(products.isPublished, false));
    return result.rowCount || 0;
  }

  // Orders
  async getOrders(): Promise<Order[]> {
    return db.select().from(orders).orderBy(desc(orders.createdAt));
  }

  async getOrdersByUserId(userId: number): Promise<Order[]> {
    return db.select().from(orders).where(eq(orders.userId, userId)).orderBy(desc(orders.createdAt));
  }

  async getOrder(id: string): Promise<Order | undefined> {
    const [order] = await db.select().from(orders).where(eq(orders.id, id));
    return order || undefined;
  }

  async createOrder(insertOrder: InsertOrder): Promise<Order> {
    const [order] = await db
      .insert(orders)
      .values(insertOrder)
      .returning();
    return order;
  }

  async updateOrder(id: string, updates: Partial<Order>): Promise<Order | undefined> {
    const [order] = await db
      .update(orders)
      .set(updates)
      .where(eq(orders.id, id))
      .returning();
    return order || undefined;
  }

  // Order Items
  async getOrderItems(orderId: string): Promise<OrderItem[]> {
    return db.select().from(orderItems).where(eq(orderItems.orderId, orderId));
  }

  async createOrderItem(insertItem: InsertOrderItem): Promise<OrderItem> {
    const [item] = await db
      .insert(orderItems)
      .values(insertItem)
      .returning();

    // Update product sales and stock
    await db
      .update(products)
      .set({
        sales: sql`${products.sales} + ${insertItem.quantity}`,
        stock: sql`GREATEST(0, ${products.stock} - ${insertItem.quantity})`,
      })
      .where(eq(products.id, insertItem.productId));

    return item;
  }

  // Analytics
  async getAnalytics(): Promise<AnalyticsData> {
    const allProducts = await db.select().from(products);
    const allOrders = await db.select().from(orders);

    const totalRevenue = allOrders.reduce((sum, order) => {
      return sum + parseFloat(order.total.toString());
    }, 0);

    const totalOrders = allOrders.length;
    const totalViews = allProducts.reduce((sum, p) => sum + p.views, 0);
    const totalSales = allProducts.reduce((sum, p) => sum + p.sales, 0);
    const conversionRate = totalViews > 0 ? (totalSales / totalViews) * 100 : 0;

    const topProducts = allProducts
      .filter((p) => p.sales > 0 || p.views > 0)
      .map((p) => ({
        id: p.id,
        name: p.name,
        sales: p.sales,
        revenue: p.sales * parseFloat(p.price.toString()),
        views: p.views,
        conversionRate: p.views > 0 ? (p.sales / p.views) * 100 : 0,
      }))
      .sort((a, b) => b.revenue - a.revenue);

    return {
      totalRevenue,
      totalOrders,
      totalViews,
      conversionRate,
      topProducts,
    };
  }

  // Site Settings
  async getSiteSettings(): Promise<SiteSettings> {
    const [settings] = await db.select().from(siteSettings).limit(1);
    
    // If no settings exist, create default settings
    if (!settings) {
      const [newSettings] = await db
        .insert(siteSettings)
        .values({})
        .returning();
      return newSettings;
    }
    
    return settings;
  }

  async updateSiteSettings(updates: Partial<InsertSiteSettings>): Promise<SiteSettings> {
    // Get existing settings to merge with updates
    const existingSettings = await this.getSiteSettings();
    
    // Remove undefined values from updates to prevent NULL clobbering
    const cleanedUpdates = Object.fromEntries(
      Object.entries(updates).filter(([_, value]) => value !== undefined)
    );
    
    // Merge with existing settings to ensure all fields have values
    const { id, updatedAt, ...existingData } = existingSettings;
    const mergedData = { ...existingData, ...cleanedUpdates };
    
    const [updated] = await db
      .update(siteSettings)
      .set({ ...mergedData, updatedAt: sql`now()` })
      .where(eq(siteSettings.id, existingSettings.id))
      .returning();
    
    return updated;
  }

  // Users
  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  // Customer Addresses
  async getCustomerAddresses(userId: number): Promise<CustomerAddress[]> {
    return db.select().from(customerAddresses).where(eq(customerAddresses.userId, userId));
  }

  async getCustomerAddress(id: number): Promise<CustomerAddress | undefined> {
    const [address] = await db.select().from(customerAddresses).where(eq(customerAddresses.id, id));
    return address || undefined;
  }

  async createCustomerAddress(insertAddress: InsertCustomerAddress): Promise<CustomerAddress> {
    const [address] = await db
      .insert(customerAddresses)
      .values(insertAddress)
      .returning();
    return address;
  }

  async updateCustomerAddress(id: number, updates: Partial<InsertCustomerAddress>): Promise<CustomerAddress | undefined> {
    const [address] = await db
      .update(customerAddresses)
      .set({ ...updates, updatedAt: sql`now()` })
      .where(eq(customerAddresses.id, id))
      .returning();
    return address || undefined;
  }

  async deleteCustomerAddress(id: number): Promise<boolean> {
    const result = await db.delete(customerAddresses).where(eq(customerAddresses.id, id));
    return result.rowCount ? result.rowCount > 0 : false;
  }

  async setDefaultAddress(userId: number, addressId: number): Promise<void> {
    // First, unset all default addresses for this user
    await db
      .update(customerAddresses)
      .set({ isDefault: false })
      .where(eq(customerAddresses.userId, userId));

    // Then, set the selected address as default
    await db
      .update(customerAddresses)
      .set({ isDefault: true, updatedAt: sql`now()` })
      .where(eq(customerAddresses.id, addressId));
  }

  // Reviews
  async getProductReviews(productId: string): Promise<Review[]> {
    return db
      .select()
      .from(reviews)
      .where(eq(reviews.productId, productId))
      .orderBy(desc(reviews.createdAt));
  }

  async getUserProductReview(productId: string, userId: number): Promise<Review | undefined> {
    const [review] = await db
      .select()
      .from(reviews)
      .where(and(
        eq(reviews.productId, productId),
        eq(reviews.userId, userId)
      ));
    return review || undefined;
  }

  async createReview(review: InsertReview): Promise<Review> {
    const [created] = await db
      .insert(reviews)
      .values(review)
      .returning();
    return created;
  }

  async incrementHelpfulCount(reviewId: number): Promise<void> {
    await db
      .update(reviews)
      .set({ helpfulCount: sql`${reviews.helpfulCount} + 1`, updatedAt: sql`now()` })
      .where(eq(reviews.id, reviewId));
  }

  async hasUserPurchasedProduct(productId: string, userId: number): Promise<boolean> {
    const [result] = await db
      .select({ count: sql<number>`count(*)` })
      .from(orderItems)
      .innerJoin(orders, eq(orderItems.orderId, orders.id))
      .where(and(
        eq(orderItems.productId, productId),
        eq(orders.userId, userId),
        eq(orders.status, "completed")
      ));
    
    return result ? result.count > 0 : false;
  }

  // Loyalty Program
  async getLoyaltyAccount(userId: number): Promise<LoyaltyAccount | undefined> {
    const [account] = await db
      .select()
      .from(loyaltyAccounts)
      .where(eq(loyaltyAccounts.userId, userId));
    return account || undefined;
  }

  async createLoyaltyAccount(account: InsertLoyaltyAccount): Promise<LoyaltyAccount> {
    const [created] = await db
      .insert(loyaltyAccounts)
      .values(account)
      .returning();
    return created;
  }

  async updateLoyaltyAccount(userId: number, updates: Partial<InsertLoyaltyAccount>): Promise<LoyaltyAccount | undefined> {
    const [account] = await db
      .update(loyaltyAccounts)
      .set({ ...updates, updatedAt: sql`now()` })
      .where(eq(loyaltyAccounts.userId, userId))
      .returning();
    return account || undefined;
  }

  async addLoyaltyPoints(userId: number, points: number, type: string, description?: string): Promise<LoyaltyTransaction> {
    // Ensure loyalty account exists
    let loyaltyAccount = await this.getLoyaltyAccount(userId);
    if (!loyaltyAccount) {
      loyaltyAccount = await this.createLoyaltyAccount({ userId, totalPoints: 0, tier: "bronze" });
    }

    // Add points to account
    const newTotal = (loyaltyAccount.totalPoints || 0) + points;
    
    // Update tier based on points
    let tier = "bronze";
    if (newTotal >= 5000) tier = "platinum";
    else if (newTotal >= 2500) tier = "gold";
    else if (newTotal >= 1000) tier = "silver";

    await this.updateLoyaltyAccount(userId, { totalPoints: newTotal, tier });

    // Create transaction record
    const [transaction] = await db
      .insert(loyaltyTransactions)
      .values({
        userId,
        pointsEarned: points,
        type,
        description,
      })
      .returning();
    return transaction;
  }

  async redeemLoyaltyPoints(userId: number, points: number, description?: string): Promise<LoyaltyTransaction> {
    const loyaltyAccount = await this.getLoyaltyAccount(userId);
    if (!loyaltyAccount) {
      throw new Error("Loyalty account not found");
    }

    const newTotal = Math.max(0, (loyaltyAccount.totalPoints || 0) - points);
    await this.updateLoyaltyAccount(userId, {
      totalPoints: newTotal,
      redeemedPoints: (loyaltyAccount.redeemedPoints || 0) + points,
    });

    const [transaction] = await db
      .insert(loyaltyTransactions)
      .values({
        userId,
        pointsRedeemed: points,
        type: "redemption",
        description,
      })
      .returning();
    return transaction;
  }

  async getLoyaltyTransactions(userId: number): Promise<LoyaltyTransaction[]> {
    return db
      .select()
      .from(loyaltyTransactions)
      .where(eq(loyaltyTransactions.userId, userId))
      .orderBy(desc(loyaltyTransactions.createdAt));
  }

  // Email Automation
  async getEmailSequences(): Promise<EmailSequence[]> {
    return db.select().from(emailSequences);
  }

  async getEmailSequence(id: number): Promise<EmailSequence | undefined> {
    const [sequence] = await db
      .select()
      .from(emailSequences)
      .where(eq(emailSequences.id, id));
    return sequence || undefined;
  }

  async createEmailSequence(sequence: InsertEmailSequence): Promise<EmailSequence> {
    const [created] = await db
      .insert(emailSequences)
      .values(sequence)
      .returning();
    return created;
  }

  async updateEmailSequence(id: number, updates: Partial<InsertEmailSequence>): Promise<EmailSequence | undefined> {
    const [sequence] = await db
      .update(emailSequences)
      .set(updates)
      .where(eq(emailSequences.id, id))
      .returning();
    return sequence || undefined;
  }

  async getEmailTemplates(sequenceId: number): Promise<EmailTemplate[]> {
    return db
      .select()
      .from(emailTemplates)
      .where(eq(emailTemplates.sequenceId, sequenceId))
      .orderBy(emailTemplates.stepNumber);
  }

  async createEmailTemplate(template: InsertEmailTemplate): Promise<EmailTemplate> {
    const [created] = await db
      .insert(emailTemplates)
      .values(template)
      .returning();
    return created;
  }

  async updateEmailTemplate(id: number, updates: Partial<InsertEmailTemplate>): Promise<EmailTemplate | undefined> {
    const [template] = await db
      .update(emailTemplates)
      .set(updates)
      .where(eq(emailTemplates.id, id))
      .returning();
    return template || undefined;
  }

  async trackEmailEvent(event: InsertCustomerEmailEvent): Promise<CustomerEmailEvent> {
    const [created] = await db
      .insert(customerEmailEvents)
      .values(event)
      .returning();
    return created;
  }

  async updateEmailEventStatus(eventId: number, status: string): Promise<CustomerEmailEvent | undefined> {
    const [event] = await db
      .update(customerEmailEvents)
      .set({ status })
      .where(eq(customerEmailEvents.id, eventId))
      .returning();
    return event || undefined;
  }

  // Abandoned Carts
  async createAbandonedCart(cart: InsertAbandonedCart): Promise<AbandonedCart> {
    const [created] = await db
      .insert(abandonedCarts)
      .values(cart)
      .returning();
    return created;
  }

  async getAbandonedCarts(): Promise<AbandonedCart[]> {
    return db
      .select()
      .from(abandonedCarts)
      .where(eq(abandonedCarts.status, "abandoned"))
      .orderBy(desc(abandonedCarts.createdAt));
  }

  async getAbandonedCartByCode(code: string): Promise<AbandonedCart | undefined> {
    const [cart] = await db
      .select()
      .from(abandonedCarts)
      .where(eq(abandonedCarts.recoveryCode, code));
    return cart || undefined;
  }

  async updateAbandonedCartStatus(id: number, status: string): Promise<AbandonedCart | undefined> {
    const [cart] = await db
      .update(abandonedCarts)
      .set({ status, updatedAt: sql`now()` })
      .where(eq(abandonedCarts.id, id))
      .returning();
    return cart || undefined;
  }

  async markCartRecovered(cartId: number, orderId: string): Promise<AbandonedCart | undefined> {
    const [cart] = await db
      .update(abandonedCarts)
      .set({ status: "converted", convertedOrderId: orderId, updatedAt: sql`now()` })
      .where(eq(abandonedCarts.id, cartId))
      .returning();
    return cart || undefined;
  }

  // Accounting: Shipping Rates
  async getShippingRates(carrier?: string): Promise<ShippingRate[]> {
    if (carrier) {
      return db.select().from(shippingRates).where(eq(shippingRates.carrier, carrier));
    }
    return db.select().from(shippingRates).where(eq(shippingRates.isActive, true));
  }

  async createShippingRate(rate: InsertShippingRate): Promise<ShippingRate> {
    const [created] = await db.insert(shippingRates).values(rate).returning();
    return created;
  }

  // Accounting: Discount Codes
  async getDiscountCodes(active = true): Promise<DiscountCode[]> {
    if (active) {
      return db.select().from(discountCodes).where(eq(discountCodes.isActive, true));
    }
    return db.select().from(discountCodes);
  }

  async getDiscountCode(code: string): Promise<DiscountCode | undefined> {
    const [discount] = await db
      .select()
      .from(discountCodes)
      .where(eq(discountCodes.code, code));
    return discount || undefined;
  }

  async createDiscountCode(discount: InsertDiscountCode): Promise<DiscountCode> {
    const [created] = await db.insert(discountCodes).values(discount).returning();
    return created;
  }

  async validateDiscountCode(code: string, orderTotal: number): Promise<{ valid: boolean; discount: number }> {
    const discount = await this.getDiscountCode(code);
    
    if (!discount || !discount.isActive) {
      return { valid: false, discount: 0 };
    }

    if (discount.validUntil && new Date(discount.validUntil) < new Date()) {
      return { valid: false, discount: 0 };
    }

    if (discount.maxUses && discount.currentUses >= discount.maxUses) {
      return { valid: false, discount: 0 };
    }

    if (discount.minOrderAmount && orderTotal < parseFloat(discount.minOrderAmount.toString())) {
      return { valid: false, discount: 0 };
    }

    let discountAmount = 0;
    if (discount.type === "percentage") {
      discountAmount = (orderTotal * parseFloat(discount.value.toString())) / 100;
    } else if (discount.type === "fixed") {
      discountAmount = parseFloat(discount.value.toString());
    } else if (discount.type === "free_shipping") {
      discountAmount = parseFloat(discount.value.toString());
    }

    return { valid: true, discount: discountAmount };
  }

  // Accounting: Promotion Campaigns
  async getPromotionCampaigns(): Promise<PromotionCampaign[]> {
    return db.select().from(promotionCampaigns).where(eq(promotionCampaigns.isActive, true));
  }

  async createPromotionCampaign(campaign: InsertPromotionCampaign): Promise<PromotionCampaign> {
    const [created] = await db.insert(promotionCampaigns).values(campaign).returning();
    return created;
  }

  // Accounting: Financial Records
  async getFinancialRecords(orderId?: string): Promise<FinancialRecord[]> {
    if (orderId) {
      return db.select().from(financialRecords).where(eq(financialRecords.orderId, orderId));
    }
    return db.select().from(financialRecords).orderBy(desc(financialRecords.createdAt));
  }

  async createFinancialRecord(record: InsertFinancialRecord): Promise<FinancialRecord> {
    const [created] = await db.insert(financialRecords).values(record).returning();
    return created;
  }

  async getFinancialSummary(startDate?: Date, endDate?: Date): Promise<any> {
    let query = db.select({
      totalRevenue: sql`SUM(revenue)`,
      totalCost: sql`SUM(cost)`,
      totalShipping: sql`SUM(shipping_cost)`,
      totalDiscount: sql`SUM(discount_amount)`,
      totalProfit: sql`SUM(profit)`,
      averageProfitMargin: sql`AVG(profit_margin)`,
      transactionCount: sql`COUNT(*)`,
    }).from(financialRecords);

    if (startDate && endDate) {
      query = query.where(
        and(
          gte(financialRecords.createdAt, startDate),
          lte(financialRecords.createdAt, endDate)
        )
      ) as any;
    }

    const [result] = await query;
    return result || { totalRevenue: 0, totalCost: 0, totalProfit: 0 };
  }

  // Newsletter System
  async getNewsletters(): Promise<Newsletter[]> {
    return db.select().from(newsletters).orderBy(desc(newsletters.createdAt));
  }

  async getNewsletter(id: number): Promise<Newsletter | undefined> {
    const [newsletter] = await db.select().from(newsletters).where(eq(newsletters.id, id));
    return newsletter || undefined;
  }

  async createNewsletter(insertData: InsertNewsletter): Promise<Newsletter> {
    const [newsletter] = await db.insert(newsletters).values(insertData).returning();
    return newsletter;
  }

  async updateNewsletter(id: number, updates: Partial<InsertNewsletter>): Promise<Newsletter | undefined> {
    const [newsletter] = await db
      .update(newsletters)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(newsletters.id, id))
      .returning();
    return newsletter || undefined;
  }

  async deleteNewsletter(id: number): Promise<boolean> {
    const result = await db.delete(newsletters).where(eq(newsletters.id, id));
    return result.rowCount ? result.rowCount > 0 : false;
  }

  async getNewsletterSubscribers(category?: string): Promise<NewsletterSubscriber[]> {
    let query = db.select().from(newsletterSubscribers).where(eq(newsletterSubscribers.isSubscribed, true));
    if (category) {
      query = query.where(eq(newsletterSubscribers.category, category)) as any;
    }
    return query;
  }

  async subscribeToNewsletter(subscriber: InsertNewsletterSubscriber): Promise<NewsletterSubscriber> {
    const [result] = await db.insert(newsletterSubscribers).values(subscriber).onConflictDoUpdate({
      target: newsletterSubscribers.email,
      set: { isSubscribed: true, unsubscribeDate: null },
    }).returning();
    return result;
  }

  async unsubscribeFromNewsletter(email: string): Promise<boolean> {
    const result = await db
      .update(newsletterSubscribers)
      .set({ isSubscribed: false, unsubscribeDate: new Date() })
      .where(eq(newsletterSubscribers.email, email));
    return result.rowCount ? result.rowCount > 0 : false;
  }

  async trackNewsletterEvent(eventData: InsertNewsletterEvent): Promise<NewsletterEvent> {
    const [event] = await db.insert(newsletterEvents).values(eventData).returning();
    return event;
  }

  async getNewsletterStats(newsletterId: number): Promise<any> {
    const events = await db.select().from(newsletterEvents).where(eq(newsletterEvents.newsletterId, newsletterId));
    const sent = events.filter(e => e.eventType === "sent").length;
    const opened = events.filter(e => e.eventType === "opened").length;
    const clicked = events.filter(e => e.eventType === "clicked").length;

    return {
      sent,
      opened,
      clicked,
      openRate: sent > 0 ? ((opened / sent) * 100).toFixed(2) : 0,
      clickRate: sent > 0 ? ((clicked / sent) * 100).toFixed(2) : 0,
    };
  }

  // Blog Posts
  async getBlogPosts(publishedOnly = true): Promise<BlogPost[]> {
    if (publishedOnly) {
      return db.select().from(blogPosts).where(eq(blogPosts.isPublished, true)).orderBy(desc(blogPosts.publishedAt));
    }
    return db.select().from(blogPosts).orderBy(desc(blogPosts.createdAt));
  }

  async getBlogPost(id: number): Promise<BlogPost | undefined> {
    const [post] = await db.select().from(blogPosts).where(eq(blogPosts.id, id));
    return post || undefined;
  }

  async getBlogPostBySlug(slug: string): Promise<BlogPost | undefined> {
    const [post] = await db.select().from(blogPosts).where(eq(blogPosts.slug, slug));
    return post || undefined;
  }

  async createBlogPost(post: InsertBlogPost): Promise<BlogPost> {
    const [newPost] = await db.insert(blogPosts).values(post).returning();
    return newPost;
  }

  async updateBlogPost(id: number, updates: Partial<InsertBlogPost>): Promise<BlogPost | undefined> {
    const [updatedPost] = await db
      .update(blogPosts)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(blogPosts.id, id))
      .returning();
    return updatedPost || undefined;
  }

  async deleteBlogPost(id: number): Promise<boolean> {
    const result = await db.delete(blogPosts).where(eq(blogPosts.id, id));
    return result.rowCount ? result.rowCount > 0 : false;
  }

  async incrementBlogPostViews(id: number): Promise<void> {
    await db
      .update(blogPosts)
      .set({ views: sql`${blogPosts.views} + 1` })
      .where(eq(blogPosts.id, id));
  }

  // AI Chat Sessions
  async createAiChatSession(session: InsertAiChatSession): Promise<AiChatSession> {
    const [newSession] = await db.insert(aiChatSessions).values(session).returning();
    return newSession;
  }

  async getAiChatSession(id: string): Promise<AiChatSession | undefined> {
    const [session] = await db.select().from(aiChatSessions).where(eq(aiChatSessions.id, id));
    return session || undefined;
  }

  async getAiChatMessages(sessionId: string): Promise<AiChatMessage[]> {
    return db.select().from(aiChatMessages).where(eq(aiChatMessages.sessionId, sessionId)).orderBy(aiChatMessages.createdAt);
  }

  async createAiChatMessage(message: InsertAiChatMessage): Promise<AiChatMessage> {
    const [newMessage] = await db.insert(aiChatMessages).values(message).returning();
    return newMessage;
  }

  async getRelatedProducts(category?: string, limit: number = 4): Promise<Product[]> {
    let query = db.select().from(products).where(eq(products.isPublished, true));
    
    if (category) {
      query = db.select().from(products).where(and(eq(products.isPublished, true), eq(products.category, category)));
    }
    
    const allProducts = await query;
    const shuffled = allProducts.sort(() => 0.5 - Math.random());
    return shuffled.slice(0, limit);
  }

  // ============================================
  // PERSISTENT CART MANAGEMENT (Shopify-level)
  // ============================================

  async getCart(id: string): Promise<Cart | undefined> {
    const [cart] = await db.select().from(carts).where(eq(carts.id, id));
    return cart || undefined;
  }

  async getCartByUserId(userId: number): Promise<Cart | undefined> {
    const [cart] = await db.select().from(carts)
      .where(and(eq(carts.userId, userId), eq(carts.status, "active")));
    return cart || undefined;
  }

  async getCartBySessionToken(sessionToken: string): Promise<Cart | undefined> {
    const [cart] = await db.select().from(carts)
      .where(and(eq(carts.sessionToken, sessionToken), eq(carts.status, "active")));
    return cart || undefined;
  }

  async createCart(cart: InsertCart): Promise<Cart> {
    const [newCart] = await db.insert(carts).values(cart).returning();
    return newCart;
  }

  async updateCart(id: string, updates: Partial<InsertCart>): Promise<Cart | undefined> {
    const [updatedCart] = await db
      .update(carts)
      .set({ ...updates, updatedAt: new Date(), lastActivityAt: new Date() })
      .where(eq(carts.id, id))
      .returning();
    return updatedCart || undefined;
  }

  async deleteCart(id: string): Promise<boolean> {
    const result = await db.delete(carts).where(eq(carts.id, id));
    return result.rowCount ? result.rowCount > 0 : false;
  }

  async mergeGuestCartToUser(sessionToken: string, userId: number): Promise<Cart | undefined> {
    const guestCart = await this.getCartBySessionToken(sessionToken);
    if (!guestCart) return undefined;

    const userCart = await this.getCartByUserId(userId);
    
    if (userCart) {
      const guestItems = await this.getCartItems(guestCart.id);
      for (const item of guestItems) {
        await this.addCartItem({
          cartId: userCart.id,
          productId: item.productId,
          variantId: item.variantId,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          totalPrice: item.totalPrice,
        });
      }
      await this.deleteCart(guestCart.id);
      return this.recalculateCartTotals(userCart.id);
    } else {
      const [mergedCart] = await db
        .update(carts)
        .set({ userId, sessionToken: null, updatedAt: new Date() })
        .where(eq(carts.id, guestCart.id))
        .returning();
      return mergedCart || undefined;
    }
  }

  // Cart Items
  async getCartItems(cartId: string): Promise<CartItemDB[]> {
    return db.select().from(cartItems).where(eq(cartItems.cartId, cartId));
  }

  async addCartItem(item: InsertCartItem): Promise<CartItemDB> {
    const existingItems = await db.select().from(cartItems)
      .where(and(
        eq(cartItems.cartId, item.cartId),
        eq(cartItems.productId, item.productId)
      ));
    
    if (existingItems.length > 0) {
      const existing = existingItems[0];
      const newQuantity = existing.quantity + (item.quantity || 1);
      const newTotal = String(parseFloat(String(item.unitPrice)) * newQuantity);
      
      const [updated] = await db
        .update(cartItems)
        .set({ quantity: newQuantity, totalPrice: newTotal })
        .where(eq(cartItems.id, existing.id))
        .returning();
      
      await this.recalculateCartTotals(item.cartId);
      return updated;
    }

    const [newItem] = await db.insert(cartItems).values(item).returning();
    await this.recalculateCartTotals(item.cartId);
    return newItem;
  }

  async updateCartItem(id: number, updates: Partial<InsertCartItem>): Promise<CartItemDB | undefined> {
    const [item] = await db.select().from(cartItems).where(eq(cartItems.id, id));
    if (!item) return undefined;

    if (updates.quantity !== undefined && updates.unitPrice) {
      updates.totalPrice = String(parseFloat(String(updates.unitPrice)) * updates.quantity);
    } else if (updates.quantity !== undefined) {
      updates.totalPrice = String(parseFloat(String(item.unitPrice)) * updates.quantity);
    }

    const [updatedItem] = await db
      .update(cartItems)
      .set(updates)
      .where(eq(cartItems.id, id))
      .returning();

    if (updatedItem) {
      await this.recalculateCartTotals(updatedItem.cartId);
    }
    return updatedItem || undefined;
  }

  async removeCartItem(id: number): Promise<boolean> {
    const [item] = await db.select().from(cartItems).where(eq(cartItems.id, id));
    if (!item) return false;

    const result = await db.delete(cartItems).where(eq(cartItems.id, id));
    await this.recalculateCartTotals(item.cartId);
    return result.rowCount ? result.rowCount > 0 : false;
  }

  async clearCart(cartId: string): Promise<boolean> {
    await db.delete(cartItems).where(eq(cartItems.cartId, cartId));
    await this.updateCart(cartId, { subtotal: "0", total: "0", discountAmount: "0" });
    return true;
  }

  async recalculateCartTotals(cartId: string): Promise<Cart | undefined> {
    const items = await this.getCartItems(cartId);
    const subtotal = items.reduce((sum, item) => sum + parseFloat(String(item.totalPrice)), 0);
    
    const cart = await this.getCart(cartId);
    const discountAmount = cart ? parseFloat(String(cart.discountAmount)) : 0;
    const total = Math.max(0, subtotal - discountAmount);

    return this.updateCart(cartId, {
      subtotal: String(subtotal.toFixed(2)),
      total: String(total.toFixed(2)),
    });
  }

  // Save for Later
  async getSavedForLater(userId: number): Promise<SavedForLater[]> {
    return db.select().from(savedForLater).where(eq(savedForLater.userId, userId));
  }

  async saveForLater(item: InsertSavedForLater): Promise<SavedForLater> {
    const [saved] = await db.insert(savedForLater).values(item).returning();
    return saved;
  }

  async moveToCart(savedItemId: number, cartId: string): Promise<CartItemDB | undefined> {
    const [saved] = await db.select().from(savedForLater).where(eq(savedForLater.id, savedItemId));
    if (!saved) return undefined;

    const [product] = await db.select().from(products).where(eq(products.id, saved.productId));
    if (!product) return undefined;

    const cartItem = await this.addCartItem({
      cartId,
      productId: saved.productId,
      variantId: saved.variantId,
      quantity: 1,
      unitPrice: product.price,
      totalPrice: product.price,
    });

    await this.removeSavedItem(savedItemId);
    return cartItem;
  }

  async removeSavedItem(id: number): Promise<boolean> {
    const result = await db.delete(savedForLater).where(eq(savedForLater.id, id));
    return result.rowCount ? result.rowCount > 0 : false;
  }

  // Product Variants
  async getProductVariants(productId: string): Promise<ProductVariant[]> {
    return db.select().from(productVariants).where(eq(productVariants.productId, productId));
  }

  async getProductVariant(id: string): Promise<ProductVariant | undefined> {
    const [variant] = await db.select().from(productVariants).where(eq(productVariants.id, id));
    return variant || undefined;
  }

  async createProductVariant(variant: InsertProductVariant): Promise<ProductVariant> {
    const [newVariant] = await db.insert(productVariants).values(variant).returning();
    return newVariant;
  }

  async updateProductVariant(id: string, updates: Partial<InsertProductVariant>): Promise<ProductVariant | undefined> {
    const [updatedVariant] = await db
      .update(productVariants)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(productVariants.id, id))
      .returning();
    return updatedVariant || undefined;
  }

  async deleteProductVariant(id: string): Promise<boolean> {
    const result = await db.delete(productVariants).where(eq(productVariants.id, id));
    return result.rowCount ? result.rowCount > 0 : false;
  }

  // Order Revisions
  async getOrderRevisions(orderId: string): Promise<OrderRevision[]> {
    return db.select().from(orderRevisions).where(eq(orderRevisions.orderId, orderId)).orderBy(desc(orderRevisions.createdAt));
  }

  async createOrderRevision(revision: InsertOrderRevision): Promise<OrderRevision> {
    const [newRevision] = await db.insert(orderRevisions).values(revision).returning();
    return newRevision;
  }

  // Order Timeline
  async getOrderTimeline(orderId: string): Promise<OrderTimelineEvent[]> {
    return db.select().from(orderTimeline).where(eq(orderTimeline.orderId, orderId)).orderBy(orderTimeline.createdAt);
  }

  async addOrderTimelineEvent(event: InsertOrderTimelineEvent): Promise<OrderTimelineEvent> {
    const [newEvent] = await db.insert(orderTimeline).values(event).returning();
    return newEvent;
  }
}

export const storage = new DatabaseStorage();
