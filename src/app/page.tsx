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
  const r = 42
  const circ = 2 * Math.PI * r
  const dash = (pct / 100) * circ

  return (
    <svg width="100" height="100" viewBox="0 0 100 100">
      <defs>
        <linearGradient id="ringGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#7C3AED" />
          <stop offset="100%" stopColor="#3B82F6" />
        </linearGradient>
      </defs>
      <circle cx="50" cy="50" r={r} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="8" />
      <circle
        cx="50" cy="50" r={r}
        fill="none"
        stroke="url(#ringGrad)"
        strokeWidth="8"
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
        <div className="text-right flex-shrink-0">
          <p className="font-display font-bold text-xl" style={{ color: cfg.color }}>{shop.points}</p>
          <p className="text-[10px] text-white/40">{cfg.plural}</p>
        </div>
      </div>
      <div>
        <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
          <div className="h-full rounded-full" style={{ width: `${pct}%`, background: `linear-gradient(90deg, ${cfg.color}, ${cfg.color}99)`, transition: 'width 0.8s ease' }} />
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
  const code = myCodeData || customer?.code || '—'

  return (
    <ProtectedLayout>
      <div className="page-enter px-4 pt-14 pb-4">
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <p className="text-white/40 text-sm">{greeting} 👋</p>
            <h1 className="font-display font-bold text-2xl mt-0.5">{customer?.name || 'Cliente'}</h1>
          </div>
          <Link href="/profilo" className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(124,58,237,0.2)' }}>
            <span className="font-bold text-sm" style={{ color: '#7C3AED' }}>{customer?.name?.[0]?.toUpperCase() || 'C'}</span>
          </Link>
        </div>

        {/* Hero card */}
        <div className="relative rounded-3xl overflow-hidden mb-6" style={{ background: 'linear-gradient(135deg, #4C1D95 0%, #1D4ED8 100%)' }}>
          <div className="absolute -top-12 -right-12 w-40 h-40 rounded-full" style={{ background: 'rgba(255,255,255,0.05)' }} />
          <div className="absolute -bottom-8 -left-8 w-28 h-28 rounded-full" style={{ background: 'rgba(255,255,255,0.05)' }} />
          
          {/* Top row: ring + punti */}
          <div className="relative p-5 flex items-center gap-4">
            <div className="relative flex-shrink-0">
              <PointsRing points={topShop?.points ?? 0} threshold={topShop?.nextRewardPoints ?? 100} />
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="font-display font-black text-2xl leading-none">{totalPoints}</span>
                <span className="text-[10px] text-white/60 mt-0.5">punti</span>
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white/50 text-xs mb-1">Il tuo codice</p>
              <p className="font-mono font-bold text-sm tracking-wider text-white/90 truncate">{code}</p>
            </div>
          </div>

          {/* Bottom row: buttons */}
          <div className="relative px-5 pb-5 flex gap-2">
            <Link href="/scan" className="flex-1 py-2.5 rounded-xl text-center text-xs font-semibold" style={{ background: 'rgba(255,255,255,0.15)' }}>
              📷 Mostra QR
            </Link>
            <Link href="/premi" className="flex-1 py-2.5 rounded-xl text-center text-xs font-semibold" style={{ background: 'rgba(255,255,255,0.15)' }}>
              🎁 Premi
            </Link>
            <Link href="/offerte" className="flex-1 py-2.5 rounded-xl text-center text-xs font-semibold" style={{ background: 'rgba(255,255,255,0.15)' }}>
              🔥 Offerte
            </Link>
          </div>
        </div>

        {/* Shops */}
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold text-base">I miei negozi</h2>
          <Link href="/scopri" className="text-xs font-medium" style={{ color: '#7C3AED' }}>Scopri altri →</Link>
        </div>

        {isLoading ? (
          <div className="flex flex-col gap-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="rounded-2xl h-24 animate-pulse" style={{ background: 'rgba(255,255,255,0.04)' }} />
            ))}
          </div>
        ) : !shopsData?.length ? (
          <div className="rounded-2xl p-8 text-center" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
            <p className="text-4xl mb-3">🏪</p>
            <p className="font-semibold text-sm mb-1">Nessun negozio ancora</p>
            <p className="text-xs mb-4" style={{ color: 'rgba(255,255,255,0.4)' }}>Visita un negozio Fidelio e scansiona il QR</p>
            <Link href="/scopri" style={{ display: 'inline-block', background: '#7C3AED', color: 'white', padding: '10px 24px', borderRadius: '12px', fontSize: '13px', fontWeight: '600', textDecoration: 'none' }}>
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