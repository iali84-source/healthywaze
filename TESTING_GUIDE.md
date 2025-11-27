# ShopAI Testing Guide - Complete Feature Walkthrough

## ✅ LOGIN FIRST
- **Username:** `Imran`
- **Password:** `Didar@11825`
- Navigate to the site and click "Admin" to log in

---

## 📋 PART 1: NAVIGATION & SIDEBAR (5 minutes)

### Step 1.1: Check Sidebar Menu Items
1. Log in to admin dashboard
2. Look at the **left sidebar** - you should see these items:
   - ✅ Dashboard
   - ✅ Products
   - ✅ **Archived Products** (NEW)
   - ✅ Orders
   - ✅ Analytics
   - ✅ Demand Analyzer
   - ✅ **Features Manager** (NEW)
   - ✅ **Growth Guide** (NEW)
   - ✅ Site Settings
   - ✅ AI Tutorial

**What to check:**
- [ ] All 10 items visible
- [ ] Icons display correctly next to each item
- [ ] Current page is highlighted

---

## 🚀 PART 2: GROWTH GUIDE - FEATURE TUTORIAL (10 minutes)

### Step 2.1: Navigate to Growth Guide
1. Click **"Growth Guide"** in the sidebar
2. You should see a page titled "Growth Features Guide"
3. There's a blue "Quick Start" box at the top

**What to check:**
- [ ] Page loads without errors
- [ ] You see the intro text about 18 features
- [ ] Quick Start box recommends Email Automation, SMS, and Recommendations first

### Step 2.2: Test Tab Navigation
1. At the top, click each tab in order:
   - **💰 Sales** - Contains 5 revenue features
   - **⚙️ Automation** - Contains 5 automation features
   - **📦 Operations** - Contains 4 operational features
   - **🎯 Conversion** - Contains 3 conversion features
   - **🔍 SEO** - Contains 1 SEO feature

**What to check:**
- [ ] Each tab switches without lag
- [ ] Tab contents match the category
- [ ] All features have descriptions and ROI indicators

### Step 2.3: Read Feature Details
**In the "Sales" tab, look for these 5 features:**
1. **Abandoned Cart Recovery** - "+10-15% recovery"
   - [ ] Has description and example
   - [ ] Shows how workflow works
2. **Loyalty Program** - "+25% repeat rate"
   - [ ] Explains points system
   - [ ] Shows tier progression
3. **Smart Product Recommendations** - "+15-20% AOV"
   - [ ] Shows example of "Customers Also Bought"
   - [ ] Explains AOV increase
4. **Automated Discount Rules** - "+15-20% AOV"
   - [ ] Lists example rules
5. **One-Click Upsell** - "+10-20% on 10% orders"
   - [ ] Explains thank-you page upsell flow

**What to check:**
- [ ] Each feature has a colored left border
- [ ] Contains ROI badge
- [ ] Has real-world example
- [ ] Text is easy to read

### Step 2.4: Check Automation Tab
**Should see these 5 features:**
1. Email Automation Sequences
2. SMS Order Notifications
3. Customer Segmentation & Targeted Campaigns
4. Automated Social Media Posting
5. Live Chat & AI Bot

**What to check:**
- [ ] All 5 features visible
- [ ] Each has ROI indicator
- [ ] Descriptions explain automation workflow

### Step 2.5: Check 30-Day Action Plan
1. Scroll to the bottom of the page
2. You should see a **green card** titled "Your Action Plan: First 30 Days"

**What to check:**
- [ ] Shows Week 1, 2, 3, 4 breakdowns
- [ ] Each week has a recommended feature set
- [ ] Green "Week 1/2/3/4" badges are visible

---

## ⚙️ PART 3: FEATURES MANAGER - TOGGLE FEATURES (10 minutes)

### Step 3.1: Navigate to Features Manager
1. Click **"Features Manager"** in the sidebar
2. Page should show "Features Manager Dashboard" title

**What to check:**
- [ ] Page loads without errors
- [ ] Title displays correctly

### Step 3.2: Check Feature Organization
1. Look for **5 category sections** with colored borders:
   - **Sales** features (blue border)
   - **Automation** features (blue border)
   - **Conversion** features (blue border)
   - **Operations** features (blue border)
   - **SEO** features (blue border)

**What to check:**
- [ ] All 18 features are visible
- [ ] Features are grouped by category
- [ ] You can scroll through all features

### Step 3.3: Test Feature Cards
**For EACH feature card, verify:**
1. Feature title is visible (e.g., "Email Automation Sequences")
2. Description below title (e.g., "Automated abandoned cart reminders...")
3. **ROI badge** on right (e.g., "+15-25% revenue")
4. **Effort badge** (Easy/Medium/Hard)
5. **Enable/Disable toggle switch** on the right
6. **ℹ️ Info icon** appears when you hover

**What to check:**
- [ ] Can see all 5 elements on each card
- [ ] Cards have consistent layout
- [ ] Text is readable

### Step 3.4: Test Info Tooltips
1. Hover over or click the **ℹ️ icon** on any feature card
2. A tooltip should appear with detailed information

**Test on 3 different features:**
- [ ] Email Automation Sequences tooltip shows
- [ ] SMS Notifications tooltip shows
- [ ] Loyalty Program tooltip shows

**Tooltip should contain:**
- [ ] Detailed explanation of what the feature does
- [ ] How many % improvement it provides
- [ ] Example use case

### Step 3.5: Test Toggle Switches
1. Click the **toggle switch** on a feature card to enable it
2. Switch should turn ON (green/active state)
3. Click again to disable it
4. Switch should turn OFF

**Test on at least 3 features:**
- [ ] Email Automation - toggle on/off
- [ ] SMS Notifications - toggle on/off
- [ ] Loyalty Program - toggle on/off

**What to check:**
- [ ] Switch visual state changes
- [ ] No errors in console (F12)
- [ ] Can toggle multiple times

### Step 3.6: Verify All 18 Features Present
Scroll through and verify you see these features:

**Sales (5):**
- [ ] Abandoned Cart Recovery
- [ ] Loyalty Program
- [ ] Smart Product Recommendations
- [ ] Automated Discount Rules
- [ ] One-Click Upsell on Thank You Page

**Automation (5):**
- [ ] Email Automation Sequences
- [ ] SMS Order Notifications
- [ ] Customer Segmentation & Targeted Campaigns
- [ ] Automated Social Media Posting
- [ ] Live Chat & AI Bot

**Operations (4):**
- [ ] Dynamic Inventory Sync
- [ ] Product Templates & Bulk Cloning
- [ ] Automated Invoice & Tax Calculation
- [ ] Supplier Order Management

**Conversion (3):**
- [ ] A/B Testing Framework
- [ ] Exit-Intent Popup with Discount
- [ ] Smart Search with Auto-Complete

**SEO (1):**
- [ ] Auto-Generated Sitemaps & Meta Tags

---

## 🏷️ PART 4: SITE SETTINGS - BRANDING (8 minutes)

### Step 4.1: Navigate to Site Settings
1. Click **"Site Settings"** in sidebar
2. Scroll down to find the **Branding customization section**

**What to check:**
- [ ] Page loads without errors
- [ ] You can see branding section

### Step 4.2: Test Branding Fields
You should see these input fields:

1. **Site Name**
   - [ ] Input field visible with label
   - [ ] Current value shown (default: "ShopAI")
   - [ ] Can type new name

2. **Logo URL**
   - [ ] Input field visible with label
   - [ ] Can paste image URL

3. **Primary Color** (hex or RGB)
   - [ ] Input field visible
   - [ ] Can enter color value

4. **Secondary Color**
   - [ ] Input field visible
   - [ ] Can enter color value

5. **Accent Color**
   - [ ] Input field visible
   - [ ] Can enter color value

### Step 4.3: Test Branding Updates
1. Change **Site Name** to something different (e.g., "Fitness Store")
2. Click **"Save Settings"** button
3. Wait for success message

**What to check:**
- [ ] Save button is visible
- [ ] No errors after saving
- [ ] Success notification appears
- [ ] Changes persist on refresh

---

## 📦 PART 5: PRODUCT ARCHIVE - ARCHIVE/RESTORE (8 minutes)

### Step 5.1: Navigate to Products Page
1. Click **"Products"** in sidebar
2. You should see list of all products

**What to check:**
- [ ] Products load
- [ ] You see product names, prices, stock
- [ ] Each product has action buttons

### Step 5.2: Test Archive Feature
1. Find any product in the list
2. Look for **"Unpublish"** or **"Archive"** button
3. Click it

**What to check:**
- [ ] Button is clickable
- [ ] No errors occur
- [ ] Product moves to archived

### Step 5.3: Navigate to Archived Products
1. Click **"Archived Products"** in sidebar
2. You should see the product you just archived

**What to check:**
- [ ] Page loads
- [ ] Archived product appears in the list
- [ ] Product details are still visible

### Step 5.4: Test Restore Feature
1. On the archived product, look for **"Restore"** button
2. Click it

**What to check:**
- [ ] Restore button is clickable
- [ ] Product disappears from archive list
- [ ] Product reappears in main Products list

### Step 5.5: Test Bulk Operations
1. Go back to **"Archived Products"** page
2. Look for bulk action options (checkboxes, select all, restore all)

**What to check:**
- [ ] Bulk selection works if available
- [ ] Can restore multiple products at once

---

## 📊 PART 6: OTHER ADMIN PAGES (5 minutes)

### Step 6.1: Check Dashboard
1. Click **"Dashboard"** in sidebar
2. Should see overview metrics

**What to check:**
- [ ] Dashboard loads
- [ ] Shows key metrics (total sales, orders, etc.)
- [ ] No errors

### Step 6.2: Check Orders
1. Click **"Orders"** in sidebar
2. Should see list of orders

**What to check:**
- [ ] Orders page loads
- [ ] Shows order list
- [ ] No errors

### Step 6.3: Check Analytics
1. Click **"Analytics"** in sidebar
2. Should see charts and metrics

**What to check:**
- [ ] Analytics page loads
- [ ] Charts display
- [ ] No errors

### Step 6.4: Check Demand Analyzer
1. Click **"Demand Analyzer"** in sidebar
2. Should see product rankings and insights

**What to check:**
- [ ] Demand Analyzer loads
- [ ] Shows product demand rankings
- [ ] No errors

### Step 6.5: Check AI Tutorial
1. Click **"AI Tutorial"** in sidebar
2. Should see guide with tabs

**What to check:**
- [ ] Tutorial page loads
- [ ] Multiple tabs visible (Overview, Find Products, Add Products, etc.)
- [ ] Can click through tabs

---

## 🐛 PART 7: BUG CHECK - BROWSER CONSOLE (5 minutes)

### Step 7.1: Open Browser Console
1. Press **F12** (or right-click → Inspect)
2. Click **"Console"** tab

### Step 7.2: Check for Errors
Look for red errors. Should see:
- ✅ Green successful API calls
- ✅ No red error messages
- ✅ Maybe yellow warnings (OK to ignore)

**What to check:**
- [ ] No red errors
- [ ] Console is clean
- [ ] API requests return 200/304

### Step 7.3: Test Console Warnings
- [ ] PostCSS warning (OK - not critical)
- [ ] No database connection errors
- [ ] No authentication errors

---

## ✅ FINAL VERIFICATION CHECKLIST

Mark off as you test:

**Navigation:**
- [ ] All sidebar items visible and clickable
- [ ] Can navigate between pages without errors

**Growth Guide:**
- [ ] All 5 tabs work (Sales, Automation, Operations, Conversion, SEO)
- [ ] All 18 features visible with descriptions
- [ ] 30-day action plan visible at bottom

**Features Manager:**
- [ ] All 18 features displayed in 5 categories
- [ ] Info tooltips work (click/hover on ℹ️)
- [ ] Toggle switches work
- [ ] Can enable/disable features

**Site Settings:**
- [ ] Branding fields visible (Site Name, Logo, Colors)
- [ ] Can update settings
- [ ] Changes save without errors

**Product Archive:**
- [ ] Can archive products
- [ ] Can restore products
- [ ] Archive page shows archived items
- [ ] Products list shows active items

**Other Pages:**
- [ ] Dashboard loads
- [ ] Orders page loads
- [ ] Analytics page loads
- [ ] Demand Analyzer loads
- [ ] Tutorial page loads

**Browser Console:**
- [ ] No red errors
- [ ] API calls successful (200/304)
- [ ] Clean console output

---

## 🚨 TROUBLESHOOTING

If you see issues:

**404 Page Not Found:**
- Wait 10 seconds for page to load
- Refresh (Cmd+R or Ctrl+R)
- Restart app if still broken

**Sidebar items don't show:**
- Refresh the page
- Check browser console for errors

**Toggle switches don't work:**
- Try again - may need 2-3 seconds
- Check console for errors
- Try different feature

**Can't see Growth Guide:**
- Click "Growth Guide" in sidebar again
- Make sure you're logged in as admin

---

## 📝 REPORT BACK WITH

Once you finish testing, tell me:

1. ✅ **What's working great?** (features, pages, etc.)
2. ❌ **What's broken?** (specific features or errors)
3. ⚠️ **What could be improved?** (UI, performance, etc.)
4. 🔍 **Any console errors?** (copy exact error if yes)

**Happy testing! 🚀**
