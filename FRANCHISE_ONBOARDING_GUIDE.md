# Franchise Onboarding Guide
## How to Sell and Set Up a New Franchise

---

## Overview

When someone wants to buy a Brew & Board franchise license, here's the complete step-by-step process:

---

## Step 1: Sales Conversation

When a prospect says "I want to buy a license," gather this information:

### Required Information
- **Business Name**: Their company name (e.g., "Coffee Connect ATL")
- **Territory/Region**: Where they'll operate (e.g., "Atlanta Metro")
- **Contact Info**: Owner name, email, phone
- **Branding Preference**: 
  - **White-Label**: They use their own name, logo, colors (most common)
  - **Branded**: They operate under "Brew & Board" name

### Pricing Tiers (Suggested)

| Tier | Monthly Fee | Setup Fee | Features |
|------|-------------|-----------|----------|
| **Starter** | $299/mo | $1,500 | 1 region, basic branding, up to 3 staff |
| **Professional** | $599/mo | $3,000 | 3 regions, full branding, up to 10 staff, custom domain |
| **Enterprise** | $999/mo | $5,000 | Unlimited regions, API access, priority support |

---

## Step 2: Create the Franchise in the System

### Option A: Through Developer Hub (Recommended)
1. Log into the Developer Hub with your admin PIN (0424)
2. Go to "Franchise Admin Panel" section
3. Click "Create New Franchise"
4. Fill in:
   - **Franchise ID**: Auto-generated (e.g., `BB-ATL-001`)
   - **Name**: Their business name
   - **Owner Email**: Their email
   - **Tier**: Starter/Professional/Enterprise

### Option B: Via API (For Automation)
```bash
POST /api/franchises
{
  "name": "Coffee Connect Atlanta",
  "slug": "coffee-connect-atl",
  "ownerEmail": "owner@coffeeconnect.com",
  "tier": "professional",
  "status": "pending"
}
```

**Response includes:**
- `id`: Unique franchise identifier (e.g., `BB-ATL-001`)
- `apiKey`: Their Partner API key (shown once!)

---

## Step 3: Set Up Their Branding

### In Developer Hub → Franchise Admin Panel:

1. **Select their franchise** from dropdown
2. **Branding tab** - Configure:
   - Logo URL (they provide)
   - Primary Color (hex code)
   - Secondary Color
   - Accent Color
   - Font Family
   - Hero Text
   - Favicon URL

### Example Branding Update:
```bash
PATCH /api/franchises/BB-ATL-001
{
  "logoUrl": "https://their-logo.com/logo.png",
  "primaryColor": "#2d5a3d",
  "secondaryColor": "#4a7c59",
  "accentColor": "#8fbc8f",
  "fontFamily": "Montserrat",
  "heroText": "Atlanta's Premier Coffee Delivery"
}
```

---

## Step 4: Create Their Admin Account

### Create Owner Account:
1. In Franchise Admin → Team tab
2. Add team member:
   - **Email**: Their email
   - **Role**: `owner`
   - **Franchise Role**: `owner`

They'll receive an email with login instructions.

### Their Access Levels:
| Role | Can Do |
|------|--------|
| **Owner** | Everything for their franchise |
| **Manager** | Manage orders, staff, clients |
| **Staff** | Process orders, view clients |

---

## Step 5: Domain Setup (Professional/Enterprise)

### For Custom Domains:

1. **They purchase domain** (e.g., `coffeeconnect.delivery`)
2. **They add CNAME record**: `app.coffeeconnect.delivery` → `brewandboard.replit.app`
3. **You update franchise**:
```bash
PATCH /api/franchises/BB-ATL-001
{
  "customDomain": "coffeeconnect.delivery"
}
```

**For now (Beta):** They access via `brewandboard.replit.app` and the system filters their data by franchise ID.

---

## Step 6: Create Their Regions

Each franchise needs at least one service region:

```bash
POST /api/regions
{
  "name": "Downtown Atlanta",
  "franchiseId": "BB-ATL-001",
  "serviceRadius": 10,
  "status": "active"
}
```

---

## Step 7: Issue Their License / Hallmark

### Create a Franchise Hallmark (Blockchain Verification):
This creates an on-chain record of their license on Solana.

```bash
POST /api/hallmarks
{
  "type": "company",
  "documentType": "franchise_license",
  "metadata": {
    "franchiseId": "BB-ATL-001",
    "licensee": "Coffee Connect Atlanta",
    "tier": "professional",
    "effectiveDate": "2024-12-20",
    "territory": "Atlanta Metro"
  }
}
```

**Returns:**
- `hallmarkId`: e.g., `BB-0000000030`
- `transactionSignature`: Solana tx hash (permanent record)

This hallmark IS their license number - it's immutable, verifiable, and timestamped on the blockchain.

---

## Step 8: Billing Setup

### For Recurring Billing:
Use Stripe to create a subscription:
1. Create Stripe customer with their email
2. Attach payment method
3. Create subscription with appropriate price ID

| Tier | Stripe Price ID (create these in Stripe) |
|------|------------------------------------------|
| Starter | `price_franchise_starter` |
| Professional | `price_franchise_pro` |
| Enterprise | `price_franchise_enterprise` |

### Invoice for Setup Fee:
Send one-time invoice through Stripe for setup fee.

---

## What They Get

After onboarding, the franchisee has:

1. **Unique Franchise ID**: `BB-ATL-001`
2. **Partner API Key**: For integrations (if Professional/Enterprise)
3. **Hallmark License Number**: Blockchain-verified `BB-0000000030`
4. **Admin Login**: Access to their dashboard
5. **Branded Experience**: Their logo/colors throughout
6. **Data Isolation**: They only see their customers, orders, regions

---

## Quick Reference Checklist

- [ ] Collect business info and select tier
- [ ] Create franchise in Developer Hub
- [ ] Configure branding (logo, colors)
- [ ] Create owner account
- [ ] Set up service region(s)
- [ ] Generate franchise license hallmark
- [ ] Set up Stripe subscription
- [ ] Send welcome email with credentials
- [ ] Schedule onboarding call

---

## Data Isolation (How It Works)

Every database record is tagged with `franchiseId`:
- **Orders**: Only show orders for their franchise
- **Clients**: Only show their clients
- **Staff**: Only show their team members
- **Regions**: Only show their territories

When they log in, the system automatically filters everything by their franchise ID. They can never see another franchise's data.

---

## Support & Maintenance

### Monthly Tasks:
- Monitor their usage/orders
- Process Stripe payments
- Provide technical support

### Their Responsibilities:
- Recruit vendors in their territory
- Fulfill orders
- Customer service for their region

---

## Questions? 

For technical setup help, use the Developer Hub or contact support.
