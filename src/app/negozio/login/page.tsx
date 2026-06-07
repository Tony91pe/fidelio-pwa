'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useShopAuthStore } from '@/store/shopAuthStore'
import { shopSendOTP, shopVerifyOTP, shopRegister } from '@/lib/api'
import axios from 'axios'
import { FidelioLogo } from '@/components/FidelioLogo/FidelioLogo'

const CATEGORIES = [
  { value: 'bar', label: '☕ Bar' },
  { value: 'ristorante', label: '🍽️ Ristorante' },
  { value: 'pizzeria', label: '🍕 Pizzeria' },
  { value: 'parrucchiere', label: '✂️ Parrucchiere' },
  { value: 'estetista', label: '💅 Estetista' },
  { value: 'palestra', label: '💪 Palestra' },
  { value: 'farmacia', label: '💊 Farmacia' },
  { value: 'negozio', label: '🛍️ Negozio' },
  { value: 'supermercato', label: '🛒 Supermercato' },
  { value: 'other', label: '⭐ Altro' },
]

export default function ShopLoginPage() {
  const [mode, setMode] = useState<'login' | 'register'>('login')
  const [step, setStep] = useState<'form' | 'otp'>('form')
  const [email, setEmail] = useState('')
  const [shopName, setShopName] = useState('')
  const [category, setCategory] = useState('')
  const [city, setCity] = useState('')
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

  function switchMode(m: 'login' | 'register') {
    setMode(m)
    setStep('form')
    setError('')
    setOtp(['', '', '', '', '', ''])
  }

  async function handleLogin(e: React.FormEvent) {
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

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (!email.includes('@')) { setError("Inserisci un'email valida"); return }
    if (!shopName.trim()) { setError('Inserisci il nome del negozio'); return }
    if (!category) { setError('Seleziona una categoria'); return }
    if (!city.trim()) { setError('Inserisci la città'); return }
    setLoading(true)
    try {
      await shopRegister({ email, shopName: shopName.trim(), category, city: city.trim() })
      setStep('otp')
      setResendTimer(60)
      setTimeout(() => otpRefs.current[0]?.focus(), 100)
    } catch (err) {
      if (axios.isAxiosError(err)) {
        const data = err.response?.data
        if (data?.alreadyExists) {
          setError('Email già registrata. Usa il login.')
          switchMode('login')
        } else {
          setError(data?.error || 'Errore nella registrazione')
        }
      } else {
        setError('Errore nella registrazione')
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

  async function resend() {
    try {
      if (mode === 'login') await shopSendOTP(email)
      else await shopRegister({ email, shopName, category, city })
      setResendTimer(60)
    } catch {}
  }

  const inputStyle = {
    background: 'rgba(255,255,255,0.06)',
    border: '1px solid rgba(16,185,129,0.25)',
    borderRadius: 12,
    padding: '12px 16px',
    color: 'white',
    fontSize: 16,
    outline: 'none',
    width: '100%',
  }

  const selectStyle = {
    ...inputStyle,
    appearance: 'none' as const,
    cursor: 'pointer',
  }

  return (
    <div className="min-h-dvh flex flex-col" style={{ background: 'radial-gradient(ellipse at top, #0D2B1F 0%, #0A140F 60%)' }}>
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-80 h-80 rounded-full opacity-20 pointer-events-none" style={{ background: 'radial-gradient(circle, #10B981, transparent 70%)', filter: 'blur(40px)' }} />

      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12">
        <div className="mb-8 flex justify-center">
          <FidelioLogo size="md" tagline={true} animate={true} />
        </div>

        <div className="w-full max-w-sm">

          {/* Tab login/registra */}
          {step === 'form' && (
            <div className="flex rounded-xl p-1 mb-5" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
              {(['login', 'register'] as const).map((m) => (
                <button
                  key={m}
                  onClick={() => switchMode(m)}
                  className="flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all"
                  style={{
                    background: mode === m ? 'rgba(16,185,129,0.25)' : 'transparent',
                    color: mode === m ? '#10B981' : 'rgba(255,255,255,0.35)',
                  }}
                >
                  {m === 'login' ? 'Accedi' : 'Registra negozio'}
                </button>
              ))}
            </div>
          )}

          {/* Form principale */}
          {step === 'form' && mode === 'login' && (
            <form onSubmit={handleLogin} className="flex flex-col gap-4">
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
                style={inputStyle}
              />
              {error && <p className="text-sm text-center" style={{ color: '#EF4444' }}>{error}</p>}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 rounded-xl font-semibold text-sm transition-all active:scale-95"
                style={{ background: 'linear-gradient(135deg, #10B981, #0EA5E9)', boxShadow: '0 4px 16px rgba(16,185,129,0.4)', color: 'white' }}
              >
                {loading ? 'Invio codice...' : 'Continua →'}
              </button>
            </form>
          )}

          {step === 'form' && mode === 'register' && (
            <form onSubmit={handleRegister} className="flex flex-col gap-3">
              <div>
                <h2 className="font-display font-bold text-xl mb-1">Registra il tuo negozio</h2>
                <p className="text-sm" style={{ color: 'rgba(255,255,255,0.4)' }}>
                  Crea il tuo account Fidelio in 30 secondi.
                </p>
              </div>
              <input
                type="text"
                placeholder="Nome negozio"
                value={shopName}
                onChange={(e) => setShopName(e.target.value)}
                autoFocus
                required
                style={inputStyle}
              />
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                required
                style={selectStyle}
              >
                <option value="" disabled style={{ background: '#0A140F' }}>Categoria negozio</option>
                {CATEGORIES.map((c) => (
                  <option key={c.value} value={c.value} style={{ background: '#0A140F' }}>{c.label}</option>
                ))}
              </select>
              <input
                type="text"
                placeholder="Città"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                required
                style={inputStyle}
              />
              <input
                type="email"
                placeholder="La tua email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                required
                style={inputStyle}
              />
              {error && <p className="text-sm text-center" style={{ color: '#EF4444' }}>{error}</p>}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 rounded-xl font-semibold text-sm transition-all active:scale-95 mt-1"
                style={{ background: 'linear-gradient(135deg, #10B981, #0EA5E9)', boxShadow: '0 4px 16px rgba(16,185,129,0.4)', color: 'white' }}
              >
                {loading ? 'Creazione account...' : 'Crea account →'}
              </button>
            </form>
          )}

          {/* Step OTP */}
          {step === 'otp' && (
            <form id="otp-form" onSubmit={handleVerifyOTP} className="flex flex-col gap-4">
              <div>
                <button
                  type="button"
                  onClick={() => { setStep('form'); setOtp(['', '', '', '', '', '']); setError('') }}
                  className="text-sm mb-4 flex items-center gap-1"
                  style={{ color: 'rgba(255,255,255,0.4)' }}
                >
                  ← Indietro
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

              {error && <p className="text-sm text-center" style={{ color: '#EF4444' }}>{error}</p>}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 rounded-xl font-semibold text-sm transition-all active:scale-95"
                style={{ background: 'linear-gradient(135deg, #10B981, #0EA5E9)', boxShadow: '0 4px 16px rgba(16,185,129,0.4)', color: 'white' }}
              >
                {loading ? 'Verifica...' : 'Verifica codice'}
              </button>

              <div className="text-center">
                {resendTimer > 0 ? (
                  <p className="text-sm" style={{ color: 'rgba(255,255,255,0.3)' }}>Rinvia tra {resendTimer}s</p>
                ) : (
                  <button type="button" onClick={resend} className="text-sm font-medium" style={{ color: '#10B981' }}>
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
