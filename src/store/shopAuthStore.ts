'use client'

import { create } from 'zustand'
import { ShopUser, Shop } from '@/types'

interface ShopAuthStore {
  token: string | null
  shopUser: ShopUser | null
  shop: Shop | null
  isAuthenticated: boolean
  isLoading: boolean
  setAuth: (token: string, shopUser: ShopUser, shop: Shop) => void
  logout: () => void
  loadFromStorage: () => void
  updateShop: (shop: Shop) => void
}

export const useShopAuthStore = create<ShopAuthStore>((set) => ({
  token: null,
  shopUser: null,
  shop: null,
  isAuthenticated: false,
  isLoading: true,

  setAuth: (token, shopUser, shop) => {
    localStorage.setItem('fidelio_shop_token', token)
    localStorage.setItem('fidelio_shop_user', JSON.stringify(shopUser))
    localStorage.setItem('fidelio_shop', JSON.stringify(shop))
    set({ token, shopUser, shop, isAuthenticated: true, isLoading: false })
  },

  logout: () => {
    localStorage.removeItem('fidelio_shop_token')
    localStorage.removeItem('fidelio_shop_user')
    localStorage.removeItem('fidelio_shop')
    set({ token: null, shopUser: null, shop: null, isAuthenticated: false, isLoading: false })
  },

  loadFromStorage: () => {
    try {
      const token = localStorage.getItem('fidelio_shop_token')
      const shopUserStr = localStorage.getItem('fidelio_shop_user')
      const shopStr = localStorage.getItem('fidelio_shop')
      if (token && shopUserStr && shopStr) {
        const shopUser = JSON.parse(shopUserStr)
        const shop = JSON.parse(shopStr)
        set({ token, shopUser, shop, isAuthenticated: true, isLoading: false })
      } else {
        set({ isLoading: false })
      }
    } catch {
      set({ isLoading: false })
    }
  },

  updateShop: (shop) => {
    localStorage.setItem('fidelio_shop', JSON.stringify(shop))
    set({ shop })
  },
}))
