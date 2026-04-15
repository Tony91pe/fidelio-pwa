'use client'

import { useQuery } from '@tanstack/react-query'
import { useAuthStore } from '@/store/authStore'
import { getRewards, getGiftCards } from '@/lib/api'
import { ProtectedLayout } from '@/components/ProtectedLayout'
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
      <div className="px-4 pt-8 pb-24">
        <div style={{ animation: 'slideUp 0.4s cubic-bezier(0.16,1,0.3,1) both' }}>
          <p className="text-xs font-medium mb-1" style={{ color: 'rgba(255,255,255,0.35)', letterSpacing: '0.05em' }}>La tua collezione</p>
          <h1 className="font-display font-bold text-2xl mb-6">Premi</h1>
        </div>

        {/* Tabs */}
        <div className="flex rounded-xl p-1 mb-6" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', animation: 'slideUp 0.4s cubic-bezier(0.16,1,0.3,1) 0.05s both' }}>
          {(['premi', 'giftcard'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className="flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all"
              style={{
                background: tab === t ? 'rgba(124,58,237,0.35)' : 'transparent',
                color: tab === t ? '#A78BFA' : 'rgba(255,255,255,0.35)',
              }}
            >
              {t === 'premi' ? '🏆 Premi' : '🎁 Gift Card'}
            </button>
          ))}
        </div>

        {tab === 'premi' && (
          loadingRewards ? (
            <div className="flex flex-col gap-3">
              {[1,2,3].map((i) => <div key={i} className="rounded-2xl h-20 animate-pulse" style={{ background: 'rgba(255,255,255,0.03)' }} />)}
            </div>
          ) : rewards.length === 0 ? (
            <div className="rounded-2xl p-10 text-center" style={{ background: 'rgba(255,255,255,0.02)', border: '1px dashed rgba(255,255,255,0.1)' }}>
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl mx-auto mb-3" style={{ background: 'rgba(250,204,21,0.1)', border: '1px solid rgba(250,204,21,0.2)' }}>🏆</div>
              <p className="font-semibold text-sm mb-1">Nessun premio ancora</p>
              <p className="text-xs" style={{ color: 'rgba(255,255,255,0.35)' }}>Accumula punti nei negozi Fidelio per sbloccare premi</p>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {rewards.map((reward: any, i: number) => (
                <div
                  key={reward.id}
                  className="rounded-2xl p-4"
                  style={{
                    background: 'rgba(255,255,255,0.035)',
                    border: '1px solid rgba(255,255,255,0.07)',
                    animation: `slideUp 0.4s cubic-bezier(0.16,1,0.3,1) ${i * 0.06}s both`,
                  }}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-xl flex items-center justify-center text-xl flex-shrink-0" style={{ background: 'rgba(250,204,21,0.1)', border: '1px solid rgba(250,204,21,0.2)' }}>🏆</div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm truncate">{reward.description}</p>
                      <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.35)' }}>{reward.shopName}</p>
                      <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.25)' }}>{new Date(reward.createdAt).toLocaleDateString('it-IT')}</p>
                    </div>
                    <span className="text-xs px-2.5 py-1 rounded-lg font-semibold flex-shrink-0" style={{ background: 'rgba(52,211,153,0.12)', color: '#34D399' }}>
                      Riscattato
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )
        )}

        {tab === 'giftcard' && (
          loadingGC ? (
            <div className="flex flex-col gap-3">
              {[1,2].map((i) => <div key={i} className="rounded-2xl h-32 animate-pulse" style={{ background: 'rgba(255,255,255,0.03)' }} />)}
            </div>
          ) : giftCards.length === 0 ? (
            <div className="rounded-2xl p-10 text-center" style={{ background: 'rgba(255,255,255,0.02)', border: '1px dashed rgba(255,255,255,0.1)' }}>
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl mx-auto mb-3" style={{ background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.2)' }}>🎁</div>
              <p className="font-semibold text-sm mb-1">Nessuna gift card</p>
              <p className="text-xs" style={{ color: 'rgba(255,255,255,0.35)' }}>Le gift card ti vengono assegnate dai negozianti</p>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {giftCards.map((gc: any, i: number) => (
                <div
                  key={gc.id}
                  className="rounded-2xl overflow-hidden relative"
                  style={{
                    background: 'linear-gradient(135deg, #1E3A8A 0%, #4C1D95 100%)',
                    boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
                    animation: `slideUp 0.4s cubic-bezier(0.16,1,0.3,1) ${i * 0.06}s both`,
                    opacity: gc.used ? 0.5 : 1,
                  }}
                >
                  <div className="absolute" style={{ top: -30, right: -30, width: 120, height: 120, borderRadius: '50%', background: 'rgba(255,255,255,0.05)' }} />
                  <div className="absolute" style={{ bottom: -20, left: -20, width: 80, height: 80, borderRadius: '50%', background: 'rgba(255,255,255,0.04)' }} />
                  <div className="relative p-5">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <p className="text-[10px] font-medium mb-0.5" style={{ color: 'rgba(255,255,255,0.45)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Gift Card</p>
                        <p className="font-semibold text-base">{gc.shopName}</p>
                      </div>
                      <div className="text-right">
                        <span className="font-display font-black text-3xl">{gc.points}</span>
                        <p className="text-[10px]" style={{ color: 'rgba(255,255,255,0.45)' }}>punti</p>
                      </div>
                    </div>
                    <p className="font-mono text-sm tracking-[0.2em]" style={{ color: 'rgba(255,255,255,0.8)' }}>{gc.code}</p>
                    {gc.description && <p className="text-xs mt-1.5" style={{ color: 'rgba(255,255,255,0.4)' }}>{gc.description}</p>}
                    {gc.used && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-xs font-bold px-3 py-1 rounded-lg rotate-[-15deg]" style={{ background: 'rgba(0,0,0,0.5)', color: 'rgba(255,255,255,0.6)', border: '1px solid rgba(255,255,255,0.2)' }}>USATA</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )
        )}
      </div>
    </ProtectedLayout>
  )
}
