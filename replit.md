# Your Trusted Family Loving Remedies - AI-Powered E-Commerce Platform

## Overview
Your Trusted Family Loving Remedies is an AI-powered e-commerce platform designed to help entrepreneurs operate a data-driven online store with minimal daily involvement. It integrates AI for intelligent insights and automation to streamline operations, enabling rapid product testing and efficient management. The platform aims to provide a competitive edge in the e-commerce market by leveraging advanced AI features and comprehensive analytics to maximize sales and minimize operational overhead.

## User Preferences
I prefer simple language and detailed explanations. I want iterative development with clear communication on progress. Ask before making major changes. I prefer functional programming paradigms where applicable and expect clean, well-documented code. Do not make changes to the folder `Z` and do not make changes to the file `Y`.

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

### CRITICAL BUG - Next Session Priority
**LOGIN ERROR: 500 Internal Error (Nov 28, 2025, 9:35 PM)**
- **Status:** Backend login endpoint `/api/login` is working correctly ✓
- **Test Result:** Credentials (username: "Imran", password: "Didar@11825") successfully authenticate and return admin account
- **Issue:** Frontend displaying "500 Internal Error" when login succeeds
- **Root Cause:** Error handling in `client/src/lib/queryClient.ts` - the `apiRequest` function is throwing an error even on successful login response
- **Fix Required:** Debug and fix error handling in `apiRequest` function (likely response parsing or error chain issue)
- **Admin Account:** Exists in database with ID 1, username "Imran", role "admin"
- **Files to Check:** `client/src/lib/queryClient.ts` (apiRequest function), `client/src/hooks/use-auth.tsx` (error handling)

### Pending Implementation
- Fix login error handling (HIGHEST PRIORITY)
- API endpoints to trigger loyalty points on order completion
- Email sending integration (Resend/SendGrid API)
- Admin dashboard UI for loyalty tiers, email campaign builder, abandoned cart management
- Customer-facing loyalty dashboard showing points balance, tier progress, transaction history
- Abandoned cart recovery email triggers and conversion tracking

## External Dependencies

-   **Stripe**: Payment processing for secure transactions.
-   **OpenAI GPT-5**: AI-powered content generation (product descriptions) and performance analysis.
-   **Google Analytics 4**: Comprehensive tracking of user interactions and performance metrics.
-   **PostgreSQL**: Primary database for permanent data storage, accessed via Drizzle ORM.
-   **Twilio** (optional): For SMS notifications.
-   **Resend or SendGrid** (optional): For email notifications.