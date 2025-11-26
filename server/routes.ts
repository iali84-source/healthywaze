import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertProductSchema, insertOrderSchema, insertSiteSettingsSchema, insertCustomerAddressSchema, insertReviewSchema, type Order, type OrderItem } from "@shared/schema";
import Stripe from "stripe";
import OpenAI from "openai";
import { z } from "zod";
import multer from "multer";
import * as XLSX from "xlsx";
import { setupAuth, requireAuth, requireAdmin } from "./auth";

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

      const prompt = `You are a market demand analysis expert for health & wellness e-commerce. Analyze the following product catalog and rank products by market demand potential.

PRODUCT DATA:
${JSON.stringify(productSummaries, null, 2)}

For each product, return a JSON object with these exact fields. Ensure demandScore, trendScore are numbers 1-10.
Return ONLY a JSON array, no other text.

Return this exact structure for each product, sorted by demandScore highest first:
[
  {
    "productId": "product-id-here",
    "productName": "exact-product-name-from-list",
    "demandScore": 8,
    "trendScore": 9,
    "seasonality": "Peak months",
    "competitionLevel": "High/Medium/Low",
    "priceOptimization": "Is price competitive",
    "searchDemand": "Search volume estimate",
    "recommendation": "Marketing action",
    "insights": "Key insight"
  }
]`;

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
        rawAnalysis = Array.isArray(parsedResponse) ? parsedResponse : (parsedResponse.products || parsedResponse.analysis || []);
      } catch (parseError) {
        console.error("JSON parse error:", parseError);
        return res.status(500).json({ message: "Failed to parse AI response" });
      }

      // Create maps for matching: product name -> product id
      const nameMap = new Map(products.map(p => [p.name.trim().toLowerCase(), p.id]));

      // Match AI results to actual products by name (most reliable method)
      let analysis = rawAnalysis
        .filter((item: any) => item && item.productName)
        .map((item: any) => {
          const productName = String(item.productName || "").trim();
          const nameLower = productName.toLowerCase();
          const matchedId = nameMap.get(nameLower) || "";
          
          return {
            productId: matchedId,
            productName: productName,
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

  const httpServer = createServer(app);

  return httpServer;
}
