'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/authStore'
import { BottomNav } from './BottomNav'

export function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuthStore()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace('/login')
    }
  }, [isAuthenticated, isLoading, router])

  if (isLoading) {
    return (
      <div className="min-h-dvh flex items-center justify-center bg-surface">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-brand to-blue-500 flex items-center justify-center animate-pulse-slow">
            <span className="text-2xl">✦</span>
          </div>
          <p className="text-white/40 text-sm">Caricamento...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) return null

  return (
    <div className="min-h-dvh pb-24">
      {children}
      <BottomNav />
    </div>
  )
}
