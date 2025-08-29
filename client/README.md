# 🛒 Free Market — Hybrid Marketplace (B2C Stores + C2C Classifieds)

> This document focuses on the web client. For a repo‑wide overview, shared features, and quickstart, see the root README at `../README.md`. For backend/API specifics, see `../server/README.md`.

A full‑stack marketplace that combines **multi‑vendor e‑commerce (B2C)** with **peer‑to‑peer listings (C2C)**—think “Shopify + eBay Kleinanzeigen” in one platform.  
Back end is production‑ready to keep evolving; front end(s) include a web client and (planned) **mobile apps**.

---

## ✨ Core Value
- **B2C**: Merchants open stores, upload catalogs, manage inventory, receive payouts.
- **C2C**: Individuals post local listings, negotiate via messages, use flexible payment methods (online, cash, or third‑party transfers).
- **One identity & search** across both surfaces.

---

## 🧱 Tech Stack

**Backend**
- Node.js, Express
- PostgreSQL + Sequelize (with soft‑deletes/paranoid; JSONB for flexible fields)
- JWT auth (cookies + `Authorization: Bearer`)
- Google OAuth (Passport.js)
- Zod validation, centralized error handling (`asyncHandler`, `errorHandler`)
- Role & ownership middleware

**Web Frontend**
- React + Vite
- Context providers for Auth, Language, Cart
- Axios with token injection
- Tailwind/DaisyUI (as used in components)
 - Admin management pages (users, products, categories, listings, media, reports)
 - Public listing detail page rendering translations and media

**Mobile App (New Plan)**
- **React Native (Expo)** for iOS/Android
- Reuse services and types from web
- Deep links for OAuth callback
- Push notifications (Expo push), image uploads, offline cache (MMKV/AsyncStorage + react‑query)

---

## 📦 Monorepo Layout (current & planned)

```
root/
├─ server/               # Node.js API
│  ├─ db/                # Sequelize init + associations
│  ├─ models/            # B2C + C2C models
│  ├─ controllers/       # Error‑handled controllers
│  ├─ middleware/        # auth, role guard, validators, errors
│  ├─ routes/            # Modular routers + routeMap
│  ├─ config/            # passport (Google OAuth), etc.
│  └─ index.js           # Express entrypoint
├─ client/               # Web (React + Vite)
│  ├─ src/
│  │  ├─ context/        # AuthProvider, LangProvider, CartProvider
│  │  ├─ services/       # API client + CRUD factories (secured endpoints)
│  │  ├─ components/     # Navbar, AccountMenu, SearchBar, etc.
│  │  ├─ pages/          # Auth, Profile, Catalog, Listings (to add)
│  │  └─ utils/          # asyncHandler, errorHandler
│  └─ vite.config.ts     # dev setup
└─ mobile/               # (Planned) React Native + Expo app
   ├─ app/               # Expo Router screens
   ├─ src/               # shared api client, hooks
   └─ app.json / eas.json
```

---

## 🗄️ Data Model (Highlights)

### B2C (Stores & Catalog)
- **Store, StoreUser** (owner/manager/staff)
- **Category(+Translation), Brand(+Translation)**
- **Product(+Translation), ProductVariant, Media**
- **Offer** (per store per variant) + **Inventory**
- **Cart, CartItem, Order, OrderItem, Shipment, Payment, Refund, ReturnRequest**
- **CommissionScheme, Payout**
- **Collection(+Translation), CollectionRule, Placement**
- **Review, ReviewVote**
- **AuditLog**

### C2C (Classifieds)
- **Listing, ListingTranslation, ListingMedia**
- **ListingOffer** (buyer counter‑offers)
- **MessageThread, Message** (buyer/seller chat)
- **Favorite, Report**
- **PasswordReset**

All associations are defined in `server/db/association.js` and are **in sync** with model files.

---

## 🔐 Authentication

- **Email/password** login → server returns JWT (cookie + bearer support).
- **Google OAuth** → handled via Passport; server redirects back with a short‑lived token (read by the client from query string) and then stores JWT for session continuity.
- `/api/auth/me` returns the current user if the cookie or bearer is valid.

---

## 🛂 Authorization / Ownership (Backend)
- **Roles**: `customer`, `seller`, `staff`, `admin`.
- **Ownership**: API checks user id for Profile, Listings, Orders (self). Admin bypasses.
- **Middleware**:
  - `auth` (JWT required)
  - `requireRole(...roles)`
  - Resource‑level checks (e.g., only listing owner can update/delete their listing).

> **Status:** Ownership checks are implemented in back‑end controllers for listings, profiles, and orders. Web UI needs wiring for the full flows (see Roadmap).

---

## 🔎 Search
- A unified `/api/search` endpoint is scaffolded (products/stores/listings).  
  **To do:** connect the Navbar `SearchBar` to the API and render result pages.

---

## ✅ Recent Additions
- Public Listing Detail page at route `/listings/:id` displaying title/description (per language), price, condition, city, and media.
- Search: `SearchBar` now routes to `/search?q=…`; results page renders listings and products.
- Navigation: single "Categories" item opens a hover mega‑menu (roots on left, children on right).
- Listings browse: dynamic filters by category (fields appear immediately on category select), filter chips, and numbered pagination.
- Account: "My Listings" shows only the signed‑in user’s listings; edit supports category‑specific attributes.
- Messages: threads list + chat UI; listing page starts a thread and opens Messages with a prefilled template (AR/EN); template picker inserts text on selection.
- Favorites: listing detail includes a quick favorite toggle (server stub for now).
- Profile: display name/fields persist correctly.

---

## 📡 HTTP API (Examples)

- Auth: `/api/auth/register`, `/api/auth/login`, `/api/auth/logout`, `/api/auth/me`, `/api/auth/google`
- Profiles: `/api/profiles/me` (get/put), admin CRUD on `/api/profiles`
- B2C CRUD (admin/seller as applicable): `/api/products`, `/api/offers`, `/api/orders`, `/api/stores`, …
- C2C:
  - Listings: `GET/POST /api/listings`, `PUT/DELETE /api/listings/:id`, `POST /api/listings/:id/favorite`
  - Offers: `POST /api/listing-offers`, `PUT /api/listing-offers/:id`
  - Messages: `POST /api/threads` → `POST /api/threads/:id/messages`

> Routes are registered via `routeMap` in `server/routes/index.js` and protected with `auth` + role/ownership guards.

---

## ✅ What’s Done (Back End)

- **Schema & Associations** for **B2C + C2C** ✅
- **Controllers** refactored to centralized error handling (no scattered `try/catch`) ✅
- **Auth**: JWT + Google OAuth; **`/auth/me`** bootstrap ✅
- **Role & Ownership checks**: implemented in back end for **profiles, listings, orders** (server‑side) ✅
- **Routers** organized; routeMap with protected routes ✅

## 🚧 What’s In Progress / To Do

### Backend
- Search controller: finalize unified search (products, stores, listings) and filters
- Payments service:
  - **Online** (placeholder gateway integration)
  - **Cash on Delivery (COD)**
  - **Third‑party transfer** (mark as buyer‑initiated; seller confirms receipt)
- Notifications (email/push/webhooks) for offers/messages/orders
- Rate limiting, request logging, audit expansion
- File uploads (media) pipeline & moderation (size, type, face/NSFW checks)
- Background jobs (cron/queue) for listing expiry, payout cycles

### Web Frontend
- Listings: browse with dynamic filters + chips + pagination; detail; create/edit; favorites (toggle stubbed).
- Messages: threads + chat, prefilled templates.
- Profile: fetch/edit `profiles/me` persisted.
- Orders: list + detail (basic page present; wiring ongoing).
- Storefront pages: store list present; store detail with offers planned.
- Admin UI (protected) for content management.

### Mobile App (New)
- **Stack**: React Native (Expo), Expo Router
- **Screens**:
  - Auth (email/pass + Google OAuth via deep link)
  - Catalog browse/search (B2C)
  - Listings (C2C) — create/edit with camera/photo library
  - Messages (threads + chat)
  - Cart/Checkout (B2C) and Local deal flows (C2C)
  - Profile & Settings (language, theme)
- **Services**:
  - Shared axios client (base URL, token persistence via SecureStore/AsyncStorage)
  - React Query for caching & offline
- **Notifications**:
  - Expo push for messages/offers/order updates
- **OAuth on Mobile**:
  - Use Expo AuthSession or browser redirect → backend callback → redirect URL with `?token=` → store JWT
- **Release**:
  - EAS Build/Submit pipelines, env‑based config
- **Parity**: Aim for feature parity with web over time

---

## ⚙️ Getting Started

### 1) Backend
```bash
cd server
cp .env.example .env  # fill DB_URL, JWT_SECRET, GOOGLE_* , BACKEND_URL, CLIENT_URL
npm i
npm run dev
```
- Server runs at `http://localhost:8080`
- Syncs DB schema via Sequelize; logs SQL in dev
- Health check: `GET /health`

### 2) Web Client
```bash
cd client
npm i
npm run dev
```
- Visit `http://localhost:5173`
- Make sure `VITE_API_BASE_URL` points to `/api` or `http://localhost:8080/api`

### 3) Mobile (Planned)
```bash
cd mobile
npx create-expo-app .
# add axios + shared services; set EXPO_PUBLIC_API_BASE and scheme for deep links
npx expo start
```
- Configure deep link scheme matching the backend Google OAuth callback redirect.
- Use `AuthSession` or `WebBrowser` with deep links to capture the JWT.

---

## 🔧 Environment

**Server `.env`**
```
PORT=8080
DB_URL=postgres://user:pass@localhost:5432/ecomm
JWT_SECRET=your-secret
CLIENT_URL=http://localhost:5173
BACKEND_URL=http://localhost:8080

GOOGLE_CLIENT_ID=...apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=...
```

**Client `.env`**
```
VITE_API_BASE_URL=http://localhost:8080/api
```

**Mobile `.env` (Expo)**
```
EXPO_PUBLIC_API_BASE=http://10.0.2.2:8080/api   # Android emulator
EXPO_PUBLIC_OAUTH_REDIRECT_SCHEME=freemarket
```

---

## 🧪 Testing & Quality (Roadmap)
- Unit & integration tests (Jest/Supertest) for controllers & middleware
- Contract tests for API responses (OpenAPI/Swagger)
- E2E (Playwright) for web
- Detox or Maestro for mobile flows

---

## 📜 License
MIT

---

## 🤝 Contributing
- Open PRs in small, reviewable chunks (schema → controllers → routes → UI wiring).
- Keep controllers thin; push validation to Zod & rules to middleware.
- Prefer **ownership checks** in controllers and **role checks** in routers.

---

## 🗺️ High‑Level Roadmap
1. Finish unified search and listing UIs on web
2. Wire orders UI (self purchases) + basic B2C checkout
3. Payments (online + COD + third‑party transfer confirmation)
4. Mobile MVP (Auth, Listings, Messages)
5. Storefronts + merchant onboarding/verification
6. Notifications & moderation tooling
7. Analytics & reporting dashboards
