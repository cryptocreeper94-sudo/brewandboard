# Brew & Board Coffee - B2B Coffee Delivery Platform

## Overview
Brew & Board Coffee is a B2B coffee delivery platform designed for business owners and meeting planners in Nashville. It connects them with local coffee shops and other vendors for pre-meeting coffee and food board services. The platform aims to provide a premium "Nashville Luxury" experience with a Bento grid layout, offering features like custom authentication, CRM capabilities, calendar-based order scheduling, and a universal document scanner. The business vision is to streamline B2B coffee and food delivery, expanding to a wide range of vendors and offering flexible pricing models, including subscriptions.

## User Preferences
- **Design**: "Nashville Luxury" aesthetic with shimmering dark brown color scheme (#1a0f09 to #5a3620 gradient)
- **Typography**: Playfair Display for headings, warm amber accents
- **Weather Widget**: Must remain compact (no large icons covering text)
- **Portfolio**: Supports both structured industry templates AND open freeform notes
- **30-day persistence**: Optional with warning about device access
- **Order Lead Time**: Minimum 2 hours for guaranteed delivery
- **Navigation**: All pages should have back buttons
- **Footer**: Dark brown gradient matching hero, includes Admin/Terms/Contact/Investor links

## System Architecture

### UI/UX Decisions
The platform features a premium "Nashville Luxury" aesthetic with a Bento grid layout on the dashboard. It utilizes Playfair Display for headings and warm amber accents. The overall design emphasizes a sophisticated, user-friendly interface.

### Technical Implementations
- **Authentication**: Custom PIN-based login/registration with optional 30-day persistence. Developer PIN (0424) grants full access, and a demo mode is available for the Portfolio feature.
- **Dashboard**: Features a shimmering dark brown hero, weather widget, vendor scrolling, quick web search, and a live Nashville news feed (WKRN with 5-minute caching).
- **Portfolio/CRM**: Includes industry-specific note templates (painting, construction, real estate, plumbing, general) with freeform notes and voice recording capabilities.
- **Order Scheduling**: Calendar-based coffee delivery scheduling with a 2-hour minimum lead time and detailed service fee breakdowns.
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