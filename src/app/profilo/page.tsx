'use client'

import { useAuthStore } from '@/store/authStore'
import { ProtectedLayout } from '@/components/ProtectedLayout'
import { useRouter } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { getShops } from '@/lib/api'
import { CustomerShop } from '@/types'

export default function ProfiloPage() {
  const { customer, logout } = useAuthStore()
  const router = useRouter()

  const { data: shops = [] } = useQuery({
    queryKey: ['customer-shops', customer?.email],
    queryFn: () => getShops(),
    enabled: !!customer?.email,
    select: (res) => res.data as CustomerShop[],
  })

  const totalPoints = shops.reduce((s, sh) => s + sh.points, 0)
  const totalVisits = shops.reduce((s, sh) => s + sh.totalVisits, 0)

  function handleLogout() {
    logout()
    router.replace('/login')
  }

  const stats = [
    { label: 'Punti totali', value: totalPoints, emoji: '⭐' },
    { label: 'Visite totali', value: totalVisits, emoji: '🏪' },
    { label: 'Negozi', value: shops.length, emoji: '📍' },
  ]

  return (
    <ProtectedLayout>
      <div className="page-enter px-4 pt-14 pb-4">
        {/* Avatar */}
        <div className="flex flex-col items-center mb-8 pt-4">
          <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-brand to-blue-500 flex items-center justify-center mb-4 glow-brand">
            <span className="font-display font-black text-3xl">{customer?.name?.[0]?.toUpperCase() || 'C'}</span>
          </div>
          <h1 className="font-display font-bold text-2xl">{customer?.name}</h1>
          <p className="text-white/40 text-sm mt-0.5">{customer?.email}</p>
          <div className="font-mono text-xs text-white/30 mt-1 tracking-widest">{customer?.code}</div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          {stats.map((stat) => (
            <div key={stat.label} className="glass rounded-2xl p-4 text-center">
              <p className="text-2xl mb-1">{stat.emoji}</p>
              <p className="font-display font-black text-xl">{stat.value}</p>
              <p className="text-white/40 text-[10px]">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Menu */}
        <div className="flex flex-col gap-2 mb-8">
          {[
            { label: 'I miei negozi', emoji: '🏪', href: '/' },
            { label: 'I miei premi', emoji: '🏆', href: '/premi' },
            { label: 'Scopri negozi', emoji: '🗺️', href: '/scopri' },
          ].map((item) => (
            <button
              key={item.label}
              onClick={() => router.push(item.href)}
              className="glass rounded-xl p-4 flex items-center gap-3 w-full text-left hover:bg-white/5 transition-colors"
            >
              <span className="text-xl">{item.emoji}</span>
              <span className="font-medium text-sm flex-1">{item.label}</span>
              <span className="text-white/20">→</span>
            </button>
          ))}
        </div>

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="w-full py-4 rounded-xl text-danger font-semibold text-sm"
          style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)' }}
        >
          Esci dall'account
        </button>

        <p className="text-center text-white/20 text-xs mt-6">Fidelio v1.0 · Made with ♥ in Italy</p>
      </div>
    </ProtectedLayout>
  )
}
