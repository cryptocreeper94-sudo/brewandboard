# Brew & Board Coffee - B2B Coffee Delivery Platform

## Overview
Brew & Board Coffee is a B2B platform connecting Nashville businesses and meeting planners with local coffee shops and vendors for pre-meeting coffee and food board services. It aims to deliver a premium "Nashville Luxury" experience with features like custom authentication, CRM, calendar-based order scheduling, and a universal document scanner. The vision is to streamline B2B coffee and food delivery, expand vendor offerings, and provide flexible pricing models including subscriptions.

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

## Agent Commands

See `AGENT_COMMANDS.md` for the full pre-publish sweep command and other agent instructions.

**Quick Reference:**
- Before publishing, give any agent the "PRE-PUBLISH SWEEP" command from AGENT_COMMANDS.md
- After sweep is complete, run: `npx tsx scripts/bump-version.ts patch --hallmark`

## Version Management

### Auto-Version Bump System
The app uses an automated version bumping system located in `scripts/bump-version.ts`. 

**To bump version before publishing:**
```bash
npx tsx scripts/bump-version.ts patch --hallmark
```

**Options:**
- `patch` - Bump patch version (1.2.3 → 1.2.4)
- `minor` - Bump minor version (1.2.3 → 1.3.0)
- `major` - Bump major version (1.2.3 → 2.0.0)
- `--hallmark` or `-h` - Create blockchain hallmark record

**Files updated automatically:**
- `version.json` - Central version tracking
- `client/src/pages/login.tsx` - Login page version
- `replit.md` - Documentation header

**Note:** The Footer version is now dynamic and fetches from the `/api/version/tracking` endpoint automatically.

**Hallmark records** are stored in `version.json` and can be verified on Solana mainnet through the Developer Hub.

## System Architecture

### UI/UX Decisions
The platform features a premium "Nashville Luxury" aesthetic, utilizing a Bento grid layout on the dashboard. It employs Playfair Display for headings and a dark coffee-toned palette with shimmery cream "shine-effect" animations, emphasizing a sophisticated and user-friendly interface.

### Technical Implementations
- **Authentication**: Custom PIN-based login/registration with optional 30-day persistence and a developer PIN (0424).
- **Dashboard**: Includes a shimmering hero, weather widget, vendor scrolling, quick web search, and a live Nashville news feed.
- **Portfolio/CRM**: Offers industry-specific note templates (painting, construction, real estate, plumbing, general) with freeform notes and voice recording.
- **Order Scheduling**: Calendar-based system with a 2-hour minimum lead time, detailed service fee breakdowns, gratuity options, and capacity management (max 4 concurrent orders per 2-hour window).
- **Document Scanner**: Universal OCR scanner for PDF creation and sharing.
- **Vendor Catalog**: Expanded to diverse vendors (coffee, donuts, juice, bubble tea, breakfast) with categorized badges.
- **Pricing Model**: Concierge pricing with a 15% service fee on one-off orders, distance-based delivery fees, and subscription tiers.
- **Blockchain Hallmark System**: Two-tier Solana-based verification for document authenticity (Company Hallmarks for official releases, Subscriber Hallmarks for personalized documents).
- **Virtual Host**: Allows meeting hosts to order for attendees at different locations with budget controls, unique invite tokens, and 18% auto-gratuity for coordinated orders.
- **Operations Control Center**: Live order board for admins and regional managers with real-time status tracking, driver assignment, GPS timeline events, and 30-second auto-refresh.
- **Gratuity Protection System**: Split gratuity handling separating internal tips (kept by Brew & Board) from partner tips (passed to DoorDash/Uber Direct).
- **Partner Hub**: Provides an accordion-style interface for partners to access information and manage bug reports. Features personalized welcome modals, forced PIN change on first login, and Preview Mode (data not saved until system goes live).
- **Meeting Presentation Builder**: Enables creation of slideshow-style presentations from templates with document attachments and shareable links.
- **App Ecosystem Hub**: Cross-app integration system for connecting multiple Replit apps. Features include app registration with unique API keys (shown once), permission scopes (read/write code, data, clients, hallmarks), sync logging, and shared code snippets panel.

### System Design Choices
- **Frontend**: React + TypeScript
- **Backend**: Express + TypeScript
- **Database**: PostgreSQL (via Neon)
- **Payment Processing**: Stripe (subscriptions, one-time payments) and Coinbase Commerce (crypto payments).
- **Email Notifications**: Resend for contact and order notifications, featuring branded email designs.

## External Dependencies

- **Database**: PostgreSQL (via Neon)
- **Payment Gateways**: Stripe, Coinbase Commerce
- **Blockchain**: Solana (via Helius RPC)
- **Email Service**: Resend
- **News Feed**: WKRN
- **Weather API**: Open-Meteo
- **Planned Integrations**: DoorDash, Uber Direct, Google Calendar, Twilio, Google Maps

## Current Version
**v1.2.5** - December 2025 | Operations Control Center & Gratuity System

## Recent Changes (December 2024)
- **v1.2.5**: Operations Control Center & Gratuity System
  - **Operations Control Center** (/operations): Live order board with real-time status tracking
    - Status workflow: scheduled → confirmed → preparing → picked_up → out_for_delivery → delivered
    - Driver assignment with phone number tracking
    - Timeline events with GPS coordinates for location tracking
    - 30-second auto-refresh for live updates
    - Filter by status, search by vendor/address/contact
  - **Gratuity Protection System**: Split gratuity handling for delivery integrations
    - internalGratuity: Tips kept by Brew & Board
    - partnerGratuity: Tips passed to delivery partners (DoorDash/Uber Direct)
    - 18% auto-gratuity for multi-site coordinated Virtual Host orders
    - Attendees see "Add an Additional Tip" messaging (host already tips)
  - **Virtual Host Enhancements**: Multi-site meeting coordination improvements
    - Budget controls per attendee
    - Unique invite tokens for each attendee
    - Coordinated order flagging (isCoordinatedOrder)
  - **Partner Hub Updates**: Refreshed welcome modals for Sarah and Sid
    - Updated feature lists with Operations Center, gratuity system, Virtual Host
    - Quick action links to /operations, /virtual-host, /scan
    - Platform features grid with 8 core capabilities
  - **Database Schema Updates**: 
    - scheduledOrders: regionId, assignedDriverName, driverPhone, internalGratuity, partnerGratuity, isCoordinatedOrder, autoGratuityPercent
    - orderEvents: changedByRole, latitude, longitude for GPS tracking
  - **API Routes**: 
    - GET /api/operations/orders (with region/status filtering)
    - POST /api/operations/orders/:id/status (with audit logging)
    - POST /api/operations/orders/:id/assign-driver
  - **Storage Methods**: getAllScheduledOrders with proper single-filter handling

- **v1.2.2**: AI Mascot & UX Improvements
  - Happy Coffee AI mascot with auto-minimize intro flow
  - First-time greeting with "Tap me anytime!" message, then auto-minimizes
  - Conversation persistence in localStorage across sessions
  - Clear chat button to reset conversation history
  - Improved modal visibility across login and business docs pages
  - Stamped on Solana mainnet (BB-0000000023, tx: HG8dSZS36MbXkR79YsrtcY6XMYPM9X2K3Zh4y8xwq6v3FfCAgUDxbuLZ52yDoPaeQsg8mn7drHbdN5Pi2xpWFLo)

- **v1.2.1**: Partner Hub Enhancements & Premium UI
  - Premium Bento grid UI for Partner Hub with keyboard-accessible carousels
  - Partner Control Panel in Developer Hub with Emergency Kill Switch and System Live Toggle
  - Personalized Welcome Modals for Sarah (PIN 777) and Sid (PIN 444) with system overview
  - Forced PIN Change on first login (3-digit initial → 4-digit personal PIN)
  - Preview Mode for partners (data not saved until system goes live)
  - Footer: Dev/Partner/RM login links with dark coffee gradient, version stamp v1.2.1
  - CSS: Bento grid system, glass morphism, 3D hover effects, sparkle animations
  - Database: system_settings, partner_accounts tables with onboarding tracking
  - API: /api/partners/login, /api/partners/:id/complete-onboarding, /api/system/settings
  - Stamped on Solana mainnet (BB-0000000022, tx: dDq9T63pRBWKDxmsPv7ZgF...)

- **v1.2.0**: 1099 Compliance Portal
  - Full 1099-NEC tracking system in Developer Hub
  - Payee Directory: Add contractors, referral partners, franchise owners, delivery drivers with masked tax IDs
  - Payment Ledger: Record commissions, referrals, contractor payments with category tracking
  - Year-End Filing: Automatic $600 threshold tracking, W-9 status monitoring, 1099-NEC generation prep
  - Database: payees, payments1099, filings1099 tables with secure tax ID storage (last 4 digits only)
  - API: Full CRUD for /api/1099/payees, /api/1099/payments, /api/1099/summary/:year, /api/1099/filings/:year

- **v1.1.9**: Partner Hub & Error Reporting System
  - New Partner Hub with accordion-style navigation for mobile-friendly experience
  - 3-digit PIN access for partners (Sarah = 777)
  - Comprehensive bug reporting system accessible from hamburger menu
  - Error reports dashboard in Partner Hub with status/severity filters
  - Database schema: error_reports table with full issue tracking
  - Stamped on Solana mainnet (BB-0000000021)

- **v1.1.8**: Meeting Presentation Builder
  - Slideshow-style presentation builder with 3 templates
  - Attach scanned documents, add attendees, generate shareable links
  - Stamped on Solana mainnet (BB-0000000020)