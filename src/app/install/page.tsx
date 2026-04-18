'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

type Device = 'ios' | 'android' | 'desktop' | 'unknown'

function detectDevice(): Device {
  if (typeof navigator === 'undefined') return 'unknown'
  const ua = navigator.userAgent
  if (/iPad|iPhone|iPod/.test(ua)) return 'ios'
  if (/Android/.test(ua)) return 'android'
  if (/Windows|Mac|Linux/.test(ua)) return 'desktop'
  return 'unknown'
}

const iosSteps = [
  { icon: '⬆️', text: 'Tocca il pulsante "Condividi" in basso nel browser Safari' },
  { icon: '📲', text: 'Scorri e tocca "Aggiungi a schermata Home"' },
  { icon: '✅', text: 'Tocca "Aggiungi" — l\'app appare sulla tua schermata!' },
]

const androidSteps = [
  { icon: '⋮', text: 'Tocca il menu (tre puntini) in alto a destra in Chrome' },
  { icon: '📲', text: 'Tocca "Aggiungi a schermata Home" o "Installa app"' },
  { icon: '✅', text: 'Tocca "Installa" — l\'app appare sulla tua schermata!' },
]

export default function InstallPage() {
  const [device, setDevice] = useState<Device>('unknown')
  const [role, setRole] = useState<'cliente' | 'negozio' | null>(null)

  useEffect(() => {
    setDevice(detectDevice())
  }, [])

  const steps = device === 'ios' ? iosSteps : androidSteps
  const isDesktop = device === 'desktop'

  return (
    <div
      className="min-h-dvh flex flex-col"
      style={{ background: 'radial-gradient(ellipse at top, #1E1040 0%, #0F0F1A 60%)', fontFamily: 'system-ui, sans-serif' }}
    >
      {/* Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 rounded-full opacity-20 pointer-events-none"
        style={{ background: 'radial-gradient(circle, #7C3AED, transparent 70%)', filter: 'blur(60px)' }} />

      <div className="flex-1 flex flex-col items-center px-5 pt-12 pb-10 relative z-10 max-w-sm mx-auto w-full">

        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-4"
            style={{ background: 'linear-gradient(135deg, #7C3AED, #3B82F6)', boxShadow: '0 12px 40px rgba(124,58,237,0.5)' }}>
            <span style={{ fontWeight: 900, fontSize: 32, color: 'white' }}>F</span>
          </div>
          <h1 style={{ fontWeight: 900, fontSize: 28, letterSpacing: '-0.03em', marginBottom: 6 }}>Fidelio</h1>
          <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 14 }}>La carta fedeltà digitale per tutti i negozi</p>
        </div>

        {/* Desktop: mostra QR */}
        {isDesktop ? (
          <div className="w-full rounded-3xl p-6 text-center mb-6"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
            <p style={{ fontWeight: 700, fontSize: 16, marginBottom: 8 }}>Scansiona con il telefono</p>
            <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 13, marginBottom: 20 }}>
              Apri la fotocamera e inquadra il codice per installare l'app
            </p>
            <div className="flex justify-center">
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=https://getfidelio.app/install&bgcolor=ffffff&color=1a1a2e&margin=10`}
                alt="QR install"
                style={{ borderRadius: 16, width: 180, height: 180 }}
              />
            </div>
            <p style={{ color: 'rgba(255,255,255,0.2)', fontSize: 12, marginTop: 12 }}>getfidelio.app/install</p>
          </div>
        ) : (
          <>
            {/* Chip "Chi sei?" */}
            {!role && (
              <div className="w-full mb-6">
                <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 13, textAlign: 'center', marginBottom: 12 }}>
                  Seleziona il tuo profilo per iniziare
                </p>
                <div className="flex gap-3">
                  <button onClick={() => setRole('cliente')} className="flex-1 py-4 rounded-2xl font-semibold text-sm transition-all active:scale-95"
                    style={{ background: 'rgba(124,58,237,0.15)', border: '1px solid rgba(124,58,237,0.3)', color: '#A78BFA' }}>
                    👤 Sono un cliente
                  </button>
                  <button onClick={() => setRole('negozio')} className="flex-1 py-4 rounded-2xl font-semibold text-sm transition-all active:scale-95"
                    style={{ background: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.25)', color: '#34D399' }}>
                    🏪 Ho un negozio
                  </button>
                </div>
              </div>
            )}

            {/* Istruzioni installazione */}
            {(device === 'ios' || device === 'android') && (
              <div className="w-full rounded-3xl p-5 mb-6"
                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
                <p style={{ fontWeight: 700, fontSize: 15, marginBottom: 4 }}>
                  {device === 'ios' ? '📱 Installa su iPhone / iPad' : '📱 Installa su Android'}
                </p>
                <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 12, marginBottom: 16 }}>
                  Aggiungi l'app alla schermata home — gratuito, nessuno store
                </p>
                <div className="flex flex-col gap-3">
                  {steps.map((s, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <div className="w-7 h-7 rounded-xl flex items-center justify-center flex-shrink-0 text-sm"
                        style={{ background: 'rgba(124,58,237,0.2)', border: '1px solid rgba(124,58,237,0.3)' }}>
                        {i + 1}
                      </div>
                      <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 13, lineHeight: 1.5, paddingTop: 3 }}>{s.text}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        {/* CTA buttons */}
        <div className="w-full flex flex-col gap-3">
          <Link href="/login" className="w-full py-4 rounded-2xl font-bold text-center text-sm transition-all active:scale-[0.98] block"
            style={{ background: 'linear-gradient(135deg, #7C3AED, #3B82F6)', boxShadow: '0 4px 20px rgba(124,58,237,0.4)', color: 'white', textDecoration: 'none' }}>
            👤 Accedi come cliente
          </Link>
          <Link href="/negozio/login" className="w-full py-4 rounded-2xl font-bold text-center text-sm transition-all active:scale-[0.98] block"
            style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.25)', color: '#34D399', textDecoration: 'none' }}>
            🏪 Accedi come negozio
          </Link>
        </div>

        <p style={{ color: 'rgba(255,255,255,0.12)', fontSize: 11, marginTop: 24, textAlign: 'center' }}>
          Fidelio · Made with ♥ in Italy
        </p>
      </div>
    </div>
  )
}
