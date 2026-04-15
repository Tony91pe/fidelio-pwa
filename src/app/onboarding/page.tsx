'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/authStore'
import { updateCustomer } from '@/lib/api'

export default function OnboardingPage() {
  const { customer, token, setAuth } = useAuthStore()
  const [name, setName] = useState(customer?.name ?? '')
  const [birthday, setBirthday] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!token || !customer) return
    setLoading(true)
    try {
      await updateCustomer({ name, birthday }, token)
      setAuth(token, { ...customer, name, birthday })
      router.replace('/')
    } catch {
      router.replace('/')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-dvh flex flex-col items-center justify-center px-6" style={{ background: 'radial-gradient(ellipse at top, #1E1040 0%, #0F0F1A 60%)' }}>
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-brand to-blue-500 flex items-center justify-center mx-auto mb-4">
            <span className="font-display font-black text-2xl">F</span>
          </div>
          <h1 className="font-display font-bold text-2xl mb-1">Benvenuto su Fidelio!</h1>
          <p className="text-white/40 text-sm">Completa il tuo profilo per iniziare</p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="text-sm text-white/60 block mb-1">Come ti chiami? *</label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Il tuo nome"
              required
              style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 12, padding: '12px 16px', color: 'white', width: '100%', outline: 'none', fontSize: 16 }}
            />
          </div>

          <div>
            <label className="text-sm text-white/60 block mb-1">Data di nascita <span style={{ color: 'rgba(255,255,255,0.3)' }}>(per ricevere un regalo!)</span></label>
            <input
              type="date"
              value={birthday}
              onChange={e => setBirthday(e.target.value)}
              style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 12, padding: '12px 16px', color: 'white', width: '100%', outline: 'none', fontSize: 16, colorScheme: 'dark' }}
            />
          </div>

          <button type="submit" disabled={loading} className="btn-primary" style={{ marginTop: 8 }}>
            {loading ? 'Salvataggio...' : 'Inizia →'}
          </button>

          <button type="button" onClick={() => router.replace('/')} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.3)', fontSize: '0.85rem', cursor: 'pointer', textAlign: 'center' }}>
            Salta per ora
          </button>
        </form>
      </div>
    </div>
  )
}
