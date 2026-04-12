'use client'

import { ProtectedLayout } from '@/components/ProtectedLayout'
import { useQuery } from '@tanstack/react-query'
import { useAuthStore } from '@/store/authStore'
import { getShops } from '@/lib/api'
import { getCategoryConfig } from '@/lib/categories'
import { CustomerShop } from '@/types'

function OfferCard({ shop }: { shop: CustomerShop }) {
  const cfg = getCategoryConfig(shop.category)
  const remaining = Math.max(shop.nextRewardPoints - shop.points, 0)
  const pct = Math.min((shop.points / shop.nextRewardPoints) * 100, 100)
  const isClose = pct >= 80

  return (
    <div className="glass rounded-2xl overflow-hidden">
      <div className="h-1.5 w-full" style={{ background: `linear-gradient(90deg, ${cfg.color} ${pct}%, rgba(255,255,255,0.06) ${pct}%)` }} />
      <div className="p-4">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0" style={{ background: cfg.color + '22' }}>
            {cfg.emoji}
          </div>
          <div className="flex-1">
            <p className="font-semibold text-sm">{shop.shopName}</p>
            <p className="text-xs text-white/40">{cfg.label}</p>
          </div>
          {isClose && (
            <span className="text-xs px-2 py-0.5 rounded-lg font-medium" style={{ background: 'rgba(245,158,11,0.2)', color: '#F59E0B' }}>
              Quasi!
            </span>
          )}
        </div>

        <div className="rounded-xl p-3" style={{ background: 'rgba(255,255,255,0.04)' }}>
          <p className="text-xs text-white/40 mb-0.5">Premio disponibile</p>
          <p className="font-semibold text-sm">{shop.rewardDescription || 'Premio speciale'}</p>
        </div>

        <div className="flex justify-between items-center mt-3 text-xs">
          <span className="text-white/40">
            {shop.points} / {shop.nextRewardPoints} punti
          </span>
          {remaining > 0 ? (
            <span className="text-white/60">Mancano {remaining} punti</span>
          ) : (
            <span className="text-success font-semibold">🎉 Premio disponibile!</span>
          )}
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
    select: (res) => (res.data as CustomerShop[]).sort((a, b) => {
      const pctA = a.points / a.nextRewardPoints
      const pctB = b.points / b.nextRewardPoints
      return pctB - pctA
    }),
  })

  const closeShops = shops.filter((s) => (s.points / s.nextRewardPoints) >= 0.8)
  const otherShops = shops.filter((s) => (s.points / s.nextRewardPoints) < 0.8)

  return (
    <ProtectedLayout>
      <div className="page-enter px-4 pt-14 pb-4">
        <h1 className="font-display font-bold text-2xl mb-2">Offerte & Premi</h1>
        <p className="text-white/40 text-sm mb-6">I premi più vicini a te</p>

        {isLoading ? (
          <div className="flex flex-col gap-3">
            {[1, 2, 3].map((i) => <div key={i} className="glass rounded-2xl h-32 animate-pulse" />)}
          </div>
        ) : shops.length === 0 ? (
          <div className="glass rounded-2xl p-10 text-center">
            <p className="text-5xl mb-3">🎯</p>
            <p className="font-semibold mb-1">Nessuna offerta disponibile</p>
            <p className="text-white/40 text-sm">Visita i negozi Fidelio per accumulare punti</p>
          </div>
        ) : (
          <>
            {closeShops.length > 0 && (
              <>
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-gold">🔥</span>
                  <h2 className="font-semibold text-sm text-gold">Quasi pronti</h2>
                </div>
                <div className="flex flex-col gap-3 mb-6">
                  {closeShops.map((shop) => <OfferCard key={shop.shopId} shop={shop} />)}
                </div>
              </>
            )}

            {otherShops.length > 0 && (
              <>
                <h2 className="font-semibold text-sm text-white/50 mb-3">In corso</h2>
                <div className="flex flex-col gap-3">
                  {otherShops.map((shop) => <OfferCard key={shop.shopId} shop={shop} />)}
                </div>
              </>
            )}
          </>
        )}
      </div>
    </ProtectedLayout>
  )
}
