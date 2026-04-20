'use client'

import { useAuthStore } from '@/store/authStore'
import { ProtectedLayout } from '@/components/ProtectedLayout'
import { useRouter } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { getShops } from '@/lib/api'
import { CustomerShop } from '@/types'
import { usePushNotifications } from '@/hooks/usePushNotifications'
import Link from 'next/link'

function getTier(visits: number) {
  if (visits >= 50) return { label: 'Platino', color: '#E2E8F0', emoji: '💎' }
  if (visits >= 25) return { label: 'Oro', color: '#FBBF24', emoji: '🏆' }
  if (visits >= 10) return { label: 'Argento', color: '#94A3B8', emoji: '⭐' }
  if (visits >= 3)  return { label: 'Bronzo', color: '#CD7C2F', emoji: '🎖️' }
  return { label: 'Nuovo', color: '#A78BFA', emoji: '✨' }
}

export default function ProfiloPage() {
  const { customer, logout } = useAuthStore()
  const router = useRouter()
  const { subscribed, subscribe, unsubscribe, loading, error, permission } = usePushNotifications()

  const { data: shops = [] } = useQuery({
    queryKey: ['customer-shops', customer?.email],
    queryFn: () => getShops(),
    enabled: !!customer?.email,
    select: (res) => res.data as CustomerShop[],
  })

  const totalPoints = shops.reduce((s, sh) => s + sh.points, 0)
  const totalVisits = shops.reduce((s, sh) => s + sh.totalVisits, 0)
  const firstName = customer?.name?.split(' ')[0] || 'Cliente'
  const tier = getTier(totalVisits)

  function handleLogout() {
    logout()
    router.replace('/login')
  }

  const menuItems = [
    { label: 'I miei negozi', icon: '🏪', href: '/', color: '#A78BFA' },
    { label: 'I miei premi', icon: '🏆', href: '/premi', color: '#FBBF24' },
    { label: 'Storico visite', icon: '📋', href: '/storico', color: '#10B981' },
    { label: 'Offerte & Premi', icon: '🔥', href: '/offerte', color: '#F59E0B' },
    { label: 'Scopri negozi', icon: '🗺️', href: '/scopri', color: '#60A5FA' },
  ]

  return (
    <ProtectedLayout>
      <div className="pb-10">

        {/* Hero profilo */}
        <div
          className="relative overflow-hidden px-5 pt-14 pb-8"
          style={{ background: 'linear-gradient(180deg, rgba(109,40,217,0.2) 0%, transparent 100%)' }}
        >
          <div className="absolute top-0 left-0 right-0 h-48 pointer-events-none" style={{ background: 'radial-gradient(ellipse 80% 60% at 50% 0%, rgba(124,58,237,0.18) 0%, transparent 100%)' }} />

          {/* Avatar centrato */}
          <div className="flex flex-col items-center text-center">
            <div
              className="relative w-24 h-24 rounded-3xl flex items-center justify-center font-display font-black text-4xl mb-4"
              style={{
                background: 'linear-gradient(135deg, #7C3AED, #3B82F6)',
                boxShadow: '0 12px 40px rgba(124,58,237,0.5), 0 0 0 1px rgba(255,255,255,0.08)',
              }}
            >
              {firstName[0]?.toUpperCase()}
              {/* Badge tier */}
              <div
                className="absolute -bottom-2 -right-2 w-8 h-8 rounded-xl flex items-center justify-center text-base"
                style={{ background: '#0D0D1A', border: '2px solid rgba(255,255,255,0.08)' }}
              >
                {tier.emoji}
              </div>
            </div>

            <h1 className="font-display font-bold text-2xl mb-1">{customer?.name}</h1>
            <p className="text-sm mb-1" style={{ color: 'rgba(255,255,255,0.4)' }}>{customer?.email}</p>
            <span className="text-xs font-bold px-3 py-1 rounded-full mb-5" style={{ background: 'rgba(167,139,250,0.1)', color: tier.color, border: `1px solid ${tier.color}30` }}>
              {tier.emoji} {tier.label}
            </span>

            {/* Stats */}
            <div className="flex items-center gap-6">
              {[
                { label: 'Punti', value: totalPoints, color: '#A78BFA' },
                { label: 'Visite', value: totalVisits, color: '#60A5FA' },
                { label: 'Negozi', value: shops.length, color: '#F0ABFC' },
              ].map((stat, i, arr) => (
                <div key={stat.label} className="flex items-center gap-6">
                  <div className="text-center">
                    <p className="font-display font-black text-3xl leading-none" style={{ color: stat.color }}>{stat.value}</p>
                    <p className="text-[10px] mt-1 font-medium tracking-wide uppercase" style={{ color: 'rgba(255,255,255,0.3)' }}>{stat.label}</p>
                  </div>
                  {i < arr.length - 1 && <div className="w-px h-8" style={{ background: 'rgba(255,255,255,0.08)' }} />}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Codice */}
        <div className="px-5 mb-6">
          <div
            className="rounded-2xl px-4 py-3.5 flex items-center justify-between"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}
          >
            <div>
              <p className="text-[10px] tracking-widest uppercase font-semibold mb-0.5" style={{ color: 'rgba(255,255,255,0.3)' }}>Il tuo codice Fidelio</p>
              <p className="font-mono font-bold text-lg tracking-widest text-white">{customer?.code}</p>
            </div>
            <div className="text-2xl">🪪</div>
          </div>
        </div>

        {/* Navigazione */}
        <div className="px-5 mb-5">
          <p className="text-[10px] font-bold tracking-widest uppercase mb-3" style={{ color: 'rgba(255,255,255,0.3)' }}>Navigazione</p>
          <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid rgba(255,255,255,0.07)' }}>
            {menuItems.map((item, i) => (
              <Link key={item.href} href={item.href}>
                <div
                  className="flex items-center gap-3.5 px-4 py-4 active:bg-white/5 transition-colors"
                  style={{ borderBottom: i < menuItems.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none', background: 'rgba(255,255,255,0.025)' }}
                >
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center text-base flex-shrink-0"
                    style={{ background: item.color + '15', border: `1px solid ${item.color}20` }}
                  >
                    {item.icon}
                  </div>
                  <span className="font-semibold text-sm flex-1 text-white">{item.label}</span>
                  <span style={{ color: 'rgba(255,255,255,0.2)', fontSize: 18, fontWeight: 300 }}>›</span>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Impostazioni */}
        <div className="px-5 mb-6">
          <p className="text-[10px] font-bold tracking-widest uppercase mb-3" style={{ color: 'rgba(255,255,255,0.3)' }}>Impostazioni</p>
          <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid rgba(255,255,255,0.07)', background: 'rgba(255,255,255,0.025)' }}>
            <div className="flex items-center gap-3.5 px-4 py-4">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center text-base flex-shrink-0" style={{ background: 'rgba(124,58,237,0.15)', border: '1px solid rgba(124,58,237,0.2)' }}>
                🔔
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm text-white">Notifiche push</p>
                <p className="text-xs mt-0.5 truncate" style={{ color: 'rgba(255,255,255,0.3)' }}>
                  {subscribed ? 'Attive' : permission === 'denied' ? 'Bloccate dal browser' : 'Disattivate'}
                </p>
                {error && <p className="text-xs mt-0.5" style={{ color: '#EF4444' }}>{error}</p>}
              </div>
              {permission === 'denied' ? (
                <span className="text-xs font-semibold px-2.5 py-1.5 rounded-xl flex-shrink-0" style={{ background: 'rgba(239,68,68,0.1)', color: '#EF4444' }}>Bloccate</span>
              ) : subscribed ? (
                <button onClick={unsubscribe} disabled={loading} className="text-xs font-semibold px-2.5 py-1.5 rounded-xl flex-shrink-0" style={{ background: 'rgba(239,68,68,0.1)', color: '#EF4444', opacity: loading ? 0.5 : 1 }}>
                  {loading ? '...' : 'Disattiva'}
                </button>
              ) : (
                <button onClick={subscribe} disabled={loading} className="text-xs font-semibold px-2.5 py-1.5 rounded-xl flex-shrink-0" style={{ background: 'rgba(124,58,237,0.2)', color: '#A78BFA', opacity: loading ? 0.5 : 1 }}>
                  {loading ? '...' : 'Attiva'}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Logout */}
        <div className="px-5">
          <button
            onClick={handleLogout}
            className="w-full py-4 rounded-2xl font-bold text-sm active:scale-[0.98] transition-transform"
            style={{ background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.12)', color: '#F87171' }}
          >
            Esci dall&apos;account
          </button>
          <p className="text-center text-xs mt-5" style={{ color: 'rgba(255,255,255,0.1)' }}>Fidelio · Made with ♥ in Italy</p>
        </div>
      </div>
    </ProtectedLayout>
  )
}
