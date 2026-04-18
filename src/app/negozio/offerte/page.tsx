'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { ShopProtectedLayout } from '@/components/ShopProtectedLayout'
import { useShopAuthStore } from '@/store/shopAuthStore'
import { getShopOffers, createShopOffer, updateShopOffer, deleteShopOffer } from '@/lib/api'
import { ShopOffer } from '@/types'
import { PlanGate } from '@/components/PlanGate'
import axios from 'axios'

function OfferCard({ offer, onToggle, onDelete, onEdit }: {
  offer: ShopOffer
  onToggle: () => void
  onDelete: () => void
  onEdit: () => void
}) {
  const expires = offer.expiresAt
    ? new Date(offer.expiresAt).toLocaleDateString('it-IT', { day: '2-digit', month: 'short', year: 'numeric' })
    : null
  const isExpired = offer.expiresAt ? new Date(offer.expiresAt) < new Date() : false

  return (
    <div
      className="rounded-2xl p-4"
      style={{
        background: 'rgba(255,255,255,0.04)',
        border: `1px solid ${isExpired ? 'rgba(239,68,68,0.2)' : offer.active ? 'rgba(245,158,11,0.2)' : 'rgba(255,255,255,0.07)'}`,
        opacity: isExpired || !offer.active ? 0.65 : 1,
      }}
    >
      <div className="flex items-start gap-3">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
          style={{ background: 'rgba(245,158,11,0.12)', border: '1px solid rgba(245,158,11,0.2)' }}
        >
          🔥
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-sm mb-0.5">{offer.title}</p>
          <p className="text-xs mb-1.5" style={{ color: 'rgba(255,255,255,0.5)' }}>{offer.description}</p>
          <div className="flex items-center gap-2 flex-wrap">
            {expires && (
              <span
                className="text-[10px] px-2 py-0.5 rounded-full font-medium"
                style={{
                  background: isExpired ? 'rgba(239,68,68,0.12)' : 'rgba(255,255,255,0.06)',
                  color: isExpired ? '#F87171' : 'rgba(255,255,255,0.4)',
                  border: `1px solid ${isExpired ? 'rgba(239,68,68,0.2)' : 'rgba(255,255,255,0.08)'}`,
                }}
              >
                {isExpired ? '⚠️ Scaduta' : `Scade: ${expires}`}
              </span>
            )}
            <span
              className="text-[10px] px-2 py-0.5 rounded-full font-medium"
              style={{
                background: offer.active ? 'rgba(16,185,129,0.1)' : 'rgba(255,255,255,0.05)',
                color: offer.active ? '#10B981' : 'rgba(255,255,255,0.35)',
                border: `1px solid ${offer.active ? 'rgba(16,185,129,0.2)' : 'rgba(255,255,255,0.07)'}`,
              }}
            >
              {offer.active ? '● Attiva' : '○ Inattiva'}
            </span>
          </div>
        </div>
      </div>
      <div className="flex items-center gap-2 mt-3">
        <button
          onClick={onEdit}
          className="flex-1 py-2 rounded-xl text-xs font-semibold"
          style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.09)' }}
        >
          ✏️ Modifica
        </button>
        <button
          onClick={onToggle}
          className="flex-1 py-2 rounded-xl text-xs font-semibold"
          style={{
            background: offer.active ? 'rgba(239,68,68,0.08)' : 'rgba(16,185,129,0.1)',
            border: `1px solid ${offer.active ? 'rgba(239,68,68,0.2)' : 'rgba(16,185,129,0.2)'}`,
            color: offer.active ? '#F87171' : '#10B981',
          }}
        >
          {offer.active ? '⏸ Disattiva' : '▶ Attiva'}
        </button>
        <button
          onClick={onDelete}
          className="w-9 h-9 rounded-xl flex items-center justify-center"
          style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.18)' }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#F87171" strokeWidth="2">
            <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/>
            <path d="M10 11v6M14 11v6M9 6V4h6v2"/>
          </svg>
        </button>
      </div>
    </div>
  )
}

interface OfferFormData {
  title: string
  description: string
  expiresAt: string
}

export default function ShopOffertePage() {
  const queryClient = useQueryClient()
  const { shop } = useShopAuthStore()
  const [showForm, setShowForm] = useState(false)
  const [editingOffer, setEditingOffer] = useState<ShopOffer | null>(null)
  const [formData, setFormData] = useState<OfferFormData>({ title: '', description: '', expiresAt: '' })
  const [formError, setFormError] = useState('')

  const { data: offers, isLoading } = useQuery<ShopOffer[]>({
    queryKey: ['shop-offers'],
    queryFn: () => getShopOffers().then((r) => r.data),
  })

  const createMutation = useMutation({
    mutationFn: () => createShopOffer({
      title: formData.title,
      description: formData.description,
      expiresAt: formData.expiresAt || undefined,
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shop-offers'] })
      closeForm()
    },
    onError: (err) => {
      if (axios.isAxiosError(err)) setFormError(err.response?.data?.error || 'Errore')
    },
  })

  const updateMutation = useMutation({
    mutationFn: () => updateShopOffer(editingOffer!.id, {
      title: formData.title,
      description: formData.description,
      expiresAt: formData.expiresAt || undefined,
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shop-offers'] })
      closeForm()
    },
    onError: (err) => {
      if (axios.isAxiosError(err)) setFormError(err.response?.data?.error || 'Errore')
    },
  })

  const toggleMutation = useMutation({
    mutationFn: ({ id, active }: { id: string; active: boolean }) => updateShopOffer(id, { active }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['shop-offers'] }),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteShopOffer(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['shop-offers'] }),
  })

  function openCreate() {
    setEditingOffer(null)
    setFormData({ title: '', description: '', expiresAt: '' })
    setFormError('')
    setShowForm(true)
  }

  function openEdit(offer: ShopOffer) {
    setEditingOffer(offer)
    setFormData({
      title: offer.title,
      description: offer.description,
      expiresAt: offer.expiresAt ? offer.expiresAt.split('T')[0] : '',
    })
    setFormError('')
    setShowForm(true)
  }

  function closeForm() {
    setShowForm(false)
    setEditingOffer(null)
    setFormData({ title: '', description: '', expiresAt: '' })
    setFormError('')
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setFormError('')
    if (!formData.title.trim()) { setFormError('Inserisci un titolo'); return }
    if (!formData.description.trim()) { setFormError('Inserisci una descrizione'); return }
    if (editingOffer) {
      updateMutation.mutate()
    } else {
      createMutation.mutate()
    }
  }

  const isMutating = createMutation.isPending || updateMutation.isPending

  if (shop && shop.plan === 'STARTER') {
    return (
      <ShopProtectedLayout>
        <PlanGate
          currentPlan={shop.plan}
          requiredPlan="GROWTH"
          feature="Offerte"
          description="Crea offerte speciali per i tuoi clienti. Disponibile dal piano Growth."
        />
      </ShopProtectedLayout>
    )
  }

  return (
    <ShopProtectedLayout>
      <div className="px-4 pt-8 pb-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6" style={{ animation: 'slideUp 0.4s cubic-bezier(0.16,1,0.3,1) both' }}>
          <div>
            <h1 className="font-display font-bold text-2xl mb-1">Offerte</h1>
            <p className="text-sm" style={{ color: 'rgba(255,255,255,0.4)' }}>
              {offers?.filter((o) => o.active).length ?? 0} offerte attive
            </p>
          </div>
          <button
            onClick={openCreate}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm transition-all active:scale-95"
            style={{ background: 'linear-gradient(135deg, #F59E0B, #EF4444)', boxShadow: '0 4px 12px rgba(245,158,11,0.35)' }}
          >
            <span>+</span> Nuova
          </button>
        </div>

        {/* List */}
        {isLoading ? (
          <div className="flex flex-col gap-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="rounded-2xl h-28 animate-pulse" style={{ background: 'rgba(255,255,255,0.03)' }} />
            ))}
          </div>
        ) : !offers?.length ? (
          <div
            className="rounded-2xl p-8 text-center"
            style={{ background: 'rgba(255,255,255,0.02)', border: '1px dashed rgba(255,255,255,0.08)' }}
          >
            <div className="text-4xl mb-3">🔥</div>
            <p className="font-semibold text-sm mb-1">Nessuna offerta ancora</p>
            <p className="text-xs mb-4" style={{ color: 'rgba(255,255,255,0.35)' }}>
              Crea offerte per attirare nuovi clienti
            </p>
            <button
              onClick={openCreate}
              className="px-6 py-2.5 rounded-xl font-semibold text-sm"
              style={{ background: 'linear-gradient(135deg, #F59E0B, #EF4444)' }}
            >
              Crea prima offerta
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-3" style={{ animation: 'slideUp 0.4s cubic-bezier(0.16,1,0.3,1) 0.05s both' }}>
            {offers.map((o) => (
              <OfferCard
                key={o.id}
                offer={o}
                onToggle={() => toggleMutation.mutate({ id: o.id, active: !o.active })}
                onDelete={() => { if (confirm('Eliminare questa offerta?')) deleteMutation.mutate(o.id) }}
                onEdit={() => openEdit(o)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Form Modal */}
      {showForm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)' }}
          onClick={closeForm}
        >
          <div
            className="w-full max-w-sm rounded-3xl p-6 overflow-y-auto"
            style={{ background: '#0D1F17', border: '1px solid rgba(245,158,11,0.2)', maxHeight: '90vh', animation: 'slideUp 0.3s cubic-bezier(0.16,1,0.3,1) both' }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="font-display font-bold text-lg mb-4">
              {editingOffer ? 'Modifica offerta' : 'Nuova offerta'}
            </h2>
            <form onSubmit={handleSubmit} className="flex flex-col gap-3">
              <div>
                <label className="text-xs font-medium mb-1.5 block" style={{ color: 'rgba(255,255,255,0.5)' }}>Titolo</label>
                <input
                  type="text"
                  placeholder="es. Sconto 20%, 2x1 sul caffè..."
                  value={formData.title}
                  onChange={(e) => setFormData((p) => ({ ...p, title: e.target.value }))}
                  autoFocus
                />
              </div>
              <div>
                <label className="text-xs font-medium mb-1.5 block" style={{ color: 'rgba(255,255,255,0.5)' }}>Descrizione</label>
                <textarea
                  placeholder="Descrivi l'offerta nel dettaglio..."
                  value={formData.description}
                  onChange={(e) => setFormData((p) => ({ ...p, description: e.target.value }))}
                  rows={3}
                  className="w-full resize-none"
                  style={{
                    background: 'rgba(255,255,255,0.04)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: 12,
                    padding: '12px 14px',
                    color: 'white',
                    fontSize: 14,
                    outline: 'none',
                  }}
                />
              </div>
              <div>
                <label className="text-xs font-medium mb-1.5 block" style={{ color: 'rgba(255,255,255,0.5)' }}>
                  Scadenza (opzionale)
                </label>
                <input
                  type="date"
                  value={formData.expiresAt}
                  onChange={(e) => setFormData((p) => ({ ...p, expiresAt: e.target.value }))}
                  style={{ colorScheme: 'dark' }}
                />
              </div>
              {formError && <p className="text-sm" style={{ color: '#F87171' }}>{formError}</p>}
              <div className="flex gap-3 mt-1">
                <button
                  type="button"
                  onClick={closeForm}
                  className="flex-1 py-3 rounded-xl font-semibold text-sm"
                  style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)' }}
                >
                  Annulla
                </button>
                <button
                  type="submit"
                  disabled={isMutating}
                  className="flex-1 py-3 rounded-xl font-semibold text-sm"
                  style={{ background: 'linear-gradient(135deg, #F59E0B, #EF4444)', boxShadow: '0 4px 12px rgba(245,158,11,0.35)' }}
                >
                  {isMutating ? 'Salvataggio...' : editingOffer ? 'Salva' : "Crea offerta"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </ShopProtectedLayout>
  )
}
