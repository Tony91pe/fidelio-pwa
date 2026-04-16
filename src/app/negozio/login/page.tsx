'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useShopAuthStore } from '@/store/shopAuthStore'
import { shopSendOTP, shopVerifyOTP } from '@/lib/api'
import axios from 'axios'

export default function ShopLoginPage() {
  const [step, setStep] = useState<'email' | 'otp'>('email')
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState(['', '', '', '', '', ''])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [resendTimer, setResendTimer] = useState(0)
  const otpRefs = useRef<(HTMLInputElement | null)[]>([])
  const { setAuth, isAuthenticated } = useShopAuthStore()
  const router = useRouter()

  useEffect(() => {
    if (isAuthenticated) router.replace('/negozio')
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
    if (!email.includes('@')) { setError("Inserisci un'email valida"); return }
    setLoading(true)
    try {
      await shopSendOTP(email)
      setStep('otp')
      setResendTimer(60)
      setTimeout(() => otpRefs.current[0]?.focus(), 100)
    } catch (err) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.error || "Errore nell'invio del codice")
      } else {
        setError("Errore nell'invio del codice")
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
      const res = await shopVerifyOTP(email, code)
      setAuth(res.data.token, res.data.shopUser, res.data.shop)
      router.replace('/negozio')
    } catch (err) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.error || 'Codice non valido o account non autorizzato')
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
    <div className="min-h-dvh flex flex-col" style={{ background: 'radial-gradient(ellipse at top, #0D2B1F 0%, #0A140F 60%)' }}>
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-80 h-80 rounded-full opacity-20 pointer-events-none" style={{ background: 'radial-gradient(circle, #10B981, transparent 70%)', filter: 'blur(40px)' }} />

      <div className="flex-1 flex flex-col items-center justify-center px-6 py-16">
        {/* Logo */}
        <div className="mb-10 text-center">
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
            style={{ background: 'linear-gradient(135deg, #10B981, #0EA5E9)', boxShadow: '0 8px 32px rgba(16,185,129,0.4)' }}
          >
            <span className="text-3xl">🏪</span>
          </div>
          <h1 className="font-display font-black text-3xl">Fidelio</h1>
          <p className="text-sm mt-1" style={{ color: 'rgba(255,255,255,0.4)' }}>Portale Negozio</p>
        </div>

        <div className="w-full max-w-sm">
          {step === 'email' ? (
            <form onSubmit={handleSendOTP} className="flex flex-col gap-4">
              <div>
                <h2 className="font-display font-bold text-xl mb-1">Accedi al tuo negozio</h2>
                <p className="text-sm" style={{ color: 'rgba(255,255,255,0.4)' }}>
                  Inserisci l&apos;email associata al tuo account negozio.
                </p>
              </div>
              <input
                type="email"
                placeholder="negozio@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                autoFocus
                required
                style={{ borderColor: 'rgba(16,185,129,0.3)' }}
              />
              {error && <p className="text-danger text-sm text-center">{error}</p>}
              <button
                className="w-full py-3.5 rounded-xl font-semibold text-sm transition-all active:scale-95"
                type="submit"
                disabled={loading}
                style={{ background: 'linear-gradient(135deg, #10B981, #0EA5E9)', boxShadow: '0 4px 16px rgba(16,185,129,0.4)' }}
              >
                {loading ? 'Invio codice...' : 'Continua →'}
              </button>

              <div className="text-center mt-2">
                <a href="/login" className="text-xs" style={{ color: 'rgba(255,255,255,0.3)' }}>
                  Sei un cliente? Accedi qui
                </a>
              </div>
            </form>
          ) : (
            <form id="otp-form" onSubmit={handleVerifyOTP} className="flex flex-col gap-4">
              <div>
                <button
                  type="button"
                  onClick={() => { setStep('email'); setOtp(['', '', '', '', '', '']); setError('') }}
                  className="text-sm mb-4 flex items-center gap-1"
                  style={{ color: 'rgba(255,255,255,0.4)' }}
                >
                  ← Cambia email
                </button>
                <h2 className="font-display font-bold text-xl mb-1">Controlla l&apos;email</h2>
                <p className="text-sm" style={{ color: 'rgba(255,255,255,0.4)' }}>
                  Codice inviato a <span className="text-white font-medium">{email}</span>
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

              {error && <p className="text-danger text-sm text-center">{error}</p>}

              <button
                className="w-full py-3.5 rounded-xl font-semibold text-sm transition-all active:scale-95"
                type="submit"
                disabled={loading}
                style={{ background: 'linear-gradient(135deg, #10B981, #0EA5E9)', boxShadow: '0 4px 16px rgba(16,185,129,0.4)' }}
              >
                {loading ? 'Verifica...' : 'Verifica codice'}
              </button>

              <div className="text-center">
                {resendTimer > 0 ? (
                  <p className="text-sm" style={{ color: 'rgba(255,255,255,0.3)' }}>Rinvia tra {resendTimer}s</p>
                ) : (
                  <button
                    type="button"
                    onClick={() => { shopSendOTP(email); setResendTimer(60) }}
                    className="text-sm font-medium"
                    style={{ color: '#10B981' }}
                  >
                    Rinvia codice
                  </button>
                )}
              </div>
            </form>
          )}
        </div>
      </div>

      <div className="pb-10 text-center">
        <Link href="/login" className="text-xs transition-colors" style={{ color: 'rgba(255,255,255,0.3)' }}>
          ← Torna al login clienti
        </Link>
      </div>
    </div>
  )
}
