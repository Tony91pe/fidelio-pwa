'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { ShopProtectedLayout } from '@/components/ShopProtectedLayout'
import { getShopRewards, createShopReward, updateShopReward, deleteShopReward } from '@/lib/api'
import { ShopReward } from '@/types'
import axios from 'axios'

function RewardCard({ reward, onToggle, onDelete }: {
  reward: ShopReward
  onToggle: () => void
  onDelete: () => void
}) {
  return (
    <div
      className="rounded-2xl p-4"
      style={{
        background: 'rgba(255,255,255,0.04)',
        border: `1px solid ${reward.active ? 'rgba(16,185,129,0.2)' : 'rgba(255,255,255,0.07)'}`,
        opacity: reward.active ? 1 : 0.6,
      }}
    >
      <div className="flex items-start gap-3">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
          style={{ background: 'rgba(245,158,11,0.15)', border: '1px solid rgba(245,158,11,0.2)' }}
        >
          🏆
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-sm mb-0.5">{reward.description}</p>
          <p className="text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>
            Richiede <span className="font-bold" style={{ color: '#F59E0B' }}>{reward.pointsRequired} punti</span>
          </p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            onClick={onToggle}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
            style={{
              background: reward.active ? 'rgba(16,185,129,0.15)' : 'rgba(255,255,255,0.07)',
              border: `1px solid ${reward.active ? 'rgba(16,185,129,0.3)' : 'rgba(255,255,255,0.1)'}`,
              color: reward.active ? '#10B981' : 'rgba(255,255,255,0.5)',
            }}
          >
            {reward.active ? 'Attivo' : 'Inattivo'}
          </button>
          <button
            onClick={onDelete}
            className="w-8 h-8 rounded-lg flex items-center justify-center transition-all active:scale-95"
            style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)' }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#F87171" strokeWidth="2">
              <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/>
              <path d="M10 11v6M14 11v6M9 6V4h6v2"/>
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
}

export default function ShopPremiPage() {
  const queryClient = useQueryClient()
  const [showForm, setShowForm] = useState(false)
  const [description, setDescription] = useState('')
  const [points, setPoints] = useState('')
  const [formError, setFormError] = useState('')

  const { data: rewards, isLoading } = useQuery<ShopReward[]>({
    queryKey: ['shop-rewards'],
    queryFn: () => getShopRewards().then((r) => r.data),
  })

  const createMutation = useMutation({
    mutationFn: () => createShopReward({ description, pointsRequired: parseInt(points) }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shop-rewards'] })
      setShowForm(false)
      setDescription('')
      setPoints('')
      setFormError('')
    },
    onError: (err) => {
      if (axios.isAxiosError(err)) {
        setFormError(err.response?.data?.error || 'Errore nella creazione')
      }
    },
  })

  const toggleMutation = useMutation({
    mutationFn: ({ id, active }: { id: string; active: boolean }) =>
      updateShopReward(id, { active }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['shop-rewards'] }),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteShopReward(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['shop-rewards'] }),
  })

  function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    setFormError('')
    if (!description.trim()) { setFormError('Inserisci una descrizione'); return }
    if (!points || parseInt(points) <= 0) { setFormError('Inserisci un numero di punti valido'); return }
    createMutation.mutate()
  }

  return (
    <ShopProtectedLayout>
      <div className="px-4 pt-8 pb-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6" style={{ animation: 'slideUp 0.4s cubic-bezier(0.16,1,0.3,1) both' }}>
          <div>
            <h1 className="font-display font-bold text-2xl mb-1">Premi</h1>
            <p className="text-sm" style={{ color: 'rgba(255,255,255,0.4)' }}>
              {rewards?.filter((r) => r.active).length ?? 0} premi attivi
            </p>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm transition-all active:scale-95"
            style={{ background: 'linear-gradient(135deg, #10B981, #0EA5E9)', boxShadow: '0 4px 12px rgba(16,185,129,0.4)' }}
          >
            <span>+</span> Nuovo
          </button>
        </div>

        {/* Rewards list */}
        {isLoading ? (
          <div className="flex flex-col gap-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="rounded-2xl h-20 animate-pulse" style={{ background: 'rgba(255,255,255,0.03)' }} />
            ))}
          </div>
        ) : !rewards?.length ? (
          <div
            className="rounded-2xl p-8 text-center"
            style={{ background: 'rgba(255,255,255,0.02)', border: '1px dashed rgba(255,255,255,0.08)' }}
          >
            <div className="text-4xl mb-3">🏆</div>
            <p className="font-semibold text-sm mb-1">Nessun premio configurato</p>
            <p className="text-xs mb-4" style={{ color: 'rgba(255,255,255,0.35)' }}>
              Crea premi per incentivare i tuoi clienti
            </p>
            <button
              onClick={() => setShowForm(true)}
              className="px-6 py-2.5 rounded-xl font-semibold text-sm"
              style={{ background: 'linear-gradient(135deg, #10B981, #0EA5E9)' }}
            >
              Crea primo premio
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-3" style={{ animation: 'slideUp 0.4s cubic-bezier(0.16,1,0.3,1) 0.05s both' }}>
            {rewards.map((r) => (
              <RewardCard
                key={r.id}
                reward={r}
                onToggle={() => toggleMutation.mutate({ id: r.id, active: !r.active })}
                onDelete={() => {
                  if (confirm('Eliminare questo premio?')) deleteMutation.mutate(r.id)
                }}
              />
            ))}
          </div>
        )}
      </div>

      {/* Create Modal */}
      {showForm && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)' }}
          onClick={() => setShowForm(false)}
        >
          <div
            className="w-full max-w-sm rounded-3xl p-6"
            style={{ background: '#0D1F17', border: '1px solid rgba(16,185,129,0.2)', animation: 'slideUp 0.3s cubic-bezier(0.16,1,0.3,1) both' }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="font-display font-bold text-lg mb-4">Nuovo premio</h2>
            <form onSubmit={handleCreate} className="flex flex-col gap-4">
              <div>
                <label className="text-xs font-medium mb-1.5 block" style={{ color: 'rgba(255,255,255,0.5)' }}>
                  Descrizione premio
                </label>
                <input
                  type="text"
                  placeholder="es. Caffè gratis, Sconto 10%..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  autoFocus
                />
              </div>
              <div>
                <label className="text-xs font-medium mb-1.5 block" style={{ color: 'rgba(255,255,255,0.5)' }}>
                  Punti necessari
                </label>
                <input
                  type="number"
                  inputMode="numeric"
                  placeholder="es. 100"
                  value={points}
                  onChange={(e) => setPoints(e.target.value)}
                  min="1"
                />
              </div>
              {formError && <p className="text-sm" style={{ color: '#F87171' }}>{formError}</p>}
              <div className="flex gap-3 mt-1">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="flex-1 py-3 rounded-xl font-semibold text-sm"
                  style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)' }}
                >
                  Annulla
                </button>
                <button
                  type="submit"
                  disabled={createMutation.isPending}
                  className="flex-1 py-3 rounded-xl font-semibold text-sm"
                  style={{ background: 'linear-gradient(135deg, #10B981, #0EA5E9)', boxShadow: '0 4px 12px rgba(16,185,129,0.4)' }}
                >
                  {createMutation.isPending ? 'Creazione...' : 'Crea premio'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </ShopProtectedLayout>
  )
}
