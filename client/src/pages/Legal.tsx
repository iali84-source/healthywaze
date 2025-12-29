import { useRoute } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Link } from "wouter";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

const COMPANY_NAME = "HealthyWaze";
const COMPANY_EMAIL = "support@healthywaze.com";
const EFFECTIVE_DATE = "December 29, 2025";

function PrivacyPolicy() {
  return (
    <div className="prose prose-sm max-w-none dark:prose-invert">
      <h2>Privacy Policy</h2>
      <p><strong>Effective Date:</strong> {EFFECTIVE_DATE}</p>
      
      <h3>1. Information We Collect</h3>
      <p>We collect information you provide directly to us, such as when you:</p>
      <ul>
        <li>Create an account or make a purchase</li>
        <li>Subscribe to our newsletter</li>
        <li>Contact us for support</li>
        <li>Participate in surveys or promotions</li>
      </ul>
      
      <p><strong>Personal Information:</strong> Name, email address, shipping address, billing address, phone number, and payment information.</p>
      <p><strong>Automatically Collected Information:</strong> IP address, browser type, device information, pages visited, and cookies.</p>
      
      <h3>2. How We Use Your Information</h3>
      <ul>
        <li>Process and fulfill your orders</li>
        <li>Send order confirmations and shipping updates</li>
        <li>Respond to your inquiries and provide customer support</li>
        <li>Send marketing communications (with your consent)</li>
        <li>Improve our website and services</li>
        <li>Detect and prevent fraud</li>
      </ul>
      
      <h3>3. Information Sharing</h3>
      <p>We do not sell your personal information. We may share information with:</p>
      <ul>
        <li><strong>Service Providers:</strong> Payment processors (Stripe), shipping carriers, email services</li>
        <li><strong>Legal Requirements:</strong> When required by law or to protect our rights</li>
        <li><strong>Business Transfers:</strong> In connection with a merger or acquisition</li>
      </ul>
      
      <h3>4. Data Security</h3>
      <p>We implement appropriate security measures to protect your information, including encryption, secure servers, and access controls. Payment information is processed securely through Stripe and never stored on our servers.</p>
      
      <h3>5. Your Rights</h3>
      <p>You have the right to:</p>
      <ul>
        <li>Access your personal information</li>
        <li>Correct inaccurate information</li>
        <li>Request deletion of your data</li>
        <li>Opt out of marketing communications</li>
        <li>Export your data</li>
      </ul>
      
      <h3>6. Cookies</h3>
      <p>We use cookies to enhance your experience. See our Cookie Policy for more details.</p>
      
      <h3>7. Children's Privacy</h3>
      <p>Our services are not intended for children under 13. We do not knowingly collect information from children.</p>
      
      <h3>8. Changes to This Policy</h3>
      <p>We may update this policy periodically. We will notify you of significant changes via email or website notice.</p>
      
      <h3>9. Contact Us</h3>
      <p>For privacy-related questions: <a href={`mailto:${COMPANY_EMAIL}`}>{COMPANY_EMAIL}</a></p>
    </div>
  );
}

function TermsOfService() {
  return (
    <div className="prose prose-sm max-w-none dark:prose-invert">
      <h2>Terms of Service</h2>
      <p><strong>Effective Date:</strong> {EFFECTIVE_DATE}</p>
      
      <h3>1. Acceptance of Terms</h3>
      <p>By accessing or using {COMPANY_NAME}, you agree to be bound by these Terms of Service. If you do not agree, please do not use our services.</p>
      
      <h3>2. Account Registration</h3>
      <ul>
        <li>You must provide accurate and complete information</li>
        <li>You are responsible for maintaining your account security</li>
        <li>You must be at least 18 years old to create an account</li>
        <li>One account per person is permitted</li>
      </ul>
      
      <h3>3. Products and Orders</h3>
      <ul>
        <li>All product descriptions are accurate to the best of our knowledge</li>
        <li>Prices are subject to change without notice</li>
        <li>We reserve the right to limit quantities or refuse orders</li>
        <li>Orders are subject to availability</li>
      </ul>
      
      <h3>4. Payment</h3>
      <ul>
        <li>We accept major credit cards and other payment methods as displayed</li>
        <li>Payment is processed securely through Stripe</li>
        <li>You agree to pay all charges at the prices in effect when incurred</li>
      </ul>
      
      <h3>5. Shipping and Delivery</h3>
      <ul>
        <li>Shipping times are estimates and not guaranteed</li>
        <li>Risk of loss passes to you upon delivery to the carrier</li>
        <li>We are not responsible for delays caused by carriers or customs</li>
      </ul>
      
      <h3>6. Intellectual Property</h3>
      <p>All content on this website, including text, images, logos, and software, is the property of {COMPANY_NAME} and protected by intellectual property laws.</p>
      
      <h3>7. Prohibited Conduct</h3>
      <p>You agree not to:</p>
      <ul>
        <li>Use the site for unlawful purposes</li>
        <li>Attempt to gain unauthorized access</li>
        <li>Interfere with the site's operation</li>
        <li>Submit false reviews or content</li>
      </ul>
      
      <h3>8. Disclaimer of Warranties</h3>
      <p>Our products are provided "as is" without warranties of any kind. We make no claims about the effectiveness of wellness products for specific health conditions. Consult a healthcare professional before starting any wellness regimen.</p>
      
      <h3>9. Limitation of Liability</h3>
      <p>To the maximum extent permitted by law, {COMPANY_NAME} shall not be liable for any indirect, incidental, or consequential damages.</p>
      
      <h3>10. Governing Law</h3>
      <p>These terms are governed by the laws of the United States. Any disputes shall be resolved in the courts of the state where {COMPANY_NAME} is headquartered.</p>
      
      <h3>11. Contact</h3>
      <p>Questions about these terms: <a href={`mailto:${COMPANY_EMAIL}`}>{COMPANY_EMAIL}</a></p>
    </div>
  );
}

function CookiePolicy() {
  return (
    <div className="prose prose-sm max-w-none dark:prose-invert">
      <h2>Cookie Policy</h2>
      <p><strong>Effective Date:</strong> {EFFECTIVE_DATE}</p>
      
      <h3>What Are Cookies?</h3>
      <p>Cookies are small text files stored on your device when you visit our website. They help us provide a better experience by remembering your preferences and understanding how you use our site.</p>
      
      <h3>Types of Cookies We Use</h3>
      
      <h4>Essential Cookies</h4>
      <p>Required for the website to function. These enable:</p>
      <ul>
        <li>Shopping cart functionality</li>
        <li>User authentication and session management</li>
        <li>Security features</li>
      </ul>
      <p><em>These cookies cannot be disabled.</em></p>
      
      <h4>Analytics Cookies</h4>
      <p>Help us understand how visitors interact with our website:</p>
      <ul>
        <li>Google Analytics - tracks page views, session duration, and user behavior</li>
        <li>Marketing attribution - tracks which ads and campaigns bring you here</li>
      </ul>
      
      <h4>Marketing Cookies</h4>
      <p>Used to deliver relevant advertisements and track campaign effectiveness:</p>
      <ul>
        <li>UTM parameters for campaign tracking</li>
        <li>Facebook Pixel (if enabled)</li>
        <li>Google Ads conversion tracking</li>
      </ul>
      
      <h4>Preference Cookies</h4>
      <p>Remember your preferences:</p>
      <ul>
        <li>Theme preference (light/dark mode)</li>
        <li>Recently viewed products</li>
      </ul>
      
      <h3>Managing Cookies</h3>
      <p>You can control cookies through:</p>
      <ul>
        <li><strong>Our Cookie Banner:</strong> Accept or customize cookie preferences when you first visit</li>
        <li><strong>Browser Settings:</strong> Most browsers allow you to block or delete cookies</li>
        <li><strong>Opt-Out Links:</strong> Google Analytics opt-out browser add-on</li>
      </ul>
      
      <h3>Third-Party Cookies</h3>
      <p>Some cookies are set by third parties, including:</p>
      <ul>
        <li>Stripe (payment processing)</li>
        <li>Google Analytics (website analytics)</li>
      </ul>
      
      <h3>Updates to This Policy</h3>
      <p>We may update this Cookie Policy periodically. Check this page for the latest information.</p>
      
      <h3>Contact</h3>
      <p>Questions about cookies: <a href={`mailto:${COMPANY_EMAIL}`}>{COMPANY_EMAIL}</a></p>
    </div>
  );
}

function ReturnPolicy() {
  return (
    <div className="prose prose-sm max-w-none dark:prose-invert">
      <h2>Return & Refund Policy</h2>
      <p><strong>Effective Date:</strong> {EFFECTIVE_DATE}</p>
      
      <h3>Our Satisfaction Guarantee</h3>
      <p>At {COMPANY_NAME}, we stand behind the quality of our wellness products. If you're not completely satisfied with your purchase, we're here to help.</p>
      
      <h3>Return Eligibility</h3>
      <p>Items are eligible for return if:</p>
      <ul>
        <li>Returned within 30 days of delivery</li>
        <li>Unopened and in original packaging</li>
        <li>Accompanied by proof of purchase</li>
      </ul>
      
      <h3>Non-Returnable Items</h3>
      <p>For health and safety reasons, the following cannot be returned:</p>
      <ul>
        <li>Opened supplements or consumables</li>
        <li>Personal care items that have been used</li>
        <li>Gift cards</li>
        <li>Final sale items (marked at checkout)</li>
      </ul>
      
      <h3>How to Return</h3>
      <ol>
        <li><strong>Contact Us:</strong> Email {COMPANY_EMAIL} with your order number and reason for return</li>
        <li><strong>Receive Authorization:</strong> We'll send you a Return Authorization (RA) number and instructions</li>
        <li><strong>Ship the Item:</strong> Pack the item securely and ship to the provided address</li>
        <li><strong>Refund Processing:</strong> Refunds are processed within 5-7 business days of receiving the return</li>
      </ol>
      
      <h3>Refund Method</h3>
      <ul>
        <li>Refunds are issued to the original payment method</li>
        <li>Original shipping charges are non-refundable unless the return is due to our error</li>
        <li>Return shipping costs are the customer's responsibility unless the item was defective</li>
      </ul>
      
      <h3>Damaged or Defective Items</h3>
      <p>If you receive a damaged or defective item:</p>
      <ul>
        <li>Contact us within 48 hours of delivery</li>
        <li>Include photos of the damage</li>
        <li>We will arrange free return shipping and send a replacement or full refund</li>
      </ul>
      
      <h3>Exchanges</h3>
      <p>We do not offer direct exchanges. Please return the original item for a refund and place a new order for the desired item.</p>
      
      <h3>Questions?</h3>
      <p>Contact our customer service team: <a href={`mailto:${COMPANY_EMAIL}`}>{COMPANY_EMAIL}</a></p>
    </div>
  );
}

export default function Legal() {
  const [, params] = useRoute("/legal/:section");
  const section = params?.section || "privacy";

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-6">
          <Link href="/">
            <Button variant="ghost" size="sm" data-testid="button-back-home">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Button>
          </Link>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">{COMPANY_NAME} Legal</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs value={section} className="w-full">
              <TabsList className="grid w-full grid-cols-4" data-testid="tabs-legal">
                <TabsTrigger value="privacy" asChild>
                  <Link href="/legal/privacy" data-testid="tab-privacy">Privacy</Link>
                </TabsTrigger>
                <TabsTrigger value="terms" asChild>
                  <Link href="/legal/terms" data-testid="tab-terms">Terms</Link>
                </TabsTrigger>
                <TabsTrigger value="cookies" asChild>
                  <Link href="/legal/cookies" data-testid="tab-cookies">Cookies</Link>
                </TabsTrigger>
                <TabsTrigger value="returns" asChild>
                  <Link href="/legal/returns" data-testid="tab-returns">Returns</Link>
                </TabsTrigger>
              </TabsList>
              
              <ScrollArea className="h-[60vh] mt-6 pr-4">
                <TabsContent value="privacy" className="mt-0">
                  <PrivacyPolicy />
                </TabsContent>
                <TabsContent value="terms" className="mt-0">
                  <TermsOfService />
                </TabsContent>
                <TabsContent value="cookies" className="mt-0">
                  <CookiePolicy />
                </TabsContent>
                <TabsContent value="returns" className="mt-0">
                  <ReturnPolicy />
                </TabsContent>
              </ScrollArea>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
