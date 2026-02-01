# Brew & Board Coffee - Complete Description
"Nashville's Premium B2B Coffee Concierge. Boardroom Ready."

## Brand Assets
- **Logo/Emblem (with background)**: attached_assets/generated_images/brew_board_coffee_app_icon.png
- **Mascot**: client/public/mascot.png
- **Favicon**: client/public/favicon.png
- **Features**: Warm orange gradient coffee cup with rising steam on rich dark brown (#1a0f09 to #5a3620) background. Kawaii mascot with Nashville guitar apron and heart-shaped steam.

## Overview
Brew & Board Coffee is a production-ready B2B platform connecting Nashville businesses, meeting planners, and corporate offices with premium local coffee shops and catering vendors. We replace scattered vendor calls and unreliable delivery with a single platform for scheduling, tracking, and managing corporate coffee and breakfast catering with white-glove service.

## What We Offer

### For Businesses (Customers)
- **Calendar-Based Ordering** - Schedule recurring or one-time orders with minimum 2-hour lead times
- **Vendor Discovery** - Browse Nashville's finest coffee shops with photos, menus, and ratings
- **Real-Time Tracking** - Live order status with driver GPS, ETA, and timeline events
- **Virtual Host** - Order for attendees at different locations with budget controls and unique invite tokens
- **Order Templates** - Save and reuse favorite orders for recurring meetings
- **Team Management** - Company accounts with role-based access, spending limits, and approval workflows
- **Loyalty Program** - Earn points, unlock rewards, and share referral codes

### For Vendors (Partners)
- **Partner Hub Dashboard** - Manage menus, pricing, availability, and order queue
- **Operations Control Center** - Live order board with real-time status and driver assignment
- **Bug Reporting System** - Submit and track issues with accordion-style interface
- **Emergency Controls** - Kill switch and system live toggle for critical situations

### For Administrators
- **Full System Control** - User management, vendor moderation, order oversight
- **1099 Compliance Portal** - Payee directory, payment ledger, and year-end filing prep
- **Analytics Dashboard** - Revenue tracking, order metrics, and engagement analytics
- **Communication Hub** - SMS/voice notifications via Twilio, AI voice synthesis via ElevenLabs
- **Developer Tools** - API access, database management, system diagnostics

## Enterprise Features
- **Native Email/Password Authentication** - Secure bcrypt-hashed credentials with password reset via email
- **PIN-Based Admin Access** - Rate-limited PIN authentication for partners and administrators
- **Multi-Role Architecture** - Customer, Partner, Admin, and Developer access levels
- **Stripe Payments** - Full payment processing with subscription support
- **DoorDash Drive Integration** - Automated delivery dispatch with real-time tracking (pending credentials)
- **Solana Blockchain Hallmarks** - Document authenticity verification and version tracking

## Premium Features
- **AI Voice Notifications** - ElevenLabs text-to-speech for order confirmations
- **Twilio SMS/Voice** - Real-time order updates and delivery alerts
- **Gratuity Protection** - Split handling between internal and partner tips
- **Meeting Presentation Builder** - Create shareable slideshow presentations for clients
- **App Ecosystem Hub** - Cross-app integration with API keys and sync logging
- **Calendar Integration** - Google/Outlook sync for meeting-based catering suggestions

## Pricing Model
| Component | Rate |
|-----------|------|
| Service Fee | Percentage-based concierge fee |
| Delivery Fee | Distance-based calculation |
| Gratuity | Customer-selected with partner split protection |
| Subscriptions | Tiered plans for high-volume customers |

## Integrations
- **Stripe** (payments & subscriptions)
- **DoorDash Drive** (automated delivery dispatch - pending)
- **Twilio** (SMS & voice notifications)
- **ElevenLabs** (AI voice synthesis)
- **Solana/Helius** (blockchain hallmarks)
- **Resend** (transactional emails)
- **Open-Meteo** (weather widget)
- **WKRN** (Nashville news feed)
- **Google Calendar** (meeting sync - roadmap)
- **Uber Direct** (alternative delivery - roadmap)

## Technology Stack
- React 18 + TypeScript (frontend)
- Node.js + Express (backend)
- PostgreSQL + Drizzle ORM (database via Neon)
- TanStack React Query (state management)
- Tailwind CSS + shadcn/ui (styling)
- Framer Motion (animations)

## Design Philosophy
"Nashville Luxury" - Premium dark coffee gradient (#1a0f09 to #5a3620), Playfair Display headings, shimmery cream accents, glassmorphism effects, Bento grid dashboard layout. Warm and sophisticated with Southern hospitality charm.

## Security
- bcrypt password hashing
- Rate limiting on all sensitive endpoints (10 requests/minute)
- Server-side order pricing validation
- Environment-sourced admin credentials
- Stripe webhook signature verification
- Email token expiration (1 hour)

## Ownership
Brew & Board Coffee is 100% owned by the platform operator. All revenue flows directly through Stripe with configurable vendor payouts.

## Version
Current: Production Ready (February 2026)

## Domain
brewandboardcoffee.replit.app - Production application
