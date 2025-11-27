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
  products,
  orders,
  orderItems,
  siteSettings,
  users,
  customerAddresses,
  reviews,
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
}

export const storage = new DatabaseStorage();
