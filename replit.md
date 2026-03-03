# Brew & Board Coffee - B2B Coffee Delivery Platform

## Overview
Brew & Board Coffee is a B2B platform connecting Nashville businesses and meeting planners with local coffee shops and vendors. Its core purpose is to streamline B2B coffee and food delivery services, offering a premium "Nashville Luxury" experience. Key capabilities include custom authentication, CRM, calendar-based order scheduling, universal document scanning, and a blockchain-based hallmark system for document authenticity. The platform aims to expand vendor offerings, provide flexible pricing models including subscriptions, and support a comprehensive ecosystem for B2B transactions.

## User Preferences
- **Design**: "Nashville Luxury" aesthetic with shimmering dark brown color scheme (#1a0f09 to #5a3620 gradient)
- **Typography**: Playfair Display for headings, warm coffee-toned accents (#5c4033)
- **Weather Widget**: Must remain compact (no large icons covering text)
- **Portfolio**: Supports both structured industry templates AND open freeform notes
- **30-day persistence**: Optional with warning about device access
- **Order Lead Time**: Minimum 2 hours for guaranteed delivery
- **Navigation**: All pages should have back buttons
- **Footer**: Dark brown gradient matching hero, includes Admin/Terms/Contact/Investor links
- **Version Management**: Auto-bump versions and create blockchain hallmarks on publish

## System Architecture

### UI/UX Decisions
The platform features a premium "Nashville Luxury" aesthetic, utilizing a Bento grid layout on the dashboard. It employs Playfair Display for headings and a dark coffee-toned palette with shimmery cream "shine-effect" animations, emphasizing a sophisticated and user-friendly interface. Key UI elements include a shimmering hero, compact weather widget, vendor scrolling, and a live news feed.

### Technical Implementations
- **Authentication**: Dual authentication system:
  - **Email/Password**: Native auth with bcrypt password hashing, registration, login, and password reset via email (tokens expire in 1 hour)
  - **PIN-based**: For admin/partner/beta tester access with rate limiting and environment-sourced credentials
  - Firebase has been removed - no third-party auth providers
- **Dashboard**: Features a personalized experience with welcome wizards, guided tours, AI recommendations, quick reorder, favorites, and order templates.
- **Portfolio/CRM**: Offers industry-specific note templates with freeform notes and voice recording capabilities.
- **Order Scheduling**: Calendar-based system with minimum lead times, detailed service fee breakdowns, gratuity options, and capacity management. Includes real-time order tracking with status timelines, ETA, and driver information.
- **Document Scanner**: Universal OCR scanner for PDF creation and sharing.
- **Vendor Catalog**: Expanded to diverse vendors with categorized badges.
- **Pricing Model**: Concierge pricing with service fees, distance-based delivery fees, and subscription tiers.
- **Blockchain Hallmark System**: Two-tier verification for document authenticity (Company Hallmarks for official releases, Subscriber Hallmarks for personalized documents). Integrated with auto-version bumping. Aligned with Trust Layer Ecosystem spec: prefix `BB`, 8-digit format (BB-00000001), genesis auto-seeding on boot, SHA-256 hashing, simulated blockchain (pre-mainnet), public verification endpoint at `/api/hallmark/:id/verify`, genesis hallmark references `TH-00000001` as parentGenesis. 
- **Trust Stamps**: Ecosystem-wide audit trail. Standardized categories (auth-login, auth-register, purchase, etc.) with appContext="brewandboard". Automatically logged on registration, login, and affiliate events. DB table: trust_stamps.
- **Affiliate Program**: Ecosystem-wide referral system with uniqueHash per user. 5 commission tiers (Base 10%, Silver 12.5%, Gold 15%, Platinum 17.5%, Diamond 20%). Referral links: `/ref/:hash`. API: `/api/affiliate/dashboard`, `/api/affiliate/link`, `/api/affiliate/track` (public, rate-limited), `/api/affiliate/request-payout`. Min payout: 10 SIG. DB tables: affiliate_referrals, affiliate_commissions. Routes: server/affiliateRoutes.ts. UI: client/src/pages/affiliate.tsx.
- **Virtual Host**: Allows meeting hosts to order for attendees at different locations with budget controls, unique invite tokens, and auto-gratuity for coordinated orders.
- **Operations Control Center**: Live order board for admins and regional managers with real-time status tracking, driver assignment, GPS timeline events, and auto-refresh.
- **Gratuity Protection System**: Splits gratuity handling between internal tips and partner tips for delivery integrations.
- **Partner Hub**: Accordion-style interface for partners to access information, manage bug reports, and includes emergency kill switch and system live toggle.
- **Meeting Presentation Builder**: Enables creation of slideshow-style presentations from templates with document attachments and shareable links.
- **App Ecosystem Hub**: Cross-app integration system for connecting multiple Replit apps with API keys, permission scopes, sync logging, and shared code snippets.
- **1099 Compliance Portal**: Full 1099-NEC tracking, payee directory, payment ledger, and year-end filing prep.
- **Team Management**: Supports company accounts with role-based access, spending limits, and budget controls.
- **Loyalty Program**: Tier-based system with points, rewards, and referral codes.
- **Calendar Integration**: Connects with Google/Outlook for meeting sync, attendee counts, and catering suggestions.

### System Design Choices
- **Frontend**: React + TypeScript
- **Backend**: Express + TypeScript
- **Database**: PostgreSQL (via Neon)
- **Payment Processing**: Stripe, Coinbase Commerce
- **Email Notifications**: Resend
- **Architecture**: Employs a modular design with clear API routes for various functionalities (e.g., operations, partners, 1099, calendar, loyalty).

## External Dependencies

- **Database**: PostgreSQL (via Neon)
- **Payment Gateways**: Stripe, Coinbase Commerce
- **Blockchain**: Solana (via Helius RPC)
- **Email Service**: Resend
- **News Feed**: WKRN
- **Weather API**: Open-Meteo
- **SMS/Voice**: Twilio (integrated - credentials configured externally)
- **Text-to-Speech**: ElevenLabs (integrated)
- **Trust Layer / Orbit Staffing**: Ecosystem integration for bookkeeping, HR, commission tracking, and 1099 compliance via orbitstaffing.io API (registered app ID: brew-and-board-coffee). Routes: server/trustLayerRoutes.ts, service: server/trustLayerService.ts
- **Planned Integrations**: DoorDash (enhanced with circuit breaker + retry logic), Uber Direct, Google Calendar, Google Maps
- **Security**: bcrypt PIN hashing, rate limiting, server-side order pricing validation, environment-sourced admin credentials