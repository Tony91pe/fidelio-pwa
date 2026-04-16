'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { ShopProtectedLayout } from '@/components/ShopProtectedLayout'
import { useShopAuthStore } from '@/store/shopAuthStore'
import { shopCheckin, scanShopGiftCard, useShopGiftCard } from '@/lib/api'
import axios from 'axios'

type ScanMode = 'cliente' | 'giftcard'
type ScanState = 'idle' | 'scanning' | 'confirming' | 'success' | 'error'

interface CheckinResult {
  customerName: string
  customerCode: string
  pointsAdded: number
  totalPoints: number
}

interface GiftCardResult {
  id: string
  code: string
  value: number
  description: string | null
  customerName: string | null
  usedAt: string | null
}

export default function ShopScannerPage() {
  const { shop } = useShopAuthStore()
  const [mode, setMode] = useState<ScanMode>('cliente')
  const [scanState, setScanState] = useState<ScanState>('idle')
  const [scannedCode, setScannedCode] = useState('')
  const [amount, setAmount] = useState('')
  const [checkinResult, setCheckinResult] = useState<CheckinResult | null>(null)
  const [giftCardResult, setGiftCardResult] = useState<GiftCardResult | null>(null)
  const [errorMsg, setErrorMsg] = useState('')
  const [loading, setLoading] = useState(false)

  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const rafRef = useRef<number>(0)

  const stopCamera = useCallback(() => {
    cancelAnimationFrame(rafRef.current)
    streamRef.current?.getTracks().forEach((t) => t.stop())
    streamRef.current = null
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
      if (code?.data) {
        const raw = code.data as string
        if (navigator.vibrate) navigator.vibrate(100)
        stopCamera()

        // Determina se è un QR cliente o gift card
        // I QR cliente contengono solo il codice alfanumerico
        // I QR gift card iniziano con "GC-" o contengono la stringa "giftcard"
        const isGiftCard = raw.startsWith('GC-') || raw.includes('giftcard') || raw.includes('GIFT')
        setScannedCode(raw)

        if (isGiftCard || mode === 'giftcard') {
          handleGiftCardScan(raw)
        } else {
          setScanState('confirming')
        }
        return
      }
    } catch {}
    rafRef.current = requestAnimationFrame(scanFrame)
  }, [stopCamera, mode])

  const startCamera = useCallback(async () => {
    setErrorMsg('')
    setScanState('scanning')
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } }
      })
      streamRef.current = stream
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        await videoRef.current.play()
        scanFrame()
      }
    } catch {
      setErrorMsg('Impossibile accedere alla fotocamera. Controlla i permessi.')
      setScanState('error')
    }
  }, [scanFrame])

  useEffect(() => {
    return () => stopCamera()
  }, [stopCamera])

  function reset() {
    stopCamera()
    setScanState('idle')
    setScannedCode('')
    setAmount('')
    setCheckinResult(null)
    setGiftCardResult(null)
    setErrorMsg('')
  }

  async function handleGiftCardScan(code: string) {
    setScanState('confirming')
    setLoading(true)
    try {
      const res = await scanShopGiftCard(code)
      setGiftCardResult(res.data)
      setLoading(false)
    } catch (err) {
      if (axios.isAxiosError(err)) {
        setErrorMsg(err.response?.data?.error || 'Gift card non trovata o già utilizzata')
      } else {
        setErrorMsg('Errore durante la verifica della gift card')
      }
      setScanState('error')
      setLoading(false)
    }
  }

  async function confirmCheckin() {
    setLoading(true)
    try {
      const amountVal = amount ? parseFloat(amount) : undefined
      const res = await shopCheckin(scannedCode, amountVal)
      setCheckinResult(res.data)
      setScanState('success')
    } catch (err) {
      if (axios.isAxiosError(err)) {
        setErrorMsg(err.response?.data?.error || 'Cliente non trovato')
      } else {
        setErrorMsg('Errore durante il check-in')
      }
      setScanState('error')
    } finally {
      setLoading(false)
    }
  }

  async function confirmUseGiftCard() {
    if (!giftCardResult) return
    setLoading(true)
    try {
      await useShopGiftCard(giftCardResult.id)
      setScanState('success')
    } catch (err) {
      if (axios.isAxiosError(err)) {
        setErrorMsg(err.response?.data?.error || 'Errore nell\'utilizzo della gift card')
      } else {
        setErrorMsg('Errore durante l\'utilizzo della gift card')
      }
      setScanState('error')
    } finally {
      setLoading(false)
    }
  }

  const isScanning = scanState === 'scanning'

  return (
    <ShopProtectedLayout>
      <div className="flex flex-col" style={{ height: 'calc(100dvh - 80px)' }}>

        {/* Mode Tabs */}
        <div className="px-4 pt-6 pb-3 flex-shrink-0">
          <div
            className="flex rounded-xl p-1"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}
          >
            {(['cliente', 'giftcard'] as const).map((m) => (
              <button
                key={m}
                onClick={() => { setMode(m); reset() }}
                className="flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all"
                style={{
                  background: mode === m ? 'rgba(16,185,129,0.25)' : 'transparent',
                  color: mode === m ? '#10B981' : 'rgba(255,255,255,0.35)',
                }}
              >
                {m === 'cliente' ? '👤 QR Cliente' : '🎁 Gift Card'}
              </button>
            ))}
          </div>
        </div>

        {/* Main area */}
        <div className="flex-1 relative overflow-hidden">

          {/* IDLE: start button */}
          {scanState === 'idle' && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-6 px-6">
              <div className="text-center">
                <div className="text-6xl mb-4">{mode === 'cliente' ? '👤' : '🎁'}</div>
                <h2 className="font-display font-bold text-xl mb-2">
                  {mode === 'cliente' ? 'Scansiona cliente' : 'Scansiona gift card'}
                </h2>
                <p className="text-sm" style={{ color: 'rgba(255,255,255,0.4)' }}>
                  {mode === 'cliente'
                    ? 'Inquadra il QR personale del cliente per assegnargli i punti'
                    : 'Inquadra il QR della gift card per verificarla e segnarla come usata'}
                </p>
              </div>
              <button
                onClick={startCamera}
                className="w-full max-w-xs py-4 rounded-2xl font-semibold text-base transition-all active:scale-95"
                style={{ background: 'linear-gradient(135deg, #10B981, #0EA5E9)', boxShadow: '0 6px 20px rgba(16,185,129,0.4)' }}
              >
                📷 Avvia fotocamera
              </button>
            </div>
          )}

          {/* SCANNING: camera view */}
          {isScanning && (
            <>
              <video ref={videoRef} className="w-full h-full object-cover" playsInline muted autoPlay />
              <canvas ref={canvasRef} className="hidden" />

              {/* Overlay */}
              <div className="scanner-overlay" />
              <div className="scanner-window">
                <div className="scanner-corner scanner-corner-tl" style={{ borderColor: '#10B981' }} />
                <div className="scanner-corner scanner-corner-tr" style={{ borderColor: '#10B981' }} />
                <div className="scanner-corner scanner-corner-bl" style={{ borderColor: '#10B981' }} />
                <div className="scanner-corner scanner-corner-br" style={{ borderColor: '#10B981' }} />
                <div className="scan-line" style={{ background: 'linear-gradient(to bottom, transparent, #10B981, transparent)' }} />
              </div>

              <div className="absolute bottom-24 left-0 right-0 text-center px-6">
                <p className="text-sm" style={{ color: 'rgba(255,255,255,0.7)' }}>
                  {mode === 'cliente' ? 'Inquadra il QR del cliente' : 'Inquadra il QR della gift card'}
                </p>
              </div>

              <button
                onClick={reset}
                className="absolute top-4 right-4 w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(8px)' }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
                  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </>
          )}

          {/* CONFIRMING: cliente check-in */}
          {scanState === 'confirming' && mode === 'cliente' && !loading && (
            <div className="absolute inset-0 flex flex-col items-center justify-center p-6">
              <div
                className="w-full max-w-sm rounded-3xl p-6"
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(16,185,129,0.25)', backdropFilter: 'blur(12px)' }}
              >
                <div className="text-center mb-5">
                  <div
                    className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl mx-auto mb-3"
                    style={{ background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.3)' }}
                  >
                    👤
                  </div>
                  <h3 className="font-display font-bold text-lg">Check-in cliente</h3>
                  <p className="text-xs mt-1 font-mono" style={{ color: 'rgba(255,255,255,0.4)' }}>{scannedCode}</p>
                </div>

                {shop?.pointsSystem !== 'per_visit' && (
                  <div className="mb-4">
                    <label className="text-xs font-medium mb-2 block" style={{ color: 'rgba(255,255,255,0.5)' }}>
                      Importo spesa (€) — opzionale
                    </label>
                    <input
                      type="number"
                      inputMode="decimal"
                      placeholder="es. 25.50"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      min="0"
                      step="0.01"
                      className="w-full"
                    />
                  </div>
                )}

                <div className="flex gap-3">
                  <button
                    onClick={reset}
                    className="flex-1 py-3 rounded-xl font-semibold text-sm"
                    style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)' }}
                  >
                    Annulla
                  </button>
                  <button
                    onClick={confirmCheckin}
                    className="flex-1 py-3 rounded-xl font-semibold text-sm"
                    style={{ background: 'linear-gradient(135deg, #10B981, #0EA5E9)', boxShadow: '0 4px 12px rgba(16,185,129,0.4)' }}
                  >
                    ✓ Assegna punti
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* CONFIRMING: gift card */}
          {scanState === 'confirming' && (mode === 'giftcard' || scannedCode.startsWith('GC-')) && !loading && giftCardResult && (
            <div className="absolute inset-0 flex flex-col items-center justify-center p-6">
              <div
                className="w-full max-w-sm rounded-3xl p-6"
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(245,158,11,0.3)', backdropFilter: 'blur(12px)' }}
              >
                {/* Gift card visual */}
                <div
                  className="rounded-2xl p-5 mb-5 relative overflow-hidden"
                  style={{ background: 'linear-gradient(135deg, #1A3A2A, #0D2B1F)', border: '1px solid rgba(16,185,129,0.2)' }}
                >
                  <div className="absolute top-0 right-0 w-24 h-24 rounded-full" style={{ background: 'rgba(16,185,129,0.1)', filter: 'blur(20px)', transform: 'translate(30%,-30%)' }} />
                  <p className="text-xs mb-1" style={{ color: 'rgba(255,255,255,0.4)' }}>GIFT CARD</p>
                  <p className="font-display font-black text-3xl" style={{ color: '#10B981' }}>€{giftCardResult.value.toFixed(2)}</p>
                  {giftCardResult.description && (
                    <p className="text-sm mt-1" style={{ color: 'rgba(255,255,255,0.6)' }}>{giftCardResult.description}</p>
                  )}
                  <p className="font-mono text-xs mt-3" style={{ color: 'rgba(255,255,255,0.35)' }}>{giftCardResult.code}</p>
                  {giftCardResult.customerName && (
                    <p className="text-xs mt-1" style={{ color: 'rgba(255,255,255,0.4)' }}>Cliente: {giftCardResult.customerName}</p>
                  )}
                </div>

                {giftCardResult.usedAt ? (
                  <div className="text-center py-3 mb-4 rounded-xl" style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)' }}>
                    <p className="font-semibold text-sm" style={{ color: '#F87171' }}>⚠️ Gift card già utilizzata</p>
                    <p className="text-xs mt-1" style={{ color: 'rgba(255,255,255,0.4)' }}>
                      Usata il {new Date(giftCardResult.usedAt).toLocaleDateString('it-IT')}
                    </p>
                  </div>
                ) : (
                  <div className="text-center py-3 mb-4 rounded-xl" style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.25)' }}>
                    <p className="font-semibold text-sm" style={{ color: '#10B981' }}>✓ Gift card valida</p>
                    <p className="text-xs mt-1" style={{ color: 'rgba(255,255,255,0.4)' }}>Conferma per segnare come usata</p>
                  </div>
                )}

                <div className="flex gap-3">
                  <button
                    onClick={reset}
                    className="flex-1 py-3 rounded-xl font-semibold text-sm"
                    style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)' }}
                  >
                    Annulla
                  </button>
                  {!giftCardResult.usedAt && (
                    <button
                      onClick={confirmUseGiftCard}
                      className="flex-1 py-3 rounded-xl font-semibold text-sm"
                      style={{ background: 'linear-gradient(135deg, #F59E0B, #EF4444)', boxShadow: '0 4px 12px rgba(245,158,11,0.35)' }}
                    >
                      🎁 Usa gift card
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Loading spinner */}
          {loading && (
            <div className="absolute inset-0 flex items-center justify-center" style={{ background: 'rgba(10,20,15,0.85)', backdropFilter: 'blur(8px)' }}>
              <div className="flex flex-col items-center gap-3">
                <div className="w-12 h-12 rounded-2xl animate-pulse" style={{ background: 'linear-gradient(135deg, #10B981, #0EA5E9)' }} />
                <p className="text-sm" style={{ color: 'rgba(255,255,255,0.6)' }}>Elaborazione...</p>
              </div>
            </div>
          )}

          {/* SUCCESS */}
          {scanState === 'success' && (
            <div className="absolute inset-0 flex items-center justify-center p-6" style={{ background: 'rgba(10,20,15,0.9)', backdropFilter: 'blur(8px)' }}>
              <div
                className="w-full max-w-sm rounded-3xl p-6 text-center"
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(16,185,129,0.3)' }}
              >
                <div
                  className="w-16 h-16 rounded-2xl flex items-center justify-center text-4xl mx-auto mb-4"
                  style={{ background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.3)' }}
                >
                  ✅
                </div>

                {checkinResult ? (
                  <>
                    <h3 className="font-display font-bold text-xl mb-1">Punti assegnati!</h3>
                    <p className="text-sm mb-3" style={{ color: 'rgba(255,255,255,0.5)' }}>{checkinResult.customerName}</p>
                    <div
                      className="rounded-xl p-3 mb-4"
                      style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)' }}
                    >
                      <p className="text-sm" style={{ color: 'rgba(255,255,255,0.6)' }}>Punti aggiunti</p>
                      <p className="font-display font-black text-3xl" style={{ color: '#10B981' }}>+{checkinResult.pointsAdded}</p>
                      <p className="text-xs mt-1" style={{ color: 'rgba(255,255,255,0.4)' }}>Totale: {checkinResult.totalPoints} punti</p>
                    </div>
                  </>
                ) : (
                  <>
                    <h3 className="font-display font-bold text-xl mb-1">Gift card utilizzata!</h3>
                    <p className="text-sm mb-4" style={{ color: 'rgba(255,255,255,0.5)' }}>
                      La gift card è stata segnata come usata
                    </p>
                  </>
                )}

                <button
                  onClick={reset}
                  className="w-full py-3.5 rounded-xl font-semibold"
                  style={{ background: 'linear-gradient(135deg, #10B981, #0EA5E9)', boxShadow: '0 4px 12px rgba(16,185,129,0.4)' }}
                >
                  Scansiona ancora
                </button>
              </div>
            </div>
          )}

          {/* ERROR */}
          {scanState === 'error' && (
            <div className="absolute inset-0 flex items-center justify-center p-6" style={{ background: 'rgba(10,20,15,0.9)', backdropFilter: 'blur(8px)' }}>
              <div
                className="w-full max-w-sm rounded-3xl p-6 text-center"
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(239,68,68,0.3)' }}
              >
                <div
                  className="w-16 h-16 rounded-2xl flex items-center justify-center text-4xl mx-auto mb-4"
                  style={{ background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.25)' }}
                >
                  ❌
                </div>
                <h3 className="font-display font-bold text-xl mb-2">Errore</h3>
                <p className="text-sm mb-5" style={{ color: 'rgba(255,255,255,0.5)' }}>{errorMsg}</p>
                <button
                  onClick={reset}
                  className="w-full py-3.5 rounded-xl font-semibold"
                  style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)' }}
                >
                  Riprova
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </ShopProtectedLayout>
  )
}
