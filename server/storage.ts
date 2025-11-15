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
  products,
  orders,
  orderItems,
  siteSettings,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, sql } from "drizzle-orm";

export interface IStorage {
  // Products
  getProducts(): Promise<Product[]>;
  getProduct(id: string): Promise<Product | undefined>;
  createProduct(product: InsertProduct): Promise<Product>;
  updateProduct(id: string, product: Partial<InsertProduct>): Promise<Product | undefined>;
  deleteProduct(id: string): Promise<boolean>;
  incrementProductViews(id: string): Promise<void>;

  // Orders
  getOrders(): Promise<Order[]>;
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
}

export class DatabaseStorage implements IStorage {
  // Products
  async getProducts(): Promise<Product[]> {
    return db.select().from(products);
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
}

export const storage = new DatabaseStorage();
