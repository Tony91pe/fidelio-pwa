'use client'

import { useEffect, useRef } from 'react'
import { ProtectedLayout } from '@/components/ProtectedLayout'
import { useAuthStore } from '@/store/authStore'
import { getMyCode } from '@/lib/api'
import { useQuery } from '@tanstack/react-query'
import QRCodeLib from 'qrcode'

export default function ScanPage() {
  const { customer } = useAuthStore()
  const qrCanvasRef = useRef<HTMLCanvasElement>(null)

  const { data: myCode } = useQuery({
    queryKey: ['my-code', customer?.email],
    queryFn: () => getMyCode(customer!.email),
    enabled: !!customer?.email,
    select: (res) => res.data.code as string,
  })

  useEffect(() => {
    if (!myCode || !qrCanvasRef.current) return
    QRCodeLib.toCanvas(qrCanvasRef.current, myCode, {
      width: 220,
      margin: 2,
      color: { dark: '#1a1a2e', light: '#ffffff' },
    })
  }, [myCode])

  return (
    <ProtectedLayout>
      <div className="flex flex-col items-center" style={{ minHeight: 'calc(100dvh - 80px)', padding: '2rem 1.5rem' }}>

        <div className="w-full text-center mb-7" style={{ animation: 'slideUp 0.4s cubic-bezier(0.16,1,0.3,1) both' }}>
          <p className="text-xs font-medium mb-1" style={{ color: 'rgba(255,255,255,0.35)', letterSpacing: '0.05em' }}>Il tuo codice fedeltà</p>
          <h1 className="font-display font-bold text-2xl leading-tight">Il mio QR</h1>
        </div>

        <div
          className="rounded-3xl p-6 flex flex-col items-center gap-3 mb-6"
          style={{
            background: 'white',
            boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
            animation: 'slideUp 0.4s cubic-bezier(0.16,1,0.3,1) 0.05s both',
          }}
        >
          <canvas ref={qrCanvasRef} style={{ borderRadius: 8 }} />
          <div className="text-center">
            <p className="font-mono font-bold text-lg tracking-widest" style={{ color: '#1a1a2e' }}>
              {myCode || customer?.code}
            </p>
            <p className="text-xs mt-0.5" style={{ color: 'rgba(26,26,46,0.5)' }}>{customer?.name}</p>
          </div>
        </div>

        <div
          className="w-full max-w-sm rounded-2xl p-4"
          style={{
            background: 'rgba(124,58,237,0.08)',
            border: '1px solid rgba(124,58,237,0.2)',
            animation: 'slideUp 0.4s cubic-bezier(0.16,1,0.3,1) 0.1s both',
          }}
        >
          <p className="text-sm font-semibold mb-1" style={{ color: '#A78BFA' }}>Come funziona</p>
          <p className="text-xs leading-relaxed" style={{ color: 'rgba(255,255,255,0.45)' }}>
            Mostra questo QR al negoziante ogni volta che vuoi accumulare punti. Funziona in tutti i negozi Fidelio — la prima visita ti dà i punti di benvenuto automaticamente.
          </p>
        </div>

        <p className="text-xs text-center mt-6" style={{ color: 'rgba(255,255,255,0.15)' }}>
          Il QR è univoco e personale
        </p>
      </div>
    </ProtectedLayout>
  )
}
