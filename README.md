# 🛒 Free Market — Monorepo Overview

A full‑stack marketplace that combines multi‑vendor e‑commerce (B2C) with peer‑to‑peer classifieds (C2C).
This repo contains both the Node.js API and the React web client.

## Repo Layout

```
root/
├─ server/   # Express API (PostgreSQL + Sequelize)
└─ client/   # React + Vite web app
```

## Highlights (Current)

- Auth: JWT (Bearer + cookie), Google OAuth. Auth middleware now prefers Bearer over cookie.
- B2C: Stores, products, variants, media, offers, inventory, orders, shipments, payments, refunds.
- C2C: Listings (+translations/media), listing offers, favorites, messaging (threads + messages).
- Categories: rich tree with per‑category filter metadata (JSONB) used by the web filters.
- Search: results page with listings/products; Navbar SearchBar routes to `/search?q=...`.
- Listings (web):
  - Dynamic filters that change immediately on category selection (no extra click to render fields)
  - Applied filter chips + numbered pagination
  - Detail page with media, quick Favorite, Message Seller
  - “My Listings” shows only the signed‑in user’s items; edit supports category‑specific attributes
- Messages (web): threads list + chat; “Message Seller” opens Messages with a localized (AR/EN) prefilled template; template picker inserts automatically on selection.
- Navigation: single “Categories” item opens a hover mega‑menu (roots left, children right) with proper overlay.

## Getting Started

### Backend

1) Configure environment

```
cd server
cp .env.example .env   # fill DB_URL (or DATABASE_URL), JWT_SECRET, BACKEND_URL, CLIENT_URL, GOOGLE_*
```

2) Install & run

```
npm i
npm run dev             # http://localhost:8080
```

3) (Optional) Seed categories with rich filters

```
npm run seed:categories
```

Notes:
- Seeds wipe `categories`/`category_translations` before inserting.
- Filter definitions live under `categories.metadata.filters.fields`.

### Web Client

1) Configure environment

```
cd client
cp .env.example .env   # or set
VITE_API_BASE_URL=http://localhost:8080/api
VITE_FILES_BASE_URL=http://localhost:8080
```

2) Install & run

```
npm i
npm run dev            # http://localhost:5173
```

## API Quick Map

- Auth: `/api/auth/register`, `/api/auth/login`, `/api/auth/logout`, `/api/auth/me`, `/api/auth/google`
- Profiles: `/api/profiles/me` (GET/PUT)
- Listings:
  - Browse/search: `GET /api/listings`
  - Mine only: `GET /api/listings/mine` (enforces ownership server‑side)
  - Create/Update/Delete: `POST/PUT/DELETE /api/listings/:id`
  - Favorite: `POST /api/listings/:id/favorite`
- Messaging:
  - Start thread: `POST /api/threads` (body: listingId)
  - List threads: `GET /api/threads`
  - Send message: `POST /api/threads/:id/messages`
  - List messages: `GET /api/threads/:id/messages`

## Dev Notes

- Auth precedence: middleware prefers `Authorization: Bearer` over cookie token to avoid cross‑user confusion during development.
- BIGINT IDs: Zod schemas coerce numeric strings → numbers to avoid "expected number, received string" on Postgres BIGINT.
- Create listing validation: temporarily bypassed Zod body validation on `POST /api/listings` while schema stabilizes; re‑enable once we finalize the payload contract.

## Roadmap (Next)

- Re‑enable strict Zod validation for listing create with targeted schema + error messages
- Store detail page with offers grid; link from Stores list
- Orders UI: list + detail polish
- Media upload pipeline (multer/dev, S3/prod) and moderation hooks
- Notifications (email/web) for messages/offers/orders
- Payments placeholders (online/COD/third‑party) and transitions
- Click‑outside to close Categories mega‑menu (desktop)

## Contributing

- Prefer small, reviewable PRs. Keep controllers thin; validate with Zod; enforce authorization/ownership in controllers.
- Web: favor SPA navigation (`Link`) and keep filters declarative.

MIT © Free Market

