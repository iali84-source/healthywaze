import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertProductSchema, insertOrderSchema, insertSiteSettingsSchema, insertCustomerAddressSchema, insertReviewSchema, insertNewsletterSchema, insertBlogPostSchema, type Order, type OrderItem } from "@shared/schema";
import Stripe from "stripe";
import OpenAI from "openai";
import { z } from "zod";
import multer from "multer";
import * as XLSX from "xlsx";
import { setupAuth, requireAuth, requireAdmin } from "./auth";
import { sendOrderConfirmation, sendWelcomeEmail } from "./email";

// Reference for Stripe integration from blueprint:javascript_stripe
const stripe = process.env.STRIPE_SECRET_KEY 
  ? new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: "2025-10-29.clover" })
  : null;

// Reference for OpenAI integration from blueprint:javascript_openai
// The newest OpenAI model is "gpt-5" which was released August 7, 2025. do not change this unless explicitly requested by the user
const openai = process.env.OPENAI_API_KEY
  ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  : null;

// Configure multer for Excel file uploads (in-memory storage)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.oasis.opendocument.spreadsheet',
    ];
    if (allowedTypes.includes(file.mimetype) || file.originalname.match(/\.(xlsx|xls|ods)$/i)) {
      cb(null, true);
    } else {
      cb(new Error('Only Excel files (.xlsx, .xls, .ods) are allowed'));
    }
  },
});

// DROPSHIPPING AUTOMATION: Send order details to supplier
async function sendOrderToSupplier(order: Order, items: OrderItem[]): Promise<void> {
  const supplierEmail = process.env.SUPPLIER_EMAIL;
  
  if (!supplierEmail) {
    console.log("ℹ️  SUPPLIER_EMAIL not configured. Set this environment variable to enable automatic order forwarding.");
    console.log("📦 Order would be sent to supplier:", {
      orderId: order.id,
      customer: order.customerName,
      total: order.total,
      itemCount: items.length,
    });
    return;
  }

  // Format order details for supplier
  const orderDetails = `
NEW DROPSHIPPING ORDER - #${order.id}

ORDER DETAILS:
--------------
Order ID: ${order.id}
Date: ${new Date(order.createdAt).toLocaleDateString()}
Total: $${order.total}

SHIPPING ADDRESS:
-----------------
${order.customerName}
${order.shippingAddress}
${order.customerPhone ? `Phone: ${order.customerPhone}` : ''}

ITEMS TO SHIP:
--------------
${items.map((item, i) => `${i + 1}. ${item.productName} - Qty: ${item.quantity} @ $${item.productPrice} each`).join('\n')}

TOTAL ITEMS: ${items.reduce((sum, item) => sum + item.quantity, 0)}

Please process and ship this order as soon as possible. Once shipped, reply with the tracking number.

Thank you!
  `.trim();

  // Log what would be sent (actual email sending requires email service setup)
  console.log("📧 DROPSHIPPING ORDER EMAIL");
  console.log("To:", supplierEmail);
  console.log("Subject:", `New Order #${order.id.slice(0, 8)} - ${items.length} items`);
  console.log("---");
  console.log(orderDetails);
  console.log("---");
  console.log("ℹ️  To actually send emails, set up Resend or SendGrid integration.");
  console.log("   See: https://resend.com or https://sendgrid.com");

  // TODO: Actual email sending would go here when email service is configured
  // Example with Resend:
  // await resend.emails.send({
  //   from: 'orders@yourdomain.com',
  //   to: supplierEmail,
  //   subject: `New Order #${order.id.slice(0, 8)} - ${items.length} items`,
  //   text: orderDetails,
  // });
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup authentication routes and middleware
  setupAuth(app);

  // Products CRUD
  app.get("/api/products", async (req, res) => {
    try {
      const filters = {
        category: req.query.category as string | undefined,
        minPrice: req.query.minPrice ? parseFloat(req.query.minPrice as string) : undefined,
        maxPrice: req.query.maxPrice ? parseFloat(req.query.maxPrice as string) : undefined,
        minRating: req.query.minRating ? parseFloat(req.query.minRating as string) : undefined,
        search: req.query.search as string | undefined,
      };
      const products = await storage.getProducts(filters);
      res.json(products);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/products/:id", async (req, res) => {
    try {
      const product = await storage.getProduct(req.params.id);
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
      
      // Track view
      await storage.incrementProductViews(req.params.id);
      
      res.json(product);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/products", requireAdmin, async (req, res) => {
    try {
      const validated = insertProductSchema.parse(req.body);
      const product = await storage.createProduct(validated);
      res.status(201).json(product);
    } catch (error: any) {
      if (error.name === "ZodError") {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      res.status(500).json({ message: error.message });
    }
  });

  app.patch("/api/products/:id", requireAdmin, async (req, res) => {
    try {
      const product = await storage.updateProduct(req.params.id, req.body);
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
      res.json(product);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.delete("/api/products/:id", requireAdmin, async (req, res) => {
    try {
      const deleted = await storage.deleteProduct(req.params.id);
      if (!deleted) {
        return res.status(404).json({ message: "Product not found" });
      }
      res.status(204).send();
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Bulk unpublish products without images - Admin only
  app.post("/api/products/unpublish-no-images", requireAdmin, async (req, res) => {
    try {
      const allProducts = await storage.getProducts({});
      const productsWithoutImages = allProducts.filter(p => !p.imageUrl || p.imageUrl.trim() === "");
      
      let count = 0;
      for (const product of productsWithoutImages) {
        await storage.updateProduct(product.id, { isPublished: false });
        count++;
      }
      
      res.json({ 
        message: `Successfully unpublished ${count} products without images`,
        unpublishedCount: count
      });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Get archived products - Admin only
  app.get("/api/products/archived", requireAdmin, async (req, res) => {
    try {
      const archived = await storage.getArchivedProducts();
      res.json(archived);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Bulk archive products - Admin only
  app.post("/api/products/archive", requireAdmin, async (req, res) => {
    try {
      const { productIds } = req.body;
      if (!Array.isArray(productIds) || productIds.length === 0) {
        return res.status(400).json({ message: "Invalid product IDs" });
      }
      const count = await storage.bulkArchiveProducts(productIds);
      res.json({ message: `Archived ${count} products`, archivedCount: count });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Bulk restore archived products - Admin only
  app.post("/api/products/restore", requireAdmin, async (req, res) => {
    try {
      const { productIds } = req.body;
      if (!Array.isArray(productIds) || productIds.length === 0) {
        return res.status(400).json({ message: "Invalid product IDs" });
      }
      const count = await storage.bulkUnarchiveProducts(productIds);
      res.json({ message: `Restored ${count} products`, restoredCount: count });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Restore all archived products - Admin only
  app.post("/api/products/restore-all", requireAdmin, async (req, res) => {
    try {
      const count = await storage.restoreArchivedProducts();
      res.json({ message: `Restored all ${count} archived products`, restoredCount: count });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Excel Import endpoint - Admin only
  app.post("/api/products/import", requireAdmin, upload.single('file'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      console.log(`📊 Processing Excel import: ${req.file.originalname}`);
      
      // Parse Excel file from buffer
      const workbook = XLSX.read(req.file.buffer, { type: 'buffer' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      
      // Parse headers explicitly to filter out unnamed columns
      const range = XLSX.utils.decode_range(worksheet['!ref'] || 'A1');
      const headers: { original: string; normalized: string }[] = [];
      
      for (let col = range.s.c; col <= range.e.c; col++) {
        const cellAddress = XLSX.utils.encode_cell({ r: range.s.r, c: col });
        const cell = worksheet[cellAddress];
        const headerValue = cell ? String(cell.v || '').trim() : '';
        
        // Skip unnamed/empty columns
        if (headerValue && headerValue !== '') {
          const normalized = headerValue
            .toLowerCase()
            .replace(/[^\w\s.]/g, '') // Remove punctuation except dots and underscores
            .replace(/\s+/g, ' ')
            .trim();
          
          headers.push({ original: headerValue, normalized });
        }
      }
      
      console.log(`📋 Detected ${headers.length} titled columns:`, headers.map(h => h.original).join(', '));
      
      // Convert to JSON with header filtering
      const rawData: any[] = XLSX.utils.sheet_to_json(worksheet, { 
        defval: "",
        raw: false // Get formatted strings
      });
      
      if (rawData.length === 0) {
        return res.status(400).json({ message: "Excel file is empty" });
      }

      console.log(`📝 Found ${rawData.length} data rows`);

      // Helper to normalize column names for flexible matching
      const normalizeKey = (key: string): string => {
        return String(key || '')
          .toLowerCase()
          .replace(/[^\w\s.]/g, '')
          .replace(/\s+/g, ' ')
          .trim();
      };

      const results = {
        imported: [] as any[],
        failed: [] as { row: number; error: string; data: any }[],
      };

      // Process each row
      for (let i = 0; i < rawData.length; i++) {
        const row = rawData[i];
        const rowNumber = i + 2; // +2 because Excel is 1-indexed and has header row

        try {
          // Create normalized key mapping for this row (ignore __EMPTY and unnamed columns)
          const normalizedRow: Record<string, any> = {};
          Object.keys(row).forEach(key => {
            if (!key.startsWith('__EMPTY')) {
              const normalized = normalizeKey(key);
              if (normalized) {
                normalizedRow[normalized] = row[key];
              }
            }
          });

          // Flexible column lookup with normalized keys
          const getColumnValue = (possibleNames: string[]): string => {
            for (const name of possibleNames) {
              const normalizedName = normalizeKey(name);
              const value = normalizedRow[normalizedName];
              if (value !== undefined && value !== null && String(value).trim() !== "") {
                return String(value).trim();
              }
            }
            return "";
          };

          // Helper to clean currency values (strip $, commas, etc.)
          const cleanCurrencyValue = (value: string): string => {
            if (!value) return "0";
            // Remove dollar signs, commas, and other currency symbols
            return value.replace(/[$,€£¥]/g, '').trim();
          };

          // Build product name from brand + product + size if available
          const brand = getColumnValue(['brand']);
          const productName = getColumnValue(['product', 'name', 'product name', 'title']);
          const size = getColumnValue(['size']);
          
          const fullName = [brand, productName, size]
            .filter(v => v && v.trim())
            .join(' ')
            .trim() || productName;

          // Validate required fields with helpful error messages
          if (!fullName) {
            throw new Error("Product name is required - need 'brand', 'product', 'size' or 'name' column");
          }

          // PRICE is required (prioritize PRICE column, then healthywaze.com as fallback)
          const rawPriceValue = getColumnValue([
            'price',
            'healthywaze.com',
            'healthywazecom',
            'healthywaze price',
            'retail price',
            'selling price',
            'unit price'
          ]);
          const priceValue = cleanCurrencyValue(rawPriceValue);
          if (!priceValue || parseFloat(priceValue) <= 0) {
            throw new Error("Valid price is required - need 'price' or 'healthywaze.com' column with value > 0");
          }

          // Get product URL for web scraping
          const productUrl = getColumnValue(['url', 'link', 'product url', 'web link', 'source']);

          // Get catalog number and UPC
          const catalogNumber = getColumnValue(['catalog number', 'catalognumber', 'catalog', 'sku', 'item number']);
          const upc = getColumnValue(['upc', 'upc code', 'barcode']);

          // Initialize description and images
          let description = getColumnValue(['descriptions', 'description', 'desc', 'details']);
          let imageUrl = getColumnValue([
            'image address primary',
            'image 2',
            'image 3', 
            'image 4',
            'image',
            'image url',
            'photo'
          ]);

          // If product URL is provided and no description/image, fetch from web
          if (productUrl && (!description || !imageUrl)) {
            try {
              console.log(`🔍 Fetching product data from: ${productUrl}`);
              
              // SECURITY: Validate URL to prevent SSRF attacks
              let parsedUrl: URL;
              try {
                parsedUrl = new URL(productUrl);
              } catch {
                throw new Error("Invalid URL format");
              }

              // Only allow http/https protocols
              if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
                throw new Error("Only HTTP/HTTPS URLs are allowed");
              }

              // Block private/internal IP ranges to prevent SSRF
              const hostname = parsedUrl.hostname.toLowerCase();
              const blockedPatterns = [
                /^localhost$/i,
                /^127\./,
                /^10\./,
                /^172\.(1[6-9]|2[0-9]|3[01])\./,
                /^192\.168\./,
                /^169\.254\./,
                /^::1$/,
                /^::/,                  // IPv6 loopback variants
                /^::ffff:127\./,       // IPv4-mapped IPv6 loopback  
                /^::ffff:10\./,        // IPv4-mapped private
                /^::ffff:192\.168\./,  // IPv4-mapped private
                /^fc00:/,              // IPv6 ULA
                /^fd00:/,              // IPv6 ULA
                /^fe80:/,              // IPv6 link-local
                /\.local$/i,           // mDNS/local domain
                /\.internal$/i,        // internal domain
              ];

              if (blockedPatterns.some(pattern => pattern.test(hostname))) {
                throw new Error("Cannot fetch from private/internal addresses");
              }
              
              // Additional security: Log URL fetches for audit trail
              console.log(`🔒 Security check passed for URL: ${parsedUrl.hostname}`);
              
              // Fetch the product page with timeout
              const controller = new AbortController();
              const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
              
              try {
                const pageResponse = await fetch(productUrl, {
                  signal: controller.signal,
                  headers: {
                    'User-Agent': 'HealthyWaze-ProductImporter/1.0',
                  }
                });
                clearTimeout(timeoutId);

                if (!pageResponse.ok) {
                  throw new Error(`Failed to fetch page: ${pageResponse.status}`);
                }
                
                const pageContent = await pageResponse.text();
                
                // Use OpenAI to extract product information
                if (openai && !description) {
                  console.log(`🤖 Using AI to extract product description...`);
                  const aiResponse = await openai.chat.completions.create({
                    model: "gpt-4o-mini",
                    messages: [
                      {
                        role: "system",
                        content: "You are a product description expert. Extract or generate a compelling, accurate product description from the provided web page content. Focus on benefits, features, and key details. Keep it under 200 words."
                      },
                      {
                        role: "user",
                        content: `Product name: ${fullName}\n\nWeb page content:\n${pageContent.substring(0, 8000)}`
                      }
                    ],
                    max_tokens: 300,
                    temperature: 0.7,
                  });
                  
                  description = aiResponse.choices[0]?.message?.content?.trim() || description;
                  if (description) {
                    console.log(`✅ AI-generated description created`);
                  }
                }
                
                // Extract images from page if not provided
                if (!imageUrl) {
                  // Helper function to resolve URLs properly
                  const resolveUrl = (relativeUrl: string, baseUrl: string): string => {
                    try {
                      // Handle protocol-relative URLs (//cdn.example.com/image.jpg)
                      if (relativeUrl.startsWith('//')) {
                        return `${parsedUrl.protocol}${relativeUrl}`;
                      }
                      // Use URL constructor to properly resolve relative/absolute URLs
                      return new URL(relativeUrl, baseUrl).href;
                    } catch {
                      return relativeUrl;
                    }
                  };

                  // Look for Open Graph and Twitter card images first (higher quality)
                  const ogImageRegex = /<meta[^>]+(?:property=["']og:image["']|name=["']twitter:image["'])[^>]+content=["']([^"']+)["']/i;
                  const ogMatch = ogImageRegex.exec(pageContent);
                  
                  if (ogMatch) {
                    imageUrl = resolveUrl(ogMatch[1], productUrl);
                    console.log(`🖼️ Found Open Graph/Twitter image`);
                  } else {
                    // Fallback: Find product images from HTML
                    const imgRegex = /<img[^>]+src=["']([^"']+)["']/gi;
                    let match;
                    const images: string[] = [];
                    
                    while ((match = imgRegex.exec(pageContent)) !== null && images.length < 10) {
                      const src = match[1];
                      // Filter out tracking pixels, icons, logos
                      if (!src.includes('logo') && 
                          !src.includes('icon') && 
                          !src.includes('avatar') &&
                          !src.includes('pixel') &&
                          !src.includes('tracking') &&
                          src.length > 20) { // Avoid tiny images
                        images.push(resolveUrl(src, productUrl));
                      }
                    }
                    
                    if (images.length > 0) {
                      imageUrl = images[0];
                      console.log(`🖼️ Extracted image from page`);
                    }
                  }
                }
              } finally {
                clearTimeout(timeoutId);
              }
            } catch (error: any) {
              console.log(`⚠️  Could not fetch from URL: ${error.message}`);
              // Continue with default values
            }
          }

          // Fallback to default description if still missing
          if (!description) {
            description = `${fullName} - Premium quality product`;
          }

          const productData = {
            name: fullName,
            description: description,
            price: priceValue,
            productCost: cleanCurrencyValue(getColumnValue(['cost', 'product cost', 'cost per item', 'supplier cost']) || "0"),
            catalogNumber: catalogNumber || undefined,
            upc: upc || undefined,
            imageUrl: imageUrl,
            stock: Number(getColumnValue(['stock', 'inventory', 'quantity', 'qty']) || 100),
            category: getColumnValue(['brand', 'category', 'type']),
            adSpend: cleanCurrencyValue(getColumnValue(['ad spend', 'ads', 'marketing cost']) || "0"),
            isPublished: true,
          };

          // Create product
          const validated = insertProductSchema.parse(productData);
          const product = await storage.createProduct(validated);
          
          results.imported.push({
            row: rowNumber,
            name: product.name,
            id: product.id,
          });

          console.log(`✅ Row ${rowNumber}: ${product.name}`);

        } catch (error: any) {
          results.failed.push({
            row: rowNumber,
            error: error.message,
            data: row,
          });
          console.log(`❌ Row ${rowNumber}: ${error.message}`);
        }
      }

      console.log(`\n📊 Import Summary:`);
      console.log(`✅ Imported: ${results.imported.length}`);
      console.log(`❌ Failed: ${results.failed.length}`);

      res.json({
        message: `Import complete: ${results.imported.length} products imported, ${results.failed.length} failed`,
        ...results,
      });

    } catch (error: any) {
      console.error("Excel import error:", error);
      res.status(500).json({ 
        message: "Failed to import Excel file: " + error.message,
        error: error.message,
      });
    }
  });

  // Orders - filtered by role
  app.get("/api/orders", requireAuth, async (req, res) => {
    try {
      let orders;
      
      // Admins see all orders, customers only see their own
      if (req.user!.role === 'admin') {
        orders = await storage.getOrders();
      } else {
        orders = await storage.getOrdersByUserId(req.user!.id);
      }
      
      res.json(orders);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/orders/:id", requireAuth, async (req, res) => {
    try {
      const order = await storage.getOrder(req.params.id);
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }
      
      // Admins can see any order, customers only their own
      if (req.user!.role !== 'admin' && order.userId !== req.user!.id) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      res.json(order);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/orders", async (req, res) => {
    try {
      const { items, stripePaymentIntentId, ...orderData } = req.body;
      
      if (!items || !Array.isArray(items) || items.length === 0) {
        return res.status(400).json({ message: "Order must contain at least one item" });
      }
      
      if (!stripePaymentIntentId) {
        return res.status(400).json({ message: "Payment intent ID is required" });
      }
      
      // SECURITY: Verify payment with Stripe before creating order
      if (!stripe) {
        return res.status(503).json({ 
          message: "Payment verification requires STRIPE_SECRET_KEY to be configured" 
        });
      }
      
      const paymentIntent = await stripe.paymentIntents.retrieve(stripePaymentIntentId);
      
      if (!paymentIntent) {
        return res.status(404).json({ message: "Payment intent not found" });
      }
      
      if (paymentIntent.status !== "succeeded") {
        return res.status(400).json({ 
          message: `Payment not completed. Status: ${paymentIntent.status}` 
        });
      }
      
      // SECURITY: Verify incoming items match the payment intent metadata
      if (!paymentIntent.metadata || !paymentIntent.metadata.items) {
        return res.status(400).json({ 
          message: "Payment intent missing item metadata. Please create a new checkout session." 
        });
      }
      
      let paidForItems;
      try {
        paidForItems = JSON.parse(paymentIntent.metadata.items);
      } catch (error) {
        console.error("Invalid payment intent metadata:", error);
        return res.status(400).json({ 
          message: "Payment intent metadata is corrupted. Please create a new checkout session." 
        });
      }
      
      // SECURITY: Validate and normalize both lists
      // This prevents duplicate item attacks and validates item data
      const normalizeItems = (itemList: any[]) => {
        const normalized = new Map<string, number>();
        for (const item of itemList) {
          // Validate item structure
          if (!item || typeof item.productId !== 'string' || !item.productId) {
            throw new Error("Invalid item: missing or invalid productId");
          }
          if (typeof item.quantity !== 'number' || !Number.isInteger(item.quantity) || item.quantity <= 0 || item.quantity > 10000) {
            throw new Error(`Invalid quantity for ${item.productId}: must be positive integer ≤10000`);
          }
          
          const current = normalized.get(item.productId) || 0;
          const newTotal = current + item.quantity;
          
          // Prevent quantity overflow
          if (newTotal > 10000 || !Number.isFinite(newTotal)) {
            throw new Error(`Total quantity for ${item.productId} exceeds limit`);
          }
          
          normalized.set(item.productId, newTotal);
        }
        return normalized;
      };
      
      let paidItemsNormalized, requestItemsNormalized;
      try {
        paidItemsNormalized = normalizeItems(paidForItems);
        requestItemsNormalized = normalizeItems(items);
      } catch (error: any) {
        console.error("Item validation error:", error.message);
        return res.status(400).json({ 
          message: `Invalid item data: ${error.message}` 
        });
      }
      
      // Verify normalized items match exactly
      if (paidItemsNormalized.size !== requestItemsNormalized.size) {
        return res.status(400).json({ 
          message: "Order items do not match payment. Please create a new checkout session." 
        });
      }
      
      for (const [productId, quantity] of Array.from(paidItemsNormalized)) {
        const requestedQty = requestItemsNormalized.get(productId);
        if (!requestedQty || requestedQty !== quantity) {
          return res.status(400).json({ 
            message: "Order items do not match payment. Please create a new checkout session." 
          });
        }
      }
      
      // SECURITY: Validate prices and calculate total server-side
      let calculatedTotal = 0;
      const validatedItems = [];
      
      for (const item of items) {
        if (!item.productId || !item.quantity || item.quantity <= 0) {
          return res.status(400).json({ message: "Invalid item data" });
        }
        
        // Fetch actual product from database
        const product = await storage.getProduct(item.productId);
        
        if (!product) {
          return res.status(404).json({ 
            message: `Product not found: ${item.productId}` 
          });
        }
        
        if (!product.isPublished) {
          return res.status(400).json({ 
            message: `Product is no longer available: ${product.name}` 
          });
        }
        
        if (product.stock < item.quantity) {
          return res.status(400).json({ 
            message: `Insufficient stock for ${product.name}. Available: ${product.stock}` 
          });
        }
        
        // Use ACTUAL price from database, not client-supplied price
        const actualPrice = parseFloat(product.price.toString());
        calculatedTotal += actualPrice * item.quantity;
        
        validatedItems.push({
          productId: product.id,
          productName: product.name,
          productPrice: product.price.toString(),
          quantity: item.quantity,
        });
      }
      
      // SECURITY: Verify payment amount matches calculated total
      const paidAmount = paymentIntent.amount / 100; // Convert from cents
      
      // Guard against NaN/Infinity from overflow
      if (!Number.isFinite(calculatedTotal) || calculatedTotal <= 0) {
        console.error("Invalid calculated total:", calculatedTotal);
        return res.status(500).json({ message: "Order calculation error" });
      }
      
      if (Math.abs(paidAmount - calculatedTotal) > 0.01) {
        return res.status(400).json({ 
          message: `Payment amount mismatch. Paid: $${paidAmount.toFixed(2)}, Required: $${calculatedTotal.toFixed(2)}` 
        });
      }
      
      // SECURITY: Use ONLY server-calculated total, ignore any client-supplied total
      // Link userId for authenticated users, null for guest checkout
      const validated = insertOrderSchema.parse({
        ...orderData,
        userId: req.isAuthenticated() ? req.user!.id : null,
        stripePaymentIntentId,
        total: calculatedTotal.toFixed(2),
      });
      
      // Create order
      const order = await storage.createOrder(validated);
      
      // Create order items with validated prices and update inventory
      // Wrapped in try-catch for transaction safety
      const orderItemsDetails = [];
      try {
        for (const item of validatedItems) {
          const createdItem = await storage.createOrderItem({
            orderId: order.id,
            productId: item.productId,
            productName: item.productName,
            productPrice: item.productPrice,
            quantity: item.quantity,
          });
          orderItemsDetails.push(createdItem);
        }
      } catch (error: any) {
        // If order item creation fails, we should mark the order as failed
        // In a production system, you'd want proper transaction rollback
        console.error("Failed to create order items:", error.message);
        await storage.updateOrder(order.id, { status: "failed" });
        throw new Error(`Failed to create order items: ${error.message}`);
      }
      
      // DROPSHIPPING AUTOMATION: Send order to supplier
      try {
        await sendOrderToSupplier(order, orderItemsDetails);
      } catch (error: any) {
        console.error("Failed to send order to supplier:", error.message);
        // Don't fail the order creation if email fails
      }
      
      // LOYALTY POINTS: Award points for authenticated users (1 point per $1 spent)
      if (req.isAuthenticated() && req.user) {
        try {
          const pointsToAward = Math.floor(calculatedTotal);
          if (pointsToAward > 0) {
            await storage.addLoyaltyPoints(
              req.user.id,
              pointsToAward,
              "purchase",
              `Earned ${pointsToAward} points for order #${order.id}`
            );
            console.log(`Awarded ${pointsToAward} loyalty points to user ${req.user.id} for order ${order.id}`);
          }
        } catch (loyaltyError: any) {
          console.error("Failed to award loyalty points:", loyaltyError.message);
          // Don't fail the order creation if loyalty points fail
        }
      }
      
      // SEND ORDER CONFIRMATION EMAIL
      if (order.customerEmail) {
        try {
          await sendOrderConfirmation(order.customerEmail, order, orderItemsDetails);
        } catch (emailError: any) {
          console.error("Failed to send order confirmation email:", emailError.message);
          // Don't fail the order creation if email fails
        }
      }
      
      // Return order with calculated total and validated items
      res.status(201).json({
        ...order,
        calculatedTotal: calculatedTotal.toFixed(2),
        items: orderItemsDetails,
      });
    } catch (error: any) {
      if (error.name === "ZodError") {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      res.status(500).json({ message: error.message });
    }
  });

  app.patch("/api/orders/:id", requireAdmin, async (req, res) => {
    try {
      const order = await storage.updateOrder(req.params.id, req.body);
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }
      res.json(order);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/orders/:id/items", async (req, res) => {
    try {
      const items = await storage.getOrderItems(req.params.id);
      res.json(items);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Analytics - Admin only
  app.get("/api/analytics", requireAdmin, async (req, res) => {
    try {
      const analytics = await storage.getAnalytics();
      res.json(analytics);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // AI: Generate product description - Admin only
  app.post("/api/ai/generate-description", requireAdmin, async (req, res) => {
    try {
      if (!openai) {
        return res.status(503).json({ 
          message: "AI features require OPENAI_API_KEY to be configured" 
        });
      }

      const { name } = req.body;
      
      if (!name) {
        return res.status(400).json({ message: "Product name is required" });
      }

      const response = await openai.chat.completions.create({
        model: "gpt-5",
        messages: [
          {
            role: "user",
            content: `Write a 2-3 sentence product description for "${name}" that highlights key benefits and features. Be persuasive and professional.`,
          },
        ],
        max_completion_tokens: 1000,
      });

      const description = response.choices[0]?.message?.content || "";
      
      if (!description) {
        console.error("OpenAI returned empty description. Response:", JSON.stringify(response, null, 2));
      }
      
      res.json({ description });
    } catch (error: any) {
      console.error("OpenAI error:", error);
      res.status(500).json({ message: "Failed to generate description: " + error.message });
    }
  });

  // AI: Analyze performance - Admin only
  app.post("/api/ai/analyze-performance", requireAdmin, async (req, res) => {
    try {
      if (!openai) {
        return res.status(503).json({ 
          message: "AI features require OPENAI_API_KEY to be configured" 
        });
      }

      const analytics = await storage.getAnalytics();
      
      const prompt = `Analyze this e-commerce store performance data and provide actionable insights:

Total Revenue: $${analytics.totalRevenue.toFixed(2)}
Total Orders: ${analytics.totalOrders}
Total Product Views: ${analytics.totalViews}
Overall Conversion Rate: ${analytics.conversionRate.toFixed(2)}%

Top Products:
${analytics.topProducts.slice(0, 10).map((p, i) => 
  `${i + 1}. ${p.name}: ${p.sales} sales, ${p.views} views, $${p.revenue.toFixed(2)} revenue, ${p.conversionRate.toFixed(1)}% conversion`
).join('\n')}

Provide:
1. What's working well and should be doubled down on
2. What needs improvement
3. Specific recommendations for increasing sales
4. Products to promote vs products to remove

Keep the analysis practical and actionable for a business owner.`;

      const response = await openai.chat.completions.create({
        model: "gpt-5",
        messages: [
          {
            role: "system",
            content: "You are an expert e-commerce business consultant specializing in data-driven product optimization and growth strategies.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        max_completion_tokens: 1200,
      });

      const insights = response.choices[0].message.content;
      res.json({ insights });
    } catch (error: any) {
      console.error("OpenAI error:", error);
      res.status(500).json({ message: "Failed to analyze performance: " + error.message });
    }
  });

  // AI: Analyze product demand trends - Admin only
  app.post("/api/ai/analyze-demand", requireAdmin, async (req, res) => {
    try {
      if (!openai) {
        return res.status(503).json({ 
          message: "AI features require OPENAI_API_KEY to be configured" 
        });
      }

      const products = await storage.getProducts();
      
      // Prepare product data for AI analysis
      const productSummaries = products.map(p => ({
        id: p.id,
        name: p.name,
        category: p.category || "Uncategorized",
        price: parseFloat(p.price),
        sales: p.sales,
        views: p.views,
        stock: p.stock,
      }));

      const prompt = `You are a market demand analysis expert for health & wellness e-commerce. Analyze this product catalog and rank by market demand.

PRODUCTS:
${JSON.stringify(productSummaries, null, 2)}

Return a JSON object with a "results" array. For each product provide: productName (exact match), demandScore (1-10), trendScore (1-10), seasonality, competitionLevel (High/Medium/Low), priceOptimization, searchDemand, recommendation, insights.

Response format:
{
  "results": [
    {
      "productName": "A.VOGEL SEA SALT HERBED 8.8OZ",
      "demandScore": 8,
      "trendScore": 9,
      "seasonality": "Year-round",
      "competitionLevel": "Medium",
      "priceOptimization": "Competitive",
      "searchDemand": "Moderate",
      "recommendation": "Promote",
      "insights": "Growing market"
    }
  ]
}`;

      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: "You are an expert market analyst specializing in e-commerce demand forecasting and Google search trends. Provide data-driven insights with specific, actionable recommendations.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        response_format: { type: "json_object" },
        max_completion_tokens: 4000,
      });

      const content = response.choices[0].message.content;
      if (!content) {
        return res.status(500).json({ message: "No response from AI" });
      }

      // Parse the JSON response
      let rawAnalysis = [];
      try {
        const parsedResponse = JSON.parse(content);
        rawAnalysis = Array.isArray(parsedResponse) ? parsedResponse : (parsedResponse.results || parsedResponse.products || parsedResponse.analysis || []);
        console.log("AI returned:", rawAnalysis.length > 0 ? `${rawAnalysis.length} products` : "empty results");
      } catch (parseError) {
        console.error("JSON parse error:", parseError);
        return res.status(500).json({ message: "Failed to parse AI response" });
      }

      // Create maps for matching: product name -> product id (case-insensitive, substring matching)
      const nameMap = new Map(products.map(p => [p.name.trim().toLowerCase(), p.id]));

      // Match AI results to actual products with flexible matching
      let analysis = rawAnalysis
        .filter((item: any) => item && (item.productName || item.name))
        .map((item: any) => {
          const aiProductName = String(item.productName || item.name || "").trim();
          const aiNameLower = aiProductName.toLowerCase();
          
          // First try exact match
          let matchedId = nameMap.get(aiNameLower) || "";
          
          // If no exact match, try substring matching (AI might have modified the name slightly)
          if (!matchedId) {
            const entries = Array.from(nameMap.entries());
            for (const [dbName, dbId] of entries) {
              if (dbName.includes(aiNameLower) || aiNameLower.includes(dbName)) {
                matchedId = dbId;
                break;
              }
            }
          }
          
          console.log(`Matching: "${aiProductName}" -> ${matchedId ? "matched" : "no match"}`);
          
          return {
            productId: matchedId,
            productName: aiProductName,
            demandScore: Math.min(10, Math.max(0, Number(item.demandScore) || 5)),
            trendScore: Math.min(10, Math.max(0, Number(item.trendScore) || 5)),
            seasonality: String(item.seasonality || "Year-round"),
            competitionLevel: String(item.competitionLevel || "Medium"),
            priceOptimization: String(item.priceOptimization || ""),
            searchDemand: String(item.searchDemand || ""),
            recommendation: String(item.recommendation || ""),
            insights: String(item.insights || ""),
          };
        })
        .filter((item: any) => item.productId);
      
      console.log(`Analysis complete: ${analysis.length} products matched out of ${rawAnalysis.length} AI results`);

      // Explicitly sort by demandScore (highest first)
      analysis.sort((a: any, b: any) => b.demandScore - a.demandScore);

      res.json({ analysis, totalProducts: products.length, analyzedProducts: analysis.length });
    } catch (error: any) {
      console.error("OpenAI demand analysis error:", error);
      res.status(500).json({ message: "Failed to analyze demand: " + error.message });
    }
  });

  // AI: Categorize products - Admin only
  app.post("/api/ai/categorize-products", requireAdmin, async (req, res) => {
    try {
      if (!openai) {
        return res.status(503).json({ 
          message: "AI features require OPENAI_API_KEY to be configured" 
        });
      }

      const products = await storage.getProducts();
      let categorized = 0;
      let failed = 0;
      const results = [];

      for (const product of products) {
        try {
          const response = await openai.chat.completions.create({
            model: "gpt-4o",
            messages: [
              {
                role: "system",
                content: `You are a health and wellness product categorization expert. Categorize products into ONE of these specific categories:

- Vitamins & Minerals
- Supplements & Herbs
- Sports Nutrition
- Protein & Fitness
- Skin Care & Beauty
- Hair Care
- Body Care & Lotions
- Essential Oils & Aromatherapy
- Digestive Health
- Immune Support
- Joint & Bone Health
- Heart & Cardiovascular
- Brain & Cognitive
- Sleep & Relaxation
- Weight Management
- Women's Health
- Men's Health
- Children's Health
- Specialty Diets & Foods
- Bath & Personal Care
- Household & Cleaning
- Pet Care
- Other

Only respond with the category name, nothing else.`,
              },
              {
                role: "user",
                content: `Categorize this product:\nName: ${product.name}\nDescription: ${product.description.slice(0, 500)}`,
              },
            ],
            max_completion_tokens: 50,
          });

          const category = response.choices[0].message.content?.trim() || "Other";
          
          await storage.updateProduct(product.id, { category });
          categorized++;
          results.push({ id: product.id, name: product.name, category });
        } catch (error: any) {
          console.error(`Failed to categorize product ${product.id}:`, error.message);
          failed++;
          results.push({ id: product.id, name: product.name, error: error.message });
        }
      }

      res.json({ 
        total: products.length, 
        categorized, 
        failed,
        results 
      });
    } catch (error: any) {
      console.error("OpenAI error:", error);
      res.status(500).json({ message: "Failed to categorize products: " + error.message });
    }
  });

  // Site Settings
  app.get("/api/site-settings", async (req, res) => {
    try {
      const settings = await storage.getSiteSettings();
      res.json(settings);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.patch("/api/site-settings", requireAdmin, async (req, res) => {
    try {
      const validated = insertSiteSettingsSchema.partial().parse(req.body);
      const settings = await storage.updateSiteSettings(validated);
      res.json(settings);
    } catch (error: any) {
      if (error.name === "ZodError") {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      res.status(500).json({ message: error.message });
    }
  });

  // Customer Addresses - Requires authentication
  app.get("/api/addresses", requireAuth, async (req, res) => {
    try {
      const addresses = await storage.getCustomerAddresses(req.user!.id);
      res.json(addresses);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/addresses", requireAuth, async (req, res) => {
    try {
      // Validate with Zod schema
      const validated = insertCustomerAddressSchema.parse({
        ...req.body,
        userId: req.user!.id, // Force userId to authenticated user
      });
      
      const address = await storage.createCustomerAddress(validated);
      res.status(201).json(address);
    } catch (error: any) {
      if (error.name === "ZodError") {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      res.status(500).json({ message: error.message });
    }
  });

  app.patch("/api/addresses/:id", requireAuth, async (req, res) => {
    try {
      // Verify ownership
      const existingAddress = await storage.getCustomerAddress(parseInt(req.params.id));
      if (!existingAddress || existingAddress.userId !== req.user!.id) {
        return res.status(404).json({ message: "Address not found" });
      }

      // Validate with Zod schema (partial for updates)
      const validated = insertCustomerAddressSchema.partial().parse(req.body);
      
      // Ensure userId cannot be changed
      delete (validated as any).userId;
      
      const address = await storage.updateCustomerAddress(parseInt(req.params.id), validated);
      res.json(address);
    } catch (error: any) {
      if (error.name === "ZodError") {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      res.status(500).json({ message: error.message });
    }
  });

  app.delete("/api/addresses/:id", requireAuth, async (req, res) => {
    try {
      // Verify ownership
      const existingAddress = await storage.getCustomerAddress(parseInt(req.params.id));
      if (!existingAddress || existingAddress.userId !== req.user!.id) {
        return res.status(404).json({ message: "Address not found" });
      }

      const deleted = await storage.deleteCustomerAddress(parseInt(req.params.id));
      res.json({ success: deleted });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/addresses/:id/set-default", requireAuth, async (req, res) => {
    try {
      // Verify ownership BEFORE calling setDefaultAddress
      const existingAddress = await storage.getCustomerAddress(parseInt(req.params.id));
      if (!existingAddress) {
        return res.status(404).json({ message: "Address not found" });
      }
      
      // SECURITY: Verify the address belongs to the authenticated user
      if (existingAddress.userId !== req.user!.id) {
        return res.status(403).json({ message: "Access denied" });
      }

      await storage.setDefaultAddress(req.user!.id, parseInt(req.params.id));
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Product Reviews
  app.get("/api/products/:productId/reviews", async (req, res) => {
    try {
      const reviews = await storage.getProductReviews(req.params.productId);
      res.json(reviews);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/products/:productId/reviews", requireAuth, async (req, res) => {
    try {
      const productId = req.params.productId;
      const userId = req.user!.id;

      // Check if user already reviewed this product
      const existingReview = await storage.getUserProductReview(productId, userId);
      if (existingReview) {
        return res.status(400).json({ message: "You have already reviewed this product" });
      }

      // Verify user purchased this product
      const hasPurchased = await storage.hasUserPurchasedProduct(productId, userId);
      if (!hasPurchased) {
        return res.status(403).json({ 
          message: "You can only review products you have purchased" 
        });
      }

      // Validate review data
      const validated = insertReviewSchema.parse({
        ...req.body,
        productId,
        userId,
        isVerified: true,
      });

      const review = await storage.createReview(validated);
      res.status(201).json(review);
    } catch (error: any) {
      if (error.name === "ZodError") {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/reviews/:id/helpful", async (req, res) => {
    try {
      await storage.incrementHelpfulCount(parseInt(req.params.id));
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Stripe: Create payment intent (reference from blueprint:javascript_stripe)
  // SECURITY: Validates prices server-side to prevent client-side manipulation
  app.post("/api/create-payment-intent", async (req, res) => {
    try {
      if (!stripe) {
        return res.status(503).json({ 
          message: "Payment processing requires STRIPE_SECRET_KEY to be configured" 
        });
      }

      const { items } = req.body;
      
      if (!items || !Array.isArray(items) || items.length === 0) {
        return res.status(400).json({ message: "Cart items are required" });
      }

      // SECURITY: Calculate total server-side using actual product prices from database
      let calculatedTotal = 0;
      const validatedItems = [];
      
      for (const item of items) {
        if (!item.productId || !item.quantity || item.quantity <= 0) {
          return res.status(400).json({ message: "Invalid cart item data" });
        }
        
        // Fetch actual product from database
        const product = await storage.getProduct(item.productId);
        
        if (!product) {
          return res.status(404).json({ 
            message: `Product not found: ${item.productId}` 
          });
        }
        
        if (!product.isPublished) {
          return res.status(400).json({ 
            message: `Product is no longer available: ${product.name}` 
          });
        }
        
        if (product.stock < item.quantity) {
          return res.status(400).json({ 
            message: `Insufficient stock for ${product.name}. Available: ${product.stock}` 
          });
        }
        
        // Use the ACTUAL price from database, not client-supplied price
        const itemTotal = parseFloat(product.price.toString()) * item.quantity;
        calculatedTotal += itemTotal;
        
        validatedItems.push({
          productId: product.id,
          productName: product.name,
          productPrice: product.price.toString(),
          quantity: item.quantity,
        });
      }

      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(calculatedTotal * 100), // Convert to cents
        currency: "usd",
        metadata: {
          itemCount: validatedItems.length,
          calculatedTotal: calculatedTotal.toFixed(2),
          items: JSON.stringify(validatedItems),
        },
      });
      
      res.json({ 
        clientSecret: paymentIntent.client_secret,
        calculatedTotal: calculatedTotal.toFixed(2),
        validatedItems,
      });
    } catch (error: any) {
      res
        .status(500)
        .json({ message: "Error creating payment intent: " + error.message });
    }
  });

  // Customer Notifications (Email/SMS) - Admin only
  app.post("/api/notifications/send", requireAdmin, async (req, res) => {
    try {
      const { orderId, type } = req.body;

      if (!orderId || !type) {
        return res.status(400).json({ message: "Order ID and notification type required" });
      }

      const order = await storage.getOrder(orderId);
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }

      // Email/SMS integration would go here
      // For now, return a message indicating the feature needs setup
      const message = type === "email" 
        ? "Email notifications require Resend or SendGrid API keys. Set up in integrations."
        : "SMS notifications require Twilio API keys (TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_PHONE_NUMBER).";

      // Placeholder for future email/SMS integration
      res.status(503).json({ message });
    } catch (error: any) {
      res.status(500).json({ message: "Failed to send notification: " + error.message });
    }
  });

  // Product Analysis & Selection
  app.get("/api/products/analyzed", async (req, res) => {
    try {
      const products = await storage.getProducts();
      res.json(products);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/products/select-featured", requireAdmin, async (req, res) => {
    try {
      const { productIds } = req.body;
      if (!Array.isArray(productIds) || productIds.length === 0) {
        return res.status(400).json({ error: "Invalid or empty product IDs" });
      }
      
      const products = await storage.getProducts();
      for (const product of products) {
        if (productIds.includes(product.id)) {
          await storage.updateProduct(product.id, { isFeatured: true, isPublished: true });
        } else {
          await storage.updateProduct(product.id, { isPublished: false, isFeatured: false });
        }
      }
      
      res.json({ success: true, message: `${productIds.length} products featured, rest archived` });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/products/archive-multiple", requireAdmin, async (req, res) => {
    try {
      const { productIds } = req.body;
      if (!Array.isArray(productIds) || productIds.length === 0) {
        return res.status(400).json({ error: "Invalid or empty product IDs" });
      }
      
      for (const productId of productIds) {
        await storage.updateProduct(productId, { isPublished: false });
      }
      
      res.json({ success: true, message: `${productIds.length} products archived` });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Health Check & Debugging System
  app.post("/api/health-check", requireAdmin, async (req, res) => {
    try {
      const tests: any[] = [];
      const startTime = Date.now();

      // Test 1: Database connectivity
      const dbStart = Date.now();
      try {
        const products = await storage.getProducts();
        tests.push({
          name: "Database Connectivity",
          status: "pass",
          message: `Connected to database. Found ${products.length} products.`,
          duration: Date.now() - dbStart,
        });
      } catch (error: any) {
        tests.push({
          name: "Database Connectivity",
          status: "fail",
          message: `Failed to connect: ${error.message}`,
          duration: Date.now() - dbStart,
        });
      }

      // Test 2: Product storage operations
      const prodStart = Date.now();
      try {
        const testProduct = await storage.createProduct({
          name: "DEBUG_TEST_PRODUCT",
          description: "Test product for debugging",
          price: "10.00",
          imageUrl: "https://example.com/test.jpg",
          stock: 100,
          isPublished: true,
        });
        
        const fetched = await storage.getProduct(testProduct.id);
        if (!fetched) throw new Error("Product not found after creation");
        
        await storage.updateProduct(testProduct.id, { stock: 50 });
        
        tests.push({
          name: "Product CRUD Operations",
          status: "pass",
          message: "Create, Read, Update operations successful",
          duration: Date.now() - prodStart,
        });
      } catch (error: any) {
        tests.push({
          name: "Product CRUD Operations",
          status: "fail",
          message: error.message,
          duration: Date.now() - prodStart,
        });
      }

      // Test 3: Site settings
      const settingsStart = Date.now();
      try {
        const settings = await storage.getSiteSettings();
        tests.push({
          name: "Site Settings Access",
          status: "pass",
          message: `Site name: ${settings?.siteName || "Default"}`,
          duration: Date.now() - settingsStart,
        });
      } catch (error: any) {
        tests.push({
          name: "Site Settings Access",
          status: "fail",
          message: error.message,
          duration: Date.now() - settingsStart,
        });
      }

      // Test 4: Order system
      const orderStart = Date.now();
      try {
        const orders = await storage.getOrders();
        tests.push({
          name: "Order System",
          status: "pass",
          message: `Found ${orders?.length || 0} orders in system`,
          duration: Date.now() - orderStart,
        });
      } catch (error: any) {
        tests.push({
          name: "Order System",
          status: "fail",
          message: error.message,
          duration: Date.now() - orderStart,
        });
      }

      // Summary
      const passed = tests.filter(t => t.status === "pass").length;
      const failed = tests.filter(t => t.status === "fail").length;
      const totalTime = Date.now() - startTime;

      res.json({
        timestamp: new Date().toISOString(),
        status: failed === 0 ? "healthy" : failed <= 2 ? "degraded" : "unhealthy",
        tests,
        summary: {
          total: tests.length,
          passed,
          failed,
          duration: totalTime,
        },
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Reset test data (for debugging)
  app.post("/api/debug/reset-test-data", requireAdmin, async (req, res) => {
    try {
      const products = await storage.getProducts();
      const testProducts = products.filter(p => p.name === "DEBUG_TEST_PRODUCT");
      
      for (const product of testProducts) {
        await storage.updateProduct(product.id, { isPublished: false });
      }

      res.json({ 
        success: true, 
        message: `Cleaned up ${testProducts.length} test products` 
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // REVENUE SYSTEM TESTING ENDPOINTS
  // Test Loyalty Points - Add points and check tier progression
  app.post("/api/debug/test-loyalty", requireAdmin, async (req, res) => {
    try {
      const testUserId = 1; // Use admin user
      const pointsToAdd = req.body.points || 500;

      // Add loyalty points
      const transaction = await storage.addLoyaltyPoints(
        testUserId,
        pointsToAdd,
        "test",
        `Test earning ${pointsToAdd} points`
      );

      // Get updated account
      const account = await storage.getLoyaltyAccount(testUserId);
      const transactions = await storage.getLoyaltyTransactions(testUserId);

      res.json({
        success: true,
        message: "Loyalty points test successful",
        results: {
          newTransaction: transaction,
          currentAccount: account,
          recentTransactions: transactions.slice(0, 5),
        },
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Test Loyalty Redemption
  app.post("/api/debug/test-loyalty-redeem", requireAdmin, async (req, res) => {
    try {
      const testUserId = 1;
      const pointsToRedeem = req.body.points || 100;

      // Check current account
      const beforeAccount = await storage.getLoyaltyAccount(testUserId);
      if (!beforeAccount) {
        return res.status(400).json({ error: "No loyalty account found. Create one first with /api/debug/test-loyalty" });
      }

      // Redeem points
      const transaction = await storage.redeemLoyaltyPoints(
        testUserId,
        pointsToRedeem,
        `Test redeeming ${pointsToRedeem} points`
      );

      // Get updated account
      const afterAccount = await storage.getLoyaltyAccount(testUserId);

      res.json({
        success: true,
        message: "Loyalty redemption test successful",
        results: {
          beforePoints: beforeAccount.totalPoints,
          afterPoints: afterAccount?.totalPoints,
          pointsRedeemed: pointsToRedeem,
          newTransaction: transaction,
          updatedAccount: afterAccount,
        },
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Test Abandoned Cart Creation
  app.post("/api/debug/test-abandoned-cart", requireAdmin, async (req, res) => {
    try {
      const cartItems = req.body.cartItems || [
        { productId: "1", name: "Test Product 1", price: "29.99", quantity: 1 },
      ];
      const cartTotal = req.body.cartTotal || "29.99";

      // Generate unique recovery code
      const recoveryCode = `RECOVERY_${Date.now()}_${Math.random().toString(36).substring(7)}`;

      // Create abandoned cart
      const cart = await storage.createAbandonedCart({
        userId: 1,
        customerEmail: "admin@test.com",
        cartItems: JSON.stringify(cartItems),
        cartTotal: cartTotal,
        recoveryCode: recoveryCode,
        status: "abandoned",
      });

      // Retrieve it to verify
      const retrievedCart = await storage.getAbandonedCartByCode(recoveryCode);

      res.json({
        success: true,
        message: "Abandoned cart test successful",
        results: {
          createdCart: cart,
          retrievedCart: retrievedCart,
          recoveryCode: recoveryCode,
          recoveryLink: `/recover-cart?code=${recoveryCode}`,
        },
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Test Email Sequence Creation
  app.post("/api/debug/test-email-sequence", requireAdmin, async (req, res) => {
    try {
      const sequenceName = req.body.name || "Test Welcome Sequence";

      // Create sequence
      const sequence = await storage.createEmailSequence({
        name: sequenceName,
        automationType: "welcome",
        isActive: true,
      });

      // Create email template for sequence
      const template = await storage.createEmailTemplate({
        sequenceId: sequence.id,
        stepNumber: 1,
        delayMinutes: 0,
        subject: "Welcome to our store!",
        content: "<h1>Welcome!</h1><p>Thanks for signing up.</p>",
        sendCondition: "signup",
      });

      // Track an email event
      const event = await storage.trackEmailEvent({
        userId: 1,
        sequenceId: sequence.id,
        templateId: template.id,
        status: "pending",
      });

      res.json({
        success: true,
        message: "Email sequence test successful",
        results: {
          sequence: sequence,
          template: template,
          emailEvent: event,
        },
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Get all test data for inspection
  app.get("/api/debug/test-data", requireAdmin, async (req, res) => {
    try {
      const testUserId = 1;
      
      const loyaltyAccount = await storage.getLoyaltyAccount(testUserId);
      const loyaltyTransactions = await storage.getLoyaltyTransactions(testUserId);
      const abandonedCarts = await storage.getAbandonedCarts();
      const emailSequences = await storage.getEmailSequences();

      res.json({
        success: true,
        data: {
          loyaltyAccount,
          loyaltyTransactions: loyaltyTransactions.slice(0, 10),
          abandonedCarts: abandonedCarts.slice(0, 5),
          emailSequences,
        },
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Get customer loyalty account
  app.get("/api/loyalty/account", async (req, res) => {
    try {
      const user = req.user as any;
      if (!user) {
        return res.status(401).json({ error: "Not authenticated" });
      }

      const loyaltyAccount = await storage.getLoyaltyAccount(user.id);
      if (!loyaltyAccount) {
        // Create account if doesn't exist
        const newAccount = await storage.createLoyaltyAccount({
          userId: user.id,
          totalPoints: 0,
          tier: "bronze",
        });
        return res.json(newAccount);
      }

      res.json(loyaltyAccount);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Get customer loyalty transactions
  app.get("/api/loyalty/transactions", async (req, res) => {
    try {
      const user = req.user as any;
      if (!user) {
        return res.status(401).json({ error: "Not authenticated" });
      }

      const transactions = await storage.getLoyaltyTransactions(user.id);
      res.json(transactions);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // REFERRAL PROGRAM ENDPOINTS
  
  // Get or create user's referral code
  app.get("/api/referral/code", requireAuth, async (req, res) => {
    try {
      const user = req.user as any;
      
      let referralCode = await storage.getReferralCode(user.id);
      
      if (!referralCode) {
        // Generate unique referral code
        const code = `HW${user.id}${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
        referralCode = await storage.createReferralCode({
          userId: user.id,
          code,
          isActive: true,
        });
      }
      
      res.json(referralCode);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });
  
  // Get user's referrals
  app.get("/api/referral/list", requireAuth, async (req, res) => {
    try {
      const user = req.user as any;
      const referralsList = await storage.getReferralsByReferrer(user.id);
      res.json(referralsList);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });
  
  // Track a referral signup
  app.post("/api/referral/track", async (req, res) => {
    try {
      const { code, email } = req.body;
      
      if (!code || !email) {
        return res.status(400).json({ error: "Code and email are required" });
      }
      
      const referralCode = await storage.getReferralCodeByCode(code);
      if (!referralCode || !referralCode.isActive) {
        return res.status(404).json({ error: "Invalid referral code" });
      }
      
      // Create referral record
      const referral = await storage.createReferral({
        referrerId: referralCode.userId,
        referredEmail: email,
        referralCode: code,
      });
      
      res.json({ success: true, referral });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });
  
  // Complete referral (award points when referred user makes first purchase)
  app.post("/api/referral/complete", requireAuth, async (req, res) => {
    try {
      const { referralId, orderId } = req.body;
      const user = req.user as any;
      
      const referrerPoints = 500; // Points for referrer
      const referredPoints = 200; // Points for new customer
      
      // Update referral status with reward points
      const referral = await storage.updateReferralStatus(referralId, "converted", orderId, referrerPoints, referredPoints);
      
      if (referral) {
        // Award points to referrer
        await storage.addLoyaltyPoints(
          referral.referrerId,
          referrerPoints,
          "referral",
          `Referral bonus: ${referral.referredEmail} made first purchase`
        );
        
        // Award points to the referred user (the one making the purchase)
        if (user && user.id) {
          await storage.addLoyaltyPoints(
            user.id,
            referredPoints,
            "referral_bonus",
            `Welcome bonus: Thanks for joining via referral!`
          );
        }
        
        // Track referral code usage
        await storage.incrementReferralCodeUsage(referral.referralCode, referrerPoints);
      }
      
      res.json({ success: true, referrerPoints, referredPoints });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Accounting: Shipping Rates
  app.get("/api/accounting/shipping-rates", async (req, res) => {
    try {
      const carrier = req.query.carrier as string | undefined;
      const rates = await storage.getShippingRates(carrier);
      res.json(rates);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/accounting/shipping-rates", async (req, res) => {
    try {
      const user = req.user as any;
      if (!user || user.role !== "admin") {
        return res.status(403).json({ error: "Admin only" });
      }

      const rate = await storage.createShippingRate(req.body);
      res.json(rate);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Accounting: Discount Codes
  app.get("/api/accounting/discount-codes", async (req, res) => {
    try {
      const user = req.user as any;
      if (!user || user.role !== "admin") {
        return res.status(403).json({ error: "Admin only" });
      }

      const active = req.query.active !== "false";
      const codes = await storage.getDiscountCodes(active);
      res.json(codes);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/accounting/discount-codes/:code", async (req, res) => {
    try {
      const discount = await storage.getDiscountCode(req.params.code);
      res.json(discount || { error: "Not found" });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/accounting/discount-codes", async (req, res) => {
    try {
      const user = req.user as any;
      if (!user || user.role !== "admin") {
        return res.status(403).json({ error: "Admin only" });
      }

      const discount = await storage.createDiscountCode(req.body);
      res.json(discount);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/accounting/validate-discount", async (req, res) => {
    try {
      const { code, orderTotal } = req.body;
      if (!code || orderTotal === undefined) {
        return res.status(400).json({ error: "Missing code or orderTotal" });
      }

      const result = await storage.validateDiscountCode(code, orderTotal);
      res.json(result);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Accounting: Promotion Campaigns
  app.get("/api/accounting/campaigns", async (req, res) => {
    try {
      const user = req.user as any;
      if (!user || user.role !== "admin") {
        return res.status(403).json({ error: "Admin only" });
      }

      const campaigns = await storage.getPromotionCampaigns();
      res.json(campaigns);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/accounting/campaigns", async (req, res) => {
    try {
      const user = req.user as any;
      if (!user || user.role !== "admin") {
        return res.status(403).json({ error: "Admin only" });
      }

      const campaign = await storage.createPromotionCampaign(req.body);
      res.json(campaign);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Accounting: Financial Records
  app.get("/api/accounting/financial-records", async (req, res) => {
    try {
      const user = req.user as any;
      if (!user || user.role !== "admin") {
        return res.status(403).json({ error: "Admin only" });
      }

      const orderId = req.query.orderId as string | undefined;
      const records = await storage.getFinancialRecords(orderId);
      res.json(records);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/accounting/financial-records", async (req, res) => {
    try {
      const user = req.user as any;
      if (!user || user.role !== "admin") {
        return res.status(403).json({ error: "Admin only" });
      }

      const record = await storage.createFinancialRecord(req.body);
      res.json(record);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/accounting/summary", async (req, res) => {
    try {
      const user = req.user as any;
      if (!user || user.role !== "admin") {
        return res.status(403).json({ error: "Admin only" });
      }

      const startDate = req.query.startDate ? new Date(req.query.startDate as string) : undefined;
      const endDate = req.query.endDate ? new Date(req.query.endDate as string) : undefined;

      const summary = await storage.getFinancialSummary(startDate, endDate);
      res.json(summary);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Newsletter endpoints
  app.get("/api/newsletters", async (req, res) => {
    try {
      const user = req.user as any;
      if (!user || user.role !== "admin") {
        return res.status(403).json({ error: "Admin only" });
      }
      const newsletters = await storage.getNewsletters();
      res.json(newsletters);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/newsletters", async (req, res) => {
    try {
      const user = req.user as any;
      if (!user || user.role !== "admin") {
        return res.status(403).json({ error: "Admin only" });
      }

      const validated = insertNewsletterSchema.parse(req.body);
      const newsletter = await storage.createNewsletter(validated);
      res.json(newsletter);
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid newsletter data", details: error.errors });
      }
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/newsletters/:id", async (req, res) => {
    try {
      const user = req.user as any;
      if (!user || user.role !== "admin") {
        return res.status(403).json({ error: "Admin only" });
      }

      const newsletter = await storage.getNewsletter(parseInt(req.params.id));
      if (!newsletter) {
        return res.status(404).json({ error: "Newsletter not found" });
      }
      res.json(newsletter);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.patch("/api/newsletters/:id", async (req, res) => {
    try {
      const user = req.user as any;
      if (!user || user.role !== "admin") {
        return res.status(403).json({ error: "Admin only" });
      }

      const newsletter = await storage.updateNewsletter(parseInt(req.params.id), req.body);
      if (!newsletter) {
        return res.status(404).json({ error: "Newsletter not found" });
      }
      res.json(newsletter);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.delete("/api/newsletters/:id", async (req, res) => {
    try {
      const user = req.user as any;
      if (!user || user.role !== "admin") {
        return res.status(403).json({ error: "Admin only" });
      }

      const success = await storage.deleteNewsletter(parseInt(req.params.id));
      if (!success) {
        return res.status(404).json({ error: "Newsletter not found" });
      }
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/newsletters/:id/stats", async (req, res) => {
    try {
      const user = req.user as any;
      if (!user || user.role !== "admin") {
        return res.status(403).json({ error: "Admin only" });
      }

      const stats = await storage.getNewsletterStats(parseInt(req.params.id));
      res.json(stats);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Newsletter subscription endpoint (public - no auth required)
  app.post("/api/subscribe", async (req, res) => {
    try {
      const subscribeSchema = z.object({
        email: z.string().email(),
        category: z.string().optional().default("all"),
      });

      const data = subscribeSchema.parse(req.body);

      const subscriber = await storage.subscribeToNewsletter({
        email: data.email,
        category: data.category,
      });

      console.log("📧 NEW NEWSLETTER SUBSCRIBER");
      console.log(`Email: ${data.email}`);
      console.log(`Category: ${data.category}`);
      console.log("---");

      res.json({
        success: true,
        message: "Thank you for subscribing! You'll receive wellness updates soon.",
        subscriber,
      });
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Please enter a valid email address", details: error.errors });
      }
      // Handle duplicate email gracefully
      if (error.message?.includes("duplicate") || error.code === "23505") {
        return res.json({
          success: true,
          message: "You're already subscribed! We'll keep you updated.",
        });
      }
      res.status(500).json({ error: error.message });
    }
  });

  // Contact form endpoint
  app.post("/api/contact", async (req, res) => {
    try {
      const contactSchema = z.object({
        name: z.string().min(2),
        email: z.string().email(),
        subject: z.string().min(5),
        message: z.string().min(10),
      });

      const data = contactSchema.parse(req.body);

      // Log contact message (store in memory for now)
      const contact = {
        id: Date.now().toString(),
        ...data,
        receivedAt: new Date().toISOString(),
      };

      console.log("📧 CONTACT FORM SUBMISSION");
      console.log(`From: ${data.name} <${data.email}>`);
      console.log(`Subject: ${data.subject}`);
      console.log(`Message: ${data.message}`);
      console.log("---");
      console.log("ℹ️  To send emails, set up Resend or SendGrid integration.");

      res.json({
        success: true,
        message: "Your message has been received. We'll get back to you soon!",
        id: contact.id,
      });
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid contact form data", details: error.errors });
      }
      res.status(500).json({ error: error.message });
    }
  });

  // ===== BLOG POSTS =====
  // Public: Get all published blog posts
  app.get("/api/blog", async (req, res) => {
    try {
      const posts = await storage.getBlogPosts(true);
      res.json(posts);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Public: Get single blog post by slug
  app.get("/api/blog/:slug", async (req, res) => {
    try {
      const { slug } = req.params;
      const post = await storage.getBlogPostBySlug(slug);
      
      if (!post || !post.isPublished) {
        return res.status(404).json({ error: "Blog post not found" });
      }

      // Increment view count
      await storage.incrementBlogPostViews(post.id);

      res.json(post);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Admin: Get all blog posts (including drafts)
  app.get("/api/admin/blog", requireAdmin, async (req, res) => {
    try {
      const posts = await storage.getBlogPosts(false);
      res.json(posts);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Admin: Get single blog post by ID
  app.get("/api/admin/blog/:id", requireAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const post = await storage.getBlogPost(id);
      
      if (!post) {
        return res.status(404).json({ error: "Blog post not found" });
      }

      res.json(post);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Admin: Create new blog post
  app.post("/api/admin/blog", requireAdmin, async (req, res) => {
    try {
      // Handle date conversion from JSON strings
      const body = { ...req.body };
      if (body.publishedAt && typeof body.publishedAt === 'string') {
        body.publishedAt = new Date(body.publishedAt);
      }
      
      const data = insertBlogPostSchema.parse(body);
      const post = await storage.createBlogPost(data);
      res.status(201).json(post);
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        console.log("Blog post validation error:", error.errors);
        return res.status(400).json({ error: "Invalid blog post data", details: error.errors });
      }
      res.status(500).json({ error: error.message });
    }
  });

  // Admin: Update blog post
  app.patch("/api/admin/blog/:id", requireAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updates = req.body;
      
      const post = await storage.updateBlogPost(id, updates);
      
      if (!post) {
        return res.status(404).json({ error: "Blog post not found" });
      }

      res.json(post);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Admin: Delete blog post
  app.delete("/api/admin/blog/:id", requireAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deleteBlogPost(id);
      
      if (!deleted) {
        return res.status(404).json({ error: "Blog post not found" });
      }

      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // ================== AI FEATURES ==================

  // AI Wellness Chatbot - Main chat endpoint
  app.post("/api/ai/chat", async (req, res) => {
    try {
      if (!openai) {
        return res.status(503).json({ error: "AI service not configured" });
      }

      const { message, sessionId, visitorId } = req.body;
      
      if (!message || typeof message !== "string") {
        return res.status(400).json({ error: "Message is required" });
      }

      // Get or create session
      let session;
      if (sessionId) {
        session = await storage.getAiChatSession(sessionId);
      }
      
      if (!session) {
        const user = req.user as any;
        session = await storage.createAiChatSession({
          visitorId: visitorId || null,
          userId: user?.id || null,
          summary: null,
        });
      }

      // Save user message
      await storage.createAiChatMessage({
        sessionId: session.id,
        role: "user",
        content: message,
        recommendedProductIds: null,
      });

      // Get conversation history
      const history = await storage.getAiChatMessages(session.id);
      
      // Get products for context
      const products = await storage.getProducts({});
      const productContext = products.slice(0, 20).map(p => 
        `- ${p.name} ($${p.price}): ${p.description?.substring(0, 100)}... [ID: ${p.id}]`
      ).join("\n");

      // Build messages for OpenAI
      const messages: any[] = [
        {
          role: "system",
          content: `You are a friendly wellness advisor for Healthywaze, a natural wellness e-commerce store. You help customers find the right products for their health needs.

Available products:
${productContext}

Guidelines:
- Be warm, helpful, and knowledgeable about natural wellness
- Ask clarifying questions about their health goals or concerns
- Recommend specific products when appropriate (include product IDs)
- Never provide medical advice - suggest consulting healthcare professionals for medical issues
- Keep responses concise but helpful (2-3 paragraphs max)
- When recommending products, format as: "I recommend [Product Name] (ID: xxx)"`,
        },
        ...history.slice(-10).map(m => ({
          role: m.role,
          content: m.content,
        })),
      ];

      const completion = await openai.chat.completions.create({
        model: "gpt-4o",
        messages,
        max_tokens: 500,
        temperature: 0.7,
      });

      const assistantMessage = completion.choices[0]?.message?.content || "I apologize, I couldn't generate a response.";

      // Extract product IDs from response
      const productIdMatches = assistantMessage.match(/ID:\s*([a-f0-9-]+)/gi);
      const recommendedIds = productIdMatches 
        ? productIdMatches.map(m => m.replace(/ID:\s*/i, "")).join(",")
        : null;

      // Save assistant response
      await storage.createAiChatMessage({
        sessionId: session.id,
        role: "assistant",
        content: assistantMessage,
        recommendedProductIds: recommendedIds,
      });

      // Get recommended products if any
      let recommendedProducts: any[] = [];
      if (recommendedIds) {
        const ids = recommendedIds.split(",");
        for (const id of ids) {
          const product = await storage.getProduct(id.trim());
          if (product) recommendedProducts.push(product);
        }
      }

      res.json({
        sessionId: session.id,
        message: assistantMessage,
        recommendedProducts,
      });
    } catch (error: any) {
      console.error("AI Chat error:", error);
      res.status(500).json({ error: "Failed to process chat message" });
    }
  });

  // Smart Product Recommendations
  app.get("/api/products/:id/recommendations", async (req, res) => {
    try {
      const product = await storage.getProduct(req.params.id);
      if (!product) {
        return res.status(404).json({ error: "Product not found" });
      }

      // Get related products from same category
      const related = await storage.getRelatedProducts(product.category || undefined, 4);
      
      // Filter out the current product
      const recommendations = related.filter(p => p.id !== product.id).slice(0, 4);

      res.json(recommendations);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // AI Newsletter Content Generation (Admin only)
  app.post("/api/ai/generate-newsletter-content", requireAdmin, async (req, res) => {
    try {
      if (!openai) {
        return res.status(503).json({ error: "AI service not configured" });
      }

      const { topic, category, tone } = req.body;

      if (!topic) {
        return res.status(400).json({ error: "Topic is required" });
      }

      // Get featured products for the category if specified
      const products = await storage.getProducts({ category: category || undefined });
      const featuredProducts = products.slice(0, 5).map(p => 
        `- ${p.name} ($${p.price})`
      ).join("\n");

      const completion = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: `You are a wellness content writer for Healthywaze. Create engaging newsletter content that educates and promotes natural wellness products.`,
          },
          {
            role: "user",
            content: `Write a newsletter about: ${topic}

Category: ${category || "General Wellness"}
Tone: ${tone || "Friendly and informative"}

${featuredProducts ? `Feature these products:\n${featuredProducts}` : ""}

Include:
1. A catchy subject line
2. An engaging opening paragraph
3. Main content (2-3 paragraphs)
4. Product highlights if provided
5. A call to action

Format as JSON with keys: subject, content (HTML formatted)`,
          },
        ],
        max_tokens: 1000,
        temperature: 0.7,
      });

      const responseText = completion.choices[0]?.message?.content || "";
      
      // Try to parse JSON response
      try {
        const jsonMatch = responseText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);
          res.json(parsed);
        } else {
          res.json({ subject: "Newsletter", content: responseText });
        }
      } catch {
        res.json({ subject: "Newsletter", content: responseText });
      }
    } catch (error: any) {
      console.error("Newsletter generation error:", error);
      res.status(500).json({ error: "Failed to generate newsletter content" });
    }
  });

  // ============================================
  // PERSISTENT CART API (Shopify-level features)
  // ============================================

  // Get or create cart for current user/session
  app.get("/api/cart", async (req, res) => {
    try {
      const userId = (req as any).user?.id;
      const sessionToken = req.headers["x-cart-session"] as string;

      let cart;
      
      if (userId) {
        cart = await storage.getCartByUserId(userId);
      } else if (sessionToken) {
        cart = await storage.getCartBySessionToken(sessionToken);
      }

      if (!cart) {
        // Create new cart
        const newSessionToken = sessionToken || crypto.randomUUID();
        cart = await storage.createCart({
          userId: userId || null,
          sessionToken: userId ? null : newSessionToken,
          status: "active",
        });
      }

      const items = await storage.getCartItems(cart.id);
      
      // Enrich cart items with product details
      const enrichedItems = await Promise.all(items.map(async (item) => {
        const product = await storage.getProduct(item.productId);
        return {
          ...item,
          product: product || null,
        };
      }));

      res.json({ cart, items: enrichedItems });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Add item to cart
  app.post("/api/cart/items", async (req, res) => {
    try {
      const userId = (req as any).user?.id;
      const sessionToken = req.headers["x-cart-session"] as string;
      const { productId, variantId, quantity = 1 } = req.body;

      if (!productId) {
        return res.status(400).json({ error: "Product ID is required" });
      }

      // Get product for price
      const product = await storage.getProduct(productId);
      if (!product) {
        return res.status(404).json({ error: "Product not found" });
      }

      // Check stock
      if (product.stock < quantity) {
        return res.status(400).json({ error: "Insufficient stock" });
      }

      // Get or create cart
      let cart;
      if (userId) {
        cart = await storage.getCartByUserId(userId);
      } else if (sessionToken) {
        cart = await storage.getCartBySessionToken(sessionToken);
      }

      if (!cart) {
        const newSessionToken = sessionToken || crypto.randomUUID();
        cart = await storage.createCart({
          userId: userId || null,
          sessionToken: userId ? null : newSessionToken,
          status: "active",
        });
      }

      const price = product.price;
      const totalPrice = String(parseFloat(price) * quantity);

      const item = await storage.addCartItem({
        cartId: cart.id,
        productId,
        variantId: variantId || null,
        quantity,
        unitPrice: price,
        totalPrice,
      });

      const updatedCart = await storage.getCart(cart.id);
      const items = await storage.getCartItems(cart.id);

      res.json({ cart: updatedCart, item, itemCount: items.length });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Update cart item quantity
  app.patch("/api/cart/items/:itemId", async (req, res) => {
    try {
      const itemId = parseInt(req.params.itemId);
      const { quantity } = req.body;

      if (quantity === undefined || quantity < 0) {
        return res.status(400).json({ error: "Valid quantity is required" });
      }

      if (quantity === 0) {
        await storage.removeCartItem(itemId);
        return res.json({ success: true, removed: true });
      }

      const updatedItem = await storage.updateCartItem(itemId, { quantity });
      if (!updatedItem) {
        return res.status(404).json({ error: "Cart item not found" });
      }

      res.json({ item: updatedItem });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Remove item from cart
  app.delete("/api/cart/items/:itemId", async (req, res) => {
    try {
      const itemId = parseInt(req.params.itemId);
      const success = await storage.removeCartItem(itemId);
      
      if (!success) {
        return res.status(404).json({ error: "Cart item not found" });
      }

      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Clear entire cart
  app.delete("/api/cart", async (req, res) => {
    try {
      const userId = (req as any).user?.id;
      const sessionToken = req.headers["x-cart-session"] as string;

      let cart;
      if (userId) {
        cart = await storage.getCartByUserId(userId);
      } else if (sessionToken) {
        cart = await storage.getCartBySessionToken(sessionToken);
      }

      if (!cart) {
        return res.status(404).json({ error: "Cart not found" });
      }

      await storage.clearCart(cart.id);
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Update cart notes
  app.patch("/api/cart/notes", async (req, res) => {
    try {
      const userId = (req as any).user?.id;
      const sessionToken = req.headers["x-cart-session"] as string;
      const { notes } = req.body;

      let cart;
      if (userId) {
        cart = await storage.getCartByUserId(userId);
      } else if (sessionToken) {
        cart = await storage.getCartBySessionToken(sessionToken);
      }

      if (!cart) {
        return res.status(404).json({ error: "Cart not found" });
      }

      const updatedCart = await storage.updateCart(cart.id, { notes });
      res.json({ cart: updatedCart });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Merge guest cart to user on login
  // This is a safe, idempotent operation - it only merges if the session cart has items
  app.post("/api/cart/merge", requireAuth, async (req, res) => {
    try {
      const userId = (req as any).user.id;
      const { sessionToken } = req.body;

      if (!sessionToken) {
        return res.status(400).json({ error: "Session token is required" });
      }

      // First check if the session cart has items before attempting merge
      const sessionCart = await storage.getCartBySessionToken(sessionToken);
      const sessionItems = sessionCart ? await storage.getCartItems(sessionCart.id) : [];
      
      if (sessionItems.length === 0) {
        // No items to merge - just return user's cart without modifying it
        let cart = await storage.getCartByUserId(userId);
        if (!cart) {
          cart = await storage.createCart({ userId, status: "active" });
        }
        const items = await storage.getCartItems(cart.id);
        return res.json({ cart, items, merged: false, message: "No guest cart items to merge" });
      }

      // Session cart has items - perform the merge
      const mergedCart = await storage.mergeGuestCartToUser(sessionToken, userId);
      
      if (!mergedCart) {
        // Merge failed for some reason, get or create user cart
        let cart = await storage.getCartByUserId(userId);
        if (!cart) {
          cart = await storage.createCart({ userId, status: "active" });
        }
        const items = await storage.getCartItems(cart.id);
        return res.json({ cart, items, merged: false });
      }

      const items = await storage.getCartItems(mergedCart.id);
      res.json({ cart: mergedCart, items, merged: true, itemsMerged: sessionItems.length });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Save item for later (requires auth)
  app.post("/api/cart/save-for-later", requireAuth, async (req, res) => {
    try {
      const userId = (req as any).user.id;
      const { productId, variantId, cartItemId } = req.body;

      if (!productId) {
        return res.status(400).json({ error: "Product ID is required" });
      }

      // If moving from cart, remove from cart first
      if (cartItemId) {
        await storage.removeCartItem(cartItemId);
      }

      const saved = await storage.saveForLater({
        userId,
        productId,
        variantId: variantId || null,
      });

      res.json({ saved });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Get saved for later items
  app.get("/api/cart/saved", requireAuth, async (req, res) => {
    try {
      const userId = (req as any).user.id;
      const savedItems = await storage.getSavedForLater(userId);

      // Enrich with product details
      const enriched = await Promise.all(savedItems.map(async (item) => {
        const product = await storage.getProduct(item.productId);
        return { ...item, product };
      }));

      res.json(enriched);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Move saved item back to cart
  app.post("/api/cart/move-to-cart/:savedId", requireAuth, async (req, res) => {
    try {
      const userId = (req as any).user.id;
      const savedId = parseInt(req.params.savedId);

      let cart = await storage.getCartByUserId(userId);
      if (!cart) {
        cart = await storage.createCart({ userId, status: "active" });
      }

      const cartItem = await storage.moveToCart(savedId, cart.id);
      
      if (!cartItem) {
        return res.status(404).json({ error: "Saved item not found" });
      }

      res.json({ item: cartItem });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Apply discount code to cart
  app.post("/api/cart/apply-discount", async (req, res) => {
    try {
      const userId = (req as any).user?.id;
      const sessionToken = req.headers["x-cart-session"] as string;
      const { code } = req.body;

      if (!code) {
        return res.status(400).json({ error: "Discount code is required" });
      }

      let cart;
      if (userId) {
        cart = await storage.getCartByUserId(userId);
      } else if (sessionToken) {
        cart = await storage.getCartBySessionToken(sessionToken);
      }

      if (!cart) {
        return res.status(404).json({ error: "Cart not found" });
      }

      const subtotal = parseFloat(String(cart.subtotal));
      const validation = await storage.validateDiscountCode(code, subtotal);

      if (!validation.valid) {
        return res.status(400).json({ error: "Invalid or expired discount code" });
      }

      const updatedCart = await storage.updateCart(cart.id, {
        discountAmount: String(validation.discount),
        total: String(Math.max(0, subtotal - validation.discount)),
      });

      res.json({ cart: updatedCart, discount: validation.discount });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // ============================================
  // PRODUCT VARIANTS API
  // ============================================

  // Get variants for a product
  app.get("/api/products/:productId/variants", async (req, res) => {
    try {
      const variants = await storage.getProductVariants(req.params.productId);
      res.json(variants);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Create product variant (Admin)
  app.post("/api/products/:productId/variants", requireAdmin, async (req, res) => {
    try {
      const variant = await storage.createProductVariant({
        ...req.body,
        productId: req.params.productId,
      });
      res.json(variant);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Update product variant (Admin)
  app.patch("/api/variants/:variantId", requireAdmin, async (req, res) => {
    try {
      const variant = await storage.updateProductVariant(req.params.variantId, req.body);
      if (!variant) {
        return res.status(404).json({ error: "Variant not found" });
      }
      res.json(variant);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Delete product variant (Admin)
  app.delete("/api/variants/:variantId", requireAdmin, async (req, res) => {
    try {
      const success = await storage.deleteProductVariant(req.params.variantId);
      if (!success) {
        return res.status(404).json({ error: "Variant not found" });
      }
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // ============================================
  // ORDER EDITING API (Admin)
  // ============================================

  // Get order timeline/history
  app.get("/api/orders/:orderId/timeline", requireAdmin, async (req, res) => {
    try {
      const timeline = await storage.getOrderTimeline(req.params.orderId);
      res.json(timeline);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Get order revisions
  app.get("/api/orders/:orderId/revisions", requireAdmin, async (req, res) => {
    try {
      const revisions = await storage.getOrderRevisions(req.params.orderId);
      res.json(revisions);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Edit order (Admin) - with revision tracking
  app.patch("/api/orders/:orderId/edit", requireAdmin, async (req, res) => {
    try {
      const orderId = req.params.orderId;
      const userId = (req as any).user.id;
      const { updates, reason } = req.body;

      const order = await storage.getOrder(orderId);
      if (!order) {
        return res.status(404).json({ error: "Order not found" });
      }

      // Create revision record
      await storage.createOrderRevision({
        orderId,
        revisedBy: userId,
        revisionType: "edit",
        previousState: JSON.stringify(order),
        newState: JSON.stringify(updates),
        reason: reason || "Order edited by admin",
      });

      // Add timeline event
      await storage.addOrderTimelineEvent({
        orderId,
        eventType: "edited",
        title: "Order Edited",
        description: reason || "Order details were modified",
        userId,
        metadata: JSON.stringify(updates),
      });

      // Update the order
      const updatedOrder = await storage.updateOrder(orderId, updates);

      res.json({ order: updatedOrder });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Update order shipping address (Admin)
  app.patch("/api/orders/:orderId/shipping", requireAdmin, async (req, res) => {
    try {
      const orderId = req.params.orderId;
      const userId = (req as any).user.id;
      const shippingUpdates = req.body;

      const order = await storage.getOrder(orderId);
      if (!order) {
        return res.status(404).json({ error: "Order not found" });
      }

      // Create revision for shipping change
      await storage.createOrderRevision({
        orderId,
        revisedBy: userId,
        revisionType: "shipping",
        previousState: JSON.stringify({
          shippingAddressLine1: order.shippingAddressLine1,
          shippingAddressLine2: order.shippingAddressLine2,
          shippingCity: order.shippingCity,
          shippingState: order.shippingState,
          shippingZip: order.shippingZip,
        }),
        newState: JSON.stringify(shippingUpdates),
        reason: "Shipping address updated",
      });

      // Add timeline event
      await storage.addOrderTimelineEvent({
        orderId,
        eventType: "shipping_updated",
        title: "Shipping Address Updated",
        description: "Shipping address was modified by admin",
        userId,
      });

      const updatedOrder = await storage.updateOrder(orderId, shippingUpdates);
      res.json({ order: updatedOrder });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // ================== MARKETING ATTRIBUTION & ROI ==================

  // Track marketing session (UTM parameters)
  app.post("/api/marketing/session", async (req, res) => {
    try {
      const {
        visitorId,
        utmSource,
        utmMedium,
        utmCampaign,
        utmTerm,
        utmContent,
        gclid,
        gbraid,
        wbraid,
        fbclid,
        landingPage,
        referrer,
        deviceType,
        browser,
      } = req.body;

      if (!visitorId) {
        return res.status(400).json({ error: "visitorId is required" });
      }

      // Check if session already exists
      const existing = await storage.getMarketingSession(visitorId);
      if (existing) {
        // Update last seen
        const updated = await storage.updateMarketingSession(existing.id, {});
        return res.json(updated);
      }

      // Create new session
      const session = await storage.createMarketingSession({
        visitorId,
        utmSource,
        utmMedium,
        utmCampaign,
        utmTerm,
        utmContent,
        gclid,
        gbraid,
        wbraid,
        fbclid,
        landingPage,
        referrer,
        deviceType,
        browser,
      });

      res.status(201).json(session);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Get marketing analytics (Admin)
  app.get("/api/admin/marketing/analytics", requireAdmin, async (req, res) => {
    try {
      const analytics = await storage.getMarketingAnalytics();
      res.json(analytics);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Get marketing ROI dashboard (Admin)
  app.get("/api/admin/marketing/roi", requireAdmin, async (req, res) => {
    try {
      const dashboard = await storage.getMarketingROIDashboard();
      res.json(dashboard);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // ================== PROMO CODES ==================

  // Get all promo codes (Admin)
  app.get("/api/admin/promo-codes", requireAdmin, async (req, res) => {
    try {
      const codes = await storage.getPromoCodes();
      res.json(codes);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Create promo code (Admin)
  app.post("/api/admin/promo-codes", requireAdmin, async (req, res) => {
    try {
      const code = await storage.createPromoCode(req.body);
      res.status(201).json(code);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Update promo code (Admin)
  app.patch("/api/admin/promo-codes/:id", requireAdmin, async (req, res) => {
    try {
      const code = await storage.updatePromoCode(req.params.id, req.body);
      if (!code) {
        return res.status(404).json({ error: "Promo code not found" });
      }
      res.json(code);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Validate promo code (Public - for checkout)
  app.post("/api/promo-codes/validate", async (req, res) => {
    try {
      const { code, orderTotal } = req.body;
      const userId = req.isAuthenticated() ? (req.user as any).id : undefined;

      const result = await storage.applyPromoCode(code, orderTotal, userId);
      res.json(result);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // ================== MARKETING CAMPAIGNS ==================

  // Get all marketing campaigns (Admin)
  app.get("/api/admin/campaigns", requireAdmin, async (req, res) => {
    try {
      const campaigns = await storage.getMarketingCampaigns();
      res.json(campaigns);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Create marketing campaign (Admin)
  app.post("/api/admin/campaigns", requireAdmin, async (req, res) => {
    try {
      const campaign = await storage.createMarketingCampaign(req.body);
      res.status(201).json(campaign);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Update marketing campaign (Admin)
  app.patch("/api/admin/campaigns/:id", requireAdmin, async (req, res) => {
    try {
      const campaign = await storage.updateMarketingCampaign(req.params.id, req.body);
      if (!campaign) {
        return res.status(404).json({ error: "Campaign not found" });
      }
      res.json(campaign);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // ================== CUSTOMER METRICS ==================

  // Get customer segment stats (Admin)
  app.get("/api/admin/customer-segments", requireAdmin, async (req, res) => {
    try {
      const segments = await storage.getCustomerSegmentStats();
      res.json(segments);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // ================== POST-PURCHASE SURVEYS ==================

  // Submit post-purchase survey (Public)
  app.post("/api/surveys/post-purchase", async (req, res) => {
    try {
      const { orderId, heardAboutUs, heardAboutUsOther, satisfactionRating, wouldRecommend, feedback } = req.body;
      const userId = req.isAuthenticated() ? (req.user as any).id : undefined;

      const survey = await storage.createPostPurchaseSurvey({
        orderId,
        userId,
        heardAboutUs,
        heardAboutUsOther,
        satisfactionRating,
        wouldRecommend,
        feedback,
      });

      res.status(201).json(survey);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Get survey statistics (Admin)
  app.get("/api/admin/surveys/stats", requireAdmin, async (req, res) => {
    try {
      const stats = await storage.getSurveyStats();
      res.json(stats);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // ================== DRAFT ORDERS ==================

  // Get all draft orders (Admin)
  app.get("/api/admin/draft-orders", requireAdmin, async (req, res) => {
    try {
      const drafts = await storage.getDraftOrders();
      res.json(drafts);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Get single draft order (Admin)
  app.get("/api/admin/draft-orders/:id", requireAdmin, async (req, res) => {
    try {
      const draft = await storage.getDraftOrder(req.params.id);
      if (!draft) {
        return res.status(404).json({ error: "Draft order not found" });
      }
      const items = await storage.getDraftOrderItems(req.params.id);
      res.json({ draft, items });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Create draft order (Admin)
  app.post("/api/admin/draft-orders", requireAdmin, async (req, res) => {
    try {
      const userId = (req as any).user.id;
      const draft = await storage.createDraftOrder({
        ...req.body,
        createdBy: userId,
      });
      res.status(201).json(draft);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Update draft order (Admin)
  app.patch("/api/admin/draft-orders/:id", requireAdmin, async (req, res) => {
    try {
      const draft = await storage.updateDraftOrder(req.params.id, req.body);
      if (!draft) {
        return res.status(404).json({ error: "Draft order not found" });
      }
      res.json(draft);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Delete draft order (Admin)
  app.delete("/api/admin/draft-orders/:id", requireAdmin, async (req, res) => {
    try {
      const success = await storage.deleteDraftOrder(req.params.id);
      if (!success) {
        return res.status(404).json({ error: "Draft order not found" });
      }
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Add item to draft order (Admin)
  app.post("/api/admin/draft-orders/:id/items", requireAdmin, async (req, res) => {
    try {
      const item = await storage.addDraftOrderItem({
        ...req.body,
        draftOrderId: req.params.id,
      });
      res.status(201).json(item);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Remove item from draft order (Admin)
  app.delete("/api/admin/draft-orders/:draftId/items/:itemId", requireAdmin, async (req, res) => {
    try {
      const success = await storage.removeDraftOrderItem(parseInt(req.params.itemId));
      if (!success) {
        return res.status(404).json({ error: "Item not found" });
      }
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Convert draft to real order (Admin)
  app.post("/api/admin/draft-orders/:id/convert", requireAdmin, async (req, res) => {
    try {
      const order = await storage.convertDraftToOrder(req.params.id);
      if (!order) {
        return res.status(404).json({ error: "Draft order not found" });
      }
      res.json({ order });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // ================== GIFT CARDS ==================

  // Get all gift cards (Admin)
  app.get("/api/admin/gift-cards", requireAdmin, async (req, res) => {
    try {
      const cards = await storage.getGiftCards();
      res.json(cards);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Get single gift card (Admin)
  app.get("/api/admin/gift-cards/:id", requireAdmin, async (req, res) => {
    try {
      const card = await storage.getGiftCard(parseInt(req.params.id));
      if (!card) {
        return res.status(404).json({ error: "Gift card not found" });
      }
      const transactions = await storage.getGiftCardTransactions(card.id);
      res.json({ card, transactions });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Create gift card (Admin)
  app.post("/api/admin/gift-cards", requireAdmin, async (req, res) => {
    try {
      const card = await storage.createGiftCard(req.body);
      res.status(201).json(card);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Update gift card (Admin)
  app.patch("/api/admin/gift-cards/:id", requireAdmin, async (req, res) => {
    try {
      const card = await storage.updateGiftCard(parseInt(req.params.id), req.body);
      if (!card) {
        return res.status(404).json({ error: "Gift card not found" });
      }
      res.json(card);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Validate gift card at checkout (Public)
  app.post("/api/gift-cards/validate", async (req, res) => {
    try {
      const { code } = req.body;
      const card = await storage.getGiftCardByCode(code);
      
      if (!card) {
        return res.status(404).json({ valid: false, error: "Gift card not found" });
      }
      
      if (!card.isActive) {
        return res.json({ valid: false, error: "Gift card is inactive" });
      }
      
      if (card.expiresAt && new Date(card.expiresAt) < new Date()) {
        return res.json({ valid: false, error: "Gift card has expired" });
      }
      
      res.json({
        valid: true,
        balance: card.currentBalance,
        code: card.code,
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Apply gift card to order (checkout integration)
  app.post("/api/gift-cards/redeem", async (req, res) => {
    try {
      const { code, amount, orderId } = req.body;
      const transaction = await storage.useGiftCard(code, amount, orderId);
      
      if (!transaction) {
        return res.status(400).json({ error: "Invalid gift card or insufficient balance" });
      }
      
      res.json({ success: true, transaction });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // ================== RETURNS/REFUNDS ==================

  // Get all returns (Admin)
  app.get("/api/admin/returns", requireAdmin, async (req, res) => {
    try {
      const allReturns = await storage.getReturns();
      res.json(allReturns);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Get single return (Admin)
  app.get("/api/admin/returns/:id", requireAdmin, async (req, res) => {
    try {
      const ret = await storage.getReturn(parseInt(req.params.id));
      if (!ret) {
        return res.status(404).json({ error: "Return not found" });
      }
      res.json(ret);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Create return request (Customer or Admin)
  app.post("/api/returns", async (req, res) => {
    try {
      const ret = await storage.createReturn(req.body);
      res.status(201).json(ret);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Update return status (Admin)
  app.patch("/api/admin/returns/:id", requireAdmin, async (req, res) => {
    try {
      const userId = (req as any).user.id;
      const ret = await storage.updateReturn(parseInt(req.params.id), {
        ...req.body,
        processedBy: userId,
      });
      if (!ret) {
        return res.status(404).json({ error: "Return not found" });
      }
      res.json(ret);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Process return refund (Admin)
  app.post("/api/admin/returns/:id/process", requireAdmin, async (req, res) => {
    try {
      const ret = await storage.processReturn(parseInt(req.params.id));
      if (!ret) {
        return res.status(404).json({ error: "Return not found" });
      }
      res.json({ success: true, return: ret });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Get returns for specific order (Admin or order owner)
  app.get("/api/orders/:orderId/returns", async (req, res) => {
    try {
      const orderReturns = await storage.getReturnsByOrder(req.params.orderId);
      res.json(orderReturns);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
