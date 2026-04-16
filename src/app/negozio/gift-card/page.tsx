'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { ShopProtectedLayout } from '@/components/ShopProtectedLayout'
import { useShopAuthStore } from '@/store/shopAuthStore'
import { getShopGiftCards, createShopGiftCard, useShopGiftCard, deleteShopGiftCard } from '@/lib/api'
import { ShopGiftCard } from '@/types'
import axios from 'axios'

function GiftCardVisual({ card, onUse, onDelete, onShare }: {
  card: ShopGiftCard
  onUse: () => void
  onDelete: () => void
  onShare: () => void
}) {
  const isUsed = !!card.usedAt
  const isPartial = !isUsed && card.remainingValue < card.value
  const pct = Math.round((card.remainingValue / card.value) * 100)

  return (
    <div
      className="rounded-2xl p-4 relative overflow-hidden"
      style={{
        background: isUsed
          ? 'rgba(255,255,255,0.03)'
          : 'linear-gradient(135deg, #0D3B2A 0%, #0A2A1F 100%)',
        border: `1px solid ${isUsed ? 'rgba(255,255,255,0.07)' : 'rgba(16,185,129,0.25)'}`,
        opacity: isUsed ? 0.55 : 1,
      }}
    >
      {!isUsed && (
        <div className="absolute top-0 right-0 w-24 h-24 rounded-full pointer-events-none" style={{ background: 'rgba(16,185,129,0.12)', filter: 'blur(20px)', transform: 'translate(30%,-30%)' }} />
      )}

      <div className="flex items-start justify-between mb-2">
        <div>
          <p className="text-[10px] font-medium mb-0.5" style={{ color: 'rgba(255,255,255,0.4)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
            {isUsed ? 'Gift Card · Esaurita' : isPartial ? 'Gift Card · Parziale' : 'Gift Card'}
          </p>
          <div className="flex items-baseline gap-2">
            <p className="font-display font-black text-2xl" style={{ color: isUsed ? 'rgba(255,255,255,0.3)' : '#10B981' }}>
              €{card.remainingValue.toFixed(2)}
            </p>
            {isPartial && (
              <p className="text-xs" style={{ color: 'rgba(255,255,255,0.3)' }}>
                su €{card.value.toFixed(2)}
              </p>
            )}
          </div>
        </div>
        <div className="flex gap-1.5">
          {!isUsed && (
            <>
              <button
                onClick={onShare}
                className="w-8 h-8 rounded-lg flex items-center justify-center"
                style={{ background: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.25)' }}
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="2.5">
                  <circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/>
                  <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/>
                  <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
                </svg>
              </button>
              <button
                onClick={onUse}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold"
                style={{ background: 'rgba(245,158,11,0.15)', border: '1px solid rgba(245,158,11,0.3)', color: '#F59E0B' }}
              >
                Usa
              </button>
            </>
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

      {/* Barra saldo residuo */}
      {!isUsed && isPartial && (
        <div className="mb-2">
          <div className="h-1 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
            <div className="h-full rounded-full" style={{ width: `${pct}%`, background: 'linear-gradient(90deg, #10B981, #0EA5E9)', transition: 'width 0.6s ease' }} />
          </div>
          <p className="text-[10px] mt-1" style={{ color: 'rgba(255,255,255,0.3)' }}>{pct}% rimanente</p>
        </div>
      )}

      {card.description && (
        <p className="text-xs mb-2" style={{ color: 'rgba(255,255,255,0.45)' }}>{card.description}</p>
      )}

      <div className="flex items-center justify-between">
        <p className="font-mono text-xs" style={{ color: 'rgba(255,255,255,0.3)' }}>{card.code}</p>
        {card.customerName && (
          <p className="text-[10px]" style={{ color: 'rgba(255,255,255,0.3)' }}>👤 {card.customerName}</p>
        )}
      </div>

      {isUsed && (
        <p className="text-[10px] mt-1.5" style={{ color: 'rgba(255,255,255,0.25)' }}>
          Esaurita il {new Date(card.usedAt!).toLocaleDateString('it-IT', { day: '2-digit', month: 'short', year: 'numeric' })}
        </p>
      )}
    </div>
  )
}

export default function ShopGiftCardPage() {
  const queryClient = useQueryClient()
  const { shop } = useShopAuthStore()
  const [showForm, setShowForm] = useState(false)
  const [filter, setFilter] = useState<'all' | 'active' | 'used'>('active')
  const [formData, setFormData] = useState({ value: '', description: '', customerEmail: '' })
  const [formError, setFormError] = useState('')

  // Modal uso parziale
  const [useCard, setUseCard] = useState<ShopGiftCard | null>(null)
  const [useAmount, setUseAmount] = useState('')
  const [useError, setUseError] = useState('')

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
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['shop-gift-cards'] })
      setShowForm(false)
      setFormData({ value: '', description: '', customerEmail: '' })
      setFormError('')
      // Condividi subito dopo la creazione
      const card = res.data
      handleShareCard(card.code, card.value, card.description)
    },
    onError: (err) => {
      if (axios.isAxiosError(err)) setFormError(err.response?.data?.error || 'Errore nella creazione')
    },
  })

  const useMutation2 = useMutation({
    mutationFn: ({ id, amount }: { id: string; amount?: number }) => useShopGiftCard(id, amount),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shop-gift-cards'] })
      setUseCard(null)
      setUseAmount('')
      setUseError('')
    },
    onError: (err) => {
      if (axios.isAxiosError(err)) setUseError(err.response?.data?.error || 'Errore')
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

  function handleUseSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!useCard) return
    setUseError('')
    const amount = useAmount ? parseFloat(useAmount) : undefined
    if (useAmount && (isNaN(parseFloat(useAmount)) || parseFloat(useAmount) <= 0)) {
      setUseError('Inserisci un importo valido')
      return
    }
    useMutation2.mutate({ id: useCard.id, amount })
  }

  function handleShareCard(code: string, value: number, description: string | null) {
    const shopName = shop?.name || 'Fidelio'
    const text = `🎁 Gift Card ${shopName}\nValore: €${value.toFixed(2)}${description ? '\n' + description : ''}\nCodice: ${code}`
    if (navigator.share) {
      navigator.share({ title: `Gift Card ${shopName}`, text }).catch(() => {})
    } else {
      navigator.clipboard.writeText(text).then(() => alert('Testo copiato negli appunti!')).catch(() => {})
    }
  }

  const filteredCards = cards?.filter((c) => {
    if (filter === 'active') return !c.usedAt
    if (filter === 'used') return !!c.usedAt
    return true
  })

  const activeCount = cards?.filter((c) => !c.usedAt).length ?? 0
  const usedCount = cards?.filter((c) => !!c.usedAt).length ?? 0
  const totalRemaining = cards?.filter((c) => !c.usedAt).reduce((s, c) => s + c.remainingValue, 0) ?? 0

  return (
    <ShopProtectedLayout>
      <div className="px-4 pt-8 pb-6">
        <div className="flex items-center justify-between mb-4" style={{ animation: 'slideUp 0.4s cubic-bezier(0.16,1,0.3,1) both' }}>
          <div>
            <h1 className="font-display font-bold text-2xl mb-1">Gift Card</h1>
            <p className="text-sm" style={{ color: 'rgba(255,255,255,0.4)' }}>
              {activeCount} attive · €{totalRemaining.toFixed(2)} in circolazione
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

        <div className="rounded-xl px-4 py-3 mb-5 flex items-center gap-3" style={{ background: 'rgba(16,185,129,0.07)', border: '1px solid rgba(16,185,129,0.15)' }}>
          <span className="text-lg">💡</span>
          <p className="text-xs" style={{ color: 'rgba(255,255,255,0.5)' }}>
            Scansiona da <span className="font-semibold" style={{ color: '#10B981' }}>Scanner → Gift Card</span>, oppure premi <span className="font-semibold" style={{ color: '#F59E0B' }}>Usa</span> per scalare manualmente.
          </p>
        </div>

        <div className="flex rounded-xl p-1 mb-5" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
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

        {isLoading ? (
          <div className="flex flex-col gap-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="rounded-2xl h-28 animate-pulse" style={{ background: 'rgba(255,255,255,0.03)' }} />
            ))}
          </div>
        ) : !filteredCards?.length ? (
          <div className="rounded-2xl p-8 text-center" style={{ background: 'rgba(255,255,255,0.02)', border: '1px dashed rgba(255,255,255,0.08)' }}>
            <div className="text-4xl mb-3">🎁</div>
            <p className="font-semibold text-sm mb-1">
              {filter === 'active' ? 'Nessuna gift card attiva' : filter === 'used' ? 'Nessuna gift card usata' : 'Nessuna gift card'}
            </p>
            {filter === 'active' && (
              <button onClick={() => setShowForm(true)} className="mt-3 px-6 py-2.5 rounded-xl font-semibold text-sm" style={{ background: 'linear-gradient(135deg, #10B981, #0EA5E9)' }}>
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
                onUse={() => { setUseCard(card); setUseAmount(''); setUseError('') }}
                onDelete={() => { if (confirm('Eliminare questa gift card?')) deleteMutation.mutate(card.id) }}
                onShare={() => handleShareCard(card.code, card.value, card.description)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Modal crea */}
      {showForm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)' }}
          onClick={() => setShowForm(false)}
        >
          <div
            className="w-full max-w-sm rounded-3xl p-6 overflow-y-auto"
            style={{ background: '#0D1F17', border: '1px solid rgba(16,185,129,0.2)', maxHeight: '90vh', animation: 'slideUp 0.3s cubic-bezier(0.16,1,0.3,1) both' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display font-bold text-lg">Crea gift card</h2>
              <button onClick={() => setShowForm(false)} className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.08)' }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>
            <form onSubmit={handleCreate} className="flex flex-col gap-3">
              <div>
                <label className="text-xs font-medium mb-1.5 block" style={{ color: 'rgba(255,255,255,0.5)' }}>Valore (€) *</label>
                <input type="number" inputMode="decimal" placeholder="es. 50.00" value={formData.value}
                  onChange={(e) => setFormData((p) => ({ ...p, value: e.target.value }))}
                  min="0.01" step="0.01" autoFocus />
              </div>
              <div>
                <label className="text-xs font-medium mb-1.5 block" style={{ color: 'rgba(255,255,255,0.5)' }}>Descrizione (opzionale)</label>
                <input type="text" placeholder="es. Regalo di compleanno" value={formData.description}
                  onChange={(e) => setFormData((p) => ({ ...p, description: e.target.value }))} />
              </div>
              <div>
                <label className="text-xs font-medium mb-1.5 block" style={{ color: 'rgba(255,255,255,0.5)' }}>Email cliente (opzionale)</label>
                <input type="email" placeholder="cliente@email.com" value={formData.customerEmail}
                  onChange={(e) => setFormData((p) => ({ ...p, customerEmail: e.target.value }))} />
              </div>
              {formError && <p className="text-sm" style={{ color: '#F87171' }}>{formError}</p>}
              <p className="text-[11px] text-center" style={{ color: 'rgba(255,255,255,0.3)' }}>
                Dopo la creazione potrai condividere il codice via WhatsApp o altri canali
              </p>
              <div className="flex gap-3 mt-1">
                <button type="button" onClick={() => setShowForm(false)} className="flex-1 py-3 rounded-xl font-semibold text-sm" style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)' }}>
                  Annulla
                </button>
                <button type="submit" disabled={createMutation.isPending} className="flex-1 py-3 rounded-xl font-semibold text-sm" style={{ background: 'linear-gradient(135deg, #10B981, #0EA5E9)', boxShadow: '0 4px 12px rgba(16,185,129,0.4)' }}>
                  {createMutation.isPending ? 'Creazione...' : 'Crea e condividi'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal usa parziale */}
      {useCard && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)' }}
          onClick={() => setUseCard(null)}
        >
          <div
            className="w-full max-w-sm rounded-3xl p-6"
            style={{ background: '#0D1F17', border: '1px solid rgba(245,158,11,0.25)', animation: 'slideUp 0.3s cubic-bezier(0.16,1,0.3,1) both' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-1">
              <h2 className="font-display font-bold text-lg">Usa gift card</h2>
              <button onClick={() => setUseCard(null)} className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.08)' }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>

            <div className="rounded-xl px-4 py-3 mb-4 mt-3" style={{ background: 'rgba(16,185,129,0.07)', border: '1px solid rgba(16,185,129,0.15)' }}>
              <p className="text-xs mb-0.5" style={{ color: 'rgba(255,255,255,0.4)' }}>Saldo disponibile</p>
              <p className="font-display font-black text-2xl" style={{ color: '#10B981' }}>€{useCard.remainingValue.toFixed(2)}</p>
              <p className="font-mono text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.25)' }}>{useCard.code}</p>
            </div>

            <form onSubmit={handleUseSubmit} className="flex flex-col gap-3">
              <div>
                <label className="text-xs font-medium mb-1.5 block" style={{ color: 'rgba(255,255,255,0.5)' }}>
                  Importo da scalare (€)
                </label>
                <input
                  type="number"
                  inputMode="decimal"
                  placeholder={`Max €${useCard.remainingValue.toFixed(2)}`}
                  value={useAmount}
                  onChange={(e) => setUseAmount(e.target.value)}
                  min="0.01"
                  max={useCard.remainingValue}
                  step="0.01"
                  autoFocus
                />
                <p className="text-[11px] mt-1.5" style={{ color: 'rgba(255,255,255,0.3)' }}>
                  Lascia vuoto per usare tutto il saldo (€{useCard.remainingValue.toFixed(2)})
                </p>
              </div>
              {useError && <p className="text-sm" style={{ color: '#F87171' }}>{useError}</p>}
              <div className="flex gap-3 mt-1">
                <button type="button" onClick={() => setUseCard(null)} className="flex-1 py-3 rounded-xl font-semibold text-sm" style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)' }}>
                  Annulla
                </button>
                <button type="submit" disabled={useMutation2.isPending} className="flex-1 py-3 rounded-xl font-semibold text-sm" style={{ background: 'linear-gradient(135deg, #F59E0B, #EF4444)', boxShadow: '0 4px 12px rgba(245,158,11,0.3)' }}>
                  {useMutation2.isPending ? 'Scalando...' : useAmount ? `Scala €${parseFloat(useAmount || '0').toFixed(2)}` : 'Usa tutto'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </ShopProtectedLayout>
  )
}
