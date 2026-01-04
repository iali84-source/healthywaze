# HealthyWaze - Trusted Wellness E-Commerce Platform

## Overview
HealthyWaze is a family-wellness-focused e-commerce platform designed to help entrepreneurs launch and scale wellness products. It emphasizes authenticity, community-validated curation, efficient inventory management, and data-driven decision-making. The platform aims to facilitate rapid product testing and growth with minimal daily operational involvement.

## User Preferences
Simple language, detailed explanations, and iterative development with clear communication. Functional programming paradigms where applicable. Clean, well-documented code. HealthyWaze brand must be consistently used across all marketing and user-facing materials.

## System Architecture

### UI/UX Decisions
The platform features a mobile-first, responsive design for both the storefront and admin dashboard, built with React 18, TypeScript, Tailwind CSS, and Shadcn UI. The design system uses a vibrant health & fitness theme with primary vibrant green, secondary energetic orange, and accent refreshing teal, along with the Inter font family. Conversion optimization elements like social proof, exit-intent popups, urgency timers, and low-stock badges are integrated.

### Technical Implementations
The frontend utilizes React, Wouter for routing, and TanStack Query for data fetching, with Recharts for analytics visualization. The backend is an Express.js application, using PostgreSQL with Drizzle ORM for data persistence. Security includes server-side validation and secure payment intent verification.

### Feature Specifications
**Storefront:** Includes a responsive product catalog with advanced filtering, detailed product pages, a persistent shopping cart with guest checkout, Stripe integration, order tracking, and mobile-first design. Conversion optimization features like live social proof, exit-intent popups, and urgency timers are present.
**Admin Dashboard:** Provides an analytics dashboard, product management with AI-powered description generation, enhanced order management, AI-driven performance insights, and an AI Product Demand Analyzer.
**AI-Powered Features:** Features an AI Description Generator, AI Product Categorization system (23 wellness categories), AI Performance Analyzer, and AI Product Demand Analyzer (all powered by OpenAI GPT-5).
**Advanced Product Filtering:** Backend-powered filtering by category, price, rating, and text search, with a mobile-friendly UI.
**Customer Address Management:** A complete address book system with CRUD operations, default address selection, and separate billing/shipping options.
**Product Review System:** Verified purchase review system with 1-5 star ratings, review content, helpful vote counts, and verification badges.
**Automation:** Includes automated inventory management, low stock alerts, persistent carts, one-click product publishing, shipping management, and customer notifications.
**Site Settings:** Admin interface for customizing storefront elements like promo banners and hero sections.
**Loyalty Program:** Points-based system (1 point per $1 spent) with automatic tiering (Bronze, Silver, Gold, Platinum) and transaction tracking.
**Email Automation:** Multi-step sequence framework for Welcome, Post-Purchase, Re-engagement, and Abandoned Cart emails, with configurable delays and HTML templates.
**Abandoned Cart Recovery:** Captures cart data, generates unique recovery codes, and triggers an automated 3-email recovery sequence with incentives.
**Marketing Attribution & ROI System:** Captures UTM parameters, Google Ads (gclid), Facebook (fbclid), tracks marketing sessions, manages promo codes, supports campaign management, and customer segmentation. Includes post-purchase surveys and an admin dashboard for ROI metrics.
**Shipping & Fulfillment System:** Supports shipping rate calculation, shipment tracking, and admin updates for shipping details. Includes zone-based pricing.
**Tax Calculation System:** State-based tax rate database with a tax calculation endpoint and admin management.
**Enhanced Reviews & Social Proof:** Provides review statistics, recent reviews widget, and admin review management.
**Loyalty Program Admin Dashboard:** A dedicated admin UI for managing loyalty tiers, email campaigns, and abandoned carts, including visualization of tier distribution.
**Blog System:** Includes a `blog_posts` table for articles (plain text/HTML), a public blog page, and an admin blog manager for creation, editing, and publishing posts.

### System Design Choices
The system provides a full CRUD API for core entities. Analytics data retrieval and dedicated endpoints for AI features and Stripe payments are implemented. Data models are defined using Drizzle ORM with Zod validation schemas. Security measures include server-side validation, payment intent verification, stock checks, and verified purchase enforcement. Multi-condition database queries use the `and()` operator. Password reset functionality includes a `password_reset_tokens` table, dedicated API endpoints, and robust security measures.

## External Dependencies

*   **Stripe**: Payment processing.
*   **OpenAI GPT-5**: AI-powered content generation and analysis.
*   **Google Analytics 4**: User tracking and performance metrics.
*   **PostgreSQL**: Primary database, accessed via Drizzle ORM.
*   **Twilio**: SMS notifications (TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN configured).
*   **Resend**: Email notifications (RESEND_API_KEY configured).