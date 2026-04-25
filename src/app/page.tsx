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
  if (visits >= 25) return { label: 'Oro',     color: '#FBBF24', bg: 'rgba(251,191,36,0.12)',  emoji: '🏆' }
  if (visits >= 10) return { label: 'Argento', color: '#94A3B8', bg: 'rgba(148,163,184,0.12)', emoji: '⭐' }
  if (visits >= 3)  return { label: 'Bronzo',  color: '#CD7C2F', bg: 'rgba(205,124,47,0.12)',  emoji: '🎖️' }
  return { label: 'Nuovo', color: '#A78BFA', bg: 'rgba(167,139,250,0.12)', emoji: '✨' }
}

const CARD_ACCENTS = [
  { from: '#1e1b4b', to: '#312e81', accent: '#818CF8' },
  { from: '#0c1445', to: '#1e3a5f', accent: '#60A5FA' },
  { from: '#1a0533', to: '#3b0764', accent: '#C084FC' },
  { from: '#0f172a', to: '#1e293b', accent: '#7C3AED' },
  { from: '#0d1f2d', to: '#1a3a4a', accent: '#22D3EE' },
]

function ShopCard({ shop, index }: { shop: CustomerShop; index: number }) {
  const cfg = getCategoryConfig(shop.category)
  const pct = Math.min((shop.points / shop.nextRewardPoints) * 100, 100)
  const remaining = Math.max(shop.nextRewardPoints - shop.points, 0)
  const isComplete = remaining === 0
  const tier = getTier(shop.totalVisits)
  const acc = CARD_ACCENTS[index % CARD_ACCENTS.length]

  return (
    <div
      className="relative rounded-3xl overflow-hidden"
      style={{
        background: `linear-gradient(140deg, ${acc.from} 0%, ${acc.to} 100%)`,
        boxShadow: `0 12px 40px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.05)`,
        animation: `slideUp 0.5s cubic-bezier(0.16,1,0.3,1) ${index * 0.08}s both`,
        minHeight: 168,
      }}
    >
      {/* Glow blob top-right */}
      <div className="absolute top-0 right-0 w-52 h-52 pointer-events-none" style={{ background: acc.accent + '20', filter: 'blur(56px)', transform: 'translate(25%,-25%)' }} />
      {/* Glow blob bottom-left */}
      <div className="absolute bottom-0 left-0 w-36 h-36 pointer-events-none" style={{ background: cfg.color + '18', filter: 'blur(44px)', transform: 'translate(-25%,25%)' }} />
      {/* Category watermark */}
      <div className="absolute right-4 bottom-4 text-[72px] opacity-[0.06] pointer-events-none select-none" style={{ filter: 'grayscale(1)' }}>
        {cfg.emoji}
      </div>

      <div className="relative p-5 h-full flex flex-col gap-3">
        {/* Top: shop info + points */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div
              className="w-11 h-11 rounded-2xl flex items-center justify-center text-xl flex-shrink-0"
              style={{ background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)', boxShadow: '0 2px 8px rgba(0,0,0,0.3)' }}
            >
              {cfg.emoji}
            </div>
            <div>
              <p className="font-bold text-[15px] leading-tight text-white">{shop.shopName}</p>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background: tier.bg, color: tier.color }}>
                  {tier.emoji} {tier.label}
                </span>
                <span className="text-[10px]" style={{ color: 'rgba(255,255,255,0.28)' }}>{shop.totalVisits} visite</span>
              </div>
            </div>
          </div>

          {/* Points badge */}
          <div className="text-right flex-shrink-0">
            <p
              className="font-black text-4xl leading-none tracking-tight"
              style={{ color: isComplete ? '#FBBF24' : 'white', textShadow: isComplete ? '0 0 20px rgba(251,191,36,0.4)' : 'none' }}
            >
              {shop.points}
            </p>
            <p className="text-[10px] font-semibold mt-0.5 tracking-wide uppercase" style={{ color: 'rgba(255,255,255,0.28)' }}>punti</p>
          </div>
        </div>

        {/* Progress bar */}
        <div className="mt-auto">
          {/* Labels */}
          <div className="flex justify-between items-center mb-1.5">
            <p className="text-[11px] font-medium" style={{ color: isComplete ? '#FBBF24' : 'rgba(255,255,255,0.38)' }}>
              {isComplete ? '🎉 Premio disponibile!' : `Ancora ${remaining} punti al premio`}
            </p>
            <p className="text-[10px] font-bold tabular-nums" style={{ color: isComplete ? '#FBBF24' : acc.accent + 'AA' }}>{Math.round(pct)}%</p>
          </div>
          {/* Bar track */}
          <div className="relative h-2 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.07)' }}>
            <div
              className="h-full rounded-full transition-all duration-1000"
              style={{
                width: `${pct}%`,
                background: isComplete
                  ? 'linear-gradient(90deg, #FBBF24, #F97316)'
                  : `linear-gradient(90deg, ${acc.accent}, ${acc.accent}88)`,
                boxShadow: isComplete ? `0 0 10px rgba(251,191,36,0.6)` : `0 0 8px ${acc.accent}55`,
              }}
            />
          </div>
          {/* Milestone dots */}
          <div className="flex justify-between mt-1.5 px-0">
            {[25, 50, 75].map(p => (
              <div key={p} className="w-px h-1 rounded-full" style={{ background: pct >= p ? acc.accent + '66' : 'rgba(255,255,255,0.1)' }} />
            ))}
          </div>
          {/* Claim button — visible only when reward is ready */}
          {isComplete && (
            <Link href="/premi" className="block mt-3">
              <div
                className="w-full py-2 rounded-xl text-center text-[12px] font-bold active:scale-95 transition-transform"
                style={{ background: 'linear-gradient(90deg, #F59E0B, #F97316)', color: 'white', boxShadow: '0 4px 12px rgba(245,158,11,0.4)' }}
              >
                Vai ai premi →
              </div>
            </Link>
          )}
        </div>
      </div>
    </div>
  )
}

const QrSvg = () => (
  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="7" height="7" rx="1.5"/>
    <rect x="14" y="3" width="7" height="7" rx="1.5"/>
    <rect x="3" y="14" width="7" height="7" rx="1.5"/>
    <rect x="14" y="14" width="3" height="3" rx="0.5"/>
    <path d="M18 14v1M21 14v3h-3M21 21h-3v-3"/>
  </svg>
)

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
          className="relative overflow-hidden px-5 pt-12 pb-7"
          style={{
            background: 'linear-gradient(180deg, rgba(109,40,217,0.22) 0%, transparent 100%)',
            animation: 'slideUp 0.4s cubic-bezier(0.16,1,0.3,1) both',
          }}
        >
          <div className="absolute top-0 left-0 right-0 h-44 pointer-events-none" style={{ background: 'radial-gradient(ellipse 90% 70% at 50% 0%, rgba(124,58,237,0.22) 0%, transparent 100%)' }} />

          {/* Greeting row */}
          <div className="flex items-center justify-between mb-7">
            <div>
              <p className="text-xs font-medium mb-0.5" style={{ color: 'rgba(255,255,255,0.38)', letterSpacing: '0.05em' }}>{greeting} 👋</p>
              <h1 className="font-display font-bold text-2xl leading-none">{firstName}</h1>
            </div>
            <Link href="/profilo">
              <div
                className="w-11 h-11 rounded-2xl flex items-center justify-center font-bold text-base active:scale-90 transition-transform"
                style={{
                  background: 'linear-gradient(135deg, #7C3AED, #3B82F6)',
                  boxShadow: '0 4px 16px rgba(124,58,237,0.45), 0 0 0 1px rgba(167,139,250,0.2)',
                }}
              >
                {firstName[0]?.toUpperCase()}
              </div>
            </Link>
          </div>

          {/* Points hero */}
          <div className="text-center mb-6">
            <p className="text-[10px] font-bold mb-2 tracking-[0.2em] uppercase" style={{ color: 'rgba(255,255,255,0.28)' }}>Punti totali</p>
            <div className="relative inline-block">
              <p
                className="font-display font-black leading-none"
                style={{ fontSize: 76, color: 'white', textShadow: '0 0 50px rgba(167,139,250,0.35)' }}
              >
                {totalPoints}
              </p>
              {/* Glow beneath number */}
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-32 h-4 pointer-events-none" style={{ background: 'rgba(124,58,237,0.35)', filter: 'blur(16px)' }} />
            </div>
            <div className="flex items-center justify-center gap-5 mt-4">
              <div className="text-center">
                <p className="font-bold text-xl leading-none" style={{ color: '#60A5FA' }}>{shopsData?.length ?? 0}</p>
                <p className="text-[10px] tracking-widest uppercase mt-1" style={{ color: 'rgba(255,255,255,0.28)' }}>Negozi</p>
              </div>
              <div className="w-px h-7" style={{ background: 'rgba(255,255,255,0.08)' }} />
              <div className="text-center">
                <p className="font-bold text-xl leading-none" style={{ color: '#F0ABFC' }}>{totalVisits}</p>
                <p className="text-[10px] tracking-widest uppercase mt-1" style={{ color: 'rgba(255,255,255,0.28)' }}>Visite</p>
              </div>
            </div>
          </div>

          {/* Codice + scan button */}
          <div className="flex items-center gap-3">
            <div
              className="flex-1 px-4 py-3 rounded-2xl"
              style={{
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.08)',
                backdropFilter: 'blur(10px)',
              }}
            >
              <p className="text-[10px] tracking-widest uppercase mb-0.5" style={{ color: 'rgba(255,255,255,0.28)' }}>Il tuo codice</p>
              <p className="font-mono font-bold text-base tracking-wider text-white">{code}</p>
            </div>
            <Link href="/scan">
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 active:scale-90 transition-transform"
                style={{
                  background: 'linear-gradient(135deg, #7C3AED, #5B21B6)',
                  boxShadow: '0 4px 20px rgba(124,58,237,0.55), 0 0 0 1px rgba(167,139,250,0.15)',
                }}
              >
                <QrSvg />
              </div>
            </Link>
          </div>
        </div>

        {/* Quick actions */}
        <div className="px-5 mb-6" style={{ animation: 'slideUp 0.4s cubic-bezier(0.16,1,0.3,1) 0.05s both' }}>
          <div className="grid grid-cols-4 gap-2.5">
            {[
              {
                href: '/scan', label: 'Il mio QR', color: '#7C3AED',
                icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="3" height="3" rx="0.5"/><path d="M18 14v1M21 14v3h-3M21 21h-3v-3"/></svg>,
              },
              {
                href: '/premi', label: 'Premi', color: '#0EA5E9',
                icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 12 20 22 4 22 4 12"/><rect x="2" y="7" width="20" height="5" rx="1"/><line x1="12" y1="22" x2="12" y2="7"/><path d="M12 7H7.5a2.5 2.5 0 010-5C11 2 12 7 12 7z"/><path d="M12 7h4.5a2.5 2.5 0 000-5C13 2 12 7 12 7z"/></svg>,
              },
              {
                href: '/offerte', label: 'Offerte', color: '#F59E0B',
                icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>,
              },
              {
                href: '/storico', label: 'Storico', color: '#10B981',
                icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>,
              },
            ].map(({ href, icon, label, color }) => (
              <Link key={href} href={href}>
                <div
                  className="py-3.5 rounded-2xl text-center active:scale-95 transition-transform flex flex-col items-center gap-2"
                  style={{
                    background: color + '12',
                    border: `1px solid ${color}22`,
                  }}
                >
                  <div style={{ color }}>{icon}</div>
                  <p className="text-[10px] font-bold tracking-wide" style={{ color: 'rgba(255,255,255,0.6)' }}>{label}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Le mie carte fedeltà */}
        <div className="px-5">
          <div className="flex items-center justify-between mb-4" style={{ animation: 'slideUp 0.4s cubic-bezier(0.16,1,0.3,1) 0.1s both' }}>
            <div>
              <h2 className="font-bold text-base">Le mie carte fedeltà</h2>
              {shopsData && shopsData.length > 0 && (
                <p className="text-[11px] mt-0.5" style={{ color: 'rgba(255,255,255,0.3)' }}>{shopsData.length} {shopsData.length === 1 ? 'negozio attivo' : 'negozi attivi'}</p>
              )}
            </div>
            <Link href="/scopri" className="text-xs font-semibold" style={{ color: '#A78BFA' }}>Scopri altri →</Link>
          </div>

          {isLoading ? (
            <div className="flex flex-col gap-3">
              {[1, 2].map((i) => (
                <div key={i} className="rounded-3xl overflow-hidden" style={{ background: 'rgba(255,255,255,0.03)', height: 168 }}>
                  <div className="h-full animate-pulse" style={{ background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.03) 50%, transparent 100%)', backgroundSize: '200% 100%' }} />
                </div>
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
