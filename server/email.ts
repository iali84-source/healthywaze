import type { Order } from "@shared/schema";

interface EmailTemplate {
  subject: string;
  html: string;
}

interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
  from?: string;
}

export async function sendEmail(options: SendEmailOptions): Promise<boolean> {
  const RESEND_API_KEY = process.env.RESEND_API_KEY;
  
  if (!RESEND_API_KEY) {
    console.log("[EMAIL] Resend API key not configured. Email not sent:", {
      to: options.to,
      subject: options.subject,
    });
    return false;
  }

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: options.from || "HealthyWaze <noreply@healthywaze.com>",
        to: options.to,
        subject: options.subject,
        html: options.html,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error("[EMAIL] Failed to send email:", error);
      return false;
    }

    console.log("[EMAIL] Email sent successfully to:", options.to);
    return true;
  } catch (error) {
    console.error("[EMAIL] Error sending email:", error);
    return false;
  }
}

const baseStyles = `
  body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f4f4f4; }
  .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
  .header { background: linear-gradient(135deg, #16a34a 0%, #15803d 100%); color: white; padding: 32px; text-align: center; }
  .header h1 { margin: 0; font-size: 28px; font-weight: 700; }
  .content { padding: 32px; }
  .footer { background: #f8f9fa; padding: 24px; text-align: center; font-size: 12px; color: #666; }
  .button { display: inline-block; background: #16a34a; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; font-weight: 600; margin: 16px 0; }
  .button:hover { background: #15803d; }
  .order-item { display: flex; padding: 12px 0; border-bottom: 1px solid #eee; }
  .order-total { font-size: 20px; font-weight: bold; color: #16a34a; margin-top: 16px; }
`;

export function getWelcomeEmailTemplate(customerName: string): EmailTemplate {
  return {
    subject: "Welcome to HealthyWaze! 🌿",
    html: `
      <!DOCTYPE html>
      <html>
      <head><style>${baseStyles}</style></head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Welcome to HealthyWaze!</h1>
          </div>
          <div class="content">
            <p>Hi ${customerName},</p>
            <p>Thank you for joining the HealthyWaze family! We're thrilled to have you.</p>
            <p>At HealthyWaze, we curate trusted wellness products for families who care about health, quality, and authenticity.</p>
            <h3>What's Next?</h3>
            <ul>
              <li>🛍️ Browse our curated wellness products</li>
              <li>💎 Start earning loyalty points (1 point per $1 spent)</li>
              <li>📧 Get exclusive deals and wellness tips</li>
            </ul>
            <a href="https://healthywaze.com" class="button">Start Shopping</a>
            <p>Questions? Just reply to this email - we're here to help!</p>
            <p>Stay well,<br><strong>The HealthyWaze Team</strong></p>
          </div>
          <div class="footer">
            <p>HealthyWaze - Trusted Wellness for Your Family</p>
            <p><a href="https://healthywaze.com/legal/privacy">Privacy Policy</a> | <a href="https://healthywaze.com/legal/unsubscribe">Unsubscribe</a></p>
          </div>
        </div>
      </body>
      </html>
    `,
  };
}

export function getOrderConfirmationTemplate(order: Order, items: Array<{ productName: string; quantity: number; productPrice: string }>): EmailTemplate {
  const itemsHtml = items.map(item => `
    <div class="order-item">
      <span>${item.productName} × ${item.quantity}</span>
      <span style="margin-left: auto;">$${(parseFloat(item.productPrice) * item.quantity).toFixed(2)}</span>
    </div>
  `).join("");

  return {
    subject: `Order Confirmed! #${order.id.substring(0, 8).toUpperCase()}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head><style>${baseStyles}</style></head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Order Confirmed! ✓</h1>
          </div>
          <div class="content">
            <p>Hi ${order.customerName},</p>
            <p>Great news! Your order has been confirmed and is being prepared.</p>
            <h3>Order Details</h3>
            <p><strong>Order #:</strong> ${order.id.substring(0, 8).toUpperCase()}</p>
            <div style="background: #f8f9fa; padding: 16px; border-radius: 8px; margin: 16px 0;">
              ${itemsHtml}
              <div class="order-total">Total: $${order.total}</div>
            </div>
            <h3>Shipping To:</h3>
            <p>${order.shippingAddress}</p>
            <a href="https://healthywaze.com/track-order?id=${order.id}" class="button">Track Your Order</a>
            <p>Thank you for shopping with HealthyWaze!</p>
          </div>
          <div class="footer">
            <p>HealthyWaze - Trusted Wellness for Your Family</p>
          </div>
        </div>
      </body>
      </html>
    `,
  };
}

export function getAbandonedCartTemplate(customerName: string, recoveryCode: string, cartTotal: string): EmailTemplate {
  return {
    subject: "You left something behind! 🛒",
    html: `
      <!DOCTYPE html>
      <html>
      <head><style>${baseStyles}</style></head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Don't Miss Out!</h1>
          </div>
          <div class="content">
            <p>Hi ${customerName},</p>
            <p>We noticed you left some wellness essentials in your cart. Your items are waiting for you!</p>
            <div style="background: #fff3cd; padding: 16px; border-radius: 8px; margin: 16px 0; border-left: 4px solid #ffc107;">
              <strong>Cart Value:</strong> $${cartTotal}
            </div>
            <p>Complete your order now and take the next step toward a healthier lifestyle.</p>
            <a href="https://healthywaze.com/checkout?recover=${recoveryCode}" class="button">Complete Your Order</a>
            <p style="font-size: 14px; color: #666;">This link will restore your cart items.</p>
          </div>
          <div class="footer">
            <p>HealthyWaze - Trusted Wellness for Your Family</p>
            <p><a href="https://healthywaze.com/legal/unsubscribe">Unsubscribe</a></p>
          </div>
        </div>
      </body>
      </html>
    `,
  };
}

export function getPostPurchaseTemplate(customerName: string, orderId: string, pointsEarned: number): EmailTemplate {
  return {
    subject: "Thank you for your purchase! + You earned points 🎉",
    html: `
      <!DOCTYPE html>
      <html>
      <head><style>${baseStyles}</style></head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Thank You! 🙏</h1>
          </div>
          <div class="content">
            <p>Hi ${customerName},</p>
            <p>Your order has been shipped and is on its way! We hope you love your wellness products.</p>
            <div style="background: #d4edda; padding: 20px; border-radius: 8px; margin: 16px 0; text-align: center;">
              <h2 style="color: #155724; margin: 0;">You earned ${pointsEarned} loyalty points!</h2>
              <p style="color: #155724; margin: 8px 0 0 0;">Check your loyalty dashboard to see your progress.</p>
            </div>
            <h3>How was your experience?</h3>
            <p>We'd love to hear from you! Leave a review and help other families discover trusted wellness products.</p>
            <a href="https://healthywaze.com/order-confirmation?id=${orderId}" class="button">View Order & Leave Review</a>
            <p>Questions about your order? Just reply to this email.</p>
            <p>Stay healthy,<br><strong>The HealthyWaze Team</strong></p>
          </div>
          <div class="footer">
            <p>HealthyWaze - Trusted Wellness for Your Family</p>
          </div>
        </div>
      </body>
      </html>
    `,
  };
}

export function getReEngagementTemplate(customerName: string): EmailTemplate {
  return {
    subject: "We miss you! Here's 10% off your next order 💚",
    html: `
      <!DOCTYPE html>
      <html>
      <head><style>${baseStyles}</style></head>
      <body>
        <div class="container">
          <div class="header">
            <h1>We Miss You!</h1>
          </div>
          <div class="content">
            <p>Hi ${customerName},</p>
            <p>It's been a while since your last visit to HealthyWaze. We've added new wellness products we think you'll love!</p>
            <div style="background: linear-gradient(135deg, #16a34a 0%, #15803d 100%); color: white; padding: 24px; border-radius: 8px; margin: 16px 0; text-align: center;">
              <h2 style="margin: 0; font-size: 32px;">10% OFF</h2>
              <p style="margin: 8px 0 0 0;">Use code: <strong>COMEBACK10</strong></p>
            </div>
            <p>Don't miss out on our latest arrivals and exclusive wellness tips.</p>
            <a href="https://healthywaze.com" class="button">Shop Now</a>
            <p style="font-size: 12px; color: #666;">Offer valid for 7 days. One use per customer.</p>
          </div>
          <div class="footer">
            <p>HealthyWaze - Trusted Wellness for Your Family</p>
            <p><a href="https://healthywaze.com/legal/unsubscribe">Unsubscribe</a></p>
          </div>
        </div>
      </body>
      </html>
    `,
  };
}

export async function sendWelcomeEmail(to: string, customerName: string): Promise<boolean> {
  const template = getWelcomeEmailTemplate(customerName);
  return sendEmail({ to, ...template });
}

export async function sendOrderConfirmation(to: string, order: Order, items: Array<{ productName: string; quantity: number; productPrice: string }>): Promise<boolean> {
  const template = getOrderConfirmationTemplate(order, items);
  return sendEmail({ to, ...template });
}

export async function sendAbandonedCartEmail(to: string, customerName: string, recoveryCode: string, cartTotal: string): Promise<boolean> {
  const template = getAbandonedCartTemplate(customerName, recoveryCode, cartTotal);
  return sendEmail({ to, ...template });
}

export async function sendPostPurchaseEmail(to: string, customerName: string, orderId: string, pointsEarned: number): Promise<boolean> {
  const template = getPostPurchaseTemplate(customerName, orderId, pointsEarned);
  return sendEmail({ to, ...template });
}

export async function sendReEngagementEmail(to: string, customerName: string): Promise<boolean> {
  const template = getReEngagementTemplate(customerName);
  return sendEmail({ to, ...template });
}
