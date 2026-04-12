'use client'

import { create } from 'zustand'
import { Customer } from '@/types'

interface AuthStore {
  token: string | null
  customer: Customer | null
  isAuthenticated: boolean
  isLoading: boolean
  setAuth: (token: string, customer: Customer) => void
  logout: () => void
  loadFromStorage: () => void
}

export const useAuthStore = create<AuthStore>((set) => ({
  token: null,
  customer: null,
  isAuthenticated: false,
  isLoading: true,

  setAuth: (token, customer) => {
    localStorage.setItem('fidelio_token', token)
    localStorage.setItem('fidelio_customer', JSON.stringify(customer))
    set({ token, customer, isAuthenticated: true, isLoading: false })
  },

  logout: () => {
    localStorage.removeItem('fidelio_token')
    localStorage.removeItem('fidelio_customer')
    set({ token: null, customer: null, isAuthenticated: false, isLoading: false })
  },

  loadFromStorage: () => {
    try {
      const token = localStorage.getItem('fidelio_token')
      const customerStr = localStorage.getItem('fidelio_customer')
      if (token && customerStr) {
        const customer = JSON.parse(customerStr)
        set({ token, customer, isAuthenticated: true, isLoading: false })
      } else {
        set({ isLoading: false })
      }
    } catch {
      set({ isLoading: false })
    }
  },
}))
