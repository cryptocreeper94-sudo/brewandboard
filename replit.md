# Coffee Talk - B2B Coffee Delivery Platform

## Overview
Coffee Talk is a B2B coffee delivery platform connecting business owners and meeting planners in Nashville with local coffee shops to provide pre-meeting coffee service. The app features a premium "Nashville Luxury" aesthetic with Bento grid layout.

## Current State
- **Authentication**: Custom PIN-based login/registration with optional 30-day persistence
- **Dashboard**: Premium Bento grid layout with weather widget, team members, and vendor scrolling
- **Portfolio/CRM**: Industry-specific note templates (painting, construction, real estate, plumbing, general) with freeform notes
- **Order Scheduling**: Calendar-based coffee delivery scheduling with 2-hour minimum lead time
- **Document Scanner**: Universal OCR scanner for creating and sharing PDFs on-the-go

## Recent Changes (December 2024)
- Added Order Scheduling System with calendar view
- Implemented scheduled_orders and order_events database tables
- Added 2-hour lead time validation for guaranteed delivery
- Created status tracking for orders (scheduled → confirmed → preparing → out_for_delivery → delivered)
- Added fulfillment tracking for manual DoorDash/Uber Eats entry
- Added Universal Document Scanner with OCR (Tesseract.js) and PDF generation (jsPDF)

## Project Architecture

### Frontend (React + TypeScript)
- `/client/src/pages/login.tsx` - PIN-based authentication
- `/client/src/pages/dashboard.tsx` - Bento grid home page
- `/client/src/pages/portfolio.tsx` - CRM notes with industry templates
- `/client/src/pages/schedule.tsx` - Order scheduling calendar
- `/client/src/pages/scan.tsx` - Document scanner with OCR and PDF export

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
- `scheduled_orders` - Coffee delivery orders
- `order_events` - Order status history
- `vendors` - Coffee shops
- `menu_items` - Vendor menu items

## User Preferences
- **Design**: "Nashville Luxury" aesthetic with Playfair Display typography and warm amber/wood tones
- **Weather Widget**: Must remain compact (no large icons covering text)
- **Portfolio**: Supports both structured industry templates AND open freeform notes
- **30-day persistence**: Optional with warning about device access
- **Stripe**: Do not integrate until EIN obtained
- **Order Lead Time**: Minimum 2 hours for guaranteed delivery

## Key Features
1. PIN-based quick access (4-digit)
2. Industry-specific CRM templates
3. Calendar-based order scheduling
4. Manual fulfillment tracking (DoorDash/Uber Eats)
5. Status workflow for orders
6. Universal document scanner with OCR
   - Camera capture or file upload
   - On-device text extraction (Tesseract.js)
   - Multi-page PDF generation (jsPDF)
   - Native sharing via Web Share API

## Future Plans
- Google Calendar integration (available via Replit integration)
- DoorDash/Uber Eats API integration for auto-dispatch
- Stripe payment processing (after EIN)
