'use client'

import { useAuthStore } from '@/store/authStore'
import { ProtectedLayout } from '@/components/ProtectedLayout'
import { useRouter } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { getShops } from '@/lib/api'
import { CustomerShop } from '@/types'
import { usePushNotifications } from '@/hooks/usePushNotifications'
import Link from 'next/link'

export default function ProfiloPage() {
  const { customer, logout } = useAuthStore()
  const router = useRouter()
  const { permission, subscribed, subscribe, unsubscribe, loading, error } = usePushNotifications()

  const { data: shops = [] } = useQuery({
    queryKey: ['customer-shops', customer?.email],
    queryFn: () => getShops(),
    enabled: !!customer?.email,
    select: (res) => res.data as CustomerShop[],
  })

  const totalPoints = shops.reduce((s, sh) => s + sh.points, 0)
  const totalVisits = shops.reduce((s, sh) => s + sh.totalVisits, 0)
  const firstName = customer?.name?.split(' ')[0] || 'Cliente'

  function handleLogout() {
    logout()
    router.replace('/login')
  }

  return (
    <ProtectedLayout>
      <div className="px-4 pt-8 pb-24">

        {/* Avatar + info */}
        <div className="flex flex-col items-center mb-8" style={{ animation: 'slideUp 0.4s cubic-bezier(0.16,1,0.3,1) both' }}>
          <div className="w-20 h-20 rounded-3xl flex items-center justify-center mb-4 font-display font-black text-3xl" style={{ background: 'linear-gradient(135deg, #7C3AED, #3B82F6)', boxShadow: '0 8px 24px rgba(124,58,237,0.4)' }}>
            {firstName[0]?.toUpperCase()}
          </div>
          <h1 className="font-display font-bold text-2xl">{customer?.name}</h1>
          <p className="text-sm mt-1" style={{ color: 'rgba(255,255,255,0.4)' }}>{customer?.email}</p>
          <p className="font-mono text-xs mt-1 tracking-widest" style={{ color: 'rgba(255,255,255,0.2)' }}>{customer?.code}</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mb-6" style={{ animation: 'slideUp 0.4s cubic-bezier(0.16,1,0.3,1) 0.05s both' }}>
          {[
            { label: 'Punti totali', value: totalPoints, emoji: '⭐', color: '#FACC15' },
            { label: 'Visite', value: totalVisits, emoji: '🏪', color: '#A78BFA' },
            { label: 'Negozi', value: shops.length, emoji: '📍', color: '#60A5FA' },
          ].map((stat) => (
            <div key={stat.label} className="rounded-2xl p-4 text-center" style={{ background: 'rgba(255,255,255,0.035)', border: '1px solid rgba(255,255,255,0.07)' }}>
              <div className="w-8 h-8 rounded-xl flex items-center justify-center text-base mx-auto mb-2" style={{ background: stat.color + '1A' }}>{stat.emoji}</div>
              <p className="font-display font-black text-xl leading-none">{stat.value}</p>
              <p className="text-[10px] mt-1" style={{ color: 'rgba(255,255,255,0.35)' }}>{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Menu links */}
        <div className="flex flex-col gap-2 mb-4" style={{ animation: 'slideUp 0.4s cubic-bezier(0.16,1,0.3,1) 0.1s both' }}>
          {[
            { label: 'I miei negozi', emoji: '🏪', href: '/' },
            { label: 'I miei premi', emoji: '🏆', href: '/premi' },
            { label: 'Scopri negozi', emoji: '🗺️', href: '/scopri' },
          ].map((item) => (
            <Link key={item.label} href={item.href}>
              <div className="rounded-xl p-4 flex items-center gap-3 transition-all active:scale-[0.98]" style={{ background: 'rgba(255,255,255,0.035)', border: '1px solid rgba(255,255,255,0.07)' }}>
                <div className="w-8 h-8 rounded-lg flex items-center justify-center text-base" style={{ background: 'rgba(255,255,255,0.06)' }}>{item.emoji}</div>
                <span className="font-medium text-sm flex-1">{item.label}</span>
                <span style={{ color: 'rgba(255,255,255,0.2)', fontSize: 12 }}>→</span>
              </div>
            </Link>
          ))}
        </div>

        {/* Push notifications */}
        <div className="rounded-xl p-4 mb-4" style={{ background: 'rgba(255,255,255,0.035)', border: '1px solid rgba(255,255,255,0.07)', animation: 'slideUp 0.4s cubic-bezier(0.16,1,0.3,1) 0.15s both' }}>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center text-base flex-shrink-0" style={{ background: 'rgba(124,58,237,0.15)' }}>🔔</div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm">Notifiche push</p>
              <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.35)' }}>
                {subscribed ? 'Attive — ricevi aggiornamenti sui punti' : 'Ricevi notifiche quando guadagni punti'}
              </p>
              {error && <p className="text-xs mt-0.5" style={{ color: '#EF4444' }}>{error}</p>}
            </div>
            {subscribed ? (
              <button onClick={unsubscribe} disabled={loading} className="text-xs font-semibold px-3 py-1.5 rounded-lg flex-shrink-0" style={{ background: 'rgba(239,68,68,0.12)', color: '#EF4444', opacity: loading ? 0.5 : 1 }}>
                {loading ? '⏳' : 'Disattiva'}
              </button>
            ) : permission === 'denied' ? (
              <span className="text-xs flex-shrink-0" style={{ color: '#EF4444' }}>Bloccate</span>
            ) : (
              <button onClick={subscribe} disabled={loading} className="text-xs font-semibold px-3 py-1.5 rounded-lg flex-shrink-0" style={{ background: 'rgba(124,58,237,0.2)', color: '#A78BFA', opacity: loading ? 0.5 : 1 }}>
                {loading ? '⏳' : 'Attiva'}
              </button>
            )}
          </div>
        </div>

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="w-full py-3.5 rounded-xl font-semibold text-sm transition-all active:scale-[0.98]"
          style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.18)', color: '#EF4444', animation: 'slideUp 0.4s cubic-bezier(0.16,1,0.3,1) 0.2s both' }}
        >
          Esci dall'account
        </button>

        <p className="text-center text-xs mt-6" style={{ color: 'rgba(255,255,255,0.15)' }}>Fidelio v1.0 · Made with ♥ in Italy</p>
      </div>
    </ProtectedLayout>
  )
}
