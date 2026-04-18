'use client'

import { ShopProtectedLayout } from '@/components/ShopProtectedLayout'
import { useShopAuthStore } from '@/store/shopAuthStore'

const PLANS = [
  {
    id: 'STARTER',
    price: '19',
    color: '#6B7280',
    gradient: 'linear-gradient(135deg, #374151, #1F2937)',
    features: [
      { label: 'Clienti illimitati', ok: true },
      { label: 'Fino a 3 premi fedeltà', ok: true },
      { label: 'Scanner QR check-in', ok: true },
      { label: 'Statistiche base', ok: true },
      { label: 'Gift Card', ok: false },
      { label: 'Offerte speciali', ok: false },
      { label: 'Analytics avanzate', ok: false },
      { label: 'Notifiche push', ok: false },
      { label: 'Campagne email', ok: false },
      { label: 'AI Insights', ok: false },
    ],
  },
  {
    id: 'GROWTH',
    price: '39',
    color: '#7C3AED',
    gradient: 'linear-gradient(135deg, #5B21B6, #2D1B69)',
    popular: true,
    features: [
      { label: 'Clienti illimitati', ok: true },
      { label: 'Premi fedeltà illimitati', ok: true },
      { label: 'Scanner QR check-in', ok: true },
      { label: 'Statistiche base', ok: true },
      { label: 'Gift Card', ok: true },
      { label: 'Offerte speciali', ok: true },
      { label: 'Analytics avanzate', ok: true },
      { label: 'Notifiche push', ok: true },
      { label: 'Campagne email', ok: false },
      { label: 'AI Insights', ok: false },
    ],
  },
  {
    id: 'PRO',
    price: '79',
    color: '#F97316',
    gradient: 'linear-gradient(135deg, #C2410C, #7C2D12)',
    features: [
      { label: 'Clienti illimitati', ok: true },
      { label: 'Premi fedeltà illimitati', ok: true },
      { label: 'Scanner QR check-in', ok: true },
      { label: 'Statistiche base', ok: true },
      { label: 'Gift Card', ok: true },
      { label: 'Offerte speciali', ok: true },
      { label: 'Analytics avanzate', ok: true },
      { label: 'Notifiche push', ok: true },
      { label: 'Campagne email', ok: true },
      { label: 'AI Insights', ok: true },
    ],
  },
]

export default function UpgradePage() {
  const { shop } = useShopAuthStore()
  const currentPlan = shop?.plan ?? 'STARTER'

  function handleUpgrade(planId: string) {
    window.open('https://fidelio-web.vercel.app/dashboard/upgrade', '_blank')
  }

  return (
    <ShopProtectedLayout>
      <div className="px-4 pt-8 pb-8">
        {/* Header */}
        <div className="text-center mb-8" style={{ animation: 'slideUp 0.4s cubic-bezier(0.16,1,0.3,1) both' }}>
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl mx-auto mb-4"
            style={{ background: 'rgba(124,58,237,0.15)', border: '1px solid rgba(124,58,237,0.25)' }}
          >
            ⚡
          </div>
          <h1 className="font-display font-bold text-2xl mb-2">Scegli il tuo piano</h1>
          <p className="text-sm" style={{ color: 'rgba(255,255,255,0.4)' }}>
            Piano attuale:{' '}
            <span className="font-bold" style={{ color: currentPlan === 'PRO' ? '#F97316' : currentPlan === 'GROWTH' ? '#7C3AED' : '#9CA3AF' }}>
              {currentPlan}
            </span>
          </p>
        </div>

        {/* Plan cards */}
        <div className="flex flex-col gap-4" style={{ animation: 'slideUp 0.4s cubic-bezier(0.16,1,0.3,1) 0.05s both' }}>
          {PLANS.map((plan, i) => {
            const isCurrent = plan.id === currentPlan
            const isDowngrade = PLANS.findIndex(p => p.id === currentPlan) > i

            return (
              <div
                key={plan.id}
                className="rounded-3xl overflow-hidden"
                style={{
                  border: isCurrent
                    ? `2px solid ${plan.color}`
                    : `1px solid ${plan.color}33`,
                  background: isCurrent
                    ? plan.gradient.replace('135deg', '160deg') + ', rgba(0,0,0,0.3)'
                    : 'rgba(255,255,255,0.03)',
                  animation: `slideUp 0.4s cubic-bezier(0.16,1,0.3,1) ${0.05 + i * 0.07}s both`,
                }}
              >
                {/* Popular badge */}
                {plan.popular && !isCurrent && (
                  <div
                    className="text-center py-1.5 text-[11px] font-bold tracking-widest"
                    style={{ background: plan.color, color: 'white', letterSpacing: '0.1em', textTransform: 'uppercase' }}
                  >
                    PIÙ SCELTO
                  </div>
                )}
                {isCurrent && (
                  <div
                    className="text-center py-1.5 text-[11px] font-bold tracking-widest"
                    style={{ background: plan.color + 'CC', color: 'white', letterSpacing: '0.1em', textTransform: 'uppercase' }}
                  >
                    PIANO ATTUALE
                  </div>
                )}

                <div className="p-5">
                  {/* Price row */}
                  <div className="flex items-end justify-between mb-4">
                    <div>
                      <p className="text-xs font-bold mb-1" style={{ color: plan.color, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                        {plan.id}
                      </p>
                      <div className="flex items-baseline gap-1">
                        <span className="font-display font-black text-3xl" style={{ color: isCurrent ? 'white' : plan.color }}>
                          €{plan.price}
                        </span>
                        <span className="text-sm" style={{ color: 'rgba(255,255,255,0.35)' }}>/mese</span>
                      </div>
                    </div>
                    {isCurrent && (
                      <div
                        className="px-3 py-1.5 rounded-xl text-xs font-bold"
                        style={{ background: 'rgba(255,255,255,0.15)', color: 'white' }}
                      >
                        ✓ Attivo
                      </div>
                    )}
                  </div>

                  {/* Features */}
                  <div className="flex flex-col gap-2 mb-5">
                    {plan.features.map((f) => (
                      <div key={f.label} className="flex items-center gap-2.5">
                        <div
                          className="w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0"
                          style={{
                            background: f.ok ? plan.color + '22' : 'rgba(255,255,255,0.04)',
                            border: `1px solid ${f.ok ? plan.color + '44' : 'rgba(255,255,255,0.08)'}`,
                          }}
                        >
                          {f.ok
                            ? <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke={plan.color} strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
                            : <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="3"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                          }
                        </div>
                        <span
                          className="text-sm"
                          style={{ color: f.ok ? (isCurrent ? 'rgba(255,255,255,0.85)' : 'rgba(255,255,255,0.7)') : 'rgba(255,255,255,0.25)' }}
                        >
                          {f.label}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* CTA */}
                  {isCurrent ? (
                    <div
                      className="w-full py-3 rounded-xl text-center text-sm font-semibold"
                      style={{ background: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.5)' }}
                    >
                      Piano in uso
                    </div>
                  ) : isDowngrade ? (
                    <button
                      onClick={() => handleUpgrade(plan.id)}
                      className="w-full py-3 rounded-xl text-sm font-semibold"
                      style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.4)' }}
                    >
                      Passa a {plan.id}
                    </button>
                  ) : (
                    <button
                      onClick={() => handleUpgrade(plan.id)}
                      className="w-full py-3.5 rounded-xl text-sm font-bold transition-all active:scale-95"
                      style={{
                        background: `linear-gradient(135deg, ${plan.color}, ${plan.color}AA)`,
                        boxShadow: `0 4px 16px ${plan.color}44`,
                        color: 'white',
                      }}
                    >
                      Upgrade a {plan.id} →
                    </button>
                  )}
                </div>
              </div>
            )
          })}
        </div>

        {/* Note */}
        <p className="text-center text-xs mt-6" style={{ color: 'rgba(255,255,255,0.2)' }}>
          Il pagamento viene gestito in modo sicuro tramite il pannello web Fidelio
        </p>
      </div>
    </ShopProtectedLayout>
  )
}
