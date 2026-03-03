# Trust Layer Ecosystem: Hallmark System & Affiliate Program Handoff

**For: All agents building or maintaining apps in the Trust Layer 32-app ecosystem**
**Authority: Trust Layer Hub (trusthub.tlid.io) — the genesis application**
**Operator: DarkWave Studios LLC**
**Launch: August 23, 2026 CST**

---

## 1. HALLMARK SYSTEM OVERVIEW

The Hallmark System is the Trust Layer ecosystem's universal audit trail. Every app in the 32-app ecosystem issues hallmarks and trust stamps to create an immutable, verifiable record of events. Think of it as a blockchain-native receipt system that spans every app a user touches.

There are two tiers:

| Tier | Name | Purpose | When Created |
|------|------|---------|-------------|
| **Tier 1** | **Hallmark** | Formal, numbered records for significant events | Registration, purchases, certifications, app genesis, product releases |
| **Tier 2** | **Trust Stamp** | Lightweight automatic audit trail | Logins, profile updates, balance changes, wallet actions, Stripe events |

### 1.1 Hallmark ID Format

Every hallmark across the entire ecosystem follows this format:

```
[PREFIX]-[8-DIGIT ZERO-PADDED SEQUENCE]
```

- The **prefix** is a unique 2-character code assigned to each app.
- The **sequence** is an auto-incrementing 8-digit number, zero-padded.
- Each app maintains its own independent counter, so sequences are per-app.

**Example:** `TH-00000001` is the genesis hallmark of Trust Layer Hub.

### 1.2 App Prefix Registry

Every app in the ecosystem MUST use its assigned prefix. No two apps share a prefix. The prefix is permanent and cannot be changed after launch.

| # | App Name | Prefix | Genesis ID | Domain |
|---|----------|--------|------------|--------|
| 1 | Trust Layer Hub | `TH` | TH-00000001 | trusthub.tlid.io |
| 2 | Trust Layer (L1) | `TL` | TL-00000001 | dwtl.io |
| 3 | TrustHome | `TR` | TR-00000001 | trusthome.tlid.io |
| 4 | TrustVault | `TV` | TV-00000001 | trustvault.tlid.io |
| 5 | TLID.io | `TI` | TI-00000001 | tlid.io |
| 6 | THE VOID | `VO` | VO-00000001 | thevoid.tlid.io |
| 7 | Signal Chat | `SC` | SC-00000001 | signalchat.tlid.io |
| 8 | DarkWave Studio | `DS` | DS-00000001 | darkwavestudio.tlid.io |
| 9 | Guardian Shield | `GS` | GS-00000001 | guardianshield.tlid.io |
| 10 | Guardian Scanner | `GN` | GN-00000001 | guardianscanner.tlid.io |
| 11 | Guardian Screener | `GR` | GR-00000001 | guardianscreener.tlid.io |
| 12 | TradeWorks AI | `TW` | TW-00000001 | tradeworks.tlid.io |
| 13 | StrikeAgent | `SA` | SA-00000001 | strikeagent.tlid.io |
| 14 | Pulse | `PU` | PU-00000001 | pulse.tlid.io |
| 15 | Chronicles | `CH` | CH-00000001 | chronicles.tlid.io |
| 16 | The Arcade | `AR` | AR-00000001 | thearcade.tlid.io |
| 17 | Bomber | `BO` | BO-00000001 | bomber.tlid.io |
| 18 | Trust Golf | `TG` | TG-00000001 | trustgolf.tlid.io |
| 19 | ORBIT Staffing OS | `OR` | OR-00000001 | orbit.tlid.io |
| 20 | Orby Commander | `OC` | OC-00000001 | orby.tlid.io |
| 21 | GarageBot | `GB` | GB-00000001 | garagebot.tlid.io |
| 22 | Lot Ops Pro | `LO` | LO-00000001 | lotops.tlid.io |
| 23 | TORQUE | `TQ` | TQ-00000001 | torque.tlid.io |
| 24 | TL Driver Connect | `DC` | DC-00000001 | driverconnect.tlid.io |
| 25 | VedaSolus | `VS` | VS-00000001 | vedasolus.tlid.io |
| 26 | Verdara | `VD` | VD-00000001 | verdara.tlid.io |
| 27 | Arbora | `AB` | AB-00000001 | arbora.tlid.io |
| 28 | PaintPros | `PP` | PP-00000001 | paintpros.tlid.io |
| 29 | Nashville Painting Professionals | `NP` | NP-00000001 | nashvillepainting.tlid.io |
| 30 | Trust Book | `TB` | TB-00000001 | trustbook.tlid.io |
| 31 | DarkWave Academy | `DA` | DA-00000001 | darkwaveacademy.tlid.io |
| 32 | Happy Eats | `HE` | HE-00000001 | happyeats.tlid.io |
| 33 | Brew & Board Coffee | `BB` | BB-00000001 | brewandboard.tlid.io |

### 1.3 Genesis Hallmark (Per-App)

Every app MUST create a genesis hallmark on first server startup. The genesis hallmark is always `[PREFIX]-00000001` and represents the app's birth record on the Trust Layer Blockchain. It is never deleted or modified.

**Genesis hallmark creation logic:**

```
1. On server boot, check if [PREFIX]-00000001 exists in the hallmarks table.
2. If it does NOT exist:
   a. Reset the app's counter to 0.
   b. Call generateHallmark() which increments the counter to 1.
   c. The resulting hallmark becomes [PREFIX]-00000001.
3. If it already exists, skip — log "Genesis hallmark [PREFIX]-00000001 already exists."
```

**Genesis hallmark metadata (required fields):**

```json
{
  "appId": "[app-slug]-genesis",
  "appName": "[Full App Name]",
  "productName": "Genesis Block",
  "releaseType": "genesis",
  "metadata": {
    "ecosystem": "Trust Layer",
    "version": "1.0.0",
    "domain": "[app-domain].tlid.io",
    "operator": "DarkWave Studios LLC",
    "chain": "Trust Layer Blockchain",
    "consensus": "Proof of Trust",
    "launchDate": "2026-08-23T00:00:00.000Z",
    "nativeAsset": "SIG",
    "utilityToken": "Shells",
    "parentApp": "Trust Layer Hub",
    "parentGenesis": "TH-00000001"
  }
}
```

Every genesis hallmark in every app MUST reference `TH-00000001` as the `parentGenesis`. This creates a provenance chain back to the Hub.

### 1.4 Genesis Hallmark UI

Every app MUST display its genesis hallmark as a clickable badge in the app's profile or settings footer. The badge should:

- Show the shield icon + "Genesis Hallmark" label + the hallmark ID
- Be tappable/clickable, opening a detail view
- The detail view shows: Application Info, Blockchain Record, Ecosystem Details, Verification section
- The detail view should also link to the Hub's genesis (TH-00000001) as the parent

---

## 2. HASHING SYSTEM

### 2.1 How Hashing Works

Every hallmark and trust stamp is hashed with SHA-256 to create a tamper-proof fingerprint.

**Process:**

```
1. Collect the event payload (JSON object with all relevant data).
2. Add the current ISO timestamp to the payload.
3. For hallmarks: add the hallmark ID (e.g., TH-00000001) to the payload.
4. JSON.stringify the entire payload.
5. Hash with SHA-256: crypto.createHash("sha256").update(payload).digest("hex")
6. Store the resulting 64-character hex string as `dataHash`.
```

**Example payload before hashing:**

```json
{
  "thId": "TH-00000042",
  "userId": 17,
  "appId": "trusthub-purchase",
  "appName": "Trust Layer Hub",
  "productName": "Shell Bundle - Whale",
  "releaseType": "purchase",
  "timestamp": "2026-09-15T14:23:00.000Z"
}
```

**Resulting hash:** `a3f8c2d1e4b5...` (64-character hex)

### 2.2 Blockchain Simulation (Pre-Mainnet)

Until the Trust Layer L1 mainnet launches, each hallmark also receives:

- `txHash`: A simulated transaction hash (`0x` + 64 random hex chars)
- `blockHeight`: A simulated block number (7-digit integer)

**Post-mainnet**, these will be replaced with real on-chain transaction hashes and block heights from the Trust Layer L1.

### 2.3 Tenant-Space Events

Each app is a "tenant" in the ecosystem. Trust stamps created within an app's tenant space include the app context:

```json
{
  "category": "wallet-send",
  "data": {
    "to": "user.tlid",
    "amount": 500,
    "asset": "SIG",
    "txHash": "0x...",
    "appContext": "trusthub",
    "timestamp": "2026-09-15T14:23:00.000Z"
  }
}
```

The `appContext` field identifies which app generated the stamp. When querying a user's full audit trail across the ecosystem, stamps can be filtered or grouped by `appContext`.

### 2.4 Trust Stamp Categories (Standardized)

All apps MUST use these standardized category names for trust stamps to ensure cross-app compatibility:

| Category | Trigger | Data Fields |
|----------|---------|-------------|
| `auth-login` | User logs in | `{ ip, device, appContext, timestamp }` |
| `auth-register` | New account created | `{ email, username, appContext, timestamp }` |
| `auth-logout` | User logs out | `{ sessionDuration, appContext, timestamp }` |
| `profile-update` | Profile changed | `{ fieldsChanged, appContext, timestamp }` |
| `wallet-send` | Token sent | `{ to, amount, asset, txHash, appContext, timestamp }` |
| `wallet-receive` | Token received | `{ from, amount, asset, txHash, appContext, timestamp }` |
| `wallet-swap` | Token swapped | `{ fromAsset, toAsset, inputAmount, outputAmount, rate, txHash, appContext, timestamp }` |
| `staking-stake` | SIG staked | `{ amount, txHash, asset, newStakedBalance, appContext, timestamp }` |
| `staking-unstake` | stSIG unstaked | `{ amount, txHash, asset, cooldownDays, appContext, timestamp }` |
| `purchase` | In-app purchase | `{ productId, amount, currency, appContext, timestamp }` |
| `subscription-start` | Subscription began | `{ planId, amount, interval, appContext, timestamp }` |
| `subscription-cancel` | Subscription ended | `{ planId, reason, appContext, timestamp }` |
| `stripe-connect` | Stripe account linked | `{ businessName, appContext, timestamp }` |
| `stripe-disconnect` | Stripe account unlinked | `{ appContext, timestamp }` |
| `affiliate-payout-request` | Affiliate requests payout | `{ amount, currency, commissionsCount, appContext, timestamp }` |
| `affiliate-referral-converted` | Referral converted | `{ referralId, referredUserId, platform, appContext, timestamp }` |
| `multisig-approve` | Multi-sig tx approved | `{ txId, vaultId, appContext, timestamp }` |
| `multisig-reject` | Multi-sig tx rejected | `{ txId, vaultId, reason, appContext, timestamp }` |
| `guardian-scan` | Guardian scan performed | `{ targetHash, result, appContext, timestamp }` |
| `hallmark-generated` | New hallmark issued | `{ hallmarkId, releaseType, appContext, timestamp }` |

Apps MAY define additional categories prefixed with their app slug: e.g., `tradeworks-order-placed`, `thevoid-match-result`.

### 2.5 Verification Endpoint

Every app MUST expose a public verification endpoint:

```
GET /api/hallmark/[HALLMARK_ID]/verify
```

Returns:

```json
{
  "verified": true,
  "hallmark": {
    "thId": "TH-00000042",
    "appName": "Trust Layer Hub",
    "productName": "Shell Bundle - Whale",
    "releaseType": "purchase",
    "dataHash": "a3f8c2d1e4b5...",
    "txHash": "0x...",
    "blockHeight": "1234567",
    "createdAt": "2026-09-15T14:23:00.000Z"
  }
}
```

If the hallmark does not belong to the app being queried, it should return a `404` with `{ "verified": false, "error": "Hallmark not found" }`.

---

## 3. DATABASE SCHEMA

Each app implementing hallmarks MUST have these tables. Use the exact column names for cross-app data portability.

### 3.1 hallmarks table

| Column | Type | Notes |
|--------|------|-------|
| id | serial (PK) | Auto-increment |
| th_id | text (unique, not null) | Format: `[PREFIX]-00000000` |
| user_id | integer (FK, nullable) | References users.id. Null for system/genesis hallmarks |
| app_id | text | Slug identifier (e.g., `trusthub-genesis`) |
| app_name | text | Human-readable app name |
| product_name | text | Product or event name |
| release_type | text | `genesis`, `purchase`, `certification`, `registration`, etc. |
| metadata | jsonb | Arbitrary structured data |
| data_hash | text (not null) | SHA-256 hash of the full payload |
| tx_hash | text | Blockchain transaction hash |
| block_height | text | Blockchain block number |
| qr_code_svg | text | Optional QR code for physical verification |
| verification_url | text | Public verification URL |
| hallmark_id | integer (not null) | Sequence number (e.g., 1 for genesis) |
| created_at | timestamp (not null) | Auto-set to now |

### 3.2 trust_stamps table

| Column | Type | Notes |
|--------|------|-------|
| id | serial (PK) | Auto-increment |
| user_id | integer (FK, nullable) | References users.id |
| category | text (not null) | Standardized category from the table above |
| data | jsonb | Event-specific payload |
| data_hash | text (not null) | SHA-256 hash of the payload |
| tx_hash | text | Blockchain transaction hash |
| block_height | text | Blockchain block number |
| created_at | timestamp (not null) | Auto-set to now |

### 3.3 Counter table (per-app)

| Column | Type | Notes |
|--------|------|-------|
| id | text (PK) | Always `[prefix]-master` (e.g., `th-master`) |
| current_sequence | text (not null) | Current sequence as text, default `0` |

The counter uses `INSERT ... ON CONFLICT DO UPDATE` (upsert) to atomically increment and return the next sequence number. This guarantees no duplicate hallmark IDs even under concurrent requests.

---

## 4. AFFILIATE & REFERRAL SYSTEM

### 4.1 Core Concept

Every user who registers on ANY app in the Trust Layer ecosystem receives a `uniqueHash` — a permanent, ecosystem-wide identifier. This hash serves as their affiliate ID across all 32+ apps. It is generated once at registration and never changes.

**The uniqueHash is:**
- Generated during user registration (random hex string)
- Stored on the `users` table in the `unique_hash` column
- The same hash across every app the user signs into (SSO carries it)
- Used to construct referral links for every app in the ecosystem

### 4.2 Referral Link Format

```
https://[app-domain].tlid.io/ref/[uniqueHash]
```

**Examples:**
```
https://trusthub.tlid.io/ref/a7b3c9d2e1f4
https://trustvault.tlid.io/ref/a7b3c9d2e1f4
https://thevoid.tlid.io/ref/a7b3c9d2e1f4
https://tradeworks.tlid.io/ref/a7b3c9d2e1f4
```

The same uniqueHash works across every app. When a new user clicks a referral link on ANY app, the referral is attributed to the referrer on THAT app's platform.

### 4.3 Commission Tiers

Tiers are based on the number of **converted** referrals (not just clicks). A "converted" referral means the referred user completed registration and email verification.

| Tier | Min Converted Referrals | Commission Rate |
|------|------------------------|-----------------|
| **Base** | 0 | 10% |
| **Silver** | 5 | 12.5% |
| **Gold** | 15 | 15% |
| **Platinum** | 30 | 17.5% |
| **Diamond** | 50 | 20% |

**Commission applies to:** The referred user's first paid subscription or purchase on the platform where the referral occurred. The commission is calculated as a percentage of that first transaction in SIG equivalent.

### 4.4 Payout Rules

1. **Minimum payout**: 10 SIG
2. **Payout currency**: SIG (native asset)
3. **Payout processing**: Within 48 hours of request
4. **Payout request**: Manual — user clicks "Request Payout" in the affiliate dashboard
5. **Pending commissions**: Must be in "pending" status to be included in a payout request
6. **Commission lifecycle**: `pending` -> `processing` -> `paid`
7. **Trust stamp**: Every payout request generates an `affiliate-payout-request` trust stamp for audit trail

### 4.5 Referral Tracking Flow

```
1. User A copies their referral link from the affiliate dashboard.
2. User A shares the link (social media, DM, email, etc.).
3. User B clicks the link, landing on https://[app].tlid.io/ref/[hashA].
4. The app extracts the hash from the URL and calls POST /api/affiliate/track
   with { referralHash: hashA, platform: "[app-slug]" }.
5. A new row is inserted into affiliate_referrals with status "pending".
6. When User B registers and verifies their email, the referral status updates
   to "converted" and convertedAt is set.
7. When User B makes their first purchase/subscription, a commission row is
   created in affiliate_commissions with the appropriate tier rate.
8. User A sees the commission appear in their affiliate dashboard.
```

### 4.6 Cross-App Referral Attribution

The `platform` field on referrals tracks which app generated the referral. This allows:

- A user can refer someone to TrustVault, and separately refer someone to THE VOID
- Each referral is attributed to the specific app
- Commission rates are per-user (not per-app) — a Diamond tier user earns 20% on ALL apps
- The affiliate dashboard in the Hub aggregates referrals across all platforms

### 4.7 Database Tables

#### affiliate_referrals

| Column | Type | Notes |
|--------|------|-------|
| id | serial (PK) | Auto-increment |
| referrer_id | integer (FK, not null) | The user who shared the link |
| referred_user_id | integer (FK, nullable) | The user who signed up (set on conversion) |
| referral_hash | text (not null) | The referrer's uniqueHash |
| platform | text (not null, default "trusthub") | Which app the referral came from |
| status | text (not null, default "pending") | `pending`, `converted`, `expired` |
| converted_at | timestamp | When the referral converted |
| created_at | timestamp (not null) | When the link was clicked |

#### affiliate_commissions

| Column | Type | Notes |
|--------|------|-------|
| id | serial (PK) | Auto-increment |
| referrer_id | integer (FK, not null) | The user earning the commission |
| referral_id | integer (FK) | References affiliate_referrals.id |
| amount | text (not null) | Commission amount in SIG |
| currency | text (default "SIG") | Always "SIG" |
| tier | text (default "base") | Tier at time of commission (base/silver/gold/platinum/diamond) |
| status | text (default "pending") | `pending`, `processing`, `paid` |
| paid_at | timestamp | When the payout was processed |
| created_at | timestamp (not null) | When the commission was created |

### 4.8 API Endpoints (Per-App)

Every app MUST implement these affiliate endpoints:

| Method | Path | Auth | Purpose |
|--------|------|------|---------|
| GET | `/api/affiliate/dashboard` | Yes | Full affiliate stats, tier, referrals, commissions |
| GET | `/api/affiliate/link` | Yes | User's referral link + cross-platform links |
| POST | `/api/affiliate/track` | No | Track a referral click (body: `{ referralHash, platform }`) |
| POST | `/api/affiliate/request-payout` | Yes | Request payout of pending commissions (min 10 SIG) |

The `/api/affiliate/track` endpoint is **public** (no auth required) because it is called when an unauthenticated visitor clicks a referral link.

---

## 5. MAKING THE AFFILIATE PROGRAM PROMINENT

### 5.1 Required UI Placements (Every App)

1. **Profile/Settings screen**: Dedicated "Affiliate Program" section with:
   - Current tier badge (Base/Silver/Gold/Platinum/Diamond) with color coding
   - Total earnings display
   - "Share Link" button (copies referral URL to clipboard)
   - Link to full affiliate dashboard

2. **Affiliate Dashboard screen** (dedicated screen or modal):
   - Referral link with one-tap copy + share sheet
   - Tier progress bar showing progress to next tier
   - Stats cards: Total Referrals, Converted, Pending Earnings, Paid Earnings
   - Commission tier table showing all 5 tiers and requirements
   - Recent referrals list with status indicators
   - Recent commissions list with amounts
   - "Request Payout" button (disabled if under 10 SIG minimum)

3. **Onboarding flow** (post-registration):
   - "Start Earning" card introducing the affiliate program
   - Show the user their unique referral link
   - Explain the tier system briefly

4. **Home/Dashboard screen**:
   - If user has pending earnings > 0, show a subtle "Earnings Available" indicator
   - Quick-access "Share & Earn" button or card

5. **Navigation**:
   - Affiliate dashboard accessible from profile, settings, or hamburger menu
   - Never behind a paywall — the affiliate program is free for all users

### 5.2 Branding & Messaging

- Call it "Affiliate Program" or "Share & Earn" — never "MLM" or "network marketing"
- Emphasize: "Earn SIG across all 32 Trust Layer apps with one link"
- Highlight the cross-app nature: "Your referral link works everywhere in the ecosystem"
- Use the tier names consistently: Base, Silver, Gold, Platinum, Diamond
- Commission messaging: "Earn up to 20% commission on referrals"

### 5.3 Share Sheet Content

When the user taps "Share Link," the share sheet should include:

```
Join me on [App Name] — part of the Trust Layer ecosystem!
[referral link]
```

---

## 6. IMPLEMENTATION CHECKLIST FOR NEW APPS

When building a new app in the ecosystem, implement these systems in order:

### Phase 1: Foundation
- [ ] Set up the database with hallmarks, trust_stamps, counter tables
- [ ] Implement `generateHallmark()` and `createTrustStamp()` functions
- [ ] Create the genesis hallmark on first startup using the correct prefix
- [ ] Expose `GET /api/hallmark/genesis` (public)
- [ ] Expose `GET /api/hallmark/:id/verify` (public)
- [ ] Add genesis hallmark badge to profile/settings footer

### Phase 2: Audit Trail
- [ ] Add trust stamps to auth events (login, register, logout)
- [ ] Add trust stamps to wallet/financial events
- [ ] Add trust stamps to subscription/purchase events
- [ ] Add trust stamps to any app-specific significant events
- [ ] Include `appContext` in all stamp data payloads

### Phase 3: Affiliate
- [ ] Implement all 4 affiliate API endpoints
- [ ] Handle `/ref/[hash]` URL routing on the frontend
- [ ] Call `POST /api/affiliate/track` when a referral link is detected
- [ ] Update referral status to "converted" on email verification
- [ ] Create commission rows on first purchase/subscription
- [ ] Build the affiliate dashboard UI
- [ ] Add affiliate section to profile screen
- [ ] Add "Share & Earn" card to home/dashboard
- [ ] Add trust stamps for payout requests and referral conversions

### Phase 4: Cross-App
- [ ] Ensure SSO token carries the user's uniqueHash
- [ ] Ensure the user's tier is computed from ALL converted referrals (cross-platform query)
- [ ] Link to Hub's genesis hallmark (TH-00000001) from the app's genesis detail view
- [ ] Test referral link flow end-to-end

---

## 7. REFERENCE IMPLEMENTATION

The Trust Layer Hub (trusthub.tlid.io) is the reference implementation. Key files:

| File | What It Does |
|------|-------------|
| `server/hallmark.ts` | Hallmark generation, trust stamps, genesis seeding, verification |
| `server/affiliate.ts` | Full affiliate system (dashboard, tracking, payouts) |
| `server/db/schema.ts` | Database schema for all tables |
| `server/staking.ts` | Example of trust stamps on wallet actions |
| `server/stripe-business.ts` | Example of trust stamps on Stripe events |
| `app/hallmark-detail.tsx` | Genesis hallmark detail screen UI |
| `app/(tabs)/profile.tsx` | Genesis hallmark badge in profile footer |
| `app/affiliate.tsx` | Affiliate dashboard UI |
| `hooks/useAffiliate.ts` | Affiliate hooks (dashboard, link, payout) |

All other apps should follow these patterns exactly, substituting only the app prefix, app name, and domain.

---

## 8. RULES SUMMARY

1. **Prefix is sacred.** Each app has exactly one 2-character prefix. It never changes.
2. **Genesis is first.** `[PREFIX]-00000001` is always the genesis hallmark, created on first boot.
3. **Hash everything.** Every hallmark and stamp gets a SHA-256 hash of its payload.
4. **Stamp everything.** Major user actions produce trust stamps automatically. Users should never need to create stamps manually.
5. **Affiliate is universal.** One uniqueHash per user across all 32+ apps. One referral link format. Five commission tiers.
6. **Payouts in SIG.** All affiliate commissions are denominated and paid in SIG, the native asset.
7. **No pay gates.** The affiliate program is free. The hallmark system is free. The Hub is free. Individual apps may have paid features, but the trust infrastructure is always accessible.
8. **Verify publicly.** Every hallmark can be verified by anyone via the public API. No auth required for verification.
9. **Reference TH-00000001.** Every app's genesis hallmark metadata must include `parentGenesis: "TH-00000001"` to maintain the provenance chain.
10. **Use standard categories.** Trust stamp categories must follow the standardized naming convention for cross-app compatibility.
