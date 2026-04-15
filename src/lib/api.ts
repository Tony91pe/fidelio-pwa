import axios from 'axios'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://fidelio-web-git-main-tony91pes-projects.vercel.app'

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

export default api

export const getShopById = (id: string) =>
  api.get(`/api/app/shops/${id}`)

export const updateCustomer = (data: { name?: string; birthday?: string }, token: string) =>
  api.post('/api/app/customer/update', data, { headers: { Authorization: `Bearer ${token}` } })
