'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useShopAuthStore } from '@/store/shopAuthStore'
import { ShopBottomNav } from './ShopBottomNav'

export function ShopProtectedLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useShopAuthStore()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace('/negozio/login')
    }
  }, [isAuthenticated, isLoading, router])

  if (isLoading) {
    return (
      <div className="min-h-dvh flex items-center justify-center" style={{ background: '#0A140F' }}>
        <div className="flex flex-col items-center gap-4">
          <div
            className="w-12 h-12 rounded-2xl flex items-center justify-center animate-pulse"
            style={{ background: 'linear-gradient(135deg, #10B981, #0EA5E9)' }}
          >
            <span className="text-2xl">🏪</span>
          </div>
          <p className="text-sm" style={{ color: 'rgba(255,255,255,0.4)' }}>Caricamento...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) return null

  return (
    <div className="min-h-dvh pb-24" style={{ background: '#0A140F' }}>
      {children}
      <ShopBottomNav />
    </div>
  )
}
