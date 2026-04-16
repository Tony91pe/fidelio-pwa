'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { ShopProtectedLayout } from '@/components/ShopProtectedLayout'
import { getShopGiftCards, createShopGiftCard, useShopGiftCard, deleteShopGiftCard } from '@/lib/api'
import { ShopGiftCard } from '@/types'
import axios from 'axios'

function GiftCardVisual({ card, onUse, onDelete }: {
  card: ShopGiftCard
  onUse: () => void
  onDelete: () => void
}) {
  const isUsed = !!card.usedAt

  return (
    <div
      className="rounded-2xl p-4 relative overflow-hidden"
      style={{
        background: isUsed
          ? 'rgba(255,255,255,0.03)'
          : 'linear-gradient(135deg, #0D3B2A 0%, #0A2A1F 100%)',
        border: `1px solid ${isUsed ? 'rgba(255,255,255,0.07)' : 'rgba(16,185,129,0.25)'}`,
        opacity: isUsed ? 0.6 : 1,
      }}
    >
      {!isUsed && (
        <div className="absolute top-0 right-0 w-24 h-24 rounded-full pointer-events-none" style={{ background: 'rgba(16,185,129,0.12)', filter: 'blur(20px)', transform: 'translate(30%,-30%)' }} />
      )}
      <div className="flex items-start justify-between mb-3">
        <div>
          <p className="text-[10px] font-medium mb-0.5" style={{ color: 'rgba(255,255,255,0.4)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
            {isUsed ? 'Gift Card • Usata' : 'Gift Card'}
          </p>
          <p className="font-display font-black text-2xl" style={{ color: isUsed ? 'rgba(255,255,255,0.35)' : '#10B981' }}>
            €{card.value.toFixed(2)}
          </p>
        </div>
        <div className="flex gap-2">
          {!isUsed && (
            <button
              onClick={onUse}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold"
              style={{ background: 'rgba(245,158,11,0.15)', border: '1px solid rgba(245,158,11,0.3)', color: '#F59E0B' }}
            >
              Usa
            </button>
          )}
          <button
            onClick={onDelete}
            className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.18)' }}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#F87171" strokeWidth="2">
              <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/>
              <path d="M10 11v6M14 11v6M9 6V4h6v2"/>
            </svg>
          </button>
        </div>
      </div>

      {card.description && (
        <p className="text-xs mb-2" style={{ color: 'rgba(255,255,255,0.5)' }}>{card.description}</p>
      )}

      <div className="flex items-center justify-between">
        <p className="font-mono text-xs" style={{ color: 'rgba(255,255,255,0.35)' }}>{card.code}</p>
        {card.customerName ? (
          <p className="text-[10px]" style={{ color: 'rgba(255,255,255,0.3)' }}>
            👤 {card.customerName}
          </p>
        ) : null}
      </div>

      {isUsed && (
        <p className="text-[10px] mt-1.5" style={{ color: 'rgba(255,255,255,0.3)' }}>
          Usata il {new Date(card.usedAt!).toLocaleDateString('it-IT', { day: '2-digit', month: 'short', year: 'numeric' })}
        </p>
      )}
    </div>
  )
}

export default function ShopGiftCardPage() {
  const queryClient = useQueryClient()
  const [showForm, setShowForm] = useState(false)
  const [filter, setFilter] = useState<'all' | 'active' | 'used'>('active')
  const [formData, setFormData] = useState({ value: '', description: '', customerEmail: '' })
  const [formError, setFormError] = useState('')

  const { data: cards, isLoading } = useQuery<ShopGiftCard[]>({
    queryKey: ['shop-gift-cards'],
    queryFn: () => getShopGiftCards().then((r) => r.data),
  })

  const createMutation = useMutation({
    mutationFn: () => createShopGiftCard({
      value: parseFloat(formData.value),
      description: formData.description || undefined,
      customerEmail: formData.customerEmail || undefined,
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shop-gift-cards'] })
      setShowForm(false)
      setFormData({ value: '', description: '', customerEmail: '' })
      setFormError('')
    },
    onError: (err) => {
      if (axios.isAxiosError(err)) setFormError(err.response?.data?.error || 'Errore nella creazione')
    },
  })

  const useMutation2 = useMutation({
    mutationFn: (id: string) => useShopGiftCard(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['shop-gift-cards'] }),
    onError: (err) => {
      if (axios.isAxiosError(err)) alert(err.response?.data?.error || 'Errore')
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteShopGiftCard(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['shop-gift-cards'] }),
  })

  function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    setFormError('')
    const v = parseFloat(formData.value)
    if (!formData.value || isNaN(v) || v <= 0) { setFormError('Inserisci un valore valido'); return }
    createMutation.mutate()
  }

  const filteredCards = cards?.filter((c) => {
    if (filter === 'active') return !c.usedAt
    if (filter === 'used') return !!c.usedAt
    return true
  })

  const activeCount = cards?.filter((c) => !c.usedAt).length ?? 0
  const usedCount = cards?.filter((c) => !!c.usedAt).length ?? 0
  const totalValue = cards?.filter((c) => !c.usedAt).reduce((s, c) => s + c.value, 0) ?? 0

  return (
    <ShopProtectedLayout>
      <div className="px-4 pt-8 pb-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-4" style={{ animation: 'slideUp 0.4s cubic-bezier(0.16,1,0.3,1) both' }}>
          <div>
            <h1 className="font-display font-bold text-2xl mb-1">Gift Card</h1>
            <p className="text-sm" style={{ color: 'rgba(255,255,255,0.4)' }}>
              {activeCount} attive · €{totalValue.toFixed(2)} in circolazione
            </p>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm transition-all active:scale-95"
            style={{ background: 'linear-gradient(135deg, #10B981, #0EA5E9)', boxShadow: '0 4px 12px rgba(16,185,129,0.4)' }}
          >
            <span>+</span> Crea
          </button>
        </div>

        {/* Tip: scan */}
        <div
          className="rounded-xl px-4 py-3 mb-5 flex items-center gap-3"
          style={{ background: 'rgba(16,185,129,0.07)', border: '1px solid rgba(16,185,129,0.15)' }}
        >
          <span className="text-lg">💡</span>
          <p className="text-xs" style={{ color: 'rgba(255,255,255,0.5)' }}>
            Per usare una gift card, vai su <span className="font-semibold" style={{ color: '#10B981' }}>Scanner → Gift Card</span> e scansiona il QR del cliente.
          </p>
        </div>

        {/* Filter tabs */}
        <div
          className="flex rounded-xl p-1 mb-5"
          style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}
        >
          {(['active', 'used', 'all'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className="flex-1 py-2 rounded-lg text-xs font-semibold transition-all"
              style={{
                background: filter === f ? 'rgba(16,185,129,0.2)' : 'transparent',
                color: filter === f ? '#10B981' : 'rgba(255,255,255,0.35)',
              }}
            >
              {f === 'active' ? `Attive (${activeCount})` : f === 'used' ? `Usate (${usedCount})` : 'Tutte'}
            </button>
          ))}
        </div>

        {/* Cards list */}
        {isLoading ? (
          <div className="flex flex-col gap-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="rounded-2xl h-28 animate-pulse" style={{ background: 'rgba(255,255,255,0.03)' }} />
            ))}
          </div>
        ) : !filteredCards?.length ? (
          <div
            className="rounded-2xl p-8 text-center"
            style={{ background: 'rgba(255,255,255,0.02)', border: '1px dashed rgba(255,255,255,0.08)' }}
          >
            <div className="text-4xl mb-3">🎁</div>
            <p className="font-semibold text-sm mb-1">
              {filter === 'active' ? 'Nessuna gift card attiva' : filter === 'used' ? 'Nessuna gift card usata' : 'Nessuna gift card'}
            </p>
            {filter === 'active' && (
              <button
                onClick={() => setShowForm(true)}
                className="mt-3 px-6 py-2.5 rounded-xl font-semibold text-sm"
                style={{ background: 'linear-gradient(135deg, #10B981, #0EA5E9)' }}
              >
                Crea gift card
              </button>
            )}
          </div>
        ) : (
          <div className="flex flex-col gap-3" style={{ animation: 'slideUp 0.4s cubic-bezier(0.16,1,0.3,1) 0.05s both' }}>
            {filteredCards.map((card) => (
              <GiftCardVisual
                key={card.id}
                card={card}
                onUse={() => {
                  if (confirm(`Segnare la gift card €${card.value.toFixed(2)} come usata?`)) {
                    useMutation2.mutate(card.id)
                  }
                }}
                onDelete={() => {
                  if (confirm('Eliminare questa gift card?')) deleteMutation.mutate(card.id)
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
            <h2 className="font-display font-bold text-lg mb-4">Crea gift card</h2>
            <form onSubmit={handleCreate} className="flex flex-col gap-3">
              <div>
                <label className="text-xs font-medium mb-1.5 block" style={{ color: 'rgba(255,255,255,0.5)' }}>
                  Valore (€) *
                </label>
                <input
                  type="number"
                  inputMode="decimal"
                  placeholder="es. 25.00"
                  value={formData.value}
                  onChange={(e) => setFormData((p) => ({ ...p, value: e.target.value }))}
                  min="0.01"
                  step="0.01"
                  autoFocus
                />
              </div>
              <div>
                <label className="text-xs font-medium mb-1.5 block" style={{ color: 'rgba(255,255,255,0.5)' }}>
                  Descrizione (opzionale)
                </label>
                <input
                  type="text"
                  placeholder="es. Regalo di compleanno..."
                  value={formData.description}
                  onChange={(e) => setFormData((p) => ({ ...p, description: e.target.value }))}
                />
              </div>
              <div>
                <label className="text-xs font-medium mb-1.5 block" style={{ color: 'rgba(255,255,255,0.5)' }}>
                  Email cliente (opzionale — assegna al cliente)
                </label>
                <input
                  type="email"
                  placeholder="cliente@email.com"
                  value={formData.customerEmail}
                  onChange={(e) => setFormData((p) => ({ ...p, customerEmail: e.target.value }))}
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
                  {createMutation.isPending ? 'Creazione...' : 'Crea'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </ShopProtectedLayout>
  )
}
