'use client'

import { useState } from 'react'
import { useAuthStore } from '@/store/authStore'
import { ProtectedLayout } from '@/components/ProtectedLayout'
import { useRouter } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { getShops, updateCustomer, deleteAccount, exportMyData } from '@/lib/api'
import { CustomerShop } from '@/types'
import { usePushNotifications } from '@/hooks/usePushNotifications'
import Link from 'next/link'

function getTier(visits: number) {
  if (visits >= 50) return { label: 'Platino', color: '#E2E8F0', bg: 'rgba(226,232,240,0.1)', emoji: '💎' }
  if (visits >= 25) return { label: 'Oro',     color: '#FBBF24', bg: 'rgba(251,191,36,0.1)',  emoji: '🏆' }
  if (visits >= 10) return { label: 'Argento', color: '#94A3B8', bg: 'rgba(148,163,184,0.1)', emoji: '⭐' }
  if (visits >= 3)  return { label: 'Bronzo',  color: '#CD7C2F', bg: 'rgba(205,124,47,0.1)',  emoji: '🎖️' }
  return { label: 'Nuovo', color: '#A78BFA', bg: 'rgba(167,139,250,0.1)', emoji: '✨' }
}

const ChevronRight = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="9 18 15 12 9 6"/>
  </svg>
)

export default function ProfiloPage() {
  const { customer, logout } = useAuthStore()
  const router = useRouter()
  const { subscribed, subscribe, unsubscribe, loading, error, permission } = usePushNotifications()
  const [editOpen, setEditOpen] = useState(false)
  const [editName, setEditName] = useState(customer?.name || '')
  const [editBirthday, setEditBirthday] = useState(customer?.birthday?.split('T')[0] || '')
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState('')
  const [saveSuccess, setSaveSuccess] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState('')
  const [exporting, setExporting] = useState(false)

  async function handleExportData() {
    setExporting(true)
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('fidelio_token') || '' : ''
      const res = await exportMyData(token)
      const url = URL.createObjectURL(new Blob([res.data], { type: 'application/json' }))
      const a = document.createElement('a')
      a.href = url
      a.download = `fidelio-dati-personali-${new Date().toISOString().slice(0, 10)}.json`
      a.click()
      URL.revokeObjectURL(url)
    } catch {
      // silently fail
    } finally {
      setExporting(false)
    }
  }

  async function handleDeleteAccount() {
    setDeleting(true)
    setDeleteError('')
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('fidelio_token') || '' : ''
      await deleteAccount(token)
      logout()
      router.replace('/login')
    } catch {
      setDeleteError('Errore durante la cancellazione. Riprova o contatta il supporto.')
      setDeleting(false)
    }
  }

  async function handleSaveProfile(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setSaveError('')
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('fidelio_token') || '' : ''
      await updateCustomer({ name: editName || undefined, birthday: editBirthday || undefined }, token)
      setSaveSuccess(true)
      setEditOpen(false)
      setTimeout(() => setSaveSuccess(false), 3000)
    } catch {
      setSaveError('Errore nel salvataggio. Riprova.')
    } finally {
      setSaving(false)
    }
  }

  const { data: shops = [] } = useQuery({
    queryKey: ['customer-shops', customer?.email],
    queryFn: () => getShops(),
    enabled: !!customer?.email,
    select: (res) => res.data as CustomerShop[],
  })

  const totalPoints = shops.reduce((s, sh) => s + sh.points, 0)
  const totalVisits = shops.reduce((s, sh) => s + sh.totalVisits, 0)
  const firstName = customer?.name?.split(' ')[0] || 'Cliente'
  const tier = getTier(totalVisits)

  function handleLogout() {
    logout()
    router.replace('/login')
  }

  const menuSections = [
    {
      title: 'Attività',
      items: [
        { label: 'Le mie carte fedeltà', icon: '🃏', href: '/',         color: '#A78BFA' },
        { label: 'I miei premi',         icon: '🏆', href: '/premi',    color: '#FBBF24' },
        { label: 'Storico visite',       icon: '📋', href: '/storico',  color: '#10B981' },
        { label: 'Offerte & Promo',      icon: '🔥', href: '/offerte',  color: '#F59E0B' },
        { label: 'Scopri negozi',        icon: '🗺️', href: '/scopri',   color: '#60A5FA' },
      ],
    },
  ]

  return (
    <ProtectedLayout>
      <div className="pb-10">

        {/* Hero */}
        <div
          className="relative overflow-hidden px-5 pt-14 pb-8"
          style={{ background: 'linear-gradient(180deg, rgba(109,40,217,0.2) 0%, transparent 100%)' }}
        >
          <div className="absolute top-0 left-0 right-0 h-52 pointer-events-none" style={{ background: 'radial-gradient(ellipse 80% 60% at 50% 0%, rgba(124,58,237,0.2) 0%, transparent 100%)' }} />

          <div className="flex flex-col items-center text-center relative">
            {/* Avatar */}
            <div className="relative mb-4">
              <div
                className="w-24 h-24 rounded-3xl flex items-center justify-center font-display font-black text-4xl"
                style={{
                  background: 'linear-gradient(135deg, #7C3AED, #3B82F6)',
                  boxShadow: '0 12px 40px rgba(124,58,237,0.5), 0 0 0 1px rgba(255,255,255,0.08)',
                }}
              >
                {firstName[0]?.toUpperCase()}
              </div>
              {/* Tier badge */}
              <div
                className="absolute -bottom-2 -right-2 w-9 h-9 rounded-xl flex items-center justify-center text-lg"
                style={{ background: '#0F0F1A', border: `2px solid ${tier.color}40`, boxShadow: `0 0 12px ${tier.color}30` }}
              >
                {tier.emoji}
              </div>
            </div>

            {/* Name + email */}
            <h1 className="font-display font-bold text-2xl leading-tight mb-0.5">{customer?.name}</h1>
            <p className="text-sm mb-1" style={{ color: 'rgba(255,255,255,0.35)' }}>{customer?.email}</p>
            <button
              onClick={() => { setEditName(customer?.name || ''); setEditBirthday(customer?.birthday?.split('T')[0] || ''); setEditOpen(true) }}
              className="text-xs font-semibold px-3 py-1 rounded-full mb-3"
              style={{ background: 'rgba(167,139,250,0.12)', border: '1px solid rgba(167,139,250,0.22)', color: '#A78BFA' }}
            >
              ✏️ Modifica profilo
            </button>

            {/* Tier badge */}
            <span
              className="text-xs font-bold px-4 py-1.5 rounded-full mb-6"
              style={{ background: tier.bg, color: tier.color, border: `1px solid ${tier.color}30` }}
            >
              {tier.emoji} {tier.label}
            </span>

            {/* Stats row */}
            <div
              className="flex items-center gap-0 w-full rounded-2xl overflow-hidden"
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}
            >
              {[
                { label: 'Punti',  value: totalPoints,   color: '#A78BFA' },
                { label: 'Visite', value: totalVisits,   color: '#60A5FA' },
                { label: 'Negozi', value: shops.length,  color: '#F0ABFC' },
              ].map((stat, i, arr) => (
                <div
                  key={stat.label}
                  className="flex-1 py-4 text-center"
                  style={{ borderRight: i < arr.length - 1 ? '1px solid rgba(255,255,255,0.06)' : 'none' }}
                >
                  <p className="font-display font-black text-2xl leading-none" style={{ color: stat.color }}>{stat.value}</p>
                  <p className="text-[10px] mt-1.5 font-semibold tracking-widest uppercase" style={{ color: 'rgba(255,255,255,0.28)' }}>{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Codice Fidelio */}
        <div className="px-5 mb-5">
          <div
            className="rounded-2xl px-4 py-3.5 flex items-center justify-between"
            style={{ background: 'rgba(124,58,237,0.08)', border: '1px solid rgba(124,58,237,0.2)' }}
          >
            <div>
              <p className="text-[10px] tracking-widest uppercase font-semibold mb-0.5" style={{ color: 'rgba(167,139,250,0.6)' }}>Il tuo codice Fidelio</p>
              <p className="font-mono font-bold text-xl tracking-[0.2em] text-white">{customer?.code}</p>
            </div>
            <div className="text-2xl opacity-70">🪪</div>
          </div>
        </div>

        {/* Menu sezioni */}
        {menuSections.map(section => (
          <div key={section.title} className="px-5 mb-5">
            <p className="text-[10px] font-bold tracking-[0.2em] uppercase mb-3" style={{ color: 'rgba(255,255,255,0.25)' }}>{section.title}</p>
            <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid rgba(255,255,255,0.07)' }}>
              {section.items.map((item, i) => (
                <Link key={item.href} href={item.href}>
                  <div
                    className="flex items-center gap-3.5 px-4 py-3.5 active:bg-white/5 transition-colors"
                    style={{
                      background: 'rgba(255,255,255,0.025)',
                      borderBottom: i < section.items.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none',
                    }}
                  >
                    <div
                      className="w-9 h-9 rounded-xl flex items-center justify-center text-base flex-shrink-0"
                      style={{ background: item.color + '14', border: `1px solid ${item.color}22` }}
                    >
                      {item.icon}
                    </div>
                    <span className="font-semibold text-sm flex-1 text-white">{item.label}</span>
                    <ChevronRight />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        ))}

        {/* Impostazioni */}
        <div className="px-5 mb-6">
          <p className="text-[10px] font-bold tracking-[0.2em] uppercase mb-3" style={{ color: 'rgba(255,255,255,0.25)' }}>Impostazioni</p>
          <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid rgba(255,255,255,0.07)', background: 'rgba(255,255,255,0.025)' }}>
            <div className="flex items-center gap-3.5 px-4 py-3.5">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center text-base flex-shrink-0" style={{ background: 'rgba(124,58,237,0.12)', border: '1px solid rgba(124,58,237,0.18)' }}>
                🔔
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm text-white">Notifiche push</p>
                <p className="text-xs mt-0.5 truncate" style={{ color: 'rgba(255,255,255,0.3)' }}>
                  {subscribed ? 'Attive' : permission === 'denied' ? 'Bloccate dal browser' : 'Disattivate'}
                </p>
                {error && <p className="text-xs mt-0.5" style={{ color: '#EF4444' }}>{error}</p>}
              </div>
              {permission === 'denied' ? (
                <span className="text-xs font-semibold px-3 py-1.5 rounded-xl flex-shrink-0" style={{ background: 'rgba(239,68,68,0.1)', color: '#EF4444' }}>Bloccate</span>
              ) : subscribed ? (
                <button onClick={unsubscribe} disabled={loading} className="text-xs font-semibold px-3 py-1.5 rounded-xl flex-shrink-0" style={{ background: 'rgba(239,68,68,0.1)', color: '#EF4444', opacity: loading ? 0.5 : 1 }}>
                  {loading ? '…' : 'Disattiva'}
                </button>
              ) : (
                <button onClick={subscribe} disabled={loading} className="text-xs font-semibold px-3 py-1.5 rounded-xl flex-shrink-0" style={{ background: 'rgba(124,58,237,0.18)', color: '#A78BFA', opacity: loading ? 0.5 : 1 }}>
                  {loading ? '…' : 'Attiva'}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Logout + Elimina */}
        <div className="px-5">
          <button
            onClick={handleLogout}
            className="w-full py-4 rounded-2xl font-bold text-sm active:scale-[0.98] transition-transform"
            style={{ background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.12)', color: '#F87171' }}
          >
            Esci dall&apos;account
          </button>
          <button
            onClick={handleExportData}
            disabled={exporting}
            className="w-full py-3 mt-3 rounded-2xl text-xs font-medium"
            style={{ background: 'transparent', border: 'none', color: 'rgba(255,255,255,0.25)', opacity: exporting ? 0.5 : 1 }}
          >
            {exporting ? 'Preparazione file...' : '⬇️ Scarica i miei dati (GDPR)'}
          </button>
          <button
            onClick={() => setDeleteOpen(true)}
            className="w-full py-2 rounded-2xl text-xs font-medium"
            style={{ background: 'transparent', border: 'none', color: 'rgba(255,255,255,0.15)' }}
          >
            Elimina account e dati personali
          </button>
          <p className="text-center text-xs mt-2" style={{ color: 'rgba(255,255,255,0.1)', letterSpacing: '0.05em' }}>Fidelio · Made with ♥ in Italy</p>
        </div>
      </div>

      {/* Modale conferma eliminazione account */}
      {deleteOpen && (
        <div
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', zIndex: 50, display: 'flex', alignItems: 'flex-end', backdropFilter: 'blur(4px)' }}
          onClick={(e) => { if (e.target === e.currentTarget) setDeleteOpen(false) }}
        >
          <div style={{ width: '100%', background: '#1A1A2E', borderRadius: '24px 24px 0 0', padding: '1.5rem', paddingBottom: 'calc(1.5rem + env(safe-area-inset-bottom))', border: '1px solid rgba(255,255,255,0.08)' }}>
            <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>⚠️</div>
              <h2 style={{ fontWeight: 800, fontSize: '1.1rem', marginBottom: '0.5rem' }}>Elimina account</h2>
              <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.85rem', lineHeight: '1.6' }}>
                Questa azione è <strong style={{ color: '#F87171' }}>irreversibile</strong>. Verranno eliminati tutti i tuoi punti, lo storico visite e i dati personali da tutti i negozi Fidelio.
              </p>
            </div>
            {deleteError && (
              <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)', borderRadius: 12, padding: '0.75rem', marginBottom: '1rem' }}>
                <p style={{ color: '#F87171', fontSize: '0.85rem', textAlign: 'center' }}>{deleteError}</p>
              </div>
            )}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <button
                onClick={handleDeleteAccount}
                disabled={deleting}
                style={{ width: '100%', padding: '0.9rem', borderRadius: 14, border: 'none', cursor: 'pointer', background: 'rgba(239,68,68,0.85)', color: 'white', fontWeight: 700, fontSize: '0.95rem', opacity: deleting ? 0.6 : 1 }}
              >
                {deleting ? 'Eliminazione in corso...' : 'Sì, elimina il mio account'}
              </button>
              <button
                onClick={() => { setDeleteOpen(false); setDeleteError('') }}
                disabled={deleting}
                style={{ width: '100%', padding: '0.9rem', borderRadius: 14, border: '1px solid rgba(255,255,255,0.1)', background: 'transparent', color: 'rgba(255,255,255,0.5)', fontWeight: 600, fontSize: '0.9rem', cursor: 'pointer' }}
              >
                Annulla
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Save success toast */}
      {saveSuccess && (
        <div
          style={{
            position: 'fixed', bottom: '6rem', left: '50%', transform: 'translateX(-50%)',
            background: 'rgba(16,185,129,0.9)', color: 'white', padding: '0.75rem 1.5rem',
            borderRadius: 12, fontWeight: 600, fontSize: '0.9rem', zIndex: 100,
            backdropFilter: 'blur(12px)', boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
          }}
        >
          ✅ Profilo aggiornato!
        </div>
      )}

      {/* Edit profile modal */}
      {editOpen && (
        <div
          style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 50,
            display: 'flex', alignItems: 'flex-end', backdropFilter: 'blur(4px)',
          }}
          onClick={(e) => { if (e.target === e.currentTarget) setEditOpen(false) }}
        >
          <div
            style={{
              width: '100%', background: '#1A1A2E', borderRadius: '24px 24px 0 0',
              padding: '1.5rem', paddingBottom: 'calc(1.5rem + env(safe-area-inset-bottom))',
              border: '1px solid rgba(255,255,255,0.08)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
              <h2 style={{ fontWeight: 700, fontSize: '1.1rem' }}>Modifica profilo</h2>
              <button
                onClick={() => setEditOpen(false)}
                style={{ width: 32, height: 32, borderRadius: 10, background: 'rgba(255,255,255,0.07)', border: 'none', color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveProfile} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.45)', display: 'block', marginBottom: '0.4rem', fontWeight: 500 }}>
                  Nome e cognome
                </label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  placeholder="Il tuo nome completo"
                  required
                />
              </div>
              <div>
                <label style={{ fontSize: '0.75rem', color: 'rgba(167,139,250,0.8)', display: 'block', marginBottom: '0.4rem', fontWeight: 600 }}>
                  🎂 Data di nascita
                </label>
                <input
                  type="date"
                  value={editBirthday}
                  onChange={(e) => setEditBirthday(e.target.value)}
                />
                <p style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.25)', marginTop: '0.35rem' }}>
                  Riceverai un regalo a sorpresa nel giorno del tuo compleanno 🎁
                </p>
              </div>

              {saveError && (
                <p style={{ color: '#F87171', fontSize: '0.85rem' }}>{saveError}</p>
              )}

              <button
                type="submit"
                disabled={saving}
                style={{
                  width: '100%', padding: '0.9rem', borderRadius: 14, border: 'none', cursor: 'pointer',
                  background: 'linear-gradient(135deg, #7C3AED, #3B82F6)',
                  color: 'white', fontWeight: 700, fontSize: '1rem',
                  boxShadow: '0 6px 20px rgba(124,58,237,0.4)',
                  opacity: saving ? 0.7 : 1,
                }}
              >
                {saving ? 'Salvataggio...' : 'Salva modifiche'}
              </button>
            </form>
          </div>
        </div>
      )}
    </ProtectedLayout>
  )
}
