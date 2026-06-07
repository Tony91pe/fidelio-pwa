'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/authStore'
import { updateCustomer } from '@/lib/api'

export default function OnboardingPage() {
  const { customer, token, setAuth } = useAuthStore()
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [birthday, setBirthday] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!token || !customer) return
    const name = `${firstName.trim()} ${lastName.trim()}`.trim()
    setLoading(true)
    try {
      await updateCustomer({ name, birthday: birthday || undefined }, token)
      setAuth(token, { ...customer, name, birthday: birthday || null })
      router.replace('/')
    } catch {
      router.replace('/')
    } finally {
      setLoading(false)
    }
  }

  const inputStyle = {
    background: 'rgba(255,255,255,0.07)',
    border: '1px solid rgba(255,255,255,0.12)',
    borderRadius: 12,
    padding: '12px 16px',
    color: 'white',
    width: '100%',
    outline: 'none',
    fontSize: 16,
  }

  return (
    <div className="min-h-dvh flex flex-col items-center justify-center px-6" style={{ background: 'radial-gradient(ellipse at top, #1E1040 0%, #0F0F1A 60%)' }}>

      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 rounded-full opacity-10 pointer-events-none" style={{ background: 'radial-gradient(circle, #7C3AED, transparent 70%)', filter: 'blur(50px)' }} />

      <div className="w-full max-w-sm" style={{ animation: 'slideUp 0.5s cubic-bezier(0.16,1,0.3,1) both' }}>
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-600 to-blue-500 flex items-center justify-center mx-auto mb-4 text-3xl shadow-lg shadow-violet-500/30">
            👋
          </div>
          <h1 className="font-display font-bold text-2xl mb-1">Benvenuto su Fidelio!</h1>
          <p className="text-sm" style={{ color: 'rgba(255,255,255,0.4)' }}>Completa il profilo per iniziare a raccogliere punti</p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">

          <div className="flex gap-3">
            <div className="flex-1">
              <label className="text-xs font-medium block mb-1.5" style={{ color: 'rgba(255,255,255,0.5)' }}>Nome *</label>
              <input
                type="text"
                value={firstName}
                onChange={e => setFirstName(e.target.value)}
                placeholder="Mario"
                required
                autoFocus
                style={inputStyle}
              />
            </div>
            <div className="flex-1">
              <label className="text-xs font-medium block mb-1.5" style={{ color: 'rgba(255,255,255,0.5)' }}>Cognome *</label>
              <input
                type="text"
                value={lastName}
                onChange={e => setLastName(e.target.value)}
                placeholder="Rossi"
                required
                style={inputStyle}
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-medium block mb-1.5" style={{ color: 'rgba(255,255,255,0.5)' }}>
              Data di nascita * <span style={{ color: '#A78BFA' }}>— ricevi un regalo il giorno del tuo compleanno 🎁</span>
            </label>
            <input
              type="date"
              value={birthday}
              onChange={e => setBirthday(e.target.value)}
              required
              style={{ ...inputStyle, colorScheme: 'dark' }}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-xl font-bold text-sm transition-all active:scale-[0.98] mt-2"
            style={{
              background: loading ? 'rgba(124,58,237,0.5)' : 'linear-gradient(135deg, #7C3AED, #3B82F6)',
              boxShadow: loading ? 'none' : '0 4px 20px rgba(124,58,237,0.4)',
              color: 'white',
            }}
          >
            {loading ? 'Salvataggio...' : 'Inizia a raccogliere punti →'}
          </button>

        </form>
      </div>
    </div>
  )
}
