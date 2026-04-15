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
