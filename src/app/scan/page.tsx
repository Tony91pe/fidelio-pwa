'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { ProtectedLayout } from '@/components/ProtectedLayout'
import { useAuthStore } from '@/store/authStore'
import { getMyCode } from '@/lib/api'
import { useQuery } from '@tanstack/react-query'
import QRCodeLib from 'qrcode'

type ScanMode = 'show' | 'scan'

export default function ScanPage() {
  const { customer } = useAuthStore()
  const [mode, setMode] = useState<ScanMode>('show')
  const [scanning, setScanning] = useState(false)
  const [error, setError] = useState('')
  const [result, setResult] = useState('')
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const qrCanvasRef = useRef<HTMLCanvasElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const rafRef = useRef<number>(0)

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
  }, [myCode, mode])

  const stopCamera = useCallback(() => {
    cancelAnimationFrame(rafRef.current)
    streamRef.current?.getTracks().forEach((t) => t.stop())
    streamRef.current = null
    setScanning(false)
  }, [])

  const scanFrame = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return
    const video = videoRef.current
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx || video.readyState !== 4) { rafRef.current = requestAnimationFrame(scanFrame); return }
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    ctx.drawImage(video, 0, 0)
    try {
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
      const jsQR = require('jsqr')
      const code = jsQR(imageData.data, imageData.width, imageData.height, { inversionAttempts: 'dontInvert' })
      if (code) {
        setResult(code.data)
        stopCamera()
        if (navigator.vibrate) navigator.vibrate(200)
        if (code.data.startsWith('http') && code.data.includes('/checkin/')) {
          const popup = window.open(code.data, 'checkin', 'width=500,height=600')
          const checkPopup = setInterval(() => {
            if (popup?.closed) { clearInterval(checkPopup); setTimeout(() => { setResult(''); setMode('show') }, 1000) }
          }, 500)
        }
        return
      }
    } catch {}
    rafRef.current = requestAnimationFrame(scanFrame)
  }, [stopCamera])

  const startCamera = useCallback(async () => {
    setError(''); setResult('')
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } } })
      streamRef.current = stream
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        await videoRef.current.play()
        setScanning(true)
        scanFrame()
      }
    } catch { setError('Impossibile accedere alla fotocamera. Controlla i permessi.') }
  }, [scanFrame])

  useEffect(() => {
    if (mode === 'scan') startCamera()
    else stopCamera()
    return () => stopCamera()
  }, [mode])

  return (
    <ProtectedLayout>
      <div className="flex flex-col" style={{ height: 'calc(100dvh - 80px)' }}>

        {/* Tabs */}
        <div className="px-4 pt-6 pb-3 flex-shrink-0">
          <div className="flex rounded-xl p-1" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
            {(['show', 'scan'] as const).map((m) => (
              <button
                key={m}
                onClick={() => setMode(m)}
                className="flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all"
                style={{
                  background: mode === m ? 'rgba(124,58,237,0.35)' : 'transparent',
                  color: mode === m ? '#A78BFA' : 'rgba(255,255,255,0.35)',
                }}
              >
                {m === 'show' ? '📱 Il mio QR' : '📷 Scannerizza'}
              </button>
            ))}
          </div>
        </div>

        {mode === 'show' ? (
          <div className="flex-1 flex flex-col items-center justify-center px-6 gap-5" style={{ animation: 'slideUp 0.35s cubic-bezier(0.16,1,0.3,1) both' }}>
            <div className="text-center">
              <h2 className="font-display font-bold text-xl mb-1">Il mio QR</h2>
              <p className="text-sm" style={{ color: 'rgba(255,255,255,0.4)' }}>Mostralo al negoziante per ricevere punti</p>
            </div>

            <div className="rounded-3xl p-5 flex flex-col items-center gap-3" style={{ background: 'white', boxShadow: '0 20px 60px rgba(0,0,0,0.5)' }}>
              <canvas ref={qrCanvasRef} style={{ borderRadius: 8 }} />
              <div className="text-center">
                <p className="font-mono font-bold text-lg tracking-widest" style={{ color: '#1a1a2e' }}>{myCode || customer?.code}</p>
                <p className="text-xs mt-0.5" style={{ color: 'rgba(26,26,46,0.5)' }}>{customer?.name}</p>
              </div>
            </div>

            <p className="text-xs" style={{ color: 'rgba(255,255,255,0.2)' }}>Il QR è univoco e personale</p>
          </div>
        ) : (
          <div className="flex-1 relative overflow-hidden bg-black">
            <video ref={videoRef} className="w-full h-full object-cover" playsInline muted autoPlay />
            <canvas ref={canvasRef} className="hidden" />

            {scanning && (
              <>
                <div className="scanner-overlay" />
                <div className="scanner-window">
                  <div className="scanner-corner scanner-corner-tl" />
                  <div className="scanner-corner scanner-corner-tr" />
                  <div className="scanner-corner scanner-corner-bl" />
                  <div className="scanner-corner scanner-corner-br" />
                  <div className="scan-line" />
                </div>
                <div className="absolute bottom-24 left-0 right-0 text-center">
                  <p className="text-sm" style={{ color: 'rgba(255,255,255,0.7)' }}>Inquadra il QR del negozio</p>
                </div>
              </>
            )}

            {result && (
              <div className="absolute inset-0 flex items-center justify-center p-6" style={{ background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)' }}>
                <div className="rounded-2xl p-6 text-center w-full max-w-xs" style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)' }}>
                  <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-3" style={{ background: 'rgba(52,211,153,0.15)', border: '1px solid rgba(52,211,153,0.3)' }}>✅</div>
                  <p className="font-semibold mb-1">QR rilevato!</p>
                  <p className="text-xs break-all mb-4" style={{ color: 'rgba(255,255,255,0.4)' }}>{result}</p>
                  <button onClick={() => { setResult(''); setMode('scan') }} className="btn-primary" style={{ padding: '10px 24px', width: 'auto', display: 'inline-block' }}>
                    Scannerizza ancora
                  </button>
                </div>
              </div>
            )}

            {error && (
              <div className="absolute inset-0 flex items-center justify-center p-6">
                <div className="rounded-2xl p-6 text-center" style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)' }}>
                  <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-3" style={{ background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.25)' }}>📷</div>
                  <p className="font-semibold mb-2">Fotocamera non disponibile</p>
                  <p className="text-sm mb-4" style={{ color: 'rgba(255,255,255,0.4)' }}>{error}</p>
                  <button onClick={startCamera} className="btn-primary" style={{ width: 'auto', padding: '10px 24px', display: 'inline-block' }}>Riprova</button>
                </div>
              </div>
            )}

            {!scanning && !error && !result && (
              <div className="absolute inset-0 flex items-center justify-center">
                <button onClick={startCamera} className="rounded-2xl px-8 py-5 flex flex-col items-center gap-2" style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', backdropFilter: 'blur(12px)' }}>
                  <span className="text-4xl">📷</span>
                  <span className="font-semibold text-sm">Avvia fotocamera</span>
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </ProtectedLayout>
  )
}
