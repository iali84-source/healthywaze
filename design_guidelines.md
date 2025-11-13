# Design Guidelines: AI-Powered E-Commerce Platform

## Design Approach

**Selected System:** Shopify-inspired e-commerce patterns with Linear's clean admin aesthetic  
**Rationale:** Utility-focused platform requiring efficient transactions and minimal operational overhead. Proven e-commerce patterns ensure customer trust while streamlined admin interface reduces daily management time.

**Core Principles:**
- Frictionless purchasing: Remove barriers to conversion
- Operational clarity: Admin sees critical info at a glance
- Mobile-first commerce: Majority of transactions happen on mobile
- Trust through familiarity: Use established e-commerce patterns

## Typography

**Font System:** Inter (headings & UI) + System fonts (body)
- Product titles: 18px/600 (more readable)
- Prices: 24px/700 for primary, 18px/400 for original/strikethrough
- Body text: 15px/400, line-height 1.6
- Button text: 14px/600
- Category tags: 13px/500
- Admin dashboard headers: 28px/700
- Metric numbers: 32px/700

## Layout System

**Spacing Scale:** Tailwind units of 2, 4, 6, 8, 12, 16
- Card padding: p-6
- Section spacing: py-12 (mobile), py-16 (desktop)
- Grid gaps: gap-6 (product grids), gap-4 (form fields)
- Container max-width: max-w-7xl with px-4

**Grid Systems:**
- Product grid: grid-cols-2 md:grid-cols-3 lg:grid-cols-4
- Admin dashboard: grid-cols-1 md:grid-cols-2 lg:grid-cols-3
- Checkout: Single column max-w-2xl centered

## Component Library

### Navigation
- **Main Header:** Sticky top nav with logo left, search center, cart/account right
- **Mobile:** Hamburger menu with slide-out drawer
- **Admin Sidebar:** Fixed left sidebar (desktop), bottom nav (mobile) with Dashboard, Products, Orders, Analytics, Settings icons

### Product Components
- **Product Card:** Image (4:5 ratio), title, price, quick-add button on hover (desktop) or always visible (mobile)
- **Product Detail:** Large image gallery (left 60%), product info sticky sidebar (right 40%) with title, price, variant selector, quantity, add-to-cart CTA
- **Quick View Modal:** Overlay with condensed product detail for rapid browsing

### Commerce Elements
- **Cart:** Slide-out drawer from right with line items, quantity controls, subtotal, prominent checkout button
- **Checkout Form:** Single-page layout with sections: contact, shipping, payment in clear visual hierarchy
- **Order Confirmation:** Center card with checkmark icon, order number, summary, tracking link

### Admin Dashboard
- **Metric Cards:** Large number + label + percentage change indicator, 3-column grid
- **Recent Orders Table:** Clean rows with order #, customer, items, total, status badge, action buttons
- **Quick Actions:** Floating action button (bottom right mobile) for Add Product
- **Product Manager:** Table view with inline edit, toggle publish/unpublish, stock indicator (low stock = warning badge)

### AI Features
- **Description Generator:** Textarea with "Generate with AI" button, shows loading state, generated text appears with accept/regenerate options
- **Performance Insights:** Dashboard widget showing top products with conversion metrics, AI recommendations badge

### Forms
- **Input Fields:** 48px height, rounded-lg borders, focus ring, clear labels above
- **Error States:** Red border + message below field
- **Success States:** Green checkmark icon inline

### Notifications
- **Toast Messages:** Top-right corner, auto-dismiss, icon + message + close button
- **SMS Preview:** Settings panel showing notification preferences with phone number input

## Images

**Product Images:** 
- Required for all product cards and detail pages
- Consistent 4:5 aspect ratio for grid uniformity (maintained)
- High-quality, white/neutral backgrounds preferred
- Hover: Subtle zoom effect for engagement
- Detail page: Multiple angles, zoomable on hover/tap

**Placeholders:** Use solid neutral backgrounds with camera icon for products without images

## Visual Enhancements (Faire-Inspired)

**Improved Spacing**
- More generous gaps between products: gap-8 (up from gap-6)
- Better card padding for breathing room
- Cleaner visual separation

**Interactive Polish**
- Subtle hover lift on product cards
- Smooth image zoom on hover (scale-105)
- Category badges for quick filtering
- Enhanced shadow on card hover

**Better Visual Hierarchy**
- Clearer category organization
- Prominent pricing display
- Stock urgency messaging
- Featured product highlighting

## Trust & Conversion Elements
- Security badges near payment form (lock icon + "Secure checkout")
- Clear shipping/return policy links in footer
- Product ratings/reviews (star display + count)
- Stock indicator ("Only 3 left!" urgency messaging)
- Free shipping threshold progress bar in cart

## Accessibility & Performance
- High contrast text (minimum WCAG AA)
- Keyboard navigation for all interactive elements
- Loading states for AI generation and checkout
- Optimized images with lazy loading
- Clear focus indicators throughout