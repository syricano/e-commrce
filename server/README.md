# 🛒 E-Commerce Marketplace/ Backend (Node.js + Express + Sequelize + PostgreSQL)

This project is a **multi-vendor e-commerce platform** built with:

- **Backend**: Node.js, Express, PostgreSQL (Sequelize ORM)
- **Frontend**: React + Vite (not covered here)
- **Auth**: JWT (cookies + Authorization header), Role-based access
- **Validation**: Zod
- **Deployment Ready**: API routes, models, controllers, middleware

---

## 📂 Project Structure

server/
db/
index.js
association.js
models/
*.js (all Sequelize models)
controllers/
*.controller.js
crudFactory.js
middleware/
auth.js
roleAuth.js
errorHandler.js
validateZod.js
routes/
*.js
index.js
zod/
Schemas.js
index.js
index.js (Express app entrypoint)


---

## ⚙️ Setup

1. Install dependencies:
   ```bash
   npm install express sequelize pg pg-hstore bcrypt jsonwebtoken cookie-parser cors zod
Configure environment variables (.env):

env

PORT=8080
DATABASE_URL=postgres://user:pass@localhost:5432/ecomm
JWT_SECRET=your-secret-key
CLIENT_URL=http://localhost:5173
Run dev server:


npm run dev
Run production server:


npm start
🔑 Authentication & Roles
auth.js middleware verifies JWT from cookies or headers.

roleAuth.js middleware checks req.user.role.

Roles supported:

customer

seller

staff

admin

🗄 Models
Core models implemented in Sequelize:

User, Address

Store, StoreUser

Category, CategoryTranslation

Brand, BrandTranslation

Product, ProductTranslation, ProductVariant, Media

Offer, Inventory

Cart, CartItem

Order, OrderItem, Shipment, Payment, Refund, ReturnRequest

Review, ReviewVote

CommissionScheme, Payout

Collection, CollectionTranslation, CollectionRule, Placement

AuditLog

🧩 Middleware
auth.js → JWT authentication

roleAuth.js → Role-based checks

validateZod.js → Request body validation

errorHandler.js → Central error handling

🧪 Validation
All request payloads validated with Zod.
Schemas live in server/zod/Schemas.js, re-exported via server/zod/index.js.

📡 Routes
All routes are registered in server/routes/index.js and exposed under /api/*.

# 📡 API Routes

| Domain                | Method   | Endpoint                        | Access       |
|-----------------------|----------|---------------------------------|--------------|
| **Users**             | GET      | `/api/users`                    | Admin        |
|                       | GET      | `/api/users/:id`                | Admin        |
|                       | POST     | `/api/users`                    | Admin        |
|                       | PUT      | `/api/users/:id`                | Admin        |
|                       | DELETE   | `/api/users/:id`                | Admin        |
| **Addresses**         | CRUD     | `/api/addresses`                | Admin        |
| **Stores**            | CRUD     | `/api/stores`                   | Admin        |
| **Store Users**       | CRUD     | `/api/store-users`              | Admin        |
| **Categories**        | CRUD     | `/api/categories`               | Public (read), Admin (write) |
| **Category Trans.**   | CRUD     | `/api/category-translations`    | Public (read), Admin (write) |
| **Brands**            | CRUD     | `/api/brands`                   | Public (read), Admin (write) |
| **Brand Trans.**      | CRUD     | `/api/brand-translations`       | Public (read), Admin (write) |
| **Products**          | CRUD     | `/api/products`                 | Public (read), Admin (write) |
| **Product Trans.**    | CRUD     | `/api/product-translations`     | Public (read), Admin (write) |
| **Product Variants**  | CRUD     | `/api/product-variants`         | Public (read), Admin (write) |
| **Media**             | CRUD     | `/api/media`                    | Public (read), Admin (write) |
| **Offers**            | CRUD     | `/api/offers`                   | Seller/Admin |
| **Inventory**         | CRUD     | `/api/inventory`                | Seller/Admin |
| **Carts**             | CRUD     | `/api/carts`                    | Customer     |
| **Cart Items**        | CRUD     | `/api/cart-items`               | Customer     |
| **Orders**            | CRUD     | `/api/orders`                   | Customer/Admin |
| **Order Items**       | CRUD     | `/api/order-items`              | Customer/Admin |
| **Shipments**         | CRUD     | `/api/shipments`                | Seller/Admin |
| **Payments**          | CRUD     | `/api/payments`                 | Admin        |
| **Refunds**           | CRUD     | `/api/refunds`                  | Admin        |
| **Return Requests**   | CRUD     | `/api/return-requests`          | Customer/Admin |
| **Reviews**           | CRUD     | `/api/reviews`                  | Public (read), Customer (write), Admin (delete) |
| **Review Votes**      | CRUD     | `/api/review-votes`             | Customer     |
| **Commission Schemes**| CRUD     | `/api/commission-schemes`       | Admin        |
| **Payouts**           | CRUD     | `/api/payouts`                  | Admin        |
| **Collections**       | CRUD     | `/api/collections`              | Public (read), Admin (write) |
| **Collection Trans.** | CRUD     | `/api/collection-translations`  | Public (read), Admin (write) |
| **Collection Rules**  | CRUD     | `/api/collection-rules`         | Admin        |
| **Placements**        | CRUD     | `/api/placements`               | Admin        |
| **Audit Logs**        | CRUD     | `/api/audit-logs`               | Admin        |
| **Health Check**      | GET      | `/health`                       | Public       |

---

# 📦 Example Request Payloads

> JSON bodies for **POST** (create) and **PUT** (update). IDs are server‑generated unless noted.

## Users
```json
POST /api/users
{
  "email": "admin@example.com",
  "firstName": "Site",
  "lastName": "Admin",
  "phone": "+491234567",
  "password": "StrongPass#123",
  "role": "admin",
  "status": "active",
  "metadata": { "note": "superuser" }
}


🔒 Access Control
Admin: full access to all resources.

Seller: manage own store, offers, inventory, shipments.

Customer: manage cart, orders, reviews.

Staff: support tasks (refunds, returns, moderation).

🚦 Health Check
GET /health → { status: "ok" }

🛠 Development Notes
Run sequelize.sync({ alter: true }) in development to auto-sync DB schema.

Use validateZod on routes to ensure request payloads are safe.

Admin frontend should consume the /api/* endpoints with JWT auth.

## ✅ Recent Additions
- Category Translations: robust slug generation and idempotent upsert to prevent 409 conflicts on duplicate `categoryId+locale` or `slug+locale`.
- Listings API: detail endpoint now includes `translations` and `media` so clients can render full listing pages.

## ✅ TODO
Auth controllers: register, login, logout with bcrypt + jwt.

Rate limiting / request logging.

File uploads for media (S3/local) with moderation hooks.

Notifications (email/push/webhooks) for offers/messages/orders.

Background jobs (listing expiry, payouts), unified search improvements.

📜 License
MIT
