export interface Customer {
  id: string
  name: string
  email: string
  code: string
  points: number
  totalVisits: number
  lastVisitAt: string | null
  birthday: string | null
}

export interface Shop {
  id: string
  name: string
  category: string
  address: string
  city: string
  phone: string | null
  lat?: number
  lng?: number
  rewardThreshold: number
  rewardDescription: string
  pointsSystem: 'per_visit' | 'per_euro' | 'combined'
  pointsPerVisit: number
  pointsPerEuro: number
  welcomePoints: number
}

export interface CustomerShop {
  shopId: string
  shopName: string
  category: string
  points: number
  totalVisits: number
  nextRewardPoints: number
  rewardDescription: string
}

export interface Reward {
  id: string
  shopId: string
  shopName: string
  description: string
  pointsRequired: number
  createdAt: string
}

export interface GiftCard {
  id: string
  code: string
  points: number
  description: string | null
  shopId: string
  shopName: string
}

export interface AuthState {
  token: string | null
  customer: Customer | null
  isAuthenticated: boolean
}

// ─── Negozio (Shop owner portal) ────────────────────────────────────────────

export interface ShopUser {
  id: string
  shopId: string
  email: string
  name: string
  role: 'owner' | 'staff'
}

export interface ShopStats {
  totalCustomers: number
  totalPointsIssued: number
  totalVisitsToday: number
  totalVisitsWeek: number
  totalVisitsMonth: number
  recentCheckins: ShopCheckin[]
}

export interface ShopCheckin {
  id: string
  customerName: string
  customerCode: string
  points: number
  amount: number | null
  createdAt: string
}

export interface ShopCustomer {
  id: string
  name: string
  email: string
  code: string
  points: number
  totalVisits: number
  lastVisitAt: string | null
}

export interface ShopReward {
  id: string
  shopId: string
  description: string
  pointsRequired: number
  active: boolean
  createdAt: string
}

export interface ShopOffer {
  id: string
  shopId: string
  title: string
  description: string
  expiresAt: string | null
  active: boolean
  createdAt: string
}

export interface ShopGiftCard {
  id: string
  code: string
  value: number
  remainingValue: number
  description: string | null
  customerName: string | null
  customerEmail: string | null
  usedAt: string | null
  createdAt: string
}

export type CategoryKey =
  | 'bar'
  | 'ristorante'
  | 'pizzeria'
  | 'parrucchiere'
  | 'estetista'
  | 'palestra'
  | 'negozio'
  | 'farmacia'
  | 'supermercato'
  | 'other'

export interface CategoryConfig {
  emoji: string
  color: string
  label: string
  plural: string
}
