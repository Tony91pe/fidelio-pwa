'use client'

import { useEffect } from 'react'
import { useAuthStore } from '@/store/authStore'

export function AuthInit() {
  const loadFromStorage = useAuthStore((s) => s.loadFromStorage)

  useEffect(() => {
    loadFromStorage()
  }, [loadFromStorage])

  return null
}
