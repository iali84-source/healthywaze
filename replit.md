# HealthyWaze - Trusted Wellness E-Commerce Platform

## Ownership & Intellectual Property
**HealthyWaze** is fully owned and operated by you. You retain 100% complete ownership of:

### Complete Asset Ownership
- **Domain & Brand:** healthywaze.com domain and "HealthyWaze" brand name
- **Logo & Visual Assets:** Professional HealthyWaze logo (stored in `attached_assets/generated_images/healthywaze_professional_wellness_logo.png`)
- **Source Code:** All frontend, backend, and database code in this Replit project
- **Database:** PostgreSQL database with all product data, customer data, orders, analytics, and business logic
- **Platform Architecture:** All features, systems, and integrations (Stripe, OpenAI, Google Analytics)
- **Intellectual Property:** All business logic, workflows, algorithms, and processes
- **Content:** All marketing copy, product descriptions, storefront content, and documentation

### What You Own (Complete List)
✓ All code written in this Replit project  
✓ HealthyWaze.com domain (or your custom domain)  
✓ Database structure and all stored data  
✓ Professional HealthyWaze logo and brand assets  
✓ All features: storefront, admin dashboard, loyalty program, analytics, payment processing  
✓ Customer data, order history, product catalog  
✓ Revenue systems: loyalty points, email automation, abandoned cart recovery  
✓ All integrations with third-party services (Stripe for payments, OpenAI for AI features, Google Analytics)  
✓ Design system (colors, typography, component library)  
✓ All documentation and deployment information  

**This is your business. You own it 100%.**

## Overview
HealthyWaze is a family-wellness-focused e-commerce platform that helps entrepreneurs test and scale wellness products through trusted, community-validated curation. Built on a foundation of authenticity and family trust rather than AI hype, the platform enables rapid product testing, efficient inventory management, and data-driven decision making with minimal daily involvement.

## User Preferences
Simple language, detailed explanations, and iterative development with clear communication. Functional programming paradigms where applicable. Clean, well-documented code. HealthyWaze brand must be consistently used across all marketing and user-facing materials.

## System Architecture

### UI/UX Decisions
The storefront and admin dashboard feature a mobile-first, responsive design using React 18, TypeScript, Tailwind CSS, and Shadcn UI. The design system incorporates a vibrant health & fitness theme with a primary color of vibrant green, secondary energetic orange, and an accent of refreshing teal. Typography uses the Inter font family, and spacing is consistent. Conversion optimization features like social proof, exit-intent popups, urgency timers, and low-stock badges are integrated throughout the customer journey.

### Technical Implementations
The frontend uses React with Wouter for routing and TanStack Query for data fetching. Analytics visualizations are powered by Recharts. The backend is built with Express.js, utilizing PostgreSQL with Drizzle ORM for permanent data storage. Stripe API handles secure payment processing, and OpenAI API powers AI features. Google Analytics 4 is integrated for comprehensive user tracking.

### Feature Specifications
**Storefront:** Includes a responsive product catalog with advanced filtering (category, price range, rating, search), detailed product pages, persistent shopping cart with guest checkout, Stripe integration, order tracking, and mobile-first design. Conversion optimization features like live social proof, exit-intent popups, free shipping progress bars, urgency timers, "X people viewing" counters, and enhanced low-stock badges are key.
**Admin Dashboard:** Provides an analytics dashboard with real-time metrics, product management with AI-powered description generation, enhanced order management, advanced AI-driven performance insights, and an AI Product Demand Analyzer that ranks all products by market demand with actionable recommendations for inventory prioritization and marketing focus.
**AI-Powered Features:** An AI Description Generator (OpenAI GPT-5) creates compelling product descriptions, an AI Product Categorization system organizes products into 23 wellness categories, an AI Performance Analyzer (OpenAI GPT-5) provides actionable insights from product data, and an AI Product Demand Analyzer ranks products by market demand using comprehensive analysis of trends, seasonality, competition levels, search demand, and price optimization opportunities.
**Advanced Product Filtering:** Backend-powered filtering system with real-time updates. Customers can filter by category, price range ($0-$200), minimum rating (1-5 stars), and text search (name/description). Filter UI includes a mobile-friendly sheet with price slider, rating buttons, and category list. Active filter count badge and "Clear Filters" functionality improve UX.
**Customer Address Management:** Complete address book system with CRUD operations, saved addresses, default address selection, and separate billing/shipping address support for checkout.
**Product Review System:** Verified purchase review system enforces that only customers who purchased a product can review it. Features include 1-5 star ratings, review titles and content, helpful vote counts, and automatic verification badges. Security enforced through ownership checks and Zod validation.
**Automation:** Features include automated inventory management, low stock alerts, persistent carts, one-click product publishing, shipping management, and customer notifications (email/SMS).
**Site Settings:** An admin interface allows customization of storefront elements like promo banners, hero sections, trust badges, and benefit messages, with real-time updates.
**Revenue Systems (NEW - Nov 27, 2025):**
  - **Loyalty Program:** Points-based system where customers earn 1 point per $1 spent. Automatic tiering (Bronze 0-999 pts → Silver 1000-2499 pts → Gold 2500-4999 pts → Platinum 5000+ pts) with increasing benefits per tier. Full transaction tracking for earning, redemption, and bonus points.
  - **Email Automation:** Multi-step sequence framework supporting Welcome, Post-Purchase, Re-engagement, and Abandoned Cart sequences. Each sequence can have multiple steps with configurable delays and HTML templates. Tracking system logs email delivery, opens, and clicks for performance analytics.
  - **Abandoned Cart Recovery:** Captures cart data when customers leave. Generates unique recovery codes for personalized recovery links. Triggers automated 3-email recovery sequence (1st at 1 hour, 2nd at 24 hours, 3rd at 72 hours) with incentive offers. Tracks conversion back to completed order.

### System Design Choices
The system supports a full CRUD API for products, orders, customer addresses, and product reviews. Analytics data retrieval and dedicated endpoints for AI features (description generation, categorization, performance analysis, demand ranking) and Stripe payments are fully implemented. Data models for products, orders, order items, customer addresses, reviews, and site settings are clearly defined using Drizzle ORM with Zod validation schemas. Security measures include server-side price validation, payment intent verification, stock checks, verified purchase enforcement for reviews, and ownership verification for address/review modifications. All multi-condition database queries use the `and()` operator to prevent filter bypasses.

### Revenue System Architecture (Nov 27, 2025)
**Loyalty Program** - 6 new database methods handle point earning/redemption with automatic tier progression. Points earned on purchase create transaction records. Tier thresholds: Bronze (default) → Silver (1000 pts) → Gold (2500 pts) → Platinum (5000 pts). Each tier level supports future benefits/discounts configuration.

**Email Automation** - Complete sequence management system with: (1) EmailSequence table defining automation types (welcome, post_purchase, abandoned_cart, re_engagement), (2) EmailTemplate table storing multi-step sequences with HTML content and delay timings, (3) CustomerEmailEvent table tracking individual email delivery status and engagement metrics (sent, opened, clicked).

**Abandoned Cart Recovery** - Standalone cart capture system that stores: cart items (JSON), cart total, unique recovery code, and reminder send timestamps. Status progression: abandoned → recovered/converted. Links to completed orders when customer recovers purchase. Integration points ready for 3-email recovery sequence automation.

### Marketing Attribution & ROI System (Dec 27, 2025)
Complete marketing analytics infrastructure for optimizing ad spend:
- **UTM Tracking:** Automatic capture of Google Ads (gclid), Facebook (fbclid), and all UTM parameters on landing
- **Marketing Sessions:** Database table tracks visitor journeys from first click to conversion with device/browser info
- **Promo Code System:** Create discount codes with percentage/fixed discounts, usage limits, campaign tracking, and revenue attribution
- **Campaign Management:** Track ad campaigns by platform (Google Ads, Facebook, Instagram, email, influencer) with spend, revenue, ROAS, and CPA
- **Customer Segments:** Automatic segmentation (new, active, at_risk, churned, vip) based on purchase history and lifetime value
- **Post-Purchase Surveys:** "How did you hear about us?" responses for attribution validation
- **Admin Dashboard:** /admin/marketing page with ROI metrics, attribution charts, promo code tracking, and campaign performance

Database tables: marketing_sessions, promo_codes, promo_code_usages, customer_metrics, post_purchase_surveys, marketing_campaigns

### Recent Changes (Dec 10, 2025)
**Blog System for Newsletter Archives**
- New `blog_posts` table stores articles as plain text/HTML (not PDFs)
- Public blog page at /blog with article grid and individual post pages
- Admin blog manager at /admin/blog for creating, editing, and publishing posts
- Blog navigation added to header and footer
- Posts can be marked as "From Newsletter" to indicate archived newsletters
- Features: categories, excerpts, view counts, featured images, draft/published status

**Homepage Conversion Optimization (Dec 6, 2025)**
- Complete homepage overhaul with family-focused messaging (no AI/tech hype)
- Hero section with compelling CTAs that scroll to products/story sections
- Product catalog grid with category filtering
- Email newsletter signup with database storage (POST /api/subscribe)
- Trust badges, benefits bar, social proof elements
- "Our Story" section emphasizing family-first values
- Mobile-responsive design throughout
- See OPTIMIZATION_ROADMAP.md for future improvements

### Known Issues
**LOGIN ERROR: 500 Internal Error (Nov 28, 2025)**
- **Status:** Backend login endpoint `/api/login` is working correctly
- **Issue:** Frontend displaying "500 Internal Error" when login succeeds
- **Root Cause:** Error handling in `client/src/lib/queryClient.ts`
- **Admin Account:** username "Imran", password "Didar@11825"

### Pending Implementation
- Fix login error handling
- API endpoints to trigger loyalty points on order completion
- Email sending integration (Resend/SendGrid API)
- Admin dashboard UI for loyalty tiers, email campaign builder, abandoned cart management
- Customer-facing loyalty dashboard showing points balance, tier progress, transaction history
- Abandoned cart recovery email triggers and conversion tracking
- Custom email addresses (@healthywaze.com) - requires DNS MX record setup

## External Dependencies

-   **Stripe**: Payment processing for secure transactions.
-   **OpenAI GPT-5**: AI-powered content generation (product descriptions) and performance analysis.
-   **Google Analytics 4**: Comprehensive tracking of user interactions and performance metrics.
-   **PostgreSQL**: Primary database for permanent data storage, accessed via Drizzle ORM.
-   **Twilio** (optional): For SMS notifications.
-   **Resend or SendGrid** (optional): For email notifications.