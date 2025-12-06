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
- **Virtual Host**: Allows meeting hosts to order for attendees at different locations with budget controls and unique invite tokens.
- **Partner Hub**: Provides an accordion-style interface for partners to access information and manage bug reports.
- **Meeting Presentation Builder**: Enables creation of slideshow-style presentations from templates with document attachments and shareable links.

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
**v1.2.0** - December 2024 | 1099 Compliance Portal

## Recent Changes (December 2024)
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