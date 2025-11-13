import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertProductSchema, insertOrderSchema, insertSiteSettingsSchema } from "@shared/schema";
import Stripe from "stripe";
import OpenAI from "openai";
import { z } from "zod";

// Reference for Stripe integration from blueprint:javascript_stripe
const stripe = process.env.STRIPE_SECRET_KEY 
  ? new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: "2023-10-16" })
  : null;

// Reference for OpenAI integration from blueprint:javascript_openai
// The newest OpenAI model is "gpt-5" which was released August 7, 2025. do not change this unless explicitly requested by the user
const openai = process.env.OPENAI_API_KEY
  ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  : null;

export async function registerRoutes(app: Express): Promise<Server> {
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
      const { items, ...orderData } = req.body;
      
      // Validate order data
      const validated = insertOrderSchema.parse(orderData);
      
      // Create order
      const order = await storage.createOrder(validated);
      
      // Create order items and update inventory
      if (items && Array.isArray(items)) {
        for (const item of items) {
          await storage.createOrderItem({
            orderId: order.id,
            productId: item.productId,
            productName: item.productName,
            productPrice: item.productPrice,
            quantity: item.quantity,
          });
        }
      }
      
      res.status(201).json(order);
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
            role: "system",
            content: "You are a professional e-commerce copywriter. Create compelling, SEO-optimized product descriptions that highlight benefits and create desire. Keep descriptions concise (2-3 sentences) but persuasive.",
          },
          {
            role: "user",
            content: `Write a compelling product description for: ${name}`,
          },
        ],
        max_completion_tokens: 200,
      });

      const description = response.choices[0].message.content;
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
        max_completion_tokens: 800,
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
  app.post("/api/create-payment-intent", async (req, res) => {
    try {
      if (!stripe) {
        return res.status(503).json({ 
          message: "Payment processing requires STRIPE_SECRET_KEY to be configured" 
        });
      }

      const { amount } = req.body;
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(amount * 100), // Convert to cents
        currency: "usd",
      });
      res.json({ clientSecret: paymentIntent.client_secret });
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
