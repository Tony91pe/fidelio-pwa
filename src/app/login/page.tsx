'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuthStore } from '@/store/authStore'
import { sendOTP, verifyOTP } from '@/lib/api'
import axios from 'axios'
import { FidelioLogo } from '@/components/FidelioLogo/FidelioLogo'

export default function LoginPage() {
  const [step, setStep] = useState<'email' | 'otp'>('email')
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState(['', '', '', '', '', ''])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [resendTimer, setResendTimer] = useState(0)
  const otpRefs = useRef<(HTMLInputElement | null)[]>([])
  const { setAuth, isAuthenticated } = useAuthStore()
  const router = useRouter()

  useEffect(() => {
    if (isAuthenticated) router.replace('/')
  }, [isAuthenticated, router])

  useEffect(() => {
    if (resendTimer > 0) {
      const t = setTimeout(() => setResendTimer((v) => v - 1), 1000)
      return () => clearTimeout(t)
    }
  }, [resendTimer])

  async function handleSendOTP(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (!email.includes('@')) { setError('Inserisci un\'email valida'); return }
    setLoading(true)
    try {
      await sendOTP(email)
      setStep('otp')
      setResendTimer(60)
      setTimeout(() => otpRefs.current[0]?.focus(), 100)
    } catch (err) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.error || 'Errore nell\'invio del codice')
      } else {
        setError('Errore nell\'invio del codice')
      }
    } finally {
      setLoading(false)
    }
  }

  async function handleVerifyOTP(e: React.FormEvent) {
    e.preventDefault()
    const code = otp.join('')
    if (code.length !== 6) { setError('Inserisci il codice completo'); return }
    setError('')
    setLoading(true)
    try {
      const res = await verifyOTP(email, code)
      setAuth(res.data.token, res.data.customer)
      if (res.data.isNewUser) {
        router.replace('/onboarding')
      } else {
        router.replace('/')
      }
    } catch (err) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.error || 'Codice non valido')
      } else {
        setError('Codice non valido')
      }
      setOtp(['', '', '', '', '', ''])
      setTimeout(() => otpRefs.current[0]?.focus(), 100)
    } finally {
      setLoading(false)
    }
  }

  function handleOtpChange(idx: number, val: string) {
    const digit = val.replace(/\D/g, '').slice(-1)
    const next = [...otp]
    next[idx] = digit
    setOtp(next)
    if (digit && idx < 5) otpRefs.current[idx + 1]?.focus()
    if (next.every((d) => d !== '') && next.join('').length === 6) {
      setTimeout(() => {
        const form = document.getElementById('otp-form') as HTMLFormElement
        form?.requestSubmit()
      }, 50)
    }
  }

  function handleOtpKeyDown(idx: number, e: React.KeyboardEvent) {
    if (e.key === 'Backspace' && !otp[idx] && idx > 0) {
      otpRefs.current[idx - 1]?.focus()
    }
  }

  function handleOtpPaste(e: React.ClipboardEvent) {
    const text = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
    if (text.length === 6) {
      setOtp(text.split(''))
      otpRefs.current[5]?.focus()
    }
  }

  return (
    <div className="min-h-dvh flex flex-col" style={{ background: 'radial-gradient(ellipse at top, #1E1040 0%, #0F0F1A 60%)' }}>

      {/* Glow effects */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 rounded-full opacity-15 pointer-events-none" style={{ background: 'radial-gradient(circle, #7C3AED, transparent 70%)', filter: 'blur(50px)' }} />
      <div className="absolute bottom-0 right-0 w-64 h-64 rounded-full opacity-10 pointer-events-none" style={{ background: 'radial-gradient(circle, #3B82F6, transparent 70%)', filter: 'blur(40px)' }} />

      <div className="flex-1 flex flex-col items-center justify-center px-6 py-16">

        {/* Logo */}
        <div className="mb-10 flex justify-center" style={{ animation: 'slideUp 0.5s cubic-bezier(0.16,1,0.3,1) both' }}>
          <FidelioLogo size="md" tagline={true} animate={true} />
        </div>

        <div className="w-full max-w-sm" style={{ animation: 'slideUp 0.5s cubic-bezier(0.16,1,0.3,1) 0.08s both' }}>

          {/* Card */}
          <div
            className="rounded-3xl p-6 mb-6"
            style={{
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.08)',
              backdropFilter: 'blur(20px)',
            }}
          >
            {step === 'email' ? (
              <form onSubmit={handleSendOTP} className="flex flex-col gap-4">
                <div>
                  <h2 className="font-display font-bold text-xl mb-1">Accedi o registrati</h2>
                  <p className="text-sm" style={{ color: 'rgba(255,255,255,0.4)' }}>Ti mandiamo un codice via email, nessuna password.</p>
                </div>
                <input
                  type="email"
                  placeholder="la-tua@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                  autoFocus
                  required
                  style={{
                    background: 'rgba(255,255,255,0.06)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: 12,
                    padding: '12px 16px',
                    color: 'white',
                    fontSize: 16,
                    outline: 'none',
                    width: '100%',
                  }}
                />
                {error && (
                  <p className="text-sm text-center" style={{ color: '#EF4444' }}>{error}</p>
                )}
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
                  {loading ? 'Invio codice...' : 'Continua →'}
                </button>
              </form>
            ) : (
              <form id="otp-form" onSubmit={handleVerifyOTP} className="flex flex-col gap-4">
                <div>
                  <button
                    type="button"
                    onClick={() => { setStep('email'); setOtp(['', '', '', '', '', '']); setError('') }}
                    className="text-sm mb-3 flex items-center gap-1 transition-opacity active:opacity-70"
                    style={{ color: 'rgba(255,255,255,0.4)' }}
                  >
                    ← Cambia email
                  </button>
                  <h2 className="font-display font-bold text-xl mb-1">Controlla l'email</h2>
                  <p className="text-sm" style={{ color: 'rgba(255,255,255,0.4)' }}>
                    Codice inviato a <span className="font-semibold" style={{ color: 'rgba(255,255,255,0.8)' }}>{email}</span>
                  </p>
                </div>

                <div className="flex gap-2 justify-center" onPaste={handleOtpPaste}>
                  {otp.map((digit, idx) => (
                    <input
                      key={idx}
                      ref={(el) => { otpRefs.current[idx] = el }}
                      className="otp-input"
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOtpChange(idx, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                      autoComplete="one-time-code"
                    />
                  ))}
                </div>

                {error && (
                  <p className="text-sm text-center" style={{ color: '#EF4444' }}>{error}</p>
                )}

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
                  {loading ? 'Verifica...' : 'Verifica codice'}
                </button>

                <div className="text-center">
                  {resendTimer > 0 ? (
                    <p className="text-sm" style={{ color: 'rgba(255,255,255,0.25)' }}>Rinvia tra {resendTimer}s</p>
                  ) : (
                    <button
                      type="button"
                      onClick={() => { sendOTP(email); setResendTimer(60) }}
                      className="text-sm font-medium"
                      style={{ color: '#A78BFA' }}
                    >
                      Rinvia codice
                    </button>
                  )}
                </div>
              </form>
            )}
          </div>
        </div>
      </div>

      {/* Bottom link to shop portal */}
      <div className="pb-10 text-center" style={{ animation: 'slideUp 0.5s cubic-bezier(0.16,1,0.3,1) 0.15s both' }}>
        <Link href="/negozio/login">
          <div
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all active:scale-[0.97]"
            style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.15)', color: 'rgba(16,185,129,0.7)' }}
          >
            <span>🏪</span>
            <span>Sei un negozio? Accedi qui</span>
          </div>
        </Link>
      </div>
    </div>
  )
}
