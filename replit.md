# Coffee Talk - B2B Coffee Delivery Platform

## Overview
Coffee Talk is a B2B coffee delivery platform connecting business owners and meeting planners in Nashville with local coffee shops to provide pre-meeting coffee service. The app features a premium "Nashville Luxury" aesthetic with Bento grid layout.

## Current State
- **Authentication**: Custom PIN-based login/registration with optional 30-day persistence
- **Dashboard**: Premium Bento grid layout with weather widget, team members, vendor scrolling, and Web3 search
- **Portfolio/CRM**: Industry-specific note templates (painting, construction, real estate, plumbing, general) with freeform notes and voice recording
- **Order Scheduling**: Calendar-based coffee delivery scheduling with 2-hour minimum lead time
- **Document Scanner**: Universal OCR scanner for creating and sharing PDFs on-the-go
- **Web3 Research**: Quick search bar for crypto tokens, contract addresses, and URLs
- **AI Mascot**: "Happy Coffee" floating mascot button with breathing animation
- **Pricing**: Concierge pricing with 15% service fee on one-off orders, subscription tiers for discounts

## Recent Changes (December 2024)
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
- `/client/src/components/Web3Search.tsx` - Web3 research search bar
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
- **Design**: "Nashville Luxury" aesthetic with Playfair Display typography and warm amber/wood tones
- **Weather Widget**: Must remain compact (no large icons covering text)
- **Portfolio**: Supports both structured industry templates AND open freeform notes
- **30-day persistence**: Optional with warning about device access
- **Order Lead Time**: Minimum 2 hours for guaranteed delivery
- **Navigation**: All pages should have back buttons

## Key Features
1. PIN-based quick access (4-digit)
2. Industry-specific CRM templates
3. Calendar-based order scheduling with service fee display
4. Manual fulfillment tracking (DoorDash/Uber Eats)
5. Status workflow for orders
6. Universal document scanner with OCR
7. 12 vendor catalog with full menus (coffee + smoothies)

## Stripe Integration
- User is adding STRIPE_PUBLISHABLE_KEY and STRIPE_SECRET_KEY to secrets
- Checkout and subscription management coming soon
- See Developers page Integration Roadmap for implementation tasks

## Future Plans
- Google Calendar integration (available via Replit integration)
- DoorDash/Uber Eats API integration for auto-dispatch
- Twilio SMS notifications
- Google Maps for address autocomplete
