# Brew & Board Coffee - B2B Coffee Delivery Platform

## Overview
Brew & Board Coffee is a B2B coffee delivery platform connecting business owners and meeting planners in Nashville with local coffee shops to provide pre-meeting coffee service. The app features a premium "Nashville Luxury" aesthetic with Bento grid layout.

**Domain**: brewandboard.coffee

## Current State
- **Authentication**: Custom PIN-based login/registration with optional 30-day persistence
- **Dashboard**: Premium Bento grid layout with shimmering dark brown hero, weather widget, vendor scrolling, quick web search, and Nashville news
- **Nashville News**: Live news feed from WKRN with 5-minute caching, displays 6 articles on dashboard
- **Portfolio/CRM**: Industry-specific note templates (painting, construction, real estate, plumbing, general) with freeform notes and voice recording
- **Order Scheduling**: Calendar-based coffee delivery scheduling with 2-hour minimum lead time
- **Document Scanner**: Universal OCR scanner for creating and sharing PDFs on-the-go
- **Quick Search**: Search bar for web searches and visiting URLs
- **Pricing**: Concierge pricing with 15% service fee on one-off orders, subscription tiers for discounts
- **Legal Pages**: Terms & Conditions, Contact Us, Investor/Franchise information

## Recent Changes (December 2024)
- **Developer Full Access**: Developer PIN (0424) now grants full access to ALL features
  - "Developer" link in footer opens PIN entry dialog
  - Creates developer user account with full permissions
  - Auth stored in localStorage (coffee_dev_auth + coffee_user)
  - 30-day session expiry for developer access
  - Logout button in Developer Hub header
- **Demo Mode for Portfolio**: "Try Demo" button on login page for testing without database
  - Demo notes stored in localStorage only
  - Orange banner shows demo mode status with exit button
- Added back navigation buttons to Portfolio, Schedule, and Developers pages
- Expanded vendor catalog to 12 vendors (Nashville coffee shops + smoothie places)
- Added Smoothie King, Tropical Smoothie Cafe, Jamba, and more coffee shops
- Full menus with Coffee, Tea, Specialty, Smoothies, Fruit Drinks, Food, and Catering options
- Developers page now includes Integration Roadmap with accordion-style API to-do lists
- Integration roadmap covers: DoorDash, Uber Direct, Stripe, Google Calendar, Twilio, Google Maps
- Added service fee (15%) and delivery coordination ($5) to order flow
- Updated pricing page with subscription tier discounts and visual fee breakdown
- Added serviceFee field to database schema for orders
- Added /pricing route to app navigation

## Project Architecture

### Frontend (React + TypeScript)
- `/client/src/pages/login.tsx` - PIN-based authentication
- `/client/src/pages/dashboard.tsx` - Bento grid home page
- `/client/src/pages/portfolio.tsx` - CRM notes with industry templates
- `/client/src/pages/schedule.tsx` - Order scheduling calendar with service fee breakdown
- `/client/src/pages/scan.tsx` - Document scanner with OCR and PDF export
- `/client/src/pages/developers.tsx` - API documentation + integration roadmap
- `/client/src/pages/pricing.tsx` - Concierge pricing with subscription tiers
- `/client/src/lib/mock-data.ts` - Vendors, menus, pricing constants, subscription tiers
- `/client/src/components/WebSearch.tsx` - Quick web search bar
- `/client/src/components/MascotButton.tsx` - AI mascot floating button

### Backend (Express + TypeScript)
- `/server/routes.ts` - API endpoints for auth, notes, orders
- `/server/storage.ts` - Database storage interface
- `/server/db.ts` - PostgreSQL connection via Neon

### Database Schema
- `users` - Business account holders with PIN authentication
- `crm_notes` - Portfolio notes with structured data and templates
- `clients` - CRM contacts
- `crm_activities` - Activity timeline
- `crm_meetings` - Business meetings
- `scheduled_orders` - Coffee delivery orders (includes serviceFee field)
- `order_events` - Order status history
- `vendors` - Coffee shops
- `menu_items` - Vendor menu items

## Pricing Model
- **One-off orders**: 15% service fee + $5 delivery coordination
- **Starter ($29/mo)**: 10 orders, 10% fee discount
- **Professional ($79/mo)**: 50 orders, 50% fee discount, free delivery
- **Enterprise ($199/mo)**: Unlimited orders, no service fees, priority delivery

## User Preferences
- **Design**: "Nashville Luxury" aesthetic with shimmering dark brown color scheme (#1a0f09 to #5a3620 gradient)
- **Typography**: Playfair Display for headings, warm amber accents
- **Weather Widget**: Must remain compact (no large icons covering text)
- **Portfolio**: Supports both structured industry templates AND open freeform notes
- **30-day persistence**: Optional with warning about device access
- **Order Lead Time**: Minimum 2 hours for guaranteed delivery
- **Navigation**: All pages should have back buttons
- **Footer**: Dark brown gradient matching hero, includes Admin/Terms/Contact/Investor links

## Key Features
1. PIN-based quick access (4-digit)
2. Industry-specific CRM templates
3. Calendar-based order scheduling with service fee display
4. Manual fulfillment tracking (DoorDash/Uber Eats)
5. Status workflow for orders
6. Universal document scanner with OCR
7. 12 vendor catalog with full menus (coffee + smoothies)
8. System Health Dashboard with real-time status monitoring (API, Database, Stripe, Coinbase)

## Payment Integration (IMPLEMENTED)

### Stripe Integration
- **Status**: Fully implemented
- **Required Secrets**: STRIPE_SECRET_KEY, STRIPE_PUBLISHABLE_KEY
- **Optional**: STRIPE_WEBHOOK_SECRET (for webhook signature verification)
- **Features**:
  - Subscription checkout for all tiers (Starter, Professional, Enterprise)
  - One-time order payments
  - 14-day free trial on subscriptions
  - Webhook handlers for payment/subscription status updates

### Coinbase Commerce Integration
- **Status**: Fully implemented (placeholder - needs API key)
- **Required Secrets**: COINBASE_COMMERCE_API_KEY
- **Optional**: COINBASE_COMMERCE_WEBHOOK_SECRET (for webhook signature verification)
- **Features**:
  - Crypto payments (BTC, ETH, USDC)
  - Order payment checkout
  - Webhook handlers for payment status updates

### Payment Files
- `/server/payments.ts` - All payment routes (Stripe + Coinbase Commerce)
- `/client/src/pages/pricing.tsx` - Subscription checkout UI
- `/client/src/pages/payment-success.tsx` - Payment confirmation page
- `/client/src/components/PaymentCheckout.tsx` - Reusable payment modal

### Database Tables
- `subscriptions` - User subscription status, Stripe IDs, tier info
- `payments` - Payment records for orders (Stripe + Coinbase)

## Blockchain Hallmark System (IMPLEMENTED)

### Overview
Two-tier blockchain verification system for document authenticity:
1. **Company Hallmarks** (BB-0000000001 format) - For official releases, transmissions, and version stamps
2. **Subscriber Hallmarks** (BB-USERNAME-000001 format) - Personalized document verification for subscribers

### Technology
- **Blockchain**: Solana (via Helius RPC for reliability)
- **Anchoring**: SHA-256 document hash stored in Solana memo program
- **Cost**: ~$0.00025 per hallmark (Solana transaction fee)

### Subscriber Hallmarks
- **Format**: BB-{USERNAME}-{6-digit sequence} (e.g., BB-JOHNDOE-000001)
- **Minting Fee**: $1.99 one-time fee per hallmark
- **Tier Limits**:
  - Starter: 5 hallmarks/month
  - Professional: 25 hallmarks/month
  - Enterprise: Unlimited (minting fee absorbed)
- **Features**:
  - Custom avatar upload for personalized badges
  - QR code verification linking to /verify page
  - Full blockchain proof with transaction signature

### Company Hallmarks
- **Format**: BB-{10-digit sequence} (e.g., BB-0000000001)
- **Capacity**: 10 billion unique hallmarks
- **Use Cases**: Version releases, official documents, system updates

### API Endpoints
- `POST /api/hallmark/issue` - Issue new hallmark
- `GET /api/hallmark/verify/:code` - Verify hallmark authenticity
- `POST /api/hallmark/revoke/:code` - Revoke hallmark (admin)
- `GET /api/hallmark/user/:userId` - Get user's hallmarks
- `GET /api/hallmark/version/current` - Current app version
- `GET /api/hallmark/version/history` - Version changelog

### Frontend Components
- `/client/src/components/HallmarkBadge.tsx` - Visual badge with QR code
- `/client/src/components/BusinessCard.tsx` - Digital business card with PDF export
- `/client/src/components/DocumentExport.tsx` - Professional document PDF generator
- `/client/src/pages/verify.tsx` - Public verification page
- `/client/src/pages/my-hallmarks.tsx` - User's personal hallmarks search and display
- `/client/src/pages/admin.tsx` - Admin panel (PIN 4444) for read-only system monitoring
- `/client/src/pages/blockchain-tutorial.tsx` - Educational explainer
- `/client/src/pages/hallmark-success.tsx` - Post-mint confirmation

### Database Tables
- `hallmarks` - All hallmarks (company + subscriber)
- `hallmark_events` - Audit trail (create, revoke, verify events)
- `user_hallmarks` - Per-user hallmark stats and avatars

### Required Secrets
- `HELIUS_API_KEY` - Solana RPC provider (already configured)
- `SOLANA_WALLET_PRIVATE_KEY` - For signing transactions (add when going live)

### Footer Version Display
- Clickable version number in footer opens changelog dialog
- Shows blockchain verification status for each release
- Links to blockchain tutorial for education

## Contact Form
- **Status**: FULLY FUNCTIONAL with email delivery
- **Email Provider**: Resend (API key configured)
- **Recipient**: cryptocreeper94@gmail.com
- **From Address**: Brew & Board <onboarding@resend.dev>
- **Features**: HTML-formatted emails with reply-to set to sender's email

## Footer Navigation
- Terms & Conditions (`/terms`)
- Contact Us (`/contact`)
- Investors & Franchise (`/investor`)
- Admin Login (PIN: 4444)
- Developer Login (PIN: 0424)
- Version changelog

## Future Plans
- Email integration for contact form (Resend/SendGrid)
- Google Calendar integration (available via Replit integration)
- DoorDash/Uber Eats API integration for auto-dispatch
- Twilio SMS notifications
- Google Maps for address autocomplete
