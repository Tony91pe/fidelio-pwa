'use client'

import { useQuery } from '@tanstack/react-query'
import { useAuthStore } from '@/store/authStore'
import { getShops, getMyCode } from '@/lib/api'
import { ProtectedLayout } from '@/components/ProtectedLayout'
import { getCategoryConfig } from '@/lib/categories'
import { CustomerShop } from '@/types'
import Link from 'next/link'

function getTier(visits: number) {
  if (visits >= 50) return { label: 'Platino', color: '#E2E8F0', bg: 'rgba(226,232,240,0.12)', emoji: '💎' }
  if (visits >= 25) return { label: 'Oro', color: '#FBBF24', bg: 'rgba(251,191,36,0.12)', emoji: '🏆' }
  if (visits >= 10) return { label: 'Argento', color: '#94A3B8', bg: 'rgba(148,163,184,0.12)', emoji: '⭐' }
  if (visits >= 3)  return { label: 'Bronzo', color: '#CD7C2F', bg: 'rgba(205,124,47,0.12)', emoji: '🎖️' }
  return { label: 'Nuovo', color: '#A78BFA', bg: 'rgba(167,139,250,0.12)', emoji: '✨' }
}

const CARD_GRADIENTS = [
  'linear-gradient(135deg, #1e1b4b 0%, #312e81 100%)',
  'linear-gradient(135deg, #0c1445 0%, #1e3a5f 100%)',
  'linear-gradient(135deg, #1a0533 0%, #3b0764 100%)',
  'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
  'linear-gradient(135deg, #0d1f2d 0%, #1a3a4a 100%)',
]

function ShopCard({ shop, index }: { shop: CustomerShop; index: number }) {
  const cfg = getCategoryConfig(shop.category)
  const pct = Math.min((shop.points / shop.nextRewardPoints) * 100, 100)
  const remaining = Math.max(shop.nextRewardPoints - shop.points, 0)
  const isComplete = remaining === 0
  const tier = getTier(shop.totalVisits)
  const gradient = CARD_GRADIENTS[index % CARD_GRADIENTS.length]

  return (
    <div
      className="relative rounded-3xl overflow-hidden"
      style={{
        background: gradient,
        boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
        animation: `slideUp 0.5s cubic-bezier(0.16,1,0.3,1) ${index * 0.08}s both`,
        minHeight: 160,
      }}
    >
      {/* Glow decorativo */}
      <div className="absolute top-0 right-0 w-48 h-48 pointer-events-none" style={{ background: cfg.color + '18', filter: 'blur(50px)', transform: 'translate(20%,-20%)' }} />
      <div className="absolute bottom-0 left-0 w-32 h-32 pointer-events-none" style={{ background: 'rgba(124,58,237,0.1)', filter: 'blur(40px)', transform: 'translate(-20%,20%)' }} />

      <div className="relative p-5">
        {/* Top row */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <div
              className="w-10 h-10 rounded-2xl flex items-center justify-center text-lg flex-shrink-0"
              style={{ background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)' }}
            >
              {cfg.emoji}
            </div>
            <div>
              <p className="font-bold text-base leading-tight text-white">{shop.shopName}</p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background: tier.bg, color: tier.color }}>
                  {tier.emoji} {tier.label}
                </span>
                <span className="text-[10px]" style={{ color: 'rgba(255,255,255,0.3)' }}>{shop.totalVisits} visite</span>
              </div>
            </div>
          </div>

          {/* Punti */}
          <div className="text-right">
            <p className="font-black text-3xl leading-none" style={{ color: isComplete ? '#FBBF24' : 'white' }}>{shop.points}</p>
            <p className="text-[10px] font-medium mt-0.5" style={{ color: 'rgba(255,255,255,0.35)' }}>punti</p>
          </div>
        </div>

        {/* Progress bar */}
        <div>
          <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.08)' }}>
            <div
              className="h-full rounded-full transition-all duration-1000"
              style={{
                width: `${pct}%`,
                background: isComplete
                  ? 'linear-gradient(90deg, #FBBF24, #F59E0B)'
                  : `linear-gradient(90deg, ${cfg.color}, ${cfg.color}99)`,
                boxShadow: isComplete ? '0 0 8px rgba(251,191,36,0.5)' : undefined,
              }}
            />
          </div>
          <div className="flex justify-between items-center mt-2">
            <p className="text-[11px] font-medium" style={{ color: isComplete ? '#FBBF24' : 'rgba(255,255,255,0.4)' }}>
              {isComplete ? '🎉 Premio disponibile! Vai al negozio' : `Ancora ${remaining} punti al prossimo premio`}
            </p>
            <p className="text-[10px] font-bold" style={{ color: isComplete ? '#FBBF24' : 'rgba(255,255,255,0.2)' }}>{Math.round(pct)}%</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function HomePage() {
  const { customer } = useAuthStore()

  const { data: shopsData, isLoading } = useQuery({
    queryKey: ['customer-shops', customer?.email],
    queryFn: () => getShops(),
    enabled: !!customer?.email,
    select: (res) => res.data as CustomerShop[],
    refetchInterval: 30_000,
  })

  const { data: myCodeData } = useQuery({
    queryKey: ['my-code', customer?.email],
    queryFn: () => getMyCode(customer!.email),
    enabled: !!customer?.email,
    select: (res) => res.data.code as string,
  })

  const totalPoints = shopsData?.reduce((s, sh) => s + sh.points, 0) ?? 0
  const totalVisits = shopsData?.reduce((s, sh) => s + sh.totalVisits, 0) ?? 0
  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Buongiorno' : hour < 18 ? 'Buon pomeriggio' : 'Buonasera'
  const code = myCodeData || customer?.code || '—'
  const firstName = customer?.name?.split(' ')[0] || 'Cliente'

  return (
    <ProtectedLayout>
      <div className="pb-8">

        {/* Header */}
        <div
          className="relative overflow-hidden px-5 pt-12 pb-8"
          style={{
            background: 'linear-gradient(180deg, rgba(109,40,217,0.25) 0%, transparent 100%)',
            animation: 'slideUp 0.4s cubic-bezier(0.16,1,0.3,1) both',
          }}
        >
          <div className="absolute top-0 left-0 right-0 h-40 pointer-events-none" style={{ background: 'radial-gradient(ellipse 80% 60% at 50% 0%, rgba(124,58,237,0.2) 0%, transparent 100%)' }} />

          <div className="flex items-center justify-between mb-8">
            <div>
              <p className="text-xs font-medium mb-0.5" style={{ color: 'rgba(255,255,255,0.4)', letterSpacing: '0.04em' }}>{greeting} 👋</p>
              <h1 className="font-display font-bold text-2xl">{firstName}</h1>
            </div>
            <Link href="/profilo">
              <div
                className="w-11 h-11 rounded-2xl flex items-center justify-center font-bold text-base"
                style={{ background: 'linear-gradient(135deg, #7C3AED, #3B82F6)', boxShadow: '0 4px 16px rgba(124,58,237,0.45)' }}
              >
                {firstName[0]?.toUpperCase()}
              </div>
            </Link>
          </div>

          {/* Punti totali hero */}
          <div className="text-center mb-6">
            <p className="text-xs font-semibold mb-2 tracking-widest uppercase" style={{ color: 'rgba(255,255,255,0.35)' }}>Punti totali</p>
            <p className="font-display font-black leading-none" style={{ fontSize: 72, color: 'white', textShadow: '0 0 40px rgba(167,139,250,0.4)' }}>{totalPoints}</p>
            <div className="flex items-center justify-center gap-4 mt-3">
              <div className="text-center">
                <p className="font-bold text-lg" style={{ color: '#60A5FA' }}>{shopsData?.length ?? 0}</p>
                <p className="text-[10px] tracking-wider uppercase" style={{ color: 'rgba(255,255,255,0.3)' }}>Negozi</p>
              </div>
              <div className="w-px h-6" style={{ background: 'rgba(255,255,255,0.1)' }} />
              <div className="text-center">
                <p className="font-bold text-lg" style={{ color: '#F0ABFC' }}>{totalVisits}</p>
                <p className="text-[10px] tracking-wider uppercase" style={{ color: 'rgba(255,255,255,0.3)' }}>Visite</p>
              </div>
            </div>
          </div>

          {/* Codice + QR button */}
          <div className="flex items-center gap-3">
            <div className="flex-1 px-4 py-3 rounded-2xl" style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)' }}>
              <p className="text-[10px] tracking-widest uppercase mb-0.5" style={{ color: 'rgba(255,255,255,0.3)' }}>Il tuo codice</p>
              <p className="font-mono font-bold text-base tracking-wider text-white">{code}</p>
            </div>
            <Link href="/scan">
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 active:scale-95 transition-transform"
                style={{ background: 'linear-gradient(135deg, #7C3AED, #6D28D9)', boxShadow: '0 4px 16px rgba(124,58,237,0.45)' }}
              >
                <span style={{ fontSize: 24 }}>⬛</span>
              </div>
            </Link>
          </div>
        </div>

        {/* Quick actions */}
        <div className="px-5 mb-6" style={{ animation: 'slideUp 0.4s cubic-bezier(0.16,1,0.3,1) 0.05s both' }}>
          <div className="grid grid-cols-3 gap-3">
            {[
              { href: '/scan', icon: '📲', label: 'Il mio QR', color: '#7C3AED' },
              { href: '/premi', icon: '🎁', label: 'Premi', color: '#0EA5E9' },
              { href: '/offerte', icon: '🔥', label: 'Offerte', color: '#F59E0B' },
            ].map(({ href, icon, label, color }) => (
              <Link key={href} href={href}>
                <div
                  className="py-4 rounded-2xl text-center active:scale-95 transition-transform"
                  style={{ background: color + '15', border: `1px solid ${color}25` }}
                >
                  <div className="text-2xl mb-1.5">{icon}</div>
                  <p className="text-[11px] font-bold tracking-wide" style={{ color: 'rgba(255,255,255,0.65)' }}>{label}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* I miei negozi */}
        <div className="px-5">
          <div className="flex items-center justify-between mb-4" style={{ animation: 'slideUp 0.4s cubic-bezier(0.16,1,0.3,1) 0.1s both' }}>
            <h2 className="font-bold text-base">Le mie carte fedeltà</h2>
            <Link href="/scopri" className="text-xs font-semibold" style={{ color: '#A78BFA' }}>Scopri altri →</Link>
          </div>

          {isLoading ? (
            <div className="flex flex-col gap-3">
              {[1, 2].map((i) => (
                <div key={i} className="rounded-3xl h-40 animate-pulse" style={{ background: 'rgba(255,255,255,0.04)' }} />
              ))}
            </div>
          ) : !shopsData?.length ? (
            <div
              className="rounded-3xl p-8 text-center"
              style={{ background: 'rgba(255,255,255,0.02)', border: '1px dashed rgba(255,255,255,0.08)' }}
            >
              <div className="text-5xl mb-4">🏪</div>
              <p className="font-bold text-base mb-2">Nessuna carta ancora</p>
              <p className="text-sm mb-5" style={{ color: 'rgba(255,255,255,0.35)' }}>Scansiona il QR di un negozio per iniziare ad accumulare punti</p>
              <Link href="/scopri">
                <div className="inline-block px-6 py-3 rounded-xl text-sm font-bold" style={{ background: 'linear-gradient(135deg, #7C3AED, #3B82F6)' }}>
                  Scopri negozi →
                </div>
              </Link>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {shopsData.map((shop, i) => (
                <ShopCard key={shop.shopId} shop={shop} index={i} />
              ))}
            </div>
          )}
        </div>
      </div>
    </ProtectedLayout>
  )
}
