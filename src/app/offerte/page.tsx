'use client'

import { ProtectedLayout } from '@/components/ProtectedLayout'
import { useQuery } from '@tanstack/react-query'
import { useAuthStore } from '@/store/authStore'
import { getShops } from '@/lib/api'
import { getCategoryConfig } from '@/lib/categories'
import { CustomerShop } from '@/types'

function OfferCard({ shop, index }: { shop: CustomerShop; index: number }) {
  const cfg = getCategoryConfig(shop.category)
  const pct = Math.min((shop.points / shop.nextRewardPoints) * 100, 100)
  const remaining = Math.max(shop.nextRewardPoints - shop.points, 0)
  const isClose = pct >= 80
  const isReady = remaining === 0

  return (
    <div
      className="relative rounded-2xl overflow-hidden"
      style={{
        background: 'rgba(255,255,255,0.035)',
        border: `1px solid ${isReady ? 'rgba(167,139,250,0.35)' : isClose ? 'rgba(245,158,11,0.25)' : 'rgba(255,255,255,0.07)'}`,
        animation: `slideUp 0.4s cubic-bezier(0.16,1,0.3,1) ${index * 0.07}s both`,
      }}
    >
      {/* Progress bar top */}
      <div className="h-0.5 w-full" style={{ background: 'rgba(255,255,255,0.04)' }}>
        <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: isReady ? 'linear-gradient(90deg, #7C3AED, #A78BFA)' : isClose ? '#F59E0B' : cfg.color }} />
      </div>

      <div className="p-4">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-11 h-11 rounded-xl flex items-center justify-center text-xl flex-shrink-0" style={{ background: cfg.color + '1A', border: `1px solid ${cfg.color}33` }}>
            {cfg.emoji}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-sm truncate">{shop.shopName}</p>
            <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.35)' }}>{cfg.label}</p>
          </div>
          {isReady ? (
            <span className="text-xs px-2.5 py-1 rounded-lg font-semibold" style={{ background: 'rgba(167,139,250,0.15)', color: '#A78BFA' }}>Pronto!</span>
          ) : isClose ? (
            <span className="text-xs px-2.5 py-1 rounded-lg font-semibold" style={{ background: 'rgba(245,158,11,0.15)', color: '#F59E0B' }}>Quasi!</span>
          ) : null}
        </div>

        <div className="rounded-xl p-3 mb-3" style={{ background: 'rgba(255,255,255,0.04)' }}>
          <p className="text-[10px] font-medium mb-0.5" style={{ color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Premio</p>
          <p className="font-semibold text-sm">{shop.rewardDescription || 'Premio speciale'}</p>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 flex-1">
            <div className="h-1.5 rounded-full overflow-hidden flex-1" style={{ background: 'rgba(255,255,255,0.06)' }}>
              <div className="h-full rounded-full" style={{ width: `${pct}%`, background: isReady ? 'linear-gradient(90deg, #7C3AED, #A78BFA)' : cfg.color }} />
            </div>
            <p className="text-[10px] font-medium flex-shrink-0" style={{ color: 'rgba(255,255,255,0.4)' }}>{Math.round(pct)}%</p>
          </div>
          <p className="text-[10px] ml-3 flex-shrink-0" style={{ color: 'rgba(255,255,255,0.35)' }}>
            {isReady ? '🎉 Vai al negozio!' : `${shop.points} / ${shop.nextRewardPoints} pt`}
          </p>
        </div>
      </div>
    </div>
  )
}

export default function OffertePage() {
  const { customer } = useAuthStore()

  const { data: shops = [], isLoading } = useQuery({
    queryKey: ['customer-shops', customer?.email],
    queryFn: () => getShops(),
    enabled: !!customer?.email,
    select: (res) => (res.data as CustomerShop[]).sort((a, b) => (b.points / b.nextRewardPoints) - (a.points / a.nextRewardPoints)),
  })

  const readyShops = shops.filter((s) => s.points >= s.nextRewardPoints)
  const closeShops = shops.filter((s) => (s.points / s.nextRewardPoints) >= 0.8 && s.points < s.nextRewardPoints)
  const otherShops = shops.filter((s) => (s.points / s.nextRewardPoints) < 0.8)

  return (
    <ProtectedLayout>
      <div className="px-4 pt-8 pb-6">

        {/* Header */}
        <div className="flex items-center justify-between mb-7" style={{ animation: 'slideUp 0.4s cubic-bezier(0.16,1,0.3,1) both' }}>
          <div>
            <p className="text-xs font-medium mb-1" style={{ color: 'rgba(255,255,255,0.35)', letterSpacing: '0.05em' }}>I tuoi progressi</p>
            <h1 className="font-display font-bold text-2xl leading-tight">Offerte & Premi</h1>
          </div>
          <div
            className="w-10 h-10 rounded-2xl flex items-center justify-center text-xl flex-shrink-0"
            style={{ background: 'rgba(245,158,11,0.15)', border: '1px solid rgba(245,158,11,0.25)' }}
          >
            🔥
          </div>
        </div>

        {isLoading ? (
          <div className="flex flex-col gap-3">
            {[1, 2, 3].map((i) => <div key={i} className="rounded-2xl h-32 animate-pulse" style={{ background: 'rgba(255,255,255,0.03)' }} />)}
          </div>
        ) : shops.length === 0 ? (
          <div
            className="rounded-2xl p-10 text-center"
            style={{ background: 'rgba(255,255,255,0.02)', border: '1px dashed rgba(255,255,255,0.08)', animation: 'slideUp 0.4s cubic-bezier(0.16,1,0.3,1) 0.1s both' }}
          >
            <div className="text-4xl mb-3">🎯</div>
            <p className="font-semibold text-sm mb-1">Nessuna offerta disponibile</p>
            <p className="text-xs" style={{ color: 'rgba(255,255,255,0.35)' }}>Visita i negozi Fidelio per accumulare punti</p>
          </div>
        ) : (
          <div className="flex flex-col gap-6">
            {readyShops.length > 0 && (
              <div style={{ animation: 'slideUp 0.4s cubic-bezier(0.16,1,0.3,1) 0.05s both' }}>
                <div className="flex items-center gap-2 mb-3">
                  <span>🎉</span>
                  <h2 className="text-xs font-semibold" style={{ color: '#A78BFA', letterSpacing: '0.06em', textTransform: 'uppercase' }}>Pronti da riscattare</h2>
                </div>
                <div className="flex flex-col gap-3">
                  {readyShops.map((s, i) => <OfferCard key={s.shopId} shop={s} index={i} />)}
                </div>
              </div>
            )}
            {closeShops.length > 0 && (
              <div style={{ animation: 'slideUp 0.4s cubic-bezier(0.16,1,0.3,1) 0.1s both' }}>
                <div className="flex items-center gap-2 mb-3">
                  <span>🔥</span>
                  <h2 className="text-xs font-semibold" style={{ color: '#F59E0B', letterSpacing: '0.06em', textTransform: 'uppercase' }}>Quasi pronti</h2>
                </div>
                <div className="flex flex-col gap-3">
                  {closeShops.map((s, i) => <OfferCard key={s.shopId} shop={s} index={i} />)}
                </div>
              </div>
            )}
            {otherShops.length > 0 && (
              <div style={{ animation: 'slideUp 0.4s cubic-bezier(0.16,1,0.3,1) 0.15s both' }}>
                <h2 className="text-xs font-semibold mb-3" style={{ color: 'rgba(255,255,255,0.3)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>In corso</h2>
                <div className="flex flex-col gap-3">
                  {otherShops.map((s, i) => <OfferCard key={s.shopId} shop={s} index={i} />)}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </ProtectedLayout>
  )
}
