# Endpoint backend necessari — Portale Negozio

Tutti gli endpoint usano `Authorization: Bearer {shop_token}` (tranne auth).

## Autenticazione Negozio

```
POST /api/shop/auth/send-otp
  Body: { email: string }
  Response: { message: "OTP inviato" }

POST /api/shop/auth/verify-otp
  Body: { email: string, code: string }
  Response: { token: string, shopUser: ShopUser, shop: Shop }
  Nota: Solo email associate a negozi nel DB
```

## Shop Info

```
GET /api/shop/me
  Response: { shopUser: ShopUser, shop: Shop }

PATCH /api/shop/profile
  Body: { name?, address?, city?, phone?, category?,
          rewardThreshold?, rewardDescription?,
          pointsSystem?, pointsPerVisit?, pointsPerEuro?, welcomePoints? }
  Response: { shop: Shop }
```

## Dashboard

```
GET /api/shop/stats
  Response: {
    totalCustomers: number,
    totalPointsIssued: number,
    totalVisitsToday: number,
    totalVisitsWeek: number,
    totalVisitsMonth: number,
    recentCheckins: Array<{
      id, customerName, customerCode, points, amount, createdAt
    }>
  }
```

## Scanner / Check-in

```
POST /api/shop/checkin
  Body: { customerCode: string, amount?: number }
  Response: { customerName, customerCode, pointsAdded, totalPoints }
  Logica:
    - Cerca cliente per code
    - Calcola punti (per_visit/per_euro/combined)
    - Crea record check-in
    - Aggiorna punti cliente
```

## Clienti

```
GET /api/shop/customers?search=
  Response: Array<ShopCustomer>
  Nota: Solo clienti che hanno fatto check-in in questo negozio

GET /api/shop/customers/:id
  Response: {
    customer: ShopCustomer,
    checkins: Array<{ id, points, amount, createdAt }>
  }
```

## Premi

```
GET /api/shop/rewards
  Response: Array<ShopReward>

POST /api/shop/rewards
  Body: { description: string, pointsRequired: number }
  Response: ShopReward

PATCH /api/shop/rewards/:id
  Body: { description?, pointsRequired?, active? }
  Response: ShopReward

DELETE /api/shop/rewards/:id
  Response: { success: true }
```

## Offerte

```
GET /api/shop/offers
  Response: Array<ShopOffer>

POST /api/shop/offers
  Body: { title: string, description: string, expiresAt?: string }
  Response: ShopOffer

PATCH /api/shop/offers/:id
  Body: { title?, description?, expiresAt?, active? }
  Response: ShopOffer

DELETE /api/shop/offers/:id
  Response: { success: true }
```

## Gift Card

```
GET /api/shop/gift-cards
  Response: Array<ShopGiftCard>

POST /api/shop/gift-cards
  Body: { value: number, description?: string, customerEmail?: string }
  Response: ShopGiftCard
  Nota: Genera codice univoco "GC-XXXXXXXX" + crea QR

GET /api/shop/gift-cards/scan/:code
  Response: ShopGiftCard (con usedAt se già usata)
  Usato dallo scanner per verificare prima di confermare

POST /api/shop/gift-cards/:id/use
  Response: { success: true }
  Logica: Imposta usedAt = now

DELETE /api/shop/gift-cards/:id
  Response: { success: true }
```

## Tipi (TypeScript)

```typescript
interface ShopUser { id, shopId, email, name, role: 'owner'|'staff' }
interface ShopStats { totalCustomers, totalPointsIssued, totalVisitsToday,
                      totalVisitsWeek, totalVisitsMonth, recentCheckins }
interface ShopCheckin { id, customerName, customerCode, points, amount, createdAt }
interface ShopCustomer { id, name, email, code, points, totalVisits, lastVisitAt }
interface ShopReward { id, shopId, description, pointsRequired, active, createdAt }
interface ShopOffer { id, shopId, title, description, expiresAt, active, createdAt }
interface ShopGiftCard { id, code, value, description, customerName,
                         customerEmail, usedAt, createdAt }
```
