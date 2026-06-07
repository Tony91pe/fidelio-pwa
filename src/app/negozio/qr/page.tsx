'use client'

import { useEffect, useRef } from 'react'
import { useShopAuthStore } from '@/store/shopAuthStore'
import { ShopProtectedLayout } from '@/components/ShopProtectedLayout'
import QRCodeLib from 'qrcode'
import Link from 'next/link'

const PWA_URL = process.env.NEXT_PUBLIC_PWA_URL || 'https://app.getfidelio.app'

export default function ShopQRPage() {
  const { shop } = useShopAuthStore()
  const qrCanvasRef = useRef<HTMLCanvasElement>(null)

  const checkinUrl = shop ? `${PWA_URL}/c/${shop.id}` : ''

  useEffect(() => {
    if (!checkinUrl || !qrCanvasRef.current) return
    QRCodeLib.toCanvas(qrCanvasRef.current, checkinUrl, {
      width: 260,
      margin: 2,
      color: { dark: '#0F1120', light: '#ffffff' },
    })
  }, [checkinUrl])

  function handlePrint() {
    window.print()
  }

  async function handleShare() {
    if (!checkinUrl) return
    try {
      if (navigator.share) {
        await navigator.share({ title: `Check-in ${shop?.name}`, url: checkinUrl })
      } else {
        await navigator.clipboard.writeText(checkinUrl)
        alert('Link copiato!')
      }
    } catch {}
  }

  return (
    <ShopProtectedLayout>
      <div className="px-4 pt-8 pb-6">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6" style={{ animation: 'slideUp 0.4s cubic-bezier(0.16,1,0.3,1) both' }}>
          <Link href="/negozio" className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.09)' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
          </Link>
          <div>
            <h1 className="font-display font-bold text-2xl leading-tight">QR Check-in</h1>
            <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.4)' }}>Da esporre alla cassa</p>
          </div>
        </div>

        {/* QR Card */}
        <div
          className="rounded-3xl p-6 flex flex-col items-center mb-5"
          style={{
            background: 'white',
            boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
            animation: 'slideUp 0.4s cubic-bezier(0.16,1,0.3,1) 0.05s both',
          }}
        >
          <p className="font-bold text-sm mb-1" style={{ color: '#0F1120' }}>{shop?.name}</p>
          <p className="text-xs mb-4" style={{ color: 'rgba(15,17,32,0.4)' }}>{shop?.city}</p>
          <canvas ref={qrCanvasRef} style={{ borderRadius: 8 }} />
          <div className="mt-4 px-3 py-1.5 rounded-full" style={{ background: '#F3F0FF' }}>
            <p className="text-xs font-bold" style={{ color: '#6C3DF4', letterSpacing: '0.04em' }}>Scansiona per accumulare punti</p>
          </div>
        </div>

        {/* Info box */}
        <div
          className="rounded-2xl px-4 py-4 mb-5"
          style={{
            background: 'rgba(16,185,129,0.07)',
            border: '1px solid rgba(16,185,129,0.18)',
            animation: 'slideUp 0.4s cubic-bezier(0.16,1,0.3,1) 0.1s both',
          }}
        >
          <p className="text-sm font-semibold mb-2" style={{ color: '#10B981' }}>Come funziona</p>
          <div className="flex flex-col gap-2">
            {[
              { n: '1', t: 'Esponi questo QR alla cassa o sul bancone' },
              { n: '2', t: 'Il cliente lo scansiona con la fotocamera del telefono' },
              { n: '3', t: 'Accede all\'app Fidelio e fa check-in autonomamente' },
            ].map(({ n, t }) => (
              <div key={n} className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0 mt-0.5" style={{ background: 'rgba(16,185,129,0.2)', color: '#10B981' }}>{n}</div>
                <p className="text-xs leading-relaxed" style={{ color: 'rgba(255,255,255,0.5)' }}>{t}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-3" style={{ animation: 'slideUp 0.4s cubic-bezier(0.16,1,0.3,1) 0.15s both' }}>
          <button
            onClick={handlePrint}
            className="w-full py-4 rounded-2xl font-semibold text-sm flex items-center justify-center gap-2"
            style={{ background: 'linear-gradient(135deg, #10B981, #0EA5E9)', boxShadow: '0 6px 20px rgba(16,185,129,0.35)' }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 01-2-2v-5a2 2 0 012-2h16a2 2 0 012 2v5a2 2 0 01-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>
            Stampa QR
          </button>
          <button
            onClick={handleShare}
            className="w-full py-3.5 rounded-2xl font-semibold text-sm flex items-center justify-center gap-2"
            style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.7)' }}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>
            Condividi link check-in
          </button>
        </div>

        <p className="text-center text-[10px] mt-5" style={{ color: 'rgba(255,255,255,0.15)' }}>
          {checkinUrl}
        </p>
      </div>
    </ShopProtectedLayout>
  )
}
