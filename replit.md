# ShopAI - AI-Powered E-Commerce Platform

## Overview
ShopAI is an AI-powered e-commerce platform designed to help entrepreneurs operate a data-driven online store with minimal daily involvement. It integrates AI for intelligent insights and automation to streamline operations, enabling rapid product testing and efficient management. The platform aims to provide a competitive edge in the e-commerce market by leveraging advanced AI features and comprehensive analytics to maximize sales and minimize operational overhead.

## User Preferences
I prefer simple language and detailed explanations. I want iterative development with clear communication on progress. Ask before making major changes. I prefer functional programming paradigms where applicable and expect clean, well-documented code. Do not make changes to the folder `Z` and do not make changes to the file `Y`.

## System Architecture

### UI/UX Decisions
The storefront and admin dashboard feature a mobile-first, responsive design using React 18, TypeScript, Tailwind CSS, and Shadcn UI. The design system incorporates a vibrant health & fitness theme with a primary color of vibrant green, secondary energetic orange, and an accent of refreshing teal. Typography uses the Inter font family, and spacing is consistent. Conversion optimization features like social proof, exit-intent popups, urgency timers, and low-stock badges are integrated throughout the customer journey.

### Technical Implementations
The frontend uses React with Wouter for routing and TanStack Query for data fetching. Analytics visualizations are powered by Recharts. The backend is built with Express.js, utilizing PostgreSQL with Drizzle ORM for permanent data storage. Stripe API handles secure payment processing, and OpenAI API powers AI features. Google Analytics 4 is integrated for comprehensive user tracking.

### Feature Specifications
**Storefront:** Includes a responsive product catalog, detailed product pages, persistent shopping cart with guest checkout, Stripe integration, order tracking, and mobile-first design. Conversion optimization features like live social proof, exit-intent popups, free shipping progress bars, urgency timers, "X people viewing" counters, and enhanced low-stock badges are key.
**Admin Dashboard:** Provides an analytics dashboard with real-time metrics, product management with AI-powered description generation, enhanced order management, and advanced AI-driven performance insights.
**AI-Powered Features:** An AI Description Generator (OpenAI GPT-5) creates compelling product descriptions, and an AI Performance Analyzer (OpenAI GPT-5) provides actionable insights from product data.
**Automation:** Features include automated inventory management, low stock alerts, persistent carts, one-click product publishing, shipping management, and customer notifications (email/SMS).
**Site Settings:** An admin interface allows customization of storefront elements like promo banners, hero sections, trust badges, and benefit messages, with real-time updates.

### System Design Choices
The system supports a full CRUD API for products and orders, analytics data retrieval, and dedicated endpoints for AI features and Stripe payments. Data models for products, orders, order items, and site settings are clearly defined. Security measures include server-side price validation, payment intent verification, and stock checks.

## External Dependencies

-   **Stripe**: Payment processing for secure transactions.
-   **OpenAI GPT-5**: AI-powered content generation (product descriptions) and performance analysis.
-   **Google Analytics 4**: Comprehensive tracking of user interactions and performance metrics.
-   **PostgreSQL**: Primary database for permanent data storage, accessed via Drizzle ORM.
-   **Twilio** (optional): For SMS notifications.
-   **Resend or SendGrid** (optional): For email notifications.