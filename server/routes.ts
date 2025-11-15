import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertProductSchema, insertOrderSchema, insertSiteSettingsSchema, type Order, type OrderItem } from "@shared/schema";
import Stripe from "stripe";
import OpenAI from "openai";
import { z } from "zod";
import multer from "multer";
import * as XLSX from "xlsx";
import { setupAuth } from "./auth";

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
      const products = await storage.getProducts();
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

  app.post("/api/products", async (req, res) => {
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

  app.patch("/api/products/:id", async (req, res) => {
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

  app.delete("/api/products/:id", async (req, res) => {
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

  // Excel Import endpoint
  app.post("/api/products/import", upload.single('file'), async (req, res) => {
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

          // Build product name from brand + product + size if available
          const brand = getColumnValue(['brand', 'Brand']);
          const productName = getColumnValue(['product', 'Product', 'Name', 'Product Name', 'Title']);
          const size = getColumnValue(['size', 'Size']);
          
          const fullName = [brand, productName, size]
            .filter(v => v && v.trim())
            .join(' ')
            .trim() || productName;

          // Validate required fields with helpful error messages
          if (!fullName) {
            throw new Error("Product name is required - need 'brand', 'product', 'size' or 'name' column");
          }

          const description = getColumnValue(['descriptions', 'description', 'desc', 'details']);
          if (!description) {
            throw new Error("Description is required - need 'descriptions' or 'description' column");
          }

          const priceValue = getColumnValue([
            'healthywaze.com',
            'healthywazecom',
            'healthywaze price',
            'price',
            'retail price',
            'selling price',
            'unit price'
          ]);
          if (!priceValue || parseFloat(priceValue) <= 0) {
            throw new Error("Valid price is required - need 'healthywaze.com' or 'price' column with value > 0");
          }

          // Get first available image from primary or fallback columns
          const imageUrl = getColumnValue([
            'image address primary',
            'image 2',
            'image 3', 
            'image 4',
            'image',
            'image url',
            'photo',
            'link'
          ]);

          const productData = {
            name: fullName,
            description: description,
            price: priceValue,
            productCost: String(getColumnValue(['cost', 'product cost', 'cost per item', 'supplier cost']) || "0"),
            imageUrl: imageUrl,
            stock: Number(getColumnValue(['stock', 'inventory', 'quantity', 'qty']) || 100),
            category: getColumnValue(['brand', 'category', 'type']),
            adSpend: String(getColumnValue(['ad spend', 'ads', 'marketing cost']) || "0"),
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

  // Orders
  app.get("/api/orders", async (req, res) => {
    try {
      const orders = await storage.getOrders();
      res.json(orders);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/orders/:id", async (req, res) => {
    try {
      const order = await storage.getOrder(req.params.id);
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
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
      const validated = insertOrderSchema.parse({
        ...orderData,
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

  app.patch("/api/orders/:id", async (req, res) => {
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

  // Analytics
  app.get("/api/analytics", async (req, res) => {
    try {
      const analytics = await storage.getAnalytics();
      res.json(analytics);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // AI: Generate product description
  app.post("/api/ai/generate-description", async (req, res) => {
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

  // AI: Analyze performance
  app.post("/api/ai/analyze-performance", async (req, res) => {
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

  // Site Settings
  app.get("/api/site-settings", async (req, res) => {
    try {
      const settings = await storage.getSiteSettings();
      res.json(settings);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.patch("/api/site-settings", async (req, res) => {
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

  // Customer Notifications (Email/SMS)
  app.post("/api/notifications/send", async (req, res) => {
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
