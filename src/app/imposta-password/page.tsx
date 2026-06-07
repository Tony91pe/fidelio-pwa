'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/authStore'
import { setPassword } from '@/lib/api'
import axios from 'axios'
import { FidelioLogo } from '@/components/FidelioLogo/FidelioLogo'

export default function ImpostaPasswordPage() {
  const [password, setPw] = useState('')
  const [confirm, setConfirm] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const { token, isAuthenticated } = useAuthStore()
  const router = useRouter()

  useEffect(() => {
    if (!isAuthenticated) router.replace('/login')
  }, [isAuthenticated, router])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (password.length < 8) { setError('La password deve essere di almeno 8 caratteri'); return }
    if (password !== confirm) { setError('Le password non corrispondono'); return }
    setLoading(true)
    try {
      await setPassword(password, token!)
      router.replace('/onboarding')
    } catch (err) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.error || 'Errore durante il salvataggio')
      } else {
        setError('Errore durante il salvataggio')
      }
    } finally {
      setLoading(false)
    }
  }

  const inputStyle = {
    background: 'rgba(255,255,255,0.06)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: 12,
    padding: '12px 16px',
    color: 'white',
    fontSize: 16,
    outline: 'none',
    width: '100%',
  }

  return (
    <div className="min-h-dvh flex flex-col items-center justify-center px-6" style={{ background: 'radial-gradient(ellipse at top, #1E1040 0%, #0F0F1A 60%)' }}>
      <div className="mb-10">
        <FidelioLogo size="md" tagline={false} animate={false} />
      </div>

      <div className="w-full max-w-sm">
        <div className="rounded-3xl p-6" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', backdropFilter: 'blur(20px)' }}>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <h2 className="font-display font-bold text-xl mb-1">Crea la tua password</h2>
              <p className="text-sm" style={{ color: 'rgba(255,255,255,0.4)' }}>
                Scegli una password per accedere direttamente la prossima volta.
              </p>
            </div>

            <div style={{ position: 'relative' }}>
              <input
                type={showPw ? 'text' : 'password'}
                placeholder="Password (min. 8 caratteri)"
                value={password}
                onChange={e => setPw(e.target.value)}
                autoComplete="new-password"
                required
                style={{ ...inputStyle, paddingRight: 48 }}
              />
              <button
                type="button"
                onClick={() => setShowPw(v => !v)}
                style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', cursor: 'pointer', fontSize: 18 }}
              >
                {showPw ? '🙈' : '👁️'}
              </button>
            </div>

            <input
              type={showPw ? 'text' : 'password'}
              placeholder="Conferma password"
              value={confirm}
              onChange={e => setConfirm(e.target.value)}
              autoComplete="new-password"
              required
              style={inputStyle}
            />

            {password.length > 0 && (
              <div style={{ display: 'flex', gap: 4 }}>
                {[
                  password.length >= 8,
                  /[A-Z]/.test(password),
                  /[0-9]/.test(password),
                ].map((ok, i) => (
                  <div key={i} style={{ flex: 1, height: 3, borderRadius: 99, background: ok ? '#7C3AED' : 'rgba(255,255,255,0.1)', transition: 'background 0.2s' }} />
                ))}
              </div>
            )}

            {error && <p className="text-sm text-center" style={{ color: '#EF4444' }}>{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl font-bold text-sm transition-all active:scale-[0.98]"
              style={{
                background: loading ? 'rgba(124,58,237,0.5)' : 'linear-gradient(135deg, #7C3AED, #3B82F6)',
                boxShadow: loading ? 'none' : '0 4px 20px rgba(124,58,237,0.4)',
                color: 'white',
              }}
            >
              {loading ? 'Salvataggio...' : 'Continua →'}
            </button>

            <button
              type="button"
              onClick={() => router.replace('/onboarding')}
              className="text-sm text-center"
              style={{ color: 'rgba(255,255,255,0.3)', background: 'none', border: 'none', cursor: 'pointer' }}
            >
              Salta per ora
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
