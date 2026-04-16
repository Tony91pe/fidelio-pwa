'use client'

import { useEffect } from 'react'
import { useAuthStore } from '@/store/authStore'
import { useShopAuthStore } from '@/store/shopAuthStore'

export function AuthInit() {
  const loadFromStorage = useAuthStore((s) => s.loadFromStorage)
  const loadShopFromStorage = useShopAuthStore((s) => s.loadFromStorage)

  useEffect(() => {
    loadFromStorage()
    loadShopFromStorage()
  }, [loadFromStorage, loadShopFromStorage])

  return null
}
