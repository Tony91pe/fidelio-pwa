'use client'

import { useQuery } from '@tanstack/react-query'
import { useAuthStore } from '@/store/authStore'
import { getRewards, getGiftCards } from '@/lib/api'
import { ProtectedLayout } from '@/components/ProtectedLayout'
import { getCategoryConfig } from '@/lib/categories'
import { useState } from 'react'

export default function PremiPage() {
  const { customer } = useAuthStore()
  const [tab, setTab] = useState<'premi' | 'giftcard'>('premi')

  const { data: rewards = [], isLoading: loadingRewards } = useQuery({
    queryKey: ['rewards', customer?.email],
    queryFn: () => getRewards(customer!.email),
    enabled: !!customer?.email,
    select: (res) => res.data,
  })

  const { data: giftCards = [], isLoading: loadingGC } = useQuery({
    queryKey: ['giftcards', customer?.email],
    queryFn: () => getGiftCards(customer!.email),
    enabled: !!customer?.email,
    select: (res) => res.data,
  })

  return (
    <ProtectedLayout>
      <div className="page-enter px-4 pt-6 pb-4">
        <h1 className="font-display font-bold text-2xl mb-6">Premi</h1>

        {/* Tabs */}
        <div className="flex glass rounded-xl p-1 mb-6">
          {(['premi', 'giftcard'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className="flex-1 py-2 rounded-lg text-sm font-medium transition-all"
              style={{
                background: tab === t ? 'rgba(124,58,237,0.4)' : 'transparent',
                color: tab === t ? '#A78BFA' : 'rgba(255,255,255,0.4)',
              }}
            >
              {t === 'premi' ? '🏆 Premi' : '🎁 Gift Card'}
            </button>
          ))}
        </div>

        {tab === 'premi' && (
          <>
            {loadingRewards ? (
              <div className="flex flex-col gap-3">
                {[1, 2, 3].map((i) => <div key={i} className="glass rounded-2xl h-24 animate-pulse" />)}
              </div>
            ) : rewards.length === 0 ? (
              <div className="glass rounded-2xl p-10 text-center">
                <p className="text-5xl mb-3">🏆</p>
                <p className="font-semibold mb-1">Nessun premio ancora</p>
                <p className="text-white/40 text-sm">Accumula punti nei negozi Fidelio per sbloccare premi</p>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {rewards.map((reward: any) => (
                  <div key={reward.id} className="glass rounded-2xl p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-gold/20 flex items-center justify-center text-2xl flex-shrink-0">🏆</div>
                      <div className="flex-1">
                        <p className="font-semibold text-sm">{reward.description}</p>
                        <p className="text-xs text-white/40">{reward.shopName}</p>
                        <p className="text-xs text-gold mt-0.5">{new Date(reward.createdAt).toLocaleDateString('it-IT')}</p>
                      </div>
                      <div className="text-right">
                        <span className="text-xs px-2 py-1 rounded-lg text-success" style={{ background: 'rgba(16,185,129,0.15)' }}>
                          Riscattato
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {tab === 'giftcard' && (
          <>
            {loadingGC ? (
              <div className="flex flex-col gap-3">
                {[1, 2].map((i) => <div key={i} className="glass rounded-2xl h-32 animate-pulse" />)}
              </div>
            ) : giftCards.length === 0 ? (
              <div className="glass rounded-2xl p-10 text-center">
                <p className="text-5xl mb-3">🎁</p>
                <p className="font-semibold mb-1">Nessuna gift card</p>
                <p className="text-white/40 text-sm">Le gift card ti vengono assegnate dai negozianti</p>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {giftCards.map((gc: any) => (
                  <div key={gc.id} className="rounded-2xl overflow-hidden relative" style={{ background: 'linear-gradient(135deg, #1D4ED8, #7C3AED)' }}>
                    <div className="absolute -right-8 -top-8 w-32 h-32 rounded-full bg-white/5" />
                    <div className="p-5 relative">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <p className="text-xs text-white/60 mb-0.5">Gift Card</p>
                          <p className="font-semibold">{gc.shopName}</p>
                        </div>
                        <span className="font-display font-black text-3xl">{gc.points}</span>
                      </div>
                      <p className="font-mono text-sm tracking-widest text-white/80">{gc.code}</p>
                      {gc.description && <p className="text-xs text-white/50 mt-1">{gc.description}</p>}
                      {gc.used && (
                        <span className="absolute top-3 right-3 text-xs px-2 py-0.5 rounded bg-white/20">Usata</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </ProtectedLayout>
  )
}
