'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/authStore'
import { checkinShop, getShopById } from '@/lib/api'
import axios from 'axios'

interface ShopInfo {
  id: string
  name: string
  category: string
  city: string
  logo?: string | null
}

export default function SelfCheckinPage() {
  const { shopId } = useParams<{ shopId: string }>()
  const { customer, isAuthenticated } = useAuthStore()
  const router = useRouter()

  const [shop, setShop] = useState<ShopInfo | null>(null)
  const [shopLoading, setShopLoading] = useState(true)
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [points, setPoints] = useState<number | null>(null)
  const [errorMsg, setErrorMsg] = useState('')

  useEffect(() => {
    if (!shopId) return
    getShopById(shopId)
      .then((r) => setShop(r.data))
      .catch(() => setShop(null))
      .finally(() => setShopLoading(false))
  }, [shopId])

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace(`/login?returnUrl=${encodeURIComponent(`/c/${shopId}`)}`)
    }
  }, [isAuthenticated, shopId, router])

  async function handleCheckin() {
    if (!customer || !shopId) return
    setStatus('loading')
    setErrorMsg('')
    try {
      const res = await checkinShop(customer.name, customer.email, shopId)
      setPoints(res.data.points ?? null)
      setStatus('success')
    } catch (err) {
      if (axios.isAxiosError(err)) {
        setErrorMsg(err.response?.data?.error || 'Errore durante il check-in')
      } else {
        setErrorMsg('Errore durante il check-in')
      }
      setStatus('error')
    }
  }

  if (shopLoading || !isAuthenticated) {
    return (
      <div style={{ minHeight: '100dvh', background: '#0F0F1A', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: 40, height: 40, border: '3px solid rgba(167,139,250,0.3)', borderTopColor: '#A78BFA', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
      </div>
    )
  }

  if (!shop) {
    return (
      <div style={{ minHeight: '100dvh', background: '#0F0F1A', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', padding: '2rem', textAlign: 'center' }}>
        <div>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>❌</div>
          <h1 style={{ fontWeight: 700, marginBottom: '0.5rem' }}>Negozio non trovato</h1>
          <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.9rem' }}>Il QR potrebbe essere scaduto o non valido.</p>
          <button onClick={() => router.replace('/')} style={{ marginTop: '1.5rem', background: '#7C3AED', color: 'white', border: 'none', borderRadius: 12, padding: '0.75rem 2rem', fontWeight: 700, cursor: 'pointer' }}>
            Torna alla home
          </button>
        </div>
      </div>
    )
  }

  if (status === 'success') {
    return (
      <div style={{ minHeight: '100dvh', background: '#0F0F1A', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', padding: '2rem' }}>
        <div style={{ textAlign: 'center', maxWidth: 360 }}>
          <div style={{ width: 80, height: 80, borderRadius: 24, background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem', fontSize: '2.5rem' }}>
            ✅
          </div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 800, marginBottom: '0.5rem' }}>Check-in effettuato!</h1>
          <p style={{ color: 'rgba(255,255,255,0.5)', marginBottom: '1.5rem' }}>Sei arrivato da <strong style={{ color: 'white' }}>{shop.name}</strong></p>
          {points !== null && (
            <div style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.25)', borderRadius: 16, padding: '1rem 1.5rem', marginBottom: '1.5rem' }}>
              <p style={{ color: '#10B981', fontWeight: 700, fontSize: '1.1rem' }}>+{points} punti guadagnati!</p>
              <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.8rem', marginTop: '0.25rem' }}>Continua a visitare per sbloccare i premi</p>
            </div>
          )}
          <button
            onClick={() => router.replace('/')}
            style={{ width: '100%', background: 'linear-gradient(135deg, #10B981, #0EA5E9)', color: 'white', border: 'none', borderRadius: 14, padding: '0.9rem', fontWeight: 700, fontSize: '1rem', cursor: 'pointer', boxShadow: '0 8px 24px rgba(16,185,129,0.4)' }}
          >
            Vai alla home
          </button>
        </div>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100dvh', background: '#0F0F1A', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', padding: '2rem' }}>
      <div style={{ textAlign: 'center', maxWidth: 360, width: '100%' }}>
        {/* Shop avatar */}
        <div style={{ width: 80, height: 80, borderRadius: 24, background: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem', fontSize: '2.5rem', overflow: 'hidden' }}>
          {shop.logo
            ? <img src={shop.logo} alt={shop.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            : '🏪'
          }
        </div>

        <p style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.4)', marginBottom: '0.3rem', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Check-in in</p>
        <h1 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: '0.25rem' }}>{shop.name}</h1>
        <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.9rem', marginBottom: '2rem' }}>{shop.city}</p>

        {/* Customer greeting */}
        <div style={{ background: 'rgba(124,58,237,0.08)', border: '1px solid rgba(124,58,237,0.2)', borderRadius: 16, padding: '1rem', marginBottom: '2rem' }}>
          <p style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.6)' }}>
            Ciao <strong style={{ color: '#A78BFA' }}>{customer?.name?.split(' ')[0]}</strong>!<br />
            Stai per fare check-in e guadagnare punti fedeltà.
          </p>
        </div>

        {status === 'error' && (
          <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)', borderRadius: 12, padding: '0.75rem 1rem', marginBottom: '1rem' }}>
            <p style={{ color: '#F87171', fontSize: '0.85rem' }}>{errorMsg}</p>
          </div>
        )}

        <button
          onClick={handleCheckin}
          disabled={status === 'loading'}
          style={{
            width: '100%', padding: '1rem', borderRadius: 14, border: 'none', cursor: status === 'loading' ? 'not-allowed' : 'pointer',
            background: 'linear-gradient(135deg, #10B981, #0EA5E9)',
            color: 'white', fontWeight: 800, fontSize: '1.05rem',
            boxShadow: '0 8px 24px rgba(16,185,129,0.4)',
            opacity: status === 'loading' ? 0.7 : 1,
          }}
        >
          {status === 'loading' ? '⏳ Check-in in corso...' : '✅ Fai check-in'}
        </button>

        <button
          onClick={() => router.replace('/')}
          style={{ marginTop: '1rem', background: 'transparent', border: 'none', color: 'rgba(255,255,255,0.3)', fontSize: '0.85rem', cursor: 'pointer' }}
        >
          Annulla
        </button>
      </div>
    </div>
  )
}
