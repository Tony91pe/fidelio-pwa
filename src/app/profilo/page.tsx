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
      <div className="px-4 pt-8 pb-6">

        {/* Header */}
        <div className="mb-7" style={{ animation: 'slideUp 0.4s cubic-bezier(0.16,1,0.3,1) both' }}>
          <p className="text-xs font-medium mb-1" style={{ color: 'rgba(255,255,255,0.35)', letterSpacing: '0.05em' }}>Il tuo account</p>
          <h1 className="font-display font-bold text-2xl leading-tight">Profilo</h1>
        </div>

        {/* Profile card */}
        <div
          className="relative rounded-3xl overflow-hidden mb-6 p-5"
          style={{
            background: 'linear-gradient(135deg, #2D1B69 0%, #1A1F5E 60%, #0F1340 100%)',
            boxShadow: '0 20px 40px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.07)',
            animation: 'slideUp 0.4s cubic-bezier(0.16,1,0.3,1) 0.05s both',
          }}
        >
          <div className="absolute top-0 right-0 w-40 h-40 rounded-full pointer-events-none" style={{ background: 'rgba(124,58,237,0.15)', filter: 'blur(40px)', transform: 'translate(30%,-30%)' }} />

          {/* Avatar + name */}
          <div className="flex items-center gap-4 mb-5">
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center font-display font-black text-2xl flex-shrink-0"
              style={{ background: 'linear-gradient(135deg, #7C3AED, #3B82F6)', boxShadow: '0 8px 20px rgba(124,58,237,0.4)' }}
            >
              {firstName[0]?.toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-lg leading-tight truncate">{customer?.name}</p>
              <p className="text-sm mt-0.5 truncate" style={{ color: 'rgba(255,255,255,0.4)' }}>{customer?.email}</p>
              <p className="font-mono text-xs mt-1 tracking-widest" style={{ color: 'rgba(255,255,255,0.2)' }}>{customer?.code}</p>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-2">
            {[
              { label: 'Punti', value: totalPoints, color: '#A78BFA' },
              { label: 'Visite', value: totalVisits, color: '#60A5FA' },
              { label: 'Negozi', value: shops.length, color: '#F0ABFC' },
            ].map((stat) => (
              <div key={stat.label} className="rounded-xl p-3 text-center" style={{ background: 'rgba(255,255,255,0.06)' }}>
                <p className="font-display font-black text-2xl leading-none" style={{ color: stat.color }}>{stat.value}</p>
                <p className="text-[10px] mt-1" style={{ color: 'rgba(255,255,255,0.4)' }}>{stat.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Menu */}
        <h2 className="font-semibold text-sm mb-3" style={{ color: 'rgba(255,255,255,0.6)', letterSpacing: '0.05em', textTransform: 'uppercase', animation: 'slideUp 0.4s cubic-bezier(0.16,1,0.3,1) 0.1s both' }}>Navigazione</h2>

        <div
          className="rounded-2xl overflow-hidden mb-6"
          style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', animation: 'slideUp 0.4s cubic-bezier(0.16,1,0.3,1) 0.1s both' }}
        >
          {[
            { label: 'I miei negozi', emoji: '🏪', href: '/', color: '#A78BFA' },
            { label: 'I miei premi', emoji: '🏆', href: '/premi', color: '#FACC15' },
            { label: 'Offerte & Premi', emoji: '🔥', href: '/offerte', color: '#F59E0B' },
            { label: 'Scopri negozi', emoji: '🗺️', href: '/scopri', color: '#60A5FA' },
          ].map((item, i, arr) => (
            <Link key={item.label} href={item.href}>
              <div
                className="flex items-center gap-3 px-4 py-3.5 transition-all active:scale-[0.98]"
                style={{ borderBottom: i < arr.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none' }}
              >
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center text-base flex-shrink-0"
                  style={{ background: item.color + '18', border: `1px solid ${item.color}25` }}
                >
                  {item.emoji}
                </div>
                <span className="font-medium text-sm flex-1">{item.label}</span>
                <span style={{ color: 'rgba(255,255,255,0.2)', fontSize: 12 }}>›</span>
              </div>
            </Link>
          ))}
        </div>

        {/* Push notifications */}
        <h2 className="font-semibold text-sm mb-3" style={{ color: 'rgba(255,255,255,0.6)', letterSpacing: '0.05em', textTransform: 'uppercase', animation: 'slideUp 0.4s cubic-bezier(0.16,1,0.3,1) 0.15s both' }}>Impostazioni</h2>

        <div
          className="rounded-2xl overflow-hidden mb-6"
          style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', animation: 'slideUp 0.4s cubic-bezier(0.16,1,0.3,1) 0.15s both' }}
        >
          <div className="flex items-center gap-3 px-4 py-3.5">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center text-base flex-shrink-0" style={{ background: 'rgba(124,58,237,0.15)', border: '1px solid rgba(124,58,237,0.2)' }}>
              🔔
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm">Notifiche push</p>
              <p className="text-xs mt-0.5 truncate" style={{ color: 'rgba(255,255,255,0.35)' }}>
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
          className="w-full py-3.5 rounded-2xl font-semibold text-sm transition-all active:scale-[0.98]"
          style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.15)', color: '#EF4444', animation: 'slideUp 0.4s cubic-bezier(0.16,1,0.3,1) 0.2s both' }}
        >
          Esci dall'account
        </button>

        <p className="text-center text-xs mt-6" style={{ color: 'rgba(255,255,255,0.12)' }}>Fidelio · Made with ♥ in Italy</p>
      </div>
    </ProtectedLayout>
  )
}
