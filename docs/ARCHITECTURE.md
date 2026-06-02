# RevoMart Architecture

## System Diagram

```
┌─────────────┐     ┌─────────────┐
│  Next.js    │     │   Flutter   │
│  Web App    │     │  Mobile App │
└──────┬──────┘     └──────┬──────┘
       │                   │
       └─────────┬─────────┘
                 │ HTTPS / REST
                 ▼
       ┌─────────────────────┐
       │   NestJS API        │
       │   /api/v1           │
       │   JWT + RBAC        │
       └─────────┬───────────┘
                 │
       ┌─────────┴───────────┐
       ▼                     ▼
┌──────────────┐      ┌──────────────┐
│ PostgreSQL   │      │ Redis        │
│ (Prisma ORM) │      │ (optional)   │
└──────────────┘      └──────────────┘
```

## Single-Vendor → Multi-Vendor Path

Currently all products are sold by the platform admin (`vendorId` is null). The schema includes:

- `Vendor` table with `commissionRate`, `slug`, branding
- `User.vendorId` for vendor staff accounts
- `Product.vendorId` for vendor-owned listings
- `UserRole.VENDOR` for vendor dashboard access

To enable marketplace mode:
1. Activate vendor records and assign products
2. Add vendor-scoped API guards
3. Build vendor dashboard (reuse admin patterns)
4. Implement commission calculation on order completion

## Product Condition Model

| Condition | Description |
|-----------|-------------|
| NEW | Brand new sustainable products |
| USED | Pre-owned, quality-inspected |
| REFURBISHED | Restored to working condition |
| UPCYCLED | Creative reuse / transformed materials |

## Order Lifecycle

```
PENDING → PAYMENT_PENDING → PAID → PROCESSING → SHIPPED
  → OUT_FOR_DELIVERY → DELIVERED → COMPLETED
```

Returns branch: `DELIVERED` → Return Request → Refund → `REFUNDED`

## Payment Integration

| Method | Implementation |
|--------|----------------|
| Mobile Money | `PaymentsService.initiatePayment` + webhook at `/payments/webhook/mobile-money` |
| Card | Stripe-ready checkout URL placeholder |
| COD | Order skips payment confirmation, processes on delivery |

Configure provider credentials via environment variables.

## Delivery System

- `DeliveryZone` defines regions, base fees, ETA ranges
- `DeliveryEvent` provides tracking timeline per order
- Future: webhook endpoints for third-party logistics (DHL, local couriers)

## Sustainability Data

Products store:
- `sustainabilityScore` (0-100)
- `carbonSavedKg`
- `recycledContentPercent`
- `isEcoCertified`

Ready for future recycling pickup and rewards program integration.

## Database Tables

Users, Vendors, Categories, Products, ProductImages, Cart, CartItems, Addresses, DeliveryZones, Orders, OrderItems, Payments, DeliveryEvents, Reviews, Notifications, ReturnRequests
