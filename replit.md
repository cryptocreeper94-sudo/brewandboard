# Brew & Board Coffee - B2B Coffee Delivery Platform

## Overview
Brew & Board Coffee is a B2B coffee delivery platform designed for business owners and meeting planners in Nashville. It connects them with local coffee shops and other vendors for pre-meeting coffee and food board services. The platform aims to provide a premium "Nashville Luxury" experience with a Bento grid layout, offering features like custom authentication, CRM capabilities, calendar-based order scheduling, and a universal document scanner. The business vision is to streamline B2B coffee and food delivery, expanding to a wide range of vendors and offering flexible pricing models, including subscriptions.

## User Preferences
- **Design**: "Nashville Luxury" aesthetic with shimmering dark brown color scheme (#1a0f09 to #5a3620 gradient)
- **Typography**: Playfair Display for headings, warm coffee-toned accents (#5c4033)
- **Weather Widget**: Must remain compact (no large icons covering text)
- **Portfolio**: Supports both structured industry templates AND open freeform notes
- **30-day persistence**: Optional with warning about device access
- **Order Lead Time**: Minimum 2 hours for guaranteed delivery
- **Navigation**: All pages should have back buttons
- **Footer**: Dark brown gradient matching hero, includes Admin/Terms/Contact/Investor links

## System Architecture

### UI/UX Decisions
The platform features a premium "Nashville Luxury" aesthetic with a Bento grid layout on the dashboard. It utilizes Playfair Display for headings and dark coffee tones (#1a0f09, #2d1810, #3d2418, #5c4033) with shimmery cream "shine-effect" animations. The overall design emphasizes a sophisticated, user-friendly interface.

### Technical Implementations
- **Authentication**: Custom PIN-based login/registration with optional 30-day persistence. Developer PIN (0424) grants full access, and a demo mode is available for the Portfolio feature.
- **Dashboard**: Features a shimmering dark brown hero, weather widget, vendor scrolling, quick web search, and a live Nashville news feed (WKRN with 5-minute caching).
- **Portfolio/CRM**: Includes industry-specific note templates (painting, construction, real estate, plumbing, general) with freeform notes and voice recording capabilities.
- **Order Scheduling**: Calendar-based coffee delivery scheduling with a 2-hour minimum lead time, detailed service fee breakdowns, gratuity selector (15%, 18%, 20%, custom), and capacity management (max 4 concurrent orders in 2-hour windows).
- **Document Scanner**: Universal OCR scanner for creating and sharing PDFs.
- **Vendor Catalog**: Expanded to include a diverse range of vendors beyond coffee, such as donut shops, juice bars, bubble tea, and breakfast spots, categorized with badges.
- **Pricing Model**: Concierge pricing with a 15% service fee on one-off orders, distance-based delivery fees, and subscription tiers offering discounts and benefits.
- **Blockchain Hallmark System**: A two-tier verification system using Solana for document authenticity, featuring Company Hallmarks for official releases and Subscriber Hallmarks for personalized document verification with custom avatars and QR codes.

### System Design Choices
- **Frontend**: React + TypeScript
- **Backend**: Express + TypeScript
- **Database**: PostgreSQL (via Neon)
- **Payment Processing**: Integrated Stripe for subscriptions and one-time payments, and Coinbase Commerce for crypto payments.
- **Email Notifications**: Resend is used for contact form submissions and order notifications, featuring branded and detailed email designs.

## External Dependencies

- **Database**: PostgreSQL (via Neon)
- **Payment Gateways**:
    - Stripe (STRIPE_SECRET_KEY, STRIPE_PUBLISHABLE_KEY, STRIPE_WEBHOOK_SECRET)
    - Coinbase Commerce (COINBASE_COMMERCE_API_KEY, COINBASE_COMMERCE_WEBHOOK_SECRET)
- **Blockchain**: Solana (via Helius RPC for reliability)
    - Helius (HELIUS_API_KEY)
    - Solana Wallet (SOLANA_WALLET_PRIVATE_KEY)
- **Email Service**: Resend
- **News Feed**: WKRN (for Nashville news)
- **Other APIs (Planned Integrations)**: DoorDash, Uber Direct, Google Calendar, Twilio, Google Maps
## Current Version
**v1.1.2** - December 2024

## Recent Changes (December 2024)
- **v1.1.2**: PWA Polish & Enhanced Offline Support
  - Upgraded service worker with smart caching strategies (cache-first for assets, network-first for API)
  - Added app shortcuts to manifest (Schedule, Portfolio, Virtual Host)
  - Better offline fallback - app shell loads even without network
  - Stale-while-revalidate for dynamic content
  - Automatic old cache cleanup on version updates
  - Launch handler for smoother app experience

- **v1.1.1**: AI Mascot Chat & Virtual Host Polish
  - Restored cute coffee mug AI mascot to dashboard (floating bottom-right)
  - Added text chat input to mascot - click keyboard button to type messages
  - Voice recognition still works via microphone button
  - Mascot responds with friendly AI-like messages
  - Improved mascot z-index and positioning for visibility

- **v1.1.0**: Virtual Host Feature - Multi-Location Ordering
  - New Virtual Host feature allowing meeting hosts to order for attendees at different locations
  - Database schema: virtual_meetings, virtual_attendees, virtual_selections, virtual_orders, virtual_events tables
  - Host wizard (/virtual-host): Multi-step form to create meetings, set budgets, add attendees
  - Attendee intake page (/virtual-order/:token): Attendees submit their address and menu selections
  - Per-person budget controls with overage tracking and host notifications
  - Two delivery scopes: Local (Nashville multi-location) and Nationwide (Coming Soon with DoorDash/Uber Eats)
  - Prominent Virtual Host CTA on dashboard with premium styling
  - Unique invite tokens for each attendee with expiration support
  - Real-time status tracking for selections and orders

- **v1.0.16**: Premium UI Polish & Payment Integration
  - Polished item customization modal with luxury gradient styling
  - Enhanced option selection with visual feedback (glow on select)
  - Role badges in team chat (Developer, Partner, Regional Manager)
  - Message count badge on team chat button
  - Stripe Tax code ready - awaiting dashboard configuration
  - All checkout sessions (subscriptions, orders, hallmarks) have automatic_tax enabled
  - Added Stripe Tax setup checklist to Developer Portal with direct links
  - Verified Stripe and Coinbase Commerce integrations are active
  - Professional animations and transitions throughout

- **v1.0.15**: Stripe Tax Integration & Menu Customization
  - Enabled Stripe Tax automatic collection on all checkout sessions
  - Stripe now handles state/local tax calculation at checkout
  - Added item customization modal with size, milk, sweeteners, add-ons
  - Required modifier validation before adding to cart
  - Expanded vendor menus to 15+ items each with realistic pricing
  - Added team chat for operators (developers/partners/regional managers only)
  - Team chat access restricted via localStorage role checks
- **v1.0.14**: Gratuity System, Sales Tax & Capacity Management
  - Added gratuity selector to cart: 15%, 18%, 20%, and custom tip options
  - Concierge gratuity calculated on subtotal before fees
  - Tennessee sales tax (9.25% for Nashville) shown as estimate in cart
  - Capacity management: max 4 concurrent orders per 2-hour window
  - Server-side validation blocks orders when capacity is full
  - API endpoint for checking time slot availability (/api/orders/capacity/check)
  - Dark coffee color scheme (#1a0f09, #2d1810, #3d2418, #5c4033) applied globally
  - Shimmery cream "shine-effect" CSS class applied to all buttons and banners
  - Order email notifications via Resend with branded dark coffee template
- **v1.0.13**: Tiered Access System with Partner Dashboard
  - Partner role (PIN 4444): Full read access, sees all regional managers
  - Regional Manager role (PIN 5555): View-only access to their territory
  - Mandatory PIN change on first login with blocking UI overlay
  - Personalized welcome modal for Partner (Sid) with business vision
  - Accordion-style Team Overview showing all managers (Partner-only)
  - Session restore properly handles modals and data fetching
  - Premium UI with gradients, sparkles, and polished bento-style layout
- **v1.0.12**: Regional Manager Security Enhancements
  - Server-side session tokens using crypto.randomBytes (CSPRNG)
  - Session expiration (24 hours) with server-side validation
  - Protected seed endpoint (disabled in production via NODE_ENV check)
  - Proper logout endpoint to invalidate server-side sessions
  - All regional routes require x-regional-token header validated server-side
  - Post-MVP: PIN hashing with bcrypt, rate limiting/lockout for production
- **v1.0.11**: Regional Manager Admin System
  - Added tenant-separated regional manager portal (/regional)
  - Database tables: regions, regional_managers, territory_assignments
  - PIN-based authentication with server-generated tokens
  - Territory management with Nashville Metro as demo region
  - Business card generation with QR codes
  - Demo manager: PIN 1234 (Alex Thompson, Nashville Metro)
  - Access via Settings Menu → Regional Manager
- **v1.0.10**: Real-time weather integration
  - Connected to Open-Meteo API for live Nashville weather data
  - Weather button shows real temperature and condition icon
  - Weather modal displays: temperature, feels like, humidity, wind, precipitation
  - 5-day forecast with real data from API
  - Windy.com radar with full layer menu (rain, wind, storms, temp, clouds, thunder)
  - 10-minute cache for API efficiency
- **v1.0.9**: Enhanced Building Access Instructions for secure locations
  - Added prominent "Building Access Instructions" section to order form
  - Orange highlighted box with detailed placeholder prompts
  - Covers: security check-in, access codes, parking, floor/suite, meeting location
- **v1.0.8**: "Brew & Board" brand identity update
  - Updated headline to "Brews & Boards, Delivered with Grace"
  - "Brew" = coffee, tea, juice, boba; "Board" = food boards (donuts, pastries, breakfast spreads)
  - Renamed "Curated Roasters" to "Curated Vendors" on dashboard
- **v1.0.7**: Expanded vendor catalog to 37+ locations with new categories
  - Added donut shops, juice bars, bubble tea, and Nashville breakfast spots
  - New vendor type badges with color-coded categories

## Roadmap (Upcoming Features)

### v1.2.0 - Delivery Integration & Virtual Host Nationwide
- DoorDash Drive API for automated delivery dispatch (Virtual Host nationwide scope)
- Real-time driver tracking and ETA updates
- Uber Direct as backup delivery provider
- Proof of delivery with photos
- Virtual Host nationwide ordering enabled

### v1.3.0 - Calendar & Notifications
- Google Calendar integration for order scheduling
- Push notifications for order status
- Twilio SMS alerts for delivery updates
- Recurring order support

### v1.4.0 - Analytics & Insights
- Business dashboard with order analytics
- Revenue tracking and forecasting
- Popular items and vendor performance
- Customer retention metrics

### v1.5.0 - Advanced Features
- Multi-vendor orders (split orders)
- Saved order templates ("My Regular Order")
- Loyalty rewards program
- Corporate accounts with invoicing

### Future Considerations
- Mobile app (React Native)
- Vendor self-service portal
- AI-powered order recommendations
- White-label franchise solution
