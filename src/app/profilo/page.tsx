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
  if (visits >= 50) return { label: 'Platino', color: '#E2E8F0', bg: 'rgba(226,232,240,0.1)', emoji: '💎' }
  if (visits >= 25) return { label: 'Oro',     color: '#FBBF24', bg: 'rgba(251,191,36,0.1)',  emoji: '🏆' }
  if (visits >= 10) return { label: 'Argento', color: '#94A3B8', bg: 'rgba(148,163,184,0.1)', emoji: '⭐' }
  if (visits >= 3)  return { label: 'Bronzo',  color: '#CD7C2F', bg: 'rgba(205,124,47,0.1)',  emoji: '🎖️' }
  return { label: 'Nuovo', color: '#A78BFA', bg: 'rgba(167,139,250,0.1)', emoji: '✨' }
}

const ChevronRight = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="9 18 15 12 9 6"/>
  </svg>
)

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

  const menuSections = [
    {
      title: 'Attività',
      items: [
        { label: 'Le mie carte fedeltà', icon: '🃏', href: '/',         color: '#A78BFA' },
        { label: 'I miei premi',         icon: '🏆', href: '/premi',    color: '#FBBF24' },
        { label: 'Storico visite',       icon: '📋', href: '/storico',  color: '#10B981' },
        { label: 'Offerte & Promo',      icon: '🔥', href: '/offerte',  color: '#F59E0B' },
        { label: 'Scopri negozi',        icon: '🗺️', href: '/scopri',   color: '#60A5FA' },
      ],
    },
  ]

  return (
    <ProtectedLayout>
      <div className="pb-10">

        {/* Hero */}
        <div
          className="relative overflow-hidden px-5 pt-14 pb-8"
          style={{ background: 'linear-gradient(180deg, rgba(109,40,217,0.2) 0%, transparent 100%)' }}
        >
          <div className="absolute top-0 left-0 right-0 h-52 pointer-events-none" style={{ background: 'radial-gradient(ellipse 80% 60% at 50% 0%, rgba(124,58,237,0.2) 0%, transparent 100%)' }} />

          <div className="flex flex-col items-center text-center relative">
            {/* Avatar */}
            <div className="relative mb-4">
              <div
                className="w-24 h-24 rounded-3xl flex items-center justify-center font-display font-black text-4xl"
                style={{
                  background: 'linear-gradient(135deg, #7C3AED, #3B82F6)',
                  boxShadow: '0 12px 40px rgba(124,58,237,0.5), 0 0 0 1px rgba(255,255,255,0.08)',
                }}
              >
                {firstName[0]?.toUpperCase()}
              </div>
              {/* Tier badge */}
              <div
                className="absolute -bottom-2 -right-2 w-9 h-9 rounded-xl flex items-center justify-center text-lg"
                style={{ background: '#0F0F1A', border: `2px solid ${tier.color}40`, boxShadow: `0 0 12px ${tier.color}30` }}
              >
                {tier.emoji}
              </div>
            </div>

            {/* Name + email */}
            <h1 className="font-display font-bold text-2xl leading-tight mb-0.5">{customer?.name}</h1>
            <p className="text-sm mb-3" style={{ color: 'rgba(255,255,255,0.35)' }}>{customer?.email}</p>

            {/* Tier badge */}
            <span
              className="text-xs font-bold px-4 py-1.5 rounded-full mb-6"
              style={{ background: tier.bg, color: tier.color, border: `1px solid ${tier.color}30` }}
            >
              {tier.emoji} {tier.label}
            </span>

            {/* Stats row */}
            <div
              className="flex items-center gap-0 w-full rounded-2xl overflow-hidden"
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}
            >
              {[
                { label: 'Punti',  value: totalPoints,   color: '#A78BFA' },
                { label: 'Visite', value: totalVisits,   color: '#60A5FA' },
                { label: 'Negozi', value: shops.length,  color: '#F0ABFC' },
              ].map((stat, i, arr) => (
                <div
                  key={stat.label}
                  className="flex-1 py-4 text-center"
                  style={{ borderRight: i < arr.length - 1 ? '1px solid rgba(255,255,255,0.06)' : 'none' }}
                >
                  <p className="font-display font-black text-2xl leading-none" style={{ color: stat.color }}>{stat.value}</p>
                  <p className="text-[10px] mt-1.5 font-semibold tracking-widest uppercase" style={{ color: 'rgba(255,255,255,0.28)' }}>{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Codice Fidelio */}
        <div className="px-5 mb-5">
          <div
            className="rounded-2xl px-4 py-3.5 flex items-center justify-between"
            style={{ background: 'rgba(124,58,237,0.08)', border: '1px solid rgba(124,58,237,0.2)' }}
          >
            <div>
              <p className="text-[10px] tracking-widest uppercase font-semibold mb-0.5" style={{ color: 'rgba(167,139,250,0.6)' }}>Il tuo codice Fidelio</p>
              <p className="font-mono font-bold text-xl tracking-[0.2em] text-white">{customer?.code}</p>
            </div>
            <div className="text-2xl opacity-70">🪪</div>
          </div>
        </div>

        {/* Menu sezioni */}
        {menuSections.map(section => (
          <div key={section.title} className="px-5 mb-5">
            <p className="text-[10px] font-bold tracking-[0.2em] uppercase mb-3" style={{ color: 'rgba(255,255,255,0.25)' }}>{section.title}</p>
            <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid rgba(255,255,255,0.07)' }}>
              {section.items.map((item, i) => (
                <Link key={item.href} href={item.href}>
                  <div
                    className="flex items-center gap-3.5 px-4 py-3.5 active:bg-white/5 transition-colors"
                    style={{
                      background: 'rgba(255,255,255,0.025)',
                      borderBottom: i < section.items.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none',
                    }}
                  >
                    <div
                      className="w-9 h-9 rounded-xl flex items-center justify-center text-base flex-shrink-0"
                      style={{ background: item.color + '14', border: `1px solid ${item.color}22` }}
                    >
                      {item.icon}
                    </div>
                    <span className="font-semibold text-sm flex-1 text-white">{item.label}</span>
                    <ChevronRight />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        ))}

        {/* Impostazioni */}
        <div className="px-5 mb-6">
          <p className="text-[10px] font-bold tracking-[0.2em] uppercase mb-3" style={{ color: 'rgba(255,255,255,0.25)' }}>Impostazioni</p>
          <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid rgba(255,255,255,0.07)', background: 'rgba(255,255,255,0.025)' }}>
            <div className="flex items-center gap-3.5 px-4 py-3.5">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center text-base flex-shrink-0" style={{ background: 'rgba(124,58,237,0.12)', border: '1px solid rgba(124,58,237,0.18)' }}>
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
                <span className="text-xs font-semibold px-3 py-1.5 rounded-xl flex-shrink-0" style={{ background: 'rgba(239,68,68,0.1)', color: '#EF4444' }}>Bloccate</span>
              ) : subscribed ? (
                <button onClick={unsubscribe} disabled={loading} className="text-xs font-semibold px-3 py-1.5 rounded-xl flex-shrink-0" style={{ background: 'rgba(239,68,68,0.1)', color: '#EF4444', opacity: loading ? 0.5 : 1 }}>
                  {loading ? '…' : 'Disattiva'}
                </button>
              ) : (
                <button onClick={subscribe} disabled={loading} className="text-xs font-semibold px-3 py-1.5 rounded-xl flex-shrink-0" style={{ background: 'rgba(124,58,237,0.18)', color: '#A78BFA', opacity: loading ? 0.5 : 1 }}>
                  {loading ? '…' : 'Attiva'}
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
          <p className="text-center text-xs mt-5" style={{ color: 'rgba(255,255,255,0.1)', letterSpacing: '0.05em' }}>Fidelio · Made with ♥ in Italy</p>
        </div>
      </div>
    </ProtectedLayout>
  )
}
