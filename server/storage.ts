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
  type TaxRate,
  type InsertTaxRate,
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
  type MarketingSession,
  type InsertMarketingSession,
  type PromoCode,
  type InsertPromoCode,
  type PromoCodeUsage,
  type InsertPromoCodeUsage,
  type CustomerMetrics,
  type InsertCustomerMetrics,
  type PostPurchaseSurvey,
  type InsertPostPurchaseSurvey,
  type MarketingCampaign,
  type InsertMarketingCampaign,
  type Referral,
  type InsertReferral,
  type ReferralCode,
  type InsertReferralCode,
  type DraftOrder,
  type InsertDraftOrder,
  type DraftOrderItem,
  type InsertDraftOrderItem,
  type GiftCard,
  type InsertGiftCard,
  type GiftCardTransaction,
  type InsertGiftCardTransaction,
  type Return,
  type InsertReturn,
  type PasswordResetToken,
  products,
  passwordResetTokens,
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
  taxRates,
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
  marketingSessions,
  promoCodes,
  promoCodeUsages,
  customerMetrics,
  postPurchaseSurveys,
  marketingCampaigns,
  referrals,
  referralCodes,
  draftOrders,
  draftOrderItems,
  giftCards,
  giftCardTransactions,
  returns,
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
  getUserByEmail(email: string): Promise<User | undefined>;
  getUser(id: number): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUserPassword(userId: number, hashedPassword: string): Promise<void>;

  // Password Reset Tokens
  createPasswordResetToken(userId: number, token: string, expiresAt: Date): Promise<PasswordResetToken>;
  getPasswordResetToken(token: string): Promise<PasswordResetToken | undefined>;
  markPasswordResetTokenUsed(token: string): Promise<void>;

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
  deleteReview(reviewId: number): Promise<boolean>;
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

  // Tax Rates
  getTaxRates(): Promise<TaxRate[]>;
  getTaxRateByState(stateCode: string): Promise<TaxRate | undefined>;
  createTaxRate(rate: InsertTaxRate): Promise<TaxRate>;
  updateTaxRate(id: number, updates: Partial<InsertTaxRate>): Promise<TaxRate | undefined>;

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

  // Draft Orders
  getDraftOrders(): Promise<DraftOrder[]>;
  getDraftOrder(id: string): Promise<DraftOrder | undefined>;
  createDraftOrder(order: InsertDraftOrder): Promise<DraftOrder>;
  updateDraftOrder(id: string, updates: Partial<InsertDraftOrder>): Promise<DraftOrder | undefined>;
  deleteDraftOrder(id: string): Promise<boolean>;
  getDraftOrderItems(draftOrderId: string): Promise<DraftOrderItem[]>;
  addDraftOrderItem(item: InsertDraftOrderItem): Promise<DraftOrderItem>;
  updateDraftOrderItem(id: number, updates: Partial<InsertDraftOrderItem>): Promise<DraftOrderItem | undefined>;
  removeDraftOrderItem(id: number): Promise<boolean>;
  convertDraftToOrder(draftOrderId: string): Promise<Order | undefined>;

  // Gift Cards
  getGiftCards(): Promise<GiftCard[]>;
  getGiftCard(id: number): Promise<GiftCard | undefined>;
  getGiftCardByCode(code: string): Promise<GiftCard | undefined>;
  createGiftCard(card: InsertGiftCard): Promise<GiftCard>;
  updateGiftCard(id: number, updates: Partial<InsertGiftCard>): Promise<GiftCard | undefined>;
  useGiftCard(code: string, amount: number, orderId: string): Promise<GiftCardTransaction | undefined>;
  getGiftCardTransactions(giftCardId: number): Promise<GiftCardTransaction[]>;

  // Returns/Refunds
  getReturns(): Promise<Return[]>;
  getReturn(id: number): Promise<Return | undefined>;
  getReturnsByOrder(orderId: string): Promise<Return[]>;
  createReturn(ret: InsertReturn): Promise<Return>;
  updateReturn(id: number, updates: Partial<InsertReturn>): Promise<Return | undefined>;
  processReturn(id: number): Promise<Return | undefined>;

  // Referral Program
  getReferralCode(userId: number): Promise<ReferralCode | undefined>;
  createReferralCode(code: InsertReferralCode): Promise<ReferralCode>;
  getReferralCodeByCode(code: string): Promise<ReferralCode | undefined>;
  createReferral(referral: InsertReferral): Promise<Referral>;
  getReferralsByReferrer(userId: number): Promise<Referral[]>;
  updateReferralStatus(id: string, status: string, orderId?: string, referrerPoints?: number, referredPoints?: number): Promise<Referral | undefined>;
  incrementReferralCodeUsage(code: string, points: number): Promise<void>;

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

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || undefined;
  }

  async updateUserPassword(userId: number, hashedPassword: string): Promise<void> {
    await db.update(users).set({ password: hashedPassword }).where(eq(users.id, userId));
  }

  // Password Reset Tokens
  async createPasswordResetToken(userId: number, token: string, expiresAt: Date): Promise<PasswordResetToken> {
    const [resetToken] = await db
      .insert(passwordResetTokens)
      .values({ userId, token, expiresAt, used: false })
      .returning();
    return resetToken;
  }

  async getPasswordResetToken(token: string): Promise<PasswordResetToken | undefined> {
    const [resetToken] = await db.select().from(passwordResetTokens).where(eq(passwordResetTokens.token, token));
    return resetToken || undefined;
  }

  async markPasswordResetTokenUsed(token: string): Promise<void> {
    await db.update(passwordResetTokens).set({ used: true }).where(eq(passwordResetTokens.token, token));
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

  async deleteReview(reviewId: number): Promise<boolean> {
    const existing = await db.select().from(reviews).where(eq(reviews.id, reviewId)).limit(1);
    if (!existing.length) {
      return false;
    }
    await db.delete(reviews).where(eq(reviews.id, reviewId));
    return true;
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

  // Tax Rates
  async getTaxRates(): Promise<TaxRate[]> {
    return db.select().from(taxRates).where(eq(taxRates.isActive, true));
  }

  async getTaxRateByState(stateCode: string): Promise<TaxRate | undefined> {
    const [rate] = await db
      .select()
      .from(taxRates)
      .where(and(eq(taxRates.stateCode, stateCode.toUpperCase()), eq(taxRates.isActive, true)));
    return rate || undefined;
  }

  async createTaxRate(rate: InsertTaxRate): Promise<TaxRate> {
    const [created] = await db.insert(taxRates).values(rate).returning();
    return created;
  }

  async updateTaxRate(id: number, updates: Partial<InsertTaxRate>): Promise<TaxRate | undefined> {
    const [updated] = await db
      .update(taxRates)
      .set({ ...updates, updatedAt: sql`now()` })
      .where(eq(taxRates.id, id))
      .returning();
    return updated || undefined;
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
    if (category) {
      return db.select().from(newsletterSubscribers).where(
        and(
          eq(newsletterSubscribers.isSubscribed, true),
          eq(newsletterSubscribers.category, category)
        )
      );
    }
    return db.select().from(newsletterSubscribers).where(eq(newsletterSubscribers.isSubscribed, true));
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

  // ============================================
  // MARKETING ATTRIBUTION & ROI OPTIMIZATION
  // ============================================

  // Marketing Sessions (UTM tracking)
  async createMarketingSession(session: InsertMarketingSession): Promise<MarketingSession> {
    const [newSession] = await db.insert(marketingSessions).values(session).returning();
    return newSession;
  }

  async getMarketingSession(visitorId: string): Promise<MarketingSession | undefined> {
    const [session] = await db.select().from(marketingSessions).where(eq(marketingSessions.visitorId, visitorId));
    return session;
  }

  async updateMarketingSession(id: string, updates: Partial<InsertMarketingSession>): Promise<MarketingSession | undefined> {
    const [updated] = await db.update(marketingSessions)
      .set({ ...updates, lastSeen: new Date() })
      .where(eq(marketingSessions.id, id))
      .returning();
    return updated;
  }

  async markSessionConverted(visitorId: string, orderId: string, orderTotal: string): Promise<void> {
    await db.update(marketingSessions)
      .set({ 
        convertedToOrder: true, 
        orderId, 
        orderTotal,
        lastSeen: new Date() 
      })
      .where(eq(marketingSessions.visitorId, visitorId));
  }

  async getMarketingAnalytics(): Promise<{
    bySource: { source: string; sessions: number; conversions: number; revenue: number }[];
    byCampaign: { campaign: string; sessions: number; conversions: number; revenue: number }[];
    byMedium: { medium: string; sessions: number; conversions: number; revenue: number }[];
  }> {
    const bySource = await db.execute(sql`
      SELECT 
        COALESCE(utm_source, 'direct') as source,
        COUNT(*) as sessions,
        COUNT(*) FILTER (WHERE converted_to_order = true) as conversions,
        COALESCE(SUM(CASE WHEN converted_to_order = true THEN order_total ELSE 0 END), 0) as revenue
      FROM marketing_sessions
      GROUP BY utm_source
      ORDER BY revenue DESC
    `);

    const byCampaign = await db.execute(sql`
      SELECT 
        COALESCE(utm_campaign, 'none') as campaign,
        COUNT(*) as sessions,
        COUNT(*) FILTER (WHERE converted_to_order = true) as conversions,
        COALESCE(SUM(CASE WHEN converted_to_order = true THEN order_total ELSE 0 END), 0) as revenue
      FROM marketing_sessions
      WHERE utm_campaign IS NOT NULL
      GROUP BY utm_campaign
      ORDER BY revenue DESC
    `);

    const byMedium = await db.execute(sql`
      SELECT 
        COALESCE(utm_medium, 'none') as medium,
        COUNT(*) as sessions,
        COUNT(*) FILTER (WHERE converted_to_order = true) as conversions,
        COALESCE(SUM(CASE WHEN converted_to_order = true THEN order_total ELSE 0 END), 0) as revenue
      FROM marketing_sessions
      GROUP BY utm_medium
      ORDER BY revenue DESC
    `);

    return {
      bySource: bySource.rows as any[],
      byCampaign: byCampaign.rows as any[],
      byMedium: byMedium.rows as any[],
    };
  }

  // Promo Codes
  async getPromoCodes(): Promise<PromoCode[]> {
    return db.select().from(promoCodes).orderBy(desc(promoCodes.createdAt));
  }

  async getPromoCode(id: string): Promise<PromoCode | undefined> {
    const [code] = await db.select().from(promoCodes).where(eq(promoCodes.id, id));
    return code;
  }

  async getPromoCodeByCode(code: string): Promise<PromoCode | undefined> {
    const [promoCode] = await db.select().from(promoCodes)
      .where(and(
        eq(promoCodes.code, code.toUpperCase()),
        eq(promoCodes.isActive, true)
      ));
    return promoCode;
  }

  async createPromoCode(code: InsertPromoCode): Promise<PromoCode> {
    const [newCode] = await db.insert(promoCodes).values({
      ...code,
      code: code.code.toUpperCase(),
    }).returning();
    return newCode;
  }

  async updatePromoCode(id: string, updates: Partial<InsertPromoCode>): Promise<PromoCode | undefined> {
    const [updated] = await db.update(promoCodes)
      .set(updates)
      .where(eq(promoCodes.id, id))
      .returning();
    return updated;
  }

  async applyPromoCode(codeString: string, orderTotal: number, userId?: number): Promise<{ 
    valid: boolean; 
    discountAmount?: number; 
    promoCode?: PromoCode; 
    error?: string 
  }> {
    const code = await this.getPromoCodeByCode(codeString);
    if (!code) return { valid: false, error: 'Invalid promo code' };

    // Check expiration
    if (code.expiresAt && new Date(code.expiresAt) < new Date()) {
      return { valid: false, error: 'Promo code has expired' };
    }

    // Check start date
    if (code.startsAt && new Date(code.startsAt) > new Date()) {
      return { valid: false, error: 'Promo code is not yet active' };
    }

    // Check max uses
    if (code.maxUses !== null && code.usedCount >= code.maxUses) {
      return { valid: false, error: 'Promo code usage limit reached' };
    }

    // Check minimum order
    if (code.minimumOrder && orderTotal < parseFloat(code.minimumOrder)) {
      return { valid: false, error: `Minimum order of $${code.minimumOrder} required` };
    }

    // Calculate discount
    let discountAmount = 0;
    if (code.discountType === 'percentage') {
      discountAmount = (orderTotal * parseFloat(code.discountValue)) / 100;
    } else {
      discountAmount = Math.min(parseFloat(code.discountValue), orderTotal);
    }

    return { valid: true, discountAmount, promoCode: code };
  }

  async recordPromoCodeUsage(usage: InsertPromoCodeUsage): Promise<PromoCodeUsage> {
    const [recorded] = await db.insert(promoCodeUsages).values(usage).returning();
    
    // Update promo code stats
    await db.update(promoCodes)
      .set({
        usedCount: sql`${promoCodes.usedCount} + 1`,
        totalRevenue: sql`${promoCodes.totalRevenue} + ${usage.orderTotal}`,
        totalDiscount: sql`${promoCodes.totalDiscount} + ${usage.discountAmount}`,
      })
      .where(eq(promoCodes.id, usage.promoCodeId));
    
    return recorded;
  }

  // Customer Metrics (CLV)
  async getCustomerMetrics(userId: number): Promise<CustomerMetrics | undefined> {
    const [metrics] = await db.select().from(customerMetrics).where(eq(customerMetrics.userId, userId));
    return metrics;
  }

  async updateCustomerMetrics(userId: number, orderTotal: number, acquisitionSource?: string, acquisitionCampaign?: string): Promise<CustomerMetrics> {
    const existing = await this.getCustomerMetrics(userId);
    
    if (existing) {
      // Update existing metrics
      const newTotalOrders = existing.totalOrders + 1;
      const newTotalSpent = parseFloat(existing.totalSpent) + orderTotal;
      const newAvgOrderValue = newTotalSpent / newTotalOrders;
      
      // Estimate CLV (simple: avg order value * expected orders per year * 3 years)
      const estimatedClv = newAvgOrderValue * 2 * 3;
      
      const [updated] = await db.update(customerMetrics)
        .set({
          totalOrders: newTotalOrders,
          totalSpent: String(newTotalSpent.toFixed(2)),
          averageOrderValue: String(newAvgOrderValue.toFixed(2)),
          lastOrderDate: new Date(),
          estimatedLifetimeValue: String(estimatedClv.toFixed(2)),
          segment: this.calculateCustomerSegment(newTotalOrders, newTotalSpent),
          updatedAt: new Date(),
        })
        .where(eq(customerMetrics.userId, userId))
        .returning();
      return updated;
    } else {
      // Create new metrics record
      const [created] = await db.insert(customerMetrics).values({
        userId,
        totalOrders: 1,
        totalSpent: String(orderTotal.toFixed(2)),
        averageOrderValue: String(orderTotal.toFixed(2)),
        firstOrderDate: new Date(),
        lastOrderDate: new Date(),
        acquisitionSource,
        acquisitionCampaign,
        estimatedLifetimeValue: String((orderTotal * 2 * 3).toFixed(2)),
        segment: 'new',
      }).returning();
      return created;
    }
  }

  private calculateCustomerSegment(totalOrders: number, totalSpent: number): string {
    if (totalSpent >= 500 || totalOrders >= 10) return 'vip';
    if (totalOrders >= 3) return 'active';
    if (totalOrders >= 1) return 'new';
    return 'new';
  }

  async getCustomerSegmentStats(): Promise<{
    segment: string;
    count: number;
    avgLifetimeValue: number;
    totalRevenue: number;
  }[]> {
    const result = await db.execute(sql`
      SELECT 
        segment,
        COUNT(*) as count,
        AVG(estimated_lifetime_value::numeric) as avg_lifetime_value,
        SUM(total_spent::numeric) as total_revenue
      FROM customer_metrics
      GROUP BY segment
      ORDER BY total_revenue DESC
    `);
    return result.rows as any[];
  }

  // Post-Purchase Surveys
  async createPostPurchaseSurvey(survey: InsertPostPurchaseSurvey): Promise<PostPurchaseSurvey> {
    const [created] = await db.insert(postPurchaseSurveys).values(survey).returning();
    return created;
  }

  async getSurveyStats(): Promise<{
    heardAboutUs: { source: string; count: number }[];
    avgSatisfaction: number;
    wouldRecommendPercent: number;
  }> {
    const heardAboutUsResult = await db.execute(sql`
      SELECT 
        COALESCE(heard_about_us, 'unknown') as source,
        COUNT(*) as count
      FROM post_purchase_surveys
      WHERE heard_about_us IS NOT NULL
      GROUP BY heard_about_us
      ORDER BY count DESC
    `);

    const statsResult = await db.execute(sql`
      SELECT 
        AVG(satisfaction_rating) as avg_satisfaction,
        (COUNT(*) FILTER (WHERE would_recommend = true) * 100.0 / NULLIF(COUNT(*), 0)) as would_recommend_percent
      FROM post_purchase_surveys
    `);

    const stats = statsResult.rows[0] as any || {};

    return {
      heardAboutUs: heardAboutUsResult.rows as any[],
      avgSatisfaction: parseFloat(stats.avg_satisfaction) || 0,
      wouldRecommendPercent: parseFloat(stats.would_recommend_percent) || 0,
    };
  }

  // Marketing Campaigns (for ROAS)
  async getMarketingCampaigns(): Promise<MarketingCampaign[]> {
    return db.select().from(marketingCampaigns).orderBy(desc(marketingCampaigns.createdAt));
  }

  async getMarketingCampaign(id: string): Promise<MarketingCampaign | undefined> {
    const [campaign] = await db.select().from(marketingCampaigns).where(eq(marketingCampaigns.id, id));
    return campaign;
  }

  async createMarketingCampaign(campaign: InsertMarketingCampaign): Promise<MarketingCampaign> {
    const [created] = await db.insert(marketingCampaigns).values(campaign).returning();
    return created;
  }

  async updateMarketingCampaign(id: string, updates: Partial<InsertMarketingCampaign>): Promise<MarketingCampaign | undefined> {
    const [updated] = await db.update(marketingCampaigns)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(marketingCampaigns.id, id))
      .returning();
    return updated;
  }

  async updateCampaignMetrics(utmCampaign: string, utmSource: string): Promise<void> {
    // Get revenue from marketing sessions that converted
    const result = await db.execute(sql`
      SELECT 
        COUNT(*) FILTER (WHERE converted_to_order = true) as conversions,
        COALESCE(SUM(CASE WHEN converted_to_order = true THEN order_total ELSE 0 END), 0) as revenue
      FROM marketing_sessions
      WHERE utm_campaign = ${utmCampaign} AND utm_source = ${utmSource}
    `);

    const stats = result.rows[0] as any;
    if (!stats) return;

    // Update the matching campaign
    await db.update(marketingCampaigns)
      .set({
        conversions: parseInt(stats.conversions) || 0,
        revenue: String(parseFloat(stats.revenue) || 0),
        roas: sql`CASE WHEN total_spend > 0 THEN ${stats.revenue}::numeric / total_spend::numeric ELSE 0 END`,
        cpa: sql`CASE WHEN ${stats.conversions}::numeric > 0 THEN total_spend::numeric / ${stats.conversions}::numeric ELSE 0 END`,
        updatedAt: new Date(),
      })
      .where(and(
        eq(marketingCampaigns.utmCampaign, utmCampaign),
        eq(marketingCampaigns.utmSource, utmSource)
      ));
  }

  async getMarketingROIDashboard(): Promise<{
    totalSpend: number;
    totalRevenue: number;
    overallRoas: number;
    totalConversions: number;
    avgCpa: number;
    topCampaigns: MarketingCampaign[];
  }> {
    const summaryResult = await db.execute(sql`
      SELECT 
        COALESCE(SUM(total_spend::numeric), 0) as total_spend,
        COALESCE(SUM(revenue::numeric), 0) as total_revenue,
        COALESCE(SUM(conversions), 0) as total_conversions
      FROM marketing_campaigns
    `);

    const summary = summaryResult.rows[0] as any || {};
    const totalSpend = parseFloat(summary.total_spend) || 0;
    const totalRevenue = parseFloat(summary.total_revenue) || 0;
    const totalConversions = parseInt(summary.total_conversions) || 0;

    const topCampaigns = await db.select()
      .from(marketingCampaigns)
      .orderBy(desc(marketingCampaigns.revenue))
      .limit(5);

    return {
      totalSpend,
      totalRevenue,
      overallRoas: totalSpend > 0 ? totalRevenue / totalSpend : 0,
      totalConversions,
      avgCpa: totalConversions > 0 ? totalSpend / totalConversions : 0,
      topCampaigns,
    };
  }

  // Referral Program
  async getReferralCode(userId: number): Promise<ReferralCode | undefined> {
    const [code] = await db.select().from(referralCodes).where(eq(referralCodes.userId, userId));
    return code;
  }

  async createReferralCode(code: InsertReferralCode): Promise<ReferralCode> {
    const [created] = await db.insert(referralCodes).values(code).returning();
    return created;
  }

  async getReferralCodeByCode(code: string): Promise<ReferralCode | undefined> {
    const [result] = await db.select().from(referralCodes).where(eq(referralCodes.code, code));
    return result;
  }

  async createReferral(referral: InsertReferral): Promise<Referral> {
    const [created] = await db.insert(referrals).values(referral).returning();
    return created;
  }

  async getReferralsByReferrer(userId: number): Promise<Referral[]> {
    return db.select().from(referrals).where(eq(referrals.referrerId, userId)).orderBy(desc(referrals.createdAt));
  }

  async updateReferralStatus(id: string, status: string, orderId?: string, referrerPoints?: number, referredPoints?: number): Promise<Referral | undefined> {
    const updates: any = { status };
    if (orderId) {
      updates.convertedOrderId = orderId;
      updates.convertedAt = new Date();
    }
    if (referrerPoints !== undefined) {
      updates.referrerRewardPoints = referrerPoints;
    }
    if (referredPoints !== undefined) {
      updates.referredRewardPoints = referredPoints;
    }
    const [updated] = await db.update(referrals).set(updates).where(eq(referrals.id, id)).returning();
    return updated;
  }

  async incrementReferralCodeUsage(code: string, points: number): Promise<void> {
    await db.update(referralCodes)
      .set({
        timesUsed: sql`times_used + 1`,
        totalPointsEarned: sql`total_points_earned + ${points}`,
      })
      .where(eq(referralCodes.code, code));
  }

  // Draft Orders
  async getDraftOrders(): Promise<DraftOrder[]> {
    return db.select().from(draftOrders).orderBy(desc(draftOrders.createdAt));
  }

  async getDraftOrder(id: string): Promise<DraftOrder | undefined> {
    const [order] = await db.select().from(draftOrders).where(eq(draftOrders.id, id));
    return order;
  }

  async createDraftOrder(order: InsertDraftOrder): Promise<DraftOrder> {
    const [created] = await db.insert(draftOrders).values({
      ...order,
      id: crypto.randomUUID(),
    }).returning();
    return created;
  }

  async updateDraftOrder(id: string, updates: Partial<InsertDraftOrder>): Promise<DraftOrder | undefined> {
    const [updated] = await db.update(draftOrders).set({
      ...updates,
      updatedAt: new Date(),
    }).where(eq(draftOrders.id, id)).returning();
    return updated;
  }

  async deleteDraftOrder(id: string): Promise<boolean> {
    const result = await db.delete(draftOrders).where(eq(draftOrders.id, id));
    return result.rowCount !== null && result.rowCount > 0;
  }

  async getDraftOrderItems(draftOrderId: string): Promise<DraftOrderItem[]> {
    return db.select().from(draftOrderItems).where(eq(draftOrderItems.draftOrderId, draftOrderId));
  }

  async addDraftOrderItem(item: InsertDraftOrderItem): Promise<DraftOrderItem> {
    const [created] = await db.insert(draftOrderItems).values(item).returning();
    return created;
  }

  async updateDraftOrderItem(id: number, updates: Partial<InsertDraftOrderItem>): Promise<DraftOrderItem | undefined> {
    const [updated] = await db.update(draftOrderItems).set(updates).where(eq(draftOrderItems.id, id)).returning();
    return updated;
  }

  async removeDraftOrderItem(id: number): Promise<boolean> {
    const result = await db.delete(draftOrderItems).where(eq(draftOrderItems.id, id));
    return result.rowCount !== null && result.rowCount > 0;
  }

  async convertDraftToOrder(draftOrderId: string): Promise<Order | undefined> {
    const draftOrder = await this.getDraftOrder(draftOrderId);
    if (!draftOrder) return undefined;

    const draftItems = await this.getDraftOrderItems(draftOrderId);
    
    // Build shipping address from parts
    const shippingAddress = [
      draftOrder.shippingAddressLine1,
      draftOrder.shippingAddressLine2,
      draftOrder.shippingCity,
      draftOrder.shippingState,
      draftOrder.shippingZip,
      draftOrder.shippingCountry
    ].filter(Boolean).join(", ");

    // Create the order
    const order = await this.createOrder({
      customerName: draftOrder.customerName || "Manual Order",
      customerEmail: draftOrder.customerEmail || "",
      shippingAddress: shippingAddress || "",
      total: draftOrder.total,
    });

    // Add order items
    for (const item of draftItems) {
      if (item.productId) {
        // Get product details
        const product = await this.getProduct(item.productId);
        await this.createOrderItem({
          orderId: order.id,
          productId: item.productId,
          productName: product?.name || item.customTitle || "Unknown Product",
          productPrice: item.unitPrice,
          quantity: item.quantity,
        });
      }
    }

    // Mark draft as converted and link to order
    await db.update(draftOrders).set({ 
      status: "completed",
      convertedOrderId: order.id,
      updatedAt: new Date(),
    }).where(eq(draftOrders.id, draftOrderId));

    return order;
  }

  // Gift Cards
  async getGiftCards(): Promise<GiftCard[]> {
    return db.select().from(giftCards).orderBy(desc(giftCards.createdAt));
  }

  async getGiftCard(id: number): Promise<GiftCard | undefined> {
    const [card] = await db.select().from(giftCards).where(eq(giftCards.id, id));
    return card;
  }

  async getGiftCardByCode(code: string): Promise<GiftCard | undefined> {
    const [card] = await db.select().from(giftCards).where(eq(giftCards.code, code));
    return card;
  }

  async createGiftCard(card: InsertGiftCard): Promise<GiftCard> {
    const code = card.code || `GC-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
    const [created] = await db.insert(giftCards).values({
      ...card,
      code,
      currentBalance: card.initialBalance,
    }).returning();
    return created;
  }

  async updateGiftCard(id: number, updates: Partial<InsertGiftCard>): Promise<GiftCard | undefined> {
    const [updated] = await db.update(giftCards).set(updates).where(eq(giftCards.id, id)).returning();
    return updated;
  }

  async useGiftCard(code: string, amount: number, orderId: string): Promise<GiftCardTransaction | undefined> {
    const card = await this.getGiftCardByCode(code);
    if (!card || !card.isActive || parseFloat(card.currentBalance) < amount) {
      return undefined;
    }

    // Deduct from balance
    const newBalance = (parseFloat(card.currentBalance) - amount).toFixed(2);
    await db.update(giftCards).set({ 
      currentBalance: newBalance,
    }).where(eq(giftCards.id, card.id));

    // Create transaction
    const [transaction] = await db.insert(giftCardTransactions).values({
      giftCardId: card.id,
      orderId,
      amount: amount.toFixed(2),
      type: "redemption",
      balanceAfter: newBalance,
    }).returning();

    return transaction;
  }

  async getGiftCardTransactions(giftCardId: number): Promise<GiftCardTransaction[]> {
    return db.select().from(giftCardTransactions).where(eq(giftCardTransactions.giftCardId, giftCardId)).orderBy(desc(giftCardTransactions.createdAt));
  }

  // Returns/Refunds
  async getReturns(): Promise<Return[]> {
    return db.select().from(returns).orderBy(desc(returns.createdAt));
  }

  async getReturn(id: number): Promise<Return | undefined> {
    const [ret] = await db.select().from(returns).where(eq(returns.id, id));
    return ret;
  }

  async getReturnsByOrder(orderId: string): Promise<Return[]> {
    return db.select().from(returns).where(eq(returns.orderId, orderId));
  }

  async createReturn(ret: InsertReturn): Promise<Return> {
    const returnNumber = `RET-${Date.now().toString(36).toUpperCase()}`;
    const [created] = await db.insert(returns).values({
      ...ret,
      returnNumber,
    }).returning();
    return created;
  }

  async updateReturn(id: number, updates: Partial<InsertReturn>): Promise<Return | undefined> {
    const [updated] = await db.update(returns).set({
      ...updates,
      updatedAt: new Date(),
    }).where(eq(returns.id, id)).returning();
    return updated;
  }

  async processReturn(id: number): Promise<Return | undefined> {
    const ret = await this.getReturn(id);
    if (!ret) return undefined;

    // Update return status to refunded
    const [updated] = await db.update(returns).set({
      status: "refunded",
      processedAt: new Date(),
      updatedAt: new Date(),
    }).where(eq(returns.id, id)).returning();

    return updated;
  }
}

export const storage = new DatabaseStorage();
