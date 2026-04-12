'use client'

import { useQuery } from '@tanstack/react-query'
import { useAuthStore } from '@/store/authStore'
import { getShops, getMyCode } from '@/lib/api'
import { ProtectedLayout } from '@/components/ProtectedLayout'
import { getCategoryConfig } from '@/lib/categories'
import { CustomerShop } from '@/types'
import Link from 'next/link'

function PointsRing({ points, threshold }: { points: number; threshold: number }) {
  const pct = Math.min((points / threshold) * 100, 100)
  const r = 54
  const circ = 2 * Math.PI * r
  const dash = (pct / 100) * circ

  return (
    <svg width="140" height="140" viewBox="0 0 140 140">
      <defs>
        <linearGradient id="ringGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#7C3AED" />
          <stop offset="100%" stopColor="#3B82F6" />
        </linearGradient>
      </defs>
      <circle cx="70" cy="70" r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="10" />
      <circle
        cx="70" cy="70" r={r}
        fill="none"
        stroke="url(#ringGrad)"
        strokeWidth="10"
        strokeLinecap="round"
        strokeDasharray={`${dash} ${circ}`}
        strokeDashoffset={circ * 0.25}
        style={{ transition: 'stroke-dasharray 1s cubic-bezier(0.16,1,0.3,1)' }}
      />
    </svg>
  )
}

function ShopCard({ shop }: { shop: CustomerShop }) {
  const cfg = getCategoryConfig(shop.category)
  const pct = Math.min((shop.points / shop.nextRewardPoints) * 100, 100)
  const remaining = Math.max(shop.nextRewardPoints - shop.points, 0)

  return (
    <div className="glass rounded-2xl p-4 flex flex-col gap-3">
      <div className="flex items-center gap-3">
        <div
          className="w-11 h-11 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
          style={{ background: cfg.color + '22' }}
        >
          {cfg.emoji}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-sm truncate">{shop.shopName}</p>
          <p className="text-xs text-white/40">{shop.totalVisits} visite · {cfg.label}</p>
        </div>
        <div className="text-right">
          <p className="font-display font-bold text-xl" style={{ color: cfg.color }}>{shop.points}</p>
          <p className="text-[10px] text-white/40">{cfg.plural}</p>
        </div>
      </div>
      <div>
        <div className="h-1.5 rounded-full bg-white/6 overflow-hidden">
          <div className="progress-bar h-full" style={{ width: `${pct}%`, background: `linear-gradient(90deg, ${cfg.color}, ${cfg.color}99)` }} />
        </div>
        <p className="text-[10px] text-white/40 mt-1">
          {remaining > 0 ? `Ancora ${remaining} ${cfg.plural} al premio` : '🎉 Premio disponibile!'}
        </p>
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
  })

  const { data: myCodeData } = useQuery({
    queryKey: ['my-code', customer?.email],
    queryFn: () => getMyCode(customer!.email),
    enabled: !!customer?.email,
    select: (res) => res.data.code as string,
  })

  const totalPoints = shopsData?.reduce((s, sh) => s + sh.points, 0) ?? 0
  const topShop = shopsData?.[0]
  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Buongiorno' : hour < 18 ? 'Buon pomeriggio' : 'Buonasera'

  return (
    <ProtectedLayout>
      <div className="page-enter px-4 pt-14 pb-4">
        {/* Header */}
        <div className="flex items-start justify-between mb-8">
          <div>
            <p className="text-white/40 text-sm">{greeting} 👋</p>
            <h1 className="font-display font-bold text-2xl mt-0.5">{customer?.name || 'Cliente'}</h1>
          </div>
          <Link href="/profilo" className="w-10 h-10 rounded-xl bg-brand/20 flex items-center justify-center">
            <span className="font-bold text-brand text-sm">{customer?.name?.[0]?.toUpperCase() || 'C'}</span>
          </Link>
        </div>

        {/* Hero card */}
        <div className="relative rounded-3xl overflow-hidden mb-6 noise" style={{ background: 'linear-gradient(135deg, #4C1D95 0%, #1D4ED8 100%)' }}>
          <div className="absolute -top-16 -right-16 w-48 h-48 rounded-full bg-white/5" />
          <div className="absolute -bottom-8 -left-8 w-32 h-32 rounded-full bg-white/5" />
          <div className="relative p-6 flex items-center gap-6">
            <div className="relative flex-shrink-0">
              <PointsRing points={topShop?.points ?? 0} threshold={topShop?.nextRewardPoints ?? 100} />
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="font-display font-black text-3xl">{totalPoints}</span>
                <span className="text-xs text-white/60">punti totali</span>
              </div>
            </div>
            <div className="flex-1">
              <p className="text-white/60 text-xs mb-1">Il tuo codice</p>
              <p className="font-mono font-bold text-lg tracking-widest text-white/90">{myCodeData || customer?.code || '—'}</p>
              <div className="mt-3 flex gap-2">
                <Link href="/scan" className="flex-1 py-2 rounded-xl text-center text-xs font-semibold" style={{ background: 'rgba(255,255,255,0.15)' }}>
                  📷 Scannerizza
                </Link>
                <Link href="/premi" className="flex-1 py-2 rounded-xl text-center text-xs font-semibold" style={{ background: 'rgba(255,255,255,0.15)' }}>
                  🎁 Premi
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Shops */}
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold text-base">I miei negozi</h2>
          <Link href="/scopri" className="text-brand text-xs font-medium">Scopri altri →</Link>
        </div>

        {isLoading ? (
          <div className="flex flex-col gap-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="glass rounded-2xl h-24 animate-pulse" />
            ))}
          </div>
        ) : !shopsData?.length ? (
          <div className="glass rounded-2xl p-8 text-center">
            <p className="text-4xl mb-3">🏪</p>
            <p className="font-semibold text-sm mb-1">Nessun negozio ancora</p>
            <p className="text-white/40 text-xs mb-4">Visita un negozio Fidelio e scansiona il QR</p>
            <Link href="/scopri" className="btn-primary" style={{ display: 'inline-block', width: 'auto', padding: '10px 24px', fontSize: '13px' }}>
              Scopri negozi
            </Link>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {shopsData.map((shop) => (
              <ShopCard key={shop.shopId} shop={shop} />
            ))}
          </div>
        )}
      </div>
    </ProtectedLayout>
  )
}
