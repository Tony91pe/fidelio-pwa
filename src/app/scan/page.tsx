'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
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
  const router = useRouter()

  const { data: myCode } = useQuery({
    queryKey: ['my-code', customer?.email],
    queryFn: () => getMyCode(customer!.email),
    enabled: !!customer?.email,
    select: (res) => res.data.code as string,
  })

  // Generate QR
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

  const startCamera = useCallback(async () => {
    setError('')
    setResult('')
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } },
      })
      streamRef.current = stream
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        await videoRef.current.play()
        setScanning(true)
        scanFrame()
      }
    } catch (err) {
      setError('Impossibile accedere alla fotocamera. Controlla i permessi.')
    }
  }, [])

  const scanFrame = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return
    const video = videoRef.current
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx || video.readyState !== 4) {
      rafRef.current = requestAnimationFrame(scanFrame)
      return
    }

    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    ctx.drawImage(video, 0, 0)

    try {
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
      const jsQR = require('jsqr')
      const code = jsQR(imageData.data, imageData.width, imageData.height, {
        inversionAttempts: 'dontInvert',
      })

      if (code) {
        const text = code.data
        setResult(text)
        stopCamera()

        // Vibrate feedback
        if (navigator.vibrate) navigator.vibrate(200)

        // If it looks like a Fidelio shop QR, redirect to checkin
        if (text.startsWith('http') && text.includes('/checkin/')) {
          setTimeout(() => window.location.href = text, 800)
        }
        return
      }
    } catch {}

    rafRef.current = requestAnimationFrame(scanFrame)
  }, [stopCamera])

  useEffect(() => {
    if (mode === 'scan') startCamera()
    else stopCamera()
    return () => stopCamera()
  }, [mode])

  return (
    <ProtectedLayout>
      <div className="page-enter flex flex-col min-h-[calc(100dvh-80px)]">
        {/* Tabs */}
        <div className="px-4 pt-14 pb-4">
          <div className="flex glass rounded-xl p-1">
            <button
              onClick={() => setMode('show')}
              className="flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all"
              style={{
                background: mode === 'show' ? 'rgba(124,58,237,0.4)' : 'transparent',
                color: mode === 'show' ? '#A78BFA' : 'rgba(255,255,255,0.4)',
              }}
            >
              📱 Il mio QR
            </button>
            <button
              onClick={() => setMode('scan')}
              className="flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all"
              style={{
                background: mode === 'scan' ? 'rgba(124,58,237,0.4)' : 'transparent',
                color: mode === 'scan' ? '#A78BFA' : 'rgba(255,255,255,0.4)',
              }}
            >
              📷 Scannerizza
            </button>
          </div>
        </div>

        {mode === 'show' ? (
          <div className="flex-1 flex flex-col items-center justify-center px-6 gap-6">
            <div>
              <h2 className="font-display font-bold text-xl text-center mb-1">Il mio QR</h2>
              <p className="text-white/40 text-sm text-center">Mostra questo QR al negoziante per ricevere punti</p>
            </div>

            <div className="bg-white rounded-2xl p-5 flex flex-col items-center gap-3">
              <canvas ref={qrCanvasRef} />
              <p className="font-mono font-bold text-lg tracking-widest text-surface">{myCode || customer?.code}</p>
              <p className="text-surface/60 text-xs">{customer?.name}</p>
            </div>

            <p className="text-white/30 text-xs text-center">Il QR è univoco e personale</p>
          </div>
        ) : (
          <div className="flex-1 relative overflow-hidden bg-black">
            <video
              ref={videoRef}
              className="w-full h-full object-cover"
              playsInline
              muted
              autoPlay
            />
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
                  <p className="text-white/70 text-sm">Inquadra il QR del negozio</p>
                </div>
              </>
            )}

            {result && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/70 animate-fade-in">
                <div className="glass rounded-2xl p-6 mx-6 text-center">
                  <p className="text-4xl mb-3">✅</p>
                  <p className="font-semibold mb-1">QR rilevato!</p>
                  <p className="text-white/50 text-xs break-all mb-4">{result}</p>
                  <button
                    onClick={() => { setResult(''); setMode('scan'); }}
                    className="btn-primary"
                    style={{ padding: '10px 24px', width: 'auto', display: 'inline-block' }}
                  >
                    Scannerizza ancora
                  </button>
                </div>
              </div>
            )}

            {error && (
              <div className="absolute inset-0 flex items-center justify-center p-6">
                <div className="glass rounded-2xl p-6 text-center">
                  <p className="text-4xl mb-3">📷</p>
                  <p className="font-semibold mb-2">Fotocamera non disponibile</p>
                  <p className="text-white/40 text-sm mb-4">{error}</p>
                  <button onClick={startCamera} className="btn-primary" style={{ width: 'auto', padding: '10px 24px', display: 'inline-block' }}>
                    Riprova
                  </button>
                </div>
              </div>
            )}

            {!scanning && !error && !result && (
              <div className="absolute inset-0 flex items-center justify-center">
                <button onClick={startCamera} className="glass rounded-2xl px-8 py-4 flex flex-col items-center gap-2">
                  <span className="text-4xl">📷</span>
                  <span className="font-semibold">Avvia fotocamera</span>
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </ProtectedLayout>
  )
}
