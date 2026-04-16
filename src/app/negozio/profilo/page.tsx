'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useMutation } from '@tanstack/react-query'
import { ShopProtectedLayout } from '@/components/ShopProtectedLayout'
import { useShopAuthStore } from '@/store/shopAuthStore'
import { updateShopProfile } from '@/lib/api'
import { getCategoryConfig } from '@/lib/categories'
import { CategoryKey } from '@/types'
import axios from 'axios'
import Link from 'next/link'

const CATEGORIES: CategoryKey[] = ['bar', 'ristorante', 'pizzeria', 'parrucchiere', 'estetista', 'palestra', 'negozio', 'farmacia', 'supermercato', 'other']

const POINTS_SYSTEMS = [
  { value: 'per_visit', label: 'Per visita', description: 'Punti fissi per ogni check-in' },
  { value: 'per_euro', label: 'Per spesa €', description: 'Punti in base all\'importo speso' },
  { value: 'combined', label: 'Combinato', description: 'Punti per visita + per spesa' },
]

export default function ShopProfiloPage() {
  const router = useRouter()
  const { shop, shopUser, logout, updateShop } = useShopAuthStore()

  const [editing, setEditing] = useState(false)
  const [formData, setFormData] = useState({
    name: shop?.name || '',
    address: shop?.address || '',
    city: shop?.city || '',
    phone: shop?.phone || '',
    category: shop?.category || 'other',
    rewardThreshold: String(shop?.rewardThreshold || 100),
    rewardDescription: shop?.rewardDescription || '',
    pointsSystem: (shop?.pointsSystem || 'per_visit') as 'per_visit' | 'per_euro' | 'combined',
    pointsPerVisit: String(shop?.pointsPerVisit || 1),
    pointsPerEuro: String(shop?.pointsPerEuro || 1),
    welcomePoints: String(shop?.welcomePoints || 0),
  })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const updateMutation = useMutation({
    mutationFn: () => updateShopProfile({
      name: formData.name,
      address: formData.address,
      city: formData.city,
      phone: formData.phone || undefined,
      category: formData.category,
      rewardThreshold: parseInt(formData.rewardThreshold),
      rewardDescription: formData.rewardDescription,
      pointsSystem: formData.pointsSystem as 'per_visit' | 'per_euro' | 'combined',
      pointsPerVisit: parseInt(formData.pointsPerVisit),
      pointsPerEuro: parseInt(formData.pointsPerEuro),
      welcomePoints: parseInt(formData.welcomePoints),
    }),
    onSuccess: (res) => {
      updateShop(res.data.shop)
      setEditing(false)
      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
      setError('')
    },
    onError: (err) => {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.error || 'Errore nel salvataggio')
      }
    },
  })

  function handleLogout() {
    logout()
    router.replace('/negozio/login')
  }

  const cfg = getCategoryConfig((shop?.category || 'other') as CategoryKey)

  return (
    <ShopProtectedLayout>
      <div className="px-4 pt-8 pb-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6" style={{ animation: 'slideUp 0.4s cubic-bezier(0.16,1,0.3,1) both' }}>
          <h1 className="font-display font-bold text-2xl">Negozio</h1>
          <button
            onClick={() => setEditing((v) => !v)}
            className="px-4 py-2 rounded-xl text-sm font-semibold transition-all"
            style={{
              background: editing ? 'rgba(239,68,68,0.1)' : 'rgba(16,185,129,0.12)',
              border: `1px solid ${editing ? 'rgba(239,68,68,0.2)' : 'rgba(16,185,129,0.25)'}`,
              color: editing ? '#F87171' : '#10B981',
            }}
          >
            {editing ? '✕ Annulla' : '✏️ Modifica'}
          </button>
        </div>

        {success && (
          <div className="rounded-xl px-4 py-3 mb-4 flex items-center gap-2" style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.25)' }}>
            <span>✅</span>
            <p className="text-sm font-medium" style={{ color: '#10B981' }}>Modifiche salvate con successo!</p>
          </div>
        )}

        {/* Shop identity card */}
        <div
          className="relative rounded-3xl p-5 mb-6 overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, #0D3B2A, #071A12)',
            border: '1px solid rgba(16,185,129,0.2)',
            animation: 'slideUp 0.4s cubic-bezier(0.16,1,0.3,1) 0.05s both',
          }}
        >
          <div className="absolute top-0 right-0 w-32 h-32 rounded-full pointer-events-none" style={{ background: 'rgba(16,185,129,0.1)', filter: 'blur(30px)', transform: 'translate(30%,-30%)' }} />
          <div className="flex items-center gap-4">
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0"
              style={{ background: cfg.color + '22', border: `1px solid ${cfg.color}44` }}
            >
              {cfg.emoji}
            </div>
            <div>
              <p className="font-display font-bold text-lg">{shop?.name}</p>
              <p className="text-sm" style={{ color: 'rgba(255,255,255,0.5)' }}>{cfg.label} · {shop?.city}</p>
              <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.3)' }}>{shopUser?.email}</p>
            </div>
          </div>
        </div>

        {editing ? (
          /* Edit Form */
          <form
            onSubmit={(e) => { e.preventDefault(); updateMutation.mutate() }}
            className="flex flex-col gap-4"
            style={{ animation: 'slideUp 0.3s cubic-bezier(0.16,1,0.3,1) both' }}
          >
            <p className="text-xs font-semibold" style={{ color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.07em' }}>
              Informazioni negozio
            </p>

            <div>
              <label className="text-xs font-medium mb-1.5 block" style={{ color: 'rgba(255,255,255,0.5)' }}>Nome negozio</label>
              <input type="text" value={formData.name} onChange={(e) => setFormData((p) => ({ ...p, name: e.target.value }))} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium mb-1.5 block" style={{ color: 'rgba(255,255,255,0.5)' }}>Indirizzo</label>
                <input type="text" value={formData.address} onChange={(e) => setFormData((p) => ({ ...p, address: e.target.value }))} />
              </div>
              <div>
                <label className="text-xs font-medium mb-1.5 block" style={{ color: 'rgba(255,255,255,0.5)' }}>Città</label>
                <input type="text" value={formData.city} onChange={(e) => setFormData((p) => ({ ...p, city: e.target.value }))} />
              </div>
            </div>
            <div>
              <label className="text-xs font-medium mb-1.5 block" style={{ color: 'rgba(255,255,255,0.5)' }}>Telefono (opzionale)</label>
              <input type="tel" value={formData.phone} onChange={(e) => setFormData((p) => ({ ...p, phone: e.target.value }))} />
            </div>

            {/* Category */}
            <div>
              <label className="text-xs font-medium mb-2 block" style={{ color: 'rgba(255,255,255,0.5)' }}>Categoria</label>
              <div className="grid grid-cols-4 gap-2">
                {CATEGORIES.map((cat) => {
                  const c = getCategoryConfig(cat)
                  return (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setFormData((p) => ({ ...p, category: cat }))}
                      className="py-2 rounded-xl text-center text-xs font-medium transition-all"
                      style={{
                        background: formData.category === cat ? c.color + '22' : 'rgba(255,255,255,0.04)',
                        border: `1px solid ${formData.category === cat ? c.color + '55' : 'rgba(255,255,255,0.07)'}`,
                        color: formData.category === cat ? 'white' : 'rgba(255,255,255,0.5)',
                      }}
                    >
                      <div className="text-base mb-0.5">{c.emoji}</div>
                      <div className="text-[9px] truncate">{c.label}</div>
                    </button>
                  )
                })}
              </div>
            </div>

            <div className="h-px" style={{ background: 'rgba(255,255,255,0.06)' }} />

            {/* Points system */}
            <p className="text-xs font-semibold" style={{ color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.07em' }}>
              Sistema punti
            </p>

            <div className="flex flex-col gap-2">
              {POINTS_SYSTEMS.map((ps) => (
                <button
                  key={ps.value}
                  type="button"
                  onClick={() => setFormData((p) => ({ ...p, pointsSystem: ps.value as 'per_visit' | 'per_euro' | 'combined' }))}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl text-left"
                  style={{
                    background: formData.pointsSystem === ps.value ? 'rgba(16,185,129,0.12)' : 'rgba(255,255,255,0.04)',
                    border: `1px solid ${formData.pointsSystem === ps.value ? 'rgba(16,185,129,0.3)' : 'rgba(255,255,255,0.07)'}`,
                  }}
                >
                  <div
                    className="w-4 h-4 rounded-full border-2 flex-shrink-0"
                    style={{ borderColor: formData.pointsSystem === ps.value ? '#10B981' : 'rgba(255,255,255,0.2)', background: formData.pointsSystem === ps.value ? '#10B981' : 'transparent' }}
                  />
                  <div>
                    <p className="text-sm font-semibold">{ps.label}</p>
                    <p className="text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>{ps.description}</p>
                  </div>
                </button>
              ))}
            </div>

            {(formData.pointsSystem === 'per_visit' || formData.pointsSystem === 'combined') && (
              <div>
                <label className="text-xs font-medium mb-1.5 block" style={{ color: 'rgba(255,255,255,0.5)' }}>Punti per visita</label>
                <input type="number" min="1" value={formData.pointsPerVisit} onChange={(e) => setFormData((p) => ({ ...p, pointsPerVisit: e.target.value }))} />
              </div>
            )}
            {(formData.pointsSystem === 'per_euro' || formData.pointsSystem === 'combined') && (
              <div>
                <label className="text-xs font-medium mb-1.5 block" style={{ color: 'rgba(255,255,255,0.5)' }}>Punti per €1 speso</label>
                <input type="number" min="1" value={formData.pointsPerEuro} onChange={(e) => setFormData((p) => ({ ...p, pointsPerEuro: e.target.value }))} />
              </div>
            )}
            <div>
              <label className="text-xs font-medium mb-1.5 block" style={{ color: 'rgba(255,255,255,0.5)' }}>Punti di benvenuto (primo accesso)</label>
              <input type="number" min="0" value={formData.welcomePoints} onChange={(e) => setFormData((p) => ({ ...p, welcomePoints: e.target.value }))} />
            </div>

            <div className="h-px" style={{ background: 'rgba(255,255,255,0.06)' }} />

            <p className="text-xs font-semibold" style={{ color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.07em' }}>
              Premio fedeltà
            </p>
            <div>
              <label className="text-xs font-medium mb-1.5 block" style={{ color: 'rgba(255,255,255,0.5)' }}>Punti per sbloccare il premio</label>
              <input type="number" min="1" value={formData.rewardThreshold} onChange={(e) => setFormData((p) => ({ ...p, rewardThreshold: e.target.value }))} />
            </div>
            <div>
              <label className="text-xs font-medium mb-1.5 block" style={{ color: 'rgba(255,255,255,0.5)' }}>Descrizione premio</label>
              <input type="text" placeholder="es. Caffè gratis, 10% di sconto..." value={formData.rewardDescription} onChange={(e) => setFormData((p) => ({ ...p, rewardDescription: e.target.value }))} />
            </div>

            {error && <p className="text-sm" style={{ color: '#F87171' }}>{error}</p>}

            <button
              type="submit"
              disabled={updateMutation.isPending}
              className="w-full py-4 rounded-2xl font-semibold text-base"
              style={{ background: 'linear-gradient(135deg, #10B981, #0EA5E9)', boxShadow: '0 6px 20px rgba(16,185,129,0.4)' }}
            >
              {updateMutation.isPending ? 'Salvataggio...' : 'Salva modifiche'}
            </button>
          </form>
        ) : (
          /* Read-only view */
          <div className="flex flex-col gap-4" style={{ animation: 'slideUp 0.3s cubic-bezier(0.16,1,0.3,1) both' }}>
            {/* Info sections */}
            {[
              { label: 'Indirizzo', value: `${shop?.address}, ${shop?.city}` },
              { label: 'Telefono', value: shop?.phone || '—' },
              { label: 'Sistema punti', value: POINTS_SYSTEMS.find((p) => p.value === shop?.pointsSystem)?.label || '—' },
              { label: 'Punti per visita', value: shop?.pointsPerVisit ? `${shop.pointsPerVisit} pt` : '—', hide: shop?.pointsSystem === 'per_euro' },
              { label: 'Punti per €1', value: shop?.pointsPerEuro ? `${shop.pointsPerEuro} pt` : '—', hide: shop?.pointsSystem === 'per_visit' },
              { label: 'Punti di benvenuto', value: `${shop?.welcomePoints ?? 0} pt` },
              { label: 'Premio fedeltà', value: `${shop?.rewardThreshold ?? 0} pt → ${shop?.rewardDescription || '—'}` },
            ].filter((i) => !i.hide).map(({ label, value }) => (
              <div key={label} className="flex items-start justify-between py-2" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                <p className="text-sm" style={{ color: 'rgba(255,255,255,0.4)' }}>{label}</p>
                <p className="text-sm font-medium text-right max-w-[55%]">{value}</p>
              </div>
            ))}

            {/* Navigation links */}
            <div className="flex flex-col gap-2 mt-2">
              <Link href="/negozio/premi">
                <div className="flex items-center justify-between px-4 py-3.5 rounded-2xl" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
                  <div className="flex items-center gap-3">
                    <span className="text-lg">🏆</span>
                    <span className="text-sm font-medium">Gestisci premi</span>
                  </div>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="2">
                    <polyline points="9 18 15 12 9 6"/>
                  </svg>
                </div>
              </Link>
              <Link href="/negozio/gift-card">
                <div className="flex items-center justify-between px-4 py-3.5 rounded-2xl" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
                  <div className="flex items-center gap-3">
                    <span className="text-lg">🎁</span>
                    <span className="text-sm font-medium">Gestisci gift card</span>
                  </div>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="2">
                    <polyline points="9 18 15 12 9 6"/>
                  </svg>
                </div>
              </Link>
            </div>

            {/* Logout */}
            <button
              onClick={handleLogout}
              className="w-full py-3.5 rounded-2xl font-semibold text-sm mt-4"
              style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.18)', color: '#F87171' }}
            >
              Esci dal negozio
            </button>
          </div>
        )}
      </div>
    </ShopProtectedLayout>
  )
}
