# Brew & Board Coffee

A digital platform for a board game café — online ordering, reservations, event management, and an affiliate program.

**Live:** [brewandboard.coffee](https://brewandboard.coffee)

## Stack

| Layer | Tech |
|---|---|
| Frontend | React 19 + Vite 7 (Radix UI, TailwindCSS) |
| Backend | Express + TypeScript |
| Database | PostgreSQL (Drizzle ORM, Neon serverless) |
| Payments | Stripe |
| Auth | Trust Layer SSO |
| Deployment | Render (Ohio) |

## Structure

```
brewandboard/
├── server/
│   ├── routes.ts          # 4,612 lines — API routes
│   ├── adminRoutes.ts     # Admin dashboard endpoints
│   ├── affiliateRoutes.ts # Affiliate program
│   └── appEcosystemRoutes.ts
├── client/               # React SPA
├── shared/               # Drizzle schema
└── render.yaml           # Render Blueprint
```

## Development

```bash
npm install
npm run dev        # Express + Vite dev server
npm run db:push    # Push schema to PostgreSQL
```
