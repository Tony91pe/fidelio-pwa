'use client'

import { useShopAuthStore } from '@/store/shopAuthStore'
import { ShopProtectedLayout } from '@/components/ShopProtectedLayout'
import { useQuery } from '@tanstack/react-query'
import { getShopRewards } from '@/lib/api'
import { ShopReward } from '@/types'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function ShopOnboardingPage() {
  const { shop } = useShopAuthStore()
  const router = useRouter()

  const { data: rewards = [] } = useQuery<ShopReward[]>({
    queryKey: ['shop-rewards'],
    queryFn: () => getShopRewards().then((r) => r.data),
  })

  const profileComplete = !!(shop?.name && shop?.address && shop?.city && shop?.category)
  const hasReward = rewards.length > 0
  const hasQR = true

  const steps = [
    {
      id: 'profile',
      done: profileComplete,
      icon: '🏪',
      title: 'Completa il profilo negozio',
      desc: 'Aggiungi indirizzo, città e categoria per apparire sulla mappa Fidelio',
      href: '/negozio/profilo',
      cta: 'Vai al profilo',
    },
    {
      id: 'reward',
      done: hasReward,
      icon: '🏆',
      title: 'Crea il primo premio fedeltà',
      desc: 'Definisci un premio che i tuoi clienti possono riscattare con i punti accumulati',
      href: '/negozio/premi',
      cta: 'Crea un premio',
    },
    {
      id: 'qr',
      done: hasQR,
      icon: '🔳',
      title: 'Stampa e esponi il QR',
      desc: 'Stampa il QR check-in del tuo negozio e mettilo alla cassa per i clienti',
      href: '/negozio/qr',
      cta: 'Vai al QR',
    },
    {
      id: 'scanner',
      done: false,
      icon: '📷',
      title: 'Fai il primo check-in',
      desc: 'Scansiona il QR di un cliente con lo scanner del negozio per iniziare',
      href: '/negozio/scanner',
      cta: 'Apri scanner',
    },
  ]

  const completed = steps.filter((s) => s.done).length

  return (
    <ShopProtectedLayout>
      <div className="px-4 pt-8 pb-6">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6" style={{ animation: 'slideUp 0.4s cubic-bezier(0.16,1,0.3,1) both' }}>
          <button onClick={() => router.replace('/negozio')} className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.09)' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
          </button>
          <div>
            <h1 className="font-display font-bold text-2xl leading-tight">Inizia con Fidelio</h1>
            <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.4)' }}>Completa questi passaggi per andare live</p>
          </div>
        </div>

        {/* Progress */}
        <div
          className="rounded-2xl p-4 mb-5"
          style={{
            background: 'linear-gradient(135deg, #0D3B2A, #071A12)',
            border: '1px solid rgba(16,185,129,0.2)',
            animation: 'slideUp 0.4s cubic-bezier(0.16,1,0.3,1) 0.05s both',
          }}
        >
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-semibold" style={{ color: '#10B981' }}>Completamento setup</p>
            <p className="text-sm font-bold" style={{ color: '#10B981' }}>{completed}/{steps.length}</p>
          </div>
          <div className="h-2 rounded-full overflow-hidden" style={{ background: 'rgba(16,185,129,0.15)' }}>
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{ width: `${(completed / steps.length) * 100}%`, background: 'linear-gradient(90deg, #10B981, #0EA5E9)' }}
            />
          </div>
          {completed === steps.length && (
            <p className="text-xs mt-2" style={{ color: 'rgba(16,185,129,0.7)' }}>🎉 Setup completato! Sei pronto per i clienti.</p>
          )}
        </div>

        {/* Steps */}
        <div className="flex flex-col gap-3" style={{ animation: 'slideUp 0.4s cubic-bezier(0.16,1,0.3,1) 0.1s both' }}>
          {steps.map((step, i) => (
            <div
              key={step.id}
              className="rounded-2xl p-4"
              style={{
                background: step.done ? 'rgba(16,185,129,0.06)' : 'rgba(255,255,255,0.03)',
                border: `1px solid ${step.done ? 'rgba(16,185,129,0.2)' : 'rgba(255,255,255,0.07)'}`,
                opacity: step.done ? 0.8 : 1,
                animation: `slideUp 0.4s cubic-bezier(0.16,1,0.3,1) ${0.1 + i * 0.05}s both`,
              }}
            >
              <div className="flex items-start gap-3">
                {/* Check/Icon */}
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
                  style={{
                    background: step.done ? 'rgba(16,185,129,0.15)' : 'rgba(255,255,255,0.05)',
                    border: `1px solid ${step.done ? 'rgba(16,185,129,0.3)' : 'rgba(255,255,255,0.08)'}`,
                  }}
                >
                  {step.done ? '✅' : step.icon}
                </div>

                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm" style={{ color: step.done ? '#10B981' : 'white', textDecoration: step.done ? 'line-through' : 'none', opacity: step.done ? 0.7 : 1 }}>
                    {step.title}
                  </p>
                  {!step.done && (
                    <p className="text-xs mt-0.5 leading-relaxed" style={{ color: 'rgba(255,255,255,0.4)' }}>{step.desc}</p>
                  )}
                </div>
              </div>

              {!step.done && (
                <Link href={step.href}>
                  <button
                    className="mt-3 w-full py-2.5 rounded-xl text-sm font-semibold"
                    style={{ background: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.25)', color: '#10B981' }}
                  >
                    {step.cta} →
                  </button>
                </Link>
              )}
            </div>
          ))}
        </div>

        {/* Support link */}
        <div className="mt-6 text-center" style={{ animation: 'slideUp 0.4s cubic-bezier(0.16,1,0.3,1) 0.35s both' }}>
          <p className="text-xs" style={{ color: 'rgba(255,255,255,0.25)' }}>
            Hai bisogno di aiuto?{' '}
            <a href="mailto:support@getfidelio.app" style={{ color: '#10B981', textDecoration: 'none' }}>
              Contatta il supporto
            </a>
          </p>
        </div>
      </div>
    </ShopProtectedLayout>
  )
}
