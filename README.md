# RevoMart

**RevoMart** is a modern, scalable, sustainable e-commerce platform supporting new, used, refurbished, and upcycled products. Built as a single-vendor platform with architecture ready for multi-vendor marketplace expansion.

## Platform Overview

| Layer | Technology | Purpose |
|-------|------------|---------|
| **API** | NestJS + Prisma + PostgreSQL | Shared REST API for web & mobile |
| **Web** | Next.js 16 + Tailwind CSS | Responsive storefront + admin dashboard |
| **Mobile** | Flutter | Android-first, iOS-ready cross-platform app |
| **Cache** | Redis (optional) | Session & rate limiting ready |
| **Infra** | Docker Compose | Local PostgreSQL + Redis |

## Features

### Storefront (Web & Mobile)
- Product catalog with search, filters, and categories
- Product conditions: New, Used, Refurbished, Upcycled
- Sustainability indicators per product
- Shopping cart & checkout
- Mobile Money, card, and cash-on-delivery payments
- User authentication & profile management
- Order history & delivery tracking
- Reviews & ratings
- Notifications
- Returns & refunds

### Admin Dashboard
- Secure admin login (RBAC)
- Product & inventory management
- Order management
- Customer management
- Sales analytics
- Delivery management
- Returns & refunds workflow

### Mobile App
- Android support (iOS-ready architecture)
- Offline product caching (Hive)
- Biometric login
- Mobile Money payment integration hooks
- Push notification ready

## Quick Start

### Prerequisites
- Node.js 20+
- Docker Desktop
- Flutter 3.x (for mobile)

### 1. Start Database
```bash
docker compose up -d
```

### 2. Setup Backend
```bash
cd backend
cp ../.env.example .env   # or use backend/.env
npm install
npm run db:push
npm run db:seed
npm run start:dev
```

API: http://localhost:3001  
Swagger: http://localhost:3001/api/docs

### 3. Start Web
```bash
cd web
cp .env.local.example .env.local
npm install
npm run dev
```

Web: http://localhost:3000

### 4. Start Mobile
```bash
cd mobile
flutter pub get
flutter run
```

Use `10.0.2.2:3001` for Android emulator API access.

## Demo Accounts

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@revomart.com | Admin@12345 |
| Customer | customer@revomart.com | Customer@123 |

## Project Structure

```
RevoMart/
├── backend/          # NestJS REST API
│   ├── prisma/       # Database schema & seed
│   └── src/          # API modules
├── web/              # Next.js storefront + admin
├── mobile/           # Flutter app
├── docker-compose.yml
└── docs/
    └── ARCHITECTURE.md
```

## API Endpoints (v1)

| Module | Base Path |
|--------|-----------|
| Auth | `/api/v1/auth` |
| Products | `/api/v1/products` |
| Categories | `/api/v1/categories` |
| Cart | `/api/v1/cart` |
| Orders | `/api/v1/orders` |
| Payments | `/api/v1/payments` |
| Addresses | `/api/v1/addresses` |
| Reviews | `/api/v1/reviews` |
| Notifications | `/api/v1/notifications` |
| Returns | `/api/v1/returns` |
| Delivery | `/api/v1/delivery` |
| Admin | `/api/v1/admin` |

## Future-Ready Architecture

The database and API are designed for:
- Multi-vendor marketplace (`Vendor` model, `vendorId` on products/users)
- Vendor dashboards & commission systems
- Recycling pickup integrations
- Rewards & loyalty programs
- Third-party logistics webhooks

See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) for details.

## Security

- JWT authentication with role-based access control
- bcrypt password hashing
- Helmet security headers
- Input validation (class-validator)
- Rate limiting (Throttler)
- HTTPS required in production

## Production Deployment

1. Set strong `JWT_SECRET` and database credentials
2. Configure Mobile Money / Stripe API keys in `.env`
3. Deploy API to cloud (AWS, GCP, Azure, Railway, etc.)
4. Deploy web to Vercel or similar
5. Build mobile: `flutter build apk` / `flutter build ios`
6. Enable HTTPS on all endpoints

## License

Proprietary — RevoMart Platform
