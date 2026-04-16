import axios from 'axios'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://fidelio-web-git-main-tony91pes-projects.vercel.app'

// ─── Client API (customers) ──────────────────────────────────────────────────
const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
})

api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('fidelio_token')
    if (token) config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401 && typeof window !== 'undefined') {
      localStorage.removeItem('fidelio_token')
      localStorage.removeItem('fidelio_customer')
      window.location.href = '/login'
    }
    return Promise.reject(err)
  }
)

// ─── Shop API (negozio portal) ───────────────────────────────────────────────
const shopApi = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
})

shopApi.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('fidelio_shop_token')
    if (token) config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

shopApi.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401 && typeof window !== 'undefined') {
      localStorage.removeItem('fidelio_shop_token')
      localStorage.removeItem('fidelio_shop_user')
      localStorage.removeItem('fidelio_shop')
      window.location.href = '/negozio/login'
    }
    return Promise.reject(err)
  }
)

// Auth
export const sendOTP = (email: string) =>
  api.post('/api/customer/auth/send-otp', { email })

export const verifyOTP = (email: string, code: string) =>
  api.post('/api/customer/auth/verify-otp', { email, code })

export const getMe = () =>
  api.get('/api/customer/me')

// Shops
export const getShops = () =>
  api.get('/api/app/customer-shops', {
    params: typeof window !== 'undefined'
      ? { email: JSON.parse(localStorage.getItem('fidelio_customer') || '{}')?.email }
      : {}
  })

export const getAllShops = () =>
  api.get('/api/app/shops')

export const getMyCode = (email: string) =>
  api.get('/api/app/my-code', { params: { email } })

// Rewards
export const getRewards = (email: string) =>
  api.get('/api/customer/rewards', { params: { email } })

export const getGiftCards = (email: string) =>
  api.get('/api/customer/giftcards', { params: { email } })

export const getShopById = (id: string) =>
  api.get(`/api/app/shops/${id}`)

export const updateCustomer = (data: { name?: string; birthday?: string }, token: string) =>
  api.post('/api/app/customer/update', data, { headers: { Authorization: `Bearer ${token}` } })

// ─── Shop Auth ───────────────────────────────────────────────────────────────
export const shopSendOTP = (email: string) =>
  shopApi.post('/api/shop/auth/send-otp', { email })

export const shopVerifyOTP = (email: string, code: string) =>
  shopApi.post('/api/shop/auth/verify-otp', { email, code })

export const getShopMe = () =>
  shopApi.get('/api/shop/me')

// ─── Shop Dashboard ──────────────────────────────────────────────────────────
export const getShopStats = () =>
  shopApi.get('/api/shop/stats')

// ─── Shop Scanner / Check-in ─────────────────────────────────────────────────
export const shopCheckin = (customerCode: string, amount?: number) =>
  shopApi.post('/api/shop/checkin', { customerCode, amount })

// ─── Shop Customers ──────────────────────────────────────────────────────────
export const getShopCustomers = (search?: string) =>
  shopApi.get('/api/shop/customers', { params: search ? { search } : {} })

export const getShopCustomerDetail = (customerId: string) =>
  shopApi.get(`/api/shop/customers/${customerId}`)

// ─── Shop Rewards ────────────────────────────────────────────────────────────
export const getShopRewards = () =>
  shopApi.get('/api/shop/rewards')

export const createShopReward = (data: { description: string; pointsRequired: number }) =>
  shopApi.post('/api/shop/rewards', data)

export const updateShopReward = (id: string, data: { description?: string; pointsRequired?: number; active?: boolean }) =>
  shopApi.patch(`/api/shop/rewards/${id}`, data)

export const deleteShopReward = (id: string) =>
  shopApi.delete(`/api/shop/rewards/${id}`)

// ─── Shop Offers ─────────────────────────────────────────────────────────────
export const getShopOffers = () =>
  shopApi.get('/api/shop/offers')

export const createShopOffer = (data: { title: string; description: string; expiresAt?: string }) =>
  shopApi.post('/api/shop/offers', data)

export const updateShopOffer = (id: string, data: { title?: string; description?: string; expiresAt?: string; active?: boolean }) =>
  shopApi.patch(`/api/shop/offers/${id}`, data)

export const deleteShopOffer = (id: string) =>
  shopApi.delete(`/api/shop/offers/${id}`)

// ─── Shop Gift Cards ─────────────────────────────────────────────────────────
export const getShopGiftCards = () =>
  shopApi.get('/api/shop/gift-cards')

export const createShopGiftCard = (data: { value: number; description?: string; customerEmail?: string }) =>
  shopApi.post('/api/shop/gift-cards', data)

export const scanShopGiftCard = (code: string) =>
  shopApi.get(`/api/shop/gift-cards/scan/${code}`)

export const useShopGiftCard = (id: string) =>
  shopApi.post(`/api/shop/gift-cards/${id}/use`)

export const deleteShopGiftCard = (id: string) =>
  shopApi.delete(`/api/shop/gift-cards/${id}`)

// ─── Shop Profile ────────────────────────────────────────────────────────────
export const updateShopProfile = (data: {
  name?: string
  address?: string
  city?: string
  phone?: string
  category?: string
  rewardThreshold?: number
  rewardDescription?: string
  pointsPerVisit?: number
  pointsPerEuro?: number
  welcomePoints?: number
}) =>
  shopApi.patch('/api/shop/profile', data)

export { shopApi }
export default api
