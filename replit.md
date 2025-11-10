# ShopAI - AI-Powered E-Commerce Platform

## Project Overview
ShopAI is a modern, automated e-commerce platform that combines AI-powered features with Google Analytics to help entrepreneurs run a data-driven online store with minimal daily involvement. The platform enables rapid product testing, intelligent insights, and streamlined operations.

## Core Features

### Storefront (Customer-Facing)
- **Product Catalog**: Clean, responsive product grid with search functionality
- **Product Details**: Detailed product pages with image galleries and variant support
- **Shopping Cart**: Persistent cart with localStorage, quantity management
- **Guest Checkout**: Frictionless checkout flow without account requirements
- **Stripe Integration**: Secure payment processing with Stripe Elements
- **Order Tracking**: Order confirmation with unique order IDs
- **Mobile-First Design**: Fully responsive across all devices

### Admin Dashboard
- **Analytics Dashboard**: Real-time metrics (revenue, orders, views, conversion rates)
- **Product Management**: CRUD operations with AI-powered description generation
- **Order Management**: View and update order statuses
- **Advanced Analytics**: Detailed performance metrics with AI insights
- **Comprehensive Tutorial**: Step-by-step guide for using all AI features

### AI-Powered Features
1. **AI Description Generator** (OpenAI GPT-5)
   - Generates compelling product descriptions from product names
   - One-click generation in product creation flow
   - Saves time and ensures professional copy

2. **AI Performance Analyzer** (OpenAI GPT-5)
   - Analyzes product performance data
   - Provides actionable insights on top performers
   - Recommends products to promote or remove

### Analytics & Tracking
- **Google Analytics 4**: Automatic tracking of all user interactions
- **Conversion Tracking**: Views to purchases analysis
- **Product Performance Metrics**: Views, sales, revenue per product
- **Real-time Dashboard**: Live metrics and KPIs

### Automation Features
- **Automated Inventory**: Stock decreases automatically on purchase
- **Low Stock Alerts**: Visual badges when stock is low (≤5 items)
- **Persistent Cart**: Cart saved in browser localStorage
- **One-Click Publishing**: Toggle product visibility without deletion
- **SMS Notifications Ready**: Integration guide for Twilio (optional)

## Technology Stack

### Frontend
- React 18 with TypeScript
- Wouter (routing)
- TanStack Query (data fetching)
- Tailwind CSS + Shadcn UI (design system)
- Stripe React Components
- Recharts (analytics visualization)

### Backend
- Express.js
- In-memory storage (MemStorage)
- Stripe API (payments)
- OpenAI API (AI features)
- Google Analytics 4 (tracking)

### API Integrations
- **Stripe**: Payment processing
- **OpenAI GPT-5**: AI-powered content and insights
- **Google Analytics 4**: User behavior tracking
- **Twilio** (optional): SMS notifications

## Project Structure

```
├── client/
│   ├── src/
│   │   ├── components/
│   │   │   ├── ui/              # Shadcn UI components
│   │   │   ├── StorefrontHeader.tsx
│   │   │   ├── ProductCard.tsx
│   │   │   ├── CartDrawer.tsx
│   │   │   └── app-sidebar.tsx  # Admin sidebar
│   │   ├── pages/
│   │   │   ├── Home.tsx         # Product catalog
│   │   │   ├── ProductDetail.tsx
│   │   │   ├── Checkout.tsx
│   │   │   ├── OrderConfirmation.tsx
│   │   │   └── admin/
│   │   │       ├── Dashboard.tsx
│   │   │       ├── Products.tsx  # AI description generator
│   │   │       ├── Orders.tsx
│   │   │       ├── Analytics.tsx # AI insights
│   │   │       └── Tutorial.tsx  # Comprehensive guide
│   │   ├── lib/
│   │   │   ├── queryClient.ts
│   │   │   └── analytics.ts     # Google Analytics
│   │   ├── hooks/
│   │   │   ├── use-toast.tsx
│   │   │   └── use-analytics.tsx
│   │   ├── App.tsx
│   │   └── index.css
│   └── index.html
├── server/
│   ├── routes.ts        # API endpoints
│   ├── storage.ts       # Data storage interface
│   └── index.ts
├── shared/
│   └── schema.ts        # Shared TypeScript types
└── design_guidelines.md # Frontend design system

```

## Environment Variables Required

### Required for MVP
- `OPENAI_API_KEY`: OpenAI API key for AI features
- `STRIPE_SECRET_KEY`: Stripe secret key (sk_...)
- `VITE_STRIPE_PUBLIC_KEY`: Stripe publishable key (pk_...)
- `VITE_GA_MEASUREMENT_ID`: Google Analytics 4 measurement ID (G-...)
- `SESSION_SECRET`: Session management secret (auto-generated)

### Optional
- `TWILIO_ACCOUNT_SID`: Twilio account ID for SMS
- `TWILIO_AUTH_TOKEN`: Twilio auth token
- `TWILIO_PHONE_NUMBER`: Twilio phone number

## Data Models

### Product
- id, name, description, price, imageUrl, stock
- isPublished (toggle visibility)
- category, views, sales
- createdAt

### Order
- id, customerEmail, customerName, customerPhone
- shippingAddress, total, status
- stripePaymentIntentId, createdAt

### OrderItem
- id, orderId, productId
- productName, productPrice, quantity

### CartItem (Frontend only)
- productId, name, price, quantity, imageUrl

## API Endpoints (To be implemented in Task 2)

### Products
- `GET /api/products` - List all products
- `GET /api/products/:id` - Get single product
- `POST /api/products` - Create product
- `PATCH /api/products/:id` - Update product
- `DELETE /api/products/:id` - Delete product

### Orders
- `GET /api/orders` - List all orders
- `GET /api/orders/:id` - Get single order
- `POST /api/orders` - Create order (from checkout)
- `PATCH /api/orders/:id` - Update order status

### Analytics
- `GET /api/analytics` - Get analytics data

### AI Features
- `POST /api/ai/generate-description` - Generate product description
- `POST /api/ai/analyze-performance` - Get AI performance insights

### Payments
- `POST /api/create-payment-intent` - Create Stripe payment intent

## Key User Flows

### Customer Journey
1. Browse products on homepage
2. Search/filter products
3. View product details
4. Add to cart (persistent)
5. Proceed to checkout
6. Enter shipping/payment info
7. Complete purchase
8. Receive order confirmation

### Admin Product Testing Flow
1. Create product in admin
2. Generate description with AI
3. Publish product
4. Monitor views/sales in dashboard
5. Generate AI insights weekly
6. Unpublish poor performers
7. Focus on winners

### AI-Powered Optimization
1. Add 5-10 test products
2. Wait 1 week for data
3. Run AI performance analysis
4. Review recommendations
5. Double down on top products
6. Remove underperformers
7. Repeat cycle

## Design System
- **Primary Color**: Blue (221, 83%, 53%) - Trust and professionalism
- **Typography**: Inter font family, clear hierarchy
- **Spacing**: Consistent 4, 6, 8, 12, 16px scale
- **Components**: Shadcn UI with custom e-commerce patterns
- **Responsive**: Mobile-first approach
- **Accessibility**: WCAG AA compliance

## Current Status
✅ Task 1: Schema & Frontend - COMPLETED
- All data models defined in shared/schema.ts
- Design system configured in tailwind.config.ts
- All frontend components built:
  - Storefront (Home, ProductDetail, Checkout, OrderConfirmation)
  - Admin Dashboard (Dashboard, Products, Orders, Analytics, Tutorial)
  - Reusable components (Header, ProductCard, CartDrawer, Sidebar)
- Google Analytics integration complete
- Stripe Elements integration complete
- AI features UI ready (description generator, insights analyzer)
- Comprehensive tutorial system built

⏳ Task 2: Backend - IN PROGRESS
- API endpoints to be implemented
- Storage layer to be connected
- OpenAI integration to be added
- Stripe payment processing to be connected

⏳ Task 3: Integration & Testing - PENDING
- Connect frontend to backend APIs
- Add error handling and loading states
- Test all user flows
- Architect review

## Notes
- Cart persists in localStorage for returning customers
- Products can be toggled on/off without deletion
- Stock automatically decreases on purchase
- Low stock badges create urgency (≤5 items)
- Guest checkout for minimal friction
- SMS notifications require manual Twilio setup
- All AI features require OpenAI API key
- Google Analytics tracks all interactions automatically
